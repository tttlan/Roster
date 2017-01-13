angular.module('ui.common.modal')
  .directive('fullscreenFooter', () => {
    return {
      template: `
        <div class='fullscreen-footer {{classes}}' ng-transclude></div>
      `,
      transclude: true,
      replace: true,
      scope: {
        'classes': '@',
      },
      link: (scope, elem, attrs) => {
        const body = angular.element('body');
        angular.element(elem).addClass('modal-footer');
        body.addClass('no-scroll');
        scope.$on('$destroy', () => body.removeClass('no-scroll'));
      }
    };
  });