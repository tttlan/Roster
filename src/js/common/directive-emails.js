// Emails directive
// ------------------------------------------------

angular.module('ui.common')

/*
    <emails max="4" min="1" ng-model="emails"></emails>
*/

.directive('emails', ['$timeout', function($timeout) {

    var ind = 0;

    return {
        restrict: 'E',
        replace: true,
        scope: {
            emails: '=ngModel',
            customRemove: '&'
        },
        require: 'ngModel',
        templateUrl: '/interface/views/common/partials/emails.html',
        link: function(scope, element, attrs) {

            var max = attrs.max ? parseInt(attrs.max) : 5,
                min = attrs.min ? parseInt(attrs.min) : 0;

            // setup default values
            scope.emails = scope.emails || [{
                value: '',
                isPrimary: true,
                isPublic: true
            }];

            function canAdd() {
                return scope.emails.length < max;
            }

            function canRemove() {
                return scope.emails.length > min;
            }

            function setAddAndRemove() {
                scope.emailData.allowRemove = canRemove();
                scope.emailData.allowAdd = canAdd();
            }

            // Builds out email object to be used within directive
            scope.emailData = {
                primary: null,
                allowAdd: canAdd(),
                allowRemove: canRemove(),
                min: min,
                max: max,
                id: ind++, // you need to iterate up an id for labels and id with 'for' attr linking
                $add: function() {

                    if (scope.emailData.allowAdd) {

                        if (!angular.isArray(scope.emails)) {
                            scope.emails = [];
                        }

                        scope.emails.push({
                            value: null,
                            isPrimary: scope.emails.length === 0 ? true : false, // Set this to true for the first email address
                            isPublic: true
                        });

                        setAddAndRemove();
                    }
                },
                $remove: function(index) {
                    if (scope.emailData.allowRemove) {
                        scope.emails.splice(index, 1);

                        setAddAndRemove();
                    }

                }
            };

            scope.onRemove = function(index) {
                if (attrs.customRemove) {
                    scope.customRemove({
                        arg1: scope.emails,
                        arg2: index
                    });
                } else {
                    scope.emailData.$remove(index);
                }
            };

            function getPrimary() {

                var index;

                angular.forEach(scope.emails, function(number, idx) {
                    if (number.isPrimary) {
                        index = idx;
                    }
                });

                return index; // If there is no primary value,
            }

            scope.setPrimary = function(ind) {
                scope.emails = scope.emails.map(function(email) {
                    if (email.isPrimary) {
                        email.isPrimary = false;
                    }
                    return email;
                });
                scope.emails[ind].isPrimary = true;
            };

            function getLen(arr) {
                if (arr) {
                    return arr.length;
                }
            }

            scope.$watch('emails', function(newVal, oldVal) {

                if (newVal) {

                    validate(newVal);
                    scope.emailData.primary = getPrimary(); // Loop through the numbers to figure out which one is the primary

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

                    return value.filter(function(email) {
                        return email.isPrimary;
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
                if (scope.$emailForm && scope.$emailForm.emailModel) {
                    for (var rule in validationRules) {
                        var isValid = validationRules[rule](value);
                        scope.$emailForm.emailModel.$setValidity(rule, isValid);
                    }
                }
                return undefined;
            }

            $timeout(function() {
                validate(scope.emails);
            });
        }
    };
}]);
