var filename = document.location.pathname.split("/").pop().toLowerCase();
var extension = filename.split(".").pop().toLowerCase();
var pres = document.getElementsByTagName("pre");
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
           "perl", ["pl", "pm", "perl"],
           "php", ["php", "phtml"],
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
    }
    
    if(extension && extension == 'json') {
        document.body.firstChild.innerHTML = JSON.stringify(JSON.parse(document.body.firstChild.innerHTML), null, 4);
    }
    document.body.firstChild.innerHTML = '<code>' + document.body.firstChild.innerHTML + '</code>';
    chrome.extension.sendRequest({key: 'plaintext', op: 'set', value: document.body.firstChild == pres[0]});
    chrome.extension.sendRequest({op: 'highlight', language: lang});
}
else {
    chrome.extension.sendRequest({key: 'plaintext', op: 'set', value: document.body.firstChild == pres[0]});
}
