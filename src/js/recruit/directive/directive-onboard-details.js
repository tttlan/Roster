angular.module('ui.recruit.onboard')

.directive('onboardDetails', function($location, $route, $routeParams, $notify, $modal,
    $window, Paths, Onboarding, OnboardingConstants, UploadConstants, $q, Members, $filter, CreatorModel, ApproverModel, DocumentorModel, AcceptorModel, ConfirmerModel) {

    return {
        restrict: 'E',
        templateUrl: '/interface/views/recruit/onboard-details.html',
        scope: {
            // list-type="single" = single onboard list
            // list-type="bulk" = bulk onboard list
            listType: '@'
        },
        controller: controller
    };

    function controller($scope, $timeout) {
        var onboardState = {
            showInboundDocumentInputFields: false,
            showOutboundDocumentInputFields: false,
            isCollapsedCandidateDetails: true,
            isCollapsedProposedRole: false,
            isCollapsedSourcingInformation: true,
            isCollapsedPayrollDetails: true,
            isCollapsedManagerApproval: true,
            isCollapsedSaveOptions: true,
            isCollapsedDetails: true,
            isEditable: false,
            isMenuBulkRemoveCandidateActive: false,
            isResendDocRequired: false,
            isCollapsedDocumentCandidate: false
        };
        
        var registerKey = {
            IsStoreKeyRequired: false,
            IsAlarmCodeRequired: false,
            IsTabletRequired: false
        };
        
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
            registerKey: null,
            outboundDocuments: [],
            referencedocuments: [],
            isSubmitting: false,
            desiredSalary: null,
            taxCode: null,
            employmentClassification: null,
            Status: ''
        };

        $scope.data = {
            containerId: UploadConstants.containerIds.onboarding,
            uploadCsvBulkOnboard: [],
            onboards: [emptyOnboard],
            referenceDocuments: [],
            outboundDocuments: []
        };

        $scope.data.onboards[0].state = onboardState;
        $scope.data.onboards[0].RegisterKey = registerKey;
        $scope.commonOnboard = angular.copy($scope.data.onboards[0]);
        $scope.editOnboarding = false; // Check feature of onboarding is edit or create
        $scope.currentUser = {};
        $scope.CommentCount = 0;
        
        //#region Create single onboarding
        $scope.createOnboardOnly = function(onboard) {
            showLoadingIndicator(0);
            var name = getCandidateName(onboard);

            onboard = prepareOnboardForUpdate(onboard, $scope.commonOnboard);

            return Onboarding.createOnboardForNewMember(onboard)
                .then(function(res) {
                    onboard.OnboardId = res.Data || res.data.Data;
                    onboard.referencedocuments = $scope.data.referenceDocuments;
                    
                    var promises = createReferenceDocuments(onboard);
                    
                    if(promises.length > 0) {
                        $q.all(promises).then(function(response) {
                            $notify.add({
                                    message: 'The onboard for "' + name + '" has been created',
                                    type: 'success'
                           });

                            $location.path(Paths.get('recruit.onboards.index').path);
                        });
                    } else {
                        $notify.add({
                                message: 'The onboard for "' + name + '" has been created',
                                type: 'success'
                        });
                        $location.path(Paths.get('recruit.onboards.index').path);
                    }
                    

                })
                .catch(function() {
                    $notify.add({
                        message: 'The onboard for "' + name + '" could not be created at this time. Please try again later',
                        type: 'error'
                    });
                })
                .finally(function(res) {
                    hideLoadingIndicator(0);
                });
        };
        //#endregion

        //#region create bulk onboarding
        $scope.createBulkOnboardingNotUploadCsv = function(onboards, goApprove) {
            showLoadingIndicator(0);

            var bulkOnboard = prepareBulkOnboardDataForServer(onboards, $scope.commonOnboard);

            return Onboarding.createBulkOnboard(bulkOnboard)
                .then(function(res) {
                    progressForApproveBulkOnboard(goApprove, res.data.Data);
                })
                .catch(function() {
                    $notify.add({
                        message: 'The bulk onboard could not be created at this time. Please try again later',
                        type: 'error'
                    });
                })
                .finally(function(res) {
                    hideLoadingIndicator(0);
                });
        };
        //#endregion

        //#region create bulk onboarding with csv file
        $scope.createBulkOnboardingExistCsvFile = function(onboards, goApprove, artifactId) {
            showLoadingIndicator(0);

            var bulkOnboard = prepareBulkOnboardDataForServer(onboards, $scope.commonOnboard, artifactId);

            return Onboarding.createBulkOnboard(bulkOnboard, artifactId)
                .then(function(res) {
                    if (res.data.Data) {
                        var bulkOnboardId = res.data.Data;
                        
                        // Update bulk onboard if exist candidate list
                        if (onboards.length > 0) {
                            var bulkOnboardUpdate = prepareBulkOnboardDataForServer(onboards, $scope.commonOnboard);
                            
                            return Onboarding.updateBulkOnboardAfterUploadCsv(bulkOnboardUpdate['Candidates'], bulkOnboardId)
                                .then(function(res) {
                                    // Check progress approve after create bulk onboard success
                                    progressForApproveBulkOnboard(goApprove, bulkOnboardId);
                                })
                                .catch(function() {
                                    $notify.add({
                                        message: 'The bulk onboard could not be update at this time. Please try again later',
                                        type: 'error'
                                    });
                                })
                                .finally(function(res) {
                                    hideLoadingIndicator(0);
                                });
                        } else {
                            // Check progress approve after create bulk onboard success
                            progressForApproveBulkOnboard(goApprove, bulkOnboardId);
                        }
                    }
                    
                })
                .catch(function() {
                    $notify.add({
                        message: 'The bulk onboard could not be created at this time. Please try again later',
                        type: 'error'
                    });
                })
                .finally(function(res) {
                    hideLoadingIndicator(0);
                });
        };
        //#endregion
        
        // progress for approve bulk onboard after create
        function progressForApproveBulkOnboard(goApprove, bulkOnboardId) {
            if (goApprove === true) {
                // progess for approve
                if (bulkOnboardId) {
                    return Onboarding.progressBulkOnboard(bulkOnboardId)
                        .then(function() {
                            $notify.add({
                                message:  'The bulk onboard has been created and sent for approval',
                                type: 'success'
                            });
                            
                            $location.path(Paths.get('recruit.onboards.bulkDetails', bulkOnboardId).path);
                            $route.reload();
                        })
                        .catch(function() {
                            $notify.add({
                                message: 'The bulk onboard could not be created at this time. Please try again later',
                                type: 'error'
                            });
                        })
                        .finally(function(res) {
                            hideLoadingIndicator(0);
                        });
                }
                
            } else {
                $notify.add({
                    message: 'The bulk onboard has been created',
                    type: 'success'
                });

                $location.path(Paths.get('recruit.onboards.bulk').path);
                $route.reload();
            }
        }
        
        $scope.createOnboardAndSendToApproval = function(onboards) {
            showLoadingIndicator(0);
            // create and approve
            if($scope.editOnboarding === false) {
                var artifactId = null;
                
                if ($scope.data.uploadCsvBulkOnboard.length > 0) {
                    // get artifact id of file csv
                    artifactId = $scope.data.uploadCsvBulkOnboard[0].ArtifactId;
                }
                
                if (artifactId === null) {
                    if (onboards.length > 1) {
                        // create bulk onboard not upload csv and go to approve
                        $scope.createBulkOnboardingNotUploadCsv(onboards, true);
                    } else {
                        // create single onboard                    
                        createAndSendToApprovalForSingleOnboard(onboards[0]);
                    }
                } else {
                    //create bulk onboard with csv file and go to approve
                    $scope.createBulkOnboardingExistCsvFile(onboards, true, artifactId);
                }
                
            } else {  // update and approve
                var hasOnboardDetailsChanged = $scope.onboardingDetailsForm.$dirty;
                
                // update and go to approve for single onboard   
                if ($scope.isSingleOnboard()) {
                    createAndSendToApprovalForSingleOnboard(onboards[0], hasOnboardDetailsChanged);
                }
                
                // bulk onboard   
                if ($scope.isBulkOnboard()) {
                    var bulkOnboardId = $routeParams.bulkOnboardId;
                    
                    updateAndDoProgressForBulkOnboard(bulkOnboardId, onboards[0], hasOnboardDetailsChanged);
                }
            }
                       
        };
        
        function updateAndDoProgressForBulkOnboard(bulkOnboardId, onboard, hasChange) {
            if (hasChange) {
                // update and go to approve step
                Onboarding.saveBulkProposedRole(bulkOnboardId, $scope.commonOnboard).then(function() {
                    Onboarding.progressBulkOnboard(bulkOnboardId, onboard.Option).then(function() {
                        $route.reload();
                    });
                });
            }else {
                // go to approve step
                Onboarding.progressBulkOnboard(bulkOnboardId, onboard.Option).then(function() {
                    $route.reload();
                });
            }
        }
        
        function createAndSendToApprovalForSingleOnboard(onboard, hasChange) {
            onboard = prepareOnboardForUpdate(onboard, $scope.commonOnboard);
             var request;
             
            if(hasChange) {
                request = Onboarding.createOnboardForNewMemberAndSendToApproval(onboard, hasChange);
            }else{
                request = Onboarding.createOnboardForNewMemberAndSendToApproval(onboard);
            }
            
            return request.then(function(data) {
                    onboard.OnboardId = data.onboardId || data.data.onboardId;
                    onboard.referencedocuments = $scope.data.referenceDocuments;
                    
                    var promises = createReferenceDocuments(onboard);
                    if(promises.length > 0) {
                        $q.all(promises).then(function(response) {
                            handleCreateOnboardWithApproval(onboard, data);
                        });
                    } else {
                        handleCreateOnboardWithApproval(onboard, data);
                    }
                })
                .finally(function(res) {
                    hideLoadingIndicator(0);
                });

        }
        
        function handleCreateOnboardWithApproval(onboard, result) {
            var name = getCandidateName(onboard);
            
            if (result.isOnboardCreated) {
                if (result.isOnboardSentToApproval && !result.isOnboardSentToDocumention) {
                    $notify.add({
                        message:  'The onboard for ' + name + ' has been created and sent for approval',
                        type: 'success'
                    });
                }
                else if (result.isOnboardSentToDocumention && !result.isOnboardSentToApproval) {
                    $notify.add({
                        message: 'The onboard for ' + name + ' has been created and sent for documention',
                        type: 'success'
                    });
                } else {
                    $notify.add({
                        message: 'The onboard for ' + name + ' has been created',
                        type: 'success'
                    });
                }

                // if the onboard is created but sending it for approval fails for some
                // reason, we still redirect the user to the details screen
                // they will have the opportunity to sent it for approval again there
                $location.path(Paths.get('recruit.onboards.details', result.onboardId).path);
                $route.reload();

            } else {
                $notify.add({
                    message: 'The onboard for ' + name + ' could not be created at this time. Please try again later',
                    type: 'error'
                });
            }
        }
        
        $scope.updateOnboard = function(onboard, commonOnboard) {
            showLoadingIndicator(0);

            var name = getCandidateName(onboard);

            onboard = prepareOnboardForUpdate(onboard, commonOnboard);

            return Onboarding.updateOnboard(onboard)
                .then(function() {
                    if ($scope.isSingleOnboard()) {
                        $notify.add({
                            message: 'The onboard for "' + name + '" has been updated',
                            type: 'success'
                        });
                    }
                    
                    if ($scope.isBulkOnboard()) {
                        if($scope.data.onboards.length === 1 && $scope.onboardingRoleForm__onboard.OnboardId.$dirty) {
                            $location.path(Paths.get('recruit.onboards.bulk').path);
                            $route.reload();
                        } else {
                            $notify.add({
                                message: 'The onboard ' + name + ' has been updated',
                                type: 'success'
                            });
                        }
                        
                        //if($scope.data.onboards.length > 1) {
                          
                        //}
                    }
                })
                .catch(function() {
                    $notify.add({
                        message: 'The onboard for "' + name + '" could not be updated at this time. Please try again later',
                        type: 'error'
                    });

                    $route.reload();
                })
                .finally(function(res) {
                    hideLoadingIndicator(0);
                });
        };

        var updateBulkOnboard = function(onboard) {
            var commonOnboard = $scope.commonOnboard;
            var bulkOnboardId = $routeParams.bulkOnboardId;
            
            showLoadingIndicator(0);
            
            Onboarding.saveBulkProposedRole(bulkOnboardId, commonOnboard)
                .then(function() {
                    $notify.add({
                        message: 'The bulk onboard has been updated',
                        type: 'success'
                    });
                    
                    $route.reload();
                })
                .catch(function() {
                    $notify.add({
                        message: 'The bulk onboard could not be updated at this time. Please try again later',
                        type: 'error'
                    });

                    $route.reload();
                })
                .finally(function(res) {
                    hideLoadingIndicator(0);
                });
        };

        $scope.save = function(onboards) {
            // create onboard
            if ($scope.editOnboarding === false) {
                var artifactId = null;

                if ($scope.data.uploadCsvBulkOnboard.length > 0) {
                    // get artifact id of file csv
                    artifactId = $scope.data.uploadCsvBulkOnboard[0].ArtifactId;
                }

                // Not upload csv
                if (artifactId === null) {
                    if (onboards.length > 1) {
                        // create bulk onboard not upload csv
                        $scope.createBulkOnboardingNotUploadCsv(onboards);
                    } else {
                        // create single onboard
                        $scope.createOnboardOnly(onboards[0]);
                    }
                } else {
                    //create bulk onboard with csv file
                    $scope.createBulkOnboardingExistCsvFile(onboards, false, artifactId);
                }
            } else {
                if ($scope.isSingleOnboard()) {
                    $scope.updateOnboard(onboards[0], $scope.commonOnboard);
                }
                if ($scope.isBulkOnboard()) {
                    updateBulkOnboard(onboards[0]);
                }
            }
            
        };

        $scope.savePersonalInfo = function(onboard, index) {
            showLoadingIndicator(index);
            var name = getCandidateName(onboard);

            return Onboarding.updatePersonalInfo(onboard).then(function() {
                    $notify.add({
                        message: 'The onboard personal info for "' + name + '" has been updated',
                        type: 'success'
                    });
                    $route.reload();
                })
                .finally(function(res) {
                    hideLoadingIndicator(index);
                });
        };

        $scope.saveContacts = function(onboard, index) {
            showLoadingIndicator(index);
            var name = getCandidateName(onboard);
            return Onboarding.updateContacts(onboard).then(function() {
                $notify.add({
                    message: 'The onboard contacts for "' + name + '" has been updated',
                    type: 'success'
                });
                $route.reload();
            })
                .finally(function(res) {
                    hideLoadingIndicator(index);
                });
            
        };
        
        $scope.saveProposedRole = function(onboard, type) {
            showLoadingIndicator(0);
            var role = getCandidateRole(onboard);
            var response;
            
            if(type === $scope.isSingleOnboard()) {
                response = Onboarding.updateRole(onboard);
            } else if(type === $scope.isBulkOnboard()) {
                response = Onboarding.saveBulkProposedRole($routeParams.bulkOnboardId, onboard);
            }
            
            return response.then(function() {
                $notify.add({
                    message: 'The onboard proposed role for "' + role + '" has been updated',
                    type: 'success'
                });

                $route.reload();
            })
            .finally(function(res) {
                hideLoadingIndicator(0);
            });
            
        };

        $scope.saveCommonProposedRole = function(commonOnboard) {
            showLoadingIndicator(0);
            
            if ($scope.isSingleOnboard()) {
                $scope.saveProposedRole(commonOnboard, $scope.isSingleOnboard());
            } else if($scope.isBulkOnboard()) {
                $scope.saveProposedRole(commonOnboard, $scope.isBulkOnboard());
            }
        };

        $scope.toggleEditable = function() {
            angular.forEach($scope.data.onboards, function(onboard, index) {
                onboard.state.isEditable = !onboard.state.isEditable;
            });
        };

        $scope.doRollback = function(onboard) {
            if ($scope.isSingleOnboard()) {
                $scope.rollback(onboard);
            }
            if ($scope.isBulkOnboard()) {
                $scope.rollbackBulk(onboard);
            }
        };
        
        $scope.goBackToList = function() {
            if ($scope.isSingleOnboard()) {
                $location.path(Paths.get('recruit.onboards.index').path);
            }
            if ($scope.isBulkOnboard()) {
                $location.path(Paths.get('recruit.onboards.bulk').path);
            }
            
            $route.reload();
        };

        $scope.rollback = function(onboard) {
            showLoadingIndicator(0);

            var name = getCandidateName(onboard);

            return Onboarding.rollbackOnboard(onboard.OnboardId, false)
                .then(function() {
                    $notify.add({
                        message: 'The onboard for "' + name + '" has been rolled back',
                        type: 'success'
                    });

                    $route.reload();
                })
                .finally(function(res) {
                    hideLoadingIndicator(0);
                });
        };

        $scope.rollbackBulk = function(onboard) {
            showLoadingIndicator(0);

            var role = getCandidateRole(onboard);

            return Onboarding.rollbackOnboard($routeParams.bulkOnboardId, true)
                .then(function() {
                    $notify.add({
                        message: 'The bulk onboard for "' + role + '" has been rolled back',
                        type: 'success'
                    });

                    $route.reload();
                })
                .finally(function(res) {
                    hideLoadingIndicator(0);
                });
        };

        $scope.doReject = function(onboard) {
            if ($scope.isSingleOnboard()) {
                $scope.reject(onboard);
            }
            if ($scope.isBulkOnboard()) {
                $scope.rejectBulk(onboard);
            }
        };

        $scope.reject = function(onboard) {
            var name = getCandidateName(onboard);

            return Onboarding.rejectOnboard(onboard.OnboardId, false)
                .then(function() {
                    $notify.add({
                        message: 'The onboard for "' + name + '" has been rejected',
                        type: 'success'
                    });

                    $location.path(Paths.get('recruit.onboards.index').path);
                })
                .catch(function() {
                    $notify.add({
                        message: 'The onboard for "' + name + '" could not be rejected at this time. Please try again later',
                        type: 'error'
                    });
                });
        };

        $scope.rejectBulk = function(onboard) {
            var role = getCandidateRole(onboard);

            return Onboarding.rejectOnboard($routeParams.bulkOnboardId, true)
                .then(function() {
                    $notify.add({
                        message: 'The bulk onboard for "' + role + '" has been rejected',
                        type: 'success'
                    });

                    $location.path(Paths.get('recruit.onboards.bulk').path);
                })
                .catch(function() {
                    $notify.add({
                        message: 'The bulk onboard for "' + role + '" could not be rejected at this time. Please try again later',
                        type: 'error'
                    });
                });
        };

        $scope.doDelete = function(onboard) {
            if ($scope.isSingleOnboard()) {
                $scope.delete(onboard);
            }
            if ($scope.isBulkOnboard()) {
                $scope.deleteBulk(onboard);
            }
        };

        $scope.delete = function(onboard) {
            var name = getCandidateName(onboard);

            return Onboarding.deleteOnboard(onboard.OnboardId, false)
                .then(function() {
                    $notify.add({
                        message: 'The onboard for "' + name + '" has been deleted',
                        type: 'success'
                    });

                    $location.path(Paths.get('recruit.onboards.index').path);
                })
                .catch(function() {
                    $notify.add({
                        message: 'The onboard for "' + name + '" could not be deleted at this time. Please try again later',
                        type: 'error'
                    });
                });
        };

        $scope.deleteBulk = function(onboard) {
            var role = getCandidateRole(onboard);

            return Onboarding.deleteOnboard($routeParams.bulkOnboardId, true)
                .then(function() {
                    $notify.add({
                        message: 'The onboard for "' + role + '" has been deleted',
                        type: 'success'
                    });

                    $location.path(Paths.get('recruit.onboards.bulk').path);
                })
                .catch(function() {
                    $notify.add({
                        message: 'The onboard for "' + role + '" could not be deleted at this time. Please try again later',
                        type: 'error'
                    });
                });
        };

        $scope.cancel = function(onboard) {
            if ($scope.isBulkOnboard()) {
                onboard = onboard.previousValue || onboard;
            }
        };

        $scope.doProgress = function(onboards) {
            if ($scope.isSingleOnboard()) {
                $scope.progress(onboards[0]);
            }
            if ($scope.isBulkOnboard()) {
                $scope.progressBulk(onboards, $routeParams.bulkOnboardId);
            }
        };
        
        //Approve for single onboard
        $scope.progress = function(onboard) {
            var results = {
                onboardId: null,
                isOnboardCreated: false,
                isOnboardSentToApproval: false,
                isOnboardSentToDocumention: false
            };

            showLoadingIndicator(0);

            var hasOnboardDetailsChanged = $scope.onboardingDetailsForm.$dirty;
            var operation;

            if (hasOnboardDetailsChanged) {
                onboard = prepareOnboardForUpdate(onboard, $scope.commonOnboard);

                operation = Onboarding.updateOnboard(onboard).then(function() {
                    return Onboarding.progressOnboard(onboard.OnboardId, onboard.Option);
                });
            } else {
                operation = Onboarding.progressOnboard(onboard.OnboardId, onboard.Option);
            }

                return operation.then(function() {
                    results.isOnboardCreated = true;
                    results.isOnboardSentToDocumention = true;

                    results.onboardId = onboard.OnboardId;

                    handleCreateOnboardWithApproval(onboard, results);
                })
                .finally(function(res) {
                    hideLoadingIndicator(0);
                });
        };

        // Approve for bulk onboard
        $scope.progressBulk = function(onboards, bulkOnboardId) {
            showLoadingIndicator(onboards.length - 1);

            var hasOnboardDetailsChanged = $scope.onboardingDetailsForm.$dirty;
            
            updateAndDoProgressForBulkOnboard(bulkOnboardId, onboards[0], hasOnboardDetailsChanged);

            hideLoadingIndicator(onboards.length - 1);
        };

        $scope.doExecute = function(onboards)
        {
            if ($scope.isSingleOnboard()) {
                $scope.execute(onboards[0]);
            }
            if ($scope.isBulkOnboard()) {
                $scope.executeBulk(onboards);
            }
        };

        $scope.doExecuteToComplete = function(onboards) {
            onboards[0].Option.IsBypassAcceptance = true;
            $scope.doExecute(onboards);
        };

        // "execute" refers to the act of moving an onboard from the documentation stage to
        // the acceptance stage
        $scope.execute = function(onboard) {
            showLoadingIndicator(0);

            var name = getCandidateName(onboard);

            Onboarding.progressOnboard(onboard.OnboardId, onboard.Option)
                .then(function() {
                    $notify.add({
                        message: 'The onboard for "' + name + '" has been sent for candidate acceptance',
                        type: 'success'
                    });

                    $route.reload();
                })
                .catch(function() {
                    $notify.add({
                        message: 'The onboard for "' + name + '" could not be sent for candidate acceptance at this time. Please try again later',
                        type: 'error'
                    });
                })
                .finally(function(res) {
                    hideLoadingIndicator(0);
                });
        };

        $scope.executeBulk = function(onboards) {
            $scope.progressBulk(onboards, $routeParams.bulkOnboardId);
        };
        
        $scope.openOnboardNotes = function() {
            var onboardId;
            var resourceType;
            
            if($scope.isSingleOnboard()) {
                onboardId = $routeParams.onboardId;
                resourceType = 'onboarding';
                
                Onboarding.getOnboard(onboardId).then(function(response) {
                    var onboard = response.data.Onboarding;
                    $scope.CommentCount = angular.copy(onboard.CommentCount);
                    
                    openModalNote();
                });
            }
            
            if($scope.isBulkOnboard()) {
                onboardId = $routeParams.bulkOnboardId;
                resourceType = 'bulk';
                
                 Onboarding.getBulkOnboardById($routeParams.bulkOnboardId).then(function(response) {
                    $scope.CommentCount = angular.copy(response.CommentCount);
                    
                    openModalNote();
                });
            }
            
            function openModalNote() {
                var modal = $modal.open({
                    templateType: 'drawer',
                    templateUrl: '/interface/views/recruit/partials/modal-onboard-notes.html',
                    size: 'md',
                    controller: SHRP.ctrl.ModalOnboardNotes,
                    resolve: {
                        data: function() {
                            return {
                                onboardId: onboardId,
                                currentUser: $scope.currentUser,
                                resourceType: resourceType,
                                CommentCount: $scope.CommentCount
                            };
                        }
                    },
                    title: 'Notes',
                    classes: 'drawer__onboard--notes'
                });
            }
        };

        $scope.openResendDocNotes = function(doc) {
            var modal = $modal.open({
                templateType: 'modal',
                templateUrl: '/interface/views/recruit/partials/modal-resend-notes.html',
                size: 'md',
                controller: SHRP.ctrl.ModalResendDoc,
                resolve: {
                    data: function() {
                        return {
                            'onboardId': $scope.data.onboards[0].OnboardId,
                            'requirementId': doc.Id
                        };
                    }
                },
                title: 'Re-send document',
            });

            modal.result.then(function(data) {
                    console.log("resent");
                    doc.IsRejected = true;
                    doc.IsAccepted = false;
            });
        };
        
        $scope.acceptInboundDoc = function(doc) {
            $scope.inboundDocLoading = true;
            Onboarding.acceptInboundDocument($scope.data.onboards[0].OnboardId, doc.Id).then(function() {
                console.log("accepted");
                doc.IsRejected = false;
                doc.IsAccepted = true;
                $scope.inboundDocLoading = false;
            });
        };
        
        $scope.rejectForResend = function(onboard) {
            $scope.inboundDocLoading = true;
            Onboarding.resendOnboard(onboard.OnboardId).then(function(response) {
                console.log('reject succeeded');
                $route.reload();
            });
        };
        
        $scope.resendBtnEnabled = function(docs) {
            if(!docs || !docs.length) {
                return false;
            }
            
            var resentDocs = docs.filter(function(doc) {
                return doc.InboundRequirement && doc.InboundRequirement.IsRejected;
            });
            
            return resentDocs.length > 0;    
        };

        $scope.isOnboardPhaseUndefined = function(index) {
            return Onboarding.isOnboardPhaseUndefined($scope.data.onboards[index]);
        };

        $scope.isOnboardPhaseNew = function(index) {
            return Onboarding.isOnboardPhaseNew($scope.data.onboards[index]);
        };

        $scope.isOnboardPhaseAwaitingApproval = function(index) {
            return Onboarding.isOnboardPhaseAwaitingApproval($scope.data.onboards[index]);
        };

        $scope.isOnboardPhaseDocumentation = function(index) {
            return Onboarding.isOnboardPhaseDocumentation($scope.data.onboards[index]);
        };

        $scope.isOnboardPhaseAwaitingCandidateAcceptance = function(index) {
            return Onboarding.isOnboardPhaseAwaitingCandidateAcceptance($scope.data.onboards[index]);
        };

        $scope.isOnboardPhaseAwaitingConfirmation = function(index) {
            return Onboarding.isOnboardPhaseAwaitingConfirmation($scope.data.onboards[index]);
        };

        $scope.isOnboardPhaseComplete = function(index) {
            return Onboarding.isOnboardPhaseComplete($scope.data.onboards[index]);
        };

        $scope.isOnboardPhaseDeclined = function(index) {
            return Onboarding.isOnboardPhaseDeclined($scope.data.onboards[index]);
        };

        $scope.isCreating = function(index) {
            return !$scope.isOnboardPhaseNew(index) &&
                !$scope.isOnboardPhaseAwaitingApproval(index) &&
                !$scope.isOnboardPhaseAwaitingCandidateAcceptance(index) &&
                !$scope.isOnboardPhaseDocumentation(index) &&
                !$scope.isOnboardPhaseAwaitingConfirmation(index) &&
                !$scope.isOnboardPhaseComplete(index) &&
                !$scope.isOnboardPhaseDeclined(index);
        };

        $scope.isOnboardSourceMember = function() {
            return Onboarding.isOnboardSourceMember($scope.commonOnboard);
        };

        $scope.isOnboardSourceTrial = function() {
            return Onboarding.isOnboardSourceTrial($scope.commonOnboard);
        };

        $scope.isOnboardSourceAgency = function() {
            return Onboarding.isOnboardSourceAgency($scope.commonOnboard);
        };

        $scope.isOnboardSourceSherpa = function() {
            return Onboarding.isOnboardSourceSherpa($scope.commonOnboard);
        };

        $scope.isMenuEditActive = function(index) {
            var isActive = $scope.data.onboards[index].state.isEditable;
            return isActive;
        };
        
        $scope.getOnboardingSetting = function() {
            return Onboarding.getOnboardingSettings();
        };
        
        $scope.createInboundDocumentRequirement = function(onboard) {
            showLoadingIndicator(0);
            var inboundDocument = onboard.inboundDocument;
            var promise;

            if ($scope.isSingleOnboard()) {
                promise = Onboarding.createInboundDocumentRequirement(onboard.OnboardId, inboundDocument);
            }
            if ($scope.isBulkOnboard()) {
                promise = Onboarding.createBulkInboundDocumentRequirement($routeParams.bulkOnboardId, inboundDocument);
            }

            if (promise) {
                return promise.then(function(res) {
                        if ($scope.isSingleOnboard()) {
                            $scope.getInboundDocumentRequirement(onboard);
                        }
                        if ($routeParams.bulkOnboardId &&  $scope.isBulkOnboard()) {
                            $scope.getInboundDocumentRequirementForBulkOnboard($routeParams.bulkOnboardId, onboard);
                        }
                    })
                    .then(function() {
                        $notify.add({
                            message: 'Your inbound document requirement has been added',
                            type: 'success'
                        });
                    })
                    .catch(function() {
                        $notify.add({
                            message: 'Your inbound document requirement could not be added at this time. Please try again later',
                            type: 'error'
                        });
                    })
                    .finally(function(res) {
                        hideLoadingIndicator(0);
                    });
            }
        };
        
        $scope.getInboundDocumentRequirement = function(onboard) {
            return Onboarding.getInboundDocument(onboard.OnboardId).then(function(res) {
                onboard.InboundRequirementListResult = onboard.InboundRequirementListResult || {};
                onboard.InboundRequirementListResult.OnboardDocumentItemResults = onboard.InboundRequirementListResult.OnboardDocumentItemResults || [];
                onboard.InboundRequirementListResult.OnboardDocumentItemResults = res || res.data;
                
                onboard.inboundDocument = null;              
                onboard.state.showInboundDocumentInputFields = false;
            });
        };
        
        $scope.getInboundDocumentRequirementForBulkOnboard = function(bulkId, onboard) {
            return Onboarding.getInboundDocumentForBulkOnboard(bulkId).then(function(res) {
                onboard.InboundRequirementListResult = onboard.InboundRequirementListResult || {};
                onboard.InboundRequirementListResult.OnboardDocumentItemResults = onboard.InboundRequirementListResult.OnboardDocumentItemResults || [];
                onboard.InboundRequirementListResult.OnboardDocumentItemResults = res || res.data;
                
                onboard.inboundDocument = null;              
                onboard.state.showInboundDocumentInputFields = false;
            });
        };
        
        $scope.removeInboundDocumentRequirement = function(onboard, inboundDocument) {
            showLoadingIndicator(0);

            var promise;
            if ($scope.isSingleOnboard()) {
                promise = Onboarding.removeInboundDocumentRequirement(onboard.OnboardId, inboundDocument.InboundRequirement.Id);
            }
            if ($scope.isBulkOnboard()) {
                promise = Onboarding.removeBulkInboundDocumentRequirement($routeParams.bulkOnboardId, inboundDocument.InboundRequirement.Id);
            }

            if (promise) {
                return promise.then(function() {
                        $notify.add({
                            message: 'Your inbound document requirement has been removed',
                            type: 'success'
                        });

                        var removedIdx = onboard.InboundRequirementListResult.OnboardDocumentItemResults.indexOf(inboundDocument);

                        onboard.InboundRequirementListResult.OnboardDocumentItemResults.splice(removedIdx, 1);

                    })
                    .catch(function() {
                        $notify.add({
                            message: 'Your inbound document requirement could not be removed at this time. Please try again later',
                            type: 'error'
                        });
                    })
                    .finally(function(res) {
                        hideLoadingIndicator(0);
                    });
            }
        };
        
        $scope.getInboundDocumentRequirementForBulkOnboard = function(onboard) {
            return Onboarding.getInboundDocumentForBulkOnboard($routeParams.bulkOnboardId).then(function(res) {
                onboard.InboundRequirementListResult = onboard.InboundRequirementListResult || {};
                onboard.InboundRequirementListResult.OnboardDocumentItemResults = onboard.InboundRequirementListResult.OnboardDocumentItemResults || [];
                onboard.InboundRequirementListResult.OnboardDocumentItemResults = res || res.data;
                
                onboard.inboundDocument = null;              
                onboard.state.showInboundDocumentInputFields = false;
            });
        };
        
        $scope.removeReferenceDocuments = function(onboard, referencedocuments) {
            showLoadingIndicator(0);

            var promise;
            if ($scope.isSingleOnboard()) {
                promise = Onboarding.removeReferenceDocuments(onboard.OnboardId, referencedocuments.OnboardDocumentRecord.OnboardDocumentId);
            }
            if ($scope.isBulkOnboard()) {
                promise = Onboarding.removeBulkReferenceDocuments($scope.data.onboards, referencedocuments.OnboardDocumentRecord.OnboardDocumentId);
            }

            if (promise) {
                return promise.then(function() {
                        $notify.add({
                            message: 'Your reference document requirement has been removed',
                            type: 'success'
                        });
                        
                        var fileId = referencedocuments.OnboardDocumentRecord.OnboardDocumentId;
            
                        angular.forEach(onboard.referencedocuments, function(item, idx) {
                            if(item.OnboardDocumentRecord.OnboardDocumentId === fileId) {
                                onboard.referencedocuments.splice(idx,1);
                            }
                        });
                    })
                    .catch(function() {
                        $notify.add({
                            message: 'Your reference document requirement could not be removed at this time. Please try again later',
                            type: 'error'
                        });
                    })
                    .finally(function(res) {
                        hideLoadingIndicator(0);
                    });
            }
        };
        
        $scope.removeReference = function(index) {
            var fileId = $scope.data.referenceDocuments[index].OnboardDocumentRecord.LibraryDocumentId;
            
            angular.forEach($scope.data.referenceDocuments, function(item, idx) {
                if(item.OnboardDocumentRecord.LibraryDocumentId === fileId) {
                    $scope.data.referenceDocuments.splice(idx,1);
                }
            });
        };
        
        $scope.hideInboundDocumentInputFields = function() {
            $scope.data.onboards[0].state.showInboundDocumentInputFields = false;
            $scope.data.onboards[0].inboundDocument = null;
        };

        $scope.DownloadDocument = function(outboundDocument) {
            showLoadingIndicator(0);
            return Onboarding.getDocumentDownloadUrl(outboundDocument.OnboardDocumentRecord)
                .then(function(url) {
                    $window.open(url, '_blank');
                })
                .finally(function(res) {
                    hideLoadingIndicator(0);
                });
        };

        $scope.viewDocument = function(outboundDocument) {
            showLoadingIndicator(0);
            
            var item = {};
            item.name = outboundDocument.OnboardDocumentRecord.FileName;
            
            var fileExt = outboundDocument.OnboardDocumentRecord.FileExt;
            var LibraryDocumentId = outboundDocument.OnboardDocumentRecord.LibraryDocumentId;
            
            if(fileExt === 'pdf' || fileExt === 'doc' || fileExt === 'docx') {
                Onboarding.getViewUrlForDocument(LibraryDocumentId).then(function(res) {
                    item.url = res.data.Url;
                    item.type = 'pdf';
                 
                    view(item);
                });
            }
            
            if(fileExt === 'img') {
                Onboarding.getArtifactById(LibraryDocumentId).then(function(res) {
                    item.url = res.Url || res.data.Url;
                    item.type = 'img';
                 
                    view(item);
                });
            }
        };
        
        function view(item) {
            $scope.items = [];
            
            $scope.items.push(item);
            
            var modal = $modal.open({
                templateType: 'lightbox',
                templateUrl: '/interface/views/common/partials/lightbox-gallery.html',
                controller: SHRP.ctrl.ModalLibraryLightboxCTRL,
                resolve: {
                    items: function() {
                        return $scope.items;
                    },
                    currentIndex: function() {
                        return 0;
                    }
                }
            });
            
            hideLoadingIndicator(0);
        }
        
        $scope.removeOutboundDocument = function(onboard, outboundDocument) {
            showLoadingIndicator(0);

            var fileName = outboundDocument.OnboardDocumentRecord.FileName;
            var promise;

            if ($scope.isSingleOnboard()) {
                promise = Onboarding.removeOutboundDocument(
                        onboard.OnboardId,
                        outboundDocument.OnboardDocumentRecord.OnboardDocumentId);
            }
            if ($scope.isBulkOnboard()) {
                promise = Onboarding.removeBulkOutboundDocument(
                        $routeParams.bulkOnboardId,
                        outboundDocument.OnboardDocumentRecord.OnboardDocumentId);
            }

            if (promise) {
                return promise
                    .then(function() {
                        var outboundDocuments = onboard.OutboundDocuments.OnboardDocumentItemResults;
                        var idx = outboundDocuments.indexOf(outboundDocument);

                        outboundDocuments.splice(idx, 1);

                        $notify.add({
                            message: 'The document "' + fileName + '" has been removed',
                            type: 'success'
                        });
                    })
                    .catch(function() {
                        $notify.add({
                            message: 'The document "' + fileName + '" could not be removed at this time. Please try again later',
                            type: 'error'
                        });
                    })
                    .finally(function(res) {
                        hideLoadingIndicator(0);
                    });
            }
        };

        $scope.addOutboundDocument = function(onboardId, libraryDocumentId, bulkId) {
            Onboarding.addOutboundDocument(onboardId, libraryDocumentId, bulkId)
                .then(function() {
                    if($routeParams.bulkOnboardId && bulkId) {
                      return Onboarding.getOutboundDocumentsForBulkOnboard(bulkId)
                          .then(function(response) {
                            $scope.data.onboards[0].OutboundDocuments = response.Data;
                          });
                    } else {
                      return Onboarding.getOutboundDocuments(onboardId)
                          .then(function(outboundDocuments) {
                              $scope.data.onboards[0].OutboundDocuments = outboundDocuments;
                          });
                    }
                })
                .then(function() {
                    $notify.add({
                        message: 'The document has been added',
                        type: 'success'
                    });
                })
                .catch(function() {
                    $notify.add({
                        message: 'The document could not be added at this time. Please try again later',
                        type: 'error'
                    });
                });
        };
        
        $scope.addReferenceDocument = function(onboardId, libraryDocumentId, bulkId) {
           Onboarding.addReferenceDocument(onboardId, libraryDocumentId, bulkId).then(function() {
               Onboarding.getReferenceDocuments(onboardId).then(function(response) {
                   $scope.data.onboards[0].referencedocuments = response.OnboardDocumentItemResults || response.data.OnboardDocumentItemResults;
               });
           });
        };

        $scope.viewInboundDocument = function(inboundDocument) {
            showLoadingIndicator(0);

            return Onboarding
                .getDocumentDownloadUrl(inboundDocument.InboundRequirement.InboundDocument)
                .then(function(url) {
                    $window.open(url, '_blank');
                })
                .finally(function(res) {
                    hideLoadingIndicator(0);
                });
        };

        $scope.isBulkOnboard = function() {
            return $scope.listType === OnboardingConstants.ONBOARD_LIST_TYPE_BULK;
        };

        $scope.isSingleOnboard = function() {
            return $scope.listType === OnboardingConstants.ONBOARD_LIST_TYPE_SINGLE;
        };

        $scope.allStateChanges = function(onboard) {
            onboard.state.isCollapsedDetails = !onboard.state.isCollapsedDetails;
            onboard.state.isCollapsedCandidateDetails = onboard.state.isCollapsedDetails;
            onboard.state.isCollapsedProposedRole = onboard.state.isCollapsedDetails;
            onboard.state.isCollapsedSourcingInformation = onboard.state.isCollapsedDetails;
            onboard.state.isCollapsedPayrollDetails = onboard.state.isCollapsedDetails;
            onboard.state.isCollapsedManagerApproval = onboard.state.isCollapsedDetails;
            onboard.state.isCollapsedSaveOptions = onboard.state.isCollapsedDetails;
        };

        init();
        
        Members.me().then(function(response) {
            $timeout(function() {
                $scope.currentUser = response.data;
            });
        });
            
        function init() {
            $scope.getOnboardingSetting().then(function(res) {
                $scope.onboardingSettings = res;
            });
            
            if ($routeParams.onboardId && $scope.isSingleOnboard()) {
                $scope.editOnboarding = true;
                
                Onboarding.getOnboard($routeParams.onboardId).then(function(response) {
                    $scope.data.onboards = [];
                    var onboard = response.data.Onboarding;
                    //fix bug 16135 Calendar is not correctly displayed
                    // use $filter date time to utc
                   var date =  (onboard.EffectiveDate) ? $filter('utcTimestamp')(onboard.EffectiveDate) : null;
                    if(date) {
                        onboard.EffectiveDate = date;
                    }
                    onboard.previousValues = angular.copy(onboard);
                    $scope.CommentCount = angular.copy(onboard.CommentCount);
                    
                    Onboarding.getReferenceDocuments($routeParams.onboardId).then(function(res) {
                        if (res && res.OnboardDocumentItemResults) {
                            onboard.referencedocuments = res.OnboardDocumentItemResults;
                        }
                    });

                    $scope.data.onboards.push(onboard);
                    
                    onboard.state = angular.copy(onboard.state) || angular.copy(onboardState);
                    prepareOnboardContactsForView(onboard, 0);
                    prepareOnboardSourceForView(onboard, 0);

                    collapsePanes(onboard);
                                        
                    $scope.commonOnboard = angular.copy(onboard);
                    $scope.populatePanelForOnboarding($scope.data.onboards); //Populate the list of panel for the onboarding process
                });
            }
            else if ($routeParams.bulkOnboardId && $scope.isBulkOnboard()) {
                $scope.editOnboarding = true;

                Onboarding.getBulkOnboardById($routeParams.bulkOnboardId).then(function(response) {
                    $scope.data.onboards = [];
                    
                    response.BulkOnboardingDetail.state = angular.copy(onboardState);
                    $scope.commonOnboard = angular.copy(response.BulkOnboardingDetail);
                    $scope.CommentCount = angular.copy(response.CommentCount);
                    
                    var onboardings = response.Onboardings;

                    if (response && onboardings) {
                        $scope.data.onboards.length = 0;
                    }

                    angular.forEach(onboardings, function(oboarding, index) {
                        oboarding.state = angular.copy(oboarding.state) || angular.copy(onboardState);
                        oboarding.previousValues = angular.copy(oboarding);
                        
                        $scope.data.onboards.push(oboarding);
                        
                        prepareOnboardContactsForView(oboarding, index);
                        prepareOnboardSourceForView(oboarding, index);
                        collapsePanes(oboarding);
                    });

                });
            }

            $scope.$watchCollection('data.outboundDocuments', function(newVal, oldVal) {
                if (!newVal || newVal === oldVal || !newVal.length) {
                    return;
                }
                
                var newestFileId = newVal[newVal.length - 1].LibraryDocumentId;
                
                if($routeParams.bulkOnboardId && $scope.isBulkOnboard()) {
                   $scope.addOutboundDocument(onboardId, newestFileId, $routeParams.bulkOnboardId);
                } else {
                  var onboardId = $scope.data.onboards[0].OnboardId;
                   $scope.addOutboundDocument(onboardId, newestFileId);
                }
            });
            
            $scope.$watchCollection('data.onboards[0].OutboundDocuments', function(newVal, oldVal) {
                if (!newVal || newVal === oldVal || !newVal.length) {
                    return;
                }
                
                return $scope.data.onboards[0].OutboundDocuments;
            });
            
            $scope.$watchCollection('data.referenceDocuments', function(newVal, oldVal) {
                if (!newVal || newVal === oldVal || !newVal.length) {
                    return;
                }
                                
                if(!$scope.isOnboardPhaseUndefined(0)) {
                    var newestFileId = newVal[newVal.length - 1].OnboardDocumentRecord.LibraryDocumentId;

                    if($routeParams.bulkOnboardId && $scope.isBulkOnboard()) {
                        $scope.addReferenceDocument(onboardId, newestFileId, $routeParams.bulkOnboardId);
                    } else {
                        var onboardId = $scope.data.onboards[0].OnboardId;
                        $scope.addReferenceDocument(onboardId, newestFileId);
                    }
                } else {
                    $scope.data.onboards[0].referencedocuments = $scope.data.referenceDocuments;
                }
            }); 
            
            $scope.$watchCollection('data.onboards[0].referencedocuments', function(newVal, oldVal) {
                if (!newVal || newVal === oldVal || !newVal.length) {
                    return;
                }
                
                return $scope.data.onboards[0].referencedocuments;
           });

            /*
             * Use to determine the current stage of the process
             * Set the progress bar step properly
             */
            $scope.stagesList = ['Approval', 'Documents', 'Acceptance', 'Confirmation']; //This is used as title headers for the progress bar
            $scope.getCurrentProgressStage = function() {
                switch ($scope.data.onboards[0].Status) {
                    case 'New':
                    case 'Declined':
                        return 0;
                    case 'Approval':
                        return 1;
                    case 'Documentation':
                        return 2;
                    case 'Acceptance':
                        return 3;
                    case 'Confirmation':
                    case 'Complete':
                        return 4;
                    default:
                        return 0;
                }
            };

            /**
             * Populate the panel for the onboarding process
             * Order in array panelForOnboarding is important based on the UX
             * Mapping based on the discussion on Slack with Vish
             *  Approval     -> 'LastApproval' field in the api
             *  Documents    -> 'DocumentationAdmin' field in the api
             *  Acceptance   -> 'CandidatePersonalInfo' in the api
             *  Confirmation -> 'Confirmer' in the api
             */
            $scope.panelForOnboarding = [];
            $scope.populatePanelForOnboarding = function(data) {
                var currentStatus = data[0].status,
                    steps = _.pick(data[0], ['CandidatePersonalInfo', 'LastApproval', 'Confirmer', 'DocumentationAdmin', 'Creator']);

                if(steps.Confirmer) {
                    $scope.panelForOnboarding.push(new ConfirmerModel(steps.Confirmer.Title, `${steps.Confirmer.FirstName} ${steps.Confirmer.Surname}`, steps.Confirmer.PhotoThumb, currentStatus === 'Confirmation', null));
                }

                if(steps.CandidatePersonalInfo) {
                    $scope.panelForOnboarding.push(new AcceptorModel(steps.CandidatePersonalInfo.Title, `${steps.CandidatePersonalInfo.FirstName} ${steps.CandidatePersonalInfo.Surname}`, steps.CandidatePersonalInfo.PhotoThumb, currentStatus === 'Acceptance', null));
                }

                if(steps.DocumentationAdmin) {
                    $scope.panelForOnboarding.push(new DocumentorModel(steps.DocumentationAdmin.Title, `${steps.DocumentationAdmin.FirstName} ${steps.DocumentationAdmin.Surname}`, steps.DocumentationAdmin.PhotoThumb, currentStatus === 'Documentation', null));
                }

                //TODO: steps for approver
                if(steps.LastApproval) { //Awaiting response from Vish
                    $scope.panelForOnboarding.push(new ApproverModel());
                }

                if(steps.Creator) {
                    $scope.panelForOnboarding.push(new CreatorModel(steps.Creator.RoleTitle, `${steps.Creator.FirstName} ${steps.Creator.Surname}`, steps.Creator.PhotoThumb, currentStatus === 'New', null));
                }
            };
        }
       
        function createReferenceDocuments(onboard) {
            var promises = [];
            
            if(!onboard || !onboard.referencedocuments || !onboard.referencedocuments.length) {
                return promises;
            }
                        
            if ($scope.isSingleOnboard()) {
                if(onboard.referencedocuments.length > 0) {
                    for (var i = 0;i < onboard.referencedocuments.length ; i++) {
                        promises.push($scope.addReferenceDocument(onboard.OnboardId, onboard.referencedocuments[i].OnboardDocumentRecord.LibraryDocumentId));
                    }
                }                
            } else {
                //TODO
            }
            
            return promises;
        }

        //$scope.$watch('commonOnboard', function (newVal, oldVal) {
        //    if (newVal && newVal !== oldVal) {
        //        $scope.commonOnboard.previousOnboard = oldVal;
        //    }
        //}, true);

        //$scope.$watch('data.onboards', function (newVal, oldVal) {
        //    if (newVal && newVal !== oldVal && newVal.length === $scope.data.onboards.length) {
        //        angular.forEach(newVal, function (onboard, index) {
        //            if (onboard !== $scope.data.onboards[index]) {
        //                $scope.data.onboards[index].previousValues = onboard;
        //            }
        //        });
        //    }
        //}, true);

        // this is responsible for transforming the contacts ng-model data
        // structure into the the structure expected by the api
        $scope.prepareOnboardContactsForServer = function(onboard, address, phones, emails) {
            var onboardCopy = angular.copy(onboard);
            var addressCopy = angular.copy(address);
            var phonesCopy = angular.copy(phones);
            var emailsCopy = angular.copy(emails);

            onboardCopy.CandidateContacts = [];
            
            if(addressCopy !== null) {
                addressCopy.Type = OnboardingConstants.ONBOARD_CONTACT_TYPE_ADDRESS;
            } else {
                addressCopy = null;
            }
            
            phonesCopy = phonesCopy.map(function(item) {
                item.ContactInfoId = item.id;
                item.Phone = item.value;
                item.Type = OnboardingConstants.ONBOARD_CONTACT_TYPE_PHONE;
                delete item.value;
                return item;
            });

            emailsCopy = emailsCopy.map(function(item) {
                item.ContactInfoId = item.id;
                item.Email = item.value;
                item.Type = OnboardingConstants.ONBOARD_CONTACT_TYPE_EMAIL;
                delete item.value;
                return item;
            });

            onboardCopy.CandidateContacts.push(addressCopy);
            Array.prototype.push.apply(onboardCopy.CandidateContacts, phonesCopy);
            Array.prototype.push.apply(onboardCopy.CandidateContacts, emailsCopy);

            return onboardCopy;
        };

        // this is responsible for transforming the contacts data structure
        // returned by the api into the the structure expected by ng-model
        function prepareOnboardContactsForView(onboard, index) {
            if (onboard.CandidateContacts && onboard.CandidateContacts.length) {
                var address = onboard.CandidateContacts.filter(function(item) {
                    return item.Type === OnboardingConstants.ONBOARD_CONTACT_TYPE_ADDRESS;
                })[0];

                var phones = onboard.CandidateContacts
                    .filter(function(item) {
                        return item.Type === OnboardingConstants.ONBOARD_CONTACT_TYPE_PHONE;
                    })
                    .map(function(item) {
                        return {
                            id: item.ContactInfoId,
                            value: item.MobilePhone,
                            isPrimary: item.IsPrimary,
                            isPublic: item.IsPrivate === false
                        };
                    });

                var emails = onboard.CandidateContacts
                    .filter(function(item) {
                        return item.Type === OnboardingConstants.ONBOARD_CONTACT_TYPE_EMAIL;
                    })
                    .map(function(item) {
                        return {
                            id: item.ContactInfoId,
                            value: item.Email,
                            isPrimary: item.IsPrimary,
                            isPublic: item.IsPrivate === false
                        };
                    });

                $scope.data.onboards[index].address = address ? address : {};
                $scope.data.onboards[index].phones = phones;
                $scope.data.onboards[index].emails = emails;
            }
        }

        // this is responsible for transforming the onboard source data structure
        // in ng-model to the structure the structure expected by the api
        function prepareOnboardSourceForServer(onboard, referringMemberId) {
            if (!referringMemberId) {
                return onboard;
            }

            var onboardCopy = angular.copy(onboard);

            onboardCopy.SourceDetail = $scope.commonOnboard.SourceDetail || {};
            onboardCopy.SourceDetail.ReferalMembers = [];
            onboardCopy.SourceDetail.ReferalMembers.push({
                MemberId: referringMemberId
            });

            return onboardCopy;
        }

        function prepareOnboardProposedRole(onboard, commonOnboard)
        {
            onboard.OnboardRole =  angular.copy(commonOnboard.OnboardRole);
            onboard.OnboardStore = angular.copy(commonOnboard.OnboardStore);
            onboard.SalaryType = angular.copy(commonOnboard.SalaryType);
            onboard.HoursPerWeek = angular.copy(commonOnboard.HoursPerWeek);
            onboard.EmploymentType = angular.copy(commonOnboard.EmploymentType);
            onboard.EmploymentClassification = angular.copy(commonOnboard.EmploymentClassification);
            onboard.CommencementDate = angular.copy(commonOnboard.EffectiveDate);
            onboard.SalaryPayRate = angular.copy(commonOnboard.SalaryPayRate);
            //onboard.Payroll =  angular.copy(commonOnboard.Payroll);
            onboard.DesiredSalary = angular.copy(commonOnboard.DesiredSalary);
            onboard.TaxCode = angular.copy(commonOnboard.TaxCode);
        }
        
        //#region prepare data for update single onboard
        function prepareOnboardForUpdate(onboard, commonOnboard) {
            onboard = $scope.prepareOnboardContactsForServer(onboard, onboard.address, onboard.phones, onboard.emails);
            onboard.SourceDetail = angular.copy(commonOnboard.SourceDetail);
            onboard.referringMemberId = angular.copy(commonOnboard.referringMemberId);
            onboard.RegisterKey = angular.copy(commonOnboard.RegisterKey);
            prepareOnboardProposedRole(onboard, commonOnboard);
            onboard = prepareOnboardSourceForServer(onboard, onboard.referringMemberId);
            return onboard;
        }
        //#endregion
        
        //#region prepare data for create bulk onboard
        function prepareBulkOnboardDataForServer(onboards, commonOnboard, artifactId) {
            var bulkOnboards = {};

            if (artifactId) {
                bulkOnboards = {
                    RoleId          : angular.copy(commonOnboard.OnboardRole.RoleId),
                    NetworkGroupId  : angular.copy(commonOnboard.OnboardStore.NetworkGroupId),
                    CommencementDate: angular.copy(commonOnboard.EffectiveDate),
                    SalaryTypeId    : angular.copy(commonOnboard.SalaryType.SalaryTypeId),
                    EmploymentTypeId: angular.copy(commonOnboard.EmploymentType.EmploymentTypeId),
                    HoursPerWeek    : angular.copy(commonOnboard.HoursPerWeek),
                    EffectiveDate   : angular.copy(commonOnboard.EffectiveDate),
                    DesiredSalary   : angular.copy(commonOnboard.DesiredSalary),
                    TaxCodeId       : angular.copy(commonOnboard.TaxCode.TaxCodeId),
                    EmploymentClassificationId: angular.copy(commonOnboard.EmploymentClassification.EmploymentClassificationId),
                    //OperatorId    : angular.copy(commonOnboard.PayRoll.OperatorId),
                    //DebtorId      : angular.copy(commonOnboard.PayRoll.DebtorId)
                };
            } else {
                bulkOnboards = {
                    ProposedRoleDetail: {
                        HoursPerWeek    : angular.copy(commonOnboard.HoursPerWeek),
                        EffectiveDate   : angular.copy(commonOnboard.EffectiveDate),
                        OnboardRole     :angular.copy(commonOnboard.OnboardRole),
                        //PayRoll         :angular.copy(commonOnboard.PayRoll),
                        OnboardStore    :angular.copy(commonOnboard.OnboardStore),
                        SalaryType      :angular.copy(commonOnboard.SalaryType),
                        EmploymentType  :angular.copy(commonOnboard.EmploymentType),
                        EmploymentClassification    :angular.copy(commonOnboard.EmploymentClassification),
                        TaxCode         : angular.copy(commonOnboard.TaxCode),
                        SourceDetail    :angular.copy(commonOnboard.SourceDetail),
                        CommencementDate   : angular.copy(commonOnboard.EffectiveDate),
                        DesiredSalary      : angular.copy(commonOnboard.DesiredSalary),
                    },
                    Candidates: prepareCandidatesForCreateBulkOnboard(onboards)
                };
            }

            return bulkOnboards;
        }

        //#region format data for candidates list before send to server
        function prepareCandidatesForCreateBulkOnboard(onboards) {   
            var candidates = [];
                     
            angular.forEach(onboards, function(onboard, index) {
                var data = $scope.prepareOnboardContactsForServer(onboard, onboard.address, onboard.phones, onboard.emails);
                var CandidateContacts = data.CandidateContacts;
                var CandidatePersonalInfo = data.CandidatePersonalInfo;

                candidates[index] = {
                    Salutation: CandidatePersonalInfo.Salutation,
                    FirstName: CandidatePersonalInfo.FirstName,
                    Surname: CandidatePersonalInfo.Surname,
                    Country: {
                        Value: data.address.CountryId
                    },
                    Address: data.address.Address,
                    Suburb: data.address.Suburb,
                    Postcode: data.address.Postcode,
                    StateName: data.address.StateName,
                    Sex: CandidatePersonalInfo.Sex,
                    BirthDay: CandidatePersonalInfo.BirthDay,
                    Contacts: CandidateContacts
                };
            });
           
            return candidates;
        }
        //#endregion
        
        function prepareOnboardSourceForView(onboard, index) {
            var referralMembers = onboard.SourceDetail && onboard.SourceDetail.ReferalMembers;

            if (referralMembers && referralMembers.length) {
                $scope.data.onboards[index].referringMemberId = referralMembers[0].MemberId;
            }
        }

        function getCandidateName(onboard) {
            var candidateInfo = onboard.CandidatePersonalInfo;
            var name = candidateInfo.FirstName + ' ' + candidateInfo.Surname;
            return name;
        }

        function getCandidateRole(onboard) {
            var proposedRole = onboard.OnboardRole;
            var role = proposedRole.Description;
            return role;
        }

        function showLoadingIndicator(index) {
            $scope.data.onboards[index].isSubmitting = true;
        }

        function hideLoadingIndicator(index) {
            $scope.data.onboards[index].isSubmitting = false;
        }

        function collapsePanes(onboard) {
            if (Onboarding.isOnboardPhaseDocumentation(onboard) ||
                Onboarding.isOnboardPhaseAwaitingCandidateAcceptance(onboard) ||
                Onboarding.isOnboardPhaseAwaitingConfirmation(onboard)) {
                onboard.state = onboard.state || {};
                onboard.state.isCollapsedCandidateDetails = true;
                onboard.state.isCollapsedProposedRole = true;
                onboard.state.isCollapsedSourcingInformation = true;
                onboard.state.isCollapsedPayrollDetails = true;
                onboard.state.isCollapsedManagerApproval = true;
                onboard.state.isCollapsedSaveOptions = true;
            }
        }
        
        $scope.hasSalaryTypeDefault = false;
        
        $scope.checkSalaryTypeDefault = function(salaryType) {
            if(salaryType === null) {
                return;
            }
            
            var setting = $scope.onboardingSettings;
            
            if(salaryType === OnboardingConstants.SALARY_TYPE_CASUAL) {
                if(setting.CasualDefaultHoursPerWeek !== 0) {
                    $scope.hasSalaryTypeDefault = true;
                    
                    $scope.commonOnboard.HoursPerWeek = setting.CasualDefaultHoursPerWeek;
                } else {
                    $scope.hasSalaryTypeDefault = false;
                    $scope.commonOnboard.HoursPerWeek = null;
                }
            }
            
            if(salaryType === OnboardingConstants.SALARY_TYPE_HOURLY_FT_PT) {
                if(setting.HourlyDefaultHoursPerWeek !== 0) {
                    $scope.hasSalaryTypeDefault = true;
                    
                    $scope.commonOnboard.HoursPerWeek = setting.HourlyDefaultHoursPerWeek;
                }else {
                    $scope.hasSalaryTypeDefault = false;
                    $scope.commonOnboard.HoursPerWeek = null;
                }
            }
            
            if(salaryType === OnboardingConstants.SALARY_TYPE_SALARIED) {
                if(setting.SalariedDefaultHoursPerWeek !== 0) {
                    $scope.hasSalaryTypeDefault = true;
                    
                    $scope.commonOnboard.HoursPerWeek = setting.SalariedDefaultHoursPerWeek;
                }else {
                    $scope.hasSalaryTypeDefault = false;
                    $scope.commonOnboard.HoursPerWeek = null;
                }
            }
        };
    }
});

var SHRP = SHRP || {};
SHRP.ctrl = SHRP.ctrl || {};

SHRP.ctrl.ModalResendDoc = [
'$scope', '$modalInstance', 'Onboarding', 'Paths', 'data',
function($scope, $modalInstance, onboarding, paths, data) {
    $scope.isLoading = false;
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.close = function() {
        $modalInstance.close();
    };

    $scope.rejectInboundDocument = function(rejectEntry) {
        $scope.isLoading = true;
        onboarding.rejectInboundDocument(data.onboardId, data.requirementId, rejectEntry).then(function() {
            $scope.close(rejectEntry);
            $scope.isLoading = false;
        });
    };

}];


SHRP.ctrl.ModalOnboardNotes = ['$scope', '$modalInstance', 'data',function($scope, $modalInstance, data) {
    $scope.isLoading = false;
    
    $scope.data = data || {};
    
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
      
    $scope.close = function() {
        $modalInstance.close();
    };
}];
