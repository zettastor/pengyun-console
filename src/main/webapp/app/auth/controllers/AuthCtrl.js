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
