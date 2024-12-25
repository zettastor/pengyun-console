
'use strict';

angular.module('SmartAdmin.Layout').service('showMessage', function() {
   
	this.show = function (scope,level,message) {
		scope.level=level;
		scope.message=message;
		scope.show=true;
		
	}
}).factory('focus', function ($timeout, $window) {  
	  return function (id) {  
		  $timeout(function () {  
		   var element = $window.document.getElementById(id);  
			if (element) element.focus();  
		  });  
	  };  
 });
