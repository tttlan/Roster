/*
 * Define the Google maps API key and styling parameters
 */


SHRP.googleMaps = {
  APIKey: 'AIzaSyAbfshjIN6IBAabJXLZqkJJAPQ3Ik6GgLs',
  style: [{'featureType':'water','elementType':'geometry','stylers':[{'color':'#a2daf2'}]},{'featureType':'landscape.man_made','elementType':'geometry','stylers':[{'color':'#f7f1df'}]},{'featureType':'landscape.natural','elementType':'geometry','stylers':[{'color':'#d0e3b4'}]},{'featureType':'landscape.natural.terrain','elementType':'geometry','stylers':[{'visibility':'off'}]},{'featureType':'poi.park','elementType':'geometry','stylers':[{'color':'#bde6ab'}]},{'featureType':'poi','elementType':'labels','stylers':[{'visibility':'off'}]},{'featureType':'poi.medical','elementType':'geometry','stylers':[{'color':'#fbd3da'}]},{'featureType':'poi.business','stylers':[{'visibility':'off'}]},{'featureType':'road','elementType':'geometry.stroke','stylers':[{'visibility':'off'}]},{'featureType':'road','elementType':'labels','stylers':[{'visibility':'on'}]},{'featureType':'road.highway','elementType':'geometry.fill','stylers':[{'color':'#ffe15f'}]},{'featureType':'road.highway','elementType':'geometry.stroke','stylers':[{'color':'#efd151'}]},{'featureType':'road.arterial','elementType':'geometry.fill','stylers':[{'color':'#ffffff'}]},{'featureType':'road.local','elementType':'geometry.fill','stylers':[{'color':'#dadada'}]},{'featureType':'transit.station.airport','elementType':'geometry.fill','stylers':[{'color':'#cfb2db'}]}]
};
/*
 * Used to access the google maps static maps API, it generates a photo of a map to use when a full map is not necessary
 *
 * Example
 * <static-map address="Carlton Gardens Melbourne" zoom="13" width="320" height="180" className="map"></static-map>
 *
 */

angular.module('ui.common.directives')

.directive('staticMap', ['$timeout', function($timeout) {
  return {
      restrict: 'E',
      scope: {
          address: '@',
          zoom: '@',
          width: '@',
          height: '@',
          className: '@'
        },
      replace:true,
      template: '<img ng-src="{{image}}" alt="Map of {{address}}" class="{{className}}" />',
      link: function(scope, element, attrs) {            
            
          var mapStyles = '';

            // Convert map styles json into string to pass to the static maps API
          angular.forEach(SHRP.googleMaps.style, function(value) {
              mapStyles += '&style=';

              if (value.featureType) {
                  mapStyles += 'feature:' + value.featureType;            
                }
              if (value.elementType) {
                  mapStyles += '%7Celement:' + value.elementType;            
                }
              if (value.stylers) {
                  angular.forEach(value.stylers, function(value, key, obj) {
                      var property = Object.keys(value);
                      property = property[0];
                      var propertyVal = value[property];
                      propertyVal = propertyVal.replace('#','0x');
                      mapStyles += '%7C' + property + ':' + propertyVal;     
                    });                       
                }
            });

            //Wait until the address has been populated
          attrs.$observe('address', function(newValue, oldValue) {
              if (newValue) {
                  $timeout(function() {

                        // Place address in scope so we can use it in alt attribute
                      scope.address = attrs.address || 'Melbourne';

                        // Set some default values if nothing has been passed into the directive
                      scope.zoom = attrs.zoom || 14;
                      scope.width = attrs.width || 500;
                      scope.height = attrs.height || 500;
                      scope.className = attrs.className || '';

                        // Build up a URL sting to send to google maps
                      scope.image = 'http://maps.googleapis.com/maps/api/staticmap?';
                      scope.image += 'center=' + scope.address.replace(/ /g, '+');
                      scope.image += '&zoom=' + scope.zoom;
                      scope.image += '&size=' + scope.width + 'x' + scope.height;
                      scope.image += mapStyles;
                      scope.image += '&markers=icon:http://f.cl.ly/items/1I101t2N2I191m1h0X3q/map-pin.png%7C' + scope.address.replace(/ /g, '+');
                      scope.image += '&key=' + SHRP.googleMaps.APIKey;
                    });
                }
            });
        }
    };
}])

/*
 * Used to place a google map on the page
 *
 * Example
 * <google-map address="Carlton Gardens Melbourne" zoom="13" places-autocomplete="input-id"></google-map>
 *
 */

.directive('googleMap', ['angularLoad', 'mediaQuery', '$http', 'googlePlaces', function(angularLoad, mediaQuery, $http, googlePlaces) {
  return {
      restrict: 'E',
      scope: {
          zoom: '@',
          address: '=',
          draggableMarker: '@',
          placesAutocomplete: '='
        },
      replace: true,
      template: '<div class="googleMap"></div>',
      controller: function($scope, $element, $attrs) {            

          $scope.defaultAddress = 'Australia';

            // Set a default zoom if a zoom value is not passed in
          $attrs.zoom = parseInt($attrs.zoom) || 15;

            // Set a default to Australia if one is not passed in
          if ($scope.address === undefined) {
              $scope.address = $scope.defaultAddress;
            }

          var isMobile = (function() {
              var mediaSize = mediaQuery.get();
              return (mediaSize === 'mobile' || mediaSize === 'phablet');
            })();

          var mapsLibraries = '';

          if ($scope.placesAutocomplete !== 'undefined') {
              mapsLibraries = '&libraries=places';
            }
            
            // Load the API and call our callback function when it has loaded
            // Note that if multiple maps are loaded within angular the API will be loaded multiple times however the requests will cache
          angularLoad.loadScript('http://maps.googleapis.com/maps/api/js?key=' + SHRP.googleMaps.APIKey + '&sensor=true&callback=SHRP.googleMaps.callback' + mapsLibraries);
            
          $scope.$on('$destroy', function() {
                // Delete references to prevent memory leaks
              delete google.maps;
              delete SHRP.googleMaps.geocoder;
              delete SHRP.googleMaps.map;
              delete SHRP.googleMaps.apiLoaded;
            });

          var geocodeTimeout = null;

            // If we need to update the map after it has been initalised
          $scope.$watch('address', function(value) {
                
                // If the value has changed from the default value ie. don't call geocodeAddress() on initialisation
              if (value && value !== $scope.defaultAddress && (value.length >= 5) && SHRP.googleMaps.apiLoaded) {
                    
                    // Don't send too many geocode requests if the user updating scope.address by typing input
                  clearTimeout(geocodeTimeout);
                  geocodeTimeout = setTimeout(function() {
                      geocodeAddress();
                    }, 800);

                  if ($scope.placesAutocomplete !== 'undefined') {
                      googlePlaces.getPlaces($scope.address).then(function(res) {
                          $scope.placesAutocomplete = res.predictions;
                        });
                    }                               
                }              
            });

          SHRP.googleMaps.callback = function() {

              SHRP.googleMaps.apiLoaded = true;
              SHRP.googleMaps.geocoder = new google.maps.Geocoder();

                // Set zoom and map styling
              var mapOptions = {
                  zoom: $attrs.zoom,
                  styles: SHRP.googleMaps.style,
                  mapTypeControl : false,
                  zoomControl: true,
                  scrollwheel: false,
                  panControl: false,
                  zoomControlOptions: {
                      style: google.maps.ZoomControlStyle.SMALL,
                      position: google.maps.ControlPosition.LEFT_BOTTOM
                    },
                  streetViewControl: true
                };                    

                // Create the map 
              SHRP.googleMaps.map = new google.maps.Map($element[0], mapOptions);                

                // Create a callback for when the map has loaded.  
              google.maps.event.addListenerOnce(SHRP.googleMaps.map, 'tilesloaded', function() {
                  if (typeof SHRP.googleMaps.mapLoaded === 'function') {
                      SHRP.googleMaps.mapLoaded();  
                    }
                });

                // Geocode the passed in address and set a marker and the centre of the map

              SHRP.googleMaps.geocoder.geocode({ 'address': $scope.address }, function(results, status) {

                  if (status && status === google.maps.GeocoderStatus.OK) {
                        
                      SHRP.googleMaps.map.setCenter(results[0].geometry.location);

                      if (results[0].geometry.bounds) { // If bounds were returned (they aren't always)
                          SHRP.googleMaps.map.fitBounds(results[0].geometry.bounds);
                        } else {
                          SHRP.googleMaps.map.setZoom(17); 
                        }

                      if (SHRP.googleMaps.map.getZoom() > 17) {
                          SHRP.googleMaps.map.setZoom(17);
                        }

                        // Todo - actually detect retina capability instead of mobile when loading in this image
                      var iconPath = isMobile ? '/interface/images/map-pin-x2.png' : '/interface/images/map-pin.png';
                      var iconImage = new google.maps.MarkerImage(iconPath, null, null, null, new google.maps.Size(17,24));

                      if ($attrs.hasOwnProperty('draggableMarker')) {

                          SHRP.googleMaps.marker = new google.maps.Marker({
                              map: SHRP.googleMaps.map,
                              position: results[0].geometry.location,
                              icon: iconImage,                                
                              draggable: true,
                              animation: google.maps.Animation.DROP,
                              title: 'Move me to fine tune your location'
                            });

                        } else {

                          SHRP.googleMaps.marker = new google.maps.Marker({
                              map: SHRP.googleMaps.map,
                              position: results[0].geometry.location,
                              icon: iconImage
                            });
                        }

                    } else {
                      console.log('Geocode was not successful for the following reason: ' + status);
                    }
                });  

            };

          function geocodeAddress() {

                // This function may be called before the API has loaded.  Test for that case and try run the function again if the API is not ready
              if (!SHRP.googleMaps.apiLoaded) {
                  setTimeout(function() {
                      geocodeAddress();
                    }, 100);
                  return;
                }

                // Geocode the current address in scope and adjust the map zoom to fit it in
              SHRP.googleMaps.geocoder.geocode({ 'address': $scope.address }, function(results, status) {
                    
                  if (status && status === google.maps.GeocoderStatus.OK) {

                      SHRP.googleMaps.map.setCenter(results[0].geometry.location);
                      SHRP.googleMaps.marker.setPosition(results[0].geometry.location);

                      if (results[0].geometry.bounds) { // If bounds were returned (they aren't always)
                          SHRP.googleMaps.map.fitBounds(results[0].geometry.bounds);
                        } else {
                          SHRP.googleMaps.map.setZoom(17); 
                        }

                      if (SHRP.googleMaps.map.getZoom() > 17) {
                          SHRP.googleMaps.map.setZoom(17);
                        }

                    } else {
                      console.log('Geocode was not successful for the following reason: ' + status);
                    }
                });
            }

        }
    };
}])

.factory('googlePlaces', ['$q', function($q) {

  return {

      getPlaces: function(query) {

          var service = new google.maps.places.AutocompleteService();
            
          var deferred = $q.defer();

          service.getPlacePredictions({ input: query }, function(predictions, status) {
              if (status === 'OK') {
                  deferred.resolve({
                      predictions: predictions, 
                      status:status
                    });
                } else {
                  deferred.reject();
                }
            });

          return deferred.promise;
        }
    };
}]);
