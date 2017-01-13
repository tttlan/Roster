angular.module('ui.activity')

/*
 * <likes></likes>
 *
 */

// Directive to handle likes
// ------------------------------------------------

.directive('likes', ['Activities', function(Activities) {
  return {
      restrict: 'EA',
      replace: true,
      scope: { 
          resourceType: '@',
          resourceId: '=',
          likeCount: '=',     // Count to be updated to how many people have liked it.
          liked: '=',         // Boolean to whether the current user has liked this.
          disableLike: '@',   // remove the ability for a user to like
          button: '@'         // Boolean to whether it looks like a button or not
        },
      templateUrl: '/interface/views/activity/partials/likes.html',
      controller: function($scope, $element, $attrs) {
            
            // toggles the liked and likeCount
          function toggleLiked() {
              $scope.liked = !$scope.liked;
              $scope.likeCount = $scope.likeCount + ( $scope.liked ? 1 : -1);
            }

            // add a like if not liked
          $scope.addLike = function() {

                //Toggle without confirmation
              toggleLiked();

              return Activities.updateLike( $scope.resourceType, $scope.resourceId, $scope.liked )
                    .then(function( response ) {
                        // liked
                    }, function( response ) {
                        // like update failed
                      toggleLiked();
                    });

            };
        }
    };

}]);