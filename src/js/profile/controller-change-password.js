angular.module('ui.profile')

.controller('profileChangePassword', ['$scope', 'Profile', 'ChangePasswordFactory', '$routeParams', 'Paths', '$location',
    function($scope, Profile, ChangePasswordFactory, $routeParams, Paths, $location) {

    $scope.profileInformation = new ChangePasswordFactory();
    
    $scope.$watch('profile.MemberId', function(val) {
        if (val) {
            $scope.profileInformation.MemberId = $routeParams.memberId ? val : null;
        }
    });

    $scope.$watch('profile.$userCan.isadmin', function(val) {
        if (val) {
            $scope.profileInformation.isadmin = $scope.profile.$userCan.isadmin;
        }
    });

    $scope.savePassword = function(data) {
        
        data.MemberId = $scope.profile.MemberId;
        
        return $scope.profileInformation.$save(data).then(function() {  // This callback would normally be done as part of the form factory but since the factor is shared it is being done here
            var profileIndex = Paths.get('network.profile', $scope.profileInformation.MemberId ? $scope.profileInformation.MemberId : []);
            $location.path(profileIndex.path);
        });
    };

}]);
