angular.module('ui.activity')

// Pane Feed Item
// ----------------------------------------

.directive('feedItem', ['$timeout', function($timeout) {

  return {
      restrict: 'EA',
      templateUrl: '/interface/views/activity/partials/feed-item.html',
      replace: true
    };
    
}]);