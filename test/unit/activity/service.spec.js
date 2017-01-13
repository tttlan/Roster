// Activities Service
// ----------------------------------------

describe('Unit: Service:Activities', function() {

    var Activities, API_BASE_URL, $httpBackend;

    beforeEach(function () {
        module('sherpa');

        inject(function($compile, $rootScope, $injector) {

            Activities = $injector.get('Activities');
            API_BASE_URL = $injector.get('API_BASE_URL');
            $httpBackend = $injector.get('$httpBackend');
            //spyOn(console, 'warn');

            // Posting likes
            $httpBackend.when('POST', API_BASE_URL + 'feeds/1234/likes').respond(200, {});

            $httpBackend.when('POST', API_BASE_URL + 'blogs/1234/likes').respond(200, {});

            // Getting likes
            $httpBackend.when('GET', API_BASE_URL + 'feeds/1234/likes?p=1&ps=20&rc=0').respond(200,
                getJSONFixture('feeds/likes/index.json')
            );

            $httpBackend.when('GET', API_BASE_URL + 'blogs/1234/likes?p=1&ps=20&rc=0').respond(200,
                getJSONFixture('blogs/likes/index.json')
            );

            // Getting comments
            $httpBackend.when('GET', API_BASE_URL + 'feeds/1234/comments?p=1&ps=20&rc=1').respond(200,
                getJSONFixture('feeds/comments/index.json')
            );

            $httpBackend.when('GET', API_BASE_URL + 'feeds/1234/comments?p=1&ps=5&rc=1').respond(200,
                getJSONFixture('feeds/comments/index.json')
            );

            $httpBackend.when('GET', API_BASE_URL + 'blogs/1234/comments?p=1&ps=20&rc=1').respond(200,
                getJSONFixture('blogs/comments/index.json')
            );
            $httpBackend.when('GET', API_BASE_URL + 'feeds/1234/comments?p=1&ps=5&rc=1').respond(200,
                getJSONFixture('feeds/comments/index.json')
            );
            $httpBackend.when('GET', API_BASE_URL + 'blogs/1234/comments?p=1&ps=5&rc=1').respond(200,
                getJSONFixture('blogs/comments/index.json')
            );


            $httpBackend.when('GET', API_BASE_URL + 'blogs/1234/comments?p=1&ps=5&rc=1').respond(200,
                getJSONFixture('blogs/comments/index.json')
            );

            // Posting comments
            $httpBackend.when('POST', API_BASE_URL + 'blogs/1234/comments').respond(200, {"$id":"1","CommentSummary":{"$id":"2","Id":24321,"DateCommented":"2015-07-08T12:29:47.1469572+10:00","Comment":"I am a test comment.www.google.com","Owner":{"$id":"3","MemberId":247682,"FirstName":"Sherpa","Surname":"Admin","PhotoLarge":"/networkrepository/957/member/247682/profile_large.jpg","PhotoThumb":"/networkrepository/957/member/247682/profile_mid.jpg","PhotoThumbMini":"/networkrepository/957/member/247682/profile_small.jpg","RoleTitle":""},"FeedId":957925},"EntityActions":[{"$id":"4","Id":null,"Code":2003,"Caption":"Delete","Description":"Delete","ActionUrl":null,"Children":null},{"$id":"5","Id":null,"Code":2001,"Caption":"View","Description":"View","ActionUrl":null,"Children":null}],"Status":0,"ResultStatuses":null});

            $httpBackend.when('POST', API_BASE_URL + 'feeds/1234/comments').respond(200, {"$id":"1","CommentSummary":{"$id":"2","Id":24322,"DateCommented":"2015-07-08T12:34:16.6479118+10:00","Comment":"I am a test comment.www.google.com","Owner":{"$id":"3","MemberId":247682,"FirstName":"Sherpa","Surname":"Admin","PhotoLarge":"/networkrepository/957/member/247682/profile_large.jpg","PhotoThumb":"/networkrepository/957/member/247682/profile_mid.jpg","PhotoThumbMini":"/networkrepository/957/member/247682/profile_small.jpg","RoleTitle":""},"FeedId":957925},"EntityActions":[{"$id":"4","Id":null,"Code":2003,"Caption":"Delete","Description":"Delete","ActionUrl":null,"Children":null},{"$id":"5","Id":null,"Code":2001,"Caption":"View","Description":"View","ActionUrl":null,"Children":null}],"Status":0,"ResultStatuses":null});

            // Deleting comments
            $httpBackend.when('DELETE', API_BASE_URL + 'feeds/1234/comments/1234').respond(200, {});
            $httpBackend.when('DELETE', API_BASE_URL + 'blogs/1234/comments/1234').respond(200, {});

            // Getting attachments
            $httpBackend.when('GET', API_BASE_URL + 'feeds/1234/attachments?p=1&ps=20&rc=1').respond(200,
                getJSONFixture('feeds/attachments/index.json')
            );
            $httpBackend.when('GET', API_BASE_URL + 'blogs/1234/attachments?p=1&ps=20&rc=1').respond(200,
                getJSONFixture('feeds/attachments/index.json')
            );

            // Getting an activity
            $httpBackend.when('GET', API_BASE_URL + 'activities/1234').respond(200,
                getJSONFixture('activities/activity.json')
            );

            // Feeds - the list of all posts to appear in the feed
            $httpBackend.when('GET', API_BASE_URL + 'feeds/1234/?p=1&ps=20&rc=1').respond(200,
                getJSONFixture('feeds/index.json')
            );
            $httpBackend.when('GET', API_BASE_URL + 'feeds/1234/myteamfeed?p=1&ps=20&rc=1').respond(200,
                getJSONFixture('feeds/myteamfeed/index.json')
            );
            $httpBackend.when('GET', API_BASE_URL + 'feeds/1234/myprofilefeed?p=1&ps=20&rc=1').respond(200,
                getJSONFixture('feeds/myprofilefeed/index.json')
            );

            // Creating a feed post
            $httpBackend.when('POST', API_BASE_URL + 'memberupdates').respond(200, {network: true});
            $httpBackend.when('POST', API_BASE_URL + 'memberprofilepost').respond(200, {profile: true});
            $httpBackend.when('POST', API_BASE_URL + 'memberteamwallpost').respond(200, {group: true});

            // Removing a feed post
            $httpBackend.when('DELETE', API_BASE_URL + 'feeds/feedEntry/1234').respond(200, {remove: true});
        });
    });


    it('should be able to send a request to the likes API to create a new \'like\'', function() {

        Activities.updateLike('news', 1234, true).then(function(res){
            expect(res.config.data).toEqual('{"HasLiked":true}'); // This is the data sent to the server
        });

        Activities.updateLike('news', 1234, false).then(function(res){
            expect(res.config.data).toEqual('{"HasLiked":false}');
        });

        Activities.updateLike('blog', 1234, true).then(function(res){
            expect(res.config.data).toEqual('{"HasLiked":true}');
        });

        Activities.updateLike('blog', 1234, false).then(function(res){
            expect(res.config.data).toEqual('{"HasLiked":false}');
        });

        $httpBackend.flush();
    });

    it('should be able to send a request to the likes API to get \'likes\' for an item', function() {

        Activities.getLikes('news', 1234, 1, 20).then(function(res){
            expect(res.data.MemberSummaryItemResults.length).toEqual(1);
        });

        Activities.getLikes('blog', 1234, 1, 20).then(function(res){
            expect(res.data.MemberSummaryItemResults.length).toEqual(2);
        });

        $httpBackend.flush();
    });

    it('should be able to get comments from the API', function() {

        Activities.getComments('news', 1234, 1, 20).then(function(res){

            // Expecting the format comment fn to create the HtmlComment property
            expect(res.data[0].CommentSummary.Comment).toEqual('Brilliant!  Looking forward to seeing this rolled out. http://www.google.com/')
            expect(res.data[0].CommentSummary.HtmlComment).toEqual('Brilliant!  Looking forward to seeing this rolled out. <a href="http://www.google.com/" target="_blank">http://www.google.com/</a>');
            expect(res.data[0].userCan).toEqual({delete: true, view: true});
            expect(res.data[0].EntityActions).toBeUndefined();
        });


        Activities.getComments('blog', 1234, 1, 20).then(function(res){

            // Expect the comment summary property to have been created
            expect(res.data[0].CommentSummary.Comment).toEqual('Brilliant!  Looking forward to seeing this rolled out,');
            // And expect this property to have been deleted
            expect(res.data[0].BlogCommentSummary).toBeUndefined();
        });

        $httpBackend.flush();
    });

    it('should be able to send comments to the API', function() {

        Activities.createComment('news', 1234, {Comment: 'I am a test comment.www.google.com'}).then(function(res){

            //TODO Assert something useful here
        });

        Activities.createComment('blog', 1234, {Comment: 'I am a test comment.www.google.com'}).then(function(res){

            //TODO Assert something useful here
        });

        $httpBackend.flush();
    });

    it('should be able to send an API request to delete comments', function() {

        // Just testing that the service creates a request with the correct parameters
        Activities.removeComment('news', 1234, 1234);
        Activities.removeComment('blog', 1234, 1234);

        $httpBackend.flush();
    });

    it('should be able to send an API request to get attachments for a feed item or blog post', function() {

        // Just testing that the service creates a request with the correct parameters
        Activities.getAttachments('news', 1234, 1, 20).then(function(res){
            expect(res[0]).toEqual({$id: '4',FileStoreId: 2096, FileName: 'Slaw prep sheet.pdf', FileSize: 2234885, FileExtension: 'pdf'});
        });

        Activities.getAttachments('blog', 1234, 1, 20).then(function(res){
            expect(res[0]).toEqual({$id: '4',FileStoreId: 2096, FileName: 'Slaw prep sheet.pdf', FileSize: 2234885, FileExtension: 'pdf'});
        });

        $httpBackend.flush();
    });

    it('should be able to get a single activity from the api and format the data with the formatFeedModel fn', function(){

        Activities.getActivity(1234).then(function(res){

            expect(res.data.permissions).toEqual({delete: true, edit: true, view: true, like: true, cancomment: true});
            expect(res.data.items).toEqual([{
                content: {
                    $id: '3',
                    Id: 4348,
                    DatePublish: '2015-03-31T09:30:40',
                    ContentSummary: 'test',
                    ActivityId: 0,
                    Content: null,
                    Title: 'blog for login and dashboard',
                    PublishState: 2,
                    PostDestination: 7,
                    Owner: {
                        $id: '4',
                        MemberId: 247682,
                        FirstName: 'Sherpa',
                        Surname: 'Admin',
                        PhotoLarge: '/networkrepository/957/member/247682/profile_large.jpg',
                        PhotoThumb: '/networkrepository/957/member/247682/profile_mid.jpg',
                        PhotoThumbMini: '/networkrepository/957/member/247682/profile_small.jpg',
                        RoleTitle: ''
                    },
                    OwnerId: 247682,
                    FileStoreId: null,
                    PrimaryInlineImage: null,
                    CategoryIds: null,
                    PostTargets: null,
                    AttachmentAttachedCount: 0,
                    AttachmentInlineCount: 0,
                    LikeCount: 1,
                    ViewCount: 6,
                    ViewUniqueCount: 0,
                    CommentCount: 2,
                    HasLiked: null,
                    BlogUpdated: false
                },
                userCan: {
                    delete: true,
                    edit: true,
                    view: true,
                    like: true,
                    cancomment: true
                },
                owner: {
                    $ref: '4'
                },
                feedGroup: 'text',
                feedType: 'BlogEntry',
                comments: [],
                commentCount: 2,
                likes: [],
                likeCount: 1,
                liked: true,
                views: 6,
                published: '2015-03-31T09:31:00.667',
                id: 1021650,
                attachmentCount: 0,
                attachments: [],
                isUpdated: false,
                entityKey: 4348
            }]);
        });

        $httpBackend.flush();
    });

    it('should be able to create requests for the three different types of feeds', function(){

        // Note that we're not checking the data that comes back as this is checked in the previous test by testing just one of items from the server and running it through the formatFeedModel fn
        Activities.getFeed('network', 1234, 1, 20).then(function(res){
            expect(res.data.items.length).toEqual(19);
        });

        Activities.getFeed('group', 1234, 1, 20).then(function(res){
            expect(res.data.items.length).toEqual(7);
        });

        Activities.getFeed('profile', 1234, 1, 20).then(function(res){
            expect(res.data.items.length).toEqual(4);
        });

        $httpBackend.flush();
    });

    it('should be able to create posts for the network, profile and group feeds', function(){

        // Note that we're not checking the data that comes back as this is checked in the previous test by testing just one of items from the server and running it through the formatFeedModel fn
        Activities.createPostToFeed('network', {Content: 'My post', FileStoreIds: [], PostDestination: 3}).then(function(res){
            expect(res.data.network).toEqual(true);
        });

        Activities.createPostToFeed('profile', {GroupId: 1, Content: 'sample string 1', PostDestination: 0,  FileStoreIds: [1, 2], PostMemberId: 1, PostGroupId: 1, PostGroupName: 'sample string 2'}).then(function(res){
            expect(res.data.profile).toEqual(true);
        });

        Activities.createPostToFeed('group', {GroupId: 1, Content: 'sample string 1', PostDestination: 0, FileStoreIds: [1, 2], PostMemberId: 1, PostGroupId: 1, PostGroupName: 'sample string 2'}).then(function(res){
            expect(res.data.group).toEqual(true);;
        });

        $httpBackend.flush();
    });

    it('should be able to remove posts for the network, profile and group feeds', function(){

        Activities.removePostFromFeed(1234).then(function(res){
            expect(res.data.remove).toEqual(true);
        });

        $httpBackend.flush();
    });
});
