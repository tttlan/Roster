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