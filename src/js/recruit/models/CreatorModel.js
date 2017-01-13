angular.module('ui.recruit')

.factory('CreatorModel', ['UserModel', (UserModel) => {
    return class CreatorModel extends UserModel {
        constructor(role, name, avatar, selected,  date) {
            super('Initiator', role, name, avatar, selected, date);
        }
    };
}]);
