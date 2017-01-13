// Date range picker Directive

angular.module('ui.common')
.directive('dateRangePicker', [ '$compile', 'onResize', function($compile, onResize) {
    return {
        require: 'ngModel',
        scope: {
            ngModel: '='
        },
        restrict: 'A',
        link: function(scope, element, attrs, ngModel, transcludeFn) {
            var config = {};
            var input = $compile('<input type="daterange" ng-model="ngModel" />')(scope);
            element.prepend(input);
            element.addClass('date-range-picker');
        }
    };
}]);