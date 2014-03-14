(function(doc) {
  doc.addEventListener('DOMContentLoaded', function() {
    var themeEl = doc.getElementById('theme');
    var fontEl  = doc.getElementById('font');
    var fontSizeEl = doc.getElementById('font-size');
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

    function applyFont(font) {
      codeEl.style.fontFamily = font;
    }

    function applyFontSize(fontSize) {
      codeEl.style.fontSize = fontSize;
    }

    themeEl.addEventListener('change', function() {
      var theme = themeEl.options[themeEl.selectedIndex].value;
      setOptions({ theme: theme }, applyTheme.bind(null, theme));
    });

    fontEl.addEventListener('change', function() {
      var font = fontEl.options[fontEl.selectedIndex].value;
      setOptions({ font: font }, applyFont.bind(null, font));
    });

    fontSizeEl.addEventListener('change', function() {
      var fontSize = fontSizeEl.options[fontSizeEl.selectedIndex].value;
      setOptions({ fontSize: fontSize }, applyFontSize.bind(null, fontSize));
    });

    getOptions(function(options) {
      themeEl.value = options.theme;
      fontEl.value = options.font;
      fontSizeEl.value = options.fontSize;
      applyTheme(options.theme);
      applyFont(options.font);
      applyFontSize(options.fontSize);
      hljs.highlightBlock(codeEl)
    });
  });
}(window.document));
