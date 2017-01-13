describe('Unit: Controller:onboardingCompletionCtrl', function() {

    var $scope, $location, createControllerCompletion, mockMembersgService, mockOnboardingService, mockDataService;
    beforeEach(function () {
        module('sherpa');
        module('templates');
        module('test.services');

        mockOnboardingService = jasmine.createSpyObj('Onboarding',['processCandidateAcceptance', 'memberAcceptance', 'getRouteFromAcceptanceStage']);
        mockMembersgService = jasmine.createSpyObj('Members',['me']);

        module(function($provide) {
            $provide.value('Onboarding', mockOnboardingService);
            $provide.value('Members', mockMembersgService);
        });
        inject(function($rootScope, $controller, _$location_, $injector, _mockDataService_, _Paths_) {
            $scope = $rootScope.$new();
            $location = _$location_;
            mockDataService = _mockDataService_;

            mockOnboardingService.memberAcceptance.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/member-acceptance/index.json')
            );
            mockOnboardingService.processCandidateAcceptance.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/member-acceptance-process/index.json')
            );
            mockMembersgService.me.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/member-me/index.json')
            );
            mockOnboardingService.getRouteFromAcceptanceStage.and.returnValue(
                'recruit.onboarding.completion'
            );
            createControllerCompletion = function() {
                return $controller('onboardingCompletionCtrl', {
                    '$scope': $scope
                });
            };
        });
    });

    it('should initialization the onboardingCompletionCtrl object for load data from the api and set location correctly', function() {
        var controller = createControllerCompletion();

        $scope.$digest();
        expect($scope.isLoading).toBe(false);
        expect($scope.progress.length).toBe('96%');
        expect($location.path()).toBe('/recruit/onboarding/completion');
    });

    it('should loading and set location correctly when call onboarding_completion function', function() {
        var controller = createControllerCompletion();
        $scope.$digest();
        
        $scope.onboarding_completion();
        $scope.$digest();

        expect($scope.isLoading).toBe(false);
        expect(mockOnboardingService.processCandidateAcceptance).toHaveBeenCalled();
    });
});