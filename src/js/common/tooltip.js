

// Tooltips
// ------------------------------------------------

angular.module('ui.common')

// replace template

.run(function($templateCache) {

  $templateCache.put('template/tooltip/tooltip-popup.html', 
        '<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">' +
            '<div class="tooltip__arrow"></div>' +
            '<div class="tooltip__inner" ng-bind="content"></div>' +
        '</div>');
});