
"use strict";


angular.module('app.user', ['ui.router','datatables', 'datatables.bootstrap'] );


angular.module('app.user').config(function ($stateProvider) {

    $stateProvider
        .state('app.user', {
            abstract: true,
            data: {
                title: '用户'
            }
        })

        .state('app.user.users', {
            url: '/users',
            data: {
                title: '用户'
            },
            views: {
                "content@app": {
                    controller: 'UsersCtrl as showUser',
                    templateUrl: 'app/user/views/users.html'
                }
            }
        })
        .state('app.user.roles', {
            url: '/roles',
            data: {
                title: '角色'
            },
            views: {
                "content@app": {
                    controller: 'RolesCtrl as showRole',
                    templateUrl: 'app/user/views/roles.html'
                }
            },
            resolve: {
                srcipts: function(lazyScript){
                    return lazyScript.register([
                        "build/vendor.ui.js"
                    ])

                }
            }
        })
        .state('app.user.roles.roleDetail', {
            url: '/roleDetail/:roleId',
            data: {
                title: '角色详情'
            },
            params:{
                roleId:""
            },
            views: {
                "content@app": {
                    controller: 'RoleDetailCtrl as showRoleDetail',
                    templateUrl: 'app/user/views/roleDetail.html'
                }
            },
            resolve: {
                srcipts: function(lazyScript){
                    return lazyScript.register([
                        "build/vendor.ui.js"
                    ])

                }
            }
        })
        .state('app.user.users.userDetail', {
            url: '/userDetail/:userId',
            data: {
                title: '用户详情'
            },
            params:{
                userId:""
            },
            views: {
                "content@app": {
                    controller: 'UserDetailCtrl as showUserDetail',
                    templateUrl: 'app/user/views/userDetail.html'
                }
            }
        })

}); 
