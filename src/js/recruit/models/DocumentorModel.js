angular.module('ui.recruit')

.factory('DocumentorModel', ['UserModel', (UserModel) => {
    return class DocumentorModel extends UserModel {
        constructor(role, name, avatar, selected,  date) {
            super('Documentor', role, name, avatar, selected, date);
        }
    };
}]);