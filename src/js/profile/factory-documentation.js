angular.module('ui.profile')

// ProfileForm Factory (( BaseClass FormFactoy ))
// extend the FormFactory to give $edit and $cancelEdit functions
// ----------------------------------------

.factory('ProfileDocumentationFactory', ['$routeParams', 'Profile', 'Permissions',
    function($routeParams, Profile, Permissions) {
    
    function ProfileDocumentation() {
        
        // Onboarding docs
        this.onboarding = {};
        this.onboarding.$loaded = false;
        
        // Paper docs
        this.paper = {};
        this.paper.$loaded = false;

        // Notes
        this.note = {};
        this.note.$loaded = false; 
    }

    ProfileDocumentation.prototype.loadOnboardingDocuments = function() {
        
        var that = this;

        Profile.getOnboardingDocuments().then(function(res) {
            
            that.onboarding.$loaded = true;
            that.onboarding.documents = res.data.OnboardDocumentItemResults;
            that.onboarding.$userCan = Permissions.formatPermissions(res.data.EntityActions);
        });
    };
    
    ProfileDocumentation.prototype.loadPaperDocuments = function() {
        
        var that = this;
        
        Profile.getEmployeeDocuments().then(function(res) {
            
            that.paper.$loaded = true;
            that.paper.documents = res.data.MemberPaperDocItemResults;
            that.paper.$userCan = Permissions.formatPermissions(res.data.EntityActions);
        });
    };
    ProfileDocumentation.prototype.loadNoteDocuments = function(p) {
        // we don't use document incase using this with paging pagination
        var that = this;
        return Profile.getNoteDocuments(p).then(function(res) {
            res.userCan = Permissions.formatPermissions(res.data.EntityActions);
            res.data = res.data.ContentSummaryItemResults.map(function(note) {
                note.ContentSummary.userCan = Permissions.formatPermissions(note.EntityActions);
                return note.ContentSummary;
            });
            return res;
        });
    };

    ProfileDocumentation.prototype.getNoteById = function(id) {

        return Profile.getNoteById(id).then(function(res) {
            res.userCan = Permissions.formatPermissions(res.data.EntityActions);
            res.data = res.data.ProfileContentDetail;
            return res;
        });
    };
    
    return ProfileDocumentation;
    
}]);
