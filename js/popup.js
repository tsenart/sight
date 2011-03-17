document.addEventListener("DOMContentLoaded", function() {
    var bg_page = chrome.extension.getBackgroundPage();
    document.getElementById('language').addEventListener('change', function(e){
        var lang = e.target.options[e.target.selectedIndex].value;     
        chrome.tabs.getSelected(null, function(stab) {
            bg_page.tab_langs[stab.id] = lang;
            chrome.tabs.executeScript(stab.id, {file: 'js/do_highlight.js'});
        });        
    });
    chrome.tabs.getSelected(null, function(stab) {
        document.querySelector('#language option[value="' + bg_page.tab_langs[stab.id] + '"]').selected = true;
    });
}, true);

chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
    window.close();
});
