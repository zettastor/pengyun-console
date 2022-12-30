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

angular.module('app.chat').factory('ChatApi', function ($q, $rootScope, User, $http, APP_CONFIG) {
    var dfd = $q.defer();
    var _user;
    var ChatSrv = {
        initialized: dfd.promise,
        users: [],
        messages: [],
        statuses: ['Online', 'Busy', 'Away', 'Log Off'],
        status: 'Online',
        setUser: function (user) {
            if (ChatSrv.users.indexOf(_user) != -1)
                ChatSrv.users.splice(ChatSrv.users.indexOf(_user), 1);
            _user = user;
            ChatSrv.users.push(_user);
        },
        sendMessage: function (text) {
            var message = {
                user: _user,
                body: text,
                date: new Date()
            };
            this.messages.push(message);
        }
    };


    $http.get(APP_CONFIG.apiRootUrl + '/chat.json').then(function(res){
        ChatSrv.messages = res.data.messages;
        ChatSrv.users = res.data.users;
        dfd.resolve();
    });

    ChatSrv.initialized.then(function () {

        User.initialized.then(function () {
            ChatSrv.setUser({
                username: User.username,
                picture: User.picture,
                status: ChatSrv.status
            });
        });

        $rootScope.$watch(function () {
            return User.username
        }, function (name, oldName) {
            if (name != oldName) {
                ChatSrv.setUser({
                    username: User.username,
                    picture: User.picture,
                    status: ChatSrv.status
                });
            }
        });
    });


    return ChatSrv;

});