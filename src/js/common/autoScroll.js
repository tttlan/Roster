// Autogrow Directive
// ----------------------------------------

angular.module('ui.common.directives')

/* Autoscrollbar
 * Create a autoscroll bar for element
 * <table autoscroll />
 */
 .directive('autoScroll', ['$timeout', '$window', 'onResize', function($timeout, $window, onResize) {
     return {
         scope: {
             size: '=?',
             sizeFactor: '=?',
             direction: '@?',
             autoFit: '=?'
         },
         transclude: true,
         template: '<div ng-scrollbars ng-scrollbars-update=renderScrollbar ng-scrollbars-config="config" ng-transclude></div>',
         restrict: 'E',
         link: function(scope, element, attrs, ngModel, $transcludeFn) {
             var childElement = element.find('[auto-scroll-holder]');
             scope.config = {
                 scrollButtons: {
                     enable: true
                 },
                 axis: 'x',
                 scrollbarPosition: 'outside',
                 theme: 'minimal-dark'
             };
             var size = scope.size || 1000;
             var sizeFactor = scope.sizeFactor || 1;
             var direction = scope.direction || 'x';
             var autoFit = scope.autoFit || false;

             scope.$watch('sizeFactor', function(val) {
                 updateScrollDefinition();
             });
             function updateScrollDefinition() {
                 var scrollSide = 'width';
                 if (direction === 'y') {
                     scrollSide = 'height';
                 }
                 childElement[scrollSide](scope.size * scope.sizeFactor);
                 childElement.parent()[scrollSide]('auto');
                 scope.renderScrollbar('update');
                 updateElementScrollSide();
             }
             function updateElementScrollSide() {
                 var scrollSide = 'width';
                 if (direction === 'y') {
                     scrollSide = 'height';
                 }
                 var parent = childElement.parent();
                 childElement[scrollSide](scope.size * scope.sizeFactor);
                 if (scope.autoFit && parent[scrollSide]() > scope.size * scope.sizeFactor) {
                    childElement[scrollSide]('100%');
                 }
                 
             }
             function updateScrollbar() {
                 scope.config.axis = direction;
                 scope.renderScrollbar();
                 updateElementScrollSide();
             }
             $timeout(function() {
                 updateElementScrollSide();
             });
             function resizeWatcher() {
                 updateElementScrollSide();
             }
             onResize.register(_.debounce(function() {
                 resizeWatcher();
             }, 100), true);

             scope.$on('$destroy', function() {
                 onResize.deregister(resizeWatcher);
             });

             scope.$watch(function() {
                 return scope.size !== size || scope.sizeFactor !== sizeFactor ||
                        scope.direction !== direction || scope.autoFit !== autoFit;
             }, function(newVal, oldVal) {
                 if (newVal) {
                     updateScrollbar();
                 }
             });
      }
    };

  }]);