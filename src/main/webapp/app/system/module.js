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

angular.module('app.system', ['ui.router', 'datatables', 'datatables.bootstrap']);

angular.module('app.system').config(function ($stateProvider) {

  $stateProvider
    .state('app.system', {
      abstract: true,
      data: {
        title: '系统'
      }
    })

    .state('app.system.operationLog', {
      url: '/operationLog',
      data: {
        title: '操作日志'
      },
      views: {
        "content@app": {
          controller: 'OperationLogCtrl as datatables',
          templateUrl: 'app/system/views/operationLog.html'
        }
      }
    })
   
    .state('app.system.services', {
      url: '/services',
      data: {
        title: '服务'
      },
      params: {
        instanceName: null,
        statusLevel: ""
      },
      views: {
        "content@app": {
          controller: 'ServicesCtrl as servicesShow',
          templateUrl: 'app/system/views/services.html'
        }
      }
    })

    .state('app.system.component', {
      url: '/component',
      data: {
        title: '组件'
      },
      views: {
        "content@app": {
          controller: 'ComponentCtrl as datatables',
          templateUrl: 'app/system/views/component.html'
        }
      }
    })
});
