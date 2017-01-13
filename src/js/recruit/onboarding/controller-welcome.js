function onboardingWelcomeCtrl($scope, $rootScope, members, $location, $q, paths, onboarding, onboardingConstants, Networks) {
    $rootScope.progress = {length: '0%'};
    $scope.isOnboarding = true;
    $scope.clientLogo = SHRP.data.clientLogo;
    $scope.currentUser = {};
    $scope.currentUser.network = {Name: 'Sherpa Systems'};
    $scope.onboarding = {};
    $scope.isLoading = true;

    $q
    .all([onboarding.memberAcceptance(), Networks.getCompanyDescription(), members.me(), onboarding.getOnboardingSettings()])
    .then((data) => {
      $scope.onboardingSettings = data[3];
      $scope.onboarding = data[0].OnboardingAcceptanceDetail;
      $scope.onboarding.NetworkName = data[1].NetworkName;
      $scope.onboarding.companyDescription = data[1].CompanyDescription || data[1].NetworkName;
      angular.extend($scope.currentUser, data[2].data);
      $scope.currentUser.fullname = $scope.currentUser.FirstName + ' ' + $scope.currentUser.Surname;

      if ($scope.onboarding.AcceptanceState !== onboardingConstants.ONBOARD_STATE_MEMBERWELCOME) {
        $location.path(paths.get(onboarding.getRouteFromAcceptanceStage($scope.onboarding.AcceptanceState)).path);
      }
      else $scope.isLoading = false;
    });

    $scope.onboarding_welcome = function() {
      $scope.isLoading = true;
      onboarding.processCandidateAcceptance()
      .then(function(data) {
        $location.path(paths.get('recruit.onboarding.terms').path);
      })
      .catch(() => $scope.isLoading = false);
    };
}

angular.module('ui.recruit.candidateonboard')
.controller('onboardingWelcomeCtrl', [
    '$scope', '$rootScope', 'Members', '$location', '$q', 'Paths', 
    'Onboarding', 'OnboardingConstants', 'Networks',
    onboardingWelcomeCtrl]);