angular.module('sherpa')

.config(['$routeProvider', '$locationProvider', 'IS_LOCALHOST', function($routeProvider, $locationProvider, IS_LOCALHOST) {

    //set html5 rewrites
    if(!IS_LOCALHOST) {

        $locationProvider
            .html5Mode(true)
            .hashPrefix('!');
    
    }
    
    $routeProvider
        
        // All events
        .when('/events', {
            title: 'Events',
            templateUrl: '/interface/views/events/events.html',
            controller: 'eventsListingCtrl',
            reloadOnSearch: false
        })

        // Create a new event
        .when('/events/create', {
            title: 'Create a new event',
            templateUrl: '/interface/views/events/create-edit.html',
            controller: 'eventsCreateEditCtrl',
            reloadOnSearch: false
        })

        // Edit an event
        .when('/events/:id/edit', {
            title: 'Edit event',
            templateUrl: '/interface/views/events/create-edit.html',
            controller: 'eventsCreateEditCtrl',
            reloadOnSearch: false
        })

        // View an event 
        .when('/events/:id', {
            // Title set in the controller
            templateUrl: '/interface/views/events/event.html',
            controller: 'eventsDetailCtrl',
            reloadOnSearch: false
        })

        // View an event 
        .when('/events/:id/confirm-attendees', {
            // Title set in the controller
            templateUrl: '/interface/views/events/confirm-attendance.html',
            controller: 'eventsConfirmAttendance',
            reloadOnSearch: false
        })
        
        
        // Otherwise throw a 404
        //---------------------------

        .otherwise({
             redirectTo: '/dashboard'
        });
}]);
