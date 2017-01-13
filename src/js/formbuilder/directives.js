angular.module('ui.formbuilder')
.directive('form', function() {
    return {
        require: 'form',
        restrict: 'E',
        link: function(scope, elem, attrs, form) {
            form.$submit = function() {
                form.$setSubmitted();
                scope.$eval(attrs.ngSubmit);
            };
        }
    };
})
.directive('formBuilder', ['formBuilderService', '$compile', '$q', '$HTTPCache', '$timeout',
    function(formBuilderService, $compile, $q, $HTTPCache, $timeout) {


/*

Heyo! There is a lot of data models that are passed back and forth around here.
This is a run down of what exactly where they are from and what their purpose is...

$scope.form (ngModel Data)
    Created by the view when building up the form in the view.
    Is our source of truth for current data and validation states.

$scope.parentData
    Is passed into the formBuilder by an outside scope, and passes in what it needs to uniquely bind to the form
    for example we load in custom states for showing and hiding areas of the form

this.modelData
    Server data that gives us the current users data to put into the $scope.form
    when it first loads. We update the data to send up to the server, if it fails we
    will fall back to it's earlier state.

$scope.formData
    Data from server that has our form elements, and their types and default values


ToDo: (Ashin)
    - It would be nice to allow for modelData to be bound to the form ngModel data within the template
    something along the lines of: [[ FormEle:modelData.parent.element ]]
    This will keep the element bound, and allow the modelData to be in any layout
    without us needing to decorate and undecorate the data in every service

    - Select data currently only passes the value of the option, instead of the whole object
    this causes us to store the data in such a way that we can retrieve the label that is associated
    with the value. We should change the select type to equal the entire Id and Value props,
    which will remove this double handling of data in the view. Then the only need to manipulate data
    will be at 2 points, on data Get and Save functions.

    - Move heavy lifting of data from this directive into a model, then apply the model to the scope.

*/

    var placeholderReg = /\[\[([A-Z1-9]+)\]\]/gi;

      function injectData(futureData, template) {

      return futureData.then(function(data) {

          var temp = template.replace(placeholderReg, function(placeholder, name) {

                // var t0 = performance.now();

                var len = data.elements.length,
                    ind = -1;

              for(len;len--;) {
                  if(data.elements[len].name === name) {
                      ind = len;
                      break;
                    }
                }

                return ind > -1 ? '<form-element element="formData.elements[' + ind + ']" form="form" parent-data="parentData" parent-cycle="$cycle" form-data="formData"></form-element>' : '<span class="error">No form element found: ' + name + '.</span>';

            });

            return temp;

        });
    }

    //Get an elements name, if it matches a dataModel then fill it up
    function populateElement(element, modelData) {

        // var t0 = performance.now();
        if (modelData[element.name] !== null && modelData[element.name] !== undefined) { // If there is modeldata for the element, place it on the object
            element.val = angular.copy(modelData[element.name]);
        } else if (element.val === null || element.val === undefined) { // Else if element.val is either null or undefined when passed into the FB, make it an empty string so we can template everything up nicely
            element.val = '';
        }

        if (element.type === 'file') {

            for (var i = 0; i < element.val.length; i++) {
                //Special manipulation for FileStore if it exists
                element.val[i] = element.val[i] ? {
                        'name': element.val[i].FileName,
                        'size': element.val[i].FileSize,
                        'ext': element.val[i].FileName.split('.').pop(),
                        'id': element.val[i].FileStoreId
                    } : {};
            }
        }
        return element;
    }

    //Loop through form elements and children, and invoke func
      function walkElements(elements, func) {
      if(typeof func !== 'function') { return; }
      var len = elements.length;

      for(len; len--;) {

            var element = elements[len];

            func(element);

          if(element.children) {
              walkElements(element.children, func);
            }
        }
    }


    var cycleModule = formBuilderService.cycleModule;
    var $cycle = cycleModule.$cycle, $cycleLoop = cycleModule.$cycleLoop,
        $functionCall = cycleModule.$functionCall;
    return {
        $cycleModule: cycleModule,
        scope: {
            sendData: '&submit',
            errorHandler: '=', // Pass in a function for custom form validation
            dataFn: '&modelData', // Pass in a function that returns a promise
            parentData: '=', // TODO: Is there a neater way for this
            submitEvent: '@?',
            beforeSend: '&beforeSubmit',
            formDataPromise: '=?', // Optional form data.  Note that attrs.formDataUrl is used to reference a json file, this is used to reference a fn returning json
            afterSend: '&afterSubmit',
            isSubmitting: '=?',
            isUploading: '=?',
            isLoaded: '=?'
        },
        restrict: 'E',
        replace:true,
        templateUrl: '/interface/views/formbuilder/form-builder.html',
        controller: function($scope, $element, $attrs) {
            $scope.isLoaded = false;
            var that = this, promiseList;
            $scope.$cycle = function(srcContext) {
                $cycle({ source: srcContext, formContext: {
                    $scope: $scope,
                    $element: $element,
                    $attrs: $attrs,
                    $formData: $scope.formData,
                    $parentData: $scope.parentData,
                    $form: $scope.form,
                    $modelData: that.modelData,
                    $formName: $attrs.formId
                }});
            };

            $scope.formName = $attrs.formId;

            // Start loading the form, all other components will be triggered from here
            loadForm();

            // Update the model with values from form fields,
            // this should only be done if the post was successful.
            function updateModel() {
                walkElements($scope.formData.elements, function(ele) {
                    if (ele.val !== undefined && ele.val !== null && that.modelData !== undefined) {
                        // Some elements are fieldsets / groups and don't have a
                        // val property / aren't a form field
                        that.modelData[ele.name] = ele.val;
                    }
                });
            }

            // Try and call the sendData scope function, if it exists
          function callSendData(newData) {

                //grab the passed in function
                var sendDataFn = $scope.sendData();

                // If a function has been passed to the form builder to submit to
                if (typeof $scope.sendData() === 'function') {

                    // Send back the old model data in case we need to compare changes between old and new
                    $scope.sendData()(newData).then(function(res) {

                        // update the model with new Values
                        updateModel();

                        return res;

                    }, function(res) {

                        return res;

                    }).finally(function(res) {
                        $scope.form.$submitting = false;
                        $scope.isSubmitting = false;
                        if (typeof $scope.afterSend() === 'function') {
                            $scope.afterSend()(res);
                        }
                    });

                }
            }

            // Initialise loading of the formbuilder form
            function loadForm() {

                promiseList = []; // Reset this in case this is being called for the 2nd time

                var formData = (typeof $scope.formDataPromise === 'object') ? $scope.formDataPromise : $attrs.formDataUrl;

                // This timeout is necessary in the event that the form builder has an id passed to it with an expression.  This will ensure the expression evaluates before the form is created.
                $timeout(function() {

                    promiseList.push(formBuilderService.form($attrs.formId, formData)); // Get the JSON data describing the form elements

                    if ($scope.dataFn()) {
                        promiseList.push($scope.dataFn()().then(function(res) {
                            return res.data;
                        }, function(res) {
                            // This means there was an error retrieving the model data for the form.
                            // Return false so we can test for this and display a different template
                            return false;
                        }));
                    }

                    that.formData = $q.all(promiseList).then(function(res) {
                        //
                        return buildForm(res);
                    });
                });
            }

            function buildForm(res) {

                var formData = res[0]; // res[0] will always be the formData ie. the form fields

                if ($scope.dataFn()) { // If we are editing the form, res[1] will be the data to edit

                    that.isModel = true;

                    if (res[1]) { // If the model data was retrieved sucessfully

                        that.modelData = res[1];

                        walkElements(formData.elements, function(element) {
                            populateElement(element, that.modelData);
                        });
                    }
                } else {

                    that.isModel = false; // There is no initial model being loaded in
                }

                // If we have passed in select data
                if ( $scope.parentData ) {

                    if ( $scope.parentData.selectData ) {

                        // Loop through the select data
                        angular.forEach($scope.parentData.selectData, function(value, key) {
                            // And then all the form elements
                            walkElements(formData.elements, function(element) {
                                if (element.name === key) { // If the names match, add the select data to the element
                                    element.options = value;
                                }
                            });
                        });
                    }
                    $scope.$watch(function() {
                        return $scope.parentData.selectData;
                    }, function(val) {
                        angular.forEach($scope.parentData.selectData, function(value, key) {
                            // And then all the form elements
                            walkElements(formData.elements, function(element) {
                                if (element.name === key) { // If the names match, add the select data to the element
                                    element.options = value;
                                }
                            });
                        });

                    }, true);
                }

                $scope.formData = formData;
                // to remove flicker on popup we need to a other way

                $scope.isLoaded = true;
                return formData;
            }
        

            //Loops through $scope.form and builds an object to send to server
            function buildModelData() {
                var newModel = {},
                    keys = getKeysFromObj($scope.form);

                keys.map(function(key) {
                    newModel[key] = angular.copy($scope.form[key].$modelValue);
                    if($scope.form[key].$isFile) {
                        newModel[key] = $scope.form[key].$fileIds;
                    }
                    // form binding for file uploader is not working, it always clear value on file input
                    // after upload a attachment, there are no way to fix it
                    // submit file model will be gotten dependently from form data
                    // this is a work around for profile note,
                    // also take care incase reset form, populate data, and form model
                });

                return angular.extend({}, that.modelData, newModel);
            }

            // Turn object into array of keys,
            // then filter out all methods starting with $
          function getKeysFromObj(obj) {
                
              if( !angular.isObject(obj) ) { return []; }

              return Object.keys(obj).filter(function(key) {
                  return key.charAt(0) !== '$';
                });
            }

            $scope.resetForm = function(fieldArray) {

                // If there's no modelData then we aren't editing content,
                // we're creating new content so there's nothing to reset
                if (!that.modelData) { return; }

                // Loop through form inputs
              getKeysFromObj($scope.form).map(function(key) {
                    // get the ngModel of the input
                    var ele = $scope.form[key],
                        originalVal,
                        newVal;

                    //if the input actual has a set value
                  if(ele && typeof ele.$setViewValue === 'function') {
                      originalVal = that.modelData[key];

                        // If the original value was ever actually set
                        newVal = angular.isDefined(originalVal) ? angular.copy(originalVal): null ;

                        ele.$setViewValue(newVal);
                        ele.$render();
                    }
                });
            };

            $scope.submit = function(isValid) {

                if (!isValid) {
                    if ($scope.errorHandler) { // If there's an error handler passed in, let it do the work
                        if ($scope.errorHandler($element) === false) { // If the error handler decides the form is invalid
                            return false;
                        }
                    } else { // The form is definitely invalid
                        return false;
                    }
                }

                // This is used to trigger loading indicators and anything else in a 'submitting' state
                $scope.form.$submitting = true;
                $scope.isSubmitting = true;

                // Populate the model with values from the form
                var newData = buildModelData();

                if (typeof $scope.beforeSend() === 'function') { // If a function has been passed to the form builder to submit to

                    var beforeSendReturnValue = $scope.beforeSend()({ new: newData, old: that.modelData });

                    //If a promise has been returned, lets wait for it
                  if(beforeSendReturnValue && typeof beforeSendReturnValue.then === 'function') {

                        beforeSendReturnValue.then(function(res) {

                            //If the promise has returned an object,
                            // it is now our new modelData, and what we are sending to the server
                            if(res) {
                                that.modelData = res;
                                callSendData(res);
                            } else {
                                callSendData(newData);
                            }

                        }, function() {
                            $scope.form.$submitting = false;
                            $scope.isSubmitting = false;
                        });

                    } else {
                        callSendData(newData);
                    }

                } else {
                    callSendData(newData);
                }

            };
            if ($scope.submitEvent) {                           // submit form from outsite directive
                $scope.$on($scope.submitEvent, function() {
                    //$scope.submit($scope.isFormValid());
                    $scope.form.$submit();
                });
            }
            $scope.reloadForm = function() {

                $element.html($compile('<loading-placeholder></loading-placeholder>')($scope));
                loadForm();
            };

        },
        link: function(scope, element, attrs, ctrl) {

            var templateUrl = attrs.template || '/interface/views/formbuilder/form-default.html',
                hasCustomTemplate = !!attrs.template,
                promiseList;

            //incase file we will have a callback for uploading
            scope.$watch(function() {
                return scope.form.isUploading;
            }, function(newValue, oldValue) {
                if(newValue !== oldValue) {
                    scope.isUploading = scope.form.isUploading;
                }
            });
            // Watch this property to see if is populated.
            // Once it is, we can wait for it's promises to resolve and then template up our form
            scope.$watch('formData', function() {

                if (typeof scope.formData === 'object') {

                    promiseList = [];

                    promiseList.push($HTTPCache.getTemplate(templateUrl)); // Retrieve either the custom or standard template
                    promiseList.push(ctrl.formData); // Wait for other promises in the controller to finish, these are the form elements and modeldata

                    $q.all(promiseList).then(function(res) {

                        var template = res[0];

                        if (!ctrl.modelData && ctrl.isModel) { // If the modeldata failed to load, load in a button that can be clicked to attempt to reload the form

                            element.html($compile('<reload action="reloadForm()"></reload>')(scope));

                        } else if (hasCustomTemplate) {

                            injectData(ctrl.formData, template).then(function(html) {
                                element.append(angular.element($compile(html)(scope)));
                            });

                        } else { // Else use the default formbuilder template

                            element.append($compile(template)(scope));
                        }
                    });
                }
            });
        }
    };
}])

.directive('formElement', [ 'formBuilderService', '$compile', '$HTTPCache',
        function(formBuilderService, $compile, $HTTPCache) {

    return {
        restrict: 'E',
        replace: true,
        scope: {
            element: '=',
            class: '@',
            formData: '=',
            parentData: '=?',
            form: '=',
            parentCycle: '=?',
        },
        controller: ['$scope', function(scope, element, attrs) {
            scope.submitOnEnter = function(form) {
                form.$submit();
            };
            scope.$cycle = function() {
                scope.parentCycle({
                    $scope: scope,
                    $element: scope.element,
                    $htmlElement: element,
                    $attrs: attrs
                });
            };
        }],
        link: function(scope, element, attrs) {

            if(scope.element) {
                var elementData = scope.element;
                var templateUrl = formBuilderService.types[ elementData.type ].template;

                if (scope.class) { // If a class has been passed from the parent template
                    if (scope.element.class) { //If a class has been passed from the JSON
                        scope.element.class += ' ' + scope.class;
                    } else { // scope.element.class is undefined, define it
                        scope.element.class = scope.class;
                    }
                }

                if (scope.element.validation && scope.element.validation.pattern) {
                    scope.element.validation.pattern = new RegExp(scope.element.validation.pattern);
                }

                // Translate rich text config names to arrays of options
                if (scope.element.type === 'richtext') {
                    if (scope.element.richTextConfig === 'simple') {
                        scope.element.richTextConfig = [['bold', 'italics', 'underline'],['ul', 'ol']];
                    } else {
                        scope.element.richTextConfig = ''; // This will default to all options available
                    }
                }

                // Add the form name so we can use it to generate id's
                scope.element.formName = scope.formData.name;

                if( angular.isDefined(templateUrl)) {
                    
                    $HTTPCache.getTemplate(templateUrl).then(function(data) {

                        // http://stackoverflow.com/questions/19882506/form-validation-and-fields-added-with-compile
                        var result = angular.element(data).appendTo(element);
                        result = angular.element(result).unwrap();
                        $compile(result)(scope);
                    });

                }

            }
        }
    };

}])


.directive('errorBuilder', function() {

      return {
        replace:'true',
        restrict: 'E',
        templateUrl: '/interface/views/formbuilder/partials/form-error-builder.html',
        scope: false,
        controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
            $scope.ifCustomMessage = function(text) {
                return angular.isString(text);
            };
        }]
    };

});
