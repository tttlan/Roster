## Setup

# Read a bit about Gulp and why we use it.
http://code.tutsplus.com/tutorials/managing-your-build-tasks-with-gulpjs--net-36910
https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md

1. Install node.js 
    http://nodejs.org/download/

2. Open Gitbash and configure the PATH to point to node by inserting:
   $ export PATH=$PATH:"C:\Program Files (x86)\nodejs"

3. Install gulp globally line
    $ npm install gulp -g
    $ gulp
   
   if gulp failes or throws and error, then the NPM path is missing or broken.
    $ export PATH=$PATH:"C:\Users\[username]\AppData\Roaming\npm" 

3. Open Command line in the Project Dir and run
    $ npm install
    $ gulp deploy

   gulp deploy should be run everytime a complete set of project files needs to be built either after changing branches or before a large GIT commit.  Running 'gulp' can be used at all other times and is the task to use when writing code.
   
   For the sake of consistency please follow the AirBNB styleguide when adding to the codebase and also use the exisiting codebase as a reference point when writing and formatting all new code

6. You should now have the latest project and src files
    Gulp will keep watching in the background and update the distribution files as you edit

5. Setup Sublime Editor
    Navigate to packages folder, open bash in that location
    $ git clone https://github.com/LearnBoost/stylus.git Stylus

6. Sublime User Settings
    "translate_tabs_to_spaces": true

    A nice sumblime theme:  https://github.com/jamiewilson/predawn
    Some other useful sublime settings:  http://cl.ly/2T3S1R3D2U1U

9. Back in the Project Dir, Right click on 'node_modules' and add to SVN ignore list
   We do not want these files getting merged to trunk

10. If you want desktop notifcations for build fails, you should install Snarl or Growl

11. The Gulp watch task has Live Reload enabled.  To get this up and running, install the Live Reload browser extension and turn it on once the watch task has been started.  Assuming your local IP is externally available you can also test on mobile devices using browser sync, this will sync your clicks, scroll and input to the device.

12. Testing

Assuming npm install has already been run, all that's left to install in the karma cli:

$ npm install -g karma-cli

The tests can be run with the following command from /interfaceSource/:

$ npm test

13. Files within the interface templates project use IIS Server Side Includes.  This is an IIS feature that needs to be enabled, follow these instructions to get it up and running

http://tech.mikeal.com/blog1.php/server-side-includes-for-html-in-iis7

14.  An offline API is located within interfaceSource/test/mockData.  To run this API the IIS rewrite module must be installed.  

It's available here:  http://www.iis.net/downloads/microsoft/url-rewrite


------

## CSS

At Sherpa we use Stylus for CSS management.
This is prefered over Less and Sass for a few reasons, mostly speed and not having a Ruby dependency.
We follow the BEM syntax and we approach our CSS using the OOCSS pattern. 

Read about BEM and OOCSS here:
    http://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/
    http://csswizardry.com/2014/03/naming-ui-components-in-oocss/

Read about Stylus here:
    http://learnboost.github.io/stylus/


## Javascript

Our javascript follows the airbnb styleguide:
    https://github.com/airbnb/javascript

For the sake of consistency please follow the AirBNB styleguide when adding to the codebase and also use the exisiting codebase as a reference point when writing and formatting all new code.

Pay close attention to the way that all common angular components and services are already utilised throughout the rest of the app.  When writing new code try to work with all common components in the exactly the same way they are used elsewhere.  If you can spot a better way of doing things, refactor the code across the board. 

In it's present state, the codebase looks like it was written by a single developer and we'd like to keep it that way.


## Angular

We are currently working with Angular 1.4 (latest version).  Minor versions within of the 1.4 branch are automatically updated with bower.  The current plan is to upgrade the app with the latest stable version in the 1.x branch and the long term plan is to upgrade to version 2 when it is eventually released. 


## Gulp

The gulpfile has everthing you need to work with the assets of the project.

Running 'gulp' will build assets in development mode and will run a watch so that files will build when you save your changes.  Running in this mode will generate sourcemaps and produce unminfied javascript.  Running a gulp will also git ignore all files in the website/interface folder as these should only be committed when running the gulp deploy.

Running 'gulp-deploy' will build all assets ready for production.  This includes javascript minification, inlining angular templates into javascript, building the css in all colour variants, updating bower components and running unit tests.  Gulp deploy will also remove the ignore on the interface folder.


## Styleguide

A living styleguide will open once the gulp command is run.  This styleguide is auto-generated from our stylus files and is served from a local node server.  The styleguide is built using KSS https://github.com/kss-node/kss-node.  The styleguide will rebuild once a change is detected within any of the stylus files.  Most of the CSS is documented however there are some components and css files that remain undocumented.  Please update the styleguide as you update and write new CSS.


## Front end templates

The website/interfaceTemplates folder contains a set of HTML templates that are a duplicate of the .net masterpages.  These can be used instead of the .net templates should you have any issues getting your .net templates to load / build locally.  Please not that these require IIS server side includes to work, see note 13 in the setup section of this file for information on how to set these up.  These templates need to be manually kept in sync with the .net templates.  If you would like to use them browse to the template directly like this:  http://localhost/interfaceTemplates/dashboard.html.  Your angular path will be appended to the url with a hash.  Note that if you use these templates, the API configuration from the main Web.config will not be correctly passed to your angular app.  You can edit the website/interfaceTemplates/header.html file and change the SHRP.API_URL variable to reconfigure the variable. 


## Git workflow

# website/interface folder

The interface folder is where all front end assets are built to and served from.  This folder is currently versioned in git because our build process does not yet run on our build server.  Work in underway to make this happen and eventually the folder will no longer be version.  Any conflicts within the interface folder are not a cause for concern.  Resolve the conflict with the latest version of the file

# Merging branches

Before work is released it must first be merged into a release branch Release/R1.1.x.  Release branches are tested by the test team and once they pass testing, they are deployed and merged back into master.  

# Interface branch

The wip/interface branch is the home for any new UI related work that takes place outside of a feature branch.  This is a good place to make incremental upgrades.  The branch is merged back into master from time to time however as noted above, all work needs to be merged to a release branch before it can be merged back to master

# Features

All new product feature branches should start with the prefix feature/, eg. feature/profiles

# Ongoing work in progress

For any work that's not quite a whole new feature or bug, use the wip/ prefix, eg: wip/angular-upgrade

# Bug fixes

Bug fixes should be given the prefix pb/the-bug-number eg. pb/5425. 
