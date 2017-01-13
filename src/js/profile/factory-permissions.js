angular.module('ui.profile')

.factory('ProfilePermissionsFactory', ['Profile', 'ProfileFormFactory', 'Permissions', function(Profile, ProfileFormFactory, Permissions) {
    
    function ProfilePermissions() {
        
        var that = this;
        
        this.$dataPromise = Profile.getPermissions().then(function(res) {
            return res;
        });
        
        this.$formDataPromise = this.$dataPromise.then(function(res) {
            return buildFormData(res.data.PermissionCapabilityAccessDetailItemResults);
        });
    }
    
    ProfilePermissions.prototype.getPermissionsForm = function() {
        var modelData = {};
        var savedData = {};
        var that = this,        
            OPTIONS = {
                serviceName: 'Profile',
                dataPromise: that.$dataPromise,
                getDataSuccessFn: function(that, res) {
                    
                    var permissions = res.data.PermissionCapabilityAccessDetailItemResults;
                    
                    // Sort through the res and format the data in a few different ways to use in the template
                    var permissionData = processPermissionData(permissions);

                    that.$permissionNames = permissionData.nameIndex;
                    that.$userCan = permissionData.entityActions;
                    that.$capabilityIds = permissionData.capabilityIds;
                    that.$currentDescriptions = permissionData.currentDescriptions;
                    
                    res.data = permissionData.modelData; // a reference is used by underground
                    
                    modelData = permissionData.modelData;
                    
                    return res;
                },
                saveDataFn: function(that, data) {
                    savedData = {
                        Recruitment_Override: data.element.children[0].val,   
                        Recruitment_PermissionLevel: data.element.children[1].val,
                        Recruitment_PermisisonName: data.element.name   
                    };
                    
                    return {
                        Override: data.element.children[0].val, 
                        PermissionLevel: data.element.children[1].val, 
                        CapabilityId: data.capabilityIds[data.element.name]
                    };
                },
                saveDataSuccessFn: function(that) {
                    // should be update model data , this not call to formbuilder framework
                    modelData.Recruitment_Override = savedData.Recruitment_Override;
                    modelData.Recruitment_PermissionLevel = savedData.Recruitment_PermissionLevel;
                    that.$currentDescriptions[savedData.Recruitment_PermisisonName] = that.$permissionNames[savedData.Recruitment_PermisisonName][modelData.Recruitment_PermissionLevel];
                    that.$editing = false;
                },
                saveAction: 'setPermission',
                successMsg: 'Your permissions have been updated successfully',
                errorMsg: 'Your permissions could not be updated at this time.  Please try again later'
            };
        
        return new ProfileFormFactory(OPTIONS);
    };
        
    function processPermissionData(permissions) {
        
        var nameIndex = {},
            entityActions = {},
            capabilityIds = {},
            currentDescriptions = {},
            modelData = {};
        
        angular.forEach(permissions, function(permission) {
            
            var entityAction = permission.EntityActions;
            permission = permission.PermissionCapabilityAccessDetail;
            var name = permission.Name.replace(' ','');
            
            // Populate the name index object
            currentDescriptions[name] = permission.PermissionsDesc;
            nameIndex[name] = [];            
            angular.forEach(permission.CustomDesc.split(','), function(label) { // Loop through each of the permission labels and add them to the array of labels
                nameIndex[name].push(label.trim());
            });
            

            // Populate the entity actions object
            entityActions[name] = Permissions.formatPermissions(entityAction);
                
            // Populate the capability ids object
            capabilityIds[name] = permission.CapabilityId;
            
            // Populate the model data object
            modelData[name + '_Override'] = permission.Override;
            modelData[name + '_PermissionLevel'] = permission.PermissionLevel;
        });
        
        return {
            nameIndex: nameIndex,
            entityActions: entityActions,
            capabilityIds: capabilityIds,
            currentDescriptions: currentDescriptions,
            modelData: modelData
        };
    }
        
    // Anonymous fn that loops through the permission data to build an object describing the set of form elements for the UI
    function buildFormData(permissions) {

        // Generate form data from the permission data that is returned from the server    
        var form = [
            {
                id: 'permissionsForm',
                name: 'permissionsForm',
                action: '/get/',
                method: 'post',
                elements: []
            }
        ];
        
        var elements = form[0].elements;

        angular.forEach(permissions, function(permission) {
            
            permission = permission.PermissionCapabilityAccessDetail;
            var eleName = permission.Name.replace(' ','');
                
            elements.push({
                label: permission.Name,
                name: eleName,
                children: [
                    {
                        name: eleName + '_Override', // This is a machine readable name.  The form builder requires it to have no spaces
                        label: 'Override role default',
                        placeholder: '',
                        value: '',
                        type: 'checkbox',
                        class: ''
                    },
                    {
                        name: eleName + '_PermissionLevel',
                        label: permission.Name + ' permission level',
                        options: [],
                        type: 'radio',
                        class: 'form__label--invisible',
                        value: '',
                        validation: {
                            required: true
                        }
                    }
                ]
            });
                        
            // Add the options from the form builder data to the radio element we have just created
            angular.forEach(permission.CustomDesc.split(','), function(permission, index) {
                elements[elements.length - 1].children[1].options.push({
                    Label: permission.trim(),
                    Value: index
                });
            });
        });

        return form;
    }
    
    return ProfilePermissions;
    
}]);
