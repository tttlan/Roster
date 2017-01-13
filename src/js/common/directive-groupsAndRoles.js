angular.module('ui.common')

/*
 * <fieldset groups-and-roles="scopedObj">
 *
 * scopedObj = {
 *   loaded: <<bool>>,
 *   loading: <<bool>>
 * }
 *
 */

// Directive to handle Groups and Roles
// ------------------------------------------------

//Directive that deals with grabbing all of the groups, and handling loading events
.directive('networkGroups', ['Networks','$timeout', function(Networks, $timeout) {
    
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=',
            ids: '=',
            allToggle: '=',
            nameBase: '@?'
        },
        link: function(scope, element, attrs, ctrl) {

            scope.groups = Networks.getGroups(scope.nameBase);

            if(angular.isArray(scope.ids) && scope.ids.length) {
                scope.groups.$promise.then(function() {

                    $timeout(function() {

                        scope.ngModel = scope.ids.map(function(id) {
                            return scope.groups.data.filter(function(group) {
                                return String(group.value.DistributionId) === String(id);
                            })[0];

                        }).filter(function(group) {
                            return group.label;
                        });



                    });

                });

            }

        },
        templateUrl: '/interface/views/common/partials/groups.html'
    };
}])

//Directive that deals with grabbing all of the roles, and handling loading events
.directive('networkRoles', ['Networks','$timeout', function(Networks, $timeout) {
    
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ids: '=',
            ngModel: '=',
            allToggle: '='
        },
        link: function(scope, element, attrs, ctrl) {
            scope.roles = Networks.getRoles();

            if(angular.isArray(scope.ids) && scope.ids.length) {
                scope.roles.$promise.then(function() {

                    $timeout(function() {

                        scope.ngModel = scope.ids.map(function(id) {

                            return scope.roles.data.filter(function(role) {
                                return String(role.id) === String(id);
                            })[0];

                        }).filter(function(role) {
                            return role.label;
                        });



                    });

                });

            }

        },
        templateUrl: '/interface/views/common/partials/roles.html'
    };


}]);
