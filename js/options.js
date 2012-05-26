document.addEventListener("DOMContentLoaded", function() {
  var codeContainer = document.querySelector('pre');

  document.getElementById('theme').addEventListener('change', function(e){
    var theme = e.target.options[e.target.selectedIndex].value;
    document.querySelector('link:last-of-type').href = '/css/' + theme + '.css';
    localStorage.theme = theme;
  });

  document.getElementById('font').addEventListener('change', function(e){
    var font = e.target.options[e.target.selectedIndex].value;
    codeContainer.style.fontFamily = font;
    localStorage.font = font;
  });

  loadCSS('css/' + localStorage.theme + '.css');
  document.querySelector('#theme option[value="' + localStorage.theme + '"]').selected = true;
  document.querySelector('#font option[value="' + localStorage.font + '"]').selected = true;
  hljs.highlightBlock(codeContainer, '  ', false);
});

function loadCSS(uri) {
  var link = document.createElement('link');
  link.setAttribute('type', 'text/css');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('media', 'screen');
  link.setAttribute('href', chrome.extension.getURL(uri));
  document.head && document.head.appendChild(link);
};

