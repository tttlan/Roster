angular.module('ui.profile')

// System info factory Factory
// ----------------------------------------

.factory('ProfileSystemInfoFactory', ['ProfileFormFactory', 'Profile', 'Permissions', 'Groups', 'Paths',
    function(ProfileFormFactory, Profile, Permissions, Groups, Paths) {

    function formatGroupDataFromServer(array) {
        return array.map(function(group) {
            return {
                label: group.GroupName,
                value: group.NetworkGroupId
            };
        });
    }
    
    function formatGroupDataToServer(array) {
        return array.map(function(group) {
            return group.value;
        });
    }
    
    function formatRecruitmentOptions(array) {
        return array.map(function(option) {
            return {
                Label: option.Description,
                Value: option.AccountRecruitmentId                
            };
        });
    }

    var OPTIONS = {
        serviceName: 'Profile',
        getAction: 'getSystemInfo',
        getDataSuccessFn: function(that, res) {
            
            that.selectData = {
                OtherNetworkGroups: [],
                StoreNetworkGroups: [],
                AccountRecruitmentObj: {}
            };
            
            that.$userCan = Permissions.formatPermissions(res.data.EntityActions); // Pass entity actions back to the view
            res.data = res.data.MemberSystemInfo; // Discard all other data sent back other that system info (this remove entity actions from the data)
     
            that.$staticValues = {
                primaryGroup: res.data.DefaultNetworkGroupName,
                loginName: res.data.LoginName
            };
            
            // Format the select options into an array of Label / Value objects
            that.selectData.AccountRecruitment = formatRecruitmentOptions(res.data.AccountRecruitments);
            
            // Create an object to look up the label for the currently selected recuitment account.  
            // This is used to display a label in our template
            for (var i = that.selectData.AccountRecruitment.length; i--;) {
                var type = that.selectData.AccountRecruitment[i];
                that.selectData.AccountRecruitmentObj[type.Value] = type.Label;
            }

            // Remove all other data and set AccountRecruitment to be the Id only
            res.data.AccountRecruitment = res.data.AccountRecruitment ? res.data.AccountRecruitment.AccountRecruitmentId : null; 
            
            that.groups = {
                groupLimit: 3,
                showAllGroups: function() {
                    that.groups.groupLimit = res.data.OtherNetworkGroups.length;
                },
                storeLimit: 3,
                showAllStores: function() {
                    that.groups.storeLimit = res.data.StoreNetworkGroups.length;
                }
            };
            
            res.data.OtherNetworkGroups = formatGroupDataFromServer(res.data.OtherNetworkGroups);
            res.data.StoreNetworkGroups = formatGroupDataFromServer(res.data.StoreNetworkGroups);
                        
            // Get an array of all groups that are in the other category or the store category and place them into the tag manager.
            // Placing the data with the selectData object with an object property that matches the name of the element ensures
            // that the data is passed through
            that.$storeGroupPromise = Groups.getStoreGroups().then(function(res) {
                that.selectData.StoreNetworkGroups = res;
            });
            that.$otherGroupsPromise = Groups.getOtherGroups().then(function(res) {
                that.selectData.OtherNetworkGroups = res;
            });
            
            return res;
        },
        saveDataFn: function(that, data) {
            
            var networkId;

            // Loop through all recruitment accounts to get the network id for the selected recruitment account
            angular.forEach(data.AccountRecruitments, function(value) {
                if (value.AccountRecruitmentId === data.AccountRecruitment) {
                    networkId = value.NetworkGroupId;
                }
            });
            
            // Create a new object to send back to the server with the data about the recruitment account
            data.AccountRecruitmentEntry = {
                AccountRecruitmentId: data.AccountRecruitment,
                NetworkGroupId: networkId
            };
            
            // Reformat the group arrays to be an array of group ids eg. [11038, 11065] 
            data.OtherNetworkGroups = formatGroupDataToServer(data.OtherNetworkGroups);
            data.StoreNetworkGroups = formatGroupDataToServer(data.StoreNetworkGroups);

            delete data.AccountRecruitments;

            return data;
        },
        saveDataSuccessFn: function(that, res) {            
            that.$editing = false;
            
            if (that.$staticValues.loginName !== res.data.MemberSystemInfo.LoginName) {
                that.$staticValues.loginName = res.data.MemberSystemInfo.LoginName;
            }
        },
        saveAction: 'updateSystemInfo',
        successMsg: 'Your system information settings have been updated successfully',
        errorMsg: 'Your system information settings could not be updated at this time.  Please try again later'
    };

    return function(customOpts) {

        var opts = customOpts ? angular.extend({}, OPTIONS, customOpts) : OPTIONS;

        return new ProfileFormFactory(opts);
    };

}]);
