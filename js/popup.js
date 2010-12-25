document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('theme').addEventListener('change', function(e){
        var theme = e.target.options[e.target.selectedIndex].value;
        chrome.tabs.executeScript(null, {
            code: _.sprintf("_(document.querySelectorAll('link')).last().href = '%s'", chrome.extension.getURL('css/' + theme + '.css'))
        });
    });
    
    document.getElementById('language').addEventListener('change', function(e){
        var lang = e.target.options[e.target.selectedIndex].value;
        chrome.tabs.executeScript(null, {file: 'js/languages/' + lang + '.js' }, function(){
            chrome.tabs.executeScript(null, {code: _.sprintf("hljs.reHighlight(document.body.firstChild, '%s')", lang)});
        });
        
        chrome.tabs.getSelected(null, function(tab) {
            localStorage[tab.id] = JSON.stringify({language: lang});
        });
    });
    
    var select = document.getElementById('theme');
    if (!localStorage['theme'] || localStorage['theme'] == '') localStorage['theme'] = 'sunburst';
    _(select.options).detect(function(i) {
        return i.value == localStorage['theme'];
    }).selected = true;
    
    chrome.tabs.getSelected(null, function(tab) {
        select = document.getElementById('language');
        if(localStorage[tab.id] && localStorage[tab.id] != '')
            _(select.options).detect(function(i) {
                return i.value == JSON.parse(localStorage[tab.id]).language;
            }).selected = true;
    });
}, true);

chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
    window.close();
});

