
// Filter tests
// ----------------------------------------

describe('Unit: Testing Filters', function() {

    var $filter;

    beforeEach(function () {
        module('ui.common.filters');

        inject(function (_$filter_) {
            $filter = _$filter_;
        });
    });


    // string reversal
    // ----------------------------------------

    it('should reverse the supplied string', function(){

        var test = $filter('reverseString')('hello world'),
            test2 = $filter('reverseString')('0123456789');

        expect(test).toEqual('dlrow olleh');
        expect(test2).toEqual('9876543210');
    });

    // data reversal
    // ----------------------------------------

    it('should reverse the supplied data', function(){

        var test = $filter('reverse')([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
            test2 = $filter('reverse')(['first', 'second', 'third', 'fourth', 'fifth']),
            test3 = $filter('reverse')([['first', 'second'], 'third', 'fourth', 'fifth']),
            test4 = $filter('reverse')([{"item1":"1","item2":"2"}, {"item3":"3","item4":"4"}]),
            test5 = $filter('reverse')([{"item1":"1","item2": {"item11": "11", "item22": "22"}}, {"item3":"3","item4":"4"}]);

        expect(test).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
        expect(test2).toEqual(['fifth', 'fourth', 'third', 'second', 'first']);
        expect(test3).toEqual(['fifth', 'fourth', 'third', ['first', 'second']]);
        expect(test4).toEqual([{"item3":"3","item4":"4"}, {"item1":"1","item2":"2"}]);
        expect(test5).toEqual([{"item3":"3","item4":"4"}, {"item1":"1","item2": {"item11": "11", "item22": "22"}}]);
    });

    // filter unsafe html
    // ----------------------------------------

    it('unsafe html should be stripped', function(){

        var test = $filter('unsafe')('<p><script>alert("hello")</script></p>'),
            test2 = $filter('unsafe')('<p><div<><>.dfeee<br />I am some text<h1></p>');

        expect(test.$$unwrapTrustedValue()).toEqual('<p><script>alert("hello")</script></p>');
        expect(test2.$$unwrapTrustedValue()).toEqual('<p><div<><>.dfeee<br />I am some text<h1></p>');
    });

    // returns a time from/ago based on a timestamp
    // ----------------------------------------

    it('should return a time from/ago string', function(){
        
        var time = new Date();
        var time2 = new Date(); time2.setDate(time2.getDate()-1);
        var time3 = new Date(); time3.setMinutes(time3.getMinutes() - 30);
        var time4 = new Date(); time4.setMinutes(time4.getMinutes() - 1);

        var test = $filter('fromNow')(time);
        var test2 = $filter('fromNow')(time2);
        var test3 = $filter('fromNow')(time3);
        var test4 = $filter('fromNow')(time4);

        expect(test).toEqual('a few seconds ago');
        expect(test2).toEqual('a day ago');
        expect(test3).toEqual('30 minutes ago');
        expect(test4).toEqual('a minute ago');
    });

    // Convert a datestamp to a date/time string
    // ----------------------------------------

    it('should format a date stamp to a nicely formatted date/time string', function(){

        var test1 = $filter('dateTime')('2014-10-21T17:53:22.1119757+11:00');
        var test2 = $filter('dateTime')('1999-01-07T05:55:55.1119757+11:00');

        expect(test1).toEqual('21st Oct 2014, 5:53 pm');
        expect(test2).toEqual('7th Jan 1999, 5:55 am');
    });

    // Convert a datestamp to a concise date/time string
    // ----------------------------------------

    it('should format a date stamp to a nicely formatted date/time string', function(){

        var test1 = $filter('dateTimeShort')('2014-10-21T17:53:22.1119757+11:00');
        var test2 = $filter('dateTimeShort')('1999-01-07T05:55:55.1119757+11:00');

        expect(test1).toEqual('21/10/2014, 5:53 pm');
        expect(test2).toEqual('7/01/1999, 5:55 am');
    });

    // Convert a datestamp to a day
    // ----------------------------------------

    it('should format a date stamp to be the numeric date', function(){

        var test1 = $filter('day')('2014-10-21T17:53:22.1119757+11:00');
        var test2 = $filter('day')('1999-01-07T05:55:55.1119757+11:00');

        expect(test1).toEqual('21');
        expect(test2).toEqual('7');
    });

    // Convert a datestamp to a month
    // ----------------------------------------

    it('should format a date stamp to be the month as a word', function(){

        var test1 = $filter('month')('2014-10-21T17:53:22.1119757+11:00');
        var test2 = $filter('month')('1999-01-07T05:55:55.1119757+11:00');

        expect(test1).toEqual('October');
        expect(test2).toEqual('January');
    });

    // Convert datestamp to an abbreviated month
    // ----------------------------------------

    it('should format a date stamp to be the month as an abbreviated word', function(){

        var test1 = $filter('monthAbbrv')('2014-10-21T17:53:22.1119757+11:00');
        var test2 = $filter('monthAbbrv')('1999-01-07T05:55:55.1119757+11:00');

        expect(test1).toEqual('Oct');
        expect(test2).toEqual('Jan');
    });

    // Convert datestamp to time
    // ----------------------------------------

    it('should format a date stamp to be just the time', function(){

        var test1 = $filter('time')('2014-10-21T17:53:22.1119757+11:00');
        var test2 = $filter('time')('1999-01-07T05:55:55.1119757+11:00');

        expect(test1).toEqual('5:53 PM');
        expect(test2).toEqual('5:55 AM');
    });

    // Convert datestamp to date
    // ----------------------------------------

    it('should format a date stamp to be just the date', function(){

        var test1 = $filter('dateStamp')('2014-10-21T17:53:22.1119757+11:00');
        var test2 = $filter('dateStamp')('1999-01-07T05:55:55.1119757+11:00');

        expect(test1).toEqual('2014-10-21');
        expect(test2).toEqual('1999-01-07');
    });

    // Convert the date to be the end of the dates day
    // ----------------------------------------

    it('should convert the date to be the end of the day', function(){

        var test1 = $filter('endOfDay')('2014-10-21T17:53:22.1119757+11:00');
            test1 = $filter('dateTime')(test1);
        var test2 = $filter('endOfDay')('1999-01-07T05:55:55.1119757+11:00');
            test2 = $filter('dateTime')(test2);        

        expect(test1).toEqual('21st Oct 2014, 11:59 pm');
        expect(test2).toEqual('7th Jan 1999, 11:59 pm');
    });

    // Convert the date to be the end of the dates day
    // ----------------------------------------

    it('should convert the date to be the start of the day', function(){

        var test1 = $filter('startOfDay')('2014-10-21T17:53:22.1119757+11:00');
            test1 = $filter('dateTime')(test1);
        var test2 = $filter('startOfDay')('1999-01-07T05:55:55.1119757+11:00');
            test2 = $filter('dateTime')(test2);        

        expect(test1).toEqual('21st Oct 2014, 12:00 am');
        expect(test2).toEqual('7th Jan 1999, 12:00 am');
    });


    // Localise a date stamp eg. convert an overseas date / time to aus time
    // This also removes all milliseconds from the date stamp
    // ----------------------------------------

    it('should localise a date stamp to AEST and remove milliseconds', function(){

        var test1 = $filter('localise')('2014-10-21T17:53:22.1119757+01:00');
        var test2 = $filter('localise')('1999-01-07T05:55:55.1119757+21:00');

        expect(test1).toEqual('2014-10-22T03:53:22+11:00');
        expect(test2).toEqual('1999-01-06T19:55:55+11:00');
    });

    // Delocalise a date stamp ie. remove any time zone info but return the date as AEST
    // ----------------------------------------

    it('should delocalise a date stamp as AEST', function(){

        var test1 = $filter('delocalise')('2014-10-21T17:53:22.1119757+01:00');
        var test2 = $filter('delocalise')('1999-01-07T05:55:55.1119757+21:00');

        // Take account for whether the server is in DST.
        // JG: FWIW all this AEST conversion stuff is really dodgy and prone to errors - should be using UTC only!
        if (moment().isDST()) {
            expect(test1).toEqual('2014-10-22T03:53:22');
            expect(test2).toEqual('1999-01-06T19:55:55');
        } else {
            expect(test1).toEqual('2014-10-22T02:53:22');
            expect(test2).toEqual('1999-01-06T18:55:55');
        }
    });


    // outputs a percetage
    // ----------------------------------------

    it('should return a percetage of the numbers', function(){

        var test = $filter('percentage')(10/100),
            test2 = $filter('percentage')(17/50),
            test3 = $filter('percentage')(17/51, 3),
            test4 = $filter('percentage')(17/51, 0),
            test5 = $filter('percentage')(1/809, 4),
            test6 = $filter('percentage')(1/809),
            test7 = $filter('percentage')(0/809),
            test8 = $filter('percentage')(1/809, 0),
            test9 = $filter('percentage')(0/0, 0),
            test10 = $filter('percentage')(5231/5231, 0)

        expect(test).toEqual('10%');
        expect(test2).toEqual('34%');
        expect(test3).toEqual('33.333%');
        expect(test4).toEqual('33%');
        expect(test5).toEqual('0.1236%');
        expect(test6).toEqual('< 1%');
        expect(test7).toEqual('0%');
        expect(test8).toEqual('< 1%');
        expect(test9).toEqual('0%');
        expect(test10).toEqual('100%');
    });


    // converts a url to absolute url
    // ----------------------------------------

    it('should return an absolute url path', function(){

        var test = $filter('absoluteUrl')('www.google.com'),
            test2 = $filter('absoluteUrl')('google.com'),
            test3 = $filter('absoluteUrl')('https://www.google.com'),
            test4 = $filter('absoluteUrl')('//google.com'),
            test5 = $filter('absoluteUrl')('http://www.google.com');

        expect(test).toEqual('//www.google.com');
        expect(test2).toEqual('//google.com');
        expect(test3).toEqual('https://www.google.com');
        expect(test4).toEqual('//google.com');
        expect(test5).toEqual('http://www.google.com');
    });  

    // Limit the amount of text in a string and add an ellipsis to the end
    // ----------------------------------------

    it('should limit the amount of text in a string', function(){

        var test = $filter('textLimit')('This is a string', 10),
            test2 = $filter('textLimit')('Another string that is longer', 20);
            test3 = $filter('textLimit')('', 20);
            test4 = $filter('textLimit')('!!@!@#@$##%$$%$^', 10);

        expect(test).toEqual('This is a...');
        expect(test2).toEqual('Another string that...');
        expect(test3).toEqual();
        expect(test4).toEqual('!!@!@#@$##...');
    });

    // Convert HTML to plain text
    // ----------------------------------------

    it('should strip all html from a string', function(){

        var test = $filter('htmlToPlainText')('<p>Sentence</p>'),
            test2 = $filter('htmlToPlainText')('<div><p><i>Word</i></p></div>'),
            test3 = $filter('htmlToPlainText')('<div><!!><o_o><i>Amazing!<i><br><<><hr><p></blink></div>');
            test4 = $filter('htmlToPlainText')('<h2 class="post__title"><a href="/interfacetemplates/dashboard.aspx#/dashbaord/news/2185" class="ng-binding">Test Blog</a></h2>');

        expect(test).toEqual('Sentence');
        expect(test2).toEqual('Word');
        expect(test3).toEqual('Amazing!<<>');
        expect(test4).toEqual('Test Blog');
    });

    // Convert filesize to bytes
    // ----------------------------------------

    it('should convert any file size to bytes', function(){

        var test = $filter('toBytes')('50'),
            test2 = $filter('toBytes')('1567'),
            test3 = $filter('toBytes')('3590'),
            test4 = $filter('toBytes')('89515956'),
            test5 = $filter('toBytes')('54788997458'),
            test6 = $filter('toBytes')('264987974846512');

        expect(test).toEqual('50 Bytes');
        expect(test2).toEqual('2 KB');
        expect(test3).toEqual('4 KB');
        expect(test4).toEqual('85 MB');
        expect(test5).toEqual('51 GB');
        expect(test6).toEqual('241 TB');
    });

    // Cut a string to a shorter length
    // ----------------------------------------

    it('should be able to return the last x characters of a string', function(){

        var test1 = $filter('fileExtension')('Testing.pdf'),
            test2 = $filter('fileExtension')('Some other filename.docx'),
            test3 = $filter('fileExtension')('Some long extention.manifest'),
            test4 = $filter('fileExtension')('I have a few.. dots.pdf');
            test5 = $filter('fileExtension')('..I have even... more dots...xlsx');

        expect(test1).toEqual('pdf');
        expect(test2).toEqual('docx');
        expect(test3).toEqual('manifest');
        expect(test4).toEqual('pdf');
        expect(test5).toEqual('xlsx');
    });

    // Cut a string to a shorter length
    // ----------------------------------------

    it('should be able to cut a string whilst allowing for only whole words and a custom tail on the end of a string', function(){

        var test1 = $filter('cut')('Testing a string with a few words', true, 22),
            test2 = $filter('cut')('Testing a string with a few words', true, 23),
            test3 = $filter('cut')('Testing a string with a few words', true, 28, '!'),
            test4 = $filter('cut')('Antidisestablishmentarianism', true, 10),
            test5 = $filter('cut')('Antidisestablishmentarianism', false, 15),
            test6 = $filter('cut')('A few words', false, 10, ' and a few more words'),
            test7 = $filter('cut')('One word and another biiiiigggggonnnnneeeee', true, 40, '');

        expect(test1).toEqual('Testing a string with ...');
        expect(test2).toEqual('Testing a string with ...');
        expect(test3).toEqual('Testing a string with a few!');
        expect(test4).toEqual('Antidisest ...');
        expect(test5).toEqual('Antidisestablis ...');
        expect(test6).toEqual('A few word and a few more words');
        expect(test7).toEqual('One word and another');
    });
  

});
