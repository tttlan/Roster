angular.module('ui.recruit.models')
    .factory('LocationListModel', ['Permissions', (Permissions) => {
        return class LocationListModel {

            static fromApi(res) {
                let response;
                if (typeof res === 'object') {
                    response = res.data.NetworkGroupDetailItemResults || [res.data];
                    var obj = {
                        Locations: response.map(function(item) {
                            return {
                                GroupName: item.NetworkGroupDetail.GroupName,
                                IsTrainingLocation: item.NetworkGroupDetail.IsTrainingLocation,
                                LookupUrl: item.NetworkGroupDetail.LookupUrl,
                                NetworkGroupId: item.NetworkGroupDetail.NetworkGroupId,
                                Type: item.NetworkGroupDetail.Type,
                                Permissions: Permissions.formatPermissions(item.EntityActions)
                            };
                        }),

                        Permissions: Permissions.formatPermissions(res.data.EntityActions),
                        Pagination: res.data.Pagination
                    };

                    res.data = obj;
                    return res.data;
                } else {
                    throw new Error('API has returned a none object type ${NetworkGroupDetailItemResults}');
                }
            }
        };
    }]);
