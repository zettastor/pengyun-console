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

angular.module('app.dashboard').directive('eChart', function () {
    return {
        scope: {
            option:"=",
            height:"@"
        },
        restrict: 'E',
        template: '<div class="echart" ></div>',
        replace: true,
        link: function($scope, element, attrs, controller) {
            if($scope.height){
                element[0].style.height=$scope.height
            }else{
                 element[0].style.height="400px"
            }
            var myChart = echarts.init(element[0],'dark');
            myChart.setOption($scope.option);
            $scope.$watch('option',function(newOption){
                    // myChart = echarts.init(eles[0]);
                    myChart.setOption(newOption);
                },true);
            window.addEventListener('resize',function(){
                myChart.resize();
            })
        }
    };
});