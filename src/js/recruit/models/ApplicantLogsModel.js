angular.module('ui.recruit.models')

.factory('ApplicantLogsItemModel', ['JobApplicationStatusModel', function(JobApplicationStatusModel) {
    return class ApplicantLogsItemModel {
        constructor(firstName = null, surname = null, avatarMiniLink = null, ActionDate = null, ActionType = null, Content = null, NewStatus = null,
                    OldStatus = null, NoteReaction = null, FieldNameChanged = null ) {
            this.firstName          = firstName;
            this.surname            = surname;
            this.avatarMiniLink     = avatarMiniLink;
            this.actionDate         = ActionDate;
            this.actionType         = ActionType;
            this.content            = Content;
            if(NewStatus && OldStatus) {
                this.statusHistory  = new JobApplicationStatusModel(NewStatus.ApplicationStatusDescription, NewStatus.ApplicationStatusColor,
                                          OldStatus.ApplicationStatusDescription, OldStatus.ApplicationStatusColor);
            }
            this.notesReaction      = NoteReaction;
            this.fieldNamechanged   = FieldNameChanged;
        }

        /*
         * Create the object from the return payload
         */
        static fromApi(log) {
            return new ApplicantLogsItemModel(
                log.Actor.FirstName,
                log.Actor.Surname,
                log.Actor.PhotoThumbMini,
                log.ActionDate,
                log.ActionType,
                log.Content,
                log.NewStatusColor,
                log.OldStatusColor,
                log.NoteReaction,
                log.FieldNameChanged
            );
        }
    };
}])

.factory('ApplicantLogsModel', ['ApplicantLogsItemModel', function(ApplicantLogsItemModel) {
    return class ApplicantLogsModel {
        constructor(logs = null) {
            this.logs = logs;
        }

        /*
         * Create the object from the return payload
         */
        static fromApi(logs) {
            let response = new ApplicantLogsModel(
                logs.Data.map(log => { return ApplicantLogsItemModel.fromApi(log); })
            );
            return response;
        }
    };
}]);