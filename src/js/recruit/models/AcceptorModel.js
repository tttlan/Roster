angular.module('ui.recruit')

.factory('AcceptorModel', ['UserModel', (UserModel) => {
    return class AcceptorModel extends UserModel {
        constructor(role, name, avatar, selected,  date) {
            super('Acceptor', role, name, avatar, selected, date);
        }
    };
}]);