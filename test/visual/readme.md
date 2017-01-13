## Visual testing

Visual testing requires PhantomCSS to be installed.  The best way to do this is with a Git clone with the following command:

$ git clone git://github.com/Huddle/PhantomCSS.git test/visual/PhantomCSS

The IIS rewrite module must also be install on your local IIS.  Download is available here, make sure to enable the extension in control panel -> add / remove programs.  http://www.iis.net/downloads/microsoft/url-rewrite

# Running tests

Baseline tests are located in the screenshots folder.  This folder is versioned and tests are run against these screenshots as a baseline.

To run all tests run 

$ gulp run-ui-tests

These will take roughly 15 minutes to complete.

To run individual tasks run the command in the following style

$ gulp run-ui-test-dashboard

If a new test is written it will need to be manually added to the gulpfile

# Test results

Test results will be outputted to the screenshots/test-results folder.  These are not versioned files and will be ignored by git

All failed screenshots (located in the failures folder) should be reviewed to see if they are reporting a change or a failure.

Failed tests need to be fixed before commiting.

Any failures that are the result of a change to the interface need to be actioned.  A new screenshot needs to be taken in all  screen resolutions to update the baseline screenshots.  These can be done by deleting the baseline screenshots and running all tests again with 'gulp run-ui-tests'.  Baseline screenshots are located in the ../screenshots/baseline/{section}/* folders


# Editing exisiting tests

Should our markup or styles change significantly, tests will need to be updated

Tests should only be editing within the partials folder, the partials are combined to form the tests that live in visual/*

# Writing new tests

If you are writing new tests and pages are not rendering try removing any click or input behaviours such as this.click(selector) as these could be making subsequent tests fail

Make sure your screenshot names are unique and different to all other screenshots.  We used to suffix all screenshots with a number however this causes isses if a subset of tests are run so all names must be unique in order to stop errors from being reported

