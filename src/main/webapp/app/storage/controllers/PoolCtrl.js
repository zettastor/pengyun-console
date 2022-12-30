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
    "poolCtrl",
    function (
      focus,
      $state,
      $stateParams,
      $http,
      $scope,
      DTOptionsBuilder,
      DTColumnBuilder,
      $compile,
      showMessage,
      $interval,
      translate,
      $timeout,
      $rootScope
    ) {
      $(".modal").draggable();

      var domainId = $stateParams.domainId;
      $scope.cDomainName = $stateParams.sel_domainName;
      $scope.$on("$viewContentLoaded", function () {
        $(".page-title span:first").html("(所属域 " + $scope.cDomainName + ")");
      });
      var vm = this;

      var poolId,
        poolname,
        currentStrategy,
        poolDes,
        uminspeed,
        utactic,
        umaxspeed;

      vm.selected = {};
      vm.selectedId = new Array();

      vm.selectAll = false;
      vm.toggleAll = toggleAll;
      vm.toggleOne = toggleOne;

      vm.toggleAllN = toggleAllN;
      vm.toggleOneN = toggleOneN;

      vm.disabled = false;
      vm.dtInstance = {};
      $scope.strategys = ["Capacity", "Performance", "Mixed"];
      vm.d = true;
      var newData = [];
      var tableLength;
      $scope.toShow = false;
      var removeId;
      var currentInstanceId;
      var refreshIds = [];
      var intervalTime;
      var setTime;
      $scope.ratio = false;
      $scope.showSpeed = false;

      var speedInterval;
      $scope.diskShow = false;

      var timeFlag = true;
      var statusLevel = $stateParams.statusLevel;
      var level = $("#tabStatus").val() || "";
      if (statusLevel != "") {
        level = statusLevel;
      }

      $scope.$watch("description", function (newValue, oldValue, scope) {
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

        $scope.PoolFormDes = len > 250;
      });

      $scope.$watch("updatedescription", function (newValue, oldValue, scope) {
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

        $scope.UpdatedFormDes = len > 250;
      });

      var selectStr =
        '<span style="margin-left:10px;float:right !important"><select data-width="100px" class="selectpicker " id="tabStatus" style="background-color: white;"  name="mySelect"  >' +
        '<option value="" >所有状态</option>' +
        '<option value="HIGH" >健康状态</option>' +
        '<option value="OTHER" >错误状态</option>' +
        "</select></span>";
      vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption("ajax", {
          url: BASE_API + "listStoragePoolDT",
          data: {
            domainId: domainId,
            statusLevel: level,
          },
          type: "POST",
          dataSrc: function (data) {
            if (data.resultMessage.message == "ERROR_0019_SessionOut") {
              showMessage.show(
                $scope,
                "warn",
                translate.getWord("session.out")
              );
              $scope.logout();
              return;
            }
            tableLength = data.data.length;
            vm.selected = {};
            vm.selectAll = false;
            return data.data;
          },
        })
        .withDOM(
          "<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
            "t" +
            "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>"
        )

        .withBootstrap()
        .withOption("processing", false)
        .withOption("serverSide", true)
        .withOption("rowId", "poolId")
        .withOption("fnDrawCallback", drawCallback)
        .withOption("fnInitComplete", function (result) {
          $(selectStr).insertBefore($("#poolTab_filter label"));
          $("#tabStatus").unbind();
          $("#tabStatus").bind("change", function () {
            level = $("#tabStatus").val() || "";
            vm.dtInstance.changeData({
              data: {
                domainId: domainId,
                statusLevel: level,
                randomData: Math.random(),
              },
              url: "listStoragePoolDT",
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
        .withLanguage({
          search: "",
          searchPlaceholder: "查询存储池名称",
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
            "</select>&nbsp;" +
            "  ",
          paginate: {
            previous: '<i class="fa fa-angle-left"></i>',
            next: '<i class="fa fa-angle-right"></i>',
            last: '<i class="fa  fa-angle-double-right"></i>',
            first: '<i class="fa  fa-angle-double-left"></i>',
          },
        })
        .withPaginationType("full_numbers")
        .withOption("createdRow", function (row, data, dataIndex) {
          $compile(angular.element(row).contents())($scope);
        })
        .withOption("headerCallback", function (header) {
          if (!vm.headerCompiled) {
            vm.headerCompiled = true;
            $compile(angular.element(header).contents())($scope);
          }
        });

      vm.dtColumns = [
        DTColumnBuilder.newColumn("poolId").withTitle("ID").notVisible(),
        DTColumnBuilder.newColumn("null")
          .withTitle("")
          .renderWith(function (data, type, row) {
            return (
              '<span class="fa fa-plus-square-o row-details" value="' +
              row.poolId +
              '"></span>'
            );
          })
          .withClass("checkbox_col")
          .notSortable()
          .notVisible(),
        DTColumnBuilder.newColumn("null")
          .withTitle(
            '<span class="check_span"><input  class="input_check" ng-model="showPool.selectAll" ng-click="showPool.toggleAll(showPool.selectAll, showPool.selected)" type="checkbox" id="selectallFlag"><label for="selectallFlag"></label></span>'
          )
          .renderWith(function (data, type, row) {
            vm.selected[row.poolId] = false;
            return (
              '<span class="check_span"><input class="input_check"  ng-model="showPool.selected[\'' +
              row.poolId +
              '\'];" ng-click="showPool.toggleOne(showPool.selected)" type="checkbox" id="checkbox_' +
              row.poolId +
              '"><label for="checkbox_' +
              row.poolId +
              '"></label></span>'
            );
          })
          .withClass("checkbox_col")
          .notSortable(),
        DTColumnBuilder.newColumn("domainId").withTitle("ID").notVisible(),
        DTColumnBuilder.newColumn("poolName")
          .withTitle("存储池名称")
          .renderWith(function (data, type, row) {
            return (
              '<a title="查看存储池详情" ng-click="showInfo(\'' +
              row.poolId +
              "','" +
              row.domainId +
              "','" +
              row.domainName +
              "')\">" +
              data +
              "</a>"
            );
          }),
        DTColumnBuilder.newColumn("description")
          .withTitle("描述")
          .notSortable(),
        DTColumnBuilder.newColumn("status")
          .withTitle("状态")
          .renderWith(function (data, type, row) {
            if (data == "Available") {
              return "<span class='status_green'>可用</span>";
            } else {
              return (
                '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar"  style="width: 100%" ><span>删除中</span></div></div>'
              );
            }
          }),
        DTColumnBuilder.newColumn("storagePoolLevel")
          .withTitle("存储池等级")
          .notSortable()
          .renderWith(function (data, type, row) {
            var str = "";
            switch (data) {
              case "HIGH":
                str = "<span class='status_green'>高</span>";
                break;
              case "MIDDLE":
                str = "<span class='status_orange'>中</span>";
                break;
              case "LOW":
                str = "<span class='status_yellow'>低</span>";
                break;
            }
            return str;
          }),
        DTColumnBuilder.newColumn("migrationStrategy")
          .withTitle("QoS策略")
          .notSortable()
          .renderWith(function (data, type, row) {
            if (data == null) {
              return "";
            } else {
              return "<a ng-click='goQos(\"" + data + "\")'>" + data + "<a>";
            }
          }),
        DTColumnBuilder.newColumn("minMigrationSpeed")
          .withClass("singleDiskSpeeed")
          .withTitle("单盘重构速度上限(MB/s)")
          .notSortable()
          .renderWith(function (data, type, row) {
            var str = "";
            if (row.migrationStrategy != "Smart") {
              str = str + data;
            }
            return str;
          })
          .notVisible(),
        DTColumnBuilder.newColumn("null")
          .withTitle("资源池重构速度上限(MB/s)")
          .notSortable()
          .renderWith(function (data, type, row) {
            var count = 0;
            var string = "";
            if (row.migrationStrategy == null) {
              return "";
            } else {
              var maxMigrationSpeed = row.maxMigrationSpeed / 1024;
              if (row.archivesInDatanode) {
                for (var key in row.archivesInDatanode) {
                  $.each(row.archivesInDatanode[key], function (i, tmp) {
                    if (key.getQuery("status") == "OK") {
                      if (tmp.status == "GOOD") {
                        count++;
                      }
                    }
                  });
                }

                string = string + maxMigrationSpeed * count;
              }

              return string;
            }
          })
          .notVisible(),
        DTColumnBuilder.newColumn("migrationSpeed")
          .withTitle("重构进度")
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
              let migrationData = formatMigrationData(
                (row.totalMigrateDataSizeMb * row.migrationRatio) / 100
              );
              let totalMigrationData = formatMigrationData(
                row.totalMigrateDataSizeMb
              );
              let showStr =
                migrationData + "/" + totalMigrationData + " (" + speed + ")";
              string =
                string +
                '<div class="pool_progress progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar"  style="width: 100%" ><span>' +
                showStr +
                "</span></div></div>";
            }
            return string;
          }),

        DTColumnBuilder.newColumn("null")
          .withTitle("操作")
          .renderWith(function (data, type, row) {
            var infoString =
              '<div class="btn-group dropdown-btn"  >' +
              '<button type="button" class="btn btn_lightblue btn-xs my-drop-down" ng-click="showDown(\'' +
              row.poolId +
              '\');$event.stopPropagation();">操作 <span class="caret"></span></button>' +
              '<ul class="down" style="min-width:110px;">' +
              "<li><a  ng-show='apis.StoragePool.updateStoragePool'  ng-click='doFocus(\"" +
              "poolNameModify" +
              '");updateInformation("' +
              row.poolId +
              "\")'>修改</a></li>" +
              "<li><a data-toggle='modal' data-target='#disk_modal' ng-click='getId(\"" +
              row.poolId +
              '","' +
              row.poolName +
              '","' +
              row.strategy +
              '","' +
              row.description +
              '","' +
              row.minMigrationSpeed +
              '","' +
              row.migrationStrategy +
              '","' +
              row.maxMigrationSpeed +
              "\")' >磁盘</a></li>";

            if (row.migrationRatio != "100.0") {
              infoString +=
                "<li><a ng-click='showSpeedDisk(\"" +
                row.poolId +
                "\")'  data-toggle='modal' data-target='#diskspeed_modal'>重构详情</a></li>";
            }

            return infoString + "</ul></div>";
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

      $scope.goQos = function (name) {
        $state.go("app.storage.qos", { QosName: name, flag: "2" });
      };
      $scope.showInfo = function (poolId, domainId, domainName) {
        $state.go("app.storage.domain.pool.poolDetail", {
          poolId: poolId,
          domainId: domainId,
          domainName: domainName,
        });
      };

      function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
          if (selectedItems.hasOwnProperty(id)) {
            selectedItems[id] = selectAll;
            if (selectAll == false) {
              vm.d = true;

              $(".poolTable")
                .find("#" + id)
                .removeClass("active");
            } else {
              vm.d = false;
              $(".poolTable")
                .find("#" + id)
                .addClass("active");
            }
          }
        }
      }
      function toggleOne(selectedItems) {
        var s = 0;
        for (var id in selectedItems) {
          if (selectedItems.hasOwnProperty(id)) {
            if (!selectedItems[id]) {
              vm.selectAll = false;
              $(".poolTable")
                .find("#" + id)
                .removeClass("active");
            } else {
              s++;
              $(".poolTable")
                .find("#" + id)
                .addClass("active");
            }
          }
        }
        if (s > 0) {
          vm.d = false;
          if (s == tableLength) {
            vm.selectAll = true;
          } else if (s == 1) {
            vm.selectAll = false;
          } else {
            vm.selectAll = false;
          }
        } else {
          vm.d = true;
        }
      }

      function drawCallback(result) {
        $(".selectpicker").selectpicker("render");
        $(".selectpicker").selectpicker("refresh");
        vm.selectAll = false;
        vm.disabled = false;

        vm.d = true;
        $scope.stopRefresh();
        var oTable = $(".poolTable").dataTable();
        if ($.fn.dataTable.isDataTable(oTable)) {
          $(".poolTable tbody").off("click", "span.row-details");
        }
        $interval.cancel(intervalTime);
        refreshIds = [];
        if (result.json.data.length > 0) {
          $.each(result.json.data, function (i, value) {
            if (value.status == "Deleting" || value.migrationRatio != "100.0") {
              refreshIds.push(value.poolId);
            }
          });
        }

        $("#poolTab_filter").find("input").addClass("filter_input");
        $(".poolClearItem").remove();
        $(
          '<i class="fa fa-times-circle item-error-style poolClearItem" onclick="clearFilter(\'' +
            "poolTab_filter" +
            "')\"></i>"
        ).insertAfter($("#poolTab_filter").find("input"));
        if ($("#poolTab_filter").find("input").val() == "") {
          $(".poolClearItem").hide();
        } else {
          $(".poolClearItem").show();
        }
        $("#poolTab_filter").find("input").unbind("keyup", showItem);
        $("#poolTab_filter")
          .find("input")
          .bind("keyup", { cName: "poolClearItem" }, showItem);
        $(".poolClearItem").click(function (e) {
          e.stopPropagation();
          e.preventDefault();
          $("#poolTab").DataTable().search("").draw();
        });

        if (refreshIds.length > 0) {
          intervalTime = $interval(getStatus, 5000);
        }
        if (result.json) {
          if (result.json.data.length > 0) {
            $("poolTab_wrapper .dataTables_paginate").show();
          } else {
            $("poolTab_wrapper .dataTables_paginate").hide();
          }
          vm.pools = {};
          angular.forEach(result.json.data, function (data, index, array) {
            vm.pools[data.poolId] = data;
          });
        }
      }

      $scope.$watch("$viewContentLoaded", function (event) {
        if ($stateParams.poolName != "") {
          $(".poolTable").DataTable().search($stateParams.poolName).draw();
        }
        if ($stateParams.flag == "2") {
          $("#create_modal").modal("show");
          focus("poolName");
        }
      });

      $scope.$on("$destroy", function () {
        $interval.cancel(intervalTime);
        $interval.cancel(speedInterval);
      });

      function getStatus() {
        if (timeFlag) {
          timeFlag = false;
          if (refreshIds.length > 0) {
            $http({
              method: "POST",
              async: false,
              url: "listStoragePool",
              data: {
                poolIds: JSON.stringify(refreshIds),
                domainId: domainId,
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
            }).then(
              function successCallback(response) {
                timeFlag = true;
                if (
                  response.data.simpleStoragePoolsList.length == 0 ||
                  refreshIds.length !=
                    response.data.simpleStoragePoolsList.length
                ) {
                  $interval.cancel(intervalTime);
                  refreshIds = [];
                  vm.dtInstance.reloadData(null, false);
                } else {
                  if (response.data.simpleStoragePoolsList) {
                    $.each(
                      response.data.simpleStoragePoolsList,
                      function (i, value) {
                        var migrationStr = "";
                        var operationStr = "";
                        operationStr =
                          '<div class="btn-group dropdown-btn"  >' +
                          '<button type="button" class="btn btn_lightblue btn-xs my-drop-down" ng-click="showDown(\'' +
                          value.poolId +
                          '\');$event.stopPropagation();">操作 <span class="caret"></span></button>' +
                          '<ul class="down" style="min-width:110px;">' +
                          "<li><a  ng-show='apis.StoragePool.updateStoragePool'  ng-click='doFocus(\"" +
                          "poolNameModify" +
                          '");updateInformation("' +
                          value.poolId +
                          "\")'>修改</a></li>" +
                          "<li><a data-toggle='modal' data-target='#disk_modal' ng-click='getId(\"" +
                          value.poolId +
                          '","' +
                          value.poolName +
                          '","' +
                          value.strategy +
                          '","' +
                          value.description +
                          '","' +
                          value.minMigrationSpeed +
                          '","' +
                          value.migrationStrategy +
                          '","' +
                          value.maxMigrationSpeed +
                          "\")' >磁盘</a></li>";
                        if (value.migrationRatio == "100.0") {
                          migrationStr = migrationStr + "无重构";
                          operationStr =
                            "<a data-toggle='modal' data-target='#disk_modal' ng-click='getId(\"" +
                            value.poolId +
                            '","' +
                            value.poolName +
                            '","' +
                            value.strategy +
                            '","' +
                            value.description +
                            '","' +
                            value.minMigrationSpeed +
                            '","' +
                            value.migrationStrategy +
                            '","' +
                            value.maxMigrationSpeed +
                            "\")' >磁盘</a>&nbsp;&nbsp;&nbsp;";
                          $("#" + value.poolId)
                            .children("td")
                            .last()
                            .html($compile(infoString)($scope));
                        } else {
                          var speed = "";
                          if (value.migrationSpeed >= 1024) {
                            speed =
                              speed +
                              (value.migrationSpeed / 1024).toFixed(1) +
                              "M/s";
                          } else {
                            speed = speed + value.migrationSpeed + "K/s";
                          }
                          let migrationData = formatMigrationData(
                            (value.totalMigrateDataSizeMb *
                              value.migrationRatio) /
                              100
                          );
                          let totalMigrationData = formatMigrationData(
                            value.totalMigrateDataSizeMb
                          );
                          let showStr =
                            migrationData +
                            "/" +
                            totalMigrationData +
                            " (" +
                            speed +
                            ")";

                          migrationStr =
                            migrationStr +
                            '<div class="pool_progress progress progress-striped active" >' +
                            '<div class="progress-bar progress-bar-primary" role="progressbar"  style="width: 100%" ><span>' +
                            showStr +
                            "</span></div></div>";

                          operationStr +=
                            "<li><a ng-click='showSpeedDisk(\"" +
                            value.poolId +
                            "\")'  data-toggle='modal' data-target='#diskspeed_modal'>重构详情</a></li>";
                        }
                        operationStr += "</ul></div>";
                        $("#" + value.poolId)
                          .children("td")
                          .last()
                          .html($compile(operationStr)($scope));
                        $("#" + value.poolId)
                          .children("td")
                          .eq(6)
                          .html($compile(migrationStr)($scope));
                      }
                    );
                  }
                }
              },
              function errorCallback(response) {}
            );
          } else {
            $interval.cancel(intervalTime);
          }
        }
      }

      function formatMigrationData(valueSize) {
        let unit = "MB";
        if (valueSize > 1024) {
          valueSize = (valueSize / 1024).toFixed(1);
          unit = "GB";
        }
        if (valueSize > 1024) {
          valueSize = (valueSize / 1024).toFixed(1);
          unit = "TB";
        }
        return valueSize + unit;
      }

      $scope.reloadData = function () {
        vm.dtInstance.reloadData(null, false);
      };

      $scope.stopRefresh = function () {
        vm.startBtn = false;
        vm.stopBtn = true;
      };

      $scope.createReset = function () {
        $scope.poolForm.$setPristine();
        $scope.poolForm.$setUntouched();
        $scope.description = "";
        $("#strategy_create").selectpicker("val", "Capacity");
        document.getElementById("createForm").reset();
      };

      $("#create_modal").on("hidden.bs.modal", function (e) {
        $scope.createReset();
      });

      $scope.updateReset = function () {
        $scope.updateForm.$setPristine();
        $scope.updateForm.$setUntouched();
        $scope.showSpeed = false;
      };

      $scope.resetSpeedDisk = function () {
        var oTable = $(".speedTable").dataTable();
        oTable.api().destroy();
        $("#diskspeed_modal").modal("hide");
        $scope.diskShow = false;
        $interval.cancel(speedInterval);
      };

      function speedDiskRefresh() {
        vm.dtInstanceD.reloadData(null, false);
      }
      $scope.create = function () {
        if ($scope.PoolFormDes) return;
        $http({
          method: "POST",
          async: false,
          url: "createStoragePool",
          data: {
            domainId: domainId,
            poolName: $scope.poolName,
            description: $("#description").val(),
            strategy: $("#strategy_create").selectpicker("val"),
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
        }).then(
          function successCallback(response) {
            if (response.data.resultMessage.message == "success") {
              $("#create_modal").modal("hide");
              vm.dtInstance.reloadData(null, false);
              poolId = response.data.pool.poolId;
              poolname = response.data.pool.poolName;
              currentStrategy = response.data.pool.strategy;
              poolDes = response.data.pool.description;
              uminspeed = response.data.pool.migrationSpeed;
              utactic = response.data.pool.migrationStrategy;
              umaxspeed = response.data.pool.maxMigrationSpeed;
              $("#prompt_modal").modal("show");
            } else {
              if (
                response.data.resultMessage.message == "ERROR_0019_SessionOut"
              ) {
                showMessage.show(
                  $scope,
                  "warn",
                  translate.getWord("session.out")
                );
                $scope.logout();
                return;
              } else {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord(response.data.resultMessage.message)
                );
              }
            }
          },
          function errorCallback(response) {}
        );
        $scope.createReset();
      };

      $scope.updateInformation = function (index) {
        var strategy_u = $(".poolTable")
          .find("#" + index)
          .children("td")
          .eq("3")
          .html();
        switch (strategy_u) {
          case translate.getWord("Capacity"):
            strategy_u = "Capacity";
            break;
          case translate.getWord("Performance"):
            strategy_u = "Performance";
            break;
          case translate.getWord("Mixed"):
            strategy_u = "Mixed";
            break;
        }
        var str = $(".poolTable")
          .find("#" + index)
          .find(".singleDiskSpeeed")
          .html();
        $scope.updateId = index;
        $scope.updateName = $(".poolTable")
          .find("#" + index)
          .children("td")
          .eq("1")
          .text();
        $scope.updatedescription = $(".poolTable")
          .find("#" + index)
          .children("td")
          .eq("2")
          .html();
        $("#strategy_update").selectpicker("val", strategy_u);

        $(".selectpicker").selectpicker("render");
        $(".selectpicker").selectpicker("refresh");

        $("#update_modal").modal("show");
      };

      $scope.update = function () {
        if ($scope.UpdatedFormDes) return;
        $http({
          method: "POST",
          async: false,
          url: "updateStoragePool",
          data: {
            domainId: domainId,
            poolId: $scope.updateId,
            poolName: $scope.updateName,
            strategy: $("#strategy_update").selectpicker("val"),
            description: $scope.updatedescription,
            diskMapString: "[]",
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
        }).then(
          function successCallback(response) {
            if (response.data.resultMessage.message == "success") {
              showMessage.show(
                $scope,
                "success",
                translate.getWord("response.success")
              );
              vm.dtInstance.reloadData(null, false);
              $("#update_modal").modal("hide");
            } else {
              if (
                response.data.resultMessage.message == "ERROR_0019_SessionOut"
              ) {
                showMessage.show(
                  $scope,
                  "warn",
                  translate.getWord("session.out")
                );
                $scope.logout();
                return;
              } else {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord(response.data.resultMessage.message)
                );
              }
            }
            $scope.updateReset();
          },
          function errorCallback(response) {
            showMessage.show(
              $scope,
              "error",
              translate.getWord("response.error")
            );
            vm.dtInstance.reloadData(null, false);
          }
        );
      };

      $scope.deleteNames = function () {
        vm.selectedId = [];
        vm.selectName = new Array();
        vm.selectedId = [];
        angular.forEach(vm.selected, function (data, index, array) {
          if (data == true) {
            vm.selectedId.push(index);
            var a = $(".poolTable")
              .find("#" + index)
              .children("td")
              .eq("1")
              .text();
            vm.selectName.push(a);
          }
        });
        $scope.deletenames = vm.selectName.join(",");
      };

      $scope.deletes = function () {
        angular.forEach(vm.selectedId, function (data, index, array) {
          $http({
            method: "post",
            async: false,
            url: "deleteStoragePool",
            data: {
              domainId: domainId,
              poolId: data,
            },
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            transformRequest: function (obj) {
              var str = [];
              for (var s in obj) {
                str.push(
                  encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
                );
              }
              return str.join("&");
            },
          }).then(
            function successCallback(response) {
              if (response.data.resultMessage.message == "success") {
                showMessage.show(
                  $scope,
                  "success",
                  translate.getWord("response.success")
                );
                vm.dtInstance.reloadData(null, false);
              } else {
                if (
                  response.data.resultMessage.message == "ERROR_0019_SessionOut"
                ) {
                  showMessage.show(
                    $scope,
                    "warn",
                    translate.getWord("session.out")
                  );
                  $scope.logout();
                  return;
                } else {
                  showMessage.show(
                    $scope,
                    "error",
                    translate.getWord(response.data.resultMessage.message)
                  );
                }
              }
            },
            function errorCallback(response) {
              showMessage.show(
                $scope,
                "error",
                translate.getWord("response.error")
              );
              vm.dtInstance.reloadData(null, false);
            }
          );
        });
        vm.selectedId = [];
      };

      function fixTwoDecimal(value) {
        return Math.round(value * 100) / 100;
      }
      String.prototype.getQuery = function (name) {
        var reg = new RegExp("(\\{|(,\\s*))" + name + "=\\S*(,|\\})");
        var r = this.substr(this.indexOf("{")).match(reg);
        var m = r[0].substring(r[0].indexOf("=") + 2);
        m = m.substr(0, m.length - 2);
        if (m != null) return m;
        return null;
      };
      $scope.showSpeedDisk = function (id) {
        var TableLength;
        $scope.diskShow = true;
        vm.dtInstanceD = {};
        vm.dtOptionD = DTOptionsBuilder.newOptions()
          .withDOM(
            "<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
              "t" +
              "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>"
          )
          .withBootstrap()
          .withOption("ajax", {
            url: "listStoragePool",
            data: {
              domainId: domainId,
            },
            dataSrc: function (data) {
              var speedData = [];
              if (data.simpleStoragePoolsList.length > 0) {
                angular.forEach(
                  data.simpleStoragePoolsList,
                  function (data, index, array) {
                    if (data.poolId == id) {
                      for (var key in data.archivesInDatanode) {
                        $.each(data.archivesInDatanode[key], function (i, tmp) {
                          if (tmp.migrationRatio != "100.0") {
                            var logicalSpace = fixTwoDecimal(
                              tmp.logicalSpace / (1024 * 1024 * 1024)
                            );
                            if (tmp.status == "GOOD") {
                              speedData.push({
                                instanceId: key.getQuery("instanceId"),
                                host: key.getQuery("host"),
                                groupId: key.getQuery("groupId"),
                                archiveId: tmp.archiveId,
                                deviceName: tmp.deviceName,
                                logical: logicalSpace,
                                status: tmp.status,
                                migrationRatio: tmp.migrationRatio,
                                migrationSpeed: tmp.migrationSpeed,
                              });
                            }
                          }
                        });
                      }
                    }
                  }
                );
              }
              TableLength = speedData.length;
              return speedData;
            },

            type: "POST",
          })
          .withOption("serverSide", false)
          .withOption("processing", false)
          .withOption("paging", true)
          .withOption("rowId", "archiveId")
          .withOption("order", [1, "desc"])
          .withOption("fnDrawCallback", function (result) {
            $(".selectpicker").selectpicker("refresh");
            $("#showDiskTab_filter").find("input").addClass("filter_input");
            $(".showDiskClearItem").remove();
            $(
              '<i class="fa fa-times-circle item-error-style showDiskClearItem" onclick="clearFilter(\'' +
                "showDiskTab_filter" +
                "')\"></i>"
            ).insertAfter($("#showDiskTab_filter").find("input"));
            if ($("#showDiskTab_filter").find("input").val() == "") {
              $(".showDiskClearItem").hide();
            } else {
              $(".showDiskClearItem").show();
            }
            $("#showDiskTab_filter").find("input").unbind("keyup", showItem);
            $("#showDiskTab_filter")
              .find("input")
              .bind("keyup", { cName: "showDiskClearItem" }, showItem);
            $("#showDiskTab_filter").addClass("table_top_sm");
            $(".showDiskClearItem").click(function (e) {
              e.stopPropagation();
              e.preventDefault();
              $("#showDiskTab").DataTable().search("").draw();
            });
            if ($("#showDiskTab .dataTables_empty").size()) {
              $("#showDiskTab_paginate").hide();
            } else {
              $("#showDiskTab_paginate").show().css("font-size", "8px");
            }
          })
          .withOption("createdRow", function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          })
          .withOption("headerCallback", function (header) {
            $compile(angular.element(header).contents())($scope);
          })
          .withLanguage({
            search: "",
            searchPlaceholder: "过滤",
            aria: {
              sortAscending: ": activate to sort column ascending",
              sortDescending: ": activate to sort column descending",
            },
            emptyTable: "表中数据为空",
            info: "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
            infoEmpty: "显示第 0 至 0 项结果，共 0 项",
            zeroRecords: "表中数据为空",
            lengthMenu:
              "显示" +
              '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
              '<option value="5" >5条</option>' +
              '<option value="10" >10条</option>' +
              '<option value="20" >20条</option>' +
              '<option value="50" >50条</option>' +
              '<option value="100" >100条</option>' +
              "</select>&nbsp;" +
              "  ",
            paginate: {
              previous: '<i class="fa fa-angle-left"></i>',
              next: '<i class="fa fa-angle-right"></i>',
              last: '<i class="fa  fa-angle-double-right"></i>',
              first: '<i class="fa  fa-angle-double-left"></i>',
            },
          })
          .withPaginationType("full_numbers");

        vm.dtColumnD = [
          DTColumnBuilder.newColumn("instanceId")
            .withTitle("实例ID")
            .notVisible(),
          DTColumnBuilder.newColumn("archiveId")
            .withTitle("磁盘ID")
            .notVisible(),
          DTColumnBuilder.newColumn("host").withTitle("主机IP地址"),
          DTColumnBuilder.newColumn("deviceName").withTitle("磁盘名"),
          DTColumnBuilder.newColumn("status")
            .withTitle("状态")
            .renderWith(function (data, type, row) {
              return "<span class='status_green'>" + "正常" + "</span>";
            })
            .notSortable(),
          DTColumnBuilder.newColumn("groupId").withTitle("所在组编号"),
          DTColumnBuilder.newColumn("archiveId")
            .withTitle("磁盘ID")
            .notVisible(),
          DTColumnBuilder.newColumn("logical").withTitle("逻辑空间(GB)"),
          DTColumnBuilder.newColumn("migrationSpeed")
            .withTitle("重构进度")
            .renderWith(function (data, type, row) {
              var string = "";
              var speed = "";

              if (data >= 1024) {
                speed = speed + (data / 1024).toFixed(1) + "M/s";
              } else {
                speed = speed + data + "K/s";
              }

              var str =
                parseInt(row.migrationRatio * 100) / 100 +
                "%" +
                "(" +
                speed +
                ")";
              string =
                string +
                '<div class="progress progress-striped active" >' +
                '<div class="progress-bar progress-bar-primary" role="progressbar"  style="width: 100%" ><span>' +
                str +
                "</span></div></div>&nbsp;&nbsp;&nbsp;&nbsp;";

              return string;
            })
            .notSortable(),
        ];

        speedInterval = $interval(speedDiskRefresh, 3000);
      };

      $scope.toHide = function () {
        $("#disk_modal").modal("hide");
        $scope.toShow = false;
      };

      function usedTable() {
        var useTableLength;
        vm.dtInstanceU = {};
        vm.dtOptionU = DTOptionsBuilder.newOptions()
          .withDOM(
            "<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
              "t" +
              "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>"
          )
          .withBootstrap()
          .withOption("ajax", {
            url: "listStoragePool",
            data: {
              domainId: domainId,
              randomData: Math.random(),
            },
            dataSrc: function (data) {
              if (data.resultMessage.message == "success") {
                var usedData = [];
                if (data.simpleStoragePoolsList.length > 0) {
                  angular.forEach(
                    data.simpleStoragePoolsList,
                    function (data, index, array) {
                      if (data.poolId == poolId) {
                        for (var key in data.archivesInDatanode) {
                          $.each(
                            data.archivesInDatanode[key],
                            function (i, tmp) {
                              var logicalSpace = fixTwoDecimal(
                                tmp.logicalSpace / (1024 * 1024 * 1024)
                              );
                              if (
                                tmp.deviceName == "" ||
                                tmp.deviceName == null
                              ) {
                                usedData.push({
                                  instanceId: key.getQuery("instanceId"),
                                  host: key.getQuery("host"),
                                  groupId: key.getQuery("groupId"),
                                  archiveId: tmp.archiveId,
                                  deviceName: "未知",
                                  logical: "未知",
                                  status: "未知",
                                  storageType: "未知",
                                  rate: "未知",
                                });
                              } else {
                                usedData.push({
                                  instanceId: key.getQuery("instanceId"),
                                  host: key.getQuery("host"),
                                  groupId: key.getQuery("groupId"),
                                  archiveId: tmp.archiveId,
                                  deviceName: tmp.deviceName,
                                  logical: logicalSpace,
                                  status: tmp.status,
                                  storageType: tmp.storageType,
                                  rate: tmp.rate,
                                });
                              }
                            }
                          );
                        }
                      }
                    }
                  );
                }
                useTableLength = usedData.length;
                return usedData;
              } else {
                if (data.resultMessage.message == "ERROR_0019_SessionOut") {
                  showMessage.show(
                    $scope,
                    "warn",
                    translate.getWord("session.out")
                  );
                  $scope.logout();
                  return;
                }
              }
            },

            type: "POST",
          })
          .withOption("serverSide", false)
          .withOption("processing", false)
          .withOption("paging", true)
          .withOption("searching", true)
          .withOption("rowId", "archiveId")
          .withOption("fnDrawCallback", function (result) {
            $(".selectpicker").selectpicker("render");
            if (!$("#poolUsedTab .dataTables_empty").size()) {
              $(".useDiskTable")
                .next()
                .find(".dataTables_paginate")
                .show()
                .css("font-size", "8px");
            } else {
              $(".useDiskTable").next().find(".dataTables_paginate").hide();
            }

            $("#poolUsedTab_filter").find("input").addClass("filter_input");
            $(".poolUsedClearItem").remove();
            $("#poolUsedTab_filter").addClass("table_top_sm");

            $(
              '<i class="fa fa-times-circle item-error-style poolUsedClearItem" onclick="clearFilter(\'' +
                "poolUsedTab_filter" +
                "')\"></i>"
            ).insertAfter($("#poolUsedTab_filter").find("input"));
            if ($("#poolUsedTab_filter").find("input").val() == "") {
              $(".poolUsedClearItem").hide();
            } else {
              $(".poolUsedClearItem").show();
            }
            $("#poolUsedTab_filter").find("input").unbind("keyup", showItem);
            $("#poolUsedTab_filter")
              .find("input")
              .bind("keyup", { cName: "poolUsedClearItem" }, showItem);
            $(".poolUsedClearItem").click(function (e) {
              e.stopPropagation();
              e.preventDefault();
              $("#poolUsedTab").DataTable().search("").draw();
            });
          })
          .withOption("createdRow", function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          })
          .withOption("headerCallback", function (header) {
            $compile(angular.element(header).contents())($scope);
          })
          .withLanguage({
            search: "",
            searchPlaceholder: "过滤",
            aria: {
              sortAscending: ": activate to sort column ascending",
              sortDescending: ": activate to sort column descending",
            },
            emptyTable: "表中数据为空",
            info: "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
            infoEmpty: "显示第 0 至 0 项结果，共 0 项",
            zeroRecords: "表中数据为空",
            infoFiltered: "(由 _MAX_ 项结果过滤)",
            lengthMenu:
              "显示" +
              '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
              '<option value="5" >5条</option>' +
              '<option value="10" >10条</option>' +
              '<option value="20" >20条</option>' +
              '<option value="50" >50条</option>' +
              '<option value="100" >100条</option>' +
              "</select>&nbsp;" +
              "  ",
            paginate: {
              previous: '<i class="fa fa-angle-left"></i>',
              next: '<i class="fa fa-angle-right"></i>',
              last: '<i class="fa  fa-angle-double-right"></i>',
              first: '<i class="fa  fa-angle-double-left"></i>',
            },
          })
          .withPaginationType("full_numbers");

        vm.dtColumnU = [
          DTColumnBuilder.newColumn("instanceId")
            .withTitle("实例ID")
            .notVisible(),
          DTColumnBuilder.newColumn("host").withTitle("主机IP地址"),
          DTColumnBuilder.newColumn("deviceName").withTitle("磁盘名"),
          DTColumnBuilder.newColumn("status")
            .withTitle("状态")
            .renderWith(function (data, type, row) {
              var str = "";
              if (data == "GOOD") {
                str = str + '<td><span class="status_green" >良好</span></td>';
              } else if (data == "SEPARATED") {
                str = str + '<td><span class="status_red" >被隔离</span></td>';
              } else if (data == "BROKEN") {
                str = str + '<td><span class="status_red" >损坏</span></td>';
              } else if (data == "OFFLINED") {
                str = str + '<td><span class="status_orange" >脱机</span></td>';
              } else if (data == "CONFIG_MISMATCH") {
                str =
                  str +
                  '<td><span class="status_orange" >配置不匹配</span></td>';
              } else if (data == "DEGRADED") {
                str =
                  str + '<td><span class="status_red" >轻微损坏</span></td>';
              } else if (data == "EJECTED") {
                str = str + '<td><span class="status_red" >拔出</span></td>';
              } else if (data == "INPROPERLY_EJECTED") {
                str =
                  str + '<td><span class="status_red" >拔出不当</span></td>';
              } else if (data == "OFFLINING") {
                str =
                  str +
                  "<td>" +
                  '<div class="progress progress-striped active" >' +
                  '<div class="progress-bar progress-bar-primary" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 100%" >' +
                  '<span  style="color: #fff;">卸载中</span></div></div></td>';
              } else {
                str = str + '<td><span class="status_orange" >未知</span></td>';
              }

              return str;
            }),
          DTColumnBuilder.newColumn("groupId").withTitle("所在组编号"),
          DTColumnBuilder.newColumn("archiveId")
            .withTitle("磁盘ID")
            .notVisible(),
          DTColumnBuilder.newColumn("storageType").withTitle("存储类型"),
          DTColumnBuilder.newColumn("rate").withTitle("转速"),
          DTColumnBuilder.newColumn("logical").withTitle("逻辑空间(GB)"),

          DTColumnBuilder.newColumn("null")
            .withTitle("管理")
            .renderWith(function (data, type, row) {
              return (
                "<a  data-toggle='modal' data-target='#remove_modal'  ng-show='apis.StoragePool.removeArchiveFromStoragePool' ng-click='getArchiveId(\"" +
                row.archiveId +
                '","' +
                row.instanceId +
                "\")'>减容</a>"
              );
            })
            .notSortable(),
        ];
      }
      $scope.prompt = function () {
        $scope.getId(
          poolId,
          poolname,
          currentStrategy,
          poolDes,
          uminspeed,
          utactic,
          umaxspeed
        );
      };
      $scope.getId = function (
        poolid,
        name,
        strategy,
        description,
        minspeed,
        tactic,
        maxspeed
      ) {
        $("#prompt_modal").modal("hide");
        $scope.toShow = true;
        $timeout(function () {
          $(".modal").draggable();
        }, 100);
        poolId = poolid;
        poolname = name;
        currentStrategy = strategy;
        poolDes = description;
        uminspeed = minspeed;
        utactic = tactic;
        umaxspeed = maxspeed;
        $scope.showPoolName = name;

        usedTable();
        vm.selectedN = {};
        vm.addIdArr = {};
        vm.selectNameN = new Array();
        vm.selectedIdN = new Array();
        vm.selectAllN = false;

        vm.addDisk = true;

        vm.dtInstanceN = {};
        vm.dtOptionN = DTOptionsBuilder.newOptions()
          .withDOM(
            "<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
              "t" +
              "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>"
          )
          .withBootstrap()
          .withOption("ajax", {
            url: "listUnusedArchives",
            data: {
              domainId: domainId,
              storagePoolId: poolid,
              randomData: Math.random(),
            },
            dataSrc: function (data) {
              var unData = [];
              vm.addIdArr = {};
              for (var key in data.unusedDiskMap) {
                $.each(data.unusedDiskMap[key], function (i, value) {
                  var logicalSpace = fixTwoDecimal(
                    value.logicalSpace / (1024 * 1024 * 1024)
                  );
                  if (value.status == "GOOD" || value.status == "SEPARATED") {
                    unData.push({
                      instanceId: key.getQuery("instanceId"),
                      host: key.getQuery("host"),
                      groupId: key.getQuery("groupId"),
                      archiveId: value.archiveId,
                      deviceName: value.deviceName,
                      logical: logicalSpace,
                      status: value.status,
                      storageType: value.storageType,
                      rate: value.rate,
                    });
                  }
                  vm.addIdArr[value.archiveId] = key.getQuery("instanceId");
                });
              }
              vm.selectedN = {};
              vm.selectAllN = false;
              return unData;
            },

            type: "POST",
          })

          .withOption("serverSide", false)
          .withOption("processing", false)
          .withOption("paging", true)
          .withOption("searching", true)
          .withOption("rowId", "archiveId")
          .withOption("createdRow", function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          })
          .withOption("headerCallback", function (header) {
            $compile(angular.element(header).contents())($scope);
          })

          .withOption("fnDrawCallback", function (result) {
            $(".selectpicker").selectpicker("render");
            vm.selectAllN = false;
            vm.addDisk = true;
            $("#poolUnuseTab_filter").find("input").addClass("filter_input");
            $(".poolUnuseClearItem").remove();
            $("#poolUnuseTab_filter").addClass("table_top_sm");

            $(
              '<i class="fa fa-times-circle item-error-style poolUnuseClearItem" onclick="clearFilter(\'' +
                "poolUnuseTab_filter" +
                "')\"></i>"
            ).insertAfter($("#poolUnuseTab_filter").find("input"));
            if ($("#poolUnuseTab_filter").find("input").val() == "") {
              $(".poolUnuseClearItem").hide();
            } else {
              $(".poolUnuseClearItem").show();
            }
            $("#poolUnuseTab_filter").find("input").unbind("keyup", showItem);
            $("#poolUnuseTab_filter")
              .find("input")
              .bind("keyup", { cName: "poolUnuseClearItem" }, showItem);
            $(".poolUnuseClearItem").click(function (e) {
              e.stopPropagation();
              e.preventDefault();
              $("#poolUnuseTab").DataTable().search("").draw();
            });
            if ($("#poolUnuseTab .dataTables_empty").size()) {
              $("#poolUnuseTab_wrapper").find(".dataTables_paginate").hide();
            } else {
              $("#poolUnuseTab_wrapper")
                .find(".dataTables_paginate")
                .show()
                .css("font-size", "8px");
            }
            for (var id in vm.selectedN) {
              if (vm.selectedN[id]) {
                vm.selectedN[id] = false;
              }
            }
          })

          .withLanguage({
            search: "",
            searchPlaceholder: "过滤",
            aria: {
              sortAscending: ": activate to sort column ascending",
              sortDescending: ": activate to sort column descending",
            },
            emptyTable: "表中数据为空",
            info: "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
            infoEmpty: "显示第 0 至 0 项结果，共 0 项",
            zeroRecords: "表中数据为空",
            infoFiltered: "(由 _MAX_ 项结果过滤)",
            lengthMenu:
              "显示" +
              '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;"  name="timeSelect"  >' +
              '<option value="5" >5条</option>' +
              '<option value="10" >10条</option>' +
              '<option value="20" >20条</option>' +
              '<option value="50" >50条</option>' +
              '<option value="100" >100条</option>' +
              "</select>&nbsp;" +
              "  ",
            paginate: {
              previous: '<i class="fa fa-angle-left"></i>',
              next: '<i class="fa fa-angle-right"></i>',
              last: '<i class="fa  fa-angle-double-right"></i>',
              first: '<i class="fa  fa-angle-double-left"></i>',
            },
          })
          .withPaginationType("full_numbers");

        vm.dtColumnN = [
          DTColumnBuilder.newColumn("archiveId")
            .withTitle("磁盘ID")
            .notVisible(),
          DTColumnBuilder.newColumn("null")
            .withTitle(
              '<span class="check_span"><input class="input_check" ng-model="showPool.selectAllN" ng-click="showPool.toggleAllN(showPool.selectAllN, showPool.selectedN)"  type="checkbox" id="selectallFlag1"><label for="selectallFlag1"></label></span>'
            )
            .renderWith(function (data, type, row) {
              if (row.status == "SEPARATED") {
                return "";
              } else {
                vm.selectedN[row.archiveId] = false;
                return (
                  '<span class="check_span"><input datanodeid="' +
                  row.instanceId +
                  '" class="input_check" ng-model="showPool.selectedN[\'' +
                  row.archiveId +
                  '\'];" ng-click="showPool.toggleOneN(showPool.selectedN)" type="checkbox" id="checkbox_' +
                  row.archiveId +
                  '"><label for="checkbox_' +
                  row.archiveId +
                  '"></label></span>'
                );
              }
            })
            .withClass("checkbox_col")
            .notSortable(),
          DTColumnBuilder.newColumn("instanceId")
            .withTitle("实例ID")
            .notVisible(),
          DTColumnBuilder.newColumn("host").withTitle("主机IP地址"),
          DTColumnBuilder.newColumn("deviceName").withTitle("磁盘名"),
          DTColumnBuilder.newColumn("status")
            .withTitle("状态")
            .renderWith(function (data, type, row) {
              var resultString = "";
              switch (data) {
                case "GOOD":
                  resultString = "<span class='status_green'>良好</span>";
                  break;
                case "SEPARATED":
                  resultString = "<span class='status_red'>被隔离</span>";
                  break;
              }
              return resultString;
            })
            .notSortable(),
          DTColumnBuilder.newColumn("groupId").withTitle("所在组编号"),
          DTColumnBuilder.newColumn("archiveId")
            .withTitle("磁盘ID")
            .notVisible(),
          DTColumnBuilder.newColumn("storageType").withTitle("存储类型"),
          DTColumnBuilder.newColumn("rate").withTitle("转速"),
          DTColumnBuilder.newColumn("logical").withTitle("逻辑空间(GB)"),
        ];
      };

      function toggleAllN(selectAll, selectedItems) {
        for (var id in selectedItems) {
          if (selectedItems.hasOwnProperty(id)) {
            var currentDatanodeId = $(".newDiskTable")
              .find("#" + id)
              .find(".input_check")
              .attr("datanodeid");
            if (currentDatanodeId) {
              selectedItems[id] = selectAll;
            }
            if (selectAll == false) {
              vm.addDisk = true;
            } else {
              vm.addDisk = false;
            }
          }
        }
      }
      function toggleOneN(selectedItems) {
        var s = 0;
        var t = 0;
        for (var id in selectedItems) {
          if (selectedItems.hasOwnProperty(id)) {
            var currentDatanodeId = $(".newDiskTable")
              .find("#" + id)
              .find(".input_check")
              .attr("datanodeid");
            if (currentDatanodeId) {
              t++;
            }
            if (!selectedItems[id]) {
              vm.selectAllN = false;
            } else {
              s++;
            }
          }
        }

        if (s > 0) {
          vm.addDisk = false;
          if (s == t) {
            vm.selectAllN = true;
          } else {
            vm.selectAllN = false;
          }
        } else {
          vm.addDisk = true;
        }
      }

      $scope.modelRefresh = function () {
        vm.dtInstance.reloadData(null, false);
        vm.dtInstanceN.reloadData(null, true);
        vm.dtInstanceU.reloadData(null, true);
      };
      $scope.addDisk = function () {
        vm.selectedIdN = [];
        angular.forEach(vm.selectedN, function (data, index, array) {
          if (data == true) {
            var currentDatanodeId = $(".newDiskTable")
              .find("#" + index)
              .find(".input_check")
              .attr("datanodeid");
            if (currentDatanodeId) {
              vm.selectedIdN.push({
                datanodeId: currentDatanodeId,
                archiveId: index,
              });
            }
          }
        });

        $http({
          method: "post",
          async: false,
          url: "updateStoragePool",
          data: {
            domainId: domainId,
            poolId: poolId,
            poolName: poolname,
            strategy: currentStrategy,
            description: poolDes,
            diskMapString: JSON.stringify(vm.selectedIdN),
            migrationStrategy: utactic,
            minMigrationSpeed: uminspeed,
            maxMigrationSpeed: umaxspeed,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(
                encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
              );
            }
            return str.join("&");
          },
        }).then(
          function successCallback(response) {
            if (response.data.resultMessage.message == "success") {
              showMessage.show(
                $scope,
                "success",
                translate.getWord("response.success")
              );
              newData = [];
              $timeout(function () {
                $scope.modelRefresh();
              }, 1000);

              vm.addDisk = true;
            } else {
              if (
                response.data.resultMessage.message == "ERROR_0019_SessionOut"
              ) {
                showMessage.show(
                  $scope,
                  "warn",
                  translate.getWord("session.out")
                );
                $scope.logout();
                return;
              } else {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord(response.data.resultMessage.message)
                );
              }
            }
          },
          function errorCallback(response) {}
        );
      };

      $scope.getArchiveId = function (id, instanceid) {
        (removeId = id), (currentInstanceId = instanceid);
      };

      $scope.remove = function () {
        $http({
          method: "post",
          async: false,
          url: "removeArchivefromStoragePool",
          data: {
            domainId: domainId,
            poolId: poolId,
            datanodeId: currentInstanceId,
            archiveId: removeId,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          transformRequest: function (obj) {
            var str = [];
            for (var s in obj) {
              str.push(
                encodeURIComponent(s) + "=" + encodeURIComponent(obj[s])
              );
            }
            return str.join("&");
          },
        }).then(
          function successCallback(response) {
            if (response.data.resultMessage.message == "success") {
              showMessage.show(
                $scope,
                "success",
                translate.getWord("response.success")
              );
              newData = [];

              $timeout(function () {
                $scope.modelRefresh();
              }, 1000);
            } else {
              if (
                response.data.resultMessage.message == "ERROR_0019_SessionOut"
              ) {
                showMessage.show(
                  $scope,
                  "warn",
                  translate.getWord("session.out")
                );
                $scope.logout();
                return;
              } else {
                showMessage.show(
                  $scope,
                  "error",
                  translate.getWord(response.data.resultMessage.message)
                );
              }
            }
          },
          function errorCallback(response) {
            showMessage.show(
              $scope,
              "error",
              translate.getWord("response.error")
            );
            vm.dtInstance.reloadData(null, false);
          }
        );
      };

      function callback(json) {
        newData = [];
        angular.forEach(json.data, function (datas, index, array) {
          if (json.data[index].poolId == poolId) {
            for (var key in datas.archivesInDatanode) {
              $.each(datas.archivesInDatanode[key], function (i, tmp) {
                var logicalSpace = fixTwoDecimal(
                  tmp.logicalSpace / (1024 * 1024)
                );
                var logicalSpaceMeasurment = "";
                if (logicalSpace >= 1024) {
                  logicalSpace = fixTwoDecimal(logicalSpace / 1024);
                  logicalSpaceMeasurment = "(GB)";
                } else {
                  logicalSpaceMeasurment = "(MB)";
                }

                if (tmp.status == "GOOD" || tmp.status == "SEPARATED") {
                  newData.push({
                    instanceId: key.getQuery("instanceId"),
                    host: key.getQuery("host"),
                    groupId: key.getQuery("groupId"),
                    archiveId: tmp.archiveId,
                    deviceName: tmp.deviceName,
                    logical: logicalSpace + logicalSpaceMeasurment,
                    status: "<span class='status_green'>正常</span>",
                  });
                }
              });
            }
            usedTable();
          }
        });
      }
      $scope.doFocus = function (id) {
        focus(id);
      };
    }
  );
