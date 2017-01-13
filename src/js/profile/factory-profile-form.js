angular.module('ui.profile')

// ProfileForm Factory (( BaseClass FormFactoy ))
// extend the FormFactory to give $edit and $cancelEdit functions
// ----------------------------------------

.factory('ProfileFormFactory', ['FormFactory', '$routeParams', function(FormFactory, $routeParams) {

    function ProfileForm(dataOptions) {
        // Call original BaseClass formFactory
        FormFactory.call(this, dataOptions);

        this.$editing = false;
    }

    //Extend the prototype from ProfileForm
    ProfileForm.prototype = Object.create(FormFactory.prototype);
    
    //Set constructor
    ProfileForm.prototype.constructor = ProfileForm;

    ProfileForm.prototype.$edit = function(section) {
        if(section !== this.$editing) {
            // save the current data, if it's cancelled we will save it back again
            this.$editing = section;
        }
    };
    
    ProfileForm.prototype.$cancelEdit = function() {
        this.$editing = false;
    };

    return ProfileForm;

}]);
