angular.module('ui.common.directives')
/*
 *
 * Select box styling
 * On select box change, update the span element in the select box group to the currently selected value.
 *
 */
.directive('select', function() {
    return {
        restrict: 'E',
        scope: false,
        link: function(scope, element, attrs) {
            element.on('change', function() {
                scope.updateSelect();
            });
            scope.$watch(function() {
                scope.updateSelect();
            });
            scope.updateSelect = function() {
                var selectedText = element.find('option:selected').text();
                element.next('.select').text(selectedText);
            };
        }
    };
});
