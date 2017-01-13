angular.module('ui.services')
    .factory('memberAcceptanceProfile', function($q, $server, $modal, API_BASE_URL) {
        var PROFILES_NAMESPACE = API_BASE_URL + 'profilemanagement/';

        var factory = {
            updateEmergencyContact: function(contact) {
                var url = PROFILES_NAMESPACE + 'me/emergencycontact';

                return $server.update({
                    url: url,
                    data: contact
                });
            },
        };

    return factory;
});