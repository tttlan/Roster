angular.module('ui.recruit')

    //TODO: this directive is duplicated it may be removed, pls don't use it
    // Directive to handle autocomplete groups
    // ------------------------------------------------

    .directive('autocompleteGroups', ['$timeout', function ($timeout) {

        return {
            restrict: 'E',
            replace: true,
            scope: {
                ngModel: '=',
                ids: '=',
                allToggle: '=',
                ngRequired: '=',
                data: '='
            },
            link: function (scope, element, attrs, ctrl) {
                scope.groups = {
                    data: scope.data.map(function (item) {
                        let group = {};
                        group.Id = item.KeyValue;
                        group.label = item.Label;
                        return group;
                    })
                };

                if (angular.isArray(scope.ids) && scope.ids.length) {
                    let arrResult = [];
                    scope.ids.forEach(function (id) {
                        scope.groups.data.forEach(function (item) {
                            let group = {};
                            if(!scope.ngModel.length){
                                if (id === item.Id ) {
                                    group = item;
                                    arrResult.push(group);
                                }
                            }else if (id === item.Id && scope.ngModel.indexOf(item) === -1) {
                                group = item;
                                arrResult.push(group);
                            }
                        })
                    });
                    scope.ngModel = arrResult;
                }
            },
            templateUrl: '/interface/views/recruit/partials/autocomplete-groups.html'
        };
    }]);