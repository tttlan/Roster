describe('Unit: Directives:loader', function() {

    var element, scope;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($rootScope, $compile) {

            scope = $rootScope.$new(); 

            element = angular.element('<loader size="large" align="center"></loader>');  
            $compile(element)(scope);
            scope.$digest();       
        });
    });

    it('should render the correct markup as defined in the template', function() {

        expect(element.find('div[class="loading-spinner"]').length).toBeTruthy(); 
    });

    it('should take the align="center" and size="large" attributes and output the corresponding classes correctly', function() {

        expect(element.attr('class')).toContain('loading-spinner__container aligned--center');
        expect(element.find('div[class="loading-spinner__icon--large"]').length).toBeTruthy(); 
    });

    it('should take the size="small" and align="left" attributes and output the corresponding classes correctly', function() {

        inject(function($compile) {
            element = angular.element('<loader size="small" align="left"></loader>');  
            $compile(element)(scope);
            scope.$digest();
        });

        expect(element.attr('class')).toContain('loading-spinner__container aligned--left');
        expect(element.find('div[class="loading-spinner__icon"]').length).toBeTruthy(); 
    });

});
