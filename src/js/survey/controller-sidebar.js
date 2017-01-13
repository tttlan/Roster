angular.module('ui.survey')

.controller('surveySidebarCtrl', ['$scope', '$modal', 'QuestionType', 'Question', 'Questionnaire', 'SurveyService','QuestionnaireTemplate',
    function($scope, $modal, QuestionType, Question, Questionnaire, SurveyService, QuestionnaireTemplate) {

        var defaults = {
            itemsPerPage: 6,
            totalItems: 0,
            searchTerm: ''
        };

        //question type
        $scope.questionType = {
            items: [],
            loading: false,
            error: false
        };

        $scope.loadQuestionType = function() {
            $scope.questionType.loading = true;
            QuestionType.all().then(function(response) {
                $scope.questionType.loading = $scope.questionType.error = false;
                $scope.questionType.items = response.data.items;
            }, function(e) {
                console.log(e);
                $scope.questionType.error = true;
                $scope.questionType.loading = false;
            });
        };

        $scope.loadQuestionType();

        var requestCount = 0;

        // search questions
        $scope.questionPage = {
            searchTerm: defaults.searchTerm,
            totalItems: defaults.totalItems,
            itemsPerPage: defaults.itemsPerPage,
            current: 1,
            error: false,
            loading: false,
            hasData: false,
            items: []
        };

        function fetchQuestions(page) {
            requestCount++;
            $scope.questionPage.loading = true;
            Question.getQuestions(page, $scope.questionPage.itemsPerPage, $scope.questionPage.searchTerm).then(function(response) {
                $scope.questionPage.loading = $scope.questionPage.error = false;
                var pagination = response.headers('x-pagination');

                if (pagination) {
                    pagination = angular.fromJson(pagination);
                    $scope.questionPage.totalItems = pagination.TotalCount;
                    $scope.questionPage.totalPages = pagination.TotalPages;
                }
                $scope.questionPage.items = response.data.items;                
                $scope.questionPage.hasData = $scope.questionPage.items.length > 0;
            }, function(error) {
                $scope.questionPage.error = true;
            });
        }

        $scope.$watch('questionPage.searchTerm', function() { fetchQuestions(1); });
        $scope.onSelectQuestionPage = function(page) {
            fetchQuestions(page);
        };

        // search templates
        $scope.templatePage = {
            searchTerm: defaults.searchTerm,
            totalItems: defaults.totalItems,
            itemsPerPage: defaults.itemsPerPage,
            current: 1,
            error: false,
            loading: false,
            hasData: false,
            items: []
        };

        function fetchTemplates(page) {
            requestCount++;
            $scope.templatePage.loading = true;            
            //Questionnaire.getQuestionnaires(page, $scope.templatePage.itemsPerPage, $scope.templatePage.searchTerm).then(function (response) {
            QuestionnaireTemplate.getQuestionnairesTemplate(page, $scope.templatePage.itemsPerPage, $scope.templatePage.searchTerm).then(function(response) {
                $scope.templatePage.loading = $scope.templatePage.error = false;
                var pagination = response.headers('x-pagination');

                if (pagination) {
                    pagination = angular.fromJson(pagination);
                    $scope.templatePage.totalItems = pagination.TotalCount;
                    $scope.templatePage.totalPages = pagination.TotalPages;
                }
                $scope.templatePage.items = response.data.items;
                $scope.templatePage.hasData = $scope.templatePage.items.length > 0;
            }, function(error) {
                $scope.templatePage.error = true;
            });
        }

        $scope.$watch('templatePage.searchTerm', function() { fetchTemplates(1); });
        $scope.onSelectTemplatePage = function(page) {
            fetchTemplates(page);
        };
        // preview question
        $scope.previewQuestionModel = {};

        /*
        * Preview questionnaire
        */
        $scope.previewQuestionnaire = function(id) {
            Questionnaire.getById(id, 0).then(function(res) {
                res.data.info.questions.forEach(function(question, index) {
                    res.data.info.questions[index] = SurveyService.revertFormatQuestionForSubmit(question);
                });
                $scope.previewQuestionnaireModel = res.data.info;
            }, function(error) {
            }).finally(function() {
                $scope.showPreviewModal();
            });
        };

        /*
        * Display modal contain questionnaire's info
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
    }
]);







