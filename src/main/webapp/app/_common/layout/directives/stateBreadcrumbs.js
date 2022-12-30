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
var pre,cur,isRresh=null
angular.module('SmartAdmin.Layout').directive('stateBreadcrumbs', function ($rootScope, $compile, $state, translate) {


  return {
    restrict: 'EA',
    replace: true,
    template: '<ol class="breadcrumb website_link" style="background: none;margin: 0 -5px;padding: 10px;margin-bottom:1px;border-radius: 0; font-size:12px"></ol>',
    link: function (scope, element) {
      function setBreadcrumbs(breadcrumbs) {
        pre = cur
        cur = breadcrumbs
        var preRouteMenu = pre?pre[0].title:''
        var curRouteMenu = cur?cur[0].title:''
        if(!pre){
          isRresh = true
        }else{
          isRresh = false
        }
        if(isRresh){
          setTimeout(()=>{
            $('li[data-menu-collapse]').children('a[title='+curRouteMenu+']').parent().find('ul:first').slideToggle(appConfig.menu_speed || 200)
            $('li[data-menu-collapse]').children('a[title='+curRouteMenu+']').parent().toggleClass('open active')
            $('li[data-menu-collapse]').children('a[title='+curRouteMenu+']').parent().find('>a .collapse-sign .fa').toggleClass('fa-angle-down fa-angle-right ')
          },500)
          return 
        }
        if(preRouteMenu==curRouteMenu){
        }else{
          var localMenu = $('li[data-menu-collapse]').children('a[title='+curRouteMenu+']').parent()
          if(curRouteMenu==='Dashboard'){
            $('nav>ul>li.open').find('>a .collapse-sign .fa').toggleClass('fa-angle-down fa-angle-right ')
            $('nav>ul>li.open').find('ul:first').slideToggle(appConfig.menu_speed || 200)
            return 
          }
          if(localMenu.find('>a .collapse-sign .fa').hasClass('fa-angle-down')){
            localMenu.siblings('.open').find('>a .collapse-sign .fa').toggleClass('fa-angle-down fa-angle-right ')
            localMenu.siblings('.open').find('ul:first').slideToggle(appConfig.menu_speed || 200)
            return
          }else{
            localMenu.find('>a .collapse-sign .fa').toggleClass('fa-angle-down fa-angle-right ')
            localMenu.find('ul:first').slideToggle(appConfig.menu_speed || 200)
            localMenu.siblings('.open').find('>a .collapse-sign .fa').toggleClass('fa-angle-down fa-angle-right ')
            localMenu.siblings('.open').find('ul:first').slideToggle(appConfig.menu_speed || 200)
            localMenu.siblings('.open').toggleClass('open active')
            localMenu.toggleClass('open active')
          }
        } 
        var html = '<li data-ui-sref="app.dashboard">主页</li>';
        angular.forEach(breadcrumbs, function (crumb) {
          html += '<li data-ui-sref=' + crumb.name + '>' + translate.getWord(crumb.title) + '</li>'
        });

        element.html($compile(html)(scope))
      }
      function fetchBreadcrumbs(stateName, breadcrunbs) {
        var state = $state.get(stateName);
        var breadcrunbsName = breadcrunbs.map(function (b) { return b.name; });
        if (state && state.data && state.data.title && breadcrunbsName.indexOf(state.data.title) == -1) {

          // breadcrunbs.unshift(state.data.title)
          breadcrunbs.unshift({ title: state.data.title, name: state.name })
        }

        var parentName = stateName.replace(/.?\w+$/, '');
        if (parentName) {
          return fetchBreadcrumbs(parentName, breadcrunbs);
        } else {
          return breadcrunbs;
        }
      }

      function processState(state) {
        var breadcrumbs;
        if (state.data && state.data.breadcrumbs) {
          breadcrumbs = state.data.breadcrumbs;
        } else {
          breadcrumbs = fetchBreadcrumbs(state.name, []);
        }

        setBreadcrumbs(breadcrumbs);
      }

      processState($state.current);

    }
  }
});
