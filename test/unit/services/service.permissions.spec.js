// Permissions Service
// ----------------------------------------

describe('Unit: Service:Permissions', function() {

    var Permissions, API_BASE_URL, $httpBackend;

    beforeEach(function () {
        module('sherpa');

        inject(function($compile, $rootScope, $injector) {

            // set up any required services
            Permissions = $injector.get('Permissions');
            API_BASE_URL = $injector.get('API_BASE_URL');
            $httpBackend = $injector.get('$httpBackend');
            
            jasmine.getJSONFixtures().fixturesPath = 'base/interfaceSource/test/mockData/api/';
            
            $httpBackend.when('GET', API_BASE_URL + 'presentation/navigationentries/Web/All?context=.').respond(200, 
                getJSONFixture('presentation/navigationentries/Web/All/index.json')
            );
        });
    });
    
    
    it('can retrieive permissions for pages when a path is inputted', function() {
        
        Permissions.canIHas('/dashboard', true).then(function(isAllowed){
            expect(isAllowed).toEqual(true);
        });
        
        Permissions.canIHas('/notarealpath', true).then(function(isAllowed){
            expect(isAllowed).toEqual(false);
        });
        
        $httpBackend.flush();
    });
    
    
        
    it('can retrieive permissions for pages when an id is inputted', function() {
        
        Permissions.canIHas('mnuNetworkFeed', false).then(function(isAllowed){
            expect(isAllowed).toEqual(true);
        });
        
        Permissions.canIHas('notarealpathid', true).then(function(isAllowed){
            expect(isAllowed).toEqual(false);
        });
        
        $httpBackend.flush();
    });
    
    it('can retrieive permissions for pages when an id is inputted', function() {
    
        // Check there are no requests, then create a request and flush it and verify it has passed through.
        // The isReady function exposes the call to check permissions which is internal to the permissions service
    
        $httpBackend.verifyNoOutstandingRequest();
    
        Permissions.isReady().then(function(){
            $httpBackend.verifyNoOutstandingRequest();
        });
    
        $httpBackend.flush();
    });
    
    it('can format a set of permissions (entity actions) that are retrieved from another API', function() {
        
        var formattedPermissions = Permissions.formatPermissions([{"$id":"22","Id":null,"Code":2,"Caption":"Edit","Description":"Edit","ActionUrl":null,"Children":null},{"$id":"25","Id":null,"Code":2,"Caption":"Edit","Description":"Edit","ActionUrl":null,"Children":null},{"$id":"26","Id":null,"Code":1,"Caption":"Add","Description":"Add","ActionUrl":null,"Children":null},{"$id":"27","Id":null,"Code":1,"Caption":"Create","Description":"Create stuff","ActionUrl":null,"Children":null}]);
        
        expect(formattedPermissions).toEqual({edit: true, add: true, create: true});
    });
    
});
