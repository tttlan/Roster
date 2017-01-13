angular.module('ui.events')

// Event Create / Edit Factory
// ----------------------------------------

.factory('EventViewFactory', ['Events', 'Members', '$location', '$notify', '$rootScope', '$timeout', '$modal', '$window', 'mediaQuery', 'Paths', '$HTTPCache', 
    function(Events, Members, $location, $notify, $rootScope, $timeout, $modal, $window, mediaQuery, Paths, $HTTPCache) {
            
    function Event(eventId) {
        
        var that = this;

        this.eventId = eventId;
        
        this.invitees = {
            confirmedAttendance: {
                people: null,
                count: 0
            },
            attending: {
                people: null,
                count: 0
            },
            maybe: {
                people: null,
                count: 0
            },
            not: {
                people: null,
                count: 0
            },
            invited: {
                people: null,
                count: 0
            }
        };
        
        this.$hasStarted = null;
    
        this.$userCan = {
            view: false,
            eventFound: true
        };
    }
    
    // Two structures for mapping enum of invites to strings and vice versa
    var rsvpEnumLookup = {invited: 0, attending: 1, maybe: 2, not: 3};
    var rsvpStringLookup = {0: 'invited', 1: 'attending', 2: 'maybe', 3: 'not'};
    
    Event.prototype.loadEvent = function() {
        
        var that = this;

        // Get event details
        Events.getById({eventId: that.eventId}).then(function(res) {
    
            that.$loaded = true;
    
            angular.extend(that, res.data.EventFeedEntry);
            angular.extend(that.$userCan, res.data.userCan); // Edit permissions are loaded in here
            that.$userCan.view = true;

            // Move the attendence data into a more organised structure
            that.invitees.confirmedAttendance.count = that.ConfirmedAttendCount;
            that.invitees.attending.count = that.AttendCount;
            that.invitees.maybe.count = that.MaybeCount;
            that.invitees.not.count = that.DeclineCount;
            that.invitees.invited.count = that.InviteCount;
    
            $rootScope.title = that.Title;
    
            // Has the RSVP date for the event past (ie. is the RSVP event on or before today)
            that.$rsvpPast = moment().diff(that.RsvpDate, 'minutes') > 0 ? true : false;
    
            // Has the event stated - this is defined as the event start date/time minus 3 hours
            that.$hasStarted = moment().diff(that.StartDate, 'hour') >= -3 ? true : false;

            // Determine width for the google map so that it sizes nicely on mobile
            $timeout(function() {
                that.$mapWidth = $('.page__aside').width();   
            });
    
        }, function(res) { // Handle error
    
            that.$loaded = true;
    
            if (res.status === 404) {
               
                that.$userCan.eventFound = false;
                that.$userCan.view = true; // Assume you had permission to view the event
            }
        });
    };
    
    Event.prototype.loadInitialInvitees = function() {
        
        var that = this;
        
        Events.getInvites({
            id: that.eventId, 
            page: 1, 
            pageSize: 10, 
            inviteStatus: rsvpEnumLookup.attending    
        }).then(function(res) { 
    
            that.invitees.attending.people = res.data.EventInviteMemberItemResults;
        });
    };
    
    Event.prototype.loadCurrentUser = function() {
        
        // The current user is used by the comment directive
        var that = this;
        
        Members.me().then(function(res) {
            that.$currentUser = res.data;
        });
    };
    
    Event.prototype.startInviteeLoaderTimeout = function(loaderName) {
        
        var that = this;
        
        // If the invitees don't show within 200ms, show a loader
        that.inviteeLoaderTimeout = $timeout(function() { 
            that[loaderName] = true; 
        }, 200);
    };
    
    Event.prototype.loadInvitees = function(status, type) {
        
        var that = this;
        
        // If no people have been added to the list so far (prevents a 2nd call being made when switching back to a tab that's already been clicked)
        if (type === 'initial' && that.invitees[status].people !== null) { return; }
        var inviteStatus = (status === 'confirmedAttendance') ? 'attendance' : rsvpEnumLookup[status]; // Confirmed attendance uses a slightly different API

        var page = (type !== 'initial') ? that.invitees[status].people.length / 10 : 0, // If we are loading more items, the length of the current list must be a multiple of 10, else load the first page
            loaderName = (type === 'initial') ? '$showInviteeLoaderInitial' : '$showInviteeLoaderIncremental';
            
        that.startInviteeLoaderTimeout(loaderName);
        
        Events.getInvites({
            id: that.eventId, 
            page: (page + 1), 
            pageSize: 10, 
            inviteStatus: inviteStatus
        }).then(function(res) {  // Load the first page
            
            $timeout.cancel(that.inviteeLoaderTimeout);
            that[loaderName] = false;
            
            if (type === 'initial') { // If this is the first load of members for a tab, ie. the first tab was clicked                
                that.invitees[status].people = res.data.EventInviteMemberItemResults; // We know we are doing the initial load, no need to push data onto the list
            } else {
                that.invitees[status].people = that.invitees[status].people.concat(res.data.EventInviteMemberItemResults);
            }
        });
    };
    
    Event.prototype.loadConfirmedAttendees = function() {
        
        var that = this;
                
        Events.getConfirmedAttendees({
            eventId: that.eventId,
            page: 1, 
            pageSize: 10
        }).then(function(res) {
            
            that.invitees.confirmedAttendance.people = res.data.EventInviteMemberItemResults;            
        });
    };
    
    // Update the events attendance, can either be 'Yes', 'Maybe' or 'No'
    Event.prototype.setRsvp = function(newRsvp) { 

        var that = this;

        if (that.MemberInviteStatus === newRsvp) { // If the member is setting the RSVP to the current RSVP, do nothing
            return;
        }

        var oldRSVP = that.MemberInviteStatus;
        that.MemberInviteStatus = newRsvp; // Update the new RSVP then send it off to the server

        Events.setRsvp({
            eventId: that.eventId, 
            rsvp: that.MemberInviteStatus
        }).then(function(res) {

            // RSVP has been set sucessfully, now update our array of invitees to match
            that.updateCurrentMemberInvite({
                oldInviteList: rsvpStringLookup[oldRSVP],
                newInviteList: rsvpStringLookup[newRsvp]
            });

            $notify.add({
                message: 'Your RSVP to "' + that.Title + '" has been updated',
                type: 'success'
            });

        }, function() {

            $notify.add({
                message: 'Your RSVP to "' + that.Title + '" could not be updated at this time.  Please try again later',
                type: 'error'
            });

            that.MemberInviteStatus = oldRSVP;
        });
    };
    
    Event.prototype.updateCurrentMemberInvite = function(data) {
        
        var that = this;

        // Update the RSVP of the current member if they have already been loaded onto the page
        var currentMember = null;

        angular.forEach(that.invitees[data.oldInviteList].people, function(invitee, key) {

            if (invitee.EventInviteMember.MemberId === that.$currentUser.MemberId) {
                currentMember = invitee; 
                that.invitees[data.oldInviteList].people.splice(key, 1); // We have found the current member, take them out of the array
            }
        });

        if (currentMember) { // The current member has been loaded into the list of invitees already, this means we need to move them into the correct list
            if (that.invitees[data.newInviteList].people === null) { // This is to null initially, make empty array
                that.invitees[data.newInviteList].people = [];
            }
            that.invitees[data.newInviteList].people.push(currentMember); // Push them onto the new list
            that.invitees[data.oldInviteList].count--;
            that.invitees[data.newInviteList].count++;
        }
    };
    
    
    Event.prototype.cancel = function() {

        var that = this;

        Events.cancel({eventId: that.eventId}).then(function(res) {
            
            $notify.add({
                message: '"' + that.Title + '" has been canceled',
                type: 'success'
            });
            
            that.$userCan.edit = false;
            that.$userCan.cancelevent = false;
            that.$userCan.delete = true;
            $HTTPCache.clear('Events?'); // Clear cache for the events listing page as our event has now changed status
            
        }, function() {
            
            $notify.add({
                message: '"' + that.Title + '" could not be cancelled at this time.  Please try again later',
                type: 'error'
            });
        });
    };
    
    Event.prototype.delete = function() {

        var that = this;
        
        Events.delete({eventId: that.eventId}).then(function(res) {
                
            $notify.add({
                message: '"' + that.Title + '" has been deleted.',
                type: 'success'
            });  
            
            $HTTPCache.clear('Events?'); // Clear cache for the events listing page as our event has now changed status
            $location.path(Paths.get('events.index').path); // Now that the event has been deleted, navigate back to the events listing page
            
        }, function() {
            
            $notify.add({
                message: '"' + that.Title + '" could not be deleted at this time.  Please try again later',
                type: 'error'
            });           
        });    
    };    
    
    Event.prototype.showMap = function() {
        
        var that = this;

        var isMobile = (function() {
            var mediaSize = mediaQuery.get();
            return (mediaSize === 'mobile' || mediaSize === 'phablet');
        })();

        if (isMobile) {

            // Don't open a lightbox, open in new browser tab and potentially native google maps if device settings allow
            $window.open('http://www.google.com.au/maps/place/' + that.Address);

        } else {

            that.modal = $modal.open({
                template: '<header class="modal__header ng-scope">' +
                              '<h2 class="modal__title">Map of ' + that.Address + '</h2>'+
                              '<a href="" class="modal__close" ng-click="cancel()"></a>' + 
                          '</header>' +
                          '<google-map address="\'' + that.Address + '\'" zoom="14"></google-map>',
                controller: SHRP.ctrl.ModalCTRL,
                resolve: {
                    items: function() {},
                    dataUpload: function() {}
                },
                animationType: 'flipVertical',
                size: 'lg',
            });
        }
    };
        
    return Event;   
    
}]);
    
