// Controller dashboardDirectoryCtrl
// ----------------------------------------

describe('Unit: Controller:dashboardActivityCtrl', function() {

    var $scope, $timeout, activityId = 1234, createController, API_BASE_URL, $httpBackend;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        module(function ($provide) {
            $provide.provider('$routeParams', function () {
                this.$get = function () {
                    return {
                        id: activityId
                    };
                };
            });
        });

        inject(function($rootScope, $controller, _$location_, $injector, _$timeout_) {
            
            $scope = $rootScope.$new();
            $httpBackend = $injector.get('$httpBackend');
            API_BASE_URL = $injector.get('API_BASE_URL');
            $timeout = _$timeout_;

            // For some reason base is needed here.  No idea why, found the answer here:
            // http://stackoverflow.com/questions/17370427/loading-a-mock-json-file-within-karmaangularjs-test
            jasmine.getJSONFixtures().fixturesPath = 'base/interfaceSource/test/mockData/api/';

            createController = function() {
                return $controller('dashboardActivityCtrl', {
                    '$scope': $scope
                });
            };
            
            $httpBackend.when('GET', API_BASE_URL + 'activities/' + activityId).respond(200, 
                getJSONFixture('activities/activity.json')
            );
            
            $httpBackend.when('GET', API_BASE_URL + 'members/me').respond(200, 
                getJSONFixture('members/me/index.json')
            );
        });
    });
    
    it('can load the activity with an id matching the route params and also data for the currently logged in member', function(){
        
        var contrller = createController();
        
        $httpBackend.flush();
        
        expect($scope.posts).toEqual([]);
        
        expect($scope.post.content.Id).toEqual(4348);
        expect($scope.post.content.PostDestination).toEqual(7);
        expect($scope.post.content.OwnerId).toEqual(247682);
        expect($scope.post.content.ViewCount).toEqual(6);
        expect($scope.post.feedType).toEqual('BlogEntry');
        expect($scope.post.likes).toEqual([]);
        expect($scope.post.liked).toEqual(true);
        expect($scope.post.id).toEqual(1021650);

        expect($scope.userCan.delete).toEqual(true);
        expect($scope.userCan.view).toEqual(true);
        expect($scope.userCan.cancomment).toEqual(true);
        
        $timeout.flush(); // Flush the timeout around the current user being put into scope
    
        expect($scope.currentUser.MemberId).toEqual(190946);
        expect($scope.currentUser.Sex).toEqual('f');
    });
    
});
