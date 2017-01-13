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
.thenOpen(baseURL + 'training.html#/training').then(function(){  

    // Set folder url for this page
    folder = 'training/' + folder;
    
    // Training h1 header
    casper.then(function(){ 
        phantomcss.screenshot('h1', folder + 'H1 heading');
    }) 

        .then(function(){ 
            phantomcss.screenshot('.nav--filter', folder + 'Filter');
        }) 

        .then(function(){
            phantomcss.screenshot('.training-courses', folder + 'Course listing');
        })
})


.thenOpen(baseURL + 'training.html#/training/manage').then(function(){  

    // Filter and button
    casper.then(function(){ 
        phantomcss.screenshot('.page__options', folder + 'Page filter and button');
    }) 

        // Table
        .then(function(){ 
            casper.waitForSelector('.table-large tbody', function() {
                phantomcss.screenshot('.table-large thead', folder + 'Large table head');
                phantomcss.screenshot('.table-large tbody', folder + 'Large table body');
            });
        }) 

        // When you expand a table row
        .then(function(){
            this.click('.table-large tbody tr:first-child .icon--block-plus');
            casper.waitForSelector('.table-list__row', function() {
                phantomcss.screenshot('.table-list__expandable', folder + 'Subject');
            });  
        })

        // Show the loading indicator so we can take a screenshot
        .then(function(){
            this.evaluate(function() {
                $('.loading-spinner__container').removeClass('ng-hide');
            });
            phantomcss.screenshot('.loading-spinner__container', folder + 'Table loading indicator');
        })

})

// Create a course
.thenOpen(baseURL + 'training.html#/training/manage/create').then(function(){ 

    casper.then(function(){ 
        casper.waitForSelector('.page__content input[type=text]', function() {
            phantomcss.screenshot('.page__content .segment .form__field:nth-of-type(1)', folder + 'Standard input');
        });
    })

        .then(function(){ 
            phantomcss.screenshot('.page__content .segment .form__field:nth-of-type(2)', folder + 'Standard textarea');
        })

        .then(function(){ 
            phantomcss.screenshot('.page__content .segment .form__editor', folder + 'Rich text with basic toolbar');
        }) 

        .then(function(){ 
            phantomcss.screenshot('.page__content .segment .form__fields', folder + 'Date inputs 2 cols');
        }) 

        .then(function(){ 
            phantomcss.screenshot('.page__content .segment .field__checkbox', folder + 'Standard checkbox');
        })

})

// Add subjects to a course
.thenOpen(baseURL + 'training.html#/training/manage/645/add_subjects').then(function(){ 

    casper.then(function(){ 
        phantomcss.screenshot('.selectList', folder + 'Select list');
    }) 

        .then(function(){ 
            phantomcss.screenshot('.progress-list', folder + 'Progress list, 1 of 3');
        }) 

        .then(function(){ 
            phantomcss.screenshot('.button-group', folder + 'Button group positive');
        })

})

// Add groups to a course
.thenOpen(baseURL + 'training.html#/training/manage/645/add_groups').then(function(){ 

    casper.then(function(){ 
        phantomcss.screenshot('.progress-list', folder + 'Progress list, 2 of 3');
    }) 

        .then(function(){ 
            phantomcss.screenshot('.page__content .segment .form__field:last-of-type', folder + 'Tag input');
        }) 

        .then(function(){ 
            this.sendKeys('.page__content .segment .form__field:last-of-type input[type=text]', 'a');
            casper.waitForSelector('.typeahead__list', function() {
                phantomcss.screenshot('.typeahead__list', folder + 'Tag input open');
            });
        }) 

        .then(function(){ 
            phantomcss.screenshot('.button-group', folder + 'Button group caution');
        })

})

// Manage subjects
.thenOpen(baseURL + 'training.html#/training/manage/subjects').then(function(){ 

    casper.then(function(){ 
        casper.waitForSelector('.table td', function() {
            phantomcss.screenshot('.table thead', folder + 'Regular table head');
        });
    }) 

        .then(function(){ 
            phantomcss.screenshot('.table tbody tr:first-child', folder + 'Regular table row');
        }) 

        .then(function(){ 
            phantomcss.screenshot('.table tbody tr:nth-child(2)', folder + 'Regular table row 2');
        }) 

})

// Create subjects
.thenOpen(baseURL + 'training.html#/training/manage/subjects/create').then(function(){ 

    casper.then(function(){ 
        phantomcss.screenshot('.page__content .segment .form__field:nth-of-type(4)', folder + 'Upload tabs');
    }) 

        .then(function(){ 
            this.click('.page__content .segment .form__field:nth-of-type(4) .nav--tabs li:last-child a');
            phantomcss.screenshot('.page__content .segment .form__field:nth-of-type(4)', folder + 'Upload tabs 2');
        }) 
})

// Manage subjects
.thenOpen(baseURL + 'training.html#/training/manage/subjects/1261').then(function(){ 

    casper.then(function(){ 
        phantomcss.screenshot('.page__aside .panels .panel:first-child', folder + 'RHS info');
    }) 

        .then(function(){ 
            phantomcss.screenshot('.page__aside .panels .panel:last-child', folder + 'RHS info 2');
        }) 
})

.thenOpen(baseURL + 'training.html#/training/637').then(function(){ 

    casper.then(function(){
        phantomcss.screenshot('.training__header', folder + 'Begin course header');
    }) 

        .then(function(){ 
            phantomcss.screenshot('.training__content', folder + 'Begin course content');
        }) 

        .then(function(){ 
            phantomcss.screenshot('.training__footer', folder + 'Begin course footer');
        }) 
})

.thenOpen(baseURL + 'training.html#/training/1106/EXT_91769_10').then(function(){ 

    casper.then(function(){ 
        phantomcss.screenshot('.training__content', folder + 'External training link');
    }) 

        .then(function(){ 
            this.click('.button--positive')
            phantomcss.screenshot('.modal__main', folder + 'Confirmation modal');
        })

        // Reset folder variable
        .then(function(){
            folder = folder.replace('training/', '');
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
