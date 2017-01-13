
angular.module('ui.services')


// Permissions factory
// ----------------------------------------

.factory('Permissions', ['$server', 'API_BASE_URL', '$q', function($server, API_BASE_URL, $q) {

    var permissions = [];
    function hasPermission(query, isUrl) {
        
        var val = isUrl ? 'url' : 'id';
        var givePermission = false;

        angular.forEach(permissions, function(permission) {
            if(permission[val] === query) {
                givePermission = true;
                return;
            }
        });

        return givePermission;
    }

    //remove a ~ prefix
    function removePrefix(str) {
        if(str.charAt(0) === '~') {
            str = str.substring(1);
        }
        return str;
    }
    function buildActive(items) {
        angular.forEach(items, function( item ) {
            
            permissions.push({
                url: removePrefix(item.NavigationUrl),
                id: item.Id
            });
            if(item.SubMenu && item.SubMenu.length) {
                buildActive(item.SubMenu);
            }
        });
    }
    var requestDefer;
    var requestResolved = false;
    function getPermissions() {
        var url = API_BASE_URL + 'presentation/navigationentries/Web/All';
        var query = {
            context: '.'
        };

        requestDefer =  $server.get({
            'url': url,
            'query': query
        }).then(function( response ) {
            //populate permissions
            buildActive(response.data);
            requestResolved = true;

            return;

        });

    }

    return {

        canIHas: function(query, isUrl) {
            
           if(!requestDefer) {
                // Hasn't been set yet
                getPermissions();
                return requestDefer.then(function() {
                    return hasPermission(query, isUrl);
                });

            } else if(!requestResolved) {
                // Still resolving, attach the same promise
               return requestDefer.then(function() {
                    return hasPermission(query, isUrl);
               });

            } else {

                return $q.when( hasPermission(query, isUrl) );

            }


        },

        isReady: function() {

            if( !requestDefer ) {
                getPermissions();
                return  requestDefer;
            } else if( !requestResolved ) {                
                return requestDefer;
            } else {                
                return $q.when( true );
            }
           
        },

        //Grabs permissions from EntityActions object, and formats into a useable object literal for our UI to feature test against
        formatPermissions: function(EntityActions) {            
            
            var permissions = {};
            
            angular.forEach(EntityActions, function(action) {
                if (!action) {return;} // In the event the api sends this back as null (it does happen)
                permissions[action.Caption.toLowerCase().replace(' ','')] = action.ActionUrl ? action.ActionUrl : true; // If an action url exists, set the permssion to this instead of a bool
            });

            return permissions;
        }
    };

}]);
