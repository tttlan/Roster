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
