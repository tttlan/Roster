angular.module('ui.recruit')
    .directive('jobAdsPreviewInfo', ['SalaryType', 'JobLocation', function(SalaryType, JobLocation) {
        return {
            restrict: 'E',
            scope: {
                jobDetail:        '=',
                isShowJobSummary: '=?',
                isShowJobBody:    '=?',
            },
            templateUrl: '/interface/views/recruit/job-details/partials/job-ads-preview-info.html',
            link: function($scope) {
                $scope.salaryType = SalaryType;
                $scope.jobLocation = JobLocation;
            }
        };
    }]);