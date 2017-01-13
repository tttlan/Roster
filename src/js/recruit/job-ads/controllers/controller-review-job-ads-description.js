angular.module('ui.recruit.jobs')
.controller('previewJobAdsDescriptionCtrl', ['$scope', '$modalInstance','title', 'showSummaryOrBody', 'jobDetail',
         function($scope, $modalInstance, title, showSummaryOrBody, jobDetail) {
     $scope.jobDetail = jobDetail;
     $scope.title = title;
     showSummaryOrBody ? $scope.isShowJobSummary = true : $scope.isShowJobBody = true;
     $scope.cancel = () => { $modalInstance.dismiss('cancel'); };
}]);