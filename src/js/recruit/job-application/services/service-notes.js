angular.module('ui.recruit.jobs')
.factory('NotesService', ['$server', '$HTTPCache', 'API_BASE_URL', 'NotesModel', 'EntityActionType',
    function($server, $HTTPCache, API_BASE_URL, NotesModel, EntityActionType) {
        let NOTES_NAMESPACE = API_BASE_URL;
        let factory = {
            getCandidateComments(candidateId) {
                 return $server.get({
                    url: NOTES_NAMESPACE + `candidate/${candidateId}/comments`
                 }, true).then ((res)=> {
                    return NotesModel.fromApi(res.data);
                 });
            },

            postCandidateComments(newNote, url, memberId) {
                return $server.create({
                    url: url,
                    data: newNote.toApi(memberId)
                }, true);
            },

            updateCandidateComments(note, memberId) {
                return $server.update({
                    url: note.userCan(EntityActionType.CanEditComment).ActionUrl,
                    data: note.toApi(memberId)
                }, true);
            },

            deleteNotes(note) {
                return $server.remove({
                    url: note.userCan(EntityActionType.CanDeleteComment).ActionUrl
                }, true);
            }
       };
       return factory;
}]);