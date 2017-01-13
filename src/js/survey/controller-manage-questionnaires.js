angular.module('ui.survey')
    .controller('manageQuestionnairesCtrl', [
            '$scope', 'SurveyService', '$notify', 'Questionnaire', '$modal', '$window',
            function($scope, SurveyService, $notify, Questionnaire, $modal, $window) {

                /*
                * This function used to get questionnaire list
                */
                $scope.getQuestionnaireList = function(page, pageSize, orderBy) {
                    return SurveyService.getQuestionnaireList({
                        'status': 1,
                        't': 1,
                        'orderBy': 'CreatedDate DESC',
                        'page': page,
                        'pageSize': pageSize,
                        'recordCount': 1
                    }).then(function(res) {

                        if (res.canCreateQuestionnaire === 2803) {
                            $scope.canCreateQuestionnaire = true;
                        } else {
                            $scope.canCreateQuestionnaire = false;
                        }
                        return res;
                    });
                };

                /*
               * This function used to delete a questionnaire
               */
                $scope.deleteQuestionnaire = function(questionnaireId, questionnaireName, index) {
                    return SurveyService.deleteQuestionnaire(questionnaireId).then(function(res) {
                        if (res.data.Errors && res.data.Errors.length > 0) {
                            $notify.add({
                                message: res.data.Errors[0].Message,
                                type: 'error'
                            });
                        } else {
                            $notify.add({
                                message: 'Delete ' + questionnaireName + ' successful',
                                type: 'success'
                            });
                            $scope.page.update();
                        }
                        return res;
                    });
                };

                /*
                * This function used to show modal preview questionnaire
                */
                $scope.previewQuestionnaire = function(id) {
                    var browserWidth = $window.innerWidth;

                    Questionnaire.getById(id, 1).then(function(res) {
                        res.data.info.questions.forEach(function(question, index) {
                            res.data.info.questions[index] = SurveyService.revertFormatQuestionForSubmit(question);
                        });
                        $scope.previewQuestionnaireModel = res.data.info;
                        $scope.questionnaireInfo = $scope.previewQuestionnaireModel;
                    }, function(error) {
                    }).finally(function() {
                        if (browserWidth > 700) {
                            $scope.showPreviewModal();
                        } else {
                            $scope.showMobilePreviewSidebar();
                        }
                    });

                };

                /*
                *  This function used to show modal
                */
                $scope.showPreviewModal = function() {
                    $modal.open({
                        templateUrl: '/interface/views/survey/partials/modal-preview.html',
                        controller: 'previewCtrl',
                        size: 'lg',
                        resolve: {
                            listQuestions: function() {
                                return $scope.previewQuestionnaireModel;
                            }
                        }
                    });
                };

                /*
                *  This function used to preview questionnaire in mobile
                */
                $scope.showMobilePreviewSidebar = function() {
                    $modal.open({
                        templateType: 'drawer',
                        classes: 'survey lt-tablet-show',
                        backdropClass: 'lt-tablet-show',
                        templateUrl: '/interface/views/survey/survey-questionnaire-mobile-preview.html',
                        title: 'Preview',
                        scope: $scope
                    });
                };
            }
]);
 

  