// This scipt runs on the page and will be run for each tab instance

// On page load, get the value in storage for silent mode
chrome.storage.sync.get('silentMode', function(data) {
    if (data.silentMode) {
        setSilentMode(data.silentMode);
    }
});

// On page load, retreive the set theme
chrome.storage.sync.get('theme', function(data) {
    if (data.theme) {
        setTheme(data.theme);
    }
});

// On page load, update the API url in chromes storage
// var apiUrl = $('meta[name="sherpa-api-url"]') ? $('meta[name="sherpa-api-url"]').attr('content') : 'http://localhost:83/';
// chrome.storage.sync.set({'apiUrl': apiUrl}); // Update the val in storage
// Add me to the app.master to access the api url
// <meta name="sherpa-api-url" content="<%= System.Configuration.ConfigurationManager.AppSettings["WebApiBaseUrl"].ToString()%>" />

//content script
// var clickedElement = null;
// 
// $(document).on("mousedown", function(event){
//     // right click
//     if(event.button == 2) { 
//         clickedElement = event.target;
//     }
// });


// Connect to the popup and update silent mode if a message is received
chrome.runtime.onConnect.addListener(function(port) {
            
    port.onMessage.addListener(function(msg) {
        
        if (msg.hasOwnProperty('setSilentMode')) {
            setSilentMode(msg.setSilentMode);
        }
        
        if (msg.hasOwnProperty('setTheme')) {
            setTheme(msg.setTheme);            
        }
        
        if (msg.hasOwnProperty('loginResp')) {            
            
            console.log(msg.loginResp);
            
            // If the login was successful
            if (msg.loginResp.response !== null && msg.loginResp.response !== '') {
                
                var authkey = msg.loginResp.response.replace('"','').replace('"','');
                console.log(authkey);
                document.cookie = 'Sherpa.aspxauth=' + authkey + '; expires=; path=/';
                //window.location.reload();
                
            } else {
                alert('Incorrect username or password');
            }
            
        }
        
        // if (msg.hasOwnProperty('getClickedElem')) {
        //     var elem = $(clickedElement).closest('.ng-scope');
        //     console.log(elem);
        //     elem = angular.element(elem.dom[0]);
        //     console.log(elem[0].scope());
        // }
    });
});

// Update the silent attr in the DOM
function setSilentMode(silentMode) {
    if (silentMode) {
        $('html').attr('silent', 'true');
        $('.notifications').append('<li class="notification notification--warning" id="silentModeNotification">' +
                '<div class="notification__icon"><i class="icon--warning"></i></div>' +
                '<p class="notification__message">Silent mode is currently enabled</p>' +
            '</li>');
    } else {
        $('#silentModeNotification').remove();
        $('html').removeAttr('silent');
    }
}

function setTheme(theme) {
    
    if (theme === 'none') { // This means the theme selector is turned off completely, leave the markup untouched so if a theme was set in the backend, it will be displayed
        return;
    }
    
    $('head').find('link').each(function(){
        
        var href = $(this).attr('href');

        if (href.indexOf('sherpa') !== -1) {                       
            href = href.split('sherpa');
            href = (theme === 'default') ? href[0] + 'sherpa.css' : href[0] + 'sherpa-' + theme + '.css';
            $(this).attr('href', href);
        }
    });
}
