angular.module('ui.survey')

.controller('questionnaireTmplCtrl', ['$scope', 'SurveyService', '$modalInstance', 'data', function($scope, SurveyService, $modalInstance, data) {    
    $scope.questionnaireTemplateInfo = {
        Name: data.name,
        Instructions: data.instructions,
        Description: data.description
    };
    $scope.createQuestionnaireTmplManual = function(isValid) {
        if (isValid) {
            return SurveyService.createQuestionnaireTmplManual($scope.questionnaireTemplateInfo).then(function(res) {                
                $modalInstance.close(res.data.Data);
            }, function(e) {
                console.log(e);
            });
        }
    };

    $scope.close = function() {
        $modalInstance.dismiss('cancel');
    };

}]);