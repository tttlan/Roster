// Controller profileDocumentation
// ----------------------------------------

describe('Unit: Controller:profileDocumentation', function() {

    var $scope, $location, $timeout, createController, Profile, API_BASE_URL, $httpBackend, memberId = '';

    beforeEach(function() {
        module('sherpa');
        module('templates');
        
        module(function ($provide) {
            $provide.provider('$routeParams', function () {
                this.$get = function () {
                    return {
                        memberId: memberId
                    };
                };
            });
        });
            
        inject(function($rootScope, $controller, _$location_, $injector, _$timeout_) {
        
            $scope = $rootScope.$new();
            $location = _$location_;
            $httpBackend = $injector.get('$httpBackend');
            Profile = $injector.get('Profile');
            API_BASE_URL = $injector.get('API_BASE_URL');
            $timeout = _$timeout_;
        
            // For some reason base is needed here.  No idea why, found the answer here:
            // http://stackoverflow.com/questions/17370427/loading-a-mock-json-file-within-karmaangularjs-test
            jasmine.getJSONFixtures().fixturesPath = 'base/interfaceSource/test/mockData/api/';

            $scope.profile = { $userCan: {} };
            createController = function() {
                return $controller('profileDocumentation', {
                    '$scope': $scope
                });
            };
            
            // Get system info for a specific user
            $httpBackend.when('GET', API_BASE_URL + 'documents/' + (memberId ? memberId : 'me') + '/onboarddocument').respond(200, 
               getJSONFixture('documents/onboarddocument/index.json')
            ); 
            
            $httpBackend.when('GET', API_BASE_URL + 'documents/' + (memberId ? memberId : 'me') + '/hardcopy').respond(200, 
               getJSONFixture('documents/onboarddocument/index.json')
            );        
        });        
    });
    
    it('can load onboard documents and hardcopy documents apis for the current user', function(){
        
        var controller = createController();

        $location.path('/profile/?tab=documentation');
        expect($location.path()).toBe('/profile/?tab=documentation');

        $httpBackend.flush();
        
        memberId = 1234;
    });
    
    it('can load onboard documents and hardcopy documents apis for a specified user', function(){
        
        var controller = createController();

        $location.path('/profile/1234/?tab=documentation');
        expect($location.path()).toBe('/profile/1234/?tab=documentation');

        $httpBackend.flush();
    });
    
    it('can format data from the onboarding docs and hardcopy docs apis into the correct object structure', function(){
        
        var controller = createController();

        expect($scope.documentation.onboarding.$loaded).toEqual(false);
        expect($scope.documentation.paper.$loaded).toEqual(false);
        
        $httpBackend.flush();
        
        expect($scope.documentation.onboarding.$loaded).toEqual(true);
        expect($scope.documentation.paper.$loaded).toEqual(true);
        
        expect($scope.documentation.onboarding.$userCan.canupload).toEqual('/documents');
        expect($scope.documentation.onboarding.documents.length).toEqual(2);
        expect($scope.documentation.onboarding.documents[1].OnboardDocument.OnboardDocumentId).toEqual(7079);
        expect($scope.documentation.onboarding.documents[1].OnboardDocument.FileName).toEqual('Keef.docx');
        
        // expect($scope.documentation.paper.$userCan.canupload).toEqual('/documents');
        // expect($scope.documentation.paper.documents.length).toEqual(2);
        // expect($scope.documentation.paper.documents[1].OnboardDocument.OnboardDocumentId).toEqual(7079);
        // expect($scope.documentation.paper.documents[1].OnboardDocument.FileName).toEqual('Keef.docx');
    });
    
});
