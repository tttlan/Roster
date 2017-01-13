
// Directive post content
// ----------------------------------------

describe('Unit: Directives: post-content', function() {

    var element, scope, updateTypes, $compile, $httpBackend, $templateCache, $cacheFactory;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function(_$compile_, $rootScope, $injector) {

            // set up any required services
            $compile = _$compile_;
            $httpBackend = $injector.get('$httpBackend');
            $templateCache = $injector.get('$templateCache');
            $cacheFactory = $injector.get('$cacheFactory');
            
            //Build the scope
            scope = $rootScope.$new();
                
            // This should match the corresponding object in the directive exactly.  Update this object if the directive changes            
            updateTypes = {
                BlogEntry: 'post-blog-entry',
                HtmlContent: 'post-html',
                LibraryDocument: 'post-library-document',
                LibraryDocumentChanged: 'post-library-document',
                MemberUpdate: 'post-member-update',
                TeamPost: 'post-team-update',
                ProfilePost: 'post-profile',
                MemberProfileUpdate: 'post-profile-update',
                PrivateMessage: 'post-private-message',
                Job: 'post-job',
                Request: 'post-request'
            };
        });
    });
    
    it('should be able to retrieve templates for all of the update types', function(){
                
        // Remove the default template from the template cache
        // We're doing this becuase if a template url is not defined then the default is retrieved.
        // We want to throw an error if the template url that is defined doesn't work hence the removal of the default
        $templateCache.put('/interface/views/activity/partials/post-default.html', '');
            
        // Then loop through each of the post content types and try and retrieve the template    
        angular.forEach(updateTypes, function(partialName, type){
                        
            element = angular.element('<div><post-content type="' + type + '"></post-content></div>');
            $compile(element)(scope)
            scope.$digest();
                        
            expect(element).toExist();
            expect(element.html()).toHaveClass('post__content'); // All templates use this class
        });
    });
    
    it('should load the default template if the type is not a type defined in the updateTypes object', function(){
        
        element = angular.element('<div><post-content type="myFakeType"></post-content></div>');
        $compile(element)(scope)
        scope.$digest();
                    
        expect(element).toExist();
        expect(element.html()).toHaveClass('post__content');
        expect(angular.element(element.html()).find('.post__name').length).toEqual(1);
        expect(angular.element(element.html()).find('div').length).toEqual(2); 
    });
    
    it('should load all templates via a http request if the cache is completely clear', function(){
        
        // Empty the cache            
        $cacheFactory.get('templates').removeAll();
          
        // Loop through all post types
        angular.forEach(updateTypes, function(partialName, type){
            
            // Expect there to be a request for each template
            $httpBackend.expect('GET', '/interface/views/activity/partials/' + partialName + '.html').respond(200, true);
                        
            // Then create the directive for each post type to trigger a template request
            element = angular.element('<div><post-content type="' + type + '"></post-content></div>');
            $compile(element)(scope)
            scope.$digest();            
        });
    });
    
});
