
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
