angular.module('ui.recruit.models')
    .factory('JobDetailsModel', ['Permissions', (Permissions) => {
        return class JobDetailsModel {
            constructor(jobTitle, jobStatus, jobPositionType, jobSuburb) {
                this.jobTitle           = jobTitle;
                this.jobStatus          = jobStatus;
                this.jobPositionType    = jobPositionType;
                this.jobSuburb          = jobSuburb;
            }

            /*
             * Create the object from the return payload
             */
            static fromApi(job) {
                let response;
                if(typeof job === 'object') {
                    response = new JobDetailsModel(job.JobTitle,
                        job.JobStatusCode,
                        job.Position.TagDesc,
                        job.Locations.ContactInfo.Suburb
                    );
                } else {
                    throw new Error('API has returned a none object type ${job}');
                }

                return response;
            }
        };
    }]);