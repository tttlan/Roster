
// Directives
// ----------------------------------------


angular.module('ui.common.directives')


 /* Notification handlers
 *
 * Handles and displays notifications from the app or server
 * display-time is how many MS is takes for the error to disappear. 
 *
 * <notifications display-time="10000"></notifications>
 * 
 */
 .directive('notifications', ['$notify', '$timeout', function($notify, $timeout) {

   return {
      scope: true,
      transclude: true,
      restrict: 'E',
      replace: true,
      templateUrl: '/interface/views/common/partials/notifications.html',
      link: function($scope, $element, $attrs) {
            
          $scope.$hideNotifaction = function(ind) {

              $scope.$apply(function() {
                  $scope.notifications[ind].visible = false;
                });
              
            };
                        
            //
          $scope.$timeouts = {
              list: [],
              clear: function() {
                
                  for (var i=0; i < this.list.length; i++) {
                      clearTimeout( this.list[i] );
                    }
                
                  this.list = [];
                }
            };

          $scope.notifications = [];

          var notifyCallBackRef = $notify.setCallback(function(msg) {
                
              if(!msg) {
                    
                    //If we should clear
                  $scope.$timeouts.clear();

                } else {
                    
                  if (msg.visible === undefined) { // If nothing has been passed in, notifications show by default.  Server.js notifications are set to be invisible by default
                      msg.visible = true;
                    }

                    // Async Eval added to fix digest bug in uploader :(
                  $scope.$evalAsync(function() {

                        //Add an msg
                      $scope.notifications.push({
                          type: msg.type,
                          icon: msg.icon && msg.icon !== "" ? msg.icon : msg.type, // if user don't input an icon, use msg.Type
                          message: msg.message,
                          visible: msg.visible
                        });

                      var ind = $scope.notifications.length - 1;

                      $scope.$timeouts.list.push($timeout(function() {
                      
                          $scope.$hideNotifaction(ind);

                        }, $attrs.displayTime || 10000));

                    });

                }

            });

          $scope.$on('$destroy', function() {
              $scope.$timeouts.clear();
            });

        }
    };
 }]);
