// Controller eventsListingCtrl
// ----------------------------------------

describe('Unit: Controller:eventsListingCtrl', function() {

    var $scope, $httpBackend, $timeout, createController, loadBackendMocks, Events, API_BASE_URL;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($rootScope, $controller, $injector, _$timeout_, $compile) {
            
            $scope = $rootScope.$new();
            $httpBackend = $injector.get('$httpBackend');
            Events = $injector.get('Events');
            API_BASE_URL = $injector.get('API_BASE_URL');
            $timeout = _$timeout_;

            // For some reason 'base' is needed here.  No idea why, found the answer here:
            // http://stackoverflow.com/questions/17370427/loading-a-mock-json-file-within-karmaangularjs-test
            jasmine.getJSONFixtures().fixturesPath = 'base/interfaceSource/test/mockData/api/events/';

            createController = function() {
                return $controller('eventsListingCtrl', {
                    '$scope': $scope
                });
            };  

            loadBackendMocks = function(status) {
                
                $httpBackend.when('GET', API_BASE_URL + 'Events?p=1&ps=9&rc=0&f=1').respond(status, 
                    getJSONFixture('all/index.json')
                );
            }

        });
    });

    it('should load data from the api and set permissions correctly', function(){

        var controller = createController();  
        loadBackendMocks(200);

        $scope.getEvents(1, 9, false, true, '1').then(function(res){

            expect(res.data[0].EventFeedEntrySummary.EventId).toEqual(35);
            expect(res.data[0].EventFeedEntrySummary.Owner.FirstName).toEqual('Sherpa');
        });

        $httpBackend.flush();
        $scope.$apply();

        expect($scope.$userCan.add).toBe(true);
        
        // All other functionality is tested as part of the pagination directive unit test

    });

});
