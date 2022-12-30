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


angular.module('SmartAdmin.Forms').directive('bootstrapProductForm', function(){

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/_common/forms/directives/bootstrap-validation/bootstrap-product-form.tpl.html',
        link: function(scope, form){
            form.bootstrapValidator({
                feedbackIcons : {
                    valid : 'glyphicon glyphicon-ok',
                    invalid : 'glyphicon glyphicon-remove',
                    validating : 'glyphicon glyphicon-refresh'
                },
                fields : {
                    price : {
                        validators : {
                            notEmpty : {
                                message : 'The price is required'
                            },
                            numeric : {
                                message : 'The price must be a number'
                            }
                        }
                    },
                    amount : {
                        validators : {
                            notEmpty : {
                                message : 'The amount is required'
                            },
                            numeric : {
                                message : 'The amount must be a number'
                            }
                        }
                    },
                    color : {
                        validators : {
                            notEmpty : {
                                message : 'The color is required'
                            }
                        }
                    },
                    size : {
                        validators : {
                            notEmpty : {
                                message : 'The size is required'
                            }
                        }
                    }
                }
            });
        }

    }
});