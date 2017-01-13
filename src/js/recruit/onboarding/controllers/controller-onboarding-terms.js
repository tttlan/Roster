function onboardingTermsCtrl($scope, $rootScope, $location, $sce, $q, networks, paths, onboarding, onboardingConstants) {
    (function init() {
        $scope.terms = {};
        $scope.onboarding = {};
        $scope.isLoading = true;

        var termsPromise = networks.getTermsAndConditions();
        var onboardingPromise = onboarding.memberAcceptance();
        $q.all([termsPromise, onboardingPromise]).then(function(data) {
            $scope.isLoading = false;
            
            $scope.terms.path = $sce.trustAsResourceUrl('http://' + data[0].Data);
            $scope.terms.isAccepted = false;
            $rootScope.progress = { length: '14%' };

            $scope.onboarding = data[1].OnboardingAcceptanceDetail;
            if ($scope.onboarding.AcceptanceState !== onboardingConstants.ONBOARD_STATE_MEMBERACCEPTTERMS) {
                $location.path(paths.get(onboarding.getRouteFromAcceptanceStage($scope.onboarding.AcceptanceState)).path);
            }
            else $scope.isLoading = false;
        }).catch(() => $scope.isLoading = false);

    })();

    $scope.onboarding_terms = function() {

        if ($scope.terms.isAccepted) {
            $scope.isLoading = true;
            onboarding.processCandidateAcceptance().then(function(data) {
                return onboarding.memberAcceptance().then(function (res) {
                    var AcceptanceState = res.OnboardingAcceptanceDetail.AcceptanceState;
                    var route = onboarding.getRouteFromAcceptanceStage(AcceptanceState);
                    $location.path(paths.get(route).path);
                });
            }).catch(() => $scope.isLoading = false);

        }
    };
}

angular.module('ui.recruit.candidateonboard')
    .controller('onboardingTermsCtrl',
      ['$scope', '$rootScope', '$location', '$sce', '$q', 'Networks', 'Paths', 'Onboarding', 'OnboardingConstants',
      onboardingTermsCtrl]); 