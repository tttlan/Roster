angular.module('ui.recruit.jobs')

.directive('jobAdsQuestionnaire', ['CustomQuestions', '$notify', function(CustomQuestions, $notify) {
    return {
        restrict   : 'E',
        require:"^form",
        scope      : {
            jobAdQuestionnaireModel: '=',
            form: '='
        },
        templateUrl : '/interface/views/recruit/job-ads/partials/create-job-ads-questionnaire.html',
        controller: ['$scope', function($scope) {
            $scope.searchQuestionnaires = (searchString,isPhoneQuestions) => {
                let typeMember = 1;// 1: JobApplication
                if (searchString.length > 0) {
                    $scope.isLoading = true;
                    CustomQuestions.searchQuestionnaireTemplate(searchString,typeMember,isPhoneQuestions ).then(function(res) {
                        if(isPhoneQuestions) {
                            $scope.phoneQuestions = res.data.items;
                        }else{
                            $scope.jobQuestions = res.data.items;
                        }
                    }).finally(() => {
                        $scope.isLoading = false;
                    });
                }
            };
            
            $scope.addCustomQuestion = (customQuestion, isPhoneQuestions) => {
                if(!checkQuestionExist(customQuestion, isPhoneQuestions)) {
                    CustomQuestions.getQuestionnaireTemplateById(customQuestion,isPhoneQuestions ).then((response) => {
                        customQuestion.questions = response.data.items;
                        isPhoneQuestions ?
                            $scope.jobAdQuestionnaireModel.selectedPhoneQuestions.push(customQuestion) :
                            $scope.jobAdQuestionnaireModel.selectedCustomQuestions.push(customQuestion);
                    }).finally(() => {
                    });
                } else {
                    $notify.add({
                        message: 'Questionnaire is exist',
                        type: 'error'
                    });
                }

            };

            let checkQuestionExist = (customQuestion, isPhoneQuestions) => {
                return isPhoneQuestions ? checkItemInArray(customQuestion, $scope.jobAdQuestionnaireModel.selectedPhoneQuestions) : checkItemInArray(customQuestion, $scope.jobAdQuestionnaireModel.selectedCustomQuestions);

            };

            let checkItemInArray = (item, arr) => {
                var foundObject = _.findWhere(arr, {id: item.id});
                return foundObject;
            }
        }]
    };
}]);