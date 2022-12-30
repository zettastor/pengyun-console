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

