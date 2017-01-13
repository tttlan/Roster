angular.module('ui.profile')


.controller('profileContactDetails', ['$scope', 'ProfileMemberContactFactory', 'ProfileEmergencyContactFactory',
    function($scope, ProfileMemberContactFactory, ProfileEmergencyContactFactory) {

    /*
     *  Phone numbers and email addresses
     */

    $scope.contactDetails = new ProfileMemberContactFactory();
    
    // Make the calls to the api to initialise the factory.  This initialisation will
    // request data for all the contact details: emails, phones, address and personal info
    $scope.contactDetails.initialise();
    
    /*
     * Address
     */

    $scope.memberAddress = $scope.contactDetails.getAddress($scope.profile.$userCan);

    $scope.memberAddressSave = function(data) {
        // this is a hack because we are passing it to the form builder
        // through an &attr, then running it in the link. Doing this
        // loses the context binding of the ContactFactory
        // so we set up an interim func to call save properly
        return $scope.memberAddress.$save(data);
    };
    
    /*
     *  Personal information
    */

        // Object to be passed to the form builder
    
    $scope.personalInformation = $scope.contactDetails.getPersonalInfo($scope.profile.$userCan);

    $scope.personalInfoSave = function(data) {
        // this is a hack because we are passing it to the form builder
        // through an &attr, then running it in the link. Doing this
        // loses the context binding of the ContactFactory
        // so we set up an interim func to call save properly
        return $scope.personalInformation.$save(data);
    };
    
    /*
     *  Emergency contact details
    */

    // Object to be passed to the form builder
    $scope.emergencyContactInformation = new ProfileEmergencyContactFactory({
        customProperties: {
            $globalPermission: $scope.profile.$userCan
        },
    });

    $scope.emergencyContactInfoSave = function(data) {
        // this is a hack because we are passing it to the form builder
        // through an &attr, then running it in the link. Doing this
        // loses the context binding of the ContactFactory
        // so we set up an interim func to call save properly
        data.LinePhone2Restored = data.LinePhone2;
        return $scope.emergencyContactInformation.$save(data);
    };
}]);
