angular.module('ui.common')

.directive('inputAddress', function(Addresses) {
    return {
        restrict: 'E',
        scope: {
            ngRequired: '=?',
            ngDisabled: '=?',
            ngModel: '='
        },
        templateUrl: '/interface/views/common/partials/directive-input-address.html',
        link: function(scope) {
            // uniqueId is used to give form input elements and labels unique values
            // in the HTML id attributes
            scope.uniqueId = scope.$id;

            // by default the suburb, state and country fields are disabled and get filled
            // via postcode lookup. When this property is set to true, these fields are
            // enabled and can be manually populated
            scope.allowCustomAddressEntry = false;

            // used to display loading indicators
            scope.isBusy = false;
            scope.disabled = scope.ngDisabled;
            scope.locationMatches = true;
            scope.noMatchesLocation = false;
            scope.allowInputState = false;
            
            scope.$watch('ngModel.CountryId', function(newVal, oldVal) {
                if(newVal === undefined || newVal === null) {
                    scope.allowInputPostCode = false;
                    $('#' + scope.uniqueId + '__Postcode').val(null);
                    $('#' + scope.uniqueId + '__StateName').val(null);
                    $('#' + scope.uniqueId + '__Suburb').val(null);
                    
                    scope.allowCustomAddressEntry = false;
                    
                    return;
                }
                
                if(newVal !== oldVal) {
                    $('#' + scope.uniqueId + '__Postcode').val(null);
                    $('#' + scope.uniqueId + '__StateName').val(null);
                    $('#' + scope.uniqueId + '__Suburb').val(null);
                    
                    scope.allowCustomAddressEntry = false;
                }
                
                scope.allowInputPostCode = true;
            });
            
            // this is debounced using ng-model-options
            scope.$watch('ngModel.Postcode', function(newVal, oldVal) {
                if (!newVal || !newVal.length || (newVal === undefined)) {
                    return;
                }
                
                if(newVal.length < 4) {
                    return;
                }
                
                if(newVal === oldVal) {
                    if(scope.ngModel.Suburb !== null && scope.ngModel.StateName !== null && scope.ngModel.CountryId !== null) {
                        return;
                    }
                }
                
                scope.isBusy = true;
                
                Addresses.lookupAddressByPostcode(newVal, scope.ngModel.CountryId).then(function(address) {
                    if (address.data.length) {
                        if (address.data.length === 1) {
                            if (address.data[0].Postcode === newVal) {
                                scope.ngModel.Suburb = address.data[0].Locality;
                                scope.ngModel.StateName = address.data[0].StationRegion;
                                scope.allowCustomAddressEntry = false;
                                scope.allowInputState = false;
                            }
                        
                        } else {
                            scope.suburbData = address.data.map(function(location) {
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
                            
                            scope.ngModel.StateName = null;
                            scope.locationMatches = false;
                        }
                        
                    } else {
                        scope.locationMatches = true;
                        scope.ngModel.Suburb = null;
                        scope.ngModel.StateName = null;
                        scope.ngModel.CountryId = null;
                        scope.allowCustomAddressEntry = true;
                    }
                    
                }).finally(function() {
                    scope.isBusy = false;
                });
            });
            
            scope.changeSuburb = function(data) {
                scope.ngModel.Suburb = data.label;
                scope.locationMatches = true;
                
                if (data.val.StationRegion) {
                    scope.ngModel.StateName = data.val.StationRegion;
                } else {
                    scope.ngModel.StateName = null;
                }
                
                if(scope.ngModel.StateName === null) {
                    scope.allowInputState = true;
                }
            };
            
            scope.allowInputAddress = function() {
                scope.locationMatches = true;
                scope.ngModel.Suburb = null;
                scope.allowCustomAddressEntry = true;
            };
        }
    };
});
