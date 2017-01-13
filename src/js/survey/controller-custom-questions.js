angular.module('ui.survey')
    .controller('customquestionsPickerCtrl', [
        '$scope', '$modalInstance', 'question',
        function($scope, $modalInstance, question) {

            Array.indexOfObject = function(parentProp, childProp, value) {
                if (!childProp) {
                    return this.map(function(e) { return e[parentProp]; }).indexOf(value);
                }
                return this.map(function(e) { return e[parentProp][childProp]; }).indexOf(value);
            };

            $scope.question = question;
            angular.forEach($scope.question.ResponseChoices, function(item, key) {
                //this.push(key + ': ' + value);
                switch (item.ResponseChoiceTypeId) {
                   case 1:
                       item.ResponseChoiceType = {
                           responseChoiceType: 1,
                           label: 'Text'
                       };
                       break;
                   case 6:
                       item.ResponseChoiceType = {
                           responseChoiceType: 6,
                           label: 'Date'
                       };
                       break;
                   case 10:
                       item.ResponseChoiceType = {
                           responseChoiceType: 10,
                           label: 'Document'
                       };
                       break;
                   case 2:
                       item.ResponseChoiceType = {
                           responseChoiceType: 2,
                           label: 'Required TextBox'
                       };
                       break;
               }
            });

            $scope.storedResponse = {};
            $scope.types = [
                {
                    responseChoiceType: 1,
                    label: 'Text'
                },
                {
                    responseChoiceType: 6,
                    label: 'Date'
                },
                {
                    responseChoiceType: 10,
                    label: 'Document'
                },
                {
                    responseChoiceType: 2,
                    label: 'Required TextBox'
                }
            ];

            if (question.addNew && !question.id) {
                //question.QuestionTypeId = 1;
                question.YesNoAutoReject = null;
                switch (question.typeOfQuestion) {
                case 1:
                    {
                        question.QuestionTypeId = 1;
                        question.ResponseChoices = [
                            {
                                'ResponseChoiceTypeId': 2,
                                'ChoiceValue': null,
                            }
                        ];
                    }
                    break;
                case 2:
                    {
                        question.QuestionTypeId = 2;
                        question.ResponseChoices = [
                            {
                                'ResponseChoiceTypeId': 1,
                                'ChoiceValue': 'yes',
                            },
                            {
                                'ResponseChoiceTypeId': 1,
                                'ChoiceValue': 'no',
                            }
                        ];
                    }
                    break;

                case 3:
                    {
                        question.QuestionTypeId = 3;
                    }
                    break;

                case 4:
                    {
                        question.QuestionTypeId = 4;
                    }
                    break;

                case 5:
                    {
                        question.QuestionTypeId = 5;

                        question.ResponseChoices = [
                            {
                                'ResponseChoiceTypeId': 6,
                                'ChoiceValue': null,
                            }
                        ];
                    }
                    break;

                case 6:
                    {
                        question.QuestionTypeId = 6;

                        question.ResponseChoices = [
                            {
                                'ResponseChoiceTypeId': 10,
                                'ChoiceValue': null,
                            }
                        ];
                    }
                    break;
                }
            }

            $scope.addNewResponseChoice = function() {
                var responseChoice = {
                    'ResponseChoiceTypeId': 1,
                    'ChoiceMaxValue': null,
                    'ChoiceMinValue': null,
                    'ChoiceValue': null,
                    'IsDefaultSelected': null,
                    'IsRightAnswer': null,
                    'Status': 1
                };

                if (!$scope.question.ResponseChoices) {
                    $scope.question.ResponseChoices = [];
                }
                $scope.question.ResponseChoices.push(responseChoice);
            };

            $scope.question = question;

            // Check validate index for mobile case
            function checkValidateIndex(index, responses) {
                if (index && responses && responses.length >= index) {
                    var temp = responses[index];
                    if (temp && temp.ResponseChoiceTypeId && temp.ResponseChoiceTypeId === 1) {
                        return true;
                    }
                }
                return false;
            }

            function setRightAnswer(index, responses) {
                for (var i = 0; i < responses.length; i++) {
                    var item = responses[i];
                    if (item) {
                        if (i !== index) {
                            item.IsRightAnswer = null;
                        } else {
                            item.IsRightAnswer = true;
                        }
                    }
                }
            }

            function setDefaultAnswer(index, responses) {
                for (var i = 0; i < responses.length; i++) {
                    var item = responses[i];
                    if (item) {
                        if (i !== index) {
                            item.IsDefaultSelected = null;
                        } else {
                            item.IsDefaultSelected = true;
                        }
                    }
                }
            }

            $scope.ok = function(isValid, question) {
                if (isValid) {
                    question.TagId = null;

                    if (question.typeOfQuestion === 2 && question.QuestionOption && question.QuestionOption.QuestionContent !== '') {
                        question.QuestionOption.ResponseChoice = {
                            ResponseChoiceTypeId: 1,
                            Status: 1
                        };
                        //question.QuestionOption.ResponseChoice.ResponseChoiceTypeId = 1;
                    }

                    // After check validate for index and the response in question.ResponseChoices, 
                    // set IsRightAnswer for this response
                    if (checkValidateIndex($scope.storedResponse.multiChoiceAnswerIndex, question.ResponseChoices)) {
                        var answerIndex = $scope.storedResponse.multiChoiceAnswerIndex;
                        setRightAnswer(answerIndex, question.ResponseChoices);
                    }

                    // 
                    if (checkValidateIndex($scope.storedResponse.singleChoiceSelectedIndex, question.ResponseChoices)) {
                        var selectedIndex = $scope.storedResponse.singleChoiceSelectedIndex;
                        setDefaultAnswer(selectedIndex, question.ResponseChoices);
                    }

                    //  
                    if (checkValidateIndex($scope.storedResponse.singleChoiceAnswerIndex, question.ResponseChoices)) {
                        var singleAnswerIndex = $scope.storedResponse.singleChoiceAnswerIndex;
                        setRightAnswer(singleAnswerIndex, question.ResponseChoices);
                    }

                    $modalInstance.close({
                        question: question,
                    });
                }

            };

            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };
        }
    ]);



