document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('language').addEventListener('change', function(e){
        var lang = e.target.options[e.target.selectedIndex].value;     
        chrome.extension.sendRequest({op: 'highlight', language: lang});
    });

    chrome.extension.sendRequest({key: 'language'}, function(msg) {
        var select = document.getElementById('language');
        _(select.options).detect(function(i) {
            return i.value == msg.value;
        }).selected = true;
    });

}, true);

chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
    window.close();
});
