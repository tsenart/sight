function setStyle() {
    var select = document.getElementById('theme');
    select.disabled = true;
    var request = sh_getXMLHttpRequest();
    request.open('GET', 'css/sh_' + localStorage['theme'] + '.min.css', true);
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            try {
                if (request.status === 0 || request.status === 200) {
                    var style = document.getElementsByTagName('style').item(0);
                    if (style.styleSheet) {
                        style.styleSheet.cssText = request.responseText;
                    }
                    else {
                        while (style.hasChildNodes()) {
                            style.removeChild(style.firstChild);
                        }
                        style.appendChild(document.createTextNode(request.responseText));
                    }
                }
            }
            finally {
                request = null;
                select.disabled = false;
            }
        }
    };
    request.send(null);
}

function saveOptions() {
    var select = document.getElementById('theme');
    var value = select.options[select.selectedIndex].value;
    localStorage['theme'] = value;
}

function bodyLoad() {
    var select = document.getElementById('theme');
    if(!localStorage['theme'] || localStorage['theme'] == '')
        localStorage['theme'] = 'pablo';
    for (var i = select.options.length - 1; i >= 0; i--){
        if(select.options[i].value == localStorage['theme'])
            select.options[i].selected = true;
    }
    setStyle();
    sh_highlightDocument();
    // Opera needs this, or else it truncates the pre
    var pre = document.getElementById('codePre');
    var width = pre.scrollWidth + 'px';
    pre.style.width = width;
}