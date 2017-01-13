angular.module('ui.recruit.models')
    .factory('JobApplicationStatusListModel', ['StatusItemModel', (StatusItemModel) => {
        return class JobApplicationStatusListModel {
            constructor(totalApplicationCount, listData) {
                this.totalApplicationCount      = totalApplicationCount;
                this.data                       = listData;
            }

            /*
            * Create the object from the return payload
            */
            static fromApi(statusData) {
                return new JobApplicationStatusListModel(statusData.Data.TotalApplicationCount,
                    statusData.Data.JobApplicationStatusDetail.map((model) => StatusItemModel.fromApi(model))
                );
            }
        };
    }])
    .factory('StatusItemModel', ['Permissions', (Permissions) => {
        return class StatusItemModel {
            constructor(id, name, color, count) {
                this.id = id;
                this.name = name;
                this.color = color;
                this.count = count;
            }

            /*
            * Create the object from the return payload
            */
            static fromApi(status) {
                // TODO: fix status data names when api's have been updated
                return new StatusItemModel(status.ApplicationStatus, status.ApplicationStatusDescription, status.ApplicationStatusColor, status.ApplicationStatusCount);
            }
        };
    }]);