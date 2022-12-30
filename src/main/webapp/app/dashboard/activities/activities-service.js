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

"use strict";

angular.module('app').factory('activityService', function($http, $log, APP_CONFIG) {

	function getActivities(callback){

		$http.get(APP_CONFIG.apiRootUrl + '/activities/activity.json').then(function(data){
			

			callback(data.data);
				
		},function(){

			$log.log('Error');
			callback([]);

		})

	}

	function getActivitiesByType(type, callback){

		$http.get(APP_CONFIG.apiRootUrl + '/activities/activity-' + type + '.json').then(function(data){

			callback(data.data);
				
		},function(){

			$log.log('Error');
			callback([]);

		});

	}
	
	return{
		get:function(callback){
			getActivities(callback);
		},
		getbytype:function(type,callback){
			getActivitiesByType(type, callback);
		}
	}
});