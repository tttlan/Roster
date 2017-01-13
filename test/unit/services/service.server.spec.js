describe('Unit: Service:$server', function() {
    var $server;
    var $httpBackend;
    var $window;
    var $rootScope;
    var $notify;
    var $cookies;

    beforeEach(function() {
        $window = {
            location: {
                replace: jasmine.createSpy()
            }
        };

        module('sherpa', function($provide) {
            $provide.value('$window', $window);
            $provide.value('$document', angular.element(document));
        });

        inject(function($compile, $injector) {
            $server = $injector.get('$server');
            $notify = $injector.get('$notify');
            $rootScope = $injector.get('$rootScope');
            $httpBackend = $injector.get('$httpBackend');
            $cookies = $injector.get('$cookies');

            $cookies.put('Sherpa.aspxauth', 'D5F08B25F57BB5020A4AC05EB8FC7649B79C2529E5DD84D48F4CC70935E38B21AC2B1EEEC40082428852D7C28F90E0EE369DC6CF1B7B095F877CDC883C9F340B54BDCCFDDD6AEA400260945FE6279D33F45B6ECE6BEE06E9D6ABCA4340AFD72B5015C4145FF5BFDC3658CD15F6F7668E6110A39797726B64DA07FCB5A76DB77A082E17DE8045B420F825C9E2AC7BA8D0D58D6B12397CFBB386764602B9E992B7AF7F05690A9996682CF8AD3AB870A5B79C2A5ACB4EEC3FABBA19A94B65B2D16EEAF70A385E9BB04197DE64B2028372C1E788C7F51D869C55EBBA691EBCE305DA30D0B5D5FA664232C3FA6706F4922261DD6D84F786F9314AA5C65F52FDAF5571B1582657');
            spyOn(console, 'log');
        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingRequest();
        $httpBackend.verifyNoOutstandingExpectation();
    });

    it('should be able to generate a POST request', function() {
        $httpBackend.when('POST', 'http://test.com/create').respond(200, {
            test: 'respCreate'
        });

        var testRes = $server.create({
            url: 'http://test.com/create',
            data: {
                testProp: 'req',
                testProp2: 'req2'
            }
        });

        testRes.then(function(res) {
            expect(res.config.headers['Content-Type']).toEqual('application/json');
            expect(res.config.method).toEqual('POST');
            expect(res.data).toEqual({
                test: 'respCreate'
            });

            expect(res.config.url).toEqual('http://test.com/create');
            expect(res.config.data).toEqual('{"testProp":"req","testProp2":"req2"}');
        });

        $httpBackend.flush();
    });

    it('should be able to generate a POST request for form data', function() {
        $httpBackend.when('POST', 'http://test.com/create').respond(200, {
            test: 'respCreate'
        });

        var testRes = $server.create({
            url: 'http://test.com/create',
            data: {
                testProp: 'req',
                testProp2: 'req2'
            },
            type: 'formData'
        });

        testRes.then(function(res) {
            expect(res.config.headers['Content-Type']).toEqual('application/x-www-form-urlencoded; charset=utf-8');
            expect(res.config.data).toEqual('testProp=req&testProp2=req2');
        });

        $httpBackend.flush();
    });

    it('should be able to generate a PUT request', function() {
        $httpBackend.when('PUT', 'http://test.com/update').respond(200, {
            test: 'respUpdate'
        });

        var testRes = $server.update({
            url: 'http://test.com/update',
            data: {
                testProp: 'req',
                testProp2: 'req2'
            }
        });

        testRes.then(function(res) {
            expect(res.config.headers['Content-Type']).toEqual('application/json');
            expect(res.config.method).toEqual('PUT');
            expect(res.data).toEqual({
                test: 'respUpdate'
            });

            expect(res.config.url).toEqual('http://test.com/update');
            expect(res.config.data).toEqual('{"testProp":"req","testProp2":"req2"}');
        });

        $httpBackend.flush();
    });

    it('should be able to generate a GET request with caching', function() {
        $httpBackend.when('GET', 'http://test.com/get?testProp=req&testProp2=req2').respond(200, {
            test: 'respGet',
            test2: 'respGet2'
        });

        var testRes = $server.get({
            url: 'http://test.com/get',
            query: {
                testProp: 'req',
                testProp2: 'req2'
            }
        });

        testRes.then(function(res) {
            expect(res.config.cache).toEqual(jasmine.any(Object));
            expect(res.config.headers.Accept).toEqual('application/json, text/plain, */*');
            expect(res.config.method).toEqual('GET');

            expect(res.data).toEqual({
                test: 'respGet',
                test2: 'respGet2'
            });
            expect(res.config.url).toEqual('http://test.com/get?testProp=req&testProp2=req2');
        });

        $httpBackend.flush();
    });

    it('should be able to generate a GET request without caching', function() {
        $httpBackend.when('GET', 'http://test.com/get?testProp=req&testProp2=req2').respond(200, {
            test: 'respGet',
            test2: 'respGet2'
        });

        var testRes = $server.get({
            url: 'http://test.com/get',
            query: {
                testProp: 'req',
                testProp2: 'req2'
            }
        }, true);

        testRes.then(function(res) {
            expect(res.config.cache).toBeUndefined();
            expect(res.config.headers.Accept).toEqual('application/json, text/plain, */*');
            expect(res.config.method).toEqual('GET');

            expect(res.data).toEqual({
                test: 'respGet',
                test2: 'respGet2'
            });
            expect(res.config.url).toEqual('http://test.com/get?testProp=req&testProp2=req2');
        });

        $httpBackend.flush();
    });

    it('should be able to generate a DELETE request', function() {
        $httpBackend.when('DELETE', 'http://test.com/delete?testProp=req&testProp2=req2').respond(200, {
            test: 'respRemove',
            test2: 'respRemove2'
        });

        var testRes = $server.remove({
            url: 'http://test.com/delete',
            query: {
                testProp: 'req',
                testProp2: 'req2'
            }
        });

        testRes.then(function(res) {
            expect(res.config.headers.Accept).toEqual('application/json, text/plain, */*');
            expect(res.config.method).toEqual('DELETE');

            expect(res.data).toEqual({
                test: 'respRemove',
                test2: 'respRemove2'
            });
            expect(res.config.url).toEqual('http://test.com/delete?testProp=req&testProp2=req2'); // The URL
        });

        $httpBackend.flush();
    });

    it('should be be able to handle an error and call the error and request interceptors', function() {
        $httpBackend.when('GET', 'http://test.com/get?testProp=req&testProp2=req2').respond(405, {
            test: 'error'
        });

        var testRes = $server.get({
            url: 'http://test.com/get',
            query: {
                testProp: 'req',
                testProp2: 'req2'
            }
        });

        testRes.then(function() {
            // Nothing here, we're expecting to be sent to the error fn
        }).catch(function(res) {
            expect(res.config.headers.Authorization).toEqual('Sherpa.aspxauth=D5F08B25F57BB5020A4AC05EB8FC7649B79C2529E5DD84D48F4CC70935E38B21AC2B1EEEC40082428852D7C28F90E0EE369DC6CF1B7B095F877CDC883C9F340B54BDCCFDDD6AEA400260945FE6279D33F45B6ECE6BEE06E9D6ABCA4340AFD72B5015C4145FF5BFDC3658CD15F6F7668E6110A39797726B64DA07FCB5A76DB77A082E17DE8045B420F825C9E2AC7BA8D0D58D6B12397CFBB386764602B9E992B7AF7F05690A9996682CF8AD3AB870A5B79C2A5ACB4EEC3FABBA19A94B65B2D16EEAF70A385E9BB04197DE64B2028372C1E788C7F51D869C55EBBA691EBCE305DA30D0B5D5FA664232C3FA6706F4922261DD6D84F786F9314AA5C65F52FDAF5571B1582657'); // Expect the auth cookie to be passed throuygh the headers of the request

            // Expect the error interceptor to have added a notifcation
            expect($notify.get()).toEqual({
                message: '405: undefined',
                type: 'error',
                visible: false
            });
            if (!SHRP.isMinified) {
                expect(console.log).toHaveBeenCalledWith('Method Not Allowed');
            }
            expect(res.data).toEqual({
                test: 'error'
            });
        });

        $httpBackend.flush();
    });

    it('should not send a real request if the silent flag was set', function() {
        $window.SILENT = true;

        var testRes = $server.update({
            url: 'http://test.com/update',
            data: {
                testProp: 'req',
                testProp2: 'req2'
            }
        });

        testRes.then(function() {
            // Nothing here as the promise was rejected
        }).catch(function(res) {
            expect(res).toEqual(jasmine.any(Object));
        });

        $rootScope.$apply();
    });
});
