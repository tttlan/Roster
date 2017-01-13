// Controller applicationDetailsCtrl
// ---------------------------------------

describe('Unit: Controller:applicationDetailsCtrl', function() {

    var $scope, $location, $routeParams, createController, mockMembersgService, mockDataService, mockApplicantService, applicationId = 118657, jobId = 7170;

    beforeEach(function () {
        module('sherpa');
        module('templates');
        module('test.services');

        mockApplicantService = jasmine.createSpyObj('JobApplicantDetailsService', ['getApplicantDetails', 'updateApplicant', 'changeApplicationStatus']);
        mockMembersgService = jasmine.createSpyObj('Members',['me']);


        module(function ($provide) {
            $provide.value('JobApplicantDetailsService', mockApplicantService);
            $provide.value('Members', mockMembersgService);
            $provide.provider('$routeParams', function() {
                this.$get = function() {
                    return {
                        applicationId: applicationId,
                        jobId: jobId
                    }
                }
            });
        });

        inject(function($rootScope, $controller, _$location_, $injector, _mockDataService_, _Paths_, JobApplicantDetailsModel, JobApplicantSearchSingleton) {
            $scope = $rootScope.$new();
            $location = _$location_;
            mockDataService = _mockDataService_;

            mockApplicantService.getApplicantDetails.and.callFake(function(obj) {
                var model = mockDataService.get('api/recruit/job-application/applicant_details.json');
                return model;
            });

            mockApplicantService.changeApplicationStatus.and.returnValue(
                mockDataService.get('api/recruit/job-application/success.json')
            );

            //Fake a list of applicants (normally includes all of their data, only need id for this test.
            JobApplicantSearchSingleton.data = [{"id":118650}, {"id":118651}, {"id":118657}];

            $scope.applicantDetails = JobApplicantDetailsModel.fromApi(mockApplicantService.getApplicantDetails().$$state.value);
            createController = function () {
                return $controller('applicationDetailsCtrl', {
                    '$scope': $scope
                })
            }
        })
    });

    it('should navigate to the correct path', function() {
        var controller = createController();

        $location.path('/recruit/jobs/' + jobId + '/applications/' + applicationId);
        expect($location.path()).toBe('/recruit/jobs/' + jobId + '/applications/' + applicationId);
    });

    it('should initialize the applicationDetailsCtrl object for load data from the api', function() {
        var controller = createController();

        expect($scope.applicantDetails).not.toBe(null);
        expect($scope.applicantDetails.JobApplicationId).toBe(applicationId);
        expect($scope.applicantDetails.Contacts.length).toEqual(4);
    });

    it('should change the status of the applicant details', function() {
        var controller = createController();

        var result = mockApplicantService.changeApplicationStatus($scope.applicantDetails, "Offer");

        expect(result.$$state.value.Status).toEqual(0);
        expect(result.$$state.value.Data).toEqual(null);
    });

    it('should initialize tab data', function() {
        var controller = createController();

        $scope.initTabs();

        expect($scope.$tabData.length).toBe(3);
    });

    it('should change between applicants', function() {
        var controller = createController();
        var newCountIndex = "2"; //Switching to the second applicant in the list
        var comparatorId = $scope.searchResultsList[+newCountIndex - 1].id; //Gets the id from the list that needs to be checked for.

        $scope.changeApplicant(newCountIndex);

        expect($location.path()).toBe('/recruit/jobs/' + jobId + '/applications/' + comparatorId);
    })
});