describe('Unit: Directives:selectBox', function() {

    var element, scope;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function ($compile, $rootScope) {

            scope = $rootScope.$new();

            // Use the tabs directive to demonstrate the overflow directive.  Markup taken from the styleguide
            element = angular.element('<select-box ng-model="c"><select ng-model="c" ng-options="c as c.label for c in [{label: \'First option\', val: 1},{label: \'Second option\', val: 2},{label: \'Third option\', val: 3}] track by c.val"></select></select-box>');

            $compile(element)(scope);
            scope.$digest();
        });
    });

    it('should render the correct markup', function () {
        expect(element.attr('class')).toContain('select-wrapper');
        expect(element.find('.select').length).toBeTruthy();
        expect(element.find('select').length).toBeTruthy();
        expect(element.find('option').length).toBeTruthy();
    });

    it('should update the markup in the ".select" element to match the selected option', function () {

        // Initial value, empty
        expect(element.find('.select').text()).toEqual('');

        // Change the select box's value and trigger and change event
        element.find('select').val('3').trigger('change');

        // Verify the ".select" elements text is updated
        expect(element.find('.select').text()).toEqual('Third option');
    });

});