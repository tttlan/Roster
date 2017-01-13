angular.module('ui.services')

// Recreuitment factory
// ----------------------------------------

.factory('Recruitment', ['$server', 'API_BASE_URL', function($server, API_BASE_URL) {

  var RECRUITMENT_NAMESPACE = API_BASE_URL + 'recruitment/';
    
  return {
      referFriend: function(data) {
            
          var url = RECRUITMENT_NAMESPACE + 'jobReferToFriend';

          return $server.create({
              url: url,
              data: data
            });
        }
    };

}]);