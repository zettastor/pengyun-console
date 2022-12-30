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

angular.module('app.auth', [
    'ui.router'
]).config(function ($stateProvider
    ) {
    $stateProvider
    .state('login', {
        url: '/login',
        views: {
            root: {
                templateUrl: 'app/auth/views/login.html',
                controller: 'AuthCtrl'
            }
        },
        data: {
            title: 'Login',
            htmlId: 'extr-page'
        },
        resolve: {
            srcipts: function(lazyScript){
                return lazyScript.register([
                    'build/vendor.ui.js'
                ])

            }
        }
    })

}).constant('authKeys', {
    googleClientId: '',
    facebookAppId: ''
});
