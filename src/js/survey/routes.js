angular.module('sherpa')

.config(['$routeProvider', '$locationProvider', 'IS_LOCALHOST', function($routeProvider, $locationProvider, IS_LOCALHOST) {

    //set html5 rewrites
    if (!IS_LOCALHOST) {

        $locationProvider
            .html5Mode(true)
            .hashPrefix('!');

    }

    $routeProvider

        //// Questionnaires Section ( MANAGE )
        ////---------------------------

        //Manage Questionnaires
         .when('/survey/manage', {
             title: 'Manage Questionnaires',
             templateUrl: '/interface/views/survey/survey-questionnaire.html',
             controller: 'manageQuestionnairesCtrl'
         })

          //New Questionnaires
         .when('/survey/manage/questionnaires/create', {
             title: 'Create Questionnaires',
             templateUrl: '/interface/views/survey/survey-questionnaire-create.html',
             controller: 'manageQuestionnairesCreateCtrl'
         })

          //Edit Questionnaires
         .when('/survey/manage/questionnaires/:id/edit', {
             title: 'Edit Questionnaires',
             templateUrl: '/interface/views/survey/survey-questionnaire-create.html',
             controller: 'manageQuestionnairesCreateCtrl'
         })

         // Questionnaires Templates Section ( MANAGE )
        //---------------------------

        //Manage Questionnaires Template
         .when('/survey/manage/questionnairestemplate', {
             title: 'Manage Questionnaires Template',
             templateUrl: '/interface/views/survey/survey-questionnairetemplate.html',
             controller: 'manageQuestionnairesTemplateCtrl'
         })

        //New Questionnaires Template
        .when('/survey/manage/questionnairestemplate/create', {
             title: 'Create Questionnaires Template',
             templateUrl: '/interface/views/survey/survey-questionnairetemplate-create.html',
             controller: 'manageQuestionnairesTemplateCreateCtrl'
        })

        //Edit Questionnaires Template
        .when('/survey/manage/questionnairestemplate/:id/edit', {
             title: 'Edit Questionnaires Template',
             templateUrl: '/interface/views/survey/survey-questionnairetemplate-create.html',
             controller: 'manageQuestionnairesTemplateCreateCtrl'
        })


        // Otherwise throw a 404
        //---------------------------

        .otherwise({
            redirectTo: '/survey/manage'
        });
}])

.config(['$animateProvider', function($animateProvider) {
    $animateProvider.classNameFilter(/^((?!(repeat-modify)).)*$/);
}]);