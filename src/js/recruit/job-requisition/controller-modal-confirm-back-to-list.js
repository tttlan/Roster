angular.module('ui.recruit.job-requisition')

 .controller('modalConfirmBackToListCtrl', ['$scope', '$modalInstance', 'Data', function($scope, $modalInstance, Data) {
     $scope.title = Data.Message;
     $scope.confirm = false;

     $scope.ok = function() {
         $scope.confirm = true;
         $modalInstance.close($scope.confirm);
     };

     $scope.cancel = function() {
         $modalInstance.close($scope.confirm);
     };

 }]);