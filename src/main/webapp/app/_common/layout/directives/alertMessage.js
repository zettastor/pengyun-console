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
