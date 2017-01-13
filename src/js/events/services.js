angular.module('ui.events')


// Clients factory
// ----------------------------------------

.factory('Events', ['$server', 'API_BASE_URL', '$HTTPCache', 'Permissions', function($server, API_BASE_URL, $HTTPCache, Permissions) {

    var EVENT_NAMESPACE = API_BASE_URL + 'events/';
    //Select top 10 * from elmah_error order by sequence desc

    function removeTimestamp(timestamp) {
        
        if (timestamp !== undefined && timestamp !== null) {
            
            timestamp = timestamp.toString();

            // Strip out all the possible timestamp formats that may have been added depending on the browser
            timestamp = timestamp.replace(/( ?)([+]UTC|UTC[+]|GMT[+]|[+]GMT|[+])([01]\d)(:?[0-5]\d)( ?\([A-Z a-z]+\))?/g, '');

            // Special IE9 / IE10 fix, make sure the time is always the last part of the timestamp (in IE 9/10 it is the year)
            var time = timestamp.match(/([0-9]+:[0-9]+:[0-9]+ )/g); // Retreive the time component
            if (time) {
                timestamp = timestamp.replace(time[0], ''); // Then remove it
                timestamp = timestamp + ' ' + time[0]; // And put it back on the end
            }
        }

        return timestamp;
    }

    function setTimestamp(timestamp) { 

        // No timestamp will be returned, set a timestamp equal to the current time
        if (timestamp) {
            timestamp = moment(timestamp).format();
        }
        return timestamp;
    }

    var Event = {

        getAll: function(params) {

            var query = {
                'p': params.page,
                'ps': params.pageSize,
                'rc': 0,
                'f': params.filterBy
            };

            var url = API_BASE_URL + 'Events';

            return $server.get({
                'url': url,
                'query': query
            }).then(function(res) {
                res.data.$userCan = Permissions.formatPermissions(res.data.EntityActions);
                return res;                
            });
        },

        getById: function(params) {

            var url = EVENT_NAMESPACE + params.eventId;

            return $server.get({
                'url': url 
            }).then(function(res) {
                res.data.userCan = Permissions.formatPermissions(res.data.EntityActions);
                return res;                
            });
        },

        getInvites: function(params) {
                        
            var url,
                query = {
                    'f': params.inviteStatus,                
                    'p': params.page,
                    'ps': params.pageSize,
                    'rc': 1
                };
                        
            if (params.inviteStatus === 'attendance') {
                url = EVENT_NAMESPACE + params.id + '/attendances';
                delete query.f;
            } else {
                url = EVENT_NAMESPACE + params.id + '/invites';
            } 
            
            return $server.get({
                'url': url,
                'query': query
            });
        },

        // Creating an event
        create: function(data) {

            var url = EVENT_NAMESPACE;
            
            data.StartDate = removeTimestamp(data.StartDate);
            data.EndDate = removeTimestamp(data.EndDate);
            data.RsvpDate = removeTimestamp(data.RsvpDate);

            return $server.create({
                'url': url,
                'data': data
            }).then(function(res) {
                
                $HTTPCache.clear([EVENT_NAMESPACE, 'Events']);
                return res;
            });
        },

        getForEdit: function(params) {

            var url = EVENT_NAMESPACE + params.eventId + '/edit';

            return $server.get({
                'url': url 
            }).then(function(res) {

                res.data.Event.StartDate = setTimestamp(res.data.Event.StartDate);
                res.data.Event.EndDate = setTimestamp(res.data.Event.EndDate);
                res.data.Event.RsvpDate = setTimestamp(res.data.Event.RsvpDate);
                return res;
            });
        },

        // Editing an event
        update: function(data) {
          
            var url = EVENT_NAMESPACE + data.EventId;            

            data.StartDate = removeTimestamp(data.StartDate);
            data.EndDate = removeTimestamp(data.EndDate);
            data.RsvpDate = removeTimestamp(data.RsvpDate);

            return $server.update({
                'url': url,
                'data': data
            }).then(function(res) {

                $HTTPCache.clear([EVENT_NAMESPACE, 'Events']);
                return res;
            });
        },

        setRsvp: function(params) {

            var url = EVENT_NAMESPACE + params.eventId + '/invitestatus/' + params.rsvp;

            return $server.create({
                'url': url
            }).then(function(res) {
                $HTTPCache.clear([EVENT_NAMESPACE, 'Events']);
                return res;
            });
        },
        
        setAttendance: function(params) {

            var url = EVENT_NAMESPACE + params.eventId + '/member/' + params.memberId + '/attendance/' + params.attendance;

            return $server.create({
                'url': url
            }).then(function(res) {
                $HTTPCache.clear([EVENT_NAMESPACE, 'Events']);
                return res;
            });
        },
                
        cancel: function(params) {

            var url = EVENT_NAMESPACE + params.eventId + '/cancel/';

            return $server.create({
                'url': url
            }).then(function(res) {
                $HTTPCache.clear([EVENT_NAMESPACE, 'Events']);
                return res;
            });
        },
        
        delete: function(params) {

            var url = EVENT_NAMESPACE + params.eventId + '/delete/';

            return $server.create({
                'url': url
            }).then(function(res) {
                $HTTPCache.clear([EVENT_NAMESPACE, 'Events']);
                return res;
            });
        }
    };

    return Event;

}]);
