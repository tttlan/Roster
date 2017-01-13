angular.module('ui.common')

/**
 * <input-pay-rate name="" ng-model="" object="" ng-required="" ng-disabled=""></input-pay-rate>
 * ng-model="" will get populated with the selected's id
 * object="" will get populated with the selected's object, which looks like this:
 * {
 *     "$id": "2",
 *     "AgeBased": false,
 *     "Value": 1399,
 *     "Label": "<span class=optTitle></span><span class=optEmpType></span><span class=optRate>$0</span></span>"
 * }
 */

.directive('selectBoxPayRate', function(Networks) {
    return {
        restrict: 'E',
        scope: {
            memberId: '=',
            ngModel: '=',
            name: '@?',
            ngRequired: '=?',
            ngDisabled: '=?',
            object: '=?'
        },
        template: [
            '<div class="select-wrapper">',
            '    <select',
            '        id="{{::name}}"',
            '        name="{{::name}}"',
            '        ng-model="ngModel"',
            '        <option value="" disabled selected>Select pay rate</option>',
            '        ng-options="i.SalaryRate.Value as i.SalaryRate.Description for i in items"',
            '        ng-required="ngRequired"',
            '        ng-disabled="ngDisabled"',
            '    >',
            '    </select>',
            '    <span class="select">{{object.Description}}</span>',
            '</div>'
        ].join(''),
        link: function(scope) {

            scope.items = [];

            Networks.getRolePayRates(scope.memberId).then(function(items) {
                scope.items = items;

                scope.$watch('ngModel', function(newVal) {
                    var obj = scope.items.filter(function(item) {
                        return item.SalaryRate.Value === newVal;
                    })[0];

                    scope.object = obj && obj.SalaryRate;
                });
            });
        }
    };
});
