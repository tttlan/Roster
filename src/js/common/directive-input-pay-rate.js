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

.directive('inputPayRate', function(Networks) {
    return {
        restrict: 'E',
        scope: {
            memberId: '=',
            ngModel: '=',
            name: '@?',
            ngRequired: '=?',
            ngDisabled: '=?',
            object: '=?',
            index: '@?'
        },
        template: [
            '<div class="radio-list" style="height: 120px;">',
            '    <p class="form__label">Pay rate</p>',
            '    <div class="field__radio" ng-repeat="i in items track by i.SalaryRate.Value">',
            '        <input type="radio"',
            '            id="pay-rate-{{::i.SalaryRate.Value}}_{{indexValue}}"',
            '            name="{{::name}}_{{indexValue}}"',
            '            ng-model="$parent.ngModel"',
            '            ng-required="isRequired"',
            '            ng-disabled="ngDisabled"',
            '            value="{{i.SalaryRate.Value}}"',
            '        >',
            '        <label for="pay-rate-{{i.SalaryRate.Value}}_{{indexValue}}"></label>',
            '        <label for="pay-rate-{{i.SalaryRate.Value}}_{{indexValue}}"',
            '            class="form__label"',
            '            style="display: inline-table"',
            '            ng-bind-html="i.SalaryRate.Label"></label>',
            '    </div>',
            '</div>'
        ].join(''),
        link: function(scope) {

            scope.items = [];
            scope.indexValue = scope.index ? scope.index : null;
            
            scope.isRequired = scope.ngRequired;
            
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
