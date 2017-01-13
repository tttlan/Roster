angular.module('ui.recruit.jobs')
    .directive('applicantLogsTab', ['ApplicantLogsService', '$routeParams', 'ReactionConstants', function(ApplicantLogsService, $routeParams, ReactionConstants) {
        return {
            restrict: 'E',
            templateUrl: '/interface/views/recruit/job-application/partials/application-logs.html',
            link: function(scope) {
                scope.ReactionConstants = ReactionConstants;
                scope.ApplicationControl = {
                    uriParams: {
                        applicationId: +$routeParams.applicationId
                    }
                };

                scope.getApplicantLogs = () => {
                    scope.logsLoading = true;
                    ApplicantLogsService.getApplicantLogs(scope.ApplicationControl.uriParams.applicationId).then((res) => {
                        scope.logsModel = res.logs;
                    }).finally(() => {
                        scope.logsLoading = false;
                    });
                }

                scope.getApplicantLogs();

                /**
                 * Refresh's the view on any data change, broadcast variable is passed from controller-application-details, directive-applicant-notes,
                 * and directive-notes-inline-edit.
                 * On the _LOGUPDATE_ value broadcasted this function is executed.
                 */
                scope.$on('_LOGUPDATE_', () => {
                    scope.getApplicantLogs(); // Refresh's the current view when a statues change has been made on the application.
            });
            }
        };
    }]);