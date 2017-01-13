

// URL Service
// ----------------------------------------

describe('Unit: Service:Url', function() {

    var Paths, API_BASE_URL;


    beforeEach(function () {
        module('sherpa');

        inject(function($compile, $rootScope, $injector) {

            // set up any required services
            Paths = $injector.get('Paths');
            API_BASE_URL = $injector.get('API_BASE_URL');
            spyOn(console, 'warn');
        });
    });


    it('should be able to get a path using the get method with no parameters passed in', function() {
        
        expect(Paths.get('dashboard.index')).toEqual({
            path: '/dashboard',
            external: false
        });
        
        expect(Paths.get('dashboard.news.create')).toEqual({
            path: '/dashboard/news/create',
            external: false
        });
        
        expect(Paths.get('requests.details')).toEqual({
            path: '/network/RequestForms.aspx?op=detail&frid=',
            external: true
        });
    });
    
    it('should be able to get a path using the get method parameters passed in', function() {
        
        expect(Paths.get('requests.details', 28)).toEqual({
            path: '/network/RequestForms.aspx?op=detail&frid=28',
            external: true
        });
        
        expect(Paths.get('dashboard.news.edit', 1000)).toEqual({
            path: '/dashboard/news/1000/edit',
            external: false
        });
        
        expect(Paths.get('dashboard.news.edit', 'text')).toEqual({
            path: '/dashboard/news/text/edit',
            external: false
        });
        
        expect(Paths.get('training.manage.subjects.stats', 10, 11)).toEqual({
            path: '/training/manage/10/11/stats',
            external: false
        });
    });
    
    it('should handle an incorrect path appropriately', function() {
        
        expect(Paths.get('my.fake.path', 200)).toEqual({
            path: false
        });
        
        if (!SHRP.isMinified) {
            expect(console.warn).toHaveBeenCalled();
        }
    });
    
    it('should be able to append the api url to a path if the fromApi property is set', function() {
    
        expect(Paths.get('reporting.trainingSubjectProgress', 12, 13, 'testformat', 14)).toEqual({
            path: API_BASE_URL + 'reporting/training-courses/12/training-subjects/13/progresses?format=testformat&key=14',
            external: false
        });

    });

});
