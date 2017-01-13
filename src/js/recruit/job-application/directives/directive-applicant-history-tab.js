angular.module('ui.recruit.jobs')
.directive('applicantHistoryTab', ['ApplicationStatusConstants', 'JobTypeConstants', 'JobStatusConstants', 'ApplicantHistoryService', 'EntityActionType', '$routeParams', '$window',
    function(ApplicationStatusConstants, JobTypeConstants, JobStatusConstants, ApplicantHistoryService, EntityActionType, $routeParams, $window) {
        return {
            restrict: 'E',
            templateUrl: '/interface/views/recruit/job-application/partials/applicant-history-tab.html',
            scope:{
                memberId: '='
            },
            link: function(scope) {
                scope.ApplicantHistoryControls = {
                    uriParams: {
                        jobId: +$routeParams.jobId
                    }
                };
                scope.JobStatusConstants = JobStatusConstants;
                scope.openJobStatues = [JobStatusConstants.JOB_STATUS_ACTIVE, JobStatusConstants.JOB_STATUS_PUBLISHED];
                scope.closedJobStatues = [JobStatusConstants.JOB_STATUS_CLOSED];
                scope.EntityActionType = EntityActionType;

                var unwatch = scope.$watch('memberId', function(newVal, oldVal) {
                    scope.historyLoading = true;
                    if(newVal) {
                        prepareHistory();
                        //Remove the watcher
                       unwatch();
                    }
                });

                function prepareHistory() {
                    ApplicantHistoryService.getCandidateApplicationHistory(scope.memberId).then(function(res) {
                        scope.candidateHistory = res;
                    }).then(function() {
                        scope.previouslyEmployed = _.filter(scope.candidateHistory.appliedJobApplications, function(o) {
                            return ApplicationStatusConstants.APPLICATION_STATUS_EMPLOYED === o.applicationStatus;
                        });
                        scope.openJobs = _.filter(scope.candidateHistory.appliedJobApplications, function(o) {
                            return _.contains(scope.openJobStatues, o.jobStatuscode);
                        });
                        scope.closedJobs = _.filter(scope.candidateHistory.appliedJobApplications, function(o) {
                            return _.contains(scope.closedJobStatues, o.jobStatuscode);
                        });
                    }).finally(function() {
                        scope.historyLoading = false;
                    });
                }

                /**
                 * Refresh's the view on any data change, broadcast variable is passed from controller-application-details.
                 * On the _HISTORYUPDATE_ value broadcasted this function is executed.
                 */
                scope.$on('_HISTORYUPDATE_', () => {
                    prepareHistory(); // Refresh's the current view when a statues change has been made on the application.
                });

                /**
                 * This is a hack. It has to reload the page. If we reload the page from angularJS, a lot a variables will be missing
                 * @param job
                 */
                scope.goToPath = (job) => {
                    $window.location.href = '/recruit/jobs/' + job.jobId + '/applications/' + job.jobApplicationId;
                }
            }
        };
}]);