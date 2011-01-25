var filename = document.location.pathname.split("/").pop().toLowerCase();
var extension = filename.split(".").pop().toLowerCase();
var pres = document.querySelectorAll("pre");

if((extension && extension == filename) || !extension || extension.length == 0) {
    var req = new XMLHttpRequest();
    req.open("HEAD", document.location.href, false);
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            extension = req.getResponseHeader('Content-Type').toLowerCase().split(';').shift().split('/').pop();
        }
    };
    req.send(null);
}

if(filename && pres.length > 0 && document.body.firstChild == pres[0]) {
    if(!document.getElementsByTagName('head')[0]) {
        var head = document.createElement('head');
        document.getElementsByTagName('html')[0].insertBefore(head, document.getElementsByTagName('html')[0].getElementsByTagName('*')[0]);
    }
    else {
        var head = document.getElementsByTagName('head')[0];
    }
        
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
    
    for (var e = table.length - 1; e >= 0; e -= 2) {
        if (table[e].some(function(g) { return g == filename || g == extension })) {
            var lang = table[e - 1];
            break;
        }
        else if (table[e - 1].match(new RegExp(extension))) {
            var lang = extension;
            break;
        }
    }
    
    if (extension && extension == 'json') {
        pres[0].innerHTML = JSON.stringify(JSON.parse(pres[0].innerHTML), null, 4);
    }
    pres[0].innerHTML = '<code>' + pres[0].innerText + '</code>';
    chrome.extension.sendRequest({op: 'highlight', language: lang});
}
