angular.module('sherpa')

.config(function($routeProvider, $locationProvider, IS_LOCALHOST) {
    if (!IS_LOCALHOST) {
        $locationProvider
            .html5Mode(true)
            .hashPrefix('!');
    }

    $routeProvider
        //recruit section
        .when('/recruit', {
            title: 'Recruit',
            template: 'Recruit summary'
        })
        .when('/recruit/requisitions', {
            title: 'Job Requisition',
            templateUrl: '/interface/views/recruit/job-requisition/list.html',
            controller: 'jobRequisitionListCtrl'
        })
         .when('/recruit/requisitions/create', {
             title: 'Job Requisition',
             templateUrl: '/interface/views/recruit/job-requisition/create.html',
             controller: 'jobRequisitionCreateCtrl'
         })
        .when('/recruit/requisitions/:id', {
            title: 'Job Requisition',
            templateUrl: '/interface/views/recruit/job-requisition/detail.html',
            controller: 'jobRequisitionDetailCtrl'
        })

        .when('/recruit/candidate-pool', {
            title: 'Candidate Pool',
            templateUrl: '/interface/views/recruit/candidate-pool/list.html',
            controller : 'candidatePoolListCtrl'
        })
         .when('/recruit/candidate-pool/:id', {
             title: 'Candidate Pool',
             templateUrl: '/interface/views/recruit/candidate-pool/detail.html',
             controller: 'candidatePoolDetailCtrl'
         })
        .when('/recruit/onboards', {
            title: 'Single Onboards',
            template: '<onboard-listing list-type="single"></onboard-listing>'
        })
        .when('/recruit/bulk-onboards', {
            title: 'Bulk Onboards',
            template: '<onboard-listing list-type="bulk"></onboard-listing>'
        })
        .when('/recruit/onboards/create/single', {
            title: 'Create Onboard',
            template: '<onboard-details list-type="single"></onboard-details>'
        })
        .when('/recruit/onboards/create/bulk', {
            title: 'Create Onboard',
            template: '<onboard-details list-type="bulk"></onboard-details>'
        })
         //add employees
        .when('/recruit/onboards/addEmployees', {
            title: 'Add employees',
            templateUrl: '/interface/views/recruit/onboarding/add-employee.html',
            controller: 'addEmployeeCtrl'
        })
        .when('/recruit/onboards/:onboardId', {
            title: 'Onboard Details',
            template: '<onboard-details list-type="single"></onboard-details>'
        })
        .when('/recruit/bulk-onboards/:bulkOnboardId', {
            title: 'Bulk Onboard Details',
            template: '<onboard-details list-type="bulk"></onboard-details>'
        })
        .when('/recruit/settings', {
            title: 'Settings',
            template: 'Settings'
        })

        // Onboarding Section (new exployee goes on board)
        //---------------------------

        // Welcome
        .when('/recruit/onboarding/welcome', {
            title: 'Welcome',
            templateUrl: '/interface/views/recruit/onboarding/welcome.html',
            controller: 'onboardingWelcomeCtrl'
        })

        // Accept terms
        .when('/recruit/onboarding/terms', {
            title: 'Accept terms',
            templateUrl: '/interface/views/recruit/onboarding/terms.html',
            controller: 'onboardingTermsCtrl'
        })

        // Outbound documents
        .when('/recruit/onboarding/documents', {
            title: 'Outbound Documents',
            templateUrl: '/interface/views/recruit/onboarding/documents.html',
            controller: 'onboardingDocumentsCtrl'
        })

        //Inbound documents
        .when('/recruit/onboarding/inboundDocuments', {
            title: 'Inbound Documents',
            templateUrl: '/interface/views/recruit/onboarding/inboundDocuments.html',
            controller: 'onboardingInboundDocumentsCtrl'
        })

        // Fill up profile
        .when('/recruit/onboarding/profile', {
            title: 'Fill up profile',
            templateUrl: '/interface/views/recruit/onboarding/profile.html',
            controller: 'onboardingProfileCtrl'
        })

        // TFN declaration
        .when('/recruit/onboarding/declaration', {
            title: 'Tax File Number Declaration',
            templateUrl: '/interface/views/recruit/onboarding/tfnDeclaration.html',
            controller: 'onboardingDeclarationCtrl'
        })

        // TFN declaration signature
        .when('/recruit/onboarding/signature', {
            title: 'Tax File Number Declaration Signature',
            templateUrl: '/interface/views/recruit/onboarding/tfnSignature.html',
            controller: 'onboardingSignatureCtrl'
        })

        //Completion
        .when('/recruit/onboarding/completion', {
            title: 'Complete the onboarding process',
            templateUrl: '/interface/views/recruit/onboarding/completion.html',
            controller: 'onboardingCompletionCtrl'
        })
        //sorry
        .when('/recruit/onboarding/sorry', {
            title: 'sorry',
            templateUrl: '/interface/views/recruit/onboarding/sorry.html',
            //controller: 'onboardingCompletionCtrl'
        })
        //Jobs
        .when('/recruit/jobs/documents', {
            title: 'Application Documents',
            templateUrl: '/interface/views/recruit/job-application/application-documents.html',
            controller: 'applicationDocumentsCtrl'
        })
        .when('/recruit/jobs/:jobId/edit', {
            title: 'Edit Job',
            templateUrl: '/interface/views/recruit/job-ads/job-ads-list.html',
            controller: 'jobAdsListCtrl'
        })
        .when('/recruit/jobs/:jobId/:tab', {
            title: 'Job Details',
            templateUrl: '/interface/views/recruit/job-details/job-details.html',
            controller: 'jobDetailsCtrl'
        })
        .when('/recruit/jobs/:jobId/applications/:applicationId', {
            title: 'Application Details',
            templateUrl: '/interface/views/recruit/job-application/application-detail.html',
            controller: 'applicationDetailsCtrl'
        })
        .when('/recruit/jobs', {
            title: 'Jobs List',
            templateUrl: '/interface/views/recruit/job-ads/job-ads-list.html',
            controller: 'jobAdsListCtrl'
        })        
        .otherwise({
            redirectTo: '/recruit'
        });
});
