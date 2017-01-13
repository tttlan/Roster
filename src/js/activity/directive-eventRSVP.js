angular.module('ui.activity')

/*
 * <event-rsvp></event-rsvp>
 *
 */

// Directive to handle likes
// ------------------------------------------------

.directive('eventRsvp', ['Activities', '$notify', function(Activities, $notify) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            currentRsvp: '=',
            eventId: '@',
            eventTitle: '@'
        },
        templateUrl: '/interface/views/activity/partials/event-rsvp.html',
        controller: function($scope, $element, $attrs) {
                        
            // add a like if not liked
            // Update the events attendance, can either be 'Yes', 'Maybe' or 'No'
            $scope.setRsvp = function(rsvp) { 

                if ($scope.currentRsvp === rsvp) { // If the member is setting the RSVP to the current RSVP, do nothing
                    return;
                }

                var oldRSVP = $scope.currentRsvp;
                $scope.currentRsvp = rsvp; // Else update the current RSVP and send it off to the server

                Activities.setEventRsvp($scope.eventId, rsvp).then(function(res) {

                    $notify.add({
                        message: 'Your RSVP to ' + $scope.eventTitle + ' has been updated',
                        type: 'success'
                    });

                }, function() {

                    $scope.currentRsvp = oldRSVP;
                });
            };
        }
    };
}]);