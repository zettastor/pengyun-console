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

angular.module('app.storage').controller('showTable', function ($http,$scope,DTOptionsBuilder, DTColumnBuilder,$compile) {
    $(".modal").draggable();  
    var vm = this;
    $scope.$on('getId',function(e,newId){
    	$scope.domainId=newId;
        $('#datanode_list').html(' <table datatable dt-options="showDatanode.dtOptionU" dt-columns="showDatanode.dtColumnU" class="table table-striped  table-hover row-border hover" dt-instance="showDatanode.dtInstanceU" ></table>')
    	vm.dtInstanceU = {};
        vm.dtOptionU= DTOptionsBuilder
         .newOptions()
         .withBootstrap()
         .withOption('ajax', {
         url: 'listUsedDatanodesByDomainId',
         data:{
            domainId:newId
         },
        dataSrc:function(data){
           var rtArr=[];
           for(var i=0;i<data.beenUsedDatanodes.length;i++){
                if(data.beenUsedDatanodes[i].status=="OK"){
                        rtArr.push(data.beenUsedDatanodes[i])
                    }
            }
          return rtArr;
        },
         type: 'POST',
         
     })
        .withDataProp('data')
        .withOption('serverSide',false)
        .withOption('processing',false)
        .withOption('bInfo', false)
        .withOption('paging', false)
        .withOption('searching',false)
        .withOption('rowId', 'instanceId')
        .withLanguage({
            "aria": {
                "sortAscending": ": activate to sort column ascending",
                "sortDescending": ": activate to sort column descending"
            },
            "emptyTable": "此表为空",
            "info": "表格信息",
            "infoEmpty": "表格为空",
            "zeroRecords": "没有数据"
        })
    vm.dtColumnU = [
    DTColumnBuilder.newColumn('instanceName').withTitle('实例名称'),
    DTColumnBuilder.newColumn('instanceId').withTitle('实例ID'),
    DTColumnBuilder.newColumn('groupId').withTitle('所在组编号'),
    DTColumnBuilder.newColumn('host').withTitle('主机IP地址'),
    DTColumnBuilder.newColumn('port').withTitle('端口'),
    DTColumnBuilder.newColumn('status').withTitle('当前状态')
            .renderWith(function(data,type,row){
                return "<span class='status_green'>"+row.status+"</span>"
            }),
    
    DTColumnBuilder.newColumn('null').withTitle('管理')
           .renderWith(function(data, type,row) {
              return "<a>移除存储节点</a>";
        }).notSortable()
 ];
   })
})