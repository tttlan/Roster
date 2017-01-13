angular.module('sherpa')

.config(['$routeProvider', '$locationProvider', 'IS_LOCALHOST', function($routeProvider, $locationProvider, IS_LOCALHOST) {

    //set html5 rewrites
    if(!IS_LOCALHOST) {

        $locationProvider
            .html5Mode(true)
            .hashPrefix('#');    
    }
    
    $routeProvider

        // Main onboarding page, view stats and client listing
        
        .when('/profile/:memberId?/wall', {
            title: 'Wall',
            templateUrl: '/interface/views/profile/wall.html'
        })

        .when('/profile/:memberId?/contact-details', {
            title: 'Contact details',
            templateUrl: '/interface/views/profile/contact-details.html',
            controller: 'profileContactDetails'
        })

        .when('/profile/:memberId?/employee-details', {
            title: 'Employee details',
            templateUrl: '/interface/views/profile/employee-details.html',
            controller: 'profileEmployeeDetails'
        })

        .when('/profile/:memberId?/history', {
            title: 'History',
            templateUrl: '/interface/views/profile/history.html',
            controller: 'profileHistory'
        })

        .when('/profile/:memberId?/documentation', {
            title: 'Documentation',
            templateUrl: '/interface/views/profile/documentation.html',
            controller: 'profileBanking'
        })

        .when('/profile/:memberId?/change-password', {
            title: 'Change password',
            templateUrl: '/interface/views/profile/change-password.html',
            controller: 'profileChangePassword'
        })

        .when('/profile/:memberId?', {
            title: 'Wall',
            templateUrl: '/interface/views/profile/wall.html'
        })

        .when('/profile/:memberId?', {
            title: 'Profile',
            templateUrl: '/interface/views/profile/index.html',
            reloadOnSearch: false
        })

        .when('/profile/new/:memberId?', {
            title: 'Profile',
            templateUrl: '/interface/views/profile/profile-new-ui.html',

        })

        // Otherwise throw a 404
        //---------------------------

        .otherwise({
             redirectTo: '/profile'
        });

}]);
