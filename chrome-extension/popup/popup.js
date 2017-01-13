// This script runs within the popup

$(function(){
            
    var port;
    
    // Set up a port to communicate with the DOM
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {            
        
        port = chrome.tabs.connect(tabs[0].id);
    });
    

    // Change the silent property when the toggle is toggled
    $('#silentMode').on('change', function(){
        
        var silentVal = $(this).is(':checked');        
        
        chrome.storage.sync.set({'silentMode': silentVal}); // Update the val in storage
        port.postMessage({setSilentMode: silentVal}); // And update the DOM
    });
    
    // Change the theme when the select box is changed
    $('#theme').on('change', function(){
        
        var theme = $(this).val();
        
        chrome.storage.sync.set({'theme': theme}); // Update the val in storage
        port.postMessage({setTheme: theme}); // And update the DOM
    });
    
    $('#login').on('submit', function(){
        
        var xhr = new XMLHttpRequest();
        
        var reqData = {
            'UserName': $('#username').val(),
            'Password': $('#password').val(),
            'RememberMe': true,
            'NetworkId': 957,
            'Host': '*'
        }
        
        // Retreive the API url from local storage and then fire off a request
        chrome.storage.sync.get('apiUrl', function(data) {
        
            reqData = JSON.stringify(reqData);

            xhr.open('POST', data.apiUrl + 'identity/auth', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(reqData);
                    
            // File received/failed
            xhr.onreadystatechange = function(e) {
                if (xhr.readyState === 4) {
                    port.postMessage({loginResp: xhr}); // Send the response back to our content script
                }
            };        
        });        
        
    });
    
    // Retreive the data intially
    chrome.storage.sync.get('silentMode', function(data) {        
        $('#silentMode').prop('checked', data.silentMode); // Set the checkbox in our UI
    });
    
    chrome.storage.sync.get('theme', function(data) {        
        $('#theme').val(data.theme); // Set the dropdown in our UI
    });

});

// 
// 
// .open('https://apitest.sherpanetwork.com.au/api/identity/auth', {
//     method: 'POST',
//     data: {
//         'UserName': 'admin',
//         'Password':  'TwoShakes',
//         'RememberMe': true,
//         'NetworkId': 937
//     }
// })
// 
// .then(function() {
// 
//     var token = this.page.plainText; // Taken login token from the API
//     token = token.replace(/["']/g, ""); // Strip quotes
// 
//     // Create a cookie with the token
//     phantom.addCookie({
//           domain: 'localhost',
//           name: 'Sherpa.aspxauth',
//           value: token
//     });
// 
//     // Create a cookie so we know to switch to a static API in our interface templates
//     phantom.addCookie({
//           domain: 'localhost',
//           name: 'phantom',
//           value: true
//     })
// })
