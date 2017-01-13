// Directive file viewer
// ----------------------------------------

describe('Unit: Directives:file-viewer', function() {

    var element, scope, eleScope, API_BASE_URL, $compile;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($rootScope, $injector) {            

            API_BASE_URL = $injector.get('API_BASE_URL');
            $compile = $injector.get('$compile');

            scope = $rootScope.$new();

            // Test for an image first
            scope.isImage = true;
            scope.file = {
                'FileStoreId':2162,
                'FileName':'galaxy.jpg',
                'FileSize':49114,
                'FileExtension':'jpg'
            }
            
            element = angular.element('<file-viewer file="file" inline-images="{{isInline}}"></file-viewer>');

            $compile(element)(scope);
            scope.$digest();
            eleScope = element.isolateScope();
        });
    });

    it('should be have the correct download url', function() {
        
        setTimeout(function(){
            if (element.html()) {
                expect(eleScope.url).toEqual(API_BASE_URL + 'file-storage/' + scope.file.FileStoreId + '/download');
                done();
            }            
        }, 10);
    });

    it('should display an image if the file is an image', function() {

        setTimeout(function(){
            if (element.html()) {
                expect(eleScope.isImage).toEqual(true);
                done();
            }
        }, 10);
    });

    it('should display the files details if it is a file', function() {
        
        // Now test for a file
        scope.isImage = false;
        scope.file = {
            'FileStoreId':19190,
            'FileName':'default.css',
            'FileSize':0,
            'FileExtension':'css',
            'StorageKey':'248d59d0-5c5a-4427-9a09-5a3231c074cd',
            'DocumentUrl':'http://ad958d8da603b3492a56-390c022ffb747fe3dac10fb3c4e5d0da.r30.cf2.rackcdn.com/default.css'
        }
        scope.$digest();

        setTimeout(function(){
            if (element.html()) {
                expect(element.find('.file__name').text()).toEqual('default.css');
                done();
            }
        }, 100);
    });

});
