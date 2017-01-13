describe('Unit: Directives:notifications', function() {

    var element, scope, $notify, $timeout;

    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($rootScope, $compile, $injector, _$timeout_) {

            scope = $rootScope.$new(); 
            
            $notify = $injector.get('$notify');
            
            $timeout = _$timeout_;

            element = angular.element('<notifications display-time="10000"></notifications>');  
            $compile(element)(scope);
            scope.$digest();
        });
    });

    it('should render the correct markup as defined in the template with one notification', function() {
        
        $notify.add({message: 'Error message', type: 'success'});
           
        scope.$apply(); 
                       
        expect(element).toHaveClass('notifications');
        expect(element.find('li')).toHaveLength(1);
        
        // Expect an empty list since the scope has been applied.  scope apply will trigger a route change for some reason which is then clearing our timeouts.  
        expect(element.scope().$timeouts.list.length).toEqual(0); 
    });
    
    it('should add a notification to the notifications array and a timeout to the timeouts array', function() {
        
        $notify.add({message: 'Error message', type: 'error'});
        $notify.add({message: 'Error message2', type: 'error'});
        $notify.add({message: 'Error message3', type: 'error'});

        scope.$digest(); 

        expect(element.scope().$timeouts.list.length).toEqual(3);
        expect(element.scope().notifications.length).toEqual(3);
        
        element.scope().$timeouts.clear();
        
        // Test that our clear function will clear the list of timeouts and leave a list of zero
        expect(element.scope().$timeouts.list.length).toEqual(0);
        expect(element.scope().notifications.length).toEqual(3);
    });
    
    it('can flag a message as not visible and the message will not display', function() {
        
        $notify.add({message: 'Error message', type: 'error', visible: false});
        
        scope.$digest(); 

        expect(element.scope().$timeouts.list.length).toEqual(1);
        expect(element.scope().notifications[0].visible).toEqual(false);
    });
    
    it('can hide notifications after the timeout has elapsed', function() {
        
        $notify.add({message: 'Error message', type: 'error'});
        
        scope.$digest(); 
        
        $timeout.flush();
        
        expect(element.scope().notifications[0].visible).toEqual(false);
    });

});
