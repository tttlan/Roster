(() => {

const applicantNotesMultiple = (NotesItemModel, ReactionConstants, Members) => {
  
  const link = (scope, elem, attrs, ngModel) => {
    if (scope.model instanceof NotesItemModel === false)
      throw new Error(`model needs to be instance of NotesItemModel`);
    scope.ReactionConstants = ReactionConstants;
    //Load current Member
    Members.me().then(function(response) {
      scope.currentUser = response.data;
    });
  };

  return {
    restrict: 'E',
    //require: 'ngModel', //Todo: maybe use ngModel instead for validation purposes.
    scope: {
      model: '=',
    },
    template: `
      <div class="applicant-comment">
        <avatar size="tiny" img-src="currentUser.MemberProfile.PhotoThumbMini"></avatar>
        <div class="applicant-comment__form-field">
          <textarea autogrow ng-model="model.commentString"></textarea>
          <span class="applicant-comment__form-field__reactions">
            <i class="{{model.reaction | reactionIcon}}"></i>
            <a class="applicant-comment__reactions-dropdown" href="#" dropdown-toggle>
              <span class="applicant-comment__reactions-dropdown--button">
                <i class="icon--down icon-is-disabled icon-is-small"></i>
              </span>
            </a>
            <ul class="submenu submenu--compact dropdown-menu table__ellipsis-submenu--position ellipsis-submenu--font-weight">
              <li class="submenu__item align-left">
                <a href="#" ng-repeat="(key, value) in ReactionConstants">
                  <i ng-click="model.reaction = value" class="{{value | reactionIcon}}"></i>
                </a>
              </li>
            </ul>
          </span>
        </div>
      </div>
    `,
    link
  };
};

angular.module('ui.recruit.jobs')
.directive('applicantNotesMultiple', ['NotesItemModel', 'ReactionConstants', 'Members', applicantNotesMultiple]);
})();