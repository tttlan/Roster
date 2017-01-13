
// Feed item
// ----------------------------------------

describe('Unit: Directives: feedItem', function() {

    var element, scope;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($compile, $rootScope, $injector) {
            
            scope = $rootScope.$new();
                    
            element = angular.element('<feed-item></feed-item>');
            $compile(element)(scope)
            scope.$digest();
        });
    });
    
    it('should be able to template itself', function(){
        
        expect(element).toExist();
        expect(element).toHaveClass('post');
    });

});
