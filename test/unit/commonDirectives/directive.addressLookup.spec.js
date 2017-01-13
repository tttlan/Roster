describe('Unit: Directives:addressLookup', function() {

    var element, scope, $httpBackend, $timeout, API_BASE_URL, Profile, expectReset, $document;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($rootScope, $controller, $compile, $injector, _$timeout_, _$document_) {

            scope = $rootScope.$new(); 
            $httpBackend = $injector.get('$httpBackend');
            API_BASE_URL = $injector.get('API_BASE_URL');
            $timeout = _$timeout_;
            $document = _$document_;

            $httpBackend.when('GET', API_BASE_URL + 'profilemanagement/locationlookup?st=3000').respond(200, [{'$id':'1','Id':24067,'Postcode':'3000','Locality':'MELBOURNE','StationRegion':'VIC','CountryId':13,'CountryName':'Australia'}]);
                                    
            $httpBackend.when('GET', API_BASE_URL + 'profilemanagement/locationlookup?st=3031').respond(200, [{'$id':'1','Id':24136,'Postcode':'3031','Locality':'FLEMINGTON','StationRegion':'VIC','CountryId':13,'CountryName':'Australia'},{'$id':'2','Id':24137,'Postcode':'3031','Locality':'KENSINGTON','StationRegion':'VIC','CountryId':13,'CountryName':'Australia'}]);
            
            $httpBackend.when('GET', API_BASE_URL + 'profilemanagement/locationlookup?st=3415').respond(200, [{$id:'1',Id:36894,Postcode:'3415',Locality:'Arapuni, Putaruru',StationRegion:'',CountryId:153,CountryName:'New Zealand'},{$id:'2',Id:25359,Postcode:'3415',Locality:'MIRAM',StationRegion:'VIC',CountryId:13,CountryName:'Australia'}]);
            
            $httpBackend.when('GET', API_BASE_URL + 'profilemanagement/locationlookup?st=90210').respond(200, []);
            
            // A debounce function introduces a delay which is bad for testing.  Redefine the fn so it essentially does nothing
            _.debounce = function(func){
                return func;
            }
            
            expectReset = function() {
                expect(scope.form.$locationLookupResolved).toEqual(false);
                expect(scope.form.$noLocationMatches).toEqual(false);
                expect(scope.form.Postcode.$loading).toEqual(true);
                expect(scope.form.$locationMatches.selected).toEqual({});
                expect(scope.form.$locationMatches.noMatches).toEqual(false);
                                 
                expect(scope.form.Suburb.$viewValue).toEqual('');
                expect(scope.form.StateName.$viewValue).toEqual('');
                expect(scope.form.CountryId.$viewValue).toEqual('');
                
                expect(scope.form.Suburb.$disabled).toEqual(false);
                expect(scope.form.StateName.$disabled).toEqual(false);
                expect(scope.form.CountryId.$disabled).toEqual(false);
                        
                expect(scope.form.$postcodeFound).toEqual(true); 
            }

            var template = '<form name="form" action="">' +
                '<address-lookup>' + 
                    '<input type="text" id="postcode" name="Postcode" ng-model="form.Postcode.$modelValue" />' + 
                    '<address-lookup-suburb></address-lookup-suburb>' + // This is another directive but we won't test anything other than whether it can template itself up
                    '<div class="form__field" ng-class="{\'is--blocked\' : !form.$locationLookupResolved}">' + 
                        '<div class="form__field" ng-show="form.$locationLookupResolved">' + 
                            '<input type="text" name="Suburb" ng-model="form.Suburb.$modelValue" />' + 
                        '</div>' +
                        '<input type="text" name="StateName" ng-model="form.StateName.$modelValue" />' + 
                        '<div class="form__field" ng-show="form.$noLocationMatches">' +
                            '<input type="text" name="City" ng-model="form.City.$modelValue" />' + 
                        '</div>' + 
                        '<input type="text" name="CountryId" ng-model="form.CountryId.$modelValue" />' + 
                    '</div>' + 
                '</address-lookup>' + 
            '</form>';

            element = angular.element(template);
            $compile(element)(scope);
            scope.$digest();
            document.body.appendChild(element[0]); // Append the element to the DOM as the directive contains a test to check whether the element is visible and it won't be unless we are testing this stuff in the DOM
        });
    });

    it('can template itself up an transclude it\'s child elements', function(){
        expect(element.find('.form__field').length).toEqual(6);
        expect(element.find('#selectSuburb').length).toBeTruthy();
        expect(element.find('#noSuburbMatches' + (scope.$id + 1)).length).toBeTruthy(); // Suburb matches appends the directive id to the end of it.  The directive Id will be the current scope id + 1 as this element lives inside the child directive address-lookup-suburb
    });

    it('can reset all values when a postcode is entered and requested multiple times', function(){
        
        // Simulate someone typing, value will change digit length as you type
        scope.form.Postcode.$setViewValue('300');
        scope.$apply();
        
        scope.form.Postcode.$setViewValue('3000');
        scope.$apply();

        expectReset();    
        
        $httpBackend.flush();
        
        expect(scope.form.Postcode.$loading).toEqual(false);
        expect(scope.form.$locationLookupResolved).toEqual(true);
        
        scope.form.Postcode.$setViewValue('9021');
        scope.$apply();
        
        scope.form.Postcode.$setViewValue('90210');
        scope.$apply();

        expectReset();
        
        $httpBackend.flush();
        
        expect(scope.form.Postcode.$loading).toEqual(false);
        expect(scope.form.$locationLookupResolved).toEqual(true);
    });

    it('can populate the address fields when a postcode with one match is requested', function(){
        
        // Simulate someone typing, value will change digit length as you type
        scope.form.Postcode.$setViewValue('300');
        scope.$apply();
        
        scope.form.Postcode.$setViewValue('3000');
        scope.$apply();
        
        $httpBackend.flush();
        
        expect(scope.form.Suburb.$viewValue).toEqual('MELBOURNE');
        expect(scope.form.StateName.$viewValue).toEqual('VIC');
        expect(scope.form.CountryId.$viewValue).toEqual({Label: 'Australia', Value: 13});            
        
        expect(scope.form.Suburb.$disabled).toEqual(true);
        expect(scope.form.StateName.$disabled).toEqual(true);
        expect(scope.form.CountryId.$disabled).toEqual(true);
    });
    
    it('can populate the address fields when a postcode with one match is requested.  when one of the matches have been chosen it can set the address to the selected value', function(){
        
        // Simulate someone typing, value will change digit length as you type
        scope.form.Postcode.$setViewValue('303');
        scope.$apply();
        
        scope.form.Postcode.$setViewValue('3031');
        scope.$apply();
        
        $httpBackend.flush();
        
        expect(scope.form.$locationMatches.data).toEqual([
        {
            label: 'FLEMINGTON',
            id: 24136,
            val: {
                Locality: 'FLEMINGTON',
                StationRegion: 'VIC',
                CountryId: 13,
                CountryLabel: 'Australia' 
            }
        },
        {
            label: 'KENSINGTON',
            id: 24137,
            val: {
                Locality: 'KENSINGTON',
                StationRegion: 'VIC',
                CountryId: 13,
                CountryLabel: 'Australia' 
            }
        }]);
        
        scope.form.$locationMatches.selected.val = {
            Locality: 'KENSINGTON',
            StationRegion: 'VIC',
            CountryId: 13,
            CountryLabel: 'Australia'
        };
        
        scope.form.$locationMatches.setAddress();
        $timeout.flush();
        
        expect(scope.form.Suburb.$viewValue).toEqual('KENSINGTON');
        expect(scope.form.StateName.$viewValue).toEqual('VIC');
        expect(scope.form.CountryId.$viewValue).toEqual({Label: 'Australia', Value: 13});    
        
        expect(scope.form.$locationMatches.data).toEqual([]);
        expect(scope.form.$locationLookupResolved).toEqual(true);
    });
    
    it('can populate the address fields when a postcode with one match is requested.  when one of the matches have been chosen it can set the address to the selected value', function(){
        
        // Simulate someone typing, value will change digit length as you type
        scope.form.Postcode.$setViewValue('303');
        scope.$apply();
        
        scope.form.Postcode.$setViewValue('3031');
        scope.$apply();
        
        $httpBackend.flush();
        
        expect(scope.form.$locationMatches.data).toEqual([
        {
            label: 'FLEMINGTON',
            id: 24136,
            val: {
                Locality: 'FLEMINGTON',
                StationRegion: 'VIC',
                CountryId: 13,
                CountryLabel: 'Australia'
            }
        },
        {
            label: 'KENSINGTON',
            id: 24137,
            val: {
                Locality: 'KENSINGTON',
                StationRegion: 'VIC',
                CountryId: 13,
                CountryLabel: 'Australia'
            }
        }]);
        
        scope.form.$locationMatches.selected.val = {
            Locality: 'KENSINGTON',
            StationRegion: 'VIC',
            CountryId: 13,
            CountryLabel: 'Australia'
        };
        
        scope.form.$locationMatches.setAddress();
        $timeout.flush();
        
        expect(scope.form.Suburb.$viewValue).toEqual('KENSINGTON');
        expect(scope.form.StateName.$viewValue).toEqual('VIC');
        expect(scope.form.CountryId.$viewValue).toEqual({Label: 'Australia', Value: 13});    
        
        expect(scope.form.$locationMatches.data).toEqual([]);
        expect(scope.form.$locationLookupResolved).toEqual(true);
    });
    
    it('if multiple addresses are available and none of them are correct, the fields should be disabled so a custom address can be entered', function(){
        
        // Simulate someone typing, value will change digit length as you type
        scope.form.Postcode.$setViewValue('303');
        scope.$apply();
        
        scope.form.Postcode.$setViewValue('3031');
        scope.$apply();
        
        $httpBackend.flush();
        
        scope.form.$locationMatches.noMatches = true;
        scope.form.$locationMatches.setAddress();
        $timeout.flush();
        
        expect(scope.form.Suburb.$disabled).toEqual(false);
        expect(scope.form.StateName.$disabled).toEqual(false);
        expect(scope.form.CountryId.$disabled).toEqual(false);        
    });
    
    it('if a postcode with no matches is entered, fields are disabled so a custom address can be entered', function(){
        
        // Simulate someone typing, value will change digit length as you type
        scope.form.Postcode.$setViewValue('9021');
        scope.$apply();
        
        scope.form.Postcode.$setViewValue('90210');
        scope.$apply();
        
        $httpBackend.flush();
        
        expect(scope.form.$locationLookupResolved).toEqual(true);
        expect(scope.form.$noLocationMatches).toEqual(true);
        
        expect(scope.form.Suburb.$disabled).toEqual(false);
        expect(scope.form.StateName.$disabled).toEqual(false);
        expect(scope.form.CountryId.$disabled).toEqual(false);
    });
});
