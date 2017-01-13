angular.module('ui.survey')
    
.controller('importQuestionnairesCtrl', ['$scope', '$modalInstance', 'group', function($scope, $modalInstance, group) {
    $scope.group = group;

    $scope.ok = function(isValid, group) {
        if (isValid) {
            $modalInstance.close(group);
        }
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}]);







