angular.module('ui.recruit.jobs').filter('reactionIcon', ['ReactionConstants', (ReactionConstants) => {
  return (reaction) => {
    switch (reaction) {
      case ReactionConstants.REACTION_LIKE:
        return 'icon--smiling is--positive';
      case ReactionConstants.REACTION_DISLIKE:
        return 'icon--sad is--negative';
      case ReactionConstants.REACTION_NEUTRAL:
        return 'icon--neutral is--caution';
      default:
        return '';
    }
  };
}]);