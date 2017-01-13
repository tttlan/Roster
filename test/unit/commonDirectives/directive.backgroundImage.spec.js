describe('Unit: Directives:backgroundImage', function() {

    var element, scope, FileStorage, API_BASE_URL;

    beforeEach(function() {
        module('sherpa');
        module('templates');

        inject(function($compile, $rootScope, $injector) {

            scope = $rootScope.$new();
            FileStorage = $injector.get('FileStorage');
            API_BASE_URL = $injector.get('API_BASE_URL');
            
            scope.FileStoreId = 1939;
            
            // Use the tabs directive to demonstrate the overflow directive.  Markup taken from the styleguide
            element = angular.element('<div background-image="FileStoreId"></div>');

            $compile(element)(scope);
            scope.$digest();
        });
    });

    it('should correctly populate the url and background size for the background image', function() {
        expect(element.attr('style')).toMatch(/background-image: url\((")?http:\/\/localhost:83\/api\/file-storage\/1939\/download\?inline=true(")?\); background-size: cover;/);
    });

});
