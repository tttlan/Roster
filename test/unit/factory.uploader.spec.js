

// Factory Uploader
// ----------------------------------------

describe('Unit: Factory:upload', function() {

    var FileStorage, UploadFactory, Upload, $timeout, $httpBackend, API_BASE_URL;

    var defaultfile = {
        'name': 'Filename.jpg',
        'size': 1024,
        'ext': 'jpg',
        'success': true,
        'progress': 100,
        'id': 120
    };

    var fileObject = {
        lastModified: 1412231810000,
        lastModifiedDate: 1412231810000,
        name: 'Filename.jpg',
        size: 178250,
        type: 'image/jpeg',
    };

    var opts = {
        maxFiles : 2
    }

    beforeEach(function () {
        module('sherpa');

        inject(function($compile, $rootScope, _$timeout_, $injector) {

            // set up any required services
            UploadFactory = $injector.get('UploadFactory');
            FileStorage = $injector.get('FileStorage');
            $httpBackend = $injector.get('$httpBackend');
            API_BASE_URL = $injector.get('API_BASE_URL');
            $timeout = _$timeout_;

            // HTTP for File storage generate
            $httpBackend.when('POST', API_BASE_URL + 'file-storage/').respond(200, '{"$id":"1","FileStoreId":2087,"UploadUrl":"https://storage101.ord1.clouddrive.com/v1/1234"}');
            
        });

        Upload = UploadFactory.$init(opts);
    });


    it('should return 0 if is image', function() {
        var file = defaultfile;
        expect( Upload.isImage(file) ).toEqual(0);
    });


    it('should return 1 if is not image', function() {
        var file = defaultfile;
        file.name = 'document.pdf';

        expect( Upload.isImage(file) ).toEqual(1);
    });
    

    it('should pass if file is small than 10MB limit', function() {
        var file = defaultfile;
        file.size = 9 * 1000 * 1024;

        expect( Upload.isValidFile(file) ).toBe(true);
    });


    it('should error if file is larger than 10MB limit', function() {
        var file = defaultfile;
        file.size = 11 * 1000 * 1024;

        expect( Upload.isValidFile(file) ).toBe(false);
    });


    it('should error if file is not supported', function() {
        var file = defaultfile;
        file.size = 1 * 1000 * 1024;
        file.name = 'badfile.exe';

        expect( Upload.isValidFile(file) ).toBe(false);
    });


    it('should pass if file is a supported file type', function() {
        var file = defaultfile;
        file.name = 'goodfile.jpg';

        expect( Upload.isValidFile(file) ).toBe(true);
    });


    it('should clean up bad characters in a file name', function(){

        var test1 = 'mynormalfile.jpg';
        var result1 = 'mynormalfile.jpg';

        var test2 = 'mybad&f!le.jpg';
        var result2 = 'mybad_f_le.jpg';

        var test3 = 'some@other(file.jpg';
        var result3 = 'some_other_file.jpg';

        expect( Upload.cleanFileName(test1) ).toEqual( result1 ); 
        expect( Upload.cleanFileName(test2) ).toEqual( result2 ); 
        expect( Upload.cleanFileName(test3) ).toEqual( result3 ); 

    });


    it('should return false if there are no files', function() {
        expect( Upload.isOverLimit() ).toBe(false);
    });


    it('should return false if less than file limit', function() {
        //pushing in 1 file
        Upload.files.items.push(defaultfile);
        expect( Upload.isOverLimit() ).toBe(false);
    });


    it('should return true if over/equal to the file limit', function() {
        // pushing into two files
        Upload.files.items.push(defaultfile);
        Upload.files.items.push(defaultfile);
        expect( Upload.isOverLimit() ).toBe(true);
    });


    it('should add a new file to the listing if valid', function() {
        var file = fileObject;
        Upload.addFile(file, true); // also stopping uploader sync with true arg
        $timeout.flush(); // flush to clear timeout

        expect( Upload.files.items.length ).toEqual(1);
    });


    it('should NOT add a new file to the listing if invalid', function() {
        var file = fileObject;
        file.size = 11 * 1000 * 1024;
        Upload.addFile(file, true);

        expect( Upload.files.items.length ).toEqual(0);
    });


    it('should NOT add a new file if we are going over the limit', function() {
        // add new file
        var file = fileObject;
        file.size = 1 * 1000 * 1024;
        // adding 3 files, limit is 2
        Upload.addFile(file, true);
        $timeout.flush(); // flush to clear timeout

        Upload.addFile(file, true);
        $timeout.flush(); // flush to clear timeout

        Upload.addFile(file, true);
        //$timeout.flush(); // flush to clear timeout
        
        expect( Upload.files.items.length ).toEqual(2);
        expect( Upload.files.reachedLimit ).toBe(true);
    });


    it('should add a new file and upload to Filestorage', function() {
        var file = fileObject;
        Upload.addFile(file);

        // flush to clear timeouts etc
        $timeout.flush(); 
        $httpBackend.flush();

        // assume XMLHttpRequest success
        file.started = true;
        file.success = true;
        Upload.success(0, file);

        expect( Upload.files.items.length ).toEqual(1);

    });


    it('should remove file from listing when deleted', function() {
        // pushing into two files
        Upload.files.items.push(defaultfile);
        Upload.removeFile(0)

        expect( Upload.files.items.length ).toEqual(0);
    });


    it('should add any existing files into listing', function() {
        var files = [];
        files.push(defaultfile);
        files.push(defaultfile);
        files.push(defaultfile);
        files.push(defaultfile);

        Upload.addExistingFiles(files);

        // flush to clear timeouts etc
        $timeout.flush(); 

        expect( Upload.files.items.length ).toEqual(4);
    });


    it('should add files from file input', function() {

        var el = { files: [] }
        el.files.push(fileObject);

        Upload.onInputEvent(el, true); // stop http sync too

        // flush to clear timeouts etc
        $timeout.flush();

        expect( Upload.files.items.length ).toEqual(1);
    });

});