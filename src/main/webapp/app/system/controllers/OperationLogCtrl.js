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

angular.module('app.system').controller('OperationLogCtrl', function ($rootScope,$scope,translate, $interval,$http,DTOptionsBuilder,showMessage, DTColumnBuilder,$compile) {
	$(".modal").draggable();
	$scope.selectGroups=['5','10','20','50','100'];
	$scope.startTime="";
	$scope.endTime="";
	$scope.startNum=0;
	var logInterval;
	var timerFlag=true;
	var accountNameSearchGlobal="",
	typeSearchGlobal="",
	filterStatusGlobal="",
	targetTypeSearchGlobal="",
	operationObjectSearchGlobal="",
	startTimeGlobal="",
	endTimeGlobal="";

	$scope.loadTab=function(){
		$scope.perpage_num=$("#operationlog_select").val()||5;
		timerFlag=false;
		$http({
			method: "post",
			data:{
				"status":filterStatusGlobal,
				"accountName":accountNameSearchGlobal,
				"operationType":typeSearchGlobal,
				"targetType":targetTypeSearchGlobal,
				"targetName":operationObjectSearchGlobal,
				"startTime":startTimeGlobal,
				"endTime":endTimeGlobal,
				"start":$scope.startNum,
				"length":$scope.perpage_num
			},
			async:false,
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },  
			url:"listOperationLogByTime",  
			transformRequest: function(obj) {  
				var str = [];  
				for (var s in obj) {  
					str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));  
				}
				return str.join("&");  
			}
		}).then(function successCallback(data){
			data=data.data;
			timerFlag=true;
			if(data.resultMessage.message != "success"){
				if (data.resultMessage.message  == "ERROR_0019_SessionOut") {
					showMessage.show($scope,"warn",translate.getWord("session.out"));
					$scope.logout();
				}
			}else{
				$scope.totalSize=data.totalRecord;
				$scope.pageNum=Math.ceil($scope.totalSize/$scope.perpage_num);
				$(".selectpicker").selectpicker("render");
				var resultStr="";
				$scope.dataLength=0;
				if(!data.operationLogFormatList.length){
					var tempStr='<tr class="odd"><td colspan="8" class="dataTables_empty" valign="top">表中数据为空</td></tr>';
					$("#operationlogTab tbody").html(tempStr)
					$("#opertationlog_pagination").html("")
					return ;
				}
				for (var i = 0; i < data.operationLogFormatList.length; i++) {
					var tempObj=data.operationLogFormatList[i];
					resultStr+='<tr  role="row" class="operationlog_time">'
						+'<td colspan="8">'
							+'<p class="operationlog_p">'+$scope.getObjDate(tempObj.dayTime)+'</p>'
						+'</td>'
					+'</tr>';
					for (var j = 0; j < tempObj.operationList.length; j++) {
						$scope.dataLength++;
						var tempData=tempObj.operationList[j];
						resultStr+='<tr class="operationlog_data" role="row"><td><span>'+tempData.accountName+'</span></td>'
						+'<td><span>'+translate.getWord(tempData.type)+'</span></td>'
						+'<td><span>'+translate.getWord(tempData.targetType)+'</span></td>'
						+'<td><span>';
						if(tempData.targetName==null||tempData.targetName==""){
							resultStr+=tempData.operationObject;
						}else if(tempData.operationObject==null||tempData.operationObject==""){
							resultStr+=tempData.targetName;
						}else if(tempData.operationObject=="priorityService"||tempData.operationObject=="priorityRefactor"){
							resultStr+=tempData.targetName+"("+translate.getWord(tempData.operationObject)+")"
						}else{
							resultStr+=tempData.targetName+"("+tempData.operationObject+")"
						}
						resultStr+='</span></td>'
						+'<td><span>';

						if(tempData.status!="ACTIVITING"){
							switch(tempData.status){
								case "SUCCESS":
									resultStr+="<div><span class='status_green'>"+translate.getWord("success")+"</span></div>";break;
								case "FAILED":
									resultStr+="<div><span class='status_red'>"+translate.getWord("fail")+"</span></div>";break;
							}
						}else{
							resultStr+="<div class='progress progress-striped active' >"
								+"<div class='progress-bar' role='progressbar'  style='width:100%'>"
									+"<span >"
										+tempData.progress+"%"
									+"</span>"
								+"</div>"
							+"</div>"
						}
						resultStr+='</span></td>'
						+'<td><span>'+fillDate(tempData.startTime)+'</span></td>'
						+'<td><span>'+fillDate(tempData.endTime)+'</span></td>'
						+'<td><span>'+(tempData.errorMessage==null?'&nbsp;':tempData.errorMessage)+'</span></td></tr>';
					}
				}
				$("#operationlogTab tbody").html(resultStr)
				$scope.currentNum=Math.floor($scope.startNum/$scope.perpage_num)+1;
				var pageStr='';
				if($scope.currentNum==1){
					pageStr+='<li class="paginate_button first disabled"><a onclick="event.preventDefault()"><i class="fa  fa-angle-double-left"></i></a></li>'
					+'<li class="paginate_button previous disabled" ><a onclick="event.preventDefault()"><i class="fa fa-angle-left"></i></a></li>';
				}else{
					pageStr+='<li class="paginate_button first"><a ng-click="goPage(1)"><i class="fa  fa-angle-double-left"></i></a></li>'
					+'<li class="paginate_button previous " ><a ng-click="goPage('+($scope.currentNum-1)+')"><i class="fa fa-angle-left"></i></a></li>';
				}
				if($scope.pageNum<=7){
					for (var i = 1; i <= $scope.pageNum; i++) {
						if(i==$scope.currentNum){
							pageStr+='<li class="paginate_button active"><a>'+i+'</a></li>'
						}else{
							pageStr+='<li class="paginate_button"><a ng-click="goPage('+i+')">'+i+'</a></li>'
						}
					}
				}else{
					if($scope.currentNum<=4){
						for (var i = 1; i <=5; i++) {
							if(i==$scope.currentNum){
								pageStr+='<li class="paginate_button active"><a>'+i+'</a></li>'
							}else{
								pageStr+='<li class="paginate_button"><a ng-click="goPage('+i+')">'+i+'</a></li>'
							}
						}
						pageStr+='<li class="paginate_button disabled"><a onclick="event.preventDefault()">...</a></li>'
							+'<li class="paginate_button"><a ng-click="goPage('+$scope.pageNum+')">'+$scope.pageNum+'</a></li>'
					}else if($scope.currentNum>=($scope.pageNum-3)){
						pageStr+='<li class="paginate_button"><a  ng-click="goPage(1)">1</a></li>'
							+'<li class="paginate_button disabled"><a onclick="event.preventDefault()">...</a></li>';
						for (var i = 4; i >=0; i--) {
							if($scope.pageNum-i==$scope.currentNum){
								pageStr+='<li class="paginate_button active"><a>'+($scope.pageNum-i)+'</a></li>'
							}else{
								pageStr+='<li class="paginate_button"><a  ng-click="goPage('+($scope.pageNum-i)+')">'+($scope.pageNum-i)+'</a></li>'
							}
						}
					}else{
						pageStr+='<li class="paginate_button"><a  ng-click="goPage(1)">1</a></li>'
							+'<li class="paginate_button disabled"><a onclick="event.preventDefault()">...</a></li>'
							+'<li class="paginate_button"><a  ng-click="goPage('+($scope.currentNum-1)+')">'+($scope.currentNum-1)+'</a></li>'
							+'<li class="paginate_button active"><a>'+$scope.currentNum+'</a></li>'
							+'<li class="paginate_button"><a  ng-click="goPage('+($scope.currentNum+1)+')">'+($scope.currentNum+1)+'</a></li>'
							+'<li class="paginate_button disabled"><a onclick="event.preventDefault()">...</a></li>'
							+'<li class="paginate_button"><a  ng-click="goPage('+$scope.pageNum+')">'+$scope.pageNum+'</a></li>'
					}
				}
				if($scope.currentNum==$scope.pageNum){
					pageStr+='<li class="paginate_button next disabled"><a onclick="event.preventDefault()"><i class="fa fa-angle-right"></i></a></li>'
					+'<li class="paginate_button last disabled"><a onclick="event.preventDefault()"><i class="fa  fa-angle-double-right"></i></a></li>';
				}else{
					pageStr+='<li class="paginate_button next"><a ng-click="goPage('+($scope.currentNum+1)+')"><i class="fa fa-angle-right"></i></a></li>'
					+'<li class="paginate_button last"><a ng-click="goPage('+$scope.pageNum+')"><i class="fa  fa-angle-double-right"></i></a></li>';
				}
				$("#opertationlog_pagination").html($compile(pageStr)($scope))
			}
		});
	}

	$scope.loadTab()

	$scope.goPage=function(num){
		$scope.startNum=(num-1)*$scope.perpage_num;
		$scope.loadTab()
	}

	$scope.search=function(){
		$scope.startNum=0;
		var startTime=(new Date($("#startTime").val().split("-").join("/")+" 00:00:00")).getTime()||"";
		 var endTime=((new Date($("#endTime").val().split("-").join("/")+" 00:00:00")).getTime())+86399999||"";
		 var currentTime=(new Date()).getTime();

		 if(endTime*1<startTime*1){
			 showMessage.show($scope,"error","结束时间需要大于开始时间");
			 return;
		 }else if(currentTime*1<(endTime*1-86399999)){
			 showMessage.show($scope,"error","只可查询当前时间之前的日志");
			 return;
		 }
		accountNameSearchGlobal=$("#accountNameSearch").val()||"";
		typeSearchGlobal=$("#typeSearch").val()||"";
		filterStatusGlobal=$("#filterStatus").val()||"";
		targetTypeSearchGlobal=$("#targetTypeSearch").val()||"";
		operationObjectSearchGlobal=$("#operationObjectSearch").val()||"";
		startTimeGlobal=startTime;
		endTimeGlobal=endTime;
		$scope.searchFlag=true;
		$scope.loadTab()
	}

	$scope.searchAndExport=function(){
		$scope.search();
		var status=$("#filterStatus").val()||"";
		var accountName=$("#accountNameSearch").val()||"";
		var operationType=$("#typeSearch").val()||"";
		var targetType=$("#targetTypeSearch").val()||"";
		var targetName=$("#operationObjectSearch").val()||"";
		var endTime=((new Date($("#endTime").val().split("-").join("/")+" 00:00:00")).getTime())+86399999||"";
		var startTime=(new Date($("#startTime").val().split("-").join("/")+" 00:00:00")).getTime()||"";
		window.location.href="saveOperationLogsToCSV?status="+status
			+"&accountName="+accountName
			+"&operationType="+operationType
			+"&targetType="+targetType
			+"&startTime="+startTime
			+"&endTime="+endTime
			+"&targetName="+targetName
	}

	$scope.clearSelf=function(n){
		if(n*1==1){
			$scope.logItem1=""
		}else if(n*1==2){
			$scope.logItem2=""
		}else if(n*1==3){
			$scope.startTime=""
		}else if(n*1==4){
			$scope.endTime=""
		}
	}

	$scope.getObjDate=function(timer){
		var time=new Date(parseInt(timer));
		var month = time.getMonth()+1;
		var day=time.getDate();
		var hour=time.getHours();
		var minute=time.getMinutes();
		var second=time.getSeconds();
		return time.getFullYear()+"年"+ month + "月"+day+"日";
	}

	logInterval=$interval($scope.loadTab,5000)
  
	$scope.$on('$destroy',function(){
		$interval.cancel(logInterval)
	}) 
});