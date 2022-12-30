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

var appConfig = window.appConfig || {};

appConfig.menu_speed = 200;

appConfig.smartSkin = "smart-style-4";

appConfig.skins = [
    {name: "smart-style-0",
        logo: "styles/img/logo.png",
        class: "btn btn-block btn-xs txt-color-white margin-right-5",
        style: "background-color:#4E463F;",
        label: "Smart Default"},

    {name: "smart-style-1",
        logo: "styles/img/logo-white.png",
        class: "btn btn-block btn-xs txt-color-white",
        style: "background:#3A4558;",
        label: "Dark Elegance"},

    {name: "smart-style-2",
        logo: "styles/img/logo-blue.png",
        class: "btn btn-xs btn-block txt-color-darken margin-top-5",
        style: "background:#fff;",
        label: "Ultra Light"},

    {name: "smart-style-3",
        logo: "styles/img/logo-pale.png",
        class: "btn btn-xs btn-block txt-color-white margin-top-5",
        style: "background:#f78c40",
        label: "Google Skin"},

    {name: "smart-style-4",
       
        class: "btn btn-xs btn-block txt-color-white margin-top-5",
        style: "background: #bbc0cf; border: 1px solid #59779E; color: #17273D !important;",
        label: "PixelSmash"},

    {name: "smart-style-5",
        logo: "styles/img/logo-pale.png",
        class: "btn btn-xs btn-block txt-color-white margin-top-5",
        style: "background: rgba(153, 179, 204, 0.2); border: 1px solid rgba(121, 161, 221, 0.8); color: #17273D !important;",
        label: "Glass"},

    {name: "smart-style-6",
        logo: "styles/img/logo-pale.png",
        class: "btn btn-xs btn-block txt-color-white margin-top-5",
        style: "background: #2196F3; border: 1px solid rgba(121, 161, 221, 0.8); color: #FFF !important;",
        beta: true,
        label: "MaterialDesign"
    }


];

appConfig.debugState = false;   
appConfig.debugStyle = 'font-weight: bold; color: #00f;';
appConfig.debugStyle_green = 'font-weight: bold; font-style:italic; color: #46C246;';
appConfig.debugStyle_red = 'font-weight: bold; color: #ed1c24;';
appConfig.debugStyle_warning = 'background-color:yellow';
appConfig.debugStyle_success = 'background-color:green; font-weight:bold; color:#fff;';
appConfig.debugStyle_error = 'background-color:#ed1c24; font-weight:bold; color:#fff;';


appConfig.apiRootUrl = 'api';

window.appConfig = appConfig;
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

$.sound_path = appConfig.sound_path;
$.sound_on = appConfig.sound_on;


$(function () {

    moment.locale('en')

    angular.bootstrap(document, ['app']);
 
});

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

var BASE_API = '';
angular.module('app', [
  'ngSanitize',
  'ngAnimate',
  'restangular',
  'ngCookies',
  'ui.router',
  'ui.bootstrap',
  'pascalprecht.translate',
  'SmartAdmin',
  'app.auth',
  'app.layout',
  'app.dashboard',
  'app.storage',
  'app.hardware',
  'app.system',
  'app.user'
]).controller('ApplicationController', function ($rootScope, $scope, USER_ROLES, $cookieStore, $http, $location, Session) {
  $scope.currentAccount = null;
  $scope.userRoles = USER_ROLES;
  $scope.setCurrentAccount = function (account) {
    $scope.currentAccount = account;
  };
  $rootScope.driverPageLength = "10"
  $rootScope.logout = function () {
    $http({
      method: "POST",
      async: false,
      url: "logout",
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback (response) {
      $cookieStore.remove('config');
      Session.destroy();
      $location.path('/login');
      if ($rootScope.Websocket.websocket) {
        $rootScope.Websocket.websocket.close();
      }
    }, function errorCallback (response) {
    })
  };
})
  .config(function ($provide, $httpProvider, RestangularProvider, $translateProvider) {
    var lang = 'cn';
    $translateProvider.useStaticFilesLoader({
      prefix: 'api/i18n/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage(lang);
    $provide.factory('ErrorHttpInterceptor', function ($q) {
      var errorCounter = 0;
      function notifyError (rejection) {
        $.bigBox({
          title: rejection.status + ' ' + rejection.statusText,
          content: rejection.data,
          color: "#C46A69",
          icon: "fa fa-warning shake animated",
          number: ++errorCounter,
          timeout: 6000
        });
      }
      return {
        requestError: function (rejection) {
        },
        request: function (config) {
          config.headers = config.headers || {};
          // if (config.method === 'POST') {
          //   config.url = `/api/${config.url}`
          // }
          return config || $q.when(config);
        },
        responseError: function (rejection) {
        }
      };
    });
    $httpProvider.interceptors.push('ErrorHttpInterceptor');
    RestangularProvider.setBaseUrl(location.pathname.replace(/[^\/]+?$/, ''));
  })
  .constant('APP_CONFIG', window.appConfig)
  .run(function ($rootScope, $timeout, $state, $stateParams, $location, $translate, $cookieStore, $http, $interval) {
    $rootScope.ww = 0;
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.alertComeFlag = 0;
    $rootScope.currentLanguage = 'cn';
    $rootScope.apis = $cookieStore.get("apis")
    $rootScope.globals = $cookieStore.get('globals') || {};
    $rootScope.manageService = false;
    $rootScope.Websocket = {};
    $rootScope.checkTimer;
    $rootScope.socketStatus = false;
    $translate.use('cn');
    $rootScope.$on('$locationChangeStart', function (event, next, current) {
      $http({
        method: "POST",
        url: "judgeLogin",
        data: {},
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      })
        .then(function (response) {
          if (response.data.resultMessage.message == "success") {
            $rootScope.manageService = false;
            angular.forEach(response.data.account.roles, function (data, index, array) {
              if (data.name == 'admin' || data.name == 'superadmin') {
                $rootScope.manageService = true;
              }
            })
            if (!$rootScope.globals.currentAccount) {
              $rootScope.globals = {
                currentAccount: {
                  accountId: response.data.account.accountId,
                  accountName: response.data.account.accountName,
                  accountType: response.data.account.accountType
                }
              };
              $cookieStore.put('globals', $rootScope.globals);
            }
          } else {
            $rootScope.logout();
          }
        });
    });
  });
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

(function(){
    "use strict";

    angular.module('SmartAdmin', [
        "SmartAdmin.Forms",
        "SmartAdmin.Layout",
        "SmartAdmin.UI",
    ]);
})();
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

angular.module('app.auth', [
    'ui.router'
]).config(function ($stateProvider
    ) {
    $stateProvider
    .state('login', {
        url: '/login',
        views: {
            root: {
                templateUrl: 'app/auth/views/login.html',
                controller: 'AuthCtrl'
            }
        },
        data: {
            title: 'Login',
            htmlId: 'extr-page'
        },
        resolve: {
            srcipts: function(lazyScript){
                return lazyScript.register([
                    'build/vendor.ui.js'
                ])

            }
        }
    })

}).constant('authKeys', {
    googleClientId: '',
    facebookAppId: ''
});

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


angular.module('app.hardware', ['ui.router','datatables', 'datatables.bootstrap'] );


angular.module('app.hardware').config(function ($stateProvider) {

	$stateProvider
		.state('app.hardware', {
			abstract: true,
			data: {
				title: '硬件'
			}
		})

		.state('app.hardware.disk', {
			url: '/disk',
			data: {
				title: '存储磁盘'
			},
			params: {
				datanodeId: "",
				diskName:"",
				archiveId:"",
				statusLevel:""
			},
			views: {
				"content@app": {
					controller: 'DiskCtrl as showDisk',
					templateUrl: 'app/hardware/views/disk.html'
				}
			}
		})
}); 

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


angular.module('app.layout', ['ui.router'])

.config(function ($stateProvider, $urlRouterProvider) {


    $stateProvider
        .state('app', {
            abstract: true,
            views: {
                root: {
                    templateUrl: 'app/layout/layout.tpl.html'
                }
            }
        });
    $urlRouterProvider.otherwise('/dashboard');

})


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

angular.module('app.storage', [ 'ui.router', 'datatables', 'datatables.bootstrap','datatables.scroller']);


angular.module('app.storage').config(function ($stateProvider) {

	$stateProvider
		.state('app.storage', {
			abstract: true,
			data: {
				title: '存储'
			}
		})

		.state('app.storage.volume', {
			url: '/volume',
			data: {
				title: '卷'
			},
			params: {
				volumeName: null,
				statusLevel:""
			},
			views: {
				"content@app": {
					controller: 'VolumeCtrl as datatables',
					templateUrl: 'app/storage/views/volume.html'
				}
			}
		})
		.state('app.storage.qos', {
			url: '/qosTemplet',
			data: {
				title: 'QoS策略'
			},
			params: {
				QosName:"",
				flag:""
			},
			views: {
				"content@app": {
					controller: 'QosTempletCtrl as datatables',
					templateUrl: 'app/storage/views/qosTemplet.html'
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
		.state('app.storage.domain', {
			url: '/domain',
			data: {
				title: '域'
			},
			params: {
				domainName:""
			},
			views: {
				"content@app": {
					controller: 'DomainCtrl as showDomain',
					templateUrl: 'app/storage/views/domain.html'
				}
			}
		})
		.state('app.storage.allDriver', {
			url: '/allDriver',
			data: {
				title: '驱动'
			},
			params: {
				volumeId:"",
				driverName:""
			},
			views: {
				"content@app": {
					controller: 'AllDriverCtrl as datatables',
					templateUrl: 'app/storage/views/allDriver.html'
				}
			}
		})
		.state('app.storage.accessRule', {
			url: '/access',
			data: {
				title: '访问控制'
			},
			views: {
				"content@app": {
					controller: 'AccessRuleCtrl as datatables',
					templateUrl: 'app/storage/views/accessRule.html'
				}
			}
		})
		.state('app.storage.volume.volumeDetail', {
			url: '/volumeDetail/:volumeId',
			data: {
				title: '卷详细'
			},
			views: {
				"content@app": {
					controller: 'VolumeDetailCtrl as datatables',
					templateUrl: 'app/storage/views/volumeDetail.html'
				}
			},
			css:'styles/css/jPages.css'
		})
		.state('app.storage.volume.volumePerformanceData', {
			url: '/volumePerformanceData/:volumeId',
			data: {
				title: '卷详情'
			},
			views: {
				"content@app": {
					controller: 'VolumePerformanceDataCtrl as datatables',
					templateUrl: 'app/storage/views/volumePerformanceData.html'
				}
			},
			css:'styles/css/jPages.css'
		})
		.state('app.storage.domain.pool', {
			url: '/pool/:domainId/:sel_domainName',
			data: {
				title: '存储池'
			},
			params: {
				poolName:"",
				domainId:"",
				sel_domainName:"",
				flag:"",
				statusLevel:""
			},
			views: {
				"content@app": {
					controller: 'poolCtrl as showPool',
					templateUrl: 'app/storage/views/pool.html'
				}
			}
		})
		.state('app.storage.domain.pool.poolDetail', {
			url: '/poolDetail/:poolId/:domainId',
			data: {
				title: '存储池详情'
			},
			params: {
				poolId:"",
				domainId:"",
				sel_domainName:"",
			},
			views: {
				"content@app": {
					controller: 'poolDetailCtrl as showPoolDetail',
					templateUrl: 'app/storage/views/poolDetail.html'
				}
			}
		})
		.state('app.storage.domain.domainDetail', {
			url: '/domainDetail/:domainId',
			data: {
				title: '域详情'
			},
			params: {
				domainId:""
			},
			views: {
				"content@app": {
					controller: 'domainDetailCtrl as showDomainDetail',
					templateUrl: 'app/storage/views/domainDetail.html'
				}
			}
		})
});
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

angular.module('app.system', ['ui.router', 'datatables', 'datatables.bootstrap']);

angular.module('app.system').config(function ($stateProvider) {

  $stateProvider
    .state('app.system', {
      abstract: true,
      data: {
        title: '系统'
      }
    })

    .state('app.system.operationLog', {
      url: '/operationLog',
      data: {
        title: '操作日志'
      },
      views: {
        "content@app": {
          controller: 'OperationLogCtrl as datatables',
          templateUrl: 'app/system/views/operationLog.html'
        }
      }
    })
   
    .state('app.system.services', {
      url: '/services',
      data: {
        title: '服务'
      },
      params: {
        instanceName: null,
        statusLevel: ""
      },
      views: {
        "content@app": {
          controller: 'ServicesCtrl as servicesShow',
          templateUrl: 'app/system/views/services.html'
        }
      }
    })

    .state('app.system.component', {
      url: '/component',
      data: {
        title: '组件'
      },
      views: {
        "content@app": {
          controller: 'ComponentCtrl as datatables',
          templateUrl: 'app/system/views/component.html'
        }
      }
    })
});

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

(function(){
    "use strict";

    angular.module('SmartAdmin.Forms', []);
})();
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

(function(){
    "use strict";

    angular.module('SmartAdmin.Layout', []);
})();
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

(function(){
    "use strict";

    angular.module('SmartAdmin.UI', []);
})();
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


angular.module('app.chat', ['ngSanitize'])
.run(function ($templateCache) {

    $templateCache.put("template/popover/popover.html",
        "<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
        "  <div class=\"arrow\"></div>\n" +
        "\n" +
        "  <div class=\"popover-inner\">\n" +
        "      <h3 class=\"popover-title\" ng-bind-html=\"title | unsafe\" ng-show=\"title\"></h3>\n" +
        "      <div class=\"popover-content\"ng-bind-html=\"content | unsafe\"></div>\n" +
        "  </div>\n" +
        "</div>\n" +
        "");

}).filter('unsafe', ['$sce', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    };
}]);
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

angular.module('app.dashboard').controller('DashboardCtrl', DashboardCtrl);

function DashboardCtrl($scope,$http,$rootScope,$timeout,$state){
	$(".modal").draggable();
	var vm=this;
	vm.dtInstancePool={};
	$scope.toShow=false;
	$rootScope.showDataNode=false;
	$scope.systemIopsR=0;
	$scope.systemIopsW=0;
	$scope.systemIopsAll=0;
	$scope.systemThroughputR="0";
	$scope.systemThroughputW="0";
	$scope.systemThroughputR_item="KB/s"
	$scope.systemThroughputW_item="KB/s"
	$scope.poolLevel="";
	$scope.domainGroups=[{'value':"",'txt': "请选择一个域"}];
	var timer;
	$scope.websocketMessage=function() {
		if($rootScope.Websocket.websocket){
			send("SYSTEM##start");
			$rootScope.Websocket.websocket.onmessage = function(event) {
				$rootScope.Websocket.lastHeartBeat = new Date().getTime();
				var data=JSON.parse(event.data);
				if(data.alertMessage!=null){
					$rootScope.alertComeFlag++;
				}
				if(data.performanceMessage!=null){
					if(data.performanceMessage.counterKey=="SYSTEM_READ_IOPS"){
							$scope.systemIopsR=data.performanceMessage.counterValue;
							$scope.systemIopsAll=$scope.systemIopsR+$scope.systemIopsW;
					}
					if(data.performanceMessage.counterKey=="SYSTEM_WRITE_IOPS"){
							$scope.systemIopsW=data.performanceMessage.counterValue;
					}
					if(data.performanceMessage.counterKey=="SYSTEM_READ_THROUGHPUT"){
						var arr=$scope.changeSpeed(data.performanceMessage.counterValue).split(" ");
						$scope.systemThroughputR=arr[0];
						$scope.systemThroughputR_item=arr[1];
					}
					if(data.performanceMessage.counterKey=="SYSTEM_WRITE_THROUGHPUT"){
						var arr=$scope.changeSpeed(data.performanceMessage.counterValue).split(" ");
						$scope.systemThroughputW=arr[0];
						$scope.systemThroughputW_item=arr[1];
					}
				}
			}; 
		}
	}

	$scope.setDrop=function(flag){
		$http({
			method: "post",
			data:{"drop":flag},
			async:false,
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },  
			url:"setDrop",  
			transformRequest: function(obj) {  
				var str = [];  
				for (var s in obj) {  
					str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));  
				}
				return str.join("&");  
			}
		}).then(function successCallback(data){
			data=data.data;
			switch (data.color) {
				case "Green":
					$rootScope.driverPageLength="10";break;
				case "Red":
					$rootScope.driverPageLength="20";break;
				case "Yellow":
					$rootScope.driverPageLength="50";break;
				case "Grey":
					$rootScope.driverPageLength="5";break;
			}
		});
	}

	$scope.queryState=function(){
		$http({
			method: "post",
			data:{},
			async:false,
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },  
			url:"queryState",  
			transformRequest: function(obj) {  
				var str = [];  
				for (var s in obj) {  
					str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));  
				}
				return str.join("&");  
			}
		}).then(function successCallback(data){
			data=data.data;
			switch (data.color) {
				case "Green":
					$rootScope.driverPageLength="10";break;
				case "Red":
					$rootScope.driverPageLength="20";break;
				case "Yellow":
					$rootScope.driverPageLength="50";break;
				case "Grey":
					$rootScope.driverPageLength="5";break;
			}
		});
	}

	$scope.queryState();	

	$scope.changeSpeed=function(obj){
		var k = 1024;
		if(obj*1==0){
			return 0+ ' ' + 'KB/s';
		}
		var sizes = [ 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		var i = Math.floor(Math.log(obj) / Math.log(k));
		var num = obj / Math.pow(k, i);
		var arr=[];
		if(num*1==parseInt(num)){
			return num+ ' ' + sizes[i]+"/s";
		}else{
			return num.toFixed(1)+ ' ' + sizes[i]+"/s";
		}
	}

	function takeByteNum(num){
		if(num*1>1024){
			return parseFloat(num/1024).toFixed(1)+"T"
		}else{
			return parseFloat(num).toFixed(1)+"G"
		}
	}

	var scale = 1;
	var rich = {
		labelstyle_1: {
			color: "#ffc72b",
			fontSize: 20 * scale,
			align: 'center'
		},
		color1: {
			color: "#6A3C9B",
			align: 'center',
			fontSize: 20 * scale
		},
		color2: {
			color: "#3095FF",
			align: 'center',
			fontSize: 20 * scale
		},
		color3: {
			color: "#FF2073",
			align: 'center',
			fontSize: 20 * scale
		},
		color4: {
			color: "#F49300",
			align: 'center',
			fontSize: 20 * scale
		},
		labelstyle_2: {
			color: '#49dff0',
			fontSize: 16 * scale,
			align: 'center'
		}
	}

	var optionPublic = {
		tooltip: {
		},
		legend: {
			y: 'bottom',
			data:['已使用','未使用','未分配']
		},
		backgroundColor:'#ffffff',
		title: [{
			text: '总容量',
			left: '49%',
			top: '42%',
			textAlign: 'center',
			textBaseline: 'middle',
			textStyle: {
				color: '#313131',
				fontWeight: 'normal',
				fontSize: 16
			}
		},{
			left: '49%',
			top: '54%',
			textAlign: 'center',
			textBaseline: 'middle',
			textStyle: {
				color: '#294087',
				fontWeight: 'normal',
				fontSize: 30
			}
		}],
		series: [{
			 hoverAnimation: false,
			 radius: [75, 104],
			 name: '',
			 type: 'pie',
			 clockwise: true,
			 startAngle: 90,
			 itemStyle: {
				normal: {
					borderWidth: 1,
					borderColor: '#ffffff',
				},
				emphasis: {
					borderWidth: 0,
					shadowBlur: 5,
					shadowOffsetX: 0,
					shadowColor: 'rgba(0, 0, 0, 0.2)'
				}
			},
			label: {
				normal: {
					padding: [0, -15],
					rich: rich
				},
			},
			labelLine: {
				normal: {
					length: 16,
					length2:45,
					length3:40,
					lineStyle: {
						color: '#D0D9E6',
						type:"dashed"
					}
				},
			},
			data: []
		 }]
	 };
	
	$scope.systemCapacityOption = JSON.parse(JSON.stringify(optionPublic));
	$scope.systemCapacityOption.series[0].color=['#FF2073','#F49300','#3095FF']

	var refreshChart=function(){
		$http({
			method: "POST",
			url: "getDashboardInfo",    
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },  
				   transformRequest: function(obj) {  
					var str = [];  
					for (var s in obj) {
					str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));  
				  }  
					return str.join("&");  
			}
		}).then(function successCallback(response){
			if(response.data.resultMessage.message !="success"){
				 if(response.data.resultMessage.message == "ERROR_0019_SessionOut"){
					$scope.logout();
				 }
			}
			if(response.data.dashboardInfo.theUsedUnitSpace!=null && response.data.dashboardInfo.freeSpace != null ){
				var dataCapacity=[{
					value: parseFloat(response.data.dashboardInfo.theUsedUnitSpace).toFixed(1),
					name: '已使用 '+takeByteNum(response.data.dashboardInfo.theUsedUnitSpace)
				},{
					value: parseFloat(response.data.dashboardInfo.theunUsedUnitSpace).toFixed(1),
					name: '未使用 '+takeByteNum(response.data.dashboardInfo.theunUsedUnitSpace)
				},{
					value: parseFloat(response.data.dashboardInfo.freeSpace).toFixed(1),
					name: '未分配 '+takeByteNum(response.data.dashboardInfo.freeSpace)
				}];
				$scope.totalCapacity=takeByteNum(response.data.dashboardInfo.totalCapacity);
				$scope.systemCapacityOption.series[0].data=dataCapacity;
				$scope.systemCapacityOption.series[0].label.normal.formatter=function(params) {
					if(params.dataIndex==0){
						return '{color3|' + params.name.slice(3) + '}\n\n' ;
					}else if(params.dataIndex==1){
						return '{color4|' + params.name.slice(3) + '}\n\n' ;
					}else{
						return '{color2|' + params.name.slice(3) + '}\n\n';
					}
				};
				$scope.systemCapacityOption.series[0].label.normal.rich=rich;
				$scope.systemCapacityOption.legend.data=[
					'已使用 '+takeByteNum(response.data.dashboardInfo.theUsedUnitSpace),
					'未使用 '+takeByteNum(response.data.dashboardInfo.theunUsedUnitSpace),
					'未分配 '+takeByteNum(response.data.dashboardInfo.freeSpace)
				];
				$scope.systemCapacityOption.tooltip.formatter=function(params){
					var percent=((params.value/response.data.dashboardInfo.totalCapacity)*100).toFixed(1);
					var value=takeByteNum(params.value);
					if(response.data.dashboardInfo.totalCapacity==0){
						percent=0
					}
					return params.name +"("+percent+"%)"
				}
				var total=parseFloat(response.data.dashboardInfo.totalCapacity);
				if(total>=1024){
					total=(total/1024).toFixed(1)+"T"
				}else{
					total=total.toFixed(1)+"G"
				}
				$scope.systemCapacityOption.title[1].text=total;
			}
		
			if(response.data.dashboardInfo.serviceHealthy != null){
				$scope.serviceOK = response.data.dashboardInfo.serviceHealthy;
				$scope.serviceINC = response.data.dashboardInfo.serviceSick;
				$scope.serviceFailed = response.data.dashboardInfo.serviceFailed;
				$scope.serviceTotal = response.data.dashboardInfo.serviceTotal;
			}
			
			if(response.data.dashboardInfo.connectedClients != null){
				$scope.clientsTotal = response.data.dashboardInfo.clientTotal;
				$scope.clientsConnected = response.data.dashboardInfo.connectedClients;
				$scope.volumeCountsOK = response.data.dashboardInfo.okCounts;
				$scope.volumeCountsUnavailable = response.data.dashboardInfo.unavailableCounts;
				$scope.volumeTotal = Number(response.data.dashboardInfo.okCounts)+Number(response.data.dashboardInfo.unavailableCounts);
			}

			if(response.data.dashboardInfo.goodDiskCount != null){
				$scope.diskCountsAll = response.data.dashboardInfo.allDiskCount;
				$scope.diskCountsOK = response.data.dashboardInfo.goodDiskCount;
				$scope.diskCountsFailed = response.data.dashboardInfo.badDiskCount;
			}
				
			if(response.data.dashboardInfo .criticalAlertCount != null){
				if(response.data.dashboardInfo.criticalAlertCount>999){
					$(".critical").css("font-size","15px");
				}else if(response.data.dashboardInfo.criticalAlertCount>99){
					$(".critical").css("font-size","20px");
				}else if(response.data.dashboardInfo.criticalAlertCount>9){
					$(".critical").css("font-size","30px");
				}else{
					$(".critical").css("font-size","36px");
				}
				if(response.data.dashboardInfo.majorAlertCount>999){
					$(".major").css("font-size","15px");
				}else if(response.data.dashboardInfo.majorAlertCount>99){
					$(".major").css("font-size","20px");
				}else if(response.data.dashboardInfo.majorAlertCount>9){
					$(".major").css("font-size","30px");
				}else{
					$(".major").css("font-size","36px");
				}
				$rootScope.alarmCritical=response.data.dashboardInfo.criticalAlertCount>999?"999+":response.data.dashboardInfo.criticalAlertCount;

				$rootScope.alarmMajor=response.data.dashboardInfo.majorAlertCount>999?"999+":response.data.dashboardInfo.majorAlertCount;

				$rootScope.alarmMinor=response.data.dashboardInfo.minorAlertCount>999?"999+":response.data.dashboardInfo.minorAlertCount;

				$rootScope.alarmWarning=response.data.dashboardInfo.warningAlertCount>999?"999+":response.data.dashboardInfo.warningAlertCount;

				$rootScope.alarmCleared=response.data.dashboardInfo.clearedAlertCount>999?"999+":response.data.dashboardInfo.clearedAlertCount;
			}

			if(response.data.dashboardInfo.okServerNodeCounts != null){
				$scope.serverOK=response.data.dashboardInfo.okServerNodeCounts;
				$scope.serverUnknown=response.data.dashboardInfo.unknownServerNodeCount;
				$scope.serverAll=response.data.dashboardInfo.totalServerNodeCount;
			}

			if(response.data.dashboardInfo.poolTotal != null){
				$scope.poolTotal=response.data.dashboardInfo.poolTotal;
				$scope.poolHigh=Number(response.data.dashboardInfo.poolHigh);
				$scope.poolMiddle=Number(response.data.dashboardInfo.poolMiddle);
				$scope.poolLow=Number(response.data.dashboardInfo.poolLow);
			}
			
			$timeout.cancel(timer)
			timer=$timeout(refreshChart,3000);
		 },function errorCallback(response){
		})
	};

	$scope.getAllDomainName=function(poolLevel){
		document.getElementById("chooseForm").reset()
		$scope.chooseForm.$setPristine();
		$scope.chooseForm.$setUntouched();
		$scope.poolLevel=poolLevel
		$http({
			method: "post",
			data:{"domainName":""},
			async:false,
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },  
			url:"listDomains",  
			transformRequest: function(obj) {
				var str = [];  
				for (var s in obj) {  
					str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));  
				}
				return str.join("&");  
			}
		}).then(function successCallback(data){
			data=data.data;
			$scope.domainGroups=[{'value':"",'txt': "请选择一个域"}];
			for(var i=0;i<data.domainList.length;i++){
				$scope.domainGroups.push({'value':data.domainList[i].domainId,'txt':data.domainList[i].domainName})
			}
			$(".volumeDomainClass").selectpicker("refresh");
			$('.volumeDomainClass').on('shown.bs.select', function (e) {
				$(".volumeDomainClass").selectpicker("refresh");
			});
		});
	}

	refreshChart();
  
  $scope.$on('$destroy',function(){
		$timeout.cancel(timer)
	}) 

	function fixTwoDecimal(value) {
		return Math.round(value*100)/100;
	}

	$scope.jumpVolume=function(level){

		$state.go('app.storage.volume', {statusLevel:level});
	}

	$scope.jumpService=function(level){

		$state.go('app.system.services', {statusLevel:level});
	}

	$scope.jumpDisk=function(level){

		$state.go('app.hardware.disk', {statusLevel:level});
	}

	$scope.jumpPool=function(level){
		$('.modal-backdrop').remove(); 
		$state.go('app.storage.domain.pool', {domainId : $("#volumeDomain").val(),sel_domainName:$("#volumeDomain").find("option:selected").text(),flag:"1",statusLevel:$scope.poolLevel});
	}

	$scope.jumpAlarm=function(level){
		$state.go('app.monitor.alarm', {alarmLevel:level,acknowledge:"UNCONFIRM"});
	}

	$scope.jumpServer=function(level){
		$state.go('app.hardware.nodeManage', {statusLevel:level});
	}

	$scope.jumpToService=function(level){
		$rootScope.showDataNode=true;
		$state.go('app.system.services', {statusLevel:level});
	}

	$scope.gotoDisk=function(instanceId,name,archiveId){
		$state.go('app.hardware.disk', {datanodeId:instanceId,diskName:name,archiveId:archiveId});
		$("#disk_modal").modal("hide");
	}
  
  $('#choose_domain_modal').on('shown.bs.modal', function () {
    $scope.choose.volumeDomain = ''
  })
}

$(window).resize(function(){
	$(".page-footer").css("width",$(".page-footer").parent().css("width"))
})


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

angular.module('app.auth').controller('AuthCtrl', function (focus, $scope, $http, Session, AUTH_EVENTS, $location, $cookieStore, $rootScope, $log, Language, $translate, translate, $state) {

  focus('username');
  $scope.account = {
    name: '',
    password: ''
  };
  $scope.resultMessage = "";
  $scope.turnCn = function () {
    $rootScope.currentLanguage = {
      "key": "cn",
      "alt": "China",
      "title": "中文"
    };
    $cookieStore.remove("lan");
    $cookieStore.put("lan", $rootScope.currentLanguage);
    $translate.use($rootScope.currentLanguage.key).then(function () {
      $state.reload();
    })
  }

  $scope.turnEn = function () {
    $rootScope.currentLanguage = {
      'alt': "United States", 'key': "us", 'title': "English (US)"
    };
    $cookieStore.remove("lan");
    $cookieStore.put("lan", $rootScope.currentLanguage);
    $translate.use($rootScope.currentLanguage.key).then(function () {
      $state.reload();
    })
  }
  $scope.login = function (account) {
    if (!account.name) {
      $scope.resultMessage = translate.getWord("user.name.tool.tip")
    } else if (!account.password) {
      $scope.resultMessage = translate.getWord("password.tool.tip")
    } else {
      $http({
        method: "POST",
        async: false,
        url: "loginSys",
        data: {
          accountName: account.name,
          password: account.password
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }

      })
        .then(function (response) {
          if (response.data.resultMessage.message == "success") {
            $scope.resultMessage = ""
            Session.create(response.data.account.accountId, response.data.account.accountName, response.data.account.accountType);
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            $scope.setCurrentAccount(response.data.account);
            $rootScope.apis = response.data.apisMap;
            $cookieStore.put('apis', $rootScope.apis);
            // $rootScope.getWebsocketUri();
            $location.path('/');
            $cookieStore.remove("config");
          } else {
            $scope.resultMessage = translate.getWord(response.data.resultMessage.message)
            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
          }

        });
    }

  };

  $scope.clearUserInput = function () {
    $("#username").val("");
    $scope.account.name = "";
  }
})

  .constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  })

  .constant('USER_ROLES', {
    all: '*',
    admin: 'SuperAdmin',
    editor: 'editor',
    guest: 'guest'
  })

  .service('Session', function ($rootScope, $cookieStore) {
    this.create = function (accountId, accountName, accountType) {
      this.accountId = accountId;
      this.accountName = accountName;
      this.accountType = accountType;
      $rootScope.globals = {
        currentAccount: {
          accountId: accountId,
          accountName: accountName,
          accountType: accountType
        }
      };
      $cookieStore.put('globals', $rootScope.globals);
    };
    this.destroy = function () {
      this.accountId = null;
      this.accountName = null;
      this.accountType = null;
      $cookieStore.remove('globals');
    };
    return this;
  })

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

angular.module('app.auth').directive('loginInfo', function(User){

    return {
        restrict: 'A',
        templateUrl: 'app/auth/directives/login-info.tpl.html',
        link: function(scope, element){
            User.initialized.then(function(){
                scope.user = User
            });
        }
    }
})

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

angular.module('app.auth').controller('LoginCtrl', function ($scope, $state, GooglePlus, User, ezfb) {

    $scope.$on('event:google-plus-signin-success', function (event, authResult) {
        if (authResult.status.method == 'PROMPT') {
            GooglePlus.getUser().then(function (user) {
                User.username = user.name;
                User.picture = user.picture;
                $state.go('app.dashboard');
            });
        }
    });

    $scope.$on('event:facebook-signin-success', function (event, authResult) {
        ezfb.api('/me', function (res) {
            User.username = res.name;
            User.picture = 'https://graph.facebook.com/' + res.id + '/picture';
            $state.go('app.dashboard');
        });
    });
})

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
 
angular.module('app').controller("ActivitiesCtrl", function ActivitiesCtrl($scope,translate,$http, $log, activityService,$interval,$rootScope,$location){
	
});

angular.module("app").run(["$templateCache", function($templateCache) {$templateCache.put("app/layout/layout.tpl.html","<!--\r\n  ~ Copyright (c) 2022. PengYunNetWork\r\n  ~\r\n  ~ This program is free software: you can use, redistribute, and/or modify it\r\n  ~ under the terms of the GNU Affero General Public License, version 3 or later (\"AGPL\"),\r\n  ~ as published by the Free Software Foundation.\r\n  ~\r\n  ~ This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;\r\n  ~  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\r\n  ~\r\n  ~  You should have received a copy of the GNU Affero General Public License along with\r\n  ~  this program. If not, see <http://www.gnu.org/licenses/>.\r\n  -->\r\n\r\n<div data-smart-include=\"app/layout/partials/header.tpl.html\" class=\"placeholder-header\"></div>\r\n\r\n<div data-smart-include=\"app/layout/partials/navigation.tpl.html\" class=\"placeholder-left-panel\"></div>\r\n\r\n<div id=\"main\" role=\"main\">\r\n	<mask>\r\n		<div class=\"loader\">\r\n			<div class=\"loader-inner ball-pulse\">\r\n				<div></div>\r\n				<div></div>\r\n				<div></div>\r\n			</div>\r\n		</div>\r\n	</mask>\r\n	<demo-states></demo-states>\r\n	<div id=\"ribbon\" >\r\n    <span class=\"ribbon-button-alignment\">\r\n      <span id=\"refresh\" class=\"btn btn-ribbon\" reset-widgets\r\n          tooltip-placement=\"bottom\"\r\n          smart-tooltip-html=\"<i class=\'text-warning fa fa-warning\'></i> Warning! This will reset all your widget settings.\">\r\n        <i class=\"fa fa-refresh\"></i>\r\n      </span>\r\n    </span>\r\n		<state-breadcrumbs></state-breadcrumbs>\r\n	</div>\r\n	<div data-smart-router-animation-wrap=\"content content@app\" data-wrap-for=\"#content\">\r\n		<div data-ui-view=\"content\" data-autoscroll=\"false\"></div>\r\n	</div>\r\n</div>\r\n\r\n<div data-smart-include=\"app/layout/partials/footer.tpl.html\"></div>\r\n");
$templateCache.put("app/auth/directives/login-info.tpl.html","<!--\r\n  ~ Copyright (c) 2022. PengYunNetWork\r\n  ~\r\n  ~ This program is free software: you can use, redistribute, and/or modify it\r\n  ~ under the terms of the GNU Affero General Public License, version 3 or later (\"AGPL\"),\r\n  ~ as published by the Free Software Foundation.\r\n  ~\r\n  ~ This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;\r\n  ~  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\r\n  ~\r\n  ~  You should have received a copy of the GNU Affero General Public License along with\r\n  ~  this program. If not, see <http://www.gnu.org/licenses/>.\r\n  -->\r\n\r\n<div class=\"login-info ng-cloak\">\r\n    <span> <!-- User image size is adjusted inside CSS, it should stay as it -->\r\n        <a  href=\"\" toggle-shortcut>\r\n            <img ng-src=\"{{user.picture}}\" alt=\"me\" class=\"online\">\r\n                <span>{{user.username}}\r\n                </span>\r\n            <i class=\"fa fa-angle-down\"></i>\r\n        </a>\r\n     </span>\r\n</div>");
$templateCache.put("app/dashboard/views/live-feeds.tpl.html","<!--\r\n  ~ Copyright (c) 2022. PengYunNetWork\r\n  ~\r\n  ~ This program is free software: you can use, redistribute, and/or modify it\r\n  ~ under the terms of the GNU Affero General Public License, version 3 or later (\"AGPL\"),\r\n  ~ as published by the Free Software Foundation.\r\n  ~\r\n  ~ This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;\r\n  ~  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\r\n  ~\r\n  ~  You should have received a copy of the GNU Affero General Public License along with\r\n  ~  this program. If not, see <http://www.gnu.org/licenses/>.\r\n  -->\r\n\r\n<div jarvis-widget id=\"live-feeds-widget\" data-widget-editbutton=\"false\" data-widget-colorbutton=\"false\" data-widget-togglebutton=\"false\" data-widget-fullscreenbutton=\"false\" data-widget-deletebutton=\"false\" >\r\n<header>\r\n    <span class=\"widget-icon\"> <i class=\"glyphicon glyphicon-stats txt-color-darken\"></i> </span>\r\n\r\n    <h2>性能数据</h2>\r\n\r\n    <ul class=\"nav nav-tabs pull-right in\" id=\"serverTab\">\r\n        <li class=\"active\">\r\n            <a data-toggle=\"tab\" href=\"#s1\"><i class=\"fa fa-cog\"></i> <span class=\"hidden-mobile hidden-tablet\">系统</span></a>\r\n        </li>\r\n\r\n        <li>\r\n            <a data-toggle=\"tab\" href=\"#s2\"><i class=\"fa fa-database\"></i> <span class=\"hidden-mobile hidden-tablet\">卷</span></a>\r\n        </li>\r\n\r\n        <li>\r\n            <a data-toggle=\"tab\" href=\"#s3\"><i class=\"fa fa-wrench\"></i> <span class=\"hidden-mobile hidden-tablet\">机器</span></a>\r\n        </li>\r\n    </ul>\r\n\r\n</header>\r\n\r\n<!-- widget div-->\r\n<div class=\"no-padding\">\r\n\r\n    <div class=\"widget-body\">\r\n        <!-- content -->\r\n        <div id=\"myTabContent\" class=\"tab-content\">\r\n            <div class=\"tab-pane fade active in padding-10 no-padding-bottom\" id=\"s1\">\r\n                <div class=\"row\">\r\n                    \r\n                    <div class=\"col-sm-6 col-lg-6\">\r\n\r\n                        <!-- your contents here -->\r\n                        <div class=\"panel panel-default\">\r\n                            <div class=\"panel-body status\">\r\n                                <div class=\"who clearfix\">\r\n                                    <span class=\"name\"><b>Karrigan Mean</b> shared a photo</span>\r\n                                </div>\r\n                                \r\n                                <e-chart  option=\"systemCapacityTrendencyOption\"></e-chart> \r\n                            </div>\r\n                        </div>\r\n                    </div>   \r\n\r\n                </div>\r\n\r\n            </div>\r\n            <!-- end s1 tab pane -->\r\n\r\n            <div class=\"tab-pane fade\" id=\"s2\">\r\n\r\n\r\n            </div>\r\n            <!-- end s2 tab pane -->\r\n\r\n            <div class=\"tab-pane fade\" id=\"s3\">\r\n\r\n\r\n            </div>\r\n            <!-- end s3 tab pane -->\r\n        </div>\r\n\r\n        <!-- end content -->\r\n    </div>\r\n\r\n</div>\r\n<!-- end widget div -->\r\n</div>\r\n");
$templateCache.put("app/layout/language/language-selector.tpl.html","<!--\r\n  ~ Copyright (c) 2022. PengYunNetWork\r\n  ~\r\n  ~ This program is free software: you can use, redistribute, and/or modify it\r\n  ~ under the terms of the GNU Affero General Public License, version 3 or later (\"AGPL\"),\r\n  ~ as published by the Free Software Foundation.\r\n  ~\r\n  ~ This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;\r\n  ~  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\r\n  ~\r\n  ~  You should have received a copy of the GNU Affero General Public License along with\r\n  ~  this program. If not, see <http://www.gnu.org/licenses/>.\r\n  -->\r\n\r\n<ul class=\"header-dropdown-list hidden-xs ng-cloak\" ng-controller=\"LanguagesCtrl\">\r\n    <li class=\"dropdown\" dropdown>\r\n        <a class=\"dropdown-toggle\"  data-toggle=\"dropdown\" href> <img src=\"styles/img/blank.gif\" class=\"flag flag-{{currentLanguage.key}}\" alt=\"{{currentLanguage.alt}}\"> <span> {{currentLanguage.title}} </span>\r\n            <i class=\"fa fa-angle-down\"></i> </a>\r\n        <ul class=\"dropdown-menu pull-right\">\r\n            <li ng-class=\"{active: language.key==currentLanguage.key}\" ng-repeat=\"language in languages\">\r\n                <a ng-click=\"selectLanguage(language)\" ><img src=\"styles/img/blank.gif\" class=\"flag flag-{{language.key}}\"\r\n                                                   alt=\"{{language.alt}}\"> {{language.title}}</a>\r\n            </li>\r\n        </ul>\r\n    </li>\r\n</ul>");
$templateCache.put("app/layout/partials/footer.tpl.html","<!--\r\n  ~ Copyright (c) 2022. PengYunNetWork\r\n  ~\r\n  ~ This program is free software: you can use, redistribute, and/or modify it\r\n  ~ under the terms of the GNU Affero General Public License, version 3 or later (\"AGPL\"),\r\n  ~ as published by the Free Software Foundation.\r\n  ~\r\n  ~ This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;\r\n  ~  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\r\n  ~\r\n  ~  You should have received a copy of the GNU Affero General Public License along with\r\n  ~  this program. If not, see <http://www.gnu.org/licenses/>.\r\n  -->\r\n\r\n<div class=\"page-footer\" ng-controller=\"footCtrl\">\r\n  <div class=\"row\">\r\n    <div class=\"col-xs-12 col-sm-6\">\r\n    </div>\r\n  </div>\r\n  <div style=\"display:none\">\r\n    <alert-message level=level message=message show=show class=\"col-xs-8 col-sm-5 col-md-5 col-lg-3\"></alert-message>\r\n  </div><!-- 有用别删除 -->\r\n\r\n\r\n  <div class=\"modal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myLargeModalLabel\" id=\"version_modal\">\r\n    <div class=\"modal-dialog\">\r\n      <div class=\"modal-content\">\r\n        <div class=\"modal-header\">\r\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\">\r\n            <span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span>\r\n          </button>\r\n          <h4 class=\"modal-title\">当前版本</h4>\r\n        </div>\r\n        <div class=\"modal-body\">\r\n          <form class=\"form-horizontal\" role=\"form\" novalidate>\r\n            <div class=\"form-group\">\r\n              <div class=\"col-sm-3 col-sm-offset-4 control-label\">\r\n                <img src=\"styles/img/logo_version.png\" alt=\"Zhi Zhen\" style=\"width:135px\">\r\n              </div>\r\n            </div>\r\n            <div class=\"form-group\">\r\n              <label class=\"col-sm-3 col-sm-offset-1 control-label\">软件名称</label>\r\n              <div class=\"col-sm-8\" style=\"padding-top:7px\">\r\n                <span>{{name}}</span>\r\n              </div>\r\n            </div>\r\n            <div class=\"form-group\">\r\n              <label class=\"col-sm-3 col-sm-offset-1 control-label\">当前版本</label>\r\n              <div class=\"col-sm-8\" style=\"padding-top:7px\">\r\n                <span>{{version}}</span>\r\n              </div>\r\n            </div>\r\n            <!--    <div class=\"form-group\">\r\n						   <label  class=\"col-sm-3 col-sm-offset-1 control-label\">时间</label>\r\n						   <div class=\"col-sm-8\" style=\"padding-top:7px\">\r\n							   <span>{{time}}</span>\r\n						   </div>\r\n					   </div> -->\r\n            <div class=\"form-group\">\r\n              <label class=\"col-sm-3 col-sm-offset-1 control-label\">公司名称</label>\r\n              <div class=\"col-sm-8\" style=\"padding-top:7px\">\r\n                <span>{{corporation}}</span>\r\n              </div>\r\n            </div>\r\n            <div class=\"form-group\" style=\"display: none;\">\r\n              <label class=\"col-sm-3 col-sm-offset-1 control-label\">邮箱</label>\r\n              <div class=\"col-sm-8\" style=\"padding-top:7px\">\r\n                <span>{{email}}</span>\r\n              </div>\r\n            </div>\r\n\r\n            <div class=\"form-group\" style=\"display: none;\">\r\n              <label class=\"col-sm-3 col-sm-offset-1 control-label\">电话</label>\r\n              <div class=\"col-sm-8\" style=\"padding-top:7px\">\r\n                <span>{{tel}}</span>\r\n              </div>\r\n            </div>\r\n\r\n            <div class=\"form-group\" ng-show=\"fixBug\" style=\"display: none\">\r\n              <label class=\"col-sm-3 col-sm-offset-1 control-label\">修复问题\r\n\r\n              </label>\r\n              <div class=\"col-sm-8\" style=\"padding-top:7px;color:#337AB7\">\r\n                <span ng-click=\"expand(\'fix\')\" style=\"cursor: pointer;\">展开</span>\r\n                <span class=\"glyphicon glyphicon-chevron-down fixSpan\" style=\"cursor: pointer;\" aria-hidden=\"true\"\r\n                  ng-click=\"expand(\'fix\')\"></span>\r\n              </div>\r\n              <div class=\"fixList col-sm-8 col-sm-offset-4\" ng-show=\"fixDiv\">\r\n\r\n              </div>\r\n            </div>\r\n            <div class=\"form-group\" ng-show=\"newIsu\" style=\"display: none\">\r\n              <label class=\"col-sm-3 col-sm-offset-1 control-label\">新增功能\r\n\r\n              </label>\r\n              <div class=\"col-sm-8\" style=\"padding-top:7px;color:#337AB7\">\r\n                <span ng-click=\"expand(\'new\')\" style=\"cursor: pointer;\">展开</span>\r\n                <span class=\"glyphicon glyphicon-chevron-down newSpan\" style=\"cursor: pointer;\" aria-hidden=\"true\"\r\n                  ng-click=\"expand(\'new\')\"></span>\r\n              </div>\r\n              <div class=\"newList col-sm-8 col-sm-offset-4\" ng-show=\"newDiv\">\r\n\r\n              </div>\r\n            </div>\r\n\r\n          </form>\r\n\r\n\r\n        </div>\r\n        <div class=\"modal-footer\">\r\n          <button type=\"button\" class=\"btn btn_lightblue\" data-dismiss=\"modal\">确定</button>\r\n        </div>\r\n\r\n      </div>\r\n    </div>\r\n  </div>\r\n\r\n\r\n  <!--  begin update pwd modal -->\r\n  <div class=\"modal\" tabindex=\"-1\" id=\"update_pwd_modal\" role=\"dialog\" aria-labelledby=\"myLargeModalLabel\">\r\n    <div class=\"modal-dialog\">\r\n      <div class=\"modal-content\">\r\n        <div class=\"modal-header\">\r\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" ng-click=\"resetUpdate()\">\r\n            <span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span>\r\n          </button>\r\n          <h4 class=\"modal-title\">修改密码</h4>\r\n        </div>\r\n        <div class=\"modal-body\">\r\n          <form class=\"form-horizontal\" role=\"form\" name=\"updateForm\" id=\"updateForm\" novalidate>\r\n            <div class=\"form-group\"\r\n              ng-class=\"{\'has-error\':updateForm.oldPassword.$invalid &&updateForm.oldPassword.$touched}\">\r\n              <label for=\"oldPassword\" class=\"col-sm-3 control-label\">旧密码<span class=\"required\" aria-required=\"true\">*\r\n                </span></label>\r\n              <div class=\"col-sm-7\">\r\n                <input type=\"password\" class=\"form-control\" name=\"oldPassword\" placeholder=\"旧密码\" ng-minlength=\"2\"\r\n                  ng-maxlength=\"64\" required ng-model=\"oldPwd\">\r\n                <span ng-show=\"updateForm.oldPassword.$error.minlength&& updateForm.oldPassword.$touched\"\r\n                  class=\"help-block\"><i class=\"fa fa-exclamation-circle\"></i> 至少两个字符</span>\r\n                <span ng-show=\"updateForm.oldPassword.$error.maxlength&& updateForm.oldPassword.$touched\"\r\n                  class=\"help-block\"><i class=\"fa fa-exclamation-circle\"></i> 至多十六个字符</span>\r\n              </div>\r\n            </div>\r\n            <div class=\"form-group\" ng-class=\"{\'has-error\':updateForm.newPwd.$invalid &&updateForm.newPwd.$touched}\">\r\n              <label class=\"col-sm-3 control-label\">新密码<span class=\"required\" aria-required=\"true\">* </span></label>\r\n              <div class=\"col-sm-7\">\r\n                <input type=\"password\" class=\"form-control\" name=\"newPwd\" placeholder=\"新密码\" required ng-minlength=\"2\"\r\n                  ng-maxlength=\"64\" ng-model=\"newPwd\">\r\n\r\n                <span ng-show=\"updateForm.newPwd.$error.minlength&& updateForm.newPwd.$touched\" class=\"help-block\"><i\r\n                    class=\"fa fa-exclamation-circle\"></i> 至少两个字符</span>\r\n                <span ng-show=\"updateForm.newPwd.$error.maxlength&& updateForm.newPwd.$touched\" class=\"help-block\"><i\r\n                    class=\"fa fa-exclamation-circle\"></i> 至多十六个字符</span>\r\n              </div>\r\n            </div>\r\n            <div class=\"form-group\"\r\n              ng-class=\"{\'has-error\':updateForm.reNewPassword.$invalid && !updateForm.reNewPassword.$pristine&&updateForm.reNewPassword.$touched}\">\r\n              <label for=\"reNewPassword\" class=\"col-sm-3 control-label\">确认密码<span class=\"required\"\r\n                  aria-required=\"true\">* </span></label>\r\n              <div class=\"col-sm-7\">\r\n                <input type=\"password\" class=\"form-control\" name=\"reNewPassword\" placeholder=\"确认密码\"\r\n                  ng-model=\"reNewPassword\" compare=\"newPwd\">\r\n                <span\r\n                  ng-show=\"updateForm.reNewPassword.$error.compare &&updateForm.reNewPassword.$dirty&&updateForm.reNewPassword.$touched\"\r\n                  class=\"help-block\"><i class=\"fa fa-exclamation-circle\"></i> 两次密码输入不一致</span>\r\n              </div>\r\n            </div>\r\n          </form>\r\n        </div>\r\n        <div class=\"modal-footer\">\r\n          <button type=\"button\" class=\"btn btn_blue\" ng-disabled=\"updateForm.$invalid\" ng-click=\"updatePwd()\"\r\n            data-dismiss=\"modal\">修改</button>\r\n          <button type=\"button\" class=\"btn btn_default\" data-dismiss=\"modal\" ng-click=\"resetUpdate()\">取消</button>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n\r\n  <!-- end update pwd modal-->\r\n</div>\r\n");
$templateCache.put("app/layout/partials/header.tpl.html","<!--\r\n  ~ Copyright (c) 2022. PengYunNetWork\r\n  ~\r\n  ~ This program is free software: you can use, redistribute, and/or modify it\r\n  ~ under the terms of the GNU Affero General Public License, version 3 or later (\"AGPL\"),\r\n  ~ as published by the Free Software Foundation.\r\n  ~\r\n  ~ This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;\r\n  ~  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\r\n  ~\r\n  ~  You should have received a copy of the GNU Affero General Public License along with\r\n  ~  this program. If not, see <http://www.gnu.org/licenses/>.\r\n  -->\r\n\r\n<header id=\"header\" style=\"height:50px;background:#F0F7FF\">\r\n	<div id=\"logo-group\" class=\"logo_cut_off\" ng-controller=\"messagesCtrl\">\r\n		<span id=\"logo\">\r\n      <img src=\"styles/img/logo_big.png\" alt=\"\">\r\n    </span>\r\n	</div>\r\n	<div class=\"pull-right\" id=\"header-info\" style=\"margin-right:11px\">\r\n		<ul>\r\n			<li title=\"登出\"><div class=\"header-img shut-down\" ng-click=\"logout()\"></div></li>\r\n			<li ng-click=\"versionInfo()\" title=\"帮助\"><div class=\"header-img view_version\" ></div></li>\r\n			<li full-screen title=\"全屏\" ng-click=\"changeStatus()\">\r\n        <div class=\"header-img fullscreen\"></div>\r\n      </li>\r\n			<li>\r\n				<div class=\"dropdown\">\r\n					<div id=\"login-user\" class=\"dropdown-toggle\" data-toggle=\"dropdown\" data-hover=\"dropdown\">\r\n						<span title=\"\" id=\"currentAccountName\"></span>\r\n					</div>\r\n					<ul class=\"dropdown-menu pull-right\" id=\"dropdown-pop\" style=\"margin-top:10px;\">\r\n						<li class=\"user-drop-li\">\r\n							<a data-toggle=\"modal\"  data-target=\"#update_pwd_modal\" data-action=\"userLogout\" style=\"margin-top:10px;font-size:12px;padding:0px;\">修改密码</a>\r\n						</li>\r\n						<li class=\"divider\"></li>\r\n						<li class=\"user-drop-li\" >\r\n							<a href=\"javascript:void(0)\" ng-click=\"logout()\"  data-action=\"userLogout\" style=\"margin-bottom:10px;font-size:12px;padding:0px\">用户登出</a>\r\n						</li>\r\n					</ul>\r\n				</div>\r\n			</li>\r\n		</ul>\r\n	</div>\r\n  <div class=\"pull-left\" id=\"header-info\">\r\n		<ul>\r\n      <li style=\"margin-left: 10px\" toggle-menu title=\"折叠菜单\"><div class=\"header-img hide-menu\" ></div></li>\r\n    </ul>\r\n  </div>\r\n</header>");
$templateCache.put("app/layout/partials/navigation.tpl.html","<!--\r\n  ~ Copyright (c) 2022. PengYunNetWork\r\n  ~\r\n  ~ This program is free software: you can use, redistribute, and/or modify it\r\n  ~ under the terms of the GNU Affero General Public License, version 3 or later (\"AGPL\"),\r\n  ~ as published by the Free Software Foundation.\r\n  ~\r\n  ~ This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;\r\n  ~  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\r\n  ~\r\n  ~  You should have received a copy of the GNU Affero General Public License along with\r\n  ~  this program. If not, see <http://www.gnu.org/licenses/>.\r\n  -->\r\n\r\n<aside id=\"left-panel\">\r\n  <nav style=\"overflow: hidden\">\r\n    <ul data-smart-menu>\r\n      <li data-ui-sref-active=\"active\">\r\n        <a data-ui-sref=\"app.dashboard\" title=\"dashboard\">\r\n          <i class=\"sidebar_icon dashboard\"></i\r\n          ><span class=\"menu-item-parent\"> Dashboard</span>\r\n        </a>\r\n      </li>\r\n      <li data-menu-collapse class=\"top-menu-invisible\">\r\n        <a href=\"#\" title=\"存储\">\r\n          <i class=\"sidebar_icon storage\"></i\r\n          ><span class=\"menu-item-parent\">存储</span>\r\n        </a>\r\n        <ul>\r\n          <li data-ui-sref-active=\"active\">\r\n            <a class=\"nav_items\" data-ui-sref=\"app.storage.domain\"\r\n              >域 & 存储池</a\r\n            >\r\n          </li>\r\n          <li data-ui-sref-active=\"active\">\r\n            <a class=\"nav_items\" data-ui-sref=\"app.storage.volume\"> 卷</a>\r\n          </li>\r\n          <li data-ui-sref-active=\"active\">\r\n            <a class=\"nav_items\" data-ui-sref=\"app.storage.allDriver\">驱动</a>\r\n          </li>\r\n          <li data-ui-sref-active=\"active\">\r\n            <a class=\"nav_items\" data-ui-sref=\"app.storage.accessRule\"\r\n              >访问控制</a\r\n            >\r\n          </li>\r\n          <li data-ui-sref-active=\"active\">\r\n            <a class=\"nav_items\" data-ui-sref=\"app.storage.qos\">QoS策略</a>\r\n          </li>\r\n        </ul>\r\n      </li>\r\n      <li data-menu-collapse>\r\n        <a href=\"#\" title=\"硬件\">\r\n          <i class=\"sidebar_icon hardware\"></i\r\n          ><span class=\"menu-item-parent\">硬件</span>\r\n        </a>\r\n        <ul>\r\n          <li data-ui-sref-active=\"active\">\r\n            <a class=\"nav_items\" data-ui-sref=\"app.hardware.disk\">存储磁盘</a>\r\n          </li>\r\n        </ul>\r\n      </li>\r\n      <li data-menu-collapse>\r\n        <a href=\"#\" title=\"系统\">\r\n          <i class=\"sidebar_icon system\"></i\r\n          ><span class=\"menu-item-parent\">系统</span>\r\n        </a>\r\n        <ul>\r\n          <li data-ui-sref-active=\"active\">\r\n            <a class=\"nav_items\" data-ui-sref=\"app.system.services\">服务</a>\r\n          </li>\r\n          <li data-ui-sref-active=\"active\">\r\n            <a class=\"nav_items\" data-ui-sref=\"app.system.component\">组件</a>\r\n          </li>\r\n          <li data-ui-sref-active=\"active\">\r\n            <a class=\"nav_items\" data-ui-sref=\"app.system.operationLog\"\r\n              >操作日志</a\r\n            >\r\n          </li>\r\n        </ul>\r\n      </li>\r\n      <li\r\n        data-menu-collapse\r\n        ng-show=\"apis.Role.createRole||apis.Role.deleteRoles||apis.Role.updateRole||apis.Role.createRole||apis.Account.createAccount||apis.Account.assignResources||apis.Account.assignRoles||apis.Account.deleteAccounts||apis.Account.resetAccountPassword\"\r\n      >\r\n        <a href=\"#\" title=\"用户\">\r\n          <i class=\"sidebar_icon user\"></i\r\n          ><span class=\"menu-item-parent\">用户</span>\r\n        </a>\r\n        <ul>\r\n          <li\r\n            data-ui-sref-active=\"active\"\r\n            ng-show=\"apis.Role.createRole||apis.Role.deleteRoles||apis.Role.updateRole||apis.Role.createRole\"\r\n          >\r\n            <a class=\"nav_items\" data-ui-sref=\"app.user.roles\">角色</a>\r\n          </li>\r\n          <li\r\n            data-ui-sref-active=\"active\"\r\n            ng-show=\"apis.Account.createAccount||apis.Account.assignResources||apis.Account.assignRoles||apis.Account.deleteAccounts||apis.Account.resetAccountPassword\"\r\n          >\r\n            <a class=\"nav_items\" data-ui-sref=\"app.user.users\">用户</a>\r\n          </li>\r\n        </ul>\r\n      </li>\r\n    </ul>\r\n  </nav>\r\n\r\n  <span class=\"minifyme\" data-action=\"minifyMenu\" minify-menu>\r\n    <i class=\"fa fa-arrow-circle-left hit\"></i>\r\n  </span>\r\n</aside>\r\n");
$templateCache.put("app/layout/shortcut/shortcut.tpl.html","<!--\r\n  ~ Copyright (c) 2022. PengYunNetWork\r\n  ~\r\n  ~ This program is free software: you can use, redistribute, and/or modify it\r\n  ~ under the terms of the GNU Affero General Public License, version 3 or later (\"AGPL\"),\r\n  ~ as published by the Free Software Foundation.\r\n  ~\r\n  ~ This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;\r\n  ~  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\r\n  ~\r\n  ~  You should have received a copy of the GNU Affero General Public License along with\r\n  ~  this program. If not, see <http://www.gnu.org/licenses/>.\r\n  -->\r\n\r\n<div id=\"shortcut\">\r\n	<ul>\r\n		<li>\r\n			<a href=\"#/inbox/\" class=\"jarvismetro-tile big-cubes bg-color-blue\"> <span class=\"iconbox\"> <i class=\"fa fa-envelope fa-4x\"></i> <span>Mail <span class=\"label pull-right bg-color-darken\">14</span></span> </span> </a>\r\n		</li>\r\n		<li>\r\n			<a href=\"#/calendar\" class=\"jarvismetro-tile big-cubes bg-color-orangeDark\"> <span class=\"iconbox\"> <i class=\"fa fa-calendar fa-4x\"></i> <span>Calendar</span> </span> </a>\r\n		</li>\r\n		<li>\r\n			<a href=\"#/maps\" class=\"jarvismetro-tile big-cubes bg-color-purple\"> <span class=\"iconbox\"> <i class=\"fa fa-map-marker fa-4x\"></i> <span>Maps</span> </span> </a>\r\n		</li>\r\n		<li>\r\n			<a href=\"#/invoice\" class=\"jarvismetro-tile big-cubes bg-color-blueDark\"> <span class=\"iconbox\"> <i class=\"fa fa-book fa-4x\"></i> <span>Invoice <span class=\"label pull-right bg-color-darken\">99</span></span> </span> </a>\r\n		</li>\r\n		<li>\r\n			<a href=\"#/gallery\" class=\"jarvismetro-tile big-cubes bg-color-greenLight\"> <span class=\"iconbox\"> <i class=\"fa fa-picture-o fa-4x\"></i> <span>Gallery </span> </span> </a>\r\n		</li>\r\n		<li>\r\n			<a href=\"#/profile\" class=\"jarvismetro-tile big-cubes selected bg-color-pinkDark\"> <span class=\"iconbox\"> <i class=\"fa fa-user fa-4x\"></i> <span>My Profile </span> </span> </a>\r\n		</li>\r\n	</ul>\r\n</div>");
$templateCache.put("app/dashboard/chat/directives/aside-chat-widget.tpl.html","<!--\r\n  ~ Copyright (c) 2022. PengYunNetWork\r\n  ~\r\n  ~ This program is free software: you can use, redistribute, and/or modify it\r\n  ~ under the terms of the GNU Affero General Public License, version 3 or later (\"AGPL\"),\r\n  ~ as published by the Free Software Foundation.\r\n  ~\r\n  ~ This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;\r\n  ~  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\r\n  ~\r\n  ~  You should have received a copy of the GNU Affero General Public License along with\r\n  ~  this program. If not, see <http://www.gnu.org/licenses/>.\r\n  -->\r\n\r\n<ul>\r\n    <li>\r\n        <div class=\"display-users\">\r\n            <input class=\"form-control chat-user-filter\" placeholder=\"Filter\" type=\"text\">\r\n            <dl>\r\n                <dt>\r\n                    <a href=\"#\" class=\"usr\"\r\n                       data-chat-id=\"cha1\"\r\n                       data-chat-fname=\"Sadi\"\r\n                       data-chat-lname=\"Orlaf\"\r\n                       data-chat-status=\"busy\"\r\n                       data-chat-alertmsg=\"Sadi Orlaf is in a meeting. Please do not disturb!\"\r\n                       data-chat-alertshow=\"true\"\r\n                       popover-trigger=\"hover\"\r\n                       popover-placement=\"right\"\r\n                       smart-popover-html=\"\r\n										<div class=\'usr-card\'>\r\n											<img src=\'styles/img/avatars/5.png\' alt=\'Sadi Orlaf\'>\r\n											<div class=\'usr-card-content\'>\r\n												<h3>Sadi Orlaf</h3>\r\n												<p>Marketing Executive</p>\r\n											</div>\r\n										</div>\r\n									\">\r\n                        <i></i>Sadi Orlaf\r\n                    </a>\r\n                </dt>\r\n                <dt>\r\n                    <a href=\"#\" class=\"usr\"\r\n                       data-chat-id=\"cha2\"\r\n                       data-chat-fname=\"Jessica\"\r\n                       data-chat-lname=\"Dolof\"\r\n                       data-chat-status=\"online\"\r\n                       data-chat-alertmsg=\"\"\r\n                       data-chat-alertshow=\"false\"\r\n                       popover-trigger=\"hover\"\r\n                       popover-placement=\"right\"\r\n                       smart-popover-html=\"\r\n										<div class=\'usr-card\'>\r\n											<img src=\'styles/img/avatars/1.png\' alt=\'Jessica Dolof\'>\r\n											<div class=\'usr-card-content\'>\r\n												<h3>Jessica Dolof</h3>\r\n												<p>Sales Administrator</p>\r\n											</div>\r\n										</div>\r\n									\">\r\n                        <i></i>Jessica Dolof\r\n                    </a>\r\n                </dt>\r\n                <dt>\r\n                    <a href=\"#\" class=\"usr\"\r\n                       data-chat-id=\"cha3\"\r\n                       data-chat-fname=\"Zekarburg\"\r\n                       data-chat-lname=\"Almandalie\"\r\n                       data-chat-status=\"online\"\r\n                       popover-trigger=\"hover\"\r\n                       popover-placement=\"right\"\r\n                       smart-popover-html=\"\r\n										<div class=\'usr-card\'>\r\n											<img src=\'styles/img/avatars/3.png\' alt=\'Zekarburg Almandalie\'>\r\n											<div class=\'usr-card-content\'>\r\n												<h3>Zekarburg Almandalie</h3>\r\n												<p>Sales Admin</p>\r\n											</div>\r\n										</div>\r\n									\">\r\n                        <i></i>Zekarburg Almandalie\r\n                    </a>\r\n                </dt>\r\n                <dt>\r\n                    <a href=\"#\" class=\"usr\"\r\n                       data-chat-id=\"cha4\"\r\n                       data-chat-fname=\"Barley\"\r\n                       data-chat-lname=\"Krazurkth\"\r\n                       data-chat-status=\"away\"\r\n                       popover-trigger=\"hover\"\r\n                       popover-placement=\"right\"\r\n                       smart-popover-html=\"\r\n										<div class=\'usr-card\'>\r\n											<img src=\'styles/img/avatars/4.png\' alt=\'Barley Krazurkth\'>\r\n											<div class=\'usr-card-content\'>\r\n												<h3>Barley Krazurkth</h3>\r\n												<p>Sales Director</p>\r\n											</div>\r\n										</div>\r\n									\">\r\n                        <i></i>Barley Krazurkth\r\n                    </a>\r\n                </dt>\r\n                <dt>\r\n                    <a href=\"#\" class=\"usr offline\"\r\n                       data-chat-id=\"cha5\"\r\n                       data-chat-fname=\"Farhana\"\r\n                       data-chat-lname=\"Amrin\"\r\n                       data-chat-status=\"incognito\"\r\n                       popover-trigger=\"hover\"\r\n                       popover-placement=\"right\"\r\n                       smart-popover-html=\"\r\n										<div class=\'usr-card\'>\r\n											<img src=\'styles/img/avatars/female.png\' alt=\'Farhana Amrin\'>\r\n											<div class=\'usr-card-content\'>\r\n												<h3>Farhana Amrin</h3>\r\n												<p>Support Admin <small><i class=\'fa fa-music\'></i> Playing Beethoven Classics</small></p>\r\n											</div>\r\n										</div>\r\n									\">\r\n                        <i></i>Farhana Amrin (offline)\r\n                    </a>\r\n                </dt>\r\n                <dt>\r\n                    <a href=\"#\" class=\"usr offline\"\r\n                       data-chat-id=\"cha6\"\r\n                       data-chat-fname=\"Lezley\"\r\n                       data-chat-lname=\"Jacob\"\r\n                       data-chat-status=\"incognito\"\r\n                       popover-trigger=\"hover\"\r\n                       popover-placement=\"right\"\r\n                       smart-popover-html=\"\r\n										<div class=\'usr-card\'>\r\n											<img src=\'styles/img/avatars/male.png\' alt=\'Lezley Jacob\'>\r\n											<div class=\'usr-card-content\'>\r\n												<h3>Lezley Jacob</h3>\r\n												<p>Sales Director</p>\r\n											</div>\r\n										</div>\r\n									\">\r\n                        <i></i>Lezley Jacob (offline)\r\n                    </a>\r\n                </dt>\r\n            </dl>\r\n\r\n\r\n            <!--<a href=\"chat.html\" class=\"btn btn-xs btn-default btn-block sa-chat-learnmore-btn\">About the API</a>-->\r\n        </div>\r\n    </li>\r\n</ul>");
$templateCache.put("app/dashboard/chat/directives/chat-users.tpl.html","<!--\r\n  ~ Copyright (c) 2022. PengYunNetWork\r\n  ~\r\n  ~ This program is free software: you can use, redistribute, and/or modify it\r\n  ~ under the terms of the GNU Affero General Public License, version 3 or later (\"AGPL\"),\r\n  ~ as published by the Free Software Foundation.\r\n  ~\r\n  ~ This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;\r\n  ~  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\r\n  ~\r\n  ~  You should have received a copy of the GNU Affero General Public License along with\r\n  ~  this program. If not, see <http://www.gnu.org/licenses/>.\r\n  -->\r\n\r\n<div id=\"chat-container\" ng-class=\"{open: open}\">\r\n    <span class=\"chat-list-open-close\" ng-click=\"openToggle()\"><i class=\"fa fa-user\"></i><b>!</b></span>\r\n\r\n    <div class=\"chat-list-body custom-scroll\">\r\n        <ul id=\"chat-users\">\r\n            <li ng-repeat=\"chatUser in chatUsers | filter: chatUserFilter\">\r\n                <a ng-click=\"messageTo(chatUser)\"><img ng-src=\"{{chatUser.picture}}\">{{chatUser.username}} <span\r\n                        class=\"badge badge-inverse\">{{chatUser.username.length}}</span><span class=\"state\"><i\r\n                        class=\"fa fa-circle txt-color-green pull-right\"></i></span></a>\r\n            </li>\r\n        </ul>\r\n    </div>\r\n    <div class=\"chat-list-footer\">\r\n        <div class=\"control-group\">\r\n            <form class=\"smart-form\">\r\n                <section>\r\n                    <label class=\"input\" >\r\n                        <input type=\"text\" ng-model=\"chatUserFilter\" id=\"filter-chat-list\" placeholder=\"Filter\">\r\n                    </label>\r\n                </section>\r\n            </form>\r\n        </div>\r\n    </div>\r\n</div>");
$templateCache.put("app/dashboard/chat/directives/chat-widget.tpl.html","<!--\r\n  ~ Copyright (c) 2022. PengYunNetWork\r\n  ~\r\n  ~ This program is free software: you can use, redistribute, and/or modify it\r\n  ~ under the terms of the GNU Affero General Public License, version 3 or later (\"AGPL\"),\r\n  ~ as published by the Free Software Foundation.\r\n  ~\r\n  ~ This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;\r\n  ~  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\r\n  ~\r\n  ~  You should have received a copy of the GNU Affero General Public License along with\r\n  ~  this program. If not, see <http://www.gnu.org/licenses/>.\r\n  -->\r\n\r\n<div id=\"chat-widget\" jarvis-widget data-widget-editbutton=\"false\" data-widget-colorbutton=\"false\" data-widget-togglebutton=\"false\" data-widget-fullscreenbutton=\"false\" data-widget-deletebutton=\"false\" >\r\n\r\n\r\n    <header>\r\n        <span class=\"widget-icon\"> <i class=\"fa fa-comments txt-color-white\"></i> </span>\r\n\r\n        <h2> SmartMessage </h2>\r\n\r\n        <div class=\"widget-toolbar\">\r\n            <!-- add: non-hidden - to disable auto hide -->\r\n\r\n            <div class=\"btn-group\" data-dropdown>\r\n                <button class=\"btn dropdown-toggle btn-xs btn_blue\" data-toggle=\"dropdown\">\r\n                    Status <i class=\"fa fa-caret-down\"></i>\r\n                </button>\r\n                <ul class=\"dropdown-menu pull-right js-status-update\">\r\n                    <li>\r\n                        <a href-void><i class=\"fa fa-circle txt-color-green\"></i> Online</a>\r\n                    </li>\r\n                    <li>\r\n                        <a href-void><i class=\"fa fa-circle txt-color-red\"></i> Busy</a>\r\n                    </li>\r\n                    <li>\r\n                        <a href-void><i class=\"fa fa-circle txt-color-orange\"></i> Away</a>\r\n                    </li>\r\n                    <li class=\"divider\"></li>\r\n                    <li>\r\n                        <a href-void><i class=\"fa fa-power-off\"></i> Log Off</a>\r\n                    </li>\r\n                </ul>\r\n            </div>\r\n        </div>\r\n    </header>\r\n\r\n    <!-- widget div-->\r\n    <div>\r\n        <div class=\"widget-body widget-hide-overflow no-padding\">\r\n            <!-- content goes here -->\r\n\r\n            <chat-users></chat-users>\r\n\r\n            <!-- CHAT BODY -->\r\n            <div id=\"chat-body\" class=\"chat-body custom-scroll\">\r\n                <ul>\r\n                    <li class=\"message\" ng-repeat=\"message in chatMessages\">\r\n                        <img class=\"message-picture online\" ng-src=\"{{message.user.picture}}\">\r\n\r\n                        <div class=\"message-text\">\r\n                            <time>\r\n                                {{message.date | date }}\r\n                            </time>\r\n                            <a ng-click=\"messageTo(message.user)\" class=\"username\">{{message.user.username}}</a>\r\n                            <div ng-bind-html=\"message.body\"></div>\r\n\r\n                        </div>\r\n                    </li>\r\n                </ul>\r\n            </div>\r\n\r\n            <!-- CHAT FOOTER -->\r\n            <div class=\"chat-footer\">\r\n\r\n                <!-- CHAT TEXTAREA -->\r\n                <div class=\"textarea-div\">\r\n\r\n                    <div class=\"typearea\">\r\n                        <textarea placeholder=\"Write a reply...\" id=\"textarea-expand\"\r\n                                  class=\"custom-scroll\" ng-model=\"newMessage\"></textarea>\r\n                    </div>\r\n\r\n                </div>\r\n\r\n                <!-- CHAT REPLY/SEND -->\r\n											<span class=\"textarea-controls\">\r\n												<button class=\"btn btn-sm btn_blue pull-right\" ng-click=\"sendMessage()\">\r\n                                                    Reply\r\n                                                </button> <span class=\"pull-right smart-form\"\r\n                                                                style=\"margin-top: 3px; margin-right: 10px;\"> <label\r\n                                                    class=\"checkbox pull-right\">\r\n                                                <input type=\"checkbox\" name=\"subscription\" id=\"subscription\">\r\n                                                <i></i>Press <strong> ENTER </strong> to send </label> </span> <a\r\n                                                    href-void class=\"pull-left\"><i\r\n                                                    class=\"fa fa-camera fa-fw fa-lg\"></i></a> </span>\r\n\r\n            </div>\r\n\r\n            <!-- end content -->\r\n        </div>\r\n\r\n    </div>\r\n    <!-- end widget div -->\r\n</div>");
$templateCache.put("app/_common/forms/directives/bootstrap-validation/bootstrap-attribute-form.tpl.html","<!--\r\n  ~ Copyright (c) 2022. PengYunNetWork\r\n  ~\r\n  ~ This program is free software: you can use, redistribute, and/or modify it\r\n  ~ under the terms of the GNU Affero General Public License, version 3 or later (\"AGPL\"),\r\n  ~ as published by the Free Software Foundation.\r\n  ~\r\n  ~ This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;\r\n  ~  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\r\n  ~\r\n  ~  You should have received a copy of the GNU Affero General Public License along with\r\n  ~  this program. If not, see <http://www.gnu.org/licenses/>.\r\n  -->\r\n\r\n<form id=\"attributeForm\" class=\"form-horizontal\"\r\n      data-bv-message=\"This value is not valid\"\r\n      data-bv-feedbackicons-valid=\"glyphicon glyphicon-ok\"\r\n      data-bv-feedbackicons-invalid=\"glyphicon glyphicon-remove\"\r\n      data-bv-feedbackicons-validating=\"glyphicon glyphicon-refresh\">\r\n\r\n    <fieldset>\r\n        <legend>\r\n            Set validator options via HTML attributes\r\n        </legend>\r\n\r\n        <div class=\"alert alert-warning\">\r\n            <code>&lt; input\r\n                data-bv-validatorname\r\n                data-bv-validatorname-validatoroption=\"...\" / &gt;</code>\r\n\r\n            <br>\r\n            <br>\r\n            More validator options can be found here:\r\n            <a href=\"http://bootstrapvalidator.com/validators/\" target=\"_blank\">http://bootstrapvalidator.com/validators/</a>\r\n        </div>\r\n\r\n        <div class=\"form-group\">\r\n            <label class=\"col-lg-3 control-label\">Full name</label>\r\n            <div class=\"col-lg-4\">\r\n                <input type=\"text\" class=\"form-control\" name=\"firstName\" placeholder=\"First name\"\r\n                       data-bv-notempty=\"true\"\r\n                       data-bv-notempty-message=\"The first name is required and cannot be empty\" />\r\n            </div>\r\n            <div class=\"col-lg-4\">\r\n                <input type=\"text\" class=\"form-control\" name=\"lastName\" placeholder=\"Last name\"\r\n                       data-bv-notempty=\"true\"\r\n                       data-bv-notempty-message=\"The last name is required and cannot be empty\" />\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <fieldset>\r\n        <div class=\"form-group\">\r\n            <label class=\"col-lg-3 control-label\">Username</label>\r\n            <div class=\"col-lg-5\">\r\n                <input type=\"text\" class=\"form-control\" name=\"username\"\r\n                       data-bv-message=\"The username is not valid\"\r\n\r\n                       data-bv-notempty=\"true\"\r\n                       data-bv-notempty-message=\"The username is required and cannot be empty\"\r\n\r\n                       data-bv-regexp=\"true\"\r\n                       data-bv-regexp-regexp=\"^[a-zA-Z0-9_\\.]+$\"\r\n                       data-bv-regexp-message=\"The username can only consist of alphabetical, number, dot and underscore\"\r\n\r\n                       data-bv-stringlength=\"true\"\r\n                       data-bv-stringlength-min=\"6\"\r\n                       data-bv-stringlength-max=\"30\"\r\n                       data-bv-stringlength-message=\"The username must be more than 6 and less than 30 characters long\"\r\n\r\n                       data-bv-different=\"true\"\r\n                       data-bv-different-field=\"password\"\r\n                       data-bv-different-message=\"The username and password cannot be the same as each other\" />\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <fieldset>\r\n        <div class=\"form-group\">\r\n            <label class=\"col-lg-3 control-label\">Email address</label>\r\n            <div class=\"col-lg-5\">\r\n                <input class=\"form-control\" name=\"email\" type=\"email\"\r\n                       data-bv-emailaddress=\"true\"\r\n                       data-bv-emailaddress-message=\"The input is not a valid email address\" />\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <fieldset>\r\n        <div class=\"form-group\">\r\n            <label class=\"col-lg-3 control-label\">Password</label>\r\n            <div class=\"col-lg-5\">\r\n                <input type=\"password\" class=\"form-control\" name=\"password\"\r\n                       data-bv-notempty=\"true\"\r\n                       data-bv-notempty-message=\"The password is required and cannot be empty\"\r\n\r\n                       data-bv-identical=\"true\"\r\n                       data-bv-identical-field=\"confirmPassword\"\r\n                       data-bv-identical-message=\"The password and its confirm are not the same\"\r\n\r\n                       data-bv-different=\"true\"\r\n                       data-bv-different-field=\"username\"\r\n                       data-bv-different-message=\"The password cannot be the same as username\" />\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <fieldset>\r\n        <div class=\"form-group\">\r\n            <label class=\"col-lg-3 control-label\">Retype password</label>\r\n            <div class=\"col-lg-5\">\r\n                <input type=\"password\" class=\"form-control\" name=\"confirmPassword\"\r\n                       data-bv-notempty=\"true\"\r\n                       data-bv-notempty-message=\"The confirm password is required and cannot be empty\"\r\n\r\n                       data-bv-identical=\"true\"\r\n                       data-bv-identical-field=\"password\"\r\n                       data-bv-identical-message=\"The password and its confirm are not the same\"\r\n\r\n                       data-bv-different=\"true\"\r\n                       data-bv-different-field=\"username\"\r\n                       data-bv-different-message=\"The password cannot be the same as username\" />\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <fieldset>\r\n        <div class=\"form-group\">\r\n            <label class=\"col-lg-3 control-label\">Languages</label>\r\n            <div class=\"col-lg-5\">\r\n                <div class=\"checkbox\">\r\n                    <label>\r\n                        <input type=\"checkbox\" name=\"languages[]\" value=\"english\"\r\n                               data-bv-message=\"Please specify at least one language you can speak\"\r\n                               data-bv-notempty=\"true\" />\r\n                        English </label>\r\n                </div>\r\n                <div class=\"checkbox\">\r\n                    <label>\r\n                        <input type=\"checkbox\" name=\"languages[]\" value=\"french\" />\r\n                        French </label>\r\n                </div>\r\n                <div class=\"checkbox\">\r\n                    <label>\r\n                        <input type=\"checkbox\" name=\"languages[]\" value=\"german\" />\r\n                        German </label>\r\n                </div>\r\n                <div class=\"checkbox\">\r\n                    <label>\r\n                        <input type=\"checkbox\" name=\"languages[]\" value=\"russian\" />\r\n                        Russian </label>\r\n                </div>\r\n                <div class=\"checkbox\">\r\n                    <label>\r\n                        <input type=\"checkbox\" name=\"languages[]\" value=\"other\" />\r\n                        Other </label>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <div class=\"form-actions\">\r\n        <div class=\"row\">\r\n            <div class=\"col-md-12\">\r\n                <button class=\"btn btn-default\" type=\"submit\">\r\n                    <i class=\"fa fa-eye\"></i>\r\n                    Validate\r\n                </button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n\r\n</form>\r\n     ");
$templateCache.put("app/_common/forms/directives/bootstrap-validation/bootstrap-button-group-form.tpl.html","<!--\r\n  ~ Copyright (c) 2022. PengYunNetWork\r\n  ~\r\n  ~ This program is free software: you can use, redistribute, and/or modify it\r\n  ~ under the terms of the GNU Affero General Public License, version 3 or later (\"AGPL\"),\r\n  ~ as published by the Free Software Foundation.\r\n  ~\r\n  ~ This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;\r\n  ~  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\r\n  ~\r\n  ~  You should have received a copy of the GNU Affero General Public License along with\r\n  ~  this program. If not, see <http://www.gnu.org/licenses/>.\r\n  -->\r\n\r\n<form id=\"buttonGroupForm\" method=\"post\" class=\"form-horizontal\">\r\n\r\n    <fieldset>\r\n        <legend>\r\n            Default Form Elements\r\n        </legend>\r\n        <div class=\"form-group\">\r\n            <label class=\"col-lg-3 control-label\">Gender</label>\r\n            <div class=\"col-lg-9\">\r\n                <div class=\"btn-group\" data-toggle=\"buttons\">\r\n                    <label class=\"btn btn-default\">\r\n                        <input type=\"radio\" name=\"gender\" value=\"male\" />\r\n                        Male </label>\r\n                    <label class=\"btn btn-default\">\r\n                        <input type=\"radio\" name=\"gender\" value=\"female\" />\r\n                        Female </label>\r\n                    <label class=\"btn btn-default\">\r\n                        <input type=\"radio\" name=\"gender\" value=\"other\" />\r\n                        Other </label>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <fieldset>\r\n        <div class=\"form-group\">\r\n            <label class=\"col-lg-3 control-label\">Languages</label>\r\n            <div class=\"col-lg-9\">\r\n                <div class=\"btn-group\" data-toggle=\"buttons\">\r\n                    <label class=\"btn btn-default\">\r\n                        <input type=\"checkbox\" name=\"languages[]\" value=\"english\" />\r\n                        English </label>\r\n                    <label class=\"btn btn-default\">\r\n                        <input type=\"checkbox\" name=\"languages[]\" value=\"german\" />\r\n                        German </label>\r\n                    <label class=\"btn btn-default\">\r\n                        <input type=\"checkbox\" name=\"languages[]\" value=\"french\" />\r\n                        French </label>\r\n                    <label class=\"btn btn-default\">\r\n                        <input type=\"checkbox\" name=\"languages[]\" value=\"russian\" />\r\n                        Russian </label>\r\n                    <label class=\"btn btn-default\">\r\n                        <input type=\"checkbox\" name=\"languages[]\" value=\"italian\">\r\n                        Italian </label>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <div class=\"form-actions\">\r\n        <div class=\"row\">\r\n            <div class=\"col-md-12\">\r\n                <button class=\"btn btn-default\" type=\"submit\">\r\n                    <i class=\"fa fa-eye\"></i>\r\n                    Validate\r\n                </button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n\r\n</form>\r\n");
$templateCache.put("app/_common/forms/directives/bootstrap-validation/bootstrap-contact-form.tpl.html","<!--\r\n  ~ Copyright (c) 2022. PengYunNetWork\r\n  ~\r\n  ~ This program is free software: you can use, redistribute, and/or modify it\r\n  ~ under the terms of the GNU Affero General Public License, version 3 or later (\"AGPL\"),\r\n  ~ as published by the Free Software Foundation.\r\n  ~\r\n  ~ This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;\r\n  ~  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\r\n  ~\r\n  ~  You should have received a copy of the GNU Affero General Public License along with\r\n  ~  this program. If not, see <http://www.gnu.org/licenses/>.\r\n  -->\r\n\r\n<form id=\"contactForm\" method=\"post\" class=\"form-horizontal\">\r\n\r\n    <fieldset>\r\n        <legend>Showing messages in custom area</legend>\r\n        <div class=\"form-group\">\r\n            <label class=\"col-md-3 control-label\">Full name</label>\r\n            <div class=\"col-md-6\">\r\n                <input type=\"text\" class=\"form-control\" name=\"fullName\" />\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <fieldset>\r\n        <div class=\"form-group\">\r\n            <label class=\"col-md-3 control-label\">Email</label>\r\n            <div class=\"col-md-6\">\r\n                <input type=\"text\" class=\"form-control\" name=\"email\" />\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <fieldset>\r\n        <div class=\"form-group\">\r\n            <label class=\"col-md-3 control-label\">Title</label>\r\n            <div class=\"col-md-6\">\r\n                <input type=\"text\" class=\"form-control\" name=\"title\" />\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <fieldset>\r\n        <div class=\"form-group\">\r\n            <label class=\"col-md-3 control-label\">Content</label>\r\n            <div class=\"col-md-6\">\r\n                <textarea class=\"form-control\" name=\"content\" rows=\"5\"></textarea>\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <fieldset>\r\n        <!-- #messages is where the messages are placed inside -->\r\n        <div class=\"form-group\">\r\n            <div class=\"col-md-9 col-md-offset-3\">\r\n                <div id=\"messages\"></div>\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <div class=\"form-actions\">\r\n        <div class=\"row\">\r\n            <div class=\"col-md-12\">\r\n                <button class=\"btn btn-default\" type=\"submit\">\r\n                    <i class=\"fa fa-eye\"></i>\r\n                    Validate\r\n                </button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n\r\n</form>\r\n");
$templateCache.put("app/_common/forms/directives/bootstrap-validation/bootstrap-movie-form.tpl.html","\r\n<!--\r\n  ~ Copyright (c) 2022. PengYunNetWork\r\n  ~\r\n  ~ This program is free software: you can use, redistribute, and/or modify it\r\n  ~ under the terms of the GNU Affero General Public License, version 3 or later (\"AGPL\"),\r\n  ~ as published by the Free Software Foundation.\r\n  ~\r\n  ~ This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;\r\n  ~  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\r\n  ~\r\n  ~  You should have received a copy of the GNU Affero General Public License along with\r\n  ~  this program. If not, see <http://www.gnu.org/licenses/>.\r\n  -->\r\n\r\n<form id=\"movieForm\" method=\"post\">\r\n\r\n    <fieldset>\r\n        <legend>\r\n            Default Form Elements\r\n        </legend>\r\n        <div class=\"form-group\">\r\n            <div class=\"row\">\r\n                <div class=\"col-md-8\">\r\n                    <label class=\"control-label\">Movie title</label>\r\n                    <input type=\"text\" class=\"form-control\" name=\"title\" />\r\n                </div>\r\n\r\n                <div class=\"col-md-4 selectContainer\">\r\n                    <label class=\"control-label\">Genre</label>\r\n                    <select class=\"form-control\" name=\"genre\">\r\n                        <option value=\"\">Choose a genre</option>\r\n                        <option value=\"action\">Action</option>\r\n                        <option value=\"comedy\">Comedy</option>\r\n                        <option value=\"horror\">Horror</option>\r\n                        <option value=\"romance\">Romance</option>\r\n                    </select>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <fieldset>\r\n        <div class=\"form-group\">\r\n            <div class=\"row\">\r\n                <div class=\"col-sm-12 col-md-4\">\r\n                    <label class=\"control-label\">Director</label>\r\n                    <input type=\"text\" class=\"form-control\" name=\"director\" />\r\n                </div>\r\n\r\n                <div class=\"col-sm-12 col-md-4\">\r\n                    <label class=\"control-label\">Writer</label>\r\n                    <input type=\"text\" class=\"form-control\" name=\"writer\" />\r\n                </div>\r\n\r\n                <div class=\"col-sm-12 col-md-4\">\r\n                    <label class=\"control-label\">Producer</label>\r\n                    <input type=\"text\" class=\"form-control\" name=\"producer\" />\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <fieldset>\r\n        <div class=\"form-group\">\r\n            <div class=\"row\">\r\n                <div class=\"col-sm-12 col-md-6\">\r\n                    <label class=\"control-label\">Website</label>\r\n                    <input type=\"text\" class=\"form-control\" name=\"website\" />\r\n                </div>\r\n\r\n                <div class=\"col-sm-12 col-md-6\">\r\n                    <label class=\"control-label\">Youtube trailer</label>\r\n                    <input type=\"text\" class=\"form-control\" name=\"trailer\" />\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <fieldset>\r\n        <div class=\"form-group\">\r\n            <label class=\"control-label\">Review</label>\r\n            <textarea class=\"form-control\" name=\"review\" rows=\"8\"></textarea>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <fieldset>\r\n        <div class=\"form-group\">\r\n\r\n            <div class=\"row\">\r\n                <div class=\"col-sm-12 col-md-12\">\r\n                    <label class=\"control-label\">Rating</label>\r\n                </div>\r\n\r\n                <div class=\"col-sm-12 col-md-10\">\r\n\r\n                    <label class=\"radio radio-inline no-margin\">\r\n                        <input type=\"radio\" name=\"rating\" value=\"terrible\" class=\"radiobox style-2\" />\r\n                        <span>Terrible</span> </label>\r\n\r\n                    <label class=\"radio radio-inline\">\r\n                        <input type=\"radio\" name=\"rating\" value=\"watchable\" class=\"radiobox style-2\" />\r\n                        <span>Watchable</span> </label>\r\n                    <label class=\"radio radio-inline\">\r\n                        <input type=\"radio\" name=\"rating\" value=\"best\" class=\"radiobox style-2\" />\r\n                        <span>Best ever</span> </label>\r\n\r\n                </div>\r\n\r\n            </div>\r\n\r\n        </div>\r\n    </fieldset>\r\n\r\n    <div class=\"form-actions\">\r\n        <div class=\"row\">\r\n            <div class=\"col-md-12\">\r\n                <button class=\"btn btn-default\" type=\"submit\">\r\n                    <i class=\"fa fa-eye\"></i>\r\n                    Validate\r\n                </button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n\r\n</form>\r\n\r\n ");
$templateCache.put("app/_common/forms/directives/bootstrap-validation/bootstrap-product-form.tpl.html","<!--\r\n  ~ Copyright (c) 2022. PengYunNetWork\r\n  ~\r\n  ~ This program is free software: you can use, redistribute, and/or modify it\r\n  ~ under the terms of the GNU Affero General Public License, version 3 or later (\"AGPL\"),\r\n  ~ as published by the Free Software Foundation.\r\n  ~\r\n  ~ This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;\r\n  ~  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\r\n  ~\r\n  ~  You should have received a copy of the GNU Affero General Public License along with\r\n  ~  this program. If not, see <http://www.gnu.org/licenses/>.\r\n  -->\r\n\r\n<form id=\"productForm\" class=\"form-horizontal\">\r\n\r\n    <fieldset>\r\n        <legend>\r\n            Default Form Elements\r\n        </legend>\r\n        <div class=\"form-group\">\r\n            <label class=\"col-xs-2 col-lg-3 control-label\">Price</label>\r\n            <div class=\"col-xs-9 col-lg-6 inputGroupContainer\">\r\n                <div class=\"input-group\">\r\n                    <input type=\"text\" class=\"form-control\" name=\"price\" />\r\n                    <span class=\"input-group-addon\">$</span>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <fieldset>\r\n        <div class=\"form-group\">\r\n            <label class=\"col-xs-2 col-lg-3 control-label\">Amount</label>\r\n            <div class=\"col-xs-9 col-lg-6 inputGroupContainer\">\r\n                <div class=\"input-group\">\r\n                    <span class=\"input-group-addon\">&#8364;</span>\r\n                    <input type=\"text\" class=\"form-control\" name=\"amount\" />\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <fieldset>\r\n        <div class=\"form-group\">\r\n            <label class=\"col-xs-2 col-lg-3 control-label\">Color</label>\r\n            <div class=\"col-xs-9 col-lg-6 selectContainer\">\r\n                <select class=\"form-control\" name=\"color\">\r\n                    <option value=\"\">Choose a color</option>\r\n                    <option value=\"blue\">Blue</option>\r\n                    <option value=\"green\">Green</option>\r\n                    <option value=\"red\">Red</option>\r\n                    <option value=\"yellow\">Yellow</option>\r\n                    <option value=\"white\">White</option>\r\n                </select>\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <fieldset>\r\n        <div class=\"form-group\">\r\n            <label class=\"col-xs-2 col-lg-3 control-label\">Size</label>\r\n            <div class=\"col-xs-9 col-lg-6 selectContainer\">\r\n                <select class=\"form-control\" name=\"size\">\r\n                    <option value=\"\">Choose a size</option>\r\n                    <option value=\"S\">S</option>\r\n                    <option value=\"M\">M</option>\r\n                    <option value=\"L\">L</option>\r\n                    <option value=\"XL\">XL</option>\r\n                </select>\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <div class=\"form-actions\">\r\n        <div class=\"row\">\r\n            <div class=\"col-md-12\">\r\n                <button class=\"btn btn-default\" type=\"submit\">\r\n                    <i class=\"fa fa-eye\"></i>\r\n                    Validate\r\n                </button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</form>\r\n\r\n");
$templateCache.put("app/_common/forms/directives/bootstrap-validation/bootstrap-profile-form.tpl.html","<!--\r\n  ~ Copyright (c) 2022. PengYunNetWork\r\n  ~\r\n  ~ This program is free software: you can use, redistribute, and/or modify it\r\n  ~ under the terms of the GNU Affero General Public License, version 3 or later (\"AGPL\"),\r\n  ~ as published by the Free Software Foundation.\r\n  ~\r\n  ~ This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;\r\n  ~  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\r\n  ~\r\n  ~  You should have received a copy of the GNU Affero General Public License along with\r\n  ~  this program. If not, see <http://www.gnu.org/licenses/>.\r\n  -->\r\n\r\n<form id=\"profileForm\">\r\n\r\n    <fieldset>\r\n        <legend>\r\n            Default Form Elements\r\n        </legend>\r\n        <div class=\"form-group\">\r\n            <label>Email address</label>\r\n            <input type=\"text\" class=\"form-control\" name=\"email\" />\r\n        </div>\r\n    </fieldset>\r\n    <fieldset>\r\n        <div class=\"form-group\">\r\n            <label>Password</label>\r\n            <input type=\"password\" class=\"form-control\" name=\"password\" />\r\n        </div>\r\n    </fieldset>\r\n\r\n    <div class=\"form-actions\">\r\n        <div class=\"row\">\r\n            <div class=\"col-md-12\">\r\n                <button class=\"btn btn-default\" type=\"submit\">\r\n                    <i class=\"fa fa-eye\"></i>\r\n                    Validate\r\n                </button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</form>\r\n");
$templateCache.put("app/_common/forms/directives/bootstrap-validation/bootstrap-toggling-form.tpl.html","<!--\r\n  ~ Copyright (c) 2022. PengYunNetWork\r\n  ~\r\n  ~ This program is free software: you can use, redistribute, and/or modify it\r\n  ~ under the terms of the GNU Affero General Public License, version 3 or later (\"AGPL\"),\r\n  ~ as published by the Free Software Foundation.\r\n  ~\r\n  ~ This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;\r\n  ~  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\r\n  ~\r\n  ~  You should have received a copy of the GNU Affero General Public License along with\r\n  ~  this program. If not, see <http://www.gnu.org/licenses/>.\r\n  -->\r\n\r\n<form id=\"togglingForm\" method=\"post\" class=\"form-horizontal\">\r\n\r\n    <fieldset>\r\n        <legend>\r\n            Default Form Elements\r\n        </legend>\r\n        <div class=\"form-group\">\r\n            <label class=\"col-lg-3 control-label\">Full name <sup>*</sup></label>\r\n            <div class=\"col-lg-4\">\r\n                <input type=\"text\" class=\"form-control\" name=\"firstName\" placeholder=\"First name\" />\r\n            </div>\r\n            <div class=\"col-lg-4\">\r\n                <input type=\"text\" class=\"form-control\" name=\"lastName\" placeholder=\"Last name\" />\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <fieldset>\r\n        <div class=\"form-group\">\r\n            <label class=\"col-lg-3 control-label\">Company <sup>*</sup></label>\r\n            <div class=\"col-lg-5\">\r\n                <input type=\"text\" class=\"form-control\" name=\"company\"\r\n                       required data-bv-notempty-message=\"The company name is required\" />\r\n            </div>\r\n            <div class=\"col-lg-2\">\r\n                <button type=\"button\" class=\"btn btn-info btn-sm\" data-toggle=\"#jobInfo\">\r\n                    Add more info\r\n                </button>\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n\r\n    <!-- These fields will not be validated as long as they are not visible -->\r\n    <div id=\"jobInfo\" style=\"display: none;\">\r\n        <fieldset>\r\n            <div class=\"form-group\">\r\n                <label class=\"col-lg-3 control-label\">Job title <sup>*</sup></label>\r\n                <div class=\"col-lg-5\">\r\n                    <input type=\"text\" class=\"form-control\" name=\"job\" />\r\n                </div>\r\n            </div>\r\n        </fieldset>\r\n\r\n        <fieldset>\r\n            <div class=\"form-group\">\r\n                <label class=\"col-lg-3 control-label\">Department <sup>*</sup></label>\r\n                <div class=\"col-lg-5\">\r\n                    <input type=\"text\" class=\"form-control\" name=\"department\" />\r\n                </div>\r\n            </div>\r\n        </fieldset>\r\n    </div>\r\n\r\n    <fieldset>\r\n        <div class=\"form-group\">\r\n            <label class=\"col-lg-3 control-label\">Mobile phone <sup>*</sup></label>\r\n            <div class=\"col-lg-5\">\r\n                <input type=\"text\" class=\"form-control\" name=\"mobilePhone\" />\r\n            </div>\r\n            <div class=\"col-lg-2\">\r\n                <button type=\"button\" class=\"btn btn-info btn-sm\" data-toggle=\"#phoneInfo\">\r\n                    Add more phone numbers\r\n                </button>\r\n            </div>\r\n        </div>\r\n    </fieldset>\r\n    <!-- These fields will not be validated as long as they are not visible -->\r\n    <div id=\"phoneInfo\" style=\"display: none;\">\r\n\r\n        <fieldset>\r\n            <div class=\"form-group\">\r\n                <label class=\"col-lg-3 control-label\">Home phone</label>\r\n                <div class=\"col-lg-5\">\r\n                    <input type=\"text\" class=\"form-control\" name=\"homePhone\" />\r\n                </div>\r\n            </div>\r\n        </fieldset>\r\n        <fieldset>\r\n            <div class=\"form-group\">\r\n                <label class=\"col-lg-3 control-label\">Office phone</label>\r\n                <div class=\"col-lg-5\">\r\n                    <input type=\"text\" class=\"form-control\" name=\"officePhone\" />\r\n                </div>\r\n            </div>\r\n        </fieldset>\r\n    </div>\r\n\r\n    <div class=\"form-actions\">\r\n        <div class=\"row\">\r\n            <div class=\"col-md-12\">\r\n                <button class=\"btn btn-default\" type=\"submit\">\r\n                    <i class=\"fa fa-eye\"></i>\r\n                    Validate\r\n                </button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</form>");
$templateCache.put("app/_common/layout/directives/demo/demo-states.tpl.html","<!--\r\n  ~ Copyright (c) 2022. PengYunNetWork\r\n  ~\r\n  ~ This program is free software: you can use, redistribute, and/or modify it\r\n  ~ under the terms of the GNU Affero General Public License, version 3 or later (\"AGPL\"),\r\n  ~ as published by the Free Software Foundation.\r\n  ~\r\n  ~ This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;\r\n  ~  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\r\n  ~\r\n  ~  You should have received a copy of the GNU Affero General Public License along with\r\n  ~  this program. If not, see <http://www.gnu.org/licenses/>.\r\n  -->\r\n\r\n<div class=\"demo\" style=\"display: none\"><span id=\"demo-setting\"><i class=\"fa fa-cog txt-color-blueDark\"></i></span>\r\n\r\n    <form>\r\n        <legend class=\"no-padding margin-bottom-10\">Layout Options</legend>\r\n        <section>\r\n            <label><input type=\"checkbox\" ng-model=\"fixedHeader\"\r\n                          class=\"checkbox style-0\"><span>Fixed Header</span></label>\r\n            <label><input type=\"checkbox\"\r\n                          ng-model=\"fixedNavigation\"\r\n                          class=\"checkbox style-0\"><span>Fixed Navigation</span></label>\r\n            <label><input type=\"checkbox\"\r\n                          ng-model=\"fixedRibbon\"\r\n                          class=\"checkbox style-0\"><span>Fixed Ribbon</span></label>\r\n            <label><input type=\"checkbox\"\r\n                          ng-model=\"fixedPageFooter\"\r\n                          class=\"checkbox style-0\"><span>Fixed Footer</span></label>\r\n            <label><input type=\"checkbox\"\r\n                          ng-model=\"insideContainer\"\r\n                          class=\"checkbox style-0\"><span>Inside <b>.container</b></span></label>\r\n            <label><input type=\"checkbox\"\r\n                          ng-model=\"rtl\"\r\n                          class=\"checkbox style-0\"><span>RTL</span></label>\r\n            <label><input type=\"checkbox\"\r\n                          ng-model=\"menuOnTop\"\r\n                          class=\"checkbox style-0\"><span>Menu on <b>top</b></span></label>\r\n            <label><input type=\"checkbox\"\r\n                          ng-model=\"colorblindFriendly\"\r\n                          class=\"checkbox style-0\"><span>For Colorblind <div\r\n                    class=\"font-xs text-right\">(experimental)\r\n            </div></span>\r\n            </label><span id=\"smart-bgimages\"></span></section>\r\n        <section><h6 class=\"margin-top-10 semi-bold margin-bottom-5\">Clear Localstorage</h6><a\r\n                ng-click=\"factoryReset()\" class=\"btn btn-xs btn-block btn_blue\" id=\"reset-smart-widget\"><i\r\n                class=\"fa fa-refresh\"></i> Factory Reset</a></section>\r\n\r\n        <h6 class=\"margin-top-10 semi-bold margin-bottom-5\">SmartAdmin Skins</h6>\r\n\r\n\r\n        <section id=\"smart-styles\">\r\n            <a ng-repeat=\"skin in skins\" ng-click=\"setSkin(skin)\" class=\"{{skin.class}}\" style=\"{{skin.style}}\"><i ng-if=\"skin.name == $parent.smartSkin\" class=\"fa fa-check fa-fw\"></i> {{skin.label}} <sup ng-if=\"skin.beta\">beta</sup></a>\r\n        </section>\r\n    </form>\r\n</div>");}]);
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

angular.module('app').directive('activitiesDropdownToggle', function($log) {
    
	var link = function($scope,$element, attrs){
		var ajax_dropdown = null;

		$element.on('click',function(){

			var badge = $(this).find('.badge');
			if (badge.hasClass('bg-color-red')) {

				/*badge.removeClass('bg-color-red').text(0);*/


			}

			ajax_dropdown = $(this).next('.ajax-dropdown');

			if (!ajax_dropdown.is(':visible')) {

				ajax_dropdown.fadeIn(150);

				/*$(this).addClass('active');*/

			}
			 else {
				
				ajax_dropdown.fadeOut(150);
				
				/*$(this).removeClass('active');*/
				

			}

		})

		$(document).mouseup(function(e) {
			if (ajax_dropdown && !ajax_dropdown.is(e.target) && ajax_dropdown.has(e.target).length === 0) {
				ajax_dropdown.fadeOut(150);
				$element.removeClass('active');
				

			}
		});
	}
	
	return{
		restrict:'EA',
		link:link
	}
});
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

angular.module('app').factory('activityService', function($http, $log, APP_CONFIG) {

	function getActivities(callback){

		$http.get(APP_CONFIG.apiRootUrl + '/activities/activity.json').then(function(data){
			

			callback(data.data);
				
		},function(){

			$log.log('Error');
			callback([]);

		})

	}

	function getActivitiesByType(type, callback){

		$http.get(APP_CONFIG.apiRootUrl + '/activities/activity-' + type + '.json').then(function(data){

			callback(data.data);
				
		},function(){

			$log.log('Error');
			callback([]);

		});

	}
	
	return{
		get:function(callback){
			getActivities(callback);
		},
		getbytype:function(type,callback){
			getActivitiesByType(type, callback);
		}
	}
});
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

angular.module('app.hardware').controller('DiskCtrl', function ($http, $scope, DTOptionsBuilder, DTColumnBuilder, $compile, showMessage, $interval, translate, $rootScope, $stateParams, $state, $timeout) {

  $(".modal").draggable();
  var vm = this;
  var tableLength;
  var statusLevel = $stateParams.statusLevel;
  vm.dtInstance = {};
  var e_datanodeId;
  var e_archiveId;
  var e_dataNodeEndPoint;
  var e_archiveType;
  var e_deviceName;
  var refreshIds = [];
  var intervalTime;
  var allDiskData;
  vm.stopBtn = true;
  vm.startBtn = false;
  var timeFlag = true;
  function initTable() {
    vm.dtOptions = DTOptionsBuilder
      .newOptions()
      .withOption('ajax', {
        url: BASE_API + 'listAllDisk',
        type: 'POST',
        data: {
          statusLevel: statusLevel == "" ? $("#searchDiskStatus").val() : statusLevel,
          storageType: $("#searchType").val()
        },
        params: {
          time: new Date().getTime()
        },
        dataSrc: function (data) {
          if (data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
            return;
          }
          tableLength = data.diskList.length;
          allDiskData = data.diskList;
          return data.diskList;
        },
      })
      .withDOM("<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
        "t" +
        "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>")
      .withBootstrap()
      .withOption('processing', false)
      .withOption('serverSide', false)
      .withOption('rowId', 'archiveId')
      .withOption('searching', false)
      .withOption('fnDrawCallback', drawCallback)
      .withOption('fnInitComplete', function () {
        $("#diskTab_wrapper .dt-toolbar .hidden-xs").html($compile(selectStr)($scope))
        refreshIds = [];
        if (statusLevel != "") {
          $("#searchDiskStatus").val(statusLevel);
        } else {
          $("#searchDiskStatus").val(diskStatus);
        }
        $("#searchType").val(diskType);

        $(".selectpicker").selectpicker("render");
        $(".selectpicker").selectpicker("refresh");
      })
      .withLanguage({
        "aria": {
          "sortAscending": ": activate to sort column ascending",
          "sortDescending": ": activate to sort column descending"
        },
        "emptyTable": "表中数据为空",
        "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
        "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
        "order": [[2, "asc"]],
        "infoFiltered": "(由 _MAX_ 项结果过滤)",
        "zeroRecords": "表中数据为空",
        "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
          '<option value="5" >5条</option>' +
          '<option value="10" >10条</option>' +
          '<option value="20" >20条</option>' +
          '<option value="50" >50条</option>' +
          '<option value="100" >100条</option>' +
          '</select>&nbsp;' + '  ',
        "paginate": {
          "previous": '<i class="fa fa-angle-left"></i>',
          "next": '<i class="fa fa-angle-right"></i>',
          "last": '<i class="fa  fa-angle-double-right"></i>',
          "first": '<i class="fa  fa-angle-double-left"></i>'
        }
      })
      .withPaginationType('full_numbers')
      .withOption('createdRow', function (row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
      })
      .withOption('headerCallback', function (header) {
        if (!vm.headerCompiled) {
          vm.headerCompiled = true;
          $compile(angular.element(header).contents())($scope);
        }
      });

    vm.dtColumns = [
      DTColumnBuilder.newColumn('archiveId').withTitle('ID').notVisible(),
      DTColumnBuilder.newColumn('deviceName').withTitle("磁盘名称"),
      DTColumnBuilder.newColumn('archiveType').withTitle("磁盘类型")
        .renderWith(function (data, type, row) {
          var archiveType = "";
          var mixDisk = data.split(",");
          mixDisk.sort(function (obj1, obj2) {
            if (obj1 > obj2) {
              return 1;
            } else if (obj1 < obj2) {
              return -1;
            } else {
              return 0;
            }
          })
          for (var dex in mixDisk) {
            archiveType = archiveType + translate.getWord(mixDisk[dex]) + "&nbsp;&nbsp;"
          }
          return archiveType;

        }),
      DTColumnBuilder.newColumn('storageType').withTitle("存储类型"),
      DTColumnBuilder.newColumn('dataNodeEndPoint').withTitle('主机IP')
        .renderWith(function (data, type, row) {
          return $.trim(data.split(":")[0])
        }),
      DTColumnBuilder.newColumn('status').withTitle("状态")
        .renderWith(function (data, type, row) {
          var str = "";
          if (data == "GOOD") {
            str = str + '<td><span class="status_green" >良好</span></td>'
          } else if (data == "BROKEN") {
            str = str + '<td><span class="status_red" >损坏</span></td>'
          } else if (data == "SEPARATED") {
            str = str + '<td><span class="status_red" >被隔离</span></td>'
          } else if (data == "OFFLINED") {
            str = str + '<td><span class="status_orange" >脱机</span></td>'
          } else if (data == "CONFIG_MISMATCH") {
            str = str + '<td><span class="status_orange" >配置不匹配</span></td>'
          } else if (data == "DEGRADED") {
            str = str + '<td><span class="status_red" >轻微损坏</span></td>'
          } else if (data == "EJECTED") {
            str = str + '<td><span class="status_red" >拔出</span></td>'
          } else if (data == "INPROPERLY_EJECTED") {
            str = str + '<td><span class="status_red" >拔出不当</span></td>'
          } else if (data == "OFFLINING") {
            str = str + '<td>'
              + '<div class="progress progress-striped active" >'
              + '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" >'
              + '<span  style="color: #fff;">卸载中</span></div></div></td>'
          } else {
            str = str + '<td>'
              + '<div class="progress progress-striped active" >'
              + '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" >'
              + '<span  style="color: #fff;">'
              + data + '</span></div></div></td>'
          }
          return str;
        }),
      DTColumnBuilder.newColumn('domainName').withTitle("所属域")
        .renderWith(function (data, type, row) {
          if (data == null) {
            return "";
          } else {
            return "<a title='查看域详情' ng-click='jumpToDomain(\"" + row.domainId + "\")'>" + data + "</a>";
          }
        }),
      DTColumnBuilder.newColumn('poolName').withTitle("所属存储池")
        .renderWith(function (data, type, row) {
          if (data == null) {
            return "";
          } else {
            return "<a title='查看存储池详情' ng-click='jumpToPool(\"" + row.storagePool + "\",\"" + row.domainId + "\",\"" + row.domainName + "\")'>" + data + "</a>";
          }
        }),
      DTColumnBuilder.newColumn('slotNumber').withTitle("槽位")
        .renderWith(function (data, type, row) {
          if (data == null || data == "unknown") {
            return "-";
          } else {
            return data;
          }
        }),
      DTColumnBuilder.newColumn('logicalSpace').withTitle("逻辑容量(GB)")
        .renderWith(function (data, type, row) {
          var space = fixTwoDecimal(data / (1024 * 1024 * 1024));
          return space;
        }),
      DTColumnBuilder.newColumn('useSpace').withTitle("已分配容量(GB)")
        .renderWith(function (data, type, row) {
          if (row.archiveType.indexOf("PAGE_CACHE") != -1) {
            return "";
          } else {
            var freeSpace = fixTwoDecimal((row.logicalSpace - row.logicalFreeSpace) / (1024 * 1024 * 1024));
            return freeSpace;
          }
        }),
      DTColumnBuilder.newColumn('dataSizeMb').withTitle("已用容量(GB)")
        .renderWith(function (data, type, row) {
          let used = fixTwoDecimal(data / 1024);
          return used;
        }),
      DTColumnBuilder.newColumn('null').withTitle("操作")
        .renderWith(function (data, type, row) {
          var str = "";
          if (row.status == "CONFIG_MISMATCH") {
            str = str + "<a ng-show='apis.Hardware.fixConfigMismatchDisk' data-toggle='modal' data-target='#reuseConfigModal' ng-click='getInformation(\"" + row.archiveId + "\",\"" + row.dataNodeEndPoint + "\",\"" + row.datanodeId + "\",\"" + row.archiveType + "\",\"" + row.deviceName + "\")'>重用该盘</a>";
          } else {
            str = ""
          }
          return str;
        }).notSortable()
    ];
  }
  initTable();
  var selectStr = '<div class="row">'
    + '<div  style="float: right;padding-right:8px" >'
    + '<div style="float:left;margin-bottom:10px;margin-left:8px" >'
    + '<select  class="selectpicker" data-width="125px" id="searchDiskStatus" >'
    + '<option value="" selected>所有状态</option>'
    + '<option value="GOOD">健康</option>'
    + '<option value="BAD">错误</option>'
    + '</select>'
    + '</div>'
    + '<div style="float:left;margin-bottom:10px;margin-left:8px">'
    + '<select  class="selectpicker" data-width="125px" id="searchType" >'
    + '<option value="" selected>所有存储类型</option>'
    + '<option value="SATA">SATA盘</option>'
    + '<option value="SAS">SAS盘</option>'
    + '<option value="SSD">SSD盘</option>'
    + '<option value="PCIE">NVME盘</option>'
    + '</select>'
    + '</div>'
    + '<div style="float:left;margin-right: 10px;">'
    + '&nbsp;&nbsp;'
    + '<button class="btn  btn_lightblue" ng-click="search()" style="height: 33px">查询</button>'
    + '</div>'
    + '</div>'
    + '</div>';
  var diskType = "";
  var diskStatus = "";
  function drawCallback(result) {
    if (tableLength > 0) {
      $(".dataTables_paginate").show();
      $.each(allDiskData, function (i, value) {
        if (value.status == "OFFLINING") {
          refreshIds.push(value.archiveId);
        }
        if (value.status == "OFFLINED" && value.archiveType != "UNSETTLED_DISK") {
          refreshIds.push(value.archiveId);
        }
      });
    } else {
      $(".dataTables_paginate").hide()
    }
    $interval.cancel(intervalTime);
    if (refreshIds.length > 0) {
      intervalTime = $interval(getStatus, 3000);
    }
  }

  function fixTwoDecimal(value) {
    return Math.round(value * 100) / 100;
  }

  $scope.search = function () {
    if ($("#searchDiskStatus").val() != statusLevel) {
      statusLevel = "";
    }
    diskType = $("#searchType").val() || "";
    diskStatus = $("#searchDiskStatus").val() || "";
    initTable();
  }

  $scope.reloadData = function () {
    vm.dtInstance.reloadData(null, false);
  }

  function getStatus() {
    if (timeFlag) {
      timeFlag = false;
      if (refreshIds.length > 0) {
        $http({
          method: "POST",
          async: false,
          url: "getDisk",
          data: {
            diskIds: JSON.stringify(refreshIds)
          },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
            }
            return str.join("&");
          }
        }).then(function successCallback(response) {
          timeFlag = true;
          if (response.data.diskList) {
            $.each(response.data.diskList, function (i, value) {
              if (value.status == "OFFLINING" || (value.status == "OFFLINED" && value.archiveType != "UNSETTLED_DISK")) {
                var space = fixTwoDecimal(value.logicalSpace / (1024 * 1024 * 1024));
                var freeSpace = fixTwoDecimal(value.logicalFreeSpace / (1024 * 1024 * 1024));

                var archiveType = "";
                var mixDisk = value.archiveType.split(",");
                mixDisk.sort(function (obj1, obj2) {
                  if (obj1 > obj2) {
                    return 1;
                  } else if (obj1 < obj2) {
                    return -1;
                  } else {
                    return 0;
                  }
                })
                for (var dex in mixDisk) {
                  archiveType = archiveType + translate.getWord(mixDisk[dex]) + "&nbsp;&nbsp;"
                }

                $("#" + value.archiveId).children("td").eq(1).html(archiveType);
                $("#" + value.archiveId).children("td").eq(8).html(space);
                $("#" + value.archiveId).children("td").eq(9).html(freeSpace);
              } else {
                $interval.cancel(intervalTime);
                refreshIds = [];
                vm.dtInstance.reloadData(null, false);
              }


            })
          }


        }, function errorCallback(response) {


        });

      } else {
        $interval.cancel(intervalTime);
      }
    }

  }

  $scope.jumpToDomain = function (id) {
    $state.go('app.storage.domain.domainDetail', { domainId: id });
  }

  $scope.jumpToPool = function (id, domainId, domainName) {
    $state.go('app.storage.domain.pool.poolDetail', { poolId: id, domainId: domainId, domainName: domainName });
  }

  $scope.getInformation = function (archiveId, dataNodeEndPoint, datanodeId, archiveType, deviceName) {
    e_archiveId = archiveId;
    e_dataNodeEndPoint = dataNodeEndPoint;
    e_datanodeId = datanodeId;
    e_archiveType = archiveType;
    e_deviceName = deviceName;
  }

  $scope.mountDisk = function (archiveId, dataNodeEndPoint, datanodeId, storageType, deviceName) {
    $scope.mountDiskName = deviceName;
    $scope.mountType = storageType;
    $scope.mountIp = $.trim(dataNodeEndPoint.split(":")[0]);
    if (storageType == "SATA") {
      $("#RAW_DISK").parent().siblings().children().attr("disabled", "disabled");
    }
    $("#mount_disk_modal").modal("show");
    e_archiveId = archiveId;
    e_dataNodeEndPoint = dataNodeEndPoint;
    e_datanodeId = datanodeId;
    e_deviceName = deviceName;
  }

  $scope.reuseConfig = function () {
    var type = e_archiveType.split(",");
    $http({
      method: "POST",
      async: false,
      url: "fixConfigMismatchDisk",
      data: {
        "instanceId": e_datanodeId,
        "archiveId": e_archiveId,
        "endPoint": e_dataNodeEndPoint,
        "archiveType": type.length > 1 ? "MIX_DISK" : type[0],
        "diskName": e_deviceName
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(response) {
      if (response.data.resultMessage.message == "success") {
        showMessage.show($scope, "success", translate.getWord("response.success"));
        vm.dtInstance.reloadData(null, false);
      } else {
        if (response.data.resultMessage.message == "ERROR_0018_SessionOut") {
          showMessage.show($scope, "warn", translate.getWord("session.out"));
          $scope.logout();
          return;
        } else {
          showMessage.show($scope, "error", translate.getWord(response.data.resultMessage.message));
          vm.dtInstance.reloadData(null, false);
        }
      }

    }, function errorCallback(response) {
      showMessage.show($scope, "error", translate.getWord("response.error"));
      vm.dtInstance.reloadData(null, false);

    })
  }

  $scope.checkoutEve = function (countKey) {
    var disable = false;
    if ($scope.mountType == "SATA") {
      $("#RAW_DISK").parent().siblings().children().attr("disabled", "disabled");
    } else {
      if (countKey == 1) {
        if ($scope.rawDisk) {
          $("#RAW_DISK").parent().siblings().children().prop("checked", false);
          $("#RAW_DISK").parent().siblings().children().attr("disabled", "disabled");
        } else {
          $("#RAW_DISK").parent().siblings().children().removeAttr("disabled");
        }
      } else {
        var flag = false;
        $('[name=checkbox-inline]:checkbox').each(function () {
          if (this.checked && this.id != "RAW_DISK") {
            flag = true;
          }
        });
        if (flag) {
          $("#RAW_DISK").prop("checked", false);
          $("#RAW_DISK").attr("disabled", "disabled");
        } else {
          $("#RAW_DISK").removeAttr("disabled");
        }
      }


    }
    $('[name=checkbox-inline]:checkbox').each(function () {
      if (this.checked) {
        disable = true;
      }
    });
    if (disable) {
      $("#mountBtn").removeAttr("disabled");
    } else {
      $("#mountBtn").attr("disabled", "disabled");
    }




  }

  $("#mount_disk_modal").on("hide.bs.modal", function () {
    $scope.rawDisk = false;
    $("#mountBtn").attr("disabled", "disabled");
    $("#RAW_DISK").parent().siblings().children().prop("checked", false);
    $("#RAW_DISK").prop("checked", false);
    $("#RAW_DISK").parent().siblings().children().removeAttr("disabled");
    $("#RAW_DISK").removeAttr("disabled");
  })

  $scope.mountBtn = function () {
    vm.types = [];
    $('[name=checkbox-inline]:checkbox').each(function () {
      if (this.checked) {
        vm.types.push(this.id);
      }
    });
    $http({
      method: "POST",
      async: false,
      url: "onlineDiskWithSettleArchiveType",
      data: {
        "instanceId": e_datanodeId,
        "archiveId": e_archiveId,
        "endPoint": e_dataNodeEndPoint,
        "diskName": e_deviceName,
        "archiveTypesJson": JSON.stringify(vm.types),
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(response) {
      if (response.data.resultMessage.message == "success") {
        showMessage.show($scope, "success", translate.getWord("response.success"));
        vm.dtInstance.reloadData(null, false);
      } else {
        if (response.data.resultMessage.message == "ERROR_0018_SessionOut") {
          showMessage.show($scope, "warn", translate.getWord("session.out"));
          $scope.logout();
          return;
        } else {
          showMessage.show($scope, "error", translate.getWord(response.data.resultMessage.message));
          vm.dtInstance.reloadData(null, false);
        }
      }
    }, function errorCallback(response) {
      showMessage.show($scope, "error", translate.getWord("response.error"));
      vm.dtInstance.reloadData(null, false);
    })
    $("#mount_disk_modal").modal("hide");
  }

  $scope.unmountDisk = function () {
    var type = e_archiveType.split(",");
    $http({
      method: "POST",
      async: false,
      url: "offlineDisk",
      data: {
        "instanceId": e_datanodeId,
        "archiveId": e_archiveId,
        "endPoint": e_dataNodeEndPoint,
        "archiveType": type.length > 1 ? "MIX_DISK" : type[0],
        "diskName": e_deviceName
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(response) {
      if (response.data.resultMessage.message == "success") {
        showMessage.show($scope, "success", translate.getWord("response.success"));
        vm.dtInstance.reloadData(null, false);
      } else {
        if (response.data.resultMessage.message == "ERROR_0018_SessionOut") {
          showMessage.show($scope, "warn", translate.getWord("session.out"));
          $scope.logout();
          return;
        } else {
          showMessage.show($scope, "error", translate.getWord(response.data.resultMessage.message));
          vm.dtInstance.reloadData(null, false);
        }
      }
    }, function errorCallback(response) {
      showMessage.show($scope, "error", translate.getWord("response.error"));
      vm.dtInstance.reloadData(null, false);
    })
  }

  $scope.reuseBrokenDisk = function () {
    var type = e_archiveType.split(",");
    $http({
      method: "POST",
      async: false,
      url: "fixBrokenDisk",
      data: {
        "instanceId": e_datanodeId,
        "archiveId": e_archiveId,
        "endPoint": e_dataNodeEndPoint,
        "archiveType": type.length > 1 ? "MIX_DISK" : type[0],
        "diskName": e_deviceName
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(response) {
      if (response.data.resultMessage.message == "success") {
        showMessage.show($scope, "success", translate.getWord("response.success"));
        vm.dtInstance.reloadData(null, false);

      } else {
        if (response.data.resultMessage.message == "ERROR_0018_SessionOut") {
          showMessage.show($scope, "warn", translate.getWord("session.out"));
          $scope.logout();
          return;

        } else {
          showMessage.show($scope, "error", translate.getWord(response.data.resultMessage.message));
          vm.dtInstance.reloadData(null, false);
        }
      }
    }, function errorCallback(response) {
      showMessage.show($scope, "error", translate.getWord("response.error"));
      vm.dtInstance.reloadData(null, false);
    })
  }

});
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

angular.module('app').factory('Language', function($http, APP_CONFIG){



	function getLanguages(callback) {

		$http.get(APP_CONFIG.apiRootUrl + '/languages.json').then(function(data){

			callback(data.data);
			
		},function(){

			$log.log('Error');
			callback([]);

		});

	}

	return {

		getLanguages:function(callback){
			getLanguages(callback);
		}
	}

});
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

angular.module('app').controller("LanguagesCtrl",  function LanguagesCtrl($scope,$cookieStore, $rootScope, $log, Language,$translate,translate,$state){

    $rootScope.lang = {};
    
    Language.getLanguages(function(data){
        
        $rootScope.languages = data;

    });

    $scope.selectLanguage = function(language){
        $rootScope.currentLanguage = language;
        $cookieStore.remove("lan");
        $cookieStore.put("lan", $rootScope.currentLanguage);
        $translate.use(language.key).then(function(){
        	$state.reload();
        })
    }

});
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

angular.module('app').directive('languageSelector', function(Language){
    return {
        restrict: "EA",
        replace: true,
        templateUrl: "app/layout/language/language-selector.tpl.html",
        scope: true
    }
});
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

angular.module('app').controller("messagesCtrl", function ($scope, translate, $http, $interval, $log, $rootScope, activityService, $location, $state) {
  var timeInterval;
  $scope.activeTab = 'tasks';
  $scope.currentActivityItems = [];
  $scope.ids = [$rootScope.globals.currentAccount.accountId]

  if ($rootScope.globals.currentAccount) {
    let showName = $rootScope.globals.currentAccount.accountName;
    if (showName.length > 10) {
      showName = showName.substring(0, 10) + "...";
    }
    $("#currentAccountName").html(showName);
    $("#currentAccountName").attr("title", $rootScope.globals.currentAccount.accountName);
  }

  $scope.isActive = function (tab) {
    return $scope.activeTab === tab;
  };

  $scope.showMessage = function (th) {
    var ajax_dropdown = null;
    ajax_dropdown = $('.ajax-dropdown');
    if (!ajax_dropdown.is(':visible')) {
      ajax_dropdown.fadeIn(150);//expand

      $interval.cancel(timeInterval)
      listLogSiderbar();
      timeInterval = $interval(listLogSiderbar, 3000);

    } else {
      $interval.cancel(timeInterval);
      ajax_dropdown.fadeOut(150);
    }
  }

  function listLogSiderbar() {
    var resultStr = '';
    $http({
      method: "post",
      data: {
        tempNum: Math.random()
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      url: "listOperation",
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(
      function successCallback(data) {
        data = data.data;
        $.each(data.operationsList, function (i, value) {
          var tempJson;
          var t1, t2, t3, t4, t5, t6, t7, t8;
          if (i < 10) {
            switch (value.status) {
              case "SUCCESS":
                t1 = "fa-check";
                t2 = "green";
                break;
              case "ACTIVITING":
                t1 = "fa-info";
                t2 = "yellow";
                break;
              case "FAILED":
                t1 = "fa-close";
                t2 = "red";
                break;
            }
            t3 = translate.getWord(value.type);
            t4 = translate.getWord(value.targetType);
            if (value.targetName == null || value.targetName == "") {
              t5 = value.operationObject;
            } else if (value.operationObject == null || value.operationObject == "") {
              t5 = value.targetName;
            } else {
              t5 = value.operationObject + "(" + value.targetName + ")"
            }
            var now = new Date();
            var timespan = now.getTime() - parseInt(value.startTime);
            var timespan = Math.floor(timespan / 60000);
            if (timespan < 1) {
              t7 = translate.getWord("time.justnow");
            } else if (timespan < 60) {
              t7 = timespan + translate.getWord("time.minutesago");
            } else if (timespan < 60 * 24) {
              timespan = Math.floor(timespan / 60);
              t7 = timespan + translate.getWord("time.hoursago");
            } else {
              timespan = Math.floor(timespan / 60 / 24);
              t7 = timespan + translate.getWord("time.daysago");
            }
            if (value.status != "ACTIVITING") {
              switch (value.status) {
                case "SUCCESS":
                  t6 = translate.getWord("success"); break;

                case "FAILED":
                  t6 = translate.getWord("fail"); break;
              }
            } else {
              t6 = "ACTIVITING";
              t8 = value.progress;
            }
            resultStr += '<li>'
              + '<span class="padding-10">'
              + '<span class="badge padding-5 no-border-radius bg-color-' + t2 + ' pull-left margin-right-5 margin-top-5"><i class="fa ' + t1 + ' fa-fw "></i></span>'
              + '<span>' + t3 + t4 + t5 + '</span><br>';
            if (value.status == "ACTIVITING") {
              resultStr += '<div class="progress progress-sm progress-striped active"  style="margin-bottom: 8px;">'
                + '<div class="progress-bar bg-color-lightBlue" role="progressbar" style="width: 100%"></div>'
                + '</div><span class="pull-right font-xs text-muted"><i>' + t7 + '</i></span></span></li>'
            } else {
              resultStr += '<div  color=' + t2 + '>' + t6 + '</div><span class="pull-right font-xs text-muted"><i>' + t7 + '</i></span></span></li>'
            }
          }
        });
        $("#operationLog").html(resultStr)
      },
      function errorCallback(response) {
      }
    );
  }

  $(document).mouseup(function (e) {
    var ajax_dropdown = null;
    ajax_dropdown = $('.ajax-dropdown');
    if (ajax_dropdown && !ajax_dropdown.is(e.target) && ajax_dropdown.has(e.target).length === 0) {
      $interval.cancel(timeInterval)
      ajax_dropdown.fadeOut(150);
    }
  });

  $scope.hideWindow = function (flag) {
    var ajax_dropdown = null;
    ajax_dropdown = $('.ajax-dropdown');
    $interval.cancel(timeInterval)
    ajax_dropdown.fadeOut(150);
    if (flag) {
      $location.path("/alarm")
    } else {
      $location.path("/operationLog")
    }
  }

  ;(function($, window, undefined) {
    var $allDropdowns = $();
  
    $.fn.dropdownHover = function(options) {
        $allDropdowns = $allDropdowns.add(this.parent());
        return this.each(function() {
            var $this = $(this).parent(),
                defaults = {
                    delay: 200,
                    instantlyCloseOthers: true
                },
                data = {
                    delay: $(this).data('delay'),
                    instantlyCloseOthers: $(this).data('close-others')
                },
                options = $.extend(true, {}, defaults, options, data),
                timeout;
            $this.hover(function() {
                if(options.instantlyCloseOthers === true)
                    $allDropdowns.removeClass('open');
                clearTimeout(timeout);
                $(this).addClass('open');
            }, function() {
                timeout = setTimeout(function() {
                    $this.removeClass('open');
                }, options.delay);
            });
        });
    };
    $('#login-user').dropdownHover();
  })(jQuery, this);
})

"use strict";

angular.module('app').controller("footCtrl", function ($scope, translate, $http, $rootScope, showMessage) {
  $scope.fixDiv = false;
  $scope.newDiv = false;
  $scope.newIsu = false;
  $scope.fixBug = false;
  $scope.updatePwd = function () {
    $http({
      method: "POST",
      url: "updatePassword",
      data: { "oldPassword": $scope.oldPwd, "newPassword": $scope.newPwd },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(response) {
      $scope.resetUpdate();
      if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
        showMessage.show($scope, "warn", translate.getWord("session.out"));
        $scope.logout();
        return;
      } else if (response.data.resultMessage.message == "success") {

        showMessage.show($scope, "success", translate.getWord("response.success"));

      } else {
        showMessage.show($scope, "error", translate.getWord(response.data.resultMessage.message));

      }
    })
  }

  $scope.resetUpdate = function () {
    $scope.oldPwd = "";
    $scope.newPwd = "";
    $scope.updateForm.$setPristine();
    $scope.updateForm.$setUntouched();
    document.getElementById("updateForm").reset();
  }

  function getSystemInfo() {
    $http({
      method: "post",
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      url: "getSystemInfo",
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(response) {
      if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
        showMessage.show($scope, "warn", translate.getWord("ERROR_0019_SessionOut"));
        $scope.logout();
        return;
      } else if (response.data.resultMessage.message == "success") {
        $scope.name = response.data.name;
        $scope.version = response.data.version.replace(/\"/g, "");
        $scope.email = response.data.email;
        $scope.tel = response.data.tel;
        $scope.time = response.data.timeStamp.split("_")[0];
        $scope.corporation = response.data.corporation;
        var fix = "";
        var str = "";
        if (response.data.fixedIssuesStringList.length > 0) {
          $scope.fixBug = true;
          angular.forEach(response.data.fixedIssuesStringList, function (data, index) {
            fix = fix + "<div class='col-sm-12' style='padding:10px 0px'>" + (++index) + ":" + data + "</div>"
          })
        } else {
          $scope.fixBug = false;
        }
        if (response.data.newFeaturesStringList.length > 0) {
          $scope.newIsu = true;
          angular.forEach(response.data.newFeaturesStringList, function (data, index) {
            str = str + "<div class='col-sm-12' style='padding:10px 0px'>" + (++index) + ":" + data + "</div>"
          })
        } else {
          $scope.newIsu = false;
        }
        $(".fixList").html(fix);
        $(".newList").html(str);
      } else {
        showMessage.show($scope, "error", translate.getWord(response.data.resultMessage.message));
      }
    }, function errorCallback(response) {
    });
  }

  $scope.versionInfo = function () {
    $("#version_modal").modal("show");
    getSystemInfo();
  }

  $("#version_modal").on("hide.bs.modal", function () {
    $scope.fixDiv = false;
    $scope.newDiv = false;
    $scope.newIsu = false;
    $scope.fixBug = false;
    $(".fixSpan").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
    $(".fixSpan").prev().html("展开");
    $(".newSpan").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
    $(".newSpan").prev().html("展开");
  })

  $scope.expand = function (item) {
    if (item == "fix") {
      $scope.fixDiv = !$scope.fixDiv
      if ($(".fixSpan").hasClass("glyphicon-chevron-down")) {
        $(".fixSpan").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
        $(".fixSpan").prev().html("收起");
      } else {
        $(".fixSpan").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
        $(".fixSpan").prev().html("展开");
      }
    } else {
      $scope.newDiv = !$scope.newDiv
      if ($(".newSpan").hasClass("glyphicon-chevron-down")) {
        $(".newSpan").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
        $(".newSpan").prev().html("收起");
      } else {
        $(".newSpan").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
        $(".newSpan").prev().html("展开");
      }
    }
  }
})

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

angular.module('app').directive('toggleShortcut', function($log,$timeout) {

	var initDomEvents = function($element){

		var shortcut_dropdown = $('#shortcut');

		$element.on('click',function(){
		
			if (shortcut_dropdown.is(":visible")) {
				shortcut_buttons_hide();
			} else {
				shortcut_buttons_show();
			}

		})

		shortcut_dropdown.find('a').click(function(e) {
			e.preventDefault();
			window.location = $(this).attr('href');
			setTimeout(shortcut_buttons_hide, 300);
		});

		

		// SHORTCUT buttons goes away if mouse is clicked outside of the area
		$(document).mouseup(function(e) {
			if (shortcut_dropdown && !shortcut_dropdown.is(e.target) && shortcut_dropdown.has(e.target).length === 0) {
				shortcut_buttons_hide();
			}
		});

		// SHORTCUT ANIMATE HIDE
		function shortcut_buttons_hide() {
			shortcut_dropdown.animate({
				height : "hide"
			}, 300, "easeOutCirc");
			$('body').removeClass('shortcut-on');

		}

		// SHORTCUT ANIMATE SHOW
		function shortcut_buttons_show() {
			shortcut_dropdown.animate({
				height : "show"
			}, 200, "easeOutCirc");
			$('body').addClass('shortcut-on');
		}
	}

	var link = function($scope,$element){
		$timeout(function(){
			initDomEvents($element);
		});
	}

	return{
		restrict:'EA',
		link:link
	}
})
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

angular.module('app.storage').controller('AccessRuleCtrl', function (focus, $scope, showMessage, translate, $interval, $http, DTOptionsBuilder, DTColumnBuilder, $compile, $rootScope) {
  $(".modal").draggable();
  $scope.permission = [{ 'value': "", 'txt': "请选择读写权限" },
  { 'value': "READ", 'txt': "只读" },
  { 'value': "READWRITE", 'txt': "读写" }];
  $scope.showFlag = 2;

  $(".modal").draggable();
  $scope.reset = function () {
    $scope.create = { remoteHostName: "" };
    $scope.createForm.$setPristine();
    $scope.createForm.$setUntouched();
    document.getElementById("create_access_rule_form").reset();
    $("#readWritePermission").selectpicker("val", "");
    $("#readWritePermission").selectpicker("refresh");
    $scope.readWritePermission = "";
    $scope.driverUsername = "";
    $scope.driverPassword = "";
    $scope.driverOutUsername = "";
    $scope.driverOutPassword = "";
  }
  $scope.permissionChange = function () {
    if ($scope.showFlag == 1) {
      $scope.permission = [{ 'value': "", 'txt': "请选择读写权限" },
      { 'value': "Read-Only", 'txt': "只读" },
      { 'value': "Read/Write", 'txt': "读写" }];
    } else if ($scope.showFlag == 2) {
      $scope.permission = [{ 'value': "", 'txt': "请选择读写权限" },
      { 'value': "READ", 'txt': "只读" },
      { 'value': "READWRITE", 'txt': "读写" }];
    }
    $("#readWritePermission").selectpicker("refresh");
    $('#readWritePermission').on('shown.bs.select', function (e) {
      $("#readWritePermission").selectpicker("refresh");
      $("#readWritePermission").selectpicker("val", "");
    });
  }

  $scope.doFocus = function () {
    if ($scope.showFlag == 1) {
      $scope.readWritePermission = "Read/Write"
      focus("remoteHostName");
    } else if ($scope.showFlag == 2) {
      $scope.readWritePermission = "READWRITE"
      focus("ruleNotes");
    }
  }

  $scope.applyBtn = function () {
    var tempArr = []
    if ($scope.showFlag == 1) {
      for (var id in vm.selectedApply) {
        if ($("#" + id)) {
          if (vm.selectedApply[id]) {
            tempArr.push(id)
          }
        }
      }
      $http({
        method: "post",
        data: { 'ruleId': $scope.currentId, 'idsJson': JSON.stringify(tempArr) },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        url: "applyVolumeAccessRuleOnVolumes",
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      }).then(function successCallback(response) {
        if (response.data.resultMessage.message == "success") {

          if (response.data.errorList.length > 0) {
            var errorStr = "下列卷应用客户机规则失败:"
            var errorVolume = [];
            angular.forEach(response.data.errorList, function (data, index, array) {
              errorVolume.push(data.volumeName);

            })
            errorStr = errorStr + errorVolume.join(",")
            showMessage.show($scope, "error", errorStr);
          } else {
            showMessage.show($scope, "success", translate.getWord("response.success"));
          }

          vm.selectedApply = {};
          vm.selectedCancel = {};
          vm.dtInstanceApply.reloadData(null, false);
          vm.dtInstanceCancel.reloadData(null, false);
        } else {
          if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
          } else {
            showMessage.show($scope, "error", translate.getWord(response.data.resultMessage.message));
          }

        }

      });
    } else {
      for (var id in vm.selectedApplyIO) {
        if ($("#" + id)) {
          if (vm.selectedApplyIO[id]) {
            tempArr.push({ 'driverContainerId': id.split('-')[0], 'volumeId': $("#" + id).find("input[name='applyIOTips']").attr('volumeId'), 'snapshotId': $("#" + id).find("input[name='applyIOTips']").attr('snapshotId'), 'driverType': $("#" + id).find("input[name='applyIOTips']").attr('driverType') })
          }
        }
      }
      $http({
        method: "post",
        data: { 'ruleId': $scope.currentId, 'driverKeysJson': JSON.stringify(tempArr) },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        url: "applyIscsiAccessRuleOnIscsis",
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      }).then(function successCallback(response) {
        if (response.data.resultMessage.message == "success") {
          showMessage.show($scope, "success", translate.getWord("response.success"));
          vm.selectedApplyIO = {};
          vm.selectedCancelIO = {};
          vm.dtInstanceApplyIO.reloadData(null, false);
          vm.dtInstanceCancelIO.reloadData(null, false);
        } else {
          if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
          } else {
            showMessage.show($scope, "error", translate.getWord(response.data.resultMessage.message));
          }

        }

      });
    }
  }
  $scope.modelRefresh = function () {

    if ($scope.showFlag == 1) {
      vm.dtInstanceApply.reloadData(null, false);
      vm.dtInstanceCancel.reloadData(null, false);
    } else {
      vm.dtInstanceApplyIO.reloadData(null, false);
      vm.dtInstanceCancelIO.reloadData(null, false);
    }
  }
  $scope.cancelBtn = function () {
    var tempArr = []
    if ($scope.showFlag == 1) {
      for (var id in vm.selectedCancel) {
        if ($("#" + id)) {
          if (vm.selectedCancel[id]) {
            tempArr.push(id)
          }
        }
      }
      $http({
        async: false,
        method: "post",
        data: { ruleId: $scope.currentId, "idsJson": JSON.stringify(tempArr) },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        url: "cancelVolAccessRuleAllApplied",
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      }).then(function successCallback(data) {
        data = data.data;
        if (data.resultMessage.message != "success") {
          if (data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
          } else {
            showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
            return;
          }
        } else {
          vm.selectedApply = {};
          vm.selectedCancel = {};
          vm.dtInstanceApply.reloadData(null, false);
          vm.dtInstanceCancel.reloadData(null, false);
        }

      })
    } else {
      for (var id in vm.selectedCancelIO) {
        if ($("#" + id)) {
          if (vm.selectedCancelIO[id]) {
            tempArr.push({ 'driverContainerId': id.split('-')[0], 'volumeId': $("#" + id).find("input[name='cancelIOTips']").attr('volumeId'), 'snapshotId': $("#" + id).find("input[name='cancelIOTips']").attr('snapshotId'), 'driverType': $("#" + id).find("input[name='cancelIOTips']").attr('driverType') })
          }
        }
      }
      $http({
        method: "post",
        data: { 'ruleId': $scope.currentId, 'driverKeysJson': JSON.stringify(tempArr) },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        url: "cancelIscsiAccessRuleAllApplied",
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      }).then(function successCallback(response) {
        if (response.data.resultMessage.message == "success") {
          showMessage.show($scope, "success", translate.getWord("response.success"));
          vm.selectedApplyIO = {};
          vm.selectedCancelIO = {};
          vm.dtInstanceApplyIO.reloadData(null, false);
          vm.dtInstanceCancelIO.reloadData(null, false);
        } else {
          if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
          } else {
            showMessage.show($scope, "error", translate.getWord(response.data.resultMessage.message));
          }

        }

      });
    }
  }
  $scope.addAccessRule = function () {
    if ($scope.showFlag == 1) {
      $http({
        method: "post",
        data: { "remoteHostName": $("#remoteHostName").val(), "readWritePermission": $scope.readWritePermission },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        url: "createVolumeAccessRule",
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      }).then(function successCallback(response) {
        if (response.data.simpleVolumeAccessRule.message == "success") {
          showMessage.show($scope, "success", translate.getWord("response.success"));
          $('#new_modal').modal('hide')
          $scope.reset()
          reloadData()
        } else {
          if (response.data.simpleVolumeAccessRule.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
          } else {
            showMessage.show($scope, "error", translate.getWord(response.data.simpleVolumeAccessRule.message));
            $('#new_modal').modal('hide')
            $scope.reset()
            reloadData()
          }

        }

      });
    } else if ($scope.showFlag == 2) {
      $http({
        method: "post",
        data: {
          "initiatorName": $("#remoteHostName").val(),
          "permission": $scope.readWritePermission,
          "user": $("#password").val() == "" ? "" : $("#username").val(),
          "passwd": $("#username").val() == "" ? "" : $("#password").val(),
          "ruleNotes": $("#ruleNotes").val(),
          "outUser": $("#outPassword").val() == "" ? "" : $("#outgoingUser").val(),
          "outPasswd": $("#outgoingUser").val() == "" ? "" : $("#outPassword").val()
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        url: "createIscsiAccessRules ",
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      }).then(function successCallback(response) {
        if (response.data.resultMessage.message == "success") {
          showMessage.show($scope, "success", translate.getWord("response.success"));
          $('#new_modal').modal('hide')
          $scope.reset()
          reloadDataF()
        } else {
          if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
          } else {
            showMessage.show($scope, "error", translate.getWord(response.data.resultMessage.message));
            $('#new_modal').modal('hide')
            $scope.reset()
            reloadDataF()
          }

        }
        reloadDataF()
      });
    }

  }
  $scope.reloadDataAll = function () {
    if ($scope.showFlag == 1) {
      $('#chkAllBtn').prop('checked', false)
      vm.dtInstance.reloadData(null, false);
    } else if ($scope.showFlag == 2) {
      $('#checkedAllF').prop('checked', false)
      vm.dtInstanceF.reloadData(null, false);
    }
  }
  $scope.deleteRule = function () {
    var ruleListToDelete = [];
    if ($scope.showFlag == 1) {
      $("input[name='ruleCheckbox']:checked").each(function (index, checkbox) {
        var ruleId = $(this).parent().parent().parent().prop("id");
        var host = $(this).parent().parent().next().html();
        var permission = $(this).parent().parent().next().next().html();
        ruleListToDelete.push({ id: ruleId, host: host, permission: permission });
      });

    } else if ($scope.showFlag == 2) {
      $("input[name='ruleCheckbox']:checked").each(function (index, checkbox) {
        var ruleId = $(this).parents("tr").prop("id");
        var host = $(this).parents("tr").children().eq(2).html();
        var permission = "";
        switch ($(this).parents("tr").children().eq(3).html()) {
          case translate.getWord("volume.readOnly"):
            permission = "READ"; break;
          case translate.getWord("volume.readWrite"):
            permission = "READWRITE"; break;
        }0
        var user = $(this).parents("tr").children().eq(4).html();
        var outUser = $(this).parents("tr").children().eq(5).html();
        var ruleNotes = $(this).parents("tr").children().eq(1).html()
        ruleListToDelete.push({ id: ruleId, initiatorName: host, user: user, outUser: outUser, ruleNotes: ruleNotes, permission: permission });
      });
    }
    if (ruleListToDelete.length != 0) {
      var ruleListJson = JSON.stringify(ruleListToDelete);
      deleteVolumeAccessRules(ruleListJson, "false");
    }

  }
  function deleteVolumeAccessRules(ruleListJson, isConfirmString) {
    if ($scope.showFlag == 1) {
      $http({
        async: false,
        method: "post",
        data: { "isConfirm": isConfirmString, "ruleList": ruleListJson },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        url: "deleteVolumeAccessRules",
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      }).then(function successCallback(data) {
        data = data.data;
        if (data.operationResult) {
          var existingActionOnRuleList = data.operationResult.existingActionOnRuleList;
          var appliedRule2VolumeTable = data.operationResult.appliedRule2VolumeTable;
        }

        $('#deleteRules').prop("disabled", true)
        vm.selectAll = false;
        vm.selected = {};
        if (existingActionOnRuleList.length > 0) {
          showMessage.show($scope, "warn", "Could not delete "
            + existingActionOnRuleList
            + " due to existing other operation on them");
          return;
        }
        if (isConfirmString == "true") {
          if (data.resultMessage.message != null) {
            if (data.resultMessage.message == "ERROR_0019_SessionOut") {
              showMessage.show($scope, "warn", translate.getWord("session.out"));
              $scope.logout();
            } else {
              showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
            }
          } else {
            showMessage.show($scope, "success", translate.getWord("response.success"));
          }
          reloadData()
          return;
        }
        if (Object.keys(appliedRule2VolumeTable).length > 0) {
          var warningMessage = translate.getWord("delete.accessRule.question2");
          $.map(appliedRule2VolumeTable, function (volume,
            rule) {
            warningMessage = warningMessage + "<div class='deleteNames'>" + rule + "&nbsp;" + translate.getWord("apply.to") + "&nbsp;" + volume + "</div>";
          });

          newConfirm(translate.getWord("disk.operation.confirm"), warningMessage, function (rt) {
            if (rt) {
              deleteVolumeAccessRules(ruleListJson, "true");
            }
          }, translate.getWord("button.confirm"), translate.getWord("button.cancel"))
        } else {
          if (data.resultMessage.message != null) {
            if (data.resultMessage.message == "ERROR_0019_SessionOut") {
              showMessage.show($scope, "warn", translate.getWord("session.out"));
              $scope.logout();
            } else {
              showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
            }
          } else {
            showMessage.show($scope, "success", translate.getWord("response.success"));
          }
          reloadData()
          return;
        }
      });

    } else if ($scope.showFlag == 2) {
      $http({
        async: false,
        method: "post",
        data: { "isConfirm": isConfirmString, "iscsiRulesJson": ruleListJson },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        url: "deleteIscsiAccessRules",
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      }).then(function successCallback(data) {
        data = data.data;
        var existingActionOnRuleList = data.iscsiAccessRulesHasAction;
        var appliedRule2VolumeTable = data.beAppliedRule2Drivers;
        $('#deleteRules').prop("disabled", true)
        vm.selectAllF = false;
        vm.selectedF = {};
        if (existingActionOnRuleList && existingActionOnRuleList.length > 0) {
          showMessage.show($scope, "warn", "Could not delete "
            + existingActionOnRuleList
            + " due to existing other operation on them");
          return;
        }
        if (!existingActionOnRuleList && !appliedRule2VolumeTable) {
          if (data.resultMessage.message != "success") {
            if (data.resultMessage.message == "ERROR_0019_SessionOut") {
              showMessage.show($scope, "warn", translate.getWord("session.out"));
              $scope.logout();
            } else {
              showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
            }
          } else {
            showMessage.show($scope, "success", translate.getWord("response.success"));
          }
          reloadDataF()
          return;
        }
        if (Object.keys(appliedRule2VolumeTable).length > 0) {
          var warningMessage = translate.getWord("delete.accessRule.question3");
          var ioArr = [];
          $.map(data.beAppliedRule2Drivers, function (k, v) {
            ioArr = [];
            for (var i = 0; i < k.length; i++) {
              var a = k[i].driverType;
              var b = k[i].driverContainerIp;
              var c = k[i].host;
              ioArr.push(b + "(" + (a == "NBD" ? "PYD" : a) + "):" + c + "<br/>")
            }

            warningMessage += "<div class='deleteNames'>" + v.getQuery("initiatorName") + "&nbsp;" + translate.getWord("apply.to") + "&nbsp;" + ioArr.join(",") + "</div>";
          });
          newConfirm(translate.getWord("disk.operation.confirm"), warningMessage, function (rt) {
            if (rt) {
              deleteVolumeAccessRules(ruleListJson, "true");
            } else {
              reloadDataF()
            }
          }, translate.getWord("button.confirm"), translate.getWord("button.cancel"))
        } else {
          if (data.resultMessage.message != "success") {
            if (data.resultMessage.message == "ERROR_0019_SessionOut") {
              showMessage.show($scope, "warn", translate.getWord("session.out"));
              $scope.logout();
            } else {
              showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
            }
          } else {
            showMessage.show($scope, "success", translate.getWord("response.success"));
          }
          reloadDataF()
          return;
        }
      });
    }


  }
  String.prototype.getQuery = function (name) {
    var reg = new RegExp("(\\{|(,\\s*))" + name + "=\\S*(,|\\})");
    var r = this.substr(this.indexOf("\{")).match(reg);
    var m = r[0].substring(r[0].indexOf("=") + 2);
    m = m.substr(0, m.length - 2);
    if (m != null) return m; return null;
  }
  $scope.getDeleteNames = function () {
    var ruleNameListToDelete = [];
    $("input[name='ruleCheckbox']:checked").each(function (index, checkbox) {
      var $ruleName = $(this).parent().parent().next().html();
      ruleNameListToDelete.push($ruleName);
    });
    if (ruleNameListToDelete.length != 0) {
      $scope.deleteNames = ruleNameListToDelete.join(",");
    }
  }
  var vm = this;
  vm.selected = {};
  vm.selectAll = false;
  vm.toggleAll = toggleAll;
  vm.toggleOne = toggleOne;
  $scope.deleteNames = "";
  vm.dtOptions = DTOptionsBuilder.newOptions()
    .withDOM("<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
      "t" +
      "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>")
    .withBootstrap()
    .withOption('ajax', {
      url: BASE_API + 'listAccessRulesDT',
      dataSrc: function (data) {
        if (data.resultMessage.message != "success") {
          if (data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
          } else {
            return [];
          }
        } else {
          vm.selected = {};
          vm.selectAll = false;
          return data.data
        }

      },
      type: 'POST'
    })
    .withDataProp('data')
    .withOption('processing', true)
    .withOption('serverSide', true)
    .withOption('fnInitComplete',function(){
      $('#chkAllBtn').click((e) =>{
        toggleAll(e.target.checked,vm.selected)
      })
    })
    .withOption('fnDrawCallback', function (result) {
      $(".selectpicker").selectpicker("render");
      $('#deleteRules').prop("disabled", true);
      $("#ruleTab_filter").find("input").addClass("filter_input");
      $(".ruleClearItem").remove();
      $('<i class="fa fa-times-circle item-error-style ruleClearItem" onclick="clearFilter(\'' + 'ruleTab_filter' + '\')"></i>').insertAfter($("#ruleTab_filter").find("input"));
      if ($("#ruleTab_filter").find("input").val() == "") {
        $(".ruleClearItem").hide();
      } else {
        $(".ruleClearItem").show();
      }
      $("#ruleTab_filter").find("input").unbind('keyup', showItem);
      $("#ruleTab_filter").find("input").bind('keyup', { cName: 'ruleClearItem' }, showItem);
      $(".ruleClearItem").click(function (e) {
        e.stopPropagation();
        e.preventDefault();
        $('#ruleTab').DataTable().search("").draw();
      })
      if ($("#ruleTab .dataTables_empty").size()) {
        $("#ruleTab_paginate").hide()
      } else {
        $("#ruleTab_paginate").show()
      }
    })
    .withOption('createdRow', function (row, data, dataIndex) {
      $compile(angular.element(row).contents())($scope);
    })
    .withOption('headerCallback', function (header) {
      if (!vm.headerCompiled) {
        vm.headerCompiled = true;
        $compile(angular.element(header).contents())($scope);
      }
    })
    .withOption('rowId', 'ruleId')
    .withLanguage({
      "search": "",
      "searchPlaceholder": '查询客户机IP',
      "aria": {
        "sortAscending": ": activate to sort column ascending",
        "sortDescending": ": activate to sort column descending"
      },
      "emptyTable": "表中数据为空",
      "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
      "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
      "order": [[2, "asc"]],
      "infoFiltered": "(由 _MAX_ 项结果过滤)",
      "zeroRecords": "表中数据为空",
      "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +

        '<option value="5" >5条</option>' +
        '<option value="10" >10条</option>' +
        '<option value="20" >20条</option>' +
        '<option value="50" >50条</option>' +
        '<option value="100" >100条</option>' +
        '</select>&nbsp;' + '  ',
      "paginate": {
        "previous": '<i class="fa fa-angle-left"></i>',
        "next": '<i class="fa fa-angle-right"></i>',
        "last": '<i class="fa  fa-angle-double-right"></i>',
        "first": '<i class="fa  fa-angle-double-left"></i>'
      }
    })
    .withPaginationType('full_numbers');
  vm.dtColumns = [
    DTColumnBuilder.newColumn('ruleId').withTitle('ID').notVisible(),
    DTColumnBuilder.newColumn(null).notSortable().withClass('checkbox_col')
      .withTitle('<span class="check_span"><input id="chkAllBtn" type="checkbox" ng-model="datatables.selectAll" class="input_check"><label for="chkAllBtn"></label></span>')
      .renderWith(function (data, type, row) {
        vm.selected[row.ruleId] = false;
        return '<span class="check_span"><input type="checkbox" name="ruleCheckbox" ng-model="datatables.selected[\'' + row.ruleId + '\']" ng-click="datatables.toggleOne(datatables.selected)" class="input_check" id="checkbox_' + row.ruleId + '"><label for="checkbox_' + row.ruleId + '"></label></span>'
      }),
    DTColumnBuilder.newColumn('remoteHostName').withTitle("客户机IP"),
    DTColumnBuilder.newColumn('permission').withTitle("读写权限").renderWith(function (data, type, row) {
      var resultString = ""
      switch (data) {
        case "Read-Only":
          resultString = "只读"; break;
        case "Read/Write":
          resultString = "读写"; break;
      }
      return resultString;
    }),
    DTColumnBuilder.newColumn('status').withTitle("状态")
      .renderWith(function (data, type, row) {
        var resultString = ""
        switch (data) {
          case "FREE":
            resultString = "<span class='status_green'>" + translate.getWord("volume.accessRule.status.free") + "</span>"; break;
          case "APPLING":
            resultString = "<span class='status_green'>" + translate.getWord("status.appling") + "</span>"; break;
          case "APPLIED":
            resultString = "<span class='status_green'>" + translate.getWord("status.applied") + "</span>"; break;
          case "CANCELING":
            resultString = '<div class="progress progress-striped active" ><div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>' + translate.getWord("status.cancel") + '</span></div></div>'; break;
          case "DELETING":
            resultString = '<div class="progress progress-striped active" ><div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>' + translate.getWord("status.deleting") + '</span></div></div>'; break;
          case "AVAILABLE":
            resultString = "<span class='status_green'>" + translate.getWord("status.available") + "</span>"; break;
        }
        return resultString;
      }),
    DTColumnBuilder.newColumn(null).withTitle('操作').renderWith(function (data, type, row) {
      if (!$rootScope.apis.Access_Rule || !($rootScope.apis.Access_Rule.applyVolumeAccessRuleOnVolumes || $rootScope.apis.Access_Rule.cancelVolAccessRuleAllApplied)) {
        return "";
      }
      return '<div class="btn-group dropdown-btn"  >' +
        '<button type="button" class="btn btn_lightblue btn-xs my-drop-down" ng-click="showDown(\'' + row.ruleId + '\');$event.stopPropagation();">操作 <span class="caret"></span></button>'
        + '<ul class="down" style="min-width:110px;">'
        + '<li><a data-toggle="modal" data-target="#applyRule_modal" ng-click="applyRule(\'' + row.ruleId + '\',\'' + row.remoteHostName + '\')">授权</a></li>'
        + '</ul></div>'
    }).notSortable()
  ];
  $scope.showDown = function (id) {
    if ($(".temp-show").size()) {
      $(".temp-show").hide();
      $(".temp-show").removeClass("temp-show")
    } else {
      $("#" + id).find(".my-drop-down").eq(0).next().addClass("temp-show");
      $(".temp-show").toggle()
    }
    $(document).one("click", function () {
      $(".temp-show").hide();
      $(".temp-show").removeClass("temp-show")
    });
  }
  vm.dtInstance = {};
  vm.reloadData = reloadData;
  $scope.reloadData = function () {
    vm.dtInstance.reloadData(null, false);
    vm.selectedF = {};
    vm.selectAllF = false;
  }
  function reloadData() {
    vm.dtInstance.reloadData(null, false);
    vm.selectedF = {};
    vm.selectAllF = false;
  }


  vm.selectedF = {};
  vm.selectAllF = false;
  vm.dtOptionsF = DTOptionsBuilder.newOptions()
    .withDOM("<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
      "t" +
      "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>")
    .withBootstrap()
    .withOption('ajax', {
      url: BASE_API + 'listIscsiAccessRulesDT',
      type: 'POST',
      dataSrc: function (data) {
        vm.selectedF = {};
        vm.selectAllF = false;
        if (data.resultMessage.message != "success") {
          if (data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "error", translate.getWord("session.out"));
            $scope.logout();
          } else {
            return [];
          }
        } else {
          return data.data
        }

      }
    })
    .withOption('processing', true)
    .withOption('serverSide', true)
    .withOption('createdRow', function (row, data, dataIndex) {
      $compile(angular.element(row).contents())($scope);
    })
    .withOption('headerCallback', function (header) {
      if (!vm.headerCompiledF) {
        vm.headerCompiledF = true;
        $compile(angular.element(header).contents())($scope);
      }
    })
    .withOption('fnInitComplete',function(){
      $('#checkedAllF').click((e) =>{
        toggleAll(e.target.checked,vm.selectedF)
      })
    })
    .withOption('fnDrawCallback', function (result) {
      $('#deleteRules').prop("disabled", true);
      $("#chapTab_filter").find("input").addClass("filter_input");
      $(".chapClearItem").remove();
      $('<i class="fa fa-times-circle item-error-style chapClearItem" onclick="clearFilter(\'' + 'chapTab_filter' + '\')"></i>').insertAfter($("#chapTab_filter").find("input"));
      if ($("#chapTab_filter").find("input").val() == "") {
        $(".chapClearItem").hide();
      } else {
        $(".chapClearItem").show();
      }
      $("#chapTab_filter").find("input").unbind('keyup', showItem);
      $("#chapTab_filter").find("input").bind('keyup', { cName: 'chapClearItem' }, showItem);
      $(".chapClearItem").click(function (e) {
        e.stopPropagation();
        e.preventDefault();
        $('#chapTab').DataTable().search("").draw();
      })
      if ($("#chapTab .dataTables_empty").size()) {
        $("#chapTab_paginate").hide()
      } else {
        $("#chapTab_paginate").show()
      }
      $(".selectpicker").selectpicker("refresh")
    })
    .withOption('rowId', 'ruleId')
    .withLanguage({
      "search": "",
      "searchPlaceholder": '查询名称',
      "aria": {
        "sortAscending": ": activate to sort column ascending",
        "sortDescending": ": activate to sort column descending"
      },
      "emptyTable": "表中数据为空",
      "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
      "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
      "order": [[2, "asc"]],
      "infoFiltered": "(由 _MAX_ 项结果过滤)",
      "zeroRecords": "表中数据为空",
      "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
        '<option value="5" >5条</option>' +
        '<option value="10" >10条</option>' +
        '<option value="20" >20条</option>' +
        '<option value="50" >50条</option>' +
        '<option value="100" >100条</option>' +
        '</select>&nbsp;' + '  ',
      "paginate": {
        "previous": '<i class="fa fa-angle-left"></i>',
        "next": '<i class="fa fa-angle-right"></i>',
        "last": '<i class="fa  fa-angle-double-right"></i>',
        "first": '<i class="fa  fa-angle-double-left"></i>'
      }
    })
    .withPaginationType('full_numbers');
  vm.dtColumnsF = [
    DTColumnBuilder.newColumn('ruleId').withTitle('ID').notVisible(),
    DTColumnBuilder.newColumn(null).notSortable().withClass('checkbox_col')
      .withTitle("<span class='check_span'><input class='input_check' type='checkbox' id='checkedAllF' ng-model='datatables.selectAllF' /><label for='checkedAllF'></label></span>")
      .renderWith(function (data, type, row) {
        vm.selectedF[row.ruleId] = false;
        return '<span class="check_span"><input class="input_check" ng-model="datatables.selectedF[\'' + row.ruleId + '\'];" name="ruleCheckbox" ng-click="datatables.toggleOne(datatables.selectedF)" type="checkbox" id="checkbox_' + row.ruleId + '"><label for="checkbox_' + row.ruleId + '"></label></span>';
      }),
    DTColumnBuilder.newColumn('ruleNotes').withTitle('规则名称'),
    DTColumnBuilder.newColumn('initiatorName').withTitle('Initiator名称'),
    DTColumnBuilder.newColumn(null).withTitle("读写权限").renderWith(function (data, type, row) {

      var rwStr = "";

      switch (row.permission) {
        case "READ":
          rwStr = translate.getWord("volume.readOnly"); break;
        case "READWRITE":
          rwStr = translate.getWord("volume.readWrite"); break;
      }
      return rwStr;
    }),
    DTColumnBuilder.newColumn('user').withTitle("incoming用户"),
    DTColumnBuilder.newColumn('outUser').withTitle("outgoing用户"),
    DTColumnBuilder.newColumn('status').withTitle("客户机状态")
      .renderWith(function (data, type, row) {
        var resultString = ""
        switch (data) {
          case "FREE":
            resultString = "<span class='status_green'>" + translate.getWord("status.appling") + "</span>"; break;
          case "APPLING":
            resultString = "<span class='status_green'>" + translate.getWord("status.appling") + "</span>"; break;
          case "APPLIED":
            resultString = "<span class='status_green'>" + translate.getWord("status.applied") + "</span>"; break;
          case "CANCELING":
            resultString = '<div class="progress progress-striped active" ><div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>' + translate.getWord("status.cancel") + '</span></div></div>'; break;
          case "DELETING":
            resultString = '<div class="progress progress-striped active" ><div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>' + translate.getWord("status.deleting") + '</span></div></div>'; break;
          case "AVAILABLE":
            resultString = "<span class='status_green'>" + translate.getWord("status.available") + "</span>"; break;
        }
        return resultString;
      }),
    DTColumnBuilder.newColumn(null).withTitle('操作').renderWith(function (data, type, row) {
      if (!$rootScope.apis.Access_Rule || !($rootScope.apis.Access_Rule.applyIscsiAccessRules || $rootScope.apis.Access_Rule.cancelIscsiAccessRules)) {
        return "";
      }
      return '<div class="btn-group dropdown-btn"  >' +
        '<button type="button" class="btn btn_lightblue btn-xs my-drop-down" ng-click="showDown(\'' + row.ruleId + '\');$event.stopPropagation();">操作 <span class="caret"></span></button>'
        + '<ul class="down" style="min-width:110px;">'
        + '<li><a data-toggle="modal" data-target="#applyDriver_modal" ng-click="applyInitiator(\'' + row.ruleId + '\',\'' + row.ruleNotes + '\')">授权</a></li>'
        + '</ul></div>'
    }).notSortable()
  ];

  vm.dtInstanceF = {};
  vm.reloadDataF = reloadDataF;
  $scope.reloadDataF = function () {
    vm.dtInstanceF.reloadData(null, false);
    vm.selected = {};
    vm.selectAll = false;
  }
  function reloadDataF() {
    vm.dtInstanceF.reloadData(null, false);
    vm.selected = {};
    vm.selectAll = false;
  }

  function toggleAll(selectAll, selectedItems) {
    for (var id in selectedItems) {
      if (selectedItems.hasOwnProperty(id)) {
        selectedItems[id] = selectAll;
        $("#checkbox_" + id).prop("checked", selectAll);
        if (selectAll == false) {
          $('#' + id).removeClass("active");
        } else {
          $('#' + id).addClass("active");
        }
      }
    }
    for (var id in selectedItems) {
      if (selectedItems[id]) {
        $('#deleteRules').prop("disabled", false)
        break;
      } else {
        $('#deleteRules').prop("disabled", true)
      }
    }
  }

  function toggleOne(selectedItems) {
    for (var id in selectedItems) {
      if (selectedItems[id]) {
        $('#deleteRules').prop("disabled", false)
        break;
      } else {
        $('#deleteRules').prop("disabled", true)
      }
    }
    if ($scope.showFlag == 1) {
      for (var id in selectedItems) {
        if (selectedItems.hasOwnProperty(id)) {
          if (!selectedItems[id]) {
            vm.selectAll = false;
            $('#chkAllBtn').prop('checked',false)
            $('#' + id).removeClass("active")
            return;
          } else {
            $('#' + id).addClass("active");
          }
        }
      }
      vm.selectAll = true;
    } else if ($scope.showFlag == 2) {
      for (var id in selectedItems) {
        if (selectedItems.hasOwnProperty(id)) {
          if (!selectedItems[id]) {
            vm.selectAllF = false;
            $('#checkedAllF').prop('checked',false)
            $('#' + id).removeClass("active")
            return;
          } else {
            $('#' + id).addClass("active");
          }
        }
      }
      vm.selectAllF = true;
    }
  }
  vm.selectedApply = {};
  vm.selectAllApply = false;
  $scope.applySwitch = false;
  vm.selectedCancel = {};
  vm.selectAllCancel = false;
  vm.toggleAllAC = toggleAllAC;
  vm.toggleOneAC = toggleOneAC;
  vm.applyPool = true;
  vm.cancelPool = true;
  vm.applyDriver = true;
  vm.cancelDriver = true;
  $scope.applyRule = function (id, name) {
    $scope.currentId = id;
    $scope.currentName = name;
    $scope.applySwitch = true;

    vm.dtOptionsApply = DTOptionsBuilder.newOptions()
      .withBootstrap()
      .withOption('ajax', {
        data: { ruleId: $scope.currentId, randomData: Math.random() },
        url: 'getUnappliedVolumes',
        type: 'POST',
        dataSrc: function (data) {
          if (data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
            return;
          }

          var volumeList = [];
          angular.forEach(data.unappliedVolume, function (item, index, array) {
            if (item.volumeStatus == "Stable" || item.volumeStatus == "Available") {
              volumeList.push(item);
            }

          })
          return volumeList;
        }
      })


      .withOption('createdRow', function (row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
      })
      .withOption('headerCallback', function (header) {
        $compile(angular.element(header).contents())($scope);
      })
      .withDataProp('unappliedVolume')
      .withLanguage({
        "emptyTable": "表中数据为空",
        "lengthMenu": '<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +

          '<option value="5" >5条</option>' +
          '<option value="10" >10条</option>' +
          '<option value="20" >20条</option>' +
          '<option value="50" >50条</option>' +
          '<option value="100" >100条</option>' +
          '</select>',
        "paginate": {
          "previous": '<i class="fa fa-angle-left"></i>',
          "next": '<i class="fa fa-angle-right"></i>',
          "last": '<i class="fa  fa-angle-double-right"></i>',
          "first": '<i class="fa  fa-angle-double-left"></i>'
        }
      })
      .withOption('processing', true)
      .withOption('serverSide', false)
      .withOption('paginate', true)
      .withOption('searching', true)
      .withOption('info', false)
      .withOption('fnDrawCallback', function (result) {
        vm.selectAllApply = false;
        vm.applyPool = true;
        for (var id in vm.selectedApply) {
          if (vm.selectedApply[id]) {
            vm.selectedApply[id] = false
          }
        }
        $(".selectpicker").selectpicker("refresh")
        $("#applyTab_filter").find("input").addClass("filter_input");
        $(".applyClearItem").remove();
        $('<i class="fa fa-times-circle item-error-style applyClearItem" onclick="clearFilter(\'' + 'applyTab_filter' + '\')"></i>').insertAfter($("#applyTab_filter").find("input"));
        if ($("#applyTab_filter").find("input").val() == "") {
          $(".applyClearItem").hide();
        } else {
          $(".applyClearItem").show();
        }
        $("#applyTab_filter").find("input").unbind('keyup', showItem);
        $("#applyTab_filter").find("input").bind('keyup', { cName: 'applyClearItem' }, showItem);
        $("#applyTab_filter").addClass("table_top_sm");
        $(".applyClearItem").click(function (e) {
          e.stopPropagation();
          e.preventDefault();
          $('#applyTab').DataTable().search("").draw();
        })
        if ($("#applyTab .dataTables_empty").size()) {
          $("#applyTab_paginate").hide()
        } else {
          $("#applyTab_paginate").show().css("font-size", "8px")
        }
      })

      .withLanguage({
        "search": "",
        "searchPlaceholder": "过滤",
        "aria": {
          "sortAscending": ": activate to sort column ascending",
          "sortDescending": ": activate to sort column descending"
        },
        "emptyTable": "表中数据为空",
        "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
        "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
        "zeroRecords": "表中数据为空",
        "infoFiltered": "(由 _MAX_ 项结果过滤)",
        "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
          '<option value="5" >5条</option>' +
          '<option value="10" >10条</option>' +
          '<option value="20" >20条</option>' +
          '<option value="50" >50条</option>' +
          '<option value="100" >100条</option>' +
          '</select>&nbsp;' + '  ',
        "paginate": {
          "previous": '<i class="fa fa-angle-left"></i>',
          "next": '<i class="fa fa-angle-right"></i>',
          "last": '<i class="fa  fa-angle-double-right"></i>',
          "first": '<i class="fa  fa-angle-double-left"></i>'
        }
      })
      .withPaginationType('full_numbers')
      .withOption('rowId', 'volumeId');
    vm.dtColumnsApply = [
      DTColumnBuilder.newColumn(null).notSortable().withClass('checkbox_col')
        .withTitle('<span class="check_span"><input class="input_check" ng-click="datatables.toggleAllAC(\'apply\',datatables.selectAllApply,datatables.selectedApply)" type="checkbox" ng-model="datatables.selectAllApply" id="selectAllFlag" value="0"><label for="selectAllFlag"></label></span>')
        .renderWith(function (data, type, row) {
          vm.selectedApply[row.volumeId] = false;
          return '<span class="check_span"><input class="input_check" type="checkbox" name="applyTips" ng-model="datatables.selectedApply[\'' + row.volumeId
            + '\'];" ng-click="datatables.toggleOneAC(\'apply\',datatables.selectedApply)" id="checkbox_' + row.volumeId + '"><label for="checkbox_' + row.volumeId + '"></label></span>';

        }),
      DTColumnBuilder.newColumn('volumeName').withTitle("卷名称"),
      DTColumnBuilder.newColumn('volumeDomain').withTitle("所属域"),
      DTColumnBuilder.newColumn('storagePoolName').withTitle("所属存储池"),
      DTColumnBuilder.newColumn('volumeStatus').withTitle("卷状态")
        .renderWith(function (data, type, row) {
          var resultString = ""

          switch (data) {
            case "Available":
              resultString = "<span class='status_green'>" + translate.getWord('status.available') + "</span>"; break;
            case "Stable":
              resultString = "<span class='status_green'>" + translate.getWord('status.stable') + "</span>"; break;
            case "Unavailable":
              resultString = "<span class='status_red'>" + translate.getWord('status.unavailable') + "</span>"; break;

            case "Deleted":
              resultString = "<span class='status_red'>" + translate.getWord('status.deleted') + "</span>"; break;
            case "ToBeCreated":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.toBeCreated") + '</span></div></div>'; break;
            case "CREATING":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.creating") + '</span></div></div>'; break;
            case "EXTENDING":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.extending") + '</span></div></div>'; break;
            case "CLONING":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.cloning") + '</span></div></div>'; break;
            case "DELETING":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.deleting") + '</span></div></div>'; break;
            case "BEING_CLONED":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.being.cloned") + '</span></div></div>'; break;
            case "MOVING":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.moving") + '</span></div></div>'; break;
            case "BEING_MOVED":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.being.moved") + '</span></div></div>'; break;
            case "COPYING":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.copying") + '</span></div></div>'; break;
            case "BEING_COPIED":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.being.copied") + '</span></div></div>'; break;

            case "FIXING":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.fixing") + '</span></div></div>'; break;
            case "RECYCLING":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.recycling") + '</span></div></div>'; break;

          }
          return resultString;
        }),
    ];
    vm.dtInstanceApply = {};
    vm.dtOptionsCancel = DTOptionsBuilder.newOptions()
      .withBootstrap()
      .withOption('ajax', {
        data: { ruleId: $scope.currentId, randomData: Math.random() },
        url: 'getAppliedVolumes',
        type: 'POST'
      })

      .withOption('createdRow', function (row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
      })
      .withOption('headerCallback', function (header) {
        $compile(angular.element(header).contents())($scope);
      })
      .withDataProp('appliedVolume')
      .withLanguage({
        "emptyTable": "表中数据为空",
        "lengthMenu": '<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +

          '<option value="5" >5条</option>' +
          '<option value="10" >10条</option>' +
          '<option value="20" >20条</option>' +
          '<option value="50" >50条</option>' +
          '<option value="100" >100条</option>' +
          '</select>',
        "paginate": {
          "previous": '<i class="fa fa-angle-left"></i>',
          "next": '<i class="fa fa-angle-right"></i>',
          "last": '<i class="fa  fa-angle-double-right"></i>',
          "first": '<i class="fa  fa-angle-double-left"></i>'
        }
      })
      .withOption('processing', true)
      .withOption('serverSide', false)
      .withOption('paginate', true)
      .withOption('searching', true)
      .withOption('info', false)
      .withOption('fnDrawCallback', function (result) {
        for (var id in vm.selectedCancel) {
          if (vm.selectedCancel[id]) {
            vm.selectedCancel[id] = false
          }
        }
        vm.selectAllCancel = false;
        vm.cancelPool = true;
        $(".selectpicker").selectpicker("refresh")
        $("#cancelTab_filter").find("input").addClass("filter_input");
        $(".cancelClearItem").remove();
        $('<i class="fa fa-times-circle item-error-style cancelClearItem" onclick="clearFilter(\'' + 'cancelTab_filter' + '\')"></i>').insertAfter($("#cancelTab_filter").find("input"));
        if ($("#cancelTab_filter").find("input").val() == "") {
          $(".cancelClearItem").hide();
        } else {
          $(".cancelClearItem").show();
        }
        $("#cancelTab_filter").find("input").unbind('keyup', showItem);
        $("#cancelTab_filter").find("input").bind('keyup', { cName: 'cancelClearItem' }, showItem);
        $("#cancelTab_filter").addClass("table_top_sm");
        $(".cancelClearItem").click(function (e) {
          e.stopPropagation();
          e.preventDefault();
          $('#cancelTab').DataTable().search("").draw();
        })
        if ($("#cancelTab .dataTables_empty").size()) {
          $("#cancelTab_paginate").hide()
        } else {
          $("#cancelTab_paginate").show().css("font-size", "8px")
        }
      })
      .withLanguage({
        "search": "",
        "searchPlaceholder": "过滤",
        "aria": {
          "sortAscending": ": activate to sort column ascending",
          "sortDescending": ": activate to sort column descending"
        },
        "emptyTable": "表中数据为空",
        "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
        "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
        "zeroRecords": "表中数据为空",
        "infoFiltered": "(由 _MAX_ 项结果过滤)",
        "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
          '<option value="5" >5条</option>' +
          '<option value="10" >10条</option>' +
          '<option value="20" >20条</option>' +
          '<option value="50" >50条</option>' +
          '<option value="100" >100条</option>' +
          '</select>&nbsp;' + '  ',
        "paginate": {
          "previous": '<i class="fa fa-angle-left"></i>',
          "next": '<i class="fa fa-angle-right"></i>',
          "last": '<i class="fa  fa-angle-double-right"></i>',
          "first": '<i class="fa  fa-angle-double-left"></i>'
        }
      })
      .withPaginationType('full_numbers')
      .withOption('rowId', 'volumeId');
    vm.dtColumnsCancel = [
      DTColumnBuilder.newColumn(null).notSortable().withClass('checkbox_col')
        .withTitle('<span class="check_span"><input class="input_check" ng-click="datatables.toggleAllAC(\'cancel\',datatables.selectAllCancel,datatables.selectedCancel)" type="checkbox" ng-model="datatables.selectAllCancel" value="0" id="selectAllFlag1"><label for="selectAllFlag1"></label></span>')
        .renderWith(function (data, type, row) {
          vm.selectedCancel[row.volumeId] = false;
          return '<span class="check_span"><input class="input_check" type="checkbox" name="cancelTips" ng-model="datatables.selectedCancel[\'' + row.volumeId
            + '\'];" ng-click="datatables.toggleOneAC(\'cancel\',datatables.selectedCancel)" id="checkbox_' + row.volumeId + '"><label for="checkbox_' + row.volumeId + '"></label></span>';

        }),
      DTColumnBuilder.newColumn('volumeName').withTitle("卷名称"),
      DTColumnBuilder.newColumn('volumeDomain').withTitle("所属域"),
      DTColumnBuilder.newColumn('storagePoolName').withTitle("所属存储池"),
      DTColumnBuilder.newColumn('volumeStatus').withTitle("卷状态")
        .renderWith(function (data, type, row) {
          var resultString = ""

          switch (data) {
            case "Available":
              resultString = "<span class='status_green'>" + translate.getWord('status.available') + "</span>"; break;
            case "Stable":
              resultString = "<span class='status_green'>" + translate.getWord('status.stable') + "</span>"; break;
            case "Unavailable":
              resultString = "<span class='status_red'>" + translate.getWord('status.unavailable') + "</span>"; break;

            case "Deleted":
              resultString = "<span class='status_red'>" + translate.getWord('status.deleted') + "</span>"; break;
            case "ToBeCreated":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.toBeCreated") + '</span></div></div>'; break;
            case "CREATING":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.creating") + '</span></div></div>'; break;
            case "EXTENDING":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.extending") + '</span></div></div>'; break;
            case "CLONING":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.cloning") + '</span></div></div>'; break;
            case "DELETING":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.deleting") + '</span></div></div>'; break;
            case "BEING_CLONED":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.being.cloned") + '</span></div></div>'; break;
            case "MOVING":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.moving") + '</span></div></div>'; break;
            case "BEING_MOVED":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.being.moved") + '</span></div></div>'; break;
            case "COPYING":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.copying") + '</span></div></div>'; break;
            case "BEING_COPIED":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.being.copied") + '</span></div></div>'; break;

            case "FIXING":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.fixing") + '</span></div></div>'; break;
            case "RECYCLING":
              resultString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.recycling") + '</span></div></div>'; break;

          }
          return resultString;
        }),
    ];
    vm.dtInstanceCancel = {};
  }

  function toggleAllAC(str, selectAll, selectedItems) {
    for (var id in selectedItems) {
      if (selectedItems.hasOwnProperty(id)) {
        var name = "";
        if (str == "cancelIO") {
          name = $("#cancelIOTab").find("#" + id).children("td").eq("1").html();
        } else if (str == "cancel") {
          name = $("#cancelTab").find("#" + id).children("td").eq("1").html();
        } else if (str == "apply") {
          name = $("#applyTab").find("#" + id).children("td").eq("1").html();
        } else {
          name = $("#applyIOTab").find("#" + id).children("td").eq("1").html();
        }

        if (name) {
          selectedItems[id] = selectAll;
        }

      }

    }
    $scope.clickEvt()
  }
  function toggleOneAC(str, selectedItems) {
    var s = 0;
    if (str == "apply") {
      for (var id in selectedItems) {

        if ($("#" + id)) {
          if (!selectedItems[id]) {
            vm.selectAllApply = false;
          } else {
            s++;
          }
        }
      }
      if (s == $('input[name=applyTips]').size()) {
        vm.selectAllApply = true;
      } else {
        vm.selectAllApply = false;
      }
    } else if (str == "cancel") {
      for (var id in selectedItems) {

        if ($("#" + id)) {
          if (!selectedItems[id]) {
            vm.selectAllCancel = false;
          } else {
            s++;
          }
        }
      }
      if (s == $('input[name=cancelTips]').size()) {
        vm.selectAllCancel = true;
      } else {
        vm.selectAllCancel = false;
      }
    }
    if (str == "applyIO") {
      for (var id in selectedItems) {

        if ($("#" + id)) {
          if (!selectedItems[id]) {
            vm.selectAllApplyIO = false;
          } else {
            s++;
          }
        }
      }
      if (s == $('input[name=applyIOTips]').size()) {
        vm.selectAllApplyIO = true;
      } else {
        vm.selectAllApplyIO = false;
      }
    } else if (str == "cancelIO") {
      for (var id in selectedItems) {

        if ($("#" + id)) {
          if (!selectedItems[id]) {
            vm.selectAllCancelIO = false;
          } else {
            s++;
          }
        }
      }
      if (s == $('input[name=cancelIOTips]').size()) {
        vm.selectAllCancelIO = true;
      } else {
        vm.selectAllCancelIO = false;
      }
    }
    $scope.clickEvt()
  }
  $scope.clickEvt = function () {
    if ($scope.showFlag == 1) {
      vm.applyPool = true;
      vm.cancelPool = true;
      for (var id in vm.selectedApply) {
        if ($("#applyTab").find("#" + id)) {
          if (vm.selectedApply[id]) {
            vm.applyPool = false;
          }
        }
      }
      for (var id in vm.selectedCancel) {
        if ($("#cancelTab").find("#" + id)) {
          if (vm.selectedCancel[id]) {
            vm.cancelPool = false;
          }
        }
      }
    } else {
      vm.applyDriver = true;
      vm.cancelDriver = true;
      for (var id in vm.selectedApplyIO) {
        if ($("#" + id)) {
          if (vm.selectedApplyIO[id]) {
            vm.applyDriver = false;
          }
        }
      }
      for (var id in vm.selectedCancelIO) {
        if ($("#" + id)) {
          if (vm.selectedCancelIO[id]) {
            vm.cancelDriver = false;
          }
        }
      }
    }
  }
  vm.selectedApplyIO = {};
  vm.selectAllApplyIO = false;
  vm.selectedCancelIO = {};
  vm.selectAllCancelIO = false;
  $scope.applySwitchInitiator = false;
  $scope.applyInitiator = function (id, name) {
    $scope.currentId = id;
    $scope.currentName = name;
    $scope.applySwitchInitiator = true;

    vm.dtOptionsApplyIO = DTOptionsBuilder.newOptions()
      .withBootstrap()
      .withOption('ajax', {
        data: { ruleId: $scope.currentId, randomData: Math.random() },
        url: 'getDriversBeUnappliedOneIscsisRule',
        dataSrc: function (data) {
          for (var i = 0; i < data.unappliedDrivers.length; i++) {
            data.unappliedDrivers[i].driverContainerId += "-" + data.unappliedDrivers[i].volumeId + "-" + data.unappliedDrivers[i].snapshotId;
          }
          return data.unappliedDrivers
        },
        type: 'POST'
      })

      .withOption('createdRow', function (row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
      })
      .withOption('headerCallback', function (header) {
        $compile(angular.element(header).contents())($scope);
      })
      .withDataProp('unappliedDrivers')
      .withLanguage({
        "emptyTable": "表中数据为空",
        "lengthMenu": '<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +

          '<option value="5" >5条</option>' +
          '<option value="10" >10条</option>' +
          '<option value="20" >20条</option>' +
          '<option value="50" >50条</option>' +
          '<option value="100" >100条</option>' +
          '</select>',
        "paginate": {
          "previous": '<i class="fa fa-angle-left"></i>',
          "next": '<i class="fa fa-angle-right"></i>',
          "last": '<i class="fa  fa-angle-double-right"></i>',
          "first": '<i class="fa  fa-angle-double-left"></i>'
        }
      })
      .withOption('processing', true)
      .withOption('serverSide', false)
      .withOption('paginate', true)
      .withOption('searching', true)
      .withOption('info', false)
      .withOption('fnDrawCallback', function (result) {
        vm.selectAllApplyIO = false;
        vm.applyDriver = true;
        for (var id in vm.selectedApplyIO) {
          if (vm.selectedApplyIO[id]) {
            vm.selectedApplyIO[id] = false
          }
        }
        $(".selectpicker").selectpicker("refresh")
        $("#applyIOTab_filter").find("input").addClass("filter_input");
        $(".applyIOClearItem").remove();
        $('<i class="fa fa-times-circle item-error-style applyIOClearItem" onclick="clearFilter(\'' + 'applyIOTab_filter' + '\')"></i>').insertAfter($("#applyIOTab_filter").find("input"));
        if ($("#applyIOTab_filter").find("input").val() == "") {
          $(".applyIOClearItem").hide();
        } else {
          $(".applyIOClearItem").show();
        }
        $("#applyIOTab_filter").find("input").unbind('keyup', showItem);
        $("#applyIOTab_filter").find("input").bind('keyup', { cName: 'applyIOClearItem' }, showItem);
        $("#applyIOTab_filter").addClass("table_top_sm");
        $(".applyIOClearItem").click(function (e) {
          e.stopPropagation();
          e.preventDefault();
          $('#applyIOTab').DataTable().search("").draw();
        })
        if ($("#applyIOTab .dataTables_empty").size()) {
          $("#applyIOTab_paginate").hide()
        } else {
          $("#applyIOTab_paginate").show().css("font-size", "8px")
        }
      })
      .withLanguage({
        "search": "",
        "searchPlaceholder": "过滤",
        "aria": {
          "sortAscending": ": activate to sort column ascending",
          "sortDescending": ": activate to sort column descending"
        },
        "emptyTable": "表中数据为空",
        "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
        "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
        "zeroRecords": "表中数据为空",
        "infoFiltered": "(由 _MAX_ 项结果过滤)",
        "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
          '<option value="5" >5条</option>' +
          '<option value="10" >10条</option>' +
          '<option value="20" >20条</option>' +
          '<option value="50" >50条</option>' +
          '<option value="100" >100条</option>' +
          '</select>&nbsp;',
        "paginate": {
          "previous": '<i class="fa fa-angle-left"></i>',
          "next": '<i class="fa fa-angle-right"></i>',
          "last": '<i class="fa  fa-angle-double-right"></i>',
          "first": '<i class="fa  fa-angle-double-left"></i>'
        }
      })
      .withPaginationType('full_numbers')
      .withOption('rowId', 'driverContainerId');
    vm.dtColumnsApplyIO = [
      DTColumnBuilder.newColumn(null).notSortable().withClass('checkbox_col')
        .withTitle('<span class="check_span"><input class="input_check"  ng-click="datatables.toggleAllAC(\'applyIO\',datatables.selectAllApplyIO,datatables.selectedApplyIO)" type="checkbox" ng-model="datatables.selectAllApplyIO" value="0" id="selectAllFlag2"><label for="selectAllFlag2"></label></span>')
        .renderWith(function (data, type, row) {
          var idNum = Math.random();
          vm.selectedApplyIO[row.driverContainerId] = false;
          return '<span class="check_span"><input class="input_check" type="checkbox" volumeId="' + row.volumeId + '" snapshotId="' + row.snapshotId + '"  driverType="' + row.driverType + '" name="applyIOTips" ng-model="datatables.selectedApplyIO[\'' + row.driverContainerId
            + '\'];" ng-click="datatables.toggleOneAC(\'applyIO\',datatables.selectedApplyIO)"  id="checkbox_' + idNum + '"><label for="checkbox_' + idNum + '"></label></span>';

        }),
      DTColumnBuilder.newColumn('driverName').withTitle("驱动名称"),
      DTColumnBuilder.newColumn(null).withTitle('驱动类型').renderWith(function (data, type, row) {
        return row.driverType == "NBD" ? "PYD" : row.driverType;
      }),
      DTColumnBuilder.newColumn('driverContainerIp').withTitle('驱动容器IP'),
      DTColumnBuilder.newColumn('volumeName').withTitle('所属卷'),
      DTColumnBuilder.newColumn('status').withTitle(translate.getWord("volume.driver.status"))
        .renderWith(function (data, type, row) {
          var typeString;
          switch (data) {
            case "START":
              typeString = "<span class='status_green'>" + translate.getWord("status.start") + "</span>"; break;
            case "LAUNCHED":
              typeString = "<span class='status_green'>" + translate.getWord("status.launched") + "</span>"; break;
            case "ERROR":
              typeString = "<span class='status_red'>" + translate.getWord("status.error") + "</span>"; break;
            case "LAUNCHING":
              typeString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>' + translate.getWord("status.launching") + '</span></div></div>'; break;
            case "REMOVING":
              typeString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>' + translate.getWord("status.removing") + '</span></div></div>'; break;
            case "UNAVAILABLE":
              typeString = "<span class='status_red'>" + translate.getWord("status.removing") + "</span>"; break;
            default:
              typeString = "<span class='status_orange'>" + translate.getWord("status.unknown") + "</span>"; break;

          }
          return typeString
        }),
    ];
    vm.dtInstanceApplyIO = {};
    vm.dtOptionsCancelIO = DTOptionsBuilder.newOptions()
      .withBootstrap()
      .withOption('ajax', {
        data: { ruleId: $scope.currentId, randomData: Math.random() },
        url: 'getDriversBeAppliedOneIscsisRule',
        dataSrc: function (data) {
          for (var i = 0; i < data.appliedDrivers.length; i++) {
            data.appliedDrivers[i].driverContainerId += "-" + data.appliedDrivers[i].volumeId + "-" + data.appliedDrivers[i].snapshotId;
          }
          return data.appliedDrivers
        },
        type: 'POST'
      })

      .withOption('createdRow', function (row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
      })
      .withOption('headerCallback', function (header) {
        $compile(angular.element(header).contents())($scope);
      })
      .withDataProp('appliedDrivers')
      .withLanguage({
        "emptyTable": "表中数据为空",
        "lengthMenu": '<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +

          '<option value="5" >5条</option>' +
          '<option value="10" >10条</option>' +
          '<option value="20" >20条</option>' +
          '<option value="50" >50条</option>' +
          '<option value="100" >100条</option>' +
          '</select>',
        "paginate": {
          "previous": '<i class="fa fa-angle-left"></i>',
          "next": '<i class="fa fa-angle-right"></i>',
          "last": '<i class="fa  fa-angle-double-right"></i>',
          "first": '<i class="fa  fa-angle-double-left"></i>'
        }
      })
      .withOption('processing', true)
      .withOption('serverSide', false)
      .withOption('paginate', true)
      .withOption('searching', true)
      .withOption('info', false)
      .withOption('fnDrawCallback', function (result) {
        vm.selectAllCancelIO = false;
        vm.cancelDriver = true;
        for (var id in vm.selectedCancelIO) {
          if (vm.selectedCancelIO[id]) {
            vm.selectedCancelIO[id] = false
          }
        }
        $(".selectpicker").selectpicker("refresh")
        $("#cancelIOTab_filter").find("input").addClass("filter_input");
        $(".cancelIOClearItem").remove();
        $('<i class="fa fa-times-circle item-error-style cancelIOClearItem" onclick="clearFilter(\'' + 'cancelIOTab_filter' + '\')"></i>').insertAfter($("#cancelIOTab_filter").find("input"));
        if ($("#cancelIOTab_filter").find("input").val() == "") {
          $(".cancelIOClearItem").hide();
        } else {
          $(".cancelIOClearItem").show();
        }
        $("#cancelIOTab_filter").find("input").unbind('keyup', showItem);
        $("#cancelIOTab_filter").find("input").bind('keyup', { cName: 'cancelIOClearItem' }, showItem);
        $("#cancelIOTab_filter").addClass("table_top_sm");
        $(".cancelIOClearItem").click(function (e) {
          e.stopPropagation();
          e.preventDefault();
          $('#cancelIOTab').DataTable().search("").draw();
        })
        if ($("#cancelIOTab .dataTables_empty").size()) {
          $("#cancelIOTab_paginate").hide()
        } else {
          $("#cancelIOTab_paginate").show().css("font-size", "8px")
        }
      })
      .withLanguage({
        "search": "",
        "searchPlaceholder": "过滤",
        "aria": {
          "sortAscending": ": activate to sort column ascending",
          "sortDescending": ": activate to sort column descending"
        },
        "emptyTable": "表中数据为空",
        "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
        "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
        "zeroRecords": "表中数据为空",
        "infoFiltered": "(由 _MAX_ 项结果过滤)",
        "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
          '<option value="5" >5条</option>' +
          '<option value="10" >10条</option>' +
          '<option value="20" >20条</option>' +
          '<option value="50" >50条</option>' +
          '<option value="100" >100条</option>' +
          '</select>&nbsp;' + '  ',
        "paginate": {
          "previous": '<i class="fa fa-angle-left"></i>',
          "next": '<i class="fa fa-angle-right"></i>',
          "last": '<i class="fa  fa-angle-double-right"></i>',
          "first": '<i class="fa  fa-angle-double-left"></i>'
        }
      })
      .withPaginationType('full_numbers')
      .withOption('rowId', 'driverContainerId');
    vm.dtColumnsCancelIO = [
      DTColumnBuilder.newColumn(null).notSortable().withClass('checkbox_col')
        .withTitle('<span class="check_span"><input class="input_check" ng-click="datatables.toggleAllAC(\'cancelIO\',datatables.selectAllCancelIO,datatables.selectedCancelIO)" type="checkbox" ng-model="datatables.selectAllCancelIO" value="0" id="selectAllFlag3"><label for="selectAllFlag3"></label></span>')
        .renderWith(function (data, type, row) {
          var idNum = Math.random();
          vm.selectedCancelIO[row.driverContainerId] = false;
          return '<span class="check_span"><input class="input_check" type="checkbox"  volumeId="' + row.volumeId + '" snapshotId="' + row.snapshotId + '" driverType="' + row.driverType + '" name="cancelIOTips" ng-model="datatables.selectedCancelIO[\'' + row.driverContainerId
            + '\'];" ng-click="datatables.toggleOneAC(\'cancelIO\',datatables.selectedCancelIO)" id="checkbox_' + idNum + '"><label for="checkbox_' + idNum + '"></label></span>';

        }),
      DTColumnBuilder.newColumn('driverName').withTitle("驱动名称"),
      DTColumnBuilder.newColumn(null).withTitle('驱动类型').renderWith(function (data, type, row) {
        return row.driverType == "NBD" ? "PYD" : row.driverType;
      }),
      DTColumnBuilder.newColumn('driverContainerIp').withTitle('驱动容器IP'),
      DTColumnBuilder.newColumn('volumeName').withTitle('所属卷'),
      DTColumnBuilder.newColumn('status').withTitle('驱动状态')
        .renderWith(function (data, type, row) {
          var typeString;
          switch (data) {
            case "START":
              typeString = "<span class='status_green'>" + translate.getWord("status.start") + "</span>"; break;
            case "LAUNCHED":
              typeString = "<span class='status_green'>" + translate.getWord("status.launched") + "</span>"; break;
            case "ERROR":
              typeString = "<span class='status_red'>" + translate.getWord("status.error") + "</span>"; break;
            case "LAUNCHING":
              typeString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>' + translate.getWord("status.launching") + '</span></div></div>'; break;
            case "REMOVING":
              typeString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>' + translate.getWord("status.removing") + '</span></div></div>'; break;
            case "UNAVAILABLE":
              typeString = "<span class='status_red'>" + translate.getWord("status.removing") + "</span>"; break;
            default:
              typeString = "<span class='status_orange'>" + translate.getWord("status.unknown") + "</span>"; break;

          }
          return typeString
        }),
    ];
    vm.dtInstanceCancelIO = {};
  }

})

function getDeleteIds() {
  var ruleIdListToDelete = [];
  $("input[name='ruleCheckbox']:checked").each(function (index, checkbox) {
    var $ruleId = $(this).parent().parent().prop("id");
    ruleIdListToDelete.push($ruleId);
  });
  if (ruleIdListToDelete.length != 0) {
    var ruleIdListJson = JSON.stringify(ruleIdListToDelete);
  }
  return ruleIdListJson || null
}

function showIcon(table){
  var tableId = table? '#'+table : '.dataTables_filter'
  $( tableId + ' label').removeClass('clearIcon')
}
function watchIcon(domId){
  domId=domId?domId:'.dataTables_filter'
  if($(domId +' input')[0]){
    $(domId +' input')[0].addEventListener('input',function(e){
      if(e.target.value){
        $(domId + ' label').addClass('clearIcon')
      }else{
        $(domId + ' label').removeClass('clearIcon')
      }
    })
  }
}
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

angular.module('app.storage').controller('AllDriverCtrl', function (focus, $rootScope, $scope, showMessage, translate, $interval, $http, $stateParams, $state, DTOptionsBuilder, DTColumnBuilder, $compile) {
  $(".modal").draggable();
  var vm = this;
  var timer;
  $scope.volumeId = $stateParams.volumeId;
  var oTime = true;
  var firstPool = true;
  var firstVolume = true;
  var timeFlag = true;
  var driverSwitch = true;
  $.fn.dataTableExt.oSort['directive-asc'] = function (a,b) {
    var aIndex = a.indexOf('checked')
    var bIndex = b.indexOf('checked')
    if(aIndex>bIndex){
      return -1
    }else{
      return 0
    }
  }
  $.fn.dataTableExt.oSort['directive-desc'] = function (a,b) {
    var aIndex = a.indexOf('checked')
    var bIndex = b.indexOf('checked')
    if(aIndex<bIndex){
      return -1
    }else{
      return 0
    }
  }

  $scope.volId = "";
  $scope.driverName = "";
  $scope.driverJson = "";
  $scope.$watch('$viewContentLoaded', function (event) {
    if ($stateParams.driverName && driverSwitch) {
      driverSwitch = false;
      $('#driverTab').DataTable().search($stateParams.driverName).draw();
    }
  });

  $scope.getDomain = function () {
    $http({
      method: "post",
      data: { "domainName": "" },
      async: false,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      url: "listDomains",
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(data) {
      data = data.data;
      $scope.domainGroups = [{ 'value': "", 'txt': translate.getWord("volume.chooseDomain") }];
      for (var i = 0; i < data.domainList.length; i++) {
        $scope.domainGroups.push({ 'value': data.domainList[i].domainId, 'txt': data.domainList[i].domainName })
      }
      $(".volumeDomainClass").selectpicker("refresh");
      $('.volumeDomainClass').on('shown.bs.select', function (e) {
        $(".volumeDomainClass").selectpicker("refresh");
      });
    });
  }

  $scope.getStoragePool = function (flag) {
    if (firstPool || (parseInt($("#volumeDomain").val()) || $("#volumeDomain").val() == "" || $("#volumeDomain").val() == null)) {
      firstPool = false;
      $http({
        method: "post",
        data: { "domainId": flag == 'true' ? $("#volumeDomain").val() : "" },
        async: false,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        url: "listStoragePool",
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      }).then(function successCallback(data) {
        data = data.data;
        $scope.domainPools = [{ 'value': "", 'txt': translate.getWord("volume.choosePool") }];
        for (var i = 0; i < data.simpleStoragePoolsList.length; i++) {
          $scope.domainPools.push({ 'value': data.simpleStoragePoolsList[i].poolId, 'txt': data.simpleStoragePoolsList[i].poolName })
        }
        $('.volumeStoragepool').selectpicker('val', "");
        $(".volumeStoragepool").selectpicker("refresh");
        $('.volumeStoragepool').on('shown.bs.select', function (e) {
          $(".volumeStoragepool").selectpicker("refresh");
        });
        if (flag == 'true') {
          $scope.getVolume(flag)
        }
      });
    }
  }

  $scope.getVolume = function (flag) {
    if (firstVolume || ((parseInt($("#volumeDomain").val()) || $("#volumeDomain").val() == "" || $("#volumeDomain").val() == null) && (parseInt($("#volumeStoragePool").val()) || $("#volumeStoragePool").val() == "" || $("#volumeStoragePool").val() == null))) {
      firstVolume = false;
      $http({
        method: "post",
        data: {
          "domainId": flag == 'true' ? $("#volumeDomain").val() : "",
          "poolId": flag == 'true' ? $("#volumeStoragePool").val() : ""
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        url: "listVolume",
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      }).then(function successCallback(data) {
        data = data.data.volumeList;
        $scope.volumeArray = [{ 'value': "", 'txt': translate.getWord("volume.chooseTargetVolume") }];
        for (var i = 0; i < data.length; i++) {
          $scope.volumeArray.push({ 'txt': data[i].volumeName, 'value': data[i].volumeId })
        }
        $("#volumeTarget").selectpicker("refresh");
        $('#volumeTarget').on('shown.bs.select', function (e) {
          $("#volumeTarget").selectpicker("refresh");
        });
        if ($scope.volumeId) {
          $scope.volumeTarget = $scope.volumeId;
          $("#volumeTarget").selectpicker("val", $scope.volumeId);
          $scope.volumeId = null;
        }
      });
    }
  }

  $scope.closeFilter = function () {
    $scope.topFilter = false;
    $scope.snapshotArray = [{ 'value': "0", 'txt': translate.getWord("volume.chooseSnapshot") }];
    $scope.volumeArray = [{ 'value': "", 'txt': translate.getWord("volume.chooseTargetVolume") }];
    $scope.domainGroups = [{ 'value': "", 'txt': translate.getWord("volume.chooseDomain") }];
    $scope.domainPools = [{ 'value': "", 'txt': translate.getWord("volume.choosePool") }];
    $scope.getDomain();
    $scope.getStoragePool("false");
    $scope.getVolume("false")
  }

  $scope.mount = function () {
    focus("driverName");
    $scope.snapshotArray = [{ 'value': "0", 'txt': translate.getWord("volume.chooseSnapshot") }];
    $scope.driverContainerArray = [{ 'value': "", 'txt': translate.getWord("volume.chooseDC") }];
    $scope.volumeArray = [{ 'value': "", 'txt': translate.getWord("volume.chooseTargetVolume") }];
    $scope.domainGroups = [{ 'value': "", 'txt': translate.getWord("volume.chooseDomain") }];
    $scope.domainPools = [{ 'value': "", 'txt': translate.getWord("volume.choosePool") }];
    $scope.driverAmount == "";
    $scope.getVolume("false");
    $scope.getDomain();
    $scope.getStoragePool("false");
    $scope.topFilter = false;
    $scope.createForm.$setPristine();
    $scope.createForm.$setUntouched();
    $scope.create = { driverName: "" };
    $scope.driverAmount = "";
    $(".initColor").removeClass('has-error');
    $http({
      method: "post",
      data: {},
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      url: "listDriverContainer",
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(data) {
      data = data.data;
      var driverContainerArray = [{ 'value': "", 'txt': translate.getWord("volume.chooseDC") }];
      if (data.driverContainersList.length > 0 && data.driverContainersList) {
        $.each(data.driverContainersList, function (i, value) {
          driverContainerArray.push({ 'value': value.host, 'txt': value.host })
        })
      }
      $scope.driverContainerArray = driverContainerArray;
      $("#driverContainer").selectpicker("val", "");
      $("#driverContainer").selectpicker("refresh");
      $('#driverContainer').on('shown.bs.select', function (e) {
        $("#driverContainer").selectpicker("refresh");
      });
    });
  }

  $scope.changeVolume = function () {
    $(".initColor").removeClass('has-error');
    if ($scope.volumeTarget) {
      $http({
        method: "post",
        data: {
          volumeId: $scope.volumeTarget,
          getVolumeWithSegmentList: 0
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        url: "getVolumeDetail",
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      }).then(function successCallback(data) {
        data = data.data;
        var snapshotArray = [{ 'value': "0", 'txt': translate.getWord("volume.chooseSnapshot") }];
        if (data.resultMessage.message == "success") {
          if (data.simpleVolumeMetadata.snapshotMetadatas.length > 0 && data.simpleVolumeMetadata.snapshotMetadatas) {
            $.each(data.simpleVolumeMetadata.snapshotMetadatas, function (i, value) {
              snapshotArray.push({ 'value': value.snapshotId, 'txt': value.name })
            })
          }
          $scope.snapshotArray = snapshotArray;
          return
        } else {
          if (data.resultMessage.message != "ERROR_0019_SessionOut") {
            $scope.snapshotArray = snapshotArray;
            return;
          } else {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
          }
        }

      });
    }

  }

  vm.dtOptions = DTOptionsBuilder.newOptions()
    .withDOM("<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
      "t" +
      "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>")
    .withBootstrap()
    .withOption('ajax', {
      url: BASE_API + 'listAllDrivers',
      dataSrc: function (data) {
        timeFlag = true;
        if (data.resultMessage.message != "success") {
          if (data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
          }
        } else {
          return data.driverMetadataList;
        }
      },
      type: 'POST'
    })
    .withDataProp('driverMetadataList')
    .withOption('processing', false)
    .withOption('serverSide', false)
    .withOption('fnDrawCallback', function (result) {
      $("#driverTab_filter").find("input").addClass("filter_input");
      $(".driverClearItem").remove();
      $('<i class="fa fa-times-circle item-error-style driverClearItem" onclick="clearFilter(\'' + 'driverTab_filter' + '\')"></i>').insertAfter($("#driverTab_filter").find("input"));
      if ($("#driverTab_filter").find("input").val() == "") {
        $(".driverClearItem").hide();
      } else {
        $(".driverClearItem").show();
      }
      $("#driverTab_filter").find("input").unbind('keyup', showItem);
      $("#driverTab_filter").find("input").bind('keyup', { cName: 'driverClearItem' }, showItem);
      $(".driverClearItem").click(function (e) {
        e.stopPropagation();
        e.preventDefault();
        $('#driverTab').DataTable().search("").draw();
      })
      if ($("#driverTab .dataTables_empty").size()) {
        $("#driverTab_paginate").hide()
      } else {
        $("#driverTab_paginate").show()
      }
      $(".selectpicker").selectpicker("refresh")
      if ($scope.volumeId && oTime) {
        oTime = false;
        $("#driver_modal").modal('show');
        focus("driverName");
        $scope.snapshotArray = [{ 'value': "0", 'txt': translate.getWord("volume.chooseSnapshot") }];
        $scope.driverContainerArray = [{ 'value': "", 'txt': translate.getWord("volume.chooseDC") }];
        $scope.volumeArray = [{ 'value': "", 'txt': translate.getWord("volume.chooseTargetVolume") }];
        $scope.domainGroups = [{ 'value': "", 'txt': translate.getWord("volume.chooseDomain") }];
        $scope.domainPools = [{ 'value': "", 'txt': translate.getWord("volume.choosePool") }];
        $scope.driverAmount == "";
        $scope.getDomain();
        $scope.getStoragePool("false");
        $scope.getVolume("false");
        $scope.topFilter = false;
        $scope.volumeTarget = $scope.volumeId;
        $scope.changeVolume()
        $http({
          method: "post",
          data: {},
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          url: "listDriverContainer",
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
            }
            return str.join("&");
          }
        }).then(function successCallback(data) {
          data = data.data;
          var driverContainerArray = [{ 'value': "", 'txt': translate.getWord("volume.chooseDC") }];
          if (data.driverContainersList.length > 0 && data.driverContainersList) {
            $.each(data.driverContainersList, function (i, value) {
              driverContainerArray.push({ 'value': value.host, 'txt': value.host })
            })
          }
          $scope.driverContainerArray = driverContainerArray;
          $("#driverContainer").selectpicker("val", "");
          $("#driverContainer").selectpicker("refresh");
          $('#driverContainer').on('shown.bs.select', function (e) {
            $("#driverContainer").selectpicker("refresh");
          });
        });
      }
    })
    .withOption('createdRow', function (row, data, dataIndex) {
      $compile(angular.element(row).contents())($scope);
    })
    .withOption('headerCallback', function (header) {
      if (!vm.headerCompiled) {
        vm.headerCompiled = true;
        $compile(angular.element(header).contents())($scope);
      }
    })
    .withOption('pageLength', Number($rootScope.driverPageLength))
    .withLanguage({
      "search": "",
      "searchPlaceholder": "过滤",
      "aria": {
        "sortAscending": ": activate to sort column ascending",
        "sortDescending": ": activate to sort column descending"
      },
      "emptyTable": "表中数据为空",
      "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
      "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
      "order": [[2, "asc"]],
      "infoFiltered": "(由 _MAX_ 项结果过滤)",
      "zeroRecords": "表中数据为空",
      "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
        '<option value="5" >5条</option>' +
        '<option value="10" >10条</option>' +
        '<option value="20" >20条</option>' +
        '<option value="50" >50条</option>' +
        '<option value="100" >100条</option>' +
        '</select>&nbsp;' + '  ',
      "paginate": {
        "previous": '<i class="fa fa-angle-left"></i>',
        "next": '<i class="fa fa-angle-right"></i>',
        "last": '<i class="fa  fa-angle-double-right"></i>',
        "first": '<i class="fa  fa-angle-double-left"></i>'
      }
    })
    .withPaginationType('full_numbers');

  vm.dtColumns = [
    DTColumnBuilder.newColumn('volumeId').withTitle("id").notVisible(),
    DTColumnBuilder.newColumn('driverName').withTitle("驱动名称"),
    DTColumnBuilder.newColumn('volumeId').withTitle("所属卷ID"),
    DTColumnBuilder.newColumn(null).withTitle("所属卷")
      .renderWith(function (data, type, row) {
        return '<a title="查看卷详情" ng-click="goVolume(\'' + row.volumeId + '\')">' + row.volumeName + '</a>'
      }),
    DTColumnBuilder.newColumn('status').withTitle("驱动状态")
      .renderWith(function (data, type, row) {
        var typeString;
        switch (data) {
          case "START":
            typeString = "<span class='status_green'>" + translate.getWord("status.start") + "</span>"; break;
          case "LAUNCHED":
            typeString = "<span class='status_green'>" + translate.getWord("status.launched") + "</span>"; break;
          case "ERROR":
            typeString = "<span class='status_red'>" + translate.getWord("status.error") + "</span>"; break;
          case "LAUNCHING":
            typeString = '<div class="progress progress-striped active" >' +
              '<div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>' + translate.getWord("status.launching") + '</span></div></div>'; break;
          case "REMOVING":
            typeString = '<div class="progress progress-striped active" >' +
              '<div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>' + translate.getWord("status.removing") + '</span></div></div>'; break;
          case "UNAVAILABLE":
            typeString = "<span class='status_red'>" + translate.getWord("status.removing") + "</span>"; break;
          case "RECOVERING":
            typeString = '<div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>恢复中</span></div></div>'; break;
          case "MIGRATING":
            typeString = '<div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>迁移中</span></div></div>'; break;
          default:
            typeString = "<span class='status_orange'>" + translate.getWord("status.unknown") + "</span>"; break;
        }
        return typeString
      }),
    DTColumnBuilder.newColumn('createTime').withTitle("创建时间").renderWith(function (data, type, row) {
      return fillDate(data)
    }),
    DTColumnBuilder.newColumn('driverContainerIp').withTitle("驱动容器IP"),
    DTColumnBuilder.newColumn(null).withTitle("驱动类型")
      .renderWith(function (data, type, row) {
        if (row.driverType == 'NBD') {
          return "PYD";
        } else {
          return row.driverType;
        }
      }),
    DTColumnBuilder.newColumn(null).withTitle("驱动地址")
      .renderWith(function (data, type, row) {
        var str = "ipv4:" + row.host
        if (row.ipv6Addr) {
          str = str + "<br/>" + "ipv6:" + row.ipv6Addr
        }
        return str;
      }),
    DTColumnBuilder.newColumn('port').withTitle("驱动端口"),
    DTColumnBuilder.newColumn('clientAmount').withTitle("驱动用户数量"),
    DTColumnBuilder.newColumn('driverClientInfoList').withTitle("驱动用户信息")
      .renderWith(function (data, type, row) {
        var driverClientString = "";
        if (data.length > 0 && data) {
          $.each(data, function (h, ele) {
            driverClientString = driverClientString + ele.host.replace(/\//g, "") + " "
            switch (ele.authority) {
              case "READ":
                driverClientString = driverClientString + translate.getWord("volume.readOnly"); break;
              case "READWRITE":
                driverClientString = driverClientString + translate.getWord("volume.readWrite"); break;
            }
            driverClientString = driverClientString + "<br/>"
          })
        }
        return driverClientString == "" ? "" : driverClientString
      }),
    DTColumnBuilder.newColumn('chapControl').withTitle("chap认证")
      .withOption('type','directive')
      .renderWith(function (data, type, row) {
        if(!($rootScope.apis.Driver && $rootScope.apis.Driver.launchDriver && $rootScope.apis.Driver.umountDriver)){
          return ''
        } else {
          var str = '';
          var idNum = Math.random();
          if (data == 1) {
            str = '<span class="check_span"><input class="input_check"  checked="checked" ng-click="changeChap(\'' + row.driverContainerId + '\',\'' + row.volumeId + '\',\'' + row.snapshotId + '\',\'' + row.driverType + '\',$event)" id="checkbox_' + idNum + '"  type="checkbox"><label for="checkbox_' + idNum + '"></label></span>';
          } else {
            str = '<span class="check_span"><input class="input_check" ng-click="changeChap(\'' + row.driverContainerId + '\',\'' + row.volumeId + '\',\'' + row.snapshotId + '\',\'' + row.driverType + '\',$event)" id="checkbox_' + idNum + '"  type="checkbox"><label for="checkbox_' + idNum + '"></label></span>';
          }
          return row.driverType == "ISCSI" ? str : '';
        }
      }),
    DTColumnBuilder.newColumn(null).withTitle('驱动操作')
      .renderWith(function (data, type, row) {
        var tmpJson = { snapshotId: row.snapshotId, driverIp: row.host, driverType: row.driverType, driverContainerId: row.driverContainerId };
        var infoString = '<div class="btn-group dropdown-btn">' +
          '<button type="button" class="btn btn_lightblue btn-xs my-drop-down" ng-click="showDown($event);$event.stopPropagation();">操作 <span class="caret"></span></button>'
          + '<ul class="down" style="min-width:110px;">'
          + '<li><a ng-click=\'umountOneDriverBtn(\"' + row.volumeId + '\",' + JSON.stringify(tmpJson) + ',false)\'>' + translate.getWord('volume.umount') + '</a></li>'
          + '<li><a ng-show="' + row.markUnmountForCsi + '"ng-click=\'markOneDriverBtn(\"' + row.volumeId + '\",' + JSON.stringify(tmpJson) + ',false)\'>' + '取消标记卸载' + '</a></li>'
          + '</ul></div>'
        return $rootScope.apis.Driver && $rootScope.apis.Driver.umountDriver ? infoString : "";
      }).notSortable(),
  ];

  vm.dtInstance = {};
  vm.reloadData = reloadData;

  $scope.reloadData = function () {
    vm.dtInstance.reloadData(null, false);
  }

  function reloadData() {
    vm.dtInstance.reloadData(null, false);
  }

  function reloadDataTime() {
    if (timeFlag) {
      timeFlag = false;
      vm.dtInstance.reloadData(null, false);
    }
  }

  $scope.goVolume = function (id) {
    $state.go('app.storage.volume.volumePerformanceData', { volumeId: id });
  }

  $scope.showDown = function (e) {
    if ($(".temp-show").size()) {
      $(".temp-show").hide();
      $interval.cancel(timer);
      timer = $interval(reloadDataTime, 3000);
      $(".temp-show").removeClass("temp-show")
    } else {
      $(e.target).next().addClass("temp-show");
      $interval.cancel(timer);
      $(".temp-show").toggle()
    }
    $(document).one("click", function () {
      $(".temp-show").hide();
      $interval.cancel(timer);
      timer = $interval(reloadDataTime, 3000);
      $(".temp-show").removeClass("temp-show")
    });
  }

  $scope.changeChap = function (driverContainerId, volumeId, snapshotId, driverType, e) {
    $http({
      method: "post",
      async: false,
      data: {
        volumeId: volumeId,
        snapshotId: snapshotId,
        driverType: driverType == 'NBD' ? 'PYD' : driverType,
        driverContainerId: driverContainerId,
        chapControl: $(e.target).prop("checked") ? 1 : 0
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      url: "setIscsiChapControl",
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(data) {
      data = data.data;
      if (data.resultMessage.message != "success") {
        if (data.resultMessage.message == "ERROR_0019_SessionOut") {
          showMessage.show($scope, "warn", translate.getWord("session.out"));
          $scope.logout();
        } else {
          showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
        }

      } else {
        showMessage.show($scope, "success", translate.getWord("response.success"));
        vm.dtInstance.reloadData(null, false);
        $interval.cancel(timer);
        timer = $interval(reloadDataTime, 3000);
      }
    });
  }

  $scope.launchDriver = function () {
    var snapshotId = "0";
    $http({
      method: "post",
      async: false,
      data: {
        volumeId: $scope.volumeTarget,
        driverName: $scope.create.driverName,
        snapshotId: snapshotId,
        driverType: $("#driver").selectpicker('val'),
        driverAmount: $scope.driverAmount,
        hostName: $scope.driverAmount == 1 ? $("#driverContainer").selectpicker("val") : ""
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      url: "launchVolume",
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(data) {
      data = data.data;
      if (data.resultMessage.message != "success") {
        if (data.resultMessage.message == "ERROR_0019_SessionOut") {
          showMessage.show($scope, "warn", translate.getWord("session.out"));
          $scope.logout();
        } else {
          showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
        }
      } else {
        showMessage.show($scope, "success", translate.getWord("response.success"));
        vm.dtInstance.reloadData(null, false);
      }
    });
  }

  $scope.getInfo = function (volumeId, driverName, driverJson) {
    $scope.volId = volumeId;
    $scope.driverName = driverName;
    $scope.driverJson = driverJson;
  }

  $scope.forceUmount = function () {
    $scope.umountOneDriverBtn($scope.volId, $scope.driverJson, true)
  }

  $scope.markOneDriverBtn = function (id, ele, isOpen) {
    var tempArr = [];
    tempArr.push(ele)
    var tempStr = JSON.stringify(tempArr);
    $http({
      method: "post",
      data: {
        volumeId: id,
        hosts: tempStr,
        isOpen: isOpen
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      url: "markUmountDriverForCsi",
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(data) {
      data = data.data;
      if (data.resultMessage.message != "success") {
        if (data.resultMessage.message == "ERROR_0019_SessionOut") {
          showMessage.show($scope, "error", translate.getWord("session.out"));
          $scope.logout();
        } else {
          showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
        }

      } else {
        showMessage.show($scope, "success", translate.getWord("response.success"));
        vm.dtInstance.reloadData(null, false);
      }
    });
  }

  $scope.umountOneDriverBtn = function (id, ele, forceFlag) {
    var tempArr = [];
    tempArr.push(ele)
    var tempStr = JSON.stringify(tempArr);
    $http({
      method: "post",
      data: {
        volumeId: id,
        hosts: tempStr,
        forceUmount: forceFlag
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      url: "umountVolume",
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(data) {
      data = data.data;
      if (data.resultMessage.message != "success") {
        if (data.resultMessage.message == "ERROR_0019_SessionOut") {
          showMessage.show($scope, "error", translate.getWord("session.out"));
          $scope.logout();
        } else {
          showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
        }

      } else {
        showMessage.show($scope, "success", translate.getWord("response.success"));
        vm.dtInstance.reloadData(null, false);
      }
    });
  }
  timer = $interval(reloadDataTime, 3000);
  $scope.$on('$destroy', function () {
    $interval.cancel(timer);
  })
})


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

angular
  .module("app.storage")
  .controller(
    "DomainCtrl",
    function (
      focus,
      $state,
      $http,
      $interval,
      $rootScope,
      $scope,
      DTOptionsBuilder,
      DTColumnBuilder,
      $compile,
      showMessage,
      translate,
      $timeout,
      $stateParams
    ) {
      $(".modal").draggable();
      var vm = this;
      var removeId;
      var domainid;
      var domainname;
      var domainDes;
      vm.selected = {};
      vm.selectName = new Array();
      vm.selectedId = new Array();
      vm.selectAll = false;
      vm.toggleAll = toggleAll;
      vm.toggleOne = toggleOne;
      vm.disabled = false;
      vm.dtInstance = {};
      vm.d = true;
      var intervalTime;
      var refreshIds = [];
      var tableLength;

      var timeFlag = true;
      var right = $(".detail_right").outerHeight();
      var left = $(".detail_content").outerHeight();
      if (right > left) {
        $(".detail_content").css("min-height", right + "px");
      } else {
        $(".detail_right").css("min-height", left + "px");
      }

      $scope.$watch("description", function (newValue, oldValue, scope) {
        var len = 0;
        var l;
        if (newValue) {
          for (var i = 0; i < newValue.length; i++) {
            l = newValue.charCodeAt(i);
            if (l >= 0 && l <= 128) {
              len += 1;
            } else {
              len += 2;
            }
          }
        }

        $scope.CreateFormDes = len > 250;
      });

      $scope.$watch("udescription", function (newValue, oldValue, scope) {
        var len = 0;
        var l;
        if (newValue) {
          for (var i = 0; i < newValue.length; i++) {
            l = newValue.charCodeAt(i);
            if (l >= 0 && l <= 128) {
              len += 1;
            } else {
              len += 2;
            }
          }
        }

        $scope.UpdateFormDes = len > 250;
      });

      vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption("ajax", {
          url: BASE_API + "listDomainsDT",
          type: "POST",
          dataSrc: function (data) {
            if (data.resultMessage.message == "ERROR_0019_SessionOut") {
              showMessage.show(
                $scope,
                "warn",
                translate.getWord("session.out")
              );
              $scope.logout();
              return;
            }
            tableLength = data.data.length;
            vm.selected = {};
            vm.selectAll = false;
            return data.data;
          },
        })
        .withDOM(
          "<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
            "t" +
            "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>"
        )

        .withBootstrap()
        .withOption("processing", false)
        .withOption("serverSide", true)
        .withOption("rowId", "domainId")
        .withOption("fnDrawCallback", drawCallback)
        .withLanguage({
          search: "",
          searchPlaceholder: "查询域名称",
          aria: {
            sortAscending: ": activate to sort column ascending",
            sortDescending: ": activate to sort column descending",
          },
          emptyTable: "表中数据为空",
          info: "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
          infoEmpty: "显示第 0 至 0 项结果，共 0 项",
          order: [[2, "asc"]],
          infoFiltered: "(由 _MAX_ 项结果过滤)",
          zeroRecords: "表中数据为空",
          lengthMenu:
            "显示" +
            '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;" name="timeSelect" >' +
            '<option value="5" >5条</option>' +
            '<option value="10" >10条</option>' +
            '<option value="20" >20条</option>' +
            '<option value="50" >50条</option>' +
            '<option value="100" >100条</option>' +
            "</select>&nbsp;" +
            " ",
          paginate: {
            previous: '<i class="fa fa-angle-left"></i>',
            next: '<i class="fa fa-angle-right"></i>',
            last: '<i class="fa fa-angle-double-right"></i>',
            first: '<i class="fa fa-angle-double-left"></i>',
          },
        })
        .withPaginationType("full_numbers")
        .withOption("createdRow", function (row, data, dataIndex) {
          $compile(angular.element(row).contents())($scope);
        })
        .withOption("headerCallback", function (header) {
          if (!vm.headerCompiled) {
            vm.headerCompiled = true;
            $compile(angular.element(header).contents())($scope);
          }
        });

      vm.dtColumns = [
        DTColumnBuilder.newColumn("domainId").withTitle("ID").notVisible(),
        DTColumnBuilder.newColumn("null")
          .withTitle(
            '<span class="check_span"><input id="DomainSelectAll" class="input_check" ng-model="showDomain.selectAll" ng-click="showDomain.toggleAll(showDomain.selectAll, showDomain.selected)" type="checkbox"><label for="DomainSelectAll"></label></span>'
          )
          .renderWith(function (data, type, row) {
            vm.selected[row.domainId] = false;
            return (
              '<span class="check_span"><input id="checkbox_' +
              row.domainId +
              '" class="input_check" ng-model="showDomain.selected[\'' +
              row.domainId +
              '\'];" ng-click="showDomain.toggleOne(showDomain.selected)" type="checkbox"><label for="checkbox_' +
              row.domainId +
              '"></label></span>'
            );
          })
          .withClass("checkbox_col")
          .notSortable(),

        DTColumnBuilder.newColumn("domainName")
          .withTitle("域名称")
          .renderWith(function (data, type, row) {
            return (
              '<a title="查看域详情" ng-click="showInfo(\'' +
              row.domainId +
              "')\">" +
              data +
              "</a>"
            );
          }),
        DTColumnBuilder.newColumn("domainDescription")
          .withTitle("描述")
          .notSortable(),
        DTColumnBuilder.newColumn("status")
          .withTitle("状态")
          .renderWith(function (data, type, row) {
            switch (data) {
              case "Available":
                return "<span class='status_green'>可用</span>";
              case "Deleting":
                return (
                  '<div class="progress progress-striped active" >' +
                  '<div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>删除中</span></div></div>'
                );
              default:
                return data;
            }
          }),
        DTColumnBuilder.newColumn("logicalSpace")
          .withTitle("总容量(GB)")
          .renderWith(function (data, type, row) {
            var domainSpace = fixTwoDecimal(data / (1024 * 1024 * 1024));
            return domainSpace;
          }),
        DTColumnBuilder.newColumn("freeSpace")
          .withTitle("剩余容量(GB)")
          .renderWith(function (data, type, row) {
            var domainfreeSpace = fixTwoDecimal(data / (1024 * 1024 * 1024));
            return domainfreeSpace;
          }),
        DTColumnBuilder.newColumn("useSpace")
          .withTitle("已分配容量(GB)")
          .renderWith(function (data, type, row) {
            var domainuseSpace = fixTwoDecimal(data / (1024 * 1024 * 1024));
            return domainuseSpace;
          }),

        DTColumnBuilder.newColumn("null")
          .withTitle("操作")
          .renderWith(function (data, type, row) {
            var infoString =
              '<div class="btn-group dropdown-btn" >' +
              '<button type="button" class="btn btn_lightblue btn-xs my-drop-down" ng-click="showDown(\'' +
              row.domainId +
              '\');$event.stopPropagation();">操作 <span class="caret"></span></button>' +
              '<ul class="down" style="min-width:110px;">' +
              "<li><a ng-if='apis.Domain.updateDomain' data-toggle='modal' data-target='#update_modal' ng-click='updateInformation(\"" +
              row.domainId +
              '","' +
              row.domainName +
              '","' +
              row.domainDescription +
              '");doFocus("' +
              "domainNameModify" +
              "\")'>修改</a></li>" +
              "<li><a ng-click='goPool(\"" +
              row.domainId +
              '","' +
              row.domainName +
              "\")'>存储池</a></li>" +
              "<li><a data-toggle='modal' data-target='#datanode_modal' ng-click='getId(\"" +
              row.domainId +
              '","' +
              row.domainName +
              '","' +
              row.domainDescription +
              "\")'>存储节点</a></li>" +
              "</ul></div>";
            return infoString;
          })
          .notSortable(),
      ];

      $scope.showDown = function (id) {
        if ($(".temp-show").size()) {
          $(".temp-show").hide();
          $(".temp-show").removeClass("temp-show");
        } else {
          $("#" + id)
            .find(".my-drop-down")
            .eq(0)
            .next()
            .addClass("temp-show");
          $(".temp-show").toggle();
        }
        $(document).one("click", function () {
          $(".temp-show").hide();
          $(".temp-show").removeClass("temp-show");
        });
      };
      $scope.$on("$destroy", function () {
        $interval.cancel(intervalTime);
      });
      $scope.goPool = function (domainId, domainName) {
        $state.go("app.storage.domain.pool", {
          domainId: domainId,
          sel_domainName: domainName,
          flag: "1",
        });
      };

      function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
          if (selectedItems.hasOwnProperty(id)) {
            selectedItems[id] = selectAll;
            if (selectAll == false) {
              vm.d = true;
              $("#" + id).removeClass("active");
            } else {
              vm.d = false;
              $("#" + id).addClass("active");
            }
          }
        }
      }
      function toggleOne(selectedItems) {
        var s = 0;
        var count = 0;
        for (var id in selectedItems) {
          count++;
          if (selectedItems.hasOwnProperty(id)) {
            if (!selectedItems[id]) {
              vm.selectAll = false;
              $("#" + id).removeClass("active");
            } else {
              s++;
              $("#" + id).addClass("active");
            }
          }
        }
        if (s == count) {
          vm.selectAll = true;
        }
        if (s > 0) {
          vm.d = false;
        } else {
          vm.d = true;
        }
      }

      function drawCallback(result) {
        $(".selectpicker").selectpicker("render");
        vm.selectAll = false;
        vm.disabled = false;
        vm.d = true;
        refreshIds = [];
        if (result.json.data.length > 0) {
          $.each(result.json.data, function (i, value) {
            if (value.status == "Deleting") {
              refreshIds.push(value.domainId);
            }
          });
        }
        if (result.json.data.length > 0) {
          $("#domainTab").next().find(".dataTables_paginate").show();
        } else {
          $("#domainTab").next().find(".dataTables_paginate").hide();
        }

        $("#domainTab_filter").find("input").addClass("filter_input");
        $(".domainClearItem").remove();
        $(
          '<i class="fa fa-times-circle item-error-style domainClearItem" onclick="clearFilter(\'' +
            "domainTab_filter" +
            "')\"></i>"
        ).insertAfter($("#domainTab_filter").find("input"));
        if ($("#domainTab_filter").find("input").val() == "") {
          $(".domainClearItem").hide();
        } else {
          $(".domainClearItem").show();
        }
        $("#domainTab_filter").find("input").unbind("keyup", showItem);
        $("#domainTab_filter")
          .find("input")
          .bind("keyup", { cName: "domainClearItem" }, showItem);
        $(".domainClearItem").click(function (e) {
          e.stopPropagation();
          e.preventDefault();
          $("#domainTab").DataTable().search("").draw();
        });
        
        if (refreshIds.length > 0) {
          $interval.cancel(intervalTime);
          intervalTime = $interval(domainInterval, 3000);
        }
      }
      function domainInterval() {
        if (timeFlag) {
          timeFlag = false;
          if (refreshIds.length > 0) {
          $http({
            method: "POST",
            async: false,
            url: "listDomains",
            data: {
              idsJson: JSON.stringify(refreshIds),
            },
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            transformRequest: function (obj) {
              var str = [];
              for (var s in obj) {
                str.push(
                  encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
                );
              }
              return str.join("&");
            },
          }).then(
            function successCallback(response) {
              timeFlag = true;
              if (
                response.data.domainList.length == 0 ||
                refreshIds.length != response.data.domainList.length
              ) {
                $interval.cancel(intervalTime);
                refreshIds = [];
                vm.dtInstance.reloadData(null, false);
              }
            },
            function errorCallback(response) {}
          );
          }else{
            $interval.cancel(intervalTime);
          }
        }
      }

      $scope.reloadData = function () {
        vm.dtInstance.reloadData(null, false);
      };

      function fixTwoDecimal(value) {
        return Math.round(value * 100) / 100;
      }

      $scope.createReset = function () {
        $scope.createForm.$setPristine();
        $scope.createForm.$setUntouched();
        $scope.description = "";
        document.getElementById("createForm").reset();
      };

      $("#create_modal").on("hidden.bs.modal", function (e) {
        $scope.createReset();
      });

      $scope.updateReset = function () {
        $scope.updateForm.$setPristine();
        $scope.updateForm.$setUntouched();
      };
      $scope.create = function () {
        if ($scope.CreateFormDes) return;
        $http({
          method: "POST",
          async: false,
          url: "createDomain",
          data: {
            domainName: $scope.domainName,
            domainDescription: $("#description").val(),
          },
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(
                encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
              );
            }
            return str.join("&");
          },
        }).then(
          function successCallback(response) {
            if (response.data.resultMessage.message == "success") {
              $("#create_modal").modal("hide");
              domainid = response.data.domain.domainId;
              domainname = response.data.domain.domainName;
              domainDes = response.data.domain.domainDescription;
              $("#prompt_modal").modal("show");
            } else {
              if (
                response.data.resultMessage.message == "ERROR_0019_SessionOut"
              ) {
                showMessage.show(
                  $scope,
                  "warn",
                  translate.getWord("session.out")
                );
                $scope.logout();
                return;
              } else {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord(response.data.resultMessage.message)
                );
              }
            }
            vm.dtInstance.reloadData(null, false);
          },
          function errorCallback(response) {
            showMessage.show(
              $scope,
              "error",
              translate.getWord("create.domain.error")
            );
            vm.dtInstance.reloadData(null, false);
          }
        );

        $scope.createReset();
      };

      $scope.updateInformation = function (id, name, description) {
        $scope.udomainId = id;
        $scope.udomainName = name;
        $scope.udescription = description;
      };

      $scope.update = function () {
        if ($scope.UpdateFormDes) return;
        $http({
          method: "POST",
          async: false,
          url: "updateDomain",
          data: {
            domainId: $scope.udomainId,
            domainName: $scope.udomainName,
            domainDescription: $scope.udescription,
            datanodes: "[]",
          },
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(
                encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
              );
            }
            return str.join("&");
          },
        }).then(
          function successCallback(response) {
            if (response.data.resultMessage.message == "success") {
              showMessage.show(
                $scope,
                "success",
                translate.getWord("response.success")
              );
              $("#update_modal").modal("hide");
            } else {
              if (
                response.data.resultMessage.message == "ERROR_0019_SessionOut"
              ) {
                showMessage.show(
                  $scope,
                  "warn",
                  translate.getWord("session.out")
                );
                $scope.logout();
                return;
              } else {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord(response.data.resultMessage.message)
                );
              }
            }
            vm.dtInstance.reloadData(null, false);
          },
          function errorCallback(response) {
            showMessage.show(
              $scope,
              "error",
              translate.getWord("response.error")
            );
            vm.dtInstance.reloadData(null, false);
          }
        );
      };

      $scope.deleteNames = function () {
        vm.selectName = [];
        vm.selectedId = [];
        angular.forEach(vm.selected, function (data, index, array) {
          if (data == true) {
            vm.selectedId.push(index);
            var a = $("#" + index)
              .children("td")
              .eq("1")
              .find("a")
              .html();
            vm.selectName.push(a);
          }
        });
        $scope.deletenames = vm.selectName.join(",");
      };

      $scope.deletes = function () {
        angular.forEach(vm.selectedId, function (data, index, array) {
          $http({
            method: "post",
            async: false,
            url: "deleteDomain",
            data: {
              domainId: data,
            },
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            transformRequest: function (obj) {
              var str = [];
              for (var s in obj) {
                str.push(
                  encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
                );
              }
              return str.join("&");
            },
          }).then(
            function successCallback(response) {
              if (response.data.resultMessage.message == "success") {
                showMessage.show(
                  $scope,
                  "success",
                  translate.getWord("response.success")
                );
              } else {
                if (
                  response.data.resultMessage.message == "ERROR_0019_SessionOut"
                ) {
                  showMessage.show(
                    $scope,
                    "warn",
                    translate.getWord("session.out")
                  );
                  $scope.logout();
                  return;
                } else {
                  showMessage.show(
                    $scope,
                    "error",
                    translate.getWord(response.data.resultMessage.message)
                  );
                }
              }
              vm.dtInstance.reloadData(null, false);
            },
            function errorCallback(response) {
              showMessage.show(
                $scope,
                "error",
                translate.getWord("response.error")
              );
              vm.dtInstance.reloadData(null, false);
            }
          );
        });
        vm.selectedId = [];
        vm.selectName = [];
      };

      $scope.getDatanodeId = function (id) {
        removeId = id;
      };

      $scope.prompt = function () {
        $scope.getId(domainid, domainname, domainDes);
      };

      $scope.toShow = false;
      $scope.toHide = function () {
        $("#datanode_modal").modal("hide");
        $scope.toShow = false;
      };
      $scope.getId = function (id, name, description) {
        $("#prompt_modal").modal("hide");
        $scope.toShow = true;
        $timeout(function () {
          $(".modal").draggable();
        }, 100);

        domainname = name;
        domainDes = description;
        domainid = id;
        $scope.showDomainName = name;

        vm.dtInstanceU = {};
        vm.dtOptionU = DTOptionsBuilder.newOptions()
          .withDOM(
            "<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
              "t" +
              "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>"
          )
          .withBootstrap()
          .withOption("ajax", {
            url: "listUsedDatanodesByDomainId",
            data: {
              domainId: id,
              randomData: Math.random(),
            },
            dataSrc: function (data) {
              if (data.resultMessage.message == "success") {
                var rtArr = [];
                if (data.beenUsedDatanodes.length > 0) {
                  for (var i = 0; i < data.beenUsedDatanodes.length; i++) {
                    if (
                      data.beenUsedDatanodes[i].status == "OK" ||
                      data.beenUsedDatanodes[i].status == "SEPARATED"
                    ) {
                      rtArr.push(data.beenUsedDatanodes[i]);
                    }
                  }
                }
                return rtArr;
              } else {
                if (data.resultMessage.message == "ERROR_0019_SessionOut") {
                  showMessage.show(
                    $scope,
                    "warn",
                    translate.getWord("session.out")
                  );
                  $scope.logout();
                  return;
                }
              }
            },

            type: "POST",
          })
          .withOption("serverSide", false)
          .withOption("processing", false)
          .withOption("searching", true)
          .withOption("rowId", "instanceId")
          .withOption("fnDrawCallback", function (result) {
            if ($("#domainUsedTab .dataTables_empty").size()) {
              $(".useDatanodeTable").next().find(".dataTables_paginate").hide();
            } else {
              $(".useDatanodeTable")
                .next()
                .find(".dataTables_paginate")
                .show()
                .css("font-size", "8px");
            }

            $("#domainUsedTab_filter").find("input").addClass("filter_input");
            $(".domainUsedClearItem").remove();

            $("#domainUsedTab_filter").addClass("table_top_sm");

            $(".selectpicker").selectpicker("render");

            $(
              '<i class="fa fa-times-circle item-error-style domainUsedClearItem" onclick="clearFilter(\'' +
                "domainUsedTab_filter" +
                "')\"></i>"
            ).insertAfter($("#domainUsedTab_filter").find("input"));
            if ($("#domainUsedTab_filter").find("input").val() == "") {
              $(".domainUsedClearItem").hide();
            } else {
              $(".domainUsedClearItem").show();
            }
            $("#domainUsedTab_filter").find("input").unbind("keyup", showItem);
            $("#domainUsedTab_filter")
              .find("input")
              .bind("keyup", { cName: "domainUsedClearItem" }, showItem);
            $(".domainUsedClearItem").click(function (e) {
              e.stopPropagation();
              e.preventDefault();
              $("#domainUsedTab").DataTable().search("").draw();
            });
          })
          .withOption("createdRow", function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          })
          .withOption("headerCallback", function (header) {
            $compile(angular.element(header).contents())($scope);
          })
          .withLanguage({
            search: "",
            searchPlaceholder: "过滤",
            aria: {
              sortAscending: ": activate to sort column ascending",
              sortDescending: ": activate to sort column descending",
            },
            emptyTable: "表中数据为空",
            info: "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
            infoEmpty: "显示第 0 至 0 项结果，共 0 项",
            zeroRecords: "表中数据为空",
            infoFiltered: "(由 _MAX_ 项结果过滤)",
            lengthMenu:
              "显示" +
              '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white; height:30px !important;" name="timeSelect" >' +
              '<option value="5" >5条</option>' +
              '<option value="10" >10条</option>' +
              '<option value="20" >20条</option>' +
              '<option value="50" >50条</option>' +
              '<option value="100" >100条</option>' +
              "</select>&nbsp;" +
              " ",
            paginate: {
              previous: '<i class="fa fa-angle-left"></i>',
              next: '<i class="fa fa-angle-right"></i>',
              last: '<i class="fa fa-angle-double-right"></i>',
              first: '<i class="fa fa-angle-double-left"></i>',
            },
          })
          .withPaginationType("full_numbers");

        vm.dtColumnU = [
          DTColumnBuilder.newColumn("instanceId")
            .withTitle("实例ID")
            .notVisible(),
          DTColumnBuilder.newColumn("instanceName")
            .withTitle("实例名称")
            .notSortable(),
          DTColumnBuilder.newColumn("instanceId")
            .withTitle("实例ID")
            .notVisible(),
          DTColumnBuilder.newColumn("status")
            .withTitle("状态")
            .renderWith(function (data, type, row) {
              var resultString = "";
              switch (data) {
                case "OK":
                  resultString =
                    "<span class='status_green'>" +
                    translate.getWord("status.ok") +
                    "</span>";
                  break;
                case "SEPARATED":
                  resultString =
                    "<span class='status_red'>" +
                    translate.getWord("status.separated") +
                    "</span>";
                  break;
              }
              return resultString;
            }),
          DTColumnBuilder.newColumn("groupId").withTitle("所在组编号"),
          DTColumnBuilder.newColumn("host").withTitle("主机IP地址"),
          DTColumnBuilder.newColumn("port").withTitle("端口"),

          DTColumnBuilder.newColumn("")
            .withTitle("管理")

            .renderWith(function (data, type, row) {
              return (
                "<a data-toggle='modal' data-target='#remove_modal' ng-show='apis.Domain.removeDatanodeFromDomain' ng-click='getDatanodeId(\"" +
                row.instanceId +
                "\")'>" +
                translate.getWord("datanode.remove") +
                "</a>"
              );
            })
            .notSortable(),
        ];
        vm.selectedN = {};
        vm.selectNameN = new Array();
        vm.selectedIdN = new Array();
        vm.selectAllN = false;
        vm.toggleAllN = toggleAllN;
        vm.toggleOneN = toggleOneN;
        vm.dtInstanceN = {};
        vm.addDatanode = true;
        var datanodeLength;
        vm.dtOptionN = DTOptionsBuilder.newOptions()
          .withDOM(
            "<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
              "t" +
              "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>"
          )
          .withBootstrap()
          .withOption("ajax", {
            url: "listUnusedDatanodesByDomainId",
            data: {
              domainId: id,
              randomData: Math.random(),
            },
            dataSrc: function (data) {
              if (data.resultMessage.message == "success") {
                var rtArr = [];
                if (data.unusedDatanodes.length > 0) {
                  for (var i = 0; i < data.unusedDatanodes.length; i++) {
                    if (
                      data.unusedDatanodes[i].status == "OK" ||
                      data.unusedDatanodes[i].status == "SEPARATED"
                    ) {
                      rtArr.push(data.unusedDatanodes[i]);
                    }
                  }
                }
                datanodeLength = rtArr.length;
                vm.selectedN = {};
                vm.selectAllN = false;
                return rtArr;
              } else {
                if (data.resultMessage.message == "ERROR_0019_SessionOut") {
                  showMessage.show(
                    $scope,
                    "warn",
                    translate.getWord("session.out")
                  );
                  $scope.logout();
                  return;
                }
              }
            },

            type: "POST",
          })
          .withOption("serverSide", false)
          .withOption("processing", false)
          .withOption("paging", true)
          .withOption("searching", true)
          .withOption("rowId", "instanceId")
          .withOption("createdRow", function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          })
          .withOption("headerCallback", function (header) {
            $compile(angular.element(header).contents())($scope);
          })

          .withOption("fnDrawCallback", function (result) {
            $(".selectpicker").selectpicker("render");
            vm.selectAllN = false;
            vm.addDatanode = true;
            if (datanodeLength > 0) {
              $(".newDatanodeTable")
                .next()
                .find(".dataTables_paginate")
                .show()
                .css("font-size", "8px");
            } else {
              $(".newDatanodeTable").next().find(".dataTables_paginate").hide();
            }
            for (var id in vm.selectedN) {
              if (vm.selectedN[id]) {
                vm.selectedN[id] = false;
              }
            }

            $("#domainUnuseTab_filter").find("input").addClass("filter_input");
            $(".domainUnuseClearItem").remove();
            $("#domainUnuseTab_filter").addClass("table_top_sm");

            $(
              '<i class="fa fa-times-circle item-error-style domainUnuseClearItem" onclick="clearFilter(\'' +
                "domainUnuseTab_filter" +
                "')\"></i>"
            ).insertAfter($("#domainUnuseTab_filter").find("input"));
            if ($("#domainUnuseTab_filter").find("input").val() == "") {
              $(".domainUnuseClearItem").hide();
            } else {
              $(".domainUnuseClearItem").show();
            }
            $("#domainUnuseTab_filter").find("input").unbind("keyup", showItem);
            $("#domainUnuseTab_filter")
              .find("input")
              .bind("keyup", { cName: "domainUnuseClearItem" }, showItem);
            $(".domainUnuseClearItem").click(function (e) {
              e.stopPropagation();
              e.preventDefault();
              $("#domainUnuseTab").DataTable().search("").draw();
            });
          })
          .withLanguage({
            search: "",
            searchPlaceholder: "过滤",
            aria: {
              sortAscending: ": activate to sort column ascending",
              sortDescending: ": activate to sort column descending",
            },
            emptyTable: "表中数据为空",
            info: "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
            infoEmpty: "显示第 0 至 0 项结果，共 0 项",
            zeroRecords: "表中数据为空",
            infoFiltered: "(由 _MAX_ 项结果过滤)",
            lengthMenu:
              "显示" +
              '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;" name="timeSelect" >' +
              '<option value="5" >5条</option>' +
              '<option value="10" >10条</option>' +
              '<option value="20" >20条</option>' +
              '<option value="50" >50条</option>' +
              '<option value="100" >100条</option>' +
              "</select>&nbsp;" +
              "",
            paginate: {
              previous: '<i class="fa fa-angle-left"></i>',
              next: '<i class="fa fa-angle-right"></i>',
              last: '<i class="fa fa-angle-double-right"></i>',
              first: '<i class="fa fa-angle-double-left"></i>',
            },
          })
          .withPaginationType("full_numbers");

        vm.dtColumnN = [
          DTColumnBuilder.newColumn("instanceId")
            .withTitle("实例ID")
            .notVisible(),
          DTColumnBuilder.newColumn("null")
            .withTitle(
              '<span class="check_span"><input id="datanodeSelectAll" class="input_check" ng-model="showDomain.selectAllN" ng-click="showDomain.toggleAllN(showDomain.selectAllN, showDomain.selectedN)" type="checkbox" ><label for="datanodeSelectAll"></label></span>'
            )
            .renderWith(function (data, type, row) {
              if (row.status == "SEPARATED") {
                return "";
              } else {
                vm.selectedN[row.instanceId] = false;
                return (
                  '<span class="check_span"><input class="input_check" ng-model="showDomain.selectedN[\'' +
                  row.instanceId +
                  '\'];" ng-click="showDomain.toggleOneN(showDomain.selectedN)" type="checkbox" id="checkbox_' +
                  row.instanceId +
                  '"><label for="checkbox_' +
                  row.instanceId +
                  '"></label></span>'
                );
              }
            })
            .withClass("checkbox_col")
            .notSortable(),
          DTColumnBuilder.newColumn("instanceId")
            .withTitle("实例ID")
            .notVisible(),
          DTColumnBuilder.newColumn("instanceName")
            .withTitle("实例名称")
            .notSortable(),
          DTColumnBuilder.newColumn("status")
            .withTitle("状态")
            .renderWith(function (data, type, row) {
              var resultString = "";
              switch (data) {
                case "OK":
                  resultString =
                    "<span class='status_green'>" +
                    translate.getWord("status.ok") +
                    "</span>";
                  break;
                case "SEPARATED":
                  resultString =
                    "<span class='status_red'>" +
                    translate.getWord("status.separated") +
                    "</span>";
                  break;
              }
              return resultString;
            }),
          DTColumnBuilder.newColumn("groupId").withTitle("所在组编号"),
          DTColumnBuilder.newColumn("host").withTitle("主机IP地址"),
          DTColumnBuilder.newColumn("port").withTitle("端口"),
        ];
      };
      function toggleAllN(selectAll, selectedItems) {
        for (var id in selectedItems) {
          if (selectedItems.hasOwnProperty(id)) {
            var name = $(".newDatanodeTable")
              .find("#" + id)
              .children("td")
              .eq("1")
              .html();
            if (name) {
              selectedItems[id] = selectAll;
            }
            if (selectAll == false) {
              vm.addDatanode = true;
            } else {
              vm.addDatanode = false;
            }
          }
        }
      }
      function toggleOneN(selectedItems) {
        var s = 0;
        var t = 0;
        for (var id in selectedItems) {
          if (selectedItems.hasOwnProperty(id)) {
            var name = $(".newDatanodeTable")
              .find("#" + id)
              .children("td")
              .eq("1")
              .html();
            if (name) {
              t++;
            }
            if (!selectedItems[id]) {
              vm.selectAllN = false;
            } else {
              s++;
            }
          }
        }
        if (s > 0) {
          vm.addDatanode = false;
          if (s == t) {
            vm.selectAllN = true;
          } else {
            vm.selectAllN = false;
          }
        } else {
          vm.addDatanode = true;
        }
      }

      $scope.modelRefresh = function () {
        vm.dtInstanceU.reloadData(null, true);
        vm.dtInstanceN.reloadData(null, true);
        vm.dtInstance.reloadData(null, false);
      };
      $scope.removeDatanode = function () {
        $http({
          method: "post",
          async: false,
          url: "removeDatanodeFromDomain",
          data: {
            domainId: domainid,
            datanodeId: removeId,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(
                encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
              );
            }
            return str.join("&");
          },
        }).then(
          function successCallback(response) {
            if (response.data.resultMessage.message == "success") {
              showMessage.show(
                $scope,
                "success",
                translate.getWord("response.success")
              );

              $timeout(function () {
                $scope.modelRefresh();
              }, 1000);
            } else {
              if (
                response.data.resultMessage.message == "ERROR_0019_SessionOut"
              ) {
                showMessage.show(
                  $scope,
                  "warn",
                  translate.getWord("session.out")
                );
                $scope.logout();
                return;
              } else {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord(response.data.resultMessage.message)
                );
                vm.dtInstance.reloadData(null, true);
              }
            }
          },
          function errorCallback(response) {
            showMessage.show(
              $scope,
              "error",
              translate.getWord("response.error")
            );
            vm.dtInstance.reloadData(null, false);
          }
        );
      };

      $scope.addDatanode = function () {
        vm.selectedIdN = [];
        angular.forEach(vm.selectedN, function (data, index, array) {
          if (data == true) {
            var name = $(".newDatanodeTable")
              .find("#" + index)
              .children("td")
              .eq("1")
              .html();
            if (name) {
              vm.selectedIdN.push(index);
            }
          }
        });
        $http({
          method: "post",
          async: false,
          url: "updateDomain",
          data: {
            domainId: domainid,
            domainName: domainname,
            domainDescription: domainDes,
            datanodes: JSON.stringify(vm.selectedIdN),
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(
                encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
              );
            }
            return str.join("&");
          },
        }).then(
          function successCallback(response) {
            if (response.data.resultMessage.message == "success") {
              showMessage.show(
                $scope,
                "success",
                translate.getWord("response.success")
              );
              $timeout(function () {
                $scope.modelRefresh();
              }, 1000);
              vm.addDatanode = true;
            } else if (response.data.failedInstanceList.length != 0) {
              var str = "下列节点为亚健康节点，不能被添加" + "<br>";
              angular.forEach(
                response.data.failedInstanceList,
                function (item) {
                  str = str + item.instanceName + ":" + item.host + "<br>";
                }
              );
              str =
                str +
                response.data.failedInstanceList[0].instanceName +
                ":" +
                response.data.failedInstanceList[0].host +
                "\r\n";
              showMessage.show($scope, "error", str);
            } else {
              if (
                response.data.resultMessage.message == "ERROR_0019_SessionOut"
              ) {
                showMessage.show(
                  $scope,
                  "warn",
                  translate.getWord("session.out")
                );
                $scope.logout();
                return;
              } else {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord(response.data.resultMessage.message)
                );
                vm.dtInstance.reloadData(null, false);
              }
            }
          },
          function errorCallback(response) {
            showMessage.show(
              $scope,
              "error",
              translate.getWord("response.error")
            );
            vm.dtInstance.reloadData(null, false);
          }
        );
      };
      $scope.doFocus = function (id) {
        focus(id);
      };

      $scope.jumpToPool = function () {
        $("#datanode_modal").modal("hide");
        $scope.toShow = false;
        $state.go("app.storage.domain.pool", {
          domainId: domainid,
          domainName: domainname,
          flag: "2",
        });
      };
      $scope.showInfo = function (id) {
        $state.go("app.storage.domain.domainDetail", { domainId: id });
      };
    }
  );

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

angular.module('app.storage').controller('domainDetailCtrl', function ($compile, focus, $state, DTOptionsBuilder, DTColumnBuilder, $stateParams, $http, $scope, showMessage, $interval, translate, $timeout, $rootScope) {
  var vm = this;
  var currentId = $stateParams.domainId;
  getDomain();
  vm.dtInstance = {};
  var useTableLength;
  var timer;
  var right = $(".detail_right").outerHeight();
  var left = $(".detail_content").outerHeight();
  $(".detail_content").css("min-height", right + "px")
  $(".detail_right").css("min-height", right + "px")
  vm.dtOptions = DTOptionsBuilder
    .newOptions()
    .withDOM("<'dt-toolbar'<'col-xs-12 col-sm-3'l><'col-sm-9 col-xs-12 hidden-xs'f>r>" +
      "t" +
      "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>")
    .withBootstrap()
    .withOption('ajax', {
      url: 'listUsedDatanodesByDomainId',
      data: {
        domainId: currentId
      },
      dataSrc: function (data) {
        if (data.resultMessage.message == "success") {
          var rtArr = [];
          if (data.beenUsedDatanodes.length > 0) {
            for (var i = 0; i < data.beenUsedDatanodes.length; i++) {
              if (data.beenUsedDatanodes[i].status == "OK" || data.beenUsedDatanodes[i].status == "SEPARATED") {
                rtArr.push(data.beenUsedDatanodes[i])
              }
            }
          }
          useTableLength = rtArr.length;
          return rtArr;

        } else {
          if (data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
            return;
          }
        }


      },

      type: 'POST',

    })
    .withOption('serverSide', false)
    .withOption('processing', true)
    .withOption('searching', true)
    .withOption('rowId', 'instanceId')
    .withOption('fnDrawCallback', function (result) {
      $(".selectpicker").selectpicker("render");
      $("#domainDetailTab_filter").find("input").addClass("filter_input");
      $(".domainDetailClearItem").remove();
      $('<i class="fa fa-times-circle item-error-style domainDetailClearItem" onclick="clearFilter(\'' + 'domainDetailTab_filter' + '\')"></i>').insertAfter($("#domainDetailTab_filter").find("input"));
      if ($("#domainDetailTab_filter").find("input").val() == "") {
        $(".domainDetailClearItem").hide();
      } else {
        $(".domainDetailClearItem").show();
      }
      $("#domainDetailTab_filter").find("input").unbind('keyup', showItem);
      $("#domainDetailTab_filter").find("input").bind('keyup', { cName: 'domainDetailClearItem' }, showItem);
      $(".domainDetailClearItem").click(function (e) {
        e.stopPropagation();
        e.preventDefault();
        $('#domainDetailTab').DataTable().search("").draw();
      })

      if (useTableLength > 0) {
        $(".useDatanodeTable").next().find(".dataTables_paginate").show()
      } else {
        $(".useDatanodeTable").next().find(".dataTables_paginate").hide()
      }


    })
    .withOption('createdRow', function (row, data, dataIndex) {
      $compile(angular.element(row).contents())($scope);
    })
    .withOption('headerCallback', function (header) {

      $compile(angular.element(header).contents())($scope);
    })
    .withLanguage({
      "search": '',
      "searchPlaceholder": "过滤",
      "aria": {
        "sortAscending": ": activate to sort column ascending",
        "sortDescending": ": activate to sort column descending"
      },
      "emptyTable": "表中数据为空",
      "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
      "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
      "order": [[2, "asc"]],
      "infoFiltered": "(由 _MAX_ 项结果过滤)",
      "zeroRecords": "表中数据为空",
      "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +

        '<option value="5" >5条</option>' +
        '<option value="10" >10条</option>' +
        '<option value="20" >20条</option>' +
        '<option value="50" >50条</option>' +
        '<option value="100" >100条</option>' +
        '</select>',
      "paginate": {
        "previous": '<i class="fa fa-angle-left"></i>',
        "next": '<i class="fa fa-angle-right"></i>',
        "last": '<i class="fa  fa-angle-double-right"></i>',
        "first": '<i class="fa  fa-angle-double-left"></i>'
      }

    });

  vm.dtColumns = [
    DTColumnBuilder.newColumn('instanceId').withTitle("实例ID").notVisible(),
    DTColumnBuilder.newColumn('instanceName').withTitle("实例名称").notSortable(),
    DTColumnBuilder.newColumn('instanceId').withTitle("实例ID"),
    DTColumnBuilder.newColumn('groupId').withTitle("所在组编号"),
    DTColumnBuilder.newColumn('host').withTitle("主机IP地址"),
    DTColumnBuilder.newColumn('port').withTitle("端口"),
    DTColumnBuilder.newColumn('status').withTitle("当前状态")
      .renderWith(function (data, type, row) {
        let resultString = ""
        switch (data) {
          case "OK":
            resultString = "<span class='status_green'>" + translate.getWord("status.ok") + "</span>"; break;
          case "SEPARATED":
            resultString = "<span class='status_red'>" + translate.getWord("status.separated") + "</span>"; break;

        }
        return resultString;
      })
  ];
  function getDomain() {
    var arr = [];
    arr.push(currentId)
    $http({
      method: "POST",
      async: false,
      url: "listDomains",
      data: { idsJson: JSON.stringify(arr) },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(response) {
      if (response.data.resultMessage.message == "success") {
        $scope.domainName = response.data.domainList[0].domainName;
        $("#description").html(response.data.domainList[0].domainDescription || "<span class='none_info'>无</span>");
        var str = "";
        switch (response.data.domainList[0].status) {
          case "Available":
            str = str + "<span class='label label-success status-static'>可用</span>"; break;
          case "Deleting":
            str = str + '<div class="progress progress-striped active" >'
              + '<div class="progress-bar progress-bar-primary" role="progressbar"  style="width: 100%" ><span>删除中</span></div></div>'; break
          default:
            str = response.data.domainList[0].status; break;
        }
        $("#status").html(str);
        $scope.logicalSpace = fixTwoDecimal(response.data.domainList[0].logicalSpace / (1024 * 1024 * 1024));
        $scope.freeSpace = fixTwoDecimal(response.data.domainList[0].freeSpace / (1024 * 1024 * 1024));
        $scope.useSpace = fixTwoDecimal(response.data.domainList[0].useSpace / (1024 * 1024 * 1024));
        if (response.data.domainList[0].status != "Available") {
          $timeout.cancel(timer)
          timer = $timeout(getDomain, 3000);
        }
      } else {
        if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
          showMessage.show($scope, "warn", translate.getWord("session.out"));
          $scope.logout();
          return;
        } else {
          timer = $timeout(getDomain, 3000);
          showMessage.show($scope, "error", translate.getWord(response.data.resultMessage.message));
        }

      }

    });
  }
  function fixTwoDecimal(value) {
    return Math.round(value * 100) / 100;
  }
  $scope.refresh = function () {
    getDomain();
    vm.dtInstance.reloadData(null, false);
  }
  $scope.$on('$destroy', function () {
    $timeout.cancel(timer)
  })
})

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

angular.module('app.storage').controller('showTable', function ($http,$scope,DTOptionsBuilder, DTColumnBuilder,$compile) {
    $(".modal").draggable();  
    var vm = this;
    $scope.$on('getId',function(e,newId){
    	$scope.domainId=newId;
        $('#datanode_list').html(' <table datatable dt-options="showDatanode.dtOptionU" dt-columns="showDatanode.dtColumnU" class="table table-striped  table-hover row-border hover" dt-instance="showDatanode.dtInstanceU" ></table>')
    	vm.dtInstanceU = {};
        vm.dtOptionU= DTOptionsBuilder
         .newOptions()
         .withBootstrap()
         .withOption('ajax', {
         url: 'listUsedDatanodesByDomainId',
         data:{
            domainId:newId
         },
        dataSrc:function(data){
           var rtArr=[];
           for(var i=0;i<data.beenUsedDatanodes.length;i++){
                if(data.beenUsedDatanodes[i].status=="OK"){
                        rtArr.push(data.beenUsedDatanodes[i])
                    }
            }
          return rtArr;
        },
         type: 'POST',
         
     })
        .withDataProp('data')
        .withOption('serverSide',false)
        .withOption('processing',false)
        .withOption('bInfo', false)
        .withOption('paging', false)
        .withOption('searching',false)
        .withOption('rowId', 'instanceId')
        .withLanguage({
            "aria": {
                "sortAscending": ": activate to sort column ascending",
                "sortDescending": ": activate to sort column descending"
            },
            "emptyTable": "此表为空",
            "info": "表格信息",
            "infoEmpty": "表格为空",
            "zeroRecords": "没有数据"
        })
    vm.dtColumnU = [
    DTColumnBuilder.newColumn('instanceName').withTitle('实例名称'),
    DTColumnBuilder.newColumn('instanceId').withTitle('实例ID'),
    DTColumnBuilder.newColumn('groupId').withTitle('所在组编号'),
    DTColumnBuilder.newColumn('host').withTitle('主机IP地址'),
    DTColumnBuilder.newColumn('port').withTitle('端口'),
    DTColumnBuilder.newColumn('status').withTitle('当前状态')
            .renderWith(function(data,type,row){
                return "<span class='status_green'>"+row.status+"</span>"
            }),
    
    DTColumnBuilder.newColumn('null').withTitle('管理')
           .renderWith(function(data, type,row) {
              return "<a>移除存储节点</a>";
        }).notSortable()
 ];
   })
})
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

angular.module('app.storage').controller('diskTable', function ($http,$scope,DTOptionsBuilder, DTColumnBuilder,$compile) {
    $(".modal").draggable();
     $scope.$on('getId',function(e,newId){
       id=newId;
    })
    var vm = this;
    var id;
    var oTable=$(".poolTable").dataTable();
    var tr = document.getElementById(id)
    var row = oTable.api().row( tr );
    var data=row.data();
    var newData=[];
})
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

angular
  .module("app.storage")
  .controller(
    "poolCtrl",
    function (
      focus,
      $state,
      $stateParams,
      $http,
      $scope,
      DTOptionsBuilder,
      DTColumnBuilder,
      $compile,
      showMessage,
      $interval,
      translate,
      $timeout,
      $rootScope
    ) {
      $(".modal").draggable();

      var domainId = $stateParams.domainId;
      $scope.cDomainName = $stateParams.sel_domainName;
      $scope.$on("$viewContentLoaded", function () {
        $(".page-title span:first").html("(所属域 " + $scope.cDomainName + ")");
      });
      var vm = this;

      var poolId,
        poolname,
        currentStrategy,
        poolDes,
        uminspeed,
        utactic,
        umaxspeed;

      vm.selected = {};
      vm.selectedId = new Array();

      vm.selectAll = false;
      vm.toggleAll = toggleAll;
      vm.toggleOne = toggleOne;

      vm.toggleAllN = toggleAllN;
      vm.toggleOneN = toggleOneN;

      vm.disabled = false;
      vm.dtInstance = {};
      $scope.strategys = ["Capacity", "Performance", "Mixed"];
      vm.d = true;
      var newData = [];
      var tableLength;
      $scope.toShow = false;
      var removeId;
      var currentInstanceId;
      var refreshIds = [];
      var intervalTime;
      var setTime;
      $scope.ratio = false;
      $scope.showSpeed = false;

      var speedInterval;
      $scope.diskShow = false;

      var timeFlag = true;
      var statusLevel = $stateParams.statusLevel;
      var level = $("#tabStatus").val() || "";
      if (statusLevel != "") {
        level = statusLevel;
      }

      $scope.$watch("description", function (newValue, oldValue, scope) {
        var len = 0;
        var l;
        if (newValue) {
          for (var i = 0; i < newValue.length; i++) {
            l = newValue.charCodeAt(i);
            if (l >= 0 && l <= 128) {
              len += 1;
            } else {
              len += 2;
            }
          }
        }

        $scope.PoolFormDes = len > 250;
      });

      $scope.$watch("updatedescription", function (newValue, oldValue, scope) {
        var len = 0;
        var l;
        if (newValue) {
          for (var i = 0; i < newValue.length; i++) {
            l = newValue.charCodeAt(i);
            if (l >= 0 && l <= 128) {
              len += 1;
            } else {
              len += 2;
            }
          }
        }

        $scope.UpdatedFormDes = len > 250;
      });

      var selectStr =
        '<span style="margin-left:10px;float:right !important"><select data-width="100px" class="selectpicker " id="tabStatus" style="background-color: white;"  name="mySelect"  >' +
        '<option value="" >所有状态</option>' +
        '<option value="HIGH" >健康状态</option>' +
        '<option value="OTHER" >错误状态</option>' +
        "</select></span>";
      vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption("ajax", {
          url: BASE_API + "listStoragePoolDT",
          data: {
            domainId: domainId,
            statusLevel: level,
          },
          type: "POST",
          dataSrc: function (data) {
            if (data.resultMessage.message == "ERROR_0019_SessionOut") {
              showMessage.show(
                $scope,
                "warn",
                translate.getWord("session.out")
              );
              $scope.logout();
              return;
            }
            tableLength = data.data.length;
            vm.selected = {};
            vm.selectAll = false;
            return data.data;
          },
        })
        .withDOM(
          "<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
            "t" +
            "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>"
        )

        .withBootstrap()
        .withOption("processing", false)
        .withOption("serverSide", true)
        .withOption("rowId", "poolId")
        .withOption("fnDrawCallback", drawCallback)
        .withOption("fnInitComplete", function (result) {
          $(selectStr).insertBefore($("#poolTab_filter label"));
          $("#tabStatus").unbind();
          $("#tabStatus").bind("change", function () {
            level = $("#tabStatus").val() || "";
            vm.dtInstance.changeData({
              data: {
                domainId: domainId,
                statusLevel: level,
                randomData: Math.random(),
              },
              url: "listStoragePoolDT",
              dataSrc: function (data) {
                vm.selected = {};
                vm.selectAll = false;

                if (data.resultMessage.message != "success") {
                  if (data.resultMessage.message == "ERROR_0019_SessionOut") {
                    showMessage.show(
                      $scope,
                      "error",
                      translate.getWord("session.out")
                    );
                    $scope.logout();
                  }
                } else {
                  return data.data;
                }
              },
              type: "POST",
            });
          });
          $("#tabStatus").selectpicker("val", level);
          $(".selectpicker").selectpicker("render");
        })
        .withLanguage({
          search: "",
          searchPlaceholder: "查询存储池名称",
          aria: {
            sortAscending: ": activate to sort column ascending",
            sortDescending: ": activate to sort column descending",
          },
          emptyTable: "表中数据为空",
          info: "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
          infoEmpty: "显示第 0 至 0 项结果，共 0 项",
          order: [[2, "asc"]],
          infoFiltered: "(由 _MAX_ 项结果过滤)",
          zeroRecords: "表中数据为空",
          lengthMenu:
            "显示" +
            '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
            '<option value="5" >5条</option>' +
            '<option value="10" >10条</option>' +
            '<option value="20" >20条</option>' +
            '<option value="50" >50条</option>' +
            '<option value="100" >100条</option>' +
            "</select>&nbsp;" +
            "  ",
          paginate: {
            previous: '<i class="fa fa-angle-left"></i>',
            next: '<i class="fa fa-angle-right"></i>',
            last: '<i class="fa  fa-angle-double-right"></i>',
            first: '<i class="fa  fa-angle-double-left"></i>',
          },
        })
        .withPaginationType("full_numbers")
        .withOption("createdRow", function (row, data, dataIndex) {
          $compile(angular.element(row).contents())($scope);
        })
        .withOption("headerCallback", function (header) {
          if (!vm.headerCompiled) {
            vm.headerCompiled = true;
            $compile(angular.element(header).contents())($scope);
          }
        });

      vm.dtColumns = [
        DTColumnBuilder.newColumn("poolId").withTitle("ID").notVisible(),
        DTColumnBuilder.newColumn("null")
          .withTitle("")
          .renderWith(function (data, type, row) {
            return (
              '<span class="fa fa-plus-square-o row-details" value="' +
              row.poolId +
              '"></span>'
            );
          })
          .withClass("checkbox_col")
          .notSortable()
          .notVisible(),
        DTColumnBuilder.newColumn("null")
          .withTitle(
            '<span class="check_span"><input  class="input_check" ng-model="showPool.selectAll" ng-click="showPool.toggleAll(showPool.selectAll, showPool.selected)" type="checkbox" id="selectallFlag"><label for="selectallFlag"></label></span>'
          )
          .renderWith(function (data, type, row) {
            vm.selected[row.poolId] = false;
            return (
              '<span class="check_span"><input class="input_check"  ng-model="showPool.selected[\'' +
              row.poolId +
              '\'];" ng-click="showPool.toggleOne(showPool.selected)" type="checkbox" id="checkbox_' +
              row.poolId +
              '"><label for="checkbox_' +
              row.poolId +
              '"></label></span>'
            );
          })
          .withClass("checkbox_col")
          .notSortable(),
        DTColumnBuilder.newColumn("domainId").withTitle("ID").notVisible(),
        DTColumnBuilder.newColumn("poolName")
          .withTitle("存储池名称")
          .renderWith(function (data, type, row) {
            return (
              '<a title="查看存储池详情" ng-click="showInfo(\'' +
              row.poolId +
              "','" +
              row.domainId +
              "','" +
              row.domainName +
              "')\">" +
              data +
              "</a>"
            );
          }),
        DTColumnBuilder.newColumn("description")
          .withTitle("描述")
          .notSortable(),
        DTColumnBuilder.newColumn("status")
          .withTitle("状态")
          .renderWith(function (data, type, row) {
            if (data == "Available") {
              return "<span class='status_green'>可用</span>";
            } else {
              return (
                '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar"  style="width: 100%" ><span>删除中</span></div></div>'
              );
            }
          }),
        DTColumnBuilder.newColumn("storagePoolLevel")
          .withTitle("存储池等级")
          .notSortable()
          .renderWith(function (data, type, row) {
            var str = "";
            switch (data) {
              case "HIGH":
                str = "<span class='status_green'>高</span>";
                break;
              case "MIDDLE":
                str = "<span class='status_orange'>中</span>";
                break;
              case "LOW":
                str = "<span class='status_yellow'>低</span>";
                break;
            }
            return str;
          }),
        DTColumnBuilder.newColumn("migrationStrategy")
          .withTitle("QoS策略")
          .notSortable()
          .renderWith(function (data, type, row) {
            if (data == null) {
              return "";
            } else {
              return "<a ng-click='goQos(\"" + data + "\")'>" + data + "<a>";
            }
          }),
        DTColumnBuilder.newColumn("minMigrationSpeed")
          .withClass("singleDiskSpeeed")
          .withTitle("单盘重构速度上限(MB/s)")
          .notSortable()
          .renderWith(function (data, type, row) {
            var str = "";
            if (row.migrationStrategy != "Smart") {
              str = str + data;
            }
            return str;
          })
          .notVisible(),
        DTColumnBuilder.newColumn("null")
          .withTitle("资源池重构速度上限(MB/s)")
          .notSortable()
          .renderWith(function (data, type, row) {
            var count = 0;
            var string = "";
            if (row.migrationStrategy == null) {
              return "";
            } else {
              var maxMigrationSpeed = row.maxMigrationSpeed / 1024;
              if (row.archivesInDatanode) {
                for (var key in row.archivesInDatanode) {
                  $.each(row.archivesInDatanode[key], function (i, tmp) {
                    if (key.getQuery("status") == "OK") {
                      if (tmp.status == "GOOD") {
                        count++;
                      }
                    }
                  });
                }

                string = string + maxMigrationSpeed * count;
              }

              return string;
            }
          })
          .notVisible(),
        DTColumnBuilder.newColumn("migrationSpeed")
          .withTitle("重构进度")
          .notSortable()
          .renderWith(function (data, type, row) {
            var string = "";
            var speed = "";
            if (data >= 1024) {
              speed = speed + (data / 1024).toFixed(1) + "M/s";
            } else {
              speed = speed + data + "K/s";
            }
            if (row.migrationRatio == "100.0") {
              string = string + "无重构";
            } else {
              let migrationData = formatMigrationData(
                (row.totalMigrateDataSizeMb * row.migrationRatio) / 100
              );
              let totalMigrationData = formatMigrationData(
                row.totalMigrateDataSizeMb
              );
              let showStr =
                migrationData + "/" + totalMigrationData + " (" + speed + ")";
              string =
                string +
                '<div class="pool_progress progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar"  style="width: 100%" ><span>' +
                showStr +
                "</span></div></div>";
            }
            return string;
          }),

        DTColumnBuilder.newColumn("null")
          .withTitle("操作")
          .renderWith(function (data, type, row) {
            var infoString =
              '<div class="btn-group dropdown-btn"  >' +
              '<button type="button" class="btn btn_lightblue btn-xs my-drop-down" ng-click="showDown(\'' +
              row.poolId +
              '\');$event.stopPropagation();">操作 <span class="caret"></span></button>' +
              '<ul class="down" style="min-width:110px;">' +
              "<li><a  ng-show='apis.StoragePool.updateStoragePool'  ng-click='doFocus(\"" +
              "poolNameModify" +
              '");updateInformation("' +
              row.poolId +
              "\")'>修改</a></li>" +
              "<li><a data-toggle='modal' data-target='#disk_modal' ng-click='getId(\"" +
              row.poolId +
              '","' +
              row.poolName +
              '","' +
              row.strategy +
              '","' +
              row.description +
              '","' +
              row.minMigrationSpeed +
              '","' +
              row.migrationStrategy +
              '","' +
              row.maxMigrationSpeed +
              "\")' >磁盘</a></li>";

            if (row.migrationRatio != "100.0") {
              infoString +=
                "<li><a ng-click='showSpeedDisk(\"" +
                row.poolId +
                "\")'  data-toggle='modal' data-target='#diskspeed_modal'>重构详情</a></li>";
            }

            return infoString + "</ul></div>";
          })
          .notSortable(),
      ];
      $scope.showDown = function (id) {
        if ($(".temp-show").size()) {
          $(".temp-show").hide();
          $(".temp-show").removeClass("temp-show");
        } else {
          $("#" + id)
            .find(".my-drop-down")
            .eq(0)
            .next()
            .addClass("temp-show");
          $(".temp-show").toggle();
        }
        $(document).one("click", function () {
          $(".temp-show").hide();
          $(".temp-show").removeClass("temp-show");
        });
      };

      $scope.goQos = function (name) {
        $state.go("app.storage.qos", { QosName: name, flag: "2" });
      };
      $scope.showInfo = function (poolId, domainId, domainName) {
        $state.go("app.storage.domain.pool.poolDetail", {
          poolId: poolId,
          domainId: domainId,
          domainName: domainName,
        });
      };

      function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
          if (selectedItems.hasOwnProperty(id)) {
            selectedItems[id] = selectAll;
            if (selectAll == false) {
              vm.d = true;

              $(".poolTable")
                .find("#" + id)
                .removeClass("active");
            } else {
              vm.d = false;
              $(".poolTable")
                .find("#" + id)
                .addClass("active");
            }
          }
        }
      }
      function toggleOne(selectedItems) {
        var s = 0;
        for (var id in selectedItems) {
          if (selectedItems.hasOwnProperty(id)) {
            if (!selectedItems[id]) {
              vm.selectAll = false;
              $(".poolTable")
                .find("#" + id)
                .removeClass("active");
            } else {
              s++;
              $(".poolTable")
                .find("#" + id)
                .addClass("active");
            }
          }
        }
        if (s > 0) {
          vm.d = false;
          if (s == tableLength) {
            vm.selectAll = true;
          } else if (s == 1) {
            vm.selectAll = false;
          } else {
            vm.selectAll = false;
          }
        } else {
          vm.d = true;
        }
      }

      function drawCallback(result) {
        $(".selectpicker").selectpicker("render");
        $(".selectpicker").selectpicker("refresh");
        vm.selectAll = false;
        vm.disabled = false;

        vm.d = true;
        $scope.stopRefresh();
        var oTable = $(".poolTable").dataTable();
        if ($.fn.dataTable.isDataTable(oTable)) {
          $(".poolTable tbody").off("click", "span.row-details");
        }
        $interval.cancel(intervalTime);
        refreshIds = [];
        if (result.json.data.length > 0) {
          $.each(result.json.data, function (i, value) {
            if (value.status == "Deleting" || value.migrationRatio != "100.0") {
              refreshIds.push(value.poolId);
            }
          });
        }

        $("#poolTab_filter").find("input").addClass("filter_input");
        $(".poolClearItem").remove();
        $(
          '<i class="fa fa-times-circle item-error-style poolClearItem" onclick="clearFilter(\'' +
            "poolTab_filter" +
            "')\"></i>"
        ).insertAfter($("#poolTab_filter").find("input"));
        if ($("#poolTab_filter").find("input").val() == "") {
          $(".poolClearItem").hide();
        } else {
          $(".poolClearItem").show();
        }
        $("#poolTab_filter").find("input").unbind("keyup", showItem);
        $("#poolTab_filter")
          .find("input")
          .bind("keyup", { cName: "poolClearItem" }, showItem);
        $(".poolClearItem").click(function (e) {
          e.stopPropagation();
          e.preventDefault();
          $("#poolTab").DataTable().search("").draw();
        });

        if (refreshIds.length > 0) {
          intervalTime = $interval(getStatus, 5000);
        }
        if (result.json) {
          if (result.json.data.length > 0) {
            $("poolTab_wrapper .dataTables_paginate").show();
          } else {
            $("poolTab_wrapper .dataTables_paginate").hide();
          }
          vm.pools = {};
          angular.forEach(result.json.data, function (data, index, array) {
            vm.pools[data.poolId] = data;
          });
        }
      }

      $scope.$watch("$viewContentLoaded", function (event) {
        if ($stateParams.poolName != "") {
          $(".poolTable").DataTable().search($stateParams.poolName).draw();
        }
        if ($stateParams.flag == "2") {
          $("#create_modal").modal("show");
          focus("poolName");
        }
      });

      $scope.$on("$destroy", function () {
        $interval.cancel(intervalTime);
        $interval.cancel(speedInterval);
      });

      function getStatus() {
        if (timeFlag) {
          timeFlag = false;
          if (refreshIds.length > 0) {
            $http({
              method: "POST",
              async: false,
              url: "listStoragePool",
              data: {
                poolIds: JSON.stringify(refreshIds),
                domainId: domainId,
              },
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              transformRequest: function (obj) {
                var str = [];
                for (var s in obj) {
                  str.push(
                    encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
                  );
                }
                return str.join("&");
              },
            }).then(
              function successCallback(response) {
                timeFlag = true;
                if (
                  response.data.simpleStoragePoolsList.length == 0 ||
                  refreshIds.length !=
                    response.data.simpleStoragePoolsList.length
                ) {
                  $interval.cancel(intervalTime);
                  refreshIds = [];
                  vm.dtInstance.reloadData(null, false);
                } else {
                  if (response.data.simpleStoragePoolsList) {
                    $.each(
                      response.data.simpleStoragePoolsList,
                      function (i, value) {
                        var migrationStr = "";
                        var operationStr = "";
                        operationStr =
                          '<div class="btn-group dropdown-btn"  >' +
                          '<button type="button" class="btn btn_lightblue btn-xs my-drop-down" ng-click="showDown(\'' +
                          value.poolId +
                          '\');$event.stopPropagation();">操作 <span class="caret"></span></button>' +
                          '<ul class="down" style="min-width:110px;">' +
                          "<li><a  ng-show='apis.StoragePool.updateStoragePool'  ng-click='doFocus(\"" +
                          "poolNameModify" +
                          '");updateInformation("' +
                          value.poolId +
                          "\")'>修改</a></li>" +
                          "<li><a data-toggle='modal' data-target='#disk_modal' ng-click='getId(\"" +
                          value.poolId +
                          '","' +
                          value.poolName +
                          '","' +
                          value.strategy +
                          '","' +
                          value.description +
                          '","' +
                          value.minMigrationSpeed +
                          '","' +
                          value.migrationStrategy +
                          '","' +
                          value.maxMigrationSpeed +
                          "\")' >磁盘</a></li>";
                        if (value.migrationRatio == "100.0") {
                          migrationStr = migrationStr + "无重构";
                          operationStr =
                            "<a data-toggle='modal' data-target='#disk_modal' ng-click='getId(\"" +
                            value.poolId +
                            '","' +
                            value.poolName +
                            '","' +
                            value.strategy +
                            '","' +
                            value.description +
                            '","' +
                            value.minMigrationSpeed +
                            '","' +
                            value.migrationStrategy +
                            '","' +
                            value.maxMigrationSpeed +
                            "\")' >磁盘</a>&nbsp;&nbsp;&nbsp;";
                          $("#" + value.poolId)
                            .children("td")
                            .last()
                            .html($compile(infoString)($scope));
                        } else {
                          var speed = "";
                          if (value.migrationSpeed >= 1024) {
                            speed =
                              speed +
                              (value.migrationSpeed / 1024).toFixed(1) +
                              "M/s";
                          } else {
                            speed = speed + value.migrationSpeed + "K/s";
                          }
                          let migrationData = formatMigrationData(
                            (value.totalMigrateDataSizeMb *
                              value.migrationRatio) /
                              100
                          );
                          let totalMigrationData = formatMigrationData(
                            value.totalMigrateDataSizeMb
                          );
                          let showStr =
                            migrationData +
                            "/" +
                            totalMigrationData +
                            " (" +
                            speed +
                            ")";

                          migrationStr =
                            migrationStr +
                            '<div class="pool_progress progress progress-striped active" >' +
                            '<div class="progress-bar progress-bar-primary" role="progressbar"  style="width: 100%" ><span>' +
                            showStr +
                            "</span></div></div>";

                          operationStr +=
                            "<li><a ng-click='showSpeedDisk(\"" +
                            value.poolId +
                            "\")'  data-toggle='modal' data-target='#diskspeed_modal'>重构详情</a></li>";
                        }
                        operationStr += "</ul></div>";
                        $("#" + value.poolId)
                          .children("td")
                          .last()
                          .html($compile(operationStr)($scope));
                        $("#" + value.poolId)
                          .children("td")
                          .eq(6)
                          .html($compile(migrationStr)($scope));
                      }
                    );
                  }
                }
              },
              function errorCallback(response) {}
            );
          } else {
            $interval.cancel(intervalTime);
          }
        }
      }

      function formatMigrationData(valueSize) {
        let unit = "MB";
        if (valueSize > 1024) {
          valueSize = (valueSize / 1024).toFixed(1);
          unit = "GB";
        }
        if (valueSize > 1024) {
          valueSize = (valueSize / 1024).toFixed(1);
          unit = "TB";
        }
        return valueSize + unit;
      }

      $scope.reloadData = function () {
        vm.dtInstance.reloadData(null, false);
      };

      $scope.stopRefresh = function () {
        vm.startBtn = false;
        vm.stopBtn = true;
      };

      $scope.createReset = function () {
        $scope.poolForm.$setPristine();
        $scope.poolForm.$setUntouched();
        $scope.description = "";
        $("#strategy_create").selectpicker("val", "Capacity");
        document.getElementById("createForm").reset();
      };

      $("#create_modal").on("hidden.bs.modal", function (e) {
        $scope.createReset();
      });

      $scope.updateReset = function () {
        $scope.updateForm.$setPristine();
        $scope.updateForm.$setUntouched();
        $scope.showSpeed = false;
      };

      $scope.resetSpeedDisk = function () {
        var oTable = $(".speedTable").dataTable();
        oTable.api().destroy();
        $("#diskspeed_modal").modal("hide");
        $scope.diskShow = false;
        $interval.cancel(speedInterval);
      };

      function speedDiskRefresh() {
        vm.dtInstanceD.reloadData(null, false);
      }
      $scope.create = function () {
        if ($scope.PoolFormDes) return;
        $http({
          method: "POST",
          async: false,
          url: "createStoragePool",
          data: {
            domainId: domainId,
            poolName: $scope.poolName,
            description: $("#description").val(),
            strategy: $("#strategy_create").selectpicker("val"),
          },
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(
                encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
              );
            }
            return str.join("&");
          },
        }).then(
          function successCallback(response) {
            if (response.data.resultMessage.message == "success") {
              $("#create_modal").modal("hide");
              vm.dtInstance.reloadData(null, false);
              poolId = response.data.pool.poolId;
              poolname = response.data.pool.poolName;
              currentStrategy = response.data.pool.strategy;
              poolDes = response.data.pool.description;
              uminspeed = response.data.pool.migrationSpeed;
              utactic = response.data.pool.migrationStrategy;
              umaxspeed = response.data.pool.maxMigrationSpeed;
              $("#prompt_modal").modal("show");
            } else {
              if (
                response.data.resultMessage.message == "ERROR_0019_SessionOut"
              ) {
                showMessage.show(
                  $scope,
                  "warn",
                  translate.getWord("session.out")
                );
                $scope.logout();
                return;
              } else {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord(response.data.resultMessage.message)
                );
              }
            }
          },
          function errorCallback(response) {}
        );
        $scope.createReset();
      };

      $scope.updateInformation = function (index) {
        var strategy_u = $(".poolTable")
          .find("#" + index)
          .children("td")
          .eq("3")
          .html();
        switch (strategy_u) {
          case translate.getWord("Capacity"):
            strategy_u = "Capacity";
            break;
          case translate.getWord("Performance"):
            strategy_u = "Performance";
            break;
          case translate.getWord("Mixed"):
            strategy_u = "Mixed";
            break;
        }
        var str = $(".poolTable")
          .find("#" + index)
          .find(".singleDiskSpeeed")
          .html();
        $scope.updateId = index;
        $scope.updateName = $(".poolTable")
          .find("#" + index)
          .children("td")
          .eq("1")
          .text();
        $scope.updatedescription = $(".poolTable")
          .find("#" + index)
          .children("td")
          .eq("2")
          .html();
        $("#strategy_update").selectpicker("val", strategy_u);

        $(".selectpicker").selectpicker("render");
        $(".selectpicker").selectpicker("refresh");

        $("#update_modal").modal("show");
      };

      $scope.update = function () {
        if ($scope.UpdatedFormDes) return;
        $http({
          method: "POST",
          async: false,
          url: "updateStoragePool",
          data: {
            domainId: domainId,
            poolId: $scope.updateId,
            poolName: $scope.updateName,
            strategy: $("#strategy_update").selectpicker("val"),
            description: $scope.updatedescription,
            diskMapString: "[]",
          },
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(
                encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
              );
            }
            return str.join("&");
          },
        }).then(
          function successCallback(response) {
            if (response.data.resultMessage.message == "success") {
              showMessage.show(
                $scope,
                "success",
                translate.getWord("response.success")
              );
              vm.dtInstance.reloadData(null, false);
              $("#update_modal").modal("hide");
            } else {
              if (
                response.data.resultMessage.message == "ERROR_0019_SessionOut"
              ) {
                showMessage.show(
                  $scope,
                  "warn",
                  translate.getWord("session.out")
                );
                $scope.logout();
                return;
              } else {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord(response.data.resultMessage.message)
                );
              }
            }
            $scope.updateReset();
          },
          function errorCallback(response) {
            showMessage.show(
              $scope,
              "error",
              translate.getWord("response.error")
            );
            vm.dtInstance.reloadData(null, false);
          }
        );
      };

      $scope.deleteNames = function () {
        vm.selectedId = [];
        vm.selectName = new Array();
        vm.selectedId = [];
        angular.forEach(vm.selected, function (data, index, array) {
          if (data == true) {
            vm.selectedId.push(index);
            var a = $(".poolTable")
              .find("#" + index)
              .children("td")
              .eq("1")
              .text();
            vm.selectName.push(a);
          }
        });
        $scope.deletenames = vm.selectName.join(",");
      };

      $scope.deletes = function () {
        angular.forEach(vm.selectedId, function (data, index, array) {
          $http({
            method: "post",
            async: false,
            url: "deleteStoragePool",
            data: {
              domainId: domainId,
              poolId: data,
            },
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            transformRequest: function (obj) {
              var str = [];
              for (var s in obj) {
                str.push(
                  encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
                );
              }
              return str.join("&");
            },
          }).then(
            function successCallback(response) {
              if (response.data.resultMessage.message == "success") {
                showMessage.show(
                  $scope,
                  "success",
                  translate.getWord("response.success")
                );
                vm.dtInstance.reloadData(null, false);
              } else {
                if (
                  response.data.resultMessage.message == "ERROR_0019_SessionOut"
                ) {
                  showMessage.show(
                    $scope,
                    "warn",
                    translate.getWord("session.out")
                  );
                  $scope.logout();
                  return;
                } else {
                  showMessage.show(
                    $scope,
                    "error",
                    translate.getWord(response.data.resultMessage.message)
                  );
                }
              }
            },
            function errorCallback(response) {
              showMessage.show(
                $scope,
                "error",
                translate.getWord("response.error")
              );
              vm.dtInstance.reloadData(null, false);
            }
          );
        });
        vm.selectedId = [];
      };

      function fixTwoDecimal(value) {
        return Math.round(value * 100) / 100;
      }
      String.prototype.getQuery = function (name) {
        var reg = new RegExp("(\\{|(,\\s*))" + name + "=\\S*(,|\\})");
        var r = this.substr(this.indexOf("{")).match(reg);
        var m = r[0].substring(r[0].indexOf("=") + 2);
        m = m.substr(0, m.length - 2);
        if (m != null) return m;
        return null;
      };
      $scope.showSpeedDisk = function (id) {
        var TableLength;
        $scope.diskShow = true;
        vm.dtInstanceD = {};
        vm.dtOptionD = DTOptionsBuilder.newOptions()
          .withDOM(
            "<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
              "t" +
              "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>"
          )
          .withBootstrap()
          .withOption("ajax", {
            url: "listStoragePool",
            data: {
              domainId: domainId,
            },
            dataSrc: function (data) {
              var speedData = [];
              if (data.simpleStoragePoolsList.length > 0) {
                angular.forEach(
                  data.simpleStoragePoolsList,
                  function (data, index, array) {
                    if (data.poolId == id) {
                      for (var key in data.archivesInDatanode) {
                        $.each(data.archivesInDatanode[key], function (i, tmp) {
                          if (tmp.migrationRatio != "100.0") {
                            var logicalSpace = fixTwoDecimal(
                              tmp.logicalSpace / (1024 * 1024 * 1024)
                            );
                            if (tmp.status == "GOOD") {
                              speedData.push({
                                instanceId: key.getQuery("instanceId"),
                                host: key.getQuery("host"),
                                groupId: key.getQuery("groupId"),
                                archiveId: tmp.archiveId,
                                deviceName: tmp.deviceName,
                                logical: logicalSpace,
                                status: tmp.status,
                                migrationRatio: tmp.migrationRatio,
                                migrationSpeed: tmp.migrationSpeed,
                              });
                            }
                          }
                        });
                      }
                    }
                  }
                );
              }
              TableLength = speedData.length;
              return speedData;
            },

            type: "POST",
          })
          .withOption("serverSide", false)
          .withOption("processing", false)
          .withOption("paging", true)
          .withOption("rowId", "archiveId")
          .withOption("order", [1, "desc"])
          .withOption("fnDrawCallback", function (result) {
            $(".selectpicker").selectpicker("refresh");
            $("#showDiskTab_filter").find("input").addClass("filter_input");
            $(".showDiskClearItem").remove();
            $(
              '<i class="fa fa-times-circle item-error-style showDiskClearItem" onclick="clearFilter(\'' +
                "showDiskTab_filter" +
                "')\"></i>"
            ).insertAfter($("#showDiskTab_filter").find("input"));
            if ($("#showDiskTab_filter").find("input").val() == "") {
              $(".showDiskClearItem").hide();
            } else {
              $(".showDiskClearItem").show();
            }
            $("#showDiskTab_filter").find("input").unbind("keyup", showItem);
            $("#showDiskTab_filter")
              .find("input")
              .bind("keyup", { cName: "showDiskClearItem" }, showItem);
            $("#showDiskTab_filter").addClass("table_top_sm");
            $(".showDiskClearItem").click(function (e) {
              e.stopPropagation();
              e.preventDefault();
              $("#showDiskTab").DataTable().search("").draw();
            });
            if ($("#showDiskTab .dataTables_empty").size()) {
              $("#showDiskTab_paginate").hide();
            } else {
              $("#showDiskTab_paginate").show().css("font-size", "8px");
            }
          })
          .withOption("createdRow", function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          })
          .withOption("headerCallback", function (header) {
            $compile(angular.element(header).contents())($scope);
          })
          .withLanguage({
            search: "",
            searchPlaceholder: "过滤",
            aria: {
              sortAscending: ": activate to sort column ascending",
              sortDescending: ": activate to sort column descending",
            },
            emptyTable: "表中数据为空",
            info: "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
            infoEmpty: "显示第 0 至 0 项结果，共 0 项",
            zeroRecords: "表中数据为空",
            lengthMenu:
              "显示" +
              '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
              '<option value="5" >5条</option>' +
              '<option value="10" >10条</option>' +
              '<option value="20" >20条</option>' +
              '<option value="50" >50条</option>' +
              '<option value="100" >100条</option>' +
              "</select>&nbsp;" +
              "  ",
            paginate: {
              previous: '<i class="fa fa-angle-left"></i>',
              next: '<i class="fa fa-angle-right"></i>',
              last: '<i class="fa  fa-angle-double-right"></i>',
              first: '<i class="fa  fa-angle-double-left"></i>',
            },
          })
          .withPaginationType("full_numbers");

        vm.dtColumnD = [
          DTColumnBuilder.newColumn("instanceId")
            .withTitle("实例ID")
            .notVisible(),
          DTColumnBuilder.newColumn("archiveId")
            .withTitle("磁盘ID")
            .notVisible(),
          DTColumnBuilder.newColumn("host").withTitle("主机IP地址"),
          DTColumnBuilder.newColumn("deviceName").withTitle("磁盘名"),
          DTColumnBuilder.newColumn("status")
            .withTitle("状态")
            .renderWith(function (data, type, row) {
              return "<span class='status_green'>" + "正常" + "</span>";
            })
            .notSortable(),
          DTColumnBuilder.newColumn("groupId").withTitle("所在组编号"),
          DTColumnBuilder.newColumn("archiveId")
            .withTitle("磁盘ID")
            .notVisible(),
          DTColumnBuilder.newColumn("logical").withTitle("逻辑空间(GB)"),
          DTColumnBuilder.newColumn("migrationSpeed")
            .withTitle("重构进度")
            .renderWith(function (data, type, row) {
              var string = "";
              var speed = "";

              if (data >= 1024) {
                speed = speed + (data / 1024).toFixed(1) + "M/s";
              } else {
                speed = speed + data + "K/s";
              }

              var str =
                parseInt(row.migrationRatio * 100) / 100 +
                "%" +
                "(" +
                speed +
                ")";
              string =
                string +
                '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar"  style="width: 100%" ><span>' +
                str +
                "</span></div></div>&nbsp;&nbsp;&nbsp;&nbsp;";

              return string;
            })
            .notSortable(),
        ];

        speedInterval = $interval(speedDiskRefresh, 3000);
      };

      $scope.toHide = function () {
        $("#disk_modal").modal("hide");
        $scope.toShow = false;
      };

      function usedTable() {
        var useTableLength;
        vm.dtInstanceU = {};
        vm.dtOptionU = DTOptionsBuilder.newOptions()
          .withDOM(
            "<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
              "t" +
              "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>"
          )
          .withBootstrap()
          .withOption("ajax", {
            url: "listStoragePool",
            data: {
              domainId: domainId,
              randomData: Math.random(),
            },
            dataSrc: function (data) {
              if (data.resultMessage.message == "success") {
                var usedData = [];
                if (data.simpleStoragePoolsList.length > 0) {
                  angular.forEach(
                    data.simpleStoragePoolsList,
                    function (data, index, array) {
                      if (data.poolId == poolId) {
                        for (var key in data.archivesInDatanode) {
                          $.each(
                            data.archivesInDatanode[key],
                            function (i, tmp) {
                              var logicalSpace = fixTwoDecimal(
                                tmp.logicalSpace / (1024 * 1024 * 1024)
                              );
                              if (
                                tmp.deviceName == "" ||
                                tmp.deviceName == null
                              ) {
                                usedData.push({
                                  instanceId: key.getQuery("instanceId"),
                                  host: key.getQuery("host"),
                                  groupId: key.getQuery("groupId"),
                                  archiveId: tmp.archiveId,
                                  deviceName: "未知",
                                  logical: "未知",
                                  status: "未知",
                                  storageType: "未知",
                                  rate: "未知",
                                });
                              } else {
                                usedData.push({
                                  instanceId: key.getQuery("instanceId"),
                                  host: key.getQuery("host"),
                                  groupId: key.getQuery("groupId"),
                                  archiveId: tmp.archiveId,
                                  deviceName: tmp.deviceName,
                                  logical: logicalSpace,
                                  status: tmp.status,
                                  storageType: tmp.storageType,
                                  rate: tmp.rate,
                                });
                              }
                            }
                          );
                        }
                      }
                    }
                  );
                }
                useTableLength = usedData.length;
                return usedData;
              } else {
                if (data.resultMessage.message == "ERROR_0019_SessionOut") {
                  showMessage.show(
                    $scope,
                    "warn",
                    translate.getWord("session.out")
                  );
                  $scope.logout();
                  return;
                }
              }
            },

            type: "POST",
          })
          .withOption("serverSide", false)
          .withOption("processing", false)
          .withOption("paging", true)
          .withOption("searching", true)
          .withOption("rowId", "archiveId")
          .withOption("fnDrawCallback", function (result) {
            $(".selectpicker").selectpicker("render");
            if (!$("#poolUsedTab .dataTables_empty").size()) {
              $(".useDiskTable")
                .next()
                .find(".dataTables_paginate")
                .show()
                .css("font-size", "8px");
            } else {
              $(".useDiskTable").next().find(".dataTables_paginate").hide();
            }

            $("#poolUsedTab_filter").find("input").addClass("filter_input");
            $(".poolUsedClearItem").remove();
            $("#poolUsedTab_filter").addClass("table_top_sm");

            $(
              '<i class="fa fa-times-circle item-error-style poolUsedClearItem" onclick="clearFilter(\'' +
                "poolUsedTab_filter" +
                "')\"></i>"
            ).insertAfter($("#poolUsedTab_filter").find("input"));
            if ($("#poolUsedTab_filter").find("input").val() == "") {
              $(".poolUsedClearItem").hide();
            } else {
              $(".poolUsedClearItem").show();
            }
            $("#poolUsedTab_filter").find("input").unbind("keyup", showItem);
            $("#poolUsedTab_filter")
              .find("input")
              .bind("keyup", { cName: "poolUsedClearItem" }, showItem);
            $(".poolUsedClearItem").click(function (e) {
              e.stopPropagation();
              e.preventDefault();
              $("#poolUsedTab").DataTable().search("").draw();
            });
          })
          .withOption("createdRow", function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          })
          .withOption("headerCallback", function (header) {
            $compile(angular.element(header).contents())($scope);
          })
          .withLanguage({
            search: "",
            searchPlaceholder: "过滤",
            aria: {
              sortAscending: ": activate to sort column ascending",
              sortDescending: ": activate to sort column descending",
            },
            emptyTable: "表中数据为空",
            info: "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
            infoEmpty: "显示第 0 至 0 项结果，共 0 项",
            zeroRecords: "表中数据为空",
            infoFiltered: "(由 _MAX_ 项结果过滤)",
            lengthMenu:
              "显示" +
              '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
              '<option value="5" >5条</option>' +
              '<option value="10" >10条</option>' +
              '<option value="20" >20条</option>' +
              '<option value="50" >50条</option>' +
              '<option value="100" >100条</option>' +
              "</select>&nbsp;" +
              "  ",
            paginate: {
              previous: '<i class="fa fa-angle-left"></i>',
              next: '<i class="fa fa-angle-right"></i>',
              last: '<i class="fa  fa-angle-double-right"></i>',
              first: '<i class="fa  fa-angle-double-left"></i>',
            },
          })
          .withPaginationType("full_numbers");

        vm.dtColumnU = [
          DTColumnBuilder.newColumn("instanceId")
            .withTitle("实例ID")
            .notVisible(),
          DTColumnBuilder.newColumn("host").withTitle("主机IP地址"),
          DTColumnBuilder.newColumn("deviceName").withTitle("磁盘名"),
          DTColumnBuilder.newColumn("status")
            .withTitle("状态")
            .renderWith(function (data, type, row) {
              var str = "";
              if (data == "GOOD") {
                str = str + '<td><span class="status_green" >良好</span></td>';
              } else if (data == "SEPARATED") {
                str = str + '<td><span class="status_red" >被隔离</span></td>';
              } else if (data == "BROKEN") {
                str = str + '<td><span class="status_red" >损坏</span></td>';
              } else if (data == "OFFLINED") {
                str = str + '<td><span class="status_orange" >脱机</span></td>';
              } else if (data == "CONFIG_MISMATCH") {
                str =
                  str +
                  '<td><span class="status_orange" >配置不匹配</span></td>';
              } else if (data == "DEGRADED") {
                str =
                  str + '<td><span class="status_red" >轻微损坏</span></td>';
              } else if (data == "EJECTED") {
                str = str + '<td><span class="status_red" >拔出</span></td>';
              } else if (data == "INPROPERLY_EJECTED") {
                str =
                  str + '<td><span class="status_red" >拔出不当</span></td>';
              } else if (data == "OFFLINING") {
                str =
                  str +
                  "<td>" +
                  '<div class="progress progress-striped active" >' +
                  '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" >' +
                  '<span  style="color: #fff;">卸载中</span></div></div></td>';
              } else {
                str = str + '<td><span class="status_orange" >未知</span></td>';
              }

              return str;
            }),
          DTColumnBuilder.newColumn("groupId").withTitle("所在组编号"),
          DTColumnBuilder.newColumn("archiveId")
            .withTitle("磁盘ID")
            .notVisible(),
          DTColumnBuilder.newColumn("storageType").withTitle("存储类型"),
          DTColumnBuilder.newColumn("rate").withTitle("转速"),
          DTColumnBuilder.newColumn("logical").withTitle("逻辑空间(GB)"),

          DTColumnBuilder.newColumn("null")
            .withTitle("管理")
            .renderWith(function (data, type, row) {
              return (
                "<a  data-toggle='modal' data-target='#remove_modal'  ng-show='apis.StoragePool.removeArchiveFromStoragePool' ng-click='getArchiveId(\"" +
                row.archiveId +
                '","' +
                row.instanceId +
                "\")'>减容</a>"
              );
            })
            .notSortable(),
        ];
      }
      $scope.prompt = function () {
        $scope.getId(
          poolId,
          poolname,
          currentStrategy,
          poolDes,
          uminspeed,
          utactic,
          umaxspeed
        );
      };
      $scope.getId = function (
        poolid,
        name,
        strategy,
        description,
        minspeed,
        tactic,
        maxspeed
      ) {
        $("#prompt_modal").modal("hide");
        $scope.toShow = true;
        $timeout(function () {
          $(".modal").draggable();
        }, 100);
        poolId = poolid;
        poolname = name;
        currentStrategy = strategy;
        poolDes = description;
        uminspeed = minspeed;
        utactic = tactic;
        umaxspeed = maxspeed;
        $scope.showPoolName = name;

        usedTable();
        vm.selectedN = {};
        vm.addIdArr = {};
        vm.selectNameN = new Array();
        vm.selectedIdN = new Array();
        vm.selectAllN = false;

        vm.addDisk = true;

        vm.dtInstanceN = {};
        vm.dtOptionN = DTOptionsBuilder.newOptions()
          .withDOM(
            "<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
              "t" +
              "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>"
          )
          .withBootstrap()
          .withOption("ajax", {
            url: "listUnusedArchives",
            data: {
              domainId: domainId,
              storagePoolId: poolid,
              randomData: Math.random(),
            },
            dataSrc: function (data) {
              var unData = [];
              vm.addIdArr = {};
              for (var key in data.unusedDiskMap) {
                $.each(data.unusedDiskMap[key], function (i, value) {
                  var logicalSpace = fixTwoDecimal(
                    value.logicalSpace / (1024 * 1024 * 1024)
                  );
                  if (value.status == "GOOD" || value.status == "SEPARATED") {
                    unData.push({
                      instanceId: key.getQuery("instanceId"),
                      host: key.getQuery("host"),
                      groupId: key.getQuery("groupId"),
                      archiveId: value.archiveId,
                      deviceName: value.deviceName,
                      logical: logicalSpace,
                      status: value.status,
                      storageType: value.storageType,
                      rate: value.rate,
                    });
                  }
                  vm.addIdArr[value.archiveId] = key.getQuery("instanceId");
                });
              }
              vm.selectedN = {};
              vm.selectAllN = false;
              return unData;
            },

            type: "POST",
          })

          .withOption("serverSide", false)
          .withOption("processing", false)
          .withOption("paging", true)
          .withOption("searching", true)
          .withOption("rowId", "archiveId")
          .withOption("createdRow", function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          })
          .withOption("headerCallback", function (header) {
            $compile(angular.element(header).contents())($scope);
          })

          .withOption("fnDrawCallback", function (result) {
            $(".selectpicker").selectpicker("render");
            vm.selectAllN = false;
            vm.addDisk = true;
            $("#poolUnuseTab_filter").find("input").addClass("filter_input");
            $(".poolUnuseClearItem").remove();
            $("#poolUnuseTab_filter").addClass("table_top_sm");

            $(
              '<i class="fa fa-times-circle item-error-style poolUnuseClearItem" onclick="clearFilter(\'' +
                "poolUnuseTab_filter" +
                "')\"></i>"
            ).insertAfter($("#poolUnuseTab_filter").find("input"));
            if ($("#poolUnuseTab_filter").find("input").val() == "") {
              $(".poolUnuseClearItem").hide();
            } else {
              $(".poolUnuseClearItem").show();
            }
            $("#poolUnuseTab_filter").find("input").unbind("keyup", showItem);
            $("#poolUnuseTab_filter")
              .find("input")
              .bind("keyup", { cName: "poolUnuseClearItem" }, showItem);
            $(".poolUnuseClearItem").click(function (e) {
              e.stopPropagation();
              e.preventDefault();
              $("#poolUnuseTab").DataTable().search("").draw();
            });
            if ($("#poolUnuseTab .dataTables_empty").size()) {
              $("#poolUnuseTab_wrapper").find(".dataTables_paginate").hide();
            } else {
              $("#poolUnuseTab_wrapper")
                .find(".dataTables_paginate")
                .show()
                .css("font-size", "8px");
            }
            for (var id in vm.selectedN) {
              if (vm.selectedN[id]) {
                vm.selectedN[id] = false;
              }
            }
          })

          .withLanguage({
            search: "",
            searchPlaceholder: "过滤",
            aria: {
              sortAscending: ": activate to sort column ascending",
              sortDescending: ": activate to sort column descending",
            },
            emptyTable: "表中数据为空",
            info: "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
            infoEmpty: "显示第 0 至 0 项结果，共 0 项",
            zeroRecords: "表中数据为空",
            infoFiltered: "(由 _MAX_ 项结果过滤)",
            lengthMenu:
              "显示" +
              '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
              '<option value="5" >5条</option>' +
              '<option value="10" >10条</option>' +
              '<option value="20" >20条</option>' +
              '<option value="50" >50条</option>' +
              '<option value="100" >100条</option>' +
              "</select>&nbsp;" +
              "  ",
            paginate: {
              previous: '<i class="fa fa-angle-left"></i>',
              next: '<i class="fa fa-angle-right"></i>',
              last: '<i class="fa  fa-angle-double-right"></i>',
              first: '<i class="fa  fa-angle-double-left"></i>',
            },
          })
          .withPaginationType("full_numbers");

        vm.dtColumnN = [
          DTColumnBuilder.newColumn("archiveId")
            .withTitle("磁盘ID")
            .notVisible(),
          DTColumnBuilder.newColumn("null")
            .withTitle(
              '<span class="check_span"><input class="input_check" ng-model="showPool.selectAllN" ng-click="showPool.toggleAllN(showPool.selectAllN, showPool.selectedN)"  type="checkbox" id="selectallFlag1"><label for="selectallFlag1"></label></span>'
            )
            .renderWith(function (data, type, row) {
              if (row.status == "SEPARATED") {
                return "";
              } else {
                vm.selectedN[row.archiveId] = false;
                return (
                  '<span class="check_span"><input datanodeid="' +
                  row.instanceId +
                  '" class="input_check" ng-model="showPool.selectedN[\'' +
                  row.archiveId +
                  '\'];" ng-click="showPool.toggleOneN(showPool.selectedN)" type="checkbox" id="checkbox_' +
                  row.archiveId +
                  '"><label for="checkbox_' +
                  row.archiveId +
                  '"></label></span>'
                );
              }
            })
            .withClass("checkbox_col")
            .notSortable(),
          DTColumnBuilder.newColumn("instanceId")
            .withTitle("实例ID")
            .notVisible(),
          DTColumnBuilder.newColumn("host").withTitle("主机IP地址"),
          DTColumnBuilder.newColumn("deviceName").withTitle("磁盘名"),
          DTColumnBuilder.newColumn("status")
            .withTitle("状态")
            .renderWith(function (data, type, row) {
              var resultString = "";
              switch (data) {
                case "GOOD":
                  resultString = "<span class='status_green'>良好</span>";
                  break;
                case "SEPARATED":
                  resultString = "<span class='status_red'>被隔离</span>";
                  break;
              }
              return resultString;
            })
            .notSortable(),
          DTColumnBuilder.newColumn("groupId").withTitle("所在组编号"),
          DTColumnBuilder.newColumn("archiveId")
            .withTitle("磁盘ID")
            .notVisible(),
          DTColumnBuilder.newColumn("storageType").withTitle("存储类型"),
          DTColumnBuilder.newColumn("rate").withTitle("转速"),
          DTColumnBuilder.newColumn("logical").withTitle("逻辑空间(GB)"),
        ];
      };

      function toggleAllN(selectAll, selectedItems) {
        for (var id in selectedItems) {
          if (selectedItems.hasOwnProperty(id)) {
            var currentDatanodeId = $(".newDiskTable")
              .find("#" + id)
              .find(".input_check")
              .attr("datanodeid");
            if (currentDatanodeId) {
              selectedItems[id] = selectAll;
            }
            if (selectAll == false) {
              vm.addDisk = true;
            } else {
              vm.addDisk = false;
            }
          }
        }
      }
      function toggleOneN(selectedItems) {
        var s = 0;
        var t = 0;
        for (var id in selectedItems) {
          if (selectedItems.hasOwnProperty(id)) {
            var currentDatanodeId = $(".newDiskTable")
              .find("#" + id)
              .find(".input_check")
              .attr("datanodeid");
            if (currentDatanodeId) {
              t++;
            }
            if (!selectedItems[id]) {
              vm.selectAllN = false;
            } else {
              s++;
            }
          }
        }

        if (s > 0) {
          vm.addDisk = false;
          if (s == t) {
            vm.selectAllN = true;
          } else {
            vm.selectAllN = false;
          }
        } else {
          vm.addDisk = true;
        }
      }

      $scope.modelRefresh = function () {
        vm.dtInstance.reloadData(null, false);
        vm.dtInstanceN.reloadData(null, true);
        vm.dtInstanceU.reloadData(null, true);
      };
      $scope.addDisk = function () {
        vm.selectedIdN = [];
        angular.forEach(vm.selectedN, function (data, index, array) {
          if (data == true) {
            var currentDatanodeId = $(".newDiskTable")
              .find("#" + index)
              .find(".input_check")
              .attr("datanodeid");
            if (currentDatanodeId) {
              vm.selectedIdN.push({
                datanodeId: currentDatanodeId,
                archiveId: index,
              });
            }
          }
        });

        $http({
          method: "post",
          async: false,
          url: "updateStoragePool",
          data: {
            domainId: domainId,
            poolId: poolId,
            poolName: poolname,
            strategy: currentStrategy,
            description: poolDes,
            diskMapString: JSON.stringify(vm.selectedIdN),
            migrationStrategy: utactic,
            minMigrationSpeed: uminspeed,
            maxMigrationSpeed: umaxspeed,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(
                encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
              );
            }
            return str.join("&");
          },
        }).then(
          function successCallback(response) {
            if (response.data.resultMessage.message == "success") {
              showMessage.show(
                $scope,
                "success",
                translate.getWord("response.success")
              );
              newData = [];
              $timeout(function () {
                $scope.modelRefresh();
              }, 1000);

              vm.addDisk = true;
            } else {
              if (
                response.data.resultMessage.message == "ERROR_0019_SessionOut"
              ) {
                showMessage.show(
                  $scope,
                  "warn",
                  translate.getWord("session.out")
                );
                $scope.logout();
                return;
              } else {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord(response.data.resultMessage.message)
                );
              }
            }
          },
          function errorCallback(response) {}
        );
      };

      $scope.getArchiveId = function (id, instanceid) {
        (removeId = id), (currentInstanceId = instanceid);
      };

      $scope.remove = function () {
        $http({
          method: "post",
          async: false,
          url: "removeArchivefromStoragePool",
          data: {
            domainId: domainId,
            poolId: poolId,
            datanodeId: currentInstanceId,
            archiveId: removeId,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(
                encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
              );
            }
            return str.join("&");
          },
        }).then(
          function successCallback(response) {
            if (response.data.resultMessage.message == "success") {
              showMessage.show(
                $scope,
                "success",
                translate.getWord("response.success")
              );
              newData = [];

              $timeout(function () {
                $scope.modelRefresh();
              }, 1000);
            } else {
              if (
                response.data.resultMessage.message == "ERROR_0019_SessionOut"
              ) {
                showMessage.show(
                  $scope,
                  "warn",
                  translate.getWord("session.out")
                );
                $scope.logout();
                return;
              } else {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord(response.data.resultMessage.message)
                );
              }
            }
          },
          function errorCallback(response) {
            showMessage.show(
              $scope,
              "error",
              translate.getWord("response.error")
            );
            vm.dtInstance.reloadData(null, false);
          }
        );
      };

      function callback(json) {
        newData = [];
        angular.forEach(json.data, function (datas, index, array) {
          if (json.data[index].poolId == poolId) {
            for (var key in datas.archivesInDatanode) {
              $.each(datas.archivesInDatanode[key], function (i, tmp) {
                var logicalSpace = fixTwoDecimal(
                  tmp.logicalSpace / (1024 * 1024)
                );
                var logicalSpaceMeasurment = "";
                if (logicalSpace >= 1024) {
                  logicalSpace = fixTwoDecimal(logicalSpace / 1024);
                  logicalSpaceMeasurment = "(GB)";
                } else {
                  logicalSpaceMeasurment = "(MB)";
                }

                if (tmp.status == "GOOD" || tmp.status == "SEPARATED") {
                  newData.push({
                    instanceId: key.getQuery("instanceId"),
                    host: key.getQuery("host"),
                    groupId: key.getQuery("groupId"),
                    archiveId: tmp.archiveId,
                    deviceName: tmp.deviceName,
                    logical: logicalSpace + logicalSpaceMeasurment,
                    status: "<span class='status_green'>正常</span>",
                  });
                }
              });
            }
            usedTable();
          }
        });
      }
      $scope.doFocus = function (id) {
        focus(id);
      };
    }
  );

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

angular.module('app.storage').controller('poolDetailCtrl', function ($compile,focus,$state,DTOptionsBuilder, DTColumnBuilder,$stateParams,$http,$scope,showMessage,$interval,translate,$timeout,$rootScope) {
	var vm=this;
	$scope.domainId=$stateParams.domainId;
	$rootScope.domainId=$stateParams.domainId;
	$scope.domainName=$stateParams.sel_domainName;
	$scope.poolId=$stateParams.poolId;
	$scope.iopsReadPoolData=[];
	$scope.iopsReadPoolDataTime=[];
	$scope.iopsWritePoolData=[];
	$scope.throughputReadPoolData=[];
	$scope.throughputReadPoolDataTime=[];
	$scope.throughputWritePoolData=[];
	$scope.latencyWritePoolData=[];
	$scope.latencyReadPoolDataTime=[];
	$scope.latencyReadPoolData=[];
	$scope.ioBlockSizePoolData=[];
	$scope.ioBlockSizePoolDatTime=[];
	var chartTimer=$interval(function(){
		getPool();
		listchartData();
		copyChart();
	},3000)
	
 	$timeout(function(){
		var right=$(".detail_right").outerHeight();
		var left=$(".detail_content").outerHeight();
		$(".detail_content").css("min-height",left+"px")
		$(".detail_right").css("min-height",left+"px")
	},200);
	vm.startBtn=false;
	vm.stopBtn=true;
	$scope.poolStart=false;
	var  chartTempArr=[]
	var timer;
	$scope.logicalPSAFreeSpace;
	$scope.logicalPSSFreeSpace;
	var useTableLength;
	var poolIds=[];
	poolIds.push($scope.poolId)
	vm.poolInfo={};
	vm.dtInstanceU = {};
	vm.dtOptionU= DTOptionsBuilder
	.newOptions()
	.withDOM("<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
			"t" +
			"<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>")
	.withBootstrap()
	.withOption('ajax', {
		url: BASE_API + 'listStoragePool',
		data:{
			poolIds:JSON.stringify(poolIds),
			domainId:$scope.domainId
		},
		dataSrc:function(data){
			if(data.resultMessage.message =="success"){
				var usedData=[];

				angular.forEach(data.simpleStoragePoolsList,function(data,index,array){
					vm.poolInfo["0"]=data
					for(var key in data.archivesInDatanode){
						$.each(data.archivesInDatanode[key], function(i,tmp){
							var logicalSpace=fixTwoDecimal(tmp.logicalSpace/(1024*1024*1024));
							if(tmp.deviceName==""||tmp.deviceName==null){
								usedData.push({"instanceId":key.getQuery("instanceId"),"host":key.getQuery("host"),"groupId":key.getQuery("groupId"),"archiveId":tmp.archiveId,"deviceName":"未知","logical":"未知","status":"未知","storageType":"未知","rate":"未知"});
							}else{
								usedData.push({"instanceId":key.getQuery("instanceId"),"host":key.getQuery("host"),"groupId":key.getQuery("groupId"),"archiveId":tmp.archiveId,"deviceName":tmp.deviceName,"logical":logicalSpace,"status":tmp.status,"storageType":tmp.storageType,"rate":tmp.rate});

							}
						   });
						}
				})

				useTableLength=usedData.length;
				return usedData;

			}else{

				if (data.resultMessage.message == "ERROR_0019_SessionOut") {
					showMessage.show($scope,"warn",translate.getWord("session.out"));
					$scope.logout();
					return;
				}

			}

		},

		 type: 'POST',

	 })
	.withOption('serverSide',false)
	.withOption('processing',false)
	.withOption('paging', true)
	.withOption('searching',true)
	.withOption('rowId', 'archiveId')
	.withOption('fnDrawCallback',function(result){
		$(".selectpicker").selectpicker("render");

		$("#poolDetailTab_filter").find("input").addClass("filter_input");
		$(".poolDetailClearItem").remove();
		$("#poolDetailTab_filter").addClass("table_top_sm");


		$('<i class="fa fa-times-circle item-error-style poolDetailClearItem" onclick="clearFilter(\''+'poolDetailTab_filter'+'\')"></i>').insertAfter($("#poolDetailTab_filter").find("input"));
		if($("#poolDetailTab_filter").find("input").val()==""){
			$(".poolDetailClearItem").hide();
		}else{
			$(".poolDetailClearItem").show();
		}
		$("#poolDetailTab_filter").find("input").unbind('keyup',showItem);
		$("#poolDetailTab_filter").find("input").bind('keyup',{cName:'poolDetailClearItem'},showItem);
		$(".poolDetailClearItem").click(function(e){
			e.stopPropagation();
			e.preventDefault();
			$('#poolDetailTab').DataTable().search("").draw();
		})
		
		if(useTableLength>0){
			$(".useDiskTable").next().find(".dataTables_paginate").show()
		}else{
			$(".useDiskTable").next().find(".dataTables_paginate").hide()
		}
		$(".dt-toolbar-footer").css("background","none")
		$(".dt-toolbar").css("background","none")
		

	})
	.withOption('createdRow', function(row, data, dataIndex) {
		$compile(angular.element(row).contents())($scope);
	})
	.withOption('headerCallback', function(header) {

		$compile(angular.element(header).contents())($scope);
	})
	.withLanguage({
		"search": "",
		"searchPlaceholder":"过滤",
		"aria": {
			"sortAscending": ": activate to sort column ascending",
			"sortDescending": ": activate to sort column descending"
		},
		"emptyTable": "表中数据为空",
		"info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
		"infoEmpty": "显示第 0 至 0 项结果，共 0 项",
		"zeroRecords": "表中数据为空",
		"infoFiltered": "(由 _MAX_ 项结果过滤)",
		"lengthMenu": '显示'+'&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >'+
				'<option value="5" >5条</option>'+
				'<option value="10" >10条</option>'+
				'<option value="20" >20条</option>'+
				'<option value="50" >50条</option>'+
				'<option value="100" >100条</option>'+
		'</select>&nbsp;'+'  ',
		"paginate": {
			"previous":'<i class="fa fa-angle-left"></i>',
			"next": '<i class="fa fa-angle-right"></i>',
			"last":'<i class="fa  fa-angle-double-right"></i>',
			"first": '<i class="fa  fa-angle-double-left"></i>'
		}
	})
	.withPaginationType('full_numbers');

	vm.dtColumnU = [
		DTColumnBuilder.newColumn('instanceId').withTitle("实例ID"),
		DTColumnBuilder.newColumn('host').withTitle("主机IP地址"),
		DTColumnBuilder.newColumn('groupId').withTitle("所在组编号"),
		DTColumnBuilder.newColumn('archiveId').withTitle("磁盘ID").notVisible(),
		DTColumnBuilder.newColumn('deviceName').withTitle("磁盘名"),
		DTColumnBuilder.newColumn('storageType').withTitle("存储类型"),
		DTColumnBuilder.newColumn('rate').withTitle("转速"),
		DTColumnBuilder.newColumn('logical').withTitle("逻辑空间(GB)"),
		DTColumnBuilder.newColumn('status').withTitle("状态")
			.renderWith(function(data,type,row){
				var str="";
				if(data=="GOOD"){
					str = str+'<td><span class="status_green" >良好</span></td>'

				}else if(data=="SEPARATED"){
					str = str+'<td><span class="status_red" >被隔离</span></td>'

				}else if(data=="BROKEN"){
					str = str+'<td><span class="status_red" >损坏</span></td>'

				}else if(data=="OFFLINED"){
					str = str+'<td><span class="status_orange" >脱机</span></td>'

				}else if(data=="CONFIG_MISMATCH"){
					str = str+'<td><span class="status_orange" >配置不匹配</span></td>'

				}else if(data=="DEGRADED"){
					str = str+'<td><span class="status_red" >轻微损坏</span></td>'
				}else if(data=="EJECTED"){
					 str = str+'<td><span class="status_red" >拔出</span></td>'
				}else if(data=="INPROPERLY_EJECTED"){
					 str = str+'<td><span class="status_red" >拔出不当</span></td>'
				}else if(data=="OFFLINING"){
							 str = str+'<td>'
							 +'<div class="progress progress-striped active" >'
							 +'<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" >'
							 +'<span  style="color: #fff;">卸载中</span></div></div></td>'
				}else{
					str = str+'<td><span class="status_orange" >未知</span></td>'
				}

				return str;
			}),
	];
	function getPool(){
		angular.forEach(vm.poolInfo,function(data,index,array){
			$scope.poolName=data.poolName;
			$scope.logicalPSAFreeSpace=data.logicalPsaFreeSpace;
			$scope.logicalPSSFreeSpace=data.logicalPssFreeSpace;
			$("#description").html(data.description||"<span class='none_info'>无</span>");
			$scope.poolType=translate.getWord(data.strategy);
			$scope.domainName=data.domainName;
			var statusStr="";
			if(data.status=="Available"){
				statusStr=statusStr+"<span class='label label-success status-static'>可用</span>";
			}else{
				statusStr=statusStr+ '<div class="progress progress-striped active" >'
					   +'<div class="progress-bar progress-bar-primary" role="progressbar"  style="width: 100%" ><span>删除中</span></div></div>';
			}
			$("#status").html(statusStr);
			var qosStr="<span class='none_info'>无</span>";
			if(data.migrationStrategy!=null){
				qosStr="<a ng-click='goQos(\""+data.migrationStrategy+"\")'>"+data.migrationStrategy+"<a>";
				$("#qos").html($compile(qosStr)($scope))
			}else{
				$("#qos").html(qosStr)
			}
			var str="";
			switch(data.storagePoolLevel){
				case "HIGH":
					$("#level").find(".level_style").eq(2).removeClass("level_default").siblings().addClass("level_default")
					break;
				case "MIDDLE":
					$("#level").find(".level_style").eq(1).removeClass("level_default").siblings().addClass("level_default")
					break;
				case "LOW":
					$("#level").find(".level_style").eq(0).removeClass("level_default").siblings().addClass("level_default")
					break;
			}
			
			
			var migrationSpeedStr="";
			var speed="";
			if(data.migrationSpeed>=1024){
				speed=speed+(data.migrationSpeed/1024).toFixed(1)+"M/s"
			}else{
				speed=speed+data.migrationSpeed+"K/s"
			}
			if(data.migrationRatio=="100.0"){
				migrationSpeedStr=migrationSpeedStr+"无重构"
			}else{

				var str=parseInt((data.migrationRatio)*100)/100 +"%"+"("+speed+")";
				migrationSpeedStr=migrationSpeedStr+ '<div class="progress progress-striped active" >'
					+'<div class="progress-bar progress-bar-primary" role="progressbar"  style="width: 100%" ><span>'
					+str+'</span></div></div>';

			}
			$("#migrationSpeed").html(migrationSpeedStr);
			if(data.status!="Available"||data.migrationRatio!="100.0"){
				$timeout.cancel(timer)
				timer=$timeout(getTimer,3000);
			}
		})

	}

	String.prototype.getQuery = function(name){
		var reg = new RegExp("(\\{|(,\\s*))"+name+"=\\S*(,|\\})");
		var r = this.substr(this.indexOf("\{")).match(reg);
		var m=r[0].substring(r[0].indexOf("=")+2);
		m=m.substr(0,m.length-2);
		if (m!=null) return m; return null;
	}
	$scope.refresh=function(){
		vm.dtInstanceU.reloadData(null,false);
	}
	function getTimer(){
		vm.dtInstanceU.reloadData(null,false);
	}
	$scope.goQos=function(name){
		$state.go('app.storage.qos', {QosName:name,flag:"2"});
	}
	function convertTime(srcTime){
		var currentDate=new Date(srcTime);
		var hour=currentDate.getHours();
		var minute=currentDate.getMinutes();
		var second=currentDate.getSeconds();
		if (hour<10){
			hour="0"+hour;
		}
		if (minute<10){
			minute="0"+minute;
		}
		if (second<10){
			second="0"+second;
		}
		return hour+":"+minute+":"+second;
	}
	$scope.iopsOption={
		tooltip: {
			trigger: 'axis',
			position: function (pt) {
				return [pt[0], '10%'];
			}
		},
		legend: {
			data:["存储池IOPS读","存储池IOPS写"],
			left: 'right'
		},

		xAxis:  {
			type: 'category',
			boundaryGap: false,
			data: []
		},
		yAxis: {
			type: 'value'
		},
		grid: {
			left:'87px',
			right:"50px"
		},
		series: [{
			name:"存储池IOPS读",
			type:'line',
			smooth:true,
			symbolSize:5,
			sampling: 'average',
			itemStyle: {
				 normal: {
					color: '#3095FF'
				}
			},
			data: [],
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgba(48,149,255,0.05)'
					}, {
						offset: 1,
						color: 'rgba(48,149,255,0.05)'
					}])
				}
			},
		},
		{
			name: "存储池IOPS写",
			type:'line',
			smooth:true,
			symbolSize:5,
			sampling: 'average',
			itemStyle: {
				 normal: {
					color: '#FFB100'
				}
			},
			data: [],
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgba(255,177,0,0.05)'
					}, {
						offset: 1,
						color: 'rgba(255,177,0,0.05)'
					}])
				}
			},
		}]
	}

	$scope.lantencyOption={
		tooltip: {
		   trigger: 'axis',
		   position: function (pt) {
				return [pt[0], '10%'];
			}
		},
		legend: {
			data:["存储池读延迟(ms)","存储池写延迟(ms)"],
			left: 'right'
		},

		xAxis:  {
			type: 'category',
			boundaryGap: false
		},
		yAxis: {
			type: 'value'
		},
		grid: {
			left:'87px',
			right:"50px"
		},
		series: [{
			name:"存储池读延迟(ms)",
			data: [],
			symbolSize:5,
			smooth:true,
			sampling: 'average',
			itemStyle: {
				 normal: {
					color: '#3095FF'
				}
			},
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgba(48,149,255,0.05)'
					}, {
						offset: 1,
						color: 'rgba(48,149,255,0.05)'
					}])
				}
			},
			type:'line'
		},
		{
			name: "存储池写延迟(ms)",
			data: [],
			symbolSize:5,
			smooth:true,
			sampling: 'average',
			itemStyle: {
				 normal: {
					color: '#FFB100'
				}
			},
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgba(255,177,0,0.05)'
					}, {
						offset: 1,
						color: 'rgba(255,177,0,0.05)'
					}])
				}
			},
			type:'line'
		}]
	}

	$scope.throughputOption={
		tooltip: {
			trigger: 'axis',
			position: function (pt) {
				return [pt[0], '10%'];
			}
		},
		legend: {
			data:["存储池吞吐量读(KB/s)","存储池吞吐量写(KB/s)"],
			left: 'right'
		},

		xAxis:  {
			type: 'category',
			boundaryGap: false,
			data:[]
		},
		yAxis: {
			type: 'value'
		},
		grid: {
			left:'87px',
			right:"50px"
		},
		series: [{
			name:"存储池吞吐量读(KB/s)",
			data:[],
			symbolSize:5,
			smooth:true,
			sampling: 'average',
			itemStyle: {
				 normal: {
					color: '#3095FF'
				}
			},
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgba(48,149,255,0.05)'
					}, {
						offset: 1,
						color: 'rgba(48,149,255,0.05)'
					}])
				}
			},
			type:'line'
		},
		{
			name: "存储池吞吐量写(KB/s)",
			data:[],
			symbolSize:5,
			smooth:true,
			sampling: 'average',
			itemStyle: {
				 normal: {
					color: '#FFB100'
				}
			},
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgba(255,177,0,0.05)'
					}, {
						offset: 1,
						color: 'rgba(255,177,0,0.05)'
					}])
				}
			},
			type:'line'
		}]
	}

	$scope.IOBlockSizeOption={
		tooltip: {
			trigger: 'axis',
			position: function (pt) {
				return [pt[0], '10%'];
			}
		},
		legend: {
			data:["卷IO块大小(KB)"],
			left: 'right'
		},
		xAxis: {
			type: 'category',
			boundaryGap: false
		},
		yAxis: {
			type: 'value',
		},
		grid: {
			left:'87px',
			right:"50px"
		},
		series: [{
			name:"卷IO块大小(KB)",
			data: [],
			symbolSize:5,
			smooth:true,
			sampling: 'average',
			itemStyle: {
				 normal: {
					color: '#3095FF'
				}
			},
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgba(48,149,255,0.05)'
					}, {
						offset: 1,
						color: 'rgba(48,149,255,0.05)'
					}])
				}
			},
			type:'line'
		}]
	}

	var clearWatch=$rootScope.$watch("socketStatus", function(newVal, oldVal){
		if($rootScope.Websocket.websocket && $rootScope.Websocket.websocket.readyState == WebSocket.OPEN){
			if(vm.startBtn==true)
			$scope.onmessagePerformance();
		}

	 }, true);
	$scope.$on('$destroy',function(){
		$timeout.cancel(timer)
	}) 
	$scope.checkDriver=function(){
		$http({
			 method: "POST",
			 async:false,
			 url: "IsPoolhasPerformanceData",
			 data: {
				poolId:$scope.poolId
			 },
			 headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			 transformRequest: function(obj) {
				 var str = [];
				 for (var s in obj) {
					 str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
				 }
				 return str.join("&");
			 }
		 }).then(function successCallback(response){
			
			if (response.data.resultMessage.message == "success") {
				if(response.data.hasPerformanceData){
					$scope.onmessagePerformance()
				}else{
					showMessage.show($scope,"warn","该存储池下没有挂载驱动的卷");
				}
			}else{
				if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
					showMessage.show($scope,"warn",translate.getWord("session.out"));
					$scope.logout();
					return;
				}else{
					showMessage.show($scope,"error",translate.getWord(response.data.resultMessage.message));
					
				}
				   
			}
		 })
	}
	$scope.onmessagePerformance=function(){
		var times=1;
		vm.startBtn=true;
		vm.stopBtn=false;
		$scope.poolStart=true;
		var multiple=500;
		var iops=echarts.getInstanceByDom(document.getElementById("iops"));
		var throughput=echarts.getInstanceByDom(document.getElementById("throughput"));
		var lantency=echarts.getInstanceByDom(document.getElementById("lantency"));
		var ioBlockSize=echarts.getInstanceByDom(document.getElementById("ioBlockSize"));
		var poolcopeChart= echarts.init(document.getElementById('copeTypeChart'));
		var poolCapacityChart= echarts.init(document.getElementById('capacityChart'));
		if($rootScope.Websocket.websocket){
			send($scope.poolId+"##start")
			$rootScope.Websocket.websocket.onmessage = function(event) {
				 $rootScope.Websocket.lastHeartBeat = new Date().getTime();
				var data=JSON.parse(event.data);
				
				if(data.alertMessage!=null){
					$rootScope.alertComeFlag++;
				}
				if(data.performanceMessage!=null){
					
					if(data.performanceMessage.counterKey=="STORAGEPOOL_READ_THROUGHPUT"&&data.performanceMessage.sourceId==$scope.poolId){
						$scope.throughputReadPoolDataTime.push(convertTime(data.performanceMessage.startTime))
						$scope.throughputReadPoolData.push((data.performanceMessage.counterValue*times).toFixed(1))
						if($scope.throughputReadPoolData.length>multiple){
							$scope.throughputReadPoolData.shift();
							$scope.throughputReadPoolDataTime.shift();
						}
						
						$scope.throughputOption={
							xAxis: {
								data: $scope.throughputReadPoolDataTime
							},
							series: [{
								name:"存储池吞吐量读(KB/s)",
								data: $scope.throughputReadPoolData,
							},
							{
								name: "存储池吞吐量写(KB/s)",
								data: $scope.throughputWritePoolData,
							}]
						}
					}
					if(data.performanceMessage.counterKey=="STORAGEPOOL_WRITE_THROUGHPUT"&&data.performanceMessage.sourceId==$scope.poolId){
						$scope.throughputWritePoolData.push((data.performanceMessage.counterValue*times).toFixed(1))
						if($scope.throughputWritePoolData.length>multiple){
							$scope.throughputWritePoolData.shift();
						}
						
						$scope.throughputOption={
							xAxis: {
								data: $scope.throughputReadPoolDataTime
							},
							series: [{
								name:"存储池吞吐量读(KB/s)",
								data: $scope.throughputReadPoolData,
							},
							{
								name: "存储池吞吐量写(KB/s)",
								data: $scope.throughputWritePoolData,
							}]
						}
					}


					if(data.performanceMessage.counterKey=="STORAGEPOOL_READ_IOPS"&&data.performanceMessage.sourceId==$scope.poolId){
						$scope.iopsReadPoolDataTime.push(convertTime(data.performanceMessage.startTime))
						$scope.iopsReadPoolData.push(data.performanceMessage.counterValue*times)
						if($scope.iopsReadPoolData.length>multiple){
							$scope.iopsReadPoolData.shift();
							$scope.iopsReadPoolDataTime.shift();
						}
						
						$scope.iopsOption={
							xAxis: {
								  data: $scope.iopsReadPoolDataTime
							},
						   series: [{
							   name:"存储池IOPS读",
							   data: $scope.iopsReadPoolData,
						   },
						   {
							   name: "存储池IOPS写",
							   data: $scope.iopsWritePoolData,
						   }]
					   }
					}
					if(data.performanceMessage.counterKey=="STORAGEPOOL_WRITE_IOPS"&&data.performanceMessage.sourceId==$scope.poolId){
						$scope.iopsWritePoolData.push(data.performanceMessage.counterValue*times)
						if($scope.iopsWritePoolData.length>multiple){
							$scope.iopsWritePoolData.shift();
						}
						
						$scope.iopsOption={
							xAxis: {
								  data: $scope.iopsReadPoolDataTime
							},
						   series: [{
							   name:"存储池IOPS读",
							   data: $scope.iopsReadPoolData,
						   },
						   {
							   name: "存储池IOPS写",
							   data: $scope.iopsWritePoolData,
						   }]
					   }
					}
					if(data.performanceMessage.counterKey=="STORAGEPOOL_READ_LATENCY"&&data.performanceMessage.sourceId==$scope.poolId){
						$scope.latencyReadPoolDataTime.push(convertTime(data.performanceMessage.startTime))
						$scope.latencyReadPoolData.push(data.performanceMessage.counterValue)
						if($scope.latencyReadPoolData.length>multiple){
							$scope.latencyReadPoolData.shift();
							$scope.latencyReadPoolDataTime.shift();
						}
						
						$scope.lantencyOption={
							xAxis: {
								  data: $scope.latencyReadPoolDataTime
							},
						   series: [{
							   name:"存储池读延迟(ms)",
							   data: $scope.latencyReadPoolData,
						   },
						   {
							   name: "存储池写延迟(ms)",
							   data: $scope.latencyWritePoolData,
						   }]
					   }

					}
					if(data.performanceMessage.counterKey=="STORAGEPOOL_WRITE_LATENCY"&&data.performanceMessage.sourceId==$scope.poolId){
						$scope.latencyWritePoolData.push(data.performanceMessage.counterValue)
						if($scope.latencyWritePoolData.length>multiple){
							$scope.latencyWritePoolData.shift();
						}
						
						$scope.lantencyOption={
							xAxis: {
								  data: $scope.latencyReadPoolDataTime
							},
						   series: [{
							   name:"存储池读延迟(ms)",
							   data: $scope.latencyReadPoolData,
						   },
						   {
							   name: "存储池写延迟(ms)",
							   data: $scope.latencyWritePoolData,
						   }]
					   }

					}

					if(data.performanceMessage.counterKey=="STORAGEPOOL_IO_BLOCK_SIZE"&&data.performanceMessage.sourceId==$scope.poolId){
						$scope.ioBlockSizePoolDatTime.push(convertTime(data.performanceMessage.startTime))
						$scope.ioBlockSizePoolData.push(data.performanceMessage.counterValue)
						if($scope.ioBlockSizePoolData.length>multiple){
							$scope.ioBlockSizePoolData.shift();
							$scope.ioBlockSizePoolDatTime.shift();
						}
						
						$scope.IOBlockSizeOption={
							xAxis: {
								  data: $scope.ioBlockSizePoolDatTime
							},
							series: [{
								name:"卷IO块大小(KB)",
								data: $scope.ioBlockSizePoolData,
							}]
						}

					}


				}
			};
		}else{
			showMessage.show($scope,"error","MonitorServer 异常");

		}

		$timeout(function(){
			iops.resize();
			throughput.resize();
			lantency.resize();
			ioBlockSize.resize();
			poolcopeChart.resize();
			poolCapacityChart.resize()
		},500);
		
	}
	var poolCapacityChart= echarts.init(document.getElementById('capacityChart'));
	window.onresize = poolCapacityChart.resize;
	$("#capacityChart").resize(function(){
		 $(poolCapacityChart).resize();
	 });

	var poolCapacityOption1 = {
		title:{
			text:'存储池使用情况',
			textStyle:{
				fontWeight:'normal',
				fontSize:14
			}
		},
		color:['#FF2073','#F49300','#3095FF','#1BBEB4'],
		tooltip : {
			 trigger: 'item',
			 formatter: "{b} ({d}%)"
		},
		
		 legend: {
		 },

		 
		series: [{
			name: '',
			type: 'pie',
			radius: ['50%', '60%'],
			center:['50%','50%'],
			label: {
				normal: {
					position: 'center'
				 }
			},
			data: []
		}]
	 };
	poolCapacityChart.setOption(poolCapacityOption1);
	

	function listchartData(){
		 var dataPoolCapacity=[];
		 var usedCapacity=[];
		 var poolIds=[];
		 poolIds.push($scope.poolId);
		 $http({
			 method: "POST",
			 async:false,
			 url: "listStoragePoolCapacity",
			 data: {
				 domainId:$scope.domainId,
				 poolIds:JSON.stringify(poolIds)
			 },
			 headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			 transformRequest: function(obj) {
				 var str = [];
				 for (var s in obj) {
					 str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
				 }
				 return str.join("&");
			 }
		 }).then(function successCallback(response){
			 var used;
			 var free;
			 var total;
			 var unit="M";
			 var hasUsed;
			 var freeUsed;
			 angular.forEach(response.data.simpleStoragePoolsList,function(data,index,array){
				 total=(data.totalSpace/1024/1024).toFixed(1);
				 $scope.noSpace=(total*1==0);
				 free=(data.freeSpace/1024/1024).toFixed(1);
				 used=(total-free).toFixed(1);
				 hasUsed=(data.usedSpace/1024/1024).toFixed(1);
				 freeUsed=(used-hasUsed).toFixed(1);
				 if(total>=1024){
					 total=(total/1024).toFixed(1);
					 free=(free/1024).toFixed(1);
					 used=(total-free).toFixed(1);
					 hasUsed=(hasUsed/1024).toFixed(1);
					 freeUsed=(freeUsed/1024).toFixed(1)
					 unit="G"

				 }else if(total>=1024*1024){
				 	total=(total/1024/1024).toFixed(1);
					free=(free/1024/1024).toFixed(1);
					used=(total-free).toFixed(1);
					hasUsed=(hasUsed/1024/1024).toFixed(1);
					freeUsed=(freeUsed/1024/1024).toFixed(1)
					unit="T"
				 }
				 $scope.totalSpace=total+unit;
				 $scope.usedCapacity=hasUsed+unit;
				 $scope.unusedCapacity=freeUsed+unit;
				 $scope.freeCapacity=free+unit;
				 dataPoolCapacity.push({value:used,name:"已分配"});
				 dataPoolCapacity.push({value:free,name:"剩余"});

				 usedCapacity.push({value:hasUsed,name:"已使用"});
				 usedCapacity.push({value:freeUsed,name:"未使用"});
			 })
			 if(total>0){
				poolCapacityChart.setOption({
					tooltip : {
						trigger: 'item',
						formatter: "{b} : {c}"+unit+" ({d}%)"
					},
					 series: [{
						data: [{
							value: usedCapacity[0].value,
							name: '已使用容量',
							
							label: {
								normal: {
									formatter: '存储池总容量',
									textStyle: {
										fontSize: 12,
										color:"#313131"
									}
								}
							}
						},{
							value: usedCapacity[1].value,
							name: '未使用容量',
							label: {
								normal: {
									formatter: ''
								}
							}
						},{
							value: dataPoolCapacity[1].value,
							name: '未分配容量',
							label: {
								normal: {
									formatter: '\n'+(dataPoolCapacity[0].value*1+dataPoolCapacity[1].value*1)+unit,
									textStyle: {
										fontSize: 24,
										color: '#294087'
									}
								}
							}
						}]
					 }]
				});


			 }

		});

	}
	

	var poolcopeChart= echarts.init(document.getElementById('copeTypeChart'));
	var poolcopeOption = {
		title:{
			text:'两副本与三副本剩余有效容量',
			textStyle:{
				fontWeight:'normal',
				fontSize:14
			}
		},
		color:['#2980B9'],
		tooltip : {
			trigger: 'axis',
		},

		grid: {
			left: '10%',
			right: '4%',
			bottom: '3%',
			containLabel: true
		},
		xAxis : [
			{
				type : 'category',
				data : ["两副本","三副本"]
			}
		],
		yAxis : [
			{   
				type: 'value',
				min: 0,
				axisLabel: {
					formatter: '{value}'
				}
			}
		],
		series : [
			{
				type:'bar',
				barWidth: '40',
				itemStyle: {
					normal: {
						color: 'rgba(48,149,255,0.05)',
						borderColor:"#3095ee"
					}
				},
				data:[]
			}
		]
	};
	poolcopeChart.setOption(poolcopeOption);
	window.onresize = poolcopeChart.resize;
	function copyChart() {
    console.log($scope.logicalPSAFreeSpace,$scope.logicalPSSFreeSpace,'545');
    console.log(!$scope.logicalPSAFreeSpace||!$scope.logicalPSSFreeSpace,123);
		if(!$scope.logicalPSAFreeSpace||!$scope.logicalPSSFreeSpace){
			return false;
		}
		var onecope="";
		var twocope="";
		var unit="M";
		var datacopeCapacity=[];
		
		   $("#copeTypeChart").resize(function(){
			   $(poolcopeChart).resize();
		   });
		   onecope=fixTwoDecimal($scope.logicalPSAFreeSpace/(1024*1024));
		   twocope=fixTwoDecimal($scope.logicalPSSFreeSpace/(1024*1024));

		   if(onecope>=1024){
			  onecope=fixTwoDecimal(onecope/1024);
			  twocope=fixTwoDecimal(twocope/1024);
			  unit="G";
		   }else if(onecope>=1){
			  onecope=fixTwoDecimal(onecope);
			  twocope=fixTwoDecimal(twocope);
			  unit="M";
		   }else if(onecope>=1024*1024){
			  onecope=fixTwoDecimal(onecope/1024/1024);
			  twocope=fixTwoDecimal(twocope/1024/1024);
			  unit="T";
		   }
		   datacopeCapacity.push({name:"两副本",value:onecope});
		   datacopeCapacity.push({name:"三副本",value:twocope});
		   poolcopeChart.setOption({
			   tooltip : {
				   trigger: 'item',
				   formatter: "{b} : {c}"+unit
				},
			   yAxis : {
					name: "剩余有效容量("+unit+")",
				},
			   series: [{
				   data: datacopeCapacity
			   }]
		})

	}
	function fixTwoDecimal(value) {
		return Math.round(value*100)/100;
	}
	$scope.jumpToPool=function(){
		$state.go('app.storage.domain.pool', {domainId:$scope.domainId,sel_domainName:$scope.domainName,flag:"1"});

	}


})
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

angular.module('app.storage').controller('QosTempletCtrl', function (focus, $stateParams, $rootScope, $scope, showMessage, translate, $timeout, $interval, $http, DTOptionsBuilder, DTColumnBuilder, $compile) {
  $(".modal").draggable();
  var vm = this;
  vm.selected = {};
  vm.selectAll = false;
  vm.toggleAll = toggleAll;
  vm.toggleOne = toggleOne;
  var loadSwitch = true;
  $scope.deleteNames = "";
  $scope.showFlag = 1;
  $scope.applyRBSwitch = false;
  $scope.defaultFlag = false;
  $scope.showSwitch = Object.keys($rootScope.apis.Rebalance || {}).length == 8
  window.addEventListener('keydown', function (e) {
    var addDis = $scope.addIOModel
    var addAbsTime = $scope.addAbsoluteTime
    var modDis = $scope.modifyIOModel
    var removeIO = removeIOModel
    if (e.keyCode == 13) {
      $scope.addIOModel = $scope.addAbsoluteTime = $scope.modifyIOModel = null
      removeIOModel = function () { }
      setTimeout(() => {
        $scope.addIOModel = addDis
        $scope.addAbsoluteTime = addAbsTime
        $scope.modifyIOModel = modDis
        removeIOModel = removeIO
      })
    }
  })
  $scope.$watch('showFlag',function (val) {
    if(val==3){
      getRebalanceSignal()
    }
  },true)
  var rebalanceStr = `<span class="rbmark">
		<hr style="padding-top: 5px">
		<div class="form-group">
			<label  class="col-sm-3 control-label">绝对时间</label>
			<div class="col-sm-7">
				<div class="input-group input-large" >
					<div class="input-append">
						<input class="form-control addST rbTime timeRange" data-smart-clockpicker  type="text" placeholder="开始时间" data-autoclose="true">
					</div>
					<span class="input-group-addon">
					to </span>
					<div class="input-append">
						<input class="form-control addET rbTime timeRange" data-smart-clockpicker  type="text" placeholder="结束时间" data-autoclose="true">
					</div>
				</div>
			</div>
			<div  class="col-sm-2">
				<button style="margin-top: 2px;" class="btn btn-sm btn-default pull-right" onclick="removeIOModel(this)"><i class="fa fa-times"></i></button>
			</div>
		</div>
	</span>`;

  $scope.$watch('$viewContentLoaded', function (event) {
    if ($stateParams.QosName && loadSwitch) {
      loadSwitch = false;
      $scope.showFlag = 2;
      $("#serverTab").children().eq(1).addClass("active").siblings("li").removeClass("active");
      $("#myTabContent").children().eq(1).addClass("active in").siblings("div").removeClass("active");
      $('#qosTab').DataTable().search($stateParams.QosName).draw();
    }
  });
  var timeSwitch;
  vm.dtOptions = DTOptionsBuilder.newOptions()
    .withDOM("<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>t<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>")
    .withBootstrap()
    .withOption('ajax', {
      url: BASE_API + 'listMigrationRules',
      dataSrc: function (data) {
        if (data.resultMessage.message != "success") {
          if (data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
          } else {
            return [];
          }
        } else {
          vm.selected = {};
          vm.selectAll = false;
          return data.ruleList
        }
      },
      type: 'POST'
    })
    .withDataProp('ruleList')
    .withOption('processing', true)
    .withOption('serverSide', false)
    .withOption('fnDrawCallback', function (result) {
      vm.selectAll = false;
      $('#deleteRules').prop("disabled", true)
      for (var id in vm.selected) {
        if ($("#" + id).hasClass("active")) {
          $('#deleteRules').prop("disabled", false)
          break;
        }
      }
      $(".selectpicker").selectpicker("render");
      $("#qosTab_filter").find("input").addClass("filter_input");
      $(".qosClearItem").remove();
      $('<i class="fa fa-times-circle item-error-style qosClearItem" onclick="clearFilter(\'' + 'qosTab_filter' + '\')"></i>').insertAfter($("#qosTab_filter").find("input"));
      if ($("#qosTab_filter").find("input").val() == "") {
        $(".qosClearItem").hide();
      } else {
        $(".qosClearItem").show();
      }
      $("#qosTab_filter").find("input").unbind('keyup', showItem);
      $("#qosTab_filter").find("input").bind('keyup', { cName: 'qosClearItem' }, showItem);
      $(".qosClearItem").click(function (e) {
        e.stopPropagation();
        e.preventDefault();
        $('#qosTab').DataTable().search("").draw();
      })
      if ($("#qosTab .dataTables_empty").size()) {
        $("#qosTab_paginate").hide()
      } else {
        $("#qosTab_paginate").show()
      }
      for (var id in vm.selected) {
        if (vm.selected[id]) {
          vm.selected[id] = false
        }
      }
    })
    .withOption('createdRow', function (row, data, dataIndex) {
      $compile(angular.element(row).contents())($scope);
    })
    .withOption('headerCallback', function (header) {
      if (!vm.headerCompiled) {
        vm.headerCompiled = true;
        $compile(angular.element(header).contents())($scope);
      }
    })
    .withOption('rowId', 'ruleId')
    .withLanguage({
      "search": "",
      "searchPlaceholder": "过滤",
      "aria": {
        "sortAscending": ": activate to sort column ascending",
        "sortDescending": ": activate to sort column descending"
      },
      "emptyTable": "表中数据为空",
      "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
      "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
      "order": [[2, "asc"]],
      "infoFiltered": "(由 _MAX_ 项结果过滤)",
      "zeroRecords": "表中数据为空",
      "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +

        '<option value="5" >5条</option>' +
        '<option value="10" >10条</option>' +
        '<option value="20" >20条</option>' +
        '<option value="50" >50条</option>' +
        '<option value="100" >100条</option>' +
        '</select>&nbsp',
      "paginate": {
        "previous": '<i class="fa fa-angle-left"></i>',
        "next": '<i class="fa fa-angle-right"></i>',
        "last": '<i class="fa  fa-angle-double-right"></i>',
        "first": '<i class="fa  fa-angle-double-left"></i>'
      }
    })
    .withPaginationType('full_numbers');

  vm.dtColumns = [
    DTColumnBuilder.newColumn('ruleId').withTitle('ID').notVisible(),
    DTColumnBuilder.newColumn('ruleName').withTitle("策略名称").renderWith(function (data, type, row) {
      if (row.builtInRule) {
        return translate.getWord(data)
      } else {
        return data;
      }
    }),
    DTColumnBuilder.newColumn('maxMigrationSpeed').withTitle("单盘重构速度上限(MB/s)").renderWith(function (data, type, row) {
      var str = ""
      if (row.strategy == "Manual") {
        str = data;
      }
      return str;
    }),
    DTColumnBuilder.newColumn('mode').withTitle("模式").renderWith(function (data, type, row) {
      return data == "AbsoluteTime" ? "绝对时间" : "相对时间";
    }),
    DTColumnBuilder.newColumn('null').withTitle("时间跨度").renderWith(function (data, type, row) {
      if (row.mode == "AbsoluteTime") {
        return secondToTime(row.startTime, true) + "~" + secondToTime(row.endTime, true);
      } else {
        return secondToTime(row.waitTime, false);
      }
    }),
    DTColumnBuilder.newColumn("strategy").withTitle("QoS策略类型").renderWith(function (data, type, row) {

      if (data == "Manual") {
        return "手动"
      } else {
        return "智能"
      }
    }),
    DTColumnBuilder.newColumn('ignoreMissPagesAndLogs').withTitle("及时追平数据").renderWith(function (data, type, row) {
      return data == "true" ? "否" : "是";
    }),
    DTColumnBuilder.newColumn(null).withTitle('操作').renderWith(function (data, type, row) {
      if (!$rootScope.apis.Qos || !($rootScope.apis.Qos.applyMigrationRules || $rootScope.apis.Qos.cancelMigrationRules)) {
        return;
      }
      var str = '<div class="btn-group dropdown-btn"   >' +
        '<button type="button" class="btn btn_lightblue btn-xs my-drop-down" ng-click="showDown(\'' + row.ruleId + '\');$event.stopPropagation();">操作 <span class="caret"></span></button>'
        + '<ul class="down" style="min-width:110px;">'
      str += '<li><a data-toggle="modal" data-target="#applyPool_modal" ng-show="apis.Qos.applyMigrationRules||apis.Qos.cancelMigrationRules" ng-click="applyInfo(\'' + row.ruleId + '\',\'' + row.ruleName + '\')">关联设置</a></li>'
        + '</ul></div>'
      return str;
    }).notSortable()
  ];
  $scope.goQoSDetail = function () {
    $state.go('app.storage.qosTemplet.QoSDetail', { volumeId: id });
  }
  vm.dtInstance = {};
  $scope.reloadData = function () {
    vm.dtInstance.reloadData(null, false);
  }
  vm.selectedIO = {};
  vm.selectAllIO = false;
  vm.dtOptionsIO = DTOptionsBuilder.newOptions()
    .withDOM("<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>t<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>")
    .withBootstrap()
    .withOption('ajax', {
      url: BASE_API + 'listIOLimitations',
      dataSrc: function (data) {
        if (data.resultMessage.message != "success") {
          if (data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
          } else {
            return [];
          }
        } else {
          vm.selectedIO = {};
          vm.selectAllIO = false;
          return data.ioLimitationList.filter(item => item.limitationName !== "多路径校正时间窗")
        }
      },
      type: 'POST'
    })

    .withDataProp('ioLimitationList')
    .withOption('processing', true)
    .withOption('serverSide', false)
    .withOption('fnInitComplete', function (result) {
      $('#chkAllBtnIO').click((e) =>{
        toggleAll(e.target.checked,vm.selectedIO)
      })
    })
    .withOption('fnDrawCallback', function (result) {
      $('#chkAllBtnIO').prop('checked', false)
      vm.selectAllIO = false;
      $('#deleteIO').prop("disabled", true)
      for (var id in vm.selectedIO) {
        if ($("#" + id).hasClass("active")) {
          $('#deleteIO').prop("disabled", false)
          break;
        }
      }
      $(".selectpicker").selectpicker("render");
      $("#IOTab_filter").find("input").addClass("filter_input");
      $(".IOClearItem").remove();
      $('<i class="fa fa-times-circle item-error-style IOClearItem" onclick="clearFilter(\'' + 'IOTab_filter' + '\')"></i>').insertAfter($("#IOTab_filter").find("input"));
      if ($("#IOTab_filter").find("input").val() == "") {
        $(".IOClearItem").hide();
      } else {
        $(".IOClearItem").show();
      }
      $("#IOTab_filter").find("input").unbind('keyup', showItem);
      $("#IOTab_filter").find("input").bind('keyup', { cName: 'IOClearItem' }, showItem);
      $(".IOClearItem").click(function (e) {
        e.stopPropagation();
        e.preventDefault();
        $('#IOTab').DataTable().search("").draw();
      })
      if ($("#IOTab .dataTables_empty").size()) {
        $("#IOTab_paginate").hide()
      } else {
        $("#IOTab_paginate").show()
      }
      for (var id in vm.selectedIO) {
        if (vm.selectedIO[id]) {
          vm.selectedIO[id] = false
        }
      }
    })
    .withOption('createdRow', function (row, data, dataIndex) {
      $compile(angular.element(row).contents())($scope);
    })
    .withOption('headerCallback', function (header) {
      if (!vm.headerCompiledIO) {
        vm.headerCompiledIO = true;
        $compile(angular.element(header).contents())($scope);
      }
    })
    .withOption('rowId', 'limitationId')
    .withLanguage({
      "search": "",
      "searchPlaceholder": "过滤",
      "aria": {
        "sortAscending": ": activate to sort column ascending",
        "sortDescending": ": activate to sort column descending"
      },
      "emptyTable": "表中数据为空",
      "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
      "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
      "order": [[2, "asc"]],
      "infoFiltered": "(由 _MAX_ 项结果过滤)",
      "zeroRecords": "表中数据为空",
      "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +

        '<option value="5" >5条</option>' +
        '<option value="10" >10条</option>' +
        '<option value="20" >20条</option>' +
        '<option value="50" >50条</option>' +
        '<option value="100" >100条</option>' +
        '</select>&nbsp;' + '  ',
      "paginate": {
        "previous": '<i class="fa fa-angle-left"></i>',
        "next": '<i class="fa fa-angle-right"></i>',
        "last": '<i class="fa  fa-angle-double-right"></i>',
        "first": '<i class="fa  fa-angle-double-left"></i>'
      }
    })
    .withPaginationType('full_numbers');

  vm.dtColumnsIO = [
    DTColumnBuilder.newColumn('limitationId').withTitle('ID').notVisible(),
    DTColumnBuilder.newColumn('null').withTitle('').renderWith(function (data, type, row) {
      return '<span class="fa fa-plus-square-o row-details" ng-click="showDetail($event.target,\'' + row.limitType + '\')" info=\'' + JSON.stringify(row.entries) + '\' value="' + row.limitationId + '"></span>';
    }).withClass('checkbox_col').notSortable(),
    DTColumnBuilder.newColumn(null).notSortable().withClass('checkbox_col')
      .withTitle('<span class="check_span"><input id="chkAllBtnIO" class="input_check" type="checkbox" ng-model="datatables.selectAllIO"><label for="chkAllBtnIO"></label></span>')
      .renderWith(function (data, type, row) {
        if (row.limitationName === "多路径校正时间窗") {
          return ""
        }
        vm.selectedIO[row.limitationId] = false;
        return '<span class="check_span"><input type="checkbox"  class="input_check"name="ioCheckbox" ng-model="datatables.selectedIO[\'' + row.limitationId + '\']" ng-click="datatables.toggleOne(datatables.selectedIO)" id="checkbox_' + row.limitationId + '"><label for="checkbox_' + row.limitationId + '"></label></span>'
      }),
    DTColumnBuilder.newColumn('limitationName').withTitle("策略名称").renderWith(function (data, type, row) {
      if (!data) {
        return 'null'
      } else {
        return data
      }
    }),
    DTColumnBuilder.newColumn(null).withTitle("类型").renderWith(function (data, type, row) {

      if (row.limitType == "Static") {
        return "静态"
      } else {
        return "动态"
      }
    }),
    DTColumnBuilder.newColumn('status').withTitle("状态").renderWith(function (data, type, row) {

      var typeString;
      switch (data) {
        case "FREE":
          typeString = "<span class='status_green'>空</span>"; break;
        case "APPLING":
          typeString = '<div class="progress progress-striped active" >' +
            '<div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>应用中</span></div></div>'; break;
        case "APPLIED":
          typeString = "<span class='status_green'>已应用</span>"; break;
        case "CANCELING":
          typeString = '<div class="progress progress-striped active" >' +
            '<div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>取消中</span></div></div>'; break;
        case "DELETING":
          typeString = '<div class="progress progress-striped active" >' +
            '<div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>删除中</span></div></div>'; break;
        case "AVAILABLE":
          typeString = "<span class='status_green'>可用</span>"; break;
      }
      return typeString
    }),
    DTColumnBuilder.newColumn(null).withTitle('操作').renderWith(function (data, type, row) {

      if (!$rootScope.apis.Qos || !($rootScope.apis.Qos.updateIoLimitations || $rootScope.apis.Qos.applyIoLimitations || $rootScope.apis.Qos.cancelIoLimitations)) {
        return;
      }
      let defaultFlag = false;
      if (row.limitationName === "多路径校正时间窗") {
        defaultFlag = true;
      }
      return '<div class="btn-group dropdown-btn" ng-show="apis.Qos.updateIoLimitations || apis.Qos.applyIoLimitations || apis.Qos.cancelIoLimitations">' +
        '<button type="button" class="btn btn_lightblue btn-xs my-drop-down" ng-click="showDown(\'' + row.limitationId + '\');$event.stopPropagation();">操作 <span class="caret"></span></button>'
        + '<ul class="down" style="min-width:110px;">'
        + '<li><a data-toggle="modal" data-target="#modifyIO_modal" ng-show="apis.Qos.updateIoLimitations"  ng-click="modifyIO($event.target,\'' + row.limitationId + '\',\'' + row.limitationName + '\',\'' + row.limitType + '\',\'' + defaultFlag + '\')">' + translate.getWord("button.modify") + '</a></li>'
        + '<li><a data-toggle="modal" data-target="#applyIO_modal" ng-show="apis.Qos.applyIoLimitations||apis.Qos.cancelIoLimitations" ng-click="applyIO(\'' + row.limitationId + '\',\'' + row.limitationName + '\',\'' + row.limitType + '\')">关联设置</a></li>'
        + '</ul></div>'
    }).notSortable()
  ];

  vm.dtInstanceIO = {};
  $scope.reloadDataIO = function () {
    vm.dtInstanceIO.reloadData(null, false);
  }

  vm.selectedRB = {};
  vm.selectAllRB = false;
  vm.dtOptionsRB = DTOptionsBuilder.newOptions()
    .withDOM("<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>t<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>")
    .withBootstrap()
    .withOption('ajax', {
      url: BASE_API + 'listRebalanceRule',
      dataSrc: function (data) {
        if (data.resultMessage.message != "success") {
          if (data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
          } else {
            return [];
          }
        } else {
          vm.selectedRB = {};
          vm.selectAllRB = false;
          return data.rebalanceRules
        }
      },
      type: 'POST'
    })
    .withDataProp('rebalanceRules')
    .withOption('processing', true)
    .withOption('serverSide', false)
    .withOption('fnInitComplete', function (result) {
      $('#chkAllBtnRB').click((e) =>{
        toggleAll(e.target.checked,vm.selectedRB)
      })
    })
    .withOption('fnDrawCallback', function (result) {
      $('#chkAllBtnRB').prop('checked', false)
      vm.selectAllRB = false;
      $('#deleteRB').prop("disabled", true)
      for (var id in vm.selectedRB) {
        if ($("#" + id).hasClass("active")) {
          $('#deleteRB').prop("disabled", false)
          break;
        }
      }
      $(".selectpicker").selectpicker("render");
      $("#RBTab_filter").find("input").addClass("filter_input");
      $(".RBClearItem").remove();
      $('<i class="fa fa-times-circle item-error-style RBClearItem" onclick="clearFilter(\'' + 'RBTab_filter' + '\')"></i>').insertAfter($("#RBTab_filter").find("input"));
      if ($("#RBTab_filter").find("input").val() == "") {
        $(".RBClearItem").hide();
      } else {
        $(".RBClearItem").show();
      }
      $("#RBTab_filter").find("input").unbind('keyup', showItem);
      $("#RBTab_filter").find("input").bind('keyup', { cName: 'RBClearItem' }, showItem);
      $(".RBClearItem").click(function (e) {
        e.stopPropagation();
        e.preventDefault();
        $('#RBTab').DataTable().search("").draw();
      })
      if ($("#RBTab .dataTables_empty").size()) {
        $("#RBTab_paginate").hide()
      } else {
        $("#RBTab_paginate").show()
      }
      for (var id in vm.selectedRB) {
        if (vm.selectedRB[id]) {
          vm.selectedRB[id] = false
        }
      }
    })
    .withOption('createdRow', function (row, data, dataIndex) {
      $compile(angular.element(row).contents())($scope);
    })
    .withOption('headerCallback', function (header) {
      if (!vm.headerCompiledRB) {
        vm.headerCompiledRB = true;
        $compile(angular.element(header).contents())($scope);
      }
    })
    .withOption('rowId', 'ruleId')
    .withLanguage({
      "search": "",
      "searchPlaceholder": "过滤",
      "aria": {
        "sortAscending": ": activate to sort column ascending",
        "sortDescending": ": activate to sort column descending"
      },
      "emptyTable": "表中数据为空",
      "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
      "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
      "order": [[2, "asc"]],
      "infoFiltered": "(由 _MAX_ 项结果过滤)",
      "zeroRecords": "表中数据为空",
      "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +

        '<option value="5" >5条</option>' +
        '<option value="10" >10条</option>' +
        '<option value="20" >20条</option>' +
        '<option value="50" >50条</option>' +
        '<option value="100" >100条</option>' +
        '</select>&nbsp;' + '  ',
      "paginate": {
        "previous": '<i class="fa fa-angle-left"></i>',
        "next": '<i class="fa fa-angle-right"></i>',
        "last": '<i class="fa  fa-angle-double-right"></i>',
        "first": '<i class="fa  fa-angle-double-left"></i>'
      }
    })
    .withPaginationType('full_numbers');
  vm.dtColumnsRB = [
    DTColumnBuilder.newColumn('ruleId').withTitle('ID').notVisible(),
    DTColumnBuilder.newColumn(null).notSortable().withClass('checkbox_col')
      .withTitle('<span class="check_span"><input id="chkAllBtnRB" class="input_check" type="checkbox" ng-model="datatables.selectAllRB"><label for="chkAllBtnRB"></label></span>')
      .renderWith(function (data, type, row) {
        vm.selectedRB[row.ruleId] = false;
        return '<span class="check_span"><input type="checkbox"  class="input_check"name="rbCheckbox" ng-model="datatables.selectedRB[\'' + row.ruleId + '\']" ng-click="datatables.toggleOne(datatables.selectedRB)" id="checkbox_' + row.ruleId + '"><label for="checkbox_' + row.ruleId + '"></label></span>'
      }),
    DTColumnBuilder.newColumn('ruleName').withTitle("策略名称"),
    DTColumnBuilder.newColumn('null').withTitle("相对时间").renderWith(function (data, type, row) {
      return secondToTime(row.waitTime, false);
    }),
    DTColumnBuilder.newColumn('null').withTitle("绝对时间").renderWith(function (data, type, row) {
      let str = "";
      for (var i = 0; i < row.absoluteTimeList.length; i++) {
        str += secondToClock(row.absoluteTimeList[i].beginTime) + "~";
        if (row.absoluteTimeList[i].beginTime * 1 > row.absoluteTimeList[i].endTime * 1) {
          str += "次日";
        }
        str += secondToClock(row.absoluteTimeList[i].endTime) + "<br/>"
      }
      return str
    }),
    DTColumnBuilder.newColumn(null).withTitle('操作').renderWith(function (data, type, row) {

      var str = '<div class="btn-group dropdown-btn" ng-show="apis.Rebalance.updateRebalanceRule || apis.Rebalance.applyRebalanceRule || apis.Rebalance.unApplyRebalanceRule">' +
        '<button type="button" class="btn btn_lightblue btn-xs my-drop-down" ng-click="showDown(\'' + row.ruleId + '\');$event.stopPropagation();">操作 <span class="caret"></span></button>'
        + '<ul class="down" style="min-width:110px;">'
        + '<li><a data-toggle="modal" ng-show="apis.Rebalance.updateRebalanceRule" data-target="#modifyRB_modal" info=\'' + JSON.stringify(row.absoluteTimeList) + '\' ng-click="modifyRB(\'' + row.ruleId + '\',\'' + row.ruleName + '\',\'' + row.waitTime + '\',$event.target)">修改</a></li>'
        + '<li ng-show="apis.Rebalance.applyRebalanceRule || apis.Rebalance.unApplyRebalanceRule"><a data-toggle="modal" data-target="#applyRBPool_modal" ng-click="applyRB(\'' + row.ruleId + '\',\'' + row.ruleName + '\')">关联设置</a></li>'
        + '</ul></div>'
      return str;
    }).notSortable()
  ];

  vm.dtInstanceRB = {};
  $scope.reloadDataRB = function () {
    vm.dtInstanceRB.reloadData(null, false);
  }
  vm.selectedRBApply = {};
  vm.selectAllRBApply = false;
  vm.selectedRBCancel = {};
  vm.selectAllRBCancel = false;
  $scope.applyRB = function (id, name) {

    $scope.currentName = name;
    $scope.currentId = id;
    $scope.applyRBSwitch = true;

    vm.dtOptionsApplyRB = DTOptionsBuilder.newOptions()
      .withBootstrap()
      .withOption('ajax', {
        data: { randomData: Math.random() },
        url: 'getUnAppliedRebalanceRulePool',
        dataSrc: function (data) {
          if (data.resultMessage.message != "success") {
            if (data.resultMessage.message == "ERROR_0019_SessionOut") {
              showMessage.show($scope, "warn", translate.getWord("session.out"));
              $scope.logout();
            } else {
              return [];
            }
          } else {
            vm.selectedRBApply = {};
            vm.selectAllRBApply = false;
            return data.poolList
          }

        },
        type: 'POST'
      })

      .withOption('createdRow', function (row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
      })
      .withOption('headerCallback', function (header) {
        $compile(angular.element(header).contents())($scope);
      })
      .withDataProp('poolList')
      .withOption('processing', false)
      .withOption('serverSide', false)
      .withOption('paginate', true)
      .withOption('fnDrawCallback', function (result) {
        vm.selectAllRBApply = false;
        vm.applyRB = true;
        for (var id in vm.selectedRBApply) {
          if (vm.selectedRBApply[id]) {
            vm.selectedRBApply[id] = false
          }
        }
        $(".selectpicker").selectpicker("refresh")

        $("#applyRBTab_filter").find("input").addClass("filter_input");
        $(".applyRBClearItem").remove();
        $('<i class="fa fa-times-circle item-error-style applyRBClearItem" onclick="clearFilter(\'' + 'applyRBTab_filter' + '\')"></i>').insertAfter($("#applyRBTab_filter").find("input"));
        if ($("#applyRBTab_filter").find("input").val() == "") {
          $(".applyRBClearItem").hide();
        } else {
          $(".applyRBClearItem").show();
        }
        $("#applyRBTab_filter").find("input").unbind('keyup', showItem);
        $("#applyRBTab_filter").find("input").bind('keyup', { cName: 'applyRBClearItem' }, showItem);
        $("#applyRBTab_filter").addClass("table_top_sm");
        $(".applyRBClearItem").click(function (e) {
          e.stopPropagation();
          e.preventDefault();
          $('#applyRBTab').DataTable().search("").draw();
        })
        if ($("#applyRBTab .dataTables_empty").size()) {
          $("#applyRBTab_paginate").hide()
        } else {
          $("#applyRBTab_paginate").show().css("font-size", "8px")
        }
      })
      .withLanguage({
        "search": "",
        "searchPlaceholder": "过滤",
        "aria": {
          "sortAscending": ": activate to sort column ascending",
          "sortDescending": ": activate to sort column descending"
        },
        "emptyTable": "表中数据为空",
        "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
        "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
        "zeroRecords": "表中数据为空",
        "infoFiltered": "(由 _MAX_ 项结果过滤)",
        "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +

          '<option value="5" >5条</option>' +
          '<option value="10" >10条</option>' +
          '<option value="20" >20条</option>' +
          '<option value="50" >50条</option>' +
          '<option value="100" >100条</option>' +
          '</select>&nbsp',
        "paginate": {
          "previous": '<i class="fa fa-angle-left"></i>',
          "next": '<i class="fa fa-angle-right"></i>',
          "last": '<i class="fa  fa-angle-double-right"></i>',
          "first": '<i class="fa  fa-angle-double-left"></i>'
        }
      })
      .withPaginationType('full_numbers')
      .withOption('rowId', 'poolId');
    vm.dtColumnsApplyRB = [
      DTColumnBuilder.newColumn(null).withClass('checkbox_col').notSortable()
        .withTitle('<span class="check_span"><input class="input_check" style="width:auto !important" ng-click="datatables.toggleAllAC(\'applyRB\',datatables.selectAllRBApply,datatables.selectedRBApply)" type="checkbox" ng-model="datatables.selectAllRBApply" value="0" id="applyRBAll"><label for="applyRBAll"></label></span>')
        .renderWith(function (data, type, row) {
          vm.selectedRBApply[row.poolId] = false;
          return '<span class="check_span"><input class="input_check" type="checkbox" name="applyRBTips" ng-model="datatables.selectedRBApply[\'' + row.poolId
            + '\'];" ng-click="datatables.toggleOneAC(\'applyRB\',datatables.selectedRBApply)" id="checkboxRB_' + row.poolId + '" ><label for="checkboxRB_' + row.poolId + '"></label></span>';

        }),
      DTColumnBuilder.newColumn('poolName').withTitle('存储池名'),
      DTColumnBuilder.newColumn('description').withTitle('描述'),
      DTColumnBuilder.newColumn('domainName').withTitle('所属域'),
      DTColumnBuilder.newColumn('status').withTitle("状态")
        .renderWith(function (data, type, row) {
          if (data == "Available") {
            return "<span class='status_green'>" + translate.getWord("status.available") + "</span>";
          } else {
            return '<div class="progress progress-striped active" style="height:20px;border-radius:4px;margin:0px;width:100%">'
              + '<div class="progress-bar progress-bar-primary" role="progressbar"  style="width: 100%" ><span>'
              + translate.getWord("status.deleting") + '</span></div></div>';
          }
        }),
    ];
    vm.dtInstanceApplyRB = {};

    vm.dtOptionsCancelRB = DTOptionsBuilder.newOptions()
      .withBootstrap()
      .withOption('ajax', {
        data: { ruleId: id, randomData: Math.random() },
        url: 'getAppliedRebalanceRulePool',
        dataSrc: function (data) {
          if (data.resultMessage.message != "success") {
            if (data.resultMessage.message == "ERROR_0019_SessionOut") {
              showMessage.show($scope, "warn", translate.getWord("session.out"));
              $scope.logout();
            } else {
              return [];
            }
          } else {
            vm.selectedRBCancel = {};
            vm.selectAllRBCancel = false;
            return data.poolList
          }

        },
        type: 'POST'
      })

      .withOption('createdRow', function (row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
      })
      .withOption('headerCallback', function (header) {
        $compile(angular.element(header).contents())($scope);
      })
      .withDataProp('poolList')
      .withOption('processing', false)
      .withOption('serverSide', false)
      .withOption('paginate', true)
      .withOption('fnDrawCallback', function (result) {

        vm.selectAllRBCancel = false;
        vm.cancelRB = true;
        for (var id in vm.selectedRBCancel) {
          if (vm.selectedRBCancel[id]) {
            vm.selectedRBCancel[id] = false
          }
        }
        $(".selectpicker").selectpicker("refresh")

        $("#cancelRBTab_filter").find("input").addClass("filter_input");
        $(".cancelRBClearItem").remove();
        $('<i class="fa fa-times-circle item-error-style cancelRBClearItem" onclick="clearFilter(\'' + 'cancelRBTab_filter' + '\')"></i>').insertAfter($("#cancelRBTab_filter").find("input"));
        if ($("#cancelRBTab_filter").find("input").val() == "") {
          $(".cancelRBClearItem").hide();
        } else {
          $(".cancelRBClearItem").show();
        }
        $("#cancelRBTab_filter").find("input").unbind('keyup', showItem);
        $("#cancelRBTab_filter").find("input").bind('keyup', { cName: 'cancelRBClearItem' }, showItem);
        $("#cancelRBTab_filter").addClass("table_top_sm");
        $(".cancelRBClearItem").click(function (e) {
          e.stopPropagation();
          e.preventDefault();
          $('#cancelRBTab').DataTable().search("").draw();
        })
        if ($("#cancelRBTab .dataTables_empty").size()) {
          $("#cancelRBTab_paginate").hide()
        } else {
          $("#cancelRBTab_paginate").show().css("font-size", "8px")
        }
      })
      .withLanguage({
        "search": "",
        "searchPlaceholder": "过滤",
        "aria": {
          "sortAscending": ": activate to sort column ascending",
          "sortDescending": ": activate to sort column descending"
        },
        "emptyTable": "表中数据为空",
        "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
        "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
        "zeroRecords": "表中数据为空",
        "infoFiltered": "(由 _MAX_ 项结果过滤)",
        "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +

          '<option value="5" >5条</option>' +
          '<option value="10" >10条</option>' +
          '<option value="20" >20条</option>' +
          '<option value="50" >50条</option>' +
          '<option value="100" >100条</option>' +
          '</select>&nbsp',
        "paginate": {
          "previous": '<i class="fa fa-angle-left"></i>',
          "next": '<i class="fa fa-angle-right"></i>',
          "last": '<i class="fa  fa-angle-double-right"></i>',
          "first": '<i class="fa  fa-angle-double-left"></i>'
        }
      })
      .withPaginationType('full_numbers')
      .withOption('rowId', 'poolId');
    vm.dtColumnsCancelRB = [
      DTColumnBuilder.newColumn(null).withClass('checkbox_col').notSortable()
        .withTitle('<span class="check_span"><input class="input_check" style="width:auto !important" ng-click="datatables.toggleAllAC(\'cancelRB\',datatables.selectAllRBCancel,datatables.selectedRBCancel)" type="checkbox" ng-model="datatables.selectAllRBCancel" value="0" id="cancelRBAll"><label for="cancelRBAll"></label></span>')
        .renderWith(function (data, type, row) {
          vm.selectedRBCancel[row.poolId] = false;
          return '<span class="check_span"><input class="input_check" type="checkbox" name="cancelRBTips" ng-model="datatables.selectedRBCancel[\'' + row.poolId
            + '\'];" ng-click="datatables.toggleOneAC(\'cancelRB\',datatables.selectedCancelRB)" id="checkboxRB_' + row.poolId + '" ><label for="checkboxRB_' + row.poolId + '"></label></span>';

        }),
      DTColumnBuilder.newColumn('poolName').withTitle('存储池名'),
      DTColumnBuilder.newColumn('description').withTitle('描述'),
      DTColumnBuilder.newColumn('domainName').withTitle('所属域'),
      DTColumnBuilder.newColumn('status').withTitle("状态")
        .renderWith(function (data, type, row) {
          if (data == "Available") {
            return "<span class='status_green'>" + translate.getWord("status.available") + "</span>";
          } else {
            return '<div class="progress progress-striped active" style="height:20px;border-radius:4px;margin:0px;width:100%">'
              + '<div class="progress-bar progress-bar-primary" role="progressbar"  style="width: 100%" ><span>'
              + translate.getWord("status.deleting") + '</span></div></div>';
          }
        }),
    ];
    vm.dtInstanceCancelRB = {};
  }

  $scope.modifyRB = function (id, name, wait, e) {
    let tempArr = JSON.parse($(e).attr("info"));
    $scope.doFocus('RBruleNameModify');
    $scope.RBIdModify = id;
    $scope.modifyRB.RBruleNameModify = name;
    $("#waitHourRBModify").val(parseInt(wait / 3600));
    $("#waitMinRBModify").val((wait / 60) % 60);
    $scope.waitHourRBModify = $("#waitHourRBModify").val();
    $scope.waitMinRBModify = $("#waitMinRBModify").val();

    $("#rbContainerModify").html("");
    for (var i = 0; i < tempArr.length; i++) {
      $("#rbContainerModify").append($compile(rebalanceStr)($scope));
      $('.timeRange').clockpicker();
      $("#rbContainerModify").find(".rbmark").eq(i).find(".addST").val(secondToClock(tempArr[i].beginTime));
      $("#rbContainerModify").find(".rbmark").eq(i).find(".addET").val(secondToClock(tempArr[i].endTime));
    }
  }
  function secondToClock(obj) {
    let h = parseInt(obj / 3600);
    let m = (obj % 3600) / 60;
    if (h * 1 < 10) {
      h = "0" + h
    }
    if (m * 1 < 10) {
      m = "0" + m
    }
    return h + ":" + m
  }
  $scope.doModfiyRB = function () {
    $("#waitHourRBModify").val($("#waitHourRBModify").val() || "0");
    $("#waitMinRBModify").val($("#waitMinRBModify").val() || "0");
    let a, b, c, d, e, f;
    let tempArr = [];
    for (var i = 0; i < $("#rbContainerModify .rbmark").size(); i++) {
      a = $("#rbContainerModify .rbmark").eq(i).find(".addST").val() ? timeToSecond($("#rbContainerModify .rbmark").eq(i).find(".addST").val()) : "";
      b = $("#rbContainerModify .rbmark").eq(i).find(".addET").val() ? timeToSecond($("#rbContainerModify .rbmark").eq(i).find(".addET").val()) : "";
      tempArr.push({ 'beginTime': a, 'endTime': b })
    }

    $http({
      method: "post",
      data: {
        ruleId: $scope.RBIdModify,
        ruleName: $scope.modifyRB.RBruleNameModify,
        waitTime: ($("#waitHourRBModify").val() * 60 + $("#waitMinRBModify").val() * 1) * 60,
        absoluteTimeJson: JSON.stringify(tempArr)
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      url: "updateRebalanceRule",

      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(data) {
      data = data.data;
      if (data.resultMessage.message != "success") {
        if (data.resultMessage.message == "ERROR_0019_SessionOut") {
          showMessage.show($scope, "warn", translate.getWord("session.out"));
          $scope.logout();
        } else {
          showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
          return;
        }
      } else {
        vm.dtInstanceRB.reloadData(null, false);
      }
    });
  }
  $scope.validateTime = function (arr, str) {

    var temp1;
    var temp2;
    if (arr.length == 2 && arr[0] > arr[1]) {
      $("#searchErr" + str).html('<i class="fa fa-exclamation-circle"></i>&nbsp;<span>提示:</span>时间区间格式不对。')
      $timeout.cancel(timeSwitch);
      timeSwitch = $timeout(function () {
        $("#searchErr" + str).html("")
      }, 4000);
      return false;
    }
    for (var i = 0; i < arr.length - 2; i += 2) {
      for (var j = 0; j < arr.length - 3 - i; j += 2) {
        if ((arr[j] > arr[j + 1]) || (arr[j + 2] > arr[j + 3])) {
          $("#searchErr" + str).html('<i class="fa fa-exclamation-circle"></i>&nbsp;<span>提示:</span>时间区间格式不对。')
          $timeout.cancel(timeSwitch);
          timeSwitch = $timeout(function () {
            $("#searchErr" + str).html("")
          }, 4000);
          return false;
        }
        if (arr[j + 2] >= arr[j + 1]) {

        } else if (arr[j + 3] <= arr[j]) {
          temp1 = arr[j];
          arr[j] = arr[j + 2];
          arr[j + 2] = temp1;
          temp2 = arr[j + 1];
          arr[j + 1] = arr[j + 3];
          arr[j + 3] = temp2;
        } else {
          $("#searchErr" + str).html('<i class="fa fa-exclamation-circle"></i>&nbsp;<span>提示:</span>时间区间重合。')
          $timeout.cancel(timeSwitch);
          timeSwitch = $timeout(function () {
            $("#searchErr" + str).html("")
          }, 4000);
          return false;
        }
      }
    }
    return true;
  }
  function isTime(str) {
    var a = str.match(/^(\d{1,2})(:)?(\d{1,2})\2(\d{1,2})$/);
    if (a == null) { return false }
    if (a[1] > 24 || a[3] > 60 || a[4] > 60) {
      return false
    }
    return true;
  }

  $scope.addIOBtn = function () {
    var tempFlag = true;
    if ($("#ruleContainer .timeOption").size() != 2) {
      var timeArr = [];
      $("#ruleContainer .timeOption").each(function () {
        timeArr.push($(this).val())
      })
      tempFlag = $scope.validateTime(timeArr, "");
    }
    if (tempFlag) {
      var a;
      var b;
      var c;
      var d;
      var e;
      var f;
      var tempArr = [];
      if ($("#limitationName").val() == "") {
        tempFlag = false;
        $("#searchErr").html('<i class="fa fa-exclamation-circle"></i>&nbsp;<span>提示:</span> 请添加IO策略名称。')
        $timeout.cancel(timeSwitch);
        timeSwitch = $timeout(function () {
          $("#searchErr").html("")
        }, 4000);
        return
      }
      for (var i = 0; i < $("#ruleContainer .iomark").size(); i++) {
        a = $(".iomark").eq(i).find(".addST").val() ? $(".iomark").eq(i).find(".addST").val() + ":00" : "";
        b = $(".iomark").eq(i).find(".addET").val() ? $(".iomark").eq(i).find(".addET").val() + ":00" : "";
        c = $(".iomark").eq(i).find(".iopsLower").val() || "-1";
        d = $(".iomark").eq(i).find(".iopsUpper").val() || "-1";
        e = $(".iomark").eq(i).find(".throughputLower").val() * 1024 || "-1";
        f = $(".iomark").eq(i).find(".throughputUpper").val() * 1024 || "-1";
        if (c - d >= 0 && c != -1 && d != -1) {
          tempFlag = false;
          $("#searchErr").html('<i class="fa fa-exclamation-circle"></i>&nbsp;<span>提示:</span> IOPS上限须高于下限。')
          $timeout.cancel(timeSwitch);
          timeSwitch = $timeout(function () {
            $("#searchErr").html("")
          }, 4000);
          return
        }
        if (e - f >= 0 && e != -1 && f != -1) {
          tempFlag = false;
          $("#searchErr").html('<i class="fa fa-exclamation-circle"></i>&nbsp;<span>提示:</span> 吞吐量上限须高于下限。')
          $timeout.cancel(timeSwitch);
          timeSwitch = $timeout(function () {
            $("#searchErr").html("")
          }, 4000);
          return
        }
        if ((!isTime(a) || !isTime(b)) && $scope.hideEditSelect != 'Static') {
          tempFlag = false;
          $("#searchErr").html('<i class="fa fa-exclamation-circle"></i>&nbsp;<span>提示:</span> 请添加正确时间跨度。')
          $timeout.cancel(timeSwitch);
          timeSwitch = $timeout(function () {
            $("#searchErr").html("")
          }, 4000);
          return
        }

        tempArr.push({ 'upperLimitedIOPS': d, 'lowerLimitedIOPS': c, 'upperLimitedThroughput': f, 'lowerLimitedThroughput': e, 'startTime': a, 'endTime': b })
      }
      if (tempArr.length == 0) {
        tempFlag = false;
        $("#searchErr").html('<i class="fa fa-exclamation-circle"></i>&nbsp;<span>提示:</span> 请添加IO规则。')
        $timeout.cancel(timeSwitch);
        timeSwitch = $timeout(function () {
          $("#searchErr").html("")
        }, 4000);
        return
      }
      $http({
        method: "POST",
        data: {
          limitationName: $("#limitationName").val(),
          limitType: $scope.hideEditSelect,
          entriesJson: JSON.stringify(tempArr)
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        url: BASE_API + "createIOLimitations",

        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      }).then(function successCallback(data) {
        data = data.data;
        if (data.resultMessage.message != "success") {
          if (data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
          } else {
            showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
            return;
          }
        } else {
          vm.dtInstanceIO.reloadData(null, false);
        }
        $("#addIO_modal").modal("hide")
      });
    }
  }

  $('#modifyIO_modal').on('hidden.bs.modal', function (e) {
    $scope.iopsModifyForm.$invalid = false
    $scope.iopsModifyForm.$setPristine()
    $scope.iopsModifyForm.$setUntouched()
    $(".iopsLower").removeAttr("disabled")
    $(".iopsUpper").removeAttr("disabled")
    $(".throughputLower").removeAttr("disabled")
    $(".throughputUpper").removeAttr("disabled")
  })
  $('#modifyIO_modal').on('shown.bs.modal', function () {
    $scope.iopsModifyForm.$invalid = false
  })
  $scope.modifyIO = function (e, id, name, type, defaultFlag) {
    $scope.defaultFlag = defaultFlag = defaultFlag == 'false' ? false : true
    $scope.doFocus('limitationNameModify');
    $("#limitationID").val(id);
    $scope.updateIOId = id;
    $("#limitationNameModify").val(name);
    if (type == "Static") {
      $("#limitTypeModify").val("静态")
    } else {
      $("#limitTypeModify").val("动态")
    }
    $scope.modifyType = type;
    var tempArr = JSON.parse($(e).parents("tr").children().eq(0).find("span").attr("info"));
    $("#ruleContainerModify").html("");
    if (type == "Static") {
      for (var i = 0; i < tempArr.length; i++) {
        $("#ruleContainerModify").append($compile($(".iomodel2").html())($scope));
        $('.dynamicTime').clockpicker();
        $("#ruleContainerModify").find(".iomark").eq(i).find(".iopsLower").val(getIOData(tempArr[i].lowerLimitedIoPs, true));
        $("#ruleContainerModify").find(".iomark").eq(i).find(".iopsUpper").val(getIOData(tempArr[i].upperLimitedIoPs, true));
        $("#ruleContainerModify").find(".iomark").eq(i).find(".throughputLower").val(getIOData(tempArr[i].lowerLimitedThroughput / 1024, true));
        $("#ruleContainerModify").find(".iomark").eq(i).find(".throughputUpper").val(getIOData(tempArr[i].upperLimitedThroughput / 1024, true));
      }
    } else {
      for (var i = 0; i < tempArr.length; i++) {
        $("#ruleContainerModify").append($compile($(".iomodel1").html())($scope));
        $('.dynamicTime').clockpicker();
        $("#ruleContainerModify").find(".iomark").eq(i).find(".addST").val(tempArr[i].startTime);
        $("#ruleContainerModify").find(".iomark").eq(i).find(".addET").val(tempArr[i].endTime);
        $("#ruleContainerModify").find(".iomark").eq(i).find(".iopsLower").val(getIOData(tempArr[i].lowerLimitedIoPs, true));
        $("#ruleContainerModify").find(".iomark").eq(i).find(".iopsUpper").val(getIOData(tempArr[i].upperLimitedIoPs, true));
        $("#ruleContainerModify").find(".iomark").eq(i).find(".throughputLower").val(getIOData(tempArr[i].lowerLimitedThroughput / 1024, true));
        $("#ruleContainerModify").find(".iomark").eq(i).find(".throughputUpper").val(getIOData(tempArr[i].upperLimitedThroughput / 1024, true));
        if (defaultFlag) {
          $(".iopsLower").attr("disabled", "disabled");
          $(".iopsUpper").attr("disabled", "disabled");
          $(".throughputLower").attr("disabled", "disabled");
          $(".throughputUpper").attr("disabled", "disabled");
        }else{
          $(".iopsLower").removeAttr("disabled")
          $(".iopsUpper").removeAttr("disabled")
          $(".throughputLower").removeAttr("disabled")
          $(".throughputUpper").removeAttr("disabled")
        }
        if (tempArr.length === 1) {
          $('#ruleContainerModify').find(".iomark").eq(0).find('.pull-right').attr('disabled', 'disabled')
        }
      }
    }
  }
  $scope.modifyIOBtn = function () {

    var tempFlag = true;
    if ($("#ruleContainerModify .timeOption").size() != 2) {
      var timeArr = [];
      $("#ruleContainerModify .timeOption").each(function () {
        timeArr.push($(this).val())
      })
      tempFlag = $scope.validateTime(timeArr, "Modify");
    }

    if ($("#limitationNameModify").val() == "") {
      tempFlag = false;
      $("#searchErrModify").html('<i class="fa fa-exclamation-circle"></i>&nbsp;<span>提示:</span> 请添加IO策略名称。')
      $timeout.cancel(timeSwitch);
      timeSwitch = $timeout(function () {
        $("#searchErrModify").html("")
      }, 4000);
      return
    }
    if (tempFlag) {
      var a;
      var b;
      var c;
      var d;
      var e;
      var f;
      var tempArr = [];
      for (var i = 0; i < $("#ruleContainerModify").find(".iomark").size(); i++) {
        a = $("#ruleContainerModify").find(".iomark").eq(i).find(".addST").val() ? $("#ruleContainerModify").find(".iomark").eq(i).find(".addST").val() + ":00" : "";
        b = $("#ruleContainerModify").find(".iomark").eq(i).find(".addET").val() ? $("#ruleContainerModify").find(".iomark").eq(i).find(".addET").val() + ":00" : "";
        c = $("#ruleContainerModify").find(".iomark").eq(i).find(".iopsLower").val() || "-1";
        d = $("#ruleContainerModify").find(".iomark").eq(i).find(".iopsUpper").val() || "-1";
        e = $("#ruleContainerModify").find(".iomark").eq(i).find(".throughputLower").val() * 1024 || "-1";
        f = $("#ruleContainerModify").find(".iomark").eq(i).find(".throughputUpper").val() * 1024 || "-1";
        if ((!isTime(a) || !isTime(b)) && $scope.modifyType != 'Static') {
          tempFlag = false;
          $("#searchErrModify").html('<i class="fa fa-exclamation-circle"></i>&nbsp;<span>提示:</span> 请添加正确时间跨度。')
          $timeout.cancel(timeSwitch);
          timeSwitch = $timeout(function () {
            $("#searchErrModify").html("")
          }, 4000);
          return
        }
        if (c - d >= 0 && c != -1 && d != -1) {
          tempFlag = false;
          $("#searchErrModify").html('<i class="fa fa-exclamation-circle"></i>&nbsp;<span>提示:</span> IOPS上限须高于下限。')
          $timeout.cancel(timeSwitch);
          timeSwitch = $timeout(function () {
            $("#searchErrModify").html("")
          }, 4000);
          return
        }
        if (e - f >= 0 && e != -1 && f != -1) {
          tempFlag = false;
          $("#searchErrModify").html('<i class="fa fa-exclamation-circle"></i>&nbsp;<span>提示:</span> 吞吐量上限须高于下限。')
          $timeout.cancel(timeSwitch);
          timeSwitch = $timeout(function () {
            $("#searchErrModify").html("")
          }, 4000);
          return
        }
        tempArr.push({ 'upperLimitedIOPS': d, 'lowerLimitedIOPS': c, 'upperLimitedThroughput': f, 'lowerLimitedThroughput': e, 'startTime': a, 'endTime': b })
      }

      if (tempArr.length == 0) {
        tempFlag = false;
        $("#searchErrModify").html('<i class="fa fa-exclamation-circle"></i>&nbsp;<span>提示:</span> 请添加IO规则。')
        $timeout.cancel(timeSwitch);
        timeSwitch = $timeout(function () {
          $("#searchErrModify").html("")
        }, 4000);
        return
      }
      $http({
        method: "post",
        data: {
          limitationId: $scope.updateIOId,
          limitationName: $("#limitationNameModify").val(),
          limitType: $scope.modifyType,
          entriesJson: JSON.stringify(tempArr)
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        url: "updateIOLimitations",

        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      }).then(function successCallback(data) {
        data = data.data;
        if (data.resultMessage.message != "success") {
          if (data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
          } else {
            showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
            return;
          }
        } else {
          vm.dtInstanceIO.reloadData(null, false);
        }
        $("#modifyIO_modal").modal("hide")
      });
    }

  }
  vm.selectedApplyIO = {};
  vm.selectAllApplyIO = false;
  $scope.applySwitchIO = false;

  vm.selectedCancelIO = {};
  vm.selectAllCancelIO = false;
  $scope.staticQOSTips = false;
  $scope.applyIO = function (id, name, type) {
    $scope.currentId = id;
    $scope.currentName = name;
    $scope.applySwitchIO = true;
    $scope.staticQOSTips = (type == "Static") ? true : false;
    vm.dtOptionsApplyIO = DTOptionsBuilder.newOptions()
      .withBootstrap()
      .withOption('ajax', {
        data: { limitationId: $scope.currentId, randomData: Math.random() },
        url: 'getIOLimitationUnappliedDrivers',
        dataSrc: function (data) {
          for (var i = 0; i < data.unappliedDrivers.length; i++) {
            data.unappliedDrivers[i].driverContainerId += "-" + data.unappliedDrivers[i].volumeId + "-" + data.unappliedDrivers[i].snapshotId;
          }
          return data.unappliedDrivers
        },
        type: 'POST'
      })

      .withOption('createdRow', function (row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
      })
      .withOption('headerCallback', function (header) {
        $compile(angular.element(header).contents())($scope);
      })
      .withDataProp('unappliedDrivers')
      .withOption('processing', false)
      .withOption('serverSide', false)
      .withOption('paginate', true)
      .withOption('fnDrawCallback', function (result) {
        vm.selectAllApplyIO = false;
        vm.applyIO = true;
        for (var id in vm.selectedApplyIO) {
          if (vm.selectedApplyIO[id]) {
            vm.selectedApplyIO[id] = false
          }
        }
        $(".selectpicker").selectpicker("refresh")

        $("#applyIOTab_filter").find("input").addClass("filter_input");
        $(".applyIOClearItem").remove();
        $('<i class="fa fa-times-circle item-error-style applyIOClearItem" onclick="clearFilter(\'' + 'applyIOTab_filter' + '\')"></i>').insertAfter($("#applyIOTab_filter").find("input"));
        if ($("#applyIOTab_filter").find("input").val() == "") {
          $(".applyIOClearItem").hide();
        } else {
          $(".applyIOClearItem").show();
        }
        $("#applyIOTab_filter").find("input").unbind('keyup', showItem);
        $("#applyIOTab_filter").find("input").bind('keyup', { cName: 'applyIOClearItem' }, showItem);
        $("#applyIOTab_filter").addClass("table_top_sm");
        $(".applyIOClearItem").click(function (e) {
          e.stopPropagation();
          e.preventDefault();
          $('#applyIOTab').DataTable().search("").draw();
        })
        if ($("#applyIOTab .dataTables_empty").size()) {
          $("#applyIOTab_paginate").hide()
        } else {
          $("#applyIOTab_paginate").show().css("font-size", "8px")
        }
      })
      .withLanguage({
        "search": "",
        "searchPlaceholder": "过滤",
        "aria": {
          "sortAscending": ": activate to sort column ascending",
          "sortDescending": ": activate to sort column descending"
        },
        "emptyTable": "表中数据为空",
        "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
        "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
        "zeroRecords": "表中数据为空",
        "infoFiltered": "(由 _MAX_ 项结果过滤)",
        "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +

          '<option value="5" >5条</option>' +
          '<option value="10" >10条</option>' +
          '<option value="20" >20条</option>' +
          '<option value="50" >50条</option>' +
          '<option value="100" >100条</option>' +
          '</select>&nbsp',
        "paginate": {
          "previous": '<i class="fa fa-angle-left"></i>',
          "next": '<i class="fa fa-angle-right"></i>',
          "last": '<i class="fa  fa-angle-double-right"></i>',
          "first": '<i class="fa  fa-angle-double-left"></i>'
        }
      })
      .withPaginationType('full_numbers')
      .withOption('rowId', 'driverContainerId');
    vm.dtColumnsApplyIO = [
      DTColumnBuilder.newColumn(null).withClass('checkbox_col').notSortable()
        .withTitle('<span class="check_span"><input  class="input_check"  style="width:auto !important" ng-click="datatables.toggleAllAC(\'applyIO\',datatables.selectAllApplyIO,datatables.selectedApplyIO)" type="checkbox" ng-model="datatables.selectAllApplyIO" value="0" id="selectAllFlag"><label for="selectAllFlag"></label></span>')
        .renderWith(function (data, type, row) {
          var idNum = Math.random();
          vm.selectedApplyIO[row.driverContainerId] = false;
          return '<span class="check_span"><input class="input_check"  type="checkbox" volumeId="' + row.volumeId + '" snapshotId="' + row.snapshotId + '"  driverType="' + row.driverType + '" name="applyIOTips" ng-model="datatables.selectedApplyIO[\'' + row.driverContainerId
            + '\'];" ng-click="datatables.toggleOneAC(\'applyIO\',datatables.selectedApplyIO)" id="' + idNum + '"><label for="' + idNum + '"></label></span>';

        }),
      DTColumnBuilder.newColumn('driverName').withTitle("驱动名称"),
      DTColumnBuilder.newColumn(null).withTitle('驱动类型').renderWith(function (data, type, row) {
        return row.driverType == "NBD" ? "PYD" : row.driverType;
      }),
      // delete
      DTColumnBuilder.newColumn('driverContainerIp').withTitle('驱动容器IP'),
      DTColumnBuilder.newColumn('volumeName').withTitle('所属卷'),
      DTColumnBuilder.newColumn('status').withTitle(translate.getWord("volume.driver.status"))
        .renderWith(function (data, type, row) {
          var typeString;
          switch (data) {
            case "START":
              typeString = "<span class='status_green'>" + translate.getWord("status.start") + "</span>"; break;
            case "LAUNCHED":
              typeString = "<span class='status_green'>" + translate.getWord("status.launched") + "</span>"; break;
            case "ERROR":
              typeString = "<span class='status_red'>" + translate.getWord("status.error") + "</span>"; break;
            case "LAUNCHING":
              typeString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>' + translate.getWord("status.launching") + '</span></div></div>'; break;
            case "REMOVING":
              typeString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>' + translate.getWord("status.removing") + '</span></div></div>'; break;
            case "UNAVAILABLE":
              typeString = "<span class='status_red'>" + translate.getWord("status.removing") + "</span>"; break;
            default:
              typeString = "<span class='status_orange'>" + translate.getWord("status.unknown") + "</span>"; break;

          }
          return typeString
        }),
    ];
    vm.dtInstanceApplyIO = {};

    vm.dtOptionsCancelIO = DTOptionsBuilder.newOptions()
      .withBootstrap()
      .withOption('ajax', {
        data: { limitationId: $scope.currentId, randomData: Math.random() },
        url: 'getIOLimitationAppliedDrivers',
        dataSrc: function (data) {
          for (var i = 0; i < data.appliedDrivers.length; i++) {
            data.appliedDrivers[i].driverContainerId += "-" + data.appliedDrivers[i].volumeId + "-" + data.appliedDrivers[i].snapshotId;
          }
          return data.appliedDrivers
        },
        type: 'POST'
      })

      .withOption('createdRow', function (row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
      })
      .withOption('headerCallback', function (header) {
        $compile(angular.element(header).contents())($scope);
      })
      .withDataProp('appliedDrivers')
      .withOption('processing', false)
      .withOption('serverSide', false)
      .withOption('paginate', true)
      .withOption('fnDrawCallback', function (result) {
        vm.selectAllCancelIO = false;
        vm.cancelIO = true;
        for (var id in vm.selectedCancelIO) {
          if (vm.selectedCancelIO[id]) {
            vm.selectedCancelIO[id] = false
          }
        }
        $(".selectpicker").selectpicker("refresh")
        $("#cancelIOTab_filter").find("input").addClass("filter_input");
        $(".cancelIOClearItem").remove();
        $('<i class="fa fa-times-circle item-error-style cancelIOClearItem" onclick="clearFilter(\'' + 'cancelIOTab_filter' + '\')"></i>').insertAfter($("#cancelIOTab_filter").find("input"));
        if ($("#cancelIOTab_filter").find("input").val() == "") {
          $(".cancelIOClearItem").hide();
        } else {
          $(".cancelIOClearItem").show();
        }
        $("#cancelIOTab_filter").find("input").unbind('keyup', showItem);
        $("#cancelIOTab_filter").find("input").bind('keyup', { cName: 'cancelIOClearItem' }, showItem);
        $("#cancelIOTab_filter").addClass("table_top_sm");
        $(".cancelIOClearItem").click(function (e) {
          e.stopPropagation();
          e.preventDefault();
          $('#cancelIOTab').DataTable().search("").draw();
        })
        if ($("#cancelIOTab .dataTables_empty").size()) {
          $("#cancelIOTab_paginate").hide()
        } else {
          $("#cancelIOTab_paginate").show().css("font-size", "8px")
        }
      })
      .withLanguage({
        "search": "",
        "searchPlaceholder": "过滤",
        "aria": {
          "sortAscending": ": activate to sort column ascending",
          "sortDescending": ": activate to sort column descending"
        },
        "emptyTable": "表中数据为空",
        "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
        "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
        "zeroRecords": "表中数据为空",
        "infoFiltered": "(由 _MAX_ 项结果过滤)",
        "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
          '<option value="5" >5条</option>' +
          '<option value="10" >10条</option>' +
          '<option value="20" >20条</option>' +
          '<option value="50" >50条</option>' +
          '<option value="100" >100条</option>' +
          '</select>&nbsp;' + '  ',
        "paginate": {
          "previous": '<i class="fa fa-angle-left"></i>',
          "next": '<i class="fa fa-angle-right"></i>',
          "last": '<i class="fa  fa-angle-double-right"></i>',
          "first": '<i class="fa  fa-angle-double-left"></i>'
        }
      })
      .withPaginationType('full_numbers')
      .withOption('rowId', 'driverContainerId');
    vm.dtColumnsCancelIO = [
      DTColumnBuilder.newColumn(null).withClass('checkbox_col').notSortable()
        .withTitle('<span class="check_span"><input  class="input_check" style="width:auto !important" ng-click="datatables.toggleAllAC(\'cancelIO\',datatables.selectAllCancelIO,datatables.selectedCancelIO)" type="checkbox" ng-model="datatables.selectAllCancelIO" value="0" id="selectAllFlag1"><label for="selectAllFlag1"></label></span>')
        .renderWith(function (data, type, row) {
          var idNum = Math.random();
          vm.selectedCancelIO[row.driverContainerId] = false;
          return '<span class="check_span"><input type="checkbox"  class="input_check" volumeId="' + row.volumeId + '" snapshotId="' + row.snapshotId + '" driverType="' + row.driverType + '" name="cancelIOTips" ng-model="datatables.selectedCancelIO[\'' + row.driverContainerId
            + '\'];" ng-click="datatables.toggleOneAC(\'cancelIO\',datatables.selectedCancelIO)" id="' + idNum + '"><label for="' + idNum + '">';

        }),
      DTColumnBuilder.newColumn('driverName').withTitle("驱动名称"),
      DTColumnBuilder.newColumn(null).withTitle('驱动类型').renderWith(function (data, type, row) {
        return row.driverType == "NBD" ? "PYD" : row.driverType;
      }),
      // delete
      DTColumnBuilder.newColumn('driverContainerIp').withTitle('驱动容器IP'),
      DTColumnBuilder.newColumn('volumeName').withTitle('所属卷'),
      DTColumnBuilder.newColumn('status').withTitle('驱动状态')
        .renderWith(function (data, type, row) {
          var typeString;
          switch (data) {
            case "START":
              typeString = "<span class='status_green'>" + translate.getWord("status.start") + "</span>"; break;
            case "LAUNCHED":
              typeString = "<span class='status_green'>" + translate.getWord("status.launched") + "</span>"; break;
            case "ERROR":
              typeString = "<span class='status_red'>" + translate.getWord("status.error") + "</span>"; break;
            case "LAUNCHING":
              typeString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>' + translate.getWord("status.launching") + '</span></div></div>'; break;
            case "REMOVING":
              typeString = '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>' + translate.getWord("status.removing") + '</span></div></div>'; break;
            case "UNAVAILABLE":
              typeString = "<span class='status_red'>" + translate.getWord("status.removing") + "</span>"; break;
            default:
              typeString = "<span class='status_orange'>" + translate.getWord("status.unknown") + "</span>"; break;

          }
          return typeString
        }),
    ];
    vm.dtInstanceCancelIO = {};
  }

  $scope.showDetail = function (e, type) {
    var tempArr = JSON.parse($(e).attr("info"));
    var strHtml = '<tr class="details_tr" style="display:none">'
      + '<td class="details" colspan="12">'
      + '<table class="table  table-striped  second_page">'
      + '<thead>' + (type == "Dynamic" ? '<th>开始时间<span class="second_table_head_border"></span></th><th>结束时间<span class="second_table_head_border"></span></th>' : "") + '<th>IOPS下限<span class="second_table_head_border"></span></th><th>IOPS上限<span class="second_table_head_border"></span></th><th>吞吐量下限(KB/s)<span class="second_table_head_border"></span></th><th>吞吐量上限(KB/s)</th></thead>'
      + '<tbody>';
    for (var i = 0; i < tempArr.length; i++) {
      strHtml += '<tr>' + (type == "Dynamic" ? '<td>' + tempArr[i].startTime + '</td><td>' + tempArr[i].endTime + '</td>' : "") + '<td>' + getIOData(tempArr[i].lowerLimitedIoPs) + '</td><td>' + getIOData(tempArr[i].upperLimitedIoPs) + '</td><td>' + getIOData(tempArr[i].lowerLimitedThroughput / 1024) + '</td><td>' + getIOData(tempArr[i].upperLimitedThroughput / 1024) + '</td></tr>';
    }
    strHtml += '</tbody>'
      + '</table>'
      + '</td>'
      + '</tr>';
    if ($(e).hasClass("fa-plus-square-o")) {
      $(".fa-minus-square-o").removeClass("fa-minus-square-o").addClass("fa-plus-square-o");
      $(e).removeClass("fa-plus-square-o").addClass("fa-minus-square-o");
      $(e).parents("tr").siblings(".details_tr").remove();
      $(e).parents("tr").after(strHtml);
      $(".details_tr").show();
    } else {
      $(".fa-minus-square-o").removeClass("fa-minus-square-o").addClass("fa-plus-square-o");
      $(e).parents("tr").siblings(".details_tr").remove()
    }
  }
  function getIOData(obj, input) {
    if (input) {
      return obj * 1 < 0 ? "" : obj;
    } else {
      return obj * 1 < 0 ? "无限制" : obj
    }

  }
  vm.selectedApply = {};
  vm.selectAllApply = false;
  $scope.applySwitch = false;

  vm.selectedCancel = {};
  vm.selectAllCancel = false;
  vm.toggleAllAC = toggleAllAC;
  vm.toggleOneAC = toggleOneAC;
  vm.applyQOS = true;
  vm.cancelQOS = true;
  vm.applyIO = true;
  vm.cancelIO = true;
  $scope.applyInfo = function (id, name) {
    $scope.currentId = id;
    $scope.currentName = name;
    $scope.applySwitch = true;

    vm.dtOptionsApply = DTOptionsBuilder.newOptions()
      .withBootstrap()
      .withOption('ajax', {
        data: { ruleId: $scope.currentId, randomData: Math.random() },
        url: 'getUnAppliedPools',
        type: 'POST'
      })

      .withOption('createdRow', function (row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
      })
      .withOption('headerCallback', function (header) {
        $compile(angular.element(header).contents())($scope);
      })
      .withDataProp('appliedPoolList')
      .withOption('processing', false)
      .withOption('serverSide', false)
      .withOption('paginate', true)
      .withOption('fnDrawCallback', function (result) {
        vm.selectAllApply = false;
        vm.applyQOS = true;
        for (var id in vm.selectedApply) {
          if (vm.selectedApply[id]) {
            vm.selectedApply[id] = false
          }
        }
        $(".selectpicker").selectpicker("refresh")

        $("#applyTab_filter").find("input").addClass("filter_input");
        $(".applyClearItem").remove();
        $('<i class="fa fa-times-circle item-error-style applyClearItem" onclick="clearFilter(\'' + 'applyTab_filter' + '\')"></i>').insertAfter($("#applyTab_filter").find("input"));
        if ($("#applyTab_filter").find("input").val() == "") {
          $(".applyClearItem").hide();
        } else {
          $(".applyClearItem").show();
        }
        $("#applyTab_filter").find("input").unbind('keyup', showItem);
        $("#applyTab_filter").find("input").bind('keyup', { cName: 'applyClearItem' }, showItem);
        $("#applyTab_filter").addClass("table_top_sm");
        $(".applyClearItem").click(function (e) {
          e.stopPropagation();
          e.preventDefault();
          $('#applyTab').DataTable().search("").draw();
        })
        if ($("#applyTab .dataTables_empty").size()) {
          $("#applyTab_paginate").hide()
        } else {
          $("#applyTab_paginate").show().css("font-size", "8px")
        }
      })
      .withLanguage({
        "search": "",
        "searchPlaceholder": "过滤",
        "aria": {
          "sortAscending": ": activate to sort column ascending",
          "sortDescending": ": activate to sort column descending"
        },
        "emptyTable": "表中数据为空",
        "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
        "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
        "zeroRecords": "表中数据为空",
        "infoFiltered": "(由 _MAX_ 项结果过滤)",
        "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +

          '<option value="5" >5条</option>' +
          '<option value="10" >10条</option>' +
          '<option value="20" >20条</option>' +
          '<option value="50" >50条</option>' +
          '<option value="100" >100条</option>' +
          '</select>&nbsp',
        "paginate": {
          "previous": '<i class="fa fa-angle-left"></i>',
          "next": '<i class="fa fa-angle-right"></i>',
          "last": '<i class="fa  fa-angle-double-right"></i>',
          "first": '<i class="fa  fa-angle-double-left"></i>'
        }
      })
      .withPaginationType('full_numbers')
      .withOption('rowId', 'poolId');
    vm.dtColumnsApply = [
      DTColumnBuilder.newColumn(null).withClass('checkbox_col').notSortable()
        .withTitle('<span class="check_span"><input class="input_check" style="width:auto !important" ng-click="datatables.toggleAllAC(\'apply\',datatables.selectAllApply,datatables.selectedApply)" type="checkbox" ng-model="datatables.selectAllApply" value="0" id="selectAllFlag2"><label for="selectAllFlag2"></label></span>')
        .renderWith(function (data, type, row) {
          vm.selectedApply[row.poolId] = false;
          return '<span class="check_span"><input class="input_check" type="checkbox" name="applyTips" ng-model="datatables.selectedApply[\'' + row.poolId
            + '\'];" ng-click="datatables.toggleOneAC(\'apply\',datatables.selectedApply)" id="checkbox_' + row.poolId + '"><label for="checkbox_' + row.poolId + '"></label></span>';

        }),
      DTColumnBuilder.newColumn('poolName').withTitle('存储池名'),
      DTColumnBuilder.newColumn('description').withTitle('描述'),
      DTColumnBuilder.newColumn('domainName').withTitle('所属域'),
      DTColumnBuilder.newColumn('status').withTitle("状态")
        .renderWith(function (data, type, row) {
          if (data == "Available") {
            return "<span class='status_green'>" + translate.getWord("status.available") + "</span>";
          } else {
            return '<div class="progress progress-striped active" style="height:20px;border-radius:4px;margin:0px;width:100%">'
              + '<div class="progress-bar progress-bar-primary" role="progressbar"  style="width: 100%" ><span>'
              + translate.getWord("status.deleting") + '</span></div></div>';
          }
        }),
    ];
    vm.dtInstanceApply = {};

    vm.dtOptionsCancel = DTOptionsBuilder.newOptions()
      .withBootstrap()
      .withOption('ajax', {
        data: { ruleId: $scope.currentId, randomData: Math.random() },
        url: 'getAppliedStoragePools',
        type: 'POST'
      })

      .withOption('createdRow', function (row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
      })
      .withOption('headerCallback', function (header) {
        $compile(angular.element(header).contents())($scope);
      })
      .withDataProp('appliedPoolList')
      .withOption('processing', false)
      .withOption('serverSide', false)
      .withOption('paginate', true)
      .withOption('fnDrawCallback', function (result) {

        vm.selectAllCancel = false;
        vm.cancelQOS = true;
        for (var id in vm.selectedCancel) {
          if (vm.selectedCancel[id]) {
            vm.selectedCancel[id] = false
          }
        }
        $(".selectpicker").selectpicker("refresh")
        $("#cancelTab_filter").find("input").addClass("filter_input");
        $(".cancelClearItem").remove();
        $('<i class="fa fa-times-circle item-error-style cancelClearItem" onclick="clearFilter(\'' + 'cancelTab_filter' + '\')"></i>').insertAfter($("#cancelTab_filter").find("input"));
        if ($("#cancelTab_filter").find("input").val() == "") {
          $(".cancelClearItem").hide();
        } else {
          $(".cancelClearItem").show();
        }
        $("#cancelTab_filter").find("input").unbind('keyup', showItem);
        $("#cancelTab_filter").find("input").bind('keyup', { cName: 'cancelClearItem' }, showItem);
        $("#cancelTab_filter").addClass("table_top_sm");
        $(".cancelClearItem").click(function (e) {
          e.stopPropagation();
          e.preventDefault();
          $('#cancelTab').DataTable().search("").draw();
        })
        if ($("#cancelTab .dataTables_empty").size()) {
          $("#cancelTab_paginate").hide()
        } else {
          $("#cancelTab_paginate").show().css("font-size", "8px")
        }
      })
      .withLanguage({
        "search": "",
        "searchPlaceholder": "过滤",
        "aria": {
          "sortAscending": ": activate to sort column ascending",
          "sortDescending": ": activate to sort column descending"
        },
        "emptyTable": "表中数据为空",
        "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
        "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
        "zeroRecords": "表中数据为空",
        "infoFiltered": "(由 _MAX_ 项结果过滤)",
        "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +

          '<option value="5" >5条</option>' +
          '<option value="10" >10条</option>' +
          '<option value="20" >20条</option>' +
          '<option value="50" >50条</option>' +
          '<option value="100" >100条</option>' +
          '</select>&nbsp',
        "paginate": {
          "previous": '<i class="fa fa-angle-left"></i>',
          "next": '<i class="fa fa-angle-right"></i>',
          "last": '<i class="fa  fa-angle-double-right"></i>',
          "first": '<i class="fa  fa-angle-double-left"></i>'
        }
      })
      .withPaginationType('full_numbers')
      .withOption('rowId', 'poolId');
    vm.dtColumnsCancel = [
      DTColumnBuilder.newColumn(null).withClass('checkbox_col').notSortable()
        .withTitle('<span class="check_span"><input class="input_check" style="width:auto !important" ng-click="datatables.toggleAllAC(\'cancel\',datatables.selectAllCancel,datatables.selectedCancel)" type="checkbox" ng-model="datatables.selectAllCancel" value="0" id="selectAllFlag3"><label for="selectAllFlag3"></label></span>')
        .renderWith(function (data, type, row) {
          vm.selectedCancel[row.poolId] = false;
          return '<span class="check_span"><input class="input_check" type="checkbox" name="cancelTips" ng-model="datatables.selectedCancel[\'' + row.poolId
            + '\'];" ng-click="datatables.toggleOneAC(\'cancel\',datatables.selectedCancel)"  id="checkbox_' + row.poolId + '"><label for="checkbox_' + row.poolId + '"></label></span>';

        }),
      DTColumnBuilder.newColumn('poolName').withTitle('存储池名'),
      DTColumnBuilder.newColumn('description').withTitle('描述'),
      DTColumnBuilder.newColumn('domainName').withTitle('所属域'),
      DTColumnBuilder.newColumn('status').withTitle("状态")
        .renderWith(function (data, type, row) {
          if (data == "Available") {
            return "<span class='status_green'>" + translate.getWord("status.available") + "</span>";
          } else {
            return '<div class="progress progress-striped active" style="height:20px;border-radius:4px;margin:0px;width:100%">'
              + '<div class="progress-bar progress-bar-primary" role="progressbar"  style="width: 100%" ><span>'
              + translate.getWord("status.deleting") + '</span></div></div>';
          }
        }),
    ];
    vm.dtInstanceCancel = {};
  }


  $scope.modelRefresh = function () {

    if ($scope.showFlag == 2) {
      vm.dtInstanceApply.reloadData(null, false);
      vm.dtInstanceCancel.reloadData(null, false);
    } else if ($scope.showFlag == 1) {
      vm.dtInstanceApplyIO.reloadData(null, false);
      vm.dtInstanceCancelIO.reloadData(null, false);
    } else if ($scope.showFlag == 3) {
      vm.dtInstanceApplyRB.reloadData(null, false);
      vm.dtInstanceCancelRB.reloadData(null, false);
    }
  }
  $scope.doApplyRB = function () {
    let tempArr = [];
    for (var id in vm.selectedRBApply) {
      if ($("#" + id)) {
        if (vm.selectedRBApply[id]) {
          tempArr.push(id)
        }
      }
    }
    $http({
      async: false,
      method: "post",
      data: { ruleId: $scope.currentId, "idsJson": JSON.stringify(tempArr) },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      url: "applyRebalanceRule",
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(data) {
      data = data.data;
      if (data.resultMessage.message != "success") {
        if (data.resultMessage.message == "ERROR_0019_SessionOut") {
          showMessage.show($scope, "warn", translate.getWord("session.out"));
          $scope.logout();
        } else {
          showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
          return;
        }
      } else {
        vm.selectedRBApply = {};
        vm.selectedRBCancel = {};
        vm.dtInstanceApplyRB.reloadData(null, false);
        vm.dtInstanceCancelRB.reloadData(null, false);
      }
    })
  }

  $scope.doCancelRB = function () {
    let tempArr = [];
    for (var id in vm.selectedRBCancel) {
      if ($("#" + id)) {
        if (vm.selectedRBCancel[id]) {
          tempArr.push(id)
        }
      }
    }
    $http({
      async: false,
      method: "post",
      data: { ruleId: $scope.currentId, "idsJson": JSON.stringify(tempArr) },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      url: "unApplyRebalanceRule",
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(data) {
      data = data.data;
      if (data.resultMessage.message != "success") {
        if (data.resultMessage.message == "ERROR_0019_SessionOut") {
          showMessage.show($scope, "warn", translate.getWord("session.out"));
          $scope.logout();
        } else {
          showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
          return;
        }
      } else {
        vm.selectedRBApply = {};
        vm.selectedRBCancel = {};
        vm.dtInstanceApplyRB.reloadData(null, false);
        vm.dtInstanceCancelRB.reloadData(null, false);
      }
    })
  }
  $scope.applyBtn = function () {
    var tempArr = []
    if ($scope.showFlag == 2) {
      for (var id in vm.selectedApply) {
        if ($("#" + id)) {
          if (vm.selectedApply[id]) {
            tempArr.push(id)
          }
        }
      }
      $http({
        async: false,
        method: "post",
        data: { ruleId: $scope.currentId, "poolIdsJson": JSON.stringify(tempArr) },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        url: "applyMigrationRules",
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      }).then(function successCallback(data) {
        data = data.data;
        if (data.resultMessage.message != "success") {
          if (data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
          } else {
            showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
            return;
          }
        } else {
          vm.selectedApply = {};
          vm.selectedCancel = {};
          vm.dtInstanceApply.reloadData(null, false);
          vm.dtInstanceCancel.reloadData(null, false);
        }
      })
    } else if ($scope.showFlag == 1) {
      for (var id in vm.selectedApplyIO) {
        if ($("#" + id)) {
          if (vm.selectedApplyIO[id]) {
            tempArr.push({ 'driverContainerId': id.split('-')[0], 'volumeId': $("#" + id).find("input[name='applyIOTips']").attr('volumeId'), 'snapshotId': $("#" + id).find("input[name='applyIOTips']").attr('snapshotId'), 'driverType': $("#" + id).find("input[name='applyIOTips']").attr('driverType') })
          }
        }
      }
      $http({
        async: false,
        method: "post",
        data: { limitationId: $scope.currentId, "driverKeysJson": JSON.stringify(tempArr) },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        url: "applyIOLimitations",
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      }).then(function successCallback(data) {
        data = data.data;
        if (data.resultMessage.message != "success") {
          if (data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
          } else {
            showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
            return;
          }
        } else {
          if (data.failedDriverList.length != 0) {
            var arr = [];
            $.each(data.failedDriverList, function (i, v) {
              arr.push(v.driverName)
            })
            showMessage.show($scope, "warn", "驱动 " + arr.join(",") + " 应用不成功");
            return;
          }
          vm.selectedApplyIO = {};
          vm.selectedCancelIO = {};
          vm.dtInstanceApplyIO.reloadData(null, false);
          vm.dtInstanceCancelIO.reloadData(null, false);
        }
      })
    }

  }
  $scope.cancelBtn = function () {
    var tempArr = []
    if ($scope.showFlag == 2) {
      for (var id in vm.selectedCancel) {
        if ($("#" + id)) {
          if (vm.selectedCancel[id]) {
            tempArr.push(id)
          }
        }
      }
      $http({
        async: false,
        method: "post",
        data: { ruleId: $scope.currentId, "poolIdsJson": JSON.stringify(tempArr) },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        url: "cancelMigrationRules",
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      }).then(function successCallback(data) {
        data = data.data;
        if (data.resultMessage.message != "success") {
          if (data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
          } else {
            showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
            return;
          }
        } else {
          vm.selectedApply = {};
          vm.selectedCancel = {};
          vm.dtInstanceApply.reloadData(null, false);
          vm.dtInstanceCancel.reloadData(null, false);
        }

      })
    } else if ($scope.showFlag == 1) {
      for (var id in vm.selectedCancelIO) {
        if ($("#" + id)) {
          if (vm.selectedCancelIO[id]) {
            tempArr.push({ 'driverContainerId': id.split('-')[0], 'volumeId': $("#" + id).find("input[name='cancelIOTips']").attr('volumeId'), 'snapshotId': $("#" + id).find("input[name='cancelIOTips']").attr('snapshotId'), 'driverType': $("#" + id).find("input[name='cancelIOTips']").attr('driverType') })
          }
        }
      }
      $http({
        async: false,
        method: "post",
        data: { limitationId: $scope.currentId, "driverKeysJson": JSON.stringify(tempArr) },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        url: "cancelIOLimitations",
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      }).then(function successCallback(data) {
        data = data.data;
        if (data.resultMessage.message != "success") {
          if (data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
          } else {
            showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
            return;
          }
        } else {
          vm.selectedApplyIO = {};
          vm.selectedCancelIO = {};
          vm.dtInstanceApplyIO.reloadData(null, false);
          vm.dtInstanceCancelIO.reloadData(null, false);
        }

      })
    }

  }
  $scope.showDown = function (id) {
    if ($(".temp-show").size()) {
      $(".temp-show").hide();
      $(".temp-show").removeClass("temp-show")
    } else {
      $("#" + id).find(".my-drop-down").eq(0).next().addClass("temp-show");
      $(".temp-show").toggle()
    }
    $(document).one("click", function () {
      $(".temp-show").hide();
      $(".temp-show").removeClass("temp-show")
    });
  }
  $scope.deleteRule = function () {
    var ruleListToDelete = [];
    if ($scope.showFlag == 2) {
      $("input[name='ruleCheckbox']:checked").each(function (index, checkbox) {
        var ruleId = $(this).parent().parent().parent().prop("id");
        var name = $(this).parent().parent().next().html();
        var maxSpd = $(this).parent().parent().next().next().html();
        ruleListToDelete.push({ 'ruleId': ruleId, 'ruleName': name, 'maxMigrationSpeed': maxSpd });
      });

    } else if ($scope.showFlag == 1) {
      $("input[name='ioCheckbox']:checked").each(function (index, checkbox) {
        var limitationId = $(this).parent().parent().parent().prop("id");
        var name = $(this).parent().parent().next().html();
        var type = $(this).parent().parent().next().next().html();
        ruleListToDelete.push({ 'limitationId': limitationId, 'limitationName': name, 'limitType': type });
      });
    }
    if (ruleListToDelete.length != 0) {
      var ruleListJson = JSON.stringify(ruleListToDelete);
      deleteQOSRules(ruleListJson, "false");
    }

  }
  String.prototype.getQuery = function (name) {
    var reg = new RegExp("(\\{|(,\\s*))" + name + "=\\S*(,|\\})");
    var r = this.substr(this.indexOf("\{")).match(reg);
    var m = r[0].substring(r[0].indexOf("=") + 2);
    m = m.substr(0, m.length - 2);
    if (m != null) return m; return null;
  }
  var backData = [];
  $scope.doDeleteRB = function () {
    var ruleListToDelete = [];
    $("input[name='rbCheckbox']:checked").each(function (index, checkbox) {
      var ruleId = $(this).parents("tr").prop("id");
      ruleListToDelete.push(ruleId);
    });

    $http({
      async: false,
      method: "post",
      data: {
        'idsJson': JSON.stringify(ruleListToDelete)
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      url: "deleteRebalanceRule",
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(data) {
      data = data.data;
      if (data.resultMessage.message != "success") {
        if (data.resultMessage.message == "ERROR_0019_SessionOut") {
          showMessage.show($scope, "warn", translate.getWord("session.out"));
          $scope.logout();
        } else {
          showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
        }
      } else {
        showMessage.show($scope, "success", translate.getWord("response.success"));
      }
      vm.dtInstanceRB.reloadData(null, false);
    })
  }
  function deleteQOSRules(ruleListJson, isConfirmString) {
      $http({
        async: false,
        method: "post",
        data: { "commit": isConfirmString, "ioLimitationsJson": ruleListJson },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        url: "deleteIOLimitations",
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      }).then(function successCallback(data) {
        data = data.data;
        if (isConfirmString == "true") {
          if (data.resultMessage.message != "success") {
            if (data.resultMessage.message == "ERROR_0019_SessionOut") {
              showMessage.show($scope, "warn", translate.getWord("session.out"));
              $scope.logout();
            } else {
              showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
            }
          } else {
            showMessage.show($scope, "success", translate.getWord("response.success"));
          }
          vm.dtInstanceIO.reloadData(null, false);
          return;
        }
        if (data.beAppliedIOLimitation2Drivers) {
          var warningMessage = "这些IO应用于某些驱动，您确定要删除它们吗？";
          var ioArr = [];
          $.map(data.beAppliedIOLimitation2Drivers, function (k, v) {
            ioArr = [];
            for (var i = 0; i < k.length; i++) {
              var a = k[i].driverType;
              var b = k[i].driverContainerIp;
              var c = k[i].host;
              ioArr.push(b + "(" + (a == "NBD" ? "PYD" : a) + "):" + c + "<br/>")
            }

            warningMessage += "<div class='deleteNames'>" + v.getQuery("limitationName") + "&nbsp;" + translate.getWord("apply.to") + "&nbsp;" + ioArr.join(",") + "</div>";
          });

          newConfirm(translate.getWord("disk.operation.confirm"), warningMessage, function (rt) {
            if (rt) {
              deleteQOSRules(ruleListJson, "true");
            }
          }, translate.getWord("button.confirm"), translate.getWord("button.cancel"))
        } else {
          if (data.resultMessage.message != "success") {
            if (data.resultMessage.message == "ERROR_0019_SessionOut") {
              showMessage.show($scope, "warn", translate.getWord("session.out"));
              $scope.logout();
            } else {
              showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
            }
          } else {
            showMessage.show($scope, "success", translate.getWord("response.success"));
          }
          vm.dtInstanceIO.reloadData(null, false);
          return;
        }
      });
  }
  

  function timeToSecond(t) {
    var timeArr = t.split(":");
    return (timeArr[0] * 60 + timeArr[1] * 1) * 60
  }
  function secondToTime(t, f) {
    if (f) {
      var allMin = parseInt(t / 60);
      return addZero(parseInt(allMin / 60)) + ":" + addZero(allMin % 60);
    } else {
      var allMin = parseInt(t / 60);
      return parseInt(allMin / 60) + "小时" + allMin % 60 + "分钟";
    }
  }
  function addZero(t) {
    if (t < 10) {
      return "0" + t;
    } else {
      return t
    }
  }

  $scope.checkNonnegativeNumber = function (e, flag) {
    if (flag) {
      var reg = /^(?![^12].)(?!2[5-9])[1-9]\d?$/;
      e.target.value = e.target.value.match(reg);
    } else {
      var reg = /^[1-5]?[0-9]$/;
      e.target.value = e.target.value.match(reg);
    }

  }
  $scope.addRB = function () {
    $("#waitHourRB").val($("#waitHourRB").val() || "0");
    $("#waitMinRB").val($("#waitMinRB").val() || "0");


    let a, b, c, d, e, f;
    let tempArr = [];
    for (var i = 0; i < $("#rbContainer .rbmark").size(); i++) {
      a = $(".rbmark").eq(i).find(".addST").val() ? timeToSecond($(".rbmark").eq(i).find(".addST").val()) : "0";
      b = $(".rbmark").eq(i).find(".addET").val() ? timeToSecond($(".rbmark").eq(i).find(".addET").val()) : "0";
      tempArr.push({ 'beginTime': a, 'endTime': b })
    }



    $http({
      method: "post",
      data: {
        ruleName: $scope.createRB.RBruleName,
        waitTime: ($("#waitHourRB").val() * 60 + $("#waitMinRB").val() * 1) * 60,
        absoluteTimeJson: JSON.stringify(tempArr)
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      url: "addRebalanceRule",

      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(data) {
      data = data.data;
      if (data.resultMessage.message != "success") {
        if (data.resultMessage.message == "ERROR_0019_SessionOut") {
          showMessage.show($scope, "warn", translate.getWord("session.out"));
          $scope.logout();
        } else {
          showMessage.show($scope, "error", translate.getWord(data.resultMessage.message));
          return;
        }
      } else {
        vm.dtInstanceRB.reloadData(null, false);
      }
    });
  }

  $scope.getDeleteNames = function () {
    var ruleNameListToDelete = [];
    var k;
    if ($scope.showFlag == 2) {
      k = 'ruleCheckbox';
    } else if ($scope.showFlag == 1) {
      k = 'ioCheckbox';
    } else if ($scope.showFlag == 3) {
      k = 'rbCheckbox';
    }
    $("input[name=" + k + "]:checked").each(function (index, checkbox) {
      var $ruleName = $(this).parent().parent().next().html();
      ruleNameListToDelete.push($ruleName);
    });
    if (ruleNameListToDelete.length != 0) {
      $scope.deleteNames = ruleNameListToDelete.join(",");
    }
  }
  function toggleAll(selectAll, selectedItems) {
    for (var id in selectedItems) {
      if (selectedItems.hasOwnProperty(id)) {
        selectedItems[id] = selectAll;
        $('#checkbox_' + id).prop('checked',selectAll);
      }
    }
    for (var id in selectedItems) {
      if (selectedItems[id] && $('#checkbox_' + id).prop('checked')) {
        $('#deleteRules').prop("disabled", false)
        $('#deleteIO').prop("disabled", false)
        $('#deleteRB').prop("disabled", false)
        break;
      } else {
        $('#deleteRules').prop("disabled", true)
        $('#deleteIO').prop("disabled", true)
        $('#deleteRB').prop("disabled", true)
      }

    }
  }

  function toggleOne(selectedItems) {
    for (var id in selectedItems) {
      if (selectedItems[id]) {
        $('#deleteRules').prop("disabled", false)
        $('#deleteIO').prop("disabled", false)
        $('#deleteRB').prop("disabled", false)
        break;
      } else {
        $('#deleteRules').prop("disabled", true)
        $('#deleteIO').prop("disabled", true)
        $('#deleteRB').prop("disabled", true)
      }
    }
    var t = 0;
    var s = 0;
    if ($scope.showFlag == 2) {
      for (var id in selectedItems) {
        if (selectedItems.hasOwnProperty(id)) {
          var name = $(".table-one").find("#" + id).children("td").eq("1").html();
          if (name) {
            t++;
          }
          if (!selectedItems[id]) {
            vm.selectAll = false;
            $('#' + id).removeClass("active")
          } else {
            s++;
            $('#' + id).addClass("active")
          }
        }
      }
      if (s > 0) {
        if (s == t) {
          vm.selectAll = true;
          $('#chkAllBtn').prop('checked',true)
        } else {
          vm.selectAll = false;
          $('#chkAllBtn').prop('checked',false)
        }

      }

    } else if ($scope.showFlag == 1) {
      for (var id in selectedItems) {
        if (selectedItems.hasOwnProperty(id)) {
          var name = $(".table-two").find("#" + id).children("td").eq("2").html();

          if (name) {
            t++;
          }
          if (!selectedItems[id]) {
            vm.selectAllIO = false;
            $('#' + id).removeClass("active")
          } else {
            $('#' + id).addClass("active")
            s++;
          }
        }
      }
      if (s > 0) {
        if (s == t) {
          vm.selectAllIO = true;
          $('#chkAllBtnIO').prop('checked',true)
        } else {
          vm.selectAllIO = false;
          $('#chkAllBtnIO').prop('checked',false)
        }

      }
    } else if ($scope.showFlag == 3) {
      for (var id in selectedItems) {
        if (selectedItems.hasOwnProperty(id)) {
          var name = $(".table-three").find("#" + id).children("td").eq("1").html();

          if (name) {
            t++;
          }
          if (!selectedItems[id]) {
            vm.selectAllRB = false;
            $('#' + id).removeClass("active")
          } else {
            $('#' + id).addClass("active")
            s++;
          }
        }
      }
      if (s > 0) {
        if (s == t) {
          vm.selectAllRB = true;
          $('#chkAllBtnRB').prop('checked',true)
        } else {
          vm.selectAllRB = false;
          $('#chkAllBtnRB').prop('checked',false)
        }

      }
    }
  }
  $scope.addIOModel = function () {
    if ($scope.hideEditSelect == 'Static') {
      $("#ruleContainer").append($compile($(".iomodel2").html())($scope))
    } else {
      $("#ruleContainer").append($compile($(".iomodel1").html())($scope))
      $('.dynamicTime').clockpicker()
    }
  }
  $scope.modifyIOModel = function () {
    if ($scope.modifyType == 'Static') {
      $("#ruleContainerModify").append($compile($(".iomodel2").html())($scope))
    } else {
      $("#ruleContainerModify").append($compile($(".iomodel1").html())($scope))
      $('.dynamicTime').clockpicker()
      var temp = $('#ruleContainerModify').children('.iomark')
      if (temp.length == 1) return
      for (let i = 0; i < temp.length; i++) {
        $(temp[i]).find('.pull-right').attr('disabled', false)
      }
    }
  }
  $scope.typeSwitch = function () {
    $("#ruleContainer").html("")
    if ($scope.hideEditSelect == 'Static') {
      $("#ruleContainer").append($(".iomodel2").html())
    }
  }
  function toggleAllAC(str, selectAll, selectedItems) {
    for (var id in selectedItems) {
      if (selectedItems.hasOwnProperty(id)) {
        var name = "";
        if (str == "cancelIO") {
          name = $("#cancelIOTab").find("#" + id).children("td").eq("1").html();
        } else if (str == "cancel") {
          name = $("#cancelTab").find("#" + id).children("td").eq("1").html();
        } else if (str == "apply") {
          name = $("#applyTab").find("#" + id).children("td").eq("1").html();
        } else if (str == "applyIO") {
          name = $("#applyIOTab").find("#" + id).children("td").eq("1").html();
        } else if (str == "cancelRB") {
          name = $("#cancelRBTab").find("#" + id).children("td").eq("1").html();
        } else if (str == "applyRB") {
          name = $("#applyRBTab").find("#" + id).children("td").eq("1").html();
        }

        if (name) {
          selectedItems[id] = selectAll;
        }
      }

    }
    $scope.clickEvt()
  }
  function toggleOneAC(str, selectedItems) {
    var s = 0;
    if (str == "apply") {
      for (var id in selectedItems) {
        if ($("#" + id)) {
          if (!selectedItems[id]) {
            vm.selectAllApply = false;
          } else {
            s++;
          }
        }
      }
      if (s == $('input[name=applyTips]').size()) {
        vm.selectAllApply = true;
      } else {
        vm.selectAllApply = false;
      }
    } else if (str == "cancel") {
      for (var id in selectedItems) {

        if ($("#" + id)) {
          if (!selectedItems[id]) {
            vm.selectAllCancel = false;
          } else {
            s++;
          }
        }
      }
      if (s == $('input[name=cancelTips]').size()) {
        vm.selectAllCancel = true;
      } else {
        vm.selectAllCancel = false;
      }
    }
    if (str == "applyIO") {
      for (var id in selectedItems) {

        if ($("#" + id)) {
          if (!selectedItems[id]) {
            vm.selectAllApplyIO = false;
          } else {
            s++;
          }
        }
      }
      if (s == $('input[name=applyIOTips]').size()) {
        vm.selectAllApplyIO = true;
      } else {
        vm.selectAllApplyIO = false;
      }
    } else if (str == "cancelIO") {
      for (var id in selectedItems) {

        if ($("#" + id)) {
          if (!selectedItems[id]) {
            vm.selectAllCancelIO = false;
          } else {
            s++;
          }
        }
      }
      if (s == $('input[name=cancelIOTips]').size()) {
        vm.selectAllCancelIO = true;
      } else {
        vm.selectAllCancelIO = false;
      }
    }
    if (str == "applyRB") {
      for (var id in selectedItems) {
        if ($("#" + id)) {
          if (!selectedItems[id]) {
            vm.selectAllRBApply = false;
          } else {
            s++;
          }
        }
      }
      if (s == $('input[name=applyRBTips]').size()) {
        vm.selectAllRBApply = true;
      } else {
        vm.selectAllRBApply = false;
      }
    } else if (str == "cancelRB") {
      for (var id in selectedItems) {

        if ($("#" + id)) {
          if (!selectedItems[id]) {
            vm.selectAllRBCancel = false;
          } else {
            s++;
          }
        }
      }
      if (s == $('input[name=cancelRBTips]').size()) {
        vm.selectAllRBCancel = true;
      } else {
        vm.selectAllRBCancel = false;
      }
    }
    $scope.clickEvt()
  }
  $scope.clickEvt = function () {
    if ($scope.showFlag == 2) {
      vm.applyQOS = true;
      vm.cancelQOS = true;
      for (var id in vm.selectedApply) {
        if ($("#" + id)) {
          if (vm.selectedApply[id]) {
            vm.applyQOS = false;
          }
        }
      }
      for (var id in vm.selectedCancel) {
        if ($("#" + id)) {
          if (vm.selectedCancel[id]) {
            vm.cancelQOS = false;
          }
        }
      }
    } else if ($scope.showFlag == 1) {
      vm.applyIO = true;
      vm.cancelIO = true;
      for (var id in vm.selectedApplyIO) {
        if ($("#" + id)) {
          if (vm.selectedApplyIO[id]) {
            vm.applyIO = false;
          }
        }
      }
      for (var id in vm.selectedCancelIO) {
        if ($("#" + id)) {
          if (vm.selectedCancelIO[id]) {
            vm.cancelIO = false;
          }
        }
      }
    } else if ($scope.showFlag == 3) {

      vm.applyRB = true;
      vm.cancelRB = true;
      for (var id in vm.selectedRBApply) {
        if ($("#" + id)) {
          if (vm.selectedRBApply[id]) {
            vm.applyRB = false;
          }
        }
      }
      for (var id in vm.selectedRBCancel) {
        if ($("#" + id)) {
          if (vm.selectedRBCancel[id]) {
            vm.cancelRB = false;
          }
        }
      }
    }
  }

  $scope.resetCreate = function () {
    $scope.create = { QOSName: "" };
    $scope.iops = { limitationName: "" };
    $scope.iopsForm.$setPristine();
    $scope.iopsForm.$setUntouched();
    $("#ruleContainer").html($(".iomodel2").html());
    $("#limitationName").val("");
    $scope.strategy = "";
    $("#strategy").selectpicker("val", '');
    $("#strategy").selectpicker("refresh");
    $scope.mode = "";
    $("#mode").selectpicker("val", '');
    $("#mode").selectpicker("refresh");
    $("#tacticsBusinessCreateWrap").html($compile('<input data-smart-uislider type="text" class="slider slider-primary" id="tacticsBusinessCreate" value="" data-slider-min="1" data-slider-max="100" data-slider-value="1"  data-slider-selection = "before" data-slider-handle="squar" data-slider-tooltip = "show" style="padding: 0 5px"><span class="pull-left" style="margin-top: -30px;color: #999">1</span><span class="pull-right" style="margin-top: -30px;color: #999">100</span>')($scope));
    $scope.hideEditSelect = 'Static';
    $("#limitType").selectpicker("val", 'Static');
    $("#limitType").selectpicker("refresh");
    $("#tacticsBusinessCreateInput").val("1");
    $("#ignoreMissPagesAndLogs").prop("check", false);

  }
  $scope.resetCreateRB = function () {
    $scope.createRB = { RBruleName: "" };
    $scope.createRBForm.$setPristine();
    $scope.createRBForm.$setUntouched();
    $scope.waitMinRB = "";
    $scope.waitHourRB = "";
    $("#rbContainer").html("")
  }
  $scope.doFocus = function (id) {
    focus(id)
  }


  $scope.reloadBalance = function () {
    vm.dtInstanceRB.reloadData(null, false);
    getRebalanceSignal();
  }
  $scope.addAbsoluteTime = function () {
    $("#rbContainer").append($compile(rebalanceStr)($scope));
    $('.rbTime').clockpicker()
  }
  $scope.switchChange = function () {

    if ($(".bootstrap-switch").hasClass("bootstrap-switch-off")) {

      $http({
        method: "post",
        async: false,
        url: "startAutoRebalance",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      }).then(function successCallback(response) {
        if (response.data.resultMessage.message == "success") {
          getRebalanceSignal();

        }

      }, function errorCallback(response) {

      });


    } else {

      $http({
        method: "post",
        async: false,
        url: "pauseAutoRebalance",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      }).then(function successCallback(response) {
        if (response.data.resultMessage.message == "success") {
          getRebalanceSignal();

        }

      }, function errorCallback(response) {

      });
    }
  }
  function getRebalanceSignal() {
    $http({
      method: "post",
      async: false,
      url: "rebalanceStarted",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(response) {
      if (response.data.rebalanceStarted) {
        $(".bootstrap-switch").removeClass("bootstrap-switch-off").addClass("bootstrap-switch-on")
      } else {
        $(".bootstrap-switch").removeClass("bootstrap-switch-off").addClass("bootstrap-switch-off")
      }
    }, function errorCallback(response) {

    });
  }
});

function removeIOModel(obj, e) {

  $(obj).parent().parent().parent().remove()
  var temp = $('#ruleContainerModify').children('.iomark')
  if (temp.length == 1) {
    $(temp[0]).find('.pull-right').attr('disabled', true)
    return
  }
  for (let i = 0; i < temp.length; i++) {
    $(temp[i]).find('.pull-right').attr('disabled', false)
  }
}
function checkNonnegativeNumber(e) {
  e.value = e.value.replace(/\D/g, '');
  if (e.value.length != 1) {
    if ($(e).val().split("")[0] * 1 == 0) {
      $(e).val($(e).val() * 1)
    }
  }
}
function checkPositiveNumber(e) {

  if (e.value.length == 1) {
    e.value = e.value.replace(/[^1-9]/g, '')
  } else {
    e.value = e.value.replace(/\D/g, '');
  }
}
function checkTransSpend(e) {

  if (e.value.length == 1) {
    e.value = e.value.replace(/[^1-9]/g, '')
  } else {
    e.value = e.value.replace(/\D/g, '');
  }
  if (e.value * 1 > 100) {
    e.value = e.value.substr(0, 2)
  }
}
function debounce(fn, delay = 1000) {
  var timer
  return function () {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn()
    }, delay);
  }
}
function throttle(fn, delay = 1000) {
  var timer
  return function () {
    if (!timer) {
      timer = setTimeout(() => {
        fn()
        timer = null
      }, delay);
    }
  }
}

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

angular
  .module("app.storage")
  .controller(
    "VolumeCtrl",
    function (
      focus,
      $rootScope,
      $scope,
      $interval,
      $http,
      DTOptionsBuilder,
      showMessage,
      goPage,
      DTColumnBuilder,
      $compile,
      translate,
      $stateParams,
      $state
    ) {
      $(".modal").draggable();
      var vm = this;
      var isCreate = false;
      var newVolumeId;
      $scope.volumeDetailShowFlag = false;
      $scope.domainGroups = [{ value: "", txt: "请选择一个域" }];
      $scope.domainPools = [{ value: "", txt: "请选择一个存储池" }];
      $scope.$watch("$viewContentLoaded", function (event) {
        if ($stateParams.volumeName && volumeSwitch) {
          volumeSwitch = false;
          $("#volumeTab").DataTable().search($stateParams.volumeName).draw();
        }
      });
      $scope.volumeNameForPod = "";
      $scope.showFlag = 1;
      $scope.segmentSize = 0;
      $scope.choosedName = "";
      vm.toggleAll = toggleAll;
      vm.toggleOne = toggleOne;
      vm.selected = {};
      vm.selectAll = false;
      vm.selectedT = {};
      vm.selectAllT = false;
      var refreshIds = [];
      var choosedId = [""];
      var selectedNames = [];
      var selectedIds = [];
      var selectedSize = [];
      var volumeIntervalTimer;
      var timeFlag = true;
      var volumeSwitch = true;
      var statusLevel = $stateParams.statusLevel;
      var level = $("#tabStatus").val() || "";
      if (statusLevel != "") {
        level = statusLevel;
      }
      var selectStr =
        '<span style="margin-left:10px;float:right !important"><select data-width="100px" class="selectpicker " id="tabStatus" style="background-color: white;"  name="mySelect"  >' +
        '<option value="" >所有状态</option>' +
        '<option value="HEALTHY" >健康状态</option>' +
        '<option value="WRONG" >错误状态</option>' +
        "</select></span>";

      $scope.$watch(
        "createDes",
        function (newValue, oldValue, scope) {
          var len = 0;
          var l;
          if (newValue) {
            for (var i = 0; i < newValue.length; i++) {
              l = newValue.charCodeAt(i);
              if (l >= 0 && l <= 128) {
                len += 1;
              } else {
                len += 2;
              }
            }
          }
          $scope.desLong = len > 128;
        }
      );


      vm.dtOptions = DTOptionsBuilder.newOptions()
        .withDOM(
          "<'dt-toolbar'<'col-xs-12 col-sm-3'l><'col-sm-9 col-xs-12 hidden-xs'f>r>" +
            "t" +
            "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>"
        )
        .withBootstrap()
        .withOption("ajax", {
          data: {
            statusLevel: level,
          },
          url: BASE_API + "listVolumeDT",
          dataSrc: function (data) {
            vm.selected = {};
            vm.selectAll = false;
            if (data.resultMessage.message != "success") {
              if (data.resultMessage.message == "ERROR_0019_SessionOut") {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord("session.out")
                );
                $scope.logout();
              } else {
                return [];
              }
            } else {
              return data.data;
            }
          },
          type: "POST",
        })
        .withOption("processing", false)
        .withOption("serverSide", true)
        .withOption("pageLength", 20)
        .withOption("createdRow", function (row, data, dataIndex) {
          $compile(angular.element(row).contents())($scope);
        })
        .withOption("headerCallback", function (header) {
          $compile(angular.element(header).contents())($scope);
        })
        .withOption("fnInitComplete", function (result) {
          $(selectStr).insertBefore($("#volumeTab_filter label"));
          $("#tabStatus").unbind();
          $("#tabStatus").bind("change", function () {
            level = $("#tabStatus").val() || "";
            vm.dtInstance.changeData({
              data: {
                statusLevel: level,
                randomData: Math.random(),
              },
              url: "listVolumeDT",
              dataSrc: function (data) {
                vm.selected = {};
                vm.selectAll = false;
                if (data.resultMessage.message != "success") {
                  if (data.resultMessage.message == "ERROR_0019_SessionOut") {
                    showMessage.show(
                      $scope,
                      "error",
                      translate.getWord("session.out")
                    );
                    $scope.logout();
                  }
                } else {
                  return data.data;
                }
              },
              type: "POST",
            });
          });
          $("#tabStatus").selectpicker("val", level);
          $(".selectpicker").selectpicker("render");
        })
        .withOption("fnDrawCallback", function (result) {
          $("#checkedAll").prop("checked", false);
          $(".selectpicker").selectpicker("render");
          $("#volumeTab_filter").find("input").addClass("filter_input");
          $(".volumeClearItem").remove();
          $(
            '<i class="fa fa-times-circle item-error-style volumeClearItem" onclick="clearFilter(\'' +
              "volumeTab_filter" +
              "')\"></i>"
          ).insertAfter($("#volumeTab_filter").find("input"));
          if ($("#volumeTab_filter").find("input").val() == "") {
            $(".volumeClearItem").hide();
          } else {
            $(".volumeClearItem").show();
          }
          $("#volumeTab_filter").find("input").unbind("keyup", showItem);
          $("#volumeTab_filter")
            .find("input")
            .bind("keyup", { cName: "volumeClearItem" }, showItem);
          $(".volumeClearItem").click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            $("#volumeTab").DataTable().search("").draw();
          });
          refreshIds = [];
          if (result.json.data) {
            $.each(result.json.data, function (i, value) {
              if (
                value.migrationRatio != "100.0" ||
                value.rebalanceRatio * 1 != 1 ||
                value.volumeStatus == "CREATING" ||
                value.volumeStatus == "EXTENDING" ||
                value.volumeStatus == "DELETING" ||
                value.volumeStatus == "RECYCLING" ||
                value.volumeStatus == "FIXING" ||
                value.volumeStatus == "MOVING" ||
                value.volumeStatus == "CLONING" ||
                value.volumeStatus == "BEING_CLONED" ||
                value.volumeStatus == "BEING_MOVED" ||
                value.volumeStatus == "COPING" ||
                value.volumeStatus == "BEING_COPIED" ||
                value.volumeStatus == "Deleted"
              ) {
                refreshIds.push(value.volumeId);
              }
            });
          }
          clickEvent("checkedAll");
          if (refreshIds.length > 0) {
            $interval.cancel(volumeIntervalTimer);
            volumeIntervalTimer = $interval(volumeInterval, 5000);
          } else {
            $interval.cancel(volumeIntervalTimer);
          }
          goPage.goTo("volumeTab");
          if (result.json.data.length && result.json.data.length != 0) {
            $("#volumeTab_paginate").show();
          } else {
            $("#volumeTab_paginate").hide();
          }
        })
        .withOption("rowId", "volumeId")
        .withLanguage({
          search: "",
          searchPlaceholder: "查询卷名称",
          aria: {
            sortAscending: ": activate to sort column ascending",
            sortDescending: ": activate to sort column descending",
          },
          emptyTable: "表中数据为空",
          info: "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
          infoEmpty: "显示第 0 至 0 项结果，共 0 项",
          order: [[2, "asc"]],
          infoFiltered: "(由 _MAX_ 项结果过滤)",
          zeroRecords: "表中数据为空",
          lengthMenu:
            "显示" +
            '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
            '<option value="5" >5条</option>' +
            '<option value="10" >10条</option>' +
            '<option value="20" >20条</option>' +
            '<option value="50" >50条</option>' +
            '<option value="100" >100条</option>' +
            "</select>",
        });

      vm.dtColumns = [
        DTColumnBuilder.newColumn("volumeId").withTitle("ID").notVisible(),
        DTColumnBuilder.newColumn(null)
          .notSortable()
          .withClass("checkbox_col")
          .withTitle(
            "<span class='check_span'><input type='checkbox' class='input_check' id='checkedAll' ng-model='datatables.selectAll' ng-click='datatables.toggleAll(datatables.selectAll,datatables.selected)' value='0' id='selectAllVolume'><label for='checkedAll'></label></span>"
          )
          .renderWith(function (data, type, row) {
            vm.selected[row.volumeId] = false;
            return (
              '<span class="check_span"><input  ng-model="datatables.selected[\'' +
              row.volumeId +
              '\'];" name="volumeChecked" ng-click="datatables.toggleOne(\'' +
              "checkedAll" +
              "',datatables.selected,'" +
              row.volumeId +
              '\')" type="checkbox" class="input_check" id="checkbox_' +
              row.volumeId +
              '"><label for="checkbox_' +
              row.volumeId +
              '"></label></span>'
            );
          }),
        DTColumnBuilder.newColumn("volumeName")
          .withTitle("卷名称")
          .renderWith(function (data, type, row) {
            return (
              "<a ng-click='goPerformanceData(\"" +
              row.volumeId +
              "\")' title='查看卷详情' size='" +
              row.volumeSize +
              "'>" +
              data +
              "</a>"
            );
          }),
        DTColumnBuilder.newColumn("description").withTitle("描述"),
        DTColumnBuilder.newColumn(null).notVisible(),
        DTColumnBuilder.newColumn(null).notVisible(),
        DTColumnBuilder.newColumn(null).notVisible(),
        DTColumnBuilder.newColumn("volumeSize")
          .withTitle("总容量")
          .renderWith(function (data, type, row) {
            return (row.volumeSize / 1024).toFixed(1) + "GB";
          }),
        DTColumnBuilder.newColumn("usedSize")
          .withTitle("已用容量")
          .renderWith(function (data, type, row) {
            return (
              (
                (row.volumeSize * 1 - row.volumeSize * row.freeSpaceRatio) /
                1024
              ).toFixed(1) + "GB"
            );
          }),
        DTColumnBuilder.newColumn(null).notVisible(),
        DTColumnBuilder.newColumn("volumeStatus")
          .withTitle("状态")
          .withOption("className", "volumeStatus")
          .renderWith(function (data, type, row) {
            return $scope.chooseVolumeStatus(data);
          }),
        DTColumnBuilder.newColumn("volumeDomain")
          .withTitle("所属域")
          .renderWith(function (data, type, row) {
            return (
              "<a ng-click='jumpToDomain(\"" +
              row.domainId +
              "\")' title='查看域详情'>" +
              data +
              "</a>"
            );
          }),
        DTColumnBuilder.newColumn("storagePoolName")
          .withTitle("所属存储池")
          .renderWith(function (data, type, row) {
            return (
              "<a ng-click='jumpToPool(\"" +
              row.poolId +
              '","' +
              row.domainId +
              '","' +
              row.volumeDomain +
              "\")' title='查看存储池详情'>" +
              data +
              "</a>"
            );
          }),
        DTColumnBuilder.newColumn(null).notVisible(),
        DTColumnBuilder.newColumn(null).notVisible(),
        DTColumnBuilder.newColumn("createTime")
          .withTitle("创建时间")
          .renderWith(function (data, type, row) {
            return fillDate(data);
          }),
        DTColumnBuilder.newColumn("migrationSpeed")
          .withTitle("重构")
          .withOption("className", "migrationSpeed")
          .notSortable()
          .renderWith(function (data, type, row) {
            var string = "";
            var speed = "";
            if (data >= 1024) {
              speed = speed + (data / 1024).toFixed(1) + "M/s";
            } else {
              speed = speed + data + "K/s";
            }
            if (row.migrationRatio == "100.0") {
              string = string + "无重构";
            } else {
              var str = "重构中" + "(" + speed + ")";
              string =
                string +
                '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar"  style="width: 100%" ><span>' +
                str +
                "</span></div></div>";
            }
            return row.volumeStatus == "CREATING" ? "无重构" : string;
          }),
        DTColumnBuilder.newColumn("rebalanceRatio")
          .notSortable()
          .withTitle("Rebalance进度")
          .withOption("className", "rebalanceRatio")
          .renderWith(function (data, type, row) {
            if (data * 1 == 1) {
              return "无进度";
            } else {
              return (
                '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" title="版本号: ' +
                row.rebalanceVersion +
                '" style="width: 100%" ><span>' +
                parseInt(data * 100) +
                "%</span></div></div>"
              );
            }
          }),
        DTColumnBuilder.newColumn("volumeBuildType")
          .notSortable()
          .withTitle("创建类型")
          .renderWith(function (data, type, row) {
            var resultString = "";
            switch (data) {
              case "CLONE":
                resultString = "克隆";
                break;
              case "CREATE":
                resultString = "创建";
                break;
              case "MOVE":
                resultString = "迁移";
                break;
              case "MOVE_ONLINE":
                resultString = "在线迁移";
                break;
              case "SYNC_CLONE":
                resultString = "克隆";
                break;
              case "LINKED_CLONE":
                resultString = "链接克隆";
                break;
            }
            return resultString;
          }),
        DTColumnBuilder.newColumn(null)
          .withTitle("操作")
          .renderWith(function (data, type, row) {
            var infoString;
            if (
              !$rootScope.apis.Volume ||
              !(
                $rootScope.apis.Volume.cloneVolume ||
                $rootScope.apis.Volume.moveVolume ||
                $rootScope.apis.Volume.copyVolumeToExistVolume ||
                $rootScope.apis.Volume.fixVolume ||
                $rootScope.apis.Volume.createSnapshotVolume
              )
            ) {
              return;
            }
            if (row.volumeStatus != "Deleted") {
              infoString =
                '<div class="btn-group dropdown-btn"  >' +
                '<button type="button" class="btn btn_lightblue btn-xs my-drop-down" ng-click="showDown(\'' +
                row.volumeId +
                '\');$event.stopPropagation();">操作 <span class="caret"></span></button>' +
                '<ul class="down" style="min-width:110px;">' +
                '<li><a data-toggle="modal" data-target="#move_trash_modal" ng-click="moveToTrash(\'' +
                row.volumeId +
                "','" +
                row.volumeName +
                "','" +
                "')\">" +
                "放入回收站" +
                "</a></li>"
                 +
                '<li><a ng-if="volumeDetailShowFlag" ng-click="goDetail(\'' +
                row.volumeId +
                "')\">查看详细</a></li>" + "</ul></div>";
            } else {
              infoString =
                '<div class="btn-group dropdown-btn"  >' +
                '<button type="button" class="btn btn_lightblue btn-xs my-drop-down"   ng-click="showDown(\'' +
                row.volumeId +
                '\');$event.stopPropagation();">操作 <span class="caret"></span></button>' +
                '<ul class="down" style="min-width:110px;">' + 
                "</ul></div>";
            }
            return infoString;
          })
          .notSortable(),
      ];

      vm.dtOptionsTrash = DTOptionsBuilder.newOptions()
        .withDOM(
          "<'dt-toolbar'<'col-xs-12 col-sm-3'l><'col-sm-9 col-xs-12 hidden-xs'f>r>" +
            "t" +
            "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>"
        )
        .withBootstrap()
        .withOption("ajax", {
          data: {
          },
          url: BASE_API + "listRecycleVolumeInfo",
          dataSrc: function (data) {
            vm.selectedT = {};
            vm.selectAllT = false;
            if (data.resultMessage.message != "success") {
              if (data.resultMessage.message == "ERROR_0019_SessionOut") {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord("session.out")
                );
                $scope.logout();
              } else {
                return [];
              }
            } else {
              return data.data;
            }
          },
          type: "POST",
        })
        .withOption("processing", false)
        .withOption("serverSide", true)
        .withOption("pageLength", 20)
        .withOption("createdRow", function (row, data, dataIndex) {
          $compile(angular.element(row).contents())($scope);
        })
        .withOption("headerCallback", function (header) {
          $compile(angular.element(header).contents())($scope);
        })

        .withOption("fnInitComplete", function (result) {})
        .withOption("fnDrawCallback", function (result) {
          $("#checkedAllT").prop("checked", false);
          $(".selectpicker").selectpicker("render");

          $("#volumeTrashTab_filter").find("input").addClass("filter_input");
          $(".volumeClearItem").remove();
          $(
            '<i class="fa fa-times-circle item-error-style volumeClearItem" onclick="clearFilter(\'' +
              "volumeTrashTab_filter" +
              "')\"></i>"
          ).insertAfter($("#volumeTrashTab_filter").find("input"));
          if ($("#volumeTrashTab_filter").find("input").val() == "") {
            $(".volumeClearItem").hide();
          } else {
            $(".volumeClearItem").show();
          }
          $("#volumeTrashTab_filter").find("input").unbind("keyup", showItem);
          $("#volumeTrashTab_filter")
            .find("input")
            .bind("keyup", { cName: "volumeClearItem" }, showItem);
          $(".volumeClearItem").click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            $("#volumeTrashTab").DataTable().search("").draw();
          });

          refreshIds = [];
          if (result.json.data) {
            $.each(result.json.data, function (i, value) {
              if (
                value.migrationRatio != "100.0" ||
                value.rebalanceRatio * 1 != 1 ||
                value.volumeStatus == "CREATING" ||
                value.volumeStatus == "EXTENDING" ||
                value.volumeStatus == "DELETING" ||
                value.volumeStatus == "RECYCLING" ||
                value.volumeStatus == "FIXING" ||
                value.volumeStatus == "MOVING" ||
                value.volumeStatus == "CLONING" ||
                value.volumeStatus == "BEING_CLONED" ||
                value.volumeStatus == "BEING_MOVED" ||
                value.volumeStatus == "COPING" ||
                value.volumeStatus == "BEING_COPIED" ||
                value.volumeStatus == "Deleted"
              ) {
                refreshIds.push(value.volumeId);
              }
            });
          }
          clickEvent("checkedAll");
          if (refreshIds.length > 0) {
            $interval.cancel(volumeIntervalTimer);
            volumeIntervalTimer = $interval(volumeInterval, 5000);
          } else {
            $interval.cancel(volumeIntervalTimer);
          }
          goPage.goTo("volumeTrashTab");
          if (result.json.data.length && result.json.data.length != 0) {
            $("#volumeTrashTab_paginate").show();
          } else {
            $("#volumeTrashTab_paginate").hide();
          }
        })
        .withOption("rowId", "volumeId")
        .withLanguage({
          search: "",
          searchPlaceholder: "查询卷名称",
          aria: {
            sortAscending: ": activate to sort column ascending",
            sortDescending: ": activate to sort column descending",
          },
          emptyTable: "表中数据为空",
          info: "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
          infoEmpty: "显示第 0 至 0 项结果，共 0 项",
          order: [[2, "asc"]],
          infoFiltered: "(由 _MAX_ 项结果过滤)",
          zeroRecords: "表中数据为空",
          lengthMenu:
            "显示" +
            '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
            '<option value="5" >5条</option>' +
            '<option value="10" >10条</option>' +
            '<option value="20" >20条</option>' +
            '<option value="50" >50条</option>' +
            '<option value="100" >100条</option>' +
            "</select>",
        });
      vm.dtColumnsTrash = [
        DTColumnBuilder.newColumn("volumeId").withTitle("ID").notVisible(),
        DTColumnBuilder.newColumn(null)
          .notSortable()
          .withClass("checkbox_col")
          .withTitle(
            "<span class='check_span'><input type='checkbox' class='input_check' id='checkedAllT' ng-model='datatables.selectAllT' ng-click='datatables.toggleAll(datatables.selectAllT,datatables.selectedT)' value='0' id='selectAllVolume'><label for='checkedAllT'></label></span>"
          )
          .renderWith(function (data, type, row) {
            vm.selectedT[row.volumeId] = false;
            return (
              '<span class="check_span"><input  ng-model="datatables.selectedT[\'' +
              row.volumeId +
              '\'];" name="volumeChecked" ng-click="datatables.toggleOne(\'' +
              "checkedAllT" +
              "',datatables.selectedT,'" +
              row.volumeId +
              '\')" type="checkbox" class="input_check" id="checkbox_' +
              row.volumeId +
              '"><label for="checkbox_' +
              row.volumeId +
              '"></label></span>'
            );
          }),
        DTColumnBuilder.newColumn("volumeName").withTitle("卷名称"),
        DTColumnBuilder.newColumn("description").withTitle("描述"),
        DTColumnBuilder.newColumn(null).notVisible(),
        DTColumnBuilder.newColumn(null).notVisible(),
        DTColumnBuilder.newColumn(null).notVisible(),
        DTColumnBuilder.newColumn("volumeSize")
          .withTitle("总容量")
          .renderWith(function (data, type, row) {
            return (row.volumeSize / 1024).toFixed(1) + "GB";
          }),
        DTColumnBuilder.newColumn("usedSize")
          .withTitle("已用容量")
          .renderWith(function (data, type, row) {
            return (
              (
                (row.volumeSize * 1 - row.volumeSize * row.freeSpaceRatio) /
                1024
              ).toFixed(1) + "GB"
            );
          }),
        DTColumnBuilder.newColumn(null).notVisible(),
        DTColumnBuilder.newColumn("volumeStatus")
          .withTitle("状态")
          .renderWith(function (data, type, row) {
            return $scope.chooseVolumeStatus(data);
          }),
        DTColumnBuilder.newColumn("volumeDomain")
          .withTitle("所属域")
          .renderWith(function (data, type, row) {
            return (
              "<a ng-click='jumpToDomain(\"" +
              row.domainId +
              "\")' title='查看域详情'>" +
              data +
              "</a>"
            );
          }),
        DTColumnBuilder.newColumn("storagePoolName")
          .withTitle("所属存储池")
          .renderWith(function (data, type, row) {
            return (
              "<a ng-click='jumpToPool(\"" +
              row.poolId +
              '","' +
              row.domainId +
              '","' +
              row.volumeDomain +
              "\")' title='查看存储池详情'>" +
              data +
              "</a>"
            );
          }),
        DTColumnBuilder.newColumn(null).notVisible(),
        DTColumnBuilder.newColumn(null).notVisible(),
        DTColumnBuilder.newColumn("timeForRecycle")
          .withTitle("放入时长")
          .renderWith(function (data, type, row) {
            let currentTime = new Date().getTime();
            let period = currentTime - data * 1;
            let day = Math.floor(period / 1000 / 60 / 60 / 24);
            let hour = Math.floor((period / 1000 / 60 / 60) % 24);
            let minute = Math.floor((period / 1000 / 60) % 60);
            let second = Math.floor((period / 1000) % 60);
            return day + "天" + hour + "时" + minute + "分" + second + "秒";
          }),
        DTColumnBuilder.newColumn("migrationSpeed")
          .withTitle("重构")
          .notSortable()
          .renderWith(function (data, type, row) {
            var string = "";
            var speed = "";
            if (data >= 1024) {
              speed = speed + (data / 1024).toFixed(1) + "M/s";
            } else {
              speed = speed + data + "K/s";
            }

            if (row.migrationRatio == "100.0") {
              string = string + "无重构";
            } else {
              var str = "重构中" + "(" + speed + ")";
              string =
                string +
                '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar"  style="width: 100%" ><span>' +
                str +
                "</span></div></div>";
            }
            return row.volumeStatus == "CREATING" ? "无重构" : string;
          }),
        DTColumnBuilder.newColumn("rebalanceRatio")
          .notSortable()
          .withTitle("Rebalance进度")
          .renderWith(function (data, type, row) {
            if (data * 1 == 1) {
              return "无进度";
            } else {
              return (
                '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar" title="版本号: ' +
                row.rebalanceVersion +
                '" style="width: 100%" ><span>' +
                parseInt(data * 100) +
                "%</span></div></div>"
              );
            }
          }),
        DTColumnBuilder.newColumn("volumeBuildType")
          .notSortable()
          .withTitle("创建类型")
          .renderWith(function (data, type, row) {
            var resultString = "";
            switch (data) {
              case "CLONE":
                resultString = "克隆";
                break;
              case "CREATE":
                resultString = "创建";
                break;
              case "MOVE":
                resultString = "迁移";
                break;
              case "MOVE_ONLINE":
                resultString = "在线迁移";
                break;
              case "SYNC_CLONE":
                resultString = "克隆";
                break;
              case "LINKED_CLONE":
                resultString = "链接克隆";
                break;
            }
            return resultString;
          }),

        DTColumnBuilder.newColumn(null)
          .withTitle("操作")
          .renderWith(function (data, type, row) {
            var infoString;
            if (
              !$rootScope.apis.Volume ||
              !(
                $rootScope.apis.Volume.cloneVolume ||
                $rootScope.apis.Volume.moveVolume ||
                $rootScope.apis.Volume.copyVolumeToExistVolume ||
                $rootScope.apis.Volume.fixVolume ||
                $rootScope.apis.Volume.createSnapshotVolume
              )
            ) {
              return;
            }
            if (row.volumeStatus != "Deleted") {
              infoString =
                '<div class="btn-group dropdown-btn"  >' +
                '<button type="button" class="btn btn_lightblue btn-xs my-drop-down" ng-click="showDown(\'' +
                row.volumeId +
                '\');$event.stopPropagation();">操作 <span class="caret"></span></button>' +
                '<ul class="down" style="min-width:110px;">' +
                '<li><a data-toggle="modal" data-target="#recovery_modal" ng-click="volumeRecovery(\'' +
                row.volumeId +
                "','" +
                row.volumeName +
                "','" +
                "')\">" +
                "恢复" +
                "</a></li>" +
                "</ul></div>";
            } else {
              infoString =
                '<div class="btn-group dropdown-btn"  >' +
                '<button type="button" class="btn btn_lightblue btn-xs my-drop-down"   ng-click="showDown(\'' +
                row.volumeId +
                '\');$event.stopPropagation();">操作 <span class="caret"></span></button>' +
                '<ul class="down" style="min-width:110px;">' +
                '<li><a ng-show="apis.Volume.moveVolume" class="disable_btn">恢复</a></li>' +
                "</ul></div>";
            }
            return infoString;
          })
          .notSortable(),
      ];

      $scope.showDown = function (id) {
        if ($(".temp-show").size()) {
          $(".temp-show").hide();
          $(".temp-show").removeClass("temp-show");
        } else {
          $("#" + id)
            .find(".my-drop-down")
            .eq(0)
            .next()
            .addClass("temp-show");
          $(".temp-show").toggle();
        }
        $(document).one("click", function () {
          $(".temp-show").hide();
          $(".temp-show").removeClass("temp-show");
        });
      };
      $scope.goDetail = function (id) {
        $state.go("app.storage.volume.volumeDetail", { volumeId: id });
      };
      $scope.goDriver = function () {
        $("#prompt_modal").modal("hide");
        $state.go("app.storage.allDriver", { volumeId: newVolumeId });
      };
      $scope.goPerformanceData = function (id) {
        $state.go("app.storage.volume.volumePerformanceData", { volumeId: id });
      };
      $scope.jumpToDomain = function (id) {
        $state.go("app.storage.domain.domainDetail", { domainId: id });
      };
      $scope.jumpToPool = function (id, domainId, domainName) {
        $state.go("app.storage.domain.pool.poolDetail", {
          poolId: id,
          domainId: domainId,
          domainName: domainName,
        });
      };

      vm.dtInstance = {};
      vm.dtInstanceTrash = {};
      $scope.reloadData = function () {
        $("#tabStatus").val("");
        vm.dtInstance.reloadData(null, false);
        vm.selected = {};
        vm.selectAll = false;
      };
      $scope.reloadDataTrash = function () {
        vm.dtInstanceTrash.reloadData(null, false);
        vm.selectedT = {};
        vm.selectAllT = false;
      };
      $scope.reload = function () {
        if ($scope.showFlag == 1) {
          $scope.reloadData();
        } else if ($scope.showFlag == 2) {
          $scope.reloadDataTrash();
        }
      };

      function obtainVolumeDetailShowFlag() {
        $http({
          method: "post",
          data: {},
          async: false,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          url: "obtainVolumeDetailShowFlag",
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(
                encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
              );
            }
            return str.join("&");
          },
        }).then(function successCallback(data) {
          data = data.data;
          if (data.volumeDetailShowFlag == "false") {
            $scope.volumeDetailShowFlag = false;
          } else {
            $scope.volumeDetailShowFlag = true;
          }
        });
      }
      obtainVolumeDetailShowFlag();
      function volumeInterval() {
        if (timeFlag) {
          timeFlag = false;
          $http({
            method: "post",
            data: { idsJson: JSON.stringify(refreshIds) },
            async: false,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            url: "listVolume",
            transformRequest: function (obj) {
              var str = [];
              for (var s in obj) {
                str.push(
                  encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
                );
              }
              return str.join("&");
            },
          }).then(function successCallback(data) {
            timeFlag = true;
            data = data.data;
            if (
              data.volumeList.length == 0 ||
              refreshIds.length != data.volumeList.length
            ) {
              $interval.cancel(volumeIntervalTimer);
              $scope.reload()
            } else {
              var count = false;

              if (data.volumeList) {
                $.each(data.volumeList, function (i, value) {
                  var status = value.volumeStatus;
                  if (isCreate) {
                    if (newVolumeId == value.volumeId) {
                      if (status == "Stable") {
                        $scope.createOver = true;
                      } else {
                        $("#volume_status").html(
                          $scope.chooseVolumeStatus(status)
                        );
                      }
                    }
                  }
                  if (
                    (status == "Stable" || status == "Unavailable") &&
                    value.migrationRatio == "100.0" &&
                    value.rebalanceRatio * 1 == 1
                  ) {
                    count = true;
                  }
                  let migrateionStr = "";
                  if (value.migrationRatio != "100.0") {
                    var speed = "";

                    if (value.migrationSpeed > 1024) {
                      speed += (value.migrationSpeed / 1024).toFixed(1) + "M/s";
                    } else {
                      speed += value.migrationSpeed + "K/s";
                    }
                    var str = "重构中" + "(" + speed + ")";
                    migrateionStr =
                      migrateionStr +
                      '<div class="progress progress-striped active" >' +
                      '<div class="progress-bar progress-bar-primary" role="progressbar"  style="width: 100%" ><span>' +
                      str +
                      "</span></div></div>";
                    $("#" + value.volumeId)
                      .children("td.migrationSpeed")
                      .html($compile(migrateionStr)($scope));

                    if (value.volumeStatus == "CREATING") {
                      migrateionStr = "无重构";
                      $("#" + value.volumeId)
                        .children("td.migrationSpeed")
                        .html(migrateionStr);
                    }
                  } else {
                    migrateionStr = "无重构";
                    $("#" + value.volumeId)
                      .children("td.migrationSpeed")
                      .html(migrateionStr);
                  }

                  let rebalanceStr = "";
                  if (value.rebalanceRatio * 1 != 1) {
                    rebalanceStr +=
                      '<div class="progress progress-striped active" >' +
                      '<div class="progress-bar progress-bar-primary" role="progressbar" title="版本号: ' +
                      value.rebalanceVersion +
                      '" style="width: 100%" ><span>' +
                      parseInt(value.rebalanceRatio * 100) +
                      "%</span></div></div>";

                    $("#" + value.volumeId)
                      .children("td.rebalanceRatio")
                      .html($compile(rebalanceStr)($scope));
                  } else {
                    rebalanceStr = "无进度";
                    $("#" + value.volumeId)
                      .children("td.rebalanceRatio")
                      .html(rebalanceStr);
                  }

                  if (status == "Deleted") {
                    var statusString =
                      "<span class='status_red' >" +
                      translate.getWord("status.deleted") +
                      "</span>";
                    var lastString =
                      '<div class="btn-group dropdown-btn"  >' +
                      '<button type="button" class="btn btn_lightblue btn-xs my-drop-down"   ng-click="showDown(\'' +
                      value.volumeId +
                      '\');$event.stopPropagation();">操作 <span class="caret"></span></button>' +
                      '<ul class="down" style="min-width:110px;">' +
                      "</ul></div>";
                    $("#" + value.volumeId)
                      .children("td.volumeStatus")
                      .html($compile(statusString)($scope));

                    if (
                      !(
                        $rootScope.apis.Volume.cloneVolume ||
                        $rootScope.apis.Volume.moveVolume ||
                        ($rootScope.apis.Volume.copyVolumeToExistVolume &&
                          $rootScope.apis.Volume.fixVolume &&
                          $rootScope.apis.Volume.createSnapshotVolume)
                      )
                    ) {
                      $("#" + value.volumeId)
                        .children("td")
                        .last()
                        .html("");
                    } else {
                      $("#" + value.volumeId)
                        .children("td")
                        .last()
                        .html($compile(lastString)($scope));
                    }
                  } else if (status == "Recycling") {
                    var statusString =
                      '<div class="progress progress-striped active" >' +
                      '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' +
                      translate.getWord("status.recycling") +
                      "</span></div></div>";
                    var lastString =
                      '<div class="btn-group dropdown-btn"  >' +
                      '<button type="button" class="btn btn_lightblue btn-xs my-drop-down"   ng-click="showDown(\'' +
                      value.volumeId +
                      '\');$event.stopPropagation();">操作 <span class="caret"></span></button>' +
                      '<ul class="down" style="min-width:110px;">' + 
                      "</ul></div>";
                    $("#" + value.volumeId)
                      .children("td.volumeStatus")
                      .html($compile(statusString)($scope));
                    if (
                      !$rootScope.apis.Volume ||
                      !(
                        $rootScope.apis.Volume.cloneVolume ||
                        $rootScope.apis.Volume.moveVolume ||
                        $rootScope.apis.Volume.copyVolumeToExistVolume ||
                        $rootScope.apis.Volume.fixVolume ||
                        $rootScope.apis.Volume.createSnapshotVolume
                      )
                    ) {
                      $("#" + value.volumeId)
                        .children("td")
                        .last()
                        .html("");
                    } else {
                      $("#" + value.volumeId)
                        .children("td")
                        .last()
                        .html($compile(lastString)($scope));
                    }
                  }
                });
              }
              if (count) {
                $interval.cancel(volumeIntervalTimer);
                vm.dtInstance.reloadData(null, false);
              }
            }
          });
        }
      }

      $scope.getAllDomainName = function () {
        $http({
          method: "post",
          data: { domainName: "" },
          async: false,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          url: "listDomains",
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(
                encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
              );
            }
            return str.join("&");
          },
        }).then(function successCallback(data) {
          data = data.data;
          $scope.domainGroups = [{ value: "", txt: "请选择一个域" }];
          $scope.domainPools = [{ value: "", txt: "请选择一个存储池" }];
          for (var i = 0; i < data.domainList.length; i++) {
            $scope.domainGroups.push({
              value: data.domainList[i].domainId,
              txt: data.domainList[i].domainName,
            });
          }
          $(".volumeDomainClass").selectpicker("refresh");
          $(".volumeDomainClass").on("shown.bs.select", function (e) {
            $(".volumeDomainClass").selectpicker("refresh");
          });
          $(".volumeStoragepool").selectpicker("refresh");
          $(".volumeStoragepool").on("shown.bs.select", function (e) {
            $(".volumeStoragepool").selectpicker("refresh");
          });
          $(".initColor").removeClass("has-error");
          $(".initTip").remove(this);
        });
      };

      $scope.domainChange = function () {
        $scope.domainPools = [{ value: "", txt: "请选择一个存储池" }];
        var tempID =
          $scope.create.volumeDomain
        if (
          $scope.create.volumeDomain 
        ) {
          $http({
            method: "post",
            data: { domainId: tempID },
            async: false,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            url: "listStoragePool",
            transformRequest: function (obj) {
              var str = [];
              for (var s in obj) {
                str.push(
                  encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
                );
              }
              return str.join("&");
            },
          }).then(function successCallback(data) {
            data = data.data;
            for (var i = 0; i < data.simpleStoragePoolsList.length; i++) {
              $scope.domainPools.push({
                value: data.simpleStoragePoolsList[i].poolId,
                txt: data.simpleStoragePoolsList[i].poolName,
              });
            }
            $(".volumeStoragepool").selectpicker("val", "");
            $(".volumeStoragepool").selectpicker("refresh");
            $(".volumeStoragepool").on("shown.bs.select", function (e) {
              $(".volumeStoragepool").selectpicker("refresh");
            });
          });
        } else {
          $scope.create.volumeStoragepool = "";
          $scope.clone.cloneVolumeStoragePool = "";
          $scope.move.moveVolumeStoragePool = "";
          $(".volumeStoragepool").selectpicker("val", "");
          $(".volumeStoragepool").selectpicker("refresh");
        }
      };
      $scope.showSpace = function () {
        if ($scope.create.volumeStoragepool) {
          $http({
            method: "POST",
            async: false,
            url: "listStoragePoolCapacity",
            data: {
              domainId: $scope.create.volumeDomain,
              poolIds: JSON.stringify([$scope.create.volumeStoragepool]),
            },
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            transformRequest: function (obj) {
              var str = [];
              for (var s in obj) {
                str.push(
                  encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
                );
              }
              return str.join("&");
            },
          }).then(function successCallback(response) {
            var obj = response.data.simpleStoragePoolsList[0];
            var tempNum = $scope.create.volumeType == "SMALL" ? 2 : 3;
            $scope.totalSpace = obj.totalSpace / (1024 * 1024 * 1024) + "GB";
            $scope.usedSpace =
              (obj.totalSpace - obj.freeSpace) / (1024 * 1024 * 1024) + "GB";
            if ($scope.create.volumeSize) {
              $("#progress_out").prop(
                "title",
                "已用容量" +
                  (obj.totalSpace - obj.freeSpace) / (1024 * 1024 * 1024) +
                  "GB"
              );
              $("#progress_out").css(
                "width",
                (100 * (obj.totalSpace - obj.freeSpace)) / obj.totalSpace + "%"
              );
              $("#progress_in").prop(
                "title",
                "创建容量" + $scope.create.volumeSize * tempNum + "GB"
              );
              $("#progress_in").css(
                "width",
                (100 *
                  (obj.totalSpace -
                    obj.freeSpace +
                    tempNum * $scope.create.volumeSize * 1024 * 1024 * 1024)) /
                  obj.totalSpace +
                  "%"
              );
            } else {
              $("#progress_out").prop(
                "title",
                "已用容量" +
                  (obj.totalSpace - obj.freeSpace) / (1024 * 1024 * 1024) +
                  "GB"
              );
              $("#progress_out").css(
                "width",
                (100 * (obj.totalSpace - obj.freeSpace)) / obj.totalSpace + "%"
              );
            }
            if (
              obj.freeSpace <
              tempNum * $scope.create.volumeSize * 1024 * 1024 * 1024
            ) {
              $scope.createForm.overflowShow = true;
              $("#progress_in").addClass("progress-bar-danger");
            } else {
              $scope.createForm.overflowShow = false;
              $("#progress_in").removeClass("progress-bar-danger");
            }
          });
        } else {
          $("#progress_out").prop("title", "");
          $("#progress_out").css("width", "0%");
          $("#progress_in").prop("title", "");
          $("#progress_in").css("width", "0%");
        }
      };
      $scope.getVolumeId = function (id) {
        choosedId = [id];
      };

      $scope.createBtn = function () {
        if ($scope.desLong) return;
        var segmentNum = Math.ceil(
          (1024 / $scope.segmentSize) * $scope.create.volumeSize
        );
        var segmentSize = segmentNum * $scope.segmentSize;
        const addDataObj = {
          volumeName: $scope.create.volumeName,
          volumeSize: segmentSize,
          volumeType: $scope.create.volumeType,
          volumeDomainId: $("#volumeDomain").val(),
          volumeStoragepoolId: $("#volumeStoragepool").val(),
          enableLaunchMultiDrivers: true,
          description: $("#description").val(),
        };

        $http({
          method: "post",
          data: addDataObj,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          url: "createVolume",
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(
                encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
              );
            }
            return str.join("&");
          },
        }).then(function successCallback(data) {
          data = data.data;
          if (data.simpleVolumeMetadata.message != "success") {
            if (data.simpleVolumeMetadata.message == "ERROR_0019_SessionOut") {
              showMessage.show(
                $scope,
                "error",
                translate.getWord("session.out")
              );
              $scope.logout();
            } else {
              showMessage.show(
                $scope,
                "error",
                translate.getWord(data.simpleVolumeMetadata.message)
              );
            }
          } else {
            showMessage.show(
              $scope,
              "success",
              translate.getWord("response.success")
            );
            $("#prompt_modal").modal("show");
            isCreate = true;
            newVolumeId = data.simpleVolumeMetadata.volumeId;
            $scope.createOver = false;
            $("#volume_status").html(
              $scope.chooseVolumeStatus(data.simpleVolumeMetadata.volumeStatus)
            );
          }
          vm.dtInstance.reloadData(null, false);
          $scope.resetCreate();
          $("#create_modal").modal("hide");
        });
      };
      $scope.chooseVolumeStatus = function (data) {
        var resultString;
        data = data.toUpperCase();
        switch (data) {
          case "AVAILABLE":
            resultString =
              "<span class='status_green'>" +
              translate.getWord("status.available") +
              "</span>";
            break;
          case "STABLE":
            resultString =
              "<span class='status_green'>" +
              translate.getWord("status.stable") +
              "</span>";
            break;
          case "UNAVAILABLE":
            resultString =
              "<span class='status_red'>" +
              translate.getWord("status.unavailable") +
              "</span>";
            break;

          case "DELETED":
            resultString =
              "<span class='status_red'>" +
              translate.getWord("status.deleted") +
              "</span>";
            break;
          case "TOBECREATED":
            resultString =
              '<div class="progress progress-striped active" ">' +
              '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' +
              translate.getWord("status.toBeCreated") +
              "</span></div></div>";
            break;
          case "CREATING":
            resultString =
              '<div class="progress progress-striped active" ">' +
              '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' +
              translate.getWord("status.creating") +
              "</span></div></div>";
            break;
          case "EXTENDING":
            resultString =
              '<div class="progress progress-striped active" ">' +
              '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' +
              translate.getWord("status.extending") +
              "</span></div></div>";
            break;
          case "DELETING":
            resultString =
              '<div class="progress progress-striped active" ">' +
              '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' +
              translate.getWord("status.deleting") +
              "</span></div></div>";
            break;
          case "RECYCLING":
            resultString =
              '<div class="progress progress-striped active" ">' +
              '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' +
              translate.getWord("status.recycling") +
              "</span></div></div>";
            break;
        }
        return resultString;
      };

      $scope.deleteRule = function () {
        for (var i = 0; i < selectedIds.length; i++) {
          $http({
            method: "post",
            async: false,
            data: {
              volumeName: selectedNames[i],
              volumeId: selectedIds[i],
            },
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            url: "deleteVolume",
            transformRequest: function (obj) {
              var str = [];
              for (var s in obj) {
                str.push(
                  encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
                );
              }
              return str.join("&");
            },
          }).then(function successCallback(data) {
            data = data.data;
            if (data.resultMessage.message != "success") {
              if (data.resultMessage.message == "ERROR_0019_SessionOut") {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord("session.out")
                );
                $scope.logout();
              } else {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord(data.resultMessage.message)
                );
              }
            } else {
              showMessage.show(
                $scope,
                "success",
                translate.getWord("response.success")
              );
            }
            if ($scope.showFlag == 1 ) {
              vm.dtInstance.reloadData(null, false);
            } else if ($scope.showFlag == 2 ) {
              vm.dtInstanceTrash.reloadData(null, false);
            }
          });
        }
      };

      $scope.extendBtn = function () {
        var segmentNum = Math.ceil(
          (1024 / $scope.segmentSize) * $("#extendSize").val()
        );
        var segmentSize = segmentNum * $scope.segmentSize;
        for (var i = 0; i < selectedIds.length; i++) {
          $http({
            method: "post",
            async: false,
            data: {
              volumeId: selectedIds[i],
              extendSize: segmentSize,
              volumeSize: selectedSize[i] * 1024,
            },
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            url: "extendVolume",
            transformRequest: function (obj) {
              var str = [];
              for (var s in obj) {
                str.push(
                  encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
                );
              }
              return str.join("&");
            },
          }).then(function successCallback(data) {
            data = data.data;
            if (data.resultMessage.message != "success") {
              if (data.resultMessage.message == "ERROR_0019_SessionOut") {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord("session.out")
                );
                $scope.logout();
              } else {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord(data.resultMessage.message)
                );
              }
            } else {
              showMessage.show(
                $scope,
                "success",
                translate.getWord("response.success")
              );
            }
            vm.dtInstance.reloadData(null, false);
            $scope.resetExtend();
          });
        }
      };
      
      $http({
        method: "post",
        data: {},
        async: false,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        url: "getSegmentSize",
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        },
      }).then(function successCallback(data) {
        data = data.data;
        $scope.segmentSize = Number(data.segmentSizeBytes) / 1024 / 1024;
      });

      $scope.moveToTrash = function (id, name) {
        $scope.copyArr = [
          { txt: translate.getWord("volume.chooseTargetVolume"), value: "" },
        ];
        choosedId = [id];
        $scope.choosedName = name;
        $scope.choosedNameShort =
          name.length > 20 ? name.substring(0, 20) + "..." : name;
      };

      $scope.moveToTrashBtn = function () {
        $http({
          method: "post",
          data: {
            volumeId: choosedId[0],
          },
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          url: "moveVolumeToRecycle",
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(
                encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
              );
            }
            return str.join("&");
          },
        }).then(function successCallback(data) {
          data = data.data;
          if (data.resultMessage.message != "success") {
            if (data.resultMessage.message == "ERROR_0019_SessionOut") {
              showMessage.show(
                $scope,
                "error",
                translate.getWord("session.out")
              );
              $scope.logout();
            } else {
              showMessage.show(
                $scope,
                "error",
                translate.getWord(data.resultMessage.message)
              );
            }
          } else {
            showMessage.show(
              $scope,
              "success",
              translate.getWord("response.success")
            );
            vm.dtInstance.reloadData(null, false);
          }
        });
      };

      $scope.volumeRecovery = function (id, name) {
        $scope.copyArr = [
          { txt: translate.getWord("volume.chooseTargetVolume"), value: "" },
        ];
        choosedId = [id];
        $scope.choosedName = name;
        $scope.choosedNameShort =
          name.length > 20 ? name.substring(0, 20) + "..." : name;
      };

      $scope.volumeRecoveryBtn = function () {
        $http({
          method: "post",
          data: {
            volumeId: choosedId[0],
          },
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          url: "recycleVolumeToNormal",
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(
                encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
              );
            }
            return str.join("&");
          },
        }).then(function successCallback(data) {
          data = data.data;
          if (data.resultMessage.message != "success") {
            if (data.resultMessage.message == "ERROR_0019_SessionOut") {
              showMessage.show(
                $scope,
                "error",
                translate.getWord("session.out")
              );
              $scope.logout();
            } else {
              showMessage.show(
                $scope,
                "error",
                translate.getWord(data.resultMessage.message)
              );
            }
          } else {
            showMessage.show(
              $scope,
              "success",
              translate.getWord("response.success")
            );
            vm.dtInstanceTrash.reloadData(null, false);
          }
        });
      };

      $scope.showSelect = function () {
        selectedNames = [];
        selectedIds = [];
        selectedSize = [];
        var selectedNamesShort = [];
        let selectArr = [];
        if ($scope.showFlag == 1) {
          selectArr = vm.selected;
        } else {
          selectArr = vm.selectedT;
        }
        for (var id in selectArr) {
          if (selectArr.hasOwnProperty(id)) {
            if (selectArr[id]) {
              let name = "";
              if ($scope.showFlag == 1) {
                name = $("#" + id)
                  .children()
                  .eq(1)
                  .children()
                  .eq(0)
                  .html();
              } else {
                name = $("#" + id)
                  .children()
                  .eq(1)
                  .html();
              }

              selectedNames.push(name);
              selectedNamesShort.push(
                name.length > 20 ? name.substring(0, 20) + "..." : name
              );
              selectedIds.push(id);

              let size = $("#" + id)
                .children()
                .eq(1)
                .children()
                .attr("size");
              size = parseInt(size) / 1024;
              selectedSize.push(size);
            }
          }
        }
        $scope.choosedName = selectedNames.join(",");
        $scope.choosedNameShort = selectedNamesShort.join(",");
        choosedId = selectedIds;
      };

      $scope.resetCreate = function () {
        $scope.createForm.$setPristine();
        $scope.createForm.$setUntouched();
        $scope.create = {
          volumeName: "",
          volumeSize: "",
          volumeType: "REGULAR",
        };
        $("#progress_out").prop("title", "");
        $("#progress_out").css("width", "0%");
        $("#progress_in").prop("title", "");
        $("#progress_in").css("width", "0%");
        $("#volumeType").selectpicker("val", "REGULAR");
        $scope.totalSpace = "";
        $scope.usedSpace = "";
        $scope.createForm.overflowShow = false;
        $scope.desLong = false;
        $(".hoverTip").hide();
        document.getElementById("createForm").reset();
      };

      $scope.resetExtend = function () {
        $scope.extend = { extendSize: "" };
        $scope.extendForm.$setPristine();
        $scope.extendForm.$setUntouched();
        document.getElementById("extendForm").reset();
      };

      $scope.doFocus = function (id) {
        focus(id);
      };
      $scope.$on("$destroy", function () {
        $interval.cancel(volumeIntervalTimer);
      });
      $('#create_modal').on('shown.bs.modal', function () {
        $scope.createDes = ''
      })
      function toggleAll(selectAll, selectedItems) {
        var allId;
        for (var id in selectedItems) {
          if (selectedItems.hasOwnProperty(id)) {
            selectedItems[id] = selectAll;
            if (selectAll == false) {
              $("#" + id).removeClass("active");
              $("#checkbox_" + id).prop("checked", false);
            } else {
              $("#" + id).addClass("active");
              $("#checkbox_" + id).prop("checked", true);
            }
          }
        }
        for (var id in selectedItems) {
          allId = $("#" + id)
            .parents("table")
            .find("input")
            .eq(0)
            .prop("id");
          break;
        }
        clickEvent(allId);
      }
      function toggleOne(allId, selectedItems, target) {
        if (target) {
          if (
            !$("#" + target)
              .children()
              .eq(0)
              .children()
              .eq(0)
              .prop("checked")
          ) {
            $("#" + target).removeClass("active");
            $("#" + target)
              .children()
              .eq(0)
              .children()
              .eq(0)
              .prop("checked", false);
          } else {
            $("#" + target).addClass("active");
            $("#" + target)
              .children()
              .eq(0)
              .children()
              .eq(0)
              .prop("checked", true);
          }
        }
        clickEvent(allId);
        for (var id in selectedItems) {
          if (selectedItems.hasOwnProperty(id)) {
            if (!selectedItems[id]) {
              $("#" + allId).prop("checked", false);
              $("#" + id).removeClass("active");
              return;
            } else {
              $("#" + id).addClass("active");
            }
          }
        }
        $("#" + allId).prop("checked", true);
      }
      var firstTime = true;
      function clickEvent(allId) {
        var i = 0;
        $("[name=volumeChecked]:checkbox").each(function () {
          if ($(this).prop("checked")) {
            i++;
          }
        });
        if (allId == "checkedAll") {
          if (i == 0) {
            $("#delete_btn").attr("disabled", true);
            $("#extend_btn").attr("disabled", true);
            if (firstTime) {
              firstTime = !firstTime;
              $interval.cancel(volumeIntervalTimer);
              $scope.reload()
            }
          } else {
            firstTime = true;
            $interval.cancel(volumeIntervalTimer);
            if (i == 1) {
              $("#delete_btn").removeAttr("disabled");
              $("#extend_btn").removeAttr("disabled");
            } else {
              $("#delete_btn").removeAttr("disabled");
              $("#extend_btn").removeAttr("disabled");
            }
          }
        } else {
          $("#extend_btn").attr("disabled", true);
          if (i == 0) {
            $("#delete_btn").attr("disabled", true);
            if (firstTime) {
              firstTime = !firstTime;
              $interval.cancel(volumeIntervalTimer);
              $scope.reload()
            }
          } else {
            firstTime = true;
            $interval.cancel(volumeIntervalTimer);
            if (i == 1) {
              $("#delete_btn").removeAttr("disabled");
            } else {
              $("#delete_btn").removeAttr("disabled");
            }
          }
        }
      }
    }
  )
  .directive("smartProgressbar", function (lazyScript) {
    return {
      restrict: "A",
      compile: function (tElement, tAttributes) {
        lazyScript.register("build/vendor.ui.js").then(function () {
          tElement.removeAttr("smart-progressbar data-smart-progressbar");
          tElement.progressbar({
            display_text: "",
          });
        });
      },
    };
  });

function fillDate(timer) {
  var time = new Date(parseInt(timer));
  var month = time.getMonth() + 1;
  var day = time.getDate();
  var hour = time.getHours();
  var minute = time.getMinutes();
  var second = time.getSeconds();
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minute < 10) {
    minute = "0" + minute;
  }
  if (second < 10) {
    second = "0" + second;
  }
  return (
    time.getFullYear() +
    "/" +
    month +
    "/" +
    day +
    " " +
    hour +
    ":" +
    minute +
    ":" +
    second
  );
}

var newAlert;
var newConfirm;
(function ($) {
  $.alerts = {
    alert: function (title, message, callback) {
      if (title == null) title = "Alert";
      $.alerts._show(title, message, null, "alert", function (result) {
        if (callback) callback(result);
      });
    },

    confirm: function (title, message, callback, oConfirm, oCancel) {
      if (title == null) title = "Confirm";
      $.alerts._show(
        title,
        message,
        null,
        "confirm",
        function (result) {
          if (callback) callback(result);
        },
        oConfirm,
        oCancel
      );
    },

    _show: function (title, msg, value, type, callback, oConfirm, oCancel) {
      var _html = "";

      _html +=
        '<div id="mb_box"></div><div id="mb_con"><span id="mb_tit">' +
        title +
        "</span>";
      _html += '<div id="mb_msg">' + msg + '</div><div id="mb_btnbox">';
      if (type == "alert") {
        _html +=
          '<input id="mb_btn_ok" class="btn btn_lightblue" type="button" value="确认" />';
      }
      if (type == "confirm") {
        _html +=
          '<input id="mb_btn_ok" class="btn btn_lightblue" type="button" value="' +
          oConfirm +
          '" />';
        _html +=
          '<input id="mb_btn_no" class="btn btn_red" type="button" value="' +
          oCancel +
          '" />';
      }
      _html += "</div></div>";

      $("body").append(_html);
      GenerateCss();

      switch (type) {
        case "alert":
          $("#mb_btn_ok").click(function () {
            $.alerts._hide();
            callback(true);
          });
          $("#mb_btn_ok")
            .focus()
            .keypress(function (e) {
              if (e.keyCode == 13 || e.keyCode == 27)
                $("#mb_btn_ok").trigger("click");
            });
          break;
        case "confirm":
          $("#mb_btn_ok").click(function () {
            $.alerts._hide();
            if (callback) callback(true);
          });
          $("#mb_btn_no").click(function () {
            $.alerts._hide();
            if (callback) callback(false);
          });
          $("#mb_btn_no").focus();
          $("#mb_btn_ok, #mb_btn_no").keypress(function (e) {
            if (e.keyCode == 13) $("#mb_btn_ok").trigger("click");
            if (e.keyCode == 27) $("#mb_btn_no").trigger("click");
          });
          break;
      }
    },
    _hide: function () {
      $("#mb_box,#mb_con").remove();
    },
  };

  newAlert = function (title, message, callback) {
    $.alerts.alert(title, message, callback);
  };

  newConfirm = function (title, message, callback, oConfirm, oCancel) {
    $.alerts.confirm(title, message, callback, oConfirm, oCancel);
  };

  var GenerateCss = function () {
    $("#mb_box").css({
      width: "100%",
      height: "100%",
      zIndex: "99999",
      position: "fixed",
      filter: "Alpha(opacity=60)",
      backgroundColor: "#333",
      top: "0",
      left: "0",
      opacity: "0.6",
    });

    $("#mb_con").css({
      zIndex: "999999",
      width: "38%",
      position: "fixed",
      backgroundColor: "White",
      borderRadius: "6px",
    });

    $("#mb_tit").css({
      display: "block",
      fontSize: "17px",
      color: "#444",
      padding: "15px",
      backgroundColor: "#fff",
      borderRadius: "6px 6px 0 0",
      borderBottom: "1px solid #EFEFEF",
    });

    $("#mb_msg").css({
      padding: "16px",
      borderBottom: "1px solid #EFEFEF",
    });

    $("#mb_ico").css({
      display: "block",
      position: "absolute",
      right: "10px",
      top: "9px",
      border: "1px solid Gray",
      width: "18px",
      height: "18px",
      textAlign: "center",
      lineHeight: "16px",
      cursor: "pointer",
      borderRadius: "6px",
      fontFamily: "微软雅黑",
    });

    $("#mb_btnbox").css({ margin: "15px 20px 10px 0", textAlign: "right" });
    $("#mb_btn_no").css({ margin: "0 0 0 20px" });

    $("#mb_ico").hover(
      function () {
        $(this).css({ backgroundColor: "Red", color: "White" });
      },
      function () {
        $(this).css({ backgroundColor: "#DDD", color: "black" });
      }
    );

    var _widht = document.documentElement.clientWidth; 
    var _height = document.documentElement.clientHeight;

    var boxWidth = $("#mb_con").width();
    var boxHeight = $("#mb_con").height();

    $("#mb_con").css({
      top: (_height - boxHeight) / 5 + "px",
      left: (_widht - boxWidth) / 2 + "px",
    });
  };
})(jQuery);

function hideSth(obj) {
  $(obj).parent().find(".hoverTip").removeClass("hideTip").show();
}
function showSth(obj) {
  setTimeout(function () {
    $(obj).parent().find(".hoverTip").hide();
  }, 200);
}
function clearFilter(str) {
  $("#" + str)
    .find("input")
    .val("")
    .next()
    .hide();
}
function showItem(event) {
  if (this.value == "") {
    $("." + event.data.cName).hide();
  } else {
    $("." + event.data.cName).show();
  }
}
function byteFormat(size) {
  if (!size) {
    return "";
  }
  size = size * 1.0;
  if (size < 1024) {
    return size.toFixed(1) + "B";
  }
  size = size / 1024;
  if (size < 1024) {
    return size.toFixed(1) + "KB";
  }
  size = size / 1024;
  if (size < 1024) {
    return size.toFixed(1) + "MB";
  }
  size = size / 1024;
  return size.toFixed(1) + "GB";
}

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

angular.module('app.storage').controller('VolumeDetailCtrl', function ($timeout,$rootScope,$scope, $interval,$http,DTOptionsBuilder,showMessage,goPage, DTColumnBuilder,$compile, translate,$stateParams,$state) {
	$(".modal").draggable();
    $scope.volumeId=$stateParams.volumeId;
	var segmentStatus = "ALL";
	$scope.timerViewDetail=function() {
	    $("#result_table").html("");
	    
        let epoch="0";
	    if(epoch){
	        if(!isNaN($("#epochValue").val())){
	            epoch=$("#epochValue").val();
	        }
	    }
        let generation="0";
        if(generation){
            if(!isNaN($("#generationValue").val())){
                generation=$("#generationValue").val();
            }
        }
	    $http({
            method: "post",
            data:{
            	volumeId : $scope.volumeId,
	            segmentStatus : $("#segmentStatus").val(),
	            epoch:epoch,
	            generation:generation
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },  
            url:"viewVolume",  
           	transformRequest: function(obj) {  
	          	var str = [];  
	          	for (var s in obj) {  
	            	str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));  
	          	}  
	          	return str.join("&");  
	        }  
        }).then(function successCallback(data){
            data=data.data;
            
            if(data.resultMessage.message != "success"){
                if (data.resultMessage.message  == "ERROR_0019_SessionOut") {
                    showMessage.show($scope,"warn",translate.getWord("session.out"));
                    $scope.logout();
                }else{
                    showMessage.show($scope,"error",translate.getWord(data.resultMessage.message));
                    return ;
                }
            }
           	segmentStatus = data.simpleVolumeMetadata.segmentStatus;
            
            $scope.volumeName=data.simpleVolumeMetadata.volumeName;
            var $resultHtml="";
            if(data.simpleVolumeMetadata.segmentList.length==0){
                $resultHtml = $resultHtml+ "<table width='100%' style='margin:0;height:30px' class='table table-striped  table-hover' style='margin:0'><thead><tr><td  class='default' align='center'>"+"表中数据为空"+"</td></tr>";
                $("#page_go").hide()
            }else{
                $("#page_go").show();
                $.each(data.simpleVolumeMetadata.segmentList,function(i, value) {
                    $resultHtml = $resultHtml
                    + "<table width='100%' id='" + value.segId + "' style='margin:0' class='table table-striped  table-hover'><thead>"
                            + "<tr>"
                            + "<td width='15%'  rowspan='"+value.unitSize+"' >"+ value.segId + "</td>";
                    $.each(value.unitList,function(j, segUnit) {
                        if (j == 0) {
                            if (segUnit.unitType == "Primary") {
                                $resultHtml = $resultHtml
                                        + "<td width='20%'  class='info'>"
                                        + segUnit.unitType
                                        + "</td>"
                                        + "<td width='20%'  class='info'>"
                                        + segUnit.instanceId
                                        + "</td>"
                                        + "<td width='15%'  class='info'>"
                                        + segUnit.instanceIp
                                        + "</td>"
                                        if(segUnit.status=="PreSecondary")
                                        {
                                           
                                            var ratioMigration=Number(segUnit.ratioMigration)*100;
                                            ratioMigration=ratioMigration.toFixed(1)+"%";
                                            $resultHtml = $resultHtml
                                            + "<td width='15%' height='30px' class='info'><a title='Internal Status: "
                                            + segUnit.status
                                            + " Epoch: "
                                            + segUnit.simpleSegmentVersion.epoch
                                            + " Generation: "
                                            + segUnit.simpleSegmentVersion.generation
                                            + "' style='display:block;width:100%'>"
                                            + segUnit.statusDisplay+"("+ratioMigration+")"
                                            + "</a></td>";
                                        }else{
                                            $resultHtml = $resultHtml
                                            + "<td width='15%' height='30px' class='info'><a title='Internal Status: "
                                            + segUnit.status
                                            + " Epoch: "
                                            + segUnit.simpleSegmentVersion.epoch
                                            + " Generation: "
                                            + segUnit.simpleSegmentVersion.generation
                                            + "' style='display:block;width:100%'>"
                                            + segUnit.statusDisplay
                                            + "</a></td>";
                                        }
                                        $resultHtml = $resultHtml
                                        + "<td width='15%' height='30px' class='info'>"
                                        + segUnit.diskName
                                        + "</td></tr>";
                            } else {
                                $resultHtml = $resultHtml
                                        + "<td width='20%' >"
                                        + segUnit.unitType
                                        + "</td>"
                                        + "<td width='20%'  >"
                                        + segUnit.instanceId
                                        + "</td>"
                                        + "<td width='15%'  >"
                                        + segUnit.instanceIp
                                        + "</td>";
                                        if(segUnit.status=="PreSecondary")
                                        {
                                           
                                            var ratioMigration=Number(segUnit.ratioMigration)*100;
                                            ratioMigration=ratioMigration.toFixed(1)+"%";
                                            $resultHtml = $resultHtml
                                            + "<td width='15%' height='30px' ><a title='Internal Status: "
                                            + segUnit.status
                                            + " Epoch: "
                                            + segUnit.simpleSegmentVersion.epoch
                                            + " Generation: "
                                            + segUnit.simpleSegmentVersion.generation
                                            + "' style='display:block;width:100%'>"
                                            + segUnit.statusDisplay+"("+ratioMigration+")"
                                            + "</a></td>";
                                        }else{
                                            $resultHtml = $resultHtml
                                            + "<td width='15%' height='30px' ><a title='Internal Status: "
                                            + segUnit.status
                                            + " Epoch: "
                                            + segUnit.simpleSegmentVersion.epoch
                                            + " Generation: "
                                            + segUnit.simpleSegmentVersion.generation
                                            + "' style='display:block;width:100%'>"
                                            + segUnit.statusDisplay
                                            + "</a></td>";
                                        }
                                        $resultHtml = $resultHtml
                                        + "<td width='15%' height='30px'>"
                                        + segUnit.diskName
                                        + "</td></tr>";
                            }
                        } else {
                            if (segUnit.unitType == "Primary") {
                                $resultHtml = $resultHtml
                                + "<tr ><td width='20%' height='30px' class='info'>"
                                + segUnit.unitType
                                + "</td>"
                                + "<td width='20%'  class='info'>"
                                + segUnit.instanceId
                                + "</td>"
                                + "<td width='15%'  class='info'>"
                                + segUnit.instanceIp
                                + "</td>";
                                if(segUnit.status=="PreSecondary")
                                {
                                    var ratioMigration=Number(segUnit.ratioMigration)*100;
                                    ratioMigration=ratioMigration.toFixed(1)+"%";
                                    $resultHtml = $resultHtml
                                    + "<td width='15%' height='30px' class='info'><a title='Internal Status: "
                                    + segUnit.status
                                    + " Epoch: "
                                    + segUnit.simpleSegmentVersion.epoch
                                    + " Generation: "
                                    + segUnit.simpleSegmentVersion.generation
                                    + "' style='display:block;width:100%'>"
                                    + segUnit.statusDisplay+"("+ratioMigration+")"
                                    + "</a></td>";
                                }else{
                                    $resultHtml = $resultHtml
                                    + "<td width='15%' height='30px' class='info'><a title='Internal Status: "
                                    + segUnit.status
                                    + " Epoch: "
                                    + segUnit.simpleSegmentVersion.epoch
                                    + " Generation: "
                                    + segUnit.simpleSegmentVersion.generation
                                    + "' style='display:block;width:100%'>"
                                    + segUnit.statusDisplay
                                    + "</a></td>";
                                }
                                $resultHtml = $resultHtml
                                + "<td width='15%' class='info'>"
                                + segUnit.diskName
                                + "</td></tr></tr>";
                            } else {
                                $resultHtml = $resultHtml
                                        + "<tr ><td width='20%' >"
                                        + segUnit.unitType
                                        + "</td>"
                                        + "<td width='20%' >"
                                        + segUnit.instanceId
                                        + "</td>"
                                        + "<td width='15%' >"
                                        + segUnit.instanceIp
                                        + "</td>";
                                        if(segUnit.status=="PreSecondary")
                                        {
                                           
                                            var ratioMigration=Number(segUnit.ratioMigration)*100;
                                            ratioMigration=ratioMigration.toFixed(1)+"%";
                                            $resultHtml = $resultHtml
                                            + "<td width='15%' height='30px' ><a title='Internal Status: "
                                            + segUnit.status
                                            + " Epoch: "
                                            + segUnit.simpleSegmentVersion.epoch
                                            + " Generation: "
                                            + segUnit.simpleSegmentVersion.generation
                                            + "' style='display:block;width:100%'>"
                                            + segUnit.statusDisplay+"("+ratioMigration+")"
                                            + "</a></td>";
                                        }else{
                                            $resultHtml = $resultHtml
                                            + "<td width='15%' height='30px' ><a title='Internal Status: "
                                            + segUnit.status
                                            + " Epoch: "
                                            + segUnit.simpleSegmentVersion.epoch
                                            + " Generation: "
                                            + segUnit.simpleSegmentVersion.generation
                                            + "' style='display:block;width:100%'>"
                                            + segUnit.statusDisplay
                                            + "</a></td>";
                                        }
                                        $resultHtml = $resultHtml
                                        + "<td width='15%' >"
                                        + segUnit.diskName
                                        + "</td></tr></tr>";
                            }
                        }
                    });
                });
            }
                
            $resultHtml = $resultHtml + "</thead></table>";
            $("#result_table").append($resultHtml);
            $("div.holder").jPages({
            	containerID : "result_table",
            	perPage: 10
          	});
        });
	}
	$scope.timerViewDetail();

    var loadingTableTimer;
	function loadingTable(){
	    var startSegmentIndex=Number.POSITIVE_INFINITY;
	    var endSegmentIndex=0;
	    $("#result_table table").each(function(index,element){
	        var found=0;
	        if($(element).css("display") == "table") {
	            found=1;
	            var id = $(element).attr("id");
	            if(startSegmentIndex > id)
	                startSegmentIndex = id;
	            if(endSegmentIndex < id)
	                endSegmentIndex = id;
	        } else if(found) {
	            return false;
	        }
	    });

	    $http({
            method: "post",
            data:{
            	volumeId : $scope.volumeId,
	            startSegmentIndex : 0,
	            endSegmentIndex : endSegmentIndex
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },  
            url:"viewSegmentList",  
           	transformRequest: function(obj) {  
	          	var str = [];  
	          	for (var s in obj) {  
	            	str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));  
	          	}  
	          	return str.join("&");  
	        }  
        }).then(function successCallback(data){
            data=data.data;
            if (data.resultMessage.message  == "ERROR_0019_SessionOut") {
                showMessage.show($scope,"warn",translate.getWord("session.out"));
                $scope.logout();
            }
            $.each(data.segmentList,function(i, value) {
                $("#" + value.segId).html("");
                var $resultHtml =
                "<thead>"
                + "<tr >"
                + "<td width='15%' rowspan='"
                + value.unitSize
                + "' height='30px'>"
                + value.segId + "</td>";
                $.each(value.unitList,function(j, segUnit) {
                    if (j == 0) {
                        if (segUnit.unitType == "Primary") {
                           $resultHtml = $resultHtml
                                   + "<td width='20%' height='30px' class='info'>"
                                   + segUnit.unitType
                                   + "</td>"
                                   + "<td width='20%' height='30px'  class='info'>"
                                   + segUnit.instanceId
                                   + "</td>"
                                   + "<td width='15%' height='30px'  class='info'>"
                                   + segUnit.instanceIp
                                   + "</td>"
                                   + "<td width='15%' height='30px'  class='info'><a title='Internal Status: "
                                   + segUnit.status
                                   + " Epoch: "
                                   + segUnit.simpleSegmentVersion.epoch
                                   + " Generation: "
                                   + segUnit.simpleSegmentVersion.generation
                                   + "' style='display:block;width:100%'>"
                                   + segUnit.statusDisplay;
                                   if(segUnit.status=="PreSecondary"){
                                        var ratioMigration=Number(segUnit.ratioMigration)*100;
                                        ratioMigration=ratioMigration.toFixed(1)+"%";
                                        $resultHtml = $resultHtml+"("+ratioMigration+")";
                                   }
                                   $resultHtml = $resultHtml
                                   + "</a></td>"

                                   + "<td width='15%' height='30px'  class='info'>"
                                   + segUnit.diskName
                                   + "</td></tr>";
                        } else {
                           $resultHtml = $resultHtml
                                   + "<td width='20%' height='30px'>"
                                   + segUnit.unitType
                                   + "</td>"
                                   + "<td width='20%' height='30px' >"
                                   + segUnit.instanceId
                                   + "</td>"
                                   + "<td width='15%' height='30px' >"
                                   + segUnit.instanceIp
                                   + "</td>"
                                   + "<td width='15%' height='30px' ><a title='Internal Status: "
                                   + segUnit.status
                                   + " Epoch: "
                                   + segUnit.simpleSegmentVersion.epoch
                                   + " Generation: "
                                   + segUnit.simpleSegmentVersion.generation
                                   + "' style='display:block;width:100%'>"
                                   + segUnit.statusDisplay;
                                   if(segUnit.status=="PreSecondary"){
                                        var ratioMigration=Number(segUnit.ratioMigration)*100;
                                        ratioMigration=ratioMigration.toFixed(1)+"%";
                                        $resultHtml = $resultHtml+"("+ratioMigration+")";
                                   }
                                   $resultHtml = $resultHtml
                                   + "</a></td>"
                                   + "<td width='15%' height='30px'>"
                                   + segUnit.diskName
                                   + "</td></tr>";
                        }
                    } else {
                       if (segUnit.unitType == "Primary") {
                           $resultHtml = $resultHtml
                                    + "<tr ><td width='20%' height='30px' style='background:#483D8B;'>"
                                   + segUnit.unitType
                                   + "</td>"
                                   + "<td width='20%' height='30px'  class='info'>"
                                   + segUnit.instanceId
                                   + "</td>"
                                   + "<td width='15%' height='30px'  class='info'>"
                                   + segUnit.instanceIp
                                   + "</td>"
                                   + "<td width='15%' height='30px'  class='info'><a title='Internal Status: "
                                   + segUnit.status
                                   + " Epoch: "
                                   + segUnit.simpleSegmentVersion.epoch
                                   + " Generation: "
                                   + segUnit.simpleSegmentVersion.generation
                                   + "' style='display:block;width:100%'>"
                                   + segUnit.statusDisplay;
                                   if(segUnit.status=="PreSecondary"){
                                        var ratioMigration=Number(segUnit.ratioMigration)*100;
                                        ratioMigration=ratioMigration.toFixed(1)+"%";
                                        $resultHtml = $resultHtml+"("+ratioMigration+")";
                                   }
                                   $resultHtml = $resultHtml
                                   + "</a></td>"
                                   + "<td width='15%' height='30px'  class='info'>"
                                   + segUnit.diskName
                                   + "</td></tr></tr>";
                       } else {
                           $resultHtml = $resultHtml
                                   + "<tr '><td width='20%' height='30px'>"
                                   + segUnit.unitType
                                   + "</td>"
                                   + "<td width='20%' height='30px'>"
                                   + segUnit.instanceId
                                   + "</td>"
                                   + "<td width='15%' height='30px'>"
                                   + segUnit.instanceIp
                                   + "</td>"
                                   + "<td width='15%' height='30px'><a title='Internal Status: "
                                   + segUnit.status
                                   + " Epoch: "
                                   + segUnit.simpleSegmentVersion.epoch
                                   + " Generation: "
                                   + segUnit.simpleSegmentVersion.generation
                                   + "' style='display:block;width:100%'>"
                                   + segUnit.statusDisplay;
                                   if(segUnit.status=="PreSecondary"){
                                        var ratioMigration=Number(segUnit.ratioMigration)*100;
                                        ratioMigration=ratioMigration.toFixed(1)+"%";
                                        $resultHtml = $resultHtml+"("+ratioMigration+")";
                                   }
                                   $resultHtml = $resultHtml
                                   + "</a></td>"
                                   + "<td width='15%' height='30px'>"
                                   + segUnit.diskName
                                   + "</td></tr></tr>";
                       }
                    }
                });
                $("#" + value.segId).html($resultHtml);
                $(".selectpicker").selectpicker("render")
            });
        });
	}
	loadingTable()
	loadingTableTimer=$interval(loadingTable,3000);
    $scope.$on('$destroy',function(){
       $interval.cancel(loadingTableTimer)
    }) 
	var vm = this;
    vm.dtOptionsNode = DTOptionsBuilder.newOptions()
        .withBootstrap()
        .withOption('ajax', {
         data: {volumeId:$scope.volumeId},
         url: 'computeSegmentUnit',
        dataSrc:function(data){
            if(data.resultMessage.message != "success"){
                if (data.resultMessage.message  == "ERROR_0019_SessionOut") {
                    showMessage.show($scope,"warn",translate.getWord("session.out"));
                    $scope.logout();
                }
            }else{
                return data.simpleDatanodesList
            }
            
        },
         type: 'POST'
     })
        .withDataProp('simpleDatanodesList')
        .withOption('processing', false)
        .withOption('serverSide', false)
        .withOption('paginate',false)
        .withOption('searching',false)
        .withOption('info',false)
        .withOption('createdRow', function(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        })
        .withOption('headerCallback', function(header) {
            if (!vm.headerCompiledNode) {
                vm.headerCompiledNode = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('fnDrawCallback',function(){
            
        })
        .withOption('rowId', 'datanodeId');
    vm.dtColumnsNode = [
        DTColumnBuilder.newColumn('datanodeId').withTitle('Datanode ID'),
        DTColumnBuilder.newColumn('datanodeHost').withTitle("主机IP地址"),
        DTColumnBuilder.newColumn('primaryCount').withTitle('Primary'),
        DTColumnBuilder.newColumn('secondCount').withTitle('Secondary'),
        DTColumnBuilder.newColumn('abiterCount').withTitle('Abiter')
    ];                 
    vm.dtInstanceNode = {};

    $scope.reloadDataNode=function(){
        vm.dtInstanceNode.reloadData(null,false);
    }


    vm.dtOptionsDisk = DTOptionsBuilder.newOptions()
        .withBootstrap()
        .withOption('ajax', {
         data: {volumeId:$scope.volumeId},
         url: 'computeSegmentUnit',
        dataSrc:function(data){
            if(data.resultMessage.message != "success"){
                if (data.resultMessage.message  == "ERROR_0019_SessionOut") {
                    showMessage.show($scope,"warn",translate.getWord("session.out"));
                    $scope.logout();
                }
            }else{
                return data.simpleArchivesList
            }
            
        },
         type: 'POST'
     })
        .withDataProp('simpleArchivesList')
        .withOption('processing', false)
        .withOption('serverSide', false)
        .withOption('paginate',false)
        .withOption('searching',false)
        .withOption('info',false)
        .withOption('createdRow', function(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        })
        .withOption('headerCallback', function(header) {
            if (!vm.headerCompiledDisk) {
                vm.headerCompiledDisk = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('fnDrawCallback',function(){
            
        })
        .withOption('rowId', 'dataDiskId');
    vm.dtColumnsDisk = [
        DTColumnBuilder.newColumn('datanodeId').withTitle('Datanode ID'),
        DTColumnBuilder.newColumn('datanodeHost').withTitle("主机IP地址"),
        DTColumnBuilder.newColumn('diskName').withTitle("磁盘名"),
        DTColumnBuilder.newColumn('primaryCount').withTitle('Primary'),
        DTColumnBuilder.newColumn('secondCount').withTitle('Secondary'),
        DTColumnBuilder.newColumn('abiterCount').withTitle('Abiter')
    ];                 
    vm.dtInstanceDisk = {};

    $scope.reloadDataDisk=function(){
        vm.dtInstanceDisk.reloadData(null,false);
    }
});

function keyDown(e){

    if(e.keyCode==13){
        var pageSum=0;
        var page=parseInt($("#jumpNum").val());
        pageSum=parseInt($(".holder > a:nth-last-child(2)").text());

        if(isNaN(pageSum)){
            pageSum=1;
        }
        if(page<=pageSum&&page>=1){
            $("div.holder").jPages( page );
        }
        return false;
    
     }
    
}

(function($, window, document, undefined) {

  var name = "jPages",
      instance = null,
      defaults = {
        containerID: "",
        first: false,
        previous: "prev",
        next: "next",
        last: false,
        links: "numeric", 
        startPage: 1,
        perPage: 10,
        midRange: 5,
        startRange: 1,
        endRange: 1,
        keyBrowse: false,
        scrollBrowse: false,
        pause: 0,
        clickStop: false,
        delay: 50,
        direction: "forward", 
        animation: "", 
        fallback: 400,
        minHeight: false,
        callback: undefined
      };


  function Plugin(element, options) {
    this.options = $.extend({}, defaults, options);

    this._container = $("#" + this.options.containerID);
    if (!this._container.length) return;

    this.jQwindow = $(window);
    this.jQdocument = $(document);

    this._holder = $(element);
    this._nav = {};

    this._first = $(this.options.first);
    this._previous = $(this.options.previous);
    this._next = $(this.options.next);
    this._last = $(this.options.last);

    this._items = this._container.children(":visible");
    this._itemsShowing = $([]);
    this._itemsHiding = $([]);

    this._numPages = Math.ceil(this._items.length / this.options.perPage);
    this._currentPageNum = this.options.startPage;

    this._clicked = false;
    this._cssAnimSupport = this.getCSSAnimationSupport();

    this.init();
  }

  Plugin.prototype = {

    constructor : Plugin,

    getCSSAnimationSupport : function() {
      var animation = false,
          animationstring = 'animation',
          keyframeprefix = '',
          domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
          pfx = '',
          elm = this._container.get(0);

      if (elm.style.animationName) animation = true;

      if (animation === false) {
        for (var i = 0; i < domPrefixes.length; i++) {
          if (elm.style[domPrefixes[i] + 'AnimationName'] !== undefined) {
            pfx = domPrefixes[i];
            animationstring = pfx + 'Animation';
            keyframeprefix = '-' + pfx.toLowerCase() + '-';
            animation = true;
            break;
          }
        }
      }

      return animation;
    },

    init : function() {
      this.setStyles();
      this.setNav();
      this.paginate(this._currentPageNum);
      this.setMinHeight();
    },

    setStyles : function() {
      var requiredStyles = "<style>" +
      ".jp-invisible { visibility: hidden !important; } " +
      ".jp-hidden { display: none !important; }" +
      "</style>";

      $(requiredStyles).appendTo("head");

      if (this._cssAnimSupport && this.options.animation.length)
        this._items.addClass("animated jp-hidden");
      else this._items.hide();

    },

    setNav : function() {
      var navhtml = this.writeNav();

      this._holder.each(this.bind(function(index, element) {
        var holder = $(element);
        holder.html(navhtml);
        this.cacheNavElements(holder, index);
        this.bindNavHandlers(index);
        this.disableNavSelection(element);
      }, this));

      if (this.options.keyBrowse) this.bindNavKeyBrowse();
      if (this.options.scrollBrowse) this.bindNavScrollBrowse();
    },

    writeNav : function() {
      var i = 1, navhtml;
      navhtml = this.writeBtn("first") + this.writeBtn("previous");

      for (; i <= this._numPages; i++) {
        if (i === 1 && this.options.startRange === 0) navhtml += "<span>...</span>";
        if (i > this.options.startRange && i <= this._numPages - this.options.endRange)
          navhtml += "<a href='#' class='jp-hidden'>";
        else
          navhtml += "<a>";

        switch (this.options.links) {
          case "numeric":
            navhtml += i;
            break;
          case "blank":
            break;
          case "title":
            var title = this._items.eq(i - 1).attr("data-title");
            navhtml += title !== undefined ? title : "";
            break;
        }

        navhtml += "</a>";
        if (i === this.options.startRange || i === this._numPages - this.options.endRange)
          navhtml += "<span>...</span>";
      }
      navhtml += this.writeBtn("next") + this.writeBtn("last") + "</div>";
      return navhtml;
    },

    writeBtn : function(which) {
        var tempStr=this.options[which];
        if(which=="next"){
            tempStr='>';
        }else if(which=="previous"){
            tempStr='<';
        }
        return this.options[which] !== false && !$(this["_" + which]).length ?
        "<a  class='jp-" + which + "'>" +tempStr+"</a>" : "";

    },

    cacheNavElements : function(holder, index) {
        this._nav[index] = {};
        this._nav[index].holder = holder;
        this._nav[index].first = this._first.length ? this._first : this._nav[index].holder.find("a.jp-first");
        this._nav[index].previous = this._previous.length ? this._previous : this._nav[index].holder.find("a.jp-previous");
        this._nav[index].next = this._next.length ? this._next : this._nav[index].holder.find("a.jp-next");
        this._nav[index].last = this._last.length ? this._last : this._nav[index].holder.find("a.jp-last");
        this._nav[index].fstBreak = this._nav[index].holder.find("span:first");
        this._nav[index].lstBreak = this._nav[index].holder.find("span:last");
        this._nav[index].pages = this._nav[index].holder.find("a").not(".jp-first, .jp-previous, .jp-next, .jp-last");
        this._nav[index].permPages =
            this._nav[index].pages.slice(0, this.options.startRange)
            .add(this._nav[index].pages.slice(this._numPages - this.options.endRange, this._numPages));
        this._nav[index].pagesShowing = $([]);
        this._nav[index].currentPage = $([]);
    },

    bindNavHandlers : function(index) {
      var nav = this._nav[index];

      nav.holder.bind("click.jPages", this.bind(function(evt) {
        var newPage = this.getNewPage(nav, $(evt.target));
        if (this.validNewPage(newPage)) {
          this._clicked = true;
          this.paginate(newPage);
        }
        evt.preventDefault();
      }, this));

      if (this._first.length) {
        this._first.bind("click.jPages", this.bind(function() {
          if (this.validNewPage(1)) {
            this._clicked = true;
            this.paginate(1);
          }
        }, this));
      }

      if (this._previous.length) {
        this._previous.bind("click.jPages", this.bind(function() {
          var newPage = this._currentPageNum - 1;
          if (this.validNewPage(newPage)) {
            this._clicked = true;
            this.paginate(newPage);
          }
        }, this));
      }

      if (this._next.length) {
        this._next.bind("click.jPages", this.bind(function() {
          var newPage = this._currentPageNum + 1;
          if (this.validNewPage(newPage)) {
            this._clicked = true;
            this.paginate(newPage);
          }
        }, this));
      }

      if (this._last.length) {
        this._last.bind("click.jPages", this.bind(function() {
          if (this.validNewPage(this._numPages)) {
            this._clicked = true;
            this.paginate(this._numPages);
          }
        }, this));
      }

    },

    disableNavSelection : function(element) {
      if (typeof element.onselectstart != "undefined")
        element.onselectstart = function() {
          return false;
        };
      else if (typeof element.style.MozUserSelect != "undefined")
        element.style.MozUserSelect = "none";
      else
        element.onmousedown = function() {
          return false;
        };
    },

    bindNavKeyBrowse : function() {
      this.jQdocument.bind("keydown.jPages", this.bind(function(evt) {
        var target = evt.target.nodeName.toLowerCase();
        if (this.elemScrolledIntoView() && target !== "input" && target != "textarea") {
          var newPage = this._currentPageNum;

          if (evt.which == 37) newPage = this._currentPageNum - 1;
          if (evt.which == 39) newPage = this._currentPageNum + 1;

          if (this.validNewPage(newPage)) {
            this._clicked = true;
            this.paginate(newPage);
          }
        }
      }, this));
    },

    elemScrolledIntoView : function() {
      var docViewTop, docViewBottom, elemTop, elemBottom;
      docViewTop = this.jQwindow.scrollTop();
      docViewBottom = docViewTop + this.jQwindow.height();
      elemTop = this._container.offset().top;
      elemBottom = elemTop + this._container.height();
      return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom));

    },

    bindNavScrollBrowse : function() {
      this._container.bind("mousewheel.jPages DOMMouseScroll.jPages", this.bind(function(evt) {
        var newPage = (evt.originalEvent.wheelDelta || -evt.originalEvent.detail) > 0 ?
        (this._currentPageNum - 1) : (this._currentPageNum + 1);
        if (this.validNewPage(newPage)) {
          this._clicked = true;
          this.paginate(newPage);
        }
        evt.preventDefault();
        return false;
      }, this));
    },

    getNewPage : function(nav, target) {
      if (target.is(nav.currentPage)) return this._currentPageNum;
      if (target.is(nav.pages)) return nav.pages.index(target) + 1;
      if (target.is(nav.first)) return 1;
      if (target.is(nav.last)) return this._numPages;
      if (target.is(nav.previous)) return nav.pages.index(nav.currentPage);
      if (target.is(nav.next)) return nav.pages.index(nav.currentPage) + 2;
    },

    validNewPage : function(newPage) {
      return newPage !== this._currentPageNum && newPage > 0 && newPage <= this._numPages;
    },

    paginate : function(page) {
      var itemRange, pageInterval;
      itemRange = this.updateItems(page);
      pageInterval = this.updatePages(page);
      this._currentPageNum = page;
      if ($.isFunction(this.options.callback))
        this.callback(page, itemRange, pageInterval);

      this.updatePause();
    },

    updateItems : function(page) {
      var range = this.getItemRange(page);
      this._itemsHiding = this._itemsShowing;
      this._itemsShowing = this._items.slice(range.start, range.end);
      if (this._cssAnimSupport && this.options.animation.length) this.cssAnimations(page);
      else this.jQAnimations(page);
      return range;
    },

    getItemRange : function(page) {
      var range = {};
      range.start = (page - 1) * this.options.perPage;
      range.end = range.start + this.options.perPage;
      if (range.end > this._items.length) range.end = this._items.length;
      return range;
    },

    cssAnimations : function(page) {
      clearInterval(this._delay);

      this._itemsHiding
        .removeClass(this.options.animation + " jp-invisible")
        .addClass("jp-hidden");

      this._itemsShowing
        .removeClass("jp-hidden")
        .addClass("jp-invisible");

      this._itemsOriented = this.getDirectedItems(page);
      this._index = 0;

      this._delay = setInterval(this.bind(function() {
        if (this._index === this._itemsOriented.length) clearInterval(this._delay);
        else {
          this._itemsOriented
          .eq(this._index)
          .removeClass("jp-invisible")
          .addClass(this.options.animation);
        }
        this._index = this._index + 1;
      }, this), this.options.delay);
    },

    jQAnimations : function(page) {
      clearInterval(this._delay);
      this._itemsHiding.addClass("jp-hidden");
      this._itemsShowing.fadeTo(0, 0).removeClass("jp-hidden");
      this._itemsOriented = this.getDirectedItems(page);
      this._index = 0;
      this._delay = setInterval(this.bind(function() {
        if (this._index === this._itemsOriented.length) clearInterval(this._delay);
        else {
          this._itemsOriented
          .eq(this._index)
          .fadeTo(this.options.fallback, 1);
        }
        this._index = this._index + 1;
      }, this), this.options.delay);
    },

    getDirectedItems : function(page) {
      var itemsToShow;

      switch (this.options.direction) {
        case "backwards":
          itemsToShow = $(this._itemsShowing.get().reverse());
          break;
        case "random":
          itemsToShow = $(this._itemsShowing.get().sort(function() {
            return (Math.round(Math.random()) - 0.5);
          }));
          break;
        case "auto":
          itemsToShow = page >= this._currentPageNum ?
          this._itemsShowing : $(this._itemsShowing.get().reverse());
          break;
        default:
          itemsToShow = this._itemsShowing;
      }

      return itemsToShow;
    },

    updatePages : function(page) {
      var interval, index, nav;
      interval = this.getInterval(page);
      for (index in this._nav) {
        if (this._nav.hasOwnProperty(index)) {
          nav = this._nav[index];
          this.updateBtns(nav, page);
          this.updateCurrentPage(nav, page);
          this.updatePagesShowing(nav, interval);
          this.updateBreaks(nav, interval);
        }
      }
      return interval;
    },

    getInterval : function(page) {
      var neHalf, upperLimit, start, end;
      neHalf = Math.ceil(this.options.midRange / 2);
      upperLimit = this._numPages - this.options.midRange;
      start = page > neHalf ? Math.max(Math.min(page - neHalf, upperLimit), 0) : 0;
      end = page > neHalf ?
        Math.min(page + neHalf - (this.options.midRange % 2 > 0 ? 1 : 0), this._numPages) :
        Math.min(this.options.midRange, this._numPages);
      return {start: start,end: end};
    },

    updateBtns : function(nav, page) {
      if (page === 1) {
        nav.first.addClass("jp-disabled");
        nav.previous.addClass("jp-disabled");
      }
      if (page === this._numPages) {
        nav.next.addClass("jp-disabled");
        nav.last.addClass("jp-disabled");
      }
      if (this._currentPageNum === 1 && page > 1) {
        nav.first.removeClass("jp-disabled");
        nav.previous.removeClass("jp-disabled");
      }
      if (this._currentPageNum === this._numPages && page < this._numPages) {
        nav.next.removeClass("jp-disabled");
        nav.last.removeClass("jp-disabled");
      }
    },

    updateCurrentPage : function(nav, page) {
      nav.currentPage.removeClass("jp-current");
      nav.currentPage = nav.pages.eq(page - 1).addClass("jp-current");
    },

    updatePagesShowing : function(nav, interval) {
      var newRange = nav.pages.slice(interval.start, interval.end).not(nav.permPages);
      nav.pagesShowing.not(newRange).addClass("jp-hidden");
      newRange.not(nav.pagesShowing).removeClass("jp-hidden");
      nav.pagesShowing = newRange;
    },

    updateBreaks : function(nav, interval) {
      if (
        interval.start > this.options.startRange ||
        (this.options.startRange === 0 && interval.start > 0)
      ) nav.fstBreak.removeClass("jp-hidden");
      else nav.fstBreak.addClass("jp-hidden");

      if (interval.end < this._numPages - this.options.endRange) nav.lstBreak.removeClass("jp-hidden");
      else nav.lstBreak.addClass("jp-hidden");
    },

    callback : function(page, itemRange, pageInterval) {
      var pages = {
            current: page,
            interval: pageInterval,
            count: this._numPages
          },
          items = {
            showing: this._itemsShowing,
            oncoming: this._items.slice(itemRange.start + this.options.perPage, itemRange.end + this.options.perPage),
            range: itemRange,
            count: this._items.length
          };

      pages.interval.start = pages.interval.start + 1;
      items.range.start = items.range.start + 1;
      this.options.callback(pages, items);
    },

    updatePause : function() {
      if (this.options.pause && this._numPages > 1) {
        clearTimeout(this._pause);
        if (this.options.clickStop && this._clicked) return;
        else {
          this._pause = setTimeout(this.bind(function() {
            this.paginate(this._currentPageNum !== this._numPages ? this._currentPageNum + 1 : 1);
          }, this), this.options.pause);
        }
      }
    },

    setMinHeight : function() {
      if (this.options.minHeight && !this._container.is("table, tbody")) {
        setTimeout(this.bind(function() {
          this._container.css({ "min-height": this._container.css("height") });
        }, this), 1000);
      }
    },

    bind : function(fn, me) {
      return function() {
        return fn.apply(me, arguments);
      };
    },

    destroy : function() {
      this.jQdocument.unbind("keydown.jPages");
      this._container.unbind("mousewheel.jPages DOMMouseScroll.jPages");

      if (this.options.minHeight) this._container.css("min-height", "");
      if (this._cssAnimSupport && this.options.animation.length)
        this._items.removeClass("animated jp-hidden jp-invisible " + this.options.animation);
      else this._items.removeClass("jp-hidden").fadeTo(0, 1);
      this._holder.unbind("click.jPages").empty();
    }

  };

  $.fn[name] = function(arg) {
    var type = $.type(arg);

    if (type === "object") {
      if (this.length && !$.data(this, name)) {
        instance = new Plugin(this, arg);
        this.each(function() {
          $.data(this, name, instance);
        });
      }
      return this;
    }

    if (type === "string" && arg === "destroy") {
      instance.destroy();
      this.each(function() {
        $.removeData(this, name);
      });
      return this;
    }

    if (type === 'number' && arg % 1 === 0) {
      if (instance.validNewPage(arg)) instance.paginate(arg);
      return this;
    }

    return this;
  };

})(jQuery, window, document);


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

angular.module('app.storage').controller('VolumePerformanceDataCtrl', function ($timeout, $rootScope, $scope, $interval, $http, DTOptionsBuilder, showMessage, goPage, DTColumnBuilder, $compile, translate, $stateParams, $state) {

  $(".modal").draggable();
  var vm = this;
  vm.stopBtn = true;
  vm.startBtn = false;
  $scope.volumeId = $stateParams.volumeId;
  $scope.oldInputVal = "";
  var chartTempArr = [];
  var timer;
  vm.dtInstanced = {};
  vm.dtInstancea = {};
  var driverLength;
  var ruleLength;
  var right = $(".detail_right").outerHeight();
  var left = $(".detail_content").outerHeight();
  $(".detail_content").css("min-height", right + "px")
  $(".detail_right").css("min-height", right + "px")
  $scope.$watch('$viewContentLoaded', function (event) {
    setTimeout(function () {
      right = $(".detail_right").outerHeight();
      $(".detail_content").css("min-height", right + "px")
    }, 1);

  });

  $scope.performanceStart = false;
  $scope.testStatus = function () {
    $http({
      method: "post",
      data: { 'idsJson': JSON.stringify([$scope.volumeId]) },
      async: false,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      url: "listVolume",
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(data) {
      data = data.data.volumeList[0];
      $scope.volumeName = data.volumeName;
      $("#description").html(data.description || "<span class='none_info'>无</span>");
      let podStr = ""

      $scope.volumeSize = data.volumeSize / 1024;
      $scope.totalPhysicalSpace = data.totalPhysicalSpace / 1024;
      $scope.availableSize = ((data.volumeSize * data.freeSpaceRatio) / 1024).toFixed(1);
      if (data.usedSpaceForCsi == "" || data.usedSpaceForCsi == null) {
        $scope.usedSpaceForCsi = ""
      } else {
        $scope.usedSpaceForCsi = byteFormat(data.usedSpaceForCsi);
      }
      $scope.totalSpaceFroCsi = byteFormat(data.totalSpaceFroCsi);
      var readOnlyStr = "";
      if (data.readOnlyForCsi == "false") {
        resultString = "否";
      } else if (data.readOnlyForCsi == "true") {
        resultString = "是";
      }
      $("#readOnlyForCsi").html(readOnlyStr || "<span class='none_info'>无</span>");
      $scope.volumeSize = data.volumeSize / 1024;
      $scope.usedSize = ((data.volumeSize * 1 - data.volumeSize * data.freeSpaceRatio) / 1024).toFixed(1);
      var resultString = ""
      $scope.status = false;
      switch (data.volumeStatus) {
        case "Available":
          $scope.status = true;
          resultString = "<span class='label label-success status-static'>" + translate.getWord('status.available') + "</span>"; break;
        case "Stable":
          $scope.status = true;
          resultString = "<span class='label label-success status-static'>" + translate.getWord('status.stable') + "</span>"; break;
        case "Unavailable":
          resultString = "<span class='label label-danger status-static'>" + translate.getWord('status.unavailable') + "</span>"; break;

        case "Deleted":
          resultString = "<span class='label label-danger status-static'>" + translate.getWord('status.deleted') + "</span>"; break;
        case "ToBeCreated":
          resultString = '<div class="progress progress-striped active" >' +
            '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.toBeCreated") + '</span></div></div>'; break;
        case "CREATING":
          resultString = '<div class="progress progress-striped active" >' +
            '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.creating") + '</span></div></div>'; break;
        case "EXTENDING":
          resultString = '<div class="progress progress-striped active" >' +
            '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.extending") + '</span></div></div>'; break;
        case "CLONING":
          resultString = '<div class="progress progress-striped active" >' +
            '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.cloning") + '</span></div></div>'; break;
        case "DELETING":
          resultString = '<div class="progress progress-striped active" >' +
            '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.deleting") + '</span></div></div>'; break;
        case "BEING_CLONED":
          resultString = '<div class="progress progress-striped active" >' +
            '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.being.cloned") + '</span></div></div>'; break;
        case "MOVING":
          resultString = '<div class="progress progress-striped active" >' +
            '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.moving") + '</span></div></div>'; break;
        case "BEING_MOVED":
          resultString = '<div class="progress progress-striped active" >' +
            '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.being.moved") + '</span></div></div>'; break;
        case "MOVE_ONLINE_MOVING":
          resultString = '<div class="progress progress-striped active" ">' +
            '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.moving.online") + '</span></div></div>'; break;
        case "MOVE_ONLINE_BEING_MOVED":
          resultString = '<div class="progress progress-striped active" ">' +
            '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.being.moved.online") + '</span></div></div>'; break;
        case "COPYING":
          resultString = '<div class="progress progress-striped active" >' +
            '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.copying") + '</span></div></div>'; break;
        case "BEING_COPIED":
          resultString = '<div class="progress progress-striped active" >' +
            '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.being.copied") + '</span></div></div>'; break;
        case "FIXING":
          resultString = '<div class="progress progress-striped active" >' +
            '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.fixing") + '</span></div></div>'; break;
        case "RECYCLING":
          resultString = '<div class="progress progress-striped active" >' +
            '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">' + translate.getWord("status.recycling") + '</span></div></div>'; break;

      }
      $("#volumeStatus").html(resultString);
      $scope.volumeDomain = data.volumeDomain;
      $scope.storagePoolName = data.storagePoolName;
      switch (data.volumeType) {
        case "SMALL":
          $scope.volumeType = "2副本"; break;
        case "REGULAR":
          $scope.volumeType = "3副本"; break;
        case "LARGE":
          $scope.volumeType = "3副本(高可靠)"; break;
      }
      $scope.createTime = fillDate(data.createTime);
      $scope.srcVolumeNameWithClone = data.srcVolumeNameWithClone;
      $scope.srcSnapshotNameWithClone = data.srcSnapshotNameWithClone;
      var string = "";
      var speed = "";
      if (data.migrationSpeed >= 1024) {
        speed = speed + (data.migrationSpeed / 1024).toFixed(1) + "M/s"
      } else {
        speed = speed + data.migrationSpeed + "K/s"
      }
      if (data.migrationRatio == "100.0") {
        string += "无重构";
      } else {
        var str = parseInt((data.migrationRatio) * 100) / 100 + "%" + "(" + speed + ")";
        string += '<div class="progress progress-striped active" style="height:20px;border-radius:4px;margin:0px;width:110px">'
          + '<div class="progress-bar progress-bar-primary" role="progressbar"  style="width: 100%" ><span>'
          + str + '</span></div></div>';
      }
      $("#migrationSpeed").html(data.volumeStatus == "CREATING" ? "无重构" : string);
      if (data.rebalanceRatio * 1 == 1) {
        string = "无进度"
      } else {
        string = '<div class="progress progress-striped active" >'
          + '<div class="progress-bar progress-bar-primary" role="progressbar" title="版本号: ' + data.rebalanceVersion + '" style="width: 100%" ><span>'
          + parseInt(data.rebalanceRatio * 100) + '%</span></div></div>';
      }
      $("#rebalanceSpeed").html(string);
      resultString = ""
      switch (data.volumeBuildType) {
        case "CLONE":
          resultString = "克隆"; break;
        case "CREATE":
          resultString = "创建"; break;
        case "MOVE":
          resultString = "迁移"; break;
        case "MOVE_ONLINE":
          resultString = "在线迁移"; break;
        case "SYNC_CLONE":
          resultString = "克隆"; break;
      }
      $scope.volumeBuildType = resultString;
      if (data.migrationRatio != "100.0" || data.rebalanceRatio * 1 != 1 || data.volumeStatus == "CREATING" || data.volumeStatus == "EXTENDING" || data.volumeStatus == "DELETING" || data.volumeStatus == "RECYCLING" || data.volumeStatus == "FIXING" || data.volumeStatus == "MOVING" || data.volumeStatus == "CLONING" || data.volumeStatus == "BEING_CLONED" || data.volumeStatus == "BEING_MOVED" || data.volumeStatus == "COPING" || data.volumeStatus == "BEING_COPIED" || data.volumeStatus == "Deleted") {
        $timeout.cancel(timer)
        timer = $timeout($scope.testStatus, 3000);
      }
    });
  }
  $scope.testStatus()


  $scope.inputEdit = function () {
    $("#inputVal").removeAttr("disabled");
    $("#inputVal").focus();
  }

  $scope.inputSave = function () {
    var val = $("#inputVal").val();
    var reg = /^[1-9]\d*$/;
    if (reg.test(val) || val == "") {
      $("#inputVal").attr("disabled", "disabled");
      $scope.oldInputVal = val;

    } else {
      showMessage.show($scope, "error", "请输入正整数");
    }
  }
  $scope.reloadData = function(){
    vm.dtInstanced.reloadData(null,false)
  }
 
  
  vm.dtOptiond = DTOptionsBuilder.newOptions()
    .withDOM("t")
    .withBootstrap()
    .withOption('ajax', {
      url: BASE_API + 'getVolumeDetail',
      data: {
        volumeId: $scope.volumeId,
        getVolumeWithSegmentList: "0"
      },
      dataSrc: function (data) {
        if (data.resultMessage.message != "success") {
          if (data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
          }
        } else {
          if (data.simpleVolumeMetadata.driverMetadatas != null) {
            driverLength = data.simpleVolumeMetadata.driverMetadatas.length;
            return data.simpleVolumeMetadata.driverMetadatas;
          } else {
            driverLength = 0;
            return []
          }
        }

      },
      type: 'POST'
    })
    .withOption('processing', false)
    .withOption('serverSide', false)
    .withOption('paginate', false)
    .withOption('searching', false)
    .withOption('info', false)
    .withOption('fnDrawCallback', function (result) {
      if (driverLength > 0) {
        $(".driverTable").next().find(".dataTables_paginate").show()
      } else {
        $(".driverTable").next().find(".dataTables_paginate").hide()
      }
      $(".selectpicker").selectpicker("refresh")

    })
    .withOption('createdRow', function (row, data, dataIndex) {
      $compile(angular.element(row).contents())($scope);
    })
    .withOption('headerCallback', function (header) {
      if (!vm.headerCompiled) {
        vm.headerCompiled = true;
        $compile(angular.element(header).contents())($scope);
      }
    })
    .withLanguage({
      "search": "",
      "searchPlaceholder": "过滤",
      "aria": {
        "sortAscending": ": activate to sort column ascending",
        "sortDescending": ": activate to sort column descending"
      },
      "emptyTable": "表中数据为空",
      "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
      "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
      "order": [[2, "asc"]],
      "infoFiltered": "(由 _MAX_ 项结果过滤)",
      "zeroRecords": "表中数据为空",
      "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +


        '<option value="5" >5条</option>' +
        '<option value="10" >10条</option>' +
        '<option value="20" >20条</option>' +
        '<option value="50" >50条</option>' +
        '<option value="100" >100条</option>' +
        '</select>&nbsp',
      "paginate": {
        "previous": '<i class="fa fa-angle-left"></i>',
        "next": '<i class="fa fa-angle-right"></i>',
        "last": '<i class="fa  fa-angle-double-right"></i>',
        "first": '<i class="fa  fa-angle-double-left"></i>'
      }
    })
    .withPaginationType('full_numbers');

  vm.dtColumnd = [

    DTColumnBuilder.newColumn('volumeId').withTitle("id").notVisible(),
    DTColumnBuilder.newColumn('driverName').withTitle("驱动名称")
      .renderWith(function (data, type, row) {
        return "<a ng-click='goDriver(\"" + data + "\")' >" + data + '</a>';
      }),
    DTColumnBuilder.newColumn(null).withTitle("快照ID")
      .renderWith(function (data, type, row) {
        if (row.snapshotId == 0) {
          return "----------";
        } else {
          return row.snapshotId;
        }
      }),
    DTColumnBuilder.newColumn('status').withTitle("驱动状态")
      .renderWith(function (data, type, row) {
        var typeString;
        switch (data) {
          case "START":
            typeString = "<span class='status_green'>" + translate.getWord("status.start") + "</span>"; break;
          case "LAUNCHED":
            typeString = "<span class='status_green'>" + translate.getWord("status.launched") + "</span>"; break;
          case "ERROR":
            typeString = "<span class='status_red'>" + translate.getWord("status.error") + "</span>"; break;
          case "LAUNCHING":
            typeString = '<div class="progress progress-striped active" style="margin:0px;border-radius:2px">' +
              '<div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>' + translate.getWord("status.launching") + '</span></div></div>'; break;
          case "REMOVING":
            typeString = '<div class="progress progress-striped active" style="margin:0px;border-radius:2px">' +
              '<div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>' + translate.getWord("status.removing") + '</span></div></div>'; break;
          case "UNAVAILABLE":
            typeString = "<span class='status_red'>" + translate.getWord("status.removing") + "</span>"; break;
          case "RECOVERING":
            typeString = '<div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>恢复中</span></div></div>'; break;
          case "MIGRATING":
            typeString = '<div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>迁移中</span></div></div>'; break;
          default:
            typeString = "<span class='status_orange'>" + translate.getWord("status.unknown") + "</span>"; break;

        }
        return typeString
      }),
    DTColumnBuilder.newColumn('driverContainerIp').withTitle("驱动容器IP"),
    DTColumnBuilder.newColumn(null).withTitle("驱动类型")
      .renderWith(function (data, type, row) {
        if (row.driverType == 'NBD') {
          return "PYD";
        } else {
          return row.driverType;
        }
      }),
    DTColumnBuilder.newColumn('host').withTitle("驱动地址"),
    DTColumnBuilder.newColumn('port').withTitle("驱动端口"),
    DTColumnBuilder.newColumn('clientAmount').withTitle("驱动用户数量"),
    DTColumnBuilder.newColumn('chapControl').withTitle("chap认证")
      .renderWith(function (data, type, row) {
        var str = '';
        if (data == 1) {
          str = '是';
        } else {
          str = '否';
        }
        return row.driverType == "ISCSI" ? str : '';
      }),
    DTColumnBuilder.newColumn('driverClientInfoList').withTitle("驱动用户信息")
      .renderWith(function (data, type, row) {
        var driverClientString = "";
        if (data && data.length) {
          $.each(data, function (h, ele) {
            driverClientString = driverClientString + ele.host.replace(/\//g, "") + " "
            switch (ele.authority) {
              case "READ":
                driverClientString = driverClientString + translate.getWord("volume.readOnly"); break;
              case "READWRITE":
                driverClientString = driverClientString + translate.getWord("volume.readWrite"); break;
            }
            driverClientString = driverClientString + "<br/>"
          })
        }
        return driverClientString == "" ? "" : driverClientString
      })
  ];
  vm.dtInstanced = {};

  $scope.goVolume = function (name) {
    $state.go('app.storage.volume', { volumeName: name });
  }
  var clearWatch = $rootScope.$watch("socketStatus", function (newVal, oldVal) {
    if ($rootScope.Websocket.websocket && $rootScope.Websocket.websocket.readyState == WebSocket.OPEN) {
      if (vm.startBtn == true)
        $scope.onmessageVolume();
    }

  }, true);

  $scope.goDriver = function (name) {
    $state.go('app.storage.allDriver', { driverName: name });
  }
  $scope.checkDriver = function () {
    $http({
      method: "POST",
      data: {
        volumeId: $scope.volumeId,
        withSegmentList: "0"
      },
      async: false,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      url: BASE_API + "getVolumeDetail",
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(data) {
      data = data.data;
      if (data.resultMessage.message != "success") {
        if (data.resultMessage.message == "ERROR_0019_SessionOut") {
          showMessage.show($scope, "warn", translate.getWord("session.out"));
          $scope.logout();
        }
      } else {

        if (data.simpleVolumeMetadata.driverMetadatas != null) {
          $scope.onmessageVolume();
          vm.startBtn = true;
        } else {
          showMessage.show($scope, "warn", "请先挂载驱动");
        }
      }
    });

  }
})

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

angular.module('app.storage').directive('usedDatanode', function() {
 	 return {
 	 	restrict:'E',
 	 	replace:true,
 	 	scope:{
            currentid:'@'
 	 	},
 	 	template:'',
       
 	 }
 	    
 });
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

angular.module('app.storage').service('goPage', function(translate) {
   	$.extend(true, $.fn.dataTable.defaults, {
		"dom": "<'row'<'col-md-6 col-sm-6'l><'col-md-6 col-sm-6'f>r><'table-scrollable't><'row'<'col-md-5 col-sm-5'i><'col-md-7 col-sm-7'p>>", 
		"language": {
			"lengthMenu": " _MENU_ records ",
			"paginate": {
				"previous": '<i class="fa fa-angle-left"></i>',
				"next": '<i class="fa fa-angle-right"></i>'
			}
		}
	});

	$.extend($.fn.dataTableExt.oStdClasses, {
		"sWrapper": "dataTables_wrapper",
		"sFilterInput": "form-control input-small input-inline",
		"sLengthSelect": "form-control input-xsmall input-inline"
	});

	$.fn.dataTable.defaults.renderer = 'bootstrap';
	$.fn.dataTable.ext.renderer.pageButton.bootstrap = function (settings, host, idx, buttons, page, pages) {
		var api = new $.fn.dataTable.Api(settings);
		var classes = settings.oClasses;
		var lang = settings.oLanguage.oPaginate;
		var btnDisplay, btnClass;

		var attach = function (container, buttons) {
			var i, ien, node, button;
			var clickHandler = function (e) {
				e.preventDefault();
				if (e.data.action !== 'ellipsis') {
					api.page(e.data.action).draw(false);
				}
			};

			for (i = 0, ien = buttons.length; i < ien; i++) {
				button = buttons[i];

				if ($.isArray(button)) {
					attach(container, button);
				} else {
					btnDisplay = '';
					btnClass = '';

					switch (button) {
					case 'ellipsis':
						btnDisplay = '&hellip;';
						btnClass = 'disabled';
						break;

					case 'first':
						btnDisplay = lang.sFirst;
						btnClass = button + (page > 0 ?
							'' : ' disabled');
						break;

					case 'previous':
						btnDisplay = lang.sPrevious;
						btnClass = button + (page > 0 ?
							'' : ' disabled');
						break;

					case 'next':
						btnDisplay = lang.sNext;
						btnClass = button + (page < pages - 1 ?
							'' : ' disabled');
						break;

					case 'last':
						btnDisplay = lang.sLast;
						btnClass = button + (page < pages - 1 ?
							'' : ' disabled');
						break;

					default:
						btnDisplay = button + 1;
						btnClass = page === button ?
							'active' : '';
						break;
					}

					if (btnDisplay) {
						node = $('<li>', {
							'class': classes.sPageButton + ' ' + btnClass,
							'aria-controls': settings.sTableId,
							'tabindex': settings.iTabIndex,
							'id': idx === 0 && typeof button === 'string' ?
								settings.sTableId + '_' + button : null
						})
							.append($('<a>', {
									'href': '#'
								})
								.html(btnDisplay)
						)
							.appendTo(container);

						settings.oApi._fnBindAction(
							node, {
								action: button
							}, clickHandler
						);
					}
					if($("#redirect")!=null)
					$(".gotoPage").remove();
					var pageHtml="<li class=\"gotoPage\" style=\"display:none\">" 
					+"<span style='border-radius:0 4px 4px 0;'>"+translate.getWord("jumpPage.left")+"<input type=\"text\" style='border-radius:2px;width: 20px;height: 16px;margin:-1px 5px;text-align: center;border:1px solid #ccc;' id=\"redirect\" class=\"redirect\">"+translate.getWord("jumpPage.right")+"</span></li>";
					$(pageHtml).appendTo(container); 

				}
			}
		};

		attach(
			$(host).empty().html('<ul class="pagination"/>').children('ul'),
			buttons
		);
	}

	if ($.fn.DataTable.TableTools) {
		// Set the classes that TableTools uses to something suitable for Bootstrap
		$.extend(true, $.fn.DataTable.TableTools.classes, {
			"container": "DTTT btn-group",
			"buttons": {
				"normal": "btn btn-default",
				"disabled": "disabled"
			},
			"collection": {
				"container": "DTTT_dropdown dropdown-menu",
				"buttons": {
					"normal": "",
					"disabled": "disabled"
				}
			},
			"print": {
				"info": "DTTT_Print_Info"  
			},
			"select": {
				"row": "active"
			}
		});

		// Have the collection use a bootstrap compatible dropdown
		$.extend(true, $.fn.DataTable.TableTools.DEFAULTS.oTags, {
			"collection": {
				"container": "ul",
				"button": "li",
				"liner": "a"
			}
		});
	}

	$.fn.dataTableExt.oApi.fnPagingInfo = function (oSettings) {
		return {
			"iStart": oSettings._iDisplayStart,
			"iEnd": oSettings.fnDisplayEnd(),
			"iLength": oSettings._iDisplayLength,
			"iTotal": oSettings.fnRecordsTotal(),
			"iFilteredTotal": oSettings.fnRecordsDisplay(),
			"iPage": oSettings._iDisplayLength === -1 ?
				0 : Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength),
			"iTotalPages": oSettings._iDisplayLength === -1 ?
				0 : Math.ceil(oSettings.fnRecordsDisplay() / oSettings._iDisplayLength)
		};
	};

	
	
	this.goTo=function(id){
		var oTable = $("#"+id).dataTable();
		$(".gotoPage").css("display","inline")
		$('#redirect').keyup(function(e){
			if(e.keyCode==13){
				if($(this).val() && $(this).val()>0){
					var redirectpage = $(this).val()-1;
				}else{
					var redirectpage = 0;
				}
				oTable.fnPageChange( redirectpage );
			}
		});
	}

});



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

"use strict"
angular
  .module("app.storage")
  .controller(
  "ComponentCtrl",function (
    $scope,
    $interval,
    DTOptionsBuilder,
    showMessage,
    DTColumnBuilder,
    $compile,
    translate,
    ) 
  {
    $(".modal").draggable();
    var vm = this;
    var intervalTimer
    $scope.showFlag = 1;

    function changeTime() {
      $interval.cancel(intervalTimer)
      intervalTimer = $interval(serviceInterval, 5000)
    }

    function stopTimer() {
      $interval.cancel(intervalTimer)
    }

    $scope.$watch('showFlag',function () {
      stopTimer()
    })

    function serviceInterval() {
      if ($scope.showFlag==1) {
        vm.dtInstance.reloadData(null,false)
      }
    }

    $scope.$on('$destroy', function () {
      $interval.cancel(intervalTimer);
    })

    vm.dtOptions = DTOptionsBuilder.newOptions()
    .withDOM(
      "<'dt-toolbar'<'col-xs-12 col-sm-3'l><'col-sm-9 col-xs-12 hidden-xs'f>r>" +
        "t" +
        "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>"
    )
    .withBootstrap()
    .withOption("ajax", {
      url: "checkZookeeperStatus",
      type: 'post',
      dataSrc: function (data) {
        if (data.resultMessage.message == 'ERROR_0019_SessionOut') {
          showMessage.show(
            $scope,
            'warn',
            translate.getWord('session.out')
          )
          $scope.logout()
          return
        }
        return data.zookeeperStatusList
      },
    })
    .withOption('processing', false)
    .withOption('serverSide', false)  
    .withOption("pageLength", 20)
    .withOption("createdRow", function (row, data, dataIndex) {
      $compile(angular.element(row).contents())($scope);
    })
    .withOption("headerCallback", function (header) {
      $compile(angular.element(header).contents())($scope);
    })
    .withOption("fnInitComplete", function (result) {
      $('#zookeeperTab thead tr th').eq(0).css('width','700px').next().css('width','800px')
      $(".selectpicker").selectpicker("render");
    })
    .withOption("fnDrawCallback", function (result) {
      $(".selectpicker").selectpicker("render");
      $("#zookeeperTab_filter").find("input").addClass("filter_input");
      $(".zookClearItem").remove();
      $('<i class="fa fa-times-circle item-error-style zookClearItem" onclick="clearFilter(\''+"zookeeperTab_filter"+"')\"></i>"
      ).insertAfter($("#zookeeperTab_filter").find("input"));
      $("#zookeeperTab_filter input").val()? $(".zookClearItem").show() : $(".zookClearItem").hide()
      $("#zookeeperTab_filter input").unbind("keyup", showItem);
      $("#zookeeperTab_filter input").bind("keyup", { cName: "zookClearItem" }, showItem);
      $(".zookClearItem").click(function (e) {
        e.stopPropagation();
        e.preventDefault();
        $("#zookeeperTab").DataTable().search("").draw();
      });
      changeTime();
    })
    .withLanguage({
      search: "",
      searchPlaceholder: "节点查询",
      aria: {
        sortAscending: ": activate to sort column ascending",
        sortDescending: ": activate to sort column descending",
      },
      emptyTable: "表中数据为空",
      info: "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
      infoEmpty: "显示第 0 至 0 项结果，共 0 项",
      infoFiltered: "(由 _MAX_ 项结果过滤)",
      zeroRecords: "表中数据为空",
      lengthMenu:
        "显示" +
        '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
        '<option value="5" >5条</option>' +
        '<option value="10" >10条</option>' +
        '<option value="20" >20条</option>' +
        '<option value="50" >50条</option>' +
        '<option value="100" >100条</option>' +
        "</select>",
      paginate: {
        previous: '<i class="fa fa-angle-left"></i>',
        next: '<i class="fa fa-angle-right"></i>',
        last: '<i class="fa  fa-angle-double-right"></i>',
        first: '<i class="fa  fa-angle-double-left"></i>',
      },
    });

    vm.dtColumns = [
      DTColumnBuilder.newColumn('hostname').withTitle('节点ip'),
      DTColumnBuilder.newColumn('status').withTitle('服务状态')
        .renderWith(function (data,tpye,row) {
          switch(data){
            case 'OK':
              return '<span class="status_green">' + "正常" + '</span>'
            case 'ERROR':
              return '<span class="status_red">' + "断开连接" + '</span>'
            default:
              return '<span class="status_red">' + "断开连接" + '</span>'
          }
        }),
    ]

    vm.dtInstance = {};

    $scope.reloadData = function () {
      vm.dtInstance.reloadData(null,false)
    }
    
    $scope.refresh = function () {
      $scope.reloadData()
    }
})

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

angular.module('app.system').controller('OperationLogCtrl', function ($rootScope,$scope,translate, $interval,$http,DTOptionsBuilder,showMessage, DTColumnBuilder,$compile) {
	$(".modal").draggable();
	$scope.selectGroups=['5','10','20','50','100'];
	$scope.startTime="";
	$scope.endTime="";
	$scope.startNum=0;
	var logInterval;
	var timerFlag=true;
	var accountNameSearchGlobal="",
	typeSearchGlobal="",
	filterStatusGlobal="",
	targetTypeSearchGlobal="",
	operationObjectSearchGlobal="",
	startTimeGlobal="",
	endTimeGlobal="";

	$scope.loadTab=function(){
		$scope.perpage_num=$("#operationlog_select").val()||5;
		timerFlag=false;
		$http({
			method: "post",
			data:{
				"status":filterStatusGlobal,
				"accountName":accountNameSearchGlobal,
				"operationType":typeSearchGlobal,
				"targetType":targetTypeSearchGlobal,
				"targetName":operationObjectSearchGlobal,
				"startTime":startTimeGlobal,
				"endTime":endTimeGlobal,
				"start":$scope.startNum,
				"length":$scope.perpage_num
			},
			async:false,
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },  
			url:"listOperationLogByTime",  
			transformRequest: function(obj) {  
				var str = [];  
				for (var s in obj) {  
					str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));  
				}
				return str.join("&");  
			}
		}).then(function successCallback(data){
			data=data.data;
			timerFlag=true;
			if(data.resultMessage.message != "success"){
				if (data.resultMessage.message  == "ERROR_0019_SessionOut") {
					showMessage.show($scope,"warn",translate.getWord("session.out"));
					$scope.logout();
				}
			}else{
				$scope.totalSize=data.totalRecord;
				$scope.pageNum=Math.ceil($scope.totalSize/$scope.perpage_num);
				$(".selectpicker").selectpicker("render");
				var resultStr="";
				$scope.dataLength=0;
				if(!data.operationLogFormatList.length){
					var tempStr='<tr class="odd"><td colspan="8" class="dataTables_empty" valign="top">表中数据为空</td></tr>';
					$("#operationlogTab tbody").html(tempStr)
					$("#opertationlog_pagination").html("")
					return ;
				}
				for (var i = 0; i < data.operationLogFormatList.length; i++) {
					var tempObj=data.operationLogFormatList[i];
					resultStr+='<tr  role="row" class="operationlog_time">'
						+'<td colspan="8">'
							+'<p class="operationlog_p">'+$scope.getObjDate(tempObj.dayTime)+'</p>'
						+'</td>'
					+'</tr>';
					for (var j = 0; j < tempObj.operationList.length; j++) {
						$scope.dataLength++;
						var tempData=tempObj.operationList[j];
						resultStr+='<tr class="operationlog_data" role="row"><td><span>'+tempData.accountName+'</span></td>'
						+'<td><span>'+translate.getWord(tempData.type)+'</span></td>'
						+'<td><span>'+translate.getWord(tempData.targetType)+'</span></td>'
						+'<td><span>';
						if(tempData.targetName==null||tempData.targetName==""){
							resultStr+=tempData.operationObject;
						}else if(tempData.operationObject==null||tempData.operationObject==""){
							resultStr+=tempData.targetName;
						}else if(tempData.operationObject=="priorityService"||tempData.operationObject=="priorityRefactor"){
							resultStr+=tempData.targetName+"("+translate.getWord(tempData.operationObject)+")"
						}else{
							resultStr+=tempData.targetName+"("+tempData.operationObject+")"
						}
						resultStr+='</span></td>'
						+'<td><span>';

						if(tempData.status!="ACTIVITING"){
							switch(tempData.status){
								case "SUCCESS":
									resultStr+="<div><span class='status_green'>"+translate.getWord("success")+"</span></div>";break;
								case "FAILED":
									resultStr+="<div><span class='status_red'>"+translate.getWord("fail")+"</span></div>";break;
							}
						}else{
							resultStr+="<div class='progress progress-striped active' >"
								+"<div class='progress-bar' role='progressbar'  style='width:100%'>"
									+"<span >"
										+tempData.progress+"%"
									+"</span>"
								+"</div>"
							+"</div>"
						}
						resultStr+='</span></td>'
						+'<td><span>'+fillDate(tempData.startTime)+'</span></td>'
						+'<td><span>'+fillDate(tempData.endTime)+'</span></td>'
						+'<td><span>'+(tempData.errorMessage==null?'&nbsp;':tempData.errorMessage)+'</span></td></tr>';
					}
				}
				$("#operationlogTab tbody").html(resultStr)
				$scope.currentNum=Math.floor($scope.startNum/$scope.perpage_num)+1;
				var pageStr='';
				if($scope.currentNum==1){
					pageStr+='<li class="paginate_button first disabled"><a onclick="event.preventDefault()"><i class="fa  fa-angle-double-left"></i></a></li>'
					+'<li class="paginate_button previous disabled" ><a onclick="event.preventDefault()"><i class="fa fa-angle-left"></i></a></li>';
				}else{
					pageStr+='<li class="paginate_button first"><a ng-click="goPage(1)"><i class="fa  fa-angle-double-left"></i></a></li>'
					+'<li class="paginate_button previous " ><a ng-click="goPage('+($scope.currentNum-1)+')"><i class="fa fa-angle-left"></i></a></li>';
				}
				if($scope.pageNum<=7){
					for (var i = 1; i <= $scope.pageNum; i++) {
						if(i==$scope.currentNum){
							pageStr+='<li class="paginate_button active"><a>'+i+'</a></li>'
						}else{
							pageStr+='<li class="paginate_button"><a ng-click="goPage('+i+')">'+i+'</a></li>'
						}
					}
				}else{
					if($scope.currentNum<=4){
						for (var i = 1; i <=5; i++) {
							if(i==$scope.currentNum){
								pageStr+='<li class="paginate_button active"><a>'+i+'</a></li>'
							}else{
								pageStr+='<li class="paginate_button"><a ng-click="goPage('+i+')">'+i+'</a></li>'
							}
						}
						pageStr+='<li class="paginate_button disabled"><a onclick="event.preventDefault()">...</a></li>'
							+'<li class="paginate_button"><a ng-click="goPage('+$scope.pageNum+')">'+$scope.pageNum+'</a></li>'
					}else if($scope.currentNum>=($scope.pageNum-3)){
						pageStr+='<li class="paginate_button"><a  ng-click="goPage(1)">1</a></li>'
							+'<li class="paginate_button disabled"><a onclick="event.preventDefault()">...</a></li>';
						for (var i = 4; i >=0; i--) {
							if($scope.pageNum-i==$scope.currentNum){
								pageStr+='<li class="paginate_button active"><a>'+($scope.pageNum-i)+'</a></li>'
							}else{
								pageStr+='<li class="paginate_button"><a  ng-click="goPage('+($scope.pageNum-i)+')">'+($scope.pageNum-i)+'</a></li>'
							}
						}
					}else{
						pageStr+='<li class="paginate_button"><a  ng-click="goPage(1)">1</a></li>'
							+'<li class="paginate_button disabled"><a onclick="event.preventDefault()">...</a></li>'
							+'<li class="paginate_button"><a  ng-click="goPage('+($scope.currentNum-1)+')">'+($scope.currentNum-1)+'</a></li>'
							+'<li class="paginate_button active"><a>'+$scope.currentNum+'</a></li>'
							+'<li class="paginate_button"><a  ng-click="goPage('+($scope.currentNum+1)+')">'+($scope.currentNum+1)+'</a></li>'
							+'<li class="paginate_button disabled"><a onclick="event.preventDefault()">...</a></li>'
							+'<li class="paginate_button"><a  ng-click="goPage('+$scope.pageNum+')">'+$scope.pageNum+'</a></li>'
					}
				}
				if($scope.currentNum==$scope.pageNum){
					pageStr+='<li class="paginate_button next disabled"><a onclick="event.preventDefault()"><i class="fa fa-angle-right"></i></a></li>'
					+'<li class="paginate_button last disabled"><a onclick="event.preventDefault()"><i class="fa  fa-angle-double-right"></i></a></li>';
				}else{
					pageStr+='<li class="paginate_button next"><a ng-click="goPage('+($scope.currentNum+1)+')"><i class="fa fa-angle-right"></i></a></li>'
					+'<li class="paginate_button last"><a ng-click="goPage('+$scope.pageNum+')"><i class="fa  fa-angle-double-right"></i></a></li>';
				}
				$("#opertationlog_pagination").html($compile(pageStr)($scope))
			}
		});
	}

	$scope.loadTab()

	$scope.goPage=function(num){
		$scope.startNum=(num-1)*$scope.perpage_num;
		$scope.loadTab()
	}

	$scope.search=function(){
		$scope.startNum=0;
		var startTime=(new Date($("#startTime").val().split("-").join("/")+" 00:00:00")).getTime()||"";
		 var endTime=((new Date($("#endTime").val().split("-").join("/")+" 00:00:00")).getTime())+86399999||"";
		 var currentTime=(new Date()).getTime();

		 if(endTime*1<startTime*1){
			 showMessage.show($scope,"error","结束时间需要大于开始时间");
			 return;
		 }else if(currentTime*1<(endTime*1-86399999)){
			 showMessage.show($scope,"error","只可查询当前时间之前的日志");
			 return;
		 }
		accountNameSearchGlobal=$("#accountNameSearch").val()||"";
		typeSearchGlobal=$("#typeSearch").val()||"";
		filterStatusGlobal=$("#filterStatus").val()||"";
		targetTypeSearchGlobal=$("#targetTypeSearch").val()||"";
		operationObjectSearchGlobal=$("#operationObjectSearch").val()||"";
		startTimeGlobal=startTime;
		endTimeGlobal=endTime;
		$scope.searchFlag=true;
		$scope.loadTab()
	}

	$scope.searchAndExport=function(){
		$scope.search();
		var status=$("#filterStatus").val()||"";
		var accountName=$("#accountNameSearch").val()||"";
		var operationType=$("#typeSearch").val()||"";
		var targetType=$("#targetTypeSearch").val()||"";
		var targetName=$("#operationObjectSearch").val()||"";
		var endTime=((new Date($("#endTime").val().split("-").join("/")+" 00:00:00")).getTime())+86399999||"";
		var startTime=(new Date($("#startTime").val().split("-").join("/")+" 00:00:00")).getTime()||"";
		window.location.href="saveOperationLogsToCSV?status="+status
			+"&accountName="+accountName
			+"&operationType="+operationType
			+"&targetType="+targetType
			+"&startTime="+startTime
			+"&endTime="+endTime
			+"&targetName="+targetName
	}

	$scope.clearSelf=function(n){
		if(n*1==1){
			$scope.logItem1=""
		}else if(n*1==2){
			$scope.logItem2=""
		}else if(n*1==3){
			$scope.startTime=""
		}else if(n*1==4){
			$scope.endTime=""
		}
	}

	$scope.getObjDate=function(timer){
		var time=new Date(parseInt(timer));
		var month = time.getMonth()+1;
		var day=time.getDate();
		var hour=time.getHours();
		var minute=time.getMinutes();
		var second=time.getSeconds();
		return time.getFullYear()+"年"+ month + "月"+day+"日";
	}

	logInterval=$interval($scope.loadTab,5000)
  
	$scope.$on('$destroy',function(){
		$interval.cancel(logInterval)
	}) 
});
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
angular.module('app.system').controller('ServicesCtrl', ServicesCtrl);
function ServicesCtrl($compile, translate, $scope, DTOptionsBuilder, showMessage, DTColumnBuilder, $http, $interval, $stateParams, $rootScope) {
  $(".modal").draggable();
  var vm = this;
  $scope.isGreater = false;
  var statusLevel = $stateParams.statusLevel;
  var level = $("#searchServiceStatus").val() || "";
  if (statusLevel != "") {
    level = statusLevel;
    $scope.isGreater = true;
  }
  var instanceIds = new Array();
  var instanceNames = new Array();
  var instanceStatuses = new Array();
  var instanceHostIps = new Array();
  var intervalTimer;
  var tableLength;
  var timeFlag = true;

  function changeTime() {
    $interval.cancel(intervalTimer)
    intervalTimer = $interval(serviceInterval, 3000)
  }

  function stopTimer() {
    $interval.cancel(intervalTimer)
  }

  function serviceInterval() {
    if (timeFlag) {
      timeFlag = false;
      if ($scope.isGreater) {
        vm.dtInstance.reloadData(null, false);
      } else {
        vm.dtInstanceInfo.reloadData(null, false);
      }
    }
  }

  vm.selected = {};
  vm.selectAll = false;
  vm.toggleAll = toggleAll;
  vm.toggleOne = toggleOne;

  var selectStr = '<span  style="margin-left:10px;float:right !important"><select data-width="100px" class="selectpicker " id="searchServiceStatus" name="searchServiceStatus"  >' +
  '<option value="" >所有状态</option>' +
  '<option value="ok">健康</option>' +
  '<option value="alarm">废弃</option>' +
  '<option value="error">异常</option>' +
  '</select></span>';

  vm.dtOptions = DTOptionsBuilder.newOptions()
    .withDOM("<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
      "t" +
      "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>")
    .withOption('ajax', {
      url: '/api/listInstanceDT',
      data: {
        serverStatus: level
      },
      dataSrc: function (data) {
        timeFlag = true;
        if (data.resultMessage.message != "success") {
          if (data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
          }
        } else {
          tableLength = data.data.length;
          return data.data
        }
      },
      type: 'POST'
    })
    .withBootstrap()
    .withOption('createdRow', function (row, data, dataIndex) {
      $compile(angular.element(row).contents())($scope);
    })
    .withOption('headerCallback', function (header) {
      if (!vm.headerCompiled) {
        vm.headerCompiled = true;
        $compile(angular.element(header).contents())($scope);
      }
    })
    .withDataProp('data')
    .withOption('processing', false)
    .withOption('serverSide', true)
    .withOption('rowId', 'instanceId')
    .withOption('pageLength', 20)
    .withOption('fnInitComplete', function (result) {
      $(selectStr).insertBefore($("#serviceTab_filter label"));
      $("#searchServiceStatus").unbind();
      $("#searchServiceStatus").bind("change", function () {
        level = $("#searchServiceStatus").val() || "";
        vm.dtInstance.changeData({
          data: {
            serverStatus: level
          },
          url: '/api/listInstanceDT',
          dataSrc: function (data) {
            vm.selected = {};
            vm.selectAll = false;

            if (data.resultMessage.message != "success") {
              if (data.resultMessage.message == "ERROR_0019_SessionOut") {
                showMessage.show($scope, "error", translate.getWord("session.out"));
                $scope.logout();
              }
            } else {
              tableLength = data.data.length;
              return data.data
            }

          },
          type: 'POST'
        });
      });
      $("#searchServiceStatus").selectpicker("val", level);
      $(".selectpicker").selectpicker("refresh");
    })
    .withOption('fnDrawCallback', function (result) {
      $(".selectpicker").selectpicker("refresh");
      $("#serviceCheckedAll").prop("checked", false)

      $("#serviceTab_filter").find("input").addClass("filter_input");
      $(".serviceClearItem").remove();
      $('<i class="fa fa-times-circle item-error-style serviceClearItem" onclick="clearFilter(\'' + 'serviceTab_filter' + '\')"></i>').insertAfter($("#serviceTab_filter").find("input"));
      if ($("#serviceTab_filter").find("input").val() == "") {
        $(".serviceClearItem").hide();
      } else {
        $(".serviceClearItem").show();
      }
      $("#serviceTab_filter").find("input").unbind('keyup', showItem);
      $("#serviceTab_filter").find("input").bind('keyup', { cName: 'serviceClearItem' }, showItem);
      $(".serviceClearItem").click(function (e) {
        e.stopPropagation();
        e.preventDefault();
        $('#serviceTab').DataTable().search("").draw();
      })
      if ($("#serviceTab .dataTables_empty").size()) {
        $("#serviceTab_paginate").hide()
      } else {
        $("#serviceTab_paginate").show()
      }
      clickEvent();
      changeTime();
    })
    .withLanguage({
      "search": '',
      "searchPlaceholder": "查询服务名称",
      "aria": {
        "sortAscending": ": activate to sort column ascending",
        "sortDescending": ": activate to sort column descending"
      },
      "emptyTable": "表中数据为空",
      "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
      "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
      "order": [[2, "asc"]],
      "infoFiltered": "(由 _MAX_ 项结果过滤)",
      "zeroRecords": "表中数据为空",
      "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
        '<option value="5" >5条</option>' +
        '<option value="10" >10条</option>' +
        '<option value="20" >20条</option>' +
        '<option value="50" >50条</option>' +
        '<option value="100" >100条</option>' +
        '</select>&nbsp',
      "paginate": {
        "previous": '<i class="fa fa-angle-left"></i>',
        "next": '<i class="fa fa-angle-right"></i>',
        "last": '<i class="fa  fa-angle-double-right"></i>',
        "first": '<i class="fa  fa-angle-double-left"></i>'
      }
    })
    .withPaginationType('full_numbers');
    var htmlStr = '<span class="check_span"><input ng-model="servicesShow.selectAll" class="input_check" id="serviceCheckedAll"  ng-click="servicesShow.toggleAll(servicesShow.selectAll, servicesShow.selected)" type="checkbox"><label for="serviceCheckedAll"></label></span>';

  vm.dtColumns = [
    DTColumnBuilder.newColumn('instanceId').withTitle('instanceId').notVisible(),
    DTColumnBuilder.newColumn('domainId').withTitle('domainId').notVisible(),
    DTColumnBuilder.newColumn('instanceName').withTitle("服务名称"),
    DTColumnBuilder.newColumn('status').withTitle("状态").renderWith(function (data, type, row) {
      var resultString = ""
      switch (data) {
        case "HEALTHY":
          resultString = "<span class='status_green'>" + translate.getWord("ok.status") + "</span>"; break;
        case "SUSPEND":
          resultString = "<span class='status_blue'>" + translate.getWord("status.suspend") + "</span>"; break;
        case "SICK":
          resultString = "<span class='status_red'>" + translate.getWord("status.unusual") + "</span>"; break;
        case "FAILED":
          resultString = "<span class='status_red'>" + translate.getWord("status.unusual") + "</span>"; break;
        case "DISUSED":
          resultString = "<span class='status_orange'>" + translate.getWord("status.disused") + "</span>"; break;
        case "UNKNOWN":
          resultString = "<span class='status_orange'>" + translate.getWord("status.unknown") + "</span>"; break;

      }
      if (row.maintenance == "true") {
        resultString = '<div class="progress progress-striped active" >' +
          '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" ><span  style="color: #fff;">维护中</span></div></div>';
      }
      return resultString;
    }),
    DTColumnBuilder.newColumn('groupId').withTitle("所在组编号"),
    DTColumnBuilder.newColumn('host').withTitle("主机IP"),
    DTColumnBuilder.newColumn('port').withTitle("端口")
  ];

  vm.dtInstance = {};
  $scope.$watch('$viewContentLoaded', function (event) {
    if ($rootScope.showDataNode == true) {
      $('#serviceTab').DataTable().search("DataNode").draw();
    }
    $rootScope.showDataNode = false;
  });

  function toggleAll(selectAll, selectedItems) {
    for (var id in selectedItems) {
      if (selectedItems.hasOwnProperty(id)) {
        selectedItems[id] = selectAll;
      }
      if (selectAll == false) {
        $('#' + id).find(('[name=instanceCheckbox]:checkbox')).prop('checked', false);
      } else {
        $('#' + id).find(('[name=instanceCheckbox]:checkbox')).prop('checked', true)
      }
    }
    clickEvent()
  }

  function toggleOne(selectedItems) {
    var s = 0;
    for (var id in selectedItems) {
      if (selectedItems.hasOwnProperty(id)) {
        if (!selectedItems[id]) {
          vm.selectAll = false;
          clickEvent()
        } else {
          s++;
        }
      }
    }
    if (s > 0) {
      if (s == tableLength) {
        vm.selectAll = true;
      } else {
        vm.selectAll = false;
      }

    }
    clickEvent()
  }

  $scope.$on('$destroy', function () {
    $interval.cancel(intervalTimer);
  })

  function clickEvent() {
    var count = 0;
    var fir = false;
    var sec = false;
    var thir = false;
    var fou = false;
    $('[name=instanceCheckbox]:checkbox').each(function () {
      if (this.checked) {
        instanceIds[count] = $(this).parent().parent().parent().prop("id");
        instanceNames[count] = $(this).parent().parent().next().html();
        instanceHostIps[count] = $(this).parent().parent().next().next().next().next().html();
        instanceStatuses[count] = $(this).parent().parent().next().next().children().eq(0).html();
        count++;
      }
    });
    if (count == 0) {
      changeTime()
      $("#startInstance").attr('disabled', true);
      $("#stopInstance").attr('disabled', true);
      $("#deleteInstance").attr('disabled', true);
    } else {
      stopTimer()
      $("#startInstance").removeAttr("disabled");
      $("#stopInstance").removeAttr("disabled");
      $("#deleteInstance").removeAttr("disabled");
      for (var i = 0; i < count; i++) {
        if ((instanceStatuses[i] == "正常") || (instanceStatuses[i] == translate.getWord("status.suspend"))) {
          fir = true;
        }
        else if (instanceStatuses[i] == translate.getWord("status.stop")) {
          sec = true;
        }
        else if (instanceStatuses[i] == translate.getWord("status.unknown")) {
          thir = true;
        } else {
          fou = true;
        }
      }
      if (sec == true && fou == true && fir == false && thir == false) {
        $("#deleteInstance").attr('disabled', false);
        $("#stopInstance").attr('disabled', true);
        $("#startInstance").attr('disabled', true);
      } else if (fir == true && sec == false && thir == false && fou == false) {
        $("#startInstance").attr('disabled', true);
        $("#deleteInstance").attr('disabled', true);
      } else if (fir == false && sec == true && thir == false && fou == false) {
        $("#stopInstance").attr('disabled', true);
      } else if (fir == false && sec == false && thir == true && fou == false) {
        $("#stopInstance").attr('disabled', true);
        $("#startInstance").attr('disabled', true);
        $("#deleteInstance").attr('disabled', true);
      } else if (fir == false && sec == false && thir == false && fou == true) {
        $("#stopInstance").attr('disabled', true);
        $("#startInstance").attr('disabled', true);
        $("#deleteInstance").attr('disabled', false);
      } else {
        $("#stopInstance").attr('disabled', true);
        $("#startInstance").attr('disabled', true);
        $("#deleteInstance").attr('disabled', true);
      }
    }
  }

  vm.dtOptionsInfo = DTOptionsBuilder.newOptions()
    .withDOM("<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
      "t" +
      "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>")
    .withBootstrap()
    .withOption('ajax', {
      url: '/api/listInstanceByIp',
      dataSrc: function (data) {
        timeFlag = true;
        if (data.resultMessage.message != "success") {
          if (data.resultMessage.message == "ERROR_0019_SessionOut") {
            showMessage.show($scope, "warn", translate.getWord("session.out"));
            $scope.logout();
          }
        } else {
          return data.instanceFormatList
        }
      },
      type: 'POST'
    })
    .withDataProp('instanceFormatList')
    .withOption('processing', false)
    .withOption('serverSide', false)
    .withOption('fnDrawCallback', function (result) {
      $("#serviceInfoTab_filter").find("input").addClass("filter_input");
      $(".serviceInfoClearItem").remove();
      $('<i class="fa fa-times-circle item-error-style serviceInfoClearItem" onclick="clearFilter(\'' + 'serviceInfoTab_filter' + '\')"></i>').insertAfter($("#serviceInfoTab_filter").find("input"));
      if ($("#serviceInfoTab_filter").find("input").val() == "") {
        $(".serviceInfoClearItem").hide();
      } else {
        $(".serviceInfoClearItem").show();
      }
      $("#serviceInfoTab_filter").find("input").unbind('keyup', showItem);
      $("#serviceInfoTab_filter").find("input").bind('keyup', { cName: 'serviceInfoClearItem' }, showItem);
      $(".serviceInfoClearItem").click(function (e) {
        e.stopPropagation();
        e.preventDefault();
        $('#serviceInfoTab').DataTable().search("").draw();
      })
      if ($("#serviceInfoTab .dataTables_empty").size()) {
        $("#serviceInfoTab_paginate").hide()
      } else {
        $("#serviceInfoTab_paginate").show()
      }
      changeTime()
    })
    .withOption('createdRow', function (row, data, dataIndex) {
      $compile(angular.element(row).contents())($scope);
    })
    .withOption('headerCallback', function (header) {
      if (!vm.headerCompiledFix) {
        vm.headerCompiledFix = true;
        $compile(angular.element(header).contents())($scope);
      }
    })
    .withLanguage({
      "search": "",
      "searchPlaceholder": "过滤",
      "aria": {
        "sortAscending": ": activate to sort column ascending",
        "sortDescending": ": activate to sort column descending"
      },
      "emptyTable": "表中数据为空",
      "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
      "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
      "order": [[2, "asc"]],
      "infoFiltered": "(由 _MAX_ 项结果过滤)",
      "zeroRecords": "表中数据为空",
      "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +

        '<option value="5" >5条</option>' +
        '<option value="10" >10条</option>' +
        '<option value="20" >20条</option>' +
        '<option value="50" >50条</option>' +
        '<option value="100" >100条</option>' +
        '</select>&nbsp;' + '  ',
      "paginate": {
        "previous": '<i class="fa fa-angle-left"></i>',
        "next": '<i class="fa fa-angle-right"></i>',
        "last": '<i class="fa  fa-angle-double-right"></i>',
        "first": '<i class="fa  fa-angle-double-left"></i>'
      }
    })
    .withPaginationType('full_numbers');

  var normalStr = "<span>服务<span class='pull-right'>"
    + "<i class='icon_circle icon_safe'></i>健康"
    + "<i class='icon_circle icon_suspend'></i>挂起"
    + "<i class='icon_circle icon_alarm'></i>废弃"
    + "<i class='icon_circle icon_danger'></i>异常"
    + "</span></span>"

  vm.dtColumnsInfo = [
    DTColumnBuilder.newColumn('ip').withTitle("").notVisible(),
    DTColumnBuilder.newColumn('ip').withTitle("服务器名称"),
    DTColumnBuilder.newColumn('instances').withTitle(normalStr).notSortable().renderWith(function (data, type, row) {
      var resultString = "";
      var status_level = "";
      for (var i = 0; i < data.length; i++) {
        switch (data[i].status) {
          case "HEALTHY":
            status_level = "icon_safe";
            break;
          case "SUSPEND":
            status_level = "icon_suspend";
            break;
          case "SICK":
            status_level = "icon_danger";
            break;
          case "FAILED":
            status_level = "icon_danger";
            break;
          case "DISUSED":
            status_level = "icon_alarm";
            break;
          case "UNKNOWN":
            status_level = "icon_alarm";
            break;
        }
        resultString += "<p class='instance_wrap " + status_level + "'>" + data[i].instanceName + "</p>"
      }
      return resultString;
    })
  ];
  vm.dtInstanceInfo = {};

  $scope.goGreat = function () {
    $scope.isGreater = true;
    $scope.reloadData();
  }
  
  $scope.goNormal = function () {
    $scope.isGreater = false;
    $scope.reloadData();
  }
  
  $scope.reloadData = function () {
    if ($scope.isGreater) {
      vm.dtInstance.reloadData(null, false);
    } else {
      vm.dtInstanceInfo.reloadData(null, false);
    }
  }
}


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

angular.module('app.user').controller('RoleDetailCtrl', function (focus,$state,$stateParams,$http,$scope,DTOptionsBuilder, DTColumnBuilder,$compile,showMessage,$interval,translate,$timeout,$rootScope) {
	var vm=this;
	var roleId=$stateParams.roleId;
	var isOdd=true;
	var right=$(".detail_right").outerHeight();
	var left=$(".detail_content").outerHeight();
	$(".detail_content").css("min-height",right+"px")
	$(".detail_right").css("min-height",right+"px")
	function roleInfo(){
		var arr=[];
		arr.push(roleId)
		$http({
			method: "POST",
			async:false,
			url: "listRoles",
			data: {idsJson:JSON.stringify(arr)},
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			transformRequest: function(obj) {
				var str = [];
				for (var s in obj) {
					str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
				}
				return str.join("&");
			}
		}).then(function successCallback(response){

			if (response.data.resultMessage.message == "success") {
				var apiStr="";
				$scope.roleName=response.data.rolesList[0].name;
				$scope.description=response.data.rolesList[0].description;
				if($.isEmptyObject(response.data.rolesList[0].permissions)){
					apiStr="当前角色没有分配权限"
				}else{
					angular.forEach(response.data.rolesList[0].permissions,function(data,index,arr){
						apiStr=apiStr+limition(data)
					})
				}
				$("#apiTab").html(apiStr)


			} else {
				if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
					showMessage.show($scope,"warn",translate.getWord("session.out"));
					$scope.logout();
					return;
				}else{
					showMessage.show($scope,"error",translate.getWord(response.data.resultMessage.message));
				}

			}

		},function errorCallback(response){


		});
	}
	roleInfo();
	$scope.refresh=function(){
		roleInfo();

	}
	function limition(datas){
		var string="";
		var rowsNum=1;
		var partNum=0;

		if(datas){
			if(datas.length/6>1){
				rowsNum=Math.ceil(datas.length/6)
			}
			if(isOdd){
				string+="<tr class='table_part table_odd'>";
			}else{
				string+="<tr class='table_part table_even'>";
			}
			string+="<td class='rolesTitle' rowspan='"+rowsNum+"'><span>"+translate.getWord(datas[0].category)+"</span></td>"
			
			angular.forEach(datas,function(data,index,array){
				if(index%6==0&&index!=0){
					if(isOdd){
						string+="</tr><tr class='table_odd'>";
					}else{
						string+="</tr><tr class='table_even'>";
					}
				}
				string+="<td tag_name='"+data.apiName+"' > "
				if($rootScope.currentLanguage=="cn"){
					string+=data.chineseText+'</td>'
				}else{
					string+=data.englishText+'</td>'
				}
				partNum++;

			})
			if(partNum<rowsNum*6){
				for(var i=0;i<(rowsNum*6-partNum);i++){
					string+="<td></td>";
				}
			}
			string+="</tr>";
			isOdd=!isOdd;
		}
		return string;

	}
})
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

angular
  .module("app.user")
  .controller(
    "RolesCtrl",
    function (
      $state,
      focus,
      translate,
      $http,
      $scope,
      DTOptionsBuilder,
      DTColumnBuilder,
      $compile,
      showMessage,
      $rootScope
    ) {
      $(".modal").draggable();
      $scope.doFocus = function (id) {
        focus(id);
      };
      var vm = this;
      vm.dtInstance = {};
      vm.selected = {};
      vm.updateInfo = {};
      vm.selectedApi = new Array();
      vm.selectedId = new Array();
      vm.selectAll = false;
      vm.toggleAll = toggleAll;
      vm.toggleOne = toggleOne;
      vm.u = true;
      vm.d = true;
      $scope.toShow = false;
      $scope.updateShow = false;
      var tableLength;
      var currentId;
      var apiArr = {};
      var apiList = [];
      var filterObj = {
        Access_Rule:true,
        Domain:true,
        Account:true,
        Driver:true,
        Other:true,
        Rebalance:true,
        Role:true,
        StoragePool:true,
        Qos:{
          key:{
          cancelMigrationRules:true,
          applyMigrationRules:true,
          createIoLimitations:true,
          cancelIoLimitations:true,
          applyIoLimitations:true,
          updateIoLimitations:true,
          deleteIoLimitations:true
          }
        },
        Volume:{
          key:{
            recycleVolume:true,
            extendVolume:true,
            createVolume:true,
            deleteVolume:true
          }
        },
      }
      $scope.$watch("description", function (newval) {
        var value = newval;
        var len = 0;
        var l;
        if (value) {
          for (var i = 0; i < value.length; i++) {
            l = value.charCodeAt(i);
            if (l >= 0 && l <= 128) {
              len += 1;
            } else {
              len += 2;
            }
          }
        }
        $scope.CreateFormDes = len > 250;
      });

      $scope.$watch("updateDes", function (newval) {
        var value = newval;
        var len = 0;
        var l;
        if (value) {
          for (var i = 0; i < value.length; i++) {
            l = value.charCodeAt(i);
            if (l >= 0 && l <= 128) {
              len += 1;
            } else {
              len += 2;
            }
          }
        }
        $scope.UpdateFormDes = len > 250;
      });
      vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption("ajax", {
          url: "listRoles",
          type: "POST",
          dataSrc: function (data) {
            if (data.resultMessage.message == "ERROR_0019_SessionOut") {
              showMessage.show(
                $scope,
                "warn",
                translate.getWord("session.out")
              );
              $scope.logout();
              return;
            }
            tableLength = data.rolesList.length;
            vm.selected = {};
            vm.selectAll = false;
            return data.rolesList;
          },
        })
        .withDOM(
          "<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
            "t" +
            "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>"
        )
        .withBootstrap()
        .withOption("processing", true)
        .withOption("serverSide", false)
        .withOption("rowId", "roleId")
        .withOption("fnDrawCallback", drawCallback)
        .withLanguage({
          search: "",
          searchPlaceholder: translate.getWord("performance.task.filter"),
          aria: {
            sortAscending: ": activate to sort column ascending",
            sortDescending: ": activate to sort column descending",
          },
          emptyTable: "表中数据为空",
          info: "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
          infoEmpty: "显示第 0 至 0 项结果，共 0 项",
          order: [[2, "asc"]],
          infoFiltered: "(由 _MAX_ 项结果过滤)",
          zeroRecords: "表中数据为空",
          lengthMenu:
            "显示" +
            '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
            '<option value="5" >5条</option>' +
            '<option value="10" >10条</option>' +
            '<option value="20" >20条</option>' +
            '<option value="50" >50条</option>' +
            '<option value="100" >100条</option>' +
            "</select>&nbsp",
          paginate: {
            previous: '<i class="fa fa-angle-left"></i>',
            next: '<i class="fa fa-angle-right"></i>',
            last: '<i class="fa  fa-angle-double-right"></i>',
            first: '<i class="fa  fa-angle-double-left"></i>',
          },
        })
        .withPaginationType("full_numbers")
        .withOption("createdRow", function (row, data, dataIndex) {
          $compile(angular.element(row).contents())($scope);
        })
        .withOption("headerCallback", function (header) {
          if (!vm.headerCompiled) {
            vm.headerCompiled = true;
            $compile(angular.element(header).contents())($scope);
          }
        });
      vm.dtColumns = [
        DTColumnBuilder.newColumn("roleId").withTitle("ID").notVisible(),
        DTColumnBuilder.newColumn("null")
          .withTitle("")
          .renderWith(function (data, type, row) {
            return (
              '<span class="fa fa-plus-square-o row-details" value="' +
              row.roleId +
              '"></span>'
            );
          })
          .withClass("checkbox_col")
          .notSortable()
          .notVisible(),
        DTColumnBuilder.newColumn("null")
          .withTitle(
            '<span class="check_span"><input ng-model="showRole.selectAll" class="input_check" ng-click="showRole.toggleAll(showRole.selectAll, showRole.selected)" type="checkbox" id="selectAllFlag"><label for="selectAllFlag"></label></span>'
          )
          .renderWith(function (data, type, row) {
            if (row.name == "superadmin") {
              return "";
            } else {
              vm.selected[row.roleId] = false;
              return (
                '<span class="check_span"><input class="input_check" ng-model="showRole.selected[\'' +
                row.roleId +
                '\'];" ng-click="showRole.toggleOne(showRole.selected)" type="checkbox" id="checkbox_' +
                row.roleId +
                '"><label for="checkbox_' +
                row.roleId +
                '"></label></span>'
              );
            }
          })
          .withClass("checkbox_col")
          .notSortable(),
        DTColumnBuilder.newColumn("name")
          .withTitle("角色名称")
          .renderWith(function (data, type, row) {
            return (
              '<a title="查看角色户详情" ng-click="showInfo(\'' +
              row.roleId +
              "')\">" +
              data +
              "</a>"
            );
          }),
        DTColumnBuilder.newColumn("description")
          .withTitle("描述")
          .notSortable(),
      ];
      $scope.showInfo = function (roleId) {
        $state.go("app.user.roles.roleDetail", { roleId: roleId });
      };

      function toggleAll(selectAll, selectedItems) {
        var t = 0;
        for (var id in selectedItems) {
          if (selectedItems.hasOwnProperty(id)) {
            var name = $(".roleTable")
              .find("#" + id)
              .children("td")
              .eq("1")
              .html();
            if (name) {
              selectedItems[id] = selectAll;
              t++;
            }
          }
        }
        if (selectAll == false) {
          vm.d = true;
          vm.u = true;
        } else {
          vm.d = false;
          if (t == 1) {
            vm.u = false;
          } else {
            vm.u = true;
          }
        }
      }
      function toggleOne(selectedItems) {
        var s = 0;
        var t = 0;
        for (var id in selectedItems) {
          if (selectedItems.hasOwnProperty(id)) {
            var name = $(".roleTable")
              .find("#" + id)
              .children("td")
              .eq("1")
              .html();
            if (name) {
              t++;
            }
            if (!selectedItems[id]) {
              vm.selectAll = false;
              $("#" + id).removeClass("active");
            } else {
              s++;
              $("#" + id).addClass("active");
            }
          }
        }
        if (s > 0) {
          vm.d = false;
          if (s == t) {
            if (t == 1) {
              vm.u = false;
            } else {
              vm.u = true;
            }
            vm.selectAll = true;
          } else if (s == 1) {
            vm.u = false;
            vm.selectAll = false;
          } else {
            vm.u = true;
            vm.selectAll = false;
          }
        } else {
          vm.d = true;
          vm.u = true;
        }
      }

      function drawCallback(result) {
        $(".selectpicker").selectpicker("render");
        $(".selectpicker").selectpicker("refresh");
        vm.selectAll = false;
        vm.d = true;
        vm.u = true;
        $("#roleTab_filter").find("input").addClass("filter_input");
        $(".roleClearItem").remove();
        $(
          '<i class="fa fa-times-circle item-error-style roleClearItem" onclick="clearFilter(\'' +
            "roleTab_filter" +
            "')\"></i>"
        ).insertAfter($("#roleTab_filter").find("input"));
        if ($("#roleTab_filter").find("input").val() == "") {
          $(".roleClearItem").hide();
        } else {
          $(".roleClearItem").show();
        }
        $("#roleTab_filter").find("input").unbind("keyup", showItem);
        $("#roleTab_filter")
          .find("input")
          .bind("keyup", { cName: "roleClearItem" }, showItem);
        $(".roleClearItem").click(function (e) {
          e.stopPropagation();
          e.preventDefault();
          $("#roleTab").DataTable().search("").draw();
        });
        if ($("#roleTab .dataTables_empty").size()) {
          $("#roleTab_paginate").hide();
        } else {
          $("#roleTab_paginate").show();
        }
        for (var id in vm.selected) {
          if (vm.selected[id]) {
            vm.selected[id] = false;
          }
        }
        var oTable = $(".roleTable").dataTable();
        if ($.fn.dataTable.isDataTable(oTable)) {
          $(".roleTable tbody").off("click", "span.row-details");
        }
        $(".roleTable tbody").on("click", "span.row-details", function () {
          var oTable = $(".roleTable").dataTable();
          var nTr = $(this).parents("tr")[0];
          if (oTable.fnIsOpen(nTr)) {
            $(this)
              .addClass("fa-plus-square-o")
              .removeClass("fa-minus-square-o ");
            $(this).parents("tr").removeClass("active");
            oTable.fnClose(nTr);
          } else {
            fnFormatDetails(
              this,
              nTr,
              $(this).parents("tr").prop("id"),
              result.json
            );
            $(this)
              .addClass("fa-minus-square-o ")
              .removeClass("fa-plus-square-o ");
            $(this).parents("tr").addClass("active");
          }
        });
        if (result.json) {
          vm.updateInfo = {};
          angular.forEach(result.json.rolesList, function (data, index, array) {
            vm.updateInfo[data.roleId] = data.permissions;
          });
        }
      }

      $scope.reloadData = function () {
        vm.dtInstance.reloadData(null, false);
      };

      function limition(datas) {
        var string = "";
        if (datas) {
          string =
            string +
            '<div  class=" col-md-12 col-lg-12"><span><b>' +
            translate.getWord(datas[0].category) +
            '</b></span></div><div style="padding-left:30px">';
          angular.forEach(datas, function (data, index, array) {
            string =
              string +
              "<div class='col-md-1 col-lg-1' style='padding:8px 0px 8px 0px' id='" +
              data.apiName +
              "' > ";
            if ($rootScope.currentLanguage == "cn") {
              string = string + data.chineseText + "</div>";
            } else {
              string = string + data.englishText + "</div>";
            }
          });
          string = string + "</div>";
        }
        return string;
      }

      function limitionList(name, datas,obj) {
        var string = "";
        if (datas) {
          string =
            string +
            "<fieldset>" +
            "<section>" +
            '<div class="col-sm-12">' +
            '<label class="label col-sm-2">' +
            translate.getWord(name) +
            "</label>" +
            '<label class="checkbox pull-right"><input type="checkbox"  onclick="selectAllOption(this)"><i></i>' +
            translate.getWord("select.all") +
            "</label>" +
            "</div>" +
            ' <div class="inline-group col-sm-12">';
          angular.forEach(datas, function (data, index, array) {
            if(obj){
              if(obj[data.apiName]){
                string =
                  string +
                  '<label class="checkbox col-sm-3" >' +
                  '<input onclick="selectOneOption(this)" type="checkbox" name="checkbox-inline" id="' +
                  data.apiName +
                  '" class="' +
                  name +
                  '">';
                if ($rootScope.currentLanguage == "cn") {
                  string = string + "<i></i>" + data.chineseText + "</label>";
                } else {
                  string = string + "<i></i>" + data.englishText + "</label>";
                }
              }
            } else{
              string =
                string +
                '<label class="checkbox col-sm-3" >' +
                '<input onclick="selectOneOption(this)" type="checkbox" name="checkbox-inline" id="' +
                data.apiName +
                '" class="' +
                name +
                '">';
              if ($rootScope.currentLanguage == "cn") {
                string = string + "<i></i>" + data.chineseText + "</label>";
              } else {
                string = string + "<i></i>" + data.englishText + "</label>";
              }
            }
          });
          string = string + "</div></section></fieldset>";
        }
        return string;
      }

      function listSelectApi(item, value) {
        if (apiArr[item]) {
          apiList = apiArr[item];
          apiList.push(value);
          apiArr[item] = apiList;
        } else {
          apiList.push(value);
          apiArr[item] = apiList;
        }
      }

      function fnFormatDetails(select, nTr, pdataId, data) {
        var oTable = $(".roleTable").dataTable();
        var children =
          "<div class='row' >" +
          "<div style='padding-left:28px;'>" +
          translate.getWord("create.role.step.two") +
          "</div>" +
          "<hr style='margin:6px !important'>" +
          "<div class=' col-sm-12 col-md-12 col-lg-12' id='" +
          pdataId +
          "_detail'>";
        angular.forEach(data.rolesList, function (roledata, index, array) {
          if (roledata.roleId == pdataId) {
            if ($.isEmptyObject(roledata.permissions)) {
              children =
                children +
                "<div class='col-sm-6 col-md-6 col-lg-6'>" +
                translate.getWord("assign.role.null") +
                "</div>";
            } else {
              angular.forEach(
                roledata.permissions,
                function (data, index, array) {
                  children = children + limition(data);
                }
              );
            }
          }
        });
        children = children + "</div></div>";
        var $children = $compile(children)($scope);
        oTable.fnOpen(nTr, $children, "details");
      }

      $scope.createReset = function () {
        vm.selectedApi = [];
        document.getElementById("createForm").reset();
        $scope.createForm.$setPristine();
        $scope.createForm.$invalid = false;
        $scope.CreateFormDes = false;
        $(".steps:eq(0) #title_one").click();
      };

      $scope.updateReset = function () {
        vm.selectedApi = [];
        $scope.updateForm.$invalid = false;
        $scope.updateForm.updateRoleName.$invalid = false;
        $scope.updateForm.$setPristine();
        $scope.UpdateFormDes = false;
        $(".steps:eq(1) #title_one").click();
      };

      $scope.getResource = function () {
        $scope.toShow = true;
        $scope.createReset();
        $http({
          method: "POST",
          async: false,
          url: "listApi",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(
                encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
              );
            }
            return str.join("&");
          },
        }).then(
          function successCallback(response) {
            if (response.data.resultMessage.message == "success") {
              let string = ''
              angular.forEach(response.data, function (data, index, array) {
                if (index != "resultMessage" && index != "apisList") {
                  if(filterObj[index]){
                    if(filterObj[index]['key']){
                      string = string + limitionList(index, data,filterObj[index]['key']);
                    }else{
                      string = string + limitionList(index, data);
                    }
                  }
                }
              });
              var $string = $compile(string)($scope);
              $("#step2").html($string);
            } else {
              if (
                response.data.resultMessage.message == "ERROR_0019_SessionOut"
              ) {
                showMessage.show(
                  $scope,
                  "warn",
                  translate.getWord("session.out")
                );
                $scope.logout();
                return;
              } else {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord(response.data.resultMessage.message)
                );
              }
            }
          },
          function errorCallback(response) {}
        );
      };

      $scope.updateList = function () {
        $scope.updateShow = true;
        $scope.updateReset();
        $http({
          method: "POST",
          async: false,
          url: "listApi",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(
                encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
              );
            }
            return str.join("&");
          },
        }).then(
          function successCallback(response) {
            if (response.data.resultMessage.message == "success") {
              var string = "";
              angular.forEach(response.data, function (data, index, array) {
                if (index != "resultMessage" && index != "apisList") {
                  if(filterObj[index]){
                    if(filterObj[index]['key']){
                      string = string + limitionList(index, data,filterObj[index]['key']);
                    }else{
                      string = string + limitionList(index, data);
                    }
                  }
                }
              });

              var $inner = $compile(string)($scope);

              $("#update_step2").html($inner);

              angular.forEach(vm.selected, function (data, index, array) {
                var selectid;
                if (data == true) {
                  currentId = index;
                  var name = $(".roleTable")
                    .find("#" + index)
                    .children("td")
                    .eq("1")
                    .text();
                  var des = $(".roleTable")
                    .find("#" + index)
                    .children("td")
                    .eq("2")
                    .text();
                  $("#updateRoleName").val(name);
                  $("#updateDes").val(des);
                  angular.forEach(vm.updateInfo, function (d, id, array) {
                    if (id == index) {
                      angular.forEach(d, function (api, dex, array) {
                        angular.forEach(api, function (ap, dex, array) {
                          $("#update_step2")
                            .find("#" + ap.apiName)
                            .attr("checked", "checked");
                        });
                      });
                    }
                  });
                  $("input[name='checkbox-inline']").each(function () {
                    var flagOption = true;
                    $(this)
                      .parents("section")
                      .children()
                      .eq(1)
                      .find("input")
                      .each(function () {
                        if (!$(this).prop("checked")) {
                          flagOption = false;
                        }
                      });
                    $(this)
                      .parents("section")
                      .children()
                      .eq(0)
                      .find("input")
                      .prop("checked", flagOption);
                  });
                }
              });
            } else {
              if (
                response.data.resultMessage.message == "ERROR_0019_SessionOut"
              ) {
                showMessage.show(
                  $scope,
                  "warn",
                  translate.getWord("session.out")
                );
                $scope.logout();
                return;
              } else {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord(response.data.resultMessage.message)
                );
              }
            }
          },
          function errorCallback(response) {}
        );
      };

      $scope.wizardCompleteCallback = function (wizardData) {
        $("#create_modal").modal("hide");
        $scope.toShow = false;
        vm.selectedApi = [];
        $("[name=checkbox-inline]:checkbox").each(function () {
          if (this.checked) {
            vm.selectedApi.push(this.id);
          }
        });
        $http({
          method: "POST",
          async: false,
          url: "createRole",
          data: {
            roleName: wizardData.roleName,
            description: wizardData.description,
            apiNamesJson: JSON.stringify(vm.selectedApi),
          },
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(
                encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
              );
            }
            return str.join("&");
          },
        }).then(
          function successCallback(response) {
            if (response.data.resultMessage.message == "success") {
              showMessage.show(
                $scope,
                "success",
                translate.getWord("response.success")
              );
              vm.dtInstance.reloadData(null, false);
            } else {
              if (
                response.data.resultMessage.message == "ERROR_0019_SessionOut"
              ) {
                showMessage.show(
                  $scope,
                  "warn",
                  translate.getWord("session.out")
                );
                $scope.logout();
                return;
              } else {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord(response.data.resultMessage.message)
                );
                vm.dtInstance.reloadData(null, false);
              }
            }
          },
          function errorCallback(response) {}
        );
      };
      $scope.wizard2CompleteCallback = function (wizardData) {
        $("#update_modal").modal("hide");
        $scope.updateShow = false;
        vm.selectedApi = [];
        $("[name=checkbox-inline]:checkbox").each(function () {
          if (this.checked) {
            vm.selectedApi.push(this.id);
          }
        });
        $http({
          method: "POST",
          async: false,
          url: "updateRole",
          data: {
            roleId: currentId,
            roleName: wizardData.updateRoleName,
            description: wizardData.updateDes,
            apiNamesJson: JSON.stringify(vm.selectedApi),
          },
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(
                encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
              );
            }
            return str.join("&");
          },
        }).then(
          function successCallback(response) {
            if (response.data.resultMessage.message == "success") {
              showMessage.show(
                $scope,
                "success",
                translate.getWord("response.success")
              );
              vm.dtInstance.reloadData(null, false);
            } else {
              if (
                response.data.resultMessage.message == "ERROR_0019_SessionOut"
              ) {
                showMessage.show(
                  $scope,
                  "warn",
                  translate.getWord("session.out")
                );
                $scope.logout();
                return;
              } else {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord(response.data.resultMessage.message)
                );
                vm.dtInstance.reloadData(null, false);
              }
            }
          },
          function errorCallback(response) {}
        );
      };

      $scope.deleteNames = function () {
        vm.selectName = new Array();
        vm.selectedId = [];
        angular.forEach(vm.selected, function (data, index, array) {
          if (data == true) {
            vm.selectedId.push(index);
            var a = $(".roleTable")
              .find("#" + index)
              .children("td")
              .eq("1")
              .find("a")
              .text();
            vm.selectName.push(a);
          }
        });
        $scope.deletenames = vm.selectName.join(",");
      };

      $scope.deletes = function () {
        $http({
          method: "post",
          async: false,
          url: "deleteRoles",
          data: {
            idsJson: JSON.stringify(vm.selectedId),
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(
                encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
              );
            }
            return str.join("&");
          },
        }).then(
          function successCallback(response) {
            if (response.data.resultMessage.message == "success") {
              showMessage.show(
                $scope,
                "success",
                translate.getWord("response.success")
              );
              vm.dtInstance.reloadData(null, false);
            } else {
              if (
                response.data.resultMessage.message == "ERROR_0019_SessionOut"
              ) {
                showMessage.show(
                  $scope,
                  "warn",
                  translate.getWord("session.out")
                );
                $scope.logout();
                return;
              } else if (
                response.data.resultMessage.message ==
                "ERROR_DeleteRoleException"
              ) {
                var messageStr = "";
                for (var key in response.data.failedRoleId2Cause) {
                  var val = translate.getWord(
                    response.data.failedRoleId2Cause[key]
                  );
                  messageStr = messageStr + key + ":" + val + "<br/>";
                }
                showMessage.show($scope, "error", messageStr);
                vm.dtInstance.reloadData(null, false);
              } else {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord(response.data.resultMessage.message)
                );
                vm.dtInstance.reloadData(null, false);
              }
            }
          },
          function errorCallback(response) {
            showMessage.show(
              $scope,
              "error",
              translate.getWord("response.error")
            );
            vm.dtInstance.reloadData(null, false);
          }
        );

        vm.selectedId = [];
      };

      $scope.nextBtn = function () {
        if ($scope.CreateFormDes) {
          return;
        }

        apiArr = {};
        if ($("#lastStep").hasClass("active")) {
          var des = $("#description").val();
          var string = "";
          var bon = false;
          if (
            $("#description").val() == undefined ||
            $("#description").val() == ""
          ) {
            des = "<span style='font-style: italic;color:#ccc'>空</span>";
          }
          $("#userNa").html("角色名 : " + $("#roleName").val());
          $("#userDes").html("描述 : " + des);
          $("[name=checkbox-inline]:checkbox").each(function () {
            if (this.checked) {
              bon = true;
              apiList = [];
              listSelectApi($(this).attr("class"), $(this).parent().text());
            }
          });
          if (!bon) {
            string =
              "<span style='font-style: italic;color:#ccc;font-size:15px'>空</span>";
          } else {
            angular.forEach(apiArr, function (data, index) {
              string =
                string +
                "<div class='col-md-12' style='font-size:15px;padding:3px 0px'>" +
                translate.getWord(index) +
                "</div><div class='col-md-12' style='padding-left:18px'>";
              angular.forEach(apiArr[index], function (d, ind) {
                string =
                  string +
                  '<div class="col-md-3" style="padding:3px 0px;font-size:15px">' +
                  d +
                  "</div>";
              });
              string = string + "</div>";
            });
          }
          $("#assignList").html(string);
        }
      };
      $scope.nextBtnUpdate = function () {
        if ($scope.UpdateFormDes) {
          return;
        }

        apiArr = {};
        if ($("#lastStepUpdate").hasClass("active")) {
          var des = $("#updateDes").val();
          var string = "";
          var bon = false;
          if (
            $("#updateDes").val() == undefined ||
            $("#updateDes").val() == ""
          ) {
            des = "<span style='font-style: italic;color:#ccc'>空</span>";
          }
          $("#updateName").html("角色名 : " + $("#updateRoleName").val());
          $("#Des").html("描述 : " + des);
          $("[name=checkbox-inline]:checkbox").each(function () {
            if (this.checked) {
              bon = true;
              apiList = [];
              listSelectApi($(this).attr("class"), $(this).parent().text());
            }
          });
          if (!bon) {
            string =
              "<span style='font-style: italic;color:#ccc;font-size:15px'>空</span>";
          } else {
            angular.forEach(apiArr, function (data, index) {
              string =
                string +
                "<div class='col-md-12' style='font-size:15px;padding:3px 0px'>" +
                translate.getWord(index) +
                "</div><div class='col-md-12' style='padding-left:18px'>";
              angular.forEach(apiArr[index], function (d, ind) {
                string =
                  string +
                  '<div class="col-md-3" style="padding:3px 0px;font-size:15px">' +
                  d +
                  "</div>";
              });
              string = string + "</div>";
            });
          }
          $("#assignListUpdate").html(string);
        }
      };
    }
  );
function selectAllOption(btn) {
  $(btn)
    .parents("section")
    .children()
    .eq(1)
    .find("input")
    .prop("checked", $(btn).prop("checked"));

  var num = 0;
  $(btn)
    .parents("section")
    .children()
    .eq(1)
    .find("input")
    .each(function () {
      if ($(this).prop("checked")) {
        num++;
      }
    });
  if (num > 8) {
    $("#addPerformace").prop("disabled", true);
  } else {
    $("#addPerformace").prop("disabled", false);
  }
}

function selectOneOption(btn) {
  var flagOption = true;
  var num = 0;
  $(btn)
    .parents("section")
    .children()
    .eq(1)
    .find("input")
    .each(function () {
      if (!$(this).prop("checked")) {
        flagOption = false;
      } else {
        num++;
      }
    });
  $(btn)
    .parents("section")
    .children()
    .eq(0)
    .find("input")
    .prop("checked", flagOption);

  if (num > 8) {
    $("#addPerformace").prop("disabled", true);
  } else {
    $("#addPerformace").prop("disabled", false);
  }
}
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

angular.module('app.user').controller('UserDetailCtrl', function (focus,$state,$stateParams,$http,$scope,DTOptionsBuilder, DTColumnBuilder,$compile,showMessage,$interval,translate,$timeout,$rootScope) {
	var vm=this;
	var userId=$stateParams.userId;
	var isOdd=true;
	var right=$(".detail_right").outerHeight();
	var left=$(".detail_content").outerHeight();
	$(".detail_content").css("min-height",right+"px")
	$(".detail_right").css("min-height",right+"px")
	function userInfo(){
		var arr=[];
		arr.push(userId)
		$http({
			method: "POST",
			async:false,
			url: "listAccount",
			data: {idsJson:JSON.stringify(arr)},
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			transformRequest: function(obj) {
				var str = [];
				for (var s in obj) {
					str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
				}
				return str.join("&");
			}
		}).then(function successCallback(response){

			if (response.data.resultMessage.message == "success") {
				var roleStr="";
				$scope.userName=response.data.accountList.accountList[0].accountName;
				if(response.data.accountList.accountList[0].roles.length>0){
					roleStr+="<span id='roleSpan'>"
					angular.forEach(response.data.accountList.accountList[0].roles,function(d,index,array){
						roleStr+="<span>"+d.name+"</span>&nbsp;&nbsp;&nbsp;"
					})
					roleStr+="</span>"
				}else{
					roleStr="还未分配角色"
				}
				$("#roleDiv").html(roleStr)
				var resourceStr="";
				if(response.data.accountList.accountList[0].accountType=="SuperAdmin"){
					$scope.emptyAccess=true;
					resourceStr+="<div class='superadmin'></div><p class='admin_word'>您已是超级管理员，拥有<span class='allrc'>所有资源</span>！</p>"
					$("#admin_pic").html(resourceStr)
				}else{
					if($.isEmptyObject(response.data.accountList.accountList[0].resources)){

						$scope.emptyAccess=true;
						resourceStr+="<div class='normaladmin'></div><p class='admin_word'>您还<span class='norc'>未分配</span>任何资源！</p>"
						$("#admin_pic").html(resourceStr)
					}else{
						$scope.emptyAccess=false;
						angular.forEach(response.data.accountList.accountList[0].resources,function(userdata,index,array){
							var rowsNum=getRowSpan(userdata.length);
							var str="";
							var partNum=0;

							if(index=="Domain"){
								str=translate.getWord("table.domain");
							}else if(index=="StoragePool"){
								str=translate.getWord("table.pool");
							}else if(index=="Volume"){
								str=translate.getWord("volume.volume");
							}
							
							if(isOdd){
								resourceStr+="<tr class='table_part table_odd'>";
							}else{
								resourceStr+="<tr class='table_part table_even'>";
							}
							resourceStr+="<td class='rolesTitle' rowspan='"+rowsNum+"'><span>"+str+"</span></td>"
							angular.forEach(userdata,function(data,index,array){
								if(partNum%6==0&&partNum!=0){
									if(isOdd){
										string+="</tr><tr class='table_odd'>";
									}else{
										string+="</tr><tr class='table_even'>";
									}
								}
								resourceStr+="<td tag_name='"+data.resourceId+"' > "
								+data.resourceName+'</td>'
								partNum++;
							})
							if(partNum<rowsNum*6){
								for(var i=0;i<(rowsNum*6-partNum);i++){
									resourceStr+="<td></td>";
								}
							}
							resourceStr+="</tr>"
							isOdd=!isOdd;

						})
						$("#apiTab").html(resourceStr)
					}
				}

				

			} else {
				if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
					showMessage.show($scope,"warn",translate.getWord("session.out"));
					$scope.logout();
					return;
				}else{
					showMessage.show($scope,"error",translate.getWord(response.data.resultMessage.message));
				}

			}

		},function errorCallback(response){


		});
	}
	function getRowSpan(l){
		if(l/6>1){
			return Math.ceil(l/6);
		}else{
			return 1;
		}
	}
	userInfo();
	$scope.refresh=function(){
		userInfo();

	}
})
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

angular.module('app.user').controller('UsersCtrl', function (focus, translate, $http, $rootScope, $scope, DTOptionsBuilder, DTColumnBuilder, $compile, showMessage, $state) {
  $(".modal").draggable();
  var vm = this;
  vm.selected = {};
  vm.selectName = new Array();
  vm.selectedId = new Array();
  vm.selectAll = false;
  vm.toggleAll = toggleAll;
  vm.toggleOne = toggleOne;
  vm.disabled = true;
  vm.update = true;
  vm.del = true;
  var tableLength;
  var currentId;
  vm.dtInstance = {};
  vm.roles = {};
  $scope.showResource = false;
  vm.dtOptions = DTOptionsBuilder
    .newOptions()
    .withOption('ajax', {
      url: 'listAccountDT',
      type: 'POST',
      dataSrc: function (data) {
        if (data.resultMessage.message == "ERROR_0019_SessionOut") {
          showMessage.show($scope, "warn", translate.getWord("session.out"));
          $scope.logout();
          return;
        }
        tableLength = data.data.length;
        vm.selected = {};
        vm.selectAll = false;
        return data.data;
      },

    })
    .withDOM("<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
      "t" +
      "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>")
    .withBootstrap()
    .withOption('processing', true)
    .withOption('serverSide', true)
    .withOption('rowId', 'accountId')
    .withOption('fnDrawCallback', drawCallback)

    .withLanguage({
      "search": "",
      "searchPlaceholder": "查询用户名称",
      "aria": {
        "sortAscending": ": activate to sort column ascending",
        "sortDescending": ": activate to sort column descending"
      },
      "emptyTable": "表中数据为空",
      "info": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
      "infoEmpty": "显示第 0 至 0 项结果，共 0 项",
      "order": [[2, "asc"]],
      "infoFiltered": "(由 _MAX_ 项结果过滤)",
      "zeroRecords": "表中数据为空",
      "lengthMenu": '显示' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +

        '<option value="5" >5条</option>' +
        '<option value="10" >10条</option>' +
        '<option value="20" >20条</option>' +
        '<option value="50" >50条</option>' +
        '<option value="100" >100条</option>' +
        '</select>&nbsp',
      "paginate": {
        "previous": '<i class="fa fa-angle-left"></i>',
        "next": '<i class="fa fa-angle-right"></i>',
        "last": '<i class="fa  fa-angle-double-right"></i>',
        "first": '<i class="fa  fa-angle-double-left"></i>'
      }
    })
    .withPaginationType('full_numbers')
    .withOption('createdRow', function (row, data, dataIndex) {
      $compile(angular.element(row).contents())($scope);
    })
    .withOption('headerCallback', function (header) {
      if (!vm.headerCompiled) {
        vm.headerCompiled = true;
        $compile(angular.element(header).contents())($scope);
      }
    });

  vm.dtColumns = [
    DTColumnBuilder.newColumn('accountId').withTitle('ID').notVisible(),
    DTColumnBuilder.newColumn('null').withTitle('')
      .renderWith(function (data, type, row) {
        return '<span class="fa fa-plus-square-o row-details" value="' + row.accountId + '"></span>';
      }).withClass('checkbox_col').notSortable().notVisible(),
    DTColumnBuilder.newColumn('null').withTitle('<span class="check_span"><input ng-model="showUser.selectAll" class="input_check" ng-click="showUser.toggleAll(showUser.selectAll, showUser.selected)" type="checkbox" id="selectAllFlag"><label for="selectAllFlag"></label></span>')
      .renderWith(function (data, type, row) {
        vm.selected[row.accountId] = false;
        return '<span class="check_span"><input class="input_check" ng-model="showUser.selected[\'' + row.accountId + '\'];" ng-click="showUser.toggleOne(showUser.selected)" type="checkbox" id="checkbox_' + row.accountId + '"><label for="checkbox_' + row.accountId + '"></label></span>';
      }).withClass('checkbox_col').notSortable(),
    DTColumnBuilder.newColumn('accountName').withTitle("用户名称")
      .renderWith(function (data, type, row) {
        return '<a title="查看用户详情" ng-click="showInfo(\'' + row.accountId + '\')">' + data + '</a>';
      }),
    DTColumnBuilder.newColumn('roles').withTitle("角色")
      .renderWith(function (data, type, row) {
        var string = "<span id='roleSpan'>"
        if (data.length > 0) {
          angular.forEach(data, function (d, index, array) {
            string = string + "<span class='roleSpan' id='" + d.roleId + "'>" + d.name + "</span>&nbsp;&nbsp;&nbsp;"
          })
        }
        string = string + "</span>"
        return string;
      }).notSortable()
  ];
  $scope.showInfo = function (accountId) {
    $state.go('app.user.users.userDetail', { userId: accountId });
  }


  function toggleAll(selectAll, selectedItems) {
    var f = false;
    for (var id in selectedItems) {
      if (selectedItems.hasOwnProperty(id)) {
        selectedItems[id] = selectAll;
        if (selectAll == false) {
          vm.disabled = true;
          vm.update = true;
          vm.del = true;
          $('#' + id).removeClass("active");
        } else {
          vm.disabled = false;
          vm.update = true;
          var type = $(".userTable").find("#" + id).children("td").last().find("#roleSpan");

          $(type).children("span").each(function () {
            if ($(this).html() == "superadmin") {
              f = true;
            }
          })

          if (f) {
            vm.del = true;
          } else {
            vm.del = false;
          }

          $('#' + id).addClass("active");
        }
      }
    }
  }
  function toggleOne(selectedItems) {
    var s = 0;
    var f = false;
    var selectedLength = 0;
    for (var id in selectedItems) {
      selectedLength++;
      if (selectedItems.hasOwnProperty(id)) {
        if (!selectedItems[id]) {
          vm.selectAll = false;
          $('#' + id).removeClass("active");
        } else {
          s++;
          $('#' + id).addClass("active");
          var type = $(".userTable").find("#" + id).children("td").last().find("#roleSpan");

          $(type).children("span").each(function () {
            if ($(this).html() == "superadmin") {
              f = true;
            }
          })

        }

      }
    }
    if (s > 0) {
      vm.disabled = false;
      if (s == tableLength) {
        vm.selectAll = true;
      } else {
        vm.selectAll = false;
      }
      if (f) {

        vm.update = true;
        vm.del = true;
      } else {
        if (s == 1) {
          vm.update = false;
          vm.del = false;
        } else {
          vm.update = true;
          vm.del = false;
        }

      }
    } else {
      vm.disabled = true;
      vm.update = true;
      vm.del = true;
    }
  }


  function drawCallback(result) {
    $(".selectpicker").selectpicker("render");
    $(".selectpicker").selectpicker("refresh");
    vm.selectAll = false;
    vm.disabled = true;
    vm.update = true;
    vm.del = true;
    $("#userTab_filter").find("input").addClass("filter_input");
    $(".userClearItem").remove();
    $('<i class="fa fa-times-circle item-error-style userClearItem" onclick="clearFilter(\'' + 'userTab_filter' + '\')"></i>').insertAfter($("#userTab_filter").find("input"));
    if ($("#userTab_filter").find("input").val() == "") {
      $(".userClearItem").hide();
    } else {
      $(".userClearItem").show();
    }
    $("#userTab_filter").find("input").unbind('keyup', showItem);
    $("#userTab_filter").find("input").bind('keyup', { cName: 'userClearItem' }, showItem);
    $(".userClearItem").click(function (e) {
      e.stopPropagation();
      e.preventDefault();
      $('#userTab').DataTable().search("").draw();
    })
    if ($("#userTab .dataTables_empty").size()) {
      $("#userTab_paginate").hide()
    } else {
      $("#userTab_paginate").show()
    }
    if (result.json) {
      vm.roles = {};
      angular.forEach(result.json.data, function (data, index, array) {
        if (data.roles.length > 0) {

          vm.roles[data.accountId] = data.roles;

        }
      })
    }

    var oTable = $(".userTable").dataTable();
    if ($.fn.dataTable.isDataTable(oTable)) {
      $(".userTable tbody").off("click", "span.row-details");
    }
    $('.userTable tbody').on('click', 'span.row-details', function () {
      var oTable = $(".userTable").dataTable();
      var nTr = $(this).parents("tr")[0];
      if (oTable.fnIsOpen(nTr)) {

        $(this).addClass("fa-plus-square-o").removeClass("fa-minus-square-o ");
        $(this).parents("tr").removeClass("active");
        oTable.fnClose(nTr);


      } else {
        fnFormatDetails(this, nTr, $(this).parents("tr").prop("id"), result.json);
        $(this).addClass("fa-minus-square-o ").removeClass("fa-plus-square-o ")
        $(this).parents("tr").addClass("active");


      }
    })

    if (result.json) {
      vm.updateInfo = {};
      angular.forEach(result.json.data, function (data, index, array) {
        vm.updateInfo[data.accountId] = data.resources;
      })
    }


  }

  function fnFormatDetails(select, nTr, pdataId, data) {
    var string = "";
    var oTable = $(".userTable").dataTable();
    var children = "<div class='row' >"
      + "<div style='padding-left:28px;'>" + translate.getWord("resources.allocation") + "</div>"
      + "<hr style='margin:6px !important'>"
      + "<div class=' col-sm-12 col-md-12 col-lg-12' id='" + pdataId + "_detail'>"
    angular.forEach(data.data, function (userdata, index, array) {
      if (userdata.accountId == pdataId) {
        if (userdata.accountType == "SuperAdmin") {

          children = children + "<div class='col-md-6 col-lg-6'>" + translate.getWord("superadmin.all.resoueces") + "</div>"

        } else {

          if ($.isEmptyObject(userdata.resources)) {
            children = children + "<div class='col-md-6 col-lg-6'>" + translate.getWord("no.resources") + "</div>"
          }

          if (userdata.resources.Domain) {
            children = children + '<div class=" col-md-12 col-lg-12" ><span><b>' + translate.getWord("table.domain") + '</b></span></div><div style="padding-left:30px">'
            angular.forEach(userdata.resources.Domain, function (data, index, array) {

              children = children + "<div class='col-md-1 col-lg-1' style='padding:8px 0px 8px 0px' id='" + data.resourceId + "' > "
                + data.resourceName + '</div>'

            })
            children = children + "</div>"
          }


          if (userdata.resources.StoragePool) {
            children = children + '<div class=" col-md-12 col-lg-12" ><span><b>' + translate.getWord("table.pool") + '</b></span></div><div style="padding-left:30px">'
            angular.forEach(userdata.resources.StoragePool, function (data, index, array) {
              children = children + "<div class='col-md-1 col-lg-1' style='padding:8px 0px 8px 0px' id='" + data.resourceId + "' > "
                + data.resourceName + '</div>'

            })
            children = children + "</div>"
          }

          if (userdata.resources.Volume) {
            children = children + '<div class=" col-md-12 col-lg-12" ><span><b>' + translate.getWord("volume.volume") + '</b></span></div><div style="padding-left:30px">'
            angular.forEach(userdata.resources.Volume, function (data, index, array) {
              children = children + "<div class='col-md-1 col-lg-1' style='padding:8px 0px 8px 0px' id='" + data.resourceId + "' > "
                + data.resourceName + '</div>'

            })
            children = children + "</div>"
          }



        }
      }
    })
    children = children + "</div></div>";
    oTable.fnOpen(nTr, children, 'details');


  }

  $scope.reloadData = function () {
    vm.dtInstance.reloadData(null, false);
  }

  $scope.resetCreate = function () {
    $scope.createForm.$setPristine();
    $scope.createForm.$setUntouched();
    document.getElementById("createForm").reset();

  }

  $scope.getRole = function () {
    $scope.resetCreate();
    $http({
      method: "POST",
      async: false,
      url: "listRoles",
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(response) {

      var string = "";
      angular.forEach(response.data.rolesList, function (data, index, array) {
        string = string + "<option value='" + data.roleId + "'>" + data.name + "</option>"
      })

      $("#createRole").html(string);
      $("#createRole").selectpicker('render');
      $("#createRole").selectpicker("refresh");
    }, function errorCallback(response) {
    });
  }
  
  $scope.create = function () {
    var rolesId;
    if ($("#createRole").val() == null) {
      rolesId = ""
    } else {
      rolesId = JSON.stringify($("#createRole").val());
    }
    $http({
      method: "POST",
      async: false,
      url: "createAccount",
      data: { "accountName": $scope.account, "newPassword": $scope.pwd, "roleIdsJson": rolesId },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(response) {
      if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
        showMessage.show($scope, "warn", translate.getWord("ERROR_0019_SessionOut"));
        $scope.logout();
        return;
      } else if (response.data.resultMessage.message == "success") {
        showMessage.show($scope, "success", translate.getWord("response.success"));
      } else {
        showMessage.show($scope, "error", translate.getWord(response.data.resultMessage.message));
      }
      vm.dtInstance.reloadData(null, false);
    }, function errorCallback(response) {

    });
    $scope.resetCreate();
  }




  $scope.deleteNames = function () {
    vm.selectName = [];
    $scope.deletenames = "";
    vm.selectedId = [];
    angular.forEach(vm.selected, function (data, index, array) {
      if (data == true) {
        vm.selectedId.push(index);
        var a = $("#" + index).children("td").eq("1").find("a").text()
        vm.selectName.push(a);

      }

    })
    $scope.deletenames = vm.selectName.join(",");
  }

  $scope.resetNames = function () {
    vm.selectName = [];
    $scope.resetnames = "";
    vm.selectedId = [];
    angular.forEach(vm.selected, function (data, index, array) {
      if (data == true) {
        vm.selectedId.push(index);
        var a = $("#" + index).children("td").eq("1").text()
        vm.selectName.push(a);

      }

    })
    $scope.resetnames = vm.selectName.join(",");

  }

  $scope.deleteBtn = function () {
    $http({
      method: "post",
      async: false,
      url: "deleteAccount",
      data: {
        idsJson: JSON.stringify(vm.selectedId)
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(response) {
      if (response.data.deleteAccountResult.message == "ERROR_0019_SessionOut") {
        showMessage.show($scope, "warn", translate.getWord("session.out"));
        $scope.logout();
        return;
      }
      if (response.data.deleteAccountResult.message == "success") {
        showMessage.show($scope, "success", translate.getWord("response.success"));


      } else {
        showMessage.show($scope, "error", translate.getWord(response.data.deleteAccountResult.message));
      }

      vm.dtInstance.reloadData(null, false);

    }, function errorCallback(data) {

    });


  }




  $scope.resetPwd = function () {

    angular.forEach(vm.selectedId, function (data, index, array) {
      $http({
        method: "post",
        async: false,
        url: "resetPassword",
        data: {
          accountId: data
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        transformRequest: function (obj) {
          var str = [];
          for (var s in obj) {
            str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
          }
          return str.join("&");
        }
      }).then(function successCallback(response) {

        if (response.data.resetPasswordResult.message == "ERROR_0019_SessionOut") {
          showMessage.show($scope, "warn", translate.getWord("session.out"));
          $scope.logout();
          return;
        }
        if (response.data.resetPasswordResult.message == "success") {
          showMessage.show($scope, "success", translate.getWord("response.success"));

        } else {
          showMessage.show($scope, "error", translate.getWord(response.data.resetPasswordResult.message));
        }

        vm.dtInstance.reloadData(null, false);

      }, function errorCallback(response) {

      })

    })


  }


  $scope.listRoles = function () {

    $http({
      method: "post",
      async: false,
      url: "listRoles",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(response) {
      if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
        showMessage.show($scope, "warn", translate.getWord("session.out"));
        $scope.logout();
        return;
      }
      if (response.data.resultMessage.message == "success") {
        var leftInner = "";
        angular.forEach(response.data.rolesList, function (data, index, array) {

          let showName = data.name;
          if (showName.length > 25) {
            showName = showName.substring(0, 25) + "...";
          }

          leftInner = leftInner
            + "<li class='list-group-item' id='" + data.roleId + "'>"
            + "<div class='input-group input-group-sm'>"
            + "<span class=' input-group-addon form-control' title='" + data.name + "'>" + showName + "</span>"
            + "<span class='input-group-btn'>"
            + "<button type='button' class='btn btn_blue pull-right' ng-click='addRole(\"" + data.roleId + "\",\"" + data.name + "\")'>"
            + "<span class='fa fa-plus'></span>"
            + "</button>"
            + "</span> </div></li>";
        })
        var $leftInner = $compile(leftInner)($scope)
        $("#all_role").html($leftInner);
        assiginRole();
        $("#role_modal").modal("show")


      } else {
        showMessage.show($scope, "error", translate.getWord(response.data.resultMessage.message));
      }



    }, function errorCallback(response) {

    })


  }
  function assiginRole() {
    angular.forEach(vm.selected, function (data, index, array) {
      var right = "";
      var flag = false;
      if (data == true) {
        currentId = index;
        angular.forEach(vm.roles, function (d, dex, array) {
          if (dex == index) {
            flag = true;
            angular.forEach(d, function (ta, ind, array) {
              let showName = ta.name;
              if (showName.length > 25) {
                showName = showName.substring(0, 25) + "...";
              }
              right = right
                + "<li class='list-group-item' id='" + ta.roleId + "'>"
                + "<div class='input-group input-group-sm'>"
                + "<span class=' input-group-addon form-control' title='" + ta.name + "'>" + showName + "</span>"
                + "<span class='input-group-btn'>"
                + "<button type='button' class='btn btn_blue pull-right' ng-click='removeRole(\"" + ta.roleId + "\",\"" + ta.name + "\")'>"
                + "<span class='fa fa-minus'></span>"
                + "</button>"
                + "</span> </div></li>";
              $("#all_role").find("#" + ta.roleId).remove();
            })



          }


        })

        if (!flag) {
          right = right + "<div id='rightDefault' style='text-align:center;padding-top:60px'>" + translate.getWord("unassign.role.for.user") + "</div>"
        }

        var $right = $compile(right)($scope);
        $("#used_role").html($right);


      }


    })
  }
  $scope.addRole = function (id, name) {
    $("#all_role").find("#" + id).remove();
    $("#used_role").find("#rightDefault").hide();
    var rightInner = "";
    let showName = name;
    if (showName.length > 25) {
      showName = showName.substring(0, 25) + "...";
    }
    rightInner = rightInner
      + "<li class='list-group-item' id='" + id + "'>"
      + "<div class='input-group input-group-sm'>"
      + "<span class='input-group-addon form-control' title='" + name + "'>" + showName + "</span>"
      + "<span class='input-group-btn'>"
      + "<button type='button' class='btn btn_blue' ng-click='removeRole(\"" + id + "\",\"" + name + "\")'>"
      + "<span class='fa fa-minus'></span>"
      + " </button>"
      + "</span> </div></li>";
    var $rightInner = $compile(rightInner)($scope);
    $("#used_role").append($rightInner);

  }
  $scope.removeRole = function (id, name) {
    $("#used_role").find("#" + id).remove();
    var leftInner = "";
    let showName = name;
    if (showName.length > 25) {
      showName = showName.substring(0, 25) + "...";
    }
    leftInner = leftInner
      + "<li class='list-group-item' id='" + id + "'>"
      + "<div class='input-group input-group-sm'>"
      + "<span class='input-group-addon form-control' title='" + name + "'>" + showName + "</span>"
      + "<span class='input-group-btn'>"
      + "<button type='button' class='btn btn_blue' ng-click='addRole(\"" + id + "\",\"" + name + "\")'>"
      + "<span class='fa fa-plus'></span>"
      + " </button>"
      + "</span> </div></li>";
    var $leftInner = $compile(leftInner)($scope);
    $("#all_role").append($leftInner);
  }

  $scope.resetRole = function () {
    $("#role_modal").modal("hide");
    var rolesId = new Array();
    $("#used_role").children("li").each(function () {
      rolesId.push($(this).attr("id"));
    })
    $http({
      method: "post",
      async: false,
      url: "assignRoles",
      data: {
        roleIdsJson: JSON.stringify(rolesId),
        accountId: currentId
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(response) {

      if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
        showMessage.show($scope, "warn", translate.getWord("session.out"));
        $scope.logout();
        return;
      }
      if (response.data.resultMessage.message == "success") {
        showMessage.show($scope, "success", translate.getWord("response.success"));

      } else {
        showMessage.show($scope, "error", translate.getWord(response.data.resultMessage.message));
      }

      vm.dtInstance.reloadData(null, false);

    }, function errorCallback(response) {

    })

  }

  $scope.getResource = function () {
    $scope.showResource = true;
    $http({
      method: "POST",
      async: false,
      url: "listResource",
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(response) {
      if (response.data.resultMessage.message == "success") {
        var string = "";
        if ($.isEmptyObject(response.data.resourceList)) {
          string = string + "<fieldset><section><label class='label' style='font-size:15px'>" + translate.getWord("create.resources.first") + "</label></section></fieldset>"
        }
        if (response.data.resourceList.Domain) {
          string = string + '<fieldset>'
            + '<section>'
            + '<label class="label">' + translate.getWord("table.domain") + '</label>'
            + ' <div class="inline-group col-sm-12">'
          angular.forEach(response.data.resourceList.Domain, function (data, index, array) {
            string = string
              + '<label class="checkbox col-sm-3 sourceName" title="' + data.resourceName + '">'
              + '<input type="checkbox" name="checkbox-inline" id="' + data.resourceId + '">'
              + '<i></i>' + data.resourceName + '</label>'

          })
          string = string + '</div></section></fieldset>'
        }
        if (response.data.resourceList.StoragePool) {

          string = string + '<fieldset>'
            + '<section>'
            + '<label class="label">' + translate.getWord("table.pool") + '</label>'
            + ' <div class="inline-group col-sm-12">'
          angular.forEach(response.data.resourceList.StoragePool, function (data, index, array) {
            string = string
              + '<label class="checkbox col-sm-3 sourceName" title="' + data.resourceName + '">'
              + '<input type="checkbox" name="checkbox-inline" id="' + data.resourceId + '" >'
              + '<i></i>' + data.resourceName + '</label>'

          })
          string = string + '</div></section></fieldset>'
        }
        if (response.data.resourceList.Volume) {

          string = string + '<fieldset>'
            + '<section>'
            + '<label class="label">' + translate.getWord("volume.volume") + '</label>'
            + ' <div class="inline-group col-sm-12">'
          angular.forEach(response.data.resourceList.Volume, function (data, index, array) {
            string = string
              + '<label class="checkbox col-sm-3 sourceName" title="' + data.resourceName + '">'
              + '<input type="checkbox" name="checkbox-inline" id="' + data.resourceId + '">'
              + '<i></i>' + data.resourceName + '</label>'

          })
          string = string + '</div></section></fieldset>'
        }

        var $inner = $compile(string)($scope);

        $("#update_resource").html($inner);

        angular.forEach(vm.selected, function (data, index, array) {
          if (data == true) {
            currentId = index;
            angular.forEach(vm.updateInfo, function (d, id, array) {
              if (id == index) {
                angular.forEach(d, function (api, dex, array) {

                  angular.forEach(api, function (ap, dex, array) {


                    $("#update_resource").find("#" + ap.resourceId).attr("checked", "checked");

                  })
                })
              }


            })

          }

        })



      } else {
        if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
          showMessage.show($scope, "warn", translate.getWord("session.out"));
          $scope.logout();
          return;
        } else {
          showMessage.show($scope, "error", translate.getWord(response.data.resultMessage.message));
        }

      }

    }, function errorCallback(response) {


    });
  }

  $scope.assignResourceBtn = function () {
    $("#updateResource_modal").modal("hide")
    $scope.showResource = false;
    vm.selectedresource = [];
    $('[name=checkbox-inline]:checkbox').each(function () {
      if (this.checked) {
        vm.selectedresource.push(this.id);
      }
    });

    $http({
      method: "POST",
      async: false,
      url: "assignResource",
      data: {
        targetAccountId: currentId,
        resourcesJson: JSON.stringify(vm.selectedresource)
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(response) {
      if (response.data.resultMessage.message == "success") {
        showMessage.show($scope, "success", translate.getWord("response.success"));
        vm.dtInstance.reloadData(null, false);
      } else {
        if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
          showMessage.show($scope, "warn", translate.getWord("session.out"));
          $scope.logout();
          return;
        } else {
          showMessage.show($scope, "error", translate.getWord(response.data.resultMessage.message));
        }

      }



    }, function errorCallback(response) {


    });
  }
  $scope.doFocus = function (id) {
    focus(id)
  }

})

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

angular.module('SmartAdmin.Layout').directive('fullScreen', function(){
	return {
		restrict: 'A',
		link: function(scope, element){
			var $body = $('body');
			var toggleFullSceen = function(e){
				if (!$body.hasClass("full-screen")) {
					$body.addClass("full-screen");
					if (document.documentElement.requestFullscreen) {
						document.documentElement.requestFullscreen();
					} else if (document.documentElement.mozRequestFullScreen) {
						document.documentElement.mozRequestFullScreen();
					} else if (document.documentElement.webkitRequestFullscreen) {
						document.documentElement.webkitRequestFullscreen();
					} else if (document.documentElement.msRequestFullscreen) {
						document.documentElement.msRequestFullscreen();
					}
				} else {
					$body.removeClass("full-screen");
					if (document.exitFullscreen) {
						document.exitFullscreen();
					} else if (document.mozCancelFullScreen) {
						document.mozCancelFullScreen();
					} else if (document.webkitExitFullscreen) {
						document.webkitExitFullscreen();
					}
				}
			};

			element.on('click', toggleFullSceen);

		}
	}
});
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

angular.module('SmartAdmin.Layout').directive('minifyMenu', function(){
    return {
        restrict: 'A',
        link: function(scope, element){
                var $body = $('body');
            var minifyMenu = function() {
                if (!$body.hasClass("menu-on-top")) {
                    $body.toggleClass("minified");
                    $body.removeClass("hidden-menu");
                    $('html').removeClass("hidden-menu-mobile-lock");
                }
            };

            element.on('click', minifyMenu);
        }
    }
})
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

angular.module('SmartAdmin.Layout').directive('reloadState', function ($rootScope) {
    return {
        restrict: 'A',
        compile: function (tElement, tAttributes) {
            tElement.removeAttr('reload-state data-reload-state');
            tElement.on('click', function (e) {
                $rootScope.$state.transitionTo($rootScope.$state.current, $rootScope.$stateParams, {
                    reload: true,
                    inherit: false,
                    notify: true
                });
                e.preventDefault();
            })
        }
    }
});

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

angular.module('SmartAdmin.Layout').directive('resetWidgets', function($state){

    return {
        restrict: 'A',
        link: function(scope, element){
            element.on('click', function(){
                $.SmartMessageBox({
                    title : "<i class='fa fa-refresh' style='color:green'></i> Clear Local Storage",
                    content : "Would you like to RESET all your saved widgets and clear LocalStorage?1",
                    buttons : '[No][Yes]'
                }, function(ButtonPressed) {
                    if (ButtonPressed == "Yes" && localStorage) {
                        localStorage.clear();
                        location.reload()
                    }
                });

            });
        }
    }

});

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

angular.module('SmartAdmin.Layout').directive('searchMobile', function () {
    return {
        restrict: 'A',
        compile: function (element, attributes) {
            element.removeAttr('search-mobile data-search-mobile');

            element.on('click', function (e) {
                $('body').addClass('search-mobile');
                e.preventDefault();
            });

            $('#cancel-search-js').on('click', function (e) {
                $('body').removeClass('search-mobile');
                e.preventDefault();
            });
        }
    }
});
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

angular.module('SmartAdmin.Layout').directive('toggleMenu', function(){
    return {
        restrict: 'A',
        link: function(scope, element){
            var $body = $('body');

            var toggleMenu = function(){
                if (!$body.hasClass("menu-on-top")){
                    $('html').toggleClass("hidden-menu-mobile-lock");
                    $body.toggleClass("hidden-menu");
                    $body.removeClass("minified");
                } else if ( $body.hasClass("menu-on-top") && $body.hasClass("mobile-view-activated") ) {
                    $('html').toggleClass("hidden-menu-mobile-lock");
                    $body.toggleClass("hidden-menu");
                    $body.removeClass("minified");
                }
            };

            element.on('click', toggleMenu);

            scope.$on('requestToggleMenu', function(){
                toggleMenu();
            });
        }
    }
});
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

angular.module('SmartAdmin.Layout').directive('alertMessage', function () {
	return {
		scope: {
			level: '=',//error,info,warn,success
			message: '=',
			show: '='
		},
		restrict: 'EA',
		replace: true,
		templateUrl: 'app/_common/layout/views/alertMessage.html',
		link: function (scope, element) {
			function change(scope){
				element.find('.icon').removeClass('danger info warn success');
				element.find('.message').html(scope.message);
				switch(scope.level){
					case "error":{
						element.find('.icon').addClass("danger");
						element.find('.title p').html('错误');
					};break;

					case "info":{
						element.find('.icon').addClass("info");
						element.find('.title p').html('信息');
					};break;
					case "warn":{
						element.find('.icon').addClass("warn");
						element.find('.title p').html('警告');
					};break;
					case "success":{
						element.find('.icon').addClass("success");
						element.find('.title p').html('成功');

					};break;
					default:{
						 element.find('.icon').addClass("info");
						element.find('.title p').html('信息');
						element.find('.message').html(scope.message);
					}
				}
					
			}
			scope.$watch('message',function(newMessage){
				change(scope);

			},true);
			
			scope.$watch('show',function(newShow){
				change(scope);
				if(newShow){
					element.fadeIn("slow");
					setTimeout(function(){element.fadeOut("slow");scope.show=false;},5000);
				}else{
					element.hide();
				}
			},true);
			// 
			
		}
	}
});

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

angular.module('SmartAdmin.Layout').directive('dismisser', function () {
    return {
        restrict: 'A',
        compile: function (element) {
            element.removeAttr('dismisser data-dissmiser')
            var closer = '<button class="close">&times;</button>';
            element.prepend(closer);
            element.on('click', '>button.close', function(){
                element.fadeOut('fast',function(){ $(this).remove(); });

            })
        }
    }
});
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

angular.module('SmartAdmin.Layout').directive('hrefVoid', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attributes) {
            element.attr('href','#');
            element.on('click', function(e){
                e.preventDefault();
                e.stopPropagation();
            })
        }
    }
});
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

/*
* Directive for toggling a ng-model with a button
* Source: https://gist.github.com/aeife/9374784
*/

angular.module('SmartAdmin.Layout').directive('radioToggle', function ($log) {
    return {
        scope: {
            model: "=ngModel",
            value: "@value"
        },
        link: function(scope, element, attrs) {

            element.parent().on('click', function() {
                scope.model = scope.value;
                scope.$apply();
            });
        }
    }
});
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

/**
 * DETECT MOBILE DEVICES
 * Description: Detects mobile device - if any of the listed device is
 *
 * detected class is inserted to <tElement>.
 *
 *  (so far this is covering most hand held devices)
 */
'use strict';

angular.module('SmartAdmin.Layout').directive('smartDeviceDetect', function () {
    return {
        restrict: 'A',
        compile: function (tElement, tAttributes) {
            tElement.removeAttr('smart-device-detect data-smart-device-detect');

            var isMobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
            
            tElement.toggleClass('desktop-detected', !isMobile);
            tElement.toggleClass('mobile-detected', isMobile);


        }
    }
});
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

/**
 *
 * Description: Directive utilizes FastClick library.
 *
 *
 * FastClick is a simple, easy-to-use library for eliminating the
 * 300ms delay between a physical tap and the firing of a click event on mobile browsers.
 * FastClick doesn't attach any listeners on desktop browsers.
 * @link: https://github.com/ftlabs/fastclick
 *
 * On mobile devices 'needsclick' class is attached to <tElement>
 *
 */


'use strict';

angular.module('SmartAdmin.Layout').directive('smartFastClick', function () {
    return {
        restrict: 'A',
        compile: function (tElement, tAttributes) {
            tElement.removeAttr('smart-fast-click data-smart-fast-click');

            FastClick.attach(tElement);

            if(!FastClick.notNeeded())
                tElement.addClass('needsclick')
        }
    }
});

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

angular.module('SmartAdmin.Layout').directive('smartFitAppView', function ($rootScope, SmartCss) {
    return {
        restrict: 'A',
        compile: function (element, attributes) {
            element.removeAttr('smart-fit-app-view data-smart-fit-app-view leading-y data-leading-y');

            var leadingY = attributes.leadingY ? parseInt(attributes.leadingY) : 0;

            var selector = attributes.smartFitAppView;

            if(SmartCss.appViewSize && SmartCss.appViewSize.height){
                var height =  SmartCss.appViewSize.height - leadingY < 252 ? 252 :  SmartCss.appViewSize.height - leadingY;
                SmartCss.add(selector, 'height', height+'px');
            }

            var listenerDestroy = $rootScope.$on('$smartContentResize', function (event, data) {
                var height = data.height - leadingY < 252 ? 252 : data.height - leadingY;
                SmartCss.add(selector, 'height', height+'px');
            });

            element.on('$destroy', function () {
                listenerDestroy();
                SmartCss.remove(selector, 'height');
            });


        }
    }
});

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

angular.module('SmartAdmin.Layout').directive('smartInclude', function () {
        return {
            replace: true,
            restrict: 'A',
            templateUrl: function (element, attr) {
                return attr.smartInclude;
            },
            compile: function(element){
                element[0].className = element[0].className.replace(/placeholder[^\s]+/g, '');
            }
        };
    }
);


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

angular.module('SmartAdmin.Layout').directive('smartLayout', function ($rootScope, $timeout, $interval, $q, SmartCss, APP_CONFIG) {
    
    var _debug = 0;

    function getDocHeight() {
        var D = document;
        return Math.max(
            D.body.scrollHeight, D.documentElement.scrollHeight,
            D.body.offsetHeight, D.documentElement.offsetHeight,
            D.body.clientHeight, D.documentElement.clientHeight
        );
    }

    var initialized = false, 
           initializedResolver = $q.defer();
    initializedResolver.promise.then(function () {
        initialized = true;
    });

    var $window = $(window),
        $document = $(document),
        $html = $('html'),
        $body = $('body'),
        $navigation ,
        $menu,
        $ribbon,
        $footer,
        $contentAnimContainer;


    (function cacheElements() {
        $navigation = $('#header');
        $menu = $('#left-panel');
        $ribbon = $('#ribbon');
        $footer = $('.page-footer');
        if (_.every([$navigation, $menu, $ribbon, $footer], function ($it) {
            return angular.isNumber($it.height())
        })) {
            initializedResolver.resolve();
        } else {
            $timeout(cacheElements, 100);
        }
    })();

    (function applyConfigSkin(){
        if(APP_CONFIG.smartSkin){
            $body.removeClass(_.pluck(APP_CONFIG.skins, 'name').join(' '));
            $body.addClass(APP_CONFIG.smartSkin);
        }
    })();


    return {
        priority: 2014,
        restrict: 'A',
        compile: function (tElement, tAttributes) {
            tElement.removeAttr('smart-layout data-smart-layout');

            var appViewHeight = 0 ,
                appViewWidth = 0,
                calcWidth,
                calcHeight,
                deltaX,
                deltaY;

            var forceResizeTrigger = false;

            function resizeListener() {

//                    full window height appHeight = Math.max($menu.outerHeight() - 10, getDocHeight() - 10);

                var menuHeight = $body.hasClass('menu-on-top') && $menu.is(':visible') ? $menu.height() : 0;
                var menuWidth = !$body.hasClass('menu-on-top') && $menu.is(':visible') ? $menu.width() + $menu.offset().left : 0;

                var $content = $('#content');
                var contentXPad = $content.outerWidth(true) - $content.width();
                var contentYPad = $content.outerHeight(true) - $content.height();


                calcWidth = $window.width() - menuWidth - contentXPad;
                calcHeight = $window.height() - menuHeight - contentYPad - $navigation.height() - $ribbon.height() - $footer.height();

                deltaX = appViewWidth - calcWidth;
                deltaY = appViewHeight - calcHeight;
                if (Math.abs(deltaX) || Math.abs(deltaY) || forceResizeTrigger) {

                    $rootScope.$broadcast('$smartContentResize', {
                        width: calcWidth,
                        height: calcHeight,
                        deltaX: deltaX,
                        deltaY: deltaY
                    });
                    appViewWidth = calcWidth;
                    appViewHeight = calcHeight;
                    forceResizeTrigger = false;
                }
            }


            var looping = false;
            $interval(function () {
                if (looping) loop();
            }, 300);

            var debouncedRun = _.debounce(function () {
                run(300)
            }, 300);

            function run(delay) {
                initializedResolver.promise.then(function () {
                    attachOnResize(delay);
                });
            }

            run(10);

            function detachOnResize() {
                looping = false;
            }

            function attachOnResize(delay) {
                $timeout(function () {
                    looping = true;
                }, delay);
            }

            function loop() {
                $body.toggleClass('mobile-view-activated', $window.width() < 979);
                if ($window.width() < 979)
                    $body.removeClass('minified');

                resizeListener();
            }

            function handleHtmlId(toState) {
                if (toState.data && toState.data.htmlId) $html.attr('id', toState.data.htmlId);
                else $html.removeAttr('id');
            }

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                handleHtmlId(toState);
                detachOnResize();
            });

            var viewContentLoading = 1;
            $rootScope.$on('$viewContentLoading', function (event, viewConfig) {
                viewContentLoading++;
            });

            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                forceResizeTrigger = true;
            });

            $rootScope.$on('$viewContentLoaded', function (event) {
                viewContentLoading--;
                if (viewContentLoading == 0 && initialized) {
                    debouncedRun();
                }
            });
        }
    }
});



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

angular.module('SmartAdmin.Layout').directive('smartPageTitle', function ($rootScope, $timeout) {
    return {
        restrict: 'A',
        compile: function (element, attributes) {
            element.removeAttr('smart-page-title data-smart-page-title');

            var defaultTitle = attributes.smartPageTitle;
            var listener = function(event, toState, toParams, fromState, fromParams) {
                var title = defaultTitle;
                if (toState.data && toState.data.title) title = toState.data.title + ' | ' + title;
                // Set asynchronously so page changes before title does
                $timeout(function() {
                    $('html head title').text(title);
                });
            };

            $rootScope.$on('$stateChangeStart', listener);

        }
    }
});
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

angular.module('SmartAdmin.Layout').directive('smartRouterAnimationWrap', function ($rootScope,$timeout) {
    return {
        restrict: 'A',
        compile: function (element, attributes) {
            element.removeAttr('smart-router-animation-wrap data-smart-router-animation-wrap wrap-for data-wrap-for');

            element.addClass('router-animation-container');


            var $loader = $('<div class="router-animation-loader"><i class="fa fa-gear fa-4x fa-spin"></i></div>')
                .css({
                    position: 'absolute',
                    top: 50,
                    left: 10
                }).hide().appendTo(element);


            var animateElementSelector = attributes.wrapFor;
            var viewsToMatch = attributes.smartRouterAnimationWrap.split(/\s/);

            var needRunContentViewAnimEnd = false;
            function contentViewAnimStart() {
                needRunContentViewAnimEnd = true;
                element.css({
                    height: element.height() + 'px',
                    overflow: 'hidden'
                }).addClass('active');
                $loader.fadeIn();

                $(animateElementSelector).addClass('animated faster fadeOutDown');
            }

            function contentViewAnimEnd() {
                if(needRunContentViewAnimEnd){
                    element.css({
                        height: 'auto',
                        overflow: 'visible'
                    }).removeClass('active');
                    

                    $(animateElementSelector).addClass('animated faster fadeInUp');

                    needRunContentViewAnimEnd = false;

                    $timeout(function(){
                        $(animateElementSelector).removeClass('animated');
                    },10);
                }
                $loader.fadeOut();
            }


            var destroyForStart = $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                var isAnimRequired = _.any(viewsToMatch, function(view){
                   return _.has(toState.views, view) || _.has(fromState.views, view);
                });
                if(isAnimRequired){
                    contentViewAnimStart()
                }
            });

            var destroyForEnd = $rootScope.$on('$viewContentLoaded', function (event) {
                contentViewAnimEnd();
            });

            element.on('$destroy', function(){
                destroyForStart();
                destroyForEnd();

            });



        }
    }
});
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

angular.module('SmartAdmin.Layout').directive('speechRecognition', function ($log) {
	'use strict';

	$.root_ = $('body');
	var root, commands;

    root = window;
    window.appConfig = window.appConfig || {};

	if (appConfig.voice_command) {
		commands = appConfig.commands;
	}


	/*
	 * SMART VOICE
	 * Author: MyOrange | @bootstraphunt
	 * http://www.myorange.ca
	 */

	var SpeechRecognition = root.SpeechRecognition || root.webkitSpeechRecognition || root.mozSpeechRecognition || root.msSpeechRecognition || root.oSpeechRecognition;

// ref: http://updates.html5rocks.com/2013/01/Voice-Driven-Web-Apps-Introduction-to-the-Web-Speech-API


// function
	$.speechApp = (function(speech) {

		speech.start = function() {

			// Add our commands to smartSpeechRecognition
			smartSpeechRecognition.addCommands(commands);

			if (smartSpeechRecognition) {
				// activate plugin
				smartSpeechRecognition.start();
				// add btn class
				$.root_.addClass("voice-command-active");
				// play sound
				$.speechApp.playON();
				// set localStorage when switch is on manually
				if (appConfig.voice_localStorage) {
					localStorage.setItem('sm-setautovoice', 'true');
				}

			} else {
				// if plugin not found
				alert("speech plugin not loaded");
			}

		};
		speech.stop = function() {

			if (smartSpeechRecognition) {
				// deactivate plugin
				smartSpeechRecognition.abort();
				// remove btn class
				$.root_.removeClass("voice-command-active");
				// sound
				$.speechApp.playOFF();
				// del localStorage when switch if off manually
				if (appConfig.voice_localStorage) {
					localStorage.setItem('sm-setautovoice', 'false');
				}
				// remove popover if visible
				if ($('#speech-btn .popover').is(':visible')) {
					$('#speech-btn .popover').fadeOut(250);
				}
			}

		};

		// play sound
		speech.playON = function() {

			var audioElement = document.createElement('audio');

			if (navigator.userAgent.match('Firefox/'))
				audioElement.setAttribute('src', appConfig.sound_path + 'voice_on' + ".ogg");
			else
				audioElement.setAttribute('src', appConfig.sound_path + 'voice_on' + ".mp3");

			//$.get();
			audioElement.addEventListener("load", function() {
				audioElement.play();
			}, true);

			if (appConfig.sound_on) {
				audioElement.pause();
				audioElement.play();
			}
		};

		speech.playOFF = function() {

			var audioElement = document.createElement('audio');

			if (navigator.userAgent.match('Firefox/'))
				audioElement.setAttribute('src', appConfig.sound_path + 'voice_off' + ".ogg");
			else
				audioElement.setAttribute('src', appConfig.sound_path + 'voice_off' + ".mp3");

			$.get();
			audioElement.addEventListener("load", function() {
				audioElement.play();
			}, true);

			if (appConfig.sound_on) {
				audioElement.pause();
				audioElement.play();
			}
		};

		speech.playConfirmation = function() {

			var audioElement = document.createElement('audio');

			if (navigator.userAgent.match('Firefox/'))
				audioElement.setAttribute('src', appConfig.sound_path + 'voice_alert' + ".ogg");
			else
				audioElement.setAttribute('src', appConfig.sound_path + 'voice_alert' + ".mp3");

			$.get();
			audioElement.addEventListener("load", function() {
				audioElement.play();
			}, true);

			if (appConfig.sound_on) {
				audioElement.pause();
				audioElement.play();
			}
		};

		return speech;

	})({});



	/*
	 * SPEECH RECOGNITION ENGINE
	 * Copyright (c) 2013 Tal Ater
	 * Modified by MyOrange
	 * All modifications made are hereby copyright (c) 2014 MyOrange
	 */

	(function(undefined) {"use strict";

		// Check browser support
		// This is done as early as possible, to make it as fast as possible for unsupported browsers
		if (!SpeechRecognition) {
			root.smartSpeechRecognition = null;
			return undefined;
		}

		var commandsList = [], recognition, callbacks = {
				start : [],
				error : [],
				end : [],
				result : [],
				resultMatch : [],
				resultNoMatch : [],
				errorNetwork : [],
				errorPermissionBlocked : [],
				errorPermissionDenied : []
			}, autoRestart, lastStartedAt = 0,
		//debugState = false, // decleared in app.appConfig.js
		//appConfig.debugStyle = 'font-weight: bold; color: #00f;', // decleared in app.appConfig.js

		// The command matching code is a modified version of Backbone.Router by Jeremy Ashkenas, under the MIT license.
			optionalParam = /\s*\((.*?)\)\s*/g, optionalRegex = /(\(\?:[^)]+\))\?/g, namedParam = /(\(\?)?:\w+/g, splatParam = /\*\w+/g, escapeRegExp = /[\-{}\[\]+?.,\\\^$|#]/g, commandToRegExp = function(command) {
				command = command.replace(escapeRegExp, '\\$&').replace(optionalParam, '(?:$1)?').replace(namedParam, function(match, optional) {
					return optional ? match : '([^\\s]+)';
				}).replace(splatParam, '(.*?)').replace(optionalRegex, '\\s*$1?\\s*');
				return new RegExp('^' + command + '$', 'i');
			};

		// This method receives an array of callbacks to iterate over, and invokes each of them
		var invokeCallbacks = function(callbacks) {
			callbacks.forEach(function(callback) {
				callback.callback.apply(callback.context);
			});
		};

		var initIfNeeded = function() {
			if (!isInitialized()) {
				root.smartSpeechRecognition.init({}, false);
			}
		};

		var isInitialized = function() {
			return recognition !== undefined;
		};

		root.smartSpeechRecognition = {
			// Initialize smartSpeechRecognition with a list of commands to recognize.
			// e.g. smartSpeechRecognition.init({'hello :name': helloFunction})
			// smartSpeechRecognition understands commands with named variables, splats, and optional words.
			init : function(commands, resetCommands) {

				// resetCommands defaults to true
				if (resetCommands === undefined) {
					resetCommands = true;
				} else {
					resetCommands = !!resetCommands;
				}

				// Abort previous instances of recognition already running
				if (recognition && recognition.abort) {
					recognition.abort();
				}

				// initiate SpeechRecognition
				recognition = new SpeechRecognition();

				// Set the max number of alternative transcripts to try and match with a command
				recognition.maxAlternatives = 5;
				recognition.continuous = true;
				// Sets the language to the default 'en-US'. This can be changed with smartSpeechRecognition.setLanguage()
				recognition.lang = appConfig.voice_command_lang || 'en-US';

				recognition.onstart = function() {
					invokeCallbacks(callbacks.start);
					//debugState
					if (appConfig.debugState) {
						root.console.log('%c ✔ SUCCESS: User allowed access the microphone service to start ', appConfig.debugStyle_success);
						root.console.log('Language setting is set to: ' + recognition.lang, appConfig.debugStyle);
					}
					$.root_.removeClass("service-not-allowed");
					$.root_.addClass("service-allowed");
				};

				recognition.onerror = function(event) {
					invokeCallbacks(callbacks.error);
					switch (event.error) {
						case 'network':
							invokeCallbacks(callbacks.errorNetwork);
							break;
						case 'not-allowed':
						case 'service-not-allowed':
							// if permission to use the mic is denied, turn off auto-restart
							autoRestart = false;
							$.root_.removeClass("service-allowed");
							$.root_.addClass("service-not-allowed");
							//debugState
							if (appConfig.debugState) {
								root.console.log('%c WARNING: Microphone was not detected (either user denied access or it is not installed properly) ', appConfig.debugStyle_warning);
							}
							// determine if permission was denied by user or automatically.
							if (new Date().getTime() - lastStartedAt < 200) {
								invokeCallbacks(callbacks.errorPermissionBlocked);
							} else {
								invokeCallbacks(callbacks.errorPermissionDenied);
							}
							break;
					}
				};

				recognition.onend = function() {
					invokeCallbacks(callbacks.end);
					// smartSpeechRecognition will auto restart if it is closed automatically and not by user action.
					if (autoRestart) {
						// play nicely with the browser, and never restart smartSpeechRecognition automatically more than once per second
						var timeSinceLastStart = new Date().getTime() - lastStartedAt;
						if (timeSinceLastStart < 1000) {
							setTimeout(root.smartSpeechRecognition.start, 1000 - timeSinceLastStart);
						} else {
							root.smartSpeechRecognition.start();
						}
					}
				};

				recognition.onresult = function(event) {
					invokeCallbacks(callbacks.result);

					var results = event.results[event.resultIndex], commandText;

					// go over each of the 5 results and alternative results received (we've set maxAlternatives to 5 above)
					for (var i = 0; i < results.length; i++) {
						// the text recognized
						commandText = results[i].transcript.trim();
						if (appConfig.debugState) {
							root.console.log('Speech recognized: %c' + commandText, appConfig.debugStyle);
						}

						// try and match recognized text to one of the commands on the list
						for (var j = 0, l = commandsList.length; j < l; j++) {
							var result = commandsList[j].command.exec(commandText);
							if (result) {
								var parameters = result.slice(1);
								if (appConfig.debugState) {
									root.console.log('command matched: %c' + commandsList[j].originalPhrase, appConfig.debugStyle);
									if (parameters.length) {
										root.console.log('with parameters', parameters);
									}
								}
								// execute the matched command
								commandsList[j].callback.apply(this, parameters);
								invokeCallbacks(callbacks.resultMatch);

								// for commands "sound on", "stop" and "mute" do not play sound or display message
								//var myMatchedCommand = commandsList[j].originalPhrase;

								var ignoreCallsFor = ["sound on", "mute", "stop"];

								if (ignoreCallsFor.indexOf(commandsList[j].originalPhrase) < 0) {
									// play sound when match found
									$.smallBox({
										title : (commandsList[j].originalPhrase),
										content : "loading...",
										color : "#333",
										sound_file : 'voice_alert',
										timeout : 2000
									});

									if ($('#speech-btn .popover').is(':visible')) {
										$('#speech-btn .popover').fadeOut(250);
									}
								}// end if

								return true;
							}
						} // end for
					}// end for

					invokeCallbacks(callbacks.resultNoMatch);
					$.smallBox({
						title : "Error: <strong>" + ' " ' + commandText + ' " ' + "</strong> no match found!",
						content : "Please speak clearly into the microphone",
						color : "#a90329",
						timeout : 5000,
						icon : "fa fa-microphone"
					});
					if ($('#speech-btn .popover').is(':visible')) {
						$('#speech-btn .popover').fadeOut(250);
					}
					return false;
				};

				// build commands list
				if (resetCommands) {
					commandsList = [];
				}
				if (commands.length) {
					this.addCommands(commands);
				}
			},

			// Start listening (asking for permission first, if needed).
			// Call this after you've initialized smartSpeechRecognition with commands.
			// Receives an optional options object:
			// { autoRestart: true }
			start : function(options) {
				initIfNeeded();
				options = options || {};
				if (options.autoRestart !== undefined) {
					autoRestart = !!options.autoRestart;
				} else {
					autoRestart = true;
				}
				lastStartedAt = new Date().getTime();
				recognition.start();
			},

			// abort the listening session (aka stop)
			abort : function() {
				autoRestart = false;
				if (isInitialized) {
					recognition.abort();
				}
			},

			// Turn on output of debug messages to the console. Ugly, but super-handy!
			debug : function(newState) {
				if (arguments.length > 0) {
					appConfig.debugState = !!newState;
				} else {
					appConfig.debugState = true;
				}
			},

			// Set the language the user will speak in. If not called, defaults to 'en-US'.
			// e.g. 'fr-FR' (French-France), 'es-CR' (Español-Costa Rica)
			setLanguage : function(language) {
				initIfNeeded();
				recognition.lang = language;
			},

			// Add additional commands that smartSpeechRecognition will respond to. Similar in syntax to smartSpeechRecognition.init()
			addCommands : function(commands) {
				var cb, command;

				initIfNeeded();

				for (var phrase in commands) {
					if (commands.hasOwnProperty(phrase)) {
						cb = root[commands[phrase]] || commands[phrase];
						if ( typeof cb !== 'function') {
							continue;
						}
						//convert command to regex
						command = commandToRegExp(phrase);

						commandsList.push({
							command : command,
							callback : cb,
							originalPhrase : phrase
						});
					}
				}
				if (appConfig.debugState) {
					root.console.log('Commands successfully loaded: %c' + commandsList.length, appConfig.debugStyle);
				}
			},

			// Remove existing commands. Called with a single phrase, array of phrases, or methodically. Pass no params to remove all commands.
			removeCommands : function(commandsToRemove) {
				if (commandsToRemove === undefined) {
					commandsList = [];
					return;
				}
				commandsToRemove = Array.isArray(commandsToRemove) ? commandsToRemove : [commandsToRemove];
				commandsList = commandsList.filter(function(command) {
					for (var i = 0; i < commandsToRemove.length; i++) {
						if (commandsToRemove[i] === command.originalPhrase) {
							return false;
						}
					}
					return true;
				});
			},

			// Lets the user add a callback of one of 9 types:
			// start, error, end, result, resultMatch, resultNoMatch, errorNetwork, errorPermissionBlocked, errorPermissionDenied
			// Can also optionally receive a context for the callback function as the third argument
			addCallback : function(type, callback, context) {
				if (callbacks[type] === undefined) {
					return;
				}
				var cb = root[callback] || callback;
				if ( typeof cb !== 'function') {
					return;
				}
				callbacks[type].push({
					callback : cb,
					context : context || this
				});
			}
		};

	}).call(this);

	var autoStart = function() {

		smartSpeechRecognition.addCommands(commands);

		if (smartSpeechRecognition) {
			// activate plugin
			smartSpeechRecognition.start();
			// add btn class
			$.root_.addClass("voice-command-active");
			// set localStorage when switch is on manually
			if (appConfig.voice_localStorage) {
				localStorage.setItem('sm-setautovoice', 'true');
			}

		} else {
			// if plugin not found
			alert("speech plugin not loaded");
		}
	}
// if already running with localstorage
	if (SpeechRecognition && appConfig.voice_command && localStorage.getItem('sm-setautovoice') == 'true') {
		autoStart();
	}

// auto start
	if (SpeechRecognition && appConfig.voice_command_auto && appConfig.voice_command) {
		autoStart();
	}


	var link = function(scope, element) {


		if (SpeechRecognition && appConfig.voice_command) {

			// create dynamic modal instance
			var modal = $('<div class="modal fade" id="voiceModal" tabindex="-1" role="dialog" aria-labelledby="remoteModalLabel" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"></div></div></div>');
			// attach to body
			modal.appendTo("body");

			element.on("click", function(e) {

            	if ($.root_.hasClass("voice-command-active")) {
					$.speechApp.stop();
					//$('#speech-btn > span > a > i').removeClass().addClass('fa fa-microphone-slash');
				} else {
					$.speechApp.start();
					//add popover
					$('#speech-btn .popover').fadeIn(350);
					//$('#speech-btn > span > a > i').removeClass().addClass('fa fa-microphone')

				}

				e.preventDefault();

            });

			//remove popover
			$(document).mouseup(function(e) {
				if (!$('#speech-btn .popover').is(e.target) && $('#speech-btn .popover').has(e.target).length === 0) {
					$('#speech-btn .popover').fadeOut(250);
				}
			});


			$("#speech-help-btn").on("click", function() {
				commands.help();
			});

		}
		else {
			$("#speech-btn").addClass("display-none");
		}


	}



    return {
        restrict: 'AE',
        link: link
    }
});

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
var pre,cur,isRresh=null
angular.module('SmartAdmin.Layout').directive('stateBreadcrumbs', function ($rootScope, $compile, $state, translate) {


  return {
    restrict: 'EA',
    replace: true,
    template: '<ol class="breadcrumb website_link" style="background: none;margin: 0 -5px;padding: 10px;margin-bottom:1px;border-radius: 0; font-size:12px"></ol>',
    link: function (scope, element) {
      function setBreadcrumbs(breadcrumbs) {
        pre = cur
        cur = breadcrumbs
        var preRouteMenu = pre?pre[0].title:''
        var curRouteMenu = cur?cur[0].title:''
        if(!pre){
          isRresh = true
        }else{
          isRresh = false
        }
        if(isRresh){
          setTimeout(()=>{
            $('li[data-menu-collapse]').children('a[title='+curRouteMenu+']').parent().find('ul:first').slideToggle(appConfig.menu_speed || 200)
            $('li[data-menu-collapse]').children('a[title='+curRouteMenu+']').parent().toggleClass('open active')
            $('li[data-menu-collapse]').children('a[title='+curRouteMenu+']').parent().find('>a .collapse-sign .fa').toggleClass('fa-angle-down fa-angle-right ')
          },500)
          return 
        }
        if(preRouteMenu==curRouteMenu){
        }else{
          var localMenu = $('li[data-menu-collapse]').children('a[title='+curRouteMenu+']').parent()
          if(curRouteMenu==='Dashboard'){
            $('nav>ul>li.open').find('>a .collapse-sign .fa').toggleClass('fa-angle-down fa-angle-right ')
            $('nav>ul>li.open').find('ul:first').slideToggle(appConfig.menu_speed || 200)
            return 
          }
          if(localMenu.find('>a .collapse-sign .fa').hasClass('fa-angle-down')){
            localMenu.siblings('.open').find('>a .collapse-sign .fa').toggleClass('fa-angle-down fa-angle-right ')
            localMenu.siblings('.open').find('ul:first').slideToggle(appConfig.menu_speed || 200)
            return
          }else{
            localMenu.find('>a .collapse-sign .fa').toggleClass('fa-angle-down fa-angle-right ')
            localMenu.find('ul:first').slideToggle(appConfig.menu_speed || 200)
            localMenu.siblings('.open').find('>a .collapse-sign .fa').toggleClass('fa-angle-down fa-angle-right ')
            localMenu.siblings('.open').find('ul:first').slideToggle(appConfig.menu_speed || 200)
            localMenu.siblings('.open').toggleClass('open active')
            localMenu.toggleClass('open active')
          }
        } 
        var html = '<li data-ui-sref="app.dashboard">主页</li>';
        angular.forEach(breadcrumbs, function (crumb) {
          html += '<li data-ui-sref=' + crumb.name + '>' + translate.getWord(crumb.title) + '</li>'
        });

        element.html($compile(html)(scope))
      }
      function fetchBreadcrumbs(stateName, breadcrunbs) {
        var state = $state.get(stateName);
        var breadcrunbsName = breadcrunbs.map(function (b) { return b.name; });
        if (state && state.data && state.data.title && breadcrunbsName.indexOf(state.data.title) == -1) {

          // breadcrunbs.unshift(state.data.title)
          breadcrunbs.unshift({ title: state.data.title, name: state.name })
        }

        var parentName = stateName.replace(/.?\w+$/, '');
        if (parentName) {
          return fetchBreadcrumbs(parentName, breadcrunbs);
        } else {
          return breadcrunbs;
        }
      }

      function processState(state) {
        var breadcrumbs;
        if (state.data && state.data.breadcrumbs) {
          breadcrumbs = state.data.breadcrumbs;
        } else {
          breadcrumbs = fetchBreadcrumbs(state.name, []);
        }

        setBreadcrumbs(breadcrumbs);
      }

      processState($state.current);

    }
  }
});

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

angular.module('SmartAdmin.Layout').factory('SmartCss', function ($rootScope, $timeout) {

    var sheet = (function () {
        // Create the <style> tag
        var style = document.createElement("style");

        // Add a media (and/or media query) here if you'd like!
        // style.setAttribute("media", "screen")
        // style.setAttribute("media", "@media only screen and (max-width : 1024px)")

        // WebKit hack :(
        style.appendChild(document.createTextNode(""));

        // Add the <style> element to the page
        document.head.appendChild(style);

        return style.sheet;
    })();

    var _styles = {};


    var SmartCss = {
        writeRule: function(selector){
            SmartCss.deleteRuleFor(selector);
            if(_.has(_styles, selector)){
                var css = selector + '{ ' + _.map(_styles[selector], function(v, k){
                    return  k + ':' +  v + ';'
                }).join(' ') +'}';
                sheet.insertRule(css, _.size(_styles) - 1);
            }
        },
        add: function (selector, property, value, delay) {
            if(!_.has(_styles, selector))
                _styles[selector] = {};

            if(value == undefined || value == null || value == '')
                delete _styles[selector][property];
            else
                _styles[selector][property] = value;


            if(_.keys(_styles[selector]).length == 0)
                delete _styles[selector];

            if(!delay)
                delay = 0;
            $timeout(function(){
                SmartCss.writeRule(selector);
            }, delay);

        },
        remove: function(selector, property, delay){
            SmartCss.add(selector, property, null, delay);
        },
        deleteRuleFor: function (selector) {
            _(sheet.rules).forEach(function (rule, idx) {
                if (rule.selectorText == selector) {
                    sheet.deleteRule(idx);
                }
            });
        },
        appViewSize: null
    };

    $rootScope.$on('$smartContentResize', function (event, data) {
        SmartCss.appViewSize = data;
    });

    return SmartCss;

});




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

angular.module('SmartAdmin.Layout').factory('lazyScript', function($q, $http){

    var cache = {};

    function isPending(scriptName){
        return (cache.hasOwnProperty(scriptName) && cache[scriptName].promise && cache[scriptName].promise.$$state.pending)
    }

    function isRegistered(scriptName){
        return cache.hasOwnProperty(scriptName)
    }
    function loadScript(scriptName){
        if(!cache[scriptName]){
            cache[scriptName] = $q.defer();
            var el = document.createElement( 'script' );
            el.onload = function(script){
                cache[scriptName].resolve(scriptName);
            };
            el.src = scriptName;
            var x = document.getElementsByTagName('script')[0];
            x.parentNode.insertBefore(el, x);
            
        }
        return cache[scriptName].promise;

    }

    function register(scriptName){
        if(isPending(scriptName)){
            return cache[scriptName].promise
        }
        if(isRegistered(scriptName)){
            return $q.resolve(scriptName);
        } else {
            var dfd = $q.defer();

            loadScript(scriptName).then(function(){
                dfd.resolve(scriptName);
            });

            return dfd.promise; 

        }
    }
    return {
        register: function (scripts) {
            
            var dfd = $q.defer();
            var promises = [];
            if (angular.isString(scripts))
                scripts = [scripts];

            angular.forEach(scripts, function(script){
                promises.push(register(script));
            })

            $q.all(promises).then(function(resolves){
                dfd.resolve(resolves);
            })
            return dfd.promise;

        }
    };
});
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

angular.module('SmartAdmin.Layout').service('showMessage', function() {
   
	this.show = function (scope,level,message) {
		scope.level=level;
		scope.message=message;
		scope.show=true;
		
	}
}).factory('focus', function ($timeout, $window) {  
	  return function (id) {  
		  $timeout(function () {  
		   var element = $window.document.getElementById(id);  
			if (element) element.focus();  
		  });  
	  };  
 });

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

'use strict'

angular
	.module('SmartAdmin.Layout')
	.factory('translate', function ($translate) {
		var getWord = {
			getWord: function (key, obj) {
				if (key) {
					return $translate.instant(key, obj)
				}
				return key
			},
		}
		return getWord
	})
	.filter('translate', function ($translate) {
		return function (key) {
			if (key) {
				return $translate.instant(key)
			}
		}
	})


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

angular.module('SmartAdmin.UI').directive('smartPopoverHtml', function () {
    return {
        restrict: "A",
        link: function(scope, element, attributes){
            var options = {};
            options.content = attributes.smartPopoverHtml;
            options.placement = attributes.popoverPlacement || 'top';
            options.html = true;
            options.trigger =  attributes.popoverTrigger || 'click';
            options.title =  attributes.popoverTitle || attributes.title;
            element.popover(options)

        }

    };
});


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

angular.module('SmartAdmin.UI').directive('smartTooltipHtml', function () {
        return {
            restrict: 'A',
            link: function(scope, element, attributes){
                element.tooltip({
                    placement: attributes.tooltipPlacement || 'top',
                    html: true,
                    title: attributes.smartTooltipHtml
                })
            }
        };
    }
);

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

angular.module('app.chat').factory('ChatApi', function ($q, $rootScope, User, $http, APP_CONFIG) {
    var dfd = $q.defer();
    var _user;
    var ChatSrv = {
        initialized: dfd.promise,
        users: [],
        messages: [],
        statuses: ['Online', 'Busy', 'Away', 'Log Off'],
        status: 'Online',
        setUser: function (user) {
            if (ChatSrv.users.indexOf(_user) != -1)
                ChatSrv.users.splice(ChatSrv.users.indexOf(_user), 1);
            _user = user;
            ChatSrv.users.push(_user);
        },
        sendMessage: function (text) {
            var message = {
                user: _user,
                body: text,
                date: new Date()
            };
            this.messages.push(message);
        }
    };


    $http.get(APP_CONFIG.apiRootUrl + '/chat.json').then(function(res){
        ChatSrv.messages = res.data.messages;
        ChatSrv.users = res.data.users;
        dfd.resolve();
    });

    ChatSrv.initialized.then(function () {

        User.initialized.then(function () {
            ChatSrv.setUser({
                username: User.username,
                picture: User.picture,
                status: ChatSrv.status
            });
        });

        $rootScope.$watch(function () {
            return User.username
        }, function (name, oldName) {
            if (name != oldName) {
                ChatSrv.setUser({
                    username: User.username,
                    picture: User.picture,
                    status: ChatSrv.status
                });
            }
        });
    });


    return ChatSrv;

});
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

(function() {
        
   'use strict';

    /*
    * SMARTCHAT PLUGIN ARRAYS & CONFIG
    * Dependency: js/plugin/moment/moment.min.js 
    *             js/plugin/cssemotions/jquery.cssemoticons.min.js 
    *             js/smart-chat-ui/smart.chat.ui.js
    * (DO NOT CHANGE) 
    */ 
        var boxList = [],
        showList = [],
        nameList = [],
        idList = [];
    /*
    * Width of the chat boxes, and the gap inbetween in pixel (minus padding)
    */ 
        var chatbox_config = {
            width: 200,
            gap: 35,
            offset: 0
        };



    /*
    * SMART CHAT ENGINE
    * Copyright (c) 2013 Wen Pu
    * Modified by MyOrange
    * All modifications made are hereby copyright (c) 2014-2015 MyOrange
    */

    // TODO: implement destroy()
    (function($) {
    $.widget("ui.chatbox", {
        options: {
            id: null, //id for the DOM element
            title: null, // title of the chatbox
            user: null, // can be anything associated with this chatbox
            hidden: false,
            offset: 0, // relative to right edge of the browser window
            width: 300, // width of the chatbox
            status: 'online', //
            alertmsg: null,
            alertshow: null,
            messageSent: function(id, user, msg) {
                // override this
                this.boxManager.addMsg(user.first_name, msg);
            },
            boxClosed: function(id) {
            }, // called when the close icon is clicked
            boxManager: {
                // thanks to the widget factory facility
                // similar to http://alexsexton.com/?p=51
                init: function(elem) {
                    this.elem = elem;
                },
                addMsg: function(peer, msg) {
                    var self = this;
                    var box = self.elem.uiChatboxLog;
                    var e = document.createElement('div');
                    box.append(e);
                    $(e).hide();

                    var systemMessage = false;

                    if (peer) {
                        var peerName = document.createElement("b");
                        $(peerName).text(peer + ": ");
                        e.appendChild(peerName);
                    } else {
                        systemMessage = true;
                    }

                    var msgElement = document.createElement(
                        systemMessage ? "i" : "span");
                    $(msgElement).text(msg);
                    e.appendChild(msgElement);
                    $(e).addClass("ui-chatbox-msg");
                    $(e).css("maxWidth", $(box).width());
                    $(e).fadeIn();
                    //$(e).prop( 'title', moment().calendar() ); // add dep: moment.js
                    $(e).find("span").emoticonize(); // add dep: jquery.cssemoticons.js
                    self._scrollToBottom();

                    if (!self.elem.uiChatboxTitlebar.hasClass("ui-state-focus")
                        && !self.highlightLock) {
                        self.highlightLock = true;
                        self.highlightBox();
                    }
                },
                highlightBox: function() {
                    var self = this;
                    self.elem.uiChatboxTitlebar.effect("highlight", {}, 300);
                    self.elem.uiChatbox.effect("bounce", {times: 2}, 300, function() {
                        self.highlightLock = false;
                        self._scrollToBottom();
                    });
                },
                toggleBox: function() {
                    this.elem.uiChatbox.toggle();
                },
                _scrollToBottom: function() {
                    var box = this.elem.uiChatboxLog;
                    box.scrollTop(box.get(0).scrollHeight);
                }
            }
        },
        toggleContent: function(event) {
            this.uiChatboxContent.toggle();
            if (this.uiChatboxContent.is(":visible")) {
                this.uiChatboxInputBox.focus();
            }
        },
        widget: function() {
            return this.uiChatbox
        },
        _create: function() {
            var self = this,
            options = self.options,
            title = options.title || "No Title",
            // chatbox
            uiChatbox = (self.uiChatbox = $('<div></div>'))
                .appendTo(document.body)
                .addClass('ui-widget ' +
                          //'ui-corner-top ' +
                          'ui-chatbox'
                         )
                .attr('outline', 0)
                .focusin(function() {
                    // ui-state-highlight is not really helpful here
                    //self.uiChatbox.removeClass('ui-state-highlight');
                    self.uiChatboxTitlebar.addClass('ui-state-focus');
                })
                .focusout(function() {
                    self.uiChatboxTitlebar.removeClass('ui-state-focus');
                }),
            // titlebar
            uiChatboxTitlebar = (self.uiChatboxTitlebar = $('<div></div>'))
                .addClass('ui-widget-header ' +
                          //'ui-corner-top ' +
                          'ui-chatbox-titlebar ' +
                          self.options.status +
                          ' ui-dialog-header' // take advantage of dialog header style
                         )
                .click(function(event) {
                    self.toggleContent(event);
                })
                .appendTo(uiChatbox),
            uiChatboxTitle = (self.uiChatboxTitle = $('<span></span>'))
                .html(title)
                .appendTo(uiChatboxTitlebar),
            uiChatboxTitlebarClose = (self.uiChatboxTitlebarClose = $('<a href="#" rel="tooltip" data-placement="top" data-original-title="Hide"></a>'))
                .addClass(//'ui-corner-all ' +
                          'ui-chatbox-icon '
                         )
                .attr('role', 'button')
                .hover(function() { uiChatboxTitlebarClose.addClass('ui-state-hover'); },
                       function() { uiChatboxTitlebarClose.removeClass('ui-state-hover'); })
                .click(function(event) {
                    uiChatbox.hide();
                    self.options.boxClosed(self.options.id);
                    return false;
                })
                .appendTo(uiChatboxTitlebar),
            uiChatboxTitlebarCloseText = $('<i></i>')
                .addClass('fa ' +
                          'fa-times')
                .appendTo(uiChatboxTitlebarClose),
            uiChatboxTitlebarMinimize = (self.uiChatboxTitlebarMinimize = $('<a href="#" rel="tooltip" data-placement="top" data-original-title="Minimize"></a>'))
                .addClass(//'ui-corner-all ' +
                          'ui-chatbox-icon'
                         )
                .attr('role', 'button')
                .hover(function() { uiChatboxTitlebarMinimize.addClass('ui-state-hover'); },
                       function() { uiChatboxTitlebarMinimize.removeClass('ui-state-hover'); })
                .click(function(event) {
                    self.toggleContent(event);
                    return false;
                })
                .appendTo(uiChatboxTitlebar),
            uiChatboxTitlebarMinimizeText = $('<i></i>')
                .addClass('fa ' +
                          'fa-minus')
                .appendTo(uiChatboxTitlebarMinimize),
            // content
            uiChatboxContent = (self.uiChatboxContent = $('<div class="'+ self.options.alertshow +'"><span class="alert-msg">'+ self.options.alertmsg + '</span></div>'))
                .addClass('ui-widget-content ' +
                          'ui-chatbox-content '
                         )
                .appendTo(uiChatbox),
            uiChatboxLog = (self.uiChatboxLog = self.element)
                .addClass('ui-widget-content ' +
                          'ui-chatbox-log ' +
                          'custom-scroll'
                         )
                .appendTo(uiChatboxContent),
            uiChatboxInput = (self.uiChatboxInput = $('<div></div>'))
                .addClass('ui-widget-content ' +
                          'ui-chatbox-input'
                         )
                .click(function(event) {
                    // anything?
                })
                .appendTo(uiChatboxContent),
            uiChatboxInputBox = (self.uiChatboxInputBox = $('<textarea></textarea>'))
                .addClass('ui-widget-content ' +
                          'ui-chatbox-input-box '
                         )
                .appendTo(uiChatboxInput)
                .keydown(function(event) {
                    if (event.keyCode && event.keyCode == $.ui.keyCode.ENTER) {
                        var msg = $.trim($(this).val());
                        if (msg.length > 0) {
                            self.options.messageSent(self.options.id, self.options.user, msg);
                        }
                        $(this).val('');
                        return false;
                    }
                })
                .focusin(function() {
                    uiChatboxInputBox.addClass('ui-chatbox-input-focus');
                    var box = $(this).parent().prev();
                    box.scrollTop(box.get(0).scrollHeight);
                })
                .focusout(function() {
                    uiChatboxInputBox.removeClass('ui-chatbox-input-focus');
                });

            // disable selection
            uiChatboxTitlebar.find('*').add(uiChatboxTitlebar).disableSelection();

            // switch focus to input box when whatever clicked
            uiChatboxContent.children().click(function() {
                // click on any children, set focus on input box
                self.uiChatboxInputBox.focus();
            });

            self._setWidth(self.options.width);
            self._position(self.options.offset);

            self.options.boxManager.init(self);

            if (!self.options.hidden) {
                uiChatbox.show();
            }
            
            $(".ui-chatbox [rel=tooltip]").tooltip();
        },
        _setOption: function(option, value) {
            if (value != null) {
                switch (option) {
                case "hidden":
                    if (value)
                        this.uiChatbox.hide();
                    else
                        this.uiChatbox.show();
                    break;
                case "offset":
                    this._position(value);
                    break;
                case "width":
                    this._setWidth(value);
                    break;
                }
            }
            $.Widget.prototype._setOption.apply(this, arguments);
        },
        _setWidth: function(width) {
            this.uiChatbox.width((width + 28) + "px");
            //this.uiChatboxTitlebar.width((width + 28) + "px");
            //this.uiChatboxLog.width(width + "px");
           // this.uiChatboxInput.css("maxWidth", width + "px");
            // padding:2, boarder:2, margin:5
            this.uiChatboxInputBox.css("width", (width + 18) + "px");
        },
        _position: function(offset) {
            this.uiChatbox.css("right", offset);
        }
    });
    }(jQuery));


    /*
    * jQuery CSSEmoticons plugin 0.2.9
    *
    * Copyright (c) 2010 Steve Schwartz (JangoSteve)
    *
    * Dual licensed under the MIT and GPL licenses:
    *   http://www.opensource.org/licenses/mit-license.php
    *   http://www.gnu.org/licenses/gpl.html
    *
    * Date: Sun Oct 22 1:00:00 2010 -0500
    */
    (function($) {
    $.fn.emoticonize = function(options) {

    var opts = $.extend({}, $.fn.emoticonize.defaults, options);

    var escapeCharacters = [ ")", "(", "*", "[", "]", "{", "}", "|", "^", "<", ">", "\\", "?", "+", "=", "." ];

    var threeCharacterEmoticons = [
        // really weird bug if you have :{ and then have :{) in the same container anywhere *after* :{ then :{ doesn't get matched, e.g. :] :{ :) :{) :) :-) will match everything except :{
        //  But if you take out the :{) or even just move :{ to the right of :{) then everything works fine. This has something to do with the preMatch string below I think, because
        //  it'll work again if you set preMatch equal to '()'
        //  So for now, we'll just remove :{) from the emoticons, because who actually uses this mustache man anyway?
      // ":{)",
      ":-)", ":o)", ":c)", ":^)", ":-D", ":-(", ":-9", ";-)", ":-P", ":-p", ":-Þ", ":-b", ":-O", ":-/", ":-X", ":-#", ":'(", "B-)", "8-)", ";*(", ":-*", ":-\\",
      "?-)", // <== This is my own invention, it's a smiling pirate (with an eye-patch)!
      // and the twoCharacterEmoticons from below, but with a space inserted
      ": )", ": ]", "= ]", "= )", "8 )", ": }", ": D", "8 D", "X D", "x D", "= D", ": (", ": [", ": {", "= (", "; )", "; ]", "; D", ": P", ": p", "= P", "= p", ": b", ": Þ", ": O", "8 O", ": /", "= /", ": S", ": #", ": X", "B )", ": |", ": \\", "= \\", ": *", ": &gt;", ": &lt;"//, "* )"
    ];

    var twoCharacterEmoticons = [ // separate these out so that we can add a letter-spacing between the characters for better proportions
      ":)", ":]", "=]", "=)", "8)", ":}", ":D", ":(", ":[", ":{", "=(", ";)", ";]", ";D", ":P", ":p", "=P", "=p", ":b", ":Þ", ":O", ":/", "=/", ":S", ":#", ":X", "B)", ":|", ":\\", "=\\", ":*", ":&gt;", ":&lt;"//, "*)"
    ];

    var specialEmoticons = { // emoticons to be treated with a special class, hash specifies the additional class to add, along with standard css-emoticon class
      "&gt;:)": { cssClass: "red-emoticon small-emoticon spaced-emoticon" },
      "&gt;;)": { cssClass: "red-emoticon small-emoticon spaced-emoticon"},
      "&gt;:(": { cssClass: "red-emoticon small-emoticon spaced-emoticon" },
      "&gt;: )": { cssClass: "red-emoticon small-emoticon" },
      "&gt;; )": { cssClass: "red-emoticon small-emoticon"},
      "&gt;: (": { cssClass: "red-emoticon small-emoticon" },
      ";(":     { cssClass: "red-emoticon spaced-emoticon" },
      "&lt;3":  { cssClass: "pink-emoticon counter-rotated" },
      "O_O":    { cssClass: "no-rotate" },
      "o_o":    { cssClass: "no-rotate" },
      "0_o":    { cssClass: "no-rotate" },
      "O_o":    { cssClass: "no-rotate" },
      "T_T":    { cssClass: "no-rotate" },
      "^_^":    { cssClass: "no-rotate" },
      "O:)":    { cssClass: "small-emoticon spaced-emoticon" },
      "O: )":   { cssClass: "small-emoticon" },
      "8D":     { cssClass: "small-emoticon spaced-emoticon" },
      "XD":     { cssClass: "small-emoticon spaced-emoticon" },
      "xD":     { cssClass: "small-emoticon spaced-emoticon" },
      "=D":     { cssClass: "small-emoticon spaced-emoticon" },
      "8O":     { cssClass: "small-emoticon spaced-emoticon" },
      "[+=..]":  { cssClass: "no-rotate nintendo-controller" }
      //"OwO":  { cssClass: "no-rotate" }, // these emoticons overflow and look weird even if they're made even smaller, could probably fix this with some more css trickery
      //"O-O":  { cssClass: "no-rotate" },
      //"O=)":    { cssClass: "small-emoticon" } 
    }

    var specialRegex = new RegExp( '(\\' + escapeCharacters.join('|\\') + ')', 'g' );
    // One of these characters must be present before the matched emoticon, or the matched emoticon must be the first character in the container HTML
    //  This is to ensure that the characters in the middle of HTML properties or URLs are not matched as emoticons
    //  Below matches ^ (first character in container HTML), \s (whitespace like space or tab), or \0 (NULL character)
    // (<\\S+.*>) matches <\\S+.*> (matches an HTML tag like <span> or <div>), but haven't quite gotten it working yet, need to push this fix now
    var preMatch = '(^|[\\s\\0])';

    for ( var i=threeCharacterEmoticons.length-1; i>=0; --i ){
      threeCharacterEmoticons[i] = threeCharacterEmoticons[i].replace(specialRegex,'\\$1');
      threeCharacterEmoticons[i] = new RegExp( preMatch+'(' + threeCharacterEmoticons[i] + ')', 'g' );
    }

    for ( var i=twoCharacterEmoticons.length-1; i>=0; --i ){
      twoCharacterEmoticons[i] = twoCharacterEmoticons[i].replace(specialRegex,'\\$1');
      twoCharacterEmoticons[i] = new RegExp( preMatch+'(' + twoCharacterEmoticons[i] + ')', 'g' );
    }

    for ( var emoticon in specialEmoticons ){
      specialEmoticons[emoticon].regexp = emoticon.replace(specialRegex,'\\$1');
      specialEmoticons[emoticon].regexp = new RegExp( preMatch+'(' + specialEmoticons[emoticon].regexp + ')', 'g' );
    }

    var exclude = 'span.css-emoticon';
    if(opts.exclude){ exclude += ','+opts.exclude; }
    var excludeArray = exclude.split(',')

    return this.not(exclude).each(function() {
      var container = $(this);
      var cssClass = 'css-emoticon'
      if(opts.animate){ cssClass += ' un-transformed-emoticon animated-emoticon'; }
      
      for( var emoticon in specialEmoticons ){
        var specialCssClass = cssClass + " " + specialEmoticons[emoticon].cssClass;
        container.html(container.html().replace(specialEmoticons[emoticon].regexp,"$1<span class='" + specialCssClass + "'>$2</span>"));
      }
      $(threeCharacterEmoticons).each(function(){
        container.html(container.html().replace(this,"$1<span class='" + cssClass + "'>$2</span>"));
      });                                                          
      $(twoCharacterEmoticons).each(function(){                    
        container.html(container.html().replace(this,"$1<span class='" + cssClass + " spaced-emoticon'>$2</span>"));
      });
      // fix emoticons that got matched more then once (where one emoticon is a subset of another emoticon), and thus got nested spans
      $.each(excludeArray,function(index,item){
        container.find($.trim(item)+" span.css-emoticon").each(function(){
          $(this).replaceWith($(this).text());
        });
      });
      if(opts.animate){
        setTimeout(function(){$('.un-transformed-emoticon').removeClass('un-transformed-emoticon');}, opts.delay);
      }
    });
    }

    $.fn.unemoticonize = function(options) {
    var opts = $.extend({}, $.fn.emoticonize.defaults, options);
    return this.each(function() {
      var container = $(this);
      container.find('span.css-emoticon').each(function(){
        // add delay equal to animate speed if animate is not false
        var span = $(this);
        if(opts.animate){
          span.addClass('un-transformed-emoticon');
          setTimeout(function(){span.replaceWith(span.text());}, opts.delay); 
        }else{
          span.replaceWith(span.text());
        }
      });
    });
    }

    $.fn.emoticonize.defaults = {animate: true, delay: 500, exclude: 'pre,code,.no-emoticons'}
    })(jQuery);

    var chatboxManager = function () {
        
    var init = function (options) {
        $.extend(chatbox_config, options)
    };


    var delBox = function (id) {
        // TODO
    };

    var getNextOffset = function () {
        return (chatbox_config.width + chatbox_config.gap) * showList.length;
    };

    var boxClosedCallback = function (id) {
        // close button in the titlebar is clicked
        var idx = showList.indexOf(id);
        if (idx != -1) {
            showList.splice(idx, 1);
            var diff = chatbox_config.width + chatbox_config.gap;
            for (var i = idx; i < showList.length; i++) {
                chatbox_config.offset = $("#" + showList[i]).chatbox("option", "offset");
                $("#" + showList[i]).chatbox("option", "offset", chatbox_config.offset - diff);
            }
        } else {
            alert("NOTE: Id missing from array: " + id);
        }
    };

    // caller should guarantee the uniqueness of id
    var addBox = function (id, user, name) {
        var idx1 = showList.indexOf(id);
        var idx2 = boxList.indexOf(id);
        if (idx1 != -1) {
            // found one in show box, do nothing
        } else if (idx2 != -1) {
            // exists, but hidden
            // show it and put it back to showList
            $("#" + id).chatbox("option", "offset", getNextOffset());
            var manager = $("#" + id).chatbox("option", "boxManager");
            manager.toggleBox();
            showList.push(id);
        } else {
            var el = document.createElement('div');
            el.setAttribute('id', id);
            $(el).chatbox({
                id: id,
                user: user,
                title: '<i title="' + user.status + '"></i>' + user.first_name + " " + user.last_name,
                hidden: false,
                offset: getNextOffset(),
                width: chatbox_config.width,
                status: user.status,
                alertmsg: user.alertmsg,
                alertshow: user.alertshow,
                messageSent: dispatch,
                boxClosed: boxClosedCallback
            });
            boxList.push(id);
            showList.push(id);
            nameList.push(user.first_name);
        }
    };

    var messageSentCallback = function (id, user, msg) {
        var idx = boxList.indexOf(id);
        chatbox_config.messageSent(nameList[idx], msg);
    };

    // not used in demo
    var dispatch = function (id, user, msg) {
        //$("#log").append("<i>" + moment().calendar() + "</i> you said to <b>" + user.first_name + " " + user.last_name + ":</b> " + msg + "<br/>");
        if ($('#chatlog').length){
            $("#chatlog").append("You said to <b>" + user.first_name + " " + user.last_name + ":</b> " + msg + "<br/>").effect("highlight", {}, 500);;
        }
        $("#" + id).chatbox("option", "boxManager").addMsg("Me", msg);
    }

    return {
        init: init,
        addBox: addBox,
        delBox: delBox,
        dispatch: dispatch
    };
    }();

    var link = function (scope, element, attributes) {

        $('a[data-chat-id]').click(function (event, ui) {
            if(!$(this).hasClass('offline')){

                var $this = $(this),
                    temp_chat_id = $this.attr("data-chat-id"),
                    fname = $this.attr("data-chat-fname"),
                    lname = $this.attr("data-chat-lname"),
                    status = $this.attr("data-chat-status") || "online",
                    alertmsg = $this.attr("data-chat-alertmsg"),
                    alertshow =  $this.attr("data-chat-alertshow") || false;


                chatboxManager.addBox(temp_chat_id, {
                    // dest:"dest" + counter, 
                    // not used in demo
                    title: "username" + temp_chat_id,
                    first_name: fname,
                    last_name: lname,
                    status: status,
                    alertmsg: alertmsg,
                    alertshow: alertshow
                    //you can add your own options too
                });
            }

            event.preventDefault();

        });

    }

    angular.module('app.chat').directive('asideChatWidget', function (ChatApi) {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'app/dashboard/chat/directives/aside-chat-widget.tpl.html',
            link: link
        }
    });

})(); 
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

angular.module('app.chat').directive('chatUsers', function(ChatApi){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/dashboard/chat/directives/chat-users.tpl.html',
        scope: true,
        link: function(scope, element){
            scope.open = false;
            scope.openToggle = function(){
                scope.open = !scope.open;
            };

            scope.chatUserFilter = '';

            ChatApi.initialized.then(function () {
                scope.chatUsers = ChatApi.users;
            });
        }
    }
});

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

angular.module('app.chat').directive('chatWidget', function (ChatApi) {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: 'app/dashboard/chat/directives/chat-widget.tpl.html',
        scope: {},
        link: function (scope, element) {
            scope.newMessage = '';

            scope.sendMessage = function () {
                ChatApi.sendMessage(scope.newMessage);
                scope.newMessage = '';
            };

            scope.messageTo = function(user){
                scope.newMessage += (user.username + ', ');
            };

            ChatApi.initialized.then(function () {
                scope.chatMessages = ChatApi.messages;
            });
            scope.$watch(function () {
                return ChatApi.messages.length
            }, function (count) {
                if (count){
                    var $body = $('.chat-body', element);
                    $body.animate({scrollTop: $body[0].scrollHeight});
                }
            })
        }
    }
});
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


angular.module('SmartAdmin.Forms').directive('bootstrapAttributeForm', function(){

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/_common/forms/directives/bootstrap-validation/bootstrap-attribute-form.tpl.html',
        link: function(scope, form){
            form.bootstrapValidator();


        }

    }
});
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


angular.module('SmartAdmin.Forms').directive('bootstrapButtonGroupForm', function(){

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/_common/forms/directives/bootstrap-validation/bootstrap-button-group-form.tpl.html',
        link: function(scope, form){
            form.bootstrapValidator({
                excluded : ':disabled',
                feedbackIcons : {
                    valid : 'glyphicon glyphicon-ok',
                    invalid : 'glyphicon glyphicon-remove',
                    validating : 'glyphicon glyphicon-refresh'
                },
                fields : {
                    gender : {
                        validators : {
                            notEmpty : {
                                message : 'The gender is required'
                            }
                        }
                    },
                    'languages[]' : {
                        validators : {
                            choice : {
                                min : 1,
                                max : 2,
                                message : 'Please choose 1 - 2 languages you can speak'
                            }
                        }
                    }
                }
            });


        }

    }
});
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


angular.module('SmartAdmin.Forms').directive('bootstrapContactForm', function(){

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/_common/forms/directives/bootstrap-validation/bootstrap-contact-form.tpl.html',
        link: function(scope, form){
            form.bootstrapValidator({
                container : '#messages',
                feedbackIcons : {
                    valid : 'glyphicon glyphicon-ok',
                    invalid : 'glyphicon glyphicon-remove',
                    validating : 'glyphicon glyphicon-refresh'
                },
                fields : {
                    fullName : {
                        validators : {
                            notEmpty : {
                                message : 'The full name is required and cannot be empty'
                            }
                        }
                    },
                    email : {
                        validators : {
                            notEmpty : {
                                message : 'The email address is required and cannot be empty'
                            },
                            emailAddress : {
                                message : 'The email address is not valid'
                            }
                        }
                    },
                    title : {
                        validators : {
                            notEmpty : {
                                message : 'The title is required and cannot be empty'
                            },
                            stringLength : {
                                max : 100,
                                message : 'The title must be less than 100 characters long'
                            }
                        }
                    },
                    content : {
                        validators : {
                            notEmpty : {
                                message : 'The content is required and cannot be empty'
                            },
                            stringLength : {
                                max : 500,
                                message : 'The content must be less than 500 characters long'
                            }
                        }
                    }
                }
            });

        }

    }

});
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


angular.module('SmartAdmin.Forms').directive('bootstrapMovieForm', function(){

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/_common/forms/directives/bootstrap-validation/bootstrap-movie-form.tpl.html',
        link: function(scope, form){
            form.bootstrapValidator({
                feedbackIcons : {
                    valid : 'glyphicon glyphicon-ok',
                    invalid : 'glyphicon glyphicon-remove',
                    validating : 'glyphicon glyphicon-refresh'
                },
                fields : {
                    title : {
                        group : '.col-md-8',
                        validators : {
                            notEmpty : {
                                message : 'The title is required'
                            },
                            stringLength : {
                                max : 200,
                                message : 'The title must be less than 200 characters long'
                            }
                        }
                    },
                    genre : {
                        group : '.col-md-4',
                        validators : {
                            notEmpty : {
                                message : 'The genre is required'
                            }
                        }
                    },
                    director : {
                        group : '.col-md-4',
                        validators : {
                            notEmpty : {
                                message : 'The director name is required'
                            },
                            stringLength : {
                                max : 80,
                                message : 'The director name must be less than 80 characters long'
                            }
                        }
                    },
                    writer : {
                        group : '.col-md-4',
                        validators : {
                            notEmpty : {
                                message : 'The writer name is required'
                            },
                            stringLength : {
                                max : 80,
                                message : 'The writer name must be less than 80 characters long'
                            }
                        }
                    },
                    producer : {
                        group : '.col-md-4',
                        validators : {
                            notEmpty : {
                                message : 'The producer name is required'
                            },
                            stringLength : {
                                max : 80,
                                message : 'The producer name must be less than 80 characters long'
                            }
                        }
                    },
                    website : {
                        group : '.col-md-6',
                        validators : {
                            notEmpty : {
                                message : 'The website address is required'
                            },
                            uri : {
                                message : 'The website address is not valid'
                            }
                        }
                    },
                    trailer : {
                        group : '.col-md-6',
                        validators : {
                            notEmpty : {
                                message : 'The trailer link is required'
                            },
                            uri : {
                                message : 'The trailer link is not valid'
                            }
                        }
                    },
                    review : {
                        // The group will be set as default (.form-group)
                        validators : {
                            stringLength : {
                                max : 500,
                                message : 'The review must be less than 500 characters long'
                            }
                        }
                    },
                    rating : {
                        // The group will be set as default (.form-group)
                        validators : {
                            notEmpty : {
                                message : 'The rating is required'
                            }
                        }
                    }
                }
            });

        }

    }

});
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


angular.module('SmartAdmin.Forms').directive('bootstrapProductForm', function(){

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/_common/forms/directives/bootstrap-validation/bootstrap-product-form.tpl.html',
        link: function(scope, form){
            form.bootstrapValidator({
                feedbackIcons : {
                    valid : 'glyphicon glyphicon-ok',
                    invalid : 'glyphicon glyphicon-remove',
                    validating : 'glyphicon glyphicon-refresh'
                },
                fields : {
                    price : {
                        validators : {
                            notEmpty : {
                                message : 'The price is required'
                            },
                            numeric : {
                                message : 'The price must be a number'
                            }
                        }
                    },
                    amount : {
                        validators : {
                            notEmpty : {
                                message : 'The amount is required'
                            },
                            numeric : {
                                message : 'The amount must be a number'
                            }
                        }
                    },
                    color : {
                        validators : {
                            notEmpty : {
                                message : 'The color is required'
                            }
                        }
                    },
                    size : {
                        validators : {
                            notEmpty : {
                                message : 'The size is required'
                            }
                        }
                    }
                }
            });
        }

    }
});
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


angular.module('SmartAdmin.Forms').directive('bootstrapProfileForm', function(){

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/_common/forms/directives/bootstrap-validation/bootstrap-profile-form.tpl.html',
        link: function(scope, form){
           form.bootstrapValidator({
                feedbackIcons : {
                    valid : 'glyphicon glyphicon-ok',
                    invalid : 'glyphicon glyphicon-remove',
                    validating : 'glyphicon glyphicon-refresh'
                },
                fields : {
                    email : {
                        validators : {
                            notEmpty : {
                                message : 'The email address is required'
                            },
                            emailAddress : {
                                message : 'The email address is not valid'
                            }
                        }
                    },
                    password : {
                        validators : {
                            notEmpty : {
                                message : 'The password is required'
                            }
                        }
                    }
                }
            });
        }

    }

});
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


angular.module('SmartAdmin.Forms').directive('bootstrapTogglingForm', function(){

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/_common/forms/directives/bootstrap-validation/bootstrap-toggling-form.tpl.html',
        link: function(scope, form){
            form.bootstrapValidator({
                feedbackIcons : {
                    valid : 'glyphicon glyphicon-ok',
                    invalid : 'glyphicon glyphicon-remove',
                    validating : 'glyphicon glyphicon-refresh'
                },
                fields : {
                    firstName : {
                        validators : {
                            notEmpty : {
                                message : 'The first name is required'
                            }
                        }
                    },
                    lastName : {
                        validators : {
                            notEmpty : {
                                message : 'The last name is required'
                            }
                        }
                    },
                    company : {
                        validators : {
                            notEmpty : {
                                message : 'The company name is required'
                            }
                        }
                    },
                    // These fields will be validated when being visible
                    job : {
                        validators : {
                            notEmpty : {
                                message : 'The job title is required'
                            }
                        }
                    },
                    department : {
                        validators : {
                            notEmpty : {
                                message : 'The department name is required'
                            }
                        }
                    },
                    mobilePhone : {
                        validators : {
                            notEmpty : {
                                message : 'The mobile phone number is required'
                            },
                            digits : {
                                message : 'The mobile phone number is not valid'
                            }
                        }
                    },
                    // These fields will be validated when being visible
                    homePhone : {
                        validators : {
                            digits : {
                                message : 'The home phone number is not valid'
                            }
                        }
                    },
                    officePhone : {
                        validators : {
                            digits : {
                                message : 'The office phone number is not valid'
                            }
                        }
                    }
                }
            }).find('button[data-toggle]').on('click', function() {
                var $target = $($(this).attr('data-toggle'));
                // Show or hide the additional fields
                // They will or will not be validated based on their visibilities
                $target.toggle();
                if (!$target.is(':visible')) {
                    // Enable the submit buttons in case additional fields are not valid
                    form.data('bootstrapValidator').disableSubmitButtons(false);
                }
            });
        }

    }



});
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

angular.module('SmartAdmin.Forms').directive('smartCkEditor', function () {
    return {
        restrict: 'A',
        compile: function ( tElement) {
            tElement.removeAttr('smart-ck-editor data-smart-ck-editor');
            //CKEDITOR.basePath = 'bower_components/ckeditor/';

            CKEDITOR.replace( tElement.attr('name'), { height: '380px', startupFocus : true} );
        }
    }
});
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

angular.module('SmartAdmin.Forms').directive('smartDestroySummernote', function () {
    return {
        restrict: 'A',
        compile: function (tElement, tAttributes) {
            tElement.removeAttr('smart-destroy-summernote data-smart-destroy-summernote')
            tElement.on('click', function() {
                angular.element(tAttributes.smartDestroySummernote).destroy();
            })
        }
    }
});

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

angular.module('SmartAdmin.Forms').directive('smartEditSummernote', function () {
    return {
        restrict: 'A',
        compile: function (tElement, tAttributes) {
            tElement.removeAttr('smart-edit-summernote data-smart-edit-summernote');
            tElement.on('click', function(){
                angular.element(tAttributes.smartEditSummernote).summernote({
                    focus : true
                });  
            });
        }
    }
});

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

angular.module('SmartAdmin.Forms').directive('smartMarkdownEditor', function () {
    return {
        restrict: 'A',
        compile: function (element, attributes) {
            element.removeAttr('smart-markdown-editor data-smart-markdown-editor')

            var options = {
                autofocus:false,
                savable:true,
                fullscreen: {
                    enable: false
                }
            };

            if(attributes.height){
                options.height = parseInt(attributes.height);
            }

            element.markdown(options);
        }
    }
});

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

angular.module('SmartAdmin.Forms').directive('smartSummernoteEditor', function (lazyScript) {
    return {
        restrict: 'A',
        compile: function (tElement, tAttributes) {
            tElement.removeAttr('smart-summernote-editor data-smart-summernote-editor');

            var options = {
                focus : true,
                tabsize : 2
            };

            if(tAttributes.height){
                options.height = tAttributes.height;
            }

            lazyScript.register('build/vendor.ui.js').then(function(){
                tElement.summernote(options);                
            });
        }
    }
});
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

angular.module('SmartAdmin.Forms').directive('smartCheckoutForm', function (formsCommon, lazyScript) {
    return {
        restrict: 'A',
        link: function (scope, form) {
           lazyScript.register('build/vendor.ui.js').then(function(){

               scope.countries = formsCommon.countries;

               form.validate(angular.extend({
                    // Rules for form validation
                    rules : {
                        fname : {
                            required : true
                        },
                        lname : {
                            required : true
                        },
                        email : {
                            required : true,
                            email : true
                        },
                        phone : {
                            required : true
                        },
                        country : {
                            required : true
                        },
                        city : {
                            required : true
                        },
                        code : {
                            required : true,
                            digits : true
                        },
                        address : {
                            required : true
                        },
                        name : {
                            required : true
                        },
                        card : {
                            required : true,
                            creditcard : true
                        },
                        cvv : {
                            required : true,
                            digits : true
                        },
                        month : {
                            required : true
                        },
                        year : {
                            required : true,
                            digits : true
                        }
                    },

                    // Messages for form validation
                    messages : {
                        fname : {
                            required : 'Please enter your first name'
                        },
                        lname : {
                            required : 'Please enter your last name'
                        },
                        email : {
                            required : 'Please enter your email address',
                            email : 'Please enter a VALID email address'
                        },
                        phone : {
                            required : 'Please enter your phone number'
                        },
                        country : {
                            required : 'Please select your country'
                        },
                        city : {
                            required : 'Please enter your city'
                        },
                        code : {
                            required : 'Please enter code',
                            digits : 'Digits only please'
                        },
                        address : {
                            required : 'Please enter your full address'
                        },
                        name : {
                            required : 'Please enter name on your card'
                        },
                        card : {
                            required : 'Please enter your card number'
                        },
                        cvv : {
                            required : 'Enter CVV2',
                            digits : 'Digits only'
                        },
                        month : {
                            required : 'Select month'
                        },
                        year : {
                            required : 'Enter year',
                            digits : 'Digits only please'
                        }
                    }
                }, formsCommon.validateOptions));
            });
        }
    }
});
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

angular.module('SmartAdmin.Forms').directive('smartCommentForm', function (formsCommon, lazyScript) {
    return {
        restrict: 'A',
        link: function (scope, form) {
            lazyScript.register('build/vendor.ui.js').then(function(){
                form.validate(angular.extend({
                    // Rules for form validation
                    rules : {
                        name : {
                            required : true
                        },
                        email : {
                            required : true,
                            email : true
                        },
                        url : {
                            url : true
                        },
                        comment : {
                            required : true
                        }
                    },

                    // Messages for form validation
                    messages : {
                        name : {
                            required : 'Enter your name',
                        },
                        email : {
                            required : 'Enter your email address',
                            email : 'Enter a VALID email'
                        },
                        url : {
                            email : 'Enter a VALID url'
                        },
                        comment : {
                            required : 'Please enter your comment'
                        }
                    },

                    // Ajax form submition
                    submitHandler : function() {
                        form.ajaxSubmit({
                            success : function() {
                                form.addClass('submited');
                            }
                        });
                    }

                }, formsCommon.validateOptions));
            });

        }
    }
});

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

angular.module('SmartAdmin.Forms').directive('smartContactsForm', function (formsCommon, lazyScript) {
    return {
        restrict: 'A',
        link: function (scope, form) {
            lazyScript.register('build/vendor.ui.js').then(function(){
                form.validate(angular.extend({
                    // Rules for form validation
                    rules : {
                        name : {
                            required : true
                        },
                        email : {
                            required : true,
                            email : true
                        },
                        message : {
                            required : true,
                            minlength : 10
                        }
                    },

                    // Messages for form validation
                    messages : {
                        name : {
                            required : 'Please enter your name'
                        },
                        email : {
                            required : 'Please enter your email address',
                            email : 'Please enter a VALID email address'
                        },
                        message : {
                            required : 'Please enter your message'
                        }
                    },

                    // Ajax form submition
                    submitHandler : function() {
                        form.ajaxSubmit({
                            success : function() {
                                form.addClass('submited');
                            }
                        });
                    }
                }, formsCommon.validateOptions));
            });
        }
    }
});
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

angular.module('SmartAdmin.Forms').directive('smartOrderForm', function (formsCommon, lazyScript) {
    return {
        restrict: 'E',
        link: function (scope, form) {
            lazyScript.register('build/vendor.ui.js').then(function(){
                form.validate(angular.extend({
                    // Rules for form validation
                    rules : {
                        name : {
                            required : true
                        },
                        email : {
                            required : true,
                            email : true
                        },
                        phone : {
                            required : true
                        },
                        interested : {
                            required : true
                        },
                        budget : {
                            required : true
                        }
                    },

                    // Messages for form validation
                    messages : {
                        name : {
                            required : 'Please enter your name'
                        },
                        email : {
                            required : 'Please enter your email address',
                            email : 'Please enter a VALID email address'
                        },
                        phone : {
                            required : 'Please enter your phone number'
                        },
                        interested : {
                            required : 'Please select interested service'
                        },
                        budget : {
                            required : 'Please select your budget'
                        }
                    },

                }, formsCommon.validateOptions));
            });

        }
    }
});
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

angular.module('SmartAdmin.Forms').directive('smartRegistrationForm', function (formsCommon, lazyScript) {
    return {
        restrict: 'A',
        link: function (scope, form, attributes) {
            lazyScript.register('build/vendor.ui.js').then(function(){
                form.validate(angular.extend({

                    // Rules for form validation
                    rules: {
                        username: {
                            required: true
                        },
                        email: {
                            required: true,
                            email: true
                        },
                        password: {
                            required: true,
                            minlength: 3,
                            maxlength: 20
                        },
                        passwordConfirm: {
                            required: true,
                            minlength: 3,
                            maxlength: 20,
                            equalTo: '#password'
                        },
                        firstname: {
                            required: true
                        },
                        lastname: {
                            required: true
                        },
                        gender: {
                            required: true
                        },
                        terms: {
                            required: true
                        }
                    },

                    // Messages for form validation
                    messages: {
                        login: {
                            required: 'Please enter your login'
                        },
                        email: {
                            required: 'Please enter your email address',
                            email: 'Please enter a VALID email address'
                        },
                        password: {
                            required: 'Please enter your password'
                        },
                        passwordConfirm: {
                            required: 'Please enter your password one more time',
                            equalTo: 'Please enter the same password as above'
                        },
                        firstname: {
                            required: 'Please select your first name'
                        },
                        lastname: {
                            required: 'Please select your last name'
                        },
                        gender: {
                            required: 'Please select your gender'
                        },
                        terms: {
                            required: 'You must agree with Terms and Conditions'
                        }
                    }

                }, formsCommon.validateOptions));
            });
        }
    }
});
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

angular.module('SmartAdmin.Forms').directive('smartReviewForm', function (formsCommon, lazyScript) {
    return {
        restrict: 'E',
        link: function (scope, form) {
            lazyScript.register('build/vendor.ui.js').then(function(){

                form.validate(angular.extend({
                    // Rules for form validation
                    rules : {
                        name : {
                            required : true
                        },
                        email : {
                            required : true,
                            email : true
                        },
                        review : {
                            required : true,
                            minlength : 20
                        },
                        quality : {
                            required : true
                        },
                        reliability : {
                            required : true
                        },
                        overall : {
                            required : true
                        }
                    },

                    // Messages for form validation
                    messages : {
                        name : {
                            required : 'Please enter your name'
                        },
                        email : {
                            required : 'Please enter your email address',
                            email : '<i class="fa fa-warning"></i><strong>Please enter a VALID email addres</strong>'
                        },
                        review : {
                            required : 'Please enter your review'
                        },
                        quality : {
                            required : 'Please rate quality of the product'
                        },
                        reliability : {
                            required : 'Please rate reliability of the product'
                        },
                        overall : {
                            required : 'Please rate the product'
                        }
                    }

                }, formsCommon.validateOptions));
            });
        }
    }
});
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

angular.module('SmartAdmin.Forms').directive('smartJcrop', function ($q) {
    return {
        restrict: 'A',
        scope: {
            coords: '=',
            options: '=',
            selection: '='
        },
        link: function (scope, element, attributes) {
            var jcropApi, imageWidth, imageHeight, imageLoaded = $q.defer();

            var listeners = {
                onSelectHandlers: [],
                onChangeHandlers: [],
                onSelect: function (c) {
                    angular.forEach(listeners.onSelectHandlers, function (handler) {
                        handler.call(jcropApi, c)
                    })
                },
                onChange: function (c) {
                    angular.forEach(listeners.onChangeHandlers, function (handler) {
                        handler.call(jcropApi, c)
                    })
                }
            };

            if (attributes.coords) {
                var coordsUpdate = function (c) {
                    scope.$apply(function () {
                        scope.coords = c;
                    });
                };
                listeners.onSelectHandlers.push(coordsUpdate);
                listeners.onChangeHandlers.push(coordsUpdate);
            }

            var $previewPane = $(attributes.smartJcropPreview),
                $previewContainer = $previewPane.find('.preview-container'),
                $previewImg = $previewPane.find('img');

            if ($previewPane.length && $previewImg.length) {
                var previewUpdate = function (coords) {
                    if (parseInt(coords.w) > 0) {
                        var rx = $previewContainer.width() / coords.w;
                        var ry = $previewContainer.height() / coords.h;

                        $previewImg.css({
                            width: Math.round(rx * imageWidth) + 'px',
                            height: Math.round(ry * imageHeight) + 'px',
                            marginLeft: '-' + Math.round(rx * coords.x) + 'px',
                            marginTop: '-' + Math.round(ry * coords.y) + 'px'
                        });
                    }
                };
                listeners.onSelectHandlers.push(previewUpdate);
                listeners.onChangeHandlers.push(previewUpdate);
            }


            var options = {
                onSelect: listeners.onSelect,
                onChange: listeners.onChange
            };

            if ($previewContainer.length) {
                options.aspectRatio = $previewContainer.width() / $previewContainer.height()
            }

            if (attributes.selection) {
                scope.$watch('selection', function (newVal, oldVal) {
                    if (newVal != oldVal) {
                        var rectangle = newVal == 'release' ? [imageWidth / 2, imageHeight / 2, imageWidth / 2, imageHeight / 2] : newVal;

                        var callback = newVal == 'release' ? function () {
                            jcropApi.release();
                        } : angular.noop;

                        imageLoaded.promise.then(function () {
                            if (scope.options && scope.options.animate) {
                                jcropApi.animateTo(rectangle, callback);
                            } else {
                                jcropApi.setSelect(rectangle);
                            }
                        });
                    }
                });
            }

            if (attributes.options) {

                var optionNames = [
                    'bgOpacity', 'bgColor', 'bgFade', 'shade', 'outerImage',
                    'allowSelect', 'allowMove', 'allowResize',
                    'aspectRatio'
                ];

                angular.forEach(optionNames, function (name) {
                    if (scope.options[name])
                        options[name] = scope.options[name]

                    scope.$watch('options.' + name, function (newVal, oldVal) {
                        if (newVal != oldVal) {
                            imageLoaded.promise.then(function () {
                                var update = {};
                                update[name] = newVal;
                                jcropApi.setOptions(update);
                            });
                        }
                    });

                });


                scope.$watch('options.disabled', function (newVal, oldVal) {
                    if (newVal != oldVal) {
                        if (newVal) {
                            jcropApi.disable();
                        } else {
                            jcropApi.enable();
                        }
                    }
                });

                scope.$watch('options.destroyed', function (newVal, oldVal) {
                    if (newVal != oldVal) {
                        if (newVal) {
                            jcropApi.destroy();
                        } else {
                            _init();
                        }
                    }
                });

                scope.$watch('options.src', function (newVal, oldVal) {
                    imageLoaded = $q.defer();
                    if (newVal != oldVal) {
                        jcropApi.setImage(scope.options.src, function () {
                            imageLoaded.resolve();
                        });
                    }
                });

                var updateSize = function(){
                    jcropApi.setOptions({
                        minSize: [scope.options.minSizeWidth, scope.options.minSizeHeight],
                        maxSize: [scope.options.maxSizeWidth, scope.options.maxSizeHeight]
                    });
                };

                scope.$watch('options.minSizeWidth', function (newVal, oldVal) {
                    if (newVal != oldVal) updateSize();
                });
                scope.$watch('options.minSizeHeight', function (newVal, oldVal) {
                    if (newVal != oldVal) updateSize();
                });
                scope.$watch('options.maxSizeWidth', function (newVal, oldVal) {
                    if (newVal != oldVal) updateSize();
                });
                scope.$watch('options.maxSizeHeight', function (newVal, oldVal) {
                    if (newVal != oldVal) updateSize();
                });
            }

            var _init = function () {
                element.Jcrop(options, function () {
                    jcropApi = this;
                    // Use the API to get the real image size
                    var bounds = this.getBounds();
                    imageWidth = bounds[0];
                    imageHeight = bounds[1];

                    if (attributes.selection && angular.isArray(scope.selection)) {
                        if (scope.options && scope.options.animate) {
                            jcropApi.animateTo(scope.selection);
                        } else {
                            jcropApi.setSelect(scope.selection);
                        }
                    }
                    imageLoaded.resolve();
                });
            };

            _init()


        }
    }
});
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

angular.module('SmartAdmin.Forms').directive('smartClockpicker', function () {
	return {
		restrict: 'A',
		compile: function (tElement, tAttributes) {
			tElement.removeAttr('smart-clockpicker data-smart-clockpicker');

			var options = {
				placement: 'top',
				donetext: 'Done'
			}

			tElement.clockpicker(options);
		}
	}
});

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

angular.module('SmartAdmin.Forms').directive('smartColorpicker', function () {
    return {
        restrict: 'A',
        compile: function (tElement, tAttributes) {
            tElement.removeAttr('smart-colorpicker data-smart-colorpicker');


            var aOptions = _.pick(tAttributes, ['']);

            var options = _.extend(aOptions, {});

            tElement.colorpicker(options);
        }
    }
});
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

angular.module('SmartAdmin.Forms').directive('smartDatepicker', function () {
    return {
        restrict: 'A',
        scope: {
            options: '='
        },
        link: function (scope, element, attributes) {

            var onSelectCallbacks = [];
            if (attributes.minRestrict) {
                onSelectCallbacks.push(function (selectedDate) {
                    $(attributes.minRestrict).datepicker('option', 'minDate', selectedDate);
                });
            }
            if (attributes.maxRestrict) {
                onSelectCallbacks.push(function (selectedDate) {
                    $(attributes.maxRestrict).datepicker('option', 'maxDate', selectedDate);
                });
            }

            //Let others know about changes to the data field
            onSelectCallbacks.push(function (selectedDate) {
                //CVB - 07/14/2015 - Update the scope with the selected value
                element.triggerHandler("change");

                //CVB - 07/17/2015 - Update Bootstrap Validator
                var form = element.closest('form');

                if(typeof form.bootstrapValidator == 'function')
                    form.bootstrapValidator('revalidateField', element.attr('name'));
            });

            var options = _.extend({
                prevText: '<i class="fa fa-chevron-left"></i>',
                nextText: '<i class="fa fa-chevron-right"></i>',
                onSelect: function (selectedDate) {
                    angular.forEach(onSelectCallbacks, function (callback) {
                        callback.call(this, selectedDate)
                    })
                }
            }, scope.options || {});


            if (attributes.numberOfMonths) options.numberOfMonths = parseInt(attributes.numberOfMonths);

            if (attributes.dateFormat) options.dateFormat = attributes.dateFormat;

            if (attributes.defaultDate) options.defaultDate = attributes.defaultDate;

            if (attributes.changeMonth) options.changeMonth = attributes.changeMonth == "true";


            element.datepicker(options)
        }
    }
});
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

angular.module('SmartAdmin.Forms').directive('smartDuallistbox', function () {
    return {
        restrict: 'A',
        compile: function (tElement, tAttributes) {
            tElement.removeAttr('smart-duallistbox data-smart-duallistbox');


            var aOptions = _.pick(tAttributes, ['nonSelectedFilter']);

            var options = _.extend(aOptions, {
                nonSelectedListLabel: 'Non-selected',
                selectedListLabel: 'Selected',
                preserveSelectionOnMove: 'moved',
                moveOnSelect: false
            });

            tElement.bootstrapDualListbox(options);
        }
    }
});

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

angular.module('SmartAdmin.Forms').directive('smartIonslider', function (lazyScript) {
    return {
        restrict: 'A',
        compile: function (element, attributes) {
            element.removeAttr('smart-ionslider data-smart-ionslider');

        	lazyScript.register('build/vendor.ui.js').then(function(){
            	element.ionRangeSlider();
        	});
        }
    }
});
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

angular.module('SmartAdmin.Forms').directive('smartKnob', function () {
    return {
        restrict: 'A',
        compile: function (tElement, tAttributes) {
            tElement.removeAttr('smart-knob data-smart-knob');

            tElement.knob();
        }
    }
});
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

angular.module('SmartAdmin.Forms').directive('smartMaskedInput', function(lazyScript){
    return {
        restrict: 'A',
        compile: function(tElement, tAttributes){
            tElement.removeAttr('smart-masked-input data-smart-masked-input');

        	lazyScript.register('build/vendor.ui.js').then(function(){

	            var options = {};
	            if(tAttributes.maskPlaceholder) options.placeholder =  tAttributes.maskPlaceholder;
	            tElement.mask(tAttributes.smartMaskedInput, options);
        	})	            
        }
    }
});
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

angular.module('SmartAdmin.Forms').directive('smartNouislider', function ($parse, lazyScript) {
    return {
        restrict: 'A',
        compile: function (tElement, tAttributes) {
            lazyScript.register('build/vendor.ui.js').then(function(){
                tElement.removeAttr('smart-nouislider data-smart-nouislider');

                tElement.addClass('noUiSlider');

                var options = {
                    range: {
                        min: tAttributes.rangeMin ? parseInt(tAttributes.rangeMin) : 0,
                        max: tAttributes.rangeMax ? parseInt(tAttributes.rangeMax) : 1000
                    },
                    start: $parse(tAttributes.start)()
                };

                if (tAttributes.step) options.step =  parseInt(tAttributes.step);

                if(tAttributes.connect) options.connect = tAttributes.connect == 'true' ? true : tAttributes.connect;

                tElement.noUiSlider(options);

                if(tAttributes.update) tElement.on('slide', function(){
                    $(tAttributes.update).text(JSON.stringify(tElement.val()));
                });                
            })
        }
    }
});
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

'use strict'

angular.module('SmartAdmin.Forms').directive('smartSelect2', function (lazyScript) {
    return {
        restrict: 'A',
        compile: function (element, attributes) {
            element.hide().removeAttr('smart-select2 data-smart-select2');
        	lazyScript.register('build/vendor.ui.js').then(function(){
	            element.show().select2();
        	})
        }
    }
});
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

'use strict'

angular.module('SmartAdmin.Forms').directive('smartSpinner', function () {
    return {
        restrict: 'A',
        compile: function (tElement, tAttributes) {
            tElement.removeAttr('smart-spinner');

            var options = {};
            if(tAttributes.smartSpinner == 'deicimal'){
                options = {
                    step: 0.01,
                    numberFormat: "n"
                };
            }else if(tAttributes.smartSpinner == 'currency'){
                options = {
                    min: 5,
                    max: 2500,
                    step: 25,
                    start: 1000,
                    numberFormat: "C"
                };
            }

            tElement.spinner(options);
        }
    }
});
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

angular.module('SmartAdmin.Forms').directive('smartTagsinput', function () {
    return {
        restrict: 'A',
        compile: function (tElement, tAttributes) {
            tElement.removeAttr('smart-tagsinput data-smart-tagsinput');
            tElement.tagsinput();
        }
    }
});
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

angular.module('SmartAdmin.Forms').directive('smartTimepicker', function () {
    return {
        restrict: 'A',
        compile: function (tElement, tAttributes) {
            tElement.removeAttr('smart-timepicker data-smart-timepicker');
            tElement.timepicker();
        }
    }
});

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

angular.module('SmartAdmin.Forms').directive('smartUislider', function ($parse, lazyScript) {
    return {
        restrict: 'A',
        compile: function (tElement, tAttributes) {

            tElement.removeAttr('smart-uislider data-smart-uislider');

            lazyScript.register('build/vendor.ui.js').then(function(){
			    tElement.bootstrapSlider();

			    $(tElement.data('bootstrapSlider').sliderElem).prepend(tElement);      	
            })

        }
    }
});
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

angular.module('SmartAdmin.Forms').directive('smartXeditable', function($timeout, $log){

	function link (scope, element, attrs, ngModel) {

        var defaults = {
            // display: function(value, srcData) {
            //     ngModel.$setViewValue(value);
            //     // scope.$apply();
            // }
        };

        var inited = false;

        var initXeditable = function() {

            var options = scope.options || {};
    		var initOptions = angular.extend(defaults, options);

            // $log.log(initOptions);
            element.editable('destroy');
            element.editable(initOptions);
        }

        scope.$watch("options", function(newValue) {

            if(!newValue) {
                return false;
            }

            initXeditable();

            // $log.log("Options changed...");

        }, true);

    }

    return {
    	restrict: 'A',
    	require: "ngModel",
        scope: {
            options: "="
        },
    	link: link 

    }
});
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

angular.module('SmartAdmin.Forms').directive('smartDropzone', function () {
    return function (scope, element, attrs) {
        var config, dropzone;

        config = scope[attrs.smartDropzone];

        // create a Dropzone for the element with the given options
        dropzone = new Dropzone(element[0], config.options);

        // bind the given event handlers
        angular.forEach(config.eventHandlers, function (handler, event) {
            dropzone.on(event, handler);
        });
    };
});

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

angular.module('SmartAdmin.Forms').directive('smartValidateForm', function (translate) {
    return {
        restrict: 'A',
        link: function (scope, form, attributes) {
            var validateOptions = {
                rules: {},
                messages: {},
                highlight: function (element) {
                    $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
                },
                unhighlight: function (element) {
                    /*$(element).closest('.form-group').removeClass('has-error').addClass('has-success');*/ //origin
                    $(element).closest('.form-group').removeClass('has-error').removeClass('has-error');  //create by yh
                },
                errorElement: 'span',
                errorClass: 'help-block',
                errorPlacement: function (error, element) {
                    

                    if (element.parent('.input-group').length) {

                        /*error.insertAfter(element.parent());*/ //origin
                    } else {
                       /* error.insertAfter(element);*/ //origin
                    }
                    $(element).closest('.form-group').find('#roleName-error').html(translate.getWord("role.required")); //create by yh
                }
            };
            form.find('[data-smart-validate-input], [smart-validate-input]').each(function () {
                var $input = $(this), fieldName = $input.attr('name');
                validateOptions.rules[fieldName] = {};

                if ($input.data('required') != undefined) {
                    validateOptions.rules[fieldName].required = true;
                }
                if ($input.data('email') != undefined) {
                    validateOptions.rules[fieldName].email = true;
                }

                if ($input.data('maxlength') != undefined) {
                    validateOptions.rules[fieldName].maxlength = $input.data('maxlength');
                }

                if ($input.data('minlength') != undefined) {
                    validateOptions.rules[fieldName].minlength = $input.data('minlength');
                }
                if ($input.data('equalTo') != undefined) {
                    validateOptions.rules[fieldName].equalTo = $input.data('equalTo');
                }


                if($input.data('message')){
                    validateOptions.messages[fieldName] = $input.data('message');
                } else {
                    angular.forEach($input.data(), function(value, key){
                        if(key.search(/message/)== 0){
                            if(!validateOptions.messages[fieldName])
                                validateOptions.messages[fieldName] = {};

                            var messageKey = key.toLowerCase().replace(/^message/,'')
                            validateOptions.messages[fieldName][messageKey] = translate.getWord(value);
                            if(messageKey=="equalto"){
                                validateOptions.messages[fieldName]["equalTo"] = translate.getWord(value);
                            }
                        }
                    });
                }
            });

            form.validate(validateOptions);

        }
    }
});

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

angular.module('SmartAdmin.Forms').directive('smartFueluxWizard', function () {
    return {
        restrict: 'A',
        scope: {
            smartWizardCallback: '&'
        },
        link: function (scope, element, attributes) {

            var wizard = element.wizard();

            var $form = element.find('form');

            wizard.on('actionclicked.fu.wizard', function(e, data){
                if ($form.data('validator')) {
                    if (!$form.valid()) {
                        $form.data('validator').focusInvalid();
                        e.preventDefault();
                    }
                }
            });

            wizard.on('finished.fu.wizard', function (e, data) {
                var formData = {};
                _.each($form.serializeArray(), function(field){
                    formData[field.name] = field.value
                });
                if(typeof scope.smartWizardCallback() === 'function'){
                    scope.smartWizardCallback()(formData)
                }
            });
        }
    }
});
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

angular.module('SmartAdmin.Forms').directive('smartWizard', function () {
    return {
        restrict: 'A',
        scope: {
            'smartWizardCallback': '&'
        },
        link: function (scope, element, attributes) {

            var stepsCount = $('[data-smart-wizard-tab]').length;

            var currentStep = 1;

            var validSteps = [];

            var $form = element.closest('form');

            var $prev = $('[data-smart-wizard-prev]', element);

            var $next = $('[data-smart-wizard-next]', element);

            function setStep(step) {
                currentStep = step;
                $('[data-smart-wizard-pane=' + step + ']', element).addClass('active').siblings('[data-smart-wizard-pane]').removeClass('active');
                $('[data-smart-wizard-tab=' + step + ']', element).addClass('active').siblings('[data-smart-wizard-tab]').removeClass('active');

                $prev.toggleClass('disabled', step == 1)
            }


            element.on('click', '[data-smart-wizard-tab]', function (e) {
                setStep(parseInt($(this).data('smartWizardTab')));
                e.preventDefault();
            });

            $next.on('click', function (e) {
                if ($form.data('validator')) {
                    if (!$form.valid()) {
                        validSteps = _.without(validSteps, currentStep);
                        $form.data('validator').focusInvalid();
                        return false;
                    } else {
                        validSteps = _.without(validSteps, currentStep);
                        validSteps.push(currentStep);
                        element.find('[data-smart-wizard-tab=' + currentStep + ']')
                            .addClass('complete')
                            .find('.step')
                            .html('<i class="fa fa-check"></i>');
                    }
                }
                if (currentStep < stepsCount) {
                    setStep(currentStep + 1);
                } else {
                    if (validSteps.length < stepsCount) {
                        var steps = _.range(1, stepsCount + 1)

                        _(steps).forEach(function (num) {
                            if (validSteps.indexOf(num) == -1) {
                                setStep(num);
                                return false;
                            }
                        })
                    } else {
                        var data = {};
                        _.each($form.serializeArray(), function(field){
                            data[field.name] = field.value
                        });
                        if(typeof  scope.smartWizardCallback() === 'function'){
                            scope.smartWizardCallback()(data)
                        }
                    }
                }

                e.preventDefault();
            });

            $prev.on('click', function (e) {
                if (!$prev.hasClass('disabled') && currentStep > 0) {
                    setStep(currentStep - 1);
                }
                e.preventDefault();
            });


            setStep(currentStep);

        }
    }
});
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

angular.module('SmartAdmin.Layout').directive('demoStates', function ($rootScope) {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'app/_common/layout/directives/demo/demo-states.tpl.html',
        scope: true,
        link: function (scope, element, attributes) {
            element.parent().css({
                position: 'relative'
            });

            element.on('click', '#demo-setting', function () {
                element.toggleClass('activate')
            })
        },
        controller: function ($scope) {
            var $root = $('body');

            $scope.$watch('fixedHeader', function (fixedHeader) {
                localStorage.setItem('sm-fixed-header', fixedHeader);
                $root.toggleClass('fixed-header', fixedHeader);
                if (fixedHeader == false) {
                    $scope.fixedRibbon = false;
                    $scope.fixedNavigation = false;
                }
            });


            $scope.$watch('fixedNavigation', function (fixedNavigation) {
                localStorage.setItem('sm-fixed-navigation', fixedNavigation);
                $root.toggleClass('fixed-navigation', fixedNavigation);
                if (fixedNavigation) {
                    $scope.insideContainer = false;
                    $scope.fixedHeader = true;
                } else {
                    $scope.fixedRibbon = false;
                }
            });


            $scope.$watch('fixedRibbon', function (fixedRibbon) {
                localStorage.setItem('sm-fixed-ribbon', fixedRibbon);
                $root.toggleClass('fixed-ribbon', fixedRibbon);
                if (fixedRibbon) {
                    $scope.fixedHeader = true;
                    $scope.fixedNavigation = true;
                    $scope.insideContainer = false;
                }
            });

            $scope.$watch('fixedPageFooter', function (fixedPageFooter) {
                localStorage.setItem('sm-fixed-page-footer', fixedPageFooter);
                $root.toggleClass('fixed-page-footer', fixedPageFooter);
            });

            $scope.$watch('insideContainer', function (insideContainer) {
                localStorage.setItem('sm-inside-container', insideContainer);
                $root.toggleClass('container', insideContainer);
                if (insideContainer) {
                    $scope.fixedRibbon = false;
                    $scope.fixedNavigation = false;
                }
            });

            $scope.$watch('rtl', function (rtl) {
                localStorage.setItem('sm-rtl', rtl);
                $root.toggleClass('smart-rtl', rtl);
            });

            $scope.$watch('menuOnTop', function (menuOnTop) {
                $rootScope.$broadcast('$smartLayoutMenuOnTop', menuOnTop);
                localStorage.setItem('sm-menu-on-top', menuOnTop);
                $root.toggleClass('menu-on-top', menuOnTop);

                if(menuOnTop)$root.removeClass('minified');
            });

            $scope.$watch('colorblindFriendly', function (colorblindFriendly) {
                localStorage.setItem('sm-colorblind-friendly', colorblindFriendly);
                $root.toggleClass('colorblind-friendly', colorblindFriendly);
            });


            $scope.fixedHeader = true;
            $scope.fixedNavigation = true;
            $scope.fixedRibbon = true;
            $scope.fixedPageFooter = localStorage.getItem('sm-fixed-page-footer') == 'true';
            $scope.insideContainer = localStorage.getItem('sm-inside-container') == 'true';
            $scope.rtl = localStorage.getItem('sm-rtl') == 'true';
            $scope.menuOnTop = localStorage.getItem('sm-menu-on-top') == 'true' || $root.hasClass('menu-on-top');
            $scope.colorblindFriendly = localStorage.getItem('sm-colorblind-friendly') == 'true';


            $scope.skins = appConfig.skins;


            $scope.smartSkin = localStorage.getItem('sm-skin') ? localStorage.getItem('sm-skin') : appConfig.smartSkin;

            $scope.setSkin = function (skin) {
                $scope.smartSkin = skin.name;
                $root.removeClass(_.pluck($scope.skins, 'name').join(' '));
                $root.addClass(skin.name);
                localStorage.setItem('sm-skin', skin.name);
                $("#logo img").attr('src', skin.logo);
            };


            if($scope.smartSkin != "smart-style-0"){
                $scope.setSkin(_.find($scope.skins, {name: $scope.smartSkin}))
            }


            $scope.factoryReset = function () {
                $.SmartMessageBox({
                    title: "<i class='fa fa-refresh' style='color:green'></i> Clear Local Storage",
                    content: "Would you like to RESET all your saved widgets and clear LocalStorage?1",
                    buttons: '[No][Yes]'
                }, function (ButtonPressed) {
                    if (ButtonPressed == "Yes" && localStorage) {
                        localStorage.clear();
                        location.reload()
                    }
                });
            }
        }
    }
});
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

(function ($) {

    $.fn.smartCollapseToggle = function () {

        return this.each(function () {

            var $body = $('body');
            var $this = $(this);

            // only if not  'menu-on-top'
            if ($body.hasClass('menu-on-top')) {


            } else {

                $body.hasClass('mobile-view-activated')

                // toggle open
                $this.toggleClass('open');

                // for minified menu collapse only second level
                if ($body.hasClass('minified')) {
                    if ($this.closest('nav ul ul').length) {
                        $this.find('>a .collapse-sign .fa').toggleClass(' fa-angle-down   fa-angle-right ');
                        $this.find('ul:first').slideToggle(appConfig.menu_speed || 200);
                    }
                } else {
                    // toggle expand item
                    $this.find('>a .collapse-sign .fa').toggleClass(' fa-angle-down   fa-angle-right ');
                    $this.find('ul:first').slideToggle(appConfig.menu_speed || 200);
                }
            }
        });
    };
})(jQuery);

angular.module('SmartAdmin.Layout').directive('smartMenu', function ($state, $rootScope) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var $body = $('body');

            var $collapsible = element.find('li[data-menu-collapse]');

            var bindEvents = function(){
                $collapsible.each(function (idx, li) {
                    var $li = $(li);
                    $li
                        .on('click', '>a', function (e) {

                            // collapse all open siblings
                            $li.siblings('.open').smartCollapseToggle();

                            // toggle element
                            $li.smartCollapseToggle();

                            // add active marker to collapsed element if it has active childs
                            if (!$li.hasClass('open') && $li.find('li.active').length > 0) {
                                $li.addClass('active')
                            }

                            e.preventDefault();
                        })
                        .find('>a').append('<b class="collapse-sign"><span class="fa  fa-angle-right "></span></b>');

                    // initialization toggle
                    if ($li.find('li.active').length) {
                        $li.smartCollapseToggle();
                        $li.find('li.active').parents('li').addClass('active');
                    }
                });
            }
            bindEvents();


            // click on route link
            element.on('click', 'a[data-ui-sref]', function (e) {
                // collapse all siblings to element parents and remove active markers
                $(this)
                    .parents('li').addClass('active')
                    .each(function () {
                        $(this).siblings('li.open').smartCollapseToggle();
                        $(this).siblings('li').removeClass('active')
                    });

                if ($body.hasClass('mobile-view-activated')) {
                    $rootScope.$broadcast('requestToggleMenu');
                }
            });


            scope.$on('$smartLayoutMenuOnTop', function (event, menuOnTop) {
                if (menuOnTop) {
                    $collapsible.filter('.open').smartCollapseToggle();
                }
            });
        }
    }
});
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

(function(){
    "use strict";

    angular.module('SmartAdmin.Layout').directive('smartMenuItems', function ($http, $rootScope, $compile) {
    return {
        restrict: 'A',
        compile: function (element, attrs) {
            

            function createItem(item, parent, level){
                var li = $('<li />' ,{'ui-sref-active': "active"})
                var a = $('<a />');
                var i = $('<i />');

                li.append(a);

                if(item.sref)
                    a.attr('ui-sref', item.sref);
                if(item.href)
                    a.attr('href', item.href);
                if(item.icon){
                    i.attr('class', 'fa fa-lg fa-fw fa-'+item.icon);
                    a.append(i);
                }
                if(item.title){
                    a.attr('title', item.title);
                    if(level == 1){ 
                        a.append(' <span class="menu-item-parent">' + item.title + '</span>');
                    } else {
                        a.append(' ' + item.title);

                    }
                }

                if(item.items){
                    var ul = $('<ul />');
                    li.append(ul);
                    li.attr('data-menu-collapse', '');
                    _.forEach(item.items, function(child) {
                        createItem(child, ul, level+1);
                    })
                } 

                parent.append(li); 
            }


            $http.get(attrs.smartMenuItems).then(function(res){
                var ul = $('<ul />', {
                    'smart-menu': ''
                })
                _.forEach(res.data.items, function(item) {
                    createItem(item, ul, 1);
                })
                
                var $scope = $rootScope.$new();
                var html = $('<div>').append(ul).html(); 
                var linkingFunction = $compile(html);
                
                var _element = linkingFunction($scope);

                element.replaceWith(_element);                
            })
        }
    }
});
})();
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

/**
 * Jarvis Widget Directive
 *
 *    colorbutton="false"
 *    editbutton="false"
      togglebutton="false"
       deletebutton="false"
        fullscreenbutton="false"
        custombutton="false"
        collapsed="true"
          sortable="false"
 *
 *
 */
"use strict";

angular.module('SmartAdmin.Layout').directive('jarvisWidget', function($rootScope){
    /*return {
        restrict: "A",
        compile: function(element, attributes){
            if(element.data('widget-color'))
                element.addClass('jarviswidget-color-' + element.data('widget-color'));


            element.find('.widget-body').prepend('<div class="jarviswidget-editbox"><input class="form-control" type="text"></div>');

            element.addClass('jarviswidget');
            $rootScope.$emit('jarvisWidgetAdded', element )

        }
    }*/
    return {
        restrict: "A",
        compile: function(element, attributes){ 
                element.addClass('jarviswidget-color-white');
           

            element.find('.widget-body').prepend('<div class="jarviswidget-editbox"><input class="form-control" type="text"></div>');

            element.addClass('jarviswidget');
            $rootScope.$emit('jarvisWidgetAdded', element )

        }
    }
});
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
 
 angular.module('SmartAdmin.Layout').directive('widgetGrid', function ($rootScope, $compile, $q, $state, $timeout) {

    var jarvisWidgetsDefaults = {
        grid: 'article',
        widgets: '.jarviswidget',
        localStorage: true,
        deleteSettingsKey: '#deletesettingskey-options',
        settingsKeyLabel: 'Reset settings?',
        deletePositionKey: '#deletepositionkey-options',
        positionKeyLabel: 'Reset position?',
        sortable: true,
        buttonsHidden: false,
        // toggle button
        toggleButton: true,
        toggleClass: 'fa fa-minus | fa fa-plus',
        toggleSpeed: 200,
        onToggle: function () {
        },
        // delete btn
        deleteButton: true,
        deleteMsg: 'Warning: This action cannot be undone!',
        deleteClass: 'fa fa-times',
        deleteSpeed: 200,
        onDelete: function () {
        },
        // edit btn
        editButton: true,
        editPlaceholder: '.jarviswidget-editbox',
        editClass: 'fa fa-cog | fa fa-save',
        editSpeed: 200,
        onEdit: function () {
        },
        // color button
        colorButton: true,
        // full screen
        fullscreenButton: true,
        fullscreenClass: 'fa fa-expand | fa fa-compress',
        fullscreenDiff: 3,
        onFullscreen: function () {
        },
        // custom btn
        customButton: false,
        customClass: 'folder-10 | next-10',
        customStart: function () {
            alert('Hello you, this is a custom button...');
        },
        customEnd: function () {
            alert('bye, till next time...');
        },
        // order
        buttonOrder: '%refresh% %custom% %edit% %toggle% %fullscreen% %delete%',
        opacity: 1.0,
        dragHandle: '> header',
        placeholderClass: 'jarviswidget-placeholder',
        indicator: true,
        indicatorTime: 600,
        ajax: true,
        timestampPlaceholder: '.jarviswidget-timestamp',
        timestampFormat: 'Last update: %m%/%d%/%y% %h%:%i%:%s%',
        refreshButton: true,
        refreshButtonClass: 'fa fa-refresh',
        labelError: 'Sorry but there was a error:',
        labelUpdated: 'Last Update:',
        labelRefresh: 'Refresh',
        labelDelete: 'Delete widget:',
        afterLoad: function () {
        },
        rtl: false, // best not to toggle this!
        onChange: function () {

        },
        onSave: function () {

        },
        ajaxnav: true

    }

    var dispatchedWidgetIds = [];
    var setupWaiting = false;

    var debug = 1;

    var setupWidgets = function (element, widgetIds) {
        if (!setupWaiting) {
            if(_.intersection(widgetIds, dispatchedWidgetIds).length != widgetIds.length){
                dispatchedWidgetIds = _.union(widgetIds, dispatchedWidgetIds);
                element.data('jarvisWidgets') && element.data('jarvisWidgets').destroy();
                element.jarvisWidgets(jarvisWidgetsDefaults);
                initDropdowns(widgetIds);
            }
        } else {
            if (!setupWaiting) {
                setupWaiting = true;
                $timeout(function () {
                    setupWaiting = false;
                    setupWidgets(element, widgetIds)
                }, 200);
            }
        }
    };

    var destroyWidgets = function(element, widgetIds){
        element.data('jarvisWidgets') && element.data('jarvisWidgets').destroy();
        dispatchedWidgetIds = _.xor(dispatchedWidgetIds, widgetIds);
    };

    var initDropdowns = function (widgetIds) {
        angular.forEach(widgetIds, function (wid) {
            $('#' + wid + ' [data-toggle="dropdown"]').each(function () {
                var $parent = $(this).parent();
                if (!$parent.attr('dropdown')) {
                    $(this).removeAttr('href');
                    $parent.attr('dropdown', '');
                    var compiled = $compile($parent)($parent.scope())
                    $parent.replaceWith(compiled);
                }
            })
        });
    };

    var jarvisWidgetAddedOff,
        $viewContentLoadedOff,
        $stateChangeStartOff;

    return {
        restrict: 'A',
        compile: function(element){
            element.removeAttr('widget-grid data-widget-grid');
            var widgetIds = [];
            $viewContentLoadedOff = $rootScope.$on('$viewContentLoaded', function (event, data) {
                $timeout(function () {
                    setupWidgets(element, widgetIds)
                }, 100);
            });

            $stateChangeStartOff = $rootScope.$on('$stateChangeStart',
                function(event, toState, toParams, fromState, fromParams){
                    jarvisWidgetAddedOff();
                    $viewContentLoadedOff();
                    $stateChangeStartOff();
                    destroyWidgets(element, widgetIds)
                });

            jarvisWidgetAddedOff = $rootScope.$on('jarvisWidgetAdded', function (event, widget) {
                if (widgetIds.indexOf(widget.attr('id')) == -1) {
                    widgetIds.push(widget.attr('id'));
                    $timeout(function () {
                        setupWidgets(element, widgetIds)
                    }, 100);
                }
            });
        }
    }
});
