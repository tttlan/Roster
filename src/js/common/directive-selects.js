angular.module('ui.common')

// Directives to handle custom select fields
// ------------------------------------------------

//Directive that deals with grabbing all of the groups, and handling loading events
.directive('selectGroup', ['Networks', '$timeout', function(Networks, $timeout) {
    
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '='
        },
        link: function(scope) {
            
            scope.groups = Networks.getGroups();

            scope.groups.$promise.then(function() {

                // make groups into a simple format
                scope.groups.data = Networks.formatGroups(scope.groups.data, true);

            });

        },
        templateUrl: '/interface/views/common/partials/select-group.html'
    };

}])

//Directive that deals with grabbing all of the roles, and handling loading events
.directive('selectRole', ['Networks', '$timeout', function(Networks, $timeout) {
    
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=',
            fromSet: '=?',
            excludes: '=?'
        },
        link: function(scope) {
            if (_.isUndefined(scope.fromSet)) {
                scope.roles = Networks.getRoles();
            }
            else {
                //get scope from set with value
                scope.roles = { loading: false };
                scope.roles.data = scope.fromSet.map(function(item) {
                    return {
                        id: item.Value,
                        label: item.Label
                    };
                });
            }
            if(scope.excludes && _.isArray(scope.excludes)) {
                scope.roles.data = scope.roles.data.filter(function(item) {
                    return scope.excludes.indexOf(item.id) < 0 ;
                });
            }
        },
        templateUrl: '/interface/views/common/partials/select-role.html'
    };

}])


// Select with all Countries
.directive('selectCountry', ['Networks', function(Networks) {
    
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '='
        },
        link: function(scope, element, attrs) {
            
            attrs.$observe('ngDisabled', function(val) {
                scope.isDisabled = (val === 'true' || val === true) ? true : false;
            });
            scope.countries = Networks.getCountries();
        },
        templateUrl: '/interface/views/common/partials/select-country.html'
    };

}])

.directive('selectState', ['Networks', 'Profile', function(Networks, Profile) {
    
  return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=',
            countryId: '=?',
            isDisabled: '=?',
            nameBase: '@?',
            format: '=?'
        },
        link: function(scope) {
            scope.states = scope.countryId ? Profile.getAddressDetails({countryId : scope.countryId}, true) : Networks.getStates(scope.nameBase, scope.format); 
            scope.$watch('countryId', function(newVal) {
                if(newVal) {
                     scope.states = [];
                     scope.states.loading = true;
                     Profile.getAddressDetails({countryId : newVal}, true).then(function(res) {
                        scope.states = res;
                    }).finally(function() {
                        scope.states.loading = false;
                    });
                }
             });
        },
        templateUrl: '/interface/views/common/partials/select-state.html'
    };

}])
.directive('selectSalaryCurrency', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '='
        },
        link: function(scope) {
            scope.currencys = {
                data: [
                    {Value: "AUD", Label: "AUD"},
                    {Value: "NZD", Label: "NZD"}
                ],
                loaded: true,
                loading: false
            };
            if (!scope.ngModel.Value) {
                scope.ngModel = scope.currencys.data[0];
            }
        },
        templateUrl: '/interface/views/common/partials/select-salary-currency.html'
    };
});
