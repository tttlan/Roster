angular.module('ui.survey')

.controller('previewCtrl', [
        '$scope', 'listQuestions', '$modalInstance', function($scope, listQuestions, $modalInstance) {
            var tmp = angular.copy(listQuestions);
            $scope.questionnaireInfo = tmp;
            $scope.models = {};
            $scope.models.selectedList = tmp.questions;
            $scope.ID_CTRL = $scope.$id;
            $scope.ChangeValue = function(item, value) {
                var index = $scope.models.selectedList.indexOf(item);
                if (item.DisplayOptionalOnYesNo === value) {
                    $('#sub' + $scope.ID_CTRL + index).show();
                } else if (item.DisplayOptionalOnYesNo === 'all') {
                    $('#sub' + $scope.ID_CTRL + index).show();
                } else {
                    $('#sub' + $scope.ID_CTRL + index).hide();
                }
            };
            $scope.close = function() {
                $modalInstance.dismiss('cancel');
            };

        }
]);





