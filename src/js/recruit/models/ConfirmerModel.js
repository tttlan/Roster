angular.module('ui.recruit')

.factory('ConfirmerModel', ['UserModel', (UserModel) => {
    return class ConfirmerModel extends UserModel {
        constructor(role, name, avatar, selected,  date) {
            super('Confirmer', role, name, avatar, selected, date);
        }
    };
}]);