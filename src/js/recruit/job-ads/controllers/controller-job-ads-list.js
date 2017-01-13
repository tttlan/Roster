angular.module('ui.recruit.jobs')
    .controller('jobAdsListCtrl', ['$scope', '$modal', 'JobAdsService', '$notify', 'JobAdsOrderBy', 'EntityActionType', '$location', 'JobStatusConstants', 'JobDetailsService', '$timeout', '$routeParams',
        function ($scope, $modal, JobAdsService, $notify, JobAdsOrderBy, EntityActionType, $location, JobStatusConstants, JobDetailsService, $timeout, $routeParams) {

            //#region Define globle variables 
            var _this = this;
            _this.pageSize = 10;
            _this.isSearchMode = false; // detect when we use Search function
            $scope.predicate = ''; // default is not order by
            $scope.column = '';
            $scope.reverse = null;
            $scope.EntityActionType = EntityActionType;
            $scope.JOB_ADS_ORDER_BY = JobAdsOrderBy; //Constant
            $scope.JOB_STATUS_CONSTANTS = JobStatusConstants; //Constant 

            //#region Control Variables for the landing page
            $scope.jobAdsControls = {
                searchNewJobAds: '',
                performingUserAction: false,
                sortingArrows: {
                    jobSortingArrow: true,
                    locationSortingArrow: true,
                    elapseSortingArrow: true,
                    applicantSortingArrow: true,
                    statusSortingArrow: true
                }
            };
            //#endregion

            //#endregion

            //#region public functions

            //#region function getJobAdsList
            $scope.getJobAdsList = (page) => {
                $scope.jobAdsControls.performingUserAction = true;
                return JobAdsService.searchJobAds($scope.jobAdsControls.searchNewJobAds, page, _this.pageSize)
                    .then((response) => {
                        $scope.jobAdsControls.$$actions = angular.copy(response.$$actions);
                        $scope.jobAdsControls.userCan = angular.copy(response.userCan);
                        return response;
                    }).finally(() => {
                        $scope.jobAdsControls.performingUserAction = false;
                    });
            };
            //#endregion

            //#region searchJobs function
            $scope.searchJobs = () => {
                _this.isSearchMode = true;
                resetListJobs();
            };
            //#endregion

            //#region removeSearchJobAds function
            $scope.removeSearchJobAds = () => {
                $scope.jobAdsControls.searchNewJobAds = '';
                if (_this.isSearchMode) {
                    resetListJobs();
                }
            };
            //#endregion

            //#region onSearchStringChanged function
            $scope.onSearchStringChanged = () => {
                if ($scope.jobAdsControls.searchNewJobAds === '' && _this.isSearchMode) {
                    resetListJobs();
                }
            };
            //#enderegion

            //#region orderBy function
            $scope.orderBy = (column, predicate) => {
                $scope.reverse = angular.equals($scope.column, column) ? !$scope.reverse : false;
                $scope.predicate = predicate;
                $scope.column = column;
            };
            //#endregion

            //#region Open modal create jobs
            $scope.createJob = () => {
                var modal = $modal.open({
                    templateUrl: '/interface/views/recruit/job-ads/partials/create-job-ads.html',
                    controller: 'jobAdsCreateCtrl',
                    size: 'lg',
                    locked: true
                });

                modal.result.then(function (res) {
                    resetListJobs(); // reload data from DB
                });
            };
            //#endregion

            //#region function editJob
            $scope.editJob = (id, status, index) => {
                if (status !== JobStatusConstants.JOB_STATUS_DRAFT) {
                    var url = "/recruit/jobs/" + id;
                    $location.path(url);
                } else {
                    $scope.isLoading = true;
                    JobDetailsService.getJobDetailsByJobId(id).then(function(res) {
                        $scope.jobDetail = res.jobAdsDetailsModel;
                        let modal = $modal.open({
                            templateUrl: '/interface/views/recruit/job-ads/partials/create-job-ads.html',
                            controller: 'jobAdsCreateCtrl',
                            size: 'lg',
                            scope: $scope,
                            locked: true
                        });
                        modal.result.then((result) => {
                            if (result.jobDetail) {
                                $scope.page.items[index].location = result.jobDetail.locationText;
                                $scope.page.items[index].title = result.jobDetail.jobTitle;
                                $scope.page.items[index].statusCode = result.jobDetail.statusCode;    
                            }
                        });
                    }).finally(() => {
                        $scope.isLoading = false;
                    });
                }
            };
            //#endregion

            //#endregion

            //#region Private function

            var resetListJobs = () => {
                $timeout(() => {
                    $scope.predicate = ''; // reset order by
                    $scope.reverse = null; //reset direction
                    $scope.page.search(); // clean current data in table
                }, 0);
            };

            //#endregion
            
            $scope.editedJobId = $routeParams.jobId;
            if ($scope.editedJobId) {
                $scope.editJob($scope.editedJobId, JobStatusConstants.JOB_STATUS_DRAFT);
            }
            
        }]);