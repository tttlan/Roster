angular.module('ui.recruit.candidateonboard')
    .factory('OnboardingFactory', ['$server', 'API_BASE_URL', '$HTTPCache', 'Paths', '$q', 'Permissions', function($server, API_BASE_URL, $HTTPCache, Paths, $q, Permissions) {
        var formatPermissions = Permissions.formatPermissions;
        var GROUP_NAMESPACE = API_BASE_URL + 'onboarding/';

        var OnboardingFactory = {
            getSalaryTypes: function(p, clearCache) {
                var url = GROUP_NAMESPACE + 'salarytypes';
                return $q(function(resolve, reject) {
                    $server.get({
                        url: url
                    }, clearCache)
                        .then(function(res) {

                            res.userCan = {};
                            if (res.data.EntityActions) {
                                res.userCan = formatPermissions(res.data.EntityActions, ''.toString);
                            }
                            res.data = res.data.SalaryTypeSummaryItemResult.map(function(entity) {
                                return {
                                    "SalaryTypeId": entity.SalaryTypeSummary.SalaryTypeId,
                                    "Description": entity.SalaryTypeSummary.Description,
                                    "IsPernament": entity.SalaryTypeSummary.IsPernament,
                                    "MinimumHours": entity.SalaryTypeSummary.MinimumHours,
                                    "PaymentType": entity.SalaryTypeSummary.PaymentType,
                                    "LookupUrl": entity.SalaryTypeSummary.LookupUrl,
                                    "userCan": formatPermissions(entity.EntityActions, ''.toString)
                                };
                            });
                            resolve(res);
                        })
                        .catch(function(err) {
                            reject(err);
                        });
                });
            },
            getEmploymentTypes: function(p, clearCache) {
                var url = GROUP_NAMESPACE + 'employmenttypes';
                return $q(function(resolve, reject) {
                    $server.get({
                        url: url
                    }, clearCache)
                        .then(function(res) {

                            res.userCan = {};
                            if (res.data.EntityActions) {
                                res.userCan = formatPermissions(res.data.EntityActions, ''.toString);
                            }
                            res.data = res.data.EmploymentClassificationSummaryDtoItemResult.map(function(entity) {
                                return {
                                    "Value": entity.EmploymentClassificationSummaryDto.Value,
                                    "Label": entity.EmploymentClassificationSummaryDto.Label,
                                    "userCan": formatPermissions(entity.EntityActions, ''.toString)
                                };
                            });
                            resolve(res);
                        })
                        .catch(function(err) {
                            reject(err);
                        });
                });
            },
            getRoles: function(p, clearCache) {
                var url = GROUP_NAMESPACE + 'roles';
                return $q(function(resolve, reject) {
                    $server.get({
                        url: url
                    }, clearCache)
                        .then(function(res) {

                            res.userCan = {};
                            if (res.data.EntityActions) {
                                res.userCan = formatPermissions(res.data.EntityActions, ''.toString);
                            }
                            res.data = res.data.NetworkGroupRoleSummaryItemResults.map(function(entity) {
                                return {
                                    "RoleId": entity.NetworkGroupRoleSummary.RoleId,
                                    "Name": entity.NetworkGroupRoleSummary.Name,
                                };
                            });
                            resolve(res);
                        })
                        .catch(function(err) {
                            reject(err);
                        });
                });
            },
            getSalutations: function(p, clearCache) {
                var url = GROUP_NAMESPACE + 'salutations';
                return $q(function(resolve, reject) {
                    $server.get({
                        url: url
                    }, clearCache)
                        .then(function(res) {

                            res.userCan = {};
                            if (res.data.EntityActions) {
                                res.userCan = formatPermissions(res.data.EntityActions, ''.toString);
                            }
                            res.data = res.data.map(function(entity) {
                                return {
                                    "Id": entity.Id,
                                    "Name": entity.Name,
                                };
                            });
                            resolve(res);
                        })
                        .catch(function(err) {
                            reject(err);
                        });
                });
            },
            getRolePayrates: function(p, clearCache) {
                var url = GROUP_NAMESPACE + 'rolepayrates';
                return $q(function(resolve, reject) {
                    $server.get({
                        url: url
                    }, clearCache)
                        .then(function(res) {

                            res.userCan = {};
                            if (res.data.EntityActions) {
                                res.userCan = formatPermissions(res.data.EntityActions, ''.toString);
                            }
                            res.data = res.data.SalaryRateItemResults.map(function(entity) {
                                return {
                                    "SalaryTypeID": entity.SalaryRate.SalaryTypeID,
                                    "Value": entity.SalaryRate.Value,
                                    "Label": entity.SalaryRate.Label,
                                    "AgeBased": entity.SalaryRate.AgeBased,
                                    "userCan": formatPermissions(entity.EntityActions, ''.toString)
                                };
                            });
                            resolve(res);
                        })
                        .catch(function(err) {
                            reject(err);
                        });
                });
            }
        };

        return OnboardingFactory;

    }]);
