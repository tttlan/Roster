angular.module('ui.recruit.jobs')
    .controller('modalManuallyAddApplicantCtrl', ['$scope','$modalInstance', 'AddApplicantService', 'JobApplicantModel', '$routeParams', function($scope, $modalInstance, AddApplicantService, JobApplicantModel, $routeParams) {
        $scope.newApplicant = new JobApplicantModel();
        $scope.resumeIds = [];
        $scope.addApplicant = function(newApplicant) {
            if($scope.addApplicantForm.$dirty && $scope.addApplicantForm.$valid) {
                $scope.isLoading = true;
                newApplicant.setJobId = $routeParams.jobId;
                newApplicant.setResumeId = $scope.resumeIds[0];
                AddApplicantService.postApplicant(newApplicant).then((res) => {
                    $scope.cancel();
                })
                .finally (() => {
                    $scope.isLoading = false;
                });

            }
        };

        $scope.cancel = function() {
            $modalInstance.close();
        };
    }]);
