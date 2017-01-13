angular.module('ui.common')

/*
 *
 * Change password modal
 * Will open a modal to change the current logged in users password if 'true' is passed into the directive 
 *
 */

.directive('changePassword', ['$modal', 'Members', 'angularLoad', function($modal, Members, angularLoad) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            
            if (attrs.changePassword === 'true') {
                                                
                var modal = $modal.open({
                    locked: true,
                    templateUrl: '/interface/views/common/partials/modal-change-password.html',
                    controller: SHRP.ctrl.ModalChangePasswordCTRL,
                    title: 'Change password',
                    name: 'changePassword'
                });
            }     
        }
    };
}])

/*
 * Factory for the change password modal form
 * This is an interface to the form builder within the modal
 * 
 */


.factory('ChangePasswordFactory', ['FormFactory',
    function(FormFactory) {

    var OPTIONS = {
        serviceName: 'Members',
        saveAction: 'updatePassword',
        successMsg: 'Your password has been updated successfully',
        errorMsg: 'Your password could not be updated at this time.  Please try again later',
        saveDataFn: function(that, res) {
            
            delete res.ConfirmNewPwd;
            return res;
        }
    };

    return function(customOpts) {

        var opts = customOpts ? angular.extend({}, OPTIONS, customOpts) : OPTIONS;

        return new FormFactory(opts);
    };
    
}]);

// Controller for the change password modal 

var SHRP = SHRP || {};
SHRP.ctrl = SHRP.ctrl || {};

SHRP.ctrl.ModalChangePasswordCTRL = ['$scope', '$modalInstance', 'Members', 'ChangePasswordFactory', '$window', 'Paths', '$timeout',
    function($scope, $modalInstance, Members, ChangePasswordFactory, $window, Paths, $timeout) {
        
    $scope.changePassword = new ChangePasswordFactory();

    var MemberId = Members.me().then(function(res) { // Create a promise for retreiving the member id
        return res.data.MemberId; 
    });
    
    $scope.savePassword = function(data) {
        return MemberId.then(function(res) { // Return the member id promise to ensure that the Id has been retreived before we send a request to change the password
            
            data.MemberId = res; // Add the member id to the data being send to the server

            return $scope.changePassword.$save(data).then(function() { // This callback would normally be done as part of the form factory but since the factor is shared it is being done here
                //Merivale specific hack to send them to events
                //Force it since there appears to be multiple angular apps running and $location.path does not work
                $window.location.assign('/events');
                $modalInstance.close('success');
            }); // Return another promise for saving the new password
        });
    };
    
}];
