angular.module('ui.common')

.directive('questionItem', [function(config) {
    return {
        restrict: 'E',
        scope:{
            item: '=',
            questionPrefix: '@',
            index: '@',
            group: '='
        },
        link: function(scope, element, attrs) {
          scope.ChangeValue = function(item, value) {
              var index = scope.group.questions.indexOf(item);
              if (item.DisplayOptionalOnYesNo === value) {
                  $('#sub' + scope.group.tag.name + index).show();
              } else if (item.DisplayOptionalOnYesNo === 'all') {
                  $('#sub' + scope.group.tag.name + index).show();
              }
              else {
                  $('#sub' + scope.group.tag.name + index).hide();
              }
          };
        },
        templateUrl: '/interface/views/common/partials/question-item.html',
    };
}]);


