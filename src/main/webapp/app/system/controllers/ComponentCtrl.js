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
      searchPlaceholder: "????????????",
      aria: {
        sortAscending: ": activate to sort column ascending",
        sortDescending: ": activate to sort column descending",
      },
      emptyTable: "??????????????????",
      info: "????????? _START_ ??? _END_ ??????????????? _TOTAL_ ???",
      infoEmpty: "????????? 0 ??? 0 ??????????????? 0 ???",
      infoFiltered: "(??? _MAX_ ???????????????)",
      zeroRecords: "??????????????????",
      lengthMenu:
        "??????" +
        '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
        '<option value="5" >5???</option>' +
        '<option value="10" >10???</option>' +
        '<option value="20" >20???</option>' +
        '<option value="50" >50???</option>' +
        '<option value="100" >100???</option>' +
        "</select>",
      paginate: {
        previous: '<i class="fa fa-angle-left"></i>',
        next: '<i class="fa fa-angle-right"></i>',
        last: '<i class="fa  fa-angle-double-right"></i>',
        first: '<i class="fa  fa-angle-double-left"></i>',
      },
    });

    vm.dtColumns = [
      DTColumnBuilder.newColumn('hostname').withTitle('??????ip'),
      DTColumnBuilder.newColumn('status').withTitle('????????????')
        .renderWith(function (data,tpye,row) {
          switch(data){
            case 'OK':
              return '<span class="status_green">' + "??????" + '</span>'
            case 'ERROR':
              return '<span class="status_red">' + "????????????" + '</span>'
            default:
              return '<span class="status_red">' + "????????????" + '</span>'
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
