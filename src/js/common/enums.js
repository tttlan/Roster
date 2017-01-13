angular.module('ui.common')


    // EntityActionType mapping :> intended to reflect the C# equivalent
    //
    // ------------------------------------------------

    .constant('EntityActionType', {
        
        //=================================================
        // Common Actions
        Add : 1,
        Edit : 2,
        Delete : 3,
        View : 4,

        //=================================================
        // Roster Actions
        ViewRosterShift : 1000,

        CanViewMemberTimeOff: 1101,
        CanCreateMemberTimeOff: 1102,
        CanEditMemberTimeOff: 1103,
        CanDeleteMemberTimeOff: 1104,

        CanViewMemberAvailability: 1105,
        CanCreateMemberAvailability: 1106,
        CanEditMemberAvailability: 1107,
        CanDeleteMemberAvailability: 1108,

        //Timesheet 
        ViewDetailTimesheet: 6200,
        CreateTimesheetL: 6201,
        EditTimesheet: 6202,
        ProccessTimesheet: 6207,
        ExportTimesheet: 6208,

        //Shift Position
        CreateShiftPostion: 1109,
        ViewShiftPosition: 1110,
        EditShiftPostion: 1111,
        DeleteShiftPostion: 1112,

        //Cost Center
        ViewCostCenter: 1113,
        CreateCostCenter: 1114,
        EditCostCenter: 1115,
        DeleteCostCenter: 1116,

        // ShiftSwap
        ViewShiftSwap: 2221,
        CreateShiftSwap: 2222,
        EditShiftSwap: 2223,
        DeleteShiftSwap: 2224,

        //Public Holiday
        CanViewPublicHolidaySet: 1117,
        CanCreatePublicHolidaySet: 1118,
        CanEditPublicHolidaySet: 1119,
        CanDeletePublicHolidaySet: 1120,
        CanCreatePublicHoliday: 1121,
        CanEditPublicHoliday: 1120,
        CanDeletePublicHoliday: 1121,

        // Roster Setting
        CanEditRosterSetting: 1122,

        //Roster
        CanCreateRoster: 1200,
        CanViewRoster: 1201,
        CanUpdateRoster: 1202,

        //Roster template
        CanCreateRosterTemplate: 1203,
        CanViewRosterTemplate: 1204,
        CanUpdateRosterTemplate: 1205,
        CanDeleteRosterTemplate: 1206,

        //Roster cycle
        CanPublishAllDraftShift: 1207,

        //Time off type
        CanViewTimeOffType: 1101,
        CanCreateTimeOffType: 1102,
        CanEditTimeOffType: 1103,

        // Timesheet Shift Type
        CanViewTimesheetShiftType: 1300,
        CanCreateTimesheetShiftType: 1301,
        CanEditTimesheetShiftType: 1302,
        CanDeleteTimesheetShiftType: 1303,

        CanCancelMemberTimeOff: 1401,
        CanApproveMemberTimeOff: 1402,
        CanDeclineMemberTimeOff: 1403,
        //:::::::::::::::::::::::::::::::::::::::::::::::::
        // Community Actions
        ViewFeeds : 2000,
        ViewActivity : 2001,
        EditActivity : 2002,
        DeleteActivity : 2003,
        AddActivity : 2004,

        // Likes
        Like : 2012,
        CannotLike : 2013,

        // Comments
        AddComment : 2023,
        EditComment : 2024,
        DeleteComment : 2025,
        CanComment : 2026,
        CannotComment : 2027,

        // Attachments
        AddAttachment : 2035,
        DeleteAttachment : 2036,

        // Blogs
        ViewBlogs : 2200,
        CreateBlog : 2201,
        UpdateBlog : 2202,
        DeleteBlog : 2203,

        //=================================================
        // Training Actions
        ViewCourses : 2400,

        //=================================================
        // Jobs
        ManageJobs : 2500,
        StarCandidate : 2501,
        DeleteCandidate : 2502,
        CanAddComment : 2503,
        CanAddJob : 2504,
        ViewResume : 2505,
        ViewProfile : 2506,
        ViewPhoneScreen : 2507,
        ViewJob : 2508,
        FilterCandidate : 2509,
        SearchCandidate : 2510,
        UnStarCandidate : 2511,
        AddBlackList : 2512,
        RemoveBlackList : 2513,
        GetContentOfEmail : 2524,
        ViewDetailEmail : 2525,
        FilterEmailByJob : 2526,
        CreateEmailTemplate : 2527,
        EditEmail : 2528,
        DeleteEmail : 2529,
        SendEmail : 2530,
        GetContentOfEmailTemplate : 2531,
        SaveEmailAsDraft : 2532,
        ReSendEmail : 2533,
        DeleteJob : 2534,


        //=================================================
        // Job Ad
        CanApplyJobAd : 2550,
        ViewJobAd : 2551,
        CanApplyWithSeek : 2552,
        FillWithSeekIdentity : 2553,
        AttachSeekResume : 2554,
        // Events
        ViewEvent : 2600,
        AddEvent : 2601,
        EditEvent : 2602,
        DeleteEvent : 2603,
        CanRsvpEvent : 2604,
        CancelEvent : 2605,

        //=================================================
        // Job Application
        SubmitApplication : 2700,
        // Profile
        EditProfileEmployeeDetail : 2700,
        CannotEditProfileEmployeeDetail : 2701,
        EditProfileContact : 2702,
        EditProfileEmergencyContact : 2703,
        EditDoB : 2704,
        EditCommencementDate : 2705,
        ViewAccountRecruiment : 2706,
        EditAccountRecruiment : 2707,
        DeleteAccountRecruiment : 2708,
        CreateAccountRecruiment : 2709,
        BypassOnboard : 2066,
        ViewProfileContact : 2610,
        ViewProfileEmploymentDetail : 2702,
        CannotViewProfileEmploymentDetail : 2703,
        CannotEditCommencementDate : 2705,
        CanViewPerformanceAssessmentLink : 2706,
        CannotViewPerformanceAssessmentLink : 2707,
        CanViewExitFormLink : 2708,
        CannotViewExitFormLink : 2709,
        CanViewPayrollDetails : 2710,
        CannotViewPayrollDetails : 2711,
        CanEditPayrollDetails : 2712,
        CannotEditPayrollDetails : 2713,


        // Profile - Banking Info
        EditProfileBanking : 2714,
        CannotEditBankingDetails : 2715,
        CanViewBankingDetails : 2716,
        CannotViewBankingDetails : 2717,
        IsNetworkPasswordRequired : 2718,
        IsNotNetworkPasswordRequired : 2719,


        // Profile - Employment History
        CanViewEmploymentHistory : 2720,
        CannotViewEmploymentHistory : 2721,
        // System Management
        ImportEmailData : 3010,

        // Profile - Member Contact
        CanViewProfileContact : 2722,
        CannotViewProfileContact : 2723,
        CanEditProfileContact : 2724,
        CannotEditProfileContact : 2725,
        CanViewProfileEmergencyContact : 2726,
        CannotViewProfileEmergencyContact : 2727,
        CanEditProfileEmergencyContact : 2728,
        CannotEditProfileEmergencyContact : 2729,
        CanEditDateOfBirth : 2730,
        CannotEditDateOfBirth : 2731,
        CanViewPublicContactInfoOnly : 2732,
        CanViewPublicAndPrivateContactInfo : 2733,

        // Profile - System Information
        CanViewSystemInformation : 2734,
        CannotViewSystemInformation : 2735,
        CanEditSystemInformation : 2736,
        CannotEditSystemInformation : 2737,

        // Profile - Documentation
        CanViewDocumentation : 2738,
        CannotViewDocumentation : 2739,

        // Profile - Change Password
        CanViewChangePassword : 2740,
        CannotViewChangePassword : 2741,

        //Profile Content
        ViewProfileContent : 2800,
        CreateProfileContentFile : 2801,
        CreateProfileContentNote : 2082,
        EditProfileContent : 2803,
        EditProfileContentStatus : 2804,
        DeleteProfileContent : 2805,

        CanViewNotes : 2806,
        CanEditPictureProfile : 2759,
        IsAdmin : 2760,
        CanPublicViewContact : 2761,

        //=================================================
        // Third Party Provider
        CreateThirdPartyProvider : 3600,
        UpdateThirdPartyProvider : 3601,
        DeleteThirdPartyProvider : 3602,
        ViewThirdPartyProvider : 3603,

        //=================================================
        // Third Party Instance
        CreateThirdPartyInstance : 3604,
        UpdateThirdPartyInstance : 3605,
        DeleteThirdPartyInstance : 3606,
        ViewThirdPartyInstance : 3607,

        //=================================================
        // Third Party Data Persistance Instance
        CreateThirdPartyDataPersistenceInstance : 3608,
        UpdateThirdPartyDataPersistenceInstance : 3609,
        DeleteThirdPartyDataPersistenceInstance : 3610,
        ViewThirdPartyDataPersistenceInstance : 3611,

        //=================================================
        // Third Party Data Persistance
        CreateThirdPartyDataPersistance : 3612,
        UpdateThirdPartyDataPersistance : 3613,
        DeleteThirdPartyDataPersistance : 3614,
        ViewThirdPartyDataPersistance : 3615,

        //=================================================
        // Third Party Data Transfer
        CreateThirdPartyDataTransfer : 3616,
        UpdateThirdPartyDataTransfer : 3617,
        DeleteThirdPartyDataTransfer : 3618,
        ViewThirdPartyDataTransfer : 3619,

        //=================================================
        // Network Group Third Party Instance
        CreateNetworkGroupThirdPartyInstance : 3620,
        UpdateNetworkGroupThirdPartyInstance : 3621,
        DeleteNetworkGroupThirdPartyInstance : 3622,
        ViewNetworkGroupThirdPartyInstance : 3623,

        //Survey ===========================================
        ViewSurvey : 2800,
        EditSurvey : 2801,
        DeleteSurvey : 2802,
        CanCreateSurveyQuestionnaire : 2803,
        CanEditSurveyQuestionnaire : 2804,
        CanDeleteSurveyQuestionnaire : 2805,
        CanViewSurveyQuestionnaire : 2806,
        CanCreateSurveyQuestion : 2807,
        CanEditSurveyQuestion : 2808,
        CanDeleteSurveyQuestion : 2809,
        CanViewSurveyQuestion : 2810,
        CanCreateSurveyQuestionnaireTemplate : 2811,
        CanEditSurveyQuestionnaireTemplate : 2812,
        CanDeleteSurveyQuestionnaireTemplate : 2813,
        CanViewSurveyQuestionnaireTemplate : 2814,
        CanCreateSurveyQuestionTemplate : 2815,
        CanEditSurveyQuestionTemplate : 2816,
        CanDeleteSurveyQuestionTemplate : 2817,
        CanViewSurveyQuestionTemplate : 2818,

        CanCreateSurveyQuestionResponseChoice : 2819,
        CanEditSurveyQuestionResponseChoice : 2820,
        CanDeleteSurveyQuestionResponseChoice : 2821,
        CanViewSurveyQuestionResponseChoice : 2822,

        CanCreateSurveyQuestionResponseChoiceType : 2823,
        CanEditSurveyQuestionResponseChoiceType : 2824,
        CanDeleteSurveyQuestionResponseChoiceType : 2825,
        CanViewSurveyQuestionResponseChoiceType : 2826,
        //===================================================
        // Workflow
        ViewWorkflow : 4000,
        EditWorkflow : 4001,
        ViewOnboardWorkflow : 4002,
        ViewJobAdWorkflow : 4003,
        ViewTraining : 4004,

        CanCreateSurveyQuestionType : 2827,
        CanEditSurveyQuestionType : 2828,
        CanDeleteSurveyQuestionType : 2829,
        CanViewSurveyQuestionType : 2830,

        CanCreateSurveyQuestionnaireResponse : 2831,
        CanEditSurveyQuestionnaireResponse : 2832,
        CanDeleteSurveyQuestionnaireResponse : 2833,
        CanViewSurveyQuestionnaireResponse : 2834,

        CanCreateSurveyCandidateResponse : 2835,
        CanEditSurveyCandidateResponse : 2836,
        CanDeleteSurveyCandidateResponse : 2837,
        CanViewSurveyCandidateResponse : 2838,
        CanViewSurveyQuestionnaireInfoForCandidate :2839,
        CanCreateSurveyQuestionnaireInfoForCandidate : 2840,

        CanViewQuestionTags : 2841,
        CanEditQuestionTags : 2842,
        CanDeleteQuestionTags : 2843,
        CanCreateQuestionTags : 2844,

        CanViewAnswer : 2845,
        CanEditAnswer : 2846,
        CanDeleteAnswer : 2847,
        CanCreateAnswer : 2848,

        CanViewQuestionnaireReport : 2849,
        CanEditQuestionnaireReport : 2850,
        CanDeleteQuestionnaireReport : 2851,
        CanCreateQuestionnaireReport : 2852,
        CanViewCandidateExamPart : 2853,
        CanCreateCandidateExamPart : 2854,

        //===================================================
            // Performanc Assessment
        ViewPerformanceAssessment : 3000,
        CreatePerformanceAssessment : 3001,
        EditPerformanceAssessment : 3002,
        DeletePerformanceAssessment : 3003,

        //:::::::::::::::::::::::::::::::::::::::::::::::::::
        //Document
        UploadDocument: 3010,
        ViewDocument: 3011,
        EditDocument: 3012,
        DeleteDocument: 3013,

        //===================================================
        // Member Employment Info
        ViewMemberEmploymentInfo : 3014,
        CreateMemberEmploymentInfo : 3015,

        //===================================================
        //Permission Capabilities
        CreatePermissionCapability : 3301,
        EditPermissionCapability : 3302,
        DeletePermissionCapability : 3303,
        ViewPermissionCapability : 3304,
        CannotEditPermissionCapability : 3305,
        CannotViewPermissionCapability : 3306,
        CannotDeletePermissionCapability : 3307,
        CannotCreatePermissionCapability : 3308,

        //===================================================
        //Permission Capabilities
        EditMemberPermissionCapabilityAccess : 3310,
        EditRolePermissionCapabilityAccess : 3311,
        CreateRolePermissionCapabilityAccess : 3312,
        CannotEditMemberPermissionCapabilityAccess : 3313,
        CannotCreateRolePermissionCapabilityAccess : 3314,

        //===================================================
        //System Information
        CreateSystemInformation : 3020,
        ViewSystemInformation : 3021,
        EditSystemInformation : 3022,
        DeleteSystemInformation : 3023,

        //===================================================
        //System Management
        ViewNetworkGroupProfile : 3050,
        EditNetworkGroupProfile : 3051,
        CreateNetworkGroupProfile : 3052,
        DeleteNetworkGroupProfile : 3053,

        //Roster Skill
        ViewSkill: 6000,
        EditSkill: 6001,
        DeleteSkill: 6002,
        AssignSkill: 6003,
        UnAssignSkill: 6004,
        AddSkill: 6005,

        //Time off type
        ViewTimeOffType: 6100,
        CreateTimeOffType: 6101,
        EditTimeOffType: 6102,

        // Shift
        CanViewShift: 6149,
        CanCreateShift: 6150,
        CanEditShift: 6151,
        CanDeleteShift: 6152,
        CanConfirmShift: 6153,
        CanRejectShift: 6154,
        CanSwapShift: 6155,
        CanBidShift: 6156,
        PublishAllDraftShifts: 6157,


        // Shift Bid
        CanApproveShiftBid: 6204,
        CanRejectShiftBid: 6205,

        //RosterTemplate
        ViewRosterTemplate: 6300,
        CreateRosterTemplate: 6301,
        EditRosterTemplate: 6302,
        DeleteRosterTemplate: 6303,

        //ShiftPlaceholder
        ViewShiftPlaceholder: 6400,
        CreateShiftPlaceholder: 6401,
        EditShiftPlaceholder: 6402,
        DeleteShiftPlaceholder: 6403,

        // Employment Type
        ViewEmploymentClassification: 6450,
        CreateEmploymentClassification: 6451,
        EditEmploymentClassification: 6452,
        DeleteEmploymentClassification: 6453,

        // Pay rate role

        ViewPayRateRole: 6500,
        CreatePayRateRole: 6501,
        UpdatePayRateRole: 6506,
        DeletePayRateRole: 6502,
        CreatePayRate: 6503,
        
                //Acceptance member
        CanViewMemberInfoAction: 3054,
        CanEditMemberInfoAction: 3055,
        CanEditContactInfoAction: 3057,
        CanEditMemberEmergencyContactAction: 3059,
        CanEditAcceptanceBankDetailAction: 3041,

        CanViewDocument : 3042,
        CanPostDocument : 3043,
        CanDeleteDocument : 3044,

        //Network property
        CanViewNetworkProperty : 3045,

        CanViewRequirement : 3046,
        CanPostRequirement : 3047,
        CanDeleteRequirement : 3048,

        CanPostReferenceDocument : 3049,


        //Onboarding
        ViewOnboard : 2606,
        EditOnboard : 2607,
        DeleteOnboard : 2608,
        CreateOnboadWithNewMember : 2609,
        CanNotViewOnboard : 2610,
        CanNotEditOnboard : 2611,
        CanNotDeleteOnboard : 2612,
        CanNotCreateonboard : 2613,
        CreateOnboardFromJob : 2614,
        PostOnboardNote : 2615,
        DeleteOnboardNote : 2616,


        //Bulk Onboarding
        CanDeleteBulkOnboard : 2650,
        CanSeperateOnboard : 2651,
        CanSendToApprovalBulkOnboard : 2652,
        CanApprovalBulkOnboard : 2653,
        CanRejectForChangeBulkOnboard : 2654,
        CanAddDocumentBulkOnboard : 2655,
        CanAddRequirmetedDocumentBulkOnboard : 2656,
        CanRejectNoNeedBulkOnboard : 2657,
        CanCreateFromFile : 2658,
        CanCreateFromCandidates : 2659,
        CanGetListBulkOnboarding : 2660,
        CanGetOnboardingBelongBulkOnboarding : 2661,
        CanProcessBulkOnboarding : 2662,
        CanGetDetailOfBulkOnboarding : 2663,
        CanDeleteDocumentBulkOnboard : 2664,

        //=================================================
        // Roles
        CreateRole : 3500,
        ViewRoleDetail : 3501,
        UpdateRole : 3502,
        DeleteRole : 3503,

        //=================================================
        // Permission Capability Access
        UpdatePermissionCapabilityAccess : 3504,
        SetDefaultPermissions : 3505,
        RemoveDefaultPermissions : 3506,
        RemovePermissionCapabilityAccess : 3507,

        //=================================================
        //Onboarding Actions

        //'New' State & 'Creator' Role
        UpdateEmployeePersonalInformation   : 3600,
        UpdateProposedRole                  : 3601,
        UpdateSourcingInformation           : 3602,
        UpdateSalaryPayRate                 : 3603,
        UpdatePayrollInformation            : 3604,
        GetOutboundDocuments                : 3605,
        UpdateCandidateContacts             : 3606,
        PostPhoneContact                    : 3607,
        PostEmailContact                    : 3608,

        ViewOutboundDocument                : 3609,
        GetInboundRequirementDocument       : 3610,
        AddOnboardRequirementDocument       : 3611,

        //'Awaiting Approval' State & 'Approver' Role
        Approve                             : 3620,
        RejectForChange                     : 3621,
        RejectNoNeed                        : 3622,
        UpdateFinalInstructions             : 3623,
        SetBypassEmployeeAcceptance         : 3624,
        SetSupressEmailNotification         : 3625,
        RollbackToNewStage                  : 3626,

        //'Awaiting Candidate Acceptance' State & 'Candidate' Role
        GetTermsAndConditions               : 3627,
        AcceptTermsAndConditions            : 3628,
        AcceptOutboundDocument              : 3629,
        GetJobrequirements                  : 3630,
        UploadInboundDocument               : 3631,
        DeleteInboundDocument               : 3632,
        GetEmployeeInformation              : 3633,
        UpdateEmployeeInformation           : 3634,
        Accept                              : 3635,
        RejectByCandidate                   : 3636,

        //'Awaiting Candidate Acceptance' State & 'Manager' Role
        RollbackToAwaitingApproval          : 3637,
        ResendEmailToCandidate              : 3638,

        //'Awaiting Confirmation' State & 'Confirmer' Role
        ViewInboundDocument                 : 3639,
        RejectForResend                     : 3640,
        RejectPermanent                     : 3641,
        ConfirmAndActivate                  : 3642,
        Confirm                             : 3643,
        RollbackToAwaitingCandidateAcceptance : 3635,

        //JobAdRequisition
        CanViewJobAdRequisition : 3700,
        CanDeleteJobAdRequisition : 3701,
        CanSendToApprovalJobAdRequisition : 3702,
        CanChangesRequiredJobAdRequisition : 3703,
        CanCancelJobAdRequisition : 3704,
        CanExecutedJobAdRequisition : 3705,
        CanApprovedJobAdRequisition : 3706,
        CanDeclinedJobAdRequisition : 3707,
        CanEditJobAdRequisition : 3708,
        CanGetListJobAdRequisition : 3709,
        CanCreateNewJobAdRequisition : 3710,
        CanExportJobRequisition : 3711,
        CanArchiveJobAdRequisition : 3712,
        CanViewJobFromJobRequisition: 3713,


        //JobApplication
        CanViewJobApplication          : 3800,
        CanDeleteJobApplication        : 3801,
        CanSendEmail                   : 3802,
        CanCopyToAnotherJob            : 3803,
        CanCreateInterview             : 3804,
        CanOnboardCandidate            : 3805,
        CanChangeStatusApplication     : 3806,
        CanChangeStatusListApplication : 3807,
        CanViewJobApplicationDocument  : 3809,
        CanEditJobApplicationDocument  : 3810,
        CanDeleteJobApplicationDocument  : 3811,
        CanAddJobApplicationDocument : 3812,

        CanDeleteComment: 3813,
        CanEditComment: 3814,

        CanViewPdfResumeDocument: 3817,
        CanViewPdfCoverDocument: 3818,

        CanViewCandidateHistories: 3819,
        CanUpdateApplicantInformation: 3820,
        CanViewCandidateLogs: 3821,
        CanViewComments: 3823,

        // Library
        CreateUserContainer : 3510,
        UpdateUserContainer : 3511,
        DeleteUserContainer : 3512,
        ViewContainer : 3513,
        ViewCategoryContents : 3514,
        CreateArtifact : 3515,
        UpdateArtifact : 3516,
        DeleteArtifact : 3517,
        ViewArtifactInfo : 3518,
        UploadArtifactFile : 3519,
        DownloadArtifactFile : 3520,
        ViewRelatedArtifacts : 3521,
        SearchContents : 3522,
        StreamingArtifactFile : 3523,
        ViewArtifact : 3524,
        AddArtifactToContainer : 3527,
        CreateArtifactTextNote : 3528,
        ViewArtifactTextNote : 3529,
        UpdateArtifactTextNote : 3530,
        ViewArtifactInfoInContext : 3531,

        //Feature
        CreateFeature : 80000001,
        UpdateFeature : 80000002,
        DeleteFeature : 80000003,

        //Business Object
        UpdateBusinessObject : 80000004,
        DeleteBusinessObject : 80000005,
        CreateBusinessObject : 80000006,
        //Business Ojbect Type
        UpdateBusinessObjectType : 80000007,
        DeleteBusinessObjectType : 80000008,
        CreateBusinessObjectType : 80000009,

        //Search Mergeable content
        CreateMergeContent : 80000010,
        DeleteMergeContent : 80000011,
        GetMergeContent : 80000012,
        DownloadMergeContent : 80000013,

        //Content Template
        CreateContentTemplate : 80000014,
        UpdateContentTemplate : 80000015,
        DeleteContentTemplate : 80000016,
        DownloadContentTemplate : 80000026,

        //Template type
        CreateTemplateType : 80000017,
        UpdateTemplateType : 80000018,
        DeleteTemplateType : 80000019,

        //Business Property
        CreateBusinessProperty : 80000020,
        UpdateBusinessProperty : 80000021,
        DeleteBusinessProperty : 80000022,

        //Sample Data
        CreateSampleData : 80000023,
        UpdateSampleData : 80000024,
        DeleteSampleData : 80000025,
    
        //current 26
        PostRelatedArtifacts : 3532,
        DeleteRelatedAllArtifacts : 3533,
        DeleteRelatedArtifact : 3534,
        CanGetPhoneScreen : 4500,
        CanViewSurveyAnswers : 4501,
        DeleteJobAdTemplate : 100108001,
        EditJobAdTemplate : 100108002,
        GetListOfJobAdTemplates : 100108003,
        GetJobAdTemplate : 100108004,
        CreateJobAdTemplate : 100108005,
        CanEditJob : 100101007,
        CanDeleteJob : 100101008,
        CanCloseJob : 100101009,
        CanViewJob : 100101010,
        CanGetQuestions : 100101012,
        CanEditJobPosts : 100101011,
        CanPublishJobPost : 100101015,
        CanDuplicateJob : 100101012
});