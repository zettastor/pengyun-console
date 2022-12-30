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

var BASE_API = '';
angular.module('app', [
  'ngSanitize',
  'ngAnimate',
  'restangular',
  'ngCookies',
  'ui.router',
  'ui.bootstrap',
  'pascalprecht.translate',
  'SmartAdmin',
  'app.auth',
  'app.layout',
  'app.dashboard',
  'app.storage',
  'app.hardware',
  'app.system',
  'app.user'
]).controller('ApplicationController', function ($rootScope, $scope, USER_ROLES, $cookieStore, $http, $location, Session) {
  $scope.currentAccount = null;
  $scope.userRoles = USER_ROLES;
  $scope.setCurrentAccount = function (account) {
    $scope.currentAccount = account;
  };
  $rootScope.driverPageLength = "10"
  $rootScope.logout = function () {
    $http({
      method: "POST",
      async: false,
      url: "logout",
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback (response) {
      $cookieStore.remove('config');
      Session.destroy();
      $location.path('/login');
      if ($rootScope.Websocket.websocket) {
        $rootScope.Websocket.websocket.close();
      }
    }, function errorCallback (response) {
    })
  };
})
  .config(function ($provide, $httpProvider, RestangularProvider, $translateProvider) {
    var lang = 'cn';
    $translateProvider.useStaticFilesLoader({
      prefix: 'api/i18n/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage(lang);
    $provide.factory('ErrorHttpInterceptor', function ($q) {
      var errorCounter = 0;
      function notifyError (rejection) {
        $.bigBox({
          title: rejection.status + ' ' + rejection.statusText,
          content: rejection.data,
          color: "#C46A69",
          icon: "fa fa-warning shake animated",
          number: ++errorCounter,
          timeout: 6000
        });
      }
      return {
        requestError: function (rejection) {
        },
        request: function (config) {
          config.headers = config.headers || {};
          // if (config.method === 'POST') {
          //   config.url = `/api/${config.url}`
          // }
          return config || $q.when(config);
        },
        responseError: function (rejection) {
        }
      };
    });
    $httpProvider.interceptors.push('ErrorHttpInterceptor');
    RestangularProvider.setBaseUrl(location.pathname.replace(/[^\/]+?$/, ''));
  })
  .constant('APP_CONFIG', window.appConfig)
  .run(function ($rootScope, $timeout, $state, $stateParams, $location, $translate, $cookieStore, $http, $interval) {
    $rootScope.ww = 0;
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.alertComeFlag = 0;
    $rootScope.currentLanguage = 'cn';
    $rootScope.apis = $cookieStore.get("apis")
    $rootScope.globals = $cookieStore.get('globals') || {};
    $rootScope.manageService = false;
    $rootScope.Websocket = {};
    $rootScope.checkTimer;
    $rootScope.socketStatus = false;
    $translate.use('cn');
    $rootScope.$on('$locationChangeStart', function (event, next, current) {
      $http({
        method: "POST",
        url: "judgeLogin",
        data: {},
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      })
        .then(function (response) {
          if (response.data.resultMessage.message == "success") {
            $rootScope.manageService = false;
            angular.forEach(response.data.account.roles, function (data, index, array) {
              if (data.name == 'admin' || data.name == 'superadmin') {
                $rootScope.manageService = true;
              }
            })
            if (!$rootScope.globals.currentAccount) {
              $rootScope.globals = {
                currentAccount: {
                  accountId: response.data.account.accountId,
                  accountName: response.data.account.accountName,
                  accountType: response.data.account.accountType
                }
              };
              $cookieStore.put('globals', $rootScope.globals);
            }
          } else {
            $rootScope.logout();
          }
        });
    });
  });