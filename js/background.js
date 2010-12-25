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
        if(localStorage[sender.tab.id])
            var tab = JSON.parse(localStorage[sender.tab.id]);
        else
            var tab = {theme: ''};
        
        if(tab.theme == '') tab.theme = localStorage['theme'];
        localStorage[sender.tab.id] = JSON.stringify(tab);
        sendResponse({value: tab.theme});
    }
    if(request.key == 'language')
    {
        if(localStorage[sender.tab.id])
            var tab = JSON.parse(localStorage[sender.tab.id]);
        else
            var tab = {language: ''};
        
        tab.language = request.value;
        localStorage[sender.tab.id] = JSON.stringify(tab);
    }
    
    if(request.key == 'include')
    {        
        xhrload({url: chrome.extension.getURL(request.path)}, function(xhr) {
            sendResponse({value: xhr.responseText});
        });
    }
    
    if(request.key == 'page_action')
    {
        chrome.tabs.getSelected(null, function(tab) {
            chrome.pageAction.show(tab.id);
        });
    }
});

chrome.tabs.onRemoved.addListener(function(tabId) {
    localStorage.removeItem(tabId);
});

