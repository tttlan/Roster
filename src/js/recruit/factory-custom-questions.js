//TODO: this CustomQuestions is base on the data from the old api, it may be change when we have the new api
angular.module('ui.services')

    .factory('CustomQuestions',['$q', '$server', 'API_BASE_URL', '$HTTPCache', 
        function($q, $server, API_BASE_URL, $HTTPCache) {
            let QUESTIONNAIRE_TEMPLATE_NAMESPACE = 'recruitments/Questions';

        function formatResponseChoice(items) {
            if (!items) {
                return [];
            }
            return items.map(function(item) {
                var choiceData = {};
                choiceData.id = item.NetworkJobBoardQuestionOptionId;
                choiceData.value = item.OptionText;
                return choiceData;
            });
         }
       
        function formatQuestion(item) {
            var questionItem = {};
            if (!item) {
                return questionItem;
            }
            questionItem = {
                id: item.NetworkJobBoardQuestionId,
                questionType: item.Type,
                content: item.Question,
                isMandatory: item.Manditory,
                hasMultilineSupport: item.TextAsMultiLine,
                autoRejectCandidates: item.AutoRejectCandidates,
                displayOptionalOnYesno: item.DisplayOptionalOnYesNo,
                yesNoAutoReject: item.YesNoAutoReject,
                filter: item.Filter,
                filterText: item.FilterText,
                networkId: item.NetworkId,
                responseChoices: formatResponseChoice(item.NetworkJobBoardQuestionOptions),
                displayStack: item.DisplayStack
            };
            return questionItem;
         }
         
         function formatCustomQuestionTemplate(item) {
            var customQuestionTemplate = {};
            if (!item.CustomQuestionTemplateSummary) {
                return customQuestionTemplate;
            }
            customQuestionTemplate = {
                id: item.CustomQuestionTemplateSummary.TemplateId,
                templateTitle: item.CustomQuestionTemplateSummary.TemplateTitle
            };
            return customQuestionTemplate;
         }
       
        let factory = {
            //Get questionnaire detail
            getQuestionnaireTemplateById(question,isPhoneQuestions) {
                let url = API_BASE_URL + QUESTIONNAIRE_TEMPLATE_NAMESPACE;
            /*    return $q.resolve({
                    data: {
                        Items:  getFakeQuestionnaireTemplateById().Questions.map(function(res) {
                            return formatQuestion(res);
                        })
                    }
                });*/
                return $server.create({
                    url: url,
                    data:[
                        question.id
                    ]
                }).then(function(response) {
                    $HTTPCache.clear(url);
                    if(response.data) {
                        let data =[];
                        data = response.data.map(function(res) {
                            return formatQuestion(res);
                        });
                        response.data.items = data;
                    }
                    return response;
                });

            },
            //Search Questionnaire template
            searchQuestionnaireTemplate(searchString,type,isPhoneQuestions) {
                let url = API_BASE_URL +'recruitments/QuestionTemplates/Search';
                //let url = API_BASE_URL +'recruitments/QuestionTemplates';//(issues in BE wrong naming API)
             /*   return $q.resolve({
                    data: {
                        Items:  searchFakeQuestionnaireTemplate().CustomQuestionTemplateSummaryItems.map(function(res) {
                            return formatCustomQuestionTemplate(res);
                        })
                    }
                });*/
                return $server.get({
                    url: url,
                    query: {
                        's': searchString,
                        't':type,// for member type
                        'p':isPhoneQuestions // Is phone screen
                    }
                }).then(function(response) {
                    $HTTPCache.clear(url);
                    if(response.data && response.data.CustomQuestionTemplateSummaryItems && response.data.CustomQuestionTemplateSummaryItems.length) {
                        let data =[];
                        data = response.data.CustomQuestionTemplateSummaryItems.map(function(res) {
                            return formatCustomQuestionTemplate(res);
                        });
                        response.data.items = data;
                    }
                    return response;
                });

            },            
            
            formatQuestion: formatQuestion
            
        };
        
        function getFakeQuestionnaireTemplateById() {
            return {
                Questions: [
                    {
                        "$id": "1",
                        "NetworkJobBoardQuestionId": 4549,
                        "NetworkId": 957,
                        "Question": "text question",
                        "Type": "Text",
                        "Manditory": false,
                        "ValidationMessage": null,
                        "SubSection": null,
                        "Filter": false,
                        "FilterText": "Filter Text",
                        "TemplateId": 595,
                        "AutoRejectCandidates": false,
                        "YesNoAutoReject": "n",
                        "Deleted": false,
                        "ParentQuestionId": null,
                        "FieldName": "",
                        "DisplayStack": false,
                        "Position": 0,
                        "MultichoiceAsList": false,
                        "TextAsMultiLine": true,
                        "SubTemplateId": null,
                        "DisplayOptionalOnYesNo": "y",
                        "IncludeIntoReport": false,
                        "NetworkJobBoardQuestionOptions": []
                    },
                    {
                        "$id": "2",
                        "NetworkJobBoardQuestionId": 4550,
                        "NetworkId": 957,
                        "Question": "yes no ",
                        "Type": "YesNo",
                        "Manditory": false,
                        "ValidationMessage": null,
                        "SubSection": null,
                        "Filter": false,
                        "FilterText": "Filter Text",
                        "TemplateId": 595,
                        "AutoRejectCandidates": false,
                        "YesNoAutoReject": "n",
                        "Deleted": false,
                        "ParentQuestionId": null,
                        "FieldName": "",
                        "DisplayStack": false,
                        "Position": 1,
                        "MultichoiceAsList": false,
                        "TextAsMultiLine": true,
                        "SubTemplateId": null,
                        "DisplayOptionalOnYesNo": "y",
                        "IncludeIntoReport": false,
                        "NetworkJobBoardQuestionOptions": []
                    },
                    {
                        "$id": "3",
                        "NetworkJobBoardQuestionId": 4551,
                        "NetworkId": 957,
                        "Question": "Multi-Choice List",
                        "Type": "TickBox",
                        "Manditory": false,
                        "ValidationMessage": null,
                        "SubSection": null,
                        "Filter": false,
                        "FilterText": "Filter Text",
                        "TemplateId": 595,
                        "AutoRejectCandidates": false,
                        "YesNoAutoReject": "n",
                        "Deleted": false,
                        "ParentQuestionId": null,
                        "FieldName": "",
                        "DisplayStack": false,
                        "Position": 2,
                        "MultichoiceAsList": false,
                        "TextAsMultiLine": true,
                        "SubTemplateId": null,
                        "DisplayOptionalOnYesNo": "y",
                        "IncludeIntoReport": false,
                        "NetworkJobBoardQuestionOptions": [
                        {
                            "$id": "4",
                            "NetworkJobBoardQuestionOptionId": 74186,
                            "OptionText": "a",
                            "Score": 0
                        },
                        {
                            "$id": "5",
                            "NetworkJobBoardQuestionOptionId": 74187,
                            "OptionText": "b",
                            "Score": 0
                        },
                        {
                            "$id": "6",
                            "NetworkJobBoardQuestionOptionId": 74188,
                            "OptionText": "c",
                            "Score": 0
                        }
                        ]
                    },
                    {
                        "$id": "7",
                        "NetworkJobBoardQuestionId": 4552,
                        "NetworkId": 957,
                        "Question": "Single-Choice List\n ",
                        "Type": "Radio",
                        "Manditory": false,
                        "ValidationMessage": null,
                        "SubSection": null,
                        "Filter": false,
                        "FilterText": "Filter Text",
                        "TemplateId": 595,
                        "AutoRejectCandidates": false,
                        "YesNoAutoReject": "n",
                        "Deleted": false,
                        "ParentQuestionId": null,
                        "FieldName": "",
                        "DisplayStack": false,
                        "Position": 3,
                        "MultichoiceAsList": false,
                        "TextAsMultiLine": true,
                        "SubTemplateId": null,
                        "DisplayOptionalOnYesNo": "y",
                        "IncludeIntoReport": false,
                        "NetworkJobBoardQuestionOptions": [
                        {
                            "$id": "8",
                            "NetworkJobBoardQuestionOptionId": 74189,
                            "OptionText": "a",
                            "Score": 0
                        },
                        {
                            "$id": "9",
                            "NetworkJobBoardQuestionOptionId": 74190,
                            "OptionText": "b",
                            "Score": 0
                        },
                        {
                            "$id": "10",
                            "NetworkJobBoardQuestionOptionId": 74191,
                            "OptionText": "c",
                            "Score": 0
                        }
                        ]
                    },
                    {
                        "$id": "11",
                        "NetworkJobBoardQuestionId": 4553,
                        "NetworkId": 957,
                        "Question": "Date",
                        "Type": "Date",
                        "Manditory": false,
                        "ValidationMessage": null,
                        "SubSection": null,
                        "Filter": false,
                        "FilterText": "Filter Text",
                        "TemplateId": 595,
                        "AutoRejectCandidates": false,
                        "YesNoAutoReject": "n",
                        "Deleted": false,
                        "ParentQuestionId": null,
                        "FieldName": "",
                        "DisplayStack": false,
                        "Position": 4,
                        "MultichoiceAsList": false,
                        "TextAsMultiLine": true,
                        "SubTemplateId": null,
                        "DisplayOptionalOnYesNo": "y",
                        "IncludeIntoReport": false,
                        "NetworkJobBoardQuestionOptions": []
                    },
                    {
                        "$id": "12",
                        "NetworkJobBoardQuestionId": 4554,
                        "NetworkId": 957,
                        "Question": "Document",
                        "Type": "Document",
                        "Manditory": false,
                        "ValidationMessage": null,
                        "SubSection": null,
                        "Filter": false,
                        "FilterText": "Filter Text",
                        "TemplateId": 595,
                        "AutoRejectCandidates": false,
                        "YesNoAutoReject": "n",
                        "Deleted": false,
                        "ParentQuestionId": null,
                        "FieldName": "",
                        "DisplayStack": false,
                        "Position": 5,
                        "MultichoiceAsList": false,
                        "TextAsMultiLine": true,
                        "SubTemplateId": null,
                        "DisplayOptionalOnYesNo": "y",
                        "IncludeIntoReport": false,
                        "NetworkJobBoardQuestionOptions": []
                    } 
                ]
            };
        }
        
        function searchFakeQuestionnaireTemplate() {
            return {
                CustomQuestionTemplateSummaryItems: [
                    {
                    "$id": "2",
                    "CustomQuestionTemplateSummary": {
                        "$id": "3",
                        "TemplateId": 172,
                        "TemplateTitle": "Working Rights"
                    },
                    "EntityActions": [],
                    "Status": 0
                    },
                    {
                    "$id": "4",
                    "CustomQuestionTemplateSummary": {
                        "$id": "5",
                        "TemplateId": 173,
                        "TemplateTitle": "RSA Certificate"
                    },
                    "EntityActions": [],
                    "Status": 0
                    },
                    {
                    "$id": "6",
                    "CustomQuestionTemplateSummary": {
                        "$id": "7",
                        "TemplateId": 192,
                        "TemplateTitle": "Business Manager/Assistant Business Manager"
                    },
                    "EntityActions": [],
                    "Status": 0
                    },
                    {
                    "$id": "8",
                    "CustomQuestionTemplateSummary": {
                        "$id": "9",
                        "TemplateId": 193,
                        "TemplateTitle": "Team Member / Team Leader - VIC"
                    },
                    "EntityActions": [],
                    "Status": 0
                    },
                    {
                    "$id": "10",
                    "CustomQuestionTemplateSummary": {
                        "$id": "11",
                        "TemplateId": 195,
                        "TemplateTitle": "AVAILABILITY - old form"
                    },
                    "EntityActions": [],
                    "Status": 0
                    },
                    {
                    "$id": "12",
                    "CustomQuestionTemplateSummary": {
                        "$id": "13",
                        "TemplateId": 196,
                        "TemplateTitle": "DO NOT USE"
                    },
                    "EntityActions": [],
                    "Status": 0
                    },
                    {
                    "$id": "14",
                    "CustomQuestionTemplateSummary": {
                        "$id": "15",
                        "TemplateId": 199,
                        "TemplateTitle": "SWAT APPLICATION FORM "
                    },
                    "EntityActions": [],
                    "Status": 0
                    },
                    {
                    "$id": "16",
                    "CustomQuestionTemplateSummary": {
                        "$id": "17",
                        "TemplateId": 220,
                        "TemplateTitle": "New question template"
                    },
                    "EntityActions": [],
                    "Status": 0
                    },
                    {
                    "$id": "18",
                    "CustomQuestionTemplateSummary": {
                        "$id": "19",
                        "TemplateId": 270,
                        "TemplateTitle": "Video"
                    },
                    "EntityActions": [],
                    "Status": 0
                    },
                    {
                    "$id": "20",
                    "CustomQuestionTemplateSummary": {
                        "$id": "21",
                        "TemplateId": 594,
                        "TemplateTitle": "New question template - trong test"
                    },
                    "EntityActions": [],
                    "Status": 0
                    },
                    {
                    "$id": "22",
                    "CustomQuestionTemplateSummary": {
                        "$id": "23",
                        "TemplateId": 595,
                        "TemplateTitle": "trong"
                    },
                    "EntityActions": [],
                    "Status": 0
                    }
                ]
            };
        }
        return factory;
}]);