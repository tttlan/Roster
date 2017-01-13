'use strict';

describe('Unit: Directives:ONBOARD_LISTING', function () {

var element, scope, mockService,  OnboardingFactory;

    beforeEach(function () {
        module('sherpa')
        module('templates')
        module('test.services');

        mockService = jasmine.createSpyObj('Onboarding',['getOnboards']);

        module(function($provide) {
          $provide.value('Onboarding', mockService)
        })
    
        inject(function($compile, $rootScope, $notify, $route, $location, Paths, _mockDataService_, $q) {

            mockService.getOnboards.and.returnValue(
                 $q(function(resolve){
                    resolve(_mockDataService_.getRaw('api/recruit/single_list.json'))
                })
            )
            
            scope = $rootScope.$new();
                        
            element = angular.element('<onboard-listing ' +
                    'list-type="single">' +
                    '</onboard-listing >');

             $compile(element)(scope);
             scope.$digest();
        });
    });

    //TODO: will write test case details
    xit('describe test case', function () {
        expect(true).toEqual(true);
    });

});