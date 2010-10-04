if (window.ActiveXObject) var request = new ActiveXObject("Msxml2.XMLHTTP");
else if (window.XMLHttpRequest) request = new XMLHttpRequest;
request.open("HEAD", document.location.pathname, false);
request.onreadystatechange = function() {
    if (request.readyState == 4) {
        var a = request.getResponseHeader("content-disposition");
        if (! (a == null || a == "" || !a.match(/^inline/))) {
            var b = a.match(/filename="(.*)"/);
            if (b != null && b.length == 2) {
                b = b[1].toLowerCase();
                var c = b.split(".").pop()
            }
        }
        if(!b) {
            var b = document.location.pathname.split("/").pop().toLowerCase();
            var c = b.split(".").pop()
        }
        if(b) {
                a = ["bison", ["ypp", "y++", "y"], "c", ["c"], "cpp", ["cpp", "c++"], "csharp", ["cs"], "changelog", ["changelog", "changelog.txt", "changes", "history"], "css", ["css"], "desktop", ["desktop"],"diff",["diff", "patch"], "html", ["htm", "html", "xhtml"], "java", ["java"], "javascript",["js"], "perl", ["pl", "pm"], "php", ["php", "phtml"], "python", ["py"], "ruby", ["rakefile", "gemfile", "rb"], "xml", ["xml"]];
                for (var e =
                a.length - 1; e >= 0; e -= 2) if (a[e].some(function(g) {
                    return g == b || g == c
                })) {
                    var d = a[e - 1];
                    break
                }
                a = document.getElementsByTagName("pre");
                if(a.length == 1) {
                    a[0].className = "sh_" + d;
                    sh_highlightDocument();
                    document.body.style.setProperty("background-color", window.getComputedStyle(a[0]).getPropertyValue("background-color"))
                }
            }
    }
};
request.send(null);