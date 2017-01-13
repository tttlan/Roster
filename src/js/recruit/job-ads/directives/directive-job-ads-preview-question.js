angular.module('ui.recruit')
.directive('jobQuestionPreview', ['$q', function($q) {

    return {
        restrict: 'E',
        scope: {
            question: '=',
        },
        templateUrl: '/interface/views/recruit/job-ads/partials/question-preview.html',
        link: function($scope) {
            $scope.isShowEligibility = true;
        }
    };
}]);