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