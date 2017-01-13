angular.module('ui.common')
    /**
    * Format for 'listOfMembers'
    * It is the duty of the developer to provide the 'members' in this format
    *      members : [{
    *          title    : 'Approver',
    *          role     : 'Product Manager',
    *          name     : 'Jane doe',
    *          date     : '2015-01-01',
    *          avatar   : 'link/to/picture',
    *          selected : true //Boolean to determine which member to show
    *      }]
    */
    .directive('cardMembersListing', () => {
    return {
        restrict    : 'E',
        scope       : {
            members : '&',
        },
        link        : (scope, element, attrs) => {
            //Safe Guard
            if(!Array.isArray(scope.members())) {
                 throw new Error('An array should be supplied for the directive card-members-listing');
            }

            //Variables
            scope.isCollapsed = true;

            //Toggle the value for variable isCollapsed
            scope.toggleCollapse = function(val) {
                scope.isCollapsed = val;
            };
        },
        template    :
            `<div class='parent__wrapper'>
                <div class='card__members__listing_wrapper' ng-repeat='member in members() | orderBy: "-selected"' ng-show="$first || !isCollapsed">
                    <div class='card__members__listing__info'>
                        <div class='card__members__listing__type'>
                            <small>{{member.title}}</small>
                        </div>
                        <div class='card__members__listing__date'>
                            <small>{{member.date}}</small>
                        </div>
                    </div>
                    <div class='card__members__listing__user__details'>
                        <div class='card__members__listing__avatar'>
                            <avatar img-src="member.avatar" size="small"></avatar>
                        </div>
                        <div class='card__members__listing__details'>
                            <span>{{member.name}}</span>
                            <h5>{{member.role}}</h5>
                        </div>
                        <div class='card__members__listing__card__action'>
                            <i class="icon--arrow-down" ng-show="$first && isCollapsed && $first !== $last" ng-click="toggleCollapse(false)"></i>
                            <i class="icon--arrow-up" ng-show="$last && $first !== $last" ng-click="toggleCollapse(true)"></i>
                        </div>
                    </div>
                </div>
             </div>`,
    };
});