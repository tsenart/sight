document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('theme').addEventListener('change', function(e){
        var theme = e.target.options[e.target.selectedIndex].value;
        _(document.querySelectorAll('link')).last().href = '/css/' + theme + '.css';
        localStorage['theme'] = theme;
    });

    document.getElementById('font').addEventListener('change', function(e){
        var font = e.target.options[e.target.selectedIndex].value;
        document.getElementsByTagName('code')[0].style.fontFamily = font;
        localStorage['font'] = font;
    });


    var select = document.getElementById('theme');
    _(select.options).detect(function(i) {
        return i.value == localStorage['theme'];
    }).selected = true;
    select = document.getElementById('font');
    _(select.options).detect(function(i) {
        return i.value == localStorage['font'];
    }).selected = true;
    var el = document.createElement('link');
    el.href = 'css/' + localStorage['theme'] + '.css';
    el.type = "text/stylesheet";
    el.rel = "stylesheet";
    document.getElementsByTagName('head')[0].appendChild(el);
    document.getElementsByTagName('code')[0].style.fontFamily = localStorage['font'];
    hljs.initHighlighting();
}, true);

