angular.module('ui.recruit.jobs')
    .directive('jobAdsAssessors', ['JobAdsService', function(JobAdsService) {
        return {
            restrict: 'E',
            scope: {
                selectedAssessor: '=?',
                name: '@?',
                ngRequired: '=?',
                ngDisabled: '=?',
                editable: '=?editable'
            },
            templateUrl: '/interface/views/recruit/job-ads/partials/create-job-ads-assessors.html',
            link: function(scope) {
                scope.items = []; //Contains all the list of assessors obtain from the API

                scope.selectedAssessor = _.isArray(scope.selectedAssessor) ? scope.selectedAssessor : []; //Contains ONLY assessors that user wants

                scope.getItems = (searchQuery) => {
                    return JobAdsService.getAssessor(searchQuery).then(function(response) {
                        scope.items = response.data;
                        return response.data;// need it on typeahead getItem($viewValue).
                    });
                };

                scope.$watch('textInput', (newVal) => {
                    let obj = scope.items.filter((item)=> {
                        if (item.name === newVal) {
                            let exist = _.any(scope.selectedAssessor, item);
                            if (!exist) {
                                scope.selectedAssessor.push(item);
                            }
                                scope.textInput = '';
                            }
                    })[0];
                });

                scope.remove = (idx) => {
                    if (scope.editable) {
                        scope.selectedAssessor.splice(idx, 1);
                    }
                };
            }
        };
    }]);
