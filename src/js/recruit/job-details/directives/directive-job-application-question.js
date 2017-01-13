angular.module('ui.recruit')
    .directive('jobApplicationQuestion', ['$q', function($q) {

        return {
            restrict: 'E',
            require: '^form',
            scope: {
                jobDetail: '=',
                question: '='
            },
            templateUrl: '/interface/views/recruit/job-details/partials/job-application-question.html',
            controller: ['$scope', function($scope) {

                $scope.jobDetail = $scope.jobDetail ? $scope.jobDetail : {
                    JobTitle: 'Grill Restaurant Managers',
                    jobSummary: 'Some employers like to use internal codes to track their job ads. This is a good place to put yours if you have one.',
                    JobReference: 'VIC - BM - 17SEP12',
                    JobStatusCode: 'APPROVED',
                    JobFeedType: 0,
                    employeeType: 'Full-time',
                    JobInternalApplicantsMessage: null,
                    JobLocation: null,
                    JobLocationType: null,
                    JobInternalReferToFriendEnable: null,
                    DateFirstPosted: '2014-08-06T16:00:37.463',
                    DateApproved: '2014-08-06T16:07:24.237',
                    DateExpire: null,
                    jobBody: 'Our store at Ferntree Gully requires the services of an experienced Auto Parts Sales Person.' +
                        'Experience in non-genuine Auto Parts would be a definite advantage.' +
                        'An excellent phone manner and exceptional customer service skills are a must.' +
                        'Burson Auto Parts require an automtive parts interpreter for our Ferntree Gully store.' +
                        'Experience in non-genuine Auto Parts would be a definite advantage.' +
                        'An excellent phone manner and exceptional customer service skills are a must.' +
                        'Burson Auto Parts require an automtive parts interpreter for our Ferntree Gully store.' +
                        'Experience in non-genuine Auto Parts would be a definite advantage.' +
                        'An excellent phone manner and exceptional customer service skills are a must.' +
                        'Burson Auto Parts require an automtive parts interpreter for our Ferntree Gully store.',
                    AmountType: 'a',
                    SalaryRate: 11,
                    SalaryType: 'h',
                    Currencytype: 'AUD',
                    AdditionalSalaryInfo: 'Car park space, Performace-based bonus',
                    Reference: null,
                    SalaryRange: '$50,000 - 60,000',
                    textLocation: 'Camberwell',
                    AllowOverSeaApplications: true,
                    IsSeekEnable: null,
                    PosterIpAddress: '110.143.49.142',
                    DisplayOnYourSite: null,
                    DisplaySalary: true,
                    ExternalId: null,
                    ExternalSource: null,
                    RegionXmlValue: 'sample string',
                    AreaXmlValue: 'sample string',
                    LocationDesc: 'Melbourne',
                    Positions: [
                        {
                            $id: '21',
                            JobTagId: 1229,
                            TagDesc: 'Store Manager',
                            TagCategory: ''
                        },
                        {
                            $id: '22',
                            JobTagId: 1230,
                            TagDesc: 'Parts Interpreters',
                            TagCategory: ''
                        }
                    ]
                };
            }]
        };
    }]);