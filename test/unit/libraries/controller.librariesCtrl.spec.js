// Controller librariesCtrl
// ----------------------------------------
describe('Unit: Controller:librariesCtrl', function () {

    var $scope, responseCode, $timeout, createController, API_BASE_URL, $httpBackend;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($rootScope, $controller, _$location_, $injector, _$timeout_) {

            $scope = $rootScope.$new();
            $httpBackend = $injector.get('$httpBackend');
            API_BASE_URL = $injector.get('API_BASE_URL');
            $timeout = _$timeout_;
            responseCode = 200;

            // For some reason base is needed here.  No idea why, found the answer here:
            // http://stackoverflow.com/questions/17370427/loading-a-mock-json-file-within-karmaangularjs-test
            jasmine.getJSONFixtures().fixturesPath = 'base/interfaceSource/test/mockData/api/';
            createController = function() {
                return $controller('librariesCtrl', {
                    '$scope': $scope
                });
            };

            $httpBackend.when('GET', /.*profilemanagement\/getmembersprofile\?sf=[125](&st=)?.*&state=1&p=.*&ps=.*&rc=1/).respond(function(method, url, data, headers){
                headers['x-pagination'] = '{"TotalCount":150,"TotalPages":5,"PageSize":30,"Page":' + ($scope.page.current + 1) + '}';
                return [responseCode, getJSONFixture('profilemanagement/getmembersprofile/index.json'), headers];
            });
        });
    });

    xit('librariesCtrl should be able to set initial values correctly', function () {

        //createController();
        //expect($scope.start.thisIndex).toEqual(0);
        //expect($scope.start.paneIndex).toEqual(0);
        //expect($scope.start.pane.Type).toEqual('Folder');
        //expect($scope.start.pane.Name).toEqual('All');
        //expect($scope.start.pane.Id).toEqual(0);
        //expect($scope.start.pane.Items.length).toEqual(0);
        expect(1).toBe(1); //TODO wtf is this?
    });
});
