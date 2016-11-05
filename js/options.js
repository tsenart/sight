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
        codeEl.innerHTML = codeEl.textContent;
        hljs.highlightBlock(codeEl);
        if (value) {
          codeEl.innerHTML = '<table style="color:inherit">' +
          codeEl.innerHTML.replace(/^(.*)$/gm, function(_, line) {
            return '<tr><td class="line-number"></td><td class="line-content">' + line + '</td></tr>';
          }) + "</table>";
        }
      }
    },
    wordWrap: {
      selector: '#word-wrap',
      value: 'checked',
      decode: eq('true'),
      render: function(value) {
        var codeEl = doc.getElementById('code');
        if (value) {
          codeEl.classList.add("word-wrap");
        } else codeEl.classList.remove("word-wrap");
      }
    }
  };

  doc.addEventListener('DOMContentLoaded', function() {
    Object.keys(options).forEach(function(name) {
      var opt = options[name];
      var el = doc.querySelector(opt.selector);
      el.addEventListener('change', function(e) {
        var value = e.target[opt.value];
        localStorage.setItem(name, value);
        opt.render(value);
      });
      el[opt.value] = opt.decode(localStorage.getItem(name));
      el.dispatchEvent(new Event('change'));
    });
  });
}(window.document));
