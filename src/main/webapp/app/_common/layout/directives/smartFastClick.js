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

/**
 *
 * Description: Directive utilizes FastClick library.
 *
 *
 * FastClick is a simple, easy-to-use library for eliminating the
 * 300ms delay between a physical tap and the firing of a click event on mobile browsers.
 * FastClick doesn't attach any listeners on desktop browsers.
 * @link: https://github.com/ftlabs/fastclick
 *
 * On mobile devices 'needsclick' class is attached to <tElement>
 *
 */


'use strict';

angular.module('SmartAdmin.Layout').directive('smartFastClick', function () {
    return {
        restrict: 'A',
        compile: function (tElement, tAttributes) {
            tElement.removeAttr('smart-fast-click data-smart-fast-click');

            FastClick.attach(tElement);

            if(!FastClick.notNeeded())
                tElement.addClass('needsclick')
        }
    }
});
