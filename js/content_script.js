var isSighted = document.body.classList.contains('sighted');
var isNormalPage = !(document.body && document.body.firstChild.tagName == 'PRE'
                   && document.body.childElementCount == 1
                   && document.head && document.head.childElementCount == 0);
if (!isNormalPage || isSighted) chrome.extension.sendRequest({preferences: true}, function(response) {
    var prefs = response;
    var lang = prefs.lang;

    RegExp.escape = function(str)
    {
      var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g"); // .*+?|()[]{}\
      return str.replace(specials, "\\$&");
    };

    function handleKeyboardShortcuts(e) {
        if (e.keyCode == 76) toggleLineNumbers();
        else if (e.keyCode == 71) lineNumbersJump();
    }

    function lineNumbersJump(e) {
        var line_numbers = document.querySelector('#line-numbers');
        if (!line_numbers || getComputedStyle(line_numbers).display == 'none') return;
        var line = prompt("Go to line number...", "");
        var el = document.querySelector('#line-' + line);
        el && el.scrollIntoViewIfNeeded();
    }

    function activateLineNumbers() { // Call one time only!
        var line_numbers = document.querySelector('#line-numbers');
        line_numbers && line_numbers.parentNode.removeChild(line_numbers);
        var code = document.querySelector('pre');
        var nlines = code.innerText.split(/\n/).length;
        line_numbers = document.createElement('ul');
        line_numbers.setAttribute('id', 'line-numbers');
        for(i = 1; i <= nlines; ++i) {
            var li = document.createElement('li')
            li.setAttribute('id', 'line-' + i);
            li.textContent = i;
            line_numbers.appendChild(li);
        }
        document.body.insertBefore(line_numbers, code);
    }

    function toggleLineNumbers() {
        var line_numbers = document.querySelector('#line-numbers');
        !!line_numbers && line_numbers.style.setProperty('display', {
            'block': 'none',
            '': 'none',
            'none': 'block'
        }[window.getComputedStyle(line_numbers).display]);
    }


    if (!lang) {
        var table = [
               "cpp", ["c", "h", "cpp", "c++", "hpp", "h++"],
               "cs", ["cs"],
               "css", ["css"],
               "desktop", ["desktop"],
               "diff", ["diff", "patch"],
               "java", ["java", "class", "fx"],
               "javascript", ["js", "json"],
               "objc", ["m", "mm"],
               "perl", ["pl", "pm", "perl"],
               "php", ["php", "phtml", "phps"],
               "python", ["py"],
               "ruby", ["rakefile", "gemfile", "rb"],
               "html", ["htm", "html", "xhtml"],
               "xml", ["xml", "atom", "rss", "vsproj", "csproj", "build", "wsdl", "config", "xsd", "plist", "xib"],
               "sql", ["sql"],
               "delphi", ["pas"],
               "bash", ["sh", "bash", "zsh", "shell"],
               "lisp", ["lsp", "lisp", "cl", "el", "scm"],
               "tex", ["tex"],
               "scala", ["scala", "scl", "sca", "scb"],
               "avrasm", ["asm", "s"],
               "lua", ["lua"],
               "yaml", ["yaml"],
               "smalltalk", ["st", "sm", "sll"]
        ];

        var base = document.location.href.split('?').shift().split('/').pop().toLowerCase();
        var extension = base.match(/\w+\.(\w+)/) || base.match(/format=(\w+)/);

        if (extension && extension.length > 0) {
            extension = extension.pop()
            for (var e = table.length - 1; e >= 0; e -= 2)
                if (table[e].some(function(g) { return extension == g })) {
                    lang = table[e - 1];
                    break;
                }
        }

        if (!lang) {
            for (var e = table.length - 1; e >= 0; e -= 2)
                if (table[e].some(function(g) {
                    return base.match(new RegExp(RegExp.escape('.' + g) + '\\W'))
                })) {
                    lang = table[e - 1];
                    extension = table[e].filter(function(g) {
                        return base.match(new RegExp(RegExp.escape('.' + g) + '\\W'))
                    })[0];
                    break;
                }

        }

        if (!lang) {
            var req = new XMLHttpRequest();
            req.open("HEAD", document.location.href, false);
            req.onreadystatechange = function() {
                if (req.readyState == 4 && req.status >= 200 && req.status < 300) {
                    var content_type = req.getResponseHeader('Content-Type');
                    if (content_type && content_type.length > 0) {
                        content_type = content_type.toLowerCase().split(';').shift().split('/').pop();
                        lang = table.filter(function(i){
                            return typeof i == 'string' && content_type.match(new RegExp(RegExp.escape(i)))
                        }).shift();
                        if (!lang) {
                            lang = table.filter(function(i){
                                return typeof i == 'object' && i.some(function(g) {
                                    return g == content_type.trim()
                                })
                            }).shift();
                            if (lang && lang.length > 0) lang = table[table.indexOf(lang) - 1];
                        }

                    }
                }
            };
            req.send(null);
        }
    }
    chrome.extension.sendRequest({lang: lang});
    if (!lang) return;

    // Reset CSS and add Sight styles
    document.body.style.display = 'none';
    var list = document.querySelectorAll('style, link');
    for(var i = 0; i < list.length; ++i)
        list[i].parentNode.removeChild(list[i]);
    loadCSS('css/reset.css');
    loadCSS('css/main.css');
    loadCSS('css/' + prefs.theme + '.css');


    // Inject highlight.js and the associated lang file.
    chrome.extension.sendRequest({inject: 'js/highlight.js'}, function(code) {
        eval(code);
        chrome.extension.sendRequest({inject: 'js/languages/' + lang + '.js'}, function(code) {
            eval(code);
            document.body.style.fontFamily = prefs.font;
            var code = document.querySelector('pre');
            var original = document.querySelector('#original');
            if (!original) {
                original = document.createElement('div');
                original.setAttribute('id', 'original');
                original.style.display = 'none';
                original.innerHTML = code.innerHTML;
                document.body.appendChild(original);
            }
            code.innerHTML = original.innerHTML;
            if(lang == 'javascript')
                code.textContent = js_beautify(code.textContent, {preserve_newlines: true});
            code.innerHTML = '<code>' + code.innerHTML + '</code>';
            code.classList.add(lang);
            hljs.highlightBlock(code.firstChild, '    ', false);

            if (!isSighted) {
                activateLineNumbers();
                !!eval(prefs.line_numbers) && toggleLineNumbers();
                document.onkeyup = handleKeyboardShortcuts;
            }

            document.body.classList.add('sighted');
            document.body.style.display = 'block';
        });
    });

    function loadCSS(uri) {
        var link = document.createElement('link');
        link.setAttribute('type', 'text/css');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('media', 'screen');
        link.setAttribute('href', chrome.extension.getURL(uri));
        document.head && document.head.appendChild(link);
    };

});
