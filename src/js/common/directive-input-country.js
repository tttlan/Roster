angular.module('ui.common')

/**
 * <input-country ng-model="" object="" ng-disabled=""></input-country>
 * ng-model="" will get populated with the selected's id
 * object="" will get populated with the selected object, which looks like this:
 * {
 *     "Value": 2,
 *     "Label": "Albania"
 * }
 */

.directive('inputCountry', function(Networks) {
    return {
        restrict: 'E',
        scope: {
            ngModel: '=',
            ngDisabled: '=?',
            object: '=?',
            required: '=?'
        },
        template: [
            '<div class="select-wrapper">',
            '    <select',
            '        name="country"',
            '        ng-model="ngModel"',
            '        ng-options="i.Value as i.Label for i in items"',
            '        ng-disabled="ngDisabled"',
            '        ng-required="required"',
            '    >',
            '        <option value="">Please select a Country</option>',
            '    </select>',
            '    <span class="select">{{object.Label}}</span>',
            '</div>'
        ].join(''),
        link: function(scope) {
            scope.items = [];

            Networks.getCountriesPromise().then(function(items) {
                scope.items = items;

                scope.$watch('ngModel', function(newVal) {
                    var obj = scope.items.filter(function(item) {
                        return item.Value === newVal;
                    })[0];

                    scope.object = obj;
                });
            });
        }
    };
});
