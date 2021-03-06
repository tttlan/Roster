angular.module('ui.survey')

.controller('manageQuestionnairesTemplateCreateCtrl', ['$scope', '$modal', '$routeParams', 'SurveyService', '$window', '$location', '$notify', 'Questionnaire', 'Paths', 'FormatSurvey','$q','$route',
    function($scope, $modal, $routeParams, SurveyService, $window, $location, $notify, Questionnaire, Paths, FormatSurvey, $q, $route) {

        /*
        * Initial list contain removed question
        */
        $scope.deletedQuestions = [];
        $scope.deletedGroups = [];


        /*
        * Initial object questionnaireInfo
        * default TemplateType is "External"
        */
        $scope.questionnaireInfo = {
            TemplateType: 'External',
            questions: [],
            questionGroup: []
        };

        $scope.questionLists = {
            createQuestionList: [],
            updateQuestionList: []
        };


        $scope.deleteGroup = function(index) {
            $scope.deletedGroups.push($scope.questionnaireInfo.questionGroup[index].questionGroupId);
            $scope.questionnaireInfo.questionGroup.splice(index, 1);
        };
        // Get list question group
        // GET api/survey/QuestionTags?p={p}&ps={ps}&rc={rc}
        $scope.GetListTags = function(page, pageSize) {
            SurveyService.getQuestionTags(page, pageSize).then(function(response) {
		var indexUngroup = FormatSurvey.checkNameExist(response.data.items, 'Ungroup');
                if (indexUngroup !== -1) {
                    response.data.items.splice(indexUngroup, 1);
                }
                $scope.listTags = response.data.items;
            }, function(error) {
                console.log(error);
            });
        };


        /*
        *  This condition is used for checking para "id" exised?
        * YES -- It mean user choose edit questionnaire form list questionnaires
        * NO --  Create new questionnaire
        */
        if ($routeParams.id) {
            $scope.loading = true;
            SurveyService.getQuestionnaireTemplateByQuestionnaireId($routeParams.id).then(function(res) {
                $scope.questionnaireInfo = res.data.SurveyQuestionnaireTemplateInfo;
                Questionnaire.getById($routeParams.id, 0).then(function(res) {		
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
                    $scope.loading = false;
                }, function(error) {
                    $notify.add({
                        message: angular.isUndefined(error.data.Errors) ? error.data.Message : error.data.Errors[0].Message,
                        type: 'error'
                    });
                });

            }, function(error) {
                $scope.loading = false;
                $notify.add({
                    message: angular.isUndefined(error.data.Errors) ? error.data.Message : error.data.Errors[0].Message,
                    type: 'error'
                });
            });
        }

        $scope.showSidebar = function() {
            $modal.open({
                templateType: 'drawer',
                classes: 'survey lt-tablet-show',
                backdropClass: 'lt-tablet-show',
                templateUrl: '/interface/views/survey/partials/__survey-aside.html',
                title: 'Add Question',
                scope: $scope

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

        /*
        * Function show modal to preview questionnaire
        */
        $scope.showPreview = function() {
            //Get all question in each group
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
        };

        //Create/edit quetionnaires
        $scope.saveQuetionnaires = function(isValid, questionnaireInfo) {

            if (!isValid) {
                $scope.isOpenQuestionnaire = true;
                return;
            }

            var self = this,
                         action = questionnaireInfo.QuestionnaireId ? 'updateQuestionnairesTemplate' : 'createQuestionnaireTmplManual';
           
            $scope.loading = true;

            return SurveyService[action](questionnaireInfo).then(function(res) {                

                if (res.data.Errors && res.data.Errors.length > 0) {

                    $notify.add({
                        message: res.data.Errors[0].Message,
                        type: 'error'
                    });
                } else {
                    self.QuestionnaireId = res.data.Data;
                    //Get all question in each group
                    var promiseFirstQuestionList = [];
                    $scope.questionnaireInfo.questions = [];
                    $scope.questionnaireInfo.questionGroup.forEach(function(group, index) {
                        if (group.questions.length > 0) {
                            group.questions[0].GroupSortOrder = index + 1;
                            $scope.questionnaireInfo.questions = $scope.questionnaireInfo.questions.concat(group.questions);

                            //var questionAction = group.questions[0].id ? 'updateQuestion' : 'createQuestion';

                            //if (questionAction === 'createQuestion') {
                            //    group.questions[0].Status = 1;
                            //}

                            //group.questions[0].QuestionnaireId = questionnaireInfo.QuestionnaireId || res.data.Data;
                            //group.questions[0].SortOrder = 1;
                            //if (group.questions[0].Tag) {
                            //    if (group.questions[0].Tag.name) {
                            //        group.questions[0].TagId = group.questions[0].Tag.name === 'Ungroup' ? null : group.questions[0].Tag.tagId;
                            //        group.questions[0].TagName = group.questions[0].Tag.name === 'Ungroup' ? null : group.questions[0].Tag.name;
                            //    } else {
                            //        group.questions[0].TagName = group.questions[0].Tag === 'Ungroup' ? null : group.questions[0].Tag;
                            //    }
                            //}

                            //promiseFirstQuestionList.push(saveQuestion(questionAction, group.questions[0]));
                            //group.questions.shift();
                            //if (group.questions.length > 0) {
                            //    $scope.questionnaireInfo.questions = $scope.questionnaireInfo.questions.concat(group.questions);
                            //}
                        }
                    });
                    //$q.all(promiseFirstQuestionList).then(function(res) {
                        //var promiseList = [];
                        if (action === 'createQuestionnaireTmplManual') {
                            //CreateQuestionnaireTmplManual api return questionnaire id
                            //Inject the id into the object if we return from a create

                            //Create questionnaire temp
                            if ($scope.questionnaireInfo.questions.length > 0) {
                                $scope.questionnaireInfo.questions.forEach(function(question, index) {

                                    question.QuestionnaireId = self.QuestionnaireId;
                                    if (question.Tag) {
                                        if (question.Tag.name) {// Exist group from listTags
                                            question.TagId = question.Tag.name === 'Ungroup' ? null : question.Tag.tagId;
                                            question.TagName = question.Tag.name === 'Ungroup' ? null : question.Tag.name;
                                        } else {// Type new group
                                            question.TagName = question.Tag === 'Ungroup' ? null : question.Tag;
                                        }
                                    }
                                    question.SortOrder = index + 1;
                                    question.Status = 1;
                                    //promiseList.push(saveQuestion('createQuestion', question));

                                });
                                saveQuestions('createQuestions', $scope.questionnaireInfo.questions, self.QuestionnaireId || questionnaireInfo.id);
                            } else {//Qustions empty notify is save questionnaires success
                                $scope.loading = false;
                                $notify.add({
                                    message: 'Your changes were saved.',
                                    type: 'success'
                                });
                                $location.path(Paths.get('survey.questionnairesTemplate.edit', self.QuestionnaireId || questionnaireInfo.QuestionnaireId).path);
                            }
                            //if (promiseList.length > 0) {
                            //    $q.all(promiseList).then(function(res) {
                            //        $notify.add({
                            //            message: 'Your changes were saved.',
                            //            type: 'success'
                            //        });
                            //        $scope.loading = false;
                            //        $location.path(Paths.get('survey.questionnairesTemplate.edit', self.QuestionnaireId || questionnaireInfo.QuestionnaireId).path);
                            //    });
                            //}
                        } else {//Update questionnaire temp

                            //Delete groups
                            $scope.deletedGroups.forEach(function(id) {
                                if (id) {
                                    SurveyService.deleteGroup(id).then(function(res) {
                                        //Todo: throw error if any
                                });
                                }
                            });
                            //Delete questions
                        $scope.deletedQuestions.forEach(function(id) {
                            //promiseList.push(
                                SurveyService.deleteQuestion(id).then(function(res) {
                                    //Todo: throw error if any
                                });
                            //);
                            
                        });
                            //Add new/ edit questions
                        if ($scope.questionnaireInfo.questions.length > 0) {
                            $scope.questionnaireInfo.questions.forEach(function(question, index) {

                                //var questionAction = question.id ? 'updateQuestion' : 'createQuestion';
                                //if (questionAction === 'createQuestion') {
                                //    question.Status = 1;
                                //}

                                question.QuestionnaireId = questionnaireInfo.QuestionnaireId;
                                question.SortOrder = index + 1;
                                if (question.Tag) {
                                    if (question.Tag.name) {
                                        question.TagId = question.Tag.name === 'Ungroup' ? null : question.Tag.tagId;
                                        question.TagName = question.Tag.name === 'Ungroup' ? null : question.Tag.name;
                                    } else {
                                        question.TagName = question.Tag === 'Ungroup' ? null : question.Tag;
                                    }
                                }
                                if (!question.id) {
                                    question.Status = 1;
                                    $scope.questionLists.createQuestionList.push(question);
                                    //} else if (question.editted) {
                                } else {
                                   // question.
                                    $scope.questionLists.updateQuestionList.push(question);
                                }
                                //promiseList.push(saveQuestion(questionAction, question));

                            });
                         //   $q.all(promiseList).then(function(res) {
                         //       $notify.add({
                         //           message: 'Your changes were saved.',
                         //           type: 'success'
                         //       });
                         //       $scope.loading = false;
                         //       $route.reload();
                         //   }, function (err) {
                         //       console.log('Save data error: ' + err);
                         //       $scope.loading = false;
                         //});
                        }

                        if ($scope.questionLists.createQuestionList.length > 0 || $scope.questionLists.updateQuestionList.length > 0) {
                            saveQuestions('updateQuestions', $scope.questionLists);
                        }
                        else {//Qustions empty notify is save questionnaires success
                        $notify.add({
                            message: 'Your changes were saved.',
                            type: 'success'
                        });
                        $scope.loading = false;
                        $route.reload();
                    }
                }
                    //End save questions 
                //});
            }
        }, function(res) {
            $scope.loading = false;
            if (res.data.InnerException) {
                $notify.add({
                    message: res.data.InnerException.ExceptionMessage,
                    type: 'error'
                });
            }
        });
    };

        function saveQuestions(action, questionList, id) {
            //questionList[0].SubQuestion = {
            //    QuestionContent: "aaaaa",
            //    ResponseChoice: {
            //        ResponseChoiceTypeId: 1,
            //        Status: 1
            //    },
            //    QuestionTypeId: questionList[0].QuestionTypeId,
            //    QuestionnaireId: questionList[0].QuestionnaireId
            //};
            if(!questionList.updateQuestionList) {
                questionList.forEach(function(questionItem) {
                    //console.log(questionItem.QuestionOption.QuestionOption);
                    if(questionItem.QuestionOption) {
                        questionItem.QuestionOption.QuestionTypeId = questionItem.QuestionTypeId;
                        questionItem.QuestionOption.QuestionnaireId = questionItem.QuestionnaireId;
                    }
                });
            }else {
                questionList.updateQuestionList.forEach(function(questionItem) {
                    if(questionItem.QuestionOption) {
                        questionItem.QuestionOption.QuestionTypeId = questionItem.QuestionTypeId;
                        questionItem.QuestionOption.QuestionnaireId = questionItem.QuestionnaireId;
                    }
                });
                questionList.createQuestionList.forEach(function(questionItem) {
                    if(questionItem.QuestionOption) {
                        questionItem.QuestionOption.QuestionTypeId = questionItem.QuestionTypeId;
                        questionItem.QuestionOption.QuestionnaireId = questionItem.QuestionnaireId;
                    }
                });
            }

            //questionList[0].QuestionOption.QuestionTypeId = questionList[0].QuestionTypeId;
            //questionList[0].QuestionOption.QuestionnaireId = questionList[0].QuestionnaireId;

            return SurveyService[action](questionList).then(function(res) {
                $scope.loading = false;
                if (res.data.Errors && res.data.Errors.length > 0) {
                    $notify.add({
                        message: res.data.Errors[0].Message,
                        type: 'error'
                    });
                } else {
                    $notify.add({
                        message: 'Your changes were saved.',
                        type: 'success'
                    });
                }
                if (action === 'createQuestions') {
                    $location.path(Paths.get('survey.questionnairesTemplate.edit', id).path);

                } else {
                    $route.reload();
                }
            }, function(res) {
                $notify.add({
                    message: res.data.Errors[0].Message,
                    type: 'error'
                });
            });
        }

        function getTypeOfQuestionById(id) {
            var questionType = '';
            if (id) {
                switch (id) {
                    case 1: questionType = 'Text Question'; break;
                    case 2: questionType = 'Yes/No Question'; break;
                    case 3: questionType = 'Multiple Choice'; break;
                    case 4: questionType = 'Single Choice'; break;
                    case 5: questionType = 'Date'; break;
                    case 6: questionType = 'Document'; break;
                    default: questionType = ''; break;
                }
            }
            return questionType;
        }

        Array.prototype.indexOfObject = function(parentProp, childProp, value) {
            if (!childProp) {
                return this.map(function(e) { return e[parentProp]; }).indexOf(value);
            }
            return this.map(function(e) { return e[parentProp][childProp]; }).indexOf(value);
        };


        // function to open question picker
        $scope.showQuestionPicker = function(event, index, question, group, indexOfGroup, edit) {
            if (question && question.importFromQuestionnaire) {
                $scope.importQuestionnaire(question.id, group ? group.tag : null);
                return;
            }
            if (question.addNew || edit) {


                if (question.id && !edit) {
                    //Add question from template. 
                    SurveyService.getQuestionById(question.id).then(function(res) {
                        question = res.data.SurveyQuestionDetail;
                        question.ResponseChoices = question.SurveyQuestionResponseChoices.filter(function(choice) {
                            return (choice.Status !== 0);
                        });
                        if (group) {
                            question.Tag = {};
                            question.Tag.name = group.tag.name === 'Ungroup' ? '' : angular.copy(group.tag.name);
                            question.Tag.tagId = group.tag.id;
                        } else if (question.SurveyQuestionGroup && question.SurveyQuestionGroup.SurveyQuestionTag) {//This case only happen when user add from templdate & drag into drop zone.
                            question.Tag = {};
                            question.Tag.name = question.SurveyQuestionGroup.SurveyQuestionTag.Name;
                            question.Tag.tagId = question.SurveyQuestionGroup.SurveyQuestionTag.TagId;
                        }
                        question.typeOfQuestion = FormatSurvey.getQuestionTypeId(question);
                        question.addNew = true;
                        var modal = $modal.open({
                            templateType: 'drawer',
                            classes: 'survey drawer--responsive',
                            templateUrl: '/interface/views/survey/partials/modal-question-picker.html',
                            size: 'lg',
                            controller: 'customquestionsPickerCtrl',
                            scope: $scope,
                            resolve: {
                                question: function() {
                                    return question;
                                },

                            },
                            title: getTypeOfQuestionById(question.typeOfQuestion),
                        });
                        modal.result.then(function(result) {
                            result.question.addNew = false;
                            if (!result.question.Tag || result.question.TagName === 'Ungroup') {
                                var indexOfUngroup = $scope.questionnaireInfo.questionGroup.indexOfObject('tag', 'name', 'Ungroup');
                                if (indexOfUngroup !== -1) {
                                    result.question.addNew = false;
                                    $scope.questionnaireInfo.questionGroup[indexOfUngroup].questions.push(result.question);
                                    return;
                                }
                                index = null;
                                result.question.Tag = {
                                    name: 'Ungroup'
                                };
                            }
                            if (!group || group.tag.name !== result.question.Tag.name) {
                                var findIndexOfGroup = $scope.questionnaireInfo.questionGroup.indexOfObject('tag', 'name', result.question.Tag.name || result.question.Tag);
                                if (findIndexOfGroup !== -1) {
                                    $scope.questionnaireInfo.questionGroup[findIndexOfGroup].questions.push(result.question);
                                    return;
                                } else {
                                    if (!result.question.Tag.name) {
                                        $scope.listTags.push({ name: result.question.Tag });
                                    }
                                    var newGroup = {
                                        tag: {
                                            name: result.question.Tag.name || result.question.Tag
                                        },
                                        questions: [result.question]
                                    };
                                    $scope.questionnaireInfo.questionGroup.push(newGroup);
                                    return;
                                }
                            }
                            $scope.questionnaireInfo.questionGroup[indexOfGroup].questions.splice(index, 0, result.question);
                        });
                    }, function(error) {
                        console.log(error);
                    });

            } else {
                //Add question from icon/ or edit quetion
                if (group) {
                    question.Tag = {};
                    question.Tag.name = group.tag.name === 'Ungroup' ? '' : group.tag.name;
                    question.Tag.tagId = group.tag.id;
                } else if ((question.TagId || question.TagName) && question.TagName !== 'Ungroup') { // Edit question 
                    question.Tag = {
                        name: question.TagName,
                        tagId: question.TagId,
                    };
                    // add new question with no group, and first drop from a exist group.
                } else if ((question.Tag && question.Tag.name && question.Tag.name === 'Ungroup') || (question.TagName && question.TagName === 'Ungroup')) { // --> for ungroup case.
                    question.Tag = {
                        name: ''
                    };
                }
                var questionClone = angular.copy(question);
                var modal = $modal.open({
                    templateType: 'drawer',
                    backdrop: true,
                    classes: 'survey drawer--responsive ',
                    templateUrl: '/interface/views/survey/partials/modal-question-picker.html',
                    size: 'lg',
                    controller: 'customquestionsPickerCtrl',
                    scope: $scope,
                    resolve: {
                        question: function() {
                            return questionClone;
                        },

                        },
                        title: getTypeOfQuestionById(question.typeOfQuestion),
                    });

                    modal.result.then(function(result) {
                        //Change group / create new group / add to existed group
                        if (!result.question.Tag || result.question.TagName === 'Ungroup') {
                            var indexOfUngroup = $scope.questionnaireInfo.questionGroup.indexOfObject('tag', 'name', 'Ungroup');
                            result.question.Tag = {
                                name: 'Ungroup'
                            };
                            if (indexOfUngroup !== -1) {
                                result.question.addNew = false;
                                $scope.questionnaireInfo.questionGroup[indexOfUngroup].questions.push(result.question);
                                return;
                            }

                            index = null;                        
                        }

                        if (!question.Tag || angular.isString(question.Tag) || question.Tag.name !== result.question.Tag.name) {
                            var findIndexOfGroup = $scope.questionnaireInfo.questionGroup.indexOfObject('tag', 'name', result.question.Tag.name || result.question.Tag);
                            if (edit) {
                                $scope.questionnaireInfo.questionGroup[indexOfGroup].questions.splice(index, 1);
                            }
                            if (findIndexOfGroup !== -1) {
                                result.question.addNew = false;
                                $scope.questionnaireInfo.questionGroup[findIndexOfGroup].questions.push(result.question);
                                return;
                            } else {
                                index = null;
                                if (!result.question.Tag.name) {
                                    $scope.listTags.push({ name: result.question.Tag });
                                }
                            }
                        }

                        //Add new group
                        if (!index) {
                            result.question.addNew = false;
                            var newGroup = {
                                tag: {
                                    name: result.question.Tag.name || result.question.Tag,
                                    id: result.question.Tag.tagId
                                },
                                questions: [result.question]
                            };
                            $scope.questionnaireInfo.questionGroup.push(newGroup);
                            return;
                        }

                        if (question.addNew) {
                            result.question.addNew = false;
                            $scope.questionnaireInfo.questionGroup[indexOfGroup].questions.splice(index, 0, result.question);
                        } else {
                            $scope.questionnaireInfo.questionGroup[indexOfGroup].questions[index] = result.question;
                        }
                    });
                }
            } else {
                if (group && group.tag) {
                    question.TagName = group.tag.name;
                    question.TagId = group.tag.id;
                    return question;
                } 
                var indexOfUngroup = $scope.questionnaireInfo.questionGroup.indexOfObject('tag', 'name', 'Ungroup');                
                var indexPreviousGroup = $scope.questionnaireInfo.questionGroup.indexOfObject('tag', 'name', question.TagName ||  question.Tag.name);
                var questionIndex = $scope.questionnaireInfo.questionGroup[indexPreviousGroup].questions.indexOfObject('questionPrefix', '', question.questionPrefix);
                if (indexOfUngroup !== -1) {
                    question.Tag = {
                        name: 'Ungroup'
                    };
                    question.TagName = null;
                    question.TagId = null;
                    $scope.questionnaireInfo.questionGroup[indexOfUngroup].questions.push(question);
                    if (indexPreviousGroup !== -1) {
                        $scope.questionnaireInfo.questionGroup[indexPreviousGroup].questions.splice(questionIndex, 1);
                    }
                } else {
                    question.Tag = {
                       name: 'Ungroup'
                    };
                    question.TagName = null;
                    question.TagId = null;
                    var newGroup = {
                        tag: {
                            name: 'Ungroup'
                        },
                        questions: [question]
                    };                    
                    $scope.questionnaireInfo.questionGroup.push(newGroup);
                    if (indexPreviousGroup !== -1) {
                        $scope.questionnaireInfo.questionGroup[indexPreviousGroup].questions.splice(questionIndex, 1);
                    }
                }
            }
        };

        $scope.importQuestionnaire = function(id, group) {

            var modal = $modal.open({
                templateUrl: '/interface/views/survey/partials/modal-import-questionnaires.html',
                size: 'md',
                controller: 'importQuestionnairesCtrl',
                scope: $scope,
                resolve: {
                    group: function() {
                        return group;
                    }
                }
            });

            modal.result.then(function(result) {
                Questionnaire.getById(id, 0).then(function(res) {
                    res.data.info.questions.forEach(function(question, index) {
                        res.data.info.questions[index] = SurveyService.revertFormatQuestionForSubmit(question);
                        res.data.info.questions[index].id = null;
                        // Change the group
                        res.data.info.questions[index].TagId = result.tagId ? result.tagId : null;
                        res.data.info.questions[index].TagName = result.name || result;
                    });
                    if (!$scope.questionnaireInfo.name) {
                        //$scope.questionnaireInfo.name = res.data.info.name;
                        //$scope.questionnaireInfo.domainType = res.data.info.domainType;
                        $scope.questionnaireInfo.description = res.data.info.description;
                        $scope.questionnaireInfo.instructions = res.data.info.instructions;
                        $scope.questionnaireInfo.isPrivacy = res.data.info.isPrivacy;
                    }
                    if (result.name) {
                        var findIndexOfGroup = $scope.questionnaireInfo.questionGroup.indexOfObject('tag', 'name', result.name);
                        if (findIndexOfGroup !== -1) {
                            $scope.questionnaireInfo.questionGroup[findIndexOfGroup].questions = $scope.questionnaireInfo.questionGroup[findIndexOfGroup].questions.concat(res.data.info.questions);
                            return;
                        }
                    }
                    var newGroup = {
                        tag: {
                            name: result.name || result
                        },
                        questions: res.data.info.questions
                    };
                    $scope.questionnaireInfo.questionGroup.push(newGroup);
                    $scope.listTags.push({ name: newGroup.tag.name });
                    $notify.add({
                        message: 'Questionnaires was imported successful!',
                        type: 'success'
                    });
                }, function(error) {
                    $scope.loading = false;
                    $notify.add({
                        message: angular.isUndefined(error.data.Errors) ? error.data.Message : error.data.Errors[0].Message,
                        type: 'error'
                    });
                });
            });
        };

        $scope.copyQuestion = function(event, index, question, edit, indexOfGroup) {
            
            var questionCopy = angular.copy(question);
            questionCopy.QuestionContent = question.QuestionContent;
            questionCopy.id = null;
            // $scope.questionnaireInfo.questions.splice(index + 1, 0, questionCopy);
            $scope.questionnaireInfo.questionGroup[indexOfGroup].questions.push(questionCopy);

        };
    }]);