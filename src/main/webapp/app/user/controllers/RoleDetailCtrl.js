/**
 * Copyright (C) 2013-2024 Nanjing Pengyun Network Technology Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ 

'use strict';

angular.module('app.user').controller('RoleDetailCtrl', function (focus,$state,$stateParams,$http,$scope,DTOptionsBuilder, DTColumnBuilder,$compile,showMessage,$interval,translate,$timeout,$rootScope) {
	var vm=this;
	var roleId=$stateParams.roleId;
	var isOdd=true;
	var right=$(".detail_right").outerHeight();
	var left=$(".detail_content").outerHeight();
	$(".detail_content").css("min-height",right+"px")
	$(".detail_right").css("min-height",right+"px")
	function roleInfo(){
		var arr=[];
		arr.push(roleId)
		$http({
			method: "POST",
			async:false,
			url: "listRoles",
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
				var apiStr="";
				$scope.roleName=response.data.rolesList[0].name;
				$scope.description=response.data.rolesList[0].description;
				if($.isEmptyObject(response.data.rolesList[0].permissions)){
					apiStr="当前角色没有分配权限"
				}else{
					angular.forEach(response.data.rolesList[0].permissions,function(data,index,arr){
						apiStr=apiStr+limition(data)
					})
				}
				$("#apiTab").html(apiStr)


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
	roleInfo();
	$scope.refresh=function(){
		roleInfo();

	}
	function limition(datas){
		var string="";
		var rowsNum=1;
		var partNum=0;

		if(datas){
			if(datas.length/6>1){
				rowsNum=Math.ceil(datas.length/6)
			}
			if(isOdd){
				string+="<tr class='table_part table_odd'>";
			}else{
				string+="<tr class='table_part table_even'>";
			}
			string+="<td class='rolesTitle' rowspan='"+rowsNum+"'><span>"+translate.getWord(datas[0].category)+"</span></td>"
			
			angular.forEach(datas,function(data,index,array){
				if(index%6==0&&index!=0){
					if(isOdd){
						string+="</tr><tr class='table_odd'>";
					}else{
						string+="</tr><tr class='table_even'>";
					}
				}
				string+="<td tag_name='"+data.apiName+"' > "
				if($rootScope.currentLanguage=="cn"){
					string+=data.chineseText+'</td>'
				}else{
					string+=data.englishText+'</td>'
				}
				partNum++;

			})
			if(partNum<rowsNum*6){
				for(var i=0;i<(rowsNum*6-partNum);i++){
					string+="<td></td>";
				}
			}
			string+="</tr>";
			isOdd=!isOdd;
		}
		return string;

	}
})