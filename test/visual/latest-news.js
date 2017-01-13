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

.thenOpen(baseURL + 'dashboard.html#/dashboard/news').then(function(){    

    // Set folder url for this page
    folder = 'latest-news/' + folder;

    // Open the secondary nav
    casper.then(function(){ 
        casper.waitForSelector('.blog--sidebar', function() {
            phantomcss.screenshot('.blog--sidebar', folder + 'Blog sidebar');
        });
    })  

        .then(function(){
            casper.waitForSelector('.blog--posts', function() {
                phantomcss.screenshot('.blog--posts .blog__item:first-of-type', folder + 'Single blog post');
            });
        }) 

        .then(function(){
            phantomcss.screenshot('.blog--posts .blog__item:nth-of-type(5)', folder + 'Single blog post with image');
        }) 

        .then(function(){
            phantomcss.screenshot('.page__content', folder + 'User nav');
        })     

})

.thenOpen(baseURL + 'dashboard.html#/dashboard/news/3332').then(function(){    

    // The body of the news post
    casper.then(function(){ 
        phantomcss.screenshot('.page--white .page__wrapper', folder + 'Blog post body');
    }) 

         // The comments under the news post
        .then(function(){ 
            this.mouse.move('.comment');
            phantomcss.screenshot('.page + .page .page__wrapper', folder + 'Blog post comments');
        })

        // The comments under the news post
        .then(function(){ 
            this.click('.blog__more-details > a');
            this.click('.blog__more-details .submenu li:last-child a');
            phantomcss.screenshot('.drawer__dialog', folder + 'Blog post likes modal');
        })

})

.thenOpen(baseURL + 'dashboard.html#/dashboard/news/create').then(function(){  

    // Rich text
    casper.then(function(){ 
        phantomcss.screenshot('.post__body', folder + 'Create news - rich text');
    }) 

        // Breadcrumb
        .then(function(){ 
            phantomcss.screenshot('.nav--breadcrumb', folder + 'Create news - breadcrumb');
        }) 

        // Editable title
        .then(function(){ 
            this.sendKeys('.nav--breadcrumb + textarea', 'I am a page title');
            phantomcss.screenshot('.nav--breadcrumb + textarea', folder + 'Create news - title');
        }) 

        // Sidebar
        .then(function(){ 
            this.click('.field__toggle label'); // Toggle a switch
            this.click('.panel__fieldset .form__field:nth-of-type(3) > p > a'); // Open the publish panel
            phantomcss.screenshot('.page__aside', folder + 'Create news - sidebar');
        })

        .then(function(){ 
            this.click('.panel__heading-icon');
            phantomcss.screenshot('.drawer__wrapper', folder + 'Create news - modal categories');
        })

        .then(function(){ 
            this.click('.panel__fieldset .form__field:nth-of-type(4) > p > a'); // Open the groups modal
            casper.waitForSelector('.modal__content', function() {
                this.click('.modal__content input[type=checkbox]');
                phantomcss.screenshot('.modal__main', folder + 'Create news - modal groups');
            });
        })

        .then(function(){ 
            this.click('.modal__close'); // Close the modal            
        })

        // Reset folder variable
        .then(function(){
            folder = folder.replace('latest-news/', '');
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
