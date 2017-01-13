angular.module('ui.recruit.candidateonboard')
    .factory('Employee', ['$server', 'API_BASE_URL', '$HTTPCache', 'Paths', '$q', 'Permissions', function($server, API_BASE_URL, $HTTPCache, Paths, $q, Permissions) {
        var formatPermissions = Permissions.formatPermissions;
        var GROUP_NAMESPACE = API_BASE_URL + 'Member/';

        var Employee = {
            all: function(p, clearCache) {
                //return MockShiftPosition.all(p);
                /*var url = GROUP_NAMESPACE;
                var query = {
                    p: p && p.Page,
                    ps: p && p.PageSize,
                    rc : 1
                }
                return $q(function (resolve, reject) {
                    $server.get({
                        url: url,
                        query: query
                    }, clearCache)
                        .then(function (res) {

                            res.userCan = {};
                            if (res.data.Errors && res.data.Errors.length > 0) {
                                return $q.reject({ data: { "Message": res.data.Errors[0].Message } });
                            }
                            if (res.data.EntityActions) {
                                res.userCan = formatPermissions(res.data.EntityActions, ''.toString);
                            }
                            res.data = res.data.ShiftPositionItemResults.map(function (entity) {
                                return {
                                    "Id": entity.ShiftPosition.Id,
                                    "RoleId": entity.ShiftPosition.RoleId,
                                    "RoleDescription": entity.ShiftPosition.RoleDescription,
                                    "SkillList": entity.ShiftPosition.SkillList,
                                    "ShiftPositionDescription": entity.ShiftPosition.ShiftPositionDescription,
                                    "ShiftPositionName": entity.ShiftPosition.ShiftPositionName,
                                    "userCan": formatPermissions(entity.EntityActions, ''.toString)
                                }
                            });
                            resolve(res);
                        })
                        .catch(function(err) {
                            reject(err);
                        });
                });*/
            },

            create: function(obj) {
                var url = GROUP_NAMESPACE + 'AddEmployee';
                return $server.create({ 'url': url, data: angular.copy(obj) }).then(function(res) {
                    $HTTPCache.clear(url);
                    return res;
                });
            },
            update: function(obj) {
                var url = GROUP_NAMESPACE + 'AddEmployee';
                return $server.update({ 'url': url + "/" + obj.Id, data: angular.copy(obj) }).then(function(res) {
                    $HTTPCache.clear(url);
                    return res;
                });
            }
        };

        return Employee;

    }]);