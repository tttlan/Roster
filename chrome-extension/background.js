// function contextMenuCallback(info, tab) {
//     
//     console.log(info)
//     console.log(tab);
//     
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {  
//         port = chrome.tabs.connect(tabs[0].id);
//         port.postMessage({getClickedElem: true});
//         console.log('1111111111111');
//     });
// }
// 
// var contextMenuItem = chrome.contextMenus.create({
//     'title': 'Log the angular model for this element', 
//     'contexts': ['page','selection','link','editable','image','video', 'audio'],
//     'onclick': contextMenuCallback
// });
