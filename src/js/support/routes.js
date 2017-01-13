angular.module('sherpa')
    .config([
        '$routeProvider', '$locationProvider', 'IS_LOCALHOST', function($routeProvider, $locationProvider, IS_LOCALHOST) {

            //set html5 rewrites
            if (!IS_LOCALHOST) {

                $locationProvider
                    .html5Mode(true)
                    .hashPrefix('#');
            }

            $routeProvider

                // Main onboarding page, view stats and client listing
                .when('/support', {
                    title: 'Support',
                    templateUrl: '/interface/views/support/index.html'
                })

                // Otherwise throw a 404
                //---------------------------
                .otherwise({
                    redirectTo: '/support'
                });
        }
    ])
    .config([
        '$animateProvider', function($animateProvider) {
            $animateProvider.classNameFilter(/^((?!(repeat-modify)).)*$/);
        }
    ]);