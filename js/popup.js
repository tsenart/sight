document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('theme').addEventListener('change', function(e){
        var theme = e.target.options[e.target.selectedIndex].value;
        chrome.tabs.executeScript(null, {
            code: _.sprintf("_(document.querySelectorAll('link')).last().href = '%s'", chrome.extension.getURL('css/' + theme + '.css'))
        });
        chrome.tabs.getSelected(null, function(tab) {
            var local = JSON.parse(localStorage[tab.id]);
            local.theme = theme;
            localStorage[tab.id] = JSON.stringify(local);
        });
    });
    
    document.getElementById('language').addEventListener('change', function(e){
        var lang = e.target.options[e.target.selectedIndex].value;
        chrome.tabs.executeScript(null, {file: 'js/languages/' + lang + '.js' }, function(){
            chrome.tabs.executeScript(null, {code: _.sprintf("hljs.reHighlight(document.body.firstChild, '%s')", lang)});
        });
        
        chrome.tabs.getSelected(null, function(tab) {
            var local = JSON.parse(localStorage[tab.id]);
            local.language = lang;
            localStorage[tab.id] = JSON.stringify(local);
        });
    });
    
    var select = document.getElementById('theme');
    chrome.tabs.getSelected(null, function(tab) {
        if(!localStorage[tab.id]) {
            localStorage[tab.id] = JSON.stringify({theme: localStorage['theme'], language: ''})
        }
        
        var local = JSON.parse(localStorage[tab.id]);
        _(select.options).detect(function(i) {
            return i.value == local.theme;
        }).selected = true;
        
        select = document.getElementById('language');
        _(select.options).detect(function(i) {
            return i.value == local.language;
        }).selected = true;
    
    });
}, true);

chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
    window.close();
});
