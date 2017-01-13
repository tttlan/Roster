angular.module('ui.profile')

// Contact Factory
// ----------------------------------------

.factory('ProfileEmergencyContactFactory', ['ProfileFormFactory', 'Permissions',
    function(ProfileFormFactory, Permissions) {

    var OPTIONS = {
        serviceName: 'Profile',
        getAction: 'getEmergencyContact',
        getDataSuccessFn: function(that, res) {
            that.$userCan = Permissions.formatPermissions(res.data.EntityActions); // Format the entity actions nicely
            res.data.MemberEmergencyContactDetail.CountryId = res.data.MemberEmergencyContactDetail.Country;
            res.data = res.data.MemberEmergencyContactDetail; // Discard the entity actions

            //check if valid element 
            that.$valid = res.data.FirstName && res.data.SurName && res.data.Relationship &&
                        res.data.LinePhone1 && res.data.Email && res.data.Address &&
                        res.data.Suburb && res.data.City && (res.data.StateName || res.data.StateRegionId) &&
                        res.data.Postcode && res.data.CountryId;

            return res;
        },
        saveDataFn: function(that, data) {
            data.LinePhone2 = data.LinePhone2Restored;
            return data;
        },
        saveDataSuccessFn: function(that) {
            that.$editing = false;
        },
        customProperties: {
            $globalPermission: {}
        },
        saveAction: 'updateEmergencyContact',
        successMsg: 'Your emergency contact have been updated successfully',
        errorMsg: 'Your emergency contact could not be updated at this time.  Please try again later'
    };

    return function(customOpts) {

        var opts = customOpts ? angular.extend({}, OPTIONS, customOpts) : OPTIONS;

        return new ProfileFormFactory(opts);
    };

}]);
