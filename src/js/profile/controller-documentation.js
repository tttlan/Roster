angular.module('ui.profile')

.controller('profileDocumentation', ['$scope', 'ProfileDocumentationFactory', '$modal', function($scope, ProfileDocumentationFactory, $modal) {

    $scope.documentation = new ProfileDocumentationFactory();

    $scope.documentation.loadOnboardingDocuments();

    $scope.documentation.loadPaperDocuments();
}]);