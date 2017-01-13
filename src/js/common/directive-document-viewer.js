angular.module('ui.common.modal')
  .directive('documentViewer', ['$compile', '$rootScope', 'DocumentList', ($compile, $rootScope, DocumentList) => {
    return {
      restrict: 'E',
      scope: {
        documentList: '=',
      },
      link: (scope, element, iAttrs) => {
        if (scope.documentList instanceof DocumentList === false)
          throw new Error("Please use an instance of DocumentList for this directive");

        let canvas = null;

        const render = () => {
          if (canvas) canvas.remove();
          if (scope.documentList === null || scope.documentList.size === 0) return;

          const html = scope.documentList.currentDocument.isPDF ?
            `<pdf-canvas src="${scope.documentList.currentDocumentUrl}" src-filename=""></pdf-canvas>` :
            `<iframe class="pdf__frame" src="${scope.documentList.currentDocumentUrl}"></iframe>`;

          canvas = $compile(html)(scope);
          element.append(canvas);
          return true;
        };

        scope.$watch('documentList', (newVal, oldVal) => newVal !== oldVal && render(), true);
        render();
      }
    };
  }]);