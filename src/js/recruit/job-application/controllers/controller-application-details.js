angular.module('ui.recruit.jobs')
    .controller('applicationDetailsCtrl', ['$scope', 'JobApplicantDetailsService', '$location', 'Url', '$modal', 'Paths', '$q', 'JobApplicantSearchSingleton', '$routeParams', 'NotesService', 'ApplicantHistoryService', 'ApplicationStatusConstants', 'Permissions', 'ApplicantItemModel', 'EntityActionType',
        function($scope, JobApplicantDetailsService, $location, Url, $modal, Paths, $q, JobApplicantSearchSingleton, $routeParams, NotesService, ApplicantHistoryService, ApplicationStatusConstants, Permissions, ApplicantItemModel, EntityActionType) {

        //Instance of the search results to use to navigate between it on the application list
        $scope.uriParams = {
                jobId: $routeParams.jobId,
                applicationId: $routeParams.applicationId
            };

        $scope.EntityActionType = EntityActionType;
        if (JobApplicantSearchSingleton.data != null) {
            $scope.showNavPill = true;
            $scope.searchResultsList = JobApplicantSearchSingleton.data;
            $scope.currentIndex = _.findIndex($scope.searchResultsList, {'id': +$scope.uriParams.applicationId});
            $scope.displayCount = $scope.currentIndex + 1; //increment the count so that the display number is not 0
            $scope.lastIndex = _.findLastIndex($scope.searchResultsList);// find last index no of the list.

            //This block allows the navigation to go back around to the last applicant and to the first from the last applicant.
            var backIndex = null;
            var forwardIndex = null;
            if ($scope.currentIndex == 0) { //check if the current item is the first in list and set the back as the last in the index.
                backIndex = $scope.lastIndex;
            } else {
                backIndex = $scope.currentIndex - 1;
            }
            $scope.backId = $scope.searchResultsList[backIndex].id;

            if ($scope.lastIndex == $scope.currentIndex) { // check if the current item is the last item in the list and go back to the start.
                forwardIndex = 0;
            } else {
                forwardIndex = $scope.currentIndex + 1;
            }
            $scope.forwardId = $scope.searchResultsList[forwardIndex].id;
        }

        $scope.changeApplicant = function(countNumber) {
            var indexNo = +countNumber -1;
            // allow users to manaually select an applicant in the navigation panel
            if (indexNo <= $scope.lastIndex && indexNo >= 0 ) {
                var newId = $scope.searchResultsList[indexNo].id;
                let goToPath = Paths.get('recruit.jobs.applications.detail', $scope.uriParams.jobId, newId).path;
                $location.path(goToPath).search({tab: 'application'});
            }
        };

        $scope.getApplicantDetails = (applicationId) => {
            $scope.isLoading = true;
            JobApplicantDetailsService.getApplicantDetails(applicationId).then(function(model) {
                if(!model) {
                    //Redirect user to another page if an applicant is not returned.
                    $location.path(Paths.get('recruit.jobs.index').path);
                } else {
                    $scope.applicantDetails = model;
                    $scope.initTabs();
                }
            }).then(function() {
                if ($scope.applicantDetails.Information.MemberId) {
                    $scope.memberId = $scope.applicantDetails.Information.MemberId;
                }
            }).finally(function() {
                $scope.isLoading = false;
            });
        }

        $scope.openModalSendEmail = function(model) {
            var modal = $modal.open({
                templateUrl: '/interface/views/recruit/job-application/partials/modal-send-email.html',
                controller: 'modalSendEmailCtrl',
                classes: "send-email",
                size: 'lg',
                locked:true,
                resolve: {
                    jobId : () => $scope.uriParams.jobId,
                    recipients : () => [new ApplicantItemModel(
                        $scope.applicantDetails.JobApplicationId,
                        $scope.applicantDetails.Information.FirstName,
                        $scope.applicantDetails.Information.Surname,
                        $scope.applicantDetails.EmailContact.Email
                    )],
                    sendEmailUrl : () => $scope.applicantDetails.userCan($scope.EntityActionType.CanSendEmail).ActionUrl
                },
            });
        };

        $scope.initTabs = function() {
            $scope.$tabData = [
                { title: 'Application', path: 'application'}
            ];

            if ($scope.applicantDetails.userCan(EntityActionType.CanViewCandidateLogs)) {
                $scope.$tabData.push({ title: 'Log', path: 'log'});
            }

            if ($scope.applicantDetails.userCan(EntityActionType.CanViewCandidateHistories)) {
                $scope.$tabData.push({ title: 'History', path: 'history'});
            }

            function getIndOfPath(path) {
                for(var i = $scope.$tabData.length; i--;) {
                    if($scope.$tabData[i].path === path) {
                        return i;
                    }
                }
                return -1;
            }

            var currentLocation = $location.search().tab,
                tabLocation = getIndOfPath(currentLocation);

            $scope.activeTabIndex = (currentLocation && tabLocation > -1) ? (tabLocation + 1) : 1;
        }

        function updateUrl(ind) {
            $location.search({ tab: $scope.$tabData[ind].path });
        }

        $scope.changeStatus = (model, newStatus) => {
            $scope.isUpdatingStatus = true;
            JobApplicantDetailsService.changeApplicationStatus(model, newStatus).then(function() {
                $scope.isLoading = false;
                $scope.getApplicantDetails($scope.uriParams.applicationId);
            })
            .finally(function() {
                $scope.$broadcast('_LOGUPDATE_'); // Broadcasts to the logs tab directive that the applicant's status has been changed
                $scope.$broadcast('_HISTORYUPDATE_'); // Broadcasts to the history tab directive that the applicant's status has been changed
                $scope.isUpdatingStatus = false;
            });
        };

            // Looks for any sibling (directives) changes emitted and broadcasts the update to the relevant directives.
            $scope.$on('_SIBLINGCHANGE_', () => {
                $scope.$broadcast('_LOGUPDATE_'); // Broadcasts to the logs tab directive that a change has been made.
                $scope.$broadcast('_HISTORYUPDATE_'); // Broadcasts to the history tab directive that a change has been made.
            });
        $scope.getApplicantDetails($scope.uriParams.applicationId);
}]);
