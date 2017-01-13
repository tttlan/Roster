describe('Unit: Directives:fileLink', function() {

    var element, scope, API_BASE_URL, FileStorage, $httpBackend;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($rootScope, $compile, $injector) {

            scope = $rootScope.$new();             
            API_BASE_URL = $injector.get('API_BASE_URL');
            $httpBackend = $injector.get('$httpBackend');
            FileStorage = $injector.get('FileStorage');

            $httpBackend.when('GET', API_BASE_URL + 'file-storage/2050/download/url').respond(200, '/interfaceSource/test/mockData/static/barstools.jpg'); 
        });
    });

    it('should correctly load an image from the api', function(){
        
        inject(function($compile, $injector) {
            element = angular.element('<img file-link="2050" />'); 
            $compile(element)(scope);
            scope.$digest();
        });
        
        $httpBackend.flush();
        
        expect(element.attr('src')).toEqual('/interfaceSource/test/mockData/static/barstools.jpg');
    });

    it('should correctly generate a link to a file storage asset', function(){

        inject(function($compile, $injector) {
            element = angular.element('<a href="" file-link="2050"></a>'); 
            $compile(element)(scope);
            scope.$digest(); 
        });
        
        expect(element.attr('href')).toEqual(API_BASE_URL + 'file-storage/2050/download');
    });

});
