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