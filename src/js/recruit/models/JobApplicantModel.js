angular.module('ui.recruit.models')
    .factory('JobApplicantModel', ['Url', (Url) => {
        return class JobApplicantModel {
            constructor(firstname, surname, email, mobile, landline, countryId, address, suburb, resumeId, jobId) {
                this.firstname  = firstname;
                this.surname    = surname;
                this.email      = email;
                this.mobile     = mobile;
                this.landline   = landline;
                this.countryId  = countryId;
                this.address    = address;
                this.suburb     = suburb;
                this.resumeId   = resumeId;
                this.jobId      = jobId;
            }

            // Add's the resume id
            set setResumeId(id)  {
                this.resumeId = id;
            }

            // Add's the job id
            set setJobId(id)  {
                this.jobId = id;
            }

            /*
            * Create the object for the payload post
            */
            toApi() {
               let applicantContacts = [
                    {
                        "Type": "e",
                        "IsPrimary": true,
                        "IsPrivate": true,
                        "Email": Url.stripHtml(this.email)
                    },
                    {
                        "Type": "p",
                        "IsPrimary": true,
                        "IsPrivate": true,
                        "Phone": this.mobile
                    },
                    {
                        "Type": "p",
                        "IsPrimary": false,
                        "IsPrivate": true,
                        "Phone": this.landline
                    },
                    {
                        "Type": "ad",
                        "IsPrimary": false,
                        "IsPrivate": false,
                        "Address": Url.stripHtml(this.address),
                        "City": "",
                        "Suburb": Url.stripHtml(this.suburb),
                        "CountryId": this.countryId
                    }
                ];

                if(!this.landline) {
                    applicantContacts.splice(2, 1);
                }

                return {
                    "JobId": this.jobId,
                    "ResumeFileStorageId": this.resumeId,
                    "ApplicantInformation": {
                        "FirstName": Url.stripHtml(this.firstname),
                        "SurName": Url.stripHtml(this.surname),
                        "BirthDay": null,
                        "Sex": null,
                        "Salutation": null
                    },
                    "ApplicantContacts": applicantContacts
                };
            }
        };
    }]);