angular.module('ui.recruit')

//Directive Store Groups for onboarding
.directive('inputStoreGroupOnboarding', function(Onboarding) {
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

                Onboarding.getStoreGourps().then(function(items) {
                    scope.items = items;

                    scope.$watch('ngModel', function(newVal) {
                        if(scope.items !== null){
                            var obj = scope.items.filter(function(item) {
                                return item.NetworkGroupId === newVal;
                            })[0];

                            scope.object = obj;
                        }
                    });
                });
            }
        };
});