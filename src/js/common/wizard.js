angular.module('ui.common')

    // Wizard directive for gathering user input in stages.
    // Modified/striped down from https://github.com/DaveWM/ngWizard

    .directive('wizard', ['$q', '$timeout', 'onResize', function($q, $timeout, onResize) {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                startStepNumber: '@',
                submit: '&',
                submitButtonText: '@',
                uiStyle: '@?'
            },
            templateUrl: (elm, attr) => {
                return (attr.templateUrl) ? attr.templateUrl : '/interface/views/common/partials/wizard.html';
            },
            controller:['$scope', function($scope) {
                $scope.currentStepNumber = $scope.startStepNumber ? parseInt($scope.startStepNumber) : 0;
                $scope.submitButtonText = $scope.submitButtonText || 'Submit';
                $scope.uiStyle = $scope.uiStyle || 1;

                $scope.fireResize = function() {
                    $timeout(function() {
                        onResize.triggerResize();
                    });
                };

                $scope.getCurrentStep = function() {
                    return $scope.steps[$scope.currentStepNumber];
                };

                $scope.getPreviousStep = function() {
                    return $scope.steps[$scope.currentStepNumber - 1];
                };
                // need to register the method on the controller as well, so it can be accessed by the wizard steps
                this.getCurrentStep = $scope.getCurrentStep;
                this.getPreviousStep = $scope.getPreviousStep;

                $scope.goToStepByReference = function(step) {
                    var stepNumber = $scope.steps.indexOf(step);
                    return $scope.goToStep(stepNumber);
                };

                // returns whether the step number is between 0 and the number of steps - 1
                var isValidStepNumber = function(stepNumber) {
                    return stepNumber < $scope.steps.length && stepNumber >= 0;
                };

                $scope.canGoToStep = function(stepNumber) {
                    if (!isValidStepNumber(stepNumber)) {
                        return false;
                    }
                    var newStep = $scope.steps[stepNumber];
                    return newStep.getState() !== $scope.stepStatesEnum.disabled;
                };
                $scope.goToStep = function(stepNumber) {
                    if ($scope.canGoToStep(stepNumber)) {
                        $scope.currentStepNumber = stepNumber;
                        $timeout($scope.fireResize());
                        return true;
                    }
                    return false;
                };

                this.stepStatesEnum = $scope.stepStatesEnum = {
                    disabled: 0,
                    ready: 1,
                    complete: 2
                };

                $scope.canGoToNext = function() {
                    return $scope.steps[$scope.currentStepNumber][$scope.steps[$scope.currentStepNumber].name].$valid;
                };

                $scope.goToNext = function() {
                    if ($scope.canGoToNext()) {
                        $scope.goToStep($scope.currentStepNumber + 1);
                    }
                };
                $scope.hasNext = function() {
                    return $scope.steps.length > $scope.currentStepNumber + 1 &&
                        $scope.steps[$scope.currentStepNumber + 1].getState() !== $scope.stepStatesEnum.disabled;
                };
                $scope.goToPrevious = function() {
                    $scope.goToStep($scope.currentStepNumber - 1);
                };
                $scope.hasPrevious = function() {
                    return $scope.currentStepNumber > 0;
                };

                $scope.getProgressPercentage = function() {
                    var completeSteps = $scope.steps.filter(function(step) {
                        return step.getState() === $scope.stepStatesEnum.complete;
                    });
                    return (completeSteps.length / $scope.steps.length) * 100;
                };

                $scope.steps = [];
                // assume steps are registered in order
                this.registerStep = function(stepScope) {
                    stepScope.stepNumber = $scope.steps.length;
                    $scope.steps.push(stepScope);
                };
                this.unregisterStep = function(stepScope) {
                    var index = $scope.steps.indexOf(stepScope);
                    if (index >= 0) {
                        $scope.steps.splice(index, 1);
                    }
                };

                $scope.isSubmittable = function() {
                    return $scope.steps.every(function(step) {
                            return step.getState() === $scope.stepStatesEnum.complete;
                        }) && $scope.currentStepNumber === $scope.steps.length -1;
                };
                $scope.submitting = false;
                $scope.onSubmitClicked = function() {
                    $scope.submitting = true;
                    $q.when($scope.submit()).then(function() {
                        $scope.submitting = false;
                    });
                };

                $scope.$watch('currentStepNumber', function(val, oldVal) {
                    // don't do anything if step hasn't changed
                    if (val !== oldVal) {
                        // try to go to new step number, if it doesn't work don't allow the change.
                        // if 'oldVal' (the previous step number) is not defined/is invalid, go to step 0 (always valid)
                        if (!$scope.canGoToStep(val)) {
                            if (oldVal && $scope.canGoToStep(oldVal)) {
                                $scope.currentStepNumber = oldVal;
                            } else {
                                $scope.currentStepNumber = 0;
                            }
                        }
                        // successfully navigated to step
                        else {
                            $scope.getCurrentStep().entered();
                        }
                    }
                });
                // watch the number of steps, in case we are on the last step and it is removed
                $scope.$watch('steps.length', function() {
                    if (!$scope.getCurrentStep()) {
                        $scope.currentStepNumber = 0;
                    }
                }, true);
            }]
        };
    }])

    .directive('wizardStep', function() {
        return {
            require: '^wizard',
            restrict: 'E',
            transclude: true,
            scope: {
                title: '@',
                name: '@',
                // the required step must be completed for this step to be enabled
                requiredStepNumber: '@',
                entered: '&'
            },
            template: '<ng-form name="{{name}}" ng-show="isActive()" class="wizard-step" ><ng-transclude></ng-transclude></ng-form>',
            link: function($scope, elements, attrs, wizardCtrl) {
                wizardCtrl.registerStep($scope);
                $scope.isActive = function() {
                    return $scope === wizardCtrl.getCurrentStep();
                };

                $scope.$on('$destroy', function() {
                    wizardCtrl.unregisterStep($scope);
                });


                $scope.getState = function() {
                    // step requires a previous step to be complete, and it is not
                    if ($scope.requiredStepNumber && wizardCtrl.isValidStepNumber($scope.requiredStepNumber) &&
                        $scope.steps[$scope.requiredStepNumber].getState() !== wizardCtrl.stepStatesEnum.complete) {
                        return wizardCtrl.stepStatesEnum.disabled;
                    }
                    // if form is valid, step is complete
                    else if ($scope[$scope.name].$valid) {
                        return wizardCtrl.stepStatesEnum.complete;
                    }
                    return wizardCtrl.stepStatesEnum.ready;
                };

                //Semantics here are for the steps css only.
                $scope.isActive = function() {
                    return wizardCtrl.getCurrentStep() === this;
                };
                $scope.isPrevious = function() {
                    return wizardCtrl.getPreviousStep() === this;
                };
                $scope.isComplete = function() {
                    return ($scope.getState() === wizardCtrl.stepStatesEnum.complete) && ($scope.stepNumber < wizardCtrl.getCurrentStep().stepNumber - 1);
                };
            }
        };
    });