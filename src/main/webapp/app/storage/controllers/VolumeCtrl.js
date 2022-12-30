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
