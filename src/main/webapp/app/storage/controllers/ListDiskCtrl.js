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

angular.module('app.storage').controller('diskTable', function ($http,$scope,DTOptionsBuilder, DTColumnBuilder,$compile) {
    $(".modal").draggable();
     $scope.$on('getId',function(e,newId){
       id=newId;
    })
    var vm = this;
    var id;
    var oTable=$(".poolTable").dataTable();
    var tr = document.getElementById(id)
    var row = oTable.api().row( tr );
    var data=row.data();
    var newData=[];
})