angular.module('ui.recruit.jobs')
  .directive('jobDetailsQuestionnaire', [() => {
    return {
      restrict: 'E',
      require: 'ngModel',
      templateUrl: '/interface/views/recruit/job-details/partials/job-details-questionnaire.html',
      link: (scope) => {
        
      }
    };
  }]);
