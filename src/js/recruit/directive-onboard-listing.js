angular.module('ui.recruit.onboard')

    .directive('onboardListing', function(Onboarding, $route, $location, Paths, $notify, Permissions, OnboardingConstants, $modal, Members, $timeout) {
        return {
            restrict: 'E',
            templateUrl: '/interface/views/recruit/onboard-listing.html',
            scope: {
                // list-type="single" = single onboard list
                // list-type="bulk" = bulk onboard list
                listType: '@'
            },
            controller: controller
        };

        function controller($scope) {
            $scope.data = {
                searchQuery: null,
                isShowingBulkOnboards: false
            };
            
            $scope.onboardingSettings = {};
            
            $scope.$watch('data.searchQuery', function(newVal, oldVal) {
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
         
            $scope.isSingleOnboardList = function() {
                return $scope.listType === 'single';
            };

            $scope.isBulkOnboardList = function() {
                return $scope.listType === 'bulk';
            };

            $scope.getOnboards = function() {
                if ($scope.isSingleOnboardList()) {
                    return Onboarding.getOnboards(
                        $scope.page.filter,
                        $scope.page.current,
                        $scope.page.size,
                        $scope.page.orderBy,
                        $scope.page.orderAsc
                    ).then(function(response) {
                        $scope.onboards = response.data.OnboardingSummaryItemResults;
                        return response;
                    });
                } else if ($scope.isBulkOnboardList()) {
                    return Onboarding.getBulkOnboards(
                        $scope.page.filter,
                        $scope.page.current,
                        $scope.page.size,
                        $scope.page.orderBy,
                        $scope.page.orderAsc
                    ).then(function(response) {
                        $scope.onboards = response.data.BulkOnboardingSummaryItemResult;
                        return response;
                    });
                }
            };

            $scope.isOnboardPhaseUndefined = function(onboard) {
                return Onboarding.isOnboardPhaseUndefined(onboard);
            };

            $scope.isOnboardPhaseNew = function(onboard) {
                return Onboarding.isOnboardPhaseNew(onboard);
            };

            $scope.isOnboardPhaseAwaitingApproval = function(onboard) {
                return Onboarding.isOnboardPhaseAwaitingApproval(onboard);
            };

            $scope.isOnboardPhaseDocumentation = function(onboard) {
                return Onboarding.isOnboardPhaseDocumentation(onboard);
            };

            $scope.isOnboardPhaseAwaitingCandidateAcceptance = function(onboard) {
                return Onboarding.isOnboardPhaseAwaitingCandidateAcceptance(onboard);
            };

            $scope.isOnboardPhaseAwaitingConfirmation = function(onboard) {
                return Onboarding.isOnboardPhaseAwaitingConfirmation(onboard);
            };

            $scope.isOnboardPhaseComplete = function(onboard) {
                return Onboarding.isOnboardPhaseComplete(onboard);
            };

            $scope.isOnboardPhaseDeclined = function(onboard) {
                return Onboarding.isOnboardPhaseDeclined(onboard);
            };

            $scope.getProgressBarPercentage = function(onboard) {
                if ($scope.isOnboardPhaseNew(onboard)) { return 0; }
                if ($scope.isOnboardPhaseAwaitingApproval(onboard)) { return 20; }
                if ($scope.isOnboardPhaseDocumentation(onboard)) { return 40; }
                if ($scope.isOnboardPhaseAwaitingCandidateAcceptance(onboard)) { return 60; }
                if ($scope.isOnboardPhaseAwaitingConfirmation(onboard)) { return 80; }
                if ($scope.isOnboardPhaseComplete(onboard)) { return 100; }
                if ($scope.isOnboardPhaseDeclined(onboard)) { return 100; }
            };

            $scope.createOnboard = function() {
                $location.path(Paths.get('recruit.onboards.create.single').path);
            };
            
            $scope.createBulkOnboard = function() {
                $location.path(Paths.get('recruit.onboards.create.bulk').path);
            };
            
            $scope.predicate = 'created';
            $scope.reverse = false;
            $scope.showFilterStatus = false;
            $scope.currentFilterCollection = 'All';

            $scope.order = function(predicate) {
                $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : $scope.reverse;
                $scope.predicate = predicate;
            };

            $scope.ActiveFilter = function(opt) {
                $scope.showFilterStatus = false;
                $scope.currentFilterCollection = opt;

                if ($scope.isSingleOnboardList()) {
                    $scope.page.items.OnboardingSummaryItemResults = $scope.page.items.OnboardingSummaryItemResults;
                } else if ($scope.isBulkOnboardList()) {
                    $scope.page.items.BulkOnboardingSummaryItemResult = $scope.page.items.BulkOnboardingSummaryItemResult;
                }
            };

            $scope.myFilter = function(item) {
                var statusCode;

                statusCode = ($scope.isSingleOnboardList()) ? item.OnboardingSummary.StatusCode : item.BulkOnboardingSummary.StatusCode;
                //probation = ($scope.isSingleOnboardList()) ? item.OnboardingSummary.ProbationEndDate : item.BulkOnboardingSummary.ProbationEndDate;

                switch ($scope.currentFilterCollection) {
                    case 'All':
                        return item;
                    case 'New':
                        return statusCode === OnboardingConstants.ONBOARD_STATUS_NEW;
                    case 'Approval':
                        return statusCode === OnboardingConstants.ONBOARD_STATUS_APPROVAL;
                    case 'Documentation':
                        return statusCode === OnboardingConstants.ONBOARD_STATUS_DOCUMENTATION;
                    case 'Acceptance':
                        return statusCode === OnboardingConstants.ONBOARD_STATUS_CANDIDATE_ACCEPTANCE;
                    case 'Confirmation':
                        return statusCode === OnboardingConstants.ONBOARD_STATUS_CONFIRMATION;
                    //case 'Probation':
                    //    return statusCode === 'Probation';
                    case 'Complete':
                        return statusCode === OnboardingConstants.ONBOARD_STATUS_COMPLETE;
                    case 'Pending':
                        return statusCode === OnboardingConstants.ONBOARD_STATUS_PENDING;
                    default:
                        return;
                }
            };

            $scope.onboardingSelect = [];
            $scope.checkAll = function() {
                $scope.onboardingSelect = []; //Fix a bug in the logic where the selectAll will keep on adding to the array

                if ($scope.page.items.SelectedAll) {
                    angular.forEach($scope.onboards, function(item) {
                        if(item.permissions.deleteonboard) {
                            $scope.onboardingSelect.push(item.OnboardingSummary.OnboardId);
                            item.selected = true;
                        } else if(item.permissions.candeletebulkonboard) {
                            $scope.onboardingSelect.push(item.BulkOnboardingSummary.OnboardIds); //TODO : Check this as there are multiple ids in the payload
                        }
                    });
                } else {
                    angular.forEach($scope.onboards, function(item, idx) {
                        item.selected = false;
                    });
                }
            };

            $scope.selected = function(index) {
                if($scope.onboards[index].selected) {
                    if($scope.onboards[index].OnboardingSummary) {
                        $scope.onboardingSelect.push($scope.onboards[index].OnboardingSummary.OnboardId);
                    } else if($scope.onboards[index].BulkOnboardingSummary) {
                        $scope.onboardingSelect.push($scope.onboards[index].BulkOnboardingSummary.OnboardIds); //TODO: Bulk is not completed
                    }
                } else {
                    var indexOf = $scope.onboardingSelect.indexOf($scope.onboards[index].OnboardingSummary.OnboardId);
                    if(indexOf > -1) {
                        $scope.onboardingSelect.splice(indexOf, 1);
                    }
                }
                $scope.page.items.SelectedAll = ($scope.onboardingSelect.length + $scope.onboards.countOnboardingsWithNoDeletePermission === $scope.onboards.length) ? true : false;
            };

            $scope.deleteOnboarding = function(onboardingSelect) {
                var text = ($scope.isSingleOnboardList()) ? 'single onboard' : 'bulk onboard';

                Onboarding.deleteListOnboard(onboardingSelect).then(function() {
                        $notify.add({
                            message: 'List ' + text +' have been deleted',
                            type: 'success'
                        });
                        $route.reload();
                    })
                .catch(function() {
                        $notify.add({
                            message: 'List '+ text +' could not be deleted at this time. Please try again later',
                            type: 'error'
                        });
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

        }
    })
    .run(function($templateCache) {
        $templateCache.put('ng-mfb-button-default.tpl.html',
            '<li>' +
            '  <a data-mfb-label="{{label}}" class="mfb-component__button--child" tooltip="{{label}}" tooltip-placement= "left">' +
            '    <i class="mfb-component__child-icon {{icon}}">' +
            '    </i>' +
            '  </a>' +
            '</li>'
        );
        $templateCache.put('ng-mfb-menu-default.tpl.html',
            '<ul class="mfb-component--{{position}} mfb-{{effect}}"' +
            '    data-mfb-toggle="{{togglingMethod}}" data-mfb-state="{{menuState}}">' +
            '  <li class="mfb-component__wrap">' +
            '    <a ng-click="clicked()" ng-mouseenter="hovered()" ng-mouseleave="hovered()"' +
            '       ng-attr-data-mfb-label="{{label}}" class="mfb-component__button--main" tooltip="{{label}}" tooltip-placement= "left">' +
            '     <i class="mfb-component__main-icon--resting {{resting}}"></i>' +
            '     <i class="mfb-component__main-icon--active {{active}}"></i>' +
            '    </a>' +
            '    <ul class="mfb-component__list" ng-transclude>' +
            '    </ul>' +
            '</li>' +
            '</ul>'
        );
    });
