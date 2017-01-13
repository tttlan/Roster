angular.module('ui.common')


// Directive for Attachments Loader
// 
// Passes in attachmentCount, and other attachments,
// consolidates them all, and makes any API calls to
// get any additional attachments if the attachmentCount
// is above 0. 
//
// ------------------------------------------------

.directive('attachments', ['Activities', '$timeout', function(Activities, $timeout) {
  return {
      restrict: 'E',
      templateUrl: '/interface/views/common/partials/attachments.html',
      replace: true,
      scope: {
          resourceId: '=resourceId',
          resourceType: '@',
          count: '=',
          attachments: '=',
          medias: '=',
          isInline: '@'
        },
      controller: function($scope, $element, $attrs) {

          $scope.gettingAttachments = false;

            // Get attachments
          var getAttachments = function() {
                
              if ($scope.resourceId && !$scope.gettingAttachments) {

                  $scope.gettingAttachments = true;

                  Activities.getAttachments($scope.resourceType, $scope.resourceId, 1 , $scope.type).then(function(res) {

                      $timeout(function() {
                          $scope.gettingAttachments = false;
                          $scope.attachments = angular.extend( [].concat($scope.attachments, res) );
                        });
                    });
                }
            };

            
          $scope.$watch('count', function(newVal) {
              if(newVal > 0 ) {
                  getAttachments();
                }
            });

        }
    };
}]);