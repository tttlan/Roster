describe('Unit: Directives:removeExtension', function() {

    var element, linker, scope, html, $compile;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($rootScope, _$compile_) {

            scope = $rootScope.$new(); 
            scope.models = {};
            $compile = _$compile_;

            html = '<form name="testForm">' +
                        '<input remove-extension name="test" ng-model="models.test">' +
                    '</form>';

            element = angular.element(html);
            linker = $compile(element);
            element = linker(scope); 
        });
    });

    it('remove and add the extension from the entered value', function() {
        
        var string = 'testname',
            ext = '.jpg';

        var viewValue = string + ext,
            input = element.find('input');

        scope.models.test = viewValue;
        scope.$digest();

        // Formaters
        expect(scope.testForm.test.$viewValue).toBe(string);
        // Parser
        expect(scope.testForm.test.$modelValue).toBe(string + ext);

    });

    it('remove and add the extension from a malformed value', function() {
        
        var string = 'testname.namd_0/ehadasd.e',
            ext = '.jpeg';

        var viewValue = string + ext,
            input = element.find('input');

        scope.models.test = viewValue;
        scope.$digest();

        // Formaters
        expect(scope.testForm.test.$viewValue).toBe(string);
        // Parser
        expect(scope.testForm.test.$modelValue).toBe(string + ext);

    });

});