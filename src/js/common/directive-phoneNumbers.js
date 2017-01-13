// Phone Numbers directive
// ------------------------------------------------

angular.module('ui.common')

/*
    <phone-numbers max="4" min="1" ng-model="phones"></phone-numbers>
*/

.directive('phoneNumbers', ['$timeout', function($timeout) {

    var ind = 0;

    return {
        restrict: 'E',
        replace: true,
        scope: {
            phoneNumbers: '=ngModel',
            name: '@',
            customRemove: '&'
        },
        require: 'ngModel',
        templateUrl: '/interface/views/common/partials/phone-numbers.html',
        link: function(scope, element, attrs) {

            var max = attrs.max ? parseInt(attrs.max) : 5,
                min = attrs.min ? parseInt(attrs.min) : 0;

            // setup default values if no model is passed in
            scope.phoneNumbers = scope.phoneNumbers || [{
                value: '',
                isPrimary: true,
                isPublic: true
            }];

            function canAdd() {
                return scope.phoneNumbers.length < max;
            }

            function canRemove() {
                return scope.phoneNumbers.length > min;
            }

            function setAddAndRemove() {
                scope.phone.allowRemove = canRemove();
                scope.phone.allowAdd = canAdd();
            }

            // Builds out phone object to be used within directive
            // This object contains data for all phone numbers, scope.phoneNumbers contains the actual phone number data
            scope.phone = {
                primary: null,
                allowAdd: canAdd(),
                allowRemove: canRemove(),
                id: ind++,
                min: min,
                max: max,
                $add: function() {

                    if (scope.phone.allowAdd) {

                        if (!angular.isArray(scope.phoneNumbers)) {
                            scope.phoneNumbers = [];
                        }

                        scope.phoneNumbers.push({
                            value: null,
                            isPrimary: scope.phoneNumbers.length === 0 ? true : false, // Set this to true for the first phone number
                            isPublic: true
                        });

                        setAddAndRemove();
                    }
                },
                $remove: function(index) {

                    if (scope.phone.allowRemove) {
                        scope.phoneNumbers.splice(index, 1);

                        setAddAndRemove();
                    }
                }
            };

            scope.onRemove = function(index) {
                if (attrs.customRemove) {
                    scope.customRemove({
                        arg1: scope.phoneNumbers,
                        arg2: index
                    });
                } else {
                    scope.phone.$remove(index);
                }
            };

            function getPrimary() {

                var index;

                angular.forEach(scope.phoneNumbers, function(number, idx) {
                    if (number.isPrimary) {
                        index = idx;
                    }
                });

                return index;
            }

            // Update the model data with the primary phone number when an ng change is fired in the view
            scope.setPrimary = function(ind) {
                scope.phoneNumbers = scope.phoneNumbers.map(function(number) {
                    if (number.isPrimary) {
                        number.isPrimary = false;
                    }
                    return number;
                });
                scope.phoneNumbers[ind].isPrimary = true;
            };

            function getLen(arr) {
                if (arr) {
                    return arr.length;
                }
            }

            scope.$watch('phoneNumbers', function(newVal, oldVal) {

                if (newVal) {

                    validate(newVal);
                    scope.phone.primary = getPrimary(); // Loop through the numbers to figure out which one is the primary

                    if (getLen(newVal) !== getLen(oldVal)) {
                        setAddAndRemove();
                    }
                }

            }, true);

            // Validation of ngModel
            var validationRules = {
                hasPrimary: function(value) {

                    if (!angular.isArray(value)) {
                        return false;
                    }

                    return value.filter(function(phone) {
                        return phone.isPrimary;
                    }).length > 0;

                },
                overMin: function(value) {

                    if (!angular.isArray(value)) {
                        return false;
                    }

                    return value.length >= min;

                },
                underMax: function(value) {

                    if (!angular.isArray(value)) {
                        return false;
                    }

                    return value.length <= max;
                }
            };

            //Runs through the validationRules and applys them to the ngModel
            function validate(value) {

                if (scope.$phoneForm && scope.$phoneForm.phoneModel) {
                    for (var rule in validationRules) {
                        var isValid = validationRules[rule](value);

                        scope.$phoneForm.phoneModel.$setValidity(rule, isValid);
                    }
                }
                return undefined;
            }

            $timeout(function() {
                validate(scope.phoneNumbers);
            });
        }
    };
}]);
