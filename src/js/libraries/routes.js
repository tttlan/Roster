angular.module('sherpa')

.config(['$routeProvider', '$locationProvider', 'IS_LOCALHOST', function($routeProvider, $locationProvider, IS_LOCALHOST) {

    //set html5 rewrites
  if(!IS_LOCALHOST) {

      $locationProvider
            .html5Mode(true)
            .hashPrefix('#');    
    }
    
  $routeProvider

        // Main libraries page.
        .when('/libraries', {
          title: 'Libraries',
          templateUrl: '/interface/views/libraries/index.html',
          controller: 'librariesCtrl',
        })

        // Otherwise throw a 404
        //---------------------------

        .otherwise({
          redirectTo: '/libraries'
        });
}]);