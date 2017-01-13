angular.module('ui.recruit.onboard')
.directive('candidates', function($notify, $route, $location, Paths) {
    return {
        restrict: 'E',
        scope: {
            subItems: '=',
            uploadCsvBulkOnboard: '=',
            isSingleOnboard: '&',
            isBulkOnboard: '&',
            isCreating: '&',
            isOnboardPhaseNew: '&',
            getOnboardingSetting: '&',
            isOnboardPhaseDeclined: '&',
            isOnboardPhaseDocumentation: '&',
            isOnboardPhaseAwaitingCandidateAcceptance: '&',
            isOnboardPhaseAwaitingConfirmation: '&',
            isOnboardPhaseAwaitingApproval: '&',
            isOnboardPhaseComplete: '&',
            updateOnboard: '&',
            prepareOnboardContactsForServer: '&'
        },
        replace: true,
        templateUrl: '/interface/views/recruit/onboard-details-candidates.html',
        controller: function($scope, $modal, Onboarding) {
            var emptyOnboard = {
                inboundDocument: null,
                address: null,
                phones: null,
                emails: null,
                referringMemberId: null,
                salutation: null,
                storeGroup: null,
                role: null,
                salaryType: null,
                employmentType: null,
                payRate: null,
                outboundDocuments: [],
                registerKey: null,
                isSubmitting: false,
                employmentClassification: null,
                taxCode: null
            };

            $scope.getArtifactIdForUploadCsv = $scope.uploadCsvBulkOnboard;
            
            $scope.settings = function() {
                return $scope.getOnboardingSetting()().then(function(res) {
                    $scope.OnSettings = res;
                });
            };
            
            $scope.saveCandidate = function(onboard) {
                onboard.SalaryPayRate = onboard.PayRate;
                
                return $scope.updateOnboard()(onboard, onboard);
            };
            
            function prepareOnboardContactsForServer(onboard) {
                return $scope.prepareOnboardContactsForServer()(onboard, onboard.address, onboard.phones, onboard.emails);
            }
            
            $scope.saveSingleCandidateInfo = function(onboard) {
                onboard = prepareOnboardContactsForServer(onboard);
                
                return Onboarding.updateSingleCandidateInfo(onboard).then(function(res) {
                    $notify.add({
                        message: 'The candidate has been updated',
                        type: 'success',
                        visible: true
                    });
                    
                    $route.reload();
                })
                .catch(function() {
                    $notify.add({
                        message: 'The candidate could not be updated at this time. Please try again later',
                        type: 'error',
                        visible: true
                    });
                    
                    $route.reload();
                });
            };
            
            $scope.addNewCandidate = function() {
                $scope.subItems.push(emptyOnboard);
            };
            
            $scope.cancelUpdateCandidate = function(onboard) {
                if(onboard !== onboard.previousValues) {
                    onboard = onboard.previousValues;    
                }
            };
                          
            $scope.uploadCsv = function() {
                var modal = $modal.open({
                    templateType: 'modal',
                    templateUrl: '/interface/views/recruit/partials/modal-upload-csv.html',
                    size: 'md',
                    controller: SHRP.ctrl.ModalUploadCsv,
                    resolve: {
                        data: function() {
                            return {};
                        }
                    },
                    title: 'Upload csv file for onboarding',
                });

                modal.result.then(function(data) {
                    
                });
            };
            
            $scope.isCollapsedCandidate = true;
            
            $scope.toggleCadidateDetailsCollapsed = function(idx) {
                $scope.subItems[idx].state.isCollapsedCandidateDetails = !$scope.subItems[idx].state.isCollapsedCandidateDetails;
            };

            $scope.toggleCadidateCollapsed = function() {
                $scope.isCollapsedCandidate = !$scope.isCollapsedCandidate;
                
                if($scope.isSingle()) {
                    $scope.subItems[0].state.isCollapsedCandidateDetails = !$scope.subItems[0].state.isCollapsedCandidateDetails;
                }
            };

            $scope.removeCandidateFromBulk = function(onboard) {
                onboard.state.isMenuBulkRemoveCandidateActive = true;
                
                Onboarding.removeCandidateFromBulk(onboard.OnboardId)
                    .then(function() {
                        angular.forEach($scope.subItems, function(item, index) {
                            if (item.OnboardId = onboard.OnboardId) {
                                $scope.subItems.splice(index, 1);
                            }
                        });
                        
                        if($scope.subItems.length > 0) {
                            $notify.add({
                                message: 'The onboard ' + name + ' has been removed',
                                type: 'success'
                            });
                        } else {
                            $location.path(Paths.get('recruit.onboards.bulk').path);
                            $route.reload();
                        }                       
                    })
                    .catch(function() {
                        $notify.add({
                            message: 'The onboard ' + name + ' could not be removed at this time. Please try again later',
                            type: 'error'
                        });
                    });
            };

            $scope.isMenuBulkRemoveCandidateActive = function(onboard) {
                return onboard.state.isMenuBulkRemoveCandidateActive;
            };

            $scope.toggleCandidateEditable = function(onboard) {
                onboard.state.isEditable = !onboard.state.isEditable;
            };

            $scope.isMenuEditActive = function(onboard) {
                return onboard.state.isEditable;
            };

            $scope.isSingle = function() {
                return $scope.isSingleOnboard()();
            };
            
            $scope.isBulk = function() {
                return $scope.isBulkOnboard()();
            };
            
            $scope.isCreateNew = function(index) {
                return $scope.isCreating()(index);
            };

            $scope.isPhaseNew = function(index) {
                return $scope.isOnboardPhaseNew()(index);
            };
            
            $scope.isDeclined = function(index) {
                return $scope.isOnboardPhaseDeclined()(index);
            };

            $scope.isDocumentation = function(index) {
                return $scope.isOnboardPhaseDocumentation()(index);
            };

            $scope.isCandidateAcceptance = function(index) {
                return $scope.isOnboardPhaseAwaitingCandidateAcceptance()(index);
            };

            $scope.isConfirmation = function(index) {
                return $scope.isOnboardPhaseAwaitingConfirmation()(index);
            };

            $scope.isComplete = function(index) {
                return $scope.isOnboardPhaseComplete()(index);
            };

            $scope.isApproval = function(index) {
                return $scope.isOnboardPhaseAwaitingApproval()(index);
            };
        }
    };
});

var SHRP = SHRP || {};
SHRP.ctrl = SHRP.ctrl || {};

SHRP.ctrl.ModalUploadCsv = [
'$scope', '$modalInstance', '$location', 'Onboarding', 'Paths',
function($scope, $modalInstance, $location, onboarding, paths) {
    $scope.isLoading = true;

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.close = function() {
        $modalInstance.close();
    };

    $scope.updateCandidates = function(fileStorageId) {
        
        onboarding.uploadCsv(fileStorageId).then(function(resp) {
            $location.path(paths.get('recruit.onboards.bulkDetails').path.replace(':bulkOnboardId', resp.bulkOnboardingGuid));
        });
    };

}];