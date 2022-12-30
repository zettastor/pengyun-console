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

angular.module('SmartAdmin.Forms').directive('smartCommentForm', function (formsCommon, lazyScript) {
    return {
        restrict: 'A',
        link: function (scope, form) {
            lazyScript.register('build/vendor.ui.js').then(function(){
                form.validate(angular.extend({
                    // Rules for form validation
                    rules : {
                        name : {
                            required : true
                        },
                        email : {
                            required : true,
                            email : true
                        },
                        url : {
                            url : true
                        },
                        comment : {
                            required : true
                        }
                    },

                    // Messages for form validation
                    messages : {
                        name : {
                            required : 'Enter your name',
                        },
                        email : {
                            required : 'Enter your email address',
                            email : 'Enter a VALID email'
                        },
                        url : {
                            email : 'Enter a VALID url'
                        },
                        comment : {
                            required : 'Please enter your comment'
                        }
                    },

                    // Ajax form submition
                    submitHandler : function() {
                        form.ajaxSubmit({
                            success : function() {
                                form.addClass('submited');
                            }
                        });
                    }

                }, formsCommon.validateOptions));
            });

        }
    }
});
