 // Directive external embed
// ----------------------------------------

describe('Unit: Directives:media', function() {

    var element, scope, API_BASE_URL, $httpBackend, $timeout, video, Activities;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($compile, $rootScope, $injector, _$timeout_) {

            Activities = $injector.get('Activities');
            $httpBackend = $injector.get('$httpBackend');
            API_BASE_URL = $injector.get('API_BASE_URL');
            $timeout = _$timeout_;
            
            scope = $rootScope.$new();
            element = angular.element('<media file="FileStore" ng-show="FileStore"></media>');
        });
    });

    it('should calculate the file type and url correctly for an image', function() {

         inject(function($compile) {
            scope.FileStore = {
                "FileStoreId":1939,
                "FileName":"z-09-mobile-roster-request.jpg",
                "FileSize":33401,"FileVersion":"1",
                "FileExtension":".jpg",
                "LastUpdatedDate":"2014-09-02T02:27:38.93Z",
                "IsProcessing":false,
                "url":{},
                "loaded":true,
                "type":"image",
                "name":"z-09-mobile-roster-request"
            }      

            $httpBackend.when('GET', API_BASE_URL + 'file-storage/' + scope.FileStore.FileStoreId + '/download/url').respond(200, 'https://storage101.ord1.clouddrive.com/v1/MossoCloudFS_6df71ffc-f110-42bb-934a-c442e0f6884d/TheHubLibraryTest/0bcfa05a-9945-4808-97ad-aa2b6bd67d8e?temp_url_sig=8084c6370983410c12dbca4c383a7a965b47f2fe&temp_url_expires=1450323990&filename=z-09-mobile-roster-request.jpg');

            $compile(element)(scope);
            scope.$digest();
        });

        $httpBackend.flush();
        
        expect(element.isolateScope().file.type).toEqual('image');
        expect(element.isolateScope().file.name).toEqual('z-09-mobile-roster-request');
    });

    it('should calculate the file type and url correctly for a video', function() {

        inject(function($compile) {
            
            scope.FileStore = {
                "FileStoreId":2295,
                "FileName":"small.mp4",
                "FileSize":383631,
                "FileVersion":"1",
                "FileExtension":".mp4",
                "LastUpdatedDate":"2014-10-23T04:29:30.327Z",
                "IsProcessing":false,
                "url":{},
                "loaded":true,
                "type":"video",
                "name":"small"
            }      

            $httpBackend.when('GET', API_BASE_URL + 'file-storage/' + scope.FileStore.FileStoreId + '/download/url').respond(200, 'https://storage101.ord1.clouddrive.com/v1/MossoCloudFS_6df71ffc-f110-42bb-934a-c442e0f6884d/TheHubLibraryTest/2cb06627-71e2-4f4d-9082-8dd62234becb?temp_url_sig=37a896ec6e99d94f7544acfa7248367f1616d5e2&temp_url_expires=1450326779&filename=small.mp4');

            $compile(element)(scope);
            scope.$digest();
        });

        $httpBackend.flush();
        $timeout.flush();

        expect(element.isolateScope().file.type).toEqual('video');
        expect(element.isolateScope().file.name).toEqual('small');
        expect(element.isolateScope().videoPlayer.isPlaying).toEqual(false); // The video has loaded
    });

});

// Directive external embed
// ----------------------------------------

describe('Unit: Directives:external-embed', function() {

    var element, scope, API_BASE_URL;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($compile, $rootScope, $injector) {            

            API_BASE_URL = $injector.get('API_BASE_URL');

            scope = $rootScope.$new();

            scope.attachments = [];
                        
            element = angular.element('<external-embed src="media"></external-embed>');          
        });
    });

    it('should do be able to detect a youtube video and generate the embed url of a youtube video', function() {

        inject(function($compile) {
            
            scope.media = "https://www.youtube.com/watch?v=sTSA_sWGM44";            
            $compile(element)(scope);
            scope.$digest(); 
        });

        expect(element.isolateScope().provider).toEqual('youtube');
        expect(element.isolateScope().src.$$unwrapTrustedValue()).toEqual('//www.youtube.com/embed/sTSA_sWGM44?rel=0');
    });

    it('should do be able to detect a vimeo video and generate the embed url of a vimeo video', function() {

        inject(function($compile) {
            
            scope.media = "https://www.youtube.com/watch?v=sTSA_sWGM44";            
            $compile(element)(scope);
            scope.$digest(); 
        });

        expect(element.isolateScope().provider).toEqual('youtube');
        expect(element.isolateScope().src.$$unwrapTrustedValue()).toEqual('//www.youtube.com/embed/sTSA_sWGM44?rel=0');
    });

    it('should do be able to detect an image video and generate the url of the image', function() {

        inject(function($compile) {
            
            scope.media = "http://vimeo.com/109354891";    
            $compile(element)(scope);
            scope.$digest(); 
        });
  
        expect(element.isolateScope().provider).toEqual('vimeo');
        expect(element.isolateScope().src.$$unwrapTrustedValue()).toEqual('//player.vimeo.com/video/109354891');
    });

});

// Directive PDF
// ----------------------------------------

describe('Unit: Directives:pdf', function() {

    var element, scope, API_BASE_URL;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($compile, $rootScope, $injector) {            

            API_BASE_URL = $injector.get('API_BASE_URL');
            scope = $rootScope.$new();
                        
            element = angular.element('<pdf source="/interface/media/pdf/helloworld.pdf"></pdf>');
            $compile(element)(scope);
            scope.$digest();         
        });
    });

    it('should do be able to embed a pdf', function() {

        expect(element.find('iframe').attr('src')).toEqual('/interface/media/pdf/viewer/viewer.html?file=%2Finterface%2Fmedia%2Fpdf%2Fhelloworld.pdf');
    });

});

// Directive PDF
// ----------------------------------------

describe('Unit: Directives:external', function() {

    var element, scope, API_BASE_URL;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($compile, $rootScope, $injector) {            

            API_BASE_URL = $injector.get('API_BASE_URL');
            scope = $rootScope.$new();
                        
            element = angular.element('<external url="google.com/interface/media/pdf/helloworld.pdf" />');
            $compile(element)(scope);
            scope.$digest();         
        });
    });

    it('can parse url and embedability values correctly', function() {

        expect(element.isolateScope().url).toEqual('//google.com/interface/media/pdf/helloworld.pdf');
        expect(element.isolateScope().isEmbeddable).toEqual(false);
    });

});