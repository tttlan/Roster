
// Single Group controller
// ----------------------------------------

angular.module('ui.newsFeed')


// Blog Post Manage Controller
// ------------------------------------------------

.controller('dashboardGroupCtrl', ['$scope', '$routeParams', 'Groups', '$timeout', '$modal', '$rootScope',
    function($scope, $routeParams, Groups, $timeout, $modal, $rootScope) {
    
      $scope.groupId = $routeParams.id; 
      $scope.groupBio = null;
      $scope.myGroups = [];
      $scope.groupLimit = 4;

      $scope.showAllGroups = function() {
      $scope.groupLimit = $scope.myGroups.length;
    };

    // Get this group info
      Groups.get($scope.groupId).then(function(response) {
      $scope.groupBio = response.data;
      $rootScope.title = $scope.groupBio.GroupName !== null ? $scope.groupBio.GroupName : '';
    }, function() {
      console.log('error');
    });

    // Get first page to preview Members
      Groups.getMembers(1, 12, '', '', '', $scope.groupId).then(function(res) {
      var pagination = angular.fromJson(res.headers('x-pagination'));
      $scope.members = {
          list: res.data,
          count: res.data.length ? pagination.TotalCount || 30 : 0
        };
    });

    // Get list of members other groups
      Groups.getMyGroups().then(function(res) {
      $scope.myGroups = res.data.NetworkGroupDetailItemResults;
    });
    
    //If there are more members to show then we call a module to display them all.
      $scope.showAllMembers = function() {
      var modal = $modal.open({
          templateType: 'drawer',
          templateUrl: '/interface/views/common/partials/modal-group-members.html',
          controller: SHRP.ctrl.ModalGroupMembersCTRL,
          name: 'd',
          resolve: {
              getItems: function() {
                  return function() {

                      return Groups.getMembers(1, 1000, '', '', '', $scope.groupId).then(function(res) {
                          res.data = res.data.map(function(member) {
                              member.body = member.RoleDescription;
                              member.PhotoThumb = member.AvatarPhotoThumb;
                              return member;
                            });

                          return res;
                        });
                    };
                },
              count: function() {
                  return $scope.members.count;
                },
              groupBio: function() {
                  return $scope.groupBio;
                },
              titleSyntax: function() {
                  return {
                      verb: {
                          singular: 'are',
                          plural: 'are'
                        },
                      noun: 'in ' + ( $scope.groupBio.GroupName || 'this group')
                    };
                }
                
            }
        });

    };

    }]);
