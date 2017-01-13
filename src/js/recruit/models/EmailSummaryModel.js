angular.module('ui.recruit.models')

    .factory('EmailSummaryModel', ['EntityActionsMixin', function(EntityActionsMixin) {
        return class EmailSummaryModel {
            constructor(recipients = [], subject = null, body = null, templates = [], entityAction = []) {

                this.recipients = recipients;
                this.subject = subject;
                this.body = body;
                this.templates = templates;

                EntityActionsMixin.$$mixInto(this);
                this.setupEntityActionsFromApi(entityAction);
            }

            toApi() {
                let JobApplicationIds = this.recipients.map((data) => {
                    return data.id;
                });
                return {
                    subject : this.subject,
                    EmailBody : this.body,
                    JobApplicationIds: JobApplicationIds
                };
            }
        };
    }])
    
    .factory('EmailTemplateModel', ['EntityActionsMixin', function(EntityActionsMixin) {
        return class EmailTemplateModel {
            constructor(id = null, title = null, entityAction = []  ) {
                this.Id  = id;
                this.Title = title;

                EntityActionsMixin.$$mixInto(this);
                this.setupEntityActionsFromApi(entityAction);
            }

            /*
             * Create the object from the return payload
             */
            static fromApi(apiModel) {
               if(apiModel.AdvertiserEmailActivitySummaryItemResult ===  undefined) {
                   return [];
               } else {
                   return apiModel.AdvertiserEmailActivitySummaryItemResult.map((model) => {
                       return new EmailTemplateModel(
                           model.AdvertiserEmailActivitySummary.EmailId,
                           model.AdvertiserEmailActivitySummary.InternalTitle,
                           model.EntityActions
                       );
                   });
               }
            }
        };

    }]);