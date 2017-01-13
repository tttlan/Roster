

// URL Service
// ----------------------------------------

describe('Unit: Service:Url', function() {

    var UrlService, $timeout;


    beforeEach(function () {
        module('sherpa');

        inject(function($compile, $rootScope, $injector) {

            // set up any required services
            UrlService = $injector.get('Url');

        });
    });


    it('should match valid urls in a string', function() {
        
        // http://www.google.com
        var input1 = 'Check out this link http://www.google.com';
        var output1 = 'Check out this link <a href="http://www.google.com" target="_blank">http://www.google.com</a>';

        // http://google.com
        var input2 = 'Check out this link http://google.com of mine';
        var output2 = 'Check out this link <a href="http://google.com" target="_blank">http://google.com</a> of mine';

        // www.google.com
        var input3 = 'Check out this link www.google.com of mine';
        var output3 = 'Check out this link <a href="//www.google.com" target="_blank">www.google.com</a> of mine';

        // http://google.internet
        var input4 = 'Check out this link http://google.internet of mine';
        var output4 = 'Check out this link <a href="http://google.internet" target="_blank">http://google.internet</a> of mine';

        expect( UrlService.parseText(input1).text ).toEqual(output1);
        expect( UrlService.parseText(input2).text ).toEqual(output2);
        expect( UrlService.parseText(input3).text ).toEqual(output3);
        expect( UrlService.parseText(input4).text ).toEqual(output4);
    });


    it('should NOT match invalid urls in a string', function() {
        
        // ww.google.com
        var input1 = 'Check out this link ww.google.com';
        
        // google.com
        var input2 = 'Check out this link google.com of mine';
        
        // www google.com
        var input3 = 'Check out this link www google.com of mine';
        
        // google.internet
        var input4 = 'Check out this link google.internet of mine';
        
        expect( UrlService.parseText(input1).text ).toEqual(input1);
        expect( UrlService.parseText(input2).text ).toEqual(input2);
        expect( UrlService.parseText(input3).text ).toEqual(input3);
        expect( UrlService.parseText(input4).text ).toEqual(input4);
    });


    it('should match a valid Youtube URL and return a standard embed url', function() {
        
        var output1 = '//www.youtube.com/embed/ZedLgAF9aEg?rel=0';

        var input1 = 'http://www.youtube.com/watch?v=ZedLgAF9aEg';
        var input2 = 'http://www.youtube.com/embed/ZedLgAF9aEg';
        var input3 = 'http://www.youtube.com/watch?v=ZedLgAF9aEg';
        var input4 = 'http://youtu.be/ZedLgAF9aEg';
        var input5 = 'http://youtube.com/watch?v=ZedLgAF9aEg&feature=youtu.be';
        var input6 = 'http://www.youtube.com/v/ZedLgAF9aEg?version=3&autohide=1';

        expect( UrlService.checkEmbeddability(input1).url ).toEqual(output1);
        expect( UrlService.checkEmbeddability(input2).url ).toEqual(output1);
        expect( UrlService.checkEmbeddability(input3).url ).toEqual(output1);
        expect( UrlService.checkEmbeddability(input4).url ).toEqual(output1);
        expect( UrlService.checkEmbeddability(input5).url ).toEqual(output1);
        expect( UrlService.checkEmbeddability(input6).url ).toEqual(output1);
    });


    it('should match a valid Vimeo URL and return a standard embed url', function() {
        
        var output1 = '//player.vimeo.com/video/71673549';

        var input1 = 'http://vimeo.com/71673549';
        var input2 = 'www.vimeo.com/71673549';

        expect( UrlService.checkEmbeddability(input1).url ).toEqual(output1);
        expect( UrlService.checkEmbeddability(input2).url ).toEqual(output1);
    });

});