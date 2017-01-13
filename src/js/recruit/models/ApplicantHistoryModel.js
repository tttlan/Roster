angular.module('ui.recruit.models')

.factory('ApplicantHistoryItemModel', ['EntityActionsMixin', 'JobApplicationStatusModel', (EntityActionsMixin, JobApplicationStatusModel) => {
    return class ApplicantHistoryItemModel {
        constructor(jobId = null, jobTitle = null, jobStatusCode = null, jobLocation = null, jobTypeId = null, jobApplicationId = null, applicationStatus = null, applicationStatusName = null, applicationStatusColor = null, applyDate = null, applicationStatusChangeCount =null, entityAction = [] ) {
            this.jobId = jobId;
            this.jobTitle = jobTitle;
            this.jobStatuscode = jobStatusCode;
            this.jobLocation = jobLocation;
            this.jobTypeId = jobTypeId;
            this.jobApplicationId = jobApplicationId;
            this.applicationStatus = applicationStatus;
            this.applicationStatusName = new JobApplicationStatusModel(applicationStatusName, applicationStatusColor, null, null);
            this.applyDate = applyDate;
            this.applicationStatusChangeCount = applicationStatusChangeCount;
            this.entityAction = entityAction;
            //Add the entityactions behaviour
            EntityActionsMixin.$$mixInto(this);
            //Prepare entity actions
            this.setupEntityActionsFromApi(entityAction);
        }

        /*
         * Create the object from the return payload
        */
        static fromApi(history) {
            return new ApplicantHistoryItemModel(
                history.JobApplicationSummary.JobSummary.JobId,
                history.JobApplicationSummary.JobSummary.JobTitle,
                history.JobApplicationSummary.JobSummary.JobStatusCode,
                history.JobApplicationSummary.JobSummary.JobLocation,
                history.JobApplicationSummary.JobSummary.JobTypeId,
                history.JobApplicationSummary.JobApplicationId,
                history.JobApplicationSummary.ApplicationStatus,
                history.JobApplicationSummary.ApplicationStatusDescription,
                history.JobApplicationSummary.ApplicationStatusColor,
                history.JobApplicationSummary.ApplyDate,
                history.JobApplicationSummary.JobApplicationStatusChangedCount,
                history.EntityActions
            );
        }
    };
}])

.factory('ApplicantHistoryModel', ['ApplicantHistoryItemModel', 'EntityActionsMixin', (ApplicantHistoryItemModel, EntityActionsMixin) => {
    return class ApplicantHistoryModel {
        constructor(appliedJobApplications = null, avatarMiniLink = null, firstName = null, surname = null, email = null, entityActions = [] ) {
            this.appliedJobApplications     = appliedJobApplications;
            this.avatarMiniLink             = avatarMiniLink;
            this.firstName                  = firstName;
            this.surname                    = surname;
            this.email                      = email;
            //Add the entityactions behaviour
            EntityActionsMixin.$$mixInto(this);
            //Prepare entity actions
            this.setupEntityActionsFromApi(entityActions);
        }

        /*
         * Create the object from the return payload
        */
        static fromApi(candidateApplicationHistory) {
            let response = new ApplicantHistoryModel(
                candidateApplicationHistory.AppliedJobApplications.JobApplicationSummaryItemResult.map(history => {
                   return ApplicantHistoryItemModel.fromApi(history);
                }),
                candidateApplicationHistory.CandidateInformation.PhotoThumbMini,
                candidateApplicationHistory.CandidateInformation.FirstName,
                candidateApplicationHistory.CandidateInformation.Surname,
                candidateApplicationHistory.CandidateContact.Email,
                candidateApplicationHistory.AppliedJobApplications.EntityActions
            );
            return response;
        }

        get initials() {
            return `${_.first(this.firstName)}${_.first(this.surname)}`.toUpperCase();
        }

        get hashedEmail() {
            let hash = 0;

            for (var i = 0; i < this.email.length; i++) {
                hash =  this.email.charCodeAt(i) + ((hash << 5) - hash);
            }

            return hash;
        }
    };
}]);