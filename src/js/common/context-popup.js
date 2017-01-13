angular.module('ui.common.contextPopup', ['ui.bootstrap.tooltip'])
.directive('contextPopupPopup', ['$HTTPCache', '$q', '$compile', function($HTTPCache, $q, $compile) {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            title: '@',
            content: '@',
            placement: '@',
            animation: '&',
            isOpen: '&',
            model: '=',
            template: '@'
        },
        templateUrl: '/interface/views/common/partials/context-popup.html',
        compile: function(element, attrs) {
            return function(scope, element, attrs) {
                var templateUrl = attrs.template, promiseList; 
                let hasCustomTemplate = !!attrs.template;
                promiseList = [];
                promiseList.push($HTTPCache.getTemplate(templateUrl));

                $q.all(promiseList).then(function(res) {
                    var template = res[0];
                    if (hasCustomTemplate) {
                        element.html($compile(template)(scope));
                    }
                });
            };
        }
    };
}])

.directive('contextPopup', ['$tooltip', function($tooltip) {
    return $tooltip('contextPopup', 'contextPopup', 'click');
}])
.config(function($tooltipProvider) {
    $tooltipProvider.setTriggers({ 'click': 'blur' });
    $tooltipProvider.options({ placement: 'bottom-left', 'appendToBody': true });
});
