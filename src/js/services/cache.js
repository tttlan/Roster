angular.module('ui.services')


// HTTP Cache Factory
// ----------------------------------------

.factory('$HTTPCache', ['$angularCacheFactory', '$templateCache', '$q', '$http',
    function($angularCacheFactory, $templateCache, $q, $http) {

        //Set up $http cache
      if (!$angularCacheFactory.get('sherpaCache')) {
          $angularCacheFactory('sherpaCache', {
              maxAge: 300000, // Items added to this cache expire after 5 minute.
              deleteOnExpire: 'aggressive' // Items will be deleted from this cache right when they expire.
            });
        }

      var $HTTPCache = $angularCacheFactory.get('sherpaCache'),
          templateFetchPromises = {}; // object to push our templates we're fetching

      return {
      get: function() {
          return $HTTPCache;
        },
      clear: function(toClear) {
          if(typeof toClear === 'string') {
                
              clearCall(toClear);

            } else {

              toClear.map(function(clearStr) {
                  clearCall(clearStr);
                });
            }
            
          function clearCall(string) {

              $HTTPCache.keys().map(function(cachedUrl) {
                  if(cachedUrl.indexOf(string) !== -1) {
                        
                      $HTTPCache.remove(cachedUrl);

                    }
                });

            }
        },
      getTemplate: function(templateUrl) {

          var fromCache = $templateCache.get(templateUrl);
          var deferred = $q.defer();

          if( fromCache ) {
                // If we have it in the cacheTemplate, resolve right away
              deferred.resolve(fromCache);

            } else if( templateFetchPromises[templateUrl] ) {
                
                // If we are currently fetching it, lets add onto the same promise queue
              templateFetchPromises[templateUrl].success(function(data) {
                  deferred.resolve(data);
                  return data;
                });

            } else {

                // there is no cache, and it's not currently being called
              templateFetchPromises[templateUrl] = $http.get(templateUrl).success(function(data) {
                    //Add it into $templateCache
                  $templateCache.put(templateUrl, data);
                    // remove it from our temp cache
                  delete templateFetchPromises[templateUrl];
                    
                  deferred.resolve(data);

                  return data;
                });
            
            }


          return deferred.promise;

        }
    };
    }]);
