angular.module('ui.profile')

// Access banking details, authenticate user before loading banking information
// ------------------------------------------------------------------------------

.factory('ProfileBankingFactory', ['ProfileFormFactory', '$q', '$routeParams', 'Permissions',
    function(ProfileFormFactory, $q, $routeParams, Permissions) {

    function Banking(globalPermission) {
        
        var banking = this;
        
        banking.$authenticated = false;
        banking.$userCan = {};
        banking.$ownProfile = $routeParams.memberId && $routeParams.memberId !== 'me' ? false : true;
        
        var bankingData = $q.defer(); // Create a deferred that will be resolved and passed to the 2nd form, bankingInformation      
        
        var accessBankingFormOptions = {
                serviceName: 'Profile',
                saveAction: 'getMemberBankDetail',
                successMsg: 'You have been sucessfully authenticated for banking access',
                errorMsg: 'Your username, password or banking password were incorrect, please try again',
                saveDataSuccessFn: function(that, res) {
                    
                    banking.$authenticated = true; // This property is used in our template to hide / show the banking forms
                    banking.$userCan = Permissions.formatPermissions(res.data.EntityActions); // Formate and pass permissions back view
                    
                    // Discard all other data (mainly entity actions) since we have stored them elsewhere so we can bring the 
                    // banking info down to the top level of the object for the form builder
                    res.data = res.data.MemberBankDetail; 
                           
                    // Return the data from the API as a promise because the form builder 
                    // only accepts model data as a promise
                    bankingData.resolve(res);       
                }
            };
        
        this.accessBankingInformation = new ProfileFormFactory(accessBankingFormOptions);
                
        var bankingFormOptions = {
            serviceName: 'Profile',
            saveAction: 'updateMemberBankDetail',
            successMsg: ($routeParams.memberId ? 'The' : 'Your') + ' banking details have been updated successfully',
            errorMsg: ($routeParams.memberId ? 'The' : 'Your') + ' banking details could not be updated at this time, please try again later',
            dataPromise: bankingData.promise,
            getDataSuccessFn: function(that, res) {
                that.$userCan = banking.$userCan; // We have stored permissions in the banking obj, pass them into the banking form so they are available there
                return res;
            },
            saveDataSuccessFn: function(that) {
                that.$editing = false;
            },
            customProperties: {
                $globalPermission: globalPermission ? globalPermission : {}
            }
        };
    
        this.bankingInformation = new ProfileFormFactory(bankingFormOptions); 
    }
    
    return Banking;
    
}]);
