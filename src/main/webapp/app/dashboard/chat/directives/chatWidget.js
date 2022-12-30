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

angular.module('app.chat').directive('chatWidget', function (ChatApi) {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: 'app/dashboard/chat/directives/chat-widget.tpl.html',
        scope: {},
        link: function (scope, element) {
            scope.newMessage = '';

            scope.sendMessage = function () {
                ChatApi.sendMessage(scope.newMessage);
                scope.newMessage = '';
            };

            scope.messageTo = function(user){
                scope.newMessage += (user.username + ', ');
            };

            ChatApi.initialized.then(function () {
                scope.chatMessages = ChatApi.messages;
            });
            scope.$watch(function () {
                return ChatApi.messages.length
            }, function (count) {
                if (count){
                    var $body = $('.chat-body', element);
                    $body.animate({scrollTop: $body[0].scrollHeight});
                }
            })
        }
    }
});