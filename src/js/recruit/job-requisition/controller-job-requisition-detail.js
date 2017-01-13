angular.module('ui.recruit.job-requisition')

    .controller('jobRequisitionDetailCtrl', [
        '$scope', 'REQUISITION_STATUS', 'REQUISITION_ACTION', '$timeout', '$window', '$location', 'Paths', '$notify', '$routeParams', 'JobRequisitionService', 'JobRequisitionDetailModel', 'Networks', '$modal', 'JobDetailsService', 'EntityActionType', 'JobStatusConstants',
        function ($scope, REQUISITION_STATUS, REQUISITION_ACTION, $timeout, $window, $location, Paths, $notify, $routeParams, JobRequisitionService, JobRequisitionDetailModel, Networks, $modal, JobDetailsService, EntityActionType, JobStatusConstants) {

            //#region Define global variable
            var _this = this;
            $scope.EntityActionType = EntityActionType;
            $scope.REQUISITION_STATUS = REQUISITION_STATUS;
            $scope.REQUISITION_ACTION = REQUISITION_ACTION;
            $scope.isLoading = false;
            $scope.isEditingRequisition = {
                Role: false,
                Group: false,
                CanSave: false
            };
            $scope.locationList = null; // contain list location from api
            $scope.roleList = null; // contain list role from api
            $scope.Requisition = null;

            _this.tempRequisition = null; // reflect to real data

            //#region DropDown variables
            $scope.showDropdownFor = '';
            $scope.isSelected = false;
            var currentLabel = null;
            $scope.tempLabel = '';
            $scope.isChangedInput = false;
            //#endregion

            //#endregion

            //#region init function
            $scope.init = function () {

                getRequisitionLocationList();
                getRoleList();
                getJobRequisition($routeParams.id);
            };
            //#endregion

            //#region processRequisition function
            $scope.processRequisition = function (action) {
                $scope.isLoading = true;
                switch (action) {
                    case REQUISITION_ACTION.SUBMIT:
                        submitRequisition($scope.Requisition);
                        break;

                    case REQUISITION_ACTION.APPROVE:
                        approveRequisition($scope.Requisition.Permissions.canapprovejobrequisition);
                        break;

                    case REQUISITION_ACTION.EXECUTE:
                        executeRequisition($scope.Requisition.Permissions.canexecutejobrequisition);
                        break;

                    case REQUISITION_ACTION.REJECT:
                        rejectRequisition($scope.Requisition.Permissions.canrejectjobrequisition);
                        break;

                    case REQUISITION_ACTION.CANCEL:
                        cancelRequisition($scope.Requisition.Permissions.cancanceljobadrequisition);
                        break;

                    case REQUISITION_ACTION.SAVE_AS_DRAFT:
                        updateRequisition($scope.Requisition, true);
                        break;

                    case REQUISITION_ACTION.SAVE:
                        updateRequisition($scope.Requisition, false);
                        break;

                    case REQUISITION_ACTION.DELETE:
                        deleteRequisition($scope.Requisition.Permissions.candeletejobadrequisition);
                        break;

                    case REQUISITION_ACTION.CHANGE_REQ:
                        throw new Error("Not implemented yet");
                        break;

                    case REQUISITION_ACTION.ARCHIVE:
                        archiveRequisition($scope.Requisition.Permissions.canarchivejobadrequisition);
                        break;

                }
            };
            //#endregion

            //#region function redirectToList()
            $scope.redirectToList = () => {
                $location.path(Paths.get('recruit.requisition.list').path);
            };
            //#endregion

            //#region updateRequisitionField function : when user click 'Edit' or "Cancel'
            //When clicking edit button in form
            $scope.updateRequisitionField = function (field) {
                if (field === 'ROLE') {
                    $scope.isEditingRequisition.Role = ($scope.isEditingRequisition.Role !== true);
                } else {
                    $scope.isEditingRequisition.Group = ($scope.isEditingRequisition.Group !== true);
                }
            };
            //#endregion

            //#region onSelect function : when user choose an item in list autocomplete
            $scope.onSelect = function (data, option) { //option: ROLE || LOCATION
                if (option === 'ROLE') {
                    $scope.Requisition.Role = angular.copy(data);
                    currentLabel = angular.copy($scope.Requisition.Role.Description);
                } else {
                    $scope.Requisition.Group = angular.copy(data);
                    currentLabel = angular.copy($scope.Requisition.Group.GroupName);
                }

                $scope.isChangedInput = false;
                $scope.isSelected = true;

                $scope.isEditingRequisition.CanSave = !!($scope.Requisition.Role.RoleId !== _this.tempRequisition.Role.RoleId ||
                    $scope.Requisition.Group.NetworkGroupId !== _this.tempRequisition.Group.NetworkGroupId);
            };
            //#endregion

            //#region Dropdown list function
            //When focus on a dropdown list
            $scope.onFocusOrOnBlurDropdown = (field, data) => {
                $scope.showDropdownFor = field;

                if (!angular.isUndefined(data)) {
                    $scope.tempLabel = data;
                    $scope.isChangedInput = false;
                }
            };

            //When user change the text box but don't select the option
            $scope.resetLabel = (field) => {
                if (field === 'Role' && $scope.isSelected === false && !_.isNull($scope.Requisition.Role)) {
                    $scope.Requisition.Role.Description = angular.copy($scope.tempLabel);
                } else if (field === 'Location' && $scope.isSelected === false && !_.isNull($scope.Requisition.Group)) {
                    $scope.Requisition.Group.GroupName = angular.copy($scope.tempLabel);
                }
            };

            //When user type in the input on selectbox
            $scope.onChangeInput = (keyword) => {
                if (keyword !== currentLabel) {
                    $scope.isChangedInput = true;
                    $scope.isSelected = false;
                }
            };

            //#endregion

            //#region removeField function : when user click icon 'cross'
            $scope.removeField = function (field) {
                if (field === 'ROLE') {
                    $scope.Requisition.Role = null;
                } else {
                    $scope.Requisition.Group = null;
                }
            };
            //#endregion

            //#region resetField function
            $scope.resetField = function (field) {
                if (field === 'ROLE') {
                    $scope.Requisition.Role = _this.tempRequisition.Role;
                } else {
                    $scope.Requisition.Group = _this.tempRequisition.Group;
                }

                $scope.isEditingRequisition.CanSave = !!($scope.Requisition.Role.RoleId !== _this.tempRequisition.Role.RoleId ||
                    $scope.Requisition.Group.NetworkGroupId !== _this.tempRequisition.Group.NetworkGroupId);
            };
            //#endregion

            //#region function backToList()
            $scope.backToList = (Requisition) => {
                if ((Requisition.Role && Requisition.Role.RoleId !== _this.tempRequisition.Role.RoleId) || (Requisition.Group && Requisition.Group.NetworkGroupId !== _this.tempRequisition.Group.NetworkGroupId)) {
                    var message = 'Do you want to save changes?';
                    var modal = $modal.open({
                        templateUrl: '/interface/views/recruit/job-requisition/partials/modal-confirm-back-to-list.html',
                        controller: 'modalConfirmBackToListCtrl',
                        size: 'sm',
                        animationType: 'flipVertical',
                        resolve: {
                            Data: function () {
                                return {
                                    Requisition: Requisition,
                                    Message: message
                                };
                            }
                        }
                    });

                    modal.result.then(function (confirm) {
                        if (confirm) {
                            updateRequisition($scope.Requisition, true);
                        } else {
                            $scope.redirectToList();
                        }
                    });

                } else {
                    $scope.redirectToList();
                }
            };
            //#endregion

            //#region function viewJob(JobId)
            $scope.viewJob = (jobId) => {
                if($scope.jobDetail){
                    $location.path(Paths.get('recruit.jobs.edit', jobId).path);
                } else {
                    $scope.isLoading = true;
                    JobDetailsService.getJobDetailsByJobId(jobId).then(function (res) {
                        $scope.jobDetail = res.jobAdsDetailsModel;
                        if($scope.jobDetail.statusCode.statusTitle === JobStatusConstants.JOB_STATUS_DRAFT) {
                            $location.path(Paths.get('recruit.jobs.edit', jobId).path);
                        } else {
                            $location.path(Paths.get('recruit.jobs.view', jobId).path);
                        }
                    }).finally(function () {
                        $scope.isLoading = false;
                    });
                }
            };
            //#endregion


            //#region Private functions
            var resetEditingState = () => {
                $scope.isEditingRequisition.Role = false;
                $scope.isEditingRequisition.Group = false;
                $scope.isEditingRequisition.CanSave = false;
                _this.tempRequisition = angular.copy($scope.Requisition);
            };

            var getRequisitionLocationList = () => {
                JobRequisitionService.getRequisitionLocationList().then(function (res) {
                    $scope.locationList = res.Locations;
                });
            };

            var getRoleList = () => {
                Networks.getRolesPromise().then(function (res) {
                    $scope.roleList = res;
                });
            };

            var getJobRequisition = (requisitionId) => {
                $scope.isLoading = true;
                JobRequisitionService.getJobRequisition(requisitionId).then(function (res) {
                    $scope.Requisition = res.data;
                    _this.tempRequisition = angular.copy($scope.Requisition);
                }).finally(function () {
                    $scope.isLoading = false;
                });
            };

            var approveRequisition = (url) => {
                var comment = {
                    Comment: '' // don't need comment at this time
                };
                JobRequisitionService.processCommonCase(url, comment).then(function (res) {
                    if (res.data) {
                        $notify.add({
                            message: 'This requisition has been approved!',
                            type: 'success',
                            icon: '',
                            visible: true
                        });
                        $scope.Requisition = res.data;
                    }
                }).finally(function () {
                    $scope.isLoading = false;
                    $scope.isEditingRequisition = {
                        Role: false,
                        Group: false,
                        CanSave: false
                    };
                });
            };

            var cancelRequisition = (url) => {
                var comment = {
                    Comment: '' // don't need comment at this time
                };
                JobRequisitionService.processCommonCase(url, comment).then(function (res) {
                    if (res.data) {
                        $notify.add({
                            message: 'Your requisition has been cancelled!',
                            type: 'delete',
                            icon: 'cancel',
                            visible: true
                        });
                        $scope.Requisition = res.data;
                    }
                }).finally(function () {
                    $scope.isLoading = false;
                    $scope.isEditingRequisition = {
                        Role: false,
                        Group: false,
                        CanSave: false
                    };
                });
            };

            var submitRequisition = (Requisition) => {
                JobRequisitionService.submitJobRequisition(Requisition.formatRequisitionToApi()).then(function (res) {
                    $scope.Requisition = res.data;
                }).finally(function () {
                    $scope.isLoading = false;
                });
            };

            var rejectRequisition = (url) => {
                var comment = {
                    Comment: '' // don't need comment at this time
                };
                JobRequisitionService.processCommonCase(url, comment).then(function (res) {
                    if (res.data) {
                        $notify.add({
                            message: 'This requisition has been rejected!',
                            type: 'error',
                            icon: '',
                            visible: true
                        });
                        $scope.Requisition = res.data;
                    }
                }).finally(function () {
                    $scope.isLoading = false;
                    $scope.isEditingRequisition = {
                        Role: false,
                        Group: false,
                        CanSave: false
                    };
                });
            };

            var archiveRequisition = (url) => {
                JobRequisitionService.processCommonCase(url, null).then(function (res) {
                    if (res.status === 200) {
                        $notify.add({
                            message: 'Your requisition has been archived!',
                            type: 'info',
                            icon: 'folder',
                            visible: true
                        });
                        $scope.Requisition = res.data;
                    }
                }).finally(function () {
                    $scope.isLoading = false;
                });
            };

            var deleteRequisition = (url) => {
                var isSuccess = false;
                JobRequisitionService.deleteRequisition(url).then(function (res) {
                    if (res.status === 200) {
                        $notify.add({
                            message: 'Your requisition has been deleted!',
                            type: 'delete',
                            icon: 'trash',
                            visible: true
                        });
                        isSuccess = true;
                    }
                }).finally(function () {
                    $scope.isLoading = false;
                    if (isSuccess) {
                        $location.path(Paths.get('recruit.requisition.list').path);
                    }
                });
            };

            var updateRequisition = (Requisition, isBackToListPage) => {
                $scope.isLoading = true;
                JobRequisitionService.createJobRequisition(Requisition.formatRequisitionToApi()).then(function (res) {
                    if (isBackToListPage) {
                        $location.path(Paths.get('recruit.requisition.list').path);
                    } else {
                        resetEditingState();
                    }
                }).finally(function () {
                    $scope.isLoading = false;
                });
            };

            var executeRequisition = (url) => {
                var comment = {
                    Comment: '' // don't need comment at this time
                };

                JobRequisitionService.processCommonCase(url, comment).then(function (res) {
                    if (res.data && res.data.ExecutedJobId) {
                        $scope.Requisition = res.data;
                        JobDetailsService.getJobDetailsByJobId(res.data.ExecutedJobId).then(function (res) {
                            $scope.jobDetail = res.jobAdsDetailsModel;
                            var modal = $modal.open({
                                templateUrl: '/interface/views/recruit/job-ads/partials/create-job-ads.html',
                                controller: 'jobAdsCreateCtrl',
                                size: 'lg',
                                scope: $scope,
                                locked: true
                            });

                            modal.result.then(function(result) {
                                if (result.isRedirect) {
                                    $location.path(Paths.get('recruit.jobs.index').path);
                                }
                            });
                        });
                    }
                    /*end if*/
                }).finally(function () {
                    $scope.isLoading = false;
                });
            };
            //#endregion
        }
    ]);