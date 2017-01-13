angular.module('ui.events')

// A single event
// ------------------------------------------------

.controller('eventsDetailCtrl', ['$scope', 'EventViewFactory', '$routeParams',
    function($scope, EventViewFactory, $routeParams) {
    
    $scope.event = new EventViewFactory($routeParams.id);
    
    // When the controller has initialised, load the event, invitees and the current user
    $scope.event.loadEvent();
    $scope.event.loadInitialInvitees();
    $scope.event.loadCurrentUser();

}]);
