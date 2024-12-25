/**
 * Copyright (C) 2013-2024 Nanjing Pengyun Network Technology Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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