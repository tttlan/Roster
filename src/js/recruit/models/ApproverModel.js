angular.module('ui.recruit')

.factory('ApproverModel', ['UserModel', (UserModel) => {
    return class ApproverModel extends UserModel {
        constructor(role, name, avatar, selected,  date) {
            super('Approver', role, name, avatar, selected, date);
        }
    };
}]);