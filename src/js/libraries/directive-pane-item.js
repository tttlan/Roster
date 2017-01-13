angular.module('ui.libraries')

/*
 * <pane-item></pane-item>
 *
 */

// Directive to handle panes
// ------------------------------------------------

.directive('paneItem', ['$timeout', 'PanesFactory', function($timeout, PanesFactory) {
  return {
      restrict: 'E',
      replace: 'element',
      templateUrl: '/interface/views/libraries/partials/pane-item.html',
      controller: function($scope, $element, $attrs) {
            
            // Trigger to open new pane.
            // Broadcasts to Factory which is picked up by <pane>
          $scope.openPane = function(item, $index) {
              $scope.$parent.pane.activeItemId = item.Id;

                // Builds object required to describe what the requests pane is
              var obj = {
                  thisIndex: $attrs.index,
                  paneIndex: $attrs.paneindex, 
                  pane: {
                      Type: item.Type,
                      Name: item.Name,
                      Id: item.Id,
                      Items: []
                    }
                };

              PanesFactory.addPane(obj);

            };

        }
    };

}]);