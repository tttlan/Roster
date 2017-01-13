// Controller NextShiftCtrl
// ----------------------------------------

describe('Unit: Controller:NextShiftCtrl', function() {

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
                return $controller('NextShiftCtrl', {
                    '$scope': $scope
                });
            };

            $httpBackend.when('GET', API_BASE_URL + 'presentation/navigationentries/Web/All?context=.').respond(200, 
                getJSONFixture('presentation/navigationentries/Web/All/index.json')
            );                           
        });
    });

    it('should be able to load shift and permissions data', function(){

        $httpBackend.when('GET', API_BASE_URL + 'roster/shift/upcomingshifts/' + moment().format('YYYY-MM-DD') + '/14').respond(200, 
            getJSONFixture('roster/shift/upcomingshifts/index.json')
        );

        var controller = createController();  
                        
        expect($scope.loading).toEqual(true);
        expect($scope.error).toEqual(false);
        expect($scope.isVisible).toEqual(false);

        $httpBackend.flush(); // Trigger the reques to get roster interfaceSource
        
        expect($scope.loading).toEqual(false);
        expect($scope.isVisible).toEqual(true);
        expect($scope.days.length).toEqual(14);
        expect($scope.days[0].shifts[0].Location).toEqual('Bondi Store');
        expect($scope.days[0].shifts[0].StartTime).toEqual('2014-10-16T09:00:00');
        expect($scope.days[0].shifts[0].Hour).toEqual(3);
    });
    
    it('should be able to handle an error', function(){

        $httpBackend.when('GET', API_BASE_URL + 'roster/shift/upcomingshifts/' + moment().format('YYYY-MM-DD') + '/14').respond(400, 
            {error: true}
        );

        var controller = createController();  
                        
        expect($scope.loading).toEqual(true);
        expect($scope.error).toEqual(false);
        expect($scope.isVisible).toEqual(false);

        $httpBackend.flush(); // Trigger the reques to get roster interfaceSource
        
        expect($scope.loading).toEqual(false);
        expect($scope.isVisible).toEqual(true);
        expect($scope.error).toEqual(true);
    });

});
