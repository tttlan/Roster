angular.module('ui.recruit')

.constant('OnboardingConstants', {
    ONBOARD_STATE_DOCUMENTATION: 'd', 
    ONBOARD_STATE_INBOUNDDOCUMENTATION: 'r',
    ONBOARD_STATE_MEMBERACCEPTTERMS: 'a',
    ONBOARD_STATE_MEMBERACCEPTPROF: 'p',
    ONBOARD_STATE_MEMBERTFNDECLARATION: 't',
    ONBOARD_STATE_MEMBERTFNSIGNATURE: 's',
    ONBOARD_STATE_MEMBERWELCOME: 'w',
    ONBOARD_STATE_COMPLETE: 'c',

    ONBOARD_PROCESS_REJECT_CHANGES: 'c',
    ONBOARD_PROCESS_REJECT_NOTNEEDED: 'n',
    ONBOARD_PROCESS_REJECT_PERMANENT: 'p',
    ONBOARD_PROCESS_ROLLBACK: 'rb',

    ONBOARD_SOURCE_MEMBER: 'r',
    ONBOARD_SOURCE_TRIAL: 't',
    ONBOARD_SOURCE_AGENCY: 'a',
    ONBOARD_SOURCE_SHERPA: 's',

    ONBOARD_CONTACT_TYPE_ADDRESS: 'ad',
    ONBOARD_CONTACT_TYPE_PHONE: 'p',
    ONBOARD_CONTACT_TYPE_EMAIL: 'e',

    ONBOARD_SIGNATURE_TYPE_CHECKBOX: 'c',
    ONBOARD_SIGNATURE_TYPE_UPLOAD: 'f',
    ONBOARD_SIGNATURE_TYPE_DIRECT: 'p',

    ONBOARD_LIST_TYPE_SINGLE: 'single',
    ONBOARD_LIST_TYPE_BULK: 'bulk',
    
    ONBOARD_STATUS_NEW: 'n',
    ONBOARD_STATUS_APPROVAL: 'a',
    ONBOARD_STATUS_DOCUMENTATION: 'd',
    ONBOARD_STATUS_CANDIDATE_ACCEPTANCE: 'w',
    ONBOARD_STATUS_CONFIRMATION: 'i',
    ONBOARD_STATUS_COMPLETE: 'c',
    ONBOARD_STATUS_PENDING: 'e',
    ONBOARD_STATUS_TRIAL: 't',
    ONBOARD_STATUS_DECLINED: 'l',
    
    SALARY_TYPE_CASUAL: 'Casual',
    SALARY_TYPE_HOURLY_FT_PT: 'Hourly - FT/PT',
    SALARY_TYPE_SALARIED: 'Salaried'
})

.constant('JobStatusConstants', {
    JOB_STATUS_CLOSED: "CLOSED",
    JOB_STATUS_ACTIVE: "ACTIVE",
    JOB_STATUS_PUBLISHED: "PUBLISHED",
    JOB_STATUS_DRAFT: "DRAFT"
})

.constant('ApplicationStatusConstants', {
    APPLICATION_STATUS_NEW: 1,
    APPLICATION_STATUS_SHORTLISTED: 2,
    APPLICATION_STATUS_PHONESCREEN: 3,
    APPLICATION_STATUS_INTERVIEWSTAGE1: 4,
    APPLICATION_STATUS_INTERVIEWSTAGE2: 5,
    APPLICATION_STATUS_ONBOARDING: 6,
    APPLICATION_STATUS_OFFERMADE: 7,
    APPLICATION_STATUS_EMPLOYED: 8,
    APPLICATION_STATUS_REJECTED: 9,
    APPLICATION_STATUS_ARCHIVE: 10,
    APPLICATION_STATUS_WITHDRAWN: 11,
    APPLICATION_STATUS_REFERENCESCHECKED: 12
})

.constant('JobTypeConstants', {
    JOBTYPE_CONTRACT: 4,
    JOBTYPE_CASUAL: 3,
    JOBTYPE_PARTTIME: 2,
    JOBTYPE_FULLTIME: 1
})

.constant('LogActionTypeConstant', {
    ACTIONTYPE_STATUS_CHANGE: 1,
    ACTIONTYPE_NOTE_ADD: 2,
    ACTIONTYPE_NOTE_EDIT: 3,
    ACTIONTYPE_NOTE_DELETE: 4,
    ACTIONTYPE_PERSONAL_DETAIL: 5,
    ACTIONTYPE_EMAIL_SENT: 6,
    ACTIONTYPE_ONBOARD: 7
})
    
.constant('ReactionConstants', {
    REACTION_LIKE: 1,
    REACTION_DISLIKE: 2,
    REACTION_NEUTRAL: 3
})

.constant('SalaryType',{
    ANNUAL: 97,
    HOURLY: 104,
    DAILY: 100,
    RANGE: 114,
    AMOUNT: 97
})

.constant('JobLocation',{
    LOCATION: 'location',
    REGION: 'region'
})

.constant('JobAdsOrderBy',{
    TITLE: 'JobTitle',
    STATUS: 'StatusOrder',
    LOCATION: 'Location',
    ELAPSE: 'Elapse',
    APPLICATION_COUNT: 'ApplicationCount',
    ACTIVE_APPLICATION_COUNT: 'ActiveApplicationCount'
})
.constant('ApplicantListOrderBy',{
    APPLICANT: 'ApplicantInformation.FirstName',
    STATUS: 'ApplicationStatus',
    ELAPSE: 'AppDate',
    NOTES: 'CommentCount'
})

//TODO: this QuestionType constant is base on the data from the old api, it may be change when we have the new api
.constant('QuestionType',{
    TEXT: 'Text',
    YESNO: 'YesNo',
    MULTICHOICES: 'TickBox',
    SINGLECHOICE: 'Radio',
    DATEPICKER: 'Date',
    DOCUMENT: 'Document'
})

.constant('PathContants',{
    JOB_BOARD_LOGO: '/images/network/multipost/jobboards/'
});