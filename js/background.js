function xhrload(opts, callback) {
    var xhr = new XMLHttpRequest();
    if(!opts || !opts.url) return;
    
    xhr.onreadystatechange = function() {
        if(xhr.readyState < 4) return;
        callback(xhr);
    };
    xhr.open(opts.method || 'GET', opts.url, false);
    xhr.send(null);
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {    
    if(request.key == 'theme')
    {
        if(!localStorage[request.key] || localStorage[request.key] == '')
            localStorage[request.key] = 'sunburst';
        sendResponse({value: localStorage['theme']});
    }
    
    if(request.key == 'include')
    {        
        xhrload({url: chrome.extension.getURL(request.path)}, function(xhr) {
            sendResponse({value: xhr.responseText});
        });
    }
});