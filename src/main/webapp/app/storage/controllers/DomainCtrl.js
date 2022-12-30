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
    "DomainCtrl",
    function (
      focus,
      $state,
      $http,
      $interval,
      $rootScope,
      $scope,
      DTOptionsBuilder,
      DTColumnBuilder,
      $compile,
      showMessage,
      translate,
      $timeout,
      $stateParams
    ) {
      $(".modal").draggable();
      var vm = this;
      var removeId;
      var domainid;
      var domainname;
      var domainDes;
      vm.selected = {};
      vm.selectName = new Array();
      vm.selectedId = new Array();
      vm.selectAll = false;
      vm.toggleAll = toggleAll;
      vm.toggleOne = toggleOne;
      vm.disabled = false;
      vm.dtInstance = {};
      vm.d = true;
      var intervalTime;
      var refreshIds = [];
      var tableLength;

      var timeFlag = true;
      var right = $(".detail_right").outerHeight();
      var left = $(".detail_content").outerHeight();
      if (right > left) {
        $(".detail_content").css("min-height", right + "px");
      } else {
        $(".detail_right").css("min-height", left + "px");
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

        $scope.CreateFormDes = len > 250;
      });

      $scope.$watch("udescription", function (newValue, oldValue, scope) {
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

        $scope.UpdateFormDes = len > 250;
      });

      vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption("ajax", {
          url: BASE_API + "listDomainsDT",
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
        .withOption("rowId", "domainId")
        .withOption("fnDrawCallback", drawCallback)
        .withLanguage({
          search: "",
          searchPlaceholder: "查询域名称",
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
            '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;" name="timeSelect" >' +
            '<option value="5" >5条</option>' +
            '<option value="10" >10条</option>' +
            '<option value="20" >20条</option>' +
            '<option value="50" >50条</option>' +
            '<option value="100" >100条</option>' +
            "</select>&nbsp;" +
            " ",
          paginate: {
            previous: '<i class="fa fa-angle-left"></i>',
            next: '<i class="fa fa-angle-right"></i>',
            last: '<i class="fa fa-angle-double-right"></i>',
            first: '<i class="fa fa-angle-double-left"></i>',
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
        DTColumnBuilder.newColumn("domainId").withTitle("ID").notVisible(),
        DTColumnBuilder.newColumn("null")
          .withTitle(
            '<span class="check_span"><input id="DomainSelectAll" class="input_check" ng-model="showDomain.selectAll" ng-click="showDomain.toggleAll(showDomain.selectAll, showDomain.selected)" type="checkbox"><label for="DomainSelectAll"></label></span>'
          )
          .renderWith(function (data, type, row) {
            vm.selected[row.domainId] = false;
            return (
              '<span class="check_span"><input id="checkbox_' +
              row.domainId +
              '" class="input_check" ng-model="showDomain.selected[\'' +
              row.domainId +
              '\'];" ng-click="showDomain.toggleOne(showDomain.selected)" type="checkbox"><label for="checkbox_' +
              row.domainId +
              '"></label></span>'
            );
          })
          .withClass("checkbox_col")
          .notSortable(),

        DTColumnBuilder.newColumn("domainName")
          .withTitle("域名称")
          .renderWith(function (data, type, row) {
            return (
              '<a title="查看域详情" ng-click="showInfo(\'' +
              row.domainId +
              "')\">" +
              data +
              "</a>"
            );
          }),
        DTColumnBuilder.newColumn("domainDescription")
          .withTitle("描述")
          .notSortable(),
        DTColumnBuilder.newColumn("status")
          .withTitle("状态")
          .renderWith(function (data, type, row) {
            switch (data) {
              case "Available":
                return "<span class='status_green'>可用</span>";
              case "Deleting":
                return (
                  '<div class="progress progress-striped active" >' +
                  '<div class="progress-bar progress-bar-primary" role="progressbar" style="width: 100%" ><span>删除中</span></div></div>'
                );
              default:
                return data;
            }
          }),
        DTColumnBuilder.newColumn("logicalSpace")
          .withTitle("总容量(GB)")
          .renderWith(function (data, type, row) {
            var domainSpace = fixTwoDecimal(data / (1024 * 1024 * 1024));
            return domainSpace;
          }),
        DTColumnBuilder.newColumn("freeSpace")
          .withTitle("剩余容量(GB)")
          .renderWith(function (data, type, row) {
            var domainfreeSpace = fixTwoDecimal(data / (1024 * 1024 * 1024));
            return domainfreeSpace;
          }),
        DTColumnBuilder.newColumn("useSpace")
          .withTitle("已分配容量(GB)")
          .renderWith(function (data, type, row) {
            var domainuseSpace = fixTwoDecimal(data / (1024 * 1024 * 1024));
            return domainuseSpace;
          }),

        DTColumnBuilder.newColumn("null")
          .withTitle("操作")
          .renderWith(function (data, type, row) {
            var infoString =
              '<div class="btn-group dropdown-btn" >' +
              '<button type="button" class="btn btn_lightblue btn-xs my-drop-down" ng-click="showDown(\'' +
              row.domainId +
              '\');$event.stopPropagation();">操作 <span class="caret"></span></button>' +
              '<ul class="down" style="min-width:110px;">' +
              "<li><a ng-if='apis.Domain.updateDomain' data-toggle='modal' data-target='#update_modal' ng-click='updateInformation(\"" +
              row.domainId +
              '","' +
              row.domainName +
              '","' +
              row.domainDescription +
              '");doFocus("' +
              "domainNameModify" +
              "\")'>修改</a></li>" +
              "<li><a ng-click='goPool(\"" +
              row.domainId +
              '","' +
              row.domainName +
              "\")'>存储池</a></li>" +
              "<li><a data-toggle='modal' data-target='#datanode_modal' ng-click='getId(\"" +
              row.domainId +
              '","' +
              row.domainName +
              '","' +
              row.domainDescription +
              "\")'>存储节点</a></li>" +
              "</ul></div>";
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
      $scope.$on("$destroy", function () {
        $interval.cancel(intervalTime);
      });
      $scope.goPool = function (domainId, domainName) {
        $state.go("app.storage.domain.pool", {
          domainId: domainId,
          sel_domainName: domainName,
          flag: "1",
        });
      };

      function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
          if (selectedItems.hasOwnProperty(id)) {
            selectedItems[id] = selectAll;
            if (selectAll == false) {
              vm.d = true;
              $("#" + id).removeClass("active");
            } else {
              vm.d = false;
              $("#" + id).addClass("active");
            }
          }
        }
      }
      function toggleOne(selectedItems) {
        var s = 0;
        var count = 0;
        for (var id in selectedItems) {
          count++;
          if (selectedItems.hasOwnProperty(id)) {
            if (!selectedItems[id]) {
              vm.selectAll = false;
              $("#" + id).removeClass("active");
            } else {
              s++;
              $("#" + id).addClass("active");
            }
          }
        }
        if (s == count) {
          vm.selectAll = true;
        }
        if (s > 0) {
          vm.d = false;
        } else {
          vm.d = true;
        }
      }

      function drawCallback(result) {
        $(".selectpicker").selectpicker("render");
        vm.selectAll = false;
        vm.disabled = false;
        vm.d = true;
        refreshIds = [];
        if (result.json.data.length > 0) {
          $.each(result.json.data, function (i, value) {
            if (value.status == "Deleting") {
              refreshIds.push(value.domainId);
            }
          });
        }
        if (result.json.data.length > 0) {
          $("#domainTab").next().find(".dataTables_paginate").show();
        } else {
          $("#domainTab").next().find(".dataTables_paginate").hide();
        }

        $("#domainTab_filter").find("input").addClass("filter_input");
        $(".domainClearItem").remove();
        $(
          '<i class="fa fa-times-circle item-error-style domainClearItem" onclick="clearFilter(\'' +
            "domainTab_filter" +
            "')\"></i>"
        ).insertAfter($("#domainTab_filter").find("input"));
        if ($("#domainTab_filter").find("input").val() == "") {
          $(".domainClearItem").hide();
        } else {
          $(".domainClearItem").show();
        }
        $("#domainTab_filter").find("input").unbind("keyup", showItem);
        $("#domainTab_filter")
          .find("input")
          .bind("keyup", { cName: "domainClearItem" }, showItem);
        $(".domainClearItem").click(function (e) {
          e.stopPropagation();
          e.preventDefault();
          $("#domainTab").DataTable().search("").draw();
        });
        
        if (refreshIds.length > 0) {
          $interval.cancel(intervalTime);
          intervalTime = $interval(domainInterval, 3000);
        }
      }
      function domainInterval() {
        if (timeFlag) {
          timeFlag = false;
          if (refreshIds.length > 0) {
          $http({
            method: "POST",
            async: false,
            url: "listDomains",
            data: {
              idsJson: JSON.stringify(refreshIds),
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
                response.data.domainList.length == 0 ||
                refreshIds.length != response.data.domainList.length
              ) {
                $interval.cancel(intervalTime);
                refreshIds = [];
                vm.dtInstance.reloadData(null, false);
              }
            },
            function errorCallback(response) {}
          );
          }else{
            $interval.cancel(intervalTime);
          }
        }
      }

      $scope.reloadData = function () {
        vm.dtInstance.reloadData(null, false);
      };

      function fixTwoDecimal(value) {
        return Math.round(value * 100) / 100;
      }

      $scope.createReset = function () {
        $scope.createForm.$setPristine();
        $scope.createForm.$setUntouched();
        $scope.description = "";
        document.getElementById("createForm").reset();
      };

      $("#create_modal").on("hidden.bs.modal", function (e) {
        $scope.createReset();
      });

      $scope.updateReset = function () {
        $scope.updateForm.$setPristine();
        $scope.updateForm.$setUntouched();
      };
      $scope.create = function () {
        if ($scope.CreateFormDes) return;
        $http({
          method: "POST",
          async: false,
          url: "createDomain",
          data: {
            domainName: $scope.domainName,
            domainDescription: $("#description").val(),
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
              domainid = response.data.domain.domainId;
              domainname = response.data.domain.domainName;
              domainDes = response.data.domain.domainDescription;
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
            vm.dtInstance.reloadData(null, false);
          },
          function errorCallback(response) {
            showMessage.show(
              $scope,
              "error",
              translate.getWord("create.domain.error")
            );
            vm.dtInstance.reloadData(null, false);
          }
        );

        $scope.createReset();
      };

      $scope.updateInformation = function (id, name, description) {
        $scope.udomainId = id;
        $scope.udomainName = name;
        $scope.udescription = description;
      };

      $scope.update = function () {
        if ($scope.UpdateFormDes) return;
        $http({
          method: "POST",
          async: false,
          url: "updateDomain",
          data: {
            domainId: $scope.udomainId,
            domainName: $scope.udomainName,
            domainDescription: $scope.udescription,
            datanodes: "[]",
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
            vm.dtInstance.reloadData(null, false);
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
        vm.selectName = [];
        vm.selectedId = [];
        angular.forEach(vm.selected, function (data, index, array) {
          if (data == true) {
            vm.selectedId.push(index);
            var a = $("#" + index)
              .children("td")
              .eq("1")
              .find("a")
              .html();
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
            url: "deleteDomain",
            data: {
              domainId: data,
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
              vm.dtInstance.reloadData(null, false);
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
        vm.selectName = [];
      };

      $scope.getDatanodeId = function (id) {
        removeId = id;
      };

      $scope.prompt = function () {
        $scope.getId(domainid, domainname, domainDes);
      };

      $scope.toShow = false;
      $scope.toHide = function () {
        $("#datanode_modal").modal("hide");
        $scope.toShow = false;
      };
      $scope.getId = function (id, name, description) {
        $("#prompt_modal").modal("hide");
        $scope.toShow = true;
        $timeout(function () {
          $(".modal").draggable();
        }, 100);

        domainname = name;
        domainDes = description;
        domainid = id;
        $scope.showDomainName = name;

        vm.dtInstanceU = {};
        vm.dtOptionU = DTOptionsBuilder.newOptions()
          .withDOM(
            "<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
              "t" +
              "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>"
          )
          .withBootstrap()
          .withOption("ajax", {
            url: "listUsedDatanodesByDomainId",
            data: {
              domainId: id,
              randomData: Math.random(),
            },
            dataSrc: function (data) {
              if (data.resultMessage.message == "success") {
                var rtArr = [];
                if (data.beenUsedDatanodes.length > 0) {
                  for (var i = 0; i < data.beenUsedDatanodes.length; i++) {
                    if (
                      data.beenUsedDatanodes[i].status == "OK" ||
                      data.beenUsedDatanodes[i].status == "SEPARATED"
                    ) {
                      rtArr.push(data.beenUsedDatanodes[i]);
                    }
                  }
                }
                return rtArr;
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
          .withOption("searching", true)
          .withOption("rowId", "instanceId")
          .withOption("fnDrawCallback", function (result) {
            if ($("#domainUsedTab .dataTables_empty").size()) {
              $(".useDatanodeTable").next().find(".dataTables_paginate").hide();
            } else {
              $(".useDatanodeTable")
                .next()
                .find(".dataTables_paginate")
                .show()
                .css("font-size", "8px");
            }

            $("#domainUsedTab_filter").find("input").addClass("filter_input");
            $(".domainUsedClearItem").remove();

            $("#domainUsedTab_filter").addClass("table_top_sm");

            $(".selectpicker").selectpicker("render");

            $(
              '<i class="fa fa-times-circle item-error-style domainUsedClearItem" onclick="clearFilter(\'' +
                "domainUsedTab_filter" +
                "')\"></i>"
            ).insertAfter($("#domainUsedTab_filter").find("input"));
            if ($("#domainUsedTab_filter").find("input").val() == "") {
              $(".domainUsedClearItem").hide();
            } else {
              $(".domainUsedClearItem").show();
            }
            $("#domainUsedTab_filter").find("input").unbind("keyup", showItem);
            $("#domainUsedTab_filter")
              .find("input")
              .bind("keyup", { cName: "domainUsedClearItem" }, showItem);
            $(".domainUsedClearItem").click(function (e) {
              e.stopPropagation();
              e.preventDefault();
              $("#domainUsedTab").DataTable().search("").draw();
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
              '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white; height:30px !important;" name="timeSelect" >' +
              '<option value="5" >5条</option>' +
              '<option value="10" >10条</option>' +
              '<option value="20" >20条</option>' +
              '<option value="50" >50条</option>' +
              '<option value="100" >100条</option>' +
              "</select>&nbsp;" +
              " ",
            paginate: {
              previous: '<i class="fa fa-angle-left"></i>',
              next: '<i class="fa fa-angle-right"></i>',
              last: '<i class="fa fa-angle-double-right"></i>',
              first: '<i class="fa fa-angle-double-left"></i>',
            },
          })
          .withPaginationType("full_numbers");

        vm.dtColumnU = [
          DTColumnBuilder.newColumn("instanceId")
            .withTitle("实例ID")
            .notVisible(),
          DTColumnBuilder.newColumn("instanceName")
            .withTitle("实例名称")
            .notSortable(),
          DTColumnBuilder.newColumn("instanceId")
            .withTitle("实例ID")
            .notVisible(),
          DTColumnBuilder.newColumn("status")
            .withTitle("状态")
            .renderWith(function (data, type, row) {
              var resultString = "";
              switch (data) {
                case "OK":
                  resultString =
                    "<span class='status_green'>" +
                    translate.getWord("status.ok") +
                    "</span>";
                  break;
                case "SEPARATED":
                  resultString =
                    "<span class='status_red'>" +
                    translate.getWord("status.separated") +
                    "</span>";
                  break;
              }
              return resultString;
            }),
          DTColumnBuilder.newColumn("groupId").withTitle("所在组编号"),
          DTColumnBuilder.newColumn("host").withTitle("主机IP地址"),
          DTColumnBuilder.newColumn("port").withTitle("端口"),

          DTColumnBuilder.newColumn("")
            .withTitle("管理")

            .renderWith(function (data, type, row) {
              return (
                "<a data-toggle='modal' data-target='#remove_modal' ng-show='apis.Domain.removeDatanodeFromDomain' ng-click='getDatanodeId(\"" +
                row.instanceId +
                "\")'>" +
                translate.getWord("datanode.remove") +
                "</a>"
              );
            })
            .notSortable(),
        ];
        vm.selectedN = {};
        vm.selectNameN = new Array();
        vm.selectedIdN = new Array();
        vm.selectAllN = false;
        vm.toggleAllN = toggleAllN;
        vm.toggleOneN = toggleOneN;
        vm.dtInstanceN = {};
        vm.addDatanode = true;
        var datanodeLength;
        vm.dtOptionN = DTOptionsBuilder.newOptions()
          .withDOM(
            "<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
              "t" +
              "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>"
          )
          .withBootstrap()
          .withOption("ajax", {
            url: "listUnusedDatanodesByDomainId",
            data: {
              domainId: id,
              randomData: Math.random(),
            },
            dataSrc: function (data) {
              if (data.resultMessage.message == "success") {
                var rtArr = [];
                if (data.unusedDatanodes.length > 0) {
                  for (var i = 0; i < data.unusedDatanodes.length; i++) {
                    if (
                      data.unusedDatanodes[i].status == "OK" ||
                      data.unusedDatanodes[i].status == "SEPARATED"
                    ) {
                      rtArr.push(data.unusedDatanodes[i]);
                    }
                  }
                }
                datanodeLength = rtArr.length;
                vm.selectedN = {};
                vm.selectAllN = false;
                return rtArr;
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
          .withOption("rowId", "instanceId")
          .withOption("createdRow", function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
          })
          .withOption("headerCallback", function (header) {
            $compile(angular.element(header).contents())($scope);
          })

          .withOption("fnDrawCallback", function (result) {
            $(".selectpicker").selectpicker("render");
            vm.selectAllN = false;
            vm.addDatanode = true;
            if (datanodeLength > 0) {
              $(".newDatanodeTable")
                .next()
                .find(".dataTables_paginate")
                .show()
                .css("font-size", "8px");
            } else {
              $(".newDatanodeTable").next().find(".dataTables_paginate").hide();
            }
            for (var id in vm.selectedN) {
              if (vm.selectedN[id]) {
                vm.selectedN[id] = false;
              }
            }

            $("#domainUnuseTab_filter").find("input").addClass("filter_input");
            $(".domainUnuseClearItem").remove();
            $("#domainUnuseTab_filter").addClass("table_top_sm");

            $(
              '<i class="fa fa-times-circle item-error-style domainUnuseClearItem" onclick="clearFilter(\'' +
                "domainUnuseTab_filter" +
                "')\"></i>"
            ).insertAfter($("#domainUnuseTab_filter").find("input"));
            if ($("#domainUnuseTab_filter").find("input").val() == "") {
              $(".domainUnuseClearItem").hide();
            } else {
              $(".domainUnuseClearItem").show();
            }
            $("#domainUnuseTab_filter").find("input").unbind("keyup", showItem);
            $("#domainUnuseTab_filter")
              .find("input")
              .bind("keyup", { cName: "domainUnuseClearItem" }, showItem);
            $(".domainUnuseClearItem").click(function (e) {
              e.stopPropagation();
              e.preventDefault();
              $("#domainUnuseTab").DataTable().search("").draw();
            });
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
              '&nbsp;<select data-width="80px" class="selectpicker " style="background-color: white;" name="timeSelect" >' +
              '<option value="5" >5条</option>' +
              '<option value="10" >10条</option>' +
              '<option value="20" >20条</option>' +
              '<option value="50" >50条</option>' +
              '<option value="100" >100条</option>' +
              "</select>&nbsp;" +
              "",
            paginate: {
              previous: '<i class="fa fa-angle-left"></i>',
              next: '<i class="fa fa-angle-right"></i>',
              last: '<i class="fa fa-angle-double-right"></i>',
              first: '<i class="fa fa-angle-double-left"></i>',
            },
          })
          .withPaginationType("full_numbers");

        vm.dtColumnN = [
          DTColumnBuilder.newColumn("instanceId")
            .withTitle("实例ID")
            .notVisible(),
          DTColumnBuilder.newColumn("null")
            .withTitle(
              '<span class="check_span"><input id="datanodeSelectAll" class="input_check" ng-model="showDomain.selectAllN" ng-click="showDomain.toggleAllN(showDomain.selectAllN, showDomain.selectedN)" type="checkbox" ><label for="datanodeSelectAll"></label></span>'
            )
            .renderWith(function (data, type, row) {
              if (row.status == "SEPARATED") {
                return "";
              } else {
                vm.selectedN[row.instanceId] = false;
                return (
                  '<span class="check_span"><input class="input_check" ng-model="showDomain.selectedN[\'' +
                  row.instanceId +
                  '\'];" ng-click="showDomain.toggleOneN(showDomain.selectedN)" type="checkbox" id="checkbox_' +
                  row.instanceId +
                  '"><label for="checkbox_' +
                  row.instanceId +
                  '"></label></span>'
                );
              }
            })
            .withClass("checkbox_col")
            .notSortable(),
          DTColumnBuilder.newColumn("instanceId")
            .withTitle("实例ID")
            .notVisible(),
          DTColumnBuilder.newColumn("instanceName")
            .withTitle("实例名称")
            .notSortable(),
          DTColumnBuilder.newColumn("status")
            .withTitle("状态")
            .renderWith(function (data, type, row) {
              var resultString = "";
              switch (data) {
                case "OK":
                  resultString =
                    "<span class='status_green'>" +
                    translate.getWord("status.ok") +
                    "</span>";
                  break;
                case "SEPARATED":
                  resultString =
                    "<span class='status_red'>" +
                    translate.getWord("status.separated") +
                    "</span>";
                  break;
              }
              return resultString;
            }),
          DTColumnBuilder.newColumn("groupId").withTitle("所在组编号"),
          DTColumnBuilder.newColumn("host").withTitle("主机IP地址"),
          DTColumnBuilder.newColumn("port").withTitle("端口"),
        ];
      };
      function toggleAllN(selectAll, selectedItems) {
        for (var id in selectedItems) {
          if (selectedItems.hasOwnProperty(id)) {
            var name = $(".newDatanodeTable")
              .find("#" + id)
              .children("td")
              .eq("1")
              .html();
            if (name) {
              selectedItems[id] = selectAll;
            }
            if (selectAll == false) {
              vm.addDatanode = true;
            } else {
              vm.addDatanode = false;
            }
          }
        }
      }
      function toggleOneN(selectedItems) {
        var s = 0;
        var t = 0;
        for (var id in selectedItems) {
          if (selectedItems.hasOwnProperty(id)) {
            var name = $(".newDatanodeTable")
              .find("#" + id)
              .children("td")
              .eq("1")
              .html();
            if (name) {
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
          vm.addDatanode = false;
          if (s == t) {
            vm.selectAllN = true;
          } else {
            vm.selectAllN = false;
          }
        } else {
          vm.addDatanode = true;
        }
      }

      $scope.modelRefresh = function () {
        vm.dtInstanceU.reloadData(null, true);
        vm.dtInstanceN.reloadData(null, true);
        vm.dtInstance.reloadData(null, false);
      };
      $scope.removeDatanode = function () {
        $http({
          method: "post",
          async: false,
          url: "removeDatanodeFromDomain",
          data: {
            domainId: domainid,
            datanodeId: removeId,
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
                vm.dtInstance.reloadData(null, true);
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

      $scope.addDatanode = function () {
        vm.selectedIdN = [];
        angular.forEach(vm.selectedN, function (data, index, array) {
          if (data == true) {
            var name = $(".newDatanodeTable")
              .find("#" + index)
              .children("td")
              .eq("1")
              .html();
            if (name) {
              vm.selectedIdN.push(index);
            }
          }
        });
        $http({
          method: "post",
          async: false,
          url: "updateDomain",
          data: {
            domainId: domainid,
            domainName: domainname,
            domainDescription: domainDes,
            datanodes: JSON.stringify(vm.selectedIdN),
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
              $timeout(function () {
                $scope.modelRefresh();
              }, 1000);
              vm.addDatanode = true;
            } else if (response.data.failedInstanceList.length != 0) {
              var str = "下列节点为亚健康节点，不能被添加" + "<br>";
              angular.forEach(
                response.data.failedInstanceList,
                function (item) {
                  str = str + item.instanceName + ":" + item.host + "<br>";
                }
              );
              str =
                str +
                response.data.failedInstanceList[0].instanceName +
                ":" +
                response.data.failedInstanceList[0].host +
                "\r\n";
              showMessage.show($scope, "error", str);
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
                vm.dtInstance.reloadData(null, false);
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
      $scope.doFocus = function (id) {
        focus(id);
      };

      $scope.jumpToPool = function () {
        $("#datanode_modal").modal("hide");
        $scope.toShow = false;
        $state.go("app.storage.domain.pool", {
          domainId: domainid,
          domainName: domainname,
          flag: "2",
        });
      };
      $scope.showInfo = function (id) {
        $state.go("app.storage.domain.domainDetail", { domainId: id });
      };
    }
  );
