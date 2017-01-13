angular.module('ui.services')


// Members factory
// ----------------------------------------

.factory('Groups', ['$server', 'API_BASE_URL', '$HTTPCache', 'Paths', function($server, API_BASE_URL, $HTTPCache, Paths) {

    var GROUP_NAMESPACE = API_BASE_URL + 'NetworkGroups/';
    function buildMemberProfileLinks(member) {
        
        member.url = Paths.get('network.profile', member.MemberId).path || '';

        return member;

    }

    var Group = {

        all: function() {

            var url = GROUP_NAMESPACE;

            return $server.get({ 'url': url });

        },

        get: function(groupId) {

            var url = GROUP_NAMESPACE + 'groupprofile?id=' + groupId;

            return $server.get({ 'url': url });

        },

        getMembers: function(page, pageSize, orderBy, acending, filterBy, groupId, minified) {
            
            var query = {
                    'groupid': groupId,
                    'p': page,
                    'o': orderBy,
                    'ps': pageSize,
                    'f': filterBy,
                    'minified': minified,
                    'rc': 1
                },
                url = API_BASE_URL + 'profilemanagement/membersprofilebygroup';

            return $server.get({
                'url': url,
                'query': query
            }).then(function(res) {
                
                //Build member profile links
                res.data = res.data.map(buildMemberProfileLinks);
                return res;
            });

        },

        getMyGroups: function() {

            var url = GROUP_NAMESPACE + 'membergroups';

            return $server.get({ 'url': url });

        },

        getMyGroupsList: function() {

            var url = GROUP_NAMESPACE + 'membergroups';

            return $server.get({ 
                'url': url 
            }).then(function(res) {

                 return res.data.NetworkGroupDetailItemResults.map(function(group) {
                    return {
                        'label': group.NetworkGroupDetail.GroupName,
                        'value':{
                            'DistributionId': group.NetworkGroupDetail.NetworkGroupId,
                            'DistributionType':'NetworkGroup',
                            'GroupType': group.NetworkGroupDetail.Type
                        }
                    };
                });

            });

        },
        getStoreGroups: function() {
            var url = GROUP_NAMESPACE + 'storegroups';

            return $server.get({
                'url': url
            }).then(function(res) {

                return res.data.NetworkGroupDetailItemResults.map(function(group) {
                    return {
                        'label': group.NetworkGroupDetail.GroupName,
                        'value': group.NetworkGroupDetail.NetworkGroupId
                    };
                });

            });
        },
        getOtherGroups: function() {
            var url = GROUP_NAMESPACE + 'othergroups';

            return $server.get({
                'url': url
            }).then(function(res) {

                return res.data.NetworkGroupDetailItemResults.map(function(group) {
                    return {
                        'label': group.NetworkGroupDetail.GroupName,
                        'value': group.NetworkGroupDetail.NetworkGroupId
                    };
                });

            });
        }
    };

    return Group;

}]);
