describe('Unit: Directives:pieChart', function() {

    var element, scope, directiveScope, $timeout;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($rootScope, $compile, _$timeout_) {

            scope = $rootScope.$new(); 

            $timeout = _$timeout_;

            element = angular.element('<pie-chart value-amount="55" value-base="100" verb="Shown"></pie-chart>');  
            $compile(element)(scope);
            scope.$digest();

            directiveScope = element.isolateScope();    
        });
    });

    it('should pass through the percentage, verb and value base correctly', function() {

       expect(element.find('.pie-chart__percent').text()).toEqual('55% Shown');
       expect(directiveScope.valueBase).toEqual(100);
       expect(directiveScope.percentage).toEqual(55);
    });

    it('should set all values correctly for a percentage between 0 and 100', function(){
        
        // Test with 55%
        expect(directiveScope.rotation).toEqual(198);
        expect(directiveScope.visible).toEqual(1); // Show pie slice element, it's greater than zero
        expect(directiveScope.timeoutVal).toEqual(681); // Timeout set to 
        
        // Test the correct inline styling is applied to the pie slice
        expect(directiveScope.getStyle().transform).toEqual('rotate(198deg)');
        expect(directiveScope.getStyle()['-webkit-transform']).toEqual('rotate(198deg)');
        expect(directiveScope.getStyle()['-ms-transform']).toEqual('rotate(198deg)');
        expect(directiveScope.getStyle().opacity).toEqual(1);

        // Flush the 681 timeout and check the output
        $timeout.flush();

        expect(directiveScope.greaterThan50).toBe(true);
    });

    it('should set all values correctly for a negative percentage', function(){

        inject(function($compile) {

            element = angular.element('<pie-chart value-amount="-1" value-base="100" verb="Shown"></pie-chart>');  
            $compile(element)(scope);
            scope.$digest();
            directiveScope = element.isolateScope();
        });

        expect(directiveScope.rotation).toEqual(0);
        expect(directiveScope.visible).toEqual(0); // Don't show pie slice element as it is equal to zero       
        expect(directiveScope.timeoutVal).toEqual(NaN); // NaN is expected since we don't need a timeout.  Angular will handle setting a timeout with NaN
    });

    it('should set all values correctly for a percentage greater than 100', function(){

        inject(function($compile) {

            element = angular.element('<pie-chart value-amount="1000" value-base="100" verb="Shown"></pie-chart>');  
            $compile(element)(scope);
            scope.$digest();
            directiveScope = element.isolateScope();
        });

        expect(directiveScope.rotation).toEqual(360);
        expect(directiveScope.timeoutVal).toEqual(375);
    });

});