document.addEventListener("DOMContentLoaded", function() {
    if(!localStorage['theme'] || localStorage['theme'] == '') localStorage['theme'] = 'sunburst';
    if(!localStorage['font'] || localStorage['font'] == '') localStorage['font'] = 'Inconsolata';
    
    document.getElementById('theme').addEventListener('change', function(e){
        var theme = e.target.options[e.target.selectedIndex].value;
        _(document.querySelectorAll('link')).last().href = '/css/' + theme + '.css';
        localStorage['theme'] = theme;
    });

    document.getElementById('font').addEventListener('change', function(e){
        var font = e.target.options[e.target.selectedIndex].value;
        document.querySelector('code').style.fontFamily = font;
        document.querySelector('#line-numbers').style.fontFamily = font;
        localStorage['font'] = font;
    });

    document.getElementById('show-line-numbers').addEventListener('change', function(e){
        var show_line_numbers = e.target.checked;
        document.getElementById('line-numbers').style.display = (show_line_numbers ? 'block' : 'none');
        localStorage['show-line-numbers'] = show_line_numbers;
    });

    var select = document.getElementById('theme');
    _(select.options).detect(function(i) {
        return i.value == localStorage['theme'];
    }).selected = true;
    select = document.getElementById('font');
    _(select.options).detect(function(i) {
        return i.value == localStorage['font'];
    }).selected = true;
    document.querySelector('code').style.fontFamily = localStorage['font'];
    document.querySelector('#line-numbers').style.fontFamily = localStorage['font'];
    
    var show_line_numbers = eval(localStorage['show-line-numbers']);
    document.getElementById('show-line-numbers').checked = show_line_numbers;
    if (show_line_numbers) {
        document.getElementById('line-numbers').style.display = 'block';
    }
    else {
        document.getElementById('line-numbers').style.display = 'none';
    }
    
    var el = document.createElement('link');
    el.href = 'css/' + localStorage['theme'] + '.css';
    el.type = "text/css";
    el.rel = "stylesheet";
    document.head.appendChild(el);
    document.getElementsByTagName('code')[0].style.fontFamily = localStorage['font'];
    hljs.initHighlighting();
}, true);

