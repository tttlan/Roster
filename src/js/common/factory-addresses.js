angular.module('ui.common')

.factory('Addresses', function(API_BASE_URL, $server) {
    return {
        lookupAddressByPostcode: function(postcode, countryid) {
            var url = API_BASE_URL + 'profilemanagement/locationlookup';

            return $server.get({
                url: url,
                query: {
                    st: postcode,
                    countryid: countryid ? countryid : null
                    // additional params are available, but not currently used
                    // countryid:
                    // rc:
                }
            }).then(function(res) {
                // example of API response:
                // [
                //     {
                //         CountryId: 13,
                //         CountryName: "Australia",
                //         Id: 24068,
                //         Locality: "MELBOURNE",
                //         Postcode: "3001",
                //         StationRegion: "VIC"
                //     }
                // ]

                return res;
            });
        }
    };
});
