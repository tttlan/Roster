 // Directive attachments
// ----------------------------------------

describe('Unit: Directives:attachements', function() {

    var element, scope, Activities, $httpBackend, API_BASE_URL, $timeout;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($compile, $rootScope, $injector, _$timeout_) {
            
            Activities = $injector.get('Activities');
            $httpBackend = $injector.get('$httpBackend');
            API_BASE_URL = $injector.get('API_BASE_URL');
            $timeout = _$timeout_;

            $httpBackend.when('GET', API_BASE_URL + 'feeds/1/attachments?p=1&rc=1').respond(200, '{"$id":"1","AttachmentSummaryItemResults":[{"$id":"2","AttachmentSummary":{"$id":"3","Id":680,"FileStores":[{"$id":"4","FileStoreId":2122,"FileName":"sherpa.jpg","FileSize":2880,"FileExtension":".jpg"}]},"EntityActions":[{"$id":"5","Id":null,"Code":2036,"Caption":"Delete","Description":"Delete","ActionUrl":null,"Children":null}],"Status":0,"ResultStatuses":null}],"EntityActions":[{"$id":"6","Id":null,"Code":2035,"Caption":"Add","Description":"Add","ActionUrl":null,"Children":null}],"Status":0,"ResultStatuses":null}');
            
            scope = $rootScope.$new();
            scope.post = {
                "id": 1,
                "attachmentCount": 1,
                "attachments": [
                    {
                        "FileStoreId": 19190,
                        "FileName": "default.css",
                        "FileSize": 0,
                        "FileExtension": "css",
                        "StorageKey": "248d59d0-5c5a-4427-9a09-5a3231c074cd",
                        "DocumentUrl": "http://ad958d8da603b3492a56-390c022ffb747fe3dac10fb3c4e5d0da.r30.cf2.rackcdn.com/default.css"
                    }
                ]
            }
                        
            element = angular.element('<attachments resource-type="news" resource-id="post.id" count="post.attachmentCount" medias="post.content.media" attachments="post.attachments" is-inline="true" class="post__attachment" ng-show="true"></attachments>');

            $compile(element)(scope);
            scope.$digest();
        });
    });

    it('should be able to retrieve attachments using the service', function() {
        
        $httpBackend.flush();
        $timeout.flush();

        expect(scope.post.attachments[1].FileStoreId).toEqual(2122);
    });

});