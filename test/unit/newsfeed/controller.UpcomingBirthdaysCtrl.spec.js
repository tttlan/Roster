// Controller UpcomingBirthdaysCtrl
// ----------------------------------------

describe('Unit: Controller:UpcomingBirthdaysCtrl', function() {

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
                return $controller('UpcomingBirthdaysCtrl', {
                    '$scope': $scope
                });
            };                         
        });
    });

    it('should be able to load shift and permissions data', function(){

        $httpBackend.when('GET', API_BASE_URL + 'events/upcomingbirthdays').respond(200, 
            getJSONFixture('events/upcomingbirthdays/index.json')
        );

        var controller = createController();  
                        
        expect($scope.loading).toEqual(true);
        expect($scope.error).toEqual(false);
        expect($scope.limit).toEqual(4);
         
        $httpBackend.flush(); // Trigger the reques to get roster interfaceSource
         
        expect($scope.loading).toEqual(false);
        expect($scope.birthdays[0].MemberBirthdays.FirstName).toEqual('Chee Kin'); 
        expect($scope.birthdays[0].MemberBirthdays.Surname).toEqual('Cheong'); 
        expect($scope.birthdays[0].MemberBirthdays.MemberName).toEqual('Chee Kin Cheong');
        expect($scope.birthdays[0].MemberBirthdays.Birthday).toEqual('Oct 16'); 
        expect($scope.birthdays[0].MemberBirthdays.MemberId).toEqual('337250'); 
    });
    
    it('should be able to handle an error', function(){

        $httpBackend.when('GET', API_BASE_URL + 'events/upcomingbirthdays').respond(400,
            {error: true}
        );

        var controller = createController();  
                        
        expect($scope.error).toEqual(false);
         
        $httpBackend.flush(); // Trigger the reques to get roster interfaceSource

        expect($scope.error).toEqual(true);
    });
    
    it('can show more birthdays', function(){

        $httpBackend.when('GET', API_BASE_URL + 'events/upcomingbirthdays').respond(200, 
            getJSONFixture('events/upcomingbirthdays/index.json')
        );

        var controller = createController();  
         
        $httpBackend.flush(); // Trigger the reques to get roster interfaceSource

        $scope.showAll();
        
        expect($scope.limit).toEqual(42);
    });

});
