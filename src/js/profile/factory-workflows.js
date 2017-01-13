angular.module('ui.profile')

// Contact Factory
// ----------------------------------------

.factory('ProfileWorkflowsFactory', ['Profile', 'ProfileFormFactory', 'Permissions', '$http',
    function(Profile, ProfileFormFactory, Permissions, $http) {

    function Workflows() {
        
        var that = this;
        
        this.$dataPromise = Profile.getWorkflows().then(function(res) {
            return res;
        });
        
        this.$formDataPromise = this.$dataPromise.then(function(res) {
            return buildFormData(res.data.WorkflowSectionItemResults.length).then(function(formData) {
                that.formData = formData; // Return this to the obj so we can use it to calc an ng-repeat
                return formData;  // And return it as a promise to so the formbuilder can use it
            });
        });
    }
    
    Workflows.prototype.getWorkflowsForm = function(index, globalPermission) {

        var that = this,        
            OPTIONS = {
                serviceName: 'Profile',
                dataPromise: that.$dataPromise,
                getDataSuccessFn: function(that, res) {
                    
                    that.$userCan = Permissions.formatPermissions(res.data.EntityActions); // Pass entity actions back to the view.  This set of entity actions applies to all workflows but it will be placed within each workflow
                    angular.extend(that.$userCan, Permissions.formatPermissions(res.data.WorkflowSectionItemResults[index].EntityActions)); // This entity action only applied to the specific workflow and will be combined with the other entity action
                    // Copy the object so we can manipulate it without changing the data for the next time this fn is run
                    var newRes = angular.copy(res);
                    newRes.data = newRes.data.WorkflowSectionItemResults[index].WorkflowSection; // Discard all data other than the workflow we are currently dealing with
                    that.$globalPermission = {};
                    if (newRes.data.WorkflowTypeName === 'Onboarding' && globalPermission.viewonboardworkflow) {
                        that.$globalPermission.viewworkflow = true;
                    }
                    if (newRes.data.WorkflowTypeName === 'Job Ad Requisition' && globalPermission.viewjobadworkflow) {
                        that.$globalPermission.viewworkflow = true;
                    }
                    // Prepare the delate workflow to select box
                    that.selectData = {};
                    that.selectData.TargetMemberIdObj = {};
                    that.selectData.TargetMemberId = newRes.data.ListMembers.map(function(member) {
                        if (member.IsCurrentDelegation) {
                            newRes.data.TargetMemberId = member.MemberId;
                        }
                        that.selectData.TargetMemberIdObj[member.MemberId] = member.ContactName;
                        return {
                            Label: member.ContactName,
                            Value: member.MemberId
                        };
                    });

                    delete newRes.data.ListMembers; // Discard the list data now that we have stored it elsewhere

                    that.staticValues = {
                        name: newRes.data.WorkflowTypeName
                    };
                    
                    newRes.data.$formIndex = index; // Set an index so we know which workflow we are working with
                    return newRes;
                },
                saveDataFn: function(that, res) {
                    
                    // res = {
                    //   WorkflowDelegatedId: 1,
                    //   WorkflowType: 2,
                    //   SourceMemberId: 305099,
                    //   TargetMemberId: 181591,
                    //   StartDate: '2015-09-26T00:00:00',
                    //   EndDate: '2015-09-27T00:00:00'
                    // }
                                        
                    return res;
                },
                saveDataSuccessFn: function(that) {
                    that.$editing = false;
                },
                saveAction: 'setWorkflow',
                successMsg: 'Your workflow action has been updated successfully',
                errorMsg: 'Your workflow action could not be updated at this time.  Please try again later'
            };
        
        return new ProfileFormFactory(OPTIONS);
    };

    // Anonymous fn that loops through the permission data to build an object describing the set of form elements for the UI
    function buildFormData(workflowCount) {
        
        var form = []; // Create an empty array to populate with forms
        
        return $http.get('/interface/views/profile/form-data/workflows.json').then(function(res) { // Get the json template for a workflow form
            
            for (var i = 0; i < workflowCount; i++) { // Loop for the amount of times we have retrieved workflow data
                form.push(angular.copy(res.data[0])); // Then push a copy of the form for each set of data
                form[i].id = form[i].id + i; // And suffix the form index (which is in this case i) to the end of the id / name
                form[i].name = form[i].name + i;                
            }
            
            return form;
        });
    }

    return Workflows;

}]);
