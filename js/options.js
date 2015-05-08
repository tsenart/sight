(function(doc) {
  doc.addEventListener('DOMContentLoaded', function() {
    function get(callback) {
      chrome.extension.sendRequest({ options: null }, callback);
    }

    function set(option, value, callback) {
      var options = {};
      options[option] = value;
      chrome.extension.sendRequest({ options: options }, callback);
    }

    function id(value) { return value }

    var options = {
      theme: {
        selector: '#theme',
        value: 'value',
        decode: id,
        render: function(value) {
          var styleEl = doc.querySelector('link:last-of-type');
          styleEl.href = '/css/' + value + '.css';
        },
      },
      font: {
        selector: '#font',
        value: 'value',
        decode: id,
        render: function(value) {
          doc.getElementById('code').style.fontFamily = value;
        },
      },
      fontSize: {
        selector: '#font-size',
        value: 'value',
        decode: identity,
        render: function(value) {
          doc.getElementById('code').style.fontSize = value;
        },
      },
      lineNumbers: {
        selector: '#line-numbers',
        value: 'checked',
        decode: function(value) { return value === "true" },
        render: function(value) {
          var codeEl = doc.getElementById('code');
          hljs.configure({ lineNumbers: value });
          codeEl.innerHTML = codeEl.textContent;
          hljs.highlightBlock(codeEl);
        }
      }
    };

    Object.keys(options).forEach(function(name) {
      var opt = options[name];
      doc.querySelector(opt.selector).addEventListener('change', function(e) {
        var value = e.target[opt.value];
        set(name, value, opt.render.bind(null, value));
      })
    });

    get(function(opts) {
      Object.keys(opts).forEach(function(name) {
        var opt = options[name];
        var el = doc.querySelector(opt.selector);
        el[opt.value] = opt.decode(opts[name]);
        el.dispatchEvent(new Event('change'));
      });
    });
  });
}(window.document));
