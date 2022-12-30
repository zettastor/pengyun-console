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

angular.module('SmartAdmin.Layout').directive('fullScreen', function(){
	return {
		restrict: 'A',
		link: function(scope, element){
			var $body = $('body');
			var toggleFullSceen = function(e){
				if (!$body.hasClass("full-screen")) {
					$body.addClass("full-screen");
					if (document.documentElement.requestFullscreen) {
						document.documentElement.requestFullscreen();
					} else if (document.documentElement.mozRequestFullScreen) {
						document.documentElement.mozRequestFullScreen();
					} else if (document.documentElement.webkitRequestFullscreen) {
						document.documentElement.webkitRequestFullscreen();
					} else if (document.documentElement.msRequestFullscreen) {
						document.documentElement.msRequestFullscreen();
					}
				} else {
					$body.removeClass("full-screen");
					if (document.exitFullscreen) {
						document.exitFullscreen();
					} else if (document.mozCancelFullScreen) {
						document.mozCancelFullScreen();
					} else if (document.webkitExitFullscreen) {
						document.webkitExitFullscreen();
					}
				}
			};

			element.on('click', toggleFullSceen);

		}
	}
});