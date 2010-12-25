var filename = _(document.location.pathname.split("/")).last().toLowerCase();
var extension = _(filename.split(".")).last();
var pres = document.getElementsByTagName("pre");
if(filename && pres.length > 0 && document.body.firstChild == pres[0]) {

    var table = [
        "cpp", ["c", "h", "cpp", "c++", "hpp", "h++"],
        "csharp", ["cs"],
        "css", ["css"],
        "desktop", ["desktop"],
        "diff", ["diff", "patch"],
        "java", ["java", "class"],
        "javascript", ["js", "json"],
        "perl", ["pl", "pm", "perl"],
        "php", ["php", "phtml"],
        "python", ["py"],
        "ruby", ["rakefile", "gemfile", "rb"],
        "html-xml", ["htm", "html", "xhtml", "xml", "atom", "rss"]
    ];
   
    for (var e = table.length - 1; e >= 0; e -= 2) {
        if (_(table[e]).any(function(g) { return g == filename || g == extension })) {
            var lang = table[e - 1];
            break;
        }
    }

    if(!document.getElementsByTagName('head')[0]) {
        var head = document.createElement('head');
        document.getElementsByTagName('html')[0].insertBefore(head, document.getElementsByTagName('html')[0].getElementsByTagName('*')[0]);
    }
    else {
        var head = document.getElementsByTagName('head')[0];
    }

    document.body.className = 'highlight'; // Some conditions to come
    document.body.firstChild.innerHTML = '<code>' + document.body.firstChild.innerHTML + '</code>';

    var el = document.createElement('link');
    el.href = chrome.extension.getURL( 'css/main.css');
    el.type = "text/stylesheet"; el.rel = "stylesheet";
    head.appendChild(el);

    chrome.extension.sendRequest({key: "theme"}, function(msg) {
        var theme = msg.value;
        el = document.createElement('link');
        el.href = chrome.extension.getURL( 'css/' + msg.value + '.css');
        el.type = "text/stylesheet"; el.rel = "stylesheet";
        head.appendChild(el);
    });


    hljs.tabReplace = '    ';
    if(lang != undefined && lang != '') {
        chrome.extension.sendRequest({key: "include", path: 'js/languages/' + lang + '.js'}, function(msg) {
            eval(msg.value);
            hljs.initHighlighting(lang);
        });
        chrome.extension.sendRequest({key: "language", value: lang});
    }
    else {
        hljs.initHighlightingOnLoad();
    }

    chrome.extension.sendRequest({key: "page_action"});
}