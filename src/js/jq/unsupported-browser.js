$('body').append('<div class="backdrop in"></div>
<div tabindex="-1" role="dialog" class="modal" style="z-index: 1050; display: block;">
    <div class="modal__dialog fade modal--lg in" style="top: 150px; left: 50%; margin-left: -400px !important; width: 800px !important;">
        <div class="modal__main">
            <div class="modal__content unsupported-browser">

                <h2>Your web browser is unsupported</h2>

                <p>Your browser is out-of-date and not supported by Sherpa.  Please select and install a new browser to continue using Sherpa</p>

                <a href="https://www.google.com/intl/en-AU/chrome/browser/" class="unsupported-browser__download" target="_blank" title="Download Google Chrome">
                    <img src="/interface/images/logo--chrome.png" alt="Google Chrome Logo" />
                    <p>Chrome</p>        
                </a>

                <a href="https://www.mozilla.org/firefox" class="unsupported-browser__download" target="_blank" title="Download Firefox">
                    <img src="/interface/images/logo--firefox.png" alt="Firefox Logo" />
                    <p>Firefox</p>
                </a>

                <a href="http://support.apple.com/downloads/#safari" class="unsupported-browser__download" target="_blank" title="Download Safari">
                    <img src="/interface/images/logo--safari.png" alt="Safari Logo" />
                    <p>Safari</p>        
                </a>

                <a href="http://windows.microsoft.com/en-au/internet-explorer/ie-11-worldwide-languages" class="unsupported-browser__download" target="_blank" title="Download Internet Explorer 11">
                    <img src="/interface/images/logo--ie.png" alt="Internet Explorer Logo" />
                    <p>Internet Explorer 11</p>        
                </a> 

            </div>
        </div>
    </div>
</div>');



// Throw an error to prevent any further javascript on the page form executing
(function(){
    throw new Error('This browser is unsupported');
})();
