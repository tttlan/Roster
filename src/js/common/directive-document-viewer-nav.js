angular.module('ui.common.modal')
  .directive('documentViewerNav', ['DocumentList', (DocumentList) => {
    return {
      template:`
        <div class="document-navigation" ng-show="documentList.list.length > 1">
          <a href="" class="prev" ng-click="prev()">
            <i class="icon--arrow-left"></i>
          </a>
          <span class="total-pages">
            {{documentList.progressText}}
          </span>
          <a href="" class="prev" ng-click="next()">
            <i class="icon--arrow-right"></i>
          </a>
        </div>`,
      scope: {
        documentList: '=',
      },
      link: (scope, element) => {
        if (scope.documentList instanceof DocumentList === false)
          throw new Error("Please use an instance of DocumentList for this directive");

        scope.next = () => scope.documentList.pointer += 1;
        scope.prev = () => scope.documentList.pointer -= 1;

        const hotkey = (event) => {
          if (event.keyCode === 37) scope.$apply(() => scope.prev());
          else if (event.keyCode === 39) scope.$apply(() => scope.next());
        };

        const doc = angular.element(document);
        doc.on('keydown', hotkey);
        scope.$on('$destroy', () => doc.off('keydown', hotkey));
      }
    };
  }]);