angular.module('ui.common')

    .factory('EntityActionsMixin', [ 'EntityActionType', '$log', function(EntityActionType, $log) {
        function checkPermission(that, args) {
            if (_.isArray(args)) {
                var hasPermission = true;
                for (let i = 0; i < args.lengh; i++) {
                    if (!that.userCan(args[i])) {
                        hasPermission = false;
                        break;
                    }
                }

                return hasPermission;
            }
            else {
                $log.error("Invalid input to the #customUserCan: " + name +  " " + args);
            }
        }

        var behaviour = {
            //Map Api EntityActions to internal form
            setupEntityActionsFromApi: function(actions) {
                if (!(_.isUndefined(actions) || _.isArray(actions))) {
                    throw new Error('EntityActions must be an array');
                }

                this.$$actions = this.$$actions || {};

                var that = this;
                //Store as associative array for fast lookup and mergeability
                angular.forEach(actions, function(action) {
                    that.$$actions[action.Code] = angular.copy(action);
                });
            },
            //Return the object (truthy) if it exists... or else undefinded (falsy)
            userCan: function(action) {
                if (_.isString(action)) {
                    $log.warn("Deprecated: please use the action 'Code' (integer) to lookup entity actions. Moreover use a property of the EntityActionType 'enum'.");
                    var actionCode = EntityActionType[action];
                    if (_.isNatural(actionCode)) {
                        return this.userCan(actionCode);
                    } else {
                        $log.error("Unknown entity action: " + action);
                    }
                }
                else if (_.isNatural(action)) {
                    if (_.isArray(this.$$actions[action])) {
                        return checkPermission(this, this.$$actions[action]);
                    }
                    return this.$$actions[action];
                }
                else {
                    $log.error("Invalid input to the #userCan: " + action);
                }
            },
            customUserCan: function(actionCode, args) {
                if (!_.isNatural(actionCode) || !_.isArray(args) /*|| this.$$actions[actionCode]*/) {
                    $log.error("Invalid input to the #customUserCan: " + actionCode);
                    return;
                }
                if (!this.$$actions[actionCode]) {
                    this.$$actions[actionCode] = args;
                }
                
            },
            copyPermission: function(obj) {
                obj.$$actions = this.$$actions;
                obj.userCan = this.userCan;
                obj.actionIdentity = this.actionIdentity;
            },
            actionIdentity: function(actionCode) {
                if (!_.isNatural(actionCode) || !this.$$actions[actionCode]) {
                    $log.error("Invalid input to the #actionIdentity: " + actionCode);
                    return null;
                }
                var url = this.$$actions[actionCode].ActionUrl;
                if (angular.isString(url)) {
                    url = url.split('/').pop();
                    return url;
                }
                return null;
            }
        };

        return {
            $$mixInto: function(obj) {
                return angular.extend(obj, behaviour);
            }
        };
    }]);