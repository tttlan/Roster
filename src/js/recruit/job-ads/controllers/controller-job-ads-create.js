angular.module('ui.recruit.jobs')
    .controller('jobAdsCreateCtrl', ['$scope', 'JobAdsBoardsModel', 'JobAdsDetailsModel', 'JobAdsAssessorModel', 'CustomQuestions', '$modalInstance', 'JobAdsQuestionnaireModel', 'JobAdsService', '$window', 'Paths',
        function ($scope, JobAdsBoardsModel, JobAdsDetailsModel, JobAdsAssessorModel, CustomQuestions, $modalInstance, JobAdsQuestionnaireModel, JobAdsService, $window, Paths) {

            if ($scope.jobDetail) {
                $scope.jobAdDetailsFormModel = $scope.jobDetail;
            }
            else {
                $scope.jobAdDetailsFormModel = new JobAdsDetailsModel();
            }

            //We must declare to get data type array in decorator
            $scope.jobAdsAssessorModels = [];
            $scope.cancel = (isRedirect) => {
                if ($scope.editedJobId) {
                    $window.location = Paths.get('recruit.jobs.index').path;
                } else {
                    //isRedirect just effect on job requisition details page when we execute it
                    $modalInstance.close({
                        isRedirect : isRedirect, 
                        jobDetail  : $scope.jobAdDetailsFormModel
                    });
                }
            };

        }]);

