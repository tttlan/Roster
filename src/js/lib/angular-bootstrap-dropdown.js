/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Based on: 0.10.0 - 2014-05-21
 * License: MIT
 */

angular.module('ui.bootstrap.dropdownToggle', [])

/*
 * dropdownToggle - Provides dropdown menu functionality in place of bootstrap js
 * @restrict class or attribute
 * @example:
   <li class="dropdown">
     <a class="dropdown-toggle">My Dropdown Menu</a>
     <ul class="dropdown-menu">
       <li ng-repeat="choice in dropChoices">
         <a ng-href="{{choice.href}}">{{choice.text}}</a>
       </li>
     </ul>
   </li>

   !!
   !! Modifed to accept an optional menu attribute.  The menu attribute specifies the parent of the dropdown menu.  
   !! If this is unspecified the dropdown menu us expected to be a child of the dropdown class
   !!
 */
 
.directive('dropdownToggle', ['$document', '$location', function ($document, $location) {
  var openElement = null,
      closeMenu   = angular.noop;
  return {
    restrict: 'CA',
    scope: {
      menu: '@',
    },
    link: function(scope, element, attrs) {
      scope.$watch('$location.path', function() { closeMenu(); });
      element.parent().bind('click', function() { closeMenu(); });
      var $menu = scope.menu ? $('.' + scope.menu) : element.parent();

      element.bind('click', function (event) {

        var elementWasOpen = (element === openElement);

        event.preventDefault();
        event.stopPropagation();

        if (!!openElement) {
          closeMenu();
        }

        if (!elementWasOpen && !element.hasClass('disabled') && !element.prop('disabled')) {
          $menu.addClass('open on-screen');
          openElement = element;
          closeMenu = function (event) {
            if (event && !$(event.target).closest($menu).length) { // if the target clicked is not a descendent of the menu
                event.preventDefault();
                event.stopPropagation();
            }
            $document.unbind('click touchstart', closeMenu);
            
            var t = (event && event.originalEvent.type === 'touchstart') ? 350 : 0; // Caclulate delay time

            setTimeout(function(){ // This timeout is added to allow for the 300ms delay that touch devices have.  Only start removing the menu after 350 to allow for this delay
              $menu.removeClass('open');
              setTimeout(function(){
                $menu.removeClass('on-screen'); // Move the element offscreen after 0.5 seconds.  If animations need to be longer than 0.3s this value needs to be increased
              }, 300);
            }, t);

            closeMenu = angular.noop;
            openElement = null;
          };
          $document.bind('click touchstart', closeMenu);
        }
      });
    }
  };
}]);