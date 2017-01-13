describe('Unit: Controller:onboardingWelcomeCtrl', function() {

    var $scope, $location, createControllerWelcome, mockOnboardingService, mockNetworksService, mockDataService, mockMembersgService;

    beforeEach(function () {
        module('sherpa');
        module('templates');
        module('test.services');

        mockOnboardingService = jasmine.createSpyObj('Onboarding',['processCandidateAcceptance', 'memberAcceptance', 'getRouteFromAcceptanceStage']);
        mockNetworksService = jasmine.createSpyObj('Networks',['getCompanyDescription', 'getGroups']);
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
                'recruit.onboarding.welcome'
            );
            mockOnboardingService.processCandidateAcceptance.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/member-acceptance-process/index.json')
            );
            mockNetworksService.getCompanyDescription.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/network-companysummary/index.json')
            );
            mockMembersgService.me.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/member-me/index.json')
            );
            createControllerWelcome = function() {
                return $controller('onboardingWelcomeCtrl', {
                    '$scope': $scope,
                });
            };
        });
    });

    it('should initialization the onboardingWelcomeCtrl object for load data from the api and set location correctly', function() {
        var controller = createControllerWelcome();
        $scope.$digest();
        expect($scope.isLoading).toBe(false);
        expect($scope.isOnboarding).toBe(true);
        expect($scope.progress.length).toBe('0%');
        expect($scope.currentUser.network.Name).toBe('Sherpa Systems');
        expect($scope.onboarding.NetworkName).toBe('NetworkName');
        expect($scope.onboarding.companyDescription).toBe('CompanyDescription');
        expect($location.path()).toBe('/recruit/onboarding/welcome');
    });

    it('should loading and set location correctly when call onboarding_welcome function', function() {
        var controller = createControllerWelcome();
        $scope.$digest();
        $scope.onboarding_welcome();
        $scope.$digest();

        expect($scope.isLoading).toBe(false);
        expect(mockOnboardingService.processCandidateAcceptance).toHaveBeenCalled();
        expect($location.path()).toBe('/recruit/onboarding/terms');
    });
});