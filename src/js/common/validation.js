// Form Validation
// ------------------------------------------------

angular.module('ui.common')

.directive('validateForm', ['$timeout', '$window', function($timeout, $window) {

    return {

        controller: function($scope, $element, $attrs) {
            $scope.data = {};
            $scope.submitting = false; // TODO - removed the subbmitting and submitted states from here as we have this built into the form builder.  Submitted state is available as part of angular 1.3

            var form = $element;
            var formName = null;
            if (form[0].tagName !== 'NG-FORM' && form[0].tagName !== 'FORM') {
                form = form.parents('form, ng-form').first();
                if (form.length <= 0) {
                    form = form.find('form, ng-form').first();
                }
            }
            if (form.length) {
                formName = form.attr('name');
            }

            $scope.clearForm = function() {
            };
            $scope.resetForm = function() {

                $timeout(function() {
                    firstSubmit();
                    if($scope.submitted && $scope[formName]) {
                        $scope.submitted = false;
                        $element.removeClass('submitted');
                        $scope[formName].$setPristine();
                        $scope[formName].$setValidity();
                        $scope[formName].$setUntouched();
                    }
                });
            };

            var firstSubmit = function() {
                    $scope.submitted = true;
                    $element.addClass('submitted');
            };

            $scope.isFormValid = function(isValid) {

                var $invalids = $element.find('.ng-invalid:visible');

                isValid = (isValid === undefined) ? ($invalids.length < 1) : isValid;

                $timeout(function() {
                    if(!$scope.submitted) {
                        firstSubmit();
                    }

                    if(!isValid) {

                        // find the first error, scroll to 120px above it and focus on it.
                        var $firstError = $invalids.eq(0);

                        $('body, html').animate({
                            scrollTop: $firstError.offset().top - 120
                        }, 750, function() {
                            $firstError.focus();
                        });
                    }
                });

                return isValid;
            };
        }
    };
}])

// Compares input to be greater than selected input
.directive('laterThan', [function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            function setValidity( firstInput, secondInput ) {

                var isValid = !firstInput ? true : ( new Date(firstInput).getTime() <= new Date(secondInput).getTime() );

                ctrl.$setValidity('laterThan', isValid);

            }

            scope.$watch('data.' + attrs.laterThan, function(val) {

                setValidity( val, ctrl.$modelValue );

            });


            ctrl.$parsers.unshift(function(input) {

                setValidity(scope.data[attrs.laterThan], input);

                return input;

            });

        }
    };
}])


// If any letters are inputted, they will be cleared
.directive('onlyNumbers', function() {
    return {
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {

            if (!ctrl) { return; }

            ctrl.$parsers.push(function(inputValue) {
                var digits = inputValue.split('').filter(function(s) {
                    return (!isNaN(s) && s !== ' ');
                }).join('');
                ctrl.$viewValue = digits;
                ctrl.$render();
                return digits;
            });
        }
    };
})

// If any letters are inputted, they will be cleared
.directive('eitherRequired', [function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ngModel) {

            var input = '';
            var otherInput = '';

            var getValidity = function() {

                var isInvalid = (!input || !input.length) && (!otherInput || !otherInput.length);
                return !isInvalid;
            };


            //For DOM -> model validation
            //ngModel.$parsers.unshift(function(value) {
            ngModel.$validators.eitherRequired = function(modelValue) {

                input = modelValue;
                return getValidity();
            };

            //For model -> DOM validation
            ngModel.$formatters.unshift(function(value) {

                input = value;
                ngModel.$validate();

                return value;
            });

            scope.$watch(attrs.eitherRequired, function(val) {

                otherInput = val;
                ngModel.$validate();
            });

        }
    };
}])

// Ensure that a date is in the future
// -----------------------------------------

.directive('validateDateFuture', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {

            if (!ngModel) { return; }

            if (attrs.validateDateFuture !== 'true') { return; }

            ngModel.$validators.validateDateFuture = function(modelValue) {

                if (moment().diff(modelValue, 'days') > 0) {
                    return false;
                } else {
                    return true;
                }
            };
        }
    };
})

// Ensure that a date is in the past
// ------------------------------------------------

.directive('validateDatePast', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {

            if (!ngModel) { return; }

            if (attrs.validateDatePast !== 'true') { return; }

            ngModel.$validators.validateDatePast = function(modelValue) {

                if (moment().diff(modelValue, 'days') < 0) {
                    return false;
                } else {
                    return true;
                }
            };
        }
    };
})

/*
 * The validate-date-after, validate-date-before and validate-is-equal directives only play nice with the form builder
 * due to the reference of 'scope.form' within the directives
 *
 */

// Ensure that the end date is after the start date
// ------------------------------------------------

.directive('validateDateAfter', function() {
    return {
        require: 'ngModel',
        scope: false,
        restrict: 'A',
        link: function(scope, element, attrs, ngModel) {

            if (!ngModel) { return; }

            if (attrs.validateDateAfter === '') { return; }

            ngModel.$validators.validateDateAfter = function(modelValue, viewValue) {

                if (viewValue && scope.form[attrs.validateDateAfter].$viewValue) {

                    // If the end date is after the start date
                    if (moment(modelValue).isAfter(scope.form[attrs.validateDateAfter].$modelValue, 'minute') || moment(modelValue).isSame(scope.form[attrs.validateDateAfter].$modelValue, 'minute')) {
                        return true;
                    } else { // It's not, fail validation
                        return false;
                    }
                } else {
                    return true; // If no values are present to validate, it can't be invalid
                }
            };

            // If the date that we are checking against changes (the date we are trying to be before) or the current date then
            // re-apply the date to trigger validation again.  This brings date / time fields into sync with each other
            scope.$watchCollection(function() {
                return [ngModel.$modelValue, scope.form[attrs.validateDateAfter]];
            }, function(val) {
                if (val[0] && val[1].$modelValue) {
                    scope.form[attrs.validateDateAfter].$validate();
                    if (scope.form[attrs.validateDateAfter + '2']) {
                        scope.form[attrs.validateDateAfter + '2'].$validate();
                    }
                }
            });
        }
    };
})

// Ensure that the start date is after the end date
// ------------------------------------------------

.directive('validateDateBefore', function() {
    return {
        require: 'ngModel',
        scope: false,
        restrict: 'A',
        link: function(scope, element, attrs, ngModel) {

            if (!ngModel) { return; }

            if (attrs.validateDateBefore === '') { return; }

            ngModel.$validators.validateDateBefore = function(modelValue, viewValue) {

                if (viewValue && scope.form[attrs.validateDateBefore].$viewValue) {

                    // If the end date is after the start date
                    if (moment(modelValue).isBefore(scope.form[attrs.validateDateBefore].$modelValue, 'minute') || moment(modelValue).isSame(scope.form[attrs.validateDateBefore].$modelValue, 'minute')) {
                        return true;
                    } else {  // It's not, fail validation
                        return false;
                    }
                } else {
                    return true; // If no values are present to validate, it can't be invalid
                }
            };

            // If the date that we are checking against changes (the date we are trying to be before) or the current date then
            // re-apply the date to trigger validation again.  This brings date / time fields into sync with each other
            scope.$watchCollection(function() {
                return [ngModel.$viewValue, scope.form[attrs.validateDateBefore]];
            }, function(val) {
                if (val[0] && val[1].$viewValue) {
                    scope.form[attrs.validateDateBefore].$validate();
                    if (scope.form[attrs.validateDateBefore + '2']) {
                        scope.form[attrs.validateDateBefore + '2'].$validate();
                    }
                }
            });
        }
    };
})

/*
  Check equality with a passed in value.
*/

.directive('validateIsEqual', function() {
    return {
        require: 'ngModel',
        scope: false,
        restrict: 'A',
        link: function(scope, element, attrs, ngModel) {

            if (!ngModel) { return; }

            if (attrs.validateIsEqual === '' || attrs.validateIsEqual.indexOf('..') !== -1) { return; } // .. means that an interpolated value has not yet been polulated, wait until it has
            
            var referencedValue;
            
            scope.$watch(attrs.validateIsEqual, function(value) {
                if (value) {
                    referencedValue = value;
                }
            });            

            ngModel.$validators.validateIsEqual = function(modelValue, viewValue) {
            
                if (viewValue && referencedValue) {
            
                    // If the value of this model equals the value of the one that was passed in
                    if (viewValue === referencedValue) {
                        return true;
                    } else {  // It's not, fail validation
                        return false;
                    }
                } else {
                    return true; // If no values are present to validate, it can't be invalid
                }
            };
        }
    };
})


// Ensure that the year age selected is greater or equal than age setting
// ------------------------------------------------

.directive('validateDateGreater', ['$parse', function($parse) {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {

            var model = {};
            var datePickerValue = null;

            function validateDateGreater(modelValue) {
                if(!modelValue) {
                    return;
                }
                let currentDate = moment();
                let selectedDate = moment(modelValue);
                if( moment(currentDate).diff(selectedDate, 'days') > 0) {
                    ngModel.$setValidity('validateDateGreater', true);
                } else {
                    ngModel.$setValidity('validateDateGreater', false);
                }
                return modelValue;
            }

            ngModel.$parsers.unshift(function(modelValue) {
                var minimumAge = $parse(attrs.validateDateGreater)(scope);
                model = ngModel;
                return validateDateGreater(modelValue);
            });

            scope.$watch(scope.minimumAge, function(newValue, oldValue) {
                return validateDateGreater(newValue, datePickerValue);
            });
        }
    };
}]);
