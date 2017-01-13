// Confirm event attendance
// ------------------------------------------------

angular.module('ui.events')

.controller('eventsConfirmAttendance', ['$scope', 'EventConfirmAttendanceFactory', '$routeParams', function($scope, EventConfirmAttendanceFactory, $routeParams) {

    $scope.attendance = new EventConfirmAttendanceFactory($routeParams.id);
    
    // Load the list of invitees for the event
    $scope.attendance.loadInvitees();

}])

.filter('inviteStatusSort', function() {
    return function(invitees, filter) {
        if (invitees && filter !== 'person') {
            var sortOrder = [1, 2, 3, 0];
            return invitees.sort(function(a, b) { 
                return sortOrder.indexOf(a.EventInviteMember.InviteStatus) - sortOrder.indexOf(b.EventInviteMember.InviteStatus);
            });
        } else {
            return invitees;
        }  
    };    
});
