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
  .module("app.user")
  .controller(
    "RolesCtrl",
    function (
      $state,
      focus,
      translate,
      $http,
      $scope,
      DTOptionsBuilder,
      DTColumnBuilder,
      $compile,
      showMessage,
      $rootScope
    ) {
      $(".modal").draggable();
      $scope.doFocus = function (id) {
        focus(id);
      };
      var vm = this;
      vm.dtInstance = {};
      vm.selected = {};
      vm.updateInfo = {};
      vm.selectedApi = new Array();
      vm.selectedId = new Array();
      vm.selectAll = false;
      vm.toggleAll = toggleAll;
      vm.toggleOne = toggleOne;
      vm.u = true;
      vm.d = true;
      $scope.toShow = false;
      $scope.updateShow = false;
      var tableLength;
      var currentId;
      var apiArr = {};
      var apiList = [];
      var filterObj = {
        Access_Rule:true,
        Domain:true,
        Account:true,
        Driver:true,
        Other:true,
        Rebalance:true,
        Role:true,
        StoragePool:true,
        Qos:{
          key:{
          cancelMigrationRules:true,
          applyMigrationRules:true,
          createIoLimitations:true,
          cancelIoLimitations:true,
          applyIoLimitations:true,
          updateIoLimitations:true,
          deleteIoLimitations:true
          }
        },
        Volume:{
          key:{
            recycleVolume:true,
            extendVolume:true,
            createVolume:true,
            deleteVolume:true
          }
        },
      }
      $scope.$watch("description", function (newval) {
        var value = newval;
        var len = 0;
        var l;
        if (value) {
          for (var i = 0; i < value.length; i++) {
            l = value.charCodeAt(i);
            if (l >= 0 && l <= 128) {
              len += 1;
            } else {
              len += 2;
            }
          }
        }
        $scope.CreateFormDes = len > 250;
      });

      $scope.$watch("updateDes", function (newval) {
        var value = newval;
        var len = 0;
        var l;
        if (value) {
          for (var i = 0; i < value.length; i++) {
            l = value.charCodeAt(i);
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
          url: "listRoles",
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
            tableLength = data.rolesList.length;
            vm.selected = {};
            vm.selectAll = false;
            return data.rolesList;
          },
        })
        .withDOM(
          "<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
            "t" +
            "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>"
        )
        .withBootstrap()
        .withOption("processing", true)
        .withOption("serverSide", false)
        .withOption("rowId", "roleId")
        .withOption("fnDrawCallback", drawCallback)
        .withLanguage({
          search: "",
          searchPlaceholder: translate.getWord("performance.task.filter"),
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
            "</select>&nbsp",
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
        DTColumnBuilder.newColumn("roleId").withTitle("ID").notVisible(),
        DTColumnBuilder.newColumn("null")
          .withTitle("")
          .renderWith(function (data, type, row) {
            return (
              '<span class="fa fa-plus-square-o row-details" value="' +
              row.roleId +
              '"></span>'
            );
          })
          .withClass("checkbox_col")
          .notSortable()
          .notVisible(),
        DTColumnBuilder.newColumn("null")
          .withTitle(
            '<span class="check_span"><input ng-model="showRole.selectAll" class="input_check" ng-click="showRole.toggleAll(showRole.selectAll, showRole.selected)" type="checkbox" id="selectAllFlag"><label for="selectAllFlag"></label></span>'
          )
          .renderWith(function (data, type, row) {
            if (row.name == "superadmin") {
              return "";
            } else {
              vm.selected[row.roleId] = false;
              return (
                '<span class="check_span"><input class="input_check" ng-model="showRole.selected[\'' +
                row.roleId +
                '\'];" ng-click="showRole.toggleOne(showRole.selected)" type="checkbox" id="checkbox_' +
                row.roleId +
                '"><label for="checkbox_' +
                row.roleId +
                '"></label></span>'
              );
            }
          })
          .withClass("checkbox_col")
          .notSortable(),
        DTColumnBuilder.newColumn("name")
          .withTitle("角色名称")
          .renderWith(function (data, type, row) {
            return (
              '<a title="查看角色户详情" ng-click="showInfo(\'' +
              row.roleId +
              "')\">" +
              data +
              "</a>"
            );
          }),
        DTColumnBuilder.newColumn("description")
          .withTitle("描述")
          .notSortable(),
      ];
      $scope.showInfo = function (roleId) {
        $state.go("app.user.roles.roleDetail", { roleId: roleId });
      };

      function toggleAll(selectAll, selectedItems) {
        var t = 0;
        for (var id in selectedItems) {
          if (selectedItems.hasOwnProperty(id)) {
            var name = $(".roleTable")
              .find("#" + id)
              .children("td")
              .eq("1")
              .html();
            if (name) {
              selectedItems[id] = selectAll;
              t++;
            }
          }
        }
        if (selectAll == false) {
          vm.d = true;
          vm.u = true;
        } else {
          vm.d = false;
          if (t == 1) {
            vm.u = false;
          } else {
            vm.u = true;
          }
        }
      }
      function toggleOne(selectedItems) {
        var s = 0;
        var t = 0;
        for (var id in selectedItems) {
          if (selectedItems.hasOwnProperty(id)) {
            var name = $(".roleTable")
              .find("#" + id)
              .children("td")
              .eq("1")
              .html();
            if (name) {
              t++;
            }
            if (!selectedItems[id]) {
              vm.selectAll = false;
              $("#" + id).removeClass("active");
            } else {
              s++;
              $("#" + id).addClass("active");
            }
          }
        }
        if (s > 0) {
          vm.d = false;
          if (s == t) {
            if (t == 1) {
              vm.u = false;
            } else {
              vm.u = true;
            }
            vm.selectAll = true;
          } else if (s == 1) {
            vm.u = false;
            vm.selectAll = false;
          } else {
            vm.u = true;
            vm.selectAll = false;
          }
        } else {
          vm.d = true;
          vm.u = true;
        }
      }

      function drawCallback(result) {
        $(".selectpicker").selectpicker("render");
        $(".selectpicker").selectpicker("refresh");
        vm.selectAll = false;
        vm.d = true;
        vm.u = true;
        $("#roleTab_filter").find("input").addClass("filter_input");
        $(".roleClearItem").remove();
        $(
          '<i class="fa fa-times-circle item-error-style roleClearItem" onclick="clearFilter(\'' +
            "roleTab_filter" +
            "')\"></i>"
        ).insertAfter($("#roleTab_filter").find("input"));
        if ($("#roleTab_filter").find("input").val() == "") {
          $(".roleClearItem").hide();
        } else {
          $(".roleClearItem").show();
        }
        $("#roleTab_filter").find("input").unbind("keyup", showItem);
        $("#roleTab_filter")
          .find("input")
          .bind("keyup", { cName: "roleClearItem" }, showItem);
        $(".roleClearItem").click(function (e) {
          e.stopPropagation();
          e.preventDefault();
          $("#roleTab").DataTable().search("").draw();
        });
        if ($("#roleTab .dataTables_empty").size()) {
          $("#roleTab_paginate").hide();
        } else {
          $("#roleTab_paginate").show();
        }
        for (var id in vm.selected) {
          if (vm.selected[id]) {
            vm.selected[id] = false;
          }
        }
        var oTable = $(".roleTable").dataTable();
        if ($.fn.dataTable.isDataTable(oTable)) {
          $(".roleTable tbody").off("click", "span.row-details");
        }
        $(".roleTable tbody").on("click", "span.row-details", function () {
          var oTable = $(".roleTable").dataTable();
          var nTr = $(this).parents("tr")[0];
          if (oTable.fnIsOpen(nTr)) {
            $(this)
              .addClass("fa-plus-square-o")
              .removeClass("fa-minus-square-o ");
            $(this).parents("tr").removeClass("active");
            oTable.fnClose(nTr);
          } else {
            fnFormatDetails(
              this,
              nTr,
              $(this).parents("tr").prop("id"),
              result.json
            );
            $(this)
              .addClass("fa-minus-square-o ")
              .removeClass("fa-plus-square-o ");
            $(this).parents("tr").addClass("active");
          }
        });
        if (result.json) {
          vm.updateInfo = {};
          angular.forEach(result.json.rolesList, function (data, index, array) {
            vm.updateInfo[data.roleId] = data.permissions;
          });
        }
      }

      $scope.reloadData = function () {
        vm.dtInstance.reloadData(null, false);
      };

      function limition(datas) {
        var string = "";
        if (datas) {
          string =
            string +
            '<div  class=" col-md-12 col-lg-12"><span><b>' +
            translate.getWord(datas[0].category) +
            '</b></span></div><div style="padding-left:30px">';
          angular.forEach(datas, function (data, index, array) {
            string =
              string +
              "<div class='col-md-1 col-lg-1' style='padding:8px 0px 8px 0px' id='" +
              data.apiName +
              "' > ";
            if ($rootScope.currentLanguage == "cn") {
              string = string + data.chineseText + "</div>";
            } else {
              string = string + data.englishText + "</div>";
            }
          });
          string = string + "</div>";
        }
        return string;
      }

      function limitionList(name, datas,obj) {
        var string = "";
        if (datas) {
          string =
            string +
            "<fieldset>" +
            "<section>" +
            '<div class="col-sm-12">' +
            '<label class="label col-sm-2">' +
            translate.getWord(name) +
            "</label>" +
            '<label class="checkbox pull-right"><input type="checkbox"  onclick="selectAllOption(this)"><i></i>' +
            translate.getWord("select.all") +
            "</label>" +
            "</div>" +
            ' <div class="inline-group col-sm-12">';
          angular.forEach(datas, function (data, index, array) {
            if(obj){
              if(obj[data.apiName]){
                string =
                  string +
                  '<label class="checkbox col-sm-3" >' +
                  '<input onclick="selectOneOption(this)" type="checkbox" name="checkbox-inline" id="' +
                  data.apiName +
                  '" class="' +
                  name +
                  '">';
                if ($rootScope.currentLanguage == "cn") {
                  string = string + "<i></i>" + data.chineseText + "</label>";
                } else {
                  string = string + "<i></i>" + data.englishText + "</label>";
                }
              }
            } else{
              string =
                string +
                '<label class="checkbox col-sm-3" >' +
                '<input onclick="selectOneOption(this)" type="checkbox" name="checkbox-inline" id="' +
                data.apiName +
                '" class="' +
                name +
                '">';
              if ($rootScope.currentLanguage == "cn") {
                string = string + "<i></i>" + data.chineseText + "</label>";
              } else {
                string = string + "<i></i>" + data.englishText + "</label>";
              }
            }
          });
          string = string + "</div></section></fieldset>";
        }
        return string;
      }

      function listSelectApi(item, value) {
        if (apiArr[item]) {
          apiList = apiArr[item];
          apiList.push(value);
          apiArr[item] = apiList;
        } else {
          apiList.push(value);
          apiArr[item] = apiList;
        }
      }

      function fnFormatDetails(select, nTr, pdataId, data) {
        var oTable = $(".roleTable").dataTable();
        var children =
          "<div class='row' >" +
          "<div style='padding-left:28px;'>" +
          translate.getWord("create.role.step.two") +
          "</div>" +
          "<hr style='margin:6px !important'>" +
          "<div class=' col-sm-12 col-md-12 col-lg-12' id='" +
          pdataId +
          "_detail'>";
        angular.forEach(data.rolesList, function (roledata, index, array) {
          if (roledata.roleId == pdataId) {
            if ($.isEmptyObject(roledata.permissions)) {
              children =
                children +
                "<div class='col-sm-6 col-md-6 col-lg-6'>" +
                translate.getWord("assign.role.null") +
                "</div>";
            } else {
              angular.forEach(
                roledata.permissions,
                function (data, index, array) {
                  children = children + limition(data);
                }
              );
            }
          }
        });
        children = children + "</div></div>";
        var $children = $compile(children)($scope);
        oTable.fnOpen(nTr, $children, "details");
      }

      $scope.createReset = function () {
        vm.selectedApi = [];
        document.getElementById("createForm").reset();
        $scope.createForm.$setPristine();
        $scope.createForm.$invalid = false;
        $scope.CreateFormDes = false;
        $(".steps:eq(0) #title_one").click();
      };

      $scope.updateReset = function () {
        vm.selectedApi = [];
        $scope.updateForm.$invalid = false;
        $scope.updateForm.updateRoleName.$invalid = false;
        $scope.updateForm.$setPristine();
        $scope.UpdateFormDes = false;
        $(".steps:eq(1) #title_one").click();
      };

      $scope.getResource = function () {
        $scope.toShow = true;
        $scope.createReset();
        $http({
          method: "POST",
          async: false,
          url: "listApi",
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
              let string = ''
              angular.forEach(response.data, function (data, index, array) {
                if (index != "resultMessage" && index != "apisList") {
                  if(filterObj[index]){
                    if(filterObj[index]['key']){
                      string = string + limitionList(index, data,filterObj[index]['key']);
                    }else{
                      string = string + limitionList(index, data);
                    }
                  }
                }
              });
              var $string = $compile(string)($scope);
              $("#step2").html($string);
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

      $scope.updateList = function () {
        $scope.updateShow = true;
        $scope.updateReset();
        $http({
          method: "POST",
          async: false,
          url: "listApi",
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
              var string = "";
              angular.forEach(response.data, function (data, index, array) {
                if (index != "resultMessage" && index != "apisList") {
                  if(filterObj[index]){
                    if(filterObj[index]['key']){
                      string = string + limitionList(index, data,filterObj[index]['key']);
                    }else{
                      string = string + limitionList(index, data);
                    }
                  }
                }
              });

              var $inner = $compile(string)($scope);

              $("#update_step2").html($inner);

              angular.forEach(vm.selected, function (data, index, array) {
                var selectid;
                if (data == true) {
                  currentId = index;
                  var name = $(".roleTable")
                    .find("#" + index)
                    .children("td")
                    .eq("1")
                    .text();
                  var des = $(".roleTable")
                    .find("#" + index)
                    .children("td")
                    .eq("2")
                    .text();
                  $("#updateRoleName").val(name);
                  $("#updateDes").val(des);
                  angular.forEach(vm.updateInfo, function (d, id, array) {
                    if (id == index) {
                      angular.forEach(d, function (api, dex, array) {
                        angular.forEach(api, function (ap, dex, array) {
                          $("#update_step2")
                            .find("#" + ap.apiName)
                            .attr("checked", "checked");
                        });
                      });
                    }
                  });
                  $("input[name='checkbox-inline']").each(function () {
                    var flagOption = true;
                    $(this)
                      .parents("section")
                      .children()
                      .eq(1)
                      .find("input")
                      .each(function () {
                        if (!$(this).prop("checked")) {
                          flagOption = false;
                        }
                      });
                    $(this)
                      .parents("section")
                      .children()
                      .eq(0)
                      .find("input")
                      .prop("checked", flagOption);
                  });
                }
              });
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

      $scope.wizardCompleteCallback = function (wizardData) {
        $("#create_modal").modal("hide");
        $scope.toShow = false;
        vm.selectedApi = [];
        $("[name=checkbox-inline]:checkbox").each(function () {
          if (this.checked) {
            vm.selectedApi.push(this.id);
          }
        });
        $http({
          method: "POST",
          async: false,
          url: "createRole",
          data: {
            roleName: wizardData.roleName,
            description: wizardData.description,
            apiNamesJson: JSON.stringify(vm.selectedApi),
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
          function errorCallback(response) {}
        );
      };
      $scope.wizard2CompleteCallback = function (wizardData) {
        $("#update_modal").modal("hide");
        $scope.updateShow = false;
        vm.selectedApi = [];
        $("[name=checkbox-inline]:checkbox").each(function () {
          if (this.checked) {
            vm.selectedApi.push(this.id);
          }
        });
        $http({
          method: "POST",
          async: false,
          url: "updateRole",
          data: {
            roleId: currentId,
            roleName: wizardData.updateRoleName,
            description: wizardData.updateDes,
            apiNamesJson: JSON.stringify(vm.selectedApi),
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
          function errorCallback(response) {}
        );
      };

      $scope.deleteNames = function () {
        vm.selectName = new Array();
        vm.selectedId = [];
        angular.forEach(vm.selected, function (data, index, array) {
          if (data == true) {
            vm.selectedId.push(index);
            var a = $(".roleTable")
              .find("#" + index)
              .children("td")
              .eq("1")
              .find("a")
              .text();
            vm.selectName.push(a);
          }
        });
        $scope.deletenames = vm.selectName.join(",");
      };

      $scope.deletes = function () {
        $http({
          method: "post",
          async: false,
          url: "deleteRoles",
          data: {
            idsJson: JSON.stringify(vm.selectedId),
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
              } else if (
                response.data.resultMessage.message ==
                "ERROR_DeleteRoleException"
              ) {
                var messageStr = "";
                for (var key in response.data.failedRoleId2Cause) {
                  var val = translate.getWord(
                    response.data.failedRoleId2Cause[key]
                  );
                  messageStr = messageStr + key + ":" + val + "<br/>";
                }
                showMessage.show($scope, "error", messageStr);
                vm.dtInstance.reloadData(null, false);
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

        vm.selectedId = [];
      };

      $scope.nextBtn = function () {
        if ($scope.CreateFormDes) {
          return;
        }

        apiArr = {};
        if ($("#lastStep").hasClass("active")) {
          var des = $("#description").val();
          var string = "";
          var bon = false;
          if (
            $("#description").val() == undefined ||
            $("#description").val() == ""
          ) {
            des = "<span style='font-style: italic;color:#ccc'>空</span>";
          }
          $("#userNa").html("角色名 : " + $("#roleName").val());
          $("#userDes").html("描述 : " + des);
          $("[name=checkbox-inline]:checkbox").each(function () {
            if (this.checked) {
              bon = true;
              apiList = [];
              listSelectApi($(this).attr("class"), $(this).parent().text());
            }
          });
          if (!bon) {
            string =
              "<span style='font-style: italic;color:#ccc;font-size:15px'>空</span>";
          } else {
            angular.forEach(apiArr, function (data, index) {
              string =
                string +
                "<div class='col-md-12' style='font-size:15px;padding:3px 0px'>" +
                translate.getWord(index) +
                "</div><div class='col-md-12' style='padding-left:18px'>";
              angular.forEach(apiArr[index], function (d, ind) {
                string =
                  string +
                  '<div class="col-md-3" style="padding:3px 0px;font-size:15px">' +
                  d +
                  "</div>";
              });
              string = string + "</div>";
            });
          }
          $("#assignList").html(string);
        }
      };
      $scope.nextBtnUpdate = function () {
        if ($scope.UpdateFormDes) {
          return;
        }

        apiArr = {};
        if ($("#lastStepUpdate").hasClass("active")) {
          var des = $("#updateDes").val();
          var string = "";
          var bon = false;
          if (
            $("#updateDes").val() == undefined ||
            $("#updateDes").val() == ""
          ) {
            des = "<span style='font-style: italic;color:#ccc'>空</span>";
          }
          $("#updateName").html("角色名 : " + $("#updateRoleName").val());
          $("#Des").html("描述 : " + des);
          $("[name=checkbox-inline]:checkbox").each(function () {
            if (this.checked) {
              bon = true;
              apiList = [];
              listSelectApi($(this).attr("class"), $(this).parent().text());
            }
          });
          if (!bon) {
            string =
              "<span style='font-style: italic;color:#ccc;font-size:15px'>空</span>";
          } else {
            angular.forEach(apiArr, function (data, index) {
              string =
                string +
                "<div class='col-md-12' style='font-size:15px;padding:3px 0px'>" +
                translate.getWord(index) +
                "</div><div class='col-md-12' style='padding-left:18px'>";
              angular.forEach(apiArr[index], function (d, ind) {
                string =
                  string +
                  '<div class="col-md-3" style="padding:3px 0px;font-size:15px">' +
                  d +
                  "</div>";
              });
              string = string + "</div>";
            });
          }
          $("#assignListUpdate").html(string);
        }
      };
    }
  );
function selectAllOption(btn) {
  $(btn)
    .parents("section")
    .children()
    .eq(1)
    .find("input")
    .prop("checked", $(btn).prop("checked"));

  var num = 0;
  $(btn)
    .parents("section")
    .children()
    .eq(1)
    .find("input")
    .each(function () {
      if ($(this).prop("checked")) {
        num++;
      }
    });
  if (num > 8) {
    $("#addPerformace").prop("disabled", true);
  } else {
    $("#addPerformace").prop("disabled", false);
  }
}

function selectOneOption(btn) {
  var flagOption = true;
  var num = 0;
  $(btn)
    .parents("section")
    .children()
    .eq(1)
    .find("input")
    .each(function () {
      if (!$(this).prop("checked")) {
        flagOption = false;
      } else {
        num++;
      }
    });
  $(btn)
    .parents("section")
    .children()
    .eq(0)
    .find("input")
    .prop("checked", flagOption);

  if (num > 8) {
    $("#addPerformace").prop("disabled", true);
  } else {
    $("#addPerformace").prop("disabled", false);
  }
}