angular.module('ui.formbuilder')

//Service to store Form Builder data, and get and set data
.service('formBuilderService', ['$http', function($http) {

    //currently local
    var serverURL = './forms.json', // Default form if none is passed into the url attribute of the form-builder directive
        formElementsPath = '/interface/views/formbuilder/partials/';
    var $$functions = [];
    function cycleModule() {
        var that = this;
        this.$addFunction= function(f) {
            $$functions.push(f);
        };
        this.$cycle = function(context) {
            that.$cycleLoop($$functions, context);
        };
        this.$cycleLoop = function(fs, context) { // custom loop list here 
            for (var i = 0; i < fs.length; i++) {
                that.$functionCall(fs[i], context);
            }
        };
        this.$functionCall = function(f, context) { // custom function parameter here
            f(context);
        };
    }
    var cycleInstance = new cycleModule();
    return {
        cycleModule: cycleInstance,
        types:{
            'input': {
                value : 'Textfield',
                template: formElementsPath + 'form-element--input.html'
            },
            'email': {
                value : 'eMail',
                template: formElementsPath + 'form-element--email.html'
            },
            'phone': {
                value: 'phone',
                template: formElementsPath + 'form-element--phone.html'
            },
            'url': {
                value : 'url',
                template: formElementsPath + 'form-element--url.html'
            },
            'password': {
                value : 'Password',
                template: formElementsPath + 'form-element--password.html'
            },
            'radio': {
                value : 'Radio Buttons',
                template: formElementsPath + 'form-element--radio.html'
            },
            'radio-list': {
                value : 'Radio List',
                template: formElementsPath + 'form-element--radio-list.html'
            },
            'select': {
                value : 'Dropdown List',
                template: formElementsPath + 'form-element--select.html'
            },
            'date': {
                value : 'Date',
                template: formElementsPath + 'form-element--date.html'
            },
            'time': {
                value : 'Time',
                template: formElementsPath + 'form-element--time.html'
            },
            'date-time': {
                value: 'Date / Time',
                template: formElementsPath + 'form-element--date-time.html'
            },
            'number': {
                value: 'Number',
                template: formElementsPath + 'form-element--number.html'
            },
            'textarea': {
                value : 'Text Area',
                template: formElementsPath + 'form-element--textarea.html'
            },
            'richtext': {
                value : 'Rich text',
                template: formElementsPath + 'form-element--richtext.html'
            },
            'checkbox': {
                value : 'Checkbox',
                template: formElementsPath + 'form-element--checkbox.html'
            },
            'checkbox-list': {
                value: 'Checkbox',
                template: formElementsPath + 'form-element--checkbox-list.html'
            },
            'toggle': {
                value : 'Toggle',
                template: formElementsPath + 'form-element--toggle.html'
            },
            'hidden': {
                value : 'Hidden',
                template: formElementsPath + 'form-element--hidden.html'
            },
            'reset-button': {
                value : 'Reset Form button',
                template: formElementsPath + 'form-element--reset-button.html'
            },
            'submit-button': {
                value : 'Submit button',
                template: formElementsPath + 'form-element--button.html'
            },
            'button': {
                value : 'Button',
                template: formElementsPath + 'form-element--button.html'
            },
            'link-button': {
                value : 'Link button',
                template: formElementsPath + 'form-element--link-button.html'
            },
            'form-fields':{
                value: 'Form Fields',
                template: formElementsPath + 'form-element--column-group.html'
            },
            'fieldset': {
                value: 'Fieldset Group',
                template: formElementsPath + 'form-element--fieldset.html'
            },
            'button-group': {
                value: 'Button Group',
                template: formElementsPath + 'form-element--button-group.html'
            },
            'tag-manager': {
                value: 'Tag Manager',
                template: formElementsPath + 'form-element--tag-manager.html'
            },
            'groups': {
                value: 'Groups',
                template: formElementsPath + 'form-element--groups.html'
            },
            'roles': {
                value: 'Roles',
                template: formElementsPath + 'form-element--roles.html'
            },
            'select-group': {
                value: 'Select a Group',
                template: formElementsPath + 'form-element--select-group.html'
            },
            'select-role': {
                value: 'Select a Role',
                template: formElementsPath + 'form-element--select-role.html'
            },
            'select-state': {
                value: 'Select a State',
                template: formElementsPath + 'form-element--select-state.html'
            },
            'select-country': {
                value: 'Select a Country',
                template: formElementsPath + 'form-element--select-country.html'
            },
            'file': {
                value: 'File input',
                template: formElementsPath + 'form-element--file.html'
            },
            'phones': {
                value: 'Phone numbers',
                template: formElementsPath + 'form-element--phones.html'
            },
            'emails': {
                value: 'Emails',
                template: formElementsPath + 'form-element--emails.html'
            },
            'autocomplete': {
                value: 'Autocomplete input',
                template: formElementsPath + 'form-element--autocomplete.html'
            },
            'hr': {
                value: 'Separator',
                template: formElementsPath + 'form-element--separator.html'
            }
        },
        form: function(id, formData) {

            formData = formData || serverURL;

            // Multiple forms may have been returned in the form data, loop through them to get the correct one
            function getForm(res) {
                
                var requestedForm = {};

                //loop through json obj, and get a form with the correct ID
                angular.forEach(res, function(form) {
                    if (form.id === id) {
                        requestedForm = form;
                    }
                });
                
                return requestedForm;                
            }

            if (typeof formData === 'object' && typeof formData.then === 'function') { // If the formData is a promise obj with a then function

                return formData.then(function(res) {
                    return getForm(res);
                });
                
            } else { // Else assume the form data is a string containing a url, make a call and return the data

                return $http.get(formData).then(function(response) {
                    return getForm(response.data);
                });                
            }
        },
        forms: function(url) {

            url = url || serverURL;

            return $http.get(url).then(function(response) {
                //return all forms
                return response.data;
            });
        },
        buildInput: function() {
            return 'this should probably do something';
        }
    };
}]);
