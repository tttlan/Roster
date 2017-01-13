// Controller profileCommon
// ----------------------------------------

describe('Unit: Controller:profileCommon', function() {

    var $scope, $location, $timeout, createController, $httpBackend, Profile, API_BASE_URL,
        memberId = 1234;

    beforeEach(function () {
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
            jasmine.getJSONFixtures().fixturesPath = 'base/interfaceSource/test/mockData/api/profilemanagement/';

            $scope.profile = { $userCan: {} };
            createController = function() {
                return $controller('profileCommon', {
                    '$scope': $scope
                });
            };

            $httpBackend.when('GET', API_BASE_URL + 'profilemanagement/me/profilerecord').respond(200, 
                getJSONFixture('profilerecord/index.json')
            );  

            $httpBackend.when('GET', API_BASE_URL + 'profilemanagement/1234/profilerecord').respond(200, 
                getJSONFixture('profilerecord/index.json')
            );                           
        });
    });

    it('should set up some basic variables and functions and load the profile record for a specific member', function(){

        var controller = createController();  

        $location.path('/profile/1234');
        expect($location.path()).toBe('/profile/1234');

        expect($scope.profile.$loaded).toEqual(false);

        $httpBackend.flush();

        // Expect basic values to be set
        expect($scope.profile.$ownProfile).toEqual(false);
        expect($scope.profile.MemberId).toEqual('247682');
        expect($scope.profile.FirstName).toEqual('Sherpa');
        expect($scope.profile.Postcode).toEqual('3000');
        expect($scope.title).toEqual('Sherpa\'s profile - undefined | ');
        expect($scope.profile.groupLimit).toEqual(3);
        expect($scope.profile.$loaded).toEqual(true);

        $scope.profile.showAllGroups();

        // And a few more after showAllGroups has been run
        expect($scope.profile.groupLimit).toEqual(13);
        expect($scope.profile.$hideGroupToggle).toEqual(true);
        
        memberId = '';
    });
    
    it('it can load the profile record for the current member', function(){
        
        var controller = createController();  

        $location.path('/profile');
        expect($location.path()).toBe('/profile');

        $httpBackend.flush();

        // Expect basic values to be set
        expect($scope.profile.$ownProfile).toEqual(true);
    });
    
    it('should set permissions for the profile tabs', function(){
    
        var controller = createController();

        $httpBackend.flush();

        expect($scope.profile.$userCan.viewprofileemploymentdetail).toEqual(true);
        expect($scope.profile.$userCan.caneditbanking).toEqual(true);
        expect($scope.profile.$userCan.canviewchangepassword).toEqual(true);
        expect($scope.profile.$userCan.caneditprofileemployeedetail).toEqual(true);
    });
    
    it('can set a new page url', function(){
        
        var controller = createController();  

        $location.path('/profile/1234');
        expect($location.path()).toBe('/profile/1234');

        $httpBackend.flush();
        
        $scope.profile.updateUrl(0);        
        expect($location.search().tab).toBe('wall'); // The search fn retuns the query string params
        
        $scope.profile.updateUrl(1);        
        expect($location.search().tab).toBe('about');
        
        $scope.profile.updateUrl(2);        
        expect($location.search().tab).toBe('employment-details');
        
        $scope.profile.updateUrl(3);        
        expect($location.search().tab).toBe('history');
        
        $scope.profile.updateUrl(4);        
        expect($location.search().tab).toBe('documentation'); 
        
        $scope.profile.updateUrl(5);        
        expect($location.search().tab).toBe('system-settings');
        
        $scope.profile.updateUrl(6);        
        expect($location.search().tab).toBe('workflows');
    });

});
