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

angular.module('SmartAdmin.Forms').directive('smartReviewForm', function (formsCommon, lazyScript) {
    return {
        restrict: 'E',
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
                        review : {
                            required : true,
                            minlength : 20
                        },
                        quality : {
                            required : true
                        },
                        reliability : {
                            required : true
                        },
                        overall : {
                            required : true
                        }
                    },

                    // Messages for form validation
                    messages : {
                        name : {
                            required : 'Please enter your name'
                        },
                        email : {
                            required : 'Please enter your email address',
                            email : '<i class="fa fa-warning"></i><strong>Please enter a VALID email addres</strong>'
                        },
                        review : {
                            required : 'Please enter your review'
                        },
                        quality : {
                            required : 'Please rate quality of the product'
                        },
                        reliability : {
                            required : 'Please rate reliability of the product'
                        },
                        overall : {
                            required : 'Please rate the product'
                        }
                    }

                }, formsCommon.validateOptions));
            });
        }
    }
});