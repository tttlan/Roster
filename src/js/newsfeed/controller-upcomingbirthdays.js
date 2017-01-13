// Upcoming Birthdays
// -----------------------------------------------
angular.module('ui.newsFeed')
.controller('UpcomingBirthdaysCtrl', ['Widget', '$scope', '$filter', function(Widget, $scope, $filter) {
    
  $scope.loadBirthdays = function() {

      $scope.loading = true;
      $scope.error = false;
      $scope.limit = 4;

      Widget.birthdays().then(function(response) {
            
          $scope.birthdays = response.data.MemberBirthdayItemResults;

            // Filter the birthday dates here so that the orderby will work in the view.  It can't sort the dates in their raw format
          angular.forEach($scope.birthdays, function(value, key) {
              value.MemberBirthdays.Birthday = $filter('date')(value.MemberBirthdays.Birthday, 'MMM dd');
            });

          $scope.loading = false;

        }, function() {
          $scope.loading = false;
          $scope.error = true;
        });

      $scope.showAll = function() {
          $scope.limit = $scope.birthdays.length;
        };
    
    };

  $scope.loadBirthdays();

}]);
