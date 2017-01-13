//TODO: this directive is base on the data from the old api, it may be change when we have the new api
angular.module('ui.recruit')
.directive('questionDetails', ['QuestionType', function(QuestionType) {
    return {
        restrict: 'E',
        scope: {
            model: '='
        },
        templateUrl: '/interface/views/recruit/job-ads/partials/question-details.html',
        controller: ['$scope', function($scope) {
            $scope.QuestionType = QuestionType;
        }]
    };
}]);