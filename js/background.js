var load = function(uri, cb) {
    if (!uri) return false;
    var kind = uri.match(/\.(\w+)$/).pop();
    
    if (kind == 'js') {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(xhr.readyState < 4) return;
            !!cb && cb(xhr);
        };
        xhr.open('GET', chrome.extension.getURL(uri), true);
        xhr.send(null);
    }
};


chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    window.tab_langs = window.tab_langs || {};
    
    if (request.lang) {
        window.tab_langs[sender.tab.id] = request.lang;
    }
    
    if (request.preferences) {
        sendResponse({
            lang: window.tab_langs[sender.tab.id] || '',
            font: localStorage['font'] || 'Inconsolata',
            theme: localStorage['theme'] || 'sunburst',
            'show-line-numbers': localStorage['show-line-numbers'] || 'true'
        });
    };
    
    if (request.inject) {
        load(request.inject, function(xhr) {
            sendResponse(xhr);
        });
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if(changeInfo.status != 'complete') return;
    chrome.tabs.executeScript(tabId, {file: 'js/do_highlight.js'}, function(){
        chrome.pageAction.show(tabId);
    });
});
