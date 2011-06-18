document.addEventListener("DOMContentLoaded", function() {
    var bg_page = chrome.extension.getBackgroundPage();
    function changeLanguage(e){
        var select = document.getElementById('language');
        var lang = select.options[select.selectedIndex].value;
        chrome.tabs.getSelected(null, function(stab) {
            if (lang.length == 0) delete bg_page.tab_langs[stab.id]
            else bg_page.tab_langs[stab.id] = lang;
            var file = (lang.length == 0 ? 'reset' : 'content_script');
            chrome.tabs.executeScript(stab.id, {file: 'js/' + file + '.js'});
        });
        window.close();
    }
    document.getElementById('language').addEventListener('change', changeLanguage)
    chrome.tabs.getSelected(null, function(stab) {
        document.querySelector('#language option[value="' + (bg_page.tab_langs[stab.id] || '') + '"]').selected = true;
    });
});