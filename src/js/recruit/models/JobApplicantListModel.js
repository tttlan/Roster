angular.module('ui.recruit.models')
    .factory('ApplicantItemModel', ['Permissions', 'JobApplicationStatusModel', 'ApplicantAttachmentModel', 'EntityActionsMixin', (Permissions, JobApplicationStatusModel, ApplicantAttachmentModel, EntityActionsMixin) => {
            return class ApplicantItemModel {
                constructor(id,
                            firstname,
                            surname,
                            email,
                            memberId,
                            status,
                            applicationStatusChangeCount,
                            applyDate,
                            notes,
                            attachments,
                            entityActions
                ) {
                    this.id                             = id;
                    this.firstname                      = firstname;
                    this.surname                        = surname;
                    this.email                          = email;
                    this.memberId                       = memberId;
                    this.status                         = status;
                    this.applicationStatusChangeCount   = applicationStatusChangeCount;
                    this.applyDate                      = applyDate;
                    this.notes                          = notes;
                    this.attachments                    = attachments;

                    //Add the entity actions behaviour
                    EntityActionsMixin.$$mixInto(this);

                    //Prepare entity actions
                    this.setupEntityActionsFromApi(entityActions);
                }

                /*
                * Create the object from the return payload
                */
                static fromApi(applicant) {
                    let prevStatus = null;
                    let prevStatusColor = null;
                    if (applicant.JobApplicationSummary.JobApplicationStatusHistories.length > 1) {// checks to see if the status has been changed at least one. Not sure if this is correct as sample data does not provide an accurate indication if the initial status of new is stored in history or not
                        prevStatus = applicant.JobApplicationSummary.JobApplicationStatusHistories[applicant.JobApplicationSummary.JobApplicationStatusHistories.length - 2].ApplicationStatusDescription;
                        prevStatusColor = applicant.JobApplicationSummary.JobApplicationStatusHistories[applicant.JobApplicationSummary.JobApplicationStatusHistories.length - 2].ApplicationStatusColor;
                    }

                    let email = '';

                    applicant.JobApplicationSummary.ApplicantContacts.map((contact) => {
                        if(contact.Type === 'e') {
                            email = contact.Email;
                        }
                    });

                    return new ApplicantItemModel(applicant.JobApplicationSummary.JobApplicationId,
                        applicant.JobApplicationSummary.ApplicantInformation.FirstName,
                        applicant.JobApplicationSummary.ApplicantInformation.Surname,
                        email,
                        applicant.JobApplicationSummary.ApplicantInformation.MemberId,
                        new JobApplicationStatusModel(applicant.JobApplicationSummary.ApplicationStatusDescription,
                            applicant.JobApplicationSummary.ApplicationStatusColor,
                            prevStatus,
                            prevStatusColor),
                        applicant.JobApplicationSummary.JobApplicationStatusChangedCount,
                        applicant.JobApplicationSummary.ApplyDate,
                        applicant.JobApplicationSummary.CommentCount,
                        new ApplicantAttachmentModel(applicant.JobApplicationSummary.ApplicationAttachments.ResumeDocumentId,
                            applicant.JobApplicationSummary.ApplicationAttachments.ResumeFile,
                            applicant.JobApplicationSummary.ApplicationAttachments.CoverLetterDocumentId,
                            applicant.JobApplicationSummary.ApplicationAttachments.CoverLetterFile),
                        applicant.EntityActions
                    );
                }

                get fullName() {
                    return this.firstname + ' ' + this.surname;
                }

                get initials() {
                    return `${_.first(this.firstname)}${_.first(this.surname)}`.toUpperCase();
                }

                static isSame(a, b) {
                    return a.id === b.id;
                }

                get hashedEmail() {
                    let hash = 0;

                    for (var i = 0; i < this.email.length; i++) {
                        hash =  this.email.charCodeAt(i) + ((hash << 5) - hash);
                    }

                    return hash;
                }
            };
        }])
        .factory('JobApplicationListModel', ['ApplicantItemModel', 'EntityActionsMixin', function(ApplicantItemModel, EntityActionsMixin) {
            return class JobApplicationListModel {
                constructor(listData, entityActions = []) {
                    this.data = listData;

                    //Add the entityactions behaviour
                    EntityActionsMixin.$$mixInto(this);

                    //Prepare entity actions
                    this.setupEntityActionsFromApi(entityActions);
                }

                /*
                * Create the object from the return payload
                */
                static fromApi(applicantData) {
                    return new JobApplicationListModel(
                        applicantData.JobApplicationSummaryItemResult.map((model) => ApplicantItemModel.fromApi(model)),
                        applicantData.EntityActions
                    );
                }
            };
        }]);