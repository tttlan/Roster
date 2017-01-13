
// Filter tests
// ----------------------------------------

describe('Unit: Testing Filters', function() {

    var $filter, provide, browserUtcOffset, browserUtcDstOffset, browserJanIsDst
        ,profileUtcOffset, profileUtcDstOffset, profileJanIsDst;

    //Some constants
    var MELBOURNE_TZ = 'Australia/Melbourne', PERTH_TZ = 'Australia/Perth';

    beforeAll(function() {
        // Figure out the DST offsets of the browser these tests are running in
        // based on the assumption that in most regions of the world jan/jun are either summer/winter or visa versa.
        var jan = moment(new Date(0)); //epoch
        var juneIsh = moment(new Date(0)).add(6, 'month');
        if(jan.isDST() && !juneIsh.isDST()){
            browserJanIsDst = true;
            browserUtcDstOffset = jan.format('ZZ');
            browserUtcOffset = juneIsh.format('ZZ');
            console.log("Browser TZ: Jan is DST with UTC offset " + browserUtcDstOffset + " and June is standard time with offset " + browserUtcOffset)
        } else if (!jan.isDST() && juneIsh.isDST()) {
            browserJanIsDst = false;
            browserUtcOffset = jan.format('ZZ');
            browserUtcDstOffset = juneIsh.format('ZZ');
            console.log("Browser TZ: Jan is standard time with UTC offset " + browserUtcOffset + " and June is DST with offset " + browserUtcDstOffset)
        } else if (!jan.isDST() && !juneIsh.isDST()) {
            browserUtcOffset = browserUtcDstOffset = jan.format('ZZ');
            console.log("Browser TZ: No DST in this region - probably something to do with fading curtains. standard offset" + browserUtcOffset)
        } else {
            throw new Error("Cannot determine UTC offsets for the test browser.")
        }

        // Figure out the DST offsets of profile tz by forcing profile tz to one that is well known.
        module(function($provide){
            $provide.constant(MELBOURNE_TZ, bool);
        });
        profileUtcOffset = '+1000';
        profileUtcDstOffset = '+1100';
        profileJanIsDst = true;


    });

    beforeEach(function () {
        module('sherpa');
        module(function($provide){
            provide = $provide
        });

        inject(function (_$filter_) {
            $filter = _$filter_;
        });
    });

    function useProfileTz(bool) {
        provide.constant('USE_PROFILE_TZ', bool);
    }

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

    describe('\'dateTime\' filter', function() {

        it('should format a date stamp to a nicely formatted date/time string using browser tz offset', function(){

            var jan = '1999-01-01T05:55:55.1119757', jul = '2014-07-01T17:53:22.1119757';
            useProfileTz(false);

            if(browserJanIsDst) {
                jul += browserUtcOffset;
                jan += browserUtcDstOffset;
            } else {
                jul += browserUtcDstOffset;
                jan += browserUtcOffset;
            }
            expect($filter('dateTime')(jul)).toEqual('1st Jul 2014, 5:53 pm');
            expect($filter('dateTime')(jan)).toEqual('1st Jan 1999, 5:55 am');
        });

        it('should format a date stamp to a nicely formatted date/time string using profile tz', function(){

            var jan = '1999-01-01T05:55:55.1119757', jul = '2014-07-01T17:53:22.1119757';
            useProfileTz(true);

            if(profileJanIsDst) {
                jul += profileUtcOffset;
                jan += profileUtcDstOffset;

            } else {
                jul += profileUtcDstOffset;
                jan += profileUtcOffset;

            }
            expect($filter('dateTime')(jul)).toEqual('1st Jul 2014, 5:53 pm');
            expect($filter('dateTime')(jan)).toEqual('1st Jan 1999, 5:55 am');
        });

        it('should format a date stamp to a nicely formatted date/time string using passed tz', function(){
                expect($filter('dateTime')('2014-07-01T17:53:22.1119757+1000', PERTH_TZ)).toEqual('1st Jul 2014, 3:53 pm');
                expect($filter('dateTime')('1999-01-01T05:55:55.1119757+1100', PERTH_TZ)).toEqual('1st Jan 1999, 2:55 am');
        });
    });

    // Convert a datestamp to a concise date/time string
    // ----------------------------------------
    describe('\'dateTimeShort\' filter', function() {

        it('should format a date stamp to a nicely formatted date/time string using browser tz offset', function(){

            var jan = '1999-01-01T05:55:55.1119757', jul = '2014-07-01T17:53:22.1119757';
            useProfileTz(false);

            if(browserJanIsDst) {
                jul += browserUtcOffset;
                jan += browserUtcDstOffset

            } else {
                jul += browserUtcDstOffset;
                jan += browserUtcOffset;

            }
            expect($filter('dateTimeShort')(jul)).toEqual('1/07/2014, 5:53 pm');
            expect($filter('dateTimeShort')(jan)).toEqual('1/01/1999, 5:55 am');
        });

        it('should format a date stamp to a nicely formatted date/time string using profile tz', function(){

            var jan = '1999-01-01T05:55:55.1119757', jul = '2014-07-01T17:53:22.1119757';
            useProfileTz(true);

            if(profileJanIsDst) {
                jul += profileUtcOffset;
                jan += profileUtcDstOffset

            } else {
                jul += profileUtcDstOffset;
                jan += profileUtcOffset;

            }
            expect($filter('dateTimeShort')(jul)).toEqual('1/07/2014, 5:53 pm');
            expect($filter('dateTimeShort')(jan)).toEqual('1/01/1999, 5:55 am');
        });

        it('should format a date stamp to a nicely formatted date/time string using passed tz', function(){
            expect($filter('dateTimeShort')('2014-07-01T17:53:22.1119757+1000', PERTH_TZ)).toEqual('1/07/2014, 3:53 pm');
            expect($filter('dateTimeShort')('1999-01-01T05:55:55.1119757+1100', PERTH_TZ)).toEqual('1/01/1999, 2:55 am');
        });

    });
    // Convert a datestamp to a day
    // ----------------------------------------
    describe('\'day\' filter', function() {

        it('should format a date stamp to be the numeric date using browser tz offset', function(){

            var jan = '1999-01-01T23:53:22.1119757', jul = '2014-07-01T01:53:22.1119757';
            useProfileTz(false);

            if(browserJanIsDst) {
                jul += browserUtcOffset;
                jan += browserUtcDstOffset

            } else {
                jul += browserUtcDstOffset;
                jan += browserUtcOffset;

            }
            expect($filter('day')(jul)).toEqual('1');
            expect($filter('day')(jan)).toEqual('1');
        });

        it('should format a date stamp to be the numeric date using profile tz', function(){

            var jan = '1999-01-01T23:53:22.1119757', jul = '2014-07-01T01:53:22.1119757';
            useProfileTz(true);

            if(profileJanIsDst) {
                jul += profileUtcOffset;
                jan += profileUtcDstOffset

            } else {
                jul += profileUtcDstOffset;
                jan += profileUtcOffset;

            }
            expect($filter('day')(jul)).toEqual('1');
            expect($filter('day')(jan)).toEqual('1');
        });

        it('should format a date stamp to be the numeric date using passed tz', function(){
            expect($filter('day')('2014-07-01T01:53:22.1119757+1000', PERTH_TZ)).toEqual('30'); //still the day before in Perth
            expect($filter('day')('1999-01-01T05:55:55.1119757+1100', PERTH_TZ)).toEqual('1');
        });

    });

    // Convert a datestamp to a month
    // ----------------------------------------
    describe('\'month\' filter', function() {

        it('should format a date stamp to be the month as a word using browser tz offset', function(){

            var jan = '1999-01-01T23:53:22.1119757', jul = '2014-07-01T01:53:22.1119757';
            useProfileTz(false);

            if(browserJanIsDst) {
                jul += browserUtcOffset;
                jan += browserUtcDstOffset

            } else {
                jul += browserUtcDstOffset;
                jan += browserUtcOffset;

            }
            expect($filter('month')(jul)).toEqual('July');
            expect($filter('month')(jan)).toEqual('January');
        });

        it('should format a date stamp to be the month as a word using profile tz', function(){

            var jan = '1999-01-01T23:53:22.1119757', jul = '2014-07-01T01:53:22.1119757';
            useProfileTz(true);

            if(profileJanIsDst) {
                jul += profileUtcOffset;
                jan += profileUtcDstOffset

            } else {
                jul += profileUtcDstOffset;
                jan += profileUtcOffset;

            }
            expect($filter('month')(jul)).toEqual('July');
            expect($filter('month')(jan)).toEqual('January');
        });

        it('should format a date stamp to be the month as a word using passed tz', function(){
            expect($filter('month')('2014-07-01T01:53:22.1119757+1000', PERTH_TZ)).toEqual('June'); //still June in Perth
            expect($filter('month')('1999-01-01T05:55:55.1119757+1100', PERTH_TZ)).toEqual('January');
        });

    });

    // Convert datestamp to an abbreviated month
    // ----------------------------------------
    describe('\'monthAbbrv\' filter', function() {

        it('should format a date stamp to be the month as an abbreviated word using browser tz offset', function(){

            var jan = '1999-01-01T23:53:22.1119757', jul = '2014-07-01T01:53:22.1119757';
            useProfileTz(false);

            if(browserJanIsDst) {
                jul += browserUtcOffset;
                jan += browserUtcDstOffset

            } else {
                jul += browserUtcDstOffset;
                jan += browserUtcOffset;

            }
            expect($filter('monthAbbrv')(jul)).toEqual('Jul');
            expect($filter('monthAbbrv')(jan)).toEqual('Jan');
        });

        it('should format a date stamp to be the month as an abbreviated word using profile tz', function(){

            var jan = '1999-01-01T23:53:22.1119757', jul = '2014-07-01T01:53:22.1119757';
            useProfileTz(true);

            if(profileJanIsDst) {
                jul += profileUtcOffset;
                jan += profileUtcDstOffset

            } else {
                jul += profileUtcDstOffset;
                jan += profileUtcOffset;

            }
            expect($filter('monthAbbrv')(jul)).toEqual('Jul');
            expect($filter('monthAbbrv')(jan)).toEqual('Jan');
        });

        it('should format a date stamp to be the month as an abbreviated word using passed tz', function(){
            expect($filter('monthAbbrv')('2014-07-01T01:53:22.1119757+1000', PERTH_TZ)).toEqual('Jun'); //still June in Perth
            expect($filter('monthAbbrv')('1999-01-01T05:55:55.1119757+1100', PERTH_TZ)).toEqual('Jan');
        });

    });

    // Convert datestamp to time
    // ----------------------------------------
    describe('\'time \' filter', function() {

        it('should format a date stamp to be the time using browser tz offset', function(){

            var jan = '1999-01-01T23:53:22.1119757', jul = '2014-07-01T01:53:22.1119757';
            useProfileTz(false);

            if(browserJanIsDst) {
                jul += browserUtcOffset;
                jan += browserUtcDstOffset

            } else {
                jul += browserUtcDstOffset;
                jan += browserUtcOffset;

            }
            expect($filter('time')(jul)).toEqual('1:53 AM');
            expect($filter('time')(jan)).toEqual('11:53 PM');
        });

        it('should format a date stamp to be the time using profile tz', function(){

            var jan = '1999-01-01T23:53:22.1119757', jul = '2014-07-01T01:53:22.1119757';
            useProfileTz(true);

            if(profileJanIsDst) {
                jul += profileUtcOffset;
                jan += profileUtcDstOffset

            } else {
                jul += profileUtcDstOffset;
                jan += profileUtcOffset;

            }
            expect($filter('time')(jul)).toEqual('1:53 AM');
            expect($filter('time')(jan)).toEqual('11:53 PM');
        });

        it('should format a date stamp to be the time using passed tz', function(){
            expect($filter('time')('2014-07-01T01:53:22.1119757+1000', PERTH_TZ)).toEqual('11:53 PM'); //Day before in Perth
            expect($filter('time')('1999-01-01T05:55:55.1119757+1100', PERTH_TZ)).toEqual('2:55 AM');
        });

    });

    // Convert datestamp to date
    // ----------------------------------------
    describe('\'dateStamp \' filter', function() {

        it('should format a date stamp to be just the date using browser tz offset', function(){

            var jan = '1999-01-01T23:53:22.1119757', jul = '2014-07-01T01:53:22.1119757';
            useProfileTz(false);

            if(browserJanIsDst) {
                jul += browserUtcOffset;
                jan += browserUtcDstOffset

            } else {
                jul += browserUtcDstOffset;
                jan += browserUtcOffset;

            }
            expect($filter('dateStamp')(jul)).toEqual('2014-07-01');
            expect($filter('dateStamp')(jan)).toEqual('1999-01-01');
        });

        it('should format a date stamp to be just the date using profile tz', function(){

            var jan = '1999-01-01T23:53:22.1119757', jul = '2014-07-01T01:53:22.1119757';
            useProfileTz(true);

            if(profileJanIsDst) {
                jul += profileUtcOffset;
                jan += profileUtcDstOffset

            } else {
                jul += profileUtcDstOffset;
                jan += profileUtcOffset;

            }
            expect($filter('dateStamp')(jul)).toEqual('2014-07-01');
            expect($filter('dateStamp')(jan)).toEqual('1999-01-01');
        });

        it('should format a date stamp to be just the date using passed tz', function(){
            expect($filter('dateStamp')('2014-07-01T01:53:22.1119757+1000', PERTH_TZ)).toEqual('2014-06-30'); //Day before in Perth
            expect($filter('dateStamp')('1999-01-01T05:55:55.1119757+1100', PERTH_TZ)).toEqual('1999-01-01');
        });

    });

    // Convert the date to be the end of the dates day
    // ----------------------------------------

    describe('\'endOfDay\' filter', function() {

        it('should convert the date to the end of the day using browser tz offset', function(){

            var jan = '1999-01-01T05:55:55.1119757', jul = '2014-07-01T17:53:22.1119757';
            useProfileTz(false);

            if(browserJanIsDst) {
                jul += browserUtcOffset;
                jan += browserUtcDstOffset;
            } else {
                jul += browserUtcDstOffset;
                jan += browserUtcOffset;
            }
            expect($filter('dateTime')($filter('endOfDay')(jul))).toEqual('1st Jul 2014, 11:59 pm');
            expect($filter('dateTime')($filter('endOfDay')(jan))).toEqual('1st Jan 1999, 11:59 pm');
        });

        it('should convert the date to the end of the day using profile tz', function(){

            var jan = '1999-01-01T05:55:55.1119757', jul = '2014-07-01T17:53:22.1119757';
            useProfileTz(true);

            if(profileJanIsDst) {
                jul += profileUtcOffset;
                jan += profileUtcDstOffset;

            } else {
                jul += profileUtcDstOffset;
                jan += profileUtcOffset;

            }
            expect($filter('dateTime')($filter('endOfDay')(jul))).toEqual('1st Jul 2014, 11:59 pm');
            expect($filter('dateTime')($filter('endOfDay')(jan))).toEqual('1st Jan 1999, 11:59 pm');
        });

        it('should convert the date to the end of the day using passed tz', function(){
            expect($filter('dateTime')($filter('endOfDay')('2014-07-01T01:53:22.1119757+1000', PERTH_TZ), PERTH_TZ)).toEqual('30th Jun 2014, 11:59 pm'); //Previous day in perth
            expect($filter('dateTime')($filter('endOfDay')('1999-01-01T05:55:55.1119757+1100', PERTH_TZ), PERTH_TZ)).toEqual('1st Jan 1999, 11:59 pm');
        });
    });

    // Convert the date to be the end of the dates day
    // ----------------------------------------

    describe('\'startOfDay\' filter', function() {

        it('should convert the date to the start of the day using browser tz offset', function(){

            var jan = '1999-01-01T05:55:55.1119757', jul = '2014-07-01T17:53:22.1119757';
            useProfileTz(false);

            if(browserJanIsDst) {
                jul += browserUtcOffset;
                jan += browserUtcDstOffset;
            } else {
                jul += browserUtcDstOffset;
                jan += browserUtcOffset;
            }
            expect($filter('dateTime')($filter('startOfDay')(jul))).toEqual('1st Jul 2014, 12:00 am');
            expect($filter('dateTime')($filter('startOfDay')(jan))).toEqual('1st Jan 1999, 12:00 am');
        });

        it('should convert the date to the start of the day using profile tz', function(){

            var jan = '1999-01-01T05:55:55.1119757', jul = '2014-07-01T17:53:22.1119757';
            useProfileTz(true);

            if(profileJanIsDst) {
                jul += profileUtcOffset;
                jan += profileUtcDstOffset;

            } else {
                jul += profileUtcDstOffset;
                jan += profileUtcOffset;

            }
            expect($filter('dateTime')($filter('startOfDay')(jul))).toEqual('1st Jul 2014, 12:00 am');
            expect($filter('dateTime')($filter('startOfDay')(jan))).toEqual('1st Jan 1999, 12:00 am');
        });

        it('should convert the date to the start of the day using passed tz', function(){
            expect($filter('dateTime')($filter('startOfDay')('2014-07-01T01:53:22.1119757+1000', PERTH_TZ), PERTH_TZ)).toEqual('30th Jun 2014, 12:00 am'); //Previous day in perth
            expect($filter('dateTime')($filter('startOfDay')('1999-01-01T05:55:55.1119757+1100', PERTH_TZ), PERTH_TZ)).toEqual('1st Jan 1999, 12:00 am');
        });
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
            test2 = $filter('textLimit')('Another string that is longer', 20),
            test3 = $filter('textLimit')('', 20),
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
            test3 = $filter('htmlToPlainText')('<div><!!><o_o><i>Amazing!<i><br><<><hr><p></blink></div>'),
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
