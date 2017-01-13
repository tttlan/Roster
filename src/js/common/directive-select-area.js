angular.module('ui.common').directive('selectArea', ['Networks', function(Networks) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=',
            state: '=',
            isDisabled: '=?'
        },
        link: function(scope) {
            if (scope.state && scope.state.Value) {
                scope.areas = Networks.getAreaByState(scope.state); 
            }
            scope.$watch('state', function(newVal) {
                if(newVal.Value) {
                     scope.areas = {};
                     scope.areas.loading = true;
                     Networks.getAreaByState(newVal).then(function(res) {
                        scope.areas = res;
                    }).finally(function() {
                        scope.areas.loading = false;
                    });
                }
             });
        },
        templateUrl: '/interface/views/common/partials/select-area.html'
    };
}]);