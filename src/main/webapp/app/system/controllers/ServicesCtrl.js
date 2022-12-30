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

