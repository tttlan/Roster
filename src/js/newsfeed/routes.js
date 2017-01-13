angular.module('sherpa')
.config(['$routeProvider', '$locationProvider', 'IS_LOCALHOST', function($routeProvider, $locationProvider, IS_LOCALHOST) {

    //set html5 rewrites
  if(!IS_LOCALHOST) {

      $locationProvider
            .html5Mode(true)
            .hashPrefix('!');
    
    }
    
  $routeProvider

        // View Dashboard
        .when('/dashboard', {
          title: 'Dashboard',
          templateUrl: '/interface/views/newsfeed/index.html',
          reloadOnSearch: false
        })
        // News listing
        .when('/dashboard/news', {
          title: 'News',
          templateUrl: '/interface/views/newsfeed/news.html',
          controller: 'dashboardNewsCtrl',
          reloadOnSearch: false
        })

        // News Manage
        .when('/dashboard/news/manage', {
          title: 'Manage news',
          templateUrl: '/interface/views/newsfeed/news-manage.html',
          controller: 'dashboardNewsManageCtrl',
          reloadOnSearch: false
        })

        // Create article
        .when('/dashboard/news/create', {
          title: 'Create a news article',
          templateUrl: '/interface/views/newsfeed/news-create.html',
          controller: 'dashboardNewsCreateCtrl',
          reloadOnSearch: false
        })

        // Edit article
        .when('/dashboard/news/:id/edit', {
          title: 'Edit news',
          templateUrl: '/interface/views/newsfeed/news-create.html',
          controller: 'dashboardNewsCreateCtrl',
          reloadOnSearch: false
        })

        // Read article
        .when('/dashboard/news/:id', {
            // Title defined in controller
          templateUrl: '/interface/views/newsfeed/news-article.html',
          controller: 'dashboardNewsArticleCtrl',
          reloadOnSearch: false
        })

        // News categories
        .when('/dashboard/news/categories/:id', {
            // Title defined in controller
          templateUrl: '/interface/views/newsfeed/news.html',
          controller: 'dashboardNewsCtrl',
          reloadOnSearch: false
        })

        // Directory
        .when('/dashboard/directory', {
          title: 'Directory',
          templateUrl: '/interface/views/newsfeed/directory.html',
          controller: 'dashboardDirectoryCtrl',
          reloadOnSearch: false
        })

        // Single activity item
        .when('/activities/:id', {
          title: 'Network feed post',
          templateUrl: '/interface/views/newsfeed/activity.html',
          controller: 'dashboardActivityCtrl',
          reloadOnSearch: false
        })

        // Directory
        .when('/dashboard/roster', {
          title: 'Roster',
          templateUrl: '/interface/views/newsfeed/roster.html',
          controller: 'dashboardRosterCtrl',
          reloadOnSearch: false
            // resolve: {
            //     initialData: function(dashboardRosterResolver){
            //         return dashboardRosterResolver();
            //     }
            // }
        })

        // All events
        .when('/dashboard/events', {
          title: 'Events',
          templateUrl: '/interface/views/newsfeed/events.html',
          controller: 'eventsListingCtrl',
          reloadOnSearch: false
        })

        // Create a new event
        .when('/dashboard/events/create', {
          title: 'Create a new event',
          templateUrl: '/interface/views/newsfeed/events-create-edit.html',
          controller: 'eventsCreateEditCtrl',
          reloadOnSearch: false
        })

        // Edit an event
        .when('/dashboard/events/:id/edit', {
          title: 'Edit event',
          templateUrl: '/interface/views/newsfeed/events-create-edit.html',
          controller: 'eventsCreateEditCtrl',
          reloadOnSearch: false
        })

        // View an event 
        .when('/dashboard/events/:id', {
            // Title set in the controller
          templateUrl: '/interface/views/newsfeed/events-event.html',
          controller: 'eventsDetailCtrl',
          reloadOnSearch: false
        })


        // View group
        .when('/groups/:id', {
            // Title defined in controller
          templateUrl: '/interface/views/newsfeed/group.html',
          controller: 'dashboardGroupCtrl',
          reloadOnSearch: false
        })

        
        // Otherwise throw a 404
        //---------------------------

        .otherwise({
          redirectTo: '/dashboard'
        });
}]);