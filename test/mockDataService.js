angular.module('test.services', []).service('mockDataService', ['$q', MockDataService]);

function MockDataService($q) {

    return {
        get: function(resource) {
            jasmine.getJSONFixtures().fixturesPath = 'base/interfaceSource/test/mockData/';

            return $q(function (resolve) {
                resolve(getJSONFixture(resource))
            });
        },
        getRaw: function(resource){
            jasmine.getJSONFixtures().fixturesPath = 'base/interfaceSource/test/mockData/';
            return getJSONFixture(resource);
        }
    }
}