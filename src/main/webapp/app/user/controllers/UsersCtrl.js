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

angular.module('app.user').controller('UsersCtrl', function (focus, translate, $http, $rootScope, $scope, DTOptionsBuilder, DTColumnBuilder, $compile, showMessage, $state) {
  $(".modal").draggable();
  var vm = this;
  vm.selected = {};
  vm.selectName = new Array();
  vm.selectedId = new Array();
  vm.selectAll = false;
  vm.toggleAll = toggleAll;
  vm.toggleOne = toggleOne;
  vm.disabled = true;
  vm.update = true;
  vm.del = true;
  var tableLength;
  var currentId;
  vm.dtInstance = {};
  vm.roles = {};
  $scope.showResource = false;
  vm.dtOptions = DTOptionsBuilder
    .newOptions()
    .withOption('ajax', {
      url: 'listAccountDT',
      type: 'POST',
      dataSrc: function (data) {
        if (data.resultMessage.message == "ERROR_0019_SessionOut") {
          showMessage.show($scope, "warn", translate.getWord("session.out"));
          $scope.logout();
          return;
        }
        tableLength = data.data.length;
        vm.selected = {};
        vm.selectAll = false;
        return data.data;
      },

    })
    .withDOM("<'dt-toolbar'<'col-xs-12 col-sm-6'l><'col-sm-6 col-xs-12 hidden-xs'f>r>" +
      "t" +
      "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>")
    .withBootstrap()
    .withOption('processing', true)
    .withOption('serverSide', true)
    .withOption('rowId', 'accountId')
    .withOption('fnDrawCallback', drawCallback)

    .withLanguage({
      "search": "",
      "searchPlaceholder": "查询用户名称",
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
    DTColumnBuilder.newColumn('accountId').withTitle('ID').notVisible(),
    DTColumnBuilder.newColumn('null').withTitle('')
      .renderWith(function (data, type, row) {
        return '<span class="fa fa-plus-square-o row-details" value="' + row.accountId + '"></span>';
      }).withClass('checkbox_col').notSortable().notVisible(),
    DTColumnBuilder.newColumn('null').withTitle('<span class="check_span"><input ng-model="showUser.selectAll" class="input_check" ng-click="showUser.toggleAll(showUser.selectAll, showUser.selected)" type="checkbox" id="selectAllFlag"><label for="selectAllFlag"></label></span>')
      .renderWith(function (data, type, row) {
        vm.selected[row.accountId] = false;
        return '<span class="check_span"><input class="input_check" ng-model="showUser.selected[\'' + row.accountId + '\'];" ng-click="showUser.toggleOne(showUser.selected)" type="checkbox" id="checkbox_' + row.accountId + '"><label for="checkbox_' + row.accountId + '"></label></span>';
      }).withClass('checkbox_col').notSortable(),
    DTColumnBuilder.newColumn('accountName').withTitle("用户名称")
      .renderWith(function (data, type, row) {
        return '<a title="查看用户详情" ng-click="showInfo(\'' + row.accountId + '\')">' + data + '</a>';
      }),
    DTColumnBuilder.newColumn('roles').withTitle("角色")
      .renderWith(function (data, type, row) {
        var string = "<span id='roleSpan'>"
        if (data.length > 0) {
          angular.forEach(data, function (d, index, array) {
            string = string + "<span class='roleSpan' id='" + d.roleId + "'>" + d.name + "</span>&nbsp;&nbsp;&nbsp;"
          })
        }
        string = string + "</span>"
        return string;
      }).notSortable()
  ];
  $scope.showInfo = function (accountId) {
    $state.go('app.user.users.userDetail', { userId: accountId });
  }


  function toggleAll(selectAll, selectedItems) {
    var f = false;
    for (var id in selectedItems) {
      if (selectedItems.hasOwnProperty(id)) {
        selectedItems[id] = selectAll;
        if (selectAll == false) {
          vm.disabled = true;
          vm.update = true;
          vm.del = true;
          $('#' + id).removeClass("active");
        } else {
          vm.disabled = false;
          vm.update = true;
          var type = $(".userTable").find("#" + id).children("td").last().find("#roleSpan");

          $(type).children("span").each(function () {
            if ($(this).html() == "superadmin") {
              f = true;
            }
          })

          if (f) {
            vm.del = true;
          } else {
            vm.del = false;
          }

          $('#' + id).addClass("active");
        }
      }
    }
  }
  function toggleOne(selectedItems) {
    var s = 0;
    var f = false;
    var selectedLength = 0;
    for (var id in selectedItems) {
      selectedLength++;
      if (selectedItems.hasOwnProperty(id)) {
        if (!selectedItems[id]) {
          vm.selectAll = false;
          $('#' + id).removeClass("active");
        } else {
          s++;
          $('#' + id).addClass("active");
          var type = $(".userTable").find("#" + id).children("td").last().find("#roleSpan");

          $(type).children("span").each(function () {
            if ($(this).html() == "superadmin") {
              f = true;
            }
          })

        }

      }
    }
    if (s > 0) {
      vm.disabled = false;
      if (s == tableLength) {
        vm.selectAll = true;
      } else {
        vm.selectAll = false;
      }
      if (f) {

        vm.update = true;
        vm.del = true;
      } else {
        if (s == 1) {
          vm.update = false;
          vm.del = false;
        } else {
          vm.update = true;
          vm.del = false;
        }

      }
    } else {
      vm.disabled = true;
      vm.update = true;
      vm.del = true;
    }
  }


  function drawCallback(result) {
    $(".selectpicker").selectpicker("render");
    $(".selectpicker").selectpicker("refresh");
    vm.selectAll = false;
    vm.disabled = true;
    vm.update = true;
    vm.del = true;
    $("#userTab_filter").find("input").addClass("filter_input");
    $(".userClearItem").remove();
    $('<i class="fa fa-times-circle item-error-style userClearItem" onclick="clearFilter(\'' + 'userTab_filter' + '\')"></i>').insertAfter($("#userTab_filter").find("input"));
    if ($("#userTab_filter").find("input").val() == "") {
      $(".userClearItem").hide();
    } else {
      $(".userClearItem").show();
    }
    $("#userTab_filter").find("input").unbind('keyup', showItem);
    $("#userTab_filter").find("input").bind('keyup', { cName: 'userClearItem' }, showItem);
    $(".userClearItem").click(function (e) {
      e.stopPropagation();
      e.preventDefault();
      $('#userTab').DataTable().search("").draw();
    })
    if ($("#userTab .dataTables_empty").size()) {
      $("#userTab_paginate").hide()
    } else {
      $("#userTab_paginate").show()
    }
    if (result.json) {
      vm.roles = {};
      angular.forEach(result.json.data, function (data, index, array) {
        if (data.roles.length > 0) {

          vm.roles[data.accountId] = data.roles;

        }
      })
    }

    var oTable = $(".userTable").dataTable();
    if ($.fn.dataTable.isDataTable(oTable)) {
      $(".userTable tbody").off("click", "span.row-details");
    }
    $('.userTable tbody').on('click', 'span.row-details', function () {
      var oTable = $(".userTable").dataTable();
      var nTr = $(this).parents("tr")[0];
      if (oTable.fnIsOpen(nTr)) {

        $(this).addClass("fa-plus-square-o").removeClass("fa-minus-square-o ");
        $(this).parents("tr").removeClass("active");
        oTable.fnClose(nTr);


      } else {
        fnFormatDetails(this, nTr, $(this).parents("tr").prop("id"), result.json);
        $(this).addClass("fa-minus-square-o ").removeClass("fa-plus-square-o ")
        $(this).parents("tr").addClass("active");


      }
    })

    if (result.json) {
      vm.updateInfo = {};
      angular.forEach(result.json.data, function (data, index, array) {
        vm.updateInfo[data.accountId] = data.resources;
      })
    }


  }

  function fnFormatDetails(select, nTr, pdataId, data) {
    var string = "";
    var oTable = $(".userTable").dataTable();
    var children = "<div class='row' >"
      + "<div style='padding-left:28px;'>" + translate.getWord("resources.allocation") + "</div>"
      + "<hr style='margin:6px !important'>"
      + "<div class=' col-sm-12 col-md-12 col-lg-12' id='" + pdataId + "_detail'>"
    angular.forEach(data.data, function (userdata, index, array) {
      if (userdata.accountId == pdataId) {
        if (userdata.accountType == "SuperAdmin") {

          children = children + "<div class='col-md-6 col-lg-6'>" + translate.getWord("superadmin.all.resoueces") + "</div>"

        } else {

          if ($.isEmptyObject(userdata.resources)) {
            children = children + "<div class='col-md-6 col-lg-6'>" + translate.getWord("no.resources") + "</div>"
          }

          if (userdata.resources.Domain) {
            children = children + '<div class=" col-md-12 col-lg-12" ><span><b>' + translate.getWord("table.domain") + '</b></span></div><div style="padding-left:30px">'
            angular.forEach(userdata.resources.Domain, function (data, index, array) {

              children = children + "<div class='col-md-1 col-lg-1' style='padding:8px 0px 8px 0px' id='" + data.resourceId + "' > "
                + data.resourceName + '</div>'

            })
            children = children + "</div>"
          }


          if (userdata.resources.StoragePool) {
            children = children + '<div class=" col-md-12 col-lg-12" ><span><b>' + translate.getWord("table.pool") + '</b></span></div><div style="padding-left:30px">'
            angular.forEach(userdata.resources.StoragePool, function (data, index, array) {
              children = children + "<div class='col-md-1 col-lg-1' style='padding:8px 0px 8px 0px' id='" + data.resourceId + "' > "
                + data.resourceName + '</div>'

            })
            children = children + "</div>"
          }

          if (userdata.resources.Volume) {
            children = children + '<div class=" col-md-12 col-lg-12" ><span><b>' + translate.getWord("volume.volume") + '</b></span></div><div style="padding-left:30px">'
            angular.forEach(userdata.resources.Volume, function (data, index, array) {
              children = children + "<div class='col-md-1 col-lg-1' style='padding:8px 0px 8px 0px' id='" + data.resourceId + "' > "
                + data.resourceName + '</div>'

            })
            children = children + "</div>"
          }



        }
      }
    })
    children = children + "</div></div>";
    oTable.fnOpen(nTr, children, 'details');


  }

  $scope.reloadData = function () {
    vm.dtInstance.reloadData(null, false);
  }

  $scope.resetCreate = function () {
    $scope.createForm.$setPristine();
    $scope.createForm.$setUntouched();
    document.getElementById("createForm").reset();

  }

  $scope.getRole = function () {
    $scope.resetCreate();
    $http({
      method: "POST",
      async: false,
      url: "listRoles",
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(response) {

      var string = "";
      angular.forEach(response.data.rolesList, function (data, index, array) {
        string = string + "<option value='" + data.roleId + "'>" + data.name + "</option>"
      })

      $("#createRole").html(string);
      $("#createRole").selectpicker('render');
      $("#createRole").selectpicker("refresh");
    }, function errorCallback(response) {
    });
  }
  
  $scope.create = function () {
    var rolesId;
    if ($("#createRole").val() == null) {
      rolesId = ""
    } else {
      rolesId = JSON.stringify($("#createRole").val());
    }
    $http({
      method: "POST",
      async: false,
      url: "createAccount",
      data: { "accountName": $scope.account, "newPassword": $scope.pwd, "roleIdsJson": rolesId },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: function (obj) {
        var str = [];
        for (var s in obj) {
          str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
        }
        return str.join("&");
      }
    }).then(function successCallback(response) {
      if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
        showMessage.show($scope, "warn", translate.getWord("ERROR_0019_SessionOut"));
        $scope.logout();
        return;
      } else if (response.data.resultMessage.message == "success") {
        showMessage.show($scope, "success", translate.getWord("response.success"));
      } else {
        showMessage.show($scope, "error", translate.getWord(response.data.resultMessage.message));
      }
      vm.dtInstance.reloadData(null, false);
    }, function errorCallback(response) {

    });
    $scope.resetCreate();
  }




  $scope.deleteNames = function () {
    vm.selectName = [];
    $scope.deletenames = "";
    vm.selectedId = [];
    angular.forEach(vm.selected, function (data, index, array) {
      if (data == true) {
        vm.selectedId.push(index);
        var a = $("#" + index).children("td").eq("1").find("a").text()
        vm.selectName.push(a);

      }

    })
    $scope.deletenames = vm.selectName.join(",");
  }

  $scope.resetNames = function () {
    vm.selectName = [];
    $scope.resetnames = "";
    vm.selectedId = [];
    angular.forEach(vm.selected, function (data, index, array) {
      if (data == true) {
        vm.selectedId.push(index);
        var a = $("#" + index).children("td").eq("1").text()
        vm.selectName.push(a);

      }

    })
    $scope.resetnames = vm.selectName.join(",");

  }

  $scope.deleteBtn = function () {
    $http({
      method: "post",
      async: false,
      url: "deleteAccount",
      data: {
        idsJson: JSON.stringify(vm.selectedId)
      },
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
      if (response.data.deleteAccountResult.message == "ERROR_0019_SessionOut") {
        showMessage.show($scope, "warn", translate.getWord("session.out"));
        $scope.logout();
        return;
      }
      if (response.data.deleteAccountResult.message == "success") {
        showMessage.show($scope, "success", translate.getWord("response.success"));


      } else {
        showMessage.show($scope, "error", translate.getWord(response.data.deleteAccountResult.message));
      }

      vm.dtInstance.reloadData(null, false);

    }, function errorCallback(data) {

    });


  }




  $scope.resetPwd = function () {

    angular.forEach(vm.selectedId, function (data, index, array) {
      $http({
        method: "post",
        async: false,
        url: "resetPassword",
        data: {
          accountId: data
        },
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

        if (response.data.resetPasswordResult.message == "ERROR_0019_SessionOut") {
          showMessage.show($scope, "warn", translate.getWord("session.out"));
          $scope.logout();
          return;
        }
        if (response.data.resetPasswordResult.message == "success") {
          showMessage.show($scope, "success", translate.getWord("response.success"));

        } else {
          showMessage.show($scope, "error", translate.getWord(response.data.resetPasswordResult.message));
        }

        vm.dtInstance.reloadData(null, false);

      }, function errorCallback(response) {

      })

    })


  }


  $scope.listRoles = function () {

    $http({
      method: "post",
      async: false,
      url: "listRoles",
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
      if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
        showMessage.show($scope, "warn", translate.getWord("session.out"));
        $scope.logout();
        return;
      }
      if (response.data.resultMessage.message == "success") {
        var leftInner = "";
        angular.forEach(response.data.rolesList, function (data, index, array) {

          let showName = data.name;
          if (showName.length > 25) {
            showName = showName.substring(0, 25) + "...";
          }

          leftInner = leftInner
            + "<li class='list-group-item' id='" + data.roleId + "'>"
            + "<div class='input-group input-group-sm'>"
            + "<span class=' input-group-addon form-control' title='" + data.name + "'>" + showName + "</span>"
            + "<span class='input-group-btn'>"
            + "<button type='button' class='btn btn_blue pull-right' ng-click='addRole(\"" + data.roleId + "\",\"" + data.name + "\")'>"
            + "<span class='fa fa-plus'></span>"
            + "</button>"
            + "</span> </div></li>";
        })
        var $leftInner = $compile(leftInner)($scope)
        $("#all_role").html($leftInner);
        assiginRole();
        $("#role_modal").modal("show")


      } else {
        showMessage.show($scope, "error", translate.getWord(response.data.resultMessage.message));
      }



    }, function errorCallback(response) {

    })


  }
  function assiginRole() {
    angular.forEach(vm.selected, function (data, index, array) {
      var right = "";
      var flag = false;
      if (data == true) {
        currentId = index;
        angular.forEach(vm.roles, function (d, dex, array) {
          if (dex == index) {
            flag = true;
            angular.forEach(d, function (ta, ind, array) {
              let showName = ta.name;
              if (showName.length > 25) {
                showName = showName.substring(0, 25) + "...";
              }
              right = right
                + "<li class='list-group-item' id='" + ta.roleId + "'>"
                + "<div class='input-group input-group-sm'>"
                + "<span class=' input-group-addon form-control' title='" + ta.name + "'>" + showName + "</span>"
                + "<span class='input-group-btn'>"
                + "<button type='button' class='btn btn_blue pull-right' ng-click='removeRole(\"" + ta.roleId + "\",\"" + ta.name + "\")'>"
                + "<span class='fa fa-minus'></span>"
                + "</button>"
                + "</span> </div></li>";
              $("#all_role").find("#" + ta.roleId).remove();
            })



          }


        })

        if (!flag) {
          right = right + "<div id='rightDefault' style='text-align:center;padding-top:60px'>" + translate.getWord("unassign.role.for.user") + "</div>"
        }

        var $right = $compile(right)($scope);
        $("#used_role").html($right);


      }


    })
  }
  $scope.addRole = function (id, name) {
    $("#all_role").find("#" + id).remove();
    $("#used_role").find("#rightDefault").hide();
    var rightInner = "";
    let showName = name;
    if (showName.length > 25) {
      showName = showName.substring(0, 25) + "...";
    }
    rightInner = rightInner
      + "<li class='list-group-item' id='" + id + "'>"
      + "<div class='input-group input-group-sm'>"
      + "<span class='input-group-addon form-control' title='" + name + "'>" + showName + "</span>"
      + "<span class='input-group-btn'>"
      + "<button type='button' class='btn btn_blue' ng-click='removeRole(\"" + id + "\",\"" + name + "\")'>"
      + "<span class='fa fa-minus'></span>"
      + " </button>"
      + "</span> </div></li>";
    var $rightInner = $compile(rightInner)($scope);
    $("#used_role").append($rightInner);

  }
  $scope.removeRole = function (id, name) {
    $("#used_role").find("#" + id).remove();
    var leftInner = "";
    let showName = name;
    if (showName.length > 25) {
      showName = showName.substring(0, 25) + "...";
    }
    leftInner = leftInner
      + "<li class='list-group-item' id='" + id + "'>"
      + "<div class='input-group input-group-sm'>"
      + "<span class='input-group-addon form-control' title='" + name + "'>" + showName + "</span>"
      + "<span class='input-group-btn'>"
      + "<button type='button' class='btn btn_blue' ng-click='addRole(\"" + id + "\",\"" + name + "\")'>"
      + "<span class='fa fa-plus'></span>"
      + " </button>"
      + "</span> </div></li>";
    var $leftInner = $compile(leftInner)($scope);
    $("#all_role").append($leftInner);
  }

  $scope.resetRole = function () {
    $("#role_modal").modal("hide");
    var rolesId = new Array();
    $("#used_role").children("li").each(function () {
      rolesId.push($(this).attr("id"));
    })
    $http({
      method: "post",
      async: false,
      url: "assignRoles",
      data: {
        roleIdsJson: JSON.stringify(rolesId),
        accountId: currentId
      },
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

      if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
        showMessage.show($scope, "warn", translate.getWord("session.out"));
        $scope.logout();
        return;
      }
      if (response.data.resultMessage.message == "success") {
        showMessage.show($scope, "success", translate.getWord("response.success"));

      } else {
        showMessage.show($scope, "error", translate.getWord(response.data.resultMessage.message));
      }

      vm.dtInstance.reloadData(null, false);

    }, function errorCallback(response) {

    })

  }

  $scope.getResource = function () {
    $scope.showResource = true;
    $http({
      method: "POST",
      async: false,
      url: "listResource",
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
        var string = "";
        if ($.isEmptyObject(response.data.resourceList)) {
          string = string + "<fieldset><section><label class='label' style='font-size:15px'>" + translate.getWord("create.resources.first") + "</label></section></fieldset>"
        }
        if (response.data.resourceList.Domain) {
          string = string + '<fieldset>'
            + '<section>'
            + '<label class="label">' + translate.getWord("table.domain") + '</label>'
            + ' <div class="inline-group col-sm-12">'
          angular.forEach(response.data.resourceList.Domain, function (data, index, array) {
            string = string
              + '<label class="checkbox col-sm-3 sourceName" title="' + data.resourceName + '">'
              + '<input type="checkbox" name="checkbox-inline" id="' + data.resourceId + '">'
              + '<i></i>' + data.resourceName + '</label>'

          })
          string = string + '</div></section></fieldset>'
        }
        if (response.data.resourceList.StoragePool) {

          string = string + '<fieldset>'
            + '<section>'
            + '<label class="label">' + translate.getWord("table.pool") + '</label>'
            + ' <div class="inline-group col-sm-12">'
          angular.forEach(response.data.resourceList.StoragePool, function (data, index, array) {
            string = string
              + '<label class="checkbox col-sm-3 sourceName" title="' + data.resourceName + '">'
              + '<input type="checkbox" name="checkbox-inline" id="' + data.resourceId + '" >'
              + '<i></i>' + data.resourceName + '</label>'

          })
          string = string + '</div></section></fieldset>'
        }
        if (response.data.resourceList.Volume) {

          string = string + '<fieldset>'
            + '<section>'
            + '<label class="label">' + translate.getWord("volume.volume") + '</label>'
            + ' <div class="inline-group col-sm-12">'
          angular.forEach(response.data.resourceList.Volume, function (data, index, array) {
            string = string
              + '<label class="checkbox col-sm-3 sourceName" title="' + data.resourceName + '">'
              + '<input type="checkbox" name="checkbox-inline" id="' + data.resourceId + '">'
              + '<i></i>' + data.resourceName + '</label>'

          })
          string = string + '</div></section></fieldset>'
        }

        var $inner = $compile(string)($scope);

        $("#update_resource").html($inner);

        angular.forEach(vm.selected, function (data, index, array) {
          if (data == true) {
            currentId = index;
            angular.forEach(vm.updateInfo, function (d, id, array) {
              if (id == index) {
                angular.forEach(d, function (api, dex, array) {

                  angular.forEach(api, function (ap, dex, array) {


                    $("#update_resource").find("#" + ap.resourceId).attr("checked", "checked");

                  })
                })
              }


            })

          }

        })



      } else {
        if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
          showMessage.show($scope, "warn", translate.getWord("session.out"));
          $scope.logout();
          return;
        } else {
          showMessage.show($scope, "error", translate.getWord(response.data.resultMessage.message));
        }

      }

    }, function errorCallback(response) {


    });
  }

  $scope.assignResourceBtn = function () {
    $("#updateResource_modal").modal("hide")
    $scope.showResource = false;
    vm.selectedresource = [];
    $('[name=checkbox-inline]:checkbox').each(function () {
      if (this.checked) {
        vm.selectedresource.push(this.id);
      }
    });

    $http({
      method: "POST",
      async: false,
      url: "assignResource",
      data: {
        targetAccountId: currentId,
        resourcesJson: JSON.stringify(vm.selectedresource)
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
        if (response.data.resultMessage.message == "ERROR_0019_SessionOut") {
          showMessage.show($scope, "warn", translate.getWord("session.out"));
          $scope.logout();
          return;
        } else {
          showMessage.show($scope, "error", translate.getWord(response.data.resultMessage.message));
        }

      }



    }, function errorCallback(response) {


    });
  }
  $scope.doFocus = function (id) {
    focus(id)
  }

})
