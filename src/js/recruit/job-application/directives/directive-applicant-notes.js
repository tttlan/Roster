angular.module('ui.recruit.jobs')
.directive('applicantNotes', ['Members', 'Url', 'NotesService', 'NotesModel', 'NotesItemModel', 'ReactionConstants', 'EntityActionType', '$routeParams',
    function(Members, Url, NotesService, NotesModel, NotesItemModel, ReactionConstants, EntityActionType, $routeParams) {
        return {
            restrict: 'E',
            templateUrl: '/interface/views/recruit/job-application/partials/applicant-notes.html',
            scope: {
                memberId: '='
            },
            link: function (scope) {
                scope.editing = false;

                //Load current Member
                Members.me().then((response) => {
                    scope.currentUser = response.data;
                });

                scope.ReactionConstants = ReactionConstants;
                scope.newNote = new NotesItemModel();
                scope.newNote.reaction = ReactionConstants.REACTION_NEUTRAL;
                scope.EntityActionType = EntityActionType;
                scope.notesModel = new NotesModel();

                scope.noteToShow = {};
                scope.addNote = (valid, newNote) => {
                    if(valid) {
                        //Strip all tags from comment
                        newNote.commentString = Url.stripHtml(newNote.commentString);
                        scope.noteToShow = angular.copy(newNote);
                        //Prepare noteToShow
                        scope.noteToShow.commentDate = new Date().toUTCString();
                        scope.noteToShow.firstName = scope.currentUser.FirstName;
                        scope.noteToShow.surname = scope.currentUser.Surname;
                        scope.noteToShow.avatarMiniLink = scope.currentUser.MemberProfile.PhotoThumbMini;
                        scope.noteToShow.loading = true;
                        scope.noteToShow.failed = false;
                        //show this note until the real POST and GET is done for better user experience.
                        scope.$broadcast('_SHOW_NOTE');
                        //Sync the notes after GET notes.
                        scope.syncNote(scope.newNote);
                    }
                };

                scope.syncNote = (newNote) => {
                    var url = scope.notesModel.userCan(EntityActionType.CanAddComment).ActionUrl;
                    NotesService.postCandidateComments(newNote, url, scope.memberId).then((res) => {
                       scope.$broadcast('_GET_NOTES');
                    }).catch((res) => {
                        scope.noteToShow.loading = false;
                        scope.noteToShow.failed = true;
                    }).finally(() => {
                        scope.$emit('_SIBLINGCHANGE_'); // Emits to the applicant details controller that a note has been added
                        newNote.commentString = "";
                        newNote.reaction = ReactionConstants.REACTION_NEUTRAL;
                    });
                };
                scope.discardNote = () => {
                    scope.editing = false;
                    scope.newNote.commentString = "";
                    scope.newNote.reaction = ReactionConstants.REACTION_NEUTRAL;
                };
            }
        };
}]);