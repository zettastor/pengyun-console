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
