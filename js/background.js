if(!localStorage['theme'] || localStorage['theme'] == '') localStorage['theme'] = 'sunburst';
if(!localStorage['font'] || localStorage['font'] == '') localStorage['font'] = 'Inconsolata';

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {    
    if(sender && sender.tab && sender.tab.selected == false) return;
     
     
    if(request.key == 'plaintext')
    {
        if(request.op == 'get') {   
            chrome.tabs.getSelected(null, function(stab) {
                stab = sender.tab || stab;
            
                if(!localStorage[stab.id])
                    localStorage[stab.id] = JSON.stringify({plaintext: false});
                sendResponse({value: JSON.parse(localStorage[stab.id]).plaintext});
            });
        }
        else if(request.op == 'set') {
            chrome.tabs.getSelected(null, function(stab) {
                stab = sender.tab || stab;
                
                if(!localStorage[stab.id])
                    localStorage[stab.id] = JSON.stringify({plaintext: false});
                var tab = JSON.parse(localStorage[stab.id]);
                tab.plaintext = request.value;
                localStorage[stab.id] = JSON.stringify(tab);
            });
        }
        
    }
    
    if(request.key == 'theme')
    {
        if(request.op == 'get') {
            chrome.tabs.getSelected(null, function(stab) {
                stab = sender.tab || stab;
                console.log(_.sprintf('Tab %d Get theme', stab.id))   
                
                if(!localStorage[stab.id])
                    localStorage[stab.id] = JSON.stringify({language: '', theme: localStorage['theme'], font: localStorage['font']});
                sendResponse({value: JSON.parse(localStorage[stab.id]).theme});
            });
        }
        else if(request.op == 'set') {
            chrome.tabs.getSelected(null, function(stab) {
                stab = sender.tab || stab;
                console.log(_.sprintf('Tab %d Set theme', stab.id))   
                
                if(!localStorage[stab.id])
                    localStorage[stab.id] = JSON.stringify({language: '', theme: localStorage['theme'], font: localStorage['font']});
                var tab = JSON.parse(localStorage[stab.id]);
                tab.theme = request.value;
                localStorage[stab.id] = JSON.stringify(tab);
                chrome.tabs.executeScript(stab.id, {file: 'js/reset-styles.js'}, function(){
                    chrome.tabs.insertCSS(stab.id, {file: 'css/main.css'}, function(){
                        chrome.tabs.insertCSS(stab.id, {file: 'css/' + tab.theme + '.css'});
                    });
                });
            });
        }

    }
    
    if(request.key == 'font')
    {
        if(request.op == 'get') {
            chrome.tabs.getSelected(null, function(stab) {
                stab = sender.tab || stab;
                console.log(_.sprintf('Tab %d Get font', stab.id))   
                
                if(!localStorage[stab.id])
                    localStorage[stab.id] = JSON.stringify({language: '', theme: localStorage['theme'], font: localStorage['font']});
                sendResponse({value: JSON.parse(localStorage[stab.id]).font});
            });
        }
        else if(request.op == 'set') {
            chrome.tabs.getSelected(null, function(stab) {
                stab = sender.tab || stab;
                console.log(_.sprintf('Tab %d Set font', stab.id))   
                
                if(!localStorage[stab.id])
                    localStorage[stab.id] = JSON.stringify({language: '', theme: localStorage['theme'], font: localStorage['font']});
                var tab = JSON.parse(localStorage[stab.id]);
                tab.font = request.value;
                localStorage[stab.id] = JSON.stringify(tab);
                chrome.tabs.executeScript(stab.id, {code: "document.body.firstChild.firstChild.style.fontFamily = '" + tab.font + "';"});
            });
        }

    }

    if(request.key == 'language')
    {        
        if(request.op == 'get') {
            chrome.tabs.getSelected(null, function(stab) {
                stab = sender.tab || stab;
                console.log(_.sprintf('Tab %d Get Language', stab.id))   
                
                if(!localStorage[stab.id])
                    localStorage[stab.id] = JSON.stringify({language: '', theme: localStorage['theme'], font: localStorage['font']});
                sendResponse({value: JSON.parse(localStorage[stab.id]).language});
            });
        }
        else if(request.op == 'set') {
            chrome.tabs.getSelected(null, function(stab) {
                stab = sender.tab || stab;
                console.log(_.sprintf('Tab %d Set Language', stab.id))   
                
                if(!localStorage[stab.id])
                    localStorage[stab.id] = JSON.stringify({language: '', theme: localStorage['theme'], font: localStorage['font']});
                var tab = JSON.parse(localStorage[stab.id]);
                tab.language = request.value;
                localStorage[stab.id] = JSON.stringify(tab);
                chrome.tabs.executeScript(stab.id, {file: 'js/languages/' + tab.language + '.js' }, function(){
                    chrome.tabs.executeScript(stab.id, {code: _.sprintf("hljs.reHighlight(document.body.firstChild, '%s');document.body.firstChild.firstChild.style.fontFamily ='%s';", tab.language, tab.font)});
                });
            });
        }

    }
    
    if(request.op == 'highlight')
    {
        chrome.tabs.getSelected(null, function(stab) {
            stab = sender.tab || stab;
            if(!localStorage[stab.id])
                localStorage[stab.id] = JSON.stringify({language: '', theme: localStorage['theme'], font: localStorage['font']});
            var tab = JSON.parse(localStorage[stab.id]);
            console.log(_.sprintf('Tab %d Highlight', stab.id))
            chrome.tabs.executeScript(stab.id, {file: 'js/reset-styles.js'});
            chrome.tabs.insertCSS(stab.id, {file: 'css/main.css'});
            load({url: chrome.extension.getURL('js/highlight.js')}, function(xhr) {
                chrome.tabs.executeScript(stab.id, {code: xhr.responseText}, function() {
                    if(request.language && request.language != '') {
                        chrome.tabs.executeScript(stab.id, {
                            code: _.sprintf("hljs.tabReplace = '    ';chrome.extension.sendRequest({key:'language',op:'set',value:'%s'});chrome.extension.sendRequest({key:'theme',op:'set',value:'%s'});chrome.extension.sendRequest({key:'font',op:'set',value:'%s'});chrome.extension.sendRequest({key:'plaintext',op:'set',value:'true'});", request.language, tab.theme, tab.font)
                        });
                    }
                });
            
            });
        });
    }
});

chrome.tabs.onRemoved.addListener(function(tabId) {
    console.log(_.sprintf('Tab %d Removed', tabId))   
    localStorage.removeItem(tabId);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if(changeInfo.status != 'complete') return;
    console.log(_.sprintf('Tab %d Updated (%s)', tab.id, JSON.stringify(changeInfo)))
    chrome.tabs.executeScript(tab.id, {file: 'js/inject.js'});
});

chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
    console.log(_.sprintf('Tab %d Selection Changed: %s', tabId, JSON.stringify(selectInfo)))
    if(!localStorage[tabId])
        chrome.tabs.executeScript(tabId, {file: 'js/inject.js'});
});

function load(opts, callback) {
    var xhr = new XMLHttpRequest();
    if(!opts || !opts.url) return;
    
    xhr.onreadystatechange = function() {
        if(xhr.readyState < 4) return;
        callback(xhr);
    };
    xhr.open(opts.method || 'GET', opts.url, false);
    xhr.send(null);
}