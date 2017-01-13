angular.module('ui.common')

/**
 * <input-salutation name="" ng-model="" object="" ng-required="" ng-disabled=""></input-salutation>
 * ng-model="" will get populated with the selected's id
 * object="" will get populated with the selected's object, which looks like this:
 * {
 *     Id: 1,
 *     Name: "Mr"
 * }
 */

.directive('inputSalutation', function(Networks) {
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
            '        ng-options="i.Id as i.Name for i in items"',
            '        ng-required="ngRequired"',
            '        ng-disabled="ngDisabled"',
            '    >',
            '    </select>',
            '    <span class="select">{{object.Name}}</span>',
            '</div>'
        ].join(''),
        link: function(scope) {
            scope.items = [];

            Networks.getSalutations().then(function(items) {
                scope.items = items;
                
                if(scope.ngModel === 0){
                    scope.ngModel = null;
                }
                
                scope.$watch('ngModel', function(newVal) {
                    var obj = scope.items.filter(function(item) {
                        return item.Id === newVal;
                    })[0];

                    scope.object = obj;
                });
            });
        }
    };
});
