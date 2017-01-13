function onboardingCompletionCtrl($scope, $rootScope, $location, $modal, $q, paths, members, onboarding, onboardingConstants, $route) {
  (function init() {
      $scope.details = {};
      $rootScope.progress = { length: '96%' };

      $scope.isLoading = true;
      var memberAcceptancePromise = onboarding.memberAcceptance();
      var memberPromise = members.me();

      $q.all([memberAcceptancePromise, memberPromise]).then(function(data) {
          $scope.details = data[0].OnboardingAcceptanceDetail || {};
          $scope.details.WelcomeMessage = 'we will be in touch shortly';
          
          var member = data[1].data;
          $scope.details.isSsoNewMember = !member.Active && member.HasFedSite && member.UseFedLogin;
          $scope.member = member;
          
          if ($scope.details.AcceptanceState && $scope.details.AcceptanceState !== onboardingConstants.ONBOARD_STATE_COMPLETE) {
                $location.path(paths.get(onboarding.getRouteFromAcceptanceStage($scope.details.AcceptanceState)).path);
          }else $scope.isLoading = false;
          
      }).catch(() => $scope.isLoading = false);

      $scope.onboarding_completion = function() {
          $scope.isLoading = true;
          onboarding.processCandidateAcceptance().then(function(data) {
              $scope.isLoading = false;
              window.location = paths.get('network.profile').path;
          });//if requirements met, member will be activeted
      };

  })();
}

angular.module('ui.recruit.candidateonboard')
  .controller('onboardingCompletionCtrl', [
  '$scope', '$rootScope', '$location', '$modal', '$q', 'Paths', 'Members', 'Onboarding', 'OnboardingConstants', '$route', 
  onboardingCompletionCtrl]);