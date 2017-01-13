angular.module('ui.recruit')
    .directive('jobDetailsInformation', ['SalaryType', 'JobLocation', function(SalaryType, JobLocation) {
        return {
            restrict: 'E',
            scope: {
                jobDetail: '='
            },
            templateUrl: '/interface/views/recruit/job-details/partials/job-details-information.html',
            link: function($scope) {
                //Load the constants
                $scope.salaryType = SalaryType;
                $scope.jobLocation = JobLocation;
            }
        };
    }]);