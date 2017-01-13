angular.module('ui.common.modal')
  .directive('fullscreenContent', ($window, Paths, $location) => {
    return {
      template: `
        <div class='fullscreen-container'>
          <div class='fullscreen-content-container {{::classes}}'>
            <span ng-show="showCloseButton" class="close-fullscreen icon--cross" ng-click="closeFullscreen()"></span>
            <div class='fullscreen-content' ng-transclude></div>
          </div>
        </div>`,
      transclude: true,
      replace: true,
      scope: {
        'showCloseButton': '=?',
        'classes': '@',
      },
      link: (scope, element, attrs) => {
        angular.element(element).addClass('open');
        scope.closeFullscreen = () => $window.history.back();
      }
    };
  });