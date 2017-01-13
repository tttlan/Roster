angular.module('sherpa')

.config(['$routeProvider', '$locationProvider', 'IS_LOCALHOST', function($routeProvider, $locationProvider, IS_LOCALHOST) {

    //set html5 rewrites
  if(!IS_LOCALHOST) {

      $locationProvider
            .html5Mode(true)
            .hashPrefix('!');
    
    }
    
  $routeProvider
        

        // Training Section (REPORTS)
        //---------------------------

        // View reports
        .when('/training/reports', {
          title: 'Training Reports',            
          templateUrl: '/interface/views/training/manage-reports.html',
          controller: 'trainingManageReportsCtrl'
        })

        // View reports by type (Members, Roles, Network Groups, Courses, Subject)
        .when('/training/reports/:type', {
          title: 'Training Reports',            
          templateUrl: '/interface/views/training/manage-reports.html',
          controller: 'trainingManageReportsCtrl'
        })

        // View reports by Member on type (Members, Roles, Network Groups, Courses, Subject)
        .when('/training/reports/:type/:id/members', {
          title: 'Training Reports',            
          templateUrl: '/interface/views/training/manage-reports.html',
          controller: 'trainingManageReportsCtrl'
        })

        // View reports by Member for subjects by course
        .when('/training/reports/:type/:id/:type2/:id2/members', {
          title: 'Training Reports',            
          templateUrl: '/interface/views/training/manage-reports.html',
          controller: 'trainingManageReportsCtrl'
        })

        // Training Section ( MANAGE )
        //---------------------------
        
        //Edit Courses
        .when('/training/manage', {
          title: 'Manage courses',
          templateUrl: '/interface/views/training/manage.html',
          controller: 'trainingManageCtrl'
        })

        //New Course
        .when('/training/manage/create', {
          title: 'Create a new course',
          templateUrl: '/interface/views/training/manage-create.html',
          controller: 'trainingManageCreateCtrl'
        })

        // View reports
        .when('/training/manage/reports', {
            title: 'Training Reports',            
            templateUrl: '/interface/views/training/manage-reports.html',
            controller: 'trainingManageReportsCtrl'
        })

        //Subject Stats
        .when('/training/manage/:courseId/:subjectId/stats', {
            // Title is set in controller
            templateUrl: '/interface/views/training/manage-subjects-stats.html',
            controller: 'trainingManageSubjectsStatsCtrl'
        })

        //Add Subjects to new Course
        .when('/training/manage/:id/add_subjects', {
          title: 'Add subjects',
          templateUrl: '/interface/views/training/manage-add-subjects.html',
          controller: 'trainingManageAddSubjectsCtrl'
        })

        //Add Distributions to new Course
        .when('/training/manage/:id/add_groups', {
          title: 'Add groups',
          templateUrl: '/interface/views/training/manage-add-groups.html',
          controller: 'trainingManageAddGroupsCtrl'
        })


        //Manage Course Stats
        .when('/training/manage/:id/stats', {
            // Title is set in controller
          templateUrl: '/interface/views/training/manage-stats.html',
          controller: 'trainingManageStatsCtrl'
        })

        //Manage Subjects
        .when('/training/manage/subjects', {
          title: 'Manage subjects',
          templateUrl: '/interface/views/training/manage-subjects.html',
          controller: 'trainingManageSubjectsCtrl'
        })

        //Create Subjects
        .when('/training/manage/subjects/create', {
          title: 'Create subject',
          templateUrl: '/interface/views/training/manage-subjects-create.html',
          controller: 'trainingManageSubjectsCreateCtrl'
        })

        //Edit Subjects
        .when('/training/manage/subjects/:id', {
          title: 'Edit subject',
          templateUrl: '/interface/views/training/manage-subjects-create.html',
          controller: 'trainingManageSubjectsCreateCtrl'
        })

        //Edit Course
        .when('/training/manage/:id', {
          title: 'Edit course',            
          templateUrl: '/interface/views/training/manage-create.html',
          controller: 'trainingManageCreateCtrl'
        })
        
        // Training Section
        //---------------------------

        // View Training
        .when('/training', {
          title: 'My training',
          templateUrl: '/interface/views/training/index.html',
          controller: 'trainingCtrl'
        })

         //View Course
        .when('/training/:id', {
            // Title is in controller
          templateUrl: '/interface/views/training/course.html',
          controller: 'trainingCourseCtrl'
        })

        //View Subjects
        .when('/training/:courseId/:subjectId', {
            // Title is in controller
          templateUrl: '/interface/views/training/subjects.html',
          controller: 'trainingSubjectsCtrl'
        })


        // Otherwise throw a 404
        //---------------------------

        .otherwise({
          redirectTo: '/training'
        });
}]);