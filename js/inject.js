var pres = document.querySelectorAll("pre");
RegExp.escape = function(str)
{
  var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g"); // .*+?|()[]{}\
  return str.replace(specials, "\\$&");
};

if (document.body && document.body.firstChild == pres[0] && document.querySelectorAll('link').length == 0) {
    chrome.extension.sendRequest({op: 'showPageAction'});
    var table = [
           "cpp", ["c", "h", "cpp", "c++", "hpp", "h++"],
           "csharp", ["cs"],
           "css", ["css"],
           "desktop", ["desktop"],
           "diff", ["diff", "patch"],
           "java", ["java", "class"],
           "javascript", ["js", "json"],
           "objc", ["m", "mm"],
           "perl", ["pl", "pm", "perl"],
           "php", ["php", "phtml", "phps"],
           "python", ["py"],
           "ruby", ["rakefile", "gemfile", "rb"],
           "html-xml", ["htm", "html", "xhtml", "xml", "atom", "rss"],
           "sql", ["sql"],
           "delphi", ["pas"],
           "bash", ["sh", "bash", "zsh", "shell"],
           "lisp", ["lsp", "lisp", "cl", "el", "scm"],
           "tex", ["tex"],
           "scala", ["scala", "scl", "sca", "scb"],
           "avrasm", ["asm", "s"],
           "lua", ["lua"],
           "smalltalk", ["st", "sm", "sll"]
    ];

    var extension = document.location.href.match(/\.(\w+)$/)
    if (extension && extension.length > 0) {
        extension = extension[1]
        for (var e = table.length - 1; e >= 0; e -= 2)
            if (table[e].some(function(g) { return extension == g })) {
                var lang = table[e - 1];
                break;
            }
    }
    if (!lang) {
        var url = document.location.href.split('/').pop().toLowerCase();
        for (var e = table.length - 1; e >= 0; e -= 2)
            if (table[e].some(function(g) { return url.match(new RegExp(RegExp.escape('.' + g))) })) {
                var lang = table[e - 1];
                extension = table[e].filter(function(g) { return url.match(new RegExp(RegExp.escape('.' + g))) })[0]
            }

    }

    if (!lang) {
        var req = new XMLHttpRequest();
        req.open("HEAD", document.location.href, false);
        req.onreadystatechange = function() {
            if (req.readyState == 4) {
                var hdr = req.getResponseHeader('Content-Type').toLowerCase().split(';').shift().split('/').pop();
                lang = table.filter(function(i){ return typeof i == 'string' && hdr.match(new RegExp(RegExp.escape(i))) }).pop();
                if (!lang) {
                    lang = table.filter(function(i){
                        return typeof i == 'object' && i.some(function(g) { return hdr.match(new RegExp(RegExp.escape(g))) })
                    }).pop();
                    if (lang.length > 0) lang = lang[0];
                }
            }
        };
        req.send(null);
    }
    if (!document.getElementsByTagName('head')[0]) {
        var head = document.createElement('head');
        document.getElementsByTagName('html')[0].insertBefore(head, document.getElementsByTagName('html')[0].getElementsByTagName('*')[0]);
    }
    else {
        var head = document.getElementsByTagName('head')[0];
    }

    if (extension && extension == 'json') {
        pres[0].innerHTML = JSON.stringify(JSON.parse(pres[0].innerHTML), null, 4);
    }
    
    if (lang && lang != '') {
        if (!!console) console.log('Language: ' + lang);
        chrome.extension.sendRequest({op: 'highlight', language: lang});
    }
}