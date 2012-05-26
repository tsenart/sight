(function() {
  var LANG_MAP = {
    avrasm:      ['asm', 's'],
    bash:        ['sh', 'bash', 'zsh', 'shell'],
    cmake:       ['Makefile'],
    cofeescript: ['coffee'],
    cpp:         ['c', 'h', 'cpp', 'c++', 'hpp', 'h++'],
    cs:          ['cs'],
    css:         ['css'],
    d:           ['d', 'dd', 'di'],
    delphi:      ['pas'],
    desktop:     ['desktop'],
    diff:        ['diff', 'patch'],
    erlang:      ['erl', 'erlang'],
    go:          ['go'],
    haskell:     ['hs'],
    http:        ['http'],
    java:        ['java', 'class', 'fx'],
    javascript:  ['js'],
    json:        ['json'],
    lisp:        ['lsp', 'lisp', 'cl', 'el', 'scm', 'clj'],
    lua:         ['lua'],
    markdown:    ['md', 'markdown'],
    objc:        ['m', 'mm'],
    perl:        ['pl', 'pm', 'perl'],
    php:         ['php', 'phtml', 'phps'],
    python:      ['py', 'pyc'],
    r:           ['r'],
    ruby:        ['rakefile', 'gemfile', 'rb'],
    scala:       ['scala', 'scl', 'sca', 'scb'],
    smalltalk:   ['st', 'sm', 'sll'],
    sql:         ['sql'],
    tex:         ['tex'],
    xml:         ['htm', 'html', 'xhtml', 'shtml', 'xml', 'atom', 'rss', 'vsproj', 'csproj', 'build', 'wsdl', 'config', 'xsd', 'plist', 'xib'],
    yaml:        ['yaml']
  };

  var DEFAULT_THEME = 'sunburst';
  var DEFAULT_FONT  = 'Inconsolata';

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

    if (contentType) {
      return contentType.split('/').pop().split(';').shift().trim();
    } else {
      return null;
    }
  }

  function getFilenameOrExtensionFromUrl(url) {
    var identifiers = url.split('/').pop().split('?').shift().toLowerCase().split('.');
    return (identifiers[1] || identifiers[0]).trim();
  }

  function detectLanguage(identifier) {
    var language, index, length;

    for (language in LANG_MAP) {
      length = LANG_MAP[language].length;
      for (index = 0; index < length; index++) {
        if (LANG_MAP[language][index] === identifier) {
          return language;
        }
      }
    }
    return null;
  }

  function getHighlightingCode(font, language) {
    var code = 'document.body.style.fontFamily = "' + font + '";';
    code += 'var container = document.querySelector("pre");';
    code += 'container.classList.add("' + language + '");';
    code += 'hljs.highlightBlock(container, "  ", false);';
    return code;
  }

  function getJSBeautifierCode() {
    var code = 'var container = document.querySelector("pre");';
    code += 'var options = { indent_size: 2 };';
    code += 'container.textContent = js_beautify(container.textContent, options);';
    return code;
  }

  chrome.webRequest.onCompleted.addListener(function(details) {
    var identifier, contentType, language, font, theme;

    contentType = getContentTypeFromHeaders(details.responseHeaders);

    if (contentType !== 'html') {
      identifier = getFilenameOrExtensionFromUrl(details.url) || contentType;
      language   = detectLanguage(identifier);
      font       = localStorage.font || DEFAULT_FONT;
      theme      = localStorage.theme || DEFAULT_THEME;

      if (language) {
        chrome.tabs.insertCSS(details.tabId, { file: 'css/reset.css' });
        chrome.tabs.insertCSS(details.tabId, { file: 'css/main.css' });
        chrome.tabs.insertCSS(details.tabId, { file: 'css/' + theme + '.css' });
        chrome.tabs.executeScript(details.tabId, { file: 'js/lib/highlight.js' }, function() {
          chrome.tabs.executeScript(details.tabId, { file: 'js/languages/' + language + '.js' }, function() {
            if (/javacript|json/.test(language)) {
              chrome.tabs.executeScript(details.tabId, { file: 'js/lib/beautify.js' }, function() {
                chrome.tabs.executeScript(details.tabId, { code: getJSBeautifierCode() }, function() {
                  chrome.tabs.executeScript(details.tabId, { code: getHighlightingCode(font, language) });
                });
              });
            } else {
              chrome.tabs.executeScript(details.tabId, { code: getHighlightingCode(font, language) });
            }
          });
        });
      }
    }
  }, { urls: ["<all_urls>"], types: ['main_frame'] }, ['responseHeaders']);
}());
