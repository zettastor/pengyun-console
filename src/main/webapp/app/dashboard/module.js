
'use strict';
angular.module('app.dashboard', [
    'ui.router',
    'ngResource',
    'datatables',
    'datatables.bootstrap'
])

.config(function ($stateProvider) {
    $stateProvider
        .state('app.dashboard', {
            url: '/dashboard',
            views: {
                "content@app": {
                    controller: 'DashboardCtrl as datatables',
                    templateUrl: 'app/dashboard/views/dashboard.html'
                }
            },
            data:{
                title: 'Dashboard'
            }
        });
});
