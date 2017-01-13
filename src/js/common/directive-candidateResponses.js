/* global loadQuestionaire */
angular.module('ui.common')

.directive('candidateResponses', ['Questionnaire', 'SurveyService', 'CandidateResponses', '$notify', function(Questionnaire, SurveyService, CandidateResponses, $notify) {
    
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=',
            questionnaireId: '@',
            domainType: '=',
            domainKey: '=',
            submittedResponses: '&submitted'
        },
        link: function(scope, element, attrs, ctrl) {
           scope.loadQuestionnaire = function() {
                scope.loading = true;
                Questionnaire.getById(scope.questionnaireId, scope.domainType, '').then(function(res) {
                if (res.data.Errors || !res.data.info.id) {
                        scope.error = true;
                        scope.loading = false;
                        return;
                    }    
                    res.data.info.questions.forEach(function(question, index) {
                        res.data.info.questions[index] = SurveyService.revertFormatQuestionForSubmit(question);
                    });
                    scope.ngModel = res.data.info;
                    scope.loading = false;
                    scope.ngModel.submitCandidateResponses = function() {
                        scope.submitted = true;
                        scope.loading = true;
                        if (scope.candidateResponses.$invalid) { return; }
                        scope.SurveyResponseEntries = {
                            'QuestionnaireResponse': {
                                'QuestionnaireId': scope.questionnaireId,
                                'DomainKey': scope.domainKey,
                                'DomainInfoUri': 'sample string 2',
                                'DomainType': scope.domainType
                            },
                            'CandidateResponses': [],
                        };
                        angular.forEach(scope.ngModel.questions, function(question) {

                            if (typeof question.ResponseChoicesValue !== 'undefined' && typeof question.ResponseChoicesValue.Value === 'object' && (question.ResponseChoices.length > 1)) {//Multi choices
                                for (var key in question.ResponseChoicesValue.Value) {
                                    // skip loop if the property is from prototype
                                    if (!question.ResponseChoicesValue.Value.hasOwnProperty(key)) { continue; }
                                    if (question.ResponseChoicesValue.Value[key] === true) {
                                        scope.SurveyResponseEntries.CandidateResponses.push({
                                            ResponseChoiceId: key,
                                            QuestionId: question.QuestionId,
                                            AnswerValue: typeof question.ResponseChoicesValue.Answer !== 'undefined' ? question.ResponseChoicesValue.Answer[key] : null,
                                            DocumentId: (typeof question.uploadedFiles !== 'undefined' && typeof question.uploadedFiles[key] !== 'undefined') ? question.uploadedFiles[key][0] : ''
                                        });
                                    }
                                }
                            } else {

                                var answerValue = '',
                                    responseChoiceId = null;
                                if ((typeof question.ResponseChoicesValue !== 'undefined' && typeof question.ResponseChoicesValue.Answer === 'object')) {
                                    answerValue = question.ResponseChoicesValue.Answer[question.ResponseChoicesValue.Value];
                                } else {
                                    answerValue = question.ResponseChoicesValue ? question.ResponseChoicesValue.Value : '';
                                }

                                if (question.ResponseChoices.length === 1) {
                                    responseChoiceId = question.ResponseChoices[0].ResponseChoiceId;
                                } else {
                                    responseChoiceId = question.ResponseChoicesValue ? question.ResponseChoicesValue.Value : null;
                                }

                                //Todo: API: Anservalue is required need to discuss
                                if (responseChoiceId) {
                                    scope.SurveyResponseEntries.CandidateResponses.push({
                                        ResponseChoiceId: responseChoiceId,
                                        QuestionId: question.QuestionId,
                                        AnswerValue: answerValue,
                                        DocumentId: typeof question.uploadedFiles !== 'undefined' ? question.uploadedFiles[0] || question.uploadedFiles[question.ResponseChoicesValue.Value][0] : null
                                    });
                                }
                            }

                        });

                        // Test
                        // scope.submittedResponses({ id: 3 });
                        // return;

                        return CandidateResponses.CreateSurveyResponses(scope.SurveyResponseEntries).then(function(res) {
                            if (res.data.Errors && res.data.Errors.length > 0) {
                                $notify.add({
                                    message: res.data.Errors[0].Message,
                                    type: 'error'
                                });
                            } else {
                                scope.submittedResponses({ id: 3 });
                                
                            }
                            scope.loading = false;
                        }, function(e) {
                            scope.loading = false;
                        });
                    };
                },function(e) {
                    scope.error = true;
                    scope.loading = false;
                });
             };
            
           scope.loadQuestionnaire();

        },
        templateUrl: '/interface/views/common/partials/candidate-responses.html'
    };
}]);
