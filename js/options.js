document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('theme').addEventListener('change', function(e){
        var theme = e.target.options[e.target.selectedIndex].value;
        document.querySelector('link:last-of-type').href = '/css/' + theme + '.css';
        localStorage.theme = theme;
    });

    document.getElementById('font').addEventListener('change', function(e){
        var font = e.target.options[e.target.selectedIndex].value;
        document.querySelector('code').style.fontFamily = font;
        document.querySelector('#line-numbers').style.fontFamily = font;
        localStorage.font = font;
    });

    document.getElementById('javascript_tabstop').addEventListener('change', function(e){
        var javascriptTabstop = e.target.options[e.target.selectedIndex].value;
        localStorage.javascript_tabstop = javascriptTabstop;
    });

    document.getElementById('show-line-numbers').addEventListener('change', function(e){
        var line_numbers = e.target.checked;
        document.getElementById('line-numbers').style.display = line_numbers ? 'block' : 'none';
        localStorage.line_numbers = line_numbers;
    });

    localStorage.theme = localStorage.theme || 'sunburst';
    localStorage.font = localStorage.font || 'Inconsolata';
    localStorage.line_numbers = localStorage.line_numbers || true;
    localStorage.javascript_tabstop = localStorage.javascript_tabstop || '4';

    loadCSS('css/' + localStorage.theme + '.css');
    document.querySelector('#theme option[value="' + localStorage.theme + '"]').selected = true;
    document.querySelector('#font option[value="' + localStorage.font + '"]').selected = true;
    document.querySelector('code').style.fontFamily = localStorage.font;
    document.querySelector('#line-numbers').style.fontFamily = localStorage.font;
    document.querySelector('#line-numbers').style.display = eval(localStorage.line_numbers) ? 'block' : 'none';
    document.querySelector('#show-line-numbers').checked = eval(localStorage.line_numbers);
    document.querySelector('code').style.fontFamily = localStorage.font;
    document.querySelector('#javascript_tabstop option[value="' + localStorage.javascript_tabstop + '"]').selected = true;
    hljs.initHighlighting();
});

function loadCSS(uri) {
    var link = document.createElement('link');
    link.setAttribute('type', 'text/css');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('media', 'screen');
    link.setAttribute('href', chrome.extension.getURL(uri));
    document.head && document.head.appendChild(link);
};

