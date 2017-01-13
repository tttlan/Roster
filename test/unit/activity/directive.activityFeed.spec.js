// Activity Feed directive
// ----------------------------------------

describe('Unit: Directives: activityFeed', function() {

    var element, createElem, $scope, $timeout, $compile, Activities, template, $httpBackend, API_BASE_URL;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($compile, $rootScope, $injector, _$timeout_) {

            // set up any required services
            Activities = $injector.get('Activities');
            $httpBackend = $injector.get('$httpBackend');
            API_BASE_URL = $injector.get('API_BASE_URL');
            $timeout = _$timeout_;
            
            // For some reason base is needed here.  No idea why, found the answer here:
            // http://stackoverflow.com/questions/17370427/loading-a-mock-json-file-within-karmaangularjs-test
            jasmine.getJSONFixtures().fixturesPath = 'base/interfaceSource/test/mockData/api/';
        
            $httpBackend.when('GET', API_BASE_URL + 'members/me').respond(200, 
                getJSONFixture('members/me/index.json')
            );
            
            $httpBackend.when('GET', /.*feeds\/\?p=.*&ps=.*&rc=1/).respond(200, 
                getJSONFixture('feeds/index.json')
            );
            
            $httpBackend.when('GET', /.*feeds\/myprofilefeed\?p=.*&ps=.*&rc=1/).respond(200, 
                getJSONFixture('feeds/myprofilefeed/index.json')
            );
            
            $httpBackend.when('GET', /.*feeds\/myteamfeed\?p=.*&ps=.*&rc=1/).respond(200, 
                getJSONFixture('feeds/myprofilefeed/index.json')
            );
            
            $httpBackend.when('GET', /.*feeds\/.*\/comments\?p=.*&ps=.*&rc=1/).respond(200, 
                getJSONFixture('feeds/comments/index.json')
            );
            
            $httpBackend.when('GET', /.*feeds\/.*\/attachments\?p=.*&rc=1/).respond(200, 
                getJSONFixture('feeds/attachments/index.json')
            );
            
            $httpBackend.when('POST', API_BASE_URL + 'memberupdates', {Content: 'This is a test post with a little bit of content', FileStoreIds: [], PostDestination: 3, GroupId: false}).respond(200, {success: true});
            
            $httpBackend.when('POST', API_BASE_URL + 'memberprofilepost', {Content: 'This is a test post with a little bit of content', FileStoreIds: [], PostDestination: 3, PostMemberId: false}).respond(200, {success: true});
            
            $httpBackend.when('POST', API_BASE_URL + 'memberteamwallpost', {Content: 'This is a test post with a little bit of content', FileStoreIds: [], PostDestination: 3, GroupId: false}).respond(200, {success: true});

            //Build the scope
            $scope = $rootScope.$new();
                        
            createElem = function(type) {
                element = angular.element('<activity-feed type="' + type + '"></activity-feed>');
                $compile(element)($scope)
                $scope.$digest();
            }            
        });

    });

    it('can set up intial scope vars and place feed data, permission data and member data in scope', function(){
        
        createElem('network');
        
        expect($scope.loading).toEqual(true);
        expect($scope.postFocused).toEqual(false);
        expect($scope.hideUploader).toEqual(true);
        expect($scope.feedType).toEqual('network');
        expect($scope.posts).toEqual([]);
        expect($scope.disabledPost()).toEqual(true); // Post button is disabled until content can be added
        
        // Newsfeed data
        $scope.getNewsFeed(1, 20).then(function(res){
                        
            expect(res.data.length).toEqual(19); // Although we have requested 20 items, the server will send back less sometimes depending on permissions
            
            // Testing that the data has been placed in scope here.  Seperate test exists for the feedItemFactory
            // Each post is then passed to the feedItem directive
            expect(res.data[0].content.Id).toEqual(3332);
            expect(res.data[0].content.DatePublish).toEqual('2014-10-13T11:51:46');
            expect(res.data[0].content.Owner.FirstName).toEqual('Harry');
            expect(res.data[0].content.Owner.Surname).toEqual('HumanResources');
        });
        
        // Flush getNewsFeed request and all other requests created as part of the directive intialisation
        $httpBackend.flush();        
        $timeout.flush();
        
        // Member data
        expect($scope.currentUser.MemberId).toEqual(190946);
        expect($scope.currentUser.NetworkId).toEqual(941);
        
        // Permission data
        expect($scope.userCan.add).toEqual(true);
    });
    
    it('can add a new post to the news feed', function(){
        
        createElem('network');
        
        $httpBackend.flush();        
        $timeout.flush();
        
        $scope.addPost({content: 'This is a test post with a little bit of content'});
        $scope.$apply();
                
        expect($scope.postExpanded).toEqual(true); // Triggered by the watch function
        
        $httpBackend.flush(); // Flush out the post, we are expecting a particular set of post data.  The flush will fail if this data is not accurate
                
        // Check that a post has been added to the page with the correct content
        expect($scope.page.items[0].content.ContentText).toEqual('This is a test post with a little bit of content');
        expect($scope.page.items[0].content.Owner.FirstName).toEqual('Sherpa');
        expect($scope.page.items[0].userCan.delete).toEqual(true);
        expect($scope.page.items[0].feedType).toEqual('MemberUpdate');
        
        expect($scope.newPost).toEqual({});
        expect($scope.postFocused).toEqual(false);
    });
    
    it('can handle a type of profile and adjust the data posted appropriately', function(){
        
        // Change the element to have a type of profile for this test
        createElem('profile');
                        
        $httpBackend.flush();        
        $timeout.flush();
        
        expect($scope.feedType).toEqual('profile');
        
        $scope.addPost({content: 'This is a test post with a little bit of content'});
        $scope.$apply();
        
        $httpBackend.flush();
    });
    
    it('can handle a type of group and adjust the data posted appropriately', function(){
        
        // Change the element to have a type of profile for this test
        createElem('group');
                        
        $httpBackend.flush();        
        $timeout.flush();
        
        expect($scope.feedType).toEqual('group');
        
        $scope.addPost({content: 'This is a test post with a little bit of content'});
        $scope.$apply();
        
        $httpBackend.flush();
    });

});
