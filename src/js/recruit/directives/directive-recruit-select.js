angular.module('ui.recruit')

// Directives to handle custom select fields
// ------------------------------------------------

//Directive that deals with grabbing all of the groups, and handling loading events
.directive('selectRecruitMarket', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=',
            data:    '='
        },
        link: function(scope) {

            scope.markets = {
                data: scope.data.map(function(item) {
                    var market = {};
                    market.Value = item.XmlValue;
                    market.Label = item.Description;
                    if (scope.ngModel === market.Value) {
                        scope.selectModel = market;
                    }
                    return market;
                }),
                loaded: true,
                loading: false
            };

            scope.updateModel = function(selectModel) {
                scope.ngModel = selectModel ? selectModel.Value : null;
            };
        },
        templateUrl: '/interface/views/recruit/partials/select-recruit-market.html'
    };
})
.directive('selectRecruitSeekRegion', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=',
            data:    '='
        },
        link: function(scope) {
            
            scope.regions = {
                data: scope.data.map(function(item) {
                    var region = {};
                    region.Value         = item.XmlValue;
                    region.Label         = item.Description;
                    region.SeekLocations = item.LocationList;

                    if (scope.ngModel === region.Value) {
                        scope.selectModel = region;
                    }
                    return region;
                }),
                loaded: true,
                loading: false
            };

            scope.updateModel = function(selectModel) {
                scope.ngModel = selectModel ? selectModel.Value : null;
            };
        },
        templateUrl: '/interface/views/recruit/partials/select-recruit-region.html'
    };
})
.directive('selectRecruitSeekLocationByRegion', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=',
            regionValue: '=',
            data:'='
        },
        link: function(scope) {
            scope.isDisabled = false;
            scope.$watch('regionValue', function(neww, old) {
                scope.data.forEach(function(item) {
                     if(item.XmlValue === scope.regionValue) {
                         var region = {};
                         region.Value = item.XmlValue;
                         region.Label = item.Description;
                         region.SeekLocations = item.LocationList;
                         scope.selectRegion = region;
                         scope.locations = {
                             data: scope.selectRegion.SeekLocations.map(function(item) {
                                 var location = {};
                                 location.Value = item.XmlValue;
                                 location.Label = item.Description;
                                 location.SeekAreas = item.AreaList;

                                 if (scope.ngModel === location.Value) {
                                     scope.selectModel = location;
                                 }
                                 return location;
                             }),
                             loaded: true,
                             loading: false
                         };
                     }
                });
            });

            scope.updateModel = function(selectModel) {
                scope.ngModel = selectModel ? selectModel.Value : null;
            };
        },
        templateUrl: '/interface/views/recruit/partials/select-recruit-location.html'
    };
})
.directive('selectRecruitSeekAreaByLocation', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=',
            locationValue: '=',
            data: '='
        },
        link: function(scope) {
            scope.isDisabled = false;
            scope.$watch('locationValue', function(neww, old) {
                scope.data.forEach(function(region) {
                    var location = region.LocationList.filter(function(locationItem) {
                        return locationItem.XmlValue === scope.locationValue;
                    });
                    if (location.length) {
                        scope.areas = {
                            data: location[0].AreaList.map(function(item) {
                                var area = {};
                                area.Value = item.XmlValue;
                                area.Label = item.Description;

                                if (scope.ngModel === area.Value) {
                                    scope.selectModel = area;
                                }
                                return area;
                            }),
                            loaded: true,
                            loading: false
                        };
                    }
                });
            });

            scope.updateModel = function(selectModel) {
                scope.ngModel = selectModel ? selectModel.Value : null;
            };
        },
        templateUrl: '/interface/views/recruit/partials/select-recruit-area.html'
    };
})
.directive('selectRecruitClassification', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=',
            data:    '='
        },
        link: function(scope) {
            scope.classifications = {
                data: scope.data.map(function(item) {
                    var classification = {};
                    classification.Value                      = item.XmlValue;
                    classification.Label                      = item.Description;
                    classification.SeekSubClassifications     = item.SubClassificationList;

                    if (scope.ngModel === classification.Value) {
                        scope.selectModel = classification;
                    }
                    return classification;
                }),
                loaded: true,
                loading: false
            };

            scope.updateModel = function(selectModel) {
                scope.ngModel = selectModel ? selectModel.Value : null;
            };
        },
        templateUrl: '/interface/views/recruit/partials/select-recruit-classification.html'
    };
})
.directive('selectRecruitSubClassification', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel:         '=',
            classificationValue: '=',
            data:'='
        },
        link: function(scope) {
            scope.isDisabled = false;
            scope.$watch('classificationValue', function(neww, old) {
                scope.data.forEach(function(item) {
                    if(item.XmlValue === scope.classificationValue) {
                        var classification = {};
                        classification.Value = item.XmlValue;
                        classification.Label = item.Description;
                        classification.SeekSubClassifications = item.SubClassificationList;
                        scope.selectClassifications = classification;
                        scope.subClassifications = {
                            data: scope.selectClassifications.SeekSubClassifications.map(function(item) {
                                var subClassification = {};
                                subClassification.Value = item.XmlValue;
                                subClassification.Label = item.Description;

                                if (scope.ngModel === subClassification.Value) {
                                    scope.selectModel = subClassification;
                                }
                                return subClassification;
                            }),
                            loaded: true,
                            loading: false
                        };
                    }
                });
            });

            scope.updateModel = function(selectModel) {
                scope.ngModel = selectModel ? selectModel.Value : null;
            };
        },
        templateUrl: '/interface/views/recruit/partials/select-recruit-sub-classification.html'
    };
})
.directive('selectRecruitCareeroneIndustry', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=',
            data:    '='
        },
        link: function(scope) {
            scope.industrys = {
                data: scope.data.map(function(item) {
                    var industry = {};
                    industry.Value                      = item.IndustryId;
                    industry.Label                      = item.C1IndustryValues;
                    if (scope.ngModel === industry.Value) {
                        scope.selectModel = industry;
                    }
                    return industry;
                }),
                loaded: true,
                loading: false
            };

            scope.updateModel = function(selectModel) {
                scope.ngModel = selectModel ? selectModel.Value : null;
            };
        },
        templateUrl: '/interface/views/recruit/partials/select-recruit-industry.html'
    };
})
.directive('selectRecruitCareeroneLocation', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=',
            data:    '='
        },
        link: function(scope) {
            scope.locations = {
                data: scope.data.map(function(item) {
                    var location = {};
                    location.Value                      = item.LocationId;
                    location.Label                      = item.C1Area;
                    if (scope.ngModel === location.Value) {
                        scope.selectModel = location;
                    }
                    return location;
                }),
                loaded: true,
                loading: false
            };

            scope.updateModel = function(selectModel) {
                scope.ngModel = selectModel ? selectModel.Value : null;
            };
        },
        templateUrl: '/interface/views/recruit/partials/select-recruit-location.html'
    };
})
.directive('selectRecruitCareeroneCategory', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=',
            data:    '='
        },
        link: function(scope) {
            scope.categorys = {
                data: scope.data.map(function(item) {
                    var category = {};
                    category.Value                      = item.CategoryId;
                    category.Label                      = item.CategoryName;
                    if (scope.ngModel === category.Value) {
                        scope.selectModel = category;
                    }
                    return category;
                }),
                loaded: true,
                loading: false
            };

            scope.updateModel = function(selectModel) {
                scope.ngModel = selectModel ? selectModel.Value : null;
            };
        },
        templateUrl: '/interface/views/recruit/partials/select-recruit-category.html'
    };
})
.directive('selectRecruitCareeroneOccupation', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel:  '=',
            data:     '=',
            category: '='
        },
        link: function(scope) {
            scope.isDisabled = false;
            scope.$watch('category', function(neww, old) {
                if (!scope.category) {
                    scope.isDisabled = true;
                } else {
                    scope.isDisabled = false;
                    //filter and map profession by categoryId
                    var dataOccupations = scope.data.filter(function(item) {
                        return item.CategoryId === scope.category;
                    }).map(function(item) {
                        var occupation = {};
                        occupation.Value = item.OccupationId;
                        occupation.Label = item.OccupationName;

                        if (scope.ngModel === occupation.Value) {
                            scope.selectModel = occupation;
                        }
                        return occupation;
                    });
                    scope.occupations = {
                        data: dataOccupations,
                        loaded: true,
                        loading: false
                    };
                }
            }, true);

            scope.updateModel = function(selectModel) {
                scope.ngModel = selectModel ? selectModel.Value : null;
            };
        },
        templateUrl: '/interface/views/recruit/partials/select-recruit-occupation.html'
    };
})
.directive('selectRecruitCareeroneTemplate', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=',
            data:    '='
        },
        link: function(scope) {
            scope.templates = {
                data: scope.data.map(function(item) {
                    var template = {};
                    template.Value                      = item.TemplateId;
                    template.Label                      = item.Description;
                    if (scope.ngModel === template.Value) {
                        scope.selectModel = template;
                    }
                    return template;
                }),
                loaded: true,
                loading: false
            };

            scope.updateModel = function(selectModel) {
                scope.ngModel = selectModel ? selectModel.Value : null;
            };
        },
        templateUrl: '/interface/views/recruit/partials/select-recruit-template.html'
    };
})
.directive('selectRecruitOneshiftCategory', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=',
            data:    '='
        },
        link: function(scope) {
            scope.categorys = {
                data: scope.data.map(function(item) {
                    var category = {};
                    category.Value       = item.CategoryId;
                    category.Label       = item.CategoryDescription;
                    if (scope.ngModel === category.Value) {
                        scope.selectModel = category;
                    }
                    return category;
                }),
                loaded: true,
                loading: false
            };

            scope.updateModel = function(selectModel) {
                scope.ngModel = selectModel ? selectModel.Value : null;
            };
        },
        templateUrl: '/interface/views/recruit/partials/select-recruit-category.html'
    };
})
.directive('selectRecruitOneshiftProfession', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel:  '=',
            data:     '=',
            category: '='
        },
        link: function(scope) {
            scope.isDisabled = false;
            scope.$watch('category', function(neww, old) {
                if (!scope.category) {
                    scope.isDisabled = true;
                } else {
                    scope.isDisabled = false;
                    //filter and map profession by categoryId
                    var dataProfessions = scope.data.filter(function(item) {
                        return item.CategoryId === scope.category;
                    }).map(function(item) {
                        var profession = {};
                        profession.Value = item.ProfessionId;
                        profession.Label = item.ProfessionDescription;

                        if (scope.ngModel === profession.Value) {
                            scope.selectModel = profession;
                        }
                        return profession;
                    });
                    scope.professions = {
                        data: dataProfessions,
                        loaded: true,
                        loading: false
                    };
                }
            }, true);

            scope.updateModel = function(selectModel) {
                scope.ngModel = selectModel ? selectModel.Value : null;
            };
        },
        templateUrl: '/interface/views/recruit/partials/select-recruit-profession.html'
    };
})
.directive('selectRecruitCareeroneArea', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=',
            data:    '='
        },
        link: function(scope) {
            //
            scope.areas = {
                data: scope.data.map(function(item) {
                    var area = {};
                    area.Value       = item.LocationId;
                    area.Label       = item.C1Area;
                   if (scope.ngModel === area.Value) {
                        scope.selectModel = area;
                    }
                    return area;
                }),
                loaded: true,
                loading: false
            };

            scope.updateModel = function(selectModel) {
                scope.ngModel = selectModel ? selectModel.Value : null;
            };
        },
        templateUrl: '/interface/views/recruit/partials/select-recruit-area.html'
    };
})
.directive('selectRecruitOneshiftRegion', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=',
            data:    '='
        },
        link: function(scope) {
            scope.regions = {
                data: scope.data.map(function(item) {
                    var region = {};
                    region.Value     = item.RegionId;
                    region.Label     = item.RegionDescription;
                    if (scope.ngModel === region.Value) {
                        scope.selectModel = region;
                    }
                    return region;
                }),
                loaded: true,
                loading: false
            };

            scope.updateModel = function(selectModel) {
                scope.ngModel = selectModel ? selectModel.Value : null;
            };
        },
        templateUrl: '/interface/views/recruit/partials/select-recruit-region.html'
    };
})
.directive('selectRecruitOneshiftArea', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=',
            data:    '=',
            region:  '='
        },
        link: function(scope) {
            scope.isDisabled = false;
            scope.$watch('region', function(neww, old) {
                if (!scope.region) {
                    scope.isDisabled = true;
                } else {
                    scope.isDisabled = false;
                    //filter and map areas by regionId
                    var dataAreas = scope.data.filter(function(item) {
                        return item.RegionId === scope.region;
                    }).map(function(item) {
                        var area = {};
                        area.Value = item.AreaId;
                        area.Label = item.AreaDescription;

                        if (scope.ngModel === area.Value) {
                            scope.selectModel = area;
                        }
                        return area;
                    });
                    scope.areas = {
                        data: dataAreas,
                        loaded: true,
                        loading: false
                    };
                }
            }, true);

            scope.updateModel = function(selectModel) {
                scope.ngModel = selectModel ? selectModel.Value : null;
            };
        },
        templateUrl: '/interface/views/recruit/partials/select-recruit-area.html'
    };
})
.directive('selectRecruitCareerOneCompanyName', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=',
            data:    '='
        },
        link: function(scope) {
            scope.companies = {
                data: scope.data.map(function(item) {
                    var company = {};
                    company.Value = item;
                    company.Label = item;
                    return company;
                }),
                loaded: true,
                loading: false
            };
        },
        templateUrl: '/interface/views/recruit/partials/select-recruit-career-one-company-name.html'
    };
});