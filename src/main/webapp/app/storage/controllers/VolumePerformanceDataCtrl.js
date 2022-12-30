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
