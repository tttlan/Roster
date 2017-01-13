
angular.module('ui.common.panes')
/*
 * <pane></pane>
 *
 */

// Directive to handle single pane blocks
// ------------------------------------------------

.directive('pane', ['$timeout', 'PanesFactory', '$compile', '$http', '$templateCache', '$q', 
    function($timeout, PanesFactory, $compile, $http, $templateCache, $q) {
    
    // Keeps reference to all tempaltes available to panes
      var TEMPLATES = {
      Folder: '<pane-type-folder></pane-type-folder>',
      File: '<pane-type-file></pane-type-file>'
    };

      return {
      restrict: 'E',
      replace: 'element',
      scope: { 
          pane: '=',
          paneindex: '='
        },
      templateUrl: '/interface/views/panes/partials/pane.html',
      controller: function($scope, $element, $attrs) {
            
          var tmpl = $scope.pane.Type;
            
            // load in the appropriate directive from the template object above
          var html = $compile( TEMPLATES[tmpl] )($scope);
          $element.html(html);

        }
    };

    }]);