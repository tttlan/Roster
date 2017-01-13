angular.module('ui.recruit.models')

.factory('NotesItemModel', ['EntityActionsMixin', 'ReactionConstants', function(EntityActionsMixin, ReactionConstants) {
    return class NotesItemModel {
        constructor(firstName = null, surname = null, avatarMiniLink = null, commentDate = null, commentString = null, reaction = ReactionConstants.REACTION_NEUTRAL,  entityAction = [],  multipleCandidateIds = [] ) {
            this.firstName  = firstName;
            this.surname = surname;
            this.avatarMiniLink = avatarMiniLink;
            this.commentDate = commentDate;
            this.commentString = commentString;
            this.reaction = reaction;
            this.multipleCandidateIds = multipleCandidateIds;
            //Add the entityactions behaviour
            EntityActionsMixin.$$mixInto(this);
            //Prepare entity actions
            this.setupEntityActionsFromApi(entityAction);
        }

        /*
         * Create the object from the return payload
         */
        static fromApi(comment) {
            return new NotesItemModel(
                comment.CandidatePoolCommentSummary.Author.FirstName,
                comment.CandidatePoolCommentSummary.Author.Surname,
                comment.CandidatePoolCommentSummary.Author.PhotoThumbMini,
                comment.CandidatePoolCommentSummary.CommentDate,
                comment.CandidatePoolCommentSummary.Comment,
                comment.CandidatePoolCommentSummary.Reaction,
                comment.EntityActions
            );
        }

        /*
         * Prepare the JSON payload to send to the API
         */
        toApi(memberId) {
            return{
                "CandidateIds": _.isArray(memberId) ? memberId : [memberId],
                "Reaction" : this.reaction,
                "Comment": this.commentString
            };
        }
    };
}])

.factory('NotesModel', ['NotesItemModel', 'EntityActionsMixin', function(NotesItemModel, EntityActionsMixin) {
    return class NotesModel {
        constructor(notes = null, entityActions = []) {
            this.notes = notes;
            //Add the entityactions behaviour
            EntityActionsMixin.$$mixInto(this);
            //Prepare entity actions
            this.setupEntityActionsFromApi(entityActions);
        }

        /*
         * Create the object from the return payload
         */
        static fromApi(comments) {
            let response = new NotesModel(
                comments.CandidatePoolCommentSummaryItemResults.map(note => { return NotesItemModel.fromApi(note);}),
                comments.EntityActions
            );
            return response;
        }
    };
}]);