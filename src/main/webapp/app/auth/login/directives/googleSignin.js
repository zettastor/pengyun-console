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

angular.module('app.auth').directive('googleSignin', function ($rootScope, GooglePlus) {
    return {
        restrict: 'E',
        template: '<a class="g-signin btn btn-block btn-social btn-google-plus"><i class="fa fa-google-plus"></i> Sign in with Google</a>',
        replace: true,
        link: function (scope, element) {
            element.on('click', function(){
                GooglePlus.login().then(function (authResult) {
                    $rootScope.$broadcast('event:google-plus-signin-success', authResult);

                }, function (err) {
                    $rootScope.$broadcast('event:google-plus-signin-failure', err);

                });
            })
        }
    };
});
