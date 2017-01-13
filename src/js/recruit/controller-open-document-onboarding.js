angular.module('ui.recruit.onboard')

.controller('openDocumentOnboardingCtrl', [
    '$scope', '$sce', '$modalInstance', '$location', 'Onboarding', 'data',
    function($scope, $sce, $modalInstance, $location, onboarding, data) {
        $scope.isLoading = true;
        $scope.data = data || {};
        
        $scope.cancel = function() {
            $modalInstance.dismiss('');
        };

        $scope.close = function() {
            $modalInstance.close();
        };
        
        $scope.FieldType = $scope.data.FieldType;
        
        if($scope.FieldType === 'doc'){
            onboarding.DownloadAcceptanceDocumentAsHtml($scope.data.ActionUrl).then(function(html) {
                $scope.trustedHtml = $sce.trustAsHtml(html.data);
                $scope.isLoading = false;
            });
        }else{
            $scope.trustedHtml = $scope.data.ActionUrl;
            $scope.isLoading = false;
        }
    }
]);
