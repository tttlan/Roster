// Controller dashboardDirectoryCtrl
// ----------------------------------------

describe('Unit: Controller:dashboardDirectoryCtrl', function() {

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
                return $controller('dashboardDirectoryCtrl', {
                    '$scope': $scope
                });
            }; 
                        
            $httpBackend.when('GET', /.*profilemanagement\/getmembersprofile\?sf=[125](&st=)?.*&state=1&p=.*&ps=.*&rc=1/).respond(function(method, url, data, headers){
                headers['x-pagination'] = '{"TotalCount":150,"TotalPages":5,"PageSize":30,"Page":' + ($scope.page.current + 1) + '}';
                return [responseCode, getJSONFixture('profilemanagement/membersprofile/index.json'), headers];         
            });
        });
    });

    it('should be able to set initial values correctly', function(){
        
        var controller = createController();     
        
        expect($scope.chars).toEqual(['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']);
        expect($scope.nextChar).toBeNull();
        
        expect($scope.filterBy.name).toEqual('');
        expect($scope.filterBy.role).toEqual('');
        expect($scope.filterBy.group).toEqual('');
        
        expect($scope.page.searchOpts).toEqual(2);
        expect($scope.page.searchTerm).toEqual('');
        expect($scope.page.searchTermPrev).toEqual('');
        expect($scope.page.searchOptsName).toEqual('name');
        expect($scope.page.searching).toEqual(false);
        expect($scope.page.current).toEqual(1);
        expect($scope.page.state).toEqual(1);
        expect($scope.page.size).toEqual(30);
        expect($scope.page.grandTotal).toEqual(0);
        expect($scope.page.filter).toEqual({Fullname: undefined});
        expect($scope.page.items).toEqual([]);
    
        // Values that are set in fetchItems()
        expect($scope.page.loading).toEqual(true);
        expect($scope.page.end).toEqual(false);
    });
    
    it('should be able to perform the inital request for directory data', function(){
        
        var controller = createController();     
                
        $httpBackend.flush();
    
        // Test that pagination came back from the server and was correctly set
        expect($scope.page.size).toEqual(30);
        expect($scope.page.total).toEqual(150);
        expect($scope.page.totalPages).toEqual(5);
        expect($scope.page.grandTotal).toEqual(150);
        
        // Test that the data was placed correctly, this data replaces any data that was existing, it's not appended on
        expect($scope.page.items[0].MemberId).toEqual('458730');
        expect($scope.page.items[0].UserStatus).toEqual('');
        expect($scope.page.items[0].Active).toEqual(true);
        expect($scope.page.items[0].Surname).toEqual('sur');
        expect($scope.page.items[0].GroupsList[0].NetworkGroupId).toEqual(9150);
        expect($scope.page.items.length).toEqual(30);
        
        expect($scope.page.loading).toEqual(false);
        expect($scope.page.error).toEqual(false);
        expect($scope.page.hasData).toEqual(true);
    });
            
    it('should be able to handle an error response from the API', function(){
        
        var controller = createController();     
        responseCode = 400; // Set an error response to test that errors are handled
    
        $httpBackend.flush();
        
        expect($scope.page.loading).toEqual(false);
        expect($scope.page.error).toEqual(true);
        expect($scope.page.hasData).toEqual(false);
    });
    
    it('should be able to formulate a request correctly when input is typed into the directory search box', function(){
        
        var controller = createController();     
        
        $httpBackend.flush();
    
        expect($scope.page.searchTerm).toEqual('');
        expect($scope.filterBy.name).toEqual('');
        expect($scope.filterBy.role).toEqual('');
        expect($scope.filterBy.group).toEqual('');
        
        // Type a search query that's one character long
        $scope.searchQuery('a');        
        expect($scope.page.searchTerm).toEqual('a');
        expect($scope.filterBy.name).toEqual('a'); // Assert that the filterBy property is being set.  Only going to check this with a one char length search term
        
        $scope.searchQuery('ab');        
        expect($scope.page.searchTerm).toEqual('a'); // Any two char search term should be shortened to just the first char
        
        $scope.searchQuery('abc  ');        
        expect($scope.page.searchTerm).toEqual('abc'); // Any three char search term should not be shortened
        
        // At this point we can test that a request is going to be fired off because the curr search val is different to the previous
        expect($scope.page.current).toEqual(1);
        expect($scope.page.searchTermPrev).toEqual($scope.page.searchTerm);
        
        $scope.searchQuery('');        
        expect($scope.page.searchTerm).toEqual(''); // Any three char search term should not be shortened
        
        // Now testing that the reset page fn has been called since the input has been reset
        expect($scope.page.searching).toEqual(false);
        expect($scope.page.searchTermPrev).toEqual('');
        expect($scope.searchVal).toEqual('');
        expect($scope.page.end).toEqual(false);
        expect($scope.page.current).toEqual(1);
        expect($scope.page.searchTermPrev).toEqual('');
    });
    
    it('should be able to fire off a second request and append the contents of the new request to the existing directory contents', function(){
        
        var controller = createController();     
                
        $httpBackend.flush(); // Initial request has been triggered
        
        $scope.fetchNext(); // Then request another page
        
        $httpBackend.flush();
        
        expect($scope.page.items.length).toEqual(60); // Now we should have 60 items
        expect($scope.page.current).toEqual(2);
        
    });
    
    it('should load in the first 4 pages on inital page load if the search term is more than three characters', function(){
        
        var controller = createController();     
                
        $httpBackend.flush(); // Initial request has been triggered
        
        $scope.searchQuery('abcde');
        
        $httpBackend.flush();  
        
        expect($scope.page.items.length).toEqual(120); // Now we should have 60 items
        expect($scope.page.current).toEqual(4);
    });
    
    it('should be able to set filter options and retrieve correctly filtered api data', function(){
        
        var controller = createController();     
                
        $httpBackend.flush(); // Initial request has been triggered
        
        $scope.page.searchOpts = 1;
        
        $scope.searchQuery('a');
        
        expect($scope.filterBy.group).toEqual('a');
        expect($scope.filterBy.role).toEqual('');
        expect($scope.filterBy.name).toEqual('');

        $scope.page.searchOpts = 5;
        
        $scope.searchQuery('a');
        
        expect($scope.filterBy.group).toEqual('');
        expect($scope.filterBy.role).toEqual('a');
        expect($scope.filterBy.name).toEqual('');

        $httpBackend.flush();
    });
    
    it('should be able to set filter options and retrieve correctly filtered api data', function(){
        
        var controller = createController();     
                
        $httpBackend.flush(); // Initial request has been triggered
        
        $scope.setSearchQuery('a', 2);
        
        expect($scope.page.searching).toEqual(false);
        expect($scope.page.searchTermPrev).toEqual('a');
        expect($scope.searchVal).toEqual('');
        expect($scope.page.end).toEqual(false);
        expect($scope.page.items).toEqual([]);
        expect($scope.page.searchOpts).toEqual(2);
        
        $httpBackend.flush(); // Then check we have a pending request
        
        expect($scope.page.items.length).toEqual(30);
        
        // Then test the update input proprty (third option passed to fn)
        $scope.setSearchQuery('b', 2, true);
        
        expect($scope.searchVal).toEqual('b');        
    });
    
});
