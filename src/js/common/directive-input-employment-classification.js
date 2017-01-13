angular.module('ui.common')

/**
 * <input-employment-type name="" ng-model="" object="" ng-required="" ng-disabled=""></input-employment-type>
 * ng-model="" will get populated with the selected's id
 * object="" will get populated with the selected's object, which looks like this:
 * {
 *     Label: "Full Time",
 *     Value: 73
 * }
 */

.directive('inputEmploymentClassifications', function(Networks) {
    return {
        restrict: 'E',
        scope: {
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
            '        ng-options="i.Value as i.Label for i in items"',
            '        ng-required="ngRequired"',
            '        ng-disabled="ngDisabled"',
            '    >',
            '    </select>',
            '    <span class="select">{{object.Label}}</span>',
            '</div>'
        ].join(''),
        link: function(scope) {
            scope.items = [];

            Networks.getEmploymentClassification().then(function(items) {
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
