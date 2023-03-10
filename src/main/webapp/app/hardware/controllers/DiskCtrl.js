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
        "emptyTable": "??????????????????",
        "info": "????????? _START_ ??? _END_ ??????????????? _TOTAL_ ???",
        "infoEmpty": "????????? 0 ??? 0 ??????????????? 0 ???",
        "order": [[2, "asc"]],
        "infoFiltered": "(??? _MAX_ ???????????????)",
        "zeroRecords": "??????????????????",
        "lengthMenu": '??????' + '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
          '<option value="5" >5???</option>' +
          '<option value="10" >10???</option>' +
          '<option value="20" >20???</option>' +
          '<option value="50" >50???</option>' +
          '<option value="100" >100???</option>' +
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
      DTColumnBuilder.newColumn('deviceName').withTitle("????????????"),
      DTColumnBuilder.newColumn('archiveType').withTitle("????????????")
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
      DTColumnBuilder.newColumn('storageType').withTitle("????????????"),
      DTColumnBuilder.newColumn('dataNodeEndPoint').withTitle('??????IP')
        .renderWith(function (data, type, row) {
          return $.trim(data.split(":")[0])
        }),
      DTColumnBuilder.newColumn('status').withTitle("??????")
        .renderWith(function (data, type, row) {
          var str = "";
          if (data == "GOOD") {
            str = str + '<td><span class="status_green" >??????</span></td>'
          } else if (data == "BROKEN") {
            str = str + '<td><span class="status_red" >??????</span></td>'
          } else if (data == "SEPARATED") {
            str = str + '<td><span class="status_red" >?????????</span></td>'
          } else if (data == "OFFLINED") {
            str = str + '<td><span class="status_orange" >??????</span></td>'
          } else if (data == "CONFIG_MISMATCH") {
            str = str + '<td><span class="status_orange" >???????????????</span></td>'
          } else if (data == "DEGRADED") {
            str = str + '<td><span class="status_red" >????????????</span></td>'
          } else if (data == "EJECTED") {
            str = str + '<td><span class="status_red" >??????</span></td>'
          } else if (data == "INPROPERLY_EJECTED") {
            str = str + '<td><span class="status_red" >????????????</span></td>'
          } else if (data == "OFFLINING") {
            str = str + '<td>'
              + '<div class="progress progress-striped active" >'
              + '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" >'
              + '<span  style="color: #fff;">?????????</span></div></div></td>'
          } else {
            str = str + '<td>'
              + '<div class="progress progress-striped active" >'
              + '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" >'
              + '<span  style="color: #fff;">'
              + data + '</span></div></div></td>'
          }
          return str;
        }),
      DTColumnBuilder.newColumn('domainName').withTitle("?????????")
        .renderWith(function (data, type, row) {
          if (data == null) {
            return "";
          } else {
            return "<a title='???????????????' ng-click='jumpToDomain(\"" + row.domainId + "\")'>" + data + "</a>";
          }
        }),
      DTColumnBuilder.newColumn('poolName').withTitle("???????????????")
        .renderWith(function (data, type, row) {
          if (data == null) {
            return "";
          } else {
            return "<a title='?????????????????????' ng-click='jumpToPool(\"" + row.storagePool + "\",\"" + row.domainId + "\",\"" + row.domainName + "\")'>" + data + "</a>";
          }
        }),
      DTColumnBuilder.newColumn('slotNumber').withTitle("??????")
        .renderWith(function (data, type, row) {
          if (data == null || data == "unknown") {
            return "-";
          } else {
            return data;
          }
        }),
      DTColumnBuilder.newColumn('logicalSpace').withTitle("????????????(GB)")
        .renderWith(function (data, type, row) {
          var space = fixTwoDecimal(data / (1024 * 1024 * 1024));
          return space;
        }),
      DTColumnBuilder.newColumn('useSpace').withTitle("???????????????(GB)")
        .renderWith(function (data, type, row) {
          if (row.archiveType.indexOf("PAGE_CACHE") != -1) {
            return "";
          } else {
            var freeSpace = fixTwoDecimal((row.logicalSpace - row.logicalFreeSpace) / (1024 * 1024 * 1024));
            return freeSpace;
          }
        }),
      DTColumnBuilder.newColumn('dataSizeMb').withTitle("????????????(GB)")
        .renderWith(function (data, type, row) {
          let used = fixTwoDecimal(data / 1024);
          return used;
        }),
      DTColumnBuilder.newColumn('null').withTitle("??????")
        .renderWith(function (data, type, row) {
          var str = "";
          if (row.status == "CONFIG_MISMATCH") {
            str = str + "<a ng-show='apis.Hardware.fixConfigMismatchDisk' data-toggle='modal' data-target='#reuseConfigModal' ng-click='getInformation(\"" + row.archiveId + "\",\"" + row.dataNodeEndPoint + "\",\"" + row.datanodeId + "\",\"" + row.archiveType + "\",\"" + row.deviceName + "\")'>????????????</a>";
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
    + '<option value="" selected>????????????</option>'
    + '<option value="GOOD">??????</option>'
    + '<option value="BAD">??????</option>'
    + '</select>'
    + '</div>'
    + '<div style="float:left;margin-bottom:10px;margin-left:8px">'
    + '<select  class="selectpicker" data-width="125px" id="searchType" >'
    + '<option value="" selected>??????????????????</option>'
    + '<option value="SATA">SATA???</option>'
    + '<option value="SAS">SAS???</option>'
    + '<option value="SSD">SSD???</option>'
    + '<option value="PCIE">NVME???</option>'
    + '</select>'
    + '</div>'
    + '<div style="float:left;margin-right: 10px;">'
    + '&nbsp;&nbsp;'
    + '<button class="btn  btn_lightblue" ng-click="search()" style="height: 33px">??????</button>'
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