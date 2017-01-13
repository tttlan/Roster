angular.module('ui.survey')

.controller('manageQuestionnairesTemplateCtrl', ['$scope', 'SurveyService', '$notify', 'Questionnaire', '$modal', '$window', '$location',
function($scope, SurveyService, $notify, Questionnaire, $modal, $window, $location) {
        $scope.getQuestionnaireTemplateList = function(page, pageSize, orderBy) {
            return SurveyService.getQuestionnaireTemplateList({
                'global': false,
                'status': 1,
                'orderBy': 'CreatedDate',
                'page': page,
                'pageSize': pageSize,
                'recordCount': 1
            }).then(function(res) {
                if (res.canCreate === 2811) {
                    $scope.canCreateQuestionnaireTemplate = true;
                } else {
                    $scope.canCreateQuestionnaireTemplate = false;
                }
                return res;
            });
        };
        $scope.deleteQuestionnaireTemplate = function(questionnaireId, questionnaireName) {
            return SurveyService.deleteQuestionnaireTemplate(questionnaireId).then(function(res) {
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
        $scope.createQuestionnaireFromTemplate = function(questionnaireId, questionnaireName) {
            return SurveyService.createQuestionnaireFromTemplate(questionnaireId).then(function(res) {
                if (res.data.Errors && res.data.Errors.length > 0) {
                    $notify.add({
                        message: res.data.Errors[0].Message,
                        type: 'error'
                    });
                } else {
                    $notify.add({
                        message: 'Copy  ' + questionnaireName + ' successful',
                        type: 'success'
                    });
                    $scope.page.items.length = $scope.page.items.length - 1;
                }
                return res;
            });
        };
   
        $scope.previewQuestionnaire = function(id) {
            var browserWidth = $window.innerWidth;
            
            SurveyService.getQuestionnaireTemplateByQuestionnaireId(id).then(function(res) {
                //Get all question in each group
                $scope.questionnaireInfo = res.data.SurveyQuestionnaireTemplateInfo;
                Questionnaire.getById(id, 0).then(function(res) {
                    if (res.data.info.ungroupedQuestions.length) {
                        res.data.info.questionGroup.push({
                            tag: {
                                name: 'Ungroup'
                            },
                            questions: angular.copy(res.data.info.ungroupedQuestions)
                        });
                    }
                    res.data.info.questionGroup.forEach(function(group) {
                        group.questions.forEach(function(question, index) {
                            group.questions[index] = SurveyService.revertFormatQuestionForSubmit(question);
                        });
                    });
                    $scope.questionnaireInfo.questionGroup = res.data.info.questionGroup;
                    //$scope.loading = false;
                    $scope.questionnaireInfo.questions = [];
                    $scope.questionnaireInfo.questionGroup.forEach(function(group) {
                        if (group.questions.length > 0) {
                            $scope.questionnaireInfo.questions = $scope.questionnaireInfo.questions.concat(group.questions);
                        }
                    });
                    var browserWidth = $window.innerWidth;
                    if (browserWidth > 700) {
                        $modal.open({
                            templateUrl: '/interface/views/survey/partials/modal-preview.html',
                            controller: 'previewCtrl',
                            size: 'lg',
                            resolve: {
                                listQuestions: function() {
                                    return $scope.questionnaireInfo;
                                }
                            }
                        });
                    } else {
                        $scope.showMobilePreviewSidebar();
                    }
                }, function(error) {
                    $notify.add({
                        message: angular.isUndefined(error.data.Errors) ? error.data.Message : error.data.Errors[0].Message,
                        type: 'error'
                    });
                });

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
     