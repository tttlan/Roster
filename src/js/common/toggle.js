// Autogrow Directive
// ----------------------------------------

angular.module('ui.common.directives')

/* ToggleSet
 *
 * Creates a toggle list to toggle on and off.
 *
 * <ul toggle-set>
 *  <li><a toggleActive="callback('param')">Toggle 1</a></li>
 *  <li><a toggleActive="callback('param')">Toggle 2</a></li>
 *  <li><a toggleActive="callback('param')">Toggle 3</a></li>
 * </ul>
 *
 */
 .directive('toggleSet', function() {

   return {
      restrict: 'A',
      controller: function() {
        
        var len = 0;

        this.selected = 0;

        this.setSelected = function(ind) {
          this.selected = ind;
        };

        this.getInd = function() {

          len = len + 1;
          
          return len - 1;
        
        };

      }
    };

 })

.directive('toggleActive', [ '$parse', function($parse) {
  return {
    require: '^toggleSet',
    restrict: 'A',
    scope: {
      callback: '&toggleActive'
    },
    link: function(scope, element, attr, ctrl) {

      var ind = ctrl.getInd(),
        $icon = angular.element('<i class="icon--down"></i>'),
        $ele = angular.element(element);


      if(ind !== ctrl.selected) {
        $icon.addClass('is-visually-hidden');
      }
      
      $ele.append($icon);

      function toggleClasses() {
        //If it's not selected, then select
        if(ind !== ctrl.selected) {

          $icon.attr('class', 'icon--down');
          
          ctrl.setSelected(ind);

        //otherwise toggle
        } else {

          //toggle the active to descending toggle
          var cssClass = ( $icon.attr('class') === 'icon--up') ? 'icon--down' : 'icon--up';
          $icon.attr('class', cssClass);

        }
      }

      $ele.on('click', function() {

        toggleClasses();

        scope.$apply(function() {
          if(typeof scope.callback === 'function') {
              scope.callback();
            }
        });

        return false;

      });
    

      //watch for deselect
      scope.$watch(function() {
        return ctrl.selected;
      }, function(newVal, oldVal) {
          
        if(newVal !== oldVal && newVal !== ind) {
            $icon.attr('class', 'icon--up is-visually-hidden');
          }

      }, true);

      scope.$on('$destroy', function() {
        $ele.off('click');
      });
        
    }
  };
}]);

