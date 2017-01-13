angular.module('ui.common')

/**
 * <input-store-group name="" ng-model="" object="" ng-required="" ng-disabled=""></input-store-group>
 * ng-model="" will get populated with the selected's id
 * object="" will get populated with the selected object, which looks like this:
 * {
 *     "NetworkGroupId": 1,
 *     "GroupName": "Camberwell",
 *     "Type": "s"
 * }
 */

.directive('inputStoreGroup', function(Networks) {
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
            '        ng-options="i.NetworkGroupId as i.GroupName for i in items"',
            '        ng-required="ngRequired"',
            '        ng-disabled="ngDisabled"',
            '    >',
            '    </select>',
            '    <span class="select">{{object.GroupName}}</span>',
            '</div>'
        ].join(''),
        link: function(scope) {
            scope.items = [];

            Networks.getGroupsPromise().then(function(items) {
                scope.items = items;

                scope.$watch('ngModel', function(newVal) {
                    var obj = scope.items.filter(function(item) {
                        return item.NetworkGroupId === newVal;
                    })[0];

                    scope.object = obj;
                });
            });
        }
    };
})

