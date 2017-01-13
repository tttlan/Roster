angular.module('ui.recruit.onboard')
.directive('candidates', function($notify, $route, $location, Paths, OnboardingConstants, Networks, $q) {
    return {
        restrict: 'E',
        scope: {
            subItems: '=',
            uploadCsvBulkOnboard: '=',
            addNewCandidateAfterUploadCsv: '=',
            isSingle: '=',
            isCreating: '&',
            getOnboardingSetting: '&',
            updateOnboard: '&',
            checkSalaryTypeDefault: '&',
            viewDocument: '&',
            openResendDocNotes: '&',
            resendBtnEnabled: '&',
            rejectForResend :'&',
            acceptInboundDoc: '&',
            progress: '&',
            downloadDocument: '&',
            selectOtherGroup: '&',
            selectOtherStore: '&',
            removeTag: '&',
            commonOnboard: '=',
            reject: '&'
        },
        replace: true,
        templateUrl: 'interface/views/recruit/onboard-details-candidates.html',
        controller: function($scope, $modal, Onboarding) {

            $scope.otherGroups = {
                searchString: '',
                source: null,
                selected: [],
                selectedId: []
            };

            $scope.otherStores = {
                searchString: '',
                source: null,
                selected: [],
                selectedId: [],
            };

            getOtherGroupsCollection();
            getOtherStoreCollection();

            $scope.removeSubTag = function(index, mode, onboard) {
                var idx = $scope.subItems.indexOf(onboard);
                $scope.removeTag()(index, mode, idx);
            };

            $scope.selectSubOtherGroup = function(group, onboard) {
                var idx = $scope.subItems.indexOf(onboard);
                $scope.selectOtherGroup()(group, idx);
                $scope.otherGroups.searchString = '';
            };

            $scope.selectSubOtherStore = function(group, onboard) {
                var idx = $scope.subItems.indexOf(onboard);
                $scope.selectOtherStore()(group, idx);
                $scope.otherStores.searchString = '';
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
            
            $scope.getSalaryAndIndex = function(salaryType, index) {
                return $scope.checkSalaryTypeDefault()(salaryType, index);
            };
            
            function getOtherGroupsCollection() {
                Networks.getOtherGroups().then(function(res) {
                    $scope.otherGroups.source = res;
                    return res;
                });
            }
        
            function getOtherStoreCollection() {
                Networks.getOtherStores().then(function(res) {
                    $scope.otherStores.source = res;
                    return res;
                });
            }
            
            $scope.saveSingleCandidateInfo = function(onboard) {
                onboard = Onboarding.prepareOnboardContactsForServer(onboard, onboard.address, onboard.phones, onboard.emails);
                
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
                    hasSalaryTypeDefault: false,
                    taxCode: null
                };
                $scope.subItems.push(emptyOnboard);
            };
            
            $scope.isCollapsedCandidate = true;

            $scope.cancelUpdateCandidate = function(idx) {
                $scope.isCollapsedCandidate = false;
                                
                $scope.subItems[idx].previousValues.state.isEditable = $scope.subItems[idx].state.isEditable;
                $scope.subItems[idx].previousValues.state.isCollapsedCandidateDetails = false;
                
                $scope.subItems[idx] = angular.copy($scope.subItems[idx].previousValues);
                $scope.subItems[idx].previousValues = angular.copy($scope.subItems[idx]);
                $scope.subItems[idx].state.isEditable = !$scope.subItems[idx].state.isEditable;
                
                if($scope.isDocumentation($scope.subItems[0])) {
                    $scope.commonOnboard.state.isEditable = !$scope.commonOnboard.state.isEditable;
                }
            };
                          
            $scope.uploadCsv = function() {
                var modal = $modal.open({
                    templateType: 'modal',
                    templateUrl: 'interface/views/recruit/partials/modal-upload-csv.html',
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
                        
            $scope.toggleCadidateDetailsCollapsed = function(idx) {
                $scope.subItems[idx].state.isCollapsedCandidateDetails = !$scope.subItems[idx].state.isCollapsedCandidateDetails;
            };

            $scope.toggleCadidateCollapsed = function() {
                $scope.isCollapsedCandidate = !$scope.isCollapsedCandidate;
                
                if($scope.isSingle) {
                    $scope.subItems[0].state.isCollapsedCandidateDetails = !$scope.subItems[0].state.isCollapsedCandidateDetails;
                }
            };
            
            $scope.loadCandidateDocument = function(onboard) {
               if(!$scope.isCollapsedCandidate ) {
                    $scope.inboundDocLoading = true;
                    var outbound = {};
                    
                    var getInboundDocument = Onboarding.getInboundDocument(onboard.OnboardId);
                    var getOutboundDocuments = Onboarding.getOutboundDocuments(onboard.OnboardId);
                    onboard.CandidateHasAcceptedAllDocs = false;

                    $q.all([getInboundDocument, getOutboundDocuments]).then(function(data) {
                        var outbound = data[1];
                        
                        if(outbound.OnboardDocumentItemResults && outbound.OnboardDocumentItemResults.length){
                           var acceptedDoc = outbound.OnboardDocumentItemResults.filter(function(document) 
                           { 
                               return document.OnboardDocumentRecord.AcceptedDate !== null; 
                            });
                            
                            onboard.CandidateHasAcceptedAllDocs = acceptedDoc.length === outbound.OnboardDocumentItemResults.length;
                        }
                        
                        onboard.InboundRequirementListForCandidate = onboard.InboundRequirementListForCandidate || {};
                        onboard.InboundRequirementListForCandidate.OnboardDocumentItemResults = data[0] || data[0].data;
                        
                        if(onboard.InboundRequirementListForCandidate.OnboardDocumentItemResults && onboard.InboundRequirementListForCandidate.OnboardDocumentItemResults.length !== 0) {
                            Onboarding.formatEntityActionForInboundDocument(onboard.InboundRequirementListForCandidate.OnboardDocumentItemResults);
                        }
                        
                        $scope.inboundDocLoading = false;
                        
                    }).catch(function() {
                        $notify.add({
                            message: 'Cannot retrieve candidate documents at this time. Please try again later',
                            type: 'error'
                        });
                    });
                }    
            };
            
            $scope.acceptInboundDocOnboard = function(onboard, doc) {
                return $scope.acceptInboundDoc()(onboard, doc);
            };
            
            $scope.rejectForResendOnboard = function(onboard, isRejectForCandidate) {
                return $scope.rejectForResend()(onboard, isRejectForCandidate);
            };
            
            $scope.openResendDocNotesOnboard = function(onboard, doc) {
                return $scope.openResendDocNotes()(onboard, doc);
            };
            
            $scope.resendBtnEnabledOnboard = function(docs) {
                return $scope.resendBtnEnabled()(docs);
            };

            $scope.removeCandidateFromBulk = function(onboard) {
                onboard.state.isMenuBulkRemoveCandidateActive = true;
                
                Onboarding.removeCandidateFromBulk(onboard.OnboardId)
                    .then(function() {
                        var idx = $scope.subItems.indexOf(onboard);
                        $scope.subItems.splice(idx, 1);
                        
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
            
            $scope.isCreateNew = function(index) {
                return $scope.isCreating()(index);
            };

            angular.extend($scope, Onboarding.phaseChecks);

            $scope.checkDisable = function(index) {
                if($scope.isDocumentation($scope.subItems[index]) || $scope.isCandidateAcceptance($scope.subItems[index]) || $scope.isAwaitingConfirmation($scope.subItems[index]) || $scope.isComplete($scope.subItems[index]) || $scope.isDeclined($scope.subItems[index])) {
                    return true;
                }else{
                    return false;
                }
            };
            
            $scope.addNewListCandidate = function() {
                $scope.addNewCandidateAfterUploadCsv = true;
            };

            $scope.checkYearOldCandidate =(birthday) =>{
                if(!birthday) {
                    return false;
                }
                var currentYear = moment().year();
                var yearSelected = moment(birthday).year();
                if(currentYear - yearSelected >= Number($scope.OnSettings.UnderageParentalConsent)) {
                    return false;
                } else {
                    return true;
                }
            };
                
            $scope.viewDocumentOnboard = function(document) {
                return $scope.viewDocument()(document);
            };
            
            $scope.downloadDocumentOnboard = function(document) {
                return $scope.DownloadDocument()(document);
            };
            
            $scope.progressOnboard = function(onboard, isCandidate) {
                return $scope.progress()(onboard, isCandidate);
            };
            
            $scope.rejectOnboard = function (onboard, isCandidate) {
                return $scope.reject()(onboard, isCandidate);
            };
            
            $scope.isDocumentation = function(onboard) {
                return onboard.StatusTextOnboard === OnboardingConstants.ONBOARD_STATUS_TEXT_DOCUMENTATION;
            };
            
            $scope.isAwaitingConfirmation = function(onboard) {
                return onboard.StatusTextOnboard === OnboardingConstants.ONBOARD_STATUS_TEXT_CONFIRMATION;
            };
            
            $scope.isComplete = function(onboard) {
                return onboard.StatusTextOnboard === OnboardingConstants.ONBOARD_STATUS_TEXT_COMPLETE 
                || onboard.StatusTextOnboard === OnboardingConstants.ONBOARD_STATUS_TEXT_PENDING;
            };
            
            $scope.isCandidateAcceptance = function(onboard) {
                return onboard.StatusTextOnboard === OnboardingConstants.ONBOARD_STATUS_TEXT_CANDIDATE_ACCEPTANCE;
            };
            
            $scope.isDeclined = function(onboard) {
                return onboard.StatusTextOnboard === OnboardingConstants.ONBOARD_STATUS_TEXT_DECLINED;
            };
            
            $scope.isProbation = function(onboard) {
                return onboard.StatusTextOnboard === OnboardingConstants.ONBOARD_STATUS_TEXT_PROBATION;
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