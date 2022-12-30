/*
 * Copyright (c) 2022. PengYunNetWork
 *
 * This program is free software: you can use, redistribute, and/or modify it
 * under the terms of the GNU Affero General Public License, version 3 or later ("AGPL"),
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 *  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *
 *  You should have received a copy of the GNU Affero General Public License along with
 *  this program. If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

angular.module('app.storage').controller('poolDetailCtrl', function ($compile,focus,$state,DTOptionsBuilder, DTColumnBuilder,$stateParams,$http,$scope,showMessage,$interval,translate,$timeout,$rootScope) {
	var vm=this;
	$scope.domainId=$stateParams.domainId;
	$rootScope.domainId=$stateParams.domainId;
	$scope.domainName=$stateParams.sel_domainName;
	$scope.poolId=$stateParams.poolId;
	$scope.iopsReadPoolData=[];
	$scope.iopsReadPoolDataTime=[];
	$scope.iopsWritePoolData=[];
	$scope.throughputReadPoolData=[];
	$scope.throughputReadPoolDataTime=[];
	$scope.throughputWritePoolData=[];
	$scope.latencyWritePoolData=[];
	$scope.latencyReadPoolDataTime=[];
	$scope.latencyReadPoolData=[];
	$scope.ioBlockSizePoolData=[];
	$scope.ioBlockSizePoolDatTime=[];
	var chartTimer=$interval(function(){
		getPool();
		listchartData();
		copyChart();
	},3000)
	
 	$timeout(function(){
		var right=$(".detail_right").outerHeight();
		var left=$(".detail_content").outerHeight();
		$(".detail_content").css("min-height",left+"px")
		$(".detail_right").css("min-height",left+"px")
	},200);
	vm.startBtn=false;
	vm.stopBtn=true;
	$scope.poolStart=false;
	var  chartTempArr=[]
	var timer;
	$scope.logicalPSAFreeSpace;
	$scope.logicalPSSFreeSpace;
	var useTableLength;
	var poolIds=[];
	poolIds.push($scope.poolId)
	vm.poolInfo={};
	vm.dtInstanceU = {};
	vm.dtOptionU= DTOptionsBuilder
	.newOptions()
	.withDOM("<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
			"t" +
			"<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>")
	.withBootstrap()
	.withOption('ajax', {
		url: BASE_API + 'listStoragePool',
		data:{
			poolIds:JSON.stringify(poolIds),
			domainId:$scope.domainId
		},
		dataSrc:function(data){
			if(data.resultMessage.message =="success"){
				var usedData=[];

				angular.forEach(data.simpleStoragePoolsList,function(data,index,array){
					vm.poolInfo["0"]=data
					for(var key in data.archivesInDatanode){
						$.each(data.archivesInDatanode[key], function(i,tmp){
							var logicalSpace=fixTwoDecimal(tmp.logicalSpace/(1024*1024*1024));
							if(tmp.deviceName==""||tmp.deviceName==null){
								usedData.push({"instanceId":key.getQuery("instanceId"),"host":key.getQuery("host"),"groupId":key.getQuery("groupId"),"archiveId":tmp.archiveId,"deviceName":"未知","logical":"未知","status":"未知","storageType":"未知","rate":"未知"});
							}else{
								usedData.push({"instanceId":key.getQuery("instanceId"),"host":key.getQuery("host"),"groupId":key.getQuery("groupId"),"archiveId":tmp.archiveId,"deviceName":tmp.deviceName,"logical":logicalSpace,"status":tmp.status,"storageType":tmp.storageType,"rate":tmp.rate});

							}
						   });
						}
				})

				useTableLength=usedData.length;
				return usedData;

			}else{

				if (data.resultMessage.message == "ERROR_0019_SessionOut") {
					showMessage.show($scope,"warn",translate.getWord("session.out"));
					$scope.logout();
					return;
				}

			}

		},

		 type: 'POST',

	 })
	.withOption('serverSide',false)
	.withOption('processing',false)
	.withOption('paging', true)
	.withOption('searching',true)
	.withOption('rowId', 'archiveId')
	.withOption('fnDrawCallback',function(result){
		$(".selectpicker").selectpicker("render");

		$("#poolDetailTab_filter").find("input").addClass("filter_input");
		$(".poolDetailClearItem").remove();
		$("#poolDetailTab_filter").addClass("table_top_sm");


		$('<i class="fa fa-times-circle item-error-style poolDetailClearItem" onclick="clearFilter(\''+'poolDetailTab_filter'+'\')"></i>').insertAfter($("#poolDetailTab_filter").find("input"));
		if($("#poolDetailTab_filter").find("input").val()==""){
			$(".poolDetailClearItem").hide();
		}else{
			$(".poolDetailClearItem").show();
		}
		$("#poolDetailTab_filter").find("input").unbind('keyup',showItem);
		$("#poolDetailTab_filter").find("input").bind('keyup',{cName:'poolDetailClearItem'},showItem);
		$(".poolDetailClearItem").click(function(e){
			e.stopPropagation();
			e.preventDefault();
			$('#poolDetailTab').DataTable().search("").draw();
		})
		
		if(useTableLength>0){
			$(".useDiskTable").next().find(".dataTables_paginate").show()
		}else{
			$(".useDiskTable").next().find(".dataTables_paginate").hide()
		}
		$(".dt-toolbar-footer").css("background","none")
		$(".dt-toolbar").css("background","none")
		

	})
	.withOption('createdRow', function(row, data, dataIndex) {
		$compile(angular.element(row).contents())($scope);
	})
	.withOption('headerCallback', function(header) {

		$compile(angular.element(header).contents())($scope);
	})
	.withLanguage({
		"search": "",
		"searchPlaceholder":"过滤",
		"aria": {
			"sortAscending": ": activate to sort column ascending",
			"sortDescending": ": activate to sort column descending"
		},
		"emptyTable": "表中数据为空",
		"info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
		"infoEmpty": "显示第 0 至 0 项结果，共 0 项",
		"zeroRecords": "表中数据为空",
		"infoFiltered": "(由 _MAX_ 项结果过滤)",
		"lengthMenu": '显示'+'&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >'+
				'<option value="5" >5条</option>'+
				'<option value="10" >10条</option>'+
				'<option value="20" >20条</option>'+
				'<option value="50" >50条</option>'+
				'<option value="100" >100条</option>'+
		'</select>&nbsp;'+'  ',
		"paginate": {
			"previous":'<i class="fa fa-angle-left"></i>',
			"next": '<i class="fa fa-angle-right"></i>',
			"last":'<i class="fa  fa-angle-double-right"></i>',
			"first": '<i class="fa  fa-angle-double-left"></i>'
		}
	})
	.withPaginationType('full_numbers');

	vm.dtColumnU = [
		DTColumnBuilder.newColumn('instanceId').withTitle("实例ID"),
		DTColumnBuilder.newColumn('host').withTitle("主机IP地址"),
		DTColumnBuilder.newColumn('groupId').withTitle("所在组编号"),
		DTColumnBuilder.newColumn('archiveId').withTitle("磁盘ID").notVisible(),
		DTColumnBuilder.newColumn('deviceName').withTitle("磁盘名"),
		DTColumnBuilder.newColumn('storageType').withTitle("存储类型"),
		DTColumnBuilder.newColumn('rate').withTitle("转速"),
		DTColumnBuilder.newColumn('logical').withTitle("逻辑空间(GB)"),
		DTColumnBuilder.newColumn('status').withTitle("状态")
			.renderWith(function(data,type,row){
				var str="";
				if(data=="GOOD"){
					str = str+'<td><span class="status_green" >良好</span></td>'

				}else if(data=="SEPARATED"){
					str = str+'<td><span class="status_red" >被隔离</span></td>'

				}else if(data=="BROKEN"){
					str = str+'<td><span class="status_red" >损坏</span></td>'

				}else if(data=="OFFLINED"){
					str = str+'<td><span class="status_orange" >脱机</span></td>'

				}else if(data=="CONFIG_MISMATCH"){
					str = str+'<td><span class="status_orange" >配置不匹配</span></td>'

				}else if(data=="DEGRADED"){
					str = str+'<td><span class="status_red" >轻微损坏</span></td>'
				}else if(data=="EJECTED"){
					 str = str+'<td><span class="status_red" >拔出</span></td>'
				}else if(data=="INPROPERLY_EJECTED"){
					 str = str+'<td><span class="status_red" >拔出不当</span></td>'
				}else if(data=="OFFLINING"){
							 str = str+'<td>'
							 +'<div class="progress progress-striped active" >'
							 +'<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" >'
							 +'<span  style="color: #fff;">卸载中</span></div></div></td>'
				}else{
					str = str+'<td><span class="status_orange" >未知</span></td>'
				}

				return str;
			}),
	];
	function getPool(){
		angular.forEach(vm.poolInfo,function(data,index,array){
			$scope.poolName=data.poolName;
			$scope.logicalPSAFreeSpace=data.logicalPsaFreeSpace;
			$scope.logicalPSSFreeSpace=data.logicalPssFreeSpace;
			$("#description").html(data.description||"<span class='none_info'>无</span>");
			$scope.poolType=translate.getWord(data.strategy);
			$scope.domainName=data.domainName;
			var statusStr="";
			if(data.status=="Available"){
				statusStr=statusStr+"<span class='label label-success status-static'>可用</span>";
			}else{
				statusStr=statusStr+ '<div class="progress progress-striped active" >'
					   +'<div class="progress-bar progress-bar-primary" role="progressbar"  style="width: 100%" ><span>删除中</span></div></div>';
			}
			$("#status").html(statusStr);
			var qosStr="<span class='none_info'>无</span>";
			if(data.migrationStrategy!=null){
				qosStr="<a ng-click='goQos(\""+data.migrationStrategy+"\")'>"+data.migrationStrategy+"<a>";
				$("#qos").html($compile(qosStr)($scope))
			}else{
				$("#qos").html(qosStr)
			}
			var str="";
			switch(data.storagePoolLevel){
				case "HIGH":
					$("#level").find(".level_style").eq(2).removeClass("level_default").siblings().addClass("level_default")
					break;
				case "MIDDLE":
					$("#level").find(".level_style").eq(1).removeClass("level_default").siblings().addClass("level_default")
					break;
				case "LOW":
					$("#level").find(".level_style").eq(0).removeClass("level_default").siblings().addClass("level_default")
					break;
			}
			
			
			var migrationSpeedStr="";
			var speed="";
			if(data.migrationSpeed>=1024){
				speed=speed+(data.migrationSpeed/1024).toFixed(1)+"M/s"
			}else{
				speed=speed+data.migrationSpeed+"K/s"
			}
			if(data.migrationRatio=="100.0"){
				migrationSpeedStr=migrationSpeedStr+"无重构"
			}else{

				var str=parseInt((data.migrationRatio)*100)/100 +"%"+"("+speed+")";
				migrationSpeedStr=migrationSpeedStr+ '<div class="progress progress-striped active" >'
					+'<div class="progress-bar progress-bar-primary" role="progressbar"  style="width: 100%" ><span>'
					+str+'</span></div></div>';

			}
			$("#migrationSpeed").html(migrationSpeedStr);
			if(data.status!="Available"||data.migrationRatio!="100.0"){
				$timeout.cancel(timer)
				timer=$timeout(getTimer,3000);
			}
		})

	}

	String.prototype.getQuery = function(name){
		var reg = new RegExp("(\\{|(,\\s*))"+name+"=\\S*(,|\\})");
		var r = this.substr(this.indexOf("\{")).match(reg);
		var m=r[0].substring(r[0].indexOf("=")+2);
		m=m.substr(0,m.length-2);
		if (m!=null) return m; return null;
	}
	$scope.refresh=function(){
		vm.dtInstanceU.reloadData(null,false);
	}
	function getTimer(){
		vm.dtInstanceU.reloadData(null,false);
	}
	$scope.goQos=function(name){
		$state.go('app.storage.qos', {QosName:name,flag:"2"});
	}
	function convertTime(srcTime){
		var currentDate=new Date(srcTime);
		var hour=currentDate.getHours();
		var minute=currentDate.getMinutes();
		var second=currentDate.getSeconds();
		if (hour<10){
			hour="0"+hour;
		}
		if (minute<10){
			minute="0"+minute;
		}
		if (second<10){
			second="0"+second;
		}
		return hour+":"+minute+":"+second;
	}
	$scope.iopsOption={
		tooltip: {
			trigger: 'axis',
			position: function (pt) {
				return [pt[0], '10%'];
			}
		},
		legend: {
			data:["存储池IOPS读","存储池IOPS写"],
			left: 'right'
		},

		xAxis:  {
			type: 'category',
			boundaryGap: false,
			data: []
		},
		yAxis: {
			type: 'value'
		},
		grid: {
			left:'87px',
			right:"50px"
		},
		series: [{
			name:"存储池IOPS读",
			type:'line',
			smooth:true,
			symbolSize:5,
			sampling: 'average',
			itemStyle: {
				 normal: {
					color: '#3095FF'
				}
			},
			data: [],
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgba(48,149,255,0.05)'
					}, {
						offset: 1,
						color: 'rgba(48,149,255,0.05)'
					}])
				}
			},
		},
		{
			name: "存储池IOPS写",
			type:'line',
			smooth:true,
			symbolSize:5,
			sampling: 'average',
			itemStyle: {
				 normal: {
					color: '#FFB100'
				}
			},
			data: [],
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgba(255,177,0,0.05)'
					}, {
						offset: 1,
						color: 'rgba(255,177,0,0.05)'
					}])
				}
			},
		}]
	}

	$scope.lantencyOption={
		tooltip: {
		   trigger: 'axis',
		   position: function (pt) {
				return [pt[0], '10%'];
			}
		},
		legend: {
			data:["存储池读延迟(ms)","存储池写延迟(ms)"],
			left: 'right'
		},

		xAxis:  {
			type: 'category',
			boundaryGap: false
		},
		yAxis: {
			type: 'value'
		},
		grid: {
			left:'87px',
			right:"50px"
		},
		series: [{
			name:"存储池读延迟(ms)",
			data: [],
			symbolSize:5,
			smooth:true,
			sampling: 'average',
			itemStyle: {
				 normal: {
					color: '#3095FF'
				}
			},
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgba(48,149,255,0.05)'
					}, {
						offset: 1,
						color: 'rgba(48,149,255,0.05)'
					}])
				}
			},
			type:'line'
		},
		{
			name: "存储池写延迟(ms)",
			data: [],
			symbolSize:5,
			smooth:true,
			sampling: 'average',
			itemStyle: {
				 normal: {
					color: '#FFB100'
				}
			},
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgba(255,177,0,0.05)'
					}, {
						offset: 1,
						color: 'rgba(255,177,0,0.05)'
					}])
				}
			},
			type:'line'
		}]
	}

	$scope.throughputOption={
		tooltip: {
			trigger: 'axis',
			position: function (pt) {
				return [pt[0], '10%'];
			}
		},
		legend: {
			data:["存储池吞吐量读(KB/s)","存储池吞吐量写(KB/s)"],
			left: 'right'
		},

		xAxis:  {
			type: 'category',
			boundaryGap: false,
			data:[]
		},
		yAxis: {
			type: 'value'
		},
		grid: {
			left:'87px',
			right:"50px"
		},
		series: [{
			name:"存储池吞吐量读(KB/s)",
			data:[],
			symbolSize:5,
			smooth:true,
			sampling: 'average',
			itemStyle: {
				 normal: {
					color: '#3095FF'
				}
			},
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgba(48,149,255,0.05)'
					}, {
						offset: 1,
						color: 'rgba(48,149,255,0.05)'
					}])
				}
			},
			type:'line'
		},
		{
			name: "存储池吞吐量写(KB/s)",
			data:[],
			symbolSize:5,
			smooth:true,
			sampling: 'average',
			itemStyle: {
				 normal: {
					color: '#FFB100'
				}
			},
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgba(255,177,0,0.05)'
					}, {
						offset: 1,
						color: 'rgba(255,177,0,0.05)'
					}])
				}
			},
			type:'line'
		}]
	}

	$scope.IOBlockSizeOption={
		tooltip: {
			trigger: 'axis',
			position: function (pt) {
				return [pt[0], '10%'];
			}
		},
		legend: {
			data:["卷IO块大小(KB)"],
			left: 'right'
		},
		xAxis: {
			type: 'category',
			boundaryGap: false
		},
		yAxis: {
			type: 'value',
		},
		grid: {
			left:'87px',
			right:"50px"
		},
		series: [{
			name:"卷IO块大小(KB)",
			data: [],
			symbolSize:5,
			smooth:true,
			sampling: 'average',
			itemStyle: {
				 normal: {
					color: '#3095FF'
				}
			},
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgba(48,149,255,0.05)'
					}, {
						offset: 1,
						color: 'rgba(48,149,255,0.05)'
					}])
				}
			},
			type:'line'
		}]
	}

	var clearWatch=$rootScope.$watch("socketStatus", function(newVal, oldVal){
		if($rootScope.Websocket.websocket && $rootScope.Websocket.websocket.readyState == WebSocket.OPEN){
			if(vm.startBtn==true)
			$scope.onmessagePerformance();
		}

	 }, true);
	$scope.$on('$destroy',function(){
		$timeout.cancel(timer)
	}) 
	$scope.checkDriver=function(){
		$http({
			 method: "POST",
			 async:false,
			 url: "IsPoolhasPerformanceData",
			 data: {
				poolId:$scope.poolId
			 },
			 headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			 transformRequest: function(obj) {
				 var str = [];
				 for (var s in obj) {
					 str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
				 }
				 return str.join("&");
			 }
		 }).then(function successCallback(response){
			
			if (response.data.resultMessage.message == "success") {
				if(response.data.hasPerformanceData){
					$scope.onmessagePerformance()
				}else{
					showMessage.show($scope,"warn","该存储池下没有挂载驱动的卷");
				}
			}else{
				if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
					showMessage.show($scope,"warn",translate.getWord("session.out"));
					$scope.logout();
					return;
				}else{
					showMessage.show($scope,"error",translate.getWord(response.data.resultMessage.message));
					
				}
				   
			}
		 })
	}
	$scope.onmessagePerformance=function(){
		var times=1;
		vm.startBtn=true;
		vm.stopBtn=false;
		$scope.poolStart=true;
		var multiple=500;
		var iops=echarts.getInstanceByDom(document.getElementById("iops"));
		var throughput=echarts.getInstanceByDom(document.getElementById("throughput"));
		var lantency=echarts.getInstanceByDom(document.getElementById("lantency"));
		var ioBlockSize=echarts.getInstanceByDom(document.getElementById("ioBlockSize"));
		var poolcopeChart= echarts.init(document.getElementById('copeTypeChart'));
		var poolCapacityChart= echarts.init(document.getElementById('capacityChart'));
		if($rootScope.Websocket.websocket){
			send($scope.poolId+"##start")
			$rootScope.Websocket.websocket.onmessage = function(event) {
				 $rootScope.Websocket.lastHeartBeat = new Date().getTime();
				var data=JSON.parse(event.data);
				
				if(data.alertMessage!=null){
					$rootScope.alertComeFlag++;
				}
				if(data.performanceMessage!=null){
					
					if(data.performanceMessage.counterKey=="STORAGEPOOL_READ_THROUGHPUT"&&data.performanceMessage.sourceId==$scope.poolId){
						$scope.throughputReadPoolDataTime.push(convertTime(data.performanceMessage.startTime))
						$scope.throughputReadPoolData.push((data.performanceMessage.counterValue*times).toFixed(1))
						if($scope.throughputReadPoolData.length>multiple){
							$scope.throughputReadPoolData.shift();
							$scope.throughputReadPoolDataTime.shift();
						}
						
						$scope.throughputOption={
							xAxis: {
								data: $scope.throughputReadPoolDataTime
							},
							series: [{
								name:"存储池吞吐量读(KB/s)",
								data: $scope.throughputReadPoolData,
							},
							{
								name: "存储池吞吐量写(KB/s)",
								data: $scope.throughputWritePoolData,
							}]
						}
					}
					if(data.performanceMessage.counterKey=="STORAGEPOOL_WRITE_THROUGHPUT"&&data.performanceMessage.sourceId==$scope.poolId){
						$scope.throughputWritePoolData.push((data.performanceMessage.counterValue*times).toFixed(1))
						if($scope.throughputWritePoolData.length>multiple){
							$scope.throughputWritePoolData.shift();
						}
						
						$scope.throughputOption={
							xAxis: {
								data: $scope.throughputReadPoolDataTime
							},
							series: [{
								name:"存储池吞吐量读(KB/s)",
								data: $scope.throughputReadPoolData,
							},
							{
								name: "存储池吞吐量写(KB/s)",
								data: $scope.throughputWritePoolData,
							}]
						}
					}


					if(data.performanceMessage.counterKey=="STORAGEPOOL_READ_IOPS"&&data.performanceMessage.sourceId==$scope.poolId){
						$scope.iopsReadPoolDataTime.push(convertTime(data.performanceMessage.startTime))
						$scope.iopsReadPoolData.push(data.performanceMessage.counterValue*times)
						if($scope.iopsReadPoolData.length>multiple){
							$scope.iopsReadPoolData.shift();
							$scope.iopsReadPoolDataTime.shift();
						}
						
						$scope.iopsOption={
							xAxis: {
								  data: $scope.iopsReadPoolDataTime
							},
						   series: [{
							   name:"存储池IOPS读",
							   data: $scope.iopsReadPoolData,
						   },
						   {
							   name: "存储池IOPS写",
							   data: $scope.iopsWritePoolData,
						   }]
					   }
					}
					if(data.performanceMessage.counterKey=="STORAGEPOOL_WRITE_IOPS"&&data.performanceMessage.sourceId==$scope.poolId){
						$scope.iopsWritePoolData.push(data.performanceMessage.counterValue*times)
						if($scope.iopsWritePoolData.length>multiple){
							$scope.iopsWritePoolData.shift();
						}
						
						$scope.iopsOption={
							xAxis: {
								  data: $scope.iopsReadPoolDataTime
							},
						   series: [{
							   name:"存储池IOPS读",
							   data: $scope.iopsReadPoolData,
						   },
						   {
							   name: "存储池IOPS写",
							   data: $scope.iopsWritePoolData,
						   }]
					   }
					}
					if(data.performanceMessage.counterKey=="STORAGEPOOL_READ_LATENCY"&&data.performanceMessage.sourceId==$scope.poolId){
						$scope.latencyReadPoolDataTime.push(convertTime(data.performanceMessage.startTime))
						$scope.latencyReadPoolData.push(data.performanceMessage.counterValue)
						if($scope.latencyReadPoolData.length>multiple){
							$scope.latencyReadPoolData.shift();
							$scope.latencyReadPoolDataTime.shift();
						}
						
						$scope.lantencyOption={
							xAxis: {
								  data: $scope.latencyReadPoolDataTime
							},
						   series: [{
							   name:"存储池读延迟(ms)",
							   data: $scope.latencyReadPoolData,
						   },
						   {
							   name: "存储池写延迟(ms)",
							   data: $scope.latencyWritePoolData,
						   }]
					   }

					}
					if(data.performanceMessage.counterKey=="STORAGEPOOL_WRITE_LATENCY"&&data.performanceMessage.sourceId==$scope.poolId){
						$scope.latencyWritePoolData.push(data.performanceMessage.counterValue)
						if($scope.latencyWritePoolData.length>multiple){
							$scope.latencyWritePoolData.shift();
						}
						
						$scope.lantencyOption={
							xAxis: {
								  data: $scope.latencyReadPoolDataTime
							},
						   series: [{
							   name:"存储池读延迟(ms)",
							   data: $scope.latencyReadPoolData,
						   },
						   {
							   name: "存储池写延迟(ms)",
							   data: $scope.latencyWritePoolData,
						   }]
					   }

					}

					if(data.performanceMessage.counterKey=="STORAGEPOOL_IO_BLOCK_SIZE"&&data.performanceMessage.sourceId==$scope.poolId){
						$scope.ioBlockSizePoolDatTime.push(convertTime(data.performanceMessage.startTime))
						$scope.ioBlockSizePoolData.push(data.performanceMessage.counterValue)
						if($scope.ioBlockSizePoolData.length>multiple){
							$scope.ioBlockSizePoolData.shift();
							$scope.ioBlockSizePoolDatTime.shift();
						}
						
						$scope.IOBlockSizeOption={
							xAxis: {
								  data: $scope.ioBlockSizePoolDatTime
							},
							series: [{
								name:"卷IO块大小(KB)",
								data: $scope.ioBlockSizePoolData,
							}]
						}

					}


				}
			};
		}else{
			showMessage.show($scope,"error","MonitorServer 异常");

		}

		$timeout(function(){
			iops.resize();
			throughput.resize();
			lantency.resize();
			ioBlockSize.resize();
			poolcopeChart.resize();
			poolCapacityChart.resize()
		},500);
		
	}
	var poolCapacityChart= echarts.init(document.getElementById('capacityChart'));
	window.onresize = poolCapacityChart.resize;
	$("#capacityChart").resize(function(){
		 $(poolCapacityChart).resize();
	 });

	var poolCapacityOption1 = {
		title:{
			text:'存储池使用情况',
			textStyle:{
				fontWeight:'normal',
				fontSize:14
			}
		},
		color:['#FF2073','#F49300','#3095FF','#1BBEB4'],
		tooltip : {
			 trigger: 'item',
			 formatter: "{b} ({d}%)"
		},
		
		 legend: {
		 },

		 
		series: [{
			name: '',
			type: 'pie',
			radius: ['50%', '60%'],
			center:['50%','50%'],
			label: {
				normal: {
					position: 'center'
				 }
			},
			data: []
		}]
	 };
	poolCapacityChart.setOption(poolCapacityOption1);
	

	function listchartData(){
		 var dataPoolCapacity=[];
		 var usedCapacity=[];
		 var poolIds=[];
		 poolIds.push($scope.poolId);
		 $http({
			 method: "POST",
			 async:false,
			 url: "listStoragePoolCapacity",
			 data: {
				 domainId:$scope.domainId,
				 poolIds:JSON.stringify(poolIds)
			 },
			 headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			 transformRequest: function(obj) {
				 var str = [];
				 for (var s in obj) {
					 str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
				 }
				 return str.join("&");
			 }
		 }).then(function successCallback(response){
			 var used;
			 var free;
			 var total;
			 var unit="M";
			 var hasUsed;
			 var freeUsed;
			 angular.forEach(response.data.simpleStoragePoolsList,function(data,index,array){
				 total=(data.totalSpace/1024/1024).toFixed(1);
				 $scope.noSpace=(total*1==0);
				 free=(data.freeSpace/1024/1024).toFixed(1);
				 used=(total-free).toFixed(1);
				 hasUsed=(data.usedSpace/1024/1024).toFixed(1);
				 freeUsed=(used-hasUsed).toFixed(1);
				 if(total>=1024){
					 total=(total/1024).toFixed(1);
					 free=(free/1024).toFixed(1);
					 used=(total-free).toFixed(1);
					 hasUsed=(hasUsed/1024).toFixed(1);
					 freeUsed=(freeUsed/1024).toFixed(1)
					 unit="G"

				 }else if(total>=1024*1024){
				 	total=(total/1024/1024).toFixed(1);
					free=(free/1024/1024).toFixed(1);
					used=(total-free).toFixed(1);
					hasUsed=(hasUsed/1024/1024).toFixed(1);
					freeUsed=(freeUsed/1024/1024).toFixed(1)
					unit="T"
				 }
				 $scope.totalSpace=total+unit;
				 $scope.usedCapacity=hasUsed+unit;
				 $scope.unusedCapacity=freeUsed+unit;
				 $scope.freeCapacity=free+unit;
				 dataPoolCapacity.push({value:used,name:"已分配"});
				 dataPoolCapacity.push({value:free,name:"剩余"});

				 usedCapacity.push({value:hasUsed,name:"已使用"});
				 usedCapacity.push({value:freeUsed,name:"未使用"});
			 })
			 if(total>0){
				poolCapacityChart.setOption({
					tooltip : {
						trigger: 'item',
						formatter: "{b} : {c}"+unit+" ({d}%)"
					},
					 series: [{
						data: [{
							value: usedCapacity[0].value,
							name: '已使用容量',
							
							label: {
								normal: {
									formatter: '存储池总容量',
									textStyle: {
										fontSize: 12,
										color:"#313131"
									}
								}
							}
						},{
							value: usedCapacity[1].value,
							name: '未使用容量',
							label: {
								normal: {
									formatter: ''
								}
							}
						},{
							value: dataPoolCapacity[1].value,
							name: '未分配容量',
							label: {
								normal: {
									formatter: '\n'+(dataPoolCapacity[0].value*1+dataPoolCapacity[1].value*1)+unit,
									textStyle: {
										fontSize: 24,
										color: '#294087'
									}
								}
							}
						}]
					 }]
				});


			 }

		});

	}
	

	var poolcopeChart= echarts.init(document.getElementById('copeTypeChart'));
	var poolcopeOption = {
		title:{
			text:'两副本与三副本剩余有效容量',
			textStyle:{
				fontWeight:'normal',
				fontSize:14
			}
		},
		color:['#2980B9'],
		tooltip : {
			trigger: 'axis',
		},

		grid: {
			left: '10%',
			right: '4%',
			bottom: '3%',
			containLabel: true
		},
		xAxis : [
			{
				type : 'category',
				data : ["两副本","三副本"]
			}
		],
		yAxis : [
			{   
				type: 'value',
				min: 0,
				axisLabel: {
					formatter: '{value}'
				}
			}
		],
		series : [
			{
				type:'bar',
				barWidth: '40',
				itemStyle: {
					normal: {
						color: 'rgba(48,149,255,0.05)',
						borderColor:"#3095ee"
					}
				},
				data:[]
			}
		]
	};
	poolcopeChart.setOption(poolcopeOption);
	window.onresize = poolcopeChart.resize;
	function copyChart() {
    console.log($scope.logicalPSAFreeSpace,$scope.logicalPSSFreeSpace,'545');
    console.log(!$scope.logicalPSAFreeSpace||!$scope.logicalPSSFreeSpace,123);
		if(!$scope.logicalPSAFreeSpace||!$scope.logicalPSSFreeSpace){
			return false;
		}
		var onecope="";
		var twocope="";
		var unit="M";
		var datacopeCapacity=[];
		
		   $("#copeTypeChart").resize(function(){
			   $(poolcopeChart).resize();
		   });
		   onecope=fixTwoDecimal($scope.logicalPSAFreeSpace/(1024*1024));
		   twocope=fixTwoDecimal($scope.logicalPSSFreeSpace/(1024*1024));

		   if(onecope>=1024){
			  onecope=fixTwoDecimal(onecope/1024);
			  twocope=fixTwoDecimal(twocope/1024);
			  unit="G";
		   }else if(onecope>=1){
			  onecope=fixTwoDecimal(onecope);
			  twocope=fixTwoDecimal(twocope);
			  unit="M";
		   }else if(onecope>=1024*1024){
			  onecope=fixTwoDecimal(onecope/1024/1024);
			  twocope=fixTwoDecimal(twocope/1024/1024);
			  unit="T";
		   }
		   datacopeCapacity.push({name:"两副本",value:onecope});
		   datacopeCapacity.push({name:"三副本",value:twocope});
		   poolcopeChart.setOption({
			   tooltip : {
				   trigger: 'item',
				   formatter: "{b} : {c}"+unit
				},
			   yAxis : {
					name: "剩余有效容量("+unit+")",
				},
			   series: [{
				   data: datacopeCapacity
			   }]
		})

	}
	function fixTwoDecimal(value) {
		return Math.round(value*100)/100;
	}
	$scope.jumpToPool=function(){
		$state.go('app.storage.domain.pool', {domainId:$scope.domainId,sel_domainName:$scope.domainName,flag:"1"});

	}


})