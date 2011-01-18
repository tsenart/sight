document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('close_popup').addEventListener('click', function(e){
        window.close();
    });
    
    chrome.extension.sendRequest({op: 'get', key: 'plaintext'}, function(msg) {   
        if(!msg.value) {
            _.each(document.body.querySelectorAll('select'), function(el) {
                el.disabled = true; 
            });

            _.each(document.body.querySelectorAll('h3'), function(el) {
                el.style.color = '#aaa';
            });
            return;
        }

        document.getElementById('theme').addEventListener('change', function(e){
            var theme = e.target.options[e.target.selectedIndex].value;
            chrome.extension.sendRequest({op: 'set', key: 'theme', value: theme});
        });

        document.getElementById('font').addEventListener('change', function(e){
            var font = e.target.options[e.target.selectedIndex].value;
            chrome.extension.sendRequest({op: 'set', key: 'font', value: font});
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

        chrome.extension.sendRequest({op: 'get', key: 'font'}, function(msg) {
            var select = document.getElementById('font');
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

    });
}, true);

chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
    window.close();
});
