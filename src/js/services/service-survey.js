angular.module('ui.services')
.constant('QuestionTypes', {
    Text: 1,
    YesNo: 2,
    MultiChoices: 3,
    SingleChoice: 4,
    DatePicker: 5,
    Document: 6

})
.factory('$serverSurvey', ['$http', '$server', '$HTTPCache', '$q', '$window', function($http, $server, $HTTPCache, $q, $window) {
    var $cache = $HTTPCache.get();
    var cancelAllRequests = $q.defer();
    var DEFAULT_REQUEST = {
        url: '/api',
        query: {},
        data: {},
        timeout: cancelAllRequests.promise
    };
    function makeCall(obj) {

        var deferred = $q.defer();

        //If we are debugging, lets not post, update or delete
        if ($window.SILENT && obj.method !== 'GET') {
            console.log('Request sent:');
            console.log('__________________________');
            console.dir(obj);
            console.log('__________________________');
            deferred.reject({});
            return deferred.promise;
        }

        $http(obj).success(function(data, status, headers, config) {

            deferred.resolve({ 'data': data, 'status': status, 'headers': headers, 'config': config });

        }).error(function(data, status, headers, config) {

            deferred.reject({ 'data': data, 'status': status, 'headers': headers, 'config': config });

        });

        return deferred.promise;

    }
    function buildParams(obj, removePrefix) {
        var query = '', beginningPrefix = removePrefix ? '' : '?';
        obj = (typeof obj === 'object') ? obj : {};
        angular.forEach(obj, function(val, key) {
            var prefix = query.length ? '&' : beginningPrefix;
            query += prefix + key + '=' + val;
        });
        return query;
    }
    var $serverSurvey = angular.copy($server);
    $serverSurvey.get = function(req) {
        req = angular.extend({}, DEFAULT_REQUEST, req);

        return makeCall({
            method: 'GET',
            url: req.url + buildParams(req.query),
            cache: $cache
        });
    };
    return $serverSurvey;
}])
.factory('SurveyService', ['$server', 'API_BASE_URL', '$HTTPCache', '$route', function($server, API_BASE_URL, $HTTPCache, $route) {

    var SURVEY_NAMESPACE = API_BASE_URL + 'survey/';

    function Questionnaire(futureData) {
        var self = this;
        if (futureData && typeof futureData.then === 'function') {
            this.$promise = futureData;
            this.$loading = true;
            futureData.then(function(res) {
                Questionnaire.$$timeout(function() {
                    angular.extend(self, res.data);
                    angular.extend(self, res.canCreate);
                    self.$loading = false;
                });

                return res;
            });

        } else {
            angular.extend(this, futureData);
        }
    }

    function formatQuestionTag(res) {

        var results = res.data.SurveyQuestionTagsInfoItemResult || [res.data];

        var questionTag = {
            //permissions: formatPermissions(res.data.EntityActions),
            //pagination: res.data.Pagination,
            items: results.map(function(item) {

                var questionItem = {
                    name: item.SurveyQuestionTagsInfo.Name,
                    tagId: item.SurveyQuestionTagsInfo.TagId,
                };
                return questionItem;
            })
        };
        res.data = questionTag;

        return res;
    }

    function revertFormatResponseChoice(items) {
        var choiceData = {};
        if (items === null) {
            return choiceData;
        }
        return items.map(function(item) {
            choiceData = {
                ResponseChoiceId: item.id,
                ResponseChoiceTypeId: item.choiceTypeId,
                QuestionId: item.questionId,
                ChoiceMaxValue: item.maxValue,
                ChoiceMinValue: item.minValue,
                ChoiceValue: item.value,
                IsDefaultSelected: item.isSelected,
                Status: item.status,
                CreatedDate: item.createdDate
            };
            return choiceData;
        });
    }

    function revertSubQuestion(item) {
        if (item === null) {
            return null;
        }
        var subQuestionItem = {
            QuestionContent: item.content,
            QuestionId: item.questionId,
            ResponseChoice: {
                ResponseChoiceId: item.responseChoice.id,
                ResponseChoiceTypeId: item.responseChoice.choiceTypeId
            }
        };
        return subQuestionItem;
    }

    function revertFormatQuestionForSubmit(item) {
        var questionItem = {};
        if (!item) {
            return questionItem;
        }

        questionItem = {
            id: item.id,
            QuestionId: item.id,
            //questionTypeId: item.questionTypeId,
            typeOfQuestion: item.typeOfQuestion,
            QuestionTypeId: item.questionType,
            QuestionnaireId: item.questionnaireId,
            QuestionContent: item.content,
            Note: item.note,
            TagId: angular.isUndefined(item.groupDetail) ? '' : item.groupDetail.tagId,
            TagName: angular.isUndefined(item.groupDetail) ? '' : item.groupDetail.name,
            HasDefaultValue: item.hasDefaultValue,
            HasMultilineSupport: item.hasMultilineSupport,
            IsMandatory: item.isMandatory,
            SortOrder: item.sortOrder,
            Status: item.status,
            AutoRejectCandidat: item.autoRejectCandidat,
            YesNoAutoReject: item.yesNoAutoReject,
            Filter: item.filter,
            FilterText: item.filterText,
            DisplayOptionalOnYesNo: item.displayOptionalOnYesno,
            MultichoiceAsList: item.multichoiceAsList,
            DisplayStack: item.displayStack,
            QuestionOption: revertSubQuestion(item.subQuestion),
            ResponseChoices: revertFormatResponseChoice(item.responseChoices),
        };
        return questionItem;
    }

    return {
        getQuestionnaireList: function(data) {
            var query = {
                'searchTerm': '',
                's': data.status,
                't': data.t,
                'o': data.orderBy,
                'p': data.page,
                'ps': data.pageSize,
                'rc': data.recordCount,
            };
            var url = SURVEY_NAMESPACE + 'Questionnaires';
            return $server.get({
                'url': url,
                'query': query
            }).then(function(res) {
                if (res.data.Errors === null) {
                    res.canCreateQuestionnaire = res.data.EntityActions[0] && res.data.EntityActions[0].Code;
                    res.data = res.data.SurveyQuestionnaireList;
                    res.data = res.data.map(function(QuestionData) {
                        return new Questionnaire(QuestionData);
                    });

                }
                return res;
            });
        },

        // Get questionnaire templates
        getQuestionnaireTemplateList: function(data) {

            var query = {
                'g': data.global,
                's': data.status,
                'rc': data.recordCount,
                'o': data.orderBy,
                'p': data.page,
                'ps': data.pageSize,

            };
            //GET api/survey/QuestionnaireTemplates?g={g}&s={s}&o={o}&p={p}&ps={ps}&rc={rc}
            var url = SURVEY_NAMESPACE + 'QuestionnaireTemplates';

            return $server.get({
                'url': url,
                'query': query
            }).then(function(res) {
                if (res.data.Errors === null) {
                    res.canCreate = res.data.EntityActions[0] && res.data.EntityActions[0].Code;
                    res.data = res.data.SurveyQuestionnaireTemplateList;
                    res.data = res.data.map(function(QuestionData) {
                        return new Questionnaire(QuestionData);
                    });
                } else {
                    alert('Failed to load!');
                }
                return res;
            });

        },

        // Create a question
        createQuestion: function(obj) {

            var url = SURVEY_NAMESPACE + 'Questions';

            //A copy needs to be done, to prevent side-effects to the original data on the controller
            var objtData = angular.copy(obj);

            return $server.create({
                'url': url,
                'data': objtData
            }).then(function(res) {

                $HTTPCache.clear([SURVEY_NAMESPACE, 'Questions']);

                return res;
            });
        },

        // Create questions
        createQuestions: function(questions) {

            var url = SURVEY_NAMESPACE + 'QuestionList';

            return $server.create({
                'url': url,
                'data': questions
            }).then(function(res) {

                $HTTPCache.clear([SURVEY_NAMESPACE, 'QuestionList']);

                return res;
            });
        },

        // update a question
        updateQuestion: function(obj) {

            var url = SURVEY_NAMESPACE + 'Questions/' + obj.id;

            return $server.update({
                'url': url,
                'data': obj
            }).then(function(res) {

                $HTTPCache.clear([SURVEY_NAMESPACE, 'Questions']);

                return res;
            });
        },

        // update questions
        updateQuestions: function(questionList) {

            var url = SURVEY_NAMESPACE + 'EditQuestions';

            return $server.update({
                'url': url,
                'data': { CreateList: questionList.createQuestionList, EditList: questionList.updateQuestionList }
            }).then(function(res) {

                $HTTPCache.clear([SURVEY_NAMESPACE, 'EditQuestions']);

                return res;
            });
        },

        // Create a questionnaires
        createQuestionnaires: function(obj) {

            var url = SURVEY_NAMESPACE + 'Questionnaires';

            //A copy needs to be done, to prevent side-effects to the original data on the controller
            var objtData = angular.copy(obj);

            return $server.create({
                'url': url,
                'data': objtData
            }).then(function(res) {

                $HTTPCache.clear([SURVEY_NAMESPACE, 'Questionnaires']);

                return res;
            });
        },

        // update a questionnaires
        updateQuestionnaires: function(obj) {

            var url = SURVEY_NAMESPACE + 'Questionnaires/' + obj.id;

            //A copy needs to be done, to prevent side-effects to the original data on the controller
            var objtData = angular.copy(obj);

            return $server.update({
                'url': url,
                'data': objtData
            }).then(function(res) {

                $HTTPCache.clear([SURVEY_NAMESPACE, 'Questionnaires']);

                return res;
            });
        },

        // Delete questionnaire
        deleteQuestionnaire: function(questionnaireId) {
            //survey/Questionnaires/{id}
            var url = SURVEY_NAMESPACE + 'Questionnaires' + '/' + questionnaireId;
            return $server.remove({
                'url': url
            }).then(function(res) {
                $HTTPCache.clear('Questionnaires');
                return res;
            });
        },

        // Delete questionnaire template
        deleteQuestionnaireTemplate: function(questionnaireId) {
            //survey/QuestionnaireTemplates/{id}
            var url = SURVEY_NAMESPACE + 'QuestionnaireTemplates' + '/' + questionnaireId;
            return $server.remove({
                'url': url
            }).then(function(res) {
                $HTTPCache.clear('QuestionnaireTemplates');
                return res;
            });
        },

        // Get List Tags
        getQuestionTags: function(page, pageSize) {
            var query = {
                'rc': 1,
                'p': page,
                'ps': pageSize
            };
            // GET api/survey/QuestionTags?p={p}&ps={ps}&rc={rc}
            var url = SURVEY_NAMESPACE + 'QuestionTags';
            return $server.get({
                'url': url,
                'query': query
            }).then(formatQuestionTag);
        },

        //revert Format Question For Submit API
        revertFormatQuestionForSubmit: revertFormatQuestionForSubmit,

        // Delete questionn
        deleteQuestion: function(id) {
            //survey/Questions/{id}
            var url = SURVEY_NAMESPACE + 'Questions' + '/' + id;
            return $server.remove({
                'url': url
            }).then(function(res) {
                $HTTPCache.clear('Questions');
                return res;
            });
        },

        //get Question By Id
        getQuestionById: function(id) {

            // GET api/survey/Questionnaires/Questions/{id}
            var url = SURVEY_NAMESPACE + 'Questions' + '/' + id;
            return $server.get({
                'url': url,
            }).then(function(res) {
                return res;
            });
        },

        //get QuestionnaireTemplate by Id
        getQuestionnaireTemplateById: function(id) {

            // GET api/survey/Questionnaires/QuestionnaireTemplates/{id}
            var url = SURVEY_NAMESPACE + 'Questionnaires/QuestionnaireTemplates' + '/' + id;
            return $server.get({
                'url': url,
            }).then(function(res) {
                return res;
            });

        },

        //create Questionnaire Template manual by Questionnaire
        createQuestionnaireTmplManual: function(obj) {
            var url = SURVEY_NAMESPACE + 'QuestionnaireTemplates/manual';

            //A copy needs to be done, to prevent side-effects to the original data on the controller
            var objtData = angular.copy(obj);

            return $server.create({
                'url': url,
                'data': objtData
            }).then(function(res) {

                $HTTPCache.clear([SURVEY_NAMESPACE, 'QuestionnaireTemplates/manual']);

                return res;
            });
        },

        // update a questionnaires
        updateQuestionnairesTemplate: function(obj) {

            var url = SURVEY_NAMESPACE + 'QuestionnaireTemplates/' + obj.QuestionnaireTemplateId;

            //A copy needs to be done, to prevent side-effects to the original data on the controller
            var objtData = angular.copy(obj);

            return $server.update({
                'url': url,
                'data': objtData
            }).then(function(res) {

                $HTTPCache.clear([SURVEY_NAMESPACE, 'QuestionnaireTemplates']);

                return res;
            });
        },

        //create Questionnaire Template not manual by Questionnaire
        createQuestionnaireTmpl: function(obj) {
            var url = SURVEY_NAMESPACE + 'QuestionnaireTemplates';

            //A copy needs to be done, to prevent side-effects to the original data on the controller
            var objtData = angular.copy(obj);

            return $server.create({
                'url': url,
                'data': objtData
            }).then(function(res) {

                $HTTPCache.clear([SURVEY_NAMESPACE, 'QuestionnaireTemplates']);

                return res;
            });
        },

        //get Questionaire Template By Questioinnaire Id
        getQuestionnaireTemplateByQuestionnaireId: function(id) {

            // GET api/survey/Questionnaires/Questions/{id}
            var url = SURVEY_NAMESPACE + 'Questionnaires/' + id + '/QuestionnaireTemplate?s';
            return $server.get({
                'url': url,
            }, true).then(function(res) {
                return res;
            });

        },

        //Delete QuestionGroup and Questions belong group
        deleteGroup: function(id) {
            //survey/Questions/{id}
            var url = SURVEY_NAMESPACE + 'QuestionGroups' + '/' + id;
            return $server.remove({
                'url': url
            }).then(function(res) {
                $HTTPCache.clear('QuestionGroups');
                return res;
            });
        },

        //Create Questionnaire From QuestionnaireTemplate
        createQuestionnaireFromTemplate: function(id) {
            var url = SURVEY_NAMESPACE + 'QuestionnaireFromTemplates';
            var objtData = {
                DomainKey: null,
                DomainType: 1,
                DomainInfoUri: null,
                QuestionnaireTemplateId: id,
                QuestionnaireName: null,
                Description: null

            };
            return $server.create({
                'url': url,
                'data': objtData
            }).then(function(res) {

                $HTTPCache.clear([SURVEY_NAMESPACE, 'QuestionnaireTemplates']);

                return res;
            });
        }
    };
}])
.service('FormatSurvey', function() {
    var revertFormat = false;
    function formatQuestionTag(tag) {
        var tData = {};
        if (!tag) {
            return tData;
        }
        tData.id = tag.tagId;
        tData.name = tag.Name;
        return tData;
    }
    function formatPermissions(EntityActions) {
        var permissions = {};

        angular.forEach(EntityActions, function(action) {
            permissions[action.Caption.toLowerCase()] = true;
        });

        return permissions;
    }
    function formatResponseChoice(items) {
        if (items === null) {
            return [];
        }
        var filteredList = items.filter(function(choice) {
            return (choice.Status !== 0);
        });
        return filteredList.map(function(item) {
            var choiceData = {};
            choiceData.id = item.ResponseChoiceId;
            choiceData.choiceTypeId = item.ResponseChoiceTypeId || item.ResponseChoiceType;
            choiceData.memberId = item.MemberID;
            choiceData.questionId = item.QuestionId;
            choiceData.maxValue = item.ChoiceMaxValue || item.MaxValue;
            choiceData.minValue = item.ChoiceMinValue || item.MinValue;
            choiceData.value = item.ChoiceValue;
            choiceData.isSelected = item.IsDefaultSelected;
            choiceData.status = item.Status;
            choiceData.createdDate = item.CreatedDate;
            return choiceData;
        });
    }
    function formatGroupDetail(item) {
        if (item) {
            var data = {};
            data.id = item.QuestionGroupId;
            data.questionnaireId = item.QuestionnaireId;
            data.name = item.name;
            data.tagId = item.id;
            data.order = item.SortOrder;
            return data;
        }
        return {};
    }
    function getQuestionTypeId(item) {
        var choices = item.ResponseChoices || item.SurveyQuestionResponseChoices || (item.ResponseChoice ? [item.ResponseChoice] : []);
        var typeOfQuestion = item.QuestionType || item.QuestionTypeId || item.SubQuestionType;
        if (angular.isUndefined(choices[0].ResponseChoiceTypeId)) {
            choices[0].ResponseChoiceTypeId = choices[0].ResponseChoiceType;
        }
        if (!choices) {
            return 0;
        }
        else if (typeOfQuestion === 2) {
            return 3;
        } // multiple choice
        else {
            if (choices.length === 1) {
                if (choices[0].ResponseChoiceTypeId === 17) {
                    return 1;
                } // textbox
                if (choices[0].ResponseChoiceTypeId === 4) {
                    return 5;
                } // date
                if (choices[0].ResponseChoiceTypeId === 11) {
                    return 6;
                } // document     
            } else {
                if (choices.length === 2 && choices[0].ChoiceValue && choices[0].ChoiceValue.toLowerCase() === 'yes' && choices[1].ChoiceValue && choices[1].ChoiceValue.toLowerCase() === 'no') {
                    return 2;
                } // yes no
                else {
                    return 4;
                } // single choice       
            }
        }
        return 0;
    }
    function formatSubQuestion(item) {
        if (!item) {
            return null;
        }
        var responseChoicesFormmat = null;
        if (item.ResponseChoice && item.ResponseChoice.length > 0) {
            responseChoicesFormmat = formatResponseChoice(item.SurveyQuestionResponseChoices);
        }
        else if (item.ResponseChoices && item.RepsonseChoices.length > 0) {
            responseChoicesFormmat = formatResponseChoice(item.ResponseChoice);
        }
        else if (item.ResponseChoice) {
            responseChoicesFormmat = formatResponseChoice([item.ResponseChoice]);
        }

        var subQuestionItem = {
            questionId: item.SubQuestionId,
            content: item.QuestionContent || item.Content || item.SubQuestionContent,
            responseChoice: responseChoicesFormmat ? responseChoicesFormmat[0] : null
        };
        return subQuestionItem;
    }
    function formatQuestion(item) {
        var questionItem = {};
        if (!item) {
            return questionItem;
        }
        questionItem = {
            id: item.QuestionId || item.SubQuestionId,
            typeOfQuestion: item.QuestionType,
            questionnaireId: item.QuestionnaireId,
            content: item.QuestionContent || item.Content || item.SubQuestionContent,
            hasDefaultValue: item.HasDefaultValue,
            isMandatory: item.IsMandatory,
            hasMultilineSupport: item.HasMultilineSupport,
            autoRejectCandidates: item.AutoRejectCandidates,
            displayOptionalOnYesno: item.DisplayOptionalOnYesNo,
            yesNoAutoReject: item.YesNoAutoReject,
            filter: item.Filter,
            filterText: item.FilterText,
            status: item.Status,
            networkId: item.NetworkId,
            memberId: item.MemberId,
            createdDate: item.CreatedDate,
            groupDetail: formatGroupDetail(item.GroupDetail),
            responseChoices: formatResponseChoice(item.SurveyQuestionResponseChoices || item.ResponseChoices),
            userCan: formatPermissions(item.EntityActions),
            subQuestion: formatSubQuestion(item.SubQuestion),
            note: item.Note,
            displayStack: item.DisplayStack,
            questionType: item.QuestionType || item.QuestionTypeId,
            addNew: true
        };
        return questionItem;
    }

    function formatQuestionGroup(g) {
        var gData = {};
        if (!g) {
            return gData;
        }
        gData.questionGroupId = g.QuestionGroupId;
        gData.questionnaireId = g.QuestionnaireId;
        gData.sortOrder = g.SortOrder;
        gData.status = g.Status;
        gData.tag = g.Tag ? {
            id: g.Tag.TagId,
            name: g.Tag.Name,
            description: g.Tag.Description,
            status: g.Tag.Status,
            memeberId: g.Tag.MemberId,
            networkId: g.Tag.NetworkId,
            updatedBy: g.Tag.UpdatedBy,
            createdDate: g.Tag.CreatedDate,
            modifiedDate: g.Tag.ModifiedDate
        } : {};
        gData.questions = g.Questions ? g.Questions.map(function(res) {
            res.GroupDetail = gData.tag;
            return formatQuestion(res);
        }) : [];
        return gData;
    }
    function formatQuestionnaire(qn) {
        var qnData = {};
        if (!qn) {
            return qnData;
        }
        qnData.id = qn.QuestionnaireId;
        qnData.name = qn.Name;
        qnData.domainInfo = qn.DomainInfoUri;
        qnData.domainKey = qn.DomainKey;
        qnData.domainType = qn.DomainType;
        qnData.networkId = qn.NetworkId;
        qnData.memberId = qn.MemberId;
        qnData.status = qn.Status;
        qnData.createDate = qn.CreatedDate;
        qnData.domainInfo = qn.DomainInfoUri;
        qnData.domainKey = qn.DomainKey;
        qnData.domainType = qn.DomainType;
        qnData.networkId = qn.NetworkId;
        qnData.memberId = qn.MemberId;
        qnData.status = qn.Status;
        qnData.instructions = qn.Instructions;
        qnData.description = qn.Description;
        qnData.isPrivacy = qn.IsPrivacy;

        qnData.questionGroup = qn.QuestionGroups ? qn.QuestionGroups.map(function(group) {
            return formatQuestionGroup(group);
        }) : [];
        qnData.ungroupedQuestions = qn.UngroupedQuestions ? qn.UngroupedQuestions.map(function(res) {
            return formatQuestion(res);
        }) : [];
        qnData.questions = [];
        var i = 0;
        for (i = 0; i < qnData.questionGroup.length; i++) {
            var j = 0;
            for (j = 0; j < qnData.questionGroup[i].questions.length; j++) {
                qnData.questions = qnData.questions.concat(qnData.questionGroup[i].questions[j]);
            }
        }
        qnData.questions = qnData.questions.concat(qnData.ungroupedQuestions);
        return qnData;
    }
    function formatQuestionType(item) {
        if (!item) {
            return null;
        }
        return {
            typeOfQuestion: item.QuestionTypeId,
            icon: item.Note,
            name: item.Name,
            addNew: true
        };
    }
    // Check validation errors
    function checkValidateErrors(arr) {
        if (arr && arr.length > 0 && arr[0]) {
            return true;
        }
        return false;
    }

    // Check a array either contains object or not
    function checkNameExist(array, valueName) {
        if (array) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].name === valueName) {
                    return i;
                }
            }
        }
        return -1;
    }

    return {
        formatGroupDetail: formatGroupDetail,
        formatPermissions: formatPermissions,
        formatQuestion: formatQuestion,
        formatResponseChoice: formatResponseChoice,
        formatQuestionGroup: formatQuestionGroup,
        formatQuestionnaire: formatQuestionnaire,
        getQuestionTypeId: getQuestionTypeId,
        formatQuestionTag: formatQuestionTag,
        setRevertFormat: function() { revertFormat = true; },
        checkValidateErrors: checkValidateErrors,
        checkNameExist: checkNameExist,
        formatQuestionType: formatQuestionType,
    };
})
.factory('$serverSurvey', ['$http', '$server', '$HTTPCache', '$q', '$window', function($http, $server, $HTTPCache, $q, $window) {
    var $cache = $HTTPCache.get();
    var cancelAllRequests = $q.defer();
    var DEFAULT_REQUEST = {
        url: '/api',
        query: {},
        data: {},
        timeout: cancelAllRequests.promise
    };
    function makeCall(obj) {

        var deferred = $q.defer();

        //If we are debugging, lets not post, update or delete
        if ($window.SILENT && obj.method !== 'GET') {
            console.log('Request sent:');
            console.log('__________________________');
            console.dir(obj);
            console.log('__________________________');
            deferred.reject({});
            return deferred.promise;
        }

        $http(obj).success(function(data, status, headers, config) {

            deferred.resolve({ 'data': data, 'status': status, 'headers': headers, 'config': config });

        }).error(function(data, status, headers, config) {

            deferred.reject({ 'data': data, 'status': status, 'headers': headers, 'config': config });

        });

        return deferred.promise;

    }
    function buildParams(obj, removePrefix) {
        var query = '', beginningPrefix = removePrefix ? '' : '?';
        obj = (typeof obj === 'object') ? obj : {};
        angular.forEach(obj, function(val, key) {
            var prefix = query.length ? '&' : beginningPrefix;
            query += prefix + key + '=' + val;
        });
        return query;
    }
    var $serverSurvey = angular.copy($server);
    $serverSurvey.get = function(req) {
        req = angular.extend({}, DEFAULT_REQUEST, req);

        return makeCall({
            method: 'GET',
            url: req.url + buildParams(req.query),
            cache: $cache
        });
    };
    return $serverSurvey;
}])
.factory('QuestionType', ['$server', 'API_BASE_URL', 'FormatSurvey', function($server, API_BASE_URL, FormatSurvey) {
    var formatQuestionType = FormatSurvey.formatQuestionType;
    //var QUESTION_TYPES = {
    //    1: 'Text',
    //    2: 'Yes/No',
    //    3: 'Multi-ChoiceList',
    //    4: 'Single-ChoiceList',
    //    5: 'Date',
    //    6: 'Document',
    //    //0: 'Any type'
    //};
    //var QUESTION_ICONS = {
    //    1: 'icon--text',
    //    2: 'icon--yes-no',
    //    3: 'icon--multi-choice',
    //    4: 'icon--single-choice',
    //    5: 'icon--date',
    //    6: 'icon--document',
    //    //0: 'icon--any-type'
    //};
    //var formatPermissions = FormatSurvey.formatPermissions;
    function formatQuestionTypeModel(res) {

        var results = res.data.SurveyQuestionTypeList || [res.data];

        var questionTypeData = {
            items: results.map(function(item) {
                return formatQuestionType(item.SurveyQuestionTypeInfo);
            })
        };

        //var questionTypeItem = {
        //    typeOfQuestion: null,
        //    icon: null,
        //    name: null,
        //    networkId: null,
        //    memberId: null,
        //    status: null,
        //    createdDate: null,
        //    userCan: null,
        //    addNew: true
        //};
        //for (var t in QUESTION_TYPES) {
        //    var anyType = angular.copy(questionTypeItem);
        //    anyType.typeOfQuestion = (parseInt(t)) % 7;
        //    anyType.icon = QUESTION_ICONS[anyType.typeOfQuestion];
        //    anyType.name = QUESTION_TYPES[anyType.typeOfQuestion];
        //    questionTypeData.items.push(anyType);
        //}

        res.data = questionTypeData;
        return res;
    }
    var QUESTION_NAMESPACE = API_BASE_URL + 'survey/Questions/';
    var QuestionTypes = {
        all: function() {
            var url = QUESTION_NAMESPACE + 'QuestionTypes';
            return $server.get({ 'url': url }).then(formatQuestionTypeModel);
        },
        get: function(qtypeId) {
            // Todo
        }
    };
    return QuestionTypes;
}])
.factory('Question', ['$server', 'API_BASE_URL', 'FormatSurvey', function($server, API_BASE_URL, FormatSurvey) {
    var formatPermissions = FormatSurvey.formatPermissions;
    var formatQuestion = FormatSurvey.formatQuestion;
    function formatQuestionModel(res) {

        var results = res.data.SurveyQuestionList || [res.data];

        var questionData = {
            permissions: formatPermissions(res.data.EntityActions),
            pagination: res.data.Pagination,
            items: results.map(function(item) {
                return formatQuestion(item.SurveyQuestionInformation);
            })
        };
        res.data = questionData;

        return res;
    }
    var SURVEY_NAMESPACE = API_BASE_URL + 'survey/';
    var Question = {
        getQuestions: function(page, pageSize, searchTerm) {
            var url = SURVEY_NAMESPACE + 'Questions';
            var query = {
                'name': searchTerm,
                'p': page,
                'ps': pageSize,
                'rc': 1
            };
            return $server.get({
                'url': url,
                'query': query
            }).then(formatQuestionModel);
        },
        nev: function(q) {
            var qData = {
                id: null,
                typeOfQuestion: 0,
                questionnaireId: null,
                content: '',
                hasDefaultValue: false,
                isMandatory: false,
                hasMultilineSupport: false,
                autoRejectCandidates: false,
                displayOptionalOnYesno: false,
                yesNoAutoReject: false,
                filter: false,
                filterText: '',
                status: 1,
                networkId: null,
                memberId: null,
                createdDate: null,
                groupDetail: null,
                responseChoices: [],
                userCan: [],
                subQuestion: null,
                note: '',
                displayStack: false,
                questionType: 1,
                addNew: true,
                QuestionTypeId: 1,
                YesNoAutoReject: null
            };
            if (q.icon) {
                qData.typeOfQuestion = q.typeOfQuestion;
                var responseChoices = [];
                switch (qData.typeOfQuestion) {
                    case 1: qData.responseChoices = [{ 'ResponseChoiceTypeId': 17, 'ChoiceValue': null }];
                        break;
                    case 2: qData.responseChoices = [{ 'ResponseChoiceTypeId': 6, 'ChoiceValue': 'yes' },
                                                        { 'ResponseChoiceTypeId': 6, 'ChoiceValue': 'no' }];
                        break;
                    case 3: qData.questionType = 2;
                        break;
                    case 5: qData.responseChoices = [{ 'ResponseChoiceTypeId': 4, 'ChoiceValue': null }];
                        break;
                    case 6: qData.responseChoices = [{ 'ResponseChoiceTypeId': 11, 'ChoiceValue': null }];
                        break;
                }
            }
            else {
                qData = angular.copy(q);
                qData.id = null;
            }
            return qData;
        }
    };
    return Question;
}])
.factory('QuestionnaireTemplate', ['$serverSurvey', 'API_BASE_URL', 'FormatSurvey', 'Question', '$HTTPCache', function($server, API_BASE_URL, FormatSurvey, Question, $HTTPCache) {
    var formatPermissions = FormatSurvey.formatPermissions;
    var formatQuestionnaire = FormatSurvey.formatQuestionnaire;
    function formatQuestionnaireTemplatesModel(res) {

        var results = res.data.SurveyQuestionnaireTemplateList || [res.data];

        var questionnaireTemplateData = {
            permissions: formatPermissions(res.data.EntityActions),
            pagination: res.data.Pagination,
            items: results.map(function(item) {
                var questionnaireTemplateItem = {};
                questionnaireTemplateItem = {
                    QuestionnaireTemplateId: item.SurveyQuestionnaireTemplateInfo.QuestionnaireTemplateId,
                    QuestionnaireId: item.SurveyQuestionnaireTemplateInfo.QuestionnaireId,
                    Name: item.SurveyQuestionnaireTemplateInfo.Name
                };
                return questionnaireTemplateItem;
            })
        };
        res.data = questionnaireTemplateData;

        return res;
    }

    var QUESTIONNAIRE_TEMPLATE_NAMESPACE = API_BASE_URL + 'survey/QuestionnaireTemplates';
    function formatQuestionnairesTemplateModel(res) {

        var results = res.data.SurveyQuestionnaireTemplateList || [res.data];

        var questionnaireData = {
            items: results.map(function(item) {
                var questionnaireItem = {};
                questionnaireItem = {
                    id: item.SurveyQuestionnaireTemplateInfo.QuestionnaireId,
                    name: item.SurveyQuestionnaireTemplateInfo.Name,
                    importFromQuestionnaire: true
                };
                return questionnaireItem;
            })
        };
        res.data = questionnaireData;

        return res;
    }

    var QuestionnaireTemplate = {
        getQuestionnaireTemplates: function(page, pageSize, searchTerm) {
            var url = QUESTIONNAIRE_TEMPLATE_NAMESPACE + '/Search';
            var query = {
                'searchTerm': searchTerm,
                'p': page,
                'ps': pageSize
            };
            return $server.get({
                'url': url,
                'query': query
            }, true).then(function(res) {
                return formatQuestionnaireTemplatesModel(res);
            });
        },
        create: function(qt) {
            var url = QUESTIONNAIRE_TEMPLATE_NAMESPACE;

            $server.create({
                //'url': url, 'data': rawQuestionnaireTemplate(qt)
                //TODO wtf is rawQuestionnaireTemplate?
                'url': url, 'data': {}
            }).then(function(res) {
                $HTTPCache.clear([QUESTIONNAIRE_TEMPLATE_NAMESPACE, '']);
                for (var i in qt.questions) {
                    //Question.create(rawQuestionData(qt.questions[i])).then(function (res) { }, function (error) {
                    //});
                    //Question.create(rawQuestionData(qt.questions[i]));
                    //TODO wtf is rawQuestionData?
                    Question.create({});
                }
                return res;
            }, function(error) {
                // rollback if any
            });
        },
        update: function(qt) {

        },
        getQuestionnairesTemplate: function(page, pageSize, searchTerm) {
            var url = QUESTIONNAIRE_TEMPLATE_NAMESPACE + '/Search';
            var query = {
                'searchTerm': searchTerm,
                'p': page,
                'ps': pageSize,
                'rc': 1
            };
            return $server.get({
                'url': url,
                'query': query
            }).then(formatQuestionnairesTemplateModel);
        },
        nev: function(qt) {
            var qtData = {
                questionnaireId: null,
                name: '',
                description: '',
                status: 1,
                templateType: '',
                isPrivacy: true,
                global: true,
                position: 1,
                instructions: '',
                questionTemplates: [],
                questions: []
            };
            if (!qt) {
                return qtData;
            }
            qtData = angular.copy(qt);
            qtData.id = null;
            return qtData;
        }
    };
    return QuestionnaireTemplate;
}])
.factory('Questionnaire', ['$server', 'API_BASE_URL', 'FormatSurvey', function($server, API_BASE_URL, FormatSurvey) {
    var formatPermissions = FormatSurvey.formatPermissions;
    var formatQuestionnaire = FormatSurvey.formatQuestionnaire;
    function formatQuestionnairesModel(res) {

        var results = res.data.SurveyQuestionnaireList || [res.data];

        var questionnaireData = {
            permissions: formatPermissions(res.data.EntityActions),
            pagination: res.data.Pagination,
            items: results.map(function(item) {
                var questionnaireItem = {};
                questionnaireItem = {
                    id: item.SurveyQuestionnaireInfo.QuestionnaireId,
                    name: item.SurveyQuestionnaireInfo.Name,
                    domainInfoUri: item.SurveyQuestionnaireInfo.DomainInfoUri,
                    domainKey: item.SurveyQuestionnaireInfo.DomainKey,
                    domainType: item.SurveyQuestionnaireInfo.DomainType,
                    status: item.SurveyQuestionnaireInfo.Status,
                    networkId: item.SurveyQuestionnaireInfo.NetworkId,
                    memberId: item.SurveyQuestionnaireInfo.MemberId,
                    createdDate: item.SurveyQuestionnaireInfo.CreatedDate,
                    userCan: formatPermissions(item.EntityActions),
                    importFromQuestionnaire: true
                };
                return questionnaireItem;
            })
        };
        res.data = questionnaireData;

        return res;
    }
    function formatQuestionnaireModel(res) {
        var result = res.data.SurveyQuestionnaireInfoForCandidate || {};

        var questionnaireData = {
            permissions: formatPermissions(res.data.EntityActions),
            pagination: res.data.Pagination,
            info: formatQuestionnaire(result)
        };
        res.data = questionnaireData;
        return res;
    }
    var QUESTIONNAIRE_NAMESPACE = API_BASE_URL + 'survey/Questionnaires';
    var Questionnaire = {
        getQuestionnaires: function(page, pageSize, searchTerm) {
            var url = QUESTIONNAIRE_NAMESPACE;
            var query = {
                'searchTerm': searchTerm,
                't': 1,
                's': 1,
                'p': page,
                'ps': pageSize,
                'rc': 1
            };
            return $server.get({
                'url': url,
                'query': query
            }, true).then(formatQuestionnairesModel);
        },
        getById: function(id, domainType, domainKey) {
            var url = QUESTIONNAIRE_NAMESPACE + '/' + id;
            var query = {
                't': domainType,
                'k': domainKey
            };
            return $server.get({
                'url': url,
                'query': query
            }, true).then(formatQuestionnaireModel);
        }
    };
    return Questionnaire;
}])
.factory('ResponseChoice', ['$serverSurvey', 'API_BASE_URL', 'FormatSurvey', function($server, API_BASE_URL, FormatSurvey) {
    var formatPermissions = FormatSurvey.formatPermissions;
    var formatQuestionnaire = FormatSurvey.formatQuestionnaire;
    var ResponseChoice = {
        nev: function(r) {
            var rData = {
                id: null,
                choiceTypeId: 6,
                memberId: null,
                questionId: null,
                maxValue: 1,
                minValue: 1,
                value: '',
                isSelected: false,
                isRightAnswer: null,
                status: 1,
                createdDate: null
            };
            if (!r) {
                return rData;
            }
            return rData;
        }
    };
    return ResponseChoice;
}])
.factory('QuestionTag', ['$serverSurvey', 'API_BASE_URL', 'FormatSurvey', function($server, API_BASE_URL, FormatSurvey) {
    var formatQuestionTag = FormatSurvey.formatQuestionTag;
    var formatPermissions = FormatSurvey.formatPermissions;
    function formatQuestionTagModel(res) {
        var results = res.data.SurveyQuestionTagsInfoItemResult || [res.data];
        var questionTag = {
            permissions: formatPermissions(res.data.EntityActions),
            pagination: res.data.Pagination,
            items: results.map(function(item) {
                return formatQuestionTag(item.SurveyQuestionTagsInfo);
            })
        };
        res.data = questionTag;
        return res;
    }
    var QUESTIONTAG_NAMESPACE = API_BASE_URL + 'survey/QuestionTags';
    var QuestionTag = {
        getQuestionTags: function(page, pageSize) {
            var url = QUESTIONTAG_NAMESPACE;
            var query = {
                'rc': 1,
                'p': page,
                'ps': pageSize
            };
            return $server.get({
                'url': url,
                'query': query
            }).then(formatQuestionTagModel);
        },
        nev: function(r) {
            // Todo
        }
    };
    return QuestionTag;
}])
.factory('CandidateResponses', ['$server', 'API_BASE_URL', '$HTTPCache', 'FormatSurvey', function($server, API_BASE_URL, $HTTPCache, FormatSurvey) {
    var CANDIDATERESPONSES_NAMESPACE = API_BASE_URL + 'survey/Questions/';
    var CandidateResponses = {
        CreateSurveyResponses: function(obj) {

            var url = CANDIDATERESPONSES_NAMESPACE + 'CandidateResponses';

            return $server.create({
                'url': url,
                'data': obj
            }).then(function(res) {

                $HTTPCache.clear([CANDIDATERESPONSES_NAMESPACE, 'CandidateResponses']);

                return res;
            });
        },
        
    };
    return CandidateResponses;
}]);
