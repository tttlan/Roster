angular.module('ui.recruit.models')
    .factory('JobApplicationStatusModel', ['Permissions', (Permissions) => {
        return class JobApplicationStatusModel {
            constructor(
                        status,
                        statusColor,
                        previousStatus,
                        previousStatusColor
            ) {
                this._status                  = status;
                this._statusColor             = statusColor;
                this._previousStatus          = previousStatus;
                this._previousStatusColor     = previousStatusColor;
            }

            get currentStatus() {
                return this._status;
            }

            get currentStatusColor() {
                return this._statusColor;
            }

            get previousStatus() {
                return this._previousStatus;
            }

            get previousStatusColor() {
                return this._previousStatusColor;
            }
        };
    }]);