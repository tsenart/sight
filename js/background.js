var loadJs = function(uri, cb) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if(xhr.readyState < 4) return;
        !!cb && cb(xhr);
    };
    xhr.open('GET', chrome.extension.getURL(uri), true);
    xhr.send(null);
};

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    window.tab_langs = window.tab_langs || {};

    if (request.lang !== undefined) {
        window.tab_langs[sender.tab.id] = request.lang;
        chrome.pageAction.show(sender.tab.id);
    }

    !!request.preferences && sendResponse({
        lang: window.tab_langs[sender.tab.id],
        font: localStorage.font || 'Inconsolata',
        theme: localStorage.theme || 'sunburst',
        line_numbers: localStorage.line_numbers || true,
        javascript_tabstop: localStorage.javascript_tabstop || '4'
    });

    !!request.inject && loadJs(request.inject, function(xhr) {
        sendResponse(xhr.responseText)
    });
});


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if(changeInfo.status != 'complete') return;
    (!!window.tab_langs && !!window.tab_langs[tabId]) && (delete window.tab_langs[tabId]);
    chrome.tabs.executeScript(tabId, {file: 'js/content_script.js'});
});
