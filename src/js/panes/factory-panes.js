
angular.module('ui.common.panes')


// Panes Factory
// ----------------------------------------

.factory('PanesFactory', ['$rootScope', '$timeout',
    function($rootScope, $timeout) {

      var _ADD_PANE_ = '_ADD_PANE_';
      var _CLOSE_PANE_ = '_CLOSE_PANE_';

      var Panes = {

        // publish pane open notification
      addPane: function(item) {
          $rootScope.$broadcast(_ADD_PANE_, {item: item});
        },

        //subscribe to pane data notification
      onAddPane: function($scope, handler) {
          $scope.$on(_ADD_PANE_, function(event, args) {
              handler(args.item);
            });
        },

        // publish pane close notification
      closePane: function(index) {
          $rootScope.$broadcast(_CLOSE_PANE_, {index: index});
        },

        //subscribe to pane close notification
      onClosePane: function($scope, handler) {
          $scope.$on(_CLOSE_PANE_, function(event, args) {
              handler(args.index);
            });
        }

    };

      return Panes;
    
    }]);