angular.module('ui.events')

// Event Create / Edit Factory
// ----------------------------------------

.factory('EventConfirmAttendanceFactory', ['Events', '$routeParams', '$filter', '$rootScope', function(Events, $routeParams, $filter, $rootScope) {
    
    function Attendance(eventId) {
        
        var that = this;
        
        this.sortOrder = null;
        this.eventId = eventId;
                
        Events.getById({eventId: that.eventId}).then(function(res) {
            
            that.Title = res.data.EventFeedEntry.Title;
            $rootScope.title = 'Confirm attendance for "' + that.Title + '"';
        });
    }
    
    Attendance.prototype.loadInvitees = function() {

        var that = this;

        Events.getInvites({
            id: that.eventId, 
            page: 1, 
            pageSize: 10000, 
            inviteStatus: 4 // 4 means all invite status types 
        }).then(function(res) { 

            that.invitees = res.data.EventInviteMemberItemResults;
            //console.log(res);
        });
    };
        
    Attendance.prototype.orderBy = function(order) {
        
        this.sortOrder = order; // Set the new order   
    };
        
    Attendance.prototype.sortItems = function() {

        if (this.sortOrder === 'person') {
            
            return 'EventInviteMember.MemberSummary.FirstName';
        }
    };

    Attendance.prototype.setAttendance = function(person) {

        var that = this;

        var attendance = person.Attendance ? 1 : 0; // Attendance comes in as a bool, change it to 0 for false, one for true before sending to the api        
                
        Events.setAttendance({
            eventId: that.eventId, 
            memberId: person.MemberId, 
            attendance: attendance
        }).then(function(res) { 
            
            // All good, it worked, do nothing
                        
        }, function(res) {
            
            person.Attendance = !person.Attendance; // Set this back to what it used to be since the API call failed          
        });
    };
        
    return Attendance;
    
}]);
