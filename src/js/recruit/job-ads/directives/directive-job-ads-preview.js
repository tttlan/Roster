angular.module('ui.recruit')
    .directive('jobAdsPreview', ['$q', function($q) {

        return {
            restrict: 'E',
            scope: {
                jobDetail: '=',
                question: '=',
                boards: '=',
                assessors: '='
            },
            templateUrl: '/interface/views/recruit/job-ads/partials/create-job-ads-preview.html',
            link: function($scope) {
                $scope.$watch('boards.networkId', function(val){
                    if(val){
                        $scope.internalLogoUrl = '/client/'+ val +'/common/profile/consolelogo.gif';
                    }
                })
            }
        };
    }]);