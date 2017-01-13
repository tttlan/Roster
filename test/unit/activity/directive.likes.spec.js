
// Directive Likes
// ----------------------------------------

describe('Unit: Directives: Likes', function() {

    var element, scope, Activities, $httpBackend, API_BASE_URL;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($compile, $rootScope, $injector) {
            
            Activities = $injector.get('Activities');
            $httpBackend = $injector.get('$httpBackend');
            API_BASE_URL = $injector.get('API_BASE_URL');

            $httpBackend.expect('POST', API_BASE_URL + 'feeds/1/likes').respond(200, '[{ title : "some awesome dubstep song from 2013", id : 20 }]');

            scope = $rootScope.$new();
            scope.currentUser = {
                MemberId: 1
            };

            scope.post = {
                id: 1,
                liked: false,
                likeCount: 0,
                content: {
                    Id: 1
                }
            }

            element = angular.element('<likes resource-type="news" resource-id="post.id" like-count="post.likeCount" liked="post.liked"></likes>')
            $compile(element)(scope);
            scope.$digest();
        });
    });


    it('should be likable', function() {

        var likeButton = element.find('a');
        likeButton.click();

        expect( scope.post.liked ).toBe(true);
        expect( likeButton.attr('class') ).toContain('is--active');
        expect( scope.post.likeCount ).toEqual(1);
        expect( element.text() ).toContain('1 like')
    })


    it('should pluralize like', function() {
        scope.post.likeCount = 2;
        scope.post.liked = true;
        scope.$digest();

        expect(scope.post.likeCount).toEqual(2);
        expect(element.text()).toContain('2 likes')
    })


    it('has been liked by others but not me', function() {
        
        scope.post.likeCount = 7;
        scope.post.liked = false;
        scope.$digest();

        expect(scope.post.likeCount).toEqual(7);
        expect(element.text()).toContain('7 likes')
    })

});
