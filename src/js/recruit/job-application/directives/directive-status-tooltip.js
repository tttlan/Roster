angular.module('ui.recruit.jobs')
    .directive('statusTooltip', function() {
        return {
            restrict: 'E',
            templateUrl: '/interface/views/recruit/job-application/partials/status-tooltip.html',
            scope: {
                statusChangeCount: '=',
                status: '='
            }
        };
    });