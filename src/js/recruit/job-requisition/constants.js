angular.module('ui.recruit.job-requisition')
    .constant('REQUISITION_STATUS',
        {
            PENDING: 'Pending',
            APPROVED: 'Approved',
            EXECUTED: 'Executed',
            REJECTED: 'Rejected',
            DELETED : 'Deleted',
            DRAFT: 'Draft',
            REQ_CHANGES: 'Require Change', //not use at this time
            ARCHIVED: 'Archived',
            CANCELLED: 'Cancelled'
        })
    .constant('REQUISITION_ACTION',
        {
            DELETE: -1,
            SUBMIT: 0,
            APPROVE: 1,
            EXECUTE: 2,
            REJECT: 3,
            CANCEL: 4,
            SAVE_AS_DRAFT: 5,
            CHANGE_REQ: 6,
            ARCHIVE: 7,
            SAVE: 8
        });

      