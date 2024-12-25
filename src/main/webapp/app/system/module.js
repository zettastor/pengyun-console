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
