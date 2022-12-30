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
