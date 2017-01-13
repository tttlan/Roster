describe('Unit: Directives:focusInput', function() {

    var element, scope, $timeout;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($compile, $rootScope, _$timeout_) {

            $timeout = _$timeout_;

            scope = $rootScope.$new();
        
            // Use the tabs directive to demonstrate the overflow directive.  Markup taken from the styleguide
            element = angular.element('<div focus-input><input type="text" /></div>');

            $compile(element)(scope);
            scope.$digest();
        });
    });

    it('should place focus on the child element when the parent is clicked', function(){

        element.appendTo(document.body);
        element.click();
        $timeout.flush();
        
        expect(element.find('input')[0]).toEqual(document.activeElement);
    });

});