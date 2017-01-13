angular.module('ui.common')

/**
 * <input-Single-Number name="" ng-model="" ng-required="" ng-disabled=""></input-SingleNumber>
 * ng-model="" will get populated with the single number input
 */

.directive('inputSingleNumber', function() {
    return {
        restrict: 'E',
        scope: {
            name: '@?',
            ngDisabled: '=?'
        },
        require: '^ngModel',
        replace: true,
        template: [
            '<input type="text" name="{{::name}}"',
            ' class="tfnNumber"',
            ' ng-pattern="/^[0-9]+$/"',
            ' minlength="1" maxlength="1" ng-disabled="ngDisabled">'
        ].join(''),
        link: (scope, element, attrs, ctrl) => {
            ctrl.$viewChangeListeners.push(() => {
                if (ctrl.$viewValue) {
                    element.next('input').focus();
                }
            });
        }
    };
});