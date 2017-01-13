// Factory Service
// ----------------------------------------

angular.module('ui.services')


// Server Factory
// ----------------------------------------

.factory('$server', ['$http', '$q', '$HTTPCache', '$rootScope', '$window', function($http, $q, $HTTPCache, $rootScope, $window) {

    var cancelAllRequests = $q.defer();
    var DEFAULT_REQUEST = {
        url: '/api',
        query: {},
        data: {},
        timeout: cancelAllRequests.promise
    };

    var $cache = $HTTPCache.get();

    // Helper function used to build parameter string
    function buildParams(obj, removePrefix) {
        var query = '',
            beginningPrefix = removePrefix ? '' : '?';

        obj = (typeof obj === 'object') ? obj : {};

        angular.forEach(obj, function(val, key) {
            if (val !== undefined && val !== '') {
                var prefix = query.length ? '&' : beginningPrefix;
                query += prefix + key + '=' + val;
            }
        });

        return query;
    }

    // Wrapper for http requests, that handles error and promises.
    function makeCall(obj) {
        // If we are debugging, lets not post, update or delete
        if (($window.SILENT || angular.element('html').attr('silent')) && obj.method !== 'GET') {
            console.log('Request sent:');
            console.log('__________________________');
            console.dir(obj);
            console.log('__________________________');
            return $q.reject({});
        }

        return $http(obj);
    }

    // Sets up watch for page change to cancel all requests
    $rootScope.$on('$locationChangeStart', function() {
        cancelAllRequests.resolve();
        cancelAllRequests = $q.defer();
    });

    return {
        create: function(req) {
            var opts = angular.extend({}, DEFAULT_REQUEST, req),
                contentType;

            // Tests the data type we need to send through
            if (req.type === 'formData') { //Form Data
                contentType = 'application/x-www-form-urlencoded; charset=utf-8';
                opts.data = buildParams(opts.data, true);
            } else { // Json
              contentType = 'application/json';
              opts.data = JSON.stringify(opts.data);
            }

            return makeCall({
                method: 'POST',
                url: opts.url,
                data: opts.data,
                headers: {
                    'Content-Type': contentType
                }
            });
        },

        update: function(req) {
            req = angular.extend({}, DEFAULT_REQUEST, req);

            return makeCall({
                method: 'PUT',
                url: req.url,
                data: JSON.stringify(req.data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },

        // Caching is enabled for GET requests by default!
        // If you need to bypass the cache and get a fresh resource from the server,
        // call $server.get with `bypassCache` as `true`
        get: function(req, bypassCache) {
            req = angular.extend({}, DEFAULT_REQUEST, req);


            var opts = {
                method: 'GET',
                url: req.url + buildParams(req.query)
            };

            if (!bypassCache){
                angular.extend(opts, {cache: $cache})
            }

            if(req.hasOwnProperty("responseType")) {
                angular.extend(opts,{ responseType: req.responseType})
            }

            return makeCall(opts);
        },

        remove: function(req) {
            req = angular.extend({}, DEFAULT_REQUEST, req);

            return makeCall({
                method: 'DELETE',
                url: req.url + buildParams(req.query)
            });
        }
    };
}])

.config(function($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
    $httpProvider.defaults.headers.common['Access-Control-Expose-Headers'] = '';

    // Server interceptor, to broadcast on Response Errors.
    $httpProvider.interceptors.push(function($q, $notify, $location, $cookies) {
        var ERRORS = {
            500: function() {
                console.log('server error');
            },
            401: $notify.kickUser,
            403: $notify.unauthorisedUser,
            404: function() {
                console.log('Page not found');
            },
            405: function() {
                console.log('Method Not Allowed');
            },
            0: function() {
                console.log('Rejected by the server!');
            }
        };

        var errorFn = function(response) {
            // Broadcast error unless we set a bypass param on the http request config
            if (!response.config.bypassErrorInterceptor) {
                $notify.add({
                    message: response.status + ': ' + (response.data ? response.data.Message : ''),
                    type: 'error',
                    visible: false
                });

                if (typeof ERRORS[response.status] === 'function') {
                    ERRORS[response.status]();
                }
            }

            return $q.reject(response);
        };

        function responseFn(res) {
            // For all responses, figure out if an error was returned within response
            // with a 200 status

            if (!res.data.Status) {
                // Do nothing here, this is a request is using the old API structure
                // for returning errors
                return res;
            }

            if (res.data.Status && res.data.Status === 0) {
                // Response is in the new structure and is fine, do nothing
                return res;
            }

            if (res.data.Status && res.data.Status === 1) {
                // An error has been returned, handle it here
                angular.forEach(res.data.Errors, function(error) {
                    if (error.ExtraInfos.length > 0) {
                        angular.forEach(error.ExtraInfos, function(extraInfo) {
                            $notify.add({
                                message: extraInfo.Message + '  Code: ' + extraInfo.Code,
                                type: 'error'
                            });
                        });
                    } else {
                        $notify.add({
                            message: error.Message + '  Code:  ' + error.Code,
                            type: 'error'
                        });
                    }
                });

                // If the request was cached, clear the cache
                if (res.config.cache) {
                    res.config.cache.remove(res.config.url);
                }

                return $q.reject(res);
            }
        }

        function request(config) {
            // For any outgoing request, retrieve the cookie that was set by the login
            // page and add that auth code to the headers for the request

            config = config || {};

            var authToken = $cookies.get('Sherpa.aspxauth');

            if (authToken) {
                config.headers.Authorization = 'Sherpa.aspxauth=' + authToken;
            }

            return config;
        }

        return {
            requestError: errorFn,
            responseError: errorFn,
            response: responseFn,
            request: request
        };
    });
});
