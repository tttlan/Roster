describe('Unit: Controller:onboardingDocumentsCtrl', function() {

    var $scope, $location, onboardingDocumentsCtrl, mockOnboardingService, mockNetworksService, mockMembersgService, mockDataService;
    beforeEach(function () {
        module('sherpa');
        module('templates');
        module('test.services');

        mockOnboardingService = jasmine.createSpyObj('Onboarding',['processCandidateAcceptance', 'memberAcceptance', 'getRouteFromAcceptanceStage', 'getMetadata', 'onboardDocumentAccept']);
        mockNetworksService = jasmine.createSpyObj('Networks',['getCompanyDescription', 'getTermsAndConditions']);
        mockMembersgService = jasmine.createSpyObj('Members',['me']);

        module(function($provide) {
            $provide.value('Onboarding', mockOnboardingService);
            $provide.value('Networks', mockNetworksService);
            $provide.value('Members', mockMembersgService);
        });
        inject(function($rootScope, $controller, _$location_, $injector, _mockDataService_, _Paths_) {
            $scope = $rootScope.$new();
            $location = _$location_;
            mockDataService = _mockDataService_;
            //paths = _Paths_;
            mockOnboardingService.getMetadata.and.returnValue(
                //_mockDataService_.get('api/recruit/onboarding/member-acceptance/index.json')
                ["1", "2"]
            );
            mockOnboardingService.memberAcceptance.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/member-acceptance/index.json')
            );
            mockOnboardingService.memberAcceptance.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/member-acceptance/index.json')
            );
            mockOnboardingService.getRouteFromAcceptanceStage.and.returnValue(
                'recruit.onboarding.documents'
            );
            mockOnboardingService.processCandidateAcceptance.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/member-acceptance-process/index.json')
            );
            mockNetworksService.getCompanyDescription.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/network-companysummary/index.json')
            );
            mockNetworksService.getTermsAndConditions.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/getTermsAndConditions/index.json')
            );
            mockMembersgService.me.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/member-me/index.json')
            );
            onboardingDocumentsCtrl = function() {
                return $controller('onboardingDocumentsCtrl', {
                    '$scope': $scope,
                });
            };
        });
    });

    it('should initialization the onboardingDocumentsCtrl object for load data from the api and set location correctly', function() {
        var controller = onboardingDocumentsCtrl();
        $scope.$digest();
        expect($scope.isLoading).toBe(false);
        expect($scope.onboarding.documents);

        expect(mockOnboardingService.memberAcceptance).toHaveBeenCalled();
        expect($scope.progress.length).toBe('28%');
        expect($location.path()).toBe('/recruit/onboarding/documents');
    });

    it('should loading and set location correctly when call onboarding_documents function', function() {
        var controller = onboardingDocumentsCtrl();
        $scope.$digest();
        $scope.onboarding_documents();
        $scope.$digest();

        expect($scope.isLoading).toBe(false);
        expect($location.path()).toBe('/recruit/onboarding/inboundDocuments');
        expect(mockOnboardingService.processCandidateAcceptance).toHaveBeenCalled();
    });
});