angular.module('ui.common')

/*
 * <div shift-overflow>...</div>
 *
 */

// Checks if it needs to add oveflow to a shift, and adds a class.
// ------------------------------------------------


.directive('shiftOverflow', ['$timeout', function($timeout) {

  return {
      restrict: 'A',
      link: function(scope, ele, attrs) {
            
          function checkIfOverflowIsNeeded() {
              $timeout(function() {
                    
                  var $this = angular.element(ele);
                    
                  if( $this.innerHeight() < $this.find('.shift__content').innerHeight() ) {
                      $this.addClass('shift--compact');
                    }

                });
            }

            // watched for additional information to return and we can reassess the height of the container
          var listener = scope.$watch('shift.StaffMemberID', function(newVal) {
              if(newVal) {
                  checkIfOverflowIsNeeded();
                  listener();
                }
            });


        }
    };
}]);