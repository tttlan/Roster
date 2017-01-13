describe('Unit: Controller:onboardingInboundDocumentsCtrl', function() {

    var $scope, $location, createControllerInboundDocumentsCtrl, mockOnboardingService, mockNetworksService, mockDataService;

    beforeEach(function () {
        module('sherpa');
        module('templates');
        module('test.services');

        mockOnboardingService = jasmine.createSpyObj('Onboarding',
            [
                'processCandidateAcceptance',
                'memberAcceptance',
                'getRouteFromAcceptanceStage',
                'updateInboundRequirements'
            ]
        );
        mockNetworksService = jasmine.createSpyObj('Networks',['getPaperDocTypes']);
        //mockServergService = jasmine.createSpyObj('$server',['get']);
        module(function($provide) {
            $provide.value('Onboarding', mockOnboardingService);
            $provide.value('Networks', mockNetworksService);
            //$provide.value('Members', mockServergService);
        });
        inject(function($rootScope, $controller, _$location_, $injector, _mockDataService_) {

            $scope = $rootScope.$new();
            $location = _$location_;
            mockDataService = _mockDataService_;

            mockOnboardingService.memberAcceptance.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/member-acceptance/index.json')
            );
            mockOnboardingService.updateInboundRequirements.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/updateInboundRequirements/index.json')
            );
            mockOnboardingService.getRouteFromAcceptanceStage.and.returnValue(
                'recruit.onboarding.inboundDocuments'
            );
            mockOnboardingService.processCandidateAcceptance.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/member-acceptance-process/index.json')
            );

            mockNetworksService.getPaperDocTypes.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/getPaperDocTypes/index.json')
            );

            createControllerInboundDocumentsCtrl = function() {
                return $controller('onboardingInboundDocumentsCtrl', {
                    '$scope': $scope
                });
            };
        });
    });

    it('should initialize the onboardingInboundDocumentsCtrl object for load data from the api and set location correctly', function() {
      var controller = createControllerInboundDocumentsCtrl();
        $scope.$digest();
        expect($scope.isLoading).toBe(false);
        //expect($scope.terms.isAccepted).toBe(false);
        expect($scope.progress.length).toBe('42%');
        expect($scope.onboarding.inboundDocuments).not.toBe(null);
        expect($location.path()).toBe('/recruit/onboarding/inboundDocuments');
    });

    xit('should set isLoading and set location correctly when call onboardingInboundDocumentsCtrl function', function() {
        var controller = createControllerInboundDocumentsCtrl();
        $scope.$digest();

        //$scope.terms.isAccepted = true;
        $scope.inboundDocumentsForm = {};
        $scope.save();
        $scope.$digest();

        expect($scope.isLoading).toBe(false);
        expect($location.path()).toBe('/recruit/onboarding/declaration');
        expect(mockOnboardingService.updateInboundRequirements).toHaveBeenCalled();
    });
});