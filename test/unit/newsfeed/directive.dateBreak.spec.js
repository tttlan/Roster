// Directive dateBreak
// ----------------------------------------

describe('Unit: Directives: dateBreak', function() {

    var element, $compile, scope, Activities, $httpBackend, API_BASE_URL;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($rootScope, $injector) {
            
            Activities = $injector.get('Activities');
            $httpBackend = $injector.get('$httpBackend');
            API_BASE_URL = $injector.get('API_BASE_URL');
            $compile = $injector.get('$compile');

            scope = $rootScope.$new();
            
            scope.date = moment().subtract(1, 's'); // Subtract a second off as the directive only deals with dates in the past
            element = angular.element('<div date-break="date" date-break-bypass=""></div>');
            $compile(element)(scope);
            scope.$digest();
        });
    });
    
    // This whole test is pretty fragile due to the compile running in the directive.  
    // Be careful when modifying it
    it('can correctly template the text for the date break', function(){
        
        scope.date = moment().subtract(1, 'd');
        element = angular.element('<div date-break="date" date-break-bypass=""></div>');
        $compile(element)(scope);
        scope.$digest();
        
        expect(element.find('.label').text()).toEqual('Yesterday');
        expect(element.find('.post-line-break').length).toEqual(1); // Test that this element is here just once to make sure the template is being applied correctly
        
        scope.date = moment().subtract(36, 'hours').subtract(5, 's'); // 36 hours and 5 seconds
        element = angular.element('<div date-break="date" date-break-bypass=""></div>');
        $compile(element)(scope);
        scope.$digest();
        
        expect(element.find('.label').text()).toEqual('a few days ago');
        
        
        scope.date = moment().subtract(1, 'week').subtract(5, 's'); // 1 week and 5 seconds
        element = angular.element('<div date-break="date" date-break-bypass=""></div>');
        $compile(element)(scope);
        scope.$digest();
        
        expect(element.find('.label').text()).toEqual('a week ago');  
        
        
        scope.date = moment().subtract(2, 'weeks').subtract(5, 's'); // 2 weeks and 5 seconds
        element = angular.element('<div date-break="date" date-break-bypass=""></div>');
        $compile(element)(scope);
        scope.$digest();
        
        expect(element.find('.label').text()).toEqual('a few weeks ago');  
        
        
        scope.date = moment().subtract(25, 'days').subtract(5, 's'); // 25 days and 5 seconds
        element = angular.element('<div date-break="date" date-break-bypass=""></div>');
        $compile(element)(scope);
        scope.$digest();
        
        expect(element.find('.label').text()).toEqual('a month ago');            
        
        
        scope.date = moment().subtract(45, 'days').subtract(5, 's'); // 45 days and 5 seconds
        element = angular.element('<div date-break="date" date-break-bypass=""></div>');
        $compile(element)(scope);
        scope.$digest();
        
        expect(element.find('.label').text()).toEqual('a few months ago'); 
        
        
        scope.date = moment().subtract(345, 'days').subtract(5, 's'); // 345 days and 5 seconds
        element = angular.element('<div date-break="date" date-break-bypass=""></div>');
        $compile(element)(scope);
        scope.$digest();
        
        expect(element.find('.label').text()).toEqual('a year ago'); 
        
        
        scope.date = moment().subtract(548, 'days').subtract(5, 's'); // 548 days and 5 seconds
        element = angular.element('<div date-break="date" date-break-bypass=""></div>');
        $compile(element)(scope);
        scope.$digest();
        
        expect(element.find('.label').text()).toEqual('a long time ago');
    });
    
    it('can ignore a future date being passed in', function(){
        
        scope.date = moment().add(1, 'hour');
        scope.$apply();
        
        expect(element.find('.post-line-break').length).toEqual(0);
        expect(element.find('.label').length).toEqual(0);
    });
    
    it('can read the date-break-bypass attribute and ignore the sticky line if it\'s passed in', function(){
        
        scope.date = moment().subtract(1, 'd');
        element = angular.element('<div date-break="date" date-break-bypass="4"></div>');
        $compile(element)(scope);
        scope.$digest();
        
        expect(element.isolateScope().bypass).toEqual(4);
        expect(element.find('.label').length).toEqual(0);
    });
    
});
