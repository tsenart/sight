(function(doc) {
  doc.addEventListener('DOMContentLoaded', function() {
    var themeEl = doc.getElementById('theme');
    var familyEl  = doc.getElementById('family');
    var sizeEl  = doc.getElementById('size');
    var lineHeightEl  = doc.getElementById('lineHeight');
    var lineNumbersEl  = doc.getElementById('lineNumbers');
    var styleEl = doc.querySelector('link:last-of-type');
    var codeEl = doc.getElementById('code');
    var code = codeEl.textContent;

    function getOptions(callback) {
      chrome.extension.sendRequest({ options: null }, callback);
    }

    function setOptions(options, callback) {
      chrome.extension.sendRequest({ options: options }, callback);
    }

    function applyTheme(theme) {
      styleEl.href = '/css/' + theme + '.css';
    }

    function applyFamily(family) {
      codeEl.style.fontFamily = family;
    }

    function applySize(size) {
      codeEl.style.fontSize = size + 'px';
    }

    function applyLineHeight(lineHeight) {
      codeEl.style.lineHeight = lineHeight + 'em';
    }

    function applyLineNumbers(enabled) {
      codeEl.innerHTML = code;
      hljs.highlightBlock(codeEl, '  ', false, enabled);
    }

    themeEl.addEventListener('change', function() {
      var theme = themeEl.options[themeEl.selectedIndex].value;
      setOptions({ theme: theme }, applyTheme.bind(null, theme));
    });

    familyEl.addEventListener('change', function() {
      var family = familyEl.options[familyEl.selectedIndex].value;
      setOptions({ family: family }, applyFamily.bind(null, family));
    });

    sizeEl.addEventListener('change', function() {
      var size = sizeEl.options[sizeEl.selectedIndex].value;
      setOptions({ size: size }, applySize.bind(null, size));
    });

    lineHeightEl.addEventListener('change', function() {
      var lineHeight = lineHeightEl.options[lineHeightEl.selectedIndex].value;
      setOptions({ lineHeight: lineHeight }, applyLineHeight.bind(null, lineHeight));
    });

    lineNumbersEl.addEventListener('change', function() {
      var enabled = lineNumbersEl.checked;
      setOptions({ lineNumbers: enabled }, applyLineNumbers.bind(null, enabled));
    });

    getOptions(function(options) {
      var lineNumbers = JSON.parse(options.lineNumbers);
      themeEl.value = options.theme;
      familyEl.value = options.family;
      sizeEl.value = options.size;
      lineHeightEl.value = options.lineHeight;
      lineNumbersEl.checked = options.lineNumbers;
      applyTheme(options.theme);
      applyFamily(options.family);
      applySize(options.size);
      applyLineHeight(options.lineHeight);
      applyLineNumbers(lineNumbers);
    });
  });
}(window.document));
