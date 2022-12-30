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

angular.module('app').directive('activitiesDropdownToggle', function($log) {
    
	var link = function($scope,$element, attrs){
		var ajax_dropdown = null;

		$element.on('click',function(){

			var badge = $(this).find('.badge');
			if (badge.hasClass('bg-color-red')) {

				/*badge.removeClass('bg-color-red').text(0);*/


			}

			ajax_dropdown = $(this).next('.ajax-dropdown');

			if (!ajax_dropdown.is(':visible')) {

				ajax_dropdown.fadeIn(150);

				/*$(this).addClass('active');*/

			}
			 else {
				
				ajax_dropdown.fadeOut(150);
				
				/*$(this).removeClass('active');*/
				

			}

		})

		$(document).mouseup(function(e) {
			if (ajax_dropdown && !ajax_dropdown.is(e.target) && ajax_dropdown.has(e.target).length === 0) {
				ajax_dropdown.fadeOut(150);
				$element.removeClass('active');
				

			}
		});
	}
	
	return{
		restrict:'EA',
		link:link
	}
});