describe('Unit: Directives:paginate', function() {

    /*
     *  This does not test the directives ability to load in items on scroll
     */

    var element, scope, $timeout, BlogService, API_BASE_URL, $httpBackend;
    
    beforeEach(function () {
        module('sherpa');
        module('templates');

        inject(function($rootScope, $compile, $injector, _$timeout_) {

            scope = $rootScope.$new();
            $httpBackend = $injector.get('$httpBackend');
            BlogService = $injector.get('BlogService');
            API_BASE_URL = $injector.get('API_BASE_URL');

            // For some reason base is needed here.  No idea why, found the answer here:
            // http://stackoverflow.com/questions/17370427/loading-a-mock-json-file-within-karmaangularjs-test
            jasmine.getJSONFixtures().fixturesPath = 'base/interfaceSource/test/mockData/api/';

            scope.getData = function(page, pageSize, orderBy, acending, filterBy, categoryId) {
                // Use the blog service as data we could paginate
                return BlogService.getBlogs(page, pageSize, orderBy, acending, filterBy, categoryId).then(function(res){

                    res.data = res.data.items;
                    // Since we aren't connecting to a server, add header data manually
                    res.headers = function() { 
                        return {"TotalCount":6,"TotalPages":3,"PageSize":10,"Page":1}
                    }
                    return res;
                });
            }
            
            $httpBackend.when('GET', API_BASE_URL + 'blogs?p=1&ps=9&rc=1&f=1').respond(200, 
                getJSONFixture('blogs/index.json')
            );

            $timeout = _$timeout_;

            element = angular.element('<div paginate="getData" page-size="9"></div>'); 
            $compile(element)(scope);
            scope.$apply();
            scope.$digest();
        });
    });

    it('should correctly render all elements of the template', function(){

        expect(element.find('.pagination__pages').length).toBeTruthy();
        expect(element.find('.pagination').length).toBeTruthy();
        expect(element.find('.pagination__count').length).toBeTruthy();
        expect(element.find('.pagination__page').length).toBeTruthy();
        expect(element.find('reload').length).toBeTruthy();
    });

    it('can retrieve data and correctly calculate the pagination count', function(){

        $httpBackend.flush();

        expect(scope.page.total).toEqual(6);
        expect(scope.page.totalPages).toEqual(1);
        expect(scope.page.loading).toBe(false);
        expect(scope.page.finished).toBe(true);
        expect(scope.page.current).toEqual(1);
    });

    // What to do about pagination on scroll??

});