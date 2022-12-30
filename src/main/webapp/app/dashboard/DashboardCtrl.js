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

angular.module('app.dashboard').controller('DashboardCtrl', DashboardCtrl);

function DashboardCtrl($scope,$http,$rootScope,$timeout,$state){
	$(".modal").draggable();
	var vm=this;
	vm.dtInstancePool={};
	$scope.toShow=false;
	$rootScope.showDataNode=false;
	$scope.systemIopsR=0;
	$scope.systemIopsW=0;
	$scope.systemIopsAll=0;
	$scope.systemThroughputR="0";
	$scope.systemThroughputW="0";
	$scope.systemThroughputR_item="KB/s"
	$scope.systemThroughputW_item="KB/s"
	$scope.poolLevel="";
	$scope.domainGroups=[{'value':"",'txt': "请选择一个域"}];
	var timer;
	$scope.websocketMessage=function() {
		if($rootScope.Websocket.websocket){
			send("SYSTEM##start");
			$rootScope.Websocket.websocket.onmessage = function(event) {
				$rootScope.Websocket.lastHeartBeat = new Date().getTime();
				var data=JSON.parse(event.data);
				if(data.alertMessage!=null){
					$rootScope.alertComeFlag++;
				}
				if(data.performanceMessage!=null){
					if(data.performanceMessage.counterKey=="SYSTEM_READ_IOPS"){
							$scope.systemIopsR=data.performanceMessage.counterValue;
							$scope.systemIopsAll=$scope.systemIopsR+$scope.systemIopsW;
					}
					if(data.performanceMessage.counterKey=="SYSTEM_WRITE_IOPS"){
							$scope.systemIopsW=data.performanceMessage.counterValue;
					}
					if(data.performanceMessage.counterKey=="SYSTEM_READ_THROUGHPUT"){
						var arr=$scope.changeSpeed(data.performanceMessage.counterValue).split(" ");
						$scope.systemThroughputR=arr[0];
						$scope.systemThroughputR_item=arr[1];
					}
					if(data.performanceMessage.counterKey=="SYSTEM_WRITE_THROUGHPUT"){
						var arr=$scope.changeSpeed(data.performanceMessage.counterValue).split(" ");
						$scope.systemThroughputW=arr[0];
						$scope.systemThroughputW_item=arr[1];
					}
				}
			}; 
		}
	}

	$scope.setDrop=function(flag){
		$http({
			method: "post",
			data:{"drop":flag},
			async:false,
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },  
			url:"setDrop",  
			transformRequest: function(obj) {  
				var str = [];  
				for (var s in obj) {  
					str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));  
				}
				return str.join("&");  
			}
		}).then(function successCallback(data){
			data=data.data;
			switch (data.color) {
				case "Green":
					$rootScope.driverPageLength="10";break;
				case "Red":
					$rootScope.driverPageLength="20";break;
				case "Yellow":
					$rootScope.driverPageLength="50";break;
				case "Grey":
					$rootScope.driverPageLength="5";break;
			}
		});
	}

	$scope.queryState=function(){
		$http({
			method: "post",
			data:{},
			async:false,
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },  
			url:"queryState",  
			transformRequest: function(obj) {  
				var str = [];  
				for (var s in obj) {  
					str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));  
				}
				return str.join("&");  
			}
		}).then(function successCallback(data){
			data=data.data;
			switch (data.color) {
				case "Green":
					$rootScope.driverPageLength="10";break;
				case "Red":
					$rootScope.driverPageLength="20";break;
				case "Yellow":
					$rootScope.driverPageLength="50";break;
				case "Grey":
					$rootScope.driverPageLength="5";break;
			}
		});
	}

	$scope.queryState();	

	$scope.changeSpeed=function(obj){
		var k = 1024;
		if(obj*1==0){
			return 0+ ' ' + 'KB/s';
		}
		var sizes = [ 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		var i = Math.floor(Math.log(obj) / Math.log(k));
		var num = obj / Math.pow(k, i);
		var arr=[];
		if(num*1==parseInt(num)){
			return num+ ' ' + sizes[i]+"/s";
		}else{
			return num.toFixed(1)+ ' ' + sizes[i]+"/s";
		}
	}

	function takeByteNum(num){
		if(num*1>1024){
			return parseFloat(num/1024).toFixed(1)+"T"
		}else{
			return parseFloat(num).toFixed(1)+"G"
		}
	}

	var scale = 1;
	var rich = {
		labelstyle_1: {
			color: "#ffc72b",
			fontSize: 20 * scale,
			align: 'center'
		},
		color1: {
			color: "#6A3C9B",
			align: 'center',
			fontSize: 20 * scale
		},
		color2: {
			color: "#3095FF",
			align: 'center',
			fontSize: 20 * scale
		},
		color3: {
			color: "#FF2073",
			align: 'center',
			fontSize: 20 * scale
		},
		color4: {
			color: "#F49300",
			align: 'center',
			fontSize: 20 * scale
		},
		labelstyle_2: {
			color: '#49dff0',
			fontSize: 16 * scale,
			align: 'center'
		}
	}

	var optionPublic = {
		tooltip: {
		},
		legend: {
			y: 'bottom',
			data:['已使用','未使用','未分配']
		},
		backgroundColor:'#ffffff',
		title: [{
			text: '总容量',
			left: '49%',
			top: '42%',
			textAlign: 'center',
			textBaseline: 'middle',
			textStyle: {
				color: '#313131',
				fontWeight: 'normal',
				fontSize: 16
			}
		},{
			left: '49%',
			top: '54%',
			textAlign: 'center',
			textBaseline: 'middle',
			textStyle: {
				color: '#294087',
				fontWeight: 'normal',
				fontSize: 30
			}
		}],
		series: [{
			 hoverAnimation: false,
			 radius: [75, 104],
			 name: '',
			 type: 'pie',
			 clockwise: true,
			 startAngle: 90,
			 itemStyle: {
				normal: {
					borderWidth: 1,
					borderColor: '#ffffff',
				},
				emphasis: {
					borderWidth: 0,
					shadowBlur: 5,
					shadowOffsetX: 0,
					shadowColor: 'rgba(0, 0, 0, 0.2)'
				}
			},
			label: {
				normal: {
					padding: [0, -15],
					rich: rich
				},
			},
			labelLine: {
				normal: {
					length: 16,
					length2:45,
					length3:40,
					lineStyle: {
						color: '#D0D9E6',
						type:"dashed"
					}
				},
			},
			data: []
		 }]
	 };
	
	$scope.systemCapacityOption = JSON.parse(JSON.stringify(optionPublic));
	$scope.systemCapacityOption.series[0].color=['#FF2073','#F49300','#3095FF']

	var refreshChart=function(){
		$http({
			method: "POST",
			url: "getDashboardInfo",    
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },  
				   transformRequest: function(obj) {  
					var str = [];  
					for (var s in obj) {
					str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));  
				  }  
					return str.join("&");  
			}
		}).then(function successCallback(response){
			if(response.data.resultMessage.message !="success"){
				 if(response.data.resultMessage.message == "ERROR_0019_SessionOut"){
					$scope.logout();
				 }
			}
			if(response.data.dashboardInfo.theUsedUnitSpace!=null && response.data.dashboardInfo.freeSpace != null ){
				var dataCapacity=[{
					value: parseFloat(response.data.dashboardInfo.theUsedUnitSpace).toFixed(1),
					name: '已使用 '+takeByteNum(response.data.dashboardInfo.theUsedUnitSpace)
				},{
					value: parseFloat(response.data.dashboardInfo.theunUsedUnitSpace).toFixed(1),
					name: '未使用 '+takeByteNum(response.data.dashboardInfo.theunUsedUnitSpace)
				},{
					value: parseFloat(response.data.dashboardInfo.freeSpace).toFixed(1),
					name: '未分配 '+takeByteNum(response.data.dashboardInfo.freeSpace)
				}];
				$scope.totalCapacity=takeByteNum(response.data.dashboardInfo.totalCapacity);
				$scope.systemCapacityOption.series[0].data=dataCapacity;
				$scope.systemCapacityOption.series[0].label.normal.formatter=function(params) {
					if(params.dataIndex==0){
						return '{color3|' + params.name.slice(3) + '}\n\n' ;
					}else if(params.dataIndex==1){
						return '{color4|' + params.name.slice(3) + '}\n\n' ;
					}else{
						return '{color2|' + params.name.slice(3) + '}\n\n';
					}
				};
				$scope.systemCapacityOption.series[0].label.normal.rich=rich;
				$scope.systemCapacityOption.legend.data=[
					'已使用 '+takeByteNum(response.data.dashboardInfo.theUsedUnitSpace),
					'未使用 '+takeByteNum(response.data.dashboardInfo.theunUsedUnitSpace),
					'未分配 '+takeByteNum(response.data.dashboardInfo.freeSpace)
				];
				$scope.systemCapacityOption.tooltip.formatter=function(params){
					var percent=((params.value/response.data.dashboardInfo.totalCapacity)*100).toFixed(1);
					var value=takeByteNum(params.value);
					if(response.data.dashboardInfo.totalCapacity==0){
						percent=0
					}
					return params.name +"("+percent+"%)"
				}
				var total=parseFloat(response.data.dashboardInfo.totalCapacity);
				if(total>=1024){
					total=(total/1024).toFixed(1)+"T"
				}else{
					total=total.toFixed(1)+"G"
				}
				$scope.systemCapacityOption.title[1].text=total;
			}
		
			if(response.data.dashboardInfo.serviceHealthy != null){
				$scope.serviceOK = response.data.dashboardInfo.serviceHealthy;
				$scope.serviceINC = response.data.dashboardInfo.serviceSick;
				$scope.serviceFailed = response.data.dashboardInfo.serviceFailed;
				$scope.serviceTotal = response.data.dashboardInfo.serviceTotal;
			}
			
			if(response.data.dashboardInfo.connectedClients != null){
				$scope.clientsTotal = response.data.dashboardInfo.clientTotal;
				$scope.clientsConnected = response.data.dashboardInfo.connectedClients;
				$scope.volumeCountsOK = response.data.dashboardInfo.okCounts;
				$scope.volumeCountsUnavailable = response.data.dashboardInfo.unavailableCounts;
				$scope.volumeTotal = Number(response.data.dashboardInfo.okCounts)+Number(response.data.dashboardInfo.unavailableCounts);
			}

			if(response.data.dashboardInfo.goodDiskCount != null){
				$scope.diskCountsAll = response.data.dashboardInfo.allDiskCount;
				$scope.diskCountsOK = response.data.dashboardInfo.goodDiskCount;
				$scope.diskCountsFailed = response.data.dashboardInfo.badDiskCount;
			}
				
			if(response.data.dashboardInfo .criticalAlertCount != null){
				if(response.data.dashboardInfo.criticalAlertCount>999){
					$(".critical").css("font-size","15px");
				}else if(response.data.dashboardInfo.criticalAlertCount>99){
					$(".critical").css("font-size","20px");
				}else if(response.data.dashboardInfo.criticalAlertCount>9){
					$(".critical").css("font-size","30px");
				}else{
					$(".critical").css("font-size","36px");
				}
				if(response.data.dashboardInfo.majorAlertCount>999){
					$(".major").css("font-size","15px");
				}else if(response.data.dashboardInfo.majorAlertCount>99){
					$(".major").css("font-size","20px");
				}else if(response.data.dashboardInfo.majorAlertCount>9){
					$(".major").css("font-size","30px");
				}else{
					$(".major").css("font-size","36px");
				}
				$rootScope.alarmCritical=response.data.dashboardInfo.criticalAlertCount>999?"999+":response.data.dashboardInfo.criticalAlertCount;

				$rootScope.alarmMajor=response.data.dashboardInfo.majorAlertCount>999?"999+":response.data.dashboardInfo.majorAlertCount;

				$rootScope.alarmMinor=response.data.dashboardInfo.minorAlertCount>999?"999+":response.data.dashboardInfo.minorAlertCount;

				$rootScope.alarmWarning=response.data.dashboardInfo.warningAlertCount>999?"999+":response.data.dashboardInfo.warningAlertCount;

				$rootScope.alarmCleared=response.data.dashboardInfo.clearedAlertCount>999?"999+":response.data.dashboardInfo.clearedAlertCount;
			}

			if(response.data.dashboardInfo.okServerNodeCounts != null){
				$scope.serverOK=response.data.dashboardInfo.okServerNodeCounts;
				$scope.serverUnknown=response.data.dashboardInfo.unknownServerNodeCount;
				$scope.serverAll=response.data.dashboardInfo.totalServerNodeCount;
			}

			if(response.data.dashboardInfo.poolTotal != null){
				$scope.poolTotal=response.data.dashboardInfo.poolTotal;
				$scope.poolHigh=Number(response.data.dashboardInfo.poolHigh);
				$scope.poolMiddle=Number(response.data.dashboardInfo.poolMiddle);
				$scope.poolLow=Number(response.data.dashboardInfo.poolLow);
			}
			
			$timeout.cancel(timer)
			timer=$timeout(refreshChart,3000);
		 },function errorCallback(response){
		})
	};

	$scope.getAllDomainName=function(poolLevel){
		document.getElementById("chooseForm").reset()
		$scope.chooseForm.$setPristine();
		$scope.chooseForm.$setUntouched();
		$scope.poolLevel=poolLevel
		$http({
			method: "post",
			data:{"domainName":""},
			async:false,
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },  
			url:"listDomains",  
			transformRequest: function(obj) {
				var str = [];  
				for (var s in obj) {  
					str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));  
				}
				return str.join("&");  
			}
		}).then(function successCallback(data){
			data=data.data;
			$scope.domainGroups=[{'value':"",'txt': "请选择一个域"}];
			for(var i=0;i<data.domainList.length;i++){
				$scope.domainGroups.push({'value':data.domainList[i].domainId,'txt':data.domainList[i].domainName})
			}
			$(".volumeDomainClass").selectpicker("refresh");
			$('.volumeDomainClass').on('shown.bs.select', function (e) {
				$(".volumeDomainClass").selectpicker("refresh");
			});
		});
	}

	refreshChart();
  
  $scope.$on('$destroy',function(){
		$timeout.cancel(timer)
	}) 

	function fixTwoDecimal(value) {
		return Math.round(value*100)/100;
	}

	$scope.jumpVolume=function(level){

		$state.go('app.storage.volume', {statusLevel:level});
	}

	$scope.jumpService=function(level){

		$state.go('app.system.services', {statusLevel:level});
	}

	$scope.jumpDisk=function(level){

		$state.go('app.hardware.disk', {statusLevel:level});
	}

	$scope.jumpPool=function(level){
		$('.modal-backdrop').remove(); 
		$state.go('app.storage.domain.pool', {domainId : $("#volumeDomain").val(),sel_domainName:$("#volumeDomain").find("option:selected").text(),flag:"1",statusLevel:$scope.poolLevel});
	}

	$scope.jumpAlarm=function(level){
		$state.go('app.monitor.alarm', {alarmLevel:level,acknowledge:"UNCONFIRM"});
	}

	$scope.jumpServer=function(level){
		$state.go('app.hardware.nodeManage', {statusLevel:level});
	}

	$scope.jumpToService=function(level){
		$rootScope.showDataNode=true;
		$state.go('app.system.services', {statusLevel:level});
	}

	$scope.gotoDisk=function(instanceId,name,archiveId){
		$state.go('app.hardware.disk', {datanodeId:instanceId,diskName:name,archiveId:archiveId});
		$("#disk_modal").modal("hide");
	}
  
  $('#choose_domain_modal').on('shown.bs.modal', function () {
    $scope.choose.volumeDomain = ''
  })
}

$(window).resize(function(){
	$(".page-footer").css("width",$(".page-footer").parent().css("width"))
})

