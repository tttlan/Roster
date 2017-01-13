angular.module('ui.recruit.models')
    
    .factory('JobAdsQuestionnaireModel', ['CustomQuestions', (CustomQuestions) => {
        return class JobAdsQuestionnaireModel  {
            constructor(selectedCustomQuestions = [], selectedPhoneQuestions = [] ) {
                this.selectedCustomQuestions = selectedCustomQuestions; 
                this.selectedPhoneQuestions = selectedPhoneQuestions; 
            }

            /*
             * Create the object from the return job ads details
             */
            static fromApi(customQuestionTemplateDetails) {
                let selectedCustomQuestions = [], selectedPhoneQuestions = [];
                if (customQuestionTemplateDetails) {
                    customQuestionTemplateDetails.map(function(template) {
                        let customQuestion = {
                            id : template.TemplateId,
                            templateTitle: template.TemplateTitle,
                            questions: template.NetworkJobBoardQuestions.map(function(res) {
                                return CustomQuestions.formatQuestion(res);
                            })
                        };
                        template.IsPhoneScreen ? selectedPhoneQuestions.push(customQuestion) : selectedCustomQuestions.push(customQuestion);
                        
                    });   
                }                
                return new JobAdsQuestionnaireModel(selectedCustomQuestions, selectedPhoneQuestions);
            }

            /*
             * Prepare the JSON job ads details to send to the API
             */
            static toApi(selectedCustomQuestions, selectedPhoneQuestions) {
                let response = [];
                _.each(selectedCustomQuestions, ((question) => {
                            response.push(question.id);
                        }
                    )
                );
                _.each(selectedPhoneQuestions, ((phoneQuestion) => {
                            response.push(phoneQuestion.id);
                        }
                    )
                );
                return response;
            }
        };
    }]);
