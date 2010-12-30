document.addEventListener("DOMContentLoaded", function() {
    
    document.getElementById('theme').addEventListener('change', function(e){
        var theme = e.target.options[e.target.selectedIndex].value;
        chrome.extension.sendRequest({op: 'set', key: 'theme', value: theme});
    });
    
    document.getElementById('language').addEventListener('change', function(e){
        var lang = e.target.options[e.target.selectedIndex].value;     
        chrome.extension.sendRequest({op: 'set', key: 'language', value: lang});
    });
    
    chrome.extension.sendRequest({op: 'get', key: 'theme'}, function(msg) {
        var select = document.getElementById('theme');
        _(select.options).detect(function(i) {
            return i.value == msg.value;
        }).selected = true;
    });        
        
    chrome.extension.sendRequest({op: 'get', key: 'language'}, function(msg) {
        var select = document.getElementById('language');
        _(select.options).detect(function(i) {
            return i.value == msg.value;
        }).selected = true;
    });
}, true);
