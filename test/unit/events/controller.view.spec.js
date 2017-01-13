// Controller eventDetailCTRL
// ----------------------------------------

describe('Unit: Controller:eventDetailCTRL', function() {

    var $scope, $location, $httpBackend, $timeout, createController, loadBackendMocks, Events, API_BASE_URL;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($rootScope, $controller, _$location_, $injector, _$timeout_) {
            
            $scope = $rootScope.$new();
            $location = _$location_;
            $httpBackend = $injector.get('$httpBackend');
            Events = $injector.get('Events');
            API_BASE_URL = $injector.get('API_BASE_URL');
            $timeout = _$timeout_;

            // For some reason 'base' is needed here.  No idea why, found the answer here:
            // http://stackoverflow.com/questions/17370427/loading-a-mock-json-file-within-karmaangularjs-test
            jasmine.getJSONFixtures().fixturesPath = 'base/interfaceSource/test/mockData/api/';

            createController = function() {
                return $controller('eventsDetailCtrl', {
                    '$scope': $scope,
                    $routeParams: {id: 37}
                });
            };  

            loadBackendMocks = function(status) {
                
                $httpBackend.when('GET', API_BASE_URL + 'events/37').respond(status, 
                    getJSONFixture('events/37/index.json')
                );

                $httpBackend.when('GET', API_BASE_URL + 'events/37/invites?f=1&p=1&ps=10&rc=1').respond(status, 
                    getJSONFixture('events/37/invites/attending.json')
                );

                $httpBackend.when('GET', API_BASE_URL + 'events/37/invites?f=0&p=1&ps=10&rc=1').respond(status, 
                    getJSONFixture('events/37/invites/invited.json')
                );
                
                $httpBackend.when('GET', API_BASE_URL + 'events/37/invites?f=0&p=2&ps=10&rc=1').respond(status, 
                    getJSONFixture('events/37/invites/invited2.json')
                );

                $httpBackend.when('GET', API_BASE_URL + 'members/me').respond(status, 
                    getJSONFixture('members/me/index.json')
                );

                $httpBackend.when('POST', API_BASE_URL + 'events/37/invitestatus/3').respond(status, 
                    getJSONFixture('events/37/invitestatus/index.json')
                );
            }

        });
    });

    it('should load the basic events data and place it in scope correctly', function(){

        var controller = createController();  
        loadBackendMocks(200);

        $location.path('/events/37');
        expect($location.path()).toBe('/events/37');
        
        $httpBackend.flush();

        // Expect basic values to be set
        expect($scope.event.Title).toEqual('george\'s event');
        expect($scope.event.EndDate).toEqual('2015-02-25T20:00:00');
        expect($scope.title).toEqual('george\'s event | ');
    });

    it('should retrieve the initial invitees from the invites API and store them in memory correctly', function(){
    
        var controller = createController();
        loadBackendMocks(200);
    
        $httpBackend.flush();
        
        expect($scope.event.invitees.attending.people[0].EventInviteMember.MemberSummary.FirstName).toEqual('Sherpa');
        expect($scope.event.invitees.attending.count).toEqual(1);    
    });
    
    it('should retrieve the invitees from a clicked tab from the invites API and then a second page of invitees and store them in memory correctly', function(){
        
        var controller = createController();
        loadBackendMocks(200);
    
        $httpBackend.flush();
    
        $scope.event.loadInvitees('invited', 'initial');
        $httpBackend.flush();

        expect($scope.event.invitees.invited.people[0].EventInviteMember.MemberSummary.FirstName).toEqual('Sherpa');
        expect($scope.event.invitees.invited.count).toEqual(15);
        
        $scope.event.loadInvitees('invited');
        $httpBackend.flush();
        
        expect($scope.event.invitees.invited.people[10].EventInviteMember.MemberSummary.FirstName).toEqual('Ross');
        expect($scope.event.invitees.invited.people[14].EventInviteMember.MemberSummary.FirstName).toEqual('Kate');
    });
    
    it('should retrieve and set permissions correctly', function(){
    
        var controller = createController(); 
        loadBackendMocks(200);
    
        $httpBackend.flush();
    
        expect($scope.event.$userCan.view).toEqual(true);
        expect($scope.event.$userCan.edit).toEqual(true);
        expect($scope.event.$userCan.eventFound).toEqual(true);
        expect($scope.event.$userCan.cancomment).toEqual(true);
        expect($scope.event.$userCan.canrsvpevent).toEqual(true);
    });
    
    it('should handle errors appropriately', function(){
    
        var controller = createController(); 
        loadBackendMocks(404);
    
        $httpBackend.flush();
    
        // Testing a 404 for loading the main events data
        expect($scope.event.$loaded).toBe(true);        
        expect($scope.event.$userCan.eventFound).toBe(false);
        expect($scope.event.$userCan.view).toBe(true); 
    
        // Set a few vars manually since the mocks failed
        $scope.event.EventId = 37;
        $scope.event.MemberInviteStatus = 1;
    
        // Then set an RSVP
        $scope.event.setRsvp(3); // Set a new RSVP to the event
    
        $httpBackend.flush();
    
        // Expect the RSVP to fail and the invite status to be set back to it's original value
        expect($scope.event.MemberInviteStatus).toEqual(1);
    });
    
    it('should set RSVPs correctly', function(){
    
        var controller = createController(); 
        loadBackendMocks(200);
    
        $httpBackend.flush(); // Flush initial requests that are triggered when loading a controller
    
        $scope.event.setRsvp(1); // Set an RSVP to an event that is no different to the current

        // Expect that there is no request to flush here since the RSVP did not change    
        $httpBackend.verifyNoOutstandingRequest();

        $scope.event.setRsvp(3); // Set a new RSVP to the event
    
        $httpBackend.flush(); // Then flush again after setting the RSVP

        // Check that the invitee was moved to the correct list
        expect($scope.event.invitees.attending.count).toEqual(0);
        expect($scope.event.invitees.attending.people.length).toEqual(0);
        expect($scope.event.invitees.not.count).toEqual(1); 
        expect($scope.event.invitees.not.people.length).toEqual(1);
    });
    
    it('should be able to load a modal showing a map of the event', function(){
        
        var controller = createController(); 
        loadBackendMocks(200);
    
        $httpBackend.flush(); // Flush initial requests that are triggered when loading a controller
                
        $scope.event.showMap();
        
        expect($scope.event.modal.opened).toEqual(jasmine.any(Object));
        // Test that the modal opened!
    });

});
