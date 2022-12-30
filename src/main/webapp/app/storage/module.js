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

angular.module('app.storage', [ 'ui.router', 'datatables', 'datatables.bootstrap','datatables.scroller']);


angular.module('app.storage').config(function ($stateProvider) {

	$stateProvider
		.state('app.storage', {
			abstract: true,
			data: {
				title: '存储'
			}
		})

		.state('app.storage.volume', {
			url: '/volume',
			data: {
				title: '卷'
			},
			params: {
				volumeName: null,
				statusLevel:""
			},
			views: {
				"content@app": {
					controller: 'VolumeCtrl as datatables',
					templateUrl: 'app/storage/views/volume.html'
				}
			}
		})
		.state('app.storage.qos', {
			url: '/qosTemplet',
			data: {
				title: 'QoS策略'
			},
			params: {
				QosName:"",
				flag:""
			},
			views: {
				"content@app": {
					controller: 'QosTempletCtrl as datatables',
					templateUrl: 'app/storage/views/qosTemplet.html'
				}
			},
			resolve: {
				srcipts: function(lazyScript){
					return lazyScript.register([
						"build/vendor.ui.js"
					])
				}
			}
		})
		.state('app.storage.domain', {
			url: '/domain',
			data: {
				title: '域'
			},
			params: {
				domainName:""
			},
			views: {
				"content@app": {
					controller: 'DomainCtrl as showDomain',
					templateUrl: 'app/storage/views/domain.html'
				}
			}
		})
		.state('app.storage.allDriver', {
			url: '/allDriver',
			data: {
				title: '驱动'
			},
			params: {
				volumeId:"",
				driverName:""
			},
			views: {
				"content@app": {
					controller: 'AllDriverCtrl as datatables',
					templateUrl: 'app/storage/views/allDriver.html'
				}
			}
		})
		.state('app.storage.accessRule', {
			url: '/access',
			data: {
				title: '访问控制'
			},
			views: {
				"content@app": {
					controller: 'AccessRuleCtrl as datatables',
					templateUrl: 'app/storage/views/accessRule.html'
				}
			}
		})
		.state('app.storage.volume.volumeDetail', {
			url: '/volumeDetail/:volumeId',
			data: {
				title: '卷详细'
			},
			views: {
				"content@app": {
					controller: 'VolumeDetailCtrl as datatables',
					templateUrl: 'app/storage/views/volumeDetail.html'
				}
			},
			css:'styles/css/jPages.css'
		})
		.state('app.storage.volume.volumePerformanceData', {
			url: '/volumePerformanceData/:volumeId',
			data: {
				title: '卷详情'
			},
			views: {
				"content@app": {
					controller: 'VolumePerformanceDataCtrl as datatables',
					templateUrl: 'app/storage/views/volumePerformanceData.html'
				}
			},
			css:'styles/css/jPages.css'
		})
		.state('app.storage.domain.pool', {
			url: '/pool/:domainId/:sel_domainName',
			data: {
				title: '存储池'
			},
			params: {
				poolName:"",
				domainId:"",
				sel_domainName:"",
				flag:"",
				statusLevel:""
			},
			views: {
				"content@app": {
					controller: 'poolCtrl as showPool',
					templateUrl: 'app/storage/views/pool.html'
				}
			}
		})
		.state('app.storage.domain.pool.poolDetail', {
			url: '/poolDetail/:poolId/:domainId',
			data: {
				title: '存储池详情'
			},
			params: {
				poolId:"",
				domainId:"",
				sel_domainName:"",
			},
			views: {
				"content@app": {
					controller: 'poolDetailCtrl as showPoolDetail',
					templateUrl: 'app/storage/views/poolDetail.html'
				}
			}
		})
		.state('app.storage.domain.domainDetail', {
			url: '/domainDetail/:domainId',
			data: {
				title: '域详情'
			},
			params: {
				domainId:""
			},
			views: {
				"content@app": {
					controller: 'domainDetailCtrl as showDomainDetail',
					templateUrl: 'app/storage/views/domainDetail.html'
				}
			}
		})
});