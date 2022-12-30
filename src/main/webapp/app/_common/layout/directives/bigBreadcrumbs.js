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

angular.module('SmartAdmin.Layout').directive('bigBreadcrumbs', function (translate) {
    return {
        restrict: 'EA',
        replace: true,
        template: '<div><h1 class="page-title txt-color-blueDark""></h1></div>',
        scope: {
            items: '=',
            icon: '@'
        },
        link: function (scope, element) {
            var first =translate.getWord( _.first(scope.items));
            var icon = scope.icon || 'home';
            var appendStr='<i class="fa-fw fa fa-' + icon + '"></i> ' + first
            if(first=="存储池"){
                appendStr=appendStr+'<span class="sub_title"></span>';
            }
              element.find('h1').append(appendStr);
            _.rest(scope.items).forEach(function (item) {
                element.find('h1').append(' <br/><span class="crumbs_word"> ' + translate.getWord(item) + '</span>')
            })
        }
    }
});
