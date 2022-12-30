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
