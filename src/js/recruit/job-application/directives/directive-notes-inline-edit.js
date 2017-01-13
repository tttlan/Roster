angular.module('ui.recruit.jobs')
.directive('notesInlineEdit', ['EntityActionType', 'NotesService', 'Url', 'ReactionConstants',
    function(EntityActionType, NotesService, Url, ReactionConstants) {
        return {
            restrict: 'E',
            templateUrl: '/interface/views/recruit/job-application/partials/applicant-notes-form.html',
            scope: {
                notesModel: '=',
                noteToShow: "=",
                memberId: '=',
                editing: '='

            },
            link: function (scope) {
                scope.EntityActionType = EntityActionType;
                scope.ReactionConstants = ReactionConstants;
                scope.notesLoading = true;
                var unwatch = scope.$watch('memberId', (newVal, oldVal) => {
                    if(newVal) {
                        scope.getNotes();
                        //Remove the watcher
                        unwatch();
                    }
                });

                //broadcast from parent directive to show note
                scope.$on('_SHOW_NOTE', () => {
                    var unwatch = scope.$watch('noteToShow', (newVal, oldVal) => {
                        if(newVal) {
                            scope.notesModel.notes.unshift(scope.noteToShow);
                            //Remove the watcher
                            unwatch();
                        }
                    });
                });

                //broadcast from parent directive to get notes
                scope.$on('_GET_NOTES', () => {
                   scope.getNotes();
                });

                scope.getNotes = () => {
                    NotesService.getCandidateComments(scope.memberId).then((res) => {
                        res.notes = _.sortBy(res.notes, (n) => moment(n.commentDate).unix()).reverse();
                        _.every(res.notes, angular.extend(res.notes, {loading: false}));
                        scope.notesModel = res;
                        scope.notesModelCopy = angular.copy(scope.notesModel);
                    }).finally(() => {
                        scope.notesLoading = false;
                    });
                };

                scope.updateNote = (valid, note) => {
                    if(valid) {
                        note.loading = true;
                        //Strip all tags from comment
                        note.commentString = Url.stripHtml(note.commentString);
                        NotesService.updateCandidateComments(note, scope.memberId).then(() => {
                            scope.getNotes();
                        }).finally(() => {
                            note.loading = false;
                            scope.$emit('_SIBLINGCHANGE_'); // Emits to the applicant details directive that a note has been updated
                        });
                    }
                };

                scope.deleteNote = (note, index) => {
                    // remove the comment from the model to avoid reload.
                    var removed = scope.notesModel.notes.splice(index, 1)[0];
                    scope.notesModelCopy.notes.splice(index, 1)[0];
                    NotesService.deleteNotes(note).catch(() => {
                        removed.deleteFailed = true;
                        scope.notesModel.notes.unshift(removed);
                        scope.notesModelCopy.notes.unshift(removed);
                }).finally(() => {
                        scope.$emit('_SIBLINGCHANGE_'); // Emits to the applicant details directive that a note has been deleted
                    });
                };

                //Inline edit - only one editor should be open at a time.
                scope.currentlyEditing = null;

                scope.isEditing = (comment) => {
                    return scope.currentlyEditing == comment;
                };
                scope.enableEditing = (comment) => {
                    scope.currentlyEditing = comment;
                };

                scope.disableEditing = (comment, index) => {
                    if(comment){
                        scope.currentlyEditing = null;
                        scope.notesModel.notes[index].commentString =  scope.notesModelCopy.notes[index].commentString;
                        scope.notesModel.notes[index].reaction =  scope.notesModelCopy.notes[index].reaction;
                    }
                };
            }
        };
}]);