// Directive auto scroll
// ----------------------------------------

describe('Unit: Directives:auto scroll', function () {

    var element, scope, eleScope, API_BASE_URL, $compile;
    var $timeout;
    beforeEach(function () {
        module('sherpa');
        module('templates');
        
        inject(function ($rootScope, $injector, _$timeout_) {

            API_BASE_URL = $injector.get('API_BASE_URL');
            $compile = $injector.get('$compile');
            $timeout = _$timeout_;

            scope = $rootScope.$new();

            scope.size = 1024;
            scope.sizeFactor = 2;
            scope.direction = 'x';
            scope.autoFit = false;

            element = angular.element('<div id="scroll-wrapper"><auto-scroll size="size" direction="direction" size-factor="sizeFactor" auto-fit=autoFit> <div auto-scroll-holder></div> </auto-scroll></div>')
            element.appendTo(document.body);
            element.width(2049);

            $compile(element)(scope);
            scope.$digest();
            $timeout.flush();
            eleScope = element.isolateScope();
        });
    });

    // vertical scroll is same as test case of horizontial 
    // no support for 2-dimesion scroll bar
    it('should generate right scrollbar template', function () {
        expect(element.find('#mCSB_2').length).toBeTruthy();
        expect(element.find('#mCSB_2_scrollbar_horizontal').length).toBeTruthy();
    })
    it('should create a scrollbar in typical case', function () {
        expect(element.find('[auto-scroll-holder]').attr('style').indexOf('width: 2048px;') >= 0).toBeTruthy();
        scope.size = 1000;
        element.width(1024);
        scope.$digest();
        expect(element.find('[auto-scroll-holder]').attr('style').indexOf('width: 2000px;') >= 0).toBeTruthy();
    });

    it('should create a rightly scrollbar in with no fit on parent with', function () {
        scope.autoFit = true;
        scope.$digest();
        expect(element.find('[auto-scroll-holder]').attr('style').indexOf('width: 100%;') >= 0).toBeTruthy();
    });

});
