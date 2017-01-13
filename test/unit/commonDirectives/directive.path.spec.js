describe('Unit: Directives:path', function() {

    var element, scope, Paths;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($rootScope, $compile, $injector) {

            scope = $rootScope.$new();           
            Paths = $injector.get('Paths');

            element = angular.element('<a path="training.index">Go to training</a>'); 
            $compile(element)(scope);
            scope.$digest();
        });
    });

    it('can populate the href attribute correctly with no parameters', function(){
        
        expect(element.attr('href')).toEqual('/training');
    });

    it('can populate the href attribute correctly with one parameter and correctly identify an external link', function(){

        inject(function($rootScope, $compile, $injector) {
            element = angular.element('<a path="network.profile" path-params="1234">Go to profile</a>'); 
            $compile(element)(scope);
            scope.$digest();
        });

        expect(element.attr('href')).toEqual('/profile/1234');
    });

    it('can populate the href attribute correctly when passed 2 parameters', function(){
        
        inject(function($rootScope, $compile, $injector) {
            element = angular.element('<a path="training.subject" path-params="1234,2345">Go to training subject</a>'); 
            $compile(element)(scope);
            scope.$digest();
        });

        expect(element.attr('href')).toEqual('/training/1234/2345');
    });

});