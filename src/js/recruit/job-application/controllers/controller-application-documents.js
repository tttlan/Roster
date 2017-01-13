(() => {

let applicationDocumentsCtrl = ($scope, $routeParams, DocumentList, DocumentViewerSingleton) => {
  if (DocumentViewerSingleton.data instanceof DocumentList) {
    $scope.documentList = DocumentViewerSingleton.data;
  }
  // TODO some proper error handling and show a message somewhere
  else throw new Error('Could not retrieve DocumentList instance');
};

angular.module('ui.recruit.jobs').controller('applicationDocumentsCtrl', [
  '$scope',
  '$routeParams',
  'DocumentList',
  'DocumentViewerSingleton',
applicationDocumentsCtrl]);
})();