// Allows for capturing an address with autocomplete based on the postcode entered

angular.module('ui.common')

.directive('addressLookup', ['Profile', '$timeout', function(Profile, $timeout) {
    
    return {
        restrict: 'E',
        scope: false,
        transclude: true,
        replace: true,
        template: '<div class="form__address-lookup" ng-transclude></div>',
        link: function(scope, element, attrs) {
            if (attrs.classes) {
                element.addClass(attrs.classes);
            }

            var fieldNames = attrs.fieldNames ? scope.$eval(attrs.fieldNames) : ['Suburb', 'StateName', 'Postcode', 'City'];

            var CountryId = attrs.countryIdAttr ? attrs.countryIdAttr : "CountryId";
            var Suburb = fieldNames[0];
            var StateName = fieldNames[1];
            var Postcode = fieldNames[2];
            var City = fieldNames[3];

            var prexix = attrs.prefix ? attrs.prefix : "";
            var $locationMatches = '$' + prexix + 'locationMatches';
            var $locationLookupResolved = '$' + prexix + 'locationLookupResolved';
            var $noLocationMatches = '$' + prexix + 'noLocationMatches';
            var $postcodeFound = '$' + prexix + 'postcodeFound';
            
            scope.form[$locationLookupResolved] = true;
            
            scope.$watch('form.'+ Postcode +'.$viewValue', _.debounce(function(newVal, oldVal) {                

                if (newVal && newVal.length >= 4) {
                    scope.form[$postcodeFound] = true;
                }
                
                if (newVal && 
                    oldVal && 
                    newVal.length !== oldVal.length && 
                    newVal.length >= 4 &&
                    element[0].offsetHeight !== 0 &&
                    !isNaN(newVal)) { // And also check that the field is a valid number

                    newLookup();
                    
                    Profile.getAddressDetails({postcode: newVal, countryId: scope.form[CountryId].$viewValue.Value}).then(function(res) {
                        
                        scope.form[Postcode].$loading = false;

                        if (res.data.length) { // If we got data back from the API

                            if (res.data.length === 1) { // If there's only one result there's no need to allow a drop down for state.
                            
                                scope.form[$locationLookupResolved] = true; // We have one matching postcode

                                if (res.data[0].Postcode === scope.form[Postcode].$viewValue) { // If the res is not for the current val, discard it
                                    setAddress(res.data[0]);
                                }
                            
                            } else { // Greater that one, create a drop down for state and then populate from there
    
                                scope.form[$locationMatches].data = res.data.map(function(location) {

                                    return {
                                        label: location.Locality,
                                        id: location.Id,
                                        val: {
                                            Locality: location.Locality,
                                            StationRegion: location.StationRegion,
                                            CountryId: location.CountryId,
                                            CountryLabel: location.CountryName
                                        }
                                    };
                                });
                            }
                            
                        } else { // We did not get any data back from the API, enable the city field and the other fields so that a custom address can be entered
                            scope.form[$locationLookupResolved] = true;
                            scope.form[$noLocationMatches] = true;
                            
                            angular.forEach(fieldNames, function(value) {
                                scope.form[value].$setViewValue('');
                                
                                if(value !== Postcode) {
                                    scope.form[value].$disabled = false;
                                    scope.form[value].$render();
                                }
                            });
                        }
                    });
                }
            }, 500));
            function newLookup() {
                scope.form[$locationMatches].data = [];
                scope.form[$locationLookupResolved] = false;
                scope.form[$noLocationMatches] = false;
                scope.form[Postcode].$loading = true;
                scope.form[$locationMatches].selected = {};
                scope.form[$locationMatches].noMatches = false;
                //clearFields();
            }
            
            scope.resetLookup = function() {
                scope.form[$locationLookupResolved] = false;
                scope.form[$noLocationMatches] = false;
                scope.form[Postcode].$loading = false;
                clearFields();
            };
            
            function clearFields(allowPostcode) {
                angular.forEach(fieldNames, function(value) {
                    scope.form[value].$setViewValue('');
                    
                    if(allowPostcode) {
                        scope.form[Postcode].$disabled = false;
                        scope.form[Postcode].$render();
                        
                        if(value !== Postcode) {
                            scope.form[value].$disabled = true;
                            scope.form[value].$render();
                        }
                    }
                    else{
                        scope.form[value].$disabled = true;
                        scope.form[value].$render();
                    }
                });
            }
                
            
            function setAddress(data) {

                scope.form[Suburb].$setViewValue(data.Locality);
                
                if (data.StationRegion) {
                    scope.form[StateName].$setViewValue(data.StationRegion);
                } else {
                    scope.form[StateName].$setValidity('required', true); // If no state or region comes back from the API, mark the field as valid and allow empty input
                }
                
                //scope.form[CountryId].$setViewValue({
                //    Label: data.CountryLabel ? data.CountryLabel : data.CountryName, 
                //    Value: data.CountryId
                //});
                
                angular.forEach(fieldNames, function(value) {
                    if(value !== Postcode) {
                        scope.form[value].$disabled = true;
                        scope.form[value].$render();
                        
                        checkNewValueAutoInput(value);
                    }
                });
                
            }
            
            function checkNewValueAutoInput(name, allowPostcode) {
                if(allowPostcode) {
                    if(name !== Postcode) {
                        scope.form[name].$setViewValue('');
                        scope.form[name].$render();
                    }
                }
                
                if(scope.form[name].$viewValue === '') {
                    scope.form[name].$disabled = false;
                    scope.form[name].$setValidity('required', true);
                }
            }
            
            scope.form[$locationMatches] = {
                setAddress: function() {

                    if (scope.form[$locationMatches].noMatches === true) { // The no matches checkbox has been checked
                        scope.form[$noLocationMatches] = true;
                        
                        angular.forEach(fieldNames, function(value) {
                            checkNewValueAutoInput(value, true);
                        });
                        
                    } else if (scope.form[$locationMatches].selected) { // This fix for set null locationMatches data
                        setAddress(scope.form[$locationMatches].selected.val);
                    }
                    
                    $timeout(function() {
                        scope.form[$locationMatches].data = [];
                        scope.form[$locationLookupResolved] = true;
                    }, 400);
                }               
            };
            
            var key = attrs.countryIdAttr ? 'form.' + attrs.countryIdAttr : 'form.CountryId';
            
            scope.$watch(key + '.$viewValue', _.debounce(function(newVal, oldVal) {
                if(newVal === null || newVal === '' || (newVal === undefined && oldVal === undefined)) {
                    scope.form[$locationLookupResolved] = true;
                    scope.form[$noLocationMatches] = false;
                    
                    clearFields();
                    return;
                }
                
                if (newVal && oldVal && angular.isObject(newVal) && angular.isObject(oldVal) && newVal.Value !== oldVal.Value) {
                    scope.form[$noLocationMatches] = false;
                    
                    clearFields(true);
                    return;
                }
                
                if(newVal && !isNaN(newVal.Value) && (oldVal === null || oldVal === undefined || oldVal === '')) {
                    scope.form[$locationLookupResolved] = true;
                    scope.form[$noLocationMatches] = false;
                    
                    clearFields(true);
                    return;
                }
                
            }));
        }
    };
}])

.directive('addressLookupSuburb', function() {
    
    return {
        restrict: 'E',
        scope: false,
        replace: true,
        templateUrl: '/interface/views/common/partials/address-lookup-suburb.html',
        link: function(scope, element, attrs) {
            if (attrs.suburbClasses) {
                scope.suburbClasses = attrs.suburbClasses;
            }
            var prefix = attrs.prefix ? attrs.prefix : "";
            scope.modelNameBinding = "$" + prefix + "locationMatches";
            scope.ngChangeNameBinding = "form.$" + prefix + "locationMatches.setAddress()";
            //scope.noMatchBindingName = "form.$locationMatches.noMatches";
        }
    };
});
