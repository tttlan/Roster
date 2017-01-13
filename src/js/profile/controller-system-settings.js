angular.module('ui.profile')

.controller('profileSystemSettings', ['$scope', 'ProfileSystemInfoFactory', 'ProfilePermissionsFactory', function($scope, ProfileSystemInfoFactory, ProfilePermissionsFactory) {
    
    /*
     *  System information
     */
    
    // Object to be passed to the form builder
    $scope.systemInfo = new ProfileSystemInfoFactory({
        customProperties: {
            $globalPermission: $scope.profile.$userCan
        }
    });

    $scope.systemInfoSave = function(data) {
        // this is a hack because we are passing it to the form builder
        // through an &attr, then running it in the link. Doing this
        // loses the context binding of the ContactFactory
        // so we set up an interim func to call save properly
        return $scope.systemInfo.$save(data);
    };
    
    /*
     *  Permissions
     */
    
    $scope.permissionsFactory = new ProfilePermissionsFactory();
        
    $scope.permissions = $scope.permissionsFactory.getPermissionsForm();

}]);
