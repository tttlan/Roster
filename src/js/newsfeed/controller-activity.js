
// Newsfeed
// ----------------------------------------

angular.module('ui.newsFeed')


// Single activity page
// ------------------------------------------------

.controller('dashboardActivityCtrl', ['$scope', '$routeParams', 'Activities', 'Members', '$window', '$timeout', 'feedItemFactory', 
    function($scope, $routeParams, Activities, Members, $window, $timeout, feedItemFactory) {
    
      var activityId = $routeParams.id;
      $scope.posts = [];

    // GET Activity
    // ------------------------------------------------
      Activities.getActivity(activityId).then(function(response) {
      $scope.post = feedItemFactory.$init(response.data.items[0]);
      $scope.userCan = response.data.permissions;
    });

    // Block of shame
    // -----------------------------------------------

    //Load in current Member
      Members.me().then(function(response) {
      $timeout(function() {
          $scope.currentUser = response.data;
        });
    });

    }]);