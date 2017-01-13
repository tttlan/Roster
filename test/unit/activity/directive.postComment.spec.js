
// Directive Comments
// ----------------------------------------

describe('Unit: Directives: post-comments', function() {

    var element, scope, Activities, template, $httpBackend, API_BASE_URL;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($compile, $rootScope, $injector) {

            // set up any required services
            Activities = $injector.get('Activities');
            $httpBackend = $injector.get('$httpBackend');
            API_BASE_URL = $injector.get('API_BASE_URL');
        
            $httpBackend.when('POST', API_BASE_URL + 'feeds/1/comments').respond(200, true);
            $httpBackend.when('GET', API_BASE_URL + 'feeds/1/comments?p=1&ps=5&rc=1').respond(200, '{"$id":"1","CommentSummaryItemResults":[{"$id":"2","CommentSummary":{"$id":"3","Id":23660,"DateCommented":"2014-08-20T11:11:15.367","Comment":"nice comment","Owner":{"$id":"4","MemberId":247682,"FirstName":"Test","Surname":"User","PhotoLarge":"/networkrepository/957/member/247682/profile_large.png","PhotoThumb":"/networkrepository/957/member/247682/profile_mid.png","PhotoThumbMini":"/networkrepository/957/member/247682/profile_small.png","RoleTitle":"FIN - Systems Administrator"},"FeedId":944703},"EntityActions":[{"$id":"5","Id":null,"Code":2003,"Caption":"Delete","Description":"Delete","ActionUrl":null,"Children":null},{"$id":"6","Id":null,"Code":2001,"Caption":"View","Description":"View","ActionUrl":null,"Children":null}],"Status":0,"ResultStatuses":null},{"$id":"7","CommentSummary":{"$id":"8","Id":23654,"DateCommented":"2014-08-19T16:18:08.737","Comment":"Nice article number 2","Owner":{"$id":"9","MemberId":247682,"FirstName":"Test","Surname":"User","PhotoLarge":"/networkrepository/957/member/247682/profile_large.png","PhotoThumb":"/networkrepository/957/member/247682/profile_mid.png","PhotoThumbMini":"/networkrepository/957/member/247682/profile_small.png","RoleTitle":"FIN - Systems Administrator"},"FeedId":944703},"EntityActions":[{"$id":"10","Id":null,"Code":2003,"Caption":"Delete","Description":"Delete","ActionUrl":null,"Children":null},{"$id":"11","Id":null,"Code":2001,"Caption":"View","Description":"View","ActionUrl":null,"Children":null}],"Status":0,"ResultStatuses":null}],"EntityActions":[{"$id":"12","Id":null,"Code":2001,"Caption":"View","Description":"View","ActionUrl":null,"Children":null}],"Status":0,"ResultStatuses":null}');
            $httpBackend.when('DELETE', API_BASE_URL + 'feeds/1/comments/23654').respond(200, true);

            //Build the scope
            scope = $rootScope.$new();
            scope.currentUser = {
                MemberId: 1,
                FirstName: "Sherpa",
                Surname: "Test",
                MemberProfile: {
                    PhotoThumb: ''
                }
            };

            scope.post = {
                id: 1,
                commentCount: 1,
                showAddComment: false
            }
            
            element = angular.element('<post-comments resource-type="news" resource-id="post.id" comment-count="post.commentCount" current-user="currentUser" show-add-comment="post.showAddComment"></post-comments>');
            $compile(element)(scope)
            scope.$digest();
        });

    });


    it('should not display if there are no comments', function() {
        scope.post.commentCount = 0;
        scope.$digest();
        expect( element.attr('class') ).toContain('ng-hide');
        expect( element.find('.comment__name').length ).toEqual(0);
    }); 


    // ie. this happens on blog pages
    it('should display input if required to', function(){
        scope.post.commentCount = 0;
        scope.post.showAddComment = true;
        scope.$digest();

        expect( element.attr('class') ).not.toContain('ng-hide');
    });


    it('should fetch comments if commentCount > 0', function() {

        var es = element.isolateScope();
        scope.post.commentCount = 2;
        scope.$digest();
        $httpBackend.flush();
        scope.$digest();
        
        expect( element.attr('class') ).not.toContain('ng-hide');
        expect( element.find('.comment__name').length ).toEqual(2);
        expect( element.find('.comment__name a').text() ).toContain('Test User');
    });

    
    it('should add a comment', function() {
        
        var es = element.isolateScope();
        var newComment = 'My new comment';

        es.newComment = newComment;

        element.find('.comment__field').trigger('submit');

        scope.$digest();
        expect( element.find('.comment__name').length ).toEqual(1);
        expect( element.find('.comment__name a').eq(0).text() ).toContain(scope.currentUser.FirstName);
        expect( element.find('p').text() ).toContain(newComment);

    });


    it('should remove the comment if deleted', function(){

        var es = element.isolateScope();
        scope.post.commentCount = 2;
        scope.$digest();
        $httpBackend.flush();
        scope.$digest();

        // trigger delete
        es.deleteComment(0);

        scope.$digest();

        expect( element.find('.comment__name').length ).toEqual(1);
        expect( element.find('p').text() ).toContain('nice comment');
        expect( element.find('p').text() ).not.toContain('Nice article number 2');

    });

});