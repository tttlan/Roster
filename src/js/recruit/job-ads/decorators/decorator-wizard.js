angular.module('ui.recruit.jobs').config(function($provide) {
    $provide.decorator('wizardDirective', ['$delegate', '$controller', 'JobAdsService', 'EntityActionType', '$notify', 'JobDetailsService', 'JobAdsModel', 'JobStatusConstants',
        function($delegate, $controller, JobAdsService, EntityActionType, $notify, JobDetailsService, JobAdsModel, JobStatusConstants) {
            let directive = $delegate[0];
            let controllerName = directive.controller;
            directive.controller = ['$scope', function($scope) {
                angular.extend(this, $controller(controllerName, { $scope: $scope }));
                $scope.jobAdId = ($scope.$parent.jobAdDetailsFormModel.jobId) ? $scope.$parent.jobAdDetailsFormModel.jobId : null;
                $scope.EntityActionType = EntityActionType;
                $scope.jumpToStep = (index) => {
                    if ($scope.currentStepNumber >= index) {
                        $scope.goToStep(index);
                    }
                };

                $scope.saveAndNext = () => {
                    if ($scope.canGoToNext()) {
                        $scope.save();
                    }
                };
                $scope.save = (isClosed) => {
                    $scope.$parent.loading = true;
                    switch ($scope.currentStepNumber) {
                        case 0:
                            {
                                let action = $scope.$parent.jobAdDetailsFormModel.jobId ? 'updateJobAds' : 'createJobAds';
                                JobAdsService[action]($scope.$parent.jobAdDetailsFormModel).then((response) => {
                                    if (action === 'createJobAds') {
                                        $scope.$parent.jobAdDetailsFormModel.jobId = response.data;
                                    }
                                    $scope.jobAdId = $scope.$parent.jobAdDetailsFormModel.jobId;
                                    //get details job ads and goto next step
                                    JobDetailsService.getJobDetailsByJobId($scope.$parent.jobAdDetailsFormModel.jobId).then(function(res) {
                                        $scope.$parent.jobAdDetailsFormModel = res.jobAdsDetailsModel;
                                        $scope.$parent.jobAdQuestionnaireModel = res.jobAdsDetailsModel.customQuestionTemplateDetails;
                                        $scope.$parent.jobAdsAssessorModels = res.jobAdsDetailsModel.listDefaultAssessor;
                                        $scope.$parent.jobAdsBoardsModel = res.jobAdsDetailsModel.jobPostsInfo;
                                        $scope.$parent.jobAdsBoardsModel.networkId = res.jobAdsDetailsModel.networkId;
                                        $scope.$parent.isLoaded = false;
                                        if (isClosed) {
                                            $scope.$parent.cancel(false);
                                        }
                                        JobAdsService.searchKeyContact().then(function(rp) {
                                            $scope.$parent.jobAdsBoardsModel.siSelectKeyContacts = rp.data;
                                            $scope.$parent.jobAdsBoardsModel.siSelectKeyContacts.forEach(function(item) {
                                                if (item.Value == $scope.$parent.jobAdsBoardsModel.siKeyContactId) {
                                                    $scope.$parent.jobAdsBoardsModel.siKeyContact = item;
                                                }
                                            });

                                            JobAdsService.searchNetworkGroups().then(function(result) {
                                                $scope.$parent.jobAdsBoardsModel.siNetworkGrousGroupIds = result.data;
                                            }).finally(() => {
                                                $scope.$parent.isLoaded = true;
                                            });
                                        });
                                        $scope.goToStep($scope.currentStepNumber + 1);
                                    }).finally(() => {
                                        $scope.$parent.loading = false;
                                    });
                                }, () => {
                                    $scope.$parent.loading = false;
                                });
                                break;
                            }
                        case 1:
                            {
                                if ($scope.$parent.jobAdQuestionnaireModel.selectedCustomQuestions.length
                                    || $scope.$parent.jobAdQuestionnaireModel.selectedPhoneQuestions.length) {
                                    JobAdsService.addQuestionnaireToJob($scope.$parent.jobAdQuestionnaireModel.selectedCustomQuestions,
                                        $scope.$parent.jobAdQuestionnaireModel.selectedPhoneQuestions, $scope.jobAdId).then(function(res) {
                                            if (isClosed) {
                                                $scope.$parent.cancel(false);
                                            } else {
                                                $scope.goToStep($scope.currentStepNumber + 1);
                                            }
                                        }).finally(() => {
                                            $scope.$parent.loading = false;
                                        });
                                } else {
                                    $scope.$parent.loading = false;
                                    $scope.goToStep($scope.currentStepNumber + 1);
                                }
                                break;
                            }
                        case 2:
                            {
                                JobAdsService.updateJobPostsByJobId($scope.jobAdId, $scope.$parent.jobAdsBoardsModel.toApi()).then((res) => {
                                    if (isClosed) {
                                        $scope.$parent.cancel(false);
                                    } else {
                                        $scope.goToStep($scope.currentStepNumber + 1);
                                    }
                                }).finally(() => {
                                    $scope.$parent.loading = false;
                                });
                                break;
                            }
                        case 3:
                            {
                                JobAdsService.addAssessor($scope.$parent.jobAdsAssessorModels, $scope.jobAdId).then((res) => {
                                    if (isClosed) {
                                        $scope.$parent.cancel(false);
                                    } else {
                                        $scope.goToStep($scope.currentStepNumber + 1);
                                    }
                                }).finally(() => {
                                    $scope.$parent.loading = false;
                                });
                                break;
                            }
                        case 4:
                            {
                                // TODO - for job preview step
                                break;
                            }
                        default:
                            break;
                    }
                };

                $scope.deleteJob = () => {
                    $scope.$parent.loading = true;
                    JobAdsService.deleteJob($scope.jobAdId).then((res) => {
                        $notify.add({
                            message: 'The job has been deleted',
                            type: 'success'
                        });
                        $scope.$parent.cancel(false);
                    }).finally(() => {
                        $scope.$parent.loading = false;
                    });
                };

                $scope.publishJob = () => {
                    $scope.$parent.loading = true;
                    JobAdsService.publishJobAds($scope.jobAdId).then((res) => {
                        $notify.add({
                            message: 'The job has been published',
                            type: 'success'
                        });
                        $scope.$parent.jobAdDetailsFormModel.statusCode = JobAdsModel.determineStatus(JobStatusConstants.JOB_STATUS_PUBLISHED);
                        $scope.$parent.cancel(true);
                    }).finally(() => {
                        $scope.$parent.loading = false;
                    });
                };
            }];
            return $delegate;
        }
    ]
    );
}
);



