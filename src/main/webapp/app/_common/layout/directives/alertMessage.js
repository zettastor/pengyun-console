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

angular.module('SmartAdmin.Layout').directive('alertMessage', function () {
	return {
		scope: {
			level: '=',//error,info,warn,success
			message: '=',
			show: '='
		},
		restrict: 'EA',
		replace: true,
		templateUrl: 'app/_common/layout/views/alertMessage.html',
		link: function (scope, element) {
			function change(scope){
				element.find('.icon').removeClass('danger info warn success');
				element.find('.message').html(scope.message);
				switch(scope.level){
					case "error":{
						element.find('.icon').addClass("danger");
						element.find('.title p').html('错误');
					};break;

					case "info":{
						element.find('.icon').addClass("info");
						element.find('.title p').html('信息');
					};break;
					case "warn":{
						element.find('.icon').addClass("warn");
						element.find('.title p').html('警告');
					};break;
					case "success":{
						element.find('.icon').addClass("success");
						element.find('.title p').html('成功');

					};break;
					default:{
						 element.find('.icon').addClass("info");
						element.find('.title p').html('信息');
						element.find('.message').html(scope.message);
					}
				}
					
			}
			scope.$watch('message',function(newMessage){
				change(scope);

			},true);
			
			scope.$watch('show',function(newShow){
				change(scope);
				if(newShow){
					element.fadeIn("slow");
					setTimeout(function(){element.fadeOut("slow");scope.show=false;},5000);
				}else{
					element.hide();
				}
			},true);
			// 
			
		}
	}
});
