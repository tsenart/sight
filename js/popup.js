document.addEventListener("DOMContentLoaded", function() {
    var bg_page = chrome.extension.getBackgroundPage();
    document.getElementById('language').addEventListener('change', function(e){
        var lang = e.target.options[e.target.selectedIndex].value;     
        chrome.tabs.getSelected(null, function(stab) {
            bg_page.tab_langs[stab.id] = lang;
            chrome.tabs.executeScript(stab.id, {file: 'js/do_highlight.js'});
        });        
    });
    var select = document.getElementById('language');
    chrome.tabs.getSelected(null, function(stab) {
        _(select.options).detect(function(i) {
            return i.value == bg_page.tab_langs[stab.id];
        }).selected = true;
    });
}, true);

chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
    window.close();
});
