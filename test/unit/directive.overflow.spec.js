describe('Unit: Directives:overflow', function() {

    var element, scope, controller, $timeout;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($compile, $rootScope, _$timeout_) {

            $timeout = _$timeout_;

            scope = $rootScope.$new();
        
            // Use the tabs directive to demonstrate the overflow directive.  Markup taken from the styleguide
            element = angular.element('<tabs><ul class="nav nav--tabs" overflow><li tab-link active><ul class="toBeRemoved">Testing clean function</ul><a href="">first one yea!</a></li><li tab-link><a href="">second one yea!</a></li><li tab-link><a href="">third one yea!</a></li><li tab-link><a href="">fourth one yea!</a></li></ul><div class="tab-group"><div tab-content class="tab-group__tab"><p>This is nice 1</p></div><div tab-content class="tab-group__tab"><p>This is nice 2</p></div><div tab-content class="tab-group__tab"><p>This is nice 3</p></div><div tab-content class="tab-group__tab"><p>This is nice 4</p></div></div></tabs>');

            $compile(element)(scope);
            scope.$digest();

            $timeout.flush();

            controller = element.find('*[overflow]').controller('overflow'); // Set a reference to the directives controller so we can access methods within the controller

        });
    });

    it('should have the correct html elements from the template', function() {

        expect(element.find('*[overflow-container]').length).toBeTruthy();
        expect(element.find('*[overflow-list]').length).toBeTruthy();
        expect(element.find('*[overflow-item]').length).toBeTruthy();
        expect(element.find('.overflow__toggle').length).toBeTruthy();
        expect(element.find('.last-visible-child').length).toBeTruthy();    
        expect(element.find('.submenu__item').length).toBeTruthy();       
    });

    it('can apply the correct markup manipulations from the controller', function() {

        // Test that all four tabs appear in the overflow list
        expect(element.find('*[overflow-item]').length).toEqual(4);

        // Test that the clean function cleans the tab html correctly
        expect(element.find('*[overflow-list] .toBeRemoved').length).toEqual(0);

        // The element is transcluded, check that it is re-appended too
        expect(element.find('ul:first-child').attr('class')).toContain('nav--tabs');       

        // Classes are correctly added
        expect(element.find('*[overflow]').attr('class')).toContain('overflow__container');
        expect(element.find('.submenu__item').length).toBeTruthy(); 
    });

    it('correctly toggles the tabs, items in the overflow menu and the nav toggle', function() {

        // Two tabs visible, two have overflown into the nav
        element.find('.overflow__container').css('width', '600px'); // Set the width of the element
        controller.navWidths = [117, 134, 122, 134]; // Set the widths of the nav items, phantomjs doesn't render these so we'll hardcode them
        var widthObj = {outerWidth: function(){ return 600; }}
        controller.checkWidths(widthObj); // Check the menu items againt a width of 300

        // Two tabs visible, two have overflown into the nav
        element.find('.overflow__container').css('width', '300px'); // Set the width of the element
        var widthObj = {outerWidth: function(){ return 300; }}
        controller.checkWidths(widthObj); // Check the menu items againt a width of 300

        expect(element.find('.overflow__toggle.ng-hide').length).toBeFalsy();

        // Three tabs visible, one has overflown to the nav
        element.find('.overflow__container').css('width', '420px');
        var widthObj = {outerWidth: function(){ return 420; }}
        controller.checkWidths(widthObj);

        expect(element.find('.overflow__toggle.ng-hide').length).toBeFalsy();

        // Opening the overflow tab and clicking an item results in the nav closing again
        element.find('.overflow__toggle').click();        
        element.find('.submenu__item:last-child a').click();
        $timeout.flush();

        expect(element.find('.overflow__excess').hasClass('is--open')).toBeFalsy();

    });

});
