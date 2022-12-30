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

angular.module('app').controller("LanguagesCtrl",  function LanguagesCtrl($scope,$cookieStore, $rootScope, $log, Language,$translate,translate,$state){

    $rootScope.lang = {};
    
    Language.getLanguages(function(data){
        
        $rootScope.languages = data;

    });

    $scope.selectLanguage = function(language){
        $rootScope.currentLanguage = language;
        $cookieStore.remove("lan");
        $cookieStore.put("lan", $rootScope.currentLanguage);
        $translate.use(language.key).then(function(){
        	$state.reload();
        })
    }

});