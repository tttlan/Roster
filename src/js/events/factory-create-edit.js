angular.module('ui.events')

// Event Create / Edit Factory
// ----------------------------------------

.factory('EventCreateEditFactory', ['FormFactory', 'Events', '$location', 'Paths',
    function(FormFactory, Events, $location, Paths) {
    
    function EventCreateEditForm(eventId) {
        
        var editing = eventId ? true : false; // We are in edit mode if an eventId has been passed in

        var OPTIONS = {
            getAction: editing ? 'getForEdit' : 'getAll', // If we're not editing, get permissions from a different api
            saveAction: editing ? 'update' : 'create',
            successMsg: editing ? 'Your event has been updated' : 'Your event has been created',
            errorMsg: editing ? 'Your event could not be updated at this time.  Please try again later' : 'Your event could not be created at this time, please try again later',
            serviceName: 'Events',
            customProperties: {
                $editing: editing,
                $imageUploaded: false,
                $userCan: { // Permissions
                    edit: false,  // Assume user can't edit or add initially
                    add: false,
                    eventFound: true // Initially assume that the event will be found
                },
                $eventId: editing ? eventId : null
            },
            getParams: editing ? {eventId: eventId} : {page: 1, pageSize: 1, filterBy: 1},
            getDataSuccessFn: function(that, res) { // Hook for when the data is loaded

                if (editing) {
                    
                    res.data = res.data.Event;
                    that.invitees = processInviteesForEdit(res.data.EventInvites); 
                    that.$userCan.edit = true;  // Sucessful result, set permissions to allow an edit

                } else { // If we're not editing, all we want here are permissions from the getAll api 

                    angular.extend(that.$userCan, res.data.$userCan);
                    res.data = {}; // Once we have the permissions, discard all other data.  The res is returned so it's essential we discard the data at this point
                }
                
                return res;
            },
            getDataErrorFn: function(that, res) {

                if (res.status === 404) {
                    that.$userCan.edit = true; // Assume that the user would have been able to edit
                    that.$userCan.eventFound = false;
                }
                
                return res;
            },
            saveDataFn: function(that, data) { // Change the data before we save it
                
                if (that.invitees) {                
                    data.EventInvites = processInviteesForSave(that.invitees); 
                }
                
                data.PhotoLrgId = that.imageUploader.imageId || null;
                data.PhotoSmlId = that.imageUploader.imageId || null;  

                return data;
            },        
            saveDataSuccessFn: function(that, res) { //
                
                if (editing) {
                    $location.path(Paths.get('events.details', eventId).path);
                } else {
                    $location.path(Paths.get('events.details', res.data.Data).path);
                }                
            }
            //saveDataErrorFn: function(that, res) { }
        };

        return new FormFactory(OPTIONS);
    }

    // Mould the invitees data that we get back from the server into a format that plays nice with our UI
    function processInviteesForEdit(invites) {

        var invitedGroups = [],
            invitedMembers = [],
            invitedNetwork = false;

        angular.forEach(invites, function(invite) {

            if (invite.EventInviteType === 0) { // Member

                invitedMembers.push({
                    label: invite.Name,
                    value: {
                        DistributionId: invite.MemberId,
                        DistributionType: 'NetworkMember'
                    }
                });

            } else if (invite.EventInviteType === 1) { // Group

                invitedGroups.push({
                    label: invite.Name,
                    value: {
                        DistributionId: invite.GroupId,
                        DistributionType: 'NetworkGroup'
                    }
                });

            } else if (invite.EventInviteType === 2) { // Network

                invitedNetwork = true;
            }
        });

        return {
            Groups: invitedGroups,
            Members: invitedMembers,
            Network: invitedNetwork
        };
    }
    
    // Mould the invitees data into a format that the API likes before we send it off
    function processInviteesForSave(invitees) {

        // Loop through the Groups and Members objects and combine these into one array to send back to the server

        var combinedInvitees = [];

        if (invitees.Network) {
            
            combinedInvitees.push({
                'EventInviteType': 2
            });

        } else {

            angular.forEach(invitees.Members, function(invitee, key) {
                combinedInvitees.push({
                    'MemberId': invitee.value.DistributionId,
                    'EventInviteType': 0
                });
            });

            angular.forEach(invitees.Groups, function(invitee, key) {
                combinedInvitees.push({
                    'GroupId': invitee.value.DistributionId,
                    'EventInviteType': 1
                });
            });
        }
        
        return combinedInvitees;
    }
    
    return EventCreateEditForm;

}]);
