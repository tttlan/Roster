angular.module('ui.recruit')

/*
 *
 * Return the Job type for the given Job type ID
 *
 * {{ jobtypeid | jobTypeName }}
 *
 * The above example would return the job type string
 *
 */

.filter('jobTypeName', ['JobTypeConstants', function(JobTypeConstants) {
    return function(jobTypeID) {
        switch (jobTypeID) {
            case (JobTypeConstants.JOBTYPE_FULLTIME):
                return 'Full Time';
            case (JobTypeConstants.JOBTYPE_PARTTIME):
                return 'Part time';
            case (JobTypeConstants.JOBTYPE_CASUAL):
                return 'Casual';
            case (JobTypeConstants.JOBTYPE_CONTRACT):
                return 'Contract';
        }
    };
}])

/*
 *
 * Return the Log Action Type for the given Log Action Type ID
 *
 * {{ logActionType | logActionTypeName }}
 *
 * The above example would return the log action type string
 *
 */

.filter('logActionTypeName', ['LogActionTypeConstant', function(LogActionTypeConstant) {
    return function(actionTypeId) {
        switch (actionTypeId) {
            case (LogActionTypeConstant.ACTIONTYPE_STATUS_CHANGE):
                return 'Status change';
            case (LogActionTypeConstant.ACTIONTYPE_NOTE_ADD):
                return 'Note added';
            case (LogActionTypeConstant.ACTIONTYPE_NOTE_EDIT):
                return 'Note edited';
            case (LogActionTypeConstant.ACTIONTYPE_NOTE_DELETE):
                return 'Note deleted';
            case (LogActionTypeConstant.ACTIONTYPE_PERSONAL_DETAIL):
                return 'Personal details changed';
            case (LogActionTypeConstant.ACTIONTYPE_EMAIL_SENT):
                return 'Email sent';
            case (LogActionTypeConstant.ACTIONTYPE_ONBOARD):
                return 'Onboard';
        }
    };
}]);
