angular.module('ui.formbuilder')

// ProfileForm Factory
// ----------------------------------------

.factory('FormFactory', ['$injector', '$timeout', '$notify', '$q',
    function($injector, $timeout, $notify, $q) {

    function Form(dataOptions) {
        
        /*
            This is a factory that handles all the editing, saving
            and getting of data to and from the form builder.

            @param dataOptions
            {
                getAction: string,
                getDataSuccessFn: function(this, res),
                getDataErrorFn: function(this, res),
                saveAction: string,
                saveDataFn: function(this, res),
                saveDataSuccessFn: function(this, res),
                successMsg: string,
                saveDataErrorFn: function(this, res),
                errorMsg: string,
                serviceName: string,
                offNotifySuccess: false,
                offNotifyError: false,
                offNotify: false,
                customProperties: object
            }
        */
                
        var that = this;

        this.dict = dataOptions;
        this.$loaded = false;
        this.$error = false;
        this.$submitting = false;
        this.selectData = {};
        this.customLabels = {};
        this.requiredFields = {};
        this.staticValues = {};
        this.dict.service = $injector.get(this.dict.serviceName);
        
        // If any custom properties were passed in, move them up a level in the object
        angular.forEach(this.dict.customProperties, function(value, key) {
            that[key] = value;
        });
        
        if (this.dict.getAction || this.dict.dataPromise) { // If there is a get action attached or if we already have data
            
            this.$promise = function() {

                var success = function(res) {
    
                    that.$loaded = true;
    
                    if(that.dict && typeof that.dict.getDataSuccessFn === 'function') {
                        res = that.dict.getDataSuccessFn(that, res);
                    }
    
                    return res;    
                };
                
                var error = function(res) {
                    
                    that.$loaded = true;
                    that.$error = true;
                    
                    if(that.dict && typeof that.dict.getDataErrorFn === 'function') {
                        res = that.dict.getDataErrorFn(that, res);
                    }
                    
                    return $q.reject(res);
                };

                if (that.dict.getAction) { 
                    // If we have passed in a service for the formbuilder to call to get the data
                    return that.dict.service[that.dict.getAction](that.dict.getParams).then(success, error);
                }
                
                if (that.dict.dataPromise) { 
                    // If we have passed in a promise that will resolve the data.  This is useful if 
                    // you don't need to make another call but still want the same factory form methods and 
                    // vars to apply
                    return that.dict.dataPromise.then(success, error);
                }
            };
        }
    }

    Form.prototype.$save = function(data) {
        
        var that = this;

        this.$submitting = true;
        
        // The formbuilder creates an extra field for the data/time selector which has an extra '2' appended to it
        // We don't want this data send to the server so it needs to be removed here
        angular.forEach(data, function(value, key) { //should be removed this, this will cause error in some field end with 2 at field, example : PhoneLine2 of profile
            if (key.slice(-1) === '2') {
                delete data[key];
            }
        });

        if (that.dict && typeof that.dict.saveDataFn === 'function') {
            data = that.dict.saveDataFn(that, data);
        }
                
        return this.dict.service[that.dict.saveAction](data).then(function(res) {
            
            $timeout(function() {

                that.$submitting = false;

                if(typeof that.dict.saveDataSuccessFn === 'function') {
                    that.dict.saveDataSuccessFn(that, res);
                }
                if(!that.dict.offNotifySuccess && !that.dict.offNotify) {
                    $notify.add({
                        message: that.dict.successMsg,
                        type: 'success'
                    });
                }
            });

            return res;

        }, function(res) {
            
            $timeout(function() {

                that.$submitting = false;

                if(typeof that.dict.saveDataErrorFn === 'function') {
                    that.dict.saveDataErrorFn(that, res);
                }
                if(!that.dict.offNotifyError && !that.dict.offNotify) {
                    $notify.add({
                        message: that.dict.errorMsg,
                        type: 'error'
                    });
                }
            });
            
            return $q.reject(res);
        });
    };

    return Form;

}]);
