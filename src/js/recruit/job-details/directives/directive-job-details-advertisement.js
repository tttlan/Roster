angular.module('ui.recruit')
    .directive('jobDetailsAdvertisement', ['SalaryType', 'JobLocation', function(SalaryType, JobLocation) {
        return {
            restrict: 'E',
            scope: {
                jobDetail: '='
            },
            templateUrl: '/interface/views/recruit/job-details/partials/job-details-advertisement.html',
            link: function($scope) {
                //Load the constants
                $scope.salaryType = SalaryType;
                $scope.jobLocation = JobLocation;
            }
        };
    }]);