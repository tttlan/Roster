angular.module('ui.recruit')

.factory('UserModel', [() => {
    //Ooh well, I cannot apply a proper extend to this class in angular1.x.
    //Booh, can't wait for angular2.x ^_^

    return class UserModel {
        constructor(title, role, name, avatar, selected,  date) {
            this.title    = title;
            this.role     = role;
            this.name     = name;
            this.avatar   = avatar || null;
            this.selected = selected || false;
            this.date     = date || null;
        }
    };
}]);


