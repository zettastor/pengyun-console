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
