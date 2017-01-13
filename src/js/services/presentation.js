angular.module('ui.services')

// Presentation factory
// ----------------------------------------

.factory('Presentation', ['$server', 'Permissions', 'API_BASE_URL', function($server, Permissions, API_BASE_URL) {

  var PRESENTATION_NAMESPACE = API_BASE_URL + 'presentation/';
    
  return {
      getTheme: function() {

          var url = PRESENTATION_NAMESPACE + 'themes';

          return $server.get({'url': url });
        },
      getThemeByID: function(id) {

          var url = PRESENTATION_NAMESPACE + 'getsitecolourthemebyid/' + id;

          return $server.get({'url': url });
        }
    };

}]);