document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('theme').addEventListener('change', function(e){
        var theme = e.target.options[e.target.selectedIndex].value;
        _(document.querySelectorAll('link')).last().href = '/css/' + theme + '.css';
        localStorage['theme'] = theme;
    });

    var select = document.getElementById('theme');
    if (!localStorage['theme'] || localStorage['theme'] == '') localStorage['theme'] = 'sunburst';
    _(select.options).detect(function(i) {
        return i.value == localStorage['theme'];
    }).selected = true;
    var el = document.createElement('link');
    el.href = 'css/' + localStorage['theme'] + '.css';
    el.type = "text/stylesheet";
    el.rel = "stylesheet";
    document.getElementsByTagName('head')[0].appendChild(el);
    hljs.initHighlighting('javascript');
}, true);

