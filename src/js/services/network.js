angular.module('ui.services')


// Network factory
// ----------------------------------------

.factory('Networks', ['$server', 'API_BASE_URL', '$q', '$timeout',
    function($server, API_BASE_URL, $q, $timeout) {

    var NETWORK_NAMESPACE = API_BASE_URL,
        // ToDo: Countries is in the wrong namespace, it should be moved,
        //      making this temperary
        PROFILE_NAMESPACE = API_BASE_URL + 'profilemanagement/',
        RECRUITMENT_NAMESPACE = API_BASE_URL + 'recruitments/',
        ONBOARDING_NAMESPACE = API_BASE_URL + 'onboarding/',
        roles = {
            loading: false,
            loaded: false,
            data: []
        },
        groups = {
            loading: false,
            loaded: false,
            data: []
        },
        countries = {
            loading: false,
            loaded: false,
            data: []
        },
        states = {
            loading: false,
            loaded: false,
            data: []
        },
        Network = {
            getGroupsAndRoles: function() {
                
                var retObj = {
                    loading: true,
                    loaded: false
                };

                retObj.groups = this.getGroups();
                retObj.roles = this.getRoles();
                retObj.$promise = $q.all([retObj.groups.$promise, retObj.roles.$promise]).then(function(res) {
                    $timeout(function() {
                        retObj.loading = false;
                        retObj.loaded = true;
                    });
                    return res;
                });

                return retObj;
            },
            
          getGroups: function(nameBase) {
                
                var url = NETWORK_NAMESPACE + (nameBase || 'NetworkGroups/groups?type=s');

                if(!groups.loading && !groups.loaded) {
                    
                    groups.loading = true;

                        groups.$promise = $server.get({
                            'url': url
                        }).then(function(res) {

                        groups.loaded = true;
                        groups.loading = false;
                        groups.data = res.data.NetworkGroupDetailItemResults.map(function(group) {
                            
                            return {
                                label: group.NetworkGroupDetail.GroupName,
                                value: {
                                    DistributionId: group.NetworkGroupDetail.NetworkGroupId,
                                    DistributionType: group.NetworkGroupDetail.Type
                                }
                            };

                        });

                        return res;

                    });

                }

                return groups;

            },

            getGroupsPromise: function() {
                var url = NETWORK_NAMESPACE + 'NetworkGroups/groups';

                return $server.get({
                    url: url,
                    query: {
                        type: 's'
                    }
                }).then(function(res) {
                    var simplifiedData = res.data.NetworkGroupDetailItemResults.map(function(group) {
                        return {
                            NetworkGroupId: group.NetworkGroupDetail.NetworkGroupId,
                            GroupName: group.NetworkGroupDetail.GroupName,
                            Type: group.NetworkGroupDetail.Type
                        };
                    });

                    return simplifiedData;
                });
            },

            getRoles: function() {

                var url = NETWORK_NAMESPACE + 'roles';

                if(!roles.loading && !roles.loaded) {
                    
                    roles.loading = true;

                        roles.$promise = $server.get({
                            'url': url
                        }).then(function(res) {
                    
                        roles.loaded = true;
                        roles.loading = false;
                        roles.data = res.data.RoleDetailItemResults.map(function(role) {
                            return {
                                label: role.RoleDetail.Description,
                                id: role.RoleDetail.RoleId
                            };
                        });

                        return res;

                    });

                }

                return roles;
            },

            getRolesPromise: function() {
                var url = NETWORK_NAMESPACE + 'roles/summaries';

                return $server.get({
                    url: url
                }).then(function(res) {
                    var simplifiedData = res.data.RoleSummaryItemResults.map(function(role) {
                        return {
                            RoleId: role.RoleSummary.RoleId,
                            Description: role.RoleSummary.Description
                        };
                    });

                    return simplifiedData;
                });
            },

            formatRoles: function(roles) {

                    if (!angular.isArray(roles)) {
                        return [];
                    }

                roles = roles.slice();

                return roles.map(function(role) {
                        return role.id;
                }).filter(function(roleId) {
                    return roleId !== 0;
                });

            },

            getCountries: function() {
                    var url = PROFILE_NAMESPACE + 'countries';

                if(!countries.loading && !countries.loaded) {
                    
                    countries.loading = true;

                        countries.$promise = $server.get({
                            'url': url
                        }).then(function(res) {
                        
                        countries.loaded = true;
                        countries.loading = false;
                        countries.data = res.data;

                        return res;

                    });

                }

                return countries;
            },

            getCountriesPromise: function() {
                var url = PROFILE_NAMESPACE + 'countries';

                return $server.get({
                    url: url
                }).then(function(res) {
                    return res.data;
                });
            },

            getStates: function(nameBase, format) {
                var url = nameBase ? (API_BASE_URL + nameBase) : (PROFILE_NAMESPACE + 'stateregions');

                if(!states.loading && !states.loaded) {
                    
                    states.loading = true;

                        states.$promise = $server.get({
                            'url': url
                        }).then(function(res) {
                        
                        states.loaded = true;
                        states.loading = false;
                        if (format) {
                            res.data = res.data.map(function(item) {
                                 return {
                                    Value: item.JobRegionId,
                                    Label: item.JobRegionName
                                 };
                            });
                        }
                        states.data = res.data;                        
                        return res;
                    });

                }

                return states;
            },
            
            getStatesPromise: function() {
                var url = PROFILE_NAMESPACE + 'stateregions';

                return $server.get({
                    url: url
                }).then(function(res) {
                    return res.data;
                });
            },
            
            getTaxCodes: function() {
                var url = ONBOARDING_NAMESPACE + 'taxcodes';

                return $server.get({
                    url: url
                }, true).then(function(res) {
                    var taxcodes = res.data.TaxCodeSummaryItemResults.map(function(taxcode) {
                        return {
                            TaxCodeId: taxcode.TaxCodeSummary.TaxCodeId,
                            TaxCodeDescription: taxcode.TaxCodeSummary.Description,
                            TaxCodeKey: taxcode.TaxCodeSummary.TaxCodeKey
                        };
                    });

                    return taxcodes;
                });
            },
            
            getEmploymentClassification: function() {
                var url = ONBOARDING_NAMESPACE + 'employmentclassifications';
                
                return $server.get({
                    url: url
                }, true).then(function(res) {
                    var employmentclassifications = res.data.SalaryClassificationItemResult.map(function(item) {
                        return {
                            Value: item.SalaryClassification.Value,
                            Label: item.SalaryClassification.Label
                        };
                    });
                    
                    return employmentclassifications;
                });
            },
            
            formatGroups: function(groups, simpleFormat) {
                groups = groups.slice();

                    if (!angular.isArray(groups)) {
                        return [];
                    }

                return groups.map(function(group) {
                        return simpleFormat ? {
                            'Label': group.label,
                            'Id': group.value.DistributionId
                        } : group.value;
                }).filter(function(group) {
                    return simpleFormat ? group.Id !== 0 : group.DistributionId !== 0;
                });
            },
            
            formatIntoIds: function(selected) {

                // fuction to build data object into an object of
                // 2 arrays RoleIds and NetworkGroupIds
                // param:
                // selected = {
                //     groups: []
                //     roles: []
                // }
                // Returns:
                //   {
                //    RolesIds: [],
                //    NetworkGroupIds: []
                //   }

                var data = {};

                if (selected.groups && selected.groups.length) {
                    data.NetworkGroupIds = [];
                    // populate network group Ids
                    angular.forEach(selected.groups, function(group) {
                        data.NetworkGroupIds.push(group.value.DistributionId);
                    });
                }

                if (selected.roles && selected.roles.length) {
                    data.RoleIds = [];
                    // populate Role Ids
                    angular.forEach(selected.roles, function(role) {
                        data.RoleIds.push(role.id);
                    });
                }

                return data;
            },

            getSalaryTypes: function() {
                var url = ONBOARDING_NAMESPACE + 'SalaryTypes';

                return $server.get({
                    url: url
                }).then(function(res) {
                    return res.data.SalaryTypeSummaryItemResult;
                });
            },

            getEmploymentTypes: function(nameBase) {
                var url = nameBase ? (API_BASE_URL + nameBase) : (ONBOARDING_NAMESPACE + 'EmploymentTypes');

                return $server.get({
                    url: url
                }).then(function(res) {
                    if (nameBase) {
                        res.data.EmploymentClassificationSummaryDtoItemResult = res.data.Data.map(function(item) {
                            return {EmploymentClassificationSummaryDto : item};
                        });
                    }
                    return res.data.EmploymentClassificationSummaryDtoItemResult;
                });
            },

            getTermsAndConditions: function() {
                var url = NETWORK_NAMESPACE + 'network/terms';

                return $server.get({
                    url: url
                }).then(function(res) {
                    return res.data;
                });
            },

            getRolePayRates: function(memberId) {
                var memberIdString = '0';
                if (memberId) {
                    memberIdString = memberId;
                }

                var url = ONBOARDING_NAMESPACE + 'member/' + memberIdString + '/RolePayRates';

                return $server.get({
                    url: url
                }).then(function(res) {
                    return res.data.SalaryRateItemResults;
                });
            },

            getFinalInstructions: function() {
                var url = NETWORK_NAMESPACE + 'Network/FinalInstructions';

                return $server.get({
                    url: url
                }).then(function(res) {
                    // the api returns a JSON string, so we need to parse it into an object
                    return angular.fromJson(res.data);
                });
            },

            getCompanyDescription: function() {
                var url = NETWORK_NAMESPACE + 'Network/companysummary';

                return $server.get({
                    url: url
                }).then(function(res) {
                    return res.data;
                });
            },

            getSalutations: function() {
                var url = ONBOARDING_NAMESPACE + 'salutations';

                return $server.get({
                    url: url
                }).then(function(res) {
                    return res.data;
                });
            },

            getPaperDocTypes: function() {
                var url = ONBOARDING_NAMESPACE + 'RequirementTypes';

                return $server.get({
                    url: url
                }).then(function(res) {
                    return res.data.PaperDocTypeSummaryItemResults;
                });
            },
                
            getSalaryRangesByType: function(type) {
                var url = RECRUITMENT_NAMESPACE + 'SalaryRanges/Type/' + type;
                return $server.get({
                    url: url
                }).then(function(res) {
                    if(res.data && res.data.JobAdSalaryItemResults.length) {
                            res.data = res.data.JobAdSalaryItemResults.map(function(salaryRange) {
                            return {
                                    'Label'    : salaryRange.JobAdSalary.Title,
                                    'Value'    : salaryRange.JobAdSalary.SalaryId,
                                    'RecOrder' : salaryRange.JobAdSalary.RecOrder
                                };
                            });
                        }
                        return res;
                });
            },
            
             getAreaByState: function(state) {
                var url = RECRUITMENT_NAMESPACE + 'JobRegions/' + state.Value + '/JobAreas/Search?';
                
                return $server.get({
                    'url': url
                }).then(function(res) {
                    if(res.data.length) {
                        res.data = res.data.map(function(area) {
                            return {
                                    'Label': area.JobAreaName,
                                    'Value': area.JobAreaId
                                };
                        });
                    }
                    return res;
                });
            }
        };

    return Network;

}]);
