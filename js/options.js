(function(doc) {
  doc.addEventListener('DOMContentLoaded', function() {
    var themeEl = doc.getElementById('theme');
    var fontEl  = doc.getElementById('font');
    var lineNumbersEl  = doc.getElementById('lineNumbers');
    var styleEl = doc.querySelector('link:last-of-type');
    var codeEl = doc.getElementById('code');
    var fontSizeEl = doc.getElementById('fontSize');
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

    function applyLineNumbers(enabled) {
      codeEl.innerHTML = code;
      hljs.highlightBlock(codeEl, '  ', false, enabled);
    }

    themeEl.addEventListener('change', function() {
      var theme = themeEl.options[themeEl.selectedIndex].value;
      setOptions({ theme: theme }, applyTheme.bind(null, theme));
    });

    fontEl.addEventListener('change', function() {
      var font = fontEl.options[fontEl.selectedIndex].value;
      setOptions({ font: font }, applyFont.bind(null, font));
    });
	fontSizeEl.addEventListener('change',function(){
		var fontSize = fontSizeEl.options[fontSizeEl.selectedIndex].value;
		setOptions({fontSize:fontSize}, applyFontSize.bind(null, fontSize));
	});
    lineNumbersEl.addEventListener('change', function() {
      var enabled = lineNumbersEl.checked;
      setOptions({ lineNumbers: enabled }, applyLineNumbers.bind(null, enabled));
    });

    getOptions(function(options) {
      var lineNumbers = JSON.parse(options.lineNumbers);
      themeEl.value = options.theme;
      fontEl.value = options.font;
      lineNumbersEl.checked = lineNumbers;
	  fontSizeEl.value= options.fontSize;
     
      applyTheme(options.theme);
      applyFontSize(options.fontSize);
      applyFont(options.font);
      applyLineNumbers(lineNumbers);
    });
  });
}(window.document));
