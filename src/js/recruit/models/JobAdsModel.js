angular.module('ui.recruit.models')
.factory('JobAdsModel', ['JobStatusConstants', 'EntityActionsMixin', '$log', (JobStatusConstants, EntityActionsMixin, $log) => {
        function getStatusPriority(status){
            switch (status) {
                case JobStatusConstants.JOB_STATUS_DRAFT:
                    return 0;
                    break;

                case JobStatusConstants.JOB_STATUS_PUBLISHED:
                    return 1;
                    break;

                case JobStatusConstants.JOB_STATUS_ACTIVE:
                    return 2;
                    break;

                case JobStatusConstants.JOB_STATUS_CLOSED:
                    return 3;
                    break;
            }
        }

    return class JobAdsModel {
        constructor(id = null, title = null, location = null, elapse = 0, applicantsActive = 0, totalApplicants = 0, status = null, statusCode = null, statusDate = moment(), EntityActions = null) {
            this.id               = id;
            this.title            = title !== null ? title.trim() : null;
            this.location         = location !== null ? location.trim() : null;
            this.elapse           = elapse;
            this.applicantsActive = applicantsActive;
            this.totalApplicants  = totalApplicants;
            this.status           = status;
            this.statusCode       = statusCode;
            this.statusDate       = statusDate;
            this.statusPriority   = getStatusPriority(statusCode.statusTitle);
            //Add the entityactions behaviour
            EntityActionsMixin.$$mixInto(this);

            //Prepare entity actions
            this.setupEntityActionsFromApi(EntityActions);
        }

        /*
         * Create the object from the return payload
         */
        static fromApi(apiModel, EntityActions) {
            return new JobAdsModel(
                apiModel.JobId,
                apiModel.JobTitle,
                apiModel.Location,
                apiModel.Elapse,
                apiModel.ActiveApplicationCount,
                apiModel.ApplicationCount,
                apiModel.JobStatusCode,
                JobAdsModel.determineStatus(apiModel.JobStatusCode),
                apiModel.StatusDate,
                EntityActions
            );
        }

        /*
         * Prepare the JSON payload to send to the API
         */
        toApi() {
        }

        /*
         * Determine the status title and its styles
         */
        static determineStatus(statusCode) {
            switch(statusCode) {
                 case JobStatusConstants.JOB_STATUS_ACTIVE:
                     return {
                        statusTitle : 'ACTIVE',
                        statusStyle : 'label--caution'
                     };
                 case JobStatusConstants.JOB_STATUS_PUBLISHED:
                     return {
                         statusTitle : 'PUBLISHED',
                         statusStyle : 'label--positive'
                     };
                 case JobStatusConstants.JOB_STATUS_DRAFT:
                     return {
                         statusTitle : 'DRAFT',
                         statusStyle : 'label--dark'
                     };
                 case JobStatusConstants.JOB_STATUS_CLOSED:
                     return {
                         statusTitle : 'CLOSED',
                         statusStyle : 'label--negative'
                     };
                 default:
                    'Status code $(statusCode) does not exist';
            }
            return status;
        }
    };
}])

.factory('JobAdsItemsModel', ['JobAdsModel', 'EntityActionsMixin', (JobAdsModel, EntityActionsMixin) => {

    return class JobAdsItemsModel {
        constructor(data, EntityActions) {
            this.data = data;

            EntityActionsMixin.$$mixInto(this);
            this.setupEntityActionsFromApi(EntityActions);
        }

        static fromApi(apiModel) {
            if (!apiModel.JobSummaryItems) {
                throw new Error("Cannot generate JobAdsItemsModel, api data is missing JobSummaryItems property");
            }

            return new JobAdsItemsModel(apiModel.JobSummaryItems.map((model) => {
                    return JobAdsModel.fromApi(model.JobSummary, model.EntityActions);
                }), apiModel.EntityActions);
        }
    };
}]);