angular.module('ui.survey')
// build new root accordion but ony used in the survey module
// to use this accodion, must create a dependency to the survey module
.directive('accordionSurvey', ['accordionFactory', function(accordionFactory) {
    var accordionSurvey = angular.copy(accordionFactory);
    accordionSurvey.templateUrl = '/interface/views/survey/partials/accordion.html';
    return accordionSurvey;
}])
.directive('accordionGroupSurvey', ['accordionGroupFactory', function(accordionGroupFactory) {
    var accordionGroupSurvey = angular.copy(accordionGroupFactory);
    accordionGroupSurvey.templateUrl = '/interface/views/survey/partials/accordion-group.html';
    return accordionGroupSurvey;
}])

.constant('pagerBreadcrumbConfig', {
    itemsPerPage: 5,
    align: true
})
.directive('pagerBreadcrumb', ['pagerBreadcrumbConfig', function(config) {
    return {
        restrict: 'EA',
        scope: {
            page: '=',
            totalItems: '=',
            itemsPerPage: '=',
            onSelectPage: ' &'
        },
        replace: true,
        controller: 'PaginationController',
        templateUrl: '/interface/views/survey/partials/pager-breadcrumb.html',
        link: function(scope, element, attrs, paginationCtrl) {

            paginationCtrl.init(attrs.itemsPerPage || config.itemsPerPage);

            function makePage(number, isDisabled, isPrevious, isNext) {
                return {
                    number: number,
                    disabled: isDisabled,
                    previous: isPrevious,
                    next: isNext
                };
            }
            paginationCtrl.getPages = function(currentPage) {
                return [
                  makePage(currentPage - 1, paginationCtrl.noPrevious(), true, false),
                  makePage(currentPage + 1, paginationCtrl.noNext(), false, true)
                ];
            };
        }
    };
}])
.directive('question', [function() {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            model: '='
        },
        templateUrl: '/interface/views/survey/partials/question.html',
        controller: function($scope) {
        }

    };
}])

.directive('popoverqPopup', function() {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            title: '@',
            content: '@',
            placement: '@',
            animation: '&',
            isOpen: '&',
            model: '='
        },
        templateUrl: '/interface/views/survey/partials/popover-question.html',
        controller: function($scope) {
        }
    };
})

.directive('popoverq', ['$tooltip', function($tooltip) {
    return $tooltip('popoverq', 'popoverq', 'click');
}]);
