(function() {
  var LANG_EXT_MAP = sight.LANG_EXT_MAP;

  const BROWSER_CONTENT = ['htm', 'html', 'xml', 'xhtml', 'shtml'];

  var RENDER_CONFIG = sight.RENDER_CONFIG;

  const OPTIONS_DEFAULTS = {
    theme: 'sunburst',
    font: 'Inconsolata',
    fontSize: 'medium',
    lineNumbers: true,
    renderLanguages: JSON.stringify(RENDER_CONFIG)
  };

  const OPTIONS = Object.keys(OPTIONS_DEFAULTS);

  OPTIONS.forEach(function(option) {
    var value = localStorage.getItem(option) || OPTIONS_DEFAULTS[option];
    localStorage.setItem(option, value);
  });

  // Reverse index
  const EXT_LANG_MAP = {};
  for (var lang in LANG_EXT_MAP) {
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

  function detectLanguage(contentType, fragment, filename, extension) {
    if (BROWSER_CONTENT.indexOf(contentType) != -1) {
      return null;
    }
    return !!LANG_EXT_MAP[fragment] ?  fragment : EXT_LANG_MAP[contentType] ||
                                                  EXT_LANG_MAP[extension]   ||
                                                  EXT_LANG_MAP[filename];
  }

  function isExtensionEnabled(extension) {
    if (!EXT_LANG_MAP.hasOwnProperty(extension)) {
      return false;
    }
    var value = localStorage.getItem('renderLanguages') || OPTIONS_DEFAULTS['renderLanguages'];
    value = JSON.parse(value);

    if (typeof value != 'object') {
      return false;
    }

    console.log(value[EXT_LANG_MAP[extension]][extension]);

    if (value.hasOwnProperty(EXT_LANG_MAP[extension]) &&
        value[EXT_LANG_MAP[extension]].hasOwnProperty(extension) &&
        value[EXT_LANG_MAP[extension]][extension]) {
      return true;
    }

    return false;
  }

  function getHighlightingCode(font, fontSize, lineNumbers, language) {
    return 'document.body.style.fontFamily = "' + font + '";' +
      'document.body.style.fontSize = "' + fontSize + '";' +
      'var container = document.querySelector("pre");' +
      'container.classList.add("' + language + '");' +
      'hljs.configure({ lineNumbers: ' + lineNumbers + ' });' +
      'hljs.highlightBlock(container);' +
      'document.body.style.backgroundColor = getComputedStyle(container).backgroundColor;';
  }

  const JS_BEUTIFY_CODE =
    'var container = document.querySelector("pre");' +
    'var options = { indent_size: 2 };' +
    'container.textContent = js_beautify(container.textContent, options);';

  chrome.webRequest.onCompleted.addListener(function(details) {
    var contentType = getContentTypeFromHeaders(details.responseHeaders);
    var fragment = getFragmentFromUrl(details.url);
    var filename = getFilenameFromUrl(details.url);
    var extension = getExtensionFromFilename(filename);
    if (!isExtensionEnabled(extension)) {
      return;
    }
    var language = detectLanguage(contentType, fragment, filename, extension);
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

    scripts.push({
      code: getHighlightingCode.apply(this, ['font', 'fontSize', 'lineNumbers'].
        map(localStorage.getItem.bind(localStorage)).concat(language))
    });

    for (var i = 0; i < styles.length; i++) {
      chrome.tabs.insertCSS(details.tabId, styles[i]);
    }

    (function chain(i) {
      if (i == scripts.length) { return; }
      chrome.tabs.executeScript(details.tabId, scripts[i], chain.bind(null, i+1));
    }(0))
  }, { urls: ['<all_urls>'], types: ['main_frame'] }, ['responseHeaders']);
}());
