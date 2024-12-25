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

angular.module('app.storage').directive("datetimepicker",function(){
    return {
        restrict: "EA",
        require : "ngModel",
        link: function (scope, element, attrs, ctrl) {

            var unregister = scope.$watch(function(){

                $(element).append("<input id='date-"+attrs.dateid+"' style='border:none;width:100%;height:100%' " +
                "value='"+ctrl.$modelValue+"'>");
                $(element).css("padding","0");

                element.on('change', function() {
                    scope.$apply(function() {
                        ctrl.$setViewValue($("#date-"+attrs.dateid).val());
                    });
                });

                element.on('click',function(){
                    $("#date-"+attrs.dateid).datetimepicker({
                        format : attrs.format || 'h:i',
                        onClose : function(){
                            element.change();
                        }
                    });
                });

                element.click();

                return ctrl.$modelValue;
            }, initialize);

            function initialize(value){
                ctrl.$setViewValue(value);
                unregister();
            }
        }
    }
});
;
