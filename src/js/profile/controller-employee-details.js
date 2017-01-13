angular.module('ui.profile')

.controller('profileEmployeeDetails', ['$scope', 'ProfileEmployeeDetailsFactory', '$modal',
    function($scope, ProfileEmployeeDetailsFactory, $modal) {

    /*
     *  Employment Summary
     */

    // Call the main factory and pass it to this main object
    $scope.employeeDetails = new ProfileEmployeeDetailsFactory();
    
    // Object to be passed to the form builder
    $scope.employeeDetailsForm = $scope.employeeDetails.getEmployeeDetailsForm($scope.profile.$userCan);

    $scope.employeeDetailsFormSave = function(data) {
        // this is a hack because we are passing it to the form builder
        // through an &attr, then running it in the link. Doing this
        // loses the context binding of the ContactFactory
        // so we set up an interim func to call save properly
        
        return $scope.employeeDetailsForm.$save(data);
    };
}]);

var SHRP = SHRP || {};
SHRP.ctrl = SHRP.ctrl || {};

// Upload new profile photo controller
// ----------------------------------------

SHRP.ctrl.ModalProfileConfirm = ['$scope', '$modalInstance', 'data', 'lastestOnboard','canByPassOnboard',
    function($scope, $modalInstance, data, lastestOnboard, canByPassOnboard) {

    $scope.lastestOnboard = lastestOnboard;
        $scope.canByPassOnboard = canByPassOnboard;
        console.log($scope.canByPassOnboard);
    // this will be taken from the data no doubt.
    $scope.changes = data;

    $scope.data = {
        OnboardingCommencementDate: Date.now(),
        IsOnboarding: true
    };
    $scope.ok = function() {
        // check there is actually some data in there
        $modalInstance.close($scope.data);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}];
