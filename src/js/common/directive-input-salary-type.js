angular.module('ui.common')

/**
 * <input-salary-type name="" ng-model="" object="" ng-required="" ng-disabled=""></input-salary-type>
 * ng-model="" will get populated with the selected's id
 * object="" will get populated with the selected's object, which looks like this:
 * {
 *     Description: "Casual",
 *     IsPermanent: false,
 *     LookupUrl: null,
 *     MiniumHours: 0,
 *     PaymentType: "wage",
 *     SalaryTypeId: 0
 * }
 */

.directive('inputSalaryType', function(Networks) {
    return {
        restrict: 'E',
        scope: {
            ngModel: '=',
            name: '@?',
            ngRequired: '=?',
            ngDisabled: '=?',
            object: '=?',
            checkSalaryTypeDefault: '&?'
        },
        template: [
            '<div class="select-wrapper">',
            '    <select',
            '        id="{{::name}}"',
            '        name="{{::name}}"',
            '        ng-model="ngModel"',
            '        ng-options="i.SalaryTypeSummary.SalaryTypeId as i.SalaryTypeSummary.Description for i in items"',
            '        ng-required="ngRequired"',
            '        ng-disabled="ngDisabled"',
            '    >',
            '    </select>',
            '    <span class="select">{{object.Description}}</span>',
            '</div>'
        ].join(''),
        link: function(scope) {
            scope.items = [];

            Networks.getSalaryTypes().then(function(items) {
                scope.items = items;

                scope.$watch('ngModel', function(newVal) {
                    var obj = scope.items.filter(function(item) {
                        return item.SalaryTypeSummary.SalaryTypeId === newVal;
                    })[0];

                    scope.object = obj && obj.SalaryTypeSummary;
                    scope.changeSalaryType(scope.object ? scope.object.Description : null);
                });
            });
            
            scope.changeSalaryType = function(Description) {
                return scope.checkSalaryTypeDefault()(Description);
            };
        }
    };
});
