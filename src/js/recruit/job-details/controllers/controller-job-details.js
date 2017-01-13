angular.module('ui.recruit.jobs')
    .controller('jobDetailsCtrl', ['$scope', '$notify', '$routeParams', '$modal', 'JobDetailsService', 'EntityActionType', 'JobAdsService',
        'JobStatusConstants', '$location', 'Paths', 'JobLocation', '$window',
        function ($scope, $notify, $routeParams, $modal, JobDetailsService, EntityActionType, JobAdsService, JobStatusConstants, $location, Paths, JobLocation, $window) {
            $scope.EntityActionType = EntityActionType;
            $scope.JOB_STATUS_CONSTANTS = JobStatusConstants;
            $scope.jobLocation = JobLocation;

            //Control Variables
            $scope.controls = {
                isLoaded: false,
                showJobDetails: true,
                showJobApplicants: false,
                isError: false
            };
            
            $scope.urlParams = {
                jobId: $routeParams.jobId,
                tab: $routeParams.tab
            };

            /**
             * This is a hack. It has to reload the page. If we reload the page from angularJS, a lot a variables will be missing
             * @param page
             */
            $scope.goToPath = (page) => {
                $window.location.href = '/recruit/jobs/' + $scope.urlParams.jobId + '/' + page;
            }

            $scope.viewSwitcher = () => {
                if ($scope.urlParams.tab === 'details') {
                    $scope.controls.showJobDetails = true;
                    $scope.controls.showJobApplicants = false;
                } else if ($scope.urlParams.tab === 'applicants') {
                    $scope.controls.showJobDetails = false;
                    $scope.controls.showJobApplicants = true;
                } else {
                    $scope.controls.showJobDetails = true;
                    $scope.controls.showJobApplicants = false;
                }
            };

            $scope.viewSwitcher();

            $scope.jobId = $routeParams.jobId;
            JobDetailsService.getJobDetailsByJobId($scope.jobId).then(function (res) {
                $scope.jobDetail = res.jobAdsDetailsModel;
                $scope.jobAdsBoardsModel = res.jobAdsDetailsModel.jobPostsInfo;
                JobAdsService.searchKeyContact().then(function (response) {
                    $scope.jobAdsBoardsModel.siSelectKeyContacts = response.data;
                    $scope.jobAdsBoardsModel.siSelectKeyContacts.forEach(function (item) {
                        if (item.Value == $scope.jobAdsBoardsModel.siKeyContactId) {
                            $scope.jobAdsBoardsModel.siKeyContact = item;
                        }
                    });

                    JobAdsService.searchNetworkGroups().then(function (result) {
                        $scope.jobAdsBoardsModel.siNetworkGrousGroupIds = result.data;

                    }).finally(() => {
                        $scope.controls.isLoaded = true;
                    });
                });
            }, function () {
                $scope.controls.isError = true;
            });

            /**
             * Navigate within the page
             */
            $scope.navigateTo = (where) => {
                $('a.page_navigation').removeClass('is--active');
                $(`#id_nav_${where}`).addClass('is--active');
                $('body,html').animate({
                    scrollTop: $(`#id_section_${where}`).offset().top - 50
                }, 1000);
            };

            $scope.openModalManuallyAddApplicant = function (model) {
                $modal.open({
                    templateUrl: '/interface/views/recruit/job-application/partials/modal-add-applicant.html',
                    controller: 'modalManuallyAddApplicantCtrl',
                    locked: true
                }).result.then(() => {
                    $scope.$broadcast('_APPLICANTADDED_'); // Broadcasts to the applicant list directive that an applicant has been added
                });
            };

            /*
             * Modal for permanently close screen
             */
            $scope.permanentlyClose = (url) => {
                var modal = $modal.open({
                    templateUrl: '/interface/views/recruit/job-details/partials/job-details-modal-permanently-close.html',
                    controller: 'modalPermanentlyCloseCtrl',
                    size: 'lg',
                    locked: true,
                    resolve: {
                        closeUrl: () => { return url; }
                    }
                });

                modal.result.then(function () {
                    // modify data
                    $scope.jobDetail.statusCode = {
                        statusTitle: JobStatusConstants.JOB_STATUS_CLOSED,
                        statusStyle: 'label--negative'
                    }
                })
            };

            $scope.editJob = () => {
                $modal.open({
                    templateUrl: '/interface/views/recruit/job-ads/partials/create-job-ads.html',
                    controller: 'jobAdsCreateCtrl',
                    size: 'lg',
                    scope: $scope,
                    locked: true
                });
            };

            $scope.saveAssessor = (jobAdsAssessorModels, jobId) => {
                JobAdsService.addAssessor(jobAdsAssessorModels, jobId).then(function (res) {
                    $notify.add({
                        message: 'Changes saved.',
                        type: 'success'
                    });
                });
            };

            $scope.duplicateJob = (jobId) => {
                $scope.controls.isLoaded = false;
                JobDetailsService.duplicateJobById(jobId).then(function (res) {
                    $notify.add({
                        message: 'Job advertisement ' + jobId + ' has been duplicated',
                        type: 'success'
                    });
                     $location.path(Paths.get('recruit.jobs.edit', res.data).path);
                }).finally(() => {
                    $scope.controls.isLoaded = true;
                });
            }
        }]);