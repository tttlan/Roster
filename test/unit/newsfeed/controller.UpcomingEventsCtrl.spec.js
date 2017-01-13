// Controller UpcomingEventsCtrl
// ----------------------------------------

describe('Unit: Controller:UpcomingEventsCtrl', function() {

    var $scope, $location, $timeout, createController, API_BASE_URL, $httpBackend;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($rootScope, $controller, _$location_, $injector, _$timeout_) {
            
            $scope = $rootScope.$new();
            $location = _$location_;
            $httpBackend = $injector.get('$httpBackend');
            API_BASE_URL = $injector.get('API_BASE_URL');
            $timeout = _$timeout_;

            // For some reason base is needed here.  No idea why, found the answer here:
            // http://stackoverflow.com/questions/17370427/loading-a-mock-json-file-within-karmaangularjs-test
            jasmine.getJSONFixtures().fixturesPath = 'base/interfaceSource/test/mockData/api/';

            createController = function() {
                return $controller('UpcomingEventsCtrl', {
                    '$scope': $scope
                });
            };                          
        });
    });

    it('should be able to load shift and permissions data', function(){

        $httpBackend.when('GET', API_BASE_URL + 'events/upcomingevents?rs=5').respond(200,
            getJSONFixture('events/upcomingevents/index.json')
        );

        var controller = createController();  
                        
        expect($scope.loading).toEqual(true);
        expect($scope.error).toEqual(false);
        
        $httpBackend.flush(); // Trigger the reques to get roster interfaceSource

        expect($scope.events[0].EventWidget.EventId).toEqual(3303);
        expect($scope.events[0].EventWidget.Title).toEqual('Tiep: test update event');
        expect($scope.events[0].EventWidget.StartDate).toEqual('2015-08-13T14:00:00Z');
                
        expect($scope.loading).toEqual(false); 
    });
    
    it('should be able to handle an error', function(){

        $httpBackend.when('GET', API_BASE_URL + 'events/upcomingevents?rs=5').respond(400,
            {error: true}
        );

        var controller = createController();  
                        
        expect($scope.error).toEqual(false);
         
        $httpBackend.flush(); // Trigger the reques to get roster interfaceSource

        expect($scope.error).toEqual(true);
    });

});
