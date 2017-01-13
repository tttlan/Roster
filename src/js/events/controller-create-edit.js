angular.module('ui.events')

// Editing / creating an event
// ------------------------------------------------

.controller('eventsCreateEditCtrl', ['$scope', 'EventCreateEditFactory', 'EventImageUploaderFactory', '$routeParams', '$modal', 'Groups',
    function($scope, EventCreateEditFactory, EventImageUploaderFactory, $routeParams, $modal, Groups) {
        
    // Object to be passed to the form builder
    $scope.eventForm = new EventCreateEditFactory($routeParams.id);
    
    // Send the eventForm data to the image uploader factory so we can grab the id of an existing image
    $scope.eventForm.imageUploader = new EventImageUploaderFactory($scope.eventForm.$promise);
    
    $scope.eventSave = function(data) {
        // this is a hack because we are passing it to the form builder
        // through an &attr, then running it in the link. Doing this
        // loses the context binding of the ContactFactory
        // so we set up an interim func to call save properly
        return $scope.eventForm.$save(data);
    };
    
    $scope.eventForm.showInviteesModal = function() {
        
        var modal = $modal.open({
            templateUrl: '/interface/views/events/partials/add-edit-invitees-modal.html',
            size: 'm',
            controller: SHRP.ctrl.ModalEventInviteesCTRL,
            scope: $scope,
            resolve: {
                invitees: function() {
                    return $scope.eventForm.invitees;
                }
            }
        });
    
        modal.result.then(function(invitees) {
            $scope.eventForm.invitees = invitees;
        });
    };
       
    
    // Load tag data so it is ready for the invites modal. 
    // Manage this outside the form builder as formbuilder elements don't place nicely with the modal
    // !!!!!!!!!!!! Remove this once we haved a new API to search groups / members
    $scope.eventForm.tagData = {};    
    
    Groups.getMyGroupsList().then(function(res) {
        $scope.eventForm.tagData.groups = res;
        return res;
    });
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!            
}]);
