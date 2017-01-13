// Notify Service
// ----------------------------------------

describe('Unit: Service:$notify', function() {

    var $notify, $window, $rootScope;


    beforeEach(function () {
        module('sherpa');
        
        $window = {location: { replace: jasmine.createSpy()} };

        module(function($provide) {
            $provide.value('$window', $window);
            $provide.value('$document', angular.element(document));
        }); 
        
        inject(function($compile, $injector) {

            // set up any required services
            $notify = $injector.get('$notify');
            $rootScope = $injector.get('$rootScope');
        });
    });


    it('can set a notifcation and get the most recent notifcation get all notifications', function() {
        
        $notify.add({message: 'Error message', type: 'error'});
        
        expect($notify.get()).toEqual({message: 'Error message', type: 'error'});
        
        $notify.add({message: 'Success message', type: 'success'});
        
        expect($notify.get()).toEqual({message: 'Success message', type: 'success'});
        
        expect($notify.all()).toEqual([{message: 'Error message', type: 'error'},{message: 'Success message',type: 'success'}]);
        
    });
    
    it('can set a callback function and remove a callback function', function() {
        
        var test = 0;
        
        // Set a callback
        $notify.setCallback(function(){
            test = test + 1;
        });
        
        // Then push a notification to trigger the callback
        $notify.add({message: 'Error message', type: 'error'});
        
        expect(test).toEqual(1); // The callback has been called
        
        // Changing page should also trigger the callback, simulate a change page event
        $rootScope.$broadcast('$locationChangeSuccess');
        
        // And then test that the callback was called again
        expect(test).toEqual(2);
        
        // Then remove the callback and test that it is not called when a notification is added
        $notify.removeCallback(0);
        
        // Then push a notification to trigger the callback
        $notify.add({message: 'Success message', type: 'success'});
        
        expect(test).toEqual(2);        
    });
    
    it('can send an unauthorised user back to the dashboard', function() {
                
        $notify.unauthorisedUser();
    
        expect($window.location).toEqual('http://localhost:9876/dashboard');
    });
    
    it('can kick a user out of the platform and back to the login page', function() {
                
        $notify.kickUser();
    
        expect($window.location).toEqual('http://localhost:9876/signin.aspx');
    });

});
