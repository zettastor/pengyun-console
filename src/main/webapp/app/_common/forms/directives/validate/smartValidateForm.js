
'use strict';

angular.module('SmartAdmin.Forms').directive('smartValidateForm', function (translate) {
    return {
        restrict: 'A',
        link: function (scope, form, attributes) {
            var validateOptions = {
                rules: {},
                messages: {},
                highlight: function (element) {
                    $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
                },
                unhighlight: function (element) {
                    /*$(element).closest('.form-group').removeClass('has-error').addClass('has-success');*/ //origin
                    $(element).closest('.form-group').removeClass('has-error').removeClass('has-error');  //create by yh
                },
                errorElement: 'span',
                errorClass: 'help-block',
                errorPlacement: function (error, element) {
                    

                    if (element.parent('.input-group').length) {

                        /*error.insertAfter(element.parent());*/ //origin
                    } else {
                       /* error.insertAfter(element);*/ //origin
                    }
                    $(element).closest('.form-group').find('#roleName-error').html(translate.getWord("role.required")); //create by yh
                }
            };
            form.find('[data-smart-validate-input], [smart-validate-input]').each(function () {
                var $input = $(this), fieldName = $input.attr('name');
                validateOptions.rules[fieldName] = {};

                if ($input.data('required') != undefined) {
                    validateOptions.rules[fieldName].required = true;
                }
                if ($input.data('email') != undefined) {
                    validateOptions.rules[fieldName].email = true;
                }

                if ($input.data('maxlength') != undefined) {
                    validateOptions.rules[fieldName].maxlength = $input.data('maxlength');
                }

                if ($input.data('minlength') != undefined) {
                    validateOptions.rules[fieldName].minlength = $input.data('minlength');
                }
                if ($input.data('equalTo') != undefined) {
                    validateOptions.rules[fieldName].equalTo = $input.data('equalTo');
                }


                if($input.data('message')){
                    validateOptions.messages[fieldName] = $input.data('message');
                } else {
                    angular.forEach($input.data(), function(value, key){
                        if(key.search(/message/)== 0){
                            if(!validateOptions.messages[fieldName])
                                validateOptions.messages[fieldName] = {};

                            var messageKey = key.toLowerCase().replace(/^message/,'')
                            validateOptions.messages[fieldName][messageKey] = translate.getWord(value);
                            if(messageKey=="equalto"){
                                validateOptions.messages[fieldName]["equalTo"] = translate.getWord(value);
                            }
                        }
                    });
                }
            });

            form.validate(validateOptions);

        }
    }
});
