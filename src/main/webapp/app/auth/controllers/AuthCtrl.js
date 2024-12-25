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

angular.module('app.auth').controller('AuthCtrl', function (focus, $scope, $http, Session, AUTH_EVENTS, $location, $cookieStore, $rootScope, $log, Language, $translate, translate, $state) {

  focus('username');
  $scope.account = {
    name: '',
    password: ''
  };
  $scope.resultMessage = "";
  $scope.turnCn = function () {
    $rootScope.currentLanguage = {
      "key": "cn",
      "alt": "China",
      "title": "中文"
    };
    $cookieStore.remove("lan");
    $cookieStore.put("lan", $rootScope.currentLanguage);
    $translate.use($rootScope.currentLanguage.key).then(function () {
      $state.reload();
    })
  }

  $scope.turnEn = function () {
    $rootScope.currentLanguage = {
      'alt': "United States", 'key': "us", 'title': "English (US)"
    };
    $cookieStore.remove("lan");
    $cookieStore.put("lan", $rootScope.currentLanguage);
    $translate.use($rootScope.currentLanguage.key).then(function () {
      $state.reload();
    })
  }
  $scope.login = function (account) {
    if (!account.name) {
      $scope.resultMessage = translate.getWord("user.name.tool.tip")
    } else if (!account.password) {
      $scope.resultMessage = translate.getWord("password.tool.tip")
    } else {
      $http({
        method: "POST",
        async: false,
        url: "loginSys",
        data: {
          accountName: account.name,
          password: account.password
        },
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
            $scope.resultMessage = ""
            Session.create(response.data.account.accountId, response.data.account.accountName, response.data.account.accountType);
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            $scope.setCurrentAccount(response.data.account);
            $rootScope.apis = response.data.apisMap;
            $cookieStore.put('apis', $rootScope.apis);
            // $rootScope.getWebsocketUri();
            $location.path('/');
            $cookieStore.remove("config");
          } else {
            $scope.resultMessage = translate.getWord(response.data.resultMessage.message)
            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
          }

        });
    }

  };

  $scope.clearUserInput = function () {
    $("#username").val("");
    $scope.account.name = "";
  }
})

  .constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  })

  .constant('USER_ROLES', {
    all: '*',
    admin: 'SuperAdmin',
    editor: 'editor',
    guest: 'guest'
  })

  .service('Session', function ($rootScope, $cookieStore) {
    this.create = function (accountId, accountName, accountType) {
      this.accountId = accountId;
      this.accountName = accountName;
      this.accountType = accountType;
      $rootScope.globals = {
        currentAccount: {
          accountId: accountId,
          accountName: accountName,
          accountType: accountType
        }
      };
      $cookieStore.put('globals', $rootScope.globals);
    };
    this.destroy = function () {
      this.accountId = null;
      this.accountName = null;
      this.accountType = null;
      $cookieStore.remove('globals');
    };
    return this;
  })
