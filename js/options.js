(function(doc) {
  function id(a) { return a }
  function eq(b) { return function(a) { return a === b } }
  function val(obj, key) { return obj[key] }
  function set(sel, path, fn) {
    var parts = path.split('.');
    var target = parts[parts.length-1];
    var parents = parts.slice(0, -1);
    return function(a) {
      var el = doc.querySelector(sel);
      parents.reduce(val, el)[target] = fn(a);
    }
  }

  function toggleArea(id) {
    var el = doc.getElementById(id);
    var isShow = true;

    if (typeof el != 'undefined') {
      if (el.style.display == 'none') {
        el.style.display = 'block';
      } else {
        el.style.display = 'none';
        isShow = false;
      }
    }

    return isShow;
  }

  function toggleLangConfig(lang) {
    var id = "lang-" + lang;
    toggleArea(id);
  }

  var options = {
    theme: {
      selector: '#theme',
      value: 'value',
      decode: id,
      render: set('link:last-of-type', 'href', function(value) {
        return '/css/' + value + '.css';
      })
    },
    font: {
      selector: '#font',
      value: 'value',
      decode: id,
      render: set('#code', 'style.fontFamily', id)
    },
    fontSize: {
      selector: '#font-size',
      value: 'value',
      decode: id,
      render: set('#code', 'style.fontSize', id)
    },
    lineNumbers: {
      selector: '#line-numbers',
      value: 'checked',
      decode: eq('true'),
      render: function(value) {
        var codeEl = doc.getElementById('code');
        hljs.configure({ lineNumbers: value });
        codeEl.innerHTML = codeEl.textContent;
        hljs.highlightBlock(codeEl);
      }
    },
    renderLanguages: {
      selector: '#render-languages',
      value: 'data-lang-config',
      decode: function(savedData) {
        try {
          var savedDataObj = JSON.parse(savedData);
          if (null == savedDataObj) {
            savedData = JSON.stringify(sight.RENDER_CONFIG);
            savedDataObj = JSON.parse(savedData);
          }
        } catch (e) {
          savedData = JSON.stringify(sight.RENDER_CONFIG);
          savedDataObj = JSON.parse(savedData);
        }

        if (typeof savedDataObj != 'object') {
          savedData = JSON.stringify(savedDataObj);
        }

        var renderConfig = savedDataObj;

        for (var lang in renderConfig) {
          if (renderConfig.hasOwnProperty(lang)) {
            var langInfo = renderConfig[lang];
            for (var ext in langInfo) {
              if (langInfo.hasOwnProperty(ext)) {
                var extInfo = langInfo[ext];
                if (extInfo) {
                  doc.getElementById("ext-" + ext).checked = true;
                }
              }
            }
          }
        }

        return savedData;
      },
      render: function(value) {
      },
      html: function() {
        var innerHTML = '<div>';

        for (var lang in sight.RENDER_CONFIG) {
          if (sight.RENDER_CONFIG.hasOwnProperty(lang)) {
            var langConfig =  sight.RENDER_CONFIG[lang];
            innerHTML += '<h4 class="lang-menu" data-lang="' + lang + '"><i class="' + sight.ICON_LANG_MAP[lang] + ' colored"></i>' + lang + '</h4>';
            innerHTML += '<div id="lang-' + lang +'" style="display: none;">';
            for (var ext in langConfig) {
              if (langConfig.hasOwnProperty(ext)) {
                innerHTML += '<input id="ext-' + ext + '" type="checkbox"/> ' + ext ;
              }
            }
            innerHTML += '</div>';
          }
        }

        innerHTML += '</div>';

        return innerHTML;
      },
      addEvent: function (el) {
        el.addEventListener('click', function(e) {
          if (e.target.className == "lang-menu") {
            toggleLangConfig(e.target.dataset.lang);
          }
        });
      },
      dataBuilder: function(value) {
        var data4Save = {};
        for (var lang in sight.RENDER_CONFIG) {
          if (sight.RENDER_CONFIG.hasOwnProperty(lang)) {
            var langInfo = sight.RENDER_CONFIG[lang];
            data4Save[lang] = {};
            for (var ext in langInfo) {
              var extDOM = doc.getElementById("ext-" + ext);
              if (extDOM.checked) {
                data4Save[lang][ext] = true;
              } else {
                data4Save[lang][ext] = false;
              }
            }
          }
        }
        return JSON.stringify(data4Save);
      },
      dataHolder: '#render-languages'
    }
  };

  doc.addEventListener('DOMContentLoaded', function() {
    Object.keys(options).forEach(function(name) {
      var opt = options[name];
      var el = doc.querySelector(opt.selector);

      if (opt.hasOwnProperty('html')) {
        el.innerHTML = (typeof opt.html == 'function' ? opt.html() : opt.html);
      }

      if (opt.hasOwnProperty('addEvent') && typeof opt.addEvent == 'function') {
        opt.addEvent(el);
      }

      el.addEventListener('change', function(e) {
        var value = e.target[opt.value];
        if (typeof opt.dataHolder != 'undefined') {
          value = doc.querySelector(opt.dataHolder)[opt.value];
        }

        if (typeof opt.dataBuilder != 'undefined') {
          value = opt.dataBuilder(value);
        }

        localStorage.setItem(name, value);
        opt.render(value);
      });
      el[opt.value] = opt.decode(localStorage.getItem(name));
      el.dispatchEvent(new Event('change'));
    });

    // Toggle render language
    var toggleRenderLangArea = doc.getElementById("render-lang-area");
    if (typeof toggleRenderLangArea != 'undefined') {
      toggleRenderLangArea.addEventListener('click', function(e) {
        if (e.target.id == "toggle-render-lang" ||
            e.target.id == "toggle-render-lang-text") {
          var toggleText = doc.getElementById("toggle-render-lang-text");
          if (toggleArea("render-languages")) {
            toggleText.innerText = '-';
          } else {
            toggleText.innerText = '+';
          }
        }
      });
    }

  });
}(window.document));
