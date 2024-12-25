
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
