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

angular.module('app.user').controller('UserDetailCtrl', function (focus,$state,$stateParams,$http,$scope,DTOptionsBuilder, DTColumnBuilder,$compile,showMessage,$interval,translate,$timeout,$rootScope) {
	var vm=this;
	var userId=$stateParams.userId;
	var isOdd=true;
	var right=$(".detail_right").outerHeight();
	var left=$(".detail_content").outerHeight();
	$(".detail_content").css("min-height",right+"px")
	$(".detail_right").css("min-height",right+"px")
	function userInfo(){
		var arr=[];
		arr.push(userId)
		$http({
			method: "POST",
			async:false,
			url: "listAccount",
			data: {idsJson:JSON.stringify(arr)},
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
				var roleStr="";
				$scope.userName=response.data.accountList.accountList[0].accountName;
				if(response.data.accountList.accountList[0].roles.length>0){
					roleStr+="<span id='roleSpan'>"
					angular.forEach(response.data.accountList.accountList[0].roles,function(d,index,array){
						roleStr+="<span>"+d.name+"</span>&nbsp;&nbsp;&nbsp;"
					})
					roleStr+="</span>"
				}else{
					roleStr="还未分配角色"
				}
				$("#roleDiv").html(roleStr)
				var resourceStr="";
				if(response.data.accountList.accountList[0].accountType=="SuperAdmin"){
					$scope.emptyAccess=true;
					resourceStr+="<div class='superadmin'></div><p class='admin_word'>您已是超级管理员，拥有<span class='allrc'>所有资源</span>！</p>"
					$("#admin_pic").html(resourceStr)
				}else{
					if($.isEmptyObject(response.data.accountList.accountList[0].resources)){

						$scope.emptyAccess=true;
						resourceStr+="<div class='normaladmin'></div><p class='admin_word'>您还<span class='norc'>未分配</span>任何资源！</p>"
						$("#admin_pic").html(resourceStr)
					}else{
						$scope.emptyAccess=false;
						angular.forEach(response.data.accountList.accountList[0].resources,function(userdata,index,array){
							var rowsNum=getRowSpan(userdata.length);
							var str="";
							var partNum=0;

							if(index=="Domain"){
								str=translate.getWord("table.domain");
							}else if(index=="StoragePool"){
								str=translate.getWord("table.pool");
							}else if(index=="Volume"){
								str=translate.getWord("volume.volume");
							}
							
							if(isOdd){
								resourceStr+="<tr class='table_part table_odd'>";
							}else{
								resourceStr+="<tr class='table_part table_even'>";
							}
							resourceStr+="<td class='rolesTitle' rowspan='"+rowsNum+"'><span>"+str+"</span></td>"
							angular.forEach(userdata,function(data,index,array){
								if(partNum%6==0&&partNum!=0){
									if(isOdd){
										string+="</tr><tr class='table_odd'>";
									}else{
										string+="</tr><tr class='table_even'>";
									}
								}
								resourceStr+="<td tag_name='"+data.resourceId+"' > "
								+data.resourceName+'</td>'
								partNum++;
							})
							if(partNum<rowsNum*6){
								for(var i=0;i<(rowsNum*6-partNum);i++){
									resourceStr+="<td></td>";
								}
							}
							resourceStr+="</tr>"
							isOdd=!isOdd;

						})
						$("#apiTab").html(resourceStr)
					}
				}

				

			} else {
				if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
					showMessage.show($scope,"warn",translate.getWord("session.out"));
					$scope.logout();
					return;
				}else{
					showMessage.show($scope,"error",translate.getWord(response.data.resultMessage.message));
				}

			}

		},function errorCallback(response){


		});
	}
	function getRowSpan(l){
		if(l/6>1){
			return Math.ceil(l/6);
		}else{
			return 1;
		}
	}
	userInfo();
	$scope.refresh=function(){
		userInfo();

	}
})