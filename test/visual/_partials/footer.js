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
