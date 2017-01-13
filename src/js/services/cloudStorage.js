
angular.module('ui.services')


// Cloud Storage factory
// ----------------------------------------

.factory('CloudStorage', ['$server', '$q', 'API_BASE_URL', '$sce', '$cookies', function($server, $q, API_BASE_URL, $sce, $cookies) {

    var CLOUDSTORE_URL = API_BASE_URL + 'artifacts/';

    var CloudStorage = {
            
        //Get File ID to store
        generate: function(data, url) {

            return $server.create({
                'url': url || (CLOUDSTORE_URL + 'getUploadUrl/'),
                'data': data
            });
        
        }
    };

    return CloudStorage;

}]);