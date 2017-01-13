angular.module('ui.recruit.models')
    .factory('JobApplicantDetailsModel', ['EntityActionsMixin', 'JobApplicationStatusModel', 'ApplicantInformationModel', 'ApplicantContactDetailsModel', 'JobApplicationStatusListModel', 'ApplicantAttachmentModel', 'Url', '$filter', (EntityActionsMixin, JobApplicationStatusModel, ApplicantInformationModel, ApplicantContactDetailsModel, JobApplicationStatusListModel, ApplicantAttachmentModel, Url, $filter) => {
        return class JobApplicantDetailsModel {
            constructor(JobApplicationId, JobId, AppliedDate, JobTitle, JobStatus, JobStatusColor, JobStatusDescription, JobLogo, Attachments, StatusHistory, StatusChangeCount, StatusList, ApplicantInformationModel, ApplicantContactDetailsModel, EntityActions) {
                this.JobApplicationId     = JobApplicationId;
                this.JobId                = JobId;
                this.AppliedDate          = AppliedDate;
                this.JobTitle             = JobTitle;
                this.JobStatus            = JobStatus;
                this.JobStatusColor       = JobStatusColor;
                this.JobStatusDescription = JobStatusDescription;
                this.JobLogo              = JobLogo;
                this.Attachments          = Attachments;
                this.StatusHistory        = StatusHistory;
                this.StatusChangeCount    = StatusChangeCount;
                this.StatusList           = StatusList;
                this.Information          = ApplicantInformationModel;
                this.Contacts             = ApplicantContactDetailsModel;

                this.MobilePhoneContact   = JobApplicantDetailsModel.getMobile(this.Contacts);
                this.HomePhoneContact     = JobApplicantDetailsModel.getHomeNumber(this.Contacts);
                this.EmailContact         = JobApplicantDetailsModel.getEmail(this.Contacts);
                this.Address              = JobApplicantDetailsModel.getAddress(this.Contacts);

                this.EntityActions        = EntityActions;


                //Add the entityactions behaviour
                EntityActionsMixin.$$mixInto(this);

                //Prepare entity actions
                this.setupEntityActionsFromApi(EntityActions);

            }

            static getMobile(contacts) {
                return _.find(contacts, (contact) => contact.Type === 'p' && contact.IsPrimary);
            }

            static getHomeNumber(contacts) {
                return _.find(contacts, (contact) => contact.Type === 'p' && !contact.IsPrimary);
            }

            static getEmail(contacts) {
                return _.find(contacts, (contact) => contact.Type === 'e');
            }

            static getAddress(contacts) {
                return _.find(contacts, (contact) => contact.Type === 'ad');
            }

            get initials() {
                return `${_.first(this.Information.FirstName)}${_.first(this.Information.Surname)}`.toUpperCase();
            }

            get hashedEmail() {
                let hash = 0;

                for (var i = 0; i < this.EmailContact.Email.length; i++) {
                    hash =  this.EmailContact.Email.charCodeAt(i) + ((hash << 5) - hash);
                }

                return hash;
            }

            //Takes api object JobApplicationDetail and returns a populated instance.
            static fromApi(apiModel) {
                let JobLogo = null;
                if (apiModel.JobApplicationDetail.JobPostSummary.JobBoardSummary != null) {
                    JobLogo = apiModel.JobApplicationDetail.JobPostSummary.JobBoardSummary.Logo;
                }
                let prevStatus = null;
                let prevStatusColor = null;
                let StatusSummaries = apiModel.JobApplicationDetail.JobApplicationStatusSummaries;
                if (StatusSummaries.length > 1) {
                    var indexNo = StatusSummaries.length - 2; // The history list includes the current status too so need to get the one before that
                    prevStatus = apiModel.JobApplicationDetail.JobApplicationStatusSummaries[indexNo].ApplicationStatusDescription;
                    prevStatusColor = apiModel.JobApplicationDetail.JobApplicationStatusSummaries[indexNo].ApplicationStatusColor;
                }
                let statusChangeCount = null;
                if (apiModel.JobApplicationDetail.JobApplicationStatusChangedCount) {
                    //Fix to correct the count which for some reason includes the current status therefore the count is one too many.
                    statusChangeCount = apiModel.JobApplicationDetail.JobApplicationStatusChangedCount;
                }
                return new JobApplicantDetailsModel(
                    apiModel.JobApplicationDetail.JobApplicationId,
                    apiModel.JobApplicationDetail.JobPostSummary.JobId,
                    apiModel.JobApplicationDetail.ApplyDate,
                    apiModel.JobApplicationDetail.JobSummary.JobTitle,
                    apiModel.JobApplicationDetail.ApplicationStatus,
                    apiModel.JobApplicationDetail.ApplicationStatusColor,
                    apiModel.JobApplicationDetail.ApplicationStatusDescription,
                    JobLogo,
                    new ApplicantAttachmentModel(apiModel.JobApplicationDetail.ApplicationAttachments.ResumeDocumentId,
                        apiModel.JobApplicationDetail.ApplicationAttachments.ResumeFile,
                        apiModel.JobApplicationDetail.ApplicationAttachments.CoverLetterDocumentId,
                        apiModel.JobApplicationDetail.ApplicationAttachments.CoverLetterFile),
                    new JobApplicationStatusModel(apiModel.JobApplicationDetail.ApplicationStatusDescription, apiModel.JobApplicationDetail.ApplicationStatusColor, prevStatus, prevStatusColor),
                    statusChangeCount,
                    apiModel.JobApplicationDetail.JobApplicationStatuses,
                    ApplicantInformationModel.fromApi(apiModel.JobApplicationDetail.ApplicantInformation),
                    apiModel.JobApplicationDetail.ApplicantContacts.map( (contact) => {return ApplicantContactDetailsModel.fromApi(contact);}),
                    apiModel.EntityActions
                );
            }
            updateStatusToApi(newStatus) {
                return {
                    JobApplicationIds: [ this.JobApplicationId ],
                    JobApplicationStatusDetail: {
                        Status: newStatus,
                        Notes: "",
                        RejectReason: ""
                    }

                };
            }

            toApi() {
                let parsedBirthday = null;

                if (this.Information.Birthday) {
                    parsedBirthday = $filter('localTimestamp')(this.Information.Birthday);
                }

                //Hack check because we aren't immediately returning a homephone object which causes this to break
                let applicantContacts = [
                    {
                        "Type": "e",
                        "IsPrimary": true,
                        "IsPrivate": true,
                        "Email": Url.stripHtml(this.EmailContact.Email)
                    },
                    {
                        "Type": "p",
                        "IsPrimary": true,
                        "IsPrivate": true,
                        "Phone": this.MobilePhoneContact.MobilePhone
                    },
                    {
                        "Type": "p",
                        "IsPrimary": false,
                        "IsPrivate": true,
                        "Phone": this.HomePhoneContact === undefined ? null : this.HomePhoneContact.MobilePhone
                    },
                    {
                        "Type": "ad",
                        "IsPrimary": false,
                        "IsPrivate": false,
                        "Address": Url.stripHtml(this.Address.Address),
                        "City": "",
                        "Suburb": Url.stripHtml(this.Address.Suburb),
                        "Postcode": this.Address.Postcode,
                        "StateName": Url.stripHtml(this.Address.StateName),
                        "CountryId": this.Address.CountryId
                    }
                ];

                if (!this.HomePhoneContact || this.HomePhoneContact === undefined) {
                    applicantContacts.splice(2, 1);
                }

                return {
                    ApplicantInformation: {
                        "FirstName": this.Information.FirstName,
                        "SurName": this.Information.Surname,
                        "BirthDay": parsedBirthday
                    },
                    ApplicantContacts: applicantContacts
                };
            }
        };

    }]);