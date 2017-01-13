describe('Unit: Controller:onboardingDeclarationCtrl', function() {

    var $scope, $location, createControllerDeclaration, mockDataService, mockOnboardingService, mockNetworksgService;
    beforeEach(function () {
        module('sherpa');
        module('templates');
        module('test.services');

        mockOnboardingService = jasmine.createSpyObj('Onboarding',[
            'memberAcceptance', 
            'getRouteFromAcceptanceStage', 
            'setupMemberTfnFromModel',
            'setupMemberTfnFromView',
            'updateTfnDeclaration']);
        mockNetworksgService = jasmine.createSpyObj('Networks',['getCountriesPromise']);

        module(function($provide) {
            $provide.value('Onboarding', mockOnboardingService);
            $provide.value('Networks', mockNetworksgService);
        });
        inject(function($rootScope, $controller, _$location_, $injector, _mockDataService_, _Paths_) {
            $scope = $rootScope.$new();
            $location = _$location_;
            mockDataService = _mockDataService_;

            mockOnboardingService.memberAcceptance.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/member-acceptance/index.json')
            );
            mockNetworksgService.getCountriesPromise.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/countries-promise/index.json')
            );
            mockOnboardingService.getRouteFromAcceptanceStage.and.returnValue(
                'recruit.onboarding.declaration'
            );
            mockOnboardingService.setupMemberTfnFromModel.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/setup-member-from-model/index.json')
            );
            mockOnboardingService.setupMemberTfnFromView.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/setup-member-from-model/index.json')
            );
            mockOnboardingService.updateTfnDeclaration.and.returnValue(
                _mockDataService_.get('api/recruit/onboarding/setup-member-from-model/index.json')
            );
            createControllerDeclaration = function() {
                return $controller('onboardingDeclarationCtrl', {
                    '$scope': $scope
                });
            };
        });
    });

    it('should initialization the onboardingDeclarationCtrl object for load data from the api and set location correctly', function() {
        var controller = createControllerDeclaration();
        $scope.$digest();
        expect($scope.isLoading).toBe(false);
        expect($scope.progress.length).toBe('56%');
        expect(mockOnboardingService.setupMemberTfnFromModel).toHaveBeenCalled();
        expect($location.path()).toBe('/recruit/onboarding/declaration');
    });

    it('should loading and set location correctly when call onboarding_tfnDeclaration function', function() {
        var controller = createControllerDeclaration();
        $scope.$digest();
        
        $scope.tfnForm = {};
        $scope.onboarding_tfnDeclaration();
        $scope.$digest();

        expect($scope.isLoading).toBe(false);
        expect(mockOnboardingService.setupMemberTfnFromView).toHaveBeenCalled();
        expect(mockOnboardingService.updateTfnDeclaration).toHaveBeenCalled();
        expect($location.path()).toBe('/recruit/onboarding/signature');
    });
});