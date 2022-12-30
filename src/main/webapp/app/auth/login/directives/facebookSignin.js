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

angular.module('app.auth').directive('facebookSignin', function ($rootScope, ezfb) {
    return {
        replace: true,
        restrict: 'E',
        template: '<a class="btn btn-block btn-social btn-facebook"><i class="fa fa-facebook"></i> Sign in with Facebook</a>',
        link: function(scope, element){
            element.on('click', function(){
                ezfb.login(function (res) {
                    if (res.authResponse) {
                        $rootScope.$broadcast('event:facebook-signin-success', res.authResponse);
                    }
                }, {scope: 'public_profile'});
            })

        }
    }
});