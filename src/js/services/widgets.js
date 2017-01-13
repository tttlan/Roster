angular.module('ui.services')


// Widgets Factory
// ----------------------------------------

.factory('Widget', ['$server', '$HTTPCache', 'API_BASE_URL', function($server, $HTTPCache, API_BASE_URL) {

    var NAMESPACE = API_BASE_URL;
    var memberId = 179605;

    var Widget = {

        // GET the upcoming birthdays
        birthdays: function() {
            
            var url = NAMESPACE + 'events/upcomingbirthdays';

            return $server.get({ url: url });

        },

        // GET the events list
        events: function(count) {

            var url = NAMESPACE + 'events/upcomingevents?rs=' + count;

            return new Promise((resolve, reject) => {
                $server
                    .get({ url: url })
                    .then((res) => resolve(res));
            });

        }
    };

    return Widget;

}]);