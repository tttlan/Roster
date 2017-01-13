/*
    Require and initialise PhantomCSS module
    Paths are relative to CasperJs directory
*/
var phantomcss = require('PhantomCSS/phantomcss.js');

phantomcss.init({
    screenshotRoot: '../screenshots/baseline/',
    failedComparisonsRoot: '../screenshots/test-results/failures/',
    comparisonResultRoot: '../screenshots/test-results/',
    //cleanupComparisonImages: true,
    addLabelToFailedImage: true,
    outputSettings: {
        errorColor: {
            red: 255,
            green: 0,
            blue: 255
        },
        errorType: 'movement',
        transparency: 0.3
    },
    mismatchTolerance: 0.05,
    fileNameGetter: fileNameGetter
});

function fileNameGetter(root, fileName){
    var name;

    fileName = fileName || "screenshot";
    //name = root + fs.separator + fileName + "_" + _count++;
    name = root + fs.separator + fileName;

    if(fs.isFile(name+'.png')){
        return name+'.diff.png';
    } else {
        return name+'.png';
    }
}


var casper = require('casper').create({
    verbose: true,
    logLevel: "debug",
    onError: function(error) {
        casper.log(error)
    },
    waitTimeout: 15000
})

var viewportSizes = [
    [320,568], // iphone 5
    [360,640], // nexus 4 / samsung s4 / htc one
    [375,667], // iphone 6
    [414,736], // iphone 6 plus
    [966,604], // nexus 7 landscape
    [604,966], // nexus 7 portrait
    [768,1024], // ipad portrait
    [1024,768], // ipad landscape
    [1280,800], // desktop / nexus 10
    [1440,900] // large desktop
];

var errors = []; // Used to collect errors to be reported later

var baseURL = 'http://localhost/interfaceTemplates/';

casper.start()

    .open('https://api.sherpanetwork.com.au/api/identity/auth', {
        method: 'POST',
        data: {
            'UserName': 'admin',
            'Password':  'FarFox2325',
            'RememberMe': true,
            'NetworkId': 937,
            'Host': 'http://localhost/'
        }
    })

    .then(function() {

        var token = this.page.plainText; // Taken login token from the API
        token = token.replace(/["']/g, ""); // Strip quotes

        // Create a cookie with the token
        phantom.addCookie({
              domain: 'localhost',
              name: 'Sherpa.aspxauth',
              value: token
        });

        // Create a cookie so we know to switch to a static API in our interface templates
        phantom.addCookie({
              domain: 'localhost',
              name: 'phantom',
              value: true
        })
    })

    .eachThen(viewportSizes, function(viewportSize) {

        // set two vars for the viewport height and width as we loop through each item in the viewport array
        var width = viewportSize.data[0],
            height = viewportSize.data[1],
            folder = width + 'x' + height + '/';

        casper.viewport(width, height) // Set viewport for this iteration

        // Specific test code starts here

/* 
 * This test contains tests for all common page components such as the nav and loading indicators 
 */

casper.thenOpen(baseURL + 'dashboard.html#/dashboard').then(function(){
    
    // Set folder to dashboard
    folder = 'dashboard/' + folder;

    // Top nav
    casper.then(function(){
        phantomcss.screenshot('.header', 0, '.header__logo', folder + 'Top nav');
    })

        // Secondary nav compacted - triggered when page is scrolled down
        /*
            Enable this when the scrolling function has been added to the casper package within Phantom CSS
        */
        //.then(function(){
            //this.scrollTo(0, 200);
            //phantomcss.screenshot('.header__mainNavInner', folder + 'Top nav compact');
        //})

        // Open the secondary nav
        .then(function(){
            //this.scrollTo(0, 0);
            this.click('.header__navToggle > a'); // Open the nav        
            phantomcss.screenshot('.header__mainNavInner', folder + 'Secondary nav');
        })  

        .then(function(){
            this.click('.header__user > a');
            phantomcss.screenshot('.header__user .submenu', folder + 'User nav');
        })

        .then(function(){
            this.click('.header__navToggle > a');
            phantomcss.screenshot('.post--create', folder + 'Post create');
        })

        .then(function(){
            this.click('.header__navToggle > a'); // Close user menu                    
            this.click('.post--create textarea');
            phantomcss.screenshot('.post--create', folder + 'Post create - opened');
        })

        .then(function(){
            this.sendKeys('.post--create textarea', 'Testing some text in the box');
            phantomcss.screenshot('.post--create', folder + 'Post create - with text');  
        })
        
        .then(function(){
            phantomcss.screenshot('.shift__widget', folder + 'Shift widget');
        })

        .then(function(){
            this.click('.shift__widget .shift:nth-of-type(5) > a'); // Open thje modal
            casper.waitForSelector('.drawer__dialog', function() { // Wait for the server to return data
                phantomcss.screenshot('.drawer__dialog .roster__header', folder + 'Shift modal header');
                phantomcss.screenshot('.drawer__dialog .roster__shifts', folder + 'Shift modal body');
            });                    
        })

        .then(function(){
            this.click('.drawer__close'); // Close the modal
            phantomcss.screenshot('.panels .panel:first-child', folder + 'Events widget');
        })

        .then(function(){
            phantomcss.screenshot('.panels .panel:last-child', folder + 'Birthday widget');
        })

        // Screenshot of the entire RHS panel
        .then(function(){
            phantomcss.screenshot('.page__aside', folder + 'Page aside');
        }) 

        .then(function(){
            phantomcss.screenshot('.feed-posts .post:nth-of-type(2)', folder + 'Newsfeed post 1');
        })

        .then(function(){
            this.click('.feed-posts .post:nth-of-type(2) .post__options > a'); // Open post sub menu
            phantomcss.screenshot('.feed-posts .post:nth-of-type(2) .submenu', folder + 'Newsfeed post 1 submenu');
        })

        .then(function(){
            this.click('.feed-posts .post:nth-of-type(2) .post__options > a'); // Close post sub menu
            phantomcss.screenshot('.feed-posts .post:nth-of-type(3)', folder + 'Newsfeed post 2');
        })

        .then(function(){
            this.click('.feed-posts .post:nth-of-type(3) .post__footer-item:last-of-type > a'); // Expand comment box
            phantomcss.screenshot('.feed-posts .post:nth-of-type(3) .comments', folder + 'Newsfeed write comment box');
        })

        .then(function(){
            phantomcss.screenshot('.feed-posts .post:nth-of-type(3) .post-line-break', folder + 'Newsfeed post linebreak');
        }) 

        .then(function(){
            phantomcss.screenshot('.feed-posts .post:nth-of-type(4)', folder + 'Newsfeed post 3');
        }) 

        // Test messages that display when there is no content, a load error or a loading indicator
        .then(function(){
            this.evaluate(function() {
                $('.feed-posts .message--empty').removeClass('ng-hide');
            });
            phantomcss.screenshot('.feed-posts .message--empty', folder + 'No newsfeed posts');
        })

        .then(function(){
            this.evaluate(function() {
                $('.feed-posts .message--retry').parent().removeClass('ng-hide');
            });
            phantomcss.screenshot('.feed-posts .message--retry', folder + 'Newsfeed retry message');
        })

        .then(function(){
            this.evaluate(function() {
                $('.panel--shift .message--small').removeClass('ng-hide');
            });
            phantomcss.screenshot('.panel--shift .message--small', folder + 'No shifts');
        })

        .then(function(){
            this.evaluate(function() {
                $('.panel--shift .message--retry').parent().removeClass('ng-hide');
            });
            phantomcss.screenshot('.panel--shift .message--retry', folder + 'Retry loading shifts');
        })

        // Screenshot of the entire LHS col - use this to see if spacing between posts changed
        .then(function(){
            phantomcss.screenshot('.page__content', folder + 'Page content');
        }) 

        // Screenshot of the entire page - use this to see if spacing around the page has changed
        .then(function(){
            phantomcss.screenshot('.page', folder + 'Entire page');
        }) 

        // Reset folder variable
        .then(function(){
            folder = folder.replace('dashboard/', '');
        })

})
    }) // End loop around screen sizes
    
    .then(function(){
            
        // compare the screenshots generated in this run only
        phantomcss.compareSession();
    })
    
    .run(function(){

        console.log('\Finished testong.');
        phantom.exit(phantomcss.getExitStatus());


        if (errors.length > 0) {
            this.echo(errors.length + ' Javascript errors found', "WARNING");
        } else {
            this.echo(errors.length + ' Javascript errors found', "INFO");
        }
    
    })

        // Log all errors
    .on('remote', function(message) {
        this.echo('remote message caught: ' + message);
    })

    .on("page.error", function(msg, trace) {
        this.echo("Error:    " + msg, "ERROR");
        this.echo("file:     " + trace[0].file, "WARNING");
        this.echo("line:     " + trace[0].line, "WARNING");
        this.echo("function: " + trace[0]["function"], "WARNING");
        errors.push(msg);
    })
