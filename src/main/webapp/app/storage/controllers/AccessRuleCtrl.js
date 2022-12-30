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