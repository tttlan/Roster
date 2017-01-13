 
// Events
// ----------------------------------------

angular.module('ui.events')

// Used to bind the member search API to the autocomplete tag box
// -----------------------------------------------------------------------

.directive('memberSearch', ['Members', function(Members) {
    return {
        scope: false,
        restrict: 'A',
        controller: function($scope, $element, $attrs) { 

            $scope.members = []; // Initialise the array so that the tag manager doesn't shit itself

            $scope.$watch('typeAheadTag', function (newVal, oldVal) {
                if (newVal === '') {
                    $scope.members = [];
                }
                if (newVal !== oldVal && newVal !== '' && newVal.length > 1) {
                    getMembers(newVal);
                }
            });

            function getMembers(searchTerm) {
                // 1 page | max 10 records | search by first name | search term | active members
                $scope.members = Members.getProfiles(1, 10, 2, searchTerm, 1).then(function (res) {
                    return res.data.map(function (member) {
                        return {
                            'label': member.Fullname,
                            'value': {
                                'DistributionId': member.MemberId,
                                'DistributionType':'NetworkMember'
                            }
                        };
                    });                    
                });
            }            
        }
    };
}])

.directive('eventInvitee', function() {
    return {
        scope: {
            eventInvitee: '='
        },
        restrict: 'A',
        templateUrl: '/interface/views/common/partials/person.html',
        controller: function($scope, $element, $attrs) { 
            $scope.person = $scope.eventInvitee.EventInviteMember.MemberSummary;
        }
    };
})

.directive('eventInviteeSummary', function() {
    return {
        restrict: 'E',
        scope: {
            invitees: '='
        },
        templateUrl: '/interface/views/events/partials/event-invite-summary.html'
    };
});
