describe('Unit: Controller:onboardingTermsCtrl', function() {

    var $scope, $location, mockOnboardingService, mockNetworksService, mockMembersgService, mockDataService, createControllerTerms;
    beforeEach(function () {
        module('sherpa');
        module('templates');
        module('test.services');

        mockOnboardingService = jasmine.createSpyObj('Onboarding',['processCandidateAcceptance', 'memberAcceptance', 'getRouteFromAcceptanceStage']);
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
            mockOnboardingService.memberAcceptance.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/member-acceptance/index.json')
            );
            mockOnboardingService.getRouteFromAcceptanceStage.and.returnValue(
                'recruit.onboarding.terms'
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
            createControllerTerms = function() {
                return $controller('onboardingTermsCtrl', {
                    '$scope': $scope,
                });
            };
        });
    });

    it('should initialization the onboardingTermsCtrl object for load data from the api and set location correctly', function() {
        var controller = createControllerTerms();
        $scope.$digest();
        expect($scope.isLoading).toBe(false);
        expect($scope.terms.isAccepted).toBe(false);
        expect($scope.progress.length).toBe('14%');
        expect($location.path()).toBe('/recruit/onboarding/terms');
    });

    it('should loading and set location correctly when call onboarding_terms function', function() {
        var controller = createControllerTerms();
        $scope.$digest();

        $scope.terms.isAccepted = true;

        $scope.onboarding_terms();
        $scope.$digest();

        expect($scope.isLoading).toBe(false);
        expect($location.path()).toBe('/recruit/onboarding/documents');
        expect(mockOnboardingService.processCandidateAcceptance).toHaveBeenCalled();
    });
});