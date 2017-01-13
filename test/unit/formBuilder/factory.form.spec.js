// Factory ProfileForm
// ----------------------------------------

describe('Unit: Factory:Form', function() {

    var FormFactory, form, MockService, createFormFactory, $timeout, $notify, $q, $rootScope, basicFormOptions;

    beforeEach(function () {
        module('sherpa');

        // Mock Profile Service, and Notify
        module(function ($provide) {

            // A fake service that the FormFactory will use
            $provide.value('MockService', {
                getStuff: function(){
                    
                    var deferred = $q.defer();
                    
                    deferred.resolve({ 
                        data: {
                            service: 'get success'
                        }
                    });
                    
                    return deferred.promise;
                },
                getStuffError: function(){
                    
                    return $q.reject({ 
                        data: {
                            service: 'get error'
                        }
                    });
                },
                saveStuff: function(res){
                    
                    var deferred = $q.defer();
                    res.data.service = 'save success';                    
                    deferred.resolve(res);                    
                    return deferred.promise;
                },
                saveStuffError: function(res) {
                    
                    res.data.service = 'save error';                    
                    return $q.reject(res);
                }
            });
            
            // Fake the $notify service
            $provide.value('$notify', {
                list: [],
                add: function(notify){
                    this.list.push(notify);
                }
            });
        });
        
        inject(function($compile, _$rootScope_, _$timeout_, _$q_, $injector) {
            
            // set up any required services       
            FormFactory = $injector.get('FormFactory');
            $notify = $injector.get('$notify');
            $timeout = _$timeout_;
            $q = _$q_;
            $rootScope = _$rootScope_;
        });
        
        basicFormOptions = {
            serviceName: 'MockService',
            getAction: 'getStuff',
            getDataSuccessFn: function(that, res) {
                res.data.hook = 'callback success';
                return res;
            },
            getDataErrorFn: function(that, res) {
                res.data.hook = 'callback error';
                return res;
            },
            saveAction: 'saveStuff',
            saveDataFn: function(that, res) {
                res.data.hook = 'manipulated data before save';
                return res;
            },
            saveDataSuccessFn: function(that, res) {
                that.$saved = true;
                // This does not need to return anything
                // Add a saved property so we know this function was executed
            },
            successMsg: 'Success!',
            saveDataErrorFn: function(that, res) {
                that.$saved = false;
                // This does not need to return anything
                // Add a saved property so we know this function was executed
            },
            errorMsg: 'Error!',            
            customProperties: {
                $custom: 'custom'
            }
        }
        
        createFormFactory = function(options) {
            return new FormFactory(options);
        }

    });

    it('should set it\'s initial values correctly', function() {
        
        form = createFormFactory(basicFormOptions);

        expect(form.$submitting).toBe(false);
        expect(form.$loaded).toBe(false);
        expect(form.$error).toBe(false);
        
        expect(form.selectData).toEqual(jasmine.any(Object));
        expect(form.customLabels).toEqual(jasmine.any(Object));
        expect(form.staticValues).toEqual(jasmine.any(Object));
        
        expect(form.dict.serviceName).toEqual('MockService'); 
        expect(form.dict.getAction).toEqual('getStuff'); 
        expect(form.dict.getDataSuccessFn).toEqual(jasmine.any(Function));
        expect(form.dict.getDataErrorFn).toEqual(jasmine.any(Function)); 
        expect(form.dict.saveAction).toEqual('saveStuff');
        expect(form.dict.saveDataFn).toEqual(jasmine.any(Function)); 
        expect(form.dict.saveDataSuccessFn).toEqual(jasmine.any(Function)); 
        expect(form.dict.successMsg).toEqual('Success!');
        expect(form.dict.saveDataErrorFn).toEqual(jasmine.any(Function)); 
        expect(form.dict.errorMsg).toEqual('Error!');
        expect(form.dict.customProperties.$custom).toEqual('custom');        
    });

    it('should call the DataFn, set a $promise and then call the return function', function(){
        
        form = createFormFactory(basicFormOptions);
        
        expect(form.$promise).toEqual(jasmine.any(Function));
        
        form.$promise().then(function(res){
            expect(form.$loaded).toBe(true);
            expect(form.$error).toBe(false);
            expect(res.data.service).toBe('get success');
            expect(res.data.hook).toBe('callback success');
            return res;
        });
        
        $rootScope.$apply();
    });
    
    it('should handle an error correctly if the request to the promise was unsuccessful', function(){
        
        var options = basicFormOptions;        
        options.getAction = 'getStuffError';

        form = createFormFactory(options);
        
        expect(form.$promise).toEqual(jasmine.any(Function));

        form.$promise().then(function(res){
            // Sucess fn, this won't be called
        }, function(res){
            expect(form.$loaded).toBe(true);
            expect(form.$error).toBe(true);
            expect(res.data.service).toBe('get error');   
            expect(res.data.hook).toBe('callback error');            
            return res;
        });
        
        $rootScope.$apply();
    });

    it('should not call the data function if one was not passed in', function(){
        
        var options = basicFormOptions;        
        options.getAction = '';
        
        form = createFormFactory(options);
        
        expect(form.$promise).toEqual(undefined);
    });
    
    it('should be able to take form data and send it off to a service to save it', function(){
        
        form = createFormFactory(basicFormOptions);
    
        expect(form.$save).toEqual(jasmine.any(Function));
    
        form.$save({
            data: { }
        }).then(function(res){
                        
            expect(res.data.service).toEqual('save success');
            expect(res.data.hook).toEqual('manipulated data before save');
                        
            $timeout(function(){
                
                expect(form.$submitting).toEqual(false);   
                expect(form.$saved).toEqual(true); 
                
                // Make sure the $notify service has sent up our custom message 
                expect($notify.list.length).toBe(1);
                expect($notify.list[0].type).toBe('success');
                expect($notify.list[0].message).toBe('Success!');
            });
        });
            
        expect(form.$submitting).toEqual(true);
        
        $timeout.flush();
        $rootScope.$apply();
    });
    
    it('when saving form data, if an error is encountered, it should be able to handle it appropriately', function(){
        
        var options = basicFormOptions;        
        options.saveAction = 'saveStuffError';

        form = createFormFactory(options);
    
        expect(form.$save).toEqual(jasmine.any(Function));
    
        form.$save({
            data: { }
        }).then(function(res) {
            // Success function, we're not using this since we are testing an error response here
        }, function(res) {
                     
            expect(res.data.service).toEqual('save error');
            expect(res.data.hook).toEqual('manipulated data before save');
                   
            $timeout(function(){

                expect(form.$submitting).toEqual(false);   
                expect(form.$saved).toEqual(false); 
                
                // Make sure the $notify service has sent up our custom message 
                expect($notify.list.length).toBe(1);
                expect($notify.list[0].type).toBe('error');
                expect($notify.list[0].message).toBe('Error!');
            });
        });
            
        expect(form.$submitting).toEqual(true);
        
        $timeout.flush();
        $rootScope.$apply();
    });

});
