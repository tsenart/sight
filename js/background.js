(function() {
  const LANG_EXT_MAP = {
    applescript: ['applescript'],
    avrasm:      ['asm', 's'],
    bash:        ['sh', 'bash', 'zsh', 'shell'],
    brainfuck:   ['bf'],
    clojure:     ['clj'],
    coffeescript:['coffee'],
    cpp:         ['c', 'h', 'cpp', 'c++', 'hpp', 'h++'],
    cs:          ['cs'],
    css:         ['css'],
    d:           ['d', 'dd', 'di'],
    delphi:      ['pas'],
    desktop:     ['desktop'],
    diff:        ['diff', 'patch'],
    erlang:      ['erl', 'erlang'],
    fsharp:      ['fs'],
    go:          ['go'],
    haml:        ['haml'],
    haskell:     ['hs'],
    http:        ['http'],
    java:        ['java', 'class', 'fx', 'groovy', 'gsh', 'gvy', 'gy'],
    javascript:  ['js'],
    json:        ['json'],
    lisp:        ['lsp', 'lisp', 'cl', 'el', 'scm'],
    lua:         ['lua'],
    makefile:    ['Makefile'],
    markdown:    ['md', 'markdown'],
    objectivec:  ['m', 'mm'],
    ocaml:       ['ml'],
    perl:        ['pl', 'pm', 'perl'],
    php:         ['php', 'phtml', 'phps'],
    python:      ['py', 'pyc'],
    r:           ['r'],
    ruby:        ['rakefile', 'gemfile', 'rb'],
    scala:       ['scala', 'scl', 'sca', 'scb'],
    smalltalk:   ['st', 'sm', 'sll'],
    sql:         ['sql'],
    tex:         ['tex'],
    vhdl:        ['vhd', 'vhdl'],
    xml:         ['htm', 'html', 'xhtml', 'shtml', 'xml', 'atom', 'rss', 'vsproj', 'csproj', 'build', 'wsdl', 'config', 'xsd', 'plist', 'xib'],
    yaml:        ['yaml']
  };

  const OPTIONS_DEFAULTS = {
    theme: 'sunburst',
    font: 'Inconsolata',
    fontSize: 'medium'
  };

  ['theme', 'font', 'fontSize'].forEach(function(option) {
    if (localStorage.getItem(option) === null) {
      localStorage.setItem(option, OPTIONS_DEFAULTS[option]);
    }
  });

  // Reverse index
  const EXT_LANG_MAP = {};
  for (lang in LANG_EXT_MAP) {
    LANG_EXT_MAP[lang].forEach(function(ext) {
      EXT_LANG_MAP[ext] = lang;
    });
  }

  function getHeaderByName(headers, name) {
    var index, length = headers.length;
    for (index = 0; index < length; index++) {
      if (headers[index].name.toLowerCase() === name) {
        return headers[index].value;
      }
    }
    return null;
  }

  function getContentTypeFromHeaders(headers) {
    var contentType = getHeaderByName(headers, 'content-type');
    if (!contentType) {
      return null;
    }
    return contentType.split(';').shift().split('/').pop().trim();
  }

  function getFilenameFromUrl(url) {
    return url.split('/').pop().split('?').shift().toLowerCase();
  }

  function getExtensionFromFilename(filename) {
    return filename.split('.').pop();
  }

  function getFragmentFromUrl(url) {
    var fragment = /#ft=(\w+)/.exec(url);
    return fragment && fragment[1];
  }

  function isLanguageSupported(language) {
    return !!LANG_EXT_MAP[language];
  }

  function detectLanguage(contentType, url) {
    var fragment = getFragmentFromUrl(url);
    var filename = getFilenameFromUrl(url);
    var extension = getExtensionFromFilename(filename);

    return isLanguageSupported(fragment) ?
      fragment : EXT_LANG_MAP[contentType] ||
                 EXT_LANG_MAP[extension]   ||
                 EXT_LANG_MAP[filename];
  }

  function getHighlightingCode(font, fontSize, language) {
    var code = 'document.body.style.fontFamily = "' + font + '";';
    code += 'document.body.style.fontSize = "' + fontSize + '";';
    code += 'var container = document.querySelector("pre");';
    code += 'container.classList.add("' + language + '");';
    code += 'hljs.highlightBlock(container);';
    return code;
  }

  const JS_BEUTIFY_CODE =
    'var container = document.querySelector("pre");' +
    'var options = { indent_size: 2 };' +
    'container.textContent = js_beautify(container.textContent, options);';

  chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.options === null) {
      sendResponse({
        theme: localStorage.getItem('theme'),
        font: localStorage.getItem('font'),
        fontSize: localStorage.getItem('fontSize')
      });
      return;
    }
    for (var option in request.options) {
      localStorage.setItem(option, request.options[option]);
    }
    sendResponse();
  });

  chrome.webRequest.onCompleted.addListener(function(details) {
    var contentType = getContentTypeFromHeaders(details.responseHeaders);
    if (['html', 'xml'].indexOf(contentType) != -1) {
      return;
    }

    var language = detectLanguage(contentType, details.url);
    if (!language) {
      return;
    }

    var styles  = [
      { file: 'css/reset.css' },
      { file: 'css/main.css' },
      { file: 'css/' + localStorage.getItem('theme') + '.css' }
    ];

    var scripts = [
      { file: 'js/lib/highlight.js' },
      { file: 'js/languages/' + language + '.js' }
    ];

    if (/json/.test(language)) {
      scripts.push(
        { file: 'js/lib/beautify.js' },
        { code: JS_BEUTIFY_CODE }
      );
    }

    scripts.push(
      { code: getHighlightingCode(localStorage.getItem('font'), localStorage.getItem('fontSize'), language) }
    );

    for (var i = 0; i < styles.length; i++) {
      chrome.tabs.insertCSS(details.tabId, styles[i]);
    }

    (function chain(i) {
      if (i == scripts.length) { return; }
      chrome.tabs.executeScript(details.tabId, scripts[i], function() {
        chain(i + 1);
      });
    }(0))
  }, { urls: ['<all_urls>'], types: ['main_frame'] }, ['responseHeaders']);
}());
