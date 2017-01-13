angular.module('ui.recruit.onboard')

    .directive('onboardListing', function(Onboarding, $route, $location, Paths, $notify, Permissions, OnboardingConstants, $modal, Members, $timeout, $filter) {
        return {
            restrict: 'E',
            templateUrl: 'interface/views/recruit/onboard-listing.html',
            scope: {
                isSingle: '='
            },
            controller: controller
        };

        function controller($scope) {
            $scope.data = {
                searchQuery: null,
                isShowingBulkOnboards: false
            };
            $scope.onboardingSettings = {};
            $scope.predicate = 'created';
            $scope.reverse = true;
            $scope.showFilterStatus = false;
            $scope.currentFilterCollection = 'All';
            $scope.onboardingSelect = [];

            // create sort onboarding by field, call server to get sorted list
            $scope.order = predicate => {
                $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : $scope.reverse;
                $scope.predicate = predicate;
                $scope.page.orderAsc = $scope.reverse;
                $scope.page.orderBy = $scope.getSortBy(predicate);
                $scope.page.current = 1;
                $scope.page.update();
            };
            $scope.getSortBy = predicate =>{
                switch ($scope.predicate) {
                    case 'name':
                        return OnboardingConstants.ONBOARD_SORTBY_NAME;
                    case 'role':
                        if($scope.isSingle){
                            return OnboardingConstants.ONBOARD_SORTBY_ROLE_SINGLE;
                        }
                        else {
                            return OnboardingConstants.ONBOARD_SORTBY_ROLE_BULK;
                        }
                    case 'type':
                        return  OnboardingConstants.ONBOARD_SORTBY_TYPE;
                    case 'elapsed':
                        return OnboardingConstants.ONBOARD_SORTBY_ELAPSED;
                    case 'created':
                        return OnboardingConstants.ONBOARD_SORTBY_CREATED;
                    case 'effective':
                        return OnboardingConstants.ONBOARD_SORTBY_EFFECTIVE;
                    case 'candidates':
                        return OnboardingConstants.ONBOARD_SORTBY_CANDIDATES;
                    default:
                        return OnboardingConstants.ONBOARD_SORTBY_CREATED;
                }
            };

            $scope.isProgressBarNegative = onboard => Onboarding.phaseChecks.isOnboardPhaseDeclined(onboard);
            $scope.createOnboard = () => $location.path(Paths.get('recruit.onboards.create.single').path);
            $scope.createBulkOnboard = () => $location.path(Paths.get('recruit.onboards.create.bulk').path);

            $scope.$watch('data.searchQuery', (newVal, oldVal) => {
                if (newVal === oldVal) {
                    return;
                }

                $scope.page.setFilter(newVal);
            });

            $scope.getOnboardingSetting = function() {
                return Onboarding.getOnboardingSettings().then(function(res) {
                    $scope.onboardingSettings = angular.copy(res);
                });
            };
            
            Members.me().then(function(response) {
                $timeout(function() {
                    $scope.currentUser = response.data;
                });
            });

            $scope.getOnboards = function() {
                var status = $scope.parseFilterStatus();
                if ($scope.isSingle) {
                    return Onboarding.getOnboards(
                        $scope.page.filter,
                        $scope.page.current,
                        $scope.page.size,
                        $scope.page.orderBy,
                        $scope.page.orderAsc,
                        status
                    ).then(function(response) {
                        $scope.onboards = response.data.OnboardingSummaryItemResults;
                        $scope.onboardingSelect = [];
                        return response;
                    });
                } 
                else {
                    return Onboarding.getBulkOnboards(
                        $scope.page.filter,
                        $scope.page.current,
                        $scope.page.size,
                        $scope.page.orderBy,
                        $scope.page.orderAsc,
                        status
                    ).then(function(response) {
                        $scope.onboards = response.data.BulkOnboardingSummaryItemResult;
                        $scope.onboardingSelect = [];
                        
                        return response;
                    });
                }
            };

            $scope.getProgressBarPercentage = onboard => {
                if (Onboarding.phaseChecks.isOnboardPhaseNew(onboard)) { return getStyle(0); }
                else if (Onboarding.phaseChecks.isOnboardPhaseAwaitingApproval(onboard)) { return getStyle(20);}
                else if (Onboarding.phaseChecks.isOnboardPhaseDocumentation(onboard)) { return getStyle(40); }
                else if (Onboarding.phaseChecks.isOnboardPhaseAwaitingCandidateAcceptance(onboard)) { return getStyle(60); }
                else if (Onboarding.phaseChecks.isOnboardPhaseAwaitingConfirmation(onboard)) { return getStyle(80); }
                else if (Onboarding.phaseChecks.isOnboardPhaseComplete(onboard)) { return getStyle(100); }
                else if (Onboarding.phaseChecks.isOnboardPhaseDeclined(onboard)) { return getStyle(100); }

            };

            function getStyle(value){
                return {
                    width: value + '%'
                };
            }

            $scope.ActiveFilter = opt => {
                $scope.showFilterStatus = false;
                if($scope.currentFilterCollection !== opt) {
                    $scope.currentFilterCollection = opt;
                    $scope.page.current = 1;
                    // fix issue back end return no content when no record
                    $scope.page.totalPages = 0;
                    $scope.page.showing = 0;
                    $scope.page.total = 0;
                    //
                    $scope.page.update();
                }
            };

            $scope.parseFilterStatus = () => {
                switch ($scope.currentFilterCollection) {
                    case 'All':
                         return false;
                    case 'New':
                        return  OnboardingConstants.ONBOARD_STATUS_NEW;
                    case 'Approval':
                        return OnboardingConstants.ONBOARD_STATUS_APPROVAL;
                    case 'Documentation':
                        return OnboardingConstants.ONBOARD_STATUS_DOCUMENTATION;
                    case 'Acceptance':
                        return OnboardingConstants.ONBOARD_STATUS_CANDIDATE_ACCEPTANCE;
                    case 'Confirmation':
                        return OnboardingConstants.ONBOARD_STATUS_CONFIRMATION;
                    case 'Probation':
                        return OnboardingConstants.ONBOARD_STATUS_PROBATION;
                    case 'Complete':
                        return OnboardingConstants.ONBOARD_STATUS_COMPLETE;
                    case 'Pending':
                        return OnboardingConstants.ONBOARD_STATUS_PENDING;
                    case 'Trial':
                        return OnboardingConstants.ONBOARD_STATUS_TRIAL;
                    case 'Declined':
                        return OnboardingConstants.ONBOARD_STATUS_DECLINED;
                    default:
                        return false;
                }
            };

            $scope.checkAll = function() {
                $scope.onboardingSelect = []; //Fix a bug in the logic where the selectAll will keep on adding to the array

                if ($scope.page.items.SelectedAll) {
                    angular.forEach($scope.onboards, function(item) {
                        if(item.permissions.deleteonboard) {
                            if($scope.isSingle){
                                $scope.onboardingSelect.push(item.OnboardingSummary.OnboardId);
                                item.selected = true;
                            }else {
                                $scope.onboardingSelect.push(item.BulkOnboardingSummary.BulkOnboardingId);
                                item.selected = true;
                            }
                        }
                    });
                } else {
                    angular.forEach($scope.onboards, function(item, idx) {
                        item.selected = false;
                    });
                }
            };

            $scope.selected = function(item) {
                if(item.selected) {
                    if(item.OnboardingSummary) {
                        $scope.onboardingSelect.push(item.OnboardingSummary.OnboardId);
                    } else if(item.BulkOnboardingSummary) {
                        $scope.onboardingSelect.push(item.BulkOnboardingSummary.BulkOnboardingId);
                    }
                } else {
                    if(item.OnboardingSummary) {
                        var indexOf = $scope.onboardingSelect.indexOf(item.OnboardingSummary.OnboardId);

                        if(indexOf > -1) {
                            $scope.onboardingSelect.splice(indexOf, 1);
                        }
                    } else if(item.BulkOnboardingSummary) {
                        var indexOf = $scope.onboardingSelect.indexOf(item.BulkOnboardingSummary.BulkOnboardingId);
                        if(indexOf > -1) {
                            $scope.onboardingSelect.splice(indexOf, 1);
                        }
                    }
                }
                $scope.page.items.SelectedAll = ($scope.onboardingSelect.length + $scope.onboards.countOnboardingsWithNoDeletePermission === $scope.onboards.length) ? true : false;
            };

            $scope.deleteOnboarding = function(onboardingSelect) {
                var text = $scope.isSingle ? 'single onboard' : 'bulk onboard';
                $scope.page.loading = true;

                onboardingSelect = _.flattenDeep(onboardingSelect); //Must flatten 'onboardingSelect' as Bulk is using the same parameters

                Onboarding.deleteListOnboard(onboardingSelect, $scope.isSingle).then(function() {
                    $notify.add({
                        message: `List ${text} have been deleted`,
                        type: 'success'
                    });
                    $route.reload();
                })
                .catch(function() {
                    $notify.add({
                        message: `List ${text} could not be deleted at this time. Please try again later`,
                        type: 'error'
                    });
                })
                .finally(function(){
                    $scope.page.loading = false;
                });
            };
            // direct to add employee page
            $scope.addEmployees = function() {
                $location.path(Paths.get('recruit.onboards.addEmployees').path);
            };
	    
			$scope.toggleStatusMenu = function() {
                $scope.showFilterStatus = !$scope.showFilterStatus;
            };

            // Open upload employee modal
            $scope.uploadEmployees = function() {
                var modal = $modal.open({
                    templateUrl: '/interface/views/recruit/onboarding/partials/modal-upload-employees.html',
                    templateType: 'modal',
                    locked: true,
                    controller : SHRP.ctrl.ModalUploadEmployees
                });
            };

            // open launch employee modal
            $scope.openLaunchModal = function() {
                var modal = $modal.open({
                    templateUrl: '/interface/views/recruit/onboarding/partials/modal-launch-employees.html',
                    templateType: 'modal',
                    title: 'Launch Employee',
                    locked: true,
                    loadedData: false,
                    controller : SHRP.ctrl.ModalLaunchEmployees,
                    scope: $scope,
                    resolve: {
                        data: function() {
                            return {};
                        }
                    }
                });
            };
            // check status is probation
            $scope.isProbation = (status,time) => {
                if(status === 'Complete' && time){
                    // compare date time if it is not out of date, the status is probation
                    let date = new Date();
                    let dateNow =  (date) ? $filter('utcTimestamp')(date) : null;
                    let dateProbation = (time) ? $filter('utcTimestamp')(time) : null;
                    if (moment(dateProbation).diff(dateNow, 'days') >= 0){
                        return true;
                    }
                }
                return false;
            };

        }
    });
