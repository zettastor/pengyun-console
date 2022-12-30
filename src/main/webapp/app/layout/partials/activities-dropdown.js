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
