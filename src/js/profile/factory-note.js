angular.module('ui.profile')

// ProfileForm Factory (( BaseClass FormFactoy ))
// extend the FormFactory to give $edit and $cancelEdit functions
// ----------------------------------------

.factory('ProfileNoteFactory', ['$routeParams', 'Profile', 'Permissions',
    function($routeParams, Profile, Permissions) {
    
    function ProfileNote() {
        // Notes will be shake with paginate model
        this.note = {}; 
    }

    ProfileNote.prototype.loadNotes = function(p) {
        // we don't use document incase using this with paging pagination
        var that = this;
        return Profile.getNotes(p).then(function(res) {
            res.userCan = Permissions.formatPermissions(res.data.EntityActions);
            res.data = res.data.ContentSummaryItemResults.map(function(note) {
                note.ContentSummary.userCan = Permissions.formatPermissions(note.EntityActions);
                return note.ContentSummary;
            });
            return res;
        });
    };

    ProfileNote.prototype.getNoteById = function(id) {

        return Profile.getNoteById(id).then(function(res) {
            var userCan = Permissions.formatPermissions(res.data.EntityActions);
            res.data = res.data.ProfileContentDetail;
            res.data.userCan = userCan;
            return res;
        });
    };

    ProfileNote.prototype.deleteNoteById = function(id) {
        return Profile.deleteNoteById(id);
    };
    
    return ProfileNote;
    
}]);
