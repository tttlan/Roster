// Upcoming Events
// -----------------------------------------------
angular.module('ui.newsFeed')
.controller('UpcomingEventsCtrl', ['Widget', '$scope', function(Widget, $scope) {
    
  $scope.loadEvents = function() {

      $scope.loading = true;
      $scope.error = false;

      Widget.events(5).then(function(response) {
          $scope.events = response.data.EventList;
          $scope.loading = false;

        }, function() {
          $scope.loading = false;
          $scope.error = true;
        });
    
    };

  $scope.loadEvents();

}]);