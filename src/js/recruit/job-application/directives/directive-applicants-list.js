angular.module('ui.recruit.jobs')
    .directive('applicantsList', ['JobApplicantListService', '$routeParams', '$location', '$modal', 'JobApplicantSearchSingleton',
        'EntityActionType', 'StatusChangeModel', 'StatusItemModel', 'DocumentViewerSingleton', 'DocumentList', 'ApplicantListOrderBy',
        function(JobApplicantListService, $routeParams, $location, $modal, JobApplicantSearchSingleton, EntityActionType, StatusChangeModel, StatusItemModel,
                 DocumentViewerSingleton, DocumentList, ApplicantListOrderBy) {
        return {
            restrict: 'E',
            templateUrl: '/interface/views/recruit/job-application/partials/application-list.html',
            controller: ($scope, $element, $attrs, EntityActionType) => {
                $scope.APPLICANT_LIST_ORDER_BY = ApplicantListOrderBy; //Constant

                //Control Variables for the applicant list
                $scope.ApplicantListControls = {
                    searchApplicantName: null,
                    performingUserAction: false,
                    selectedApplicants: [],
                    checkboxSelectAll: false,
                    uriParams: {
                        jobId: $routeParams.jobId
                    },
                    statusFilter: { // Used for the status filter drop down list to switch currently selected label Jorgen code might need one of these fields for search with status
                        statusFilterData: null,
                        selectedFilterItem: null,
                        filterDataInitialised: false,
                        selectedAllApplicants: false
                    },
                    changeStatusList: null, // Used to display a list of status that an applicant can be changed too
                    userCan: null,
                    $$actions: null,
                    entityActionType: EntityActionType,
                    sortingValue: null,
                    sortingArrows : {
                        applicantSortingArrow: true,
                        statusSortingArrow: true,
                        elapsedSortingArrow: true,
                        notesSortingArrow: true
                    }
                };

                $scope.getStatusFilter = () => {
                   return JobApplicantListService.getStatusFilterData($scope.ApplicantListControls.uriParams.jobId).then(function(res) {
                       $scope.ApplicantListControls.statusFilter.statusFilterData = res;
                       $scope.ApplicantListControls.changeStatusList = res.data;

                       if(!$scope.ApplicantListControls.statusFilter.filterDataInitialised) {
                           $scope.ApplicantListControls.statusFilter.selectedFilterItem = new StatusItemModel(
                               res.data[0].id,
                               res.data[0].name,
                               res.data[0].color,
                               res.data[0].count
                           );
                           $scope.ApplicantListControls.statusFilter.filterDataInitialised = true;
                       }
                    });
                };


                /*  This code is needed for the below $watchCollection on page.items.
                *   Data added to the singleton in the watch function is used in the applicant details view to switch
                *   between applicants.
                */
                $scope.page = {
                    items: []
                };

                $scope.$watchCollection('page.items', (newVal, oldVal) => {
                    if(newVal !== oldVal) {
                        JobApplicantSearchSingleton.data = $scope.page.items;
                    }
                });

                /*
                 * Search for applicant
                 * For this version, the search is not a live search
                 * We are using a delay and a length check to determine when to call the api
                 * @param $event
                 */
                $scope.listenToUser = () => {
                    $scope.ApplicantListControls.performingUserAction = true;
                    $scope.ApplicantListControls.selectedApplicants = []; // Empties array of selected applicants on search
                    $scope.page.search();
                };

                $scope.filterListByStatus = (statusId = null) => {
                    if(statusId) {
                        $scope.ApplicantListControls.statusFilter.statusFilterData.data.map((status) => {
                            if(statusId == status.id) {
                                $scope.ApplicantListControls.statusFilter.selectedFilterItem.id = status.id;
                                $scope.ApplicantListControls.statusFilter.selectedFilterItem.name = status.name;
                                $scope.ApplicantListControls.statusFilter.selectedFilterItem.color = status.color;
                                $scope.ApplicantListControls.statusFilter.selectedFilterItem.count = status.count;
                                $scope.ApplicantListControls.statusFilter.selectedAllApplicants = false;
                            }
                        });
                    } else {
                        $scope.ApplicantListControls.statusFilter.selectedFilterItem.id = null;
                        $scope.ApplicantListControls.statusFilter.selectedFilterItem.name = "All Applicants";
                        $scope.ApplicantListControls.statusFilter.selectedFilterItem.color = null;
                        $scope.ApplicantListControls.statusFilter.selectedFilterItem.count = $scope.ApplicantListControls.statusFilter.statusFilterData.totalApplicationCount;
                        $scope.ApplicantListControls.statusFilter.selectedAllApplicants = true;
                    }

                    $scope.ApplicantListControls.selectedApplicants = []; // Empties array of selected applicants on filter
                    $scope.page.search(); // Somehow this does the job of $scope.page.update
                };

                $scope.changeStatus = (statusId) => {
                    let applicantIdArray = []; // Array to store all applicant id's

                    $scope.ApplicantListControls.selectedApplicants.map((applicant) => {
                        applicantIdArray.push(applicant.id);
                    });

                    // Instantiate an instance of StatusChangeModel
                    let statusChange = new StatusChangeModel(statusId, applicantIdArray);

                    JobApplicantListService.changeStatus(statusChange,
                        $scope.ApplicantListControls.userCan($scope.ApplicantListControls.entityActionType.CanChangeStatusApplication).ActionUrl).then((response) => {
                        $scope.ApplicantListControls.selectedApplicants = []; // Empties selected array of selected applicants on status change
                        $scope.page.search(); // Somehow this does the job of $scope.page.update
                    });
                };

                $scope.getApplicantsList = (page, pageSize) => {
                    return $scope.getStatusFilter().then(() => {
                        // updates the selected status filter count when any change has been made to the applicant list. i.e. status change is the man case for this map call
                        $scope.ApplicantListControls.changeStatusList.map((status) => {
                            if($scope.ApplicantListControls.statusFilter.selectedFilterItem.id === status.id) {
                                $scope.ApplicantListControls.statusFilter.selectedFilterItem.count = status.count;
                            }
                        });
                
                        return JobApplicantListService.getApplicantsList(
                            $scope.ApplicantListControls.uriParams.jobId,
                            $scope.ApplicantListControls.statusFilter.selectedFilterItem.id,
                            $scope.ApplicantListControls.searchApplicantName,
                            page,
                            pageSize,
                            $scope.ApplicantListControls.sortingValue
                        ).then((response) => {
                            $scope.ApplicantListControls.$$actions = angular.copy(response.data.$$actions);
                            $scope.ApplicantListControls.userCan = angular.copy(response.data.userCan);
                            response.data.headers = angular.copy(response.headers);
                            return response.data;
                        }).finally(() => {
                            $scope.ApplicantListControls.performingUserAction = false; // stops the search spinner when everything is done?
                        });
                    });
                };

                $scope.isSelectedAll = () => {
                    $scope.ApplicantListControls.checkboxSelectAll = !$scope.ApplicantListControls.checkboxSelectAll;
                    $scope.page.items.map((applicant)=> {
                        if($scope.ApplicantListControls.checkboxSelectAll && !applicant.select) {
                            applicant.select = true;
                            $scope.select(applicant);
                        } else if(!$scope.ApplicantListControls.checkboxSelectAll && applicant.select) {
                            applicant.select = false;
                            $scope.select(applicant);
                        }
                    });
                };

                $scope.select = (applicant) => {
                    if (_.isEmpty(_.remove($scope.ApplicantListControls.selectedApplicants, applicant))) {
                        $scope.ApplicantListControls.selectedApplicants.push(applicant);
                    }
                };

                /**
                 * OrderBy the column
                 * $scope.page.search() will automatically perform the API call once the sorting value has been selected
                 * @param orderBy
                 */
                $scope.orderBy = (orderBy) => { // Hack fix to sorting as the pagination directive orderBY function is buggy
                    let temp = '';
                    switch(orderBy) {
                        case ApplicantListOrderBy.APPLICANT:
                            $scope.ApplicantListControls.sortingArrows.applicantSortingArrow = !$scope.ApplicantListControls.sortingArrows.applicantSortingArrow;
                            temp = !$scope.ApplicantListControls.sortingArrows.applicantSortingArrow ? 'asc' : 'desc';
                            $scope.ApplicantListControls.sortingValue = ApplicantListOrderBy.APPLICANT + " " + temp;
                            break;
                        case ApplicantListOrderBy.STATUS:
                            $scope.ApplicantListControls.sortingArrows.statusSortingArrow = !$scope.ApplicantListControls.sortingArrows.statusSortingArrow;
                            temp = !$scope.ApplicantListControls.sortingArrows.statusSortingArrow ? 'asc' : 'desc';
                            $scope.ApplicantListControls.sortingValue = ApplicantListOrderBy.STATUS + " " + temp;
                            break;
                        case ApplicantListOrderBy.ELAPSE:
                            $scope.ApplicantListControls.sortingArrows.elapsedSortingArrow = !$scope.ApplicantListControls.sortingArrows.elapsedSortingArrow;
                            temp = !$scope.ApplicantListControls.sortingArrows.elapsedSortingArrow ? 'asc' : 'desc';
                            $scope.ApplicantListControls.sortingValue = ApplicantListOrderBy.ELAPSE + " " + temp;
                            break;
                        case ApplicantListOrderBy.NOTES:
                            $scope.ApplicantListControls.sortingArrows.notesSortingArrow = !$scope.ApplicantListControls.sortingArrows.notesSortingArrow;
                            temp = !$scope.ApplicantListControls.sortingArrows.notesSortingArrow ? 'asc' : 'desc';
                            $scope.ApplicantListControls.sortingValue = ApplicantListOrderBy.NOTES + " " + temp;
                            break;
                        default:
                            throw new Error(`Column '${orderBy}' does not exist`);
                    }

                    $scope.page.search(); // Somehow this does the job of $scope.page.update
                };

                $scope.viewDocument = (documentUrl, filename, docType) => {
                    let urlList = [],
                        documentName;

                    if (filename) {
                        filename = filename.replace(' ', '_').toLowerCase();

                        let extension = filename.split('.');

                        extension.splice(extension.length - 1, 1)
                        documentName = extension.join('_'); // .splice to remove old filetype from the name
                    } else {
                        documentName = docType; // used if api passes null for any reason.
                    }

                    urlList.push(documentUrl+'&filename='+documentName);

                    let list = new DocumentList(urlList);

                    DocumentViewerSingleton.data = list;
                    $location.path(`/recruit/jobs/documents`);
                };

                $scope.openModalSendEmail = function(model) {
                    var modal = $modal.open({
                        templateUrl: '/interface/views/recruit/job-application/partials/modal-send-email.html',
                        controller: 'modalSendEmailCtrl',
                        classes: "send-email",
                        size: 'lg',
                        locked:true,
                        resolve: {
                            jobId : () => $scope.ApplicantListControls.uriParams.jobId,
                            recipients : () => angular.copy($scope.ApplicantListControls.selectedApplicants),
                            sendEmailUrl : () => $scope.ApplicantListControls.userCan($scope.ApplicantListControls.entityActionType.CanSendEmail).ActionUrl
                        }
                    }).result.then (() => {
                        $scope.ApplicantListControls.selectedApplicants = [];
                        $scope.page.search(); // Refresh's the current view when an email has been sent out
                    });
                };
                
                $scope.openModalAddNote = function(model) {
                    $modal.open({
                        templateUrl: '/interface/views/recruit/job-application/partials/modal-add-note.html',
                        controller: 'modalAddNoteCtrl',
                        locked:true,
                        resolve: {
                            selectedApplicants: () => angular.copy($scope.ApplicantListControls.selectedApplicants),
                            jobId: () => $routeParams.jobId,
                            cachedApplicantList: () => [],
                            addCommentUrl: () => $scope.ApplicantListControls.userCan($scope.ApplicantListControls.entityActionType.CanAddComment).ActionUrl
                        }
                    }).result.then (() => {
                        $scope.ApplicantListControls.selectedApplicants = [];
                        $scope.page.search(); // Refresh's the current view when a note has been added
                    });
                };

                /**
                 * Refresh's the list on an applicant being created, broadcast variable is passed from controller-job-details
                 * On the _APPLICANTADDED_ value existing this function is executed.
                 */
                $scope.$on('_APPLICANTADDED_', () => {
                    $scope.ApplicantListControls.selectedApplicants = [];
                    $scope.page.search(); // Refresh's the current view when a note has been added
                });
            }
        };
    }]);