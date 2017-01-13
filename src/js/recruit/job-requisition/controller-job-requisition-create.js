angular.module('ui.recruit.job-requisition')

    .controller('jobRequisitionCreateCtrl', [
        '$scope', 'REQUISITION_STATUS', '$timeout', '$q', '$window', 'Paths', '$notify', '$location', 'Members', 'Networks', 'JobRequisitionService', 'JobRequisitionDetailModel', '$modal',
        function($scope, REQUISITION_STATUS, $timeout, $q, $window, Paths, $notify, $location, Members, Networks, JobRequisitionService, JobRequisitionDetailModel, $modal) {

            //#region global variable
            $scope.IsLoading = false;
            $scope.ownerInfo = null;
            $scope.today = new Date();
            $scope.locationList = null;
            $scope.roleList = null;
            $scope.Requisition = new JobRequisitionDetailModel();
            
            //#region DropDown variables
            $scope.showDropdownFor = '';
            $scope.isSelected = false;
            var currentLabel = null;
            $scope.tempLabel = '';
            $scope.isChangedInput = false;
            //#endregion

            //#endregion


            //#region Initial Data
            $scope.init = function() {
                $scope.IsLoading = true;
                $scope.ownerInfo = {};

                var asyncQuery = $q.all([
                    JobRequisitionService.getRequisitionLocationList(),
                    Networks.getRolesPromise(),
                    Members.getMyProfile()
                ]);

                asyncQuery.then(function(values) {
                    $scope.locationList = values[0].Locations;
                    $scope.roleList = values[1];
                    $scope.ownerInfo = values[2].data ? values[2].data : values[2];
                }).finally(function() {
                    $scope.IsLoading = false;
                });
            };
            //#endregion

            //#region Public functions

            //When select a result from autocomplete
            $scope.selectRoleOrLocation = function(data, option) { //option: ROLE || LOCATION

                $scope.showDropdownFor = ''; // hide dropdown

                if (option === 'ROLE') {
                    $scope.Requisition.Role = angular.copy(data);
                    currentLabel = angular.copy($scope.Requisition.Role.Description);
                } else {
                    $scope.Requisition.Group = angular.copy(data);
                    currentLabel = angular.copy($scope.Requisition.Group.GroupName);
                }

                $scope.isChangedInput = false;
                $scope.isSelected = true;

            };

            //When focus on a dropdown list
            $scope.onFocusOrOnBlurDropdown = (field, data) => {
                $scope.showDropdownFor = field;

                if(!angular.isUndefined(data)) {
                    $scope.tempLabel = data;
                    $scope.isChangedInput = false;
                }
            };

            //When user change the text box but don't select the option
            $scope.resetLabel = (field) => {
                if(field === 'Role' && $scope.isSelected === false && !_.isNull($scope.Requisition.Role)) {
                    $scope.Requisition.Role.Description = angular.copy($scope.tempLabel);
                } else if (field === 'Location' && $scope.isSelected === false && !_.isNull($scope.Requisition.Group)) {
                    $scope.Requisition.Group.GroupName = angular.copy($scope.tempLabel);
                }
            };

            //When user type in the input on selectbox
            $scope.onChangeInput = (keyword) => {
                if(keyword !== currentLabel) {
                    $scope.isChangedInput = true;
                    $scope.isSelected = false;
                }
            };

            //#region function redirectToList()
            $scope.redirectToList = () => {
                $location.path(Paths.get('recruit.requisition.list').path);
            };
            //#endregion

            // Create Requisition
            $scope.createJobRequisition = function() {
                $scope.IsLoading = true;
                JobRequisitionService.createJobRequisition($scope.Requisition.formatRequisitionToApi())
                    .then(function(res) {
                        $location.path(Paths.get('recruit.requisition.list').path);
                    })
                    .finally(function() {
                        $scope.IsLoading = false;
                    });
            };

            // Submit a job requisition
            $scope.submitJobRequisition = function() {
                $scope.IsLoading = true;
                JobRequisitionService.submitJobRequisition($scope.Requisition.formatRequisitionToApi())
                    .then(function(res) {
                        var requisitionId = res.data.JobAdRequisitionId;
                        $location.path(Paths.get('recruit.requisition.detail', requisitionId).path);
                    })
                    .finally(function() {
                        $scope.IsLoading = false;
                    });
            };

            // Remove field
            $scope.removeField = function(field) {
                if (field === 'ROLE') {
                    $scope.Requisition.Role = null;
                } else {
                    $scope.Requisition.Group = null;
                }
            };

            // Showing dropdown
            $scope.showDropdowm = (field) => {
                if (field === 'ROLE') {
                    $scope.IsShowDropdown.Role = ($scope.IsShowDropdown.Role === true) ? false : true;
                } else {
                    $scope.IsShowDropdown.Group = ($scope.IsShowDropdown.Group === true) ? false : true;
                }
            };
            //#endregion

            //#region function backToList()
            $scope.backToList = (Requisition) => {
                if (Requisition.Role && Requisition.Group) {
                    var message = 'Do you want to save the requisition as a draft?';
                    var modal = $modal.open({
                        templateUrl: '/interface/views/recruit/job-requisition/partials/modal-confirm-back-to-list.html',
                        controller: 'modalConfirmBackToListCtrl',
                        size: 'sm',
                        animationType: 'flipVertical',
                        resolve: {
                            Data: function() {
                                return {
                                    Requisition: Requisition,
                                    Message: message
                                };
                            }
                        }
                    });

                    modal.result.then(function(confirm) {
                        if (confirm) {
                            $scope.createJobRequisition();
                        } else {
                            $scope.redirectToList();
                        }
                    });
                } else {
                    $scope.redirectToList();
                }
            };
        }
    ]);