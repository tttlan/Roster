 angular.module('ui.services')


// Clients factory
// ----------------------------------------

.factory('Support', ['$server', 'API_BASE_URL', '$HTTPCache', function($server, API_BASE_URL, $HTTPCache) {

  var SUPPORT_NAMESPACE = API_BASE_URL + 'support/';
  var Support = {

      getFAQS: function(forum) {         

          var url = SUPPORT_NAMESPACE + 'forums/' + forum + '/topics'; 

          return $server.get({
              'url': url
            });

        },

      sendSupportRequest: function(request) {
          console.log(request);
          var url = SUPPORT_NAMESPACE + '#';

          return $server.create({
              url: url,
              data: request
            }).then(function(res) {                

              return res;
            });
        }

    };

  return Support;

}]);