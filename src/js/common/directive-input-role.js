angular.module('ui.common')

/**
 * <input-role name="" ng-model="" object="" ng-required="" ng-disabled=""></input-role>
 * ng-model="" will get populated with the selected's id
 * object="" will get populated with the selected object, which looks like this:
 * {
 *     "RoleId": 896,
 *     "Description": "Assistant Manager"
 * }
 */

.directive('inputRole', function(Networks) {
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
            '        ng-options="i.RoleId as i.Description for i in items"',
            '        ng-required="ngRequired"',
            '        ng-disabled="ngDisabled"',
            '    >',
            '    </select>',
            '    <span class="select">{{object.Description}}</span>',
            '</div>'
        ].join(''),
        link: function(scope) {
            scope.items = [];

            Networks.getRolesPromise().then(function(items) {
                scope.items = items;

                scope.$watch('ngModel', function(newVal) {
                    var obj = scope.items.filter(function(item) {
                        return item.RoleId === newVal;
                    })[0];

                    scope.object = obj;
                });
            });
        }
    };
});
