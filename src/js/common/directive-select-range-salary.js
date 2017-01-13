angular.module('ui.common').directive('selectRangeSalary', ['Networks', function(Networks) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=',
            ngRequired: '=?',
            name: '@?',
            type:'=',
            fromValue: '=?',
        },
        link: function(scope) {
            scope.ranges = Networks.getSalaryRangesByType(scope.type);
            scope.$watch('type', function(newVal) {
                if(newVal) {
                     scope.ranges.data = [];
                     scope.ranges.loading = true;
                     Networks.getSalaryRangesByType(newVal).then(function(res) {
                        scope.ranges = res;
                    }).finally(function() {
                        scope.ranges.loading = false;
                    });
                }
             });

            scope.shouldShow = function(option) {
              if(scope.fromValue) {
                return option.RecOrder > scope.fromValue;
              } else{
                return option.RecOrder > -1;
              } 
            };
        },
        templateUrl: '/interface/views/common/partials/select-range-salary.html'
    };
}]);