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

(function ($) {

    $.fn.smartCollapseToggle = function () {

        return this.each(function () {

            var $body = $('body');
            var $this = $(this);

            // only if not  'menu-on-top'
            if ($body.hasClass('menu-on-top')) {


            } else {

                $body.hasClass('mobile-view-activated')

                // toggle open
                $this.toggleClass('open');

                // for minified menu collapse only second level
                if ($body.hasClass('minified')) {
                    if ($this.closest('nav ul ul').length) {
                        $this.find('>a .collapse-sign .fa').toggleClass(' fa-angle-down   fa-angle-right ');
                        $this.find('ul:first').slideToggle(appConfig.menu_speed || 200);
                    }
                } else {
                    // toggle expand item
                    $this.find('>a .collapse-sign .fa').toggleClass(' fa-angle-down   fa-angle-right ');
                    $this.find('ul:first').slideToggle(appConfig.menu_speed || 200);
                }
            }
        });
    };
})(jQuery);

angular.module('SmartAdmin.Layout').directive('smartMenu', function ($state, $rootScope) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var $body = $('body');

            var $collapsible = element.find('li[data-menu-collapse]');

            var bindEvents = function(){
                $collapsible.each(function (idx, li) {
                    var $li = $(li);
                    $li
                        .on('click', '>a', function (e) {

                            // collapse all open siblings
                            $li.siblings('.open').smartCollapseToggle();

                            // toggle element
                            $li.smartCollapseToggle();

                            // add active marker to collapsed element if it has active childs
                            if (!$li.hasClass('open') && $li.find('li.active').length > 0) {
                                $li.addClass('active')
                            }

                            e.preventDefault();
                        })
                        .find('>a').append('<b class="collapse-sign"><span class="fa  fa-angle-right "></span></b>');

                    // initialization toggle
                    if ($li.find('li.active').length) {
                        $li.smartCollapseToggle();
                        $li.find('li.active').parents('li').addClass('active');
                    }
                });
            }
            bindEvents();


            // click on route link
            element.on('click', 'a[data-ui-sref]', function (e) {
                // collapse all siblings to element parents and remove active markers
                $(this)
                    .parents('li').addClass('active')
                    .each(function () {
                        $(this).siblings('li.open').smartCollapseToggle();
                        $(this).siblings('li').removeClass('active')
                    });

                if ($body.hasClass('mobile-view-activated')) {
                    $rootScope.$broadcast('requestToggleMenu');
                }
            });


            scope.$on('$smartLayoutMenuOnTop', function (event, menuOnTop) {
                if (menuOnTop) {
                    $collapsible.filter('.open').smartCollapseToggle();
                }
            });
        }
    }
});