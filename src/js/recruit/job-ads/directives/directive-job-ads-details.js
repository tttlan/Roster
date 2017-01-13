angular.module('ui.recruit.jobs')

.directive('jobAdsDetails', [ '$modal', 'SalaryType', 'JobLocation', 'JobAdsService', function($modal, SalaryType, JobLocation, JobAdsService) {
    return {
        restrict   : 'E',
        require:"^form",
        scope      : {
            jobAdDetailsFormModel: '=',
            form: '='
        },
        templateUrl : '/interface/views/recruit/job-ads/partials/create-job-ads-details.html',
        controller: ['$scope', function($scope) {
             $scope.salaryType = SalaryType;
             $scope.jobLocation = JobLocation;
             $scope.loading = true;
             $scope.fromValue = 0;
             JobAdsService.searchJobTags().then(function(res) {
                 $scope.jobTags = res.data;                
             }).finally(() => {
                $scope.loading = false;
             });
             
             $scope.previewText = (title) => {
                 let showSummaryOrBody;
                 showSummaryOrBody = (title === 'Job Summary') ? true : false; 
                 $modal.open({
                    templateUrl  : '/interface/views/recruit/job-ads/partials/modal-preview-job-ads-description.html',
                    controller   : 'previewJobAdsDescriptionCtrl',
                    scope        : $scope,
                    resolve: {
                            title: function() {
                                return title;
                            },
                            showSummaryOrBody: function() {
                                return showSummaryOrBody;
                            },
                            jobDetail: function(){
                                return $scope.jobAdDetailsFormModel;
                            }
                        }
                    });
            };

            $scope.$watch('jobAdDetailsFormModel.salaryMin', function(val){
                if(val){
                    $scope.fromValue = val.RecOrder;
                }
            })
        }]
    };
}]);