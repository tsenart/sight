(function() {
  const LANG_MAP = {
    avrasm:      ['asm', 's'],
    bash:        ['sh', 'bash', 'zsh', 'shell'],
    cmake:       ['Makefile'],
    coffeescript:['coffee'],
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
    objectivec:  ['m', 'mm'],
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

  const OPTIONS_DEFAULTS = {
    theme: 'sunburst',
    font: 'Inconsolata',
    lineNumbers: false
  };

  ['theme', 'font', 'lineNumbers'].forEach(function(option) {
    if (localStorage.getItem(option) === null) {
      localStorage.setItem(option, OPTIONS_DEFAULTS[option]);
    }
  });

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

  function getFilenamePartsFromUrl(url) {
    return url.split('/').pop().split('?').shift().toLowerCase().split('.');
  }

  function detectLanguage(identifiers) {
    var language, index, length;

    for (language in LANG_MAP) {
      length = LANG_MAP[language].length;
      for (index = 0; index < length; index++) {
        if (LANG_MAP[language].some(function(token) {
          return identifiers.indexOf(token) > -1;
        })) {
          return language;
        }
      }
    }
    return null;
  }

  function getHighlightingCode(font, language, showLineNumbers) {
    var code = 'document.body.style.fontFamily = "' + font + '";';
    code += 'var container = document.querySelector("pre");';
    code += 'container.classList.add("' + language + '");';
    code += 'hljs.highlightBlock(container, "  ", false, ' + showLineNumbers + ');';
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
        lineNumbers: localStorage.getItem('lineNumbers')
      });
    } else {
      for (var option in request.options) {
        localStorage.setItem(option, request.options[option]);
      }
      sendResponse();
    }
  });

  chrome.webRequest.onCompleted.addListener(function(details) {
    var language, contentType = getContentTypeFromHeaders(details.responseHeaders);

    if (contentType !== 'html') {
      language = detectLanguage(getFilenamePartsFromUrl(details.url).concat(contentType));

      if (language) {
        chrome.tabs.insertCSS(details.tabId, { file: 'css/reset.css' });
        chrome.tabs.insertCSS(details.tabId, { file: 'css/main.css' });
        chrome.tabs.insertCSS(details.tabId, { file: 'css/' + localStorage.getItem('theme') + '.css' });
        chrome.tabs.executeScript(details.tabId, { file: 'js/lib/highlight.js' }, function() {
          chrome.tabs.executeScript(details.tabId, { file: 'js/languages/' + language + '.js' }, function() {
            if (/javascript|json/.test(language)) {
              chrome.tabs.executeScript(details.tabId, { file: 'js/lib/beautify.js' }, function() {
                chrome.tabs.executeScript(details.tabId, { code: JS_BEUTIFY_CODE }, function() {
                  chrome.tabs.executeScript(details.tabId, {
                    code: getHighlightingCode(localStorage.getItem('font'), language, localStorage.getItem('lineNumbers'))
                  });
                });
              });
            } else {
              chrome.tabs.executeScript(details.tabId, {
                code: getHighlightingCode(localStorage.getItem('font'), language, localStorage.getItem('lineNumbers'))
              });
            }
          });
        });
      }
    }
  }, { urls: ["<all_urls>"], types: ['main_frame'] }, ['responseHeaders']);
}());
