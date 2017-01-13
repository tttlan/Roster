angular.module('ui.common')

.directive('progressBarSteps', () => {
    return {
        restrict    : 'E',
        templateUrl : '/interface/views/common/partials/progress-bar-steps.html',
        scope       : {
            totalSteps       : '@',  //Define the number of process
            currentStep      : '@',  //Define which process it is actually at
            headerTitles     : '&?', //Define all the headerTitles to display
            headerPosition   : '@?', //Define whether the headers should be displayed on top or bottom of the progress bar
            progressBarStyle : '@?', //Define the progress bar css style. If not provided, a default one will be applied
        },
        link : (scope, element, attrs) => {
            //Safe guards
            scope.totalSteps = (!isNaN(scope.totalSteps) && (scope.totalSteps)) ? scope.totalSteps : 0;
            scope.currentStep = (!isNaN(scope.currentStep) && (scope.currentStep >= 0)) ? scope.currentStep : 0;

            scope.headerPosition = scope.headerPosition.toLowerCase();
            scope.headerPosition = ((scope.headerPosition === 'top') || (scope.headerPosition === 'bottom')) ? scope.headerPosition : 'top';

            if(scope.totalSteps && (scope.currentStep >= 0) && (scope.totalSteps >= scope.currentStep)) {
                scope.headerTitleInWidth = (100/scope.totalSteps);
                
                scope.currentStepInWidth = function () {
                    return {
                        width: scope.headerTitleInWidth * scope.currentStep + '%'
                    };
                }; 
            } else {
                throw new Error('Total Steps value must be greater than zero');
            }
        },
    };
});
