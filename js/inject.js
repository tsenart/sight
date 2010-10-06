var filename = document.location.pathname.split("/").pop().toLowerCase();
var extension = filename.split(".").pop()
var pres = document.getElementsByTagName("pre");
if(filename && pres.length > 0 && document.body.firstChild == pres[0]) { 
    var table = [
      "bison", ["ypp", "y++", "y"],
      "c", ["c", "h"],
      "cpp", ["cpp", "c++", "hpp", "h++"],
      "csharp", ["cs"],
      "changelog", ["changelog", "changelog.txt", "changes", "history"],
      "css", ["css"],
      "desktop", ["desktop"],
      "diff", ["diff", "patch"],
      "html", ["htm", "html", "xhtml"],
      "java", ["java", "class"],
      "javascript_dom", ["js"],
      "perl", ["pl", "pm"],
      "php", ["php", "phtml"],
      "python", ["py"],
      "ruby", ["rakefile", "gemfile", "rb"],
      "xml", ["xml", "atom", "rss"]
    ];
    
    for (var e = table.length - 1; e >= 0; e -= 2) {
        if (table[e].some(function(g) { return g == filename || g == extension })) {
            var lang = table[e - 1];
            break
        }
    }
    document.body.className = 'sh_sourceCode';
    document.body.firstChild.className = "sh_" + lang;
    
    chrome.extension.sendRequest({key: "theme"}, function(msg) {
        var theme = msg.value;
        if(theme && theme != '') {
            var el = document.createElement('link');
            el.href = chrome.extension.getURL( 'css/sh_' + theme + '.min.css');
            el.type = "text/stylesheet"; el.rel = "stylesheet"; el.async = false;
            document.getElementsByTagName("head")[0].appendChild(el);
        }       
    });
    sh_highlightDocument();
}
