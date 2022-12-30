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

'use strict'

angular.module('SmartAdmin.Forms').directive('smartSelect2', function (lazyScript) {
    return {
        restrict: 'A',
        compile: function (element, attributes) {
            element.hide().removeAttr('smart-select2 data-smart-select2');
        	lazyScript.register('build/vendor.ui.js').then(function(){
	            element.show().select2();
        	})
        }
    }
});