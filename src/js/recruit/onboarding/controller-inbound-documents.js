angular.module('ui.recruit.candidateonboard')
  .controller('onboardingInboundDocumentsCtrl', [
    '$scope', '$rootScope', '$location', 'Paths', 'Onboarding', 'Networks', 'OnboardingConstants', 'UploadConstants', '$q', function($scope, $rootScope, $location, paths, onboarding, networks, onboardingConstants, uploadConstants, $q) {

      function advanceToNextStage() {
        $scope.isLoading = true;
        return onboarding.updateInboundRequirements($scope.onboarding.inboundDocuments).then(function(data) {
            return onboarding.memberAcceptance().then(function (data) {
                var AcceptanceState = data.OnboardingAcceptanceDetail.AcceptanceState;
                var route = onboarding.getRouteFromAcceptanceStage(AcceptanceState);
                $location.path(paths.get(route).path);
            });
        }).catch(() => $scope.isLoading = false);
      }

      //Init
      $scope.onboarding = {};
      $scope.isLoading = true;
      $rootScope.progress = { length: '42%' };

      onboarding.memberAcceptance().then(function(data) {
        $scope.onboarding = data.OnboardingAcceptanceDetail;

        if ($scope.onboarding.AcceptanceState !== onboardingConstants.ONBOARD_STATE_INBOUNDDOCUMENTATION) {
          $location.path(paths.get(onboarding.getRouteFromAcceptanceStage($scope.onboarding.AcceptanceState)).path);
        }

        $scope.onboarding.inboundDocuments = [];
        if ($scope.onboarding.InboundRequirements && $scope.onboarding.InboundRequirements.OnboardDocumentItemResults) {

          //Get doctypes
          networks.getPaperDocTypes().then(function(docTypes) {
            $scope.onboarding.inboundDocuments = $scope.onboarding.InboundRequirements.OnboardDocumentItemResults.map(function(result) {
              docTypes.forEach(function(docType) {
                if (docType.PaperDocTypeSummary.PaperDocTypeId === result.InboundRequirement.RequirementDocumentTypeId) {
                  result.InboundRequirement.PaperDocType = docType.PaperDocTypeSummary;
                }
              });
              result.containerId = uploadConstants.containerIds.onboarding;
              result.libraries = [];
              return result;
            });
          }).finally(function() {
            $scope.isLoading = false;
          });
        }
      });

      $scope.save = function() {

        if ($scope.inboundDocumentsForm.$invalid) {
          return; //should never happen
        }

        $scope.isLoading = true;

        $q.all($scope.onboarding.inboundDocuments.map(function(document) {
          if (document.LibraryDocumentId !== document.libraries[0]) {
            document.LibraryDocumentId = document.libraries[0];
            return onboarding.createInboundDocument(document).then(function() {
                 document.InboundRequirement.IsLodged = true;
            });
          }
        })).then(function() {
          advanceToNextStage();
        }).finally(() => $scope.isLoading = false);
      };
    }
  ]);