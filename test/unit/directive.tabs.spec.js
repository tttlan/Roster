 // Directive tabs, tabLink and tabContent 
// ----------------------------------------

describe('Unit: Directives:tabs', function() {

    var element, scope, controller;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($compile, $rootScope) {

            scope = $rootScope.$new();
     
            element = angular.element('<tabs><ul><li tab-link><a href="" class="is--active">First tab</a></li><li tab-link><a href="">Second tab</a></li></ul><div tab-content>Content 1</div><div tab-content>Content 2</div></tabs>');
            
            $compile(element)(scope);
            scope.$digest();

            controller = element.controller('tabs'); // Set a reference to the directives controller so we can access methods within the controller
        });
    });

    it('should render the markup correctly', function() {

        // We have two tab links and two tab content panels
        expect(element.find('*[tab-link]').length).toEqual(2);
        expect(element.find('*[tab-content]').length).toEqual(2);

        // Text that the text in the first tab link is rendered correctly
        expect(element.find('*[tab-link]:first-child').text()).toEqual('First tab');
    });
    
    it('should have the class "tabs" applied', function() {

        expect(element.attr('class')).toContain('tabs');
    });

    it('should increment the tab body index', function() {
        
        // Get tab body index should increment each time it is called.  We have two tabs which sets the val at two.  
        // Calling it again in the test should cause it to equal three. 
        expect(controller.getTabBodyIndex()).toEqual(3);
    });

    it('should display the correct behaviour when clicking a tab link', function() {
        
        var tabLink = element.find('li:last-child');
        tabLink.click();
        expect(tabLink.find('a').attr('class')).toContain('is--active');

        // Testing the tab content panel is set correctly
        var tabContent = element.find('*[tab-content]:last-child');
        expect(tabContent.attr('class')).toContain('is--active');    

        // Testing disabled links
        tabLink = element.find('li:first-child'); // Set tab link to the non active link
        tabLink.addClass('is--disabled');// add a disabled class to it
        tabLink.click();
        expect(tabLink.find('a').attr('class')).not.toContain('is--active');    
    });

});