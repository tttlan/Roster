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

.thenOpen(baseURL + 'dashboard.html#/dashboard/directory').then(function(){    

    // Set folder url for this page
    folder = 'directory/' + folder;
    
    // Directory header
    casper.then(function(){ 
        phantomcss.screenshot('.page__header', folder + 'Header');
    })   

        // Directory listing item
        .then(function(){ 
            casper.waitForSelector('.directory__table tr', function() {            
                phantomcss.screenshot('.directory__table tbody tr:first-child', folder + 'Directory item');
            })
        })  
        
        // Directory alphabet panel
        .then(function(){ 
            phantomcss.screenshot('.directory__alphabet', folder + 'Listing alphabet panel');
        }) 

        .then(function(){ 
            this.click('.directory-search__search-by a');
            casper.waitForSelector('.drawer__wrapper', function() {
                phantomcss.screenshot('.drawer__wrapper', folder + 'Listing filter panel'); 
            });
        })

        .then(function(){             
            this.click('.drawer__close');
            casper.waitForSelector('.directory__member', function(){
                this.click('.directory__table tr:first-child .directory__member');
            })
            casper.waitForSelector('.vcard', function() {
                phantomcss.screenshot('.vcard', folder + 'Member info'); 
            });            
        })

        .then(function(){
            this.click('.drawer__close');
            this.sendKeys('.page__header input', 'Brad Pitt');
            phantomcss.screenshot('.page__header', folder + 'Header with input');
        })         

})

.thenOpen(baseURL + 'dashboard.html#/groups/11845').then(function(){  

    casper.then(function(){ 
        phantomcss.screenshot('.page__aside .panels .panel:nth-of-type(1)', folder + 'Groups sidebar profile photo');
    }) 

        .then(function(){ 
            phantomcss.screenshot('.page__aside .panels .panel:nth-of-type(2)', folder + 'Groups sidebar group details');
        }) 

        .then(function(){ 
            phantomcss.screenshot('.page__aside .panels .panel:nth-of-type(3)', folder + 'Groups sidebar other groups');
        }) 

        // Reset folder variable
        .then(function(){
            folder = folder.replace('directory/', '');
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
