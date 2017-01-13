
// Directives
// ----------------------------------------


angular.module('ui.common.directives')


 /* Online/offline notification
 *
 * Displays to the user when their internet connection is lost
 *
 * <offline></offline>
 * 
 */
 .directive('offline', ['$timeout', '$window', function($timeout, $window) {

   return {
       restrict: 'E',
       replace: true,
       template: '<div class="notification notification--offline" ng-hide="online"><div class="notification__icon"><i class="icon--wifi"></i></div><p class="notification__message">No internet connection</p></div>',
       controller: function($scope, $element, $attrs) {

          $scope.online = true;

          $window.addEventListener('offline', function(e) {
              $timeout(function() {
                  $scope.online = false;
                });
            });

          $window.addEventListener('online', function(e) {
              $timeout(function() {
                  $scope.online = true;
                });
            });

        }
     };
 }]);