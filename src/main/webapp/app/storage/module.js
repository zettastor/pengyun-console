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