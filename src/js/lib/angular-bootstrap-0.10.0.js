/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 0.10.0 - 2014-05-21
 * License: MIT
 */
angular.module("ui.bootstrap", [
  "ui.bootstrap.transition",
  "ui.bootstrap.collapse",
  "ui.bootstrap.accordion",
  "ui.bootstrap.bindHtml",
  "ui.bootstrap.position",
  "ui.bootstrap.datepicker",
  "ui.bootstrap.dropdownToggle",
  "ui.bootstrap.pagination",
  "ui.bootstrap.timepicker",
  "ui.bootstrap.tooltip",
  "ui.bootstrap.typeahead"
]);


angular.module('ui.bootstrap.bindHtml', [])

  .directive('bindHtmlUnsafe', function () {
    return function (scope, element, attr) {
      element.addClass('ng-binding').data('$binding', attr.bindHtmlUnsafe);
      scope.$watch(attr.bindHtmlUnsafe, function bindHtmlUnsafeWatchAction(value) {
        element.html(value || '');
      });
    };
});


/**
 * The following features are still outstanding: popup delay, animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, html popovers, and selector delegatation.
 */
/*angular.module( 'ui.bootstrap.popover', [ 'ui.bootstrap.tooltip' ] )

.directive( 'popoverPopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: 'template/popover/popover.html'
  };
})

.directive( 'popover', [ '$tooltip', function ( $tooltip ) {
  return $tooltip( 'popover', 'popover', 'click' );
}]);*/

