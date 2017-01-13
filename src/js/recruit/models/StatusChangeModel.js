angular.module('ui.recruit.models')
    .factory('StatusChangeModel', ['Permissions', (Permissions) => {
        return class StatusChangeModel {
            constructor(statusId, applicantIdData) {
                this.statusId = statusId;
                this.applicantIdData = applicantIdData;
            }

            /*
            * Create the object for the payload post
            */
            toApi() {
                return {
                    "JobApplicationIds": this.applicantIdData,
                    "JobApplicationStatusDetail": {
                        "Status": this.statusId,
                        "Notes": null, // TODO not sure if optional or not
                        "RejectReason": null // TODO not sure if optional or not
                    }

                };
            }
        };
    }]);
