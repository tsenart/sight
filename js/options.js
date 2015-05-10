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
        hljs.configure({ lineNumbers: value });
        codeEl.innerHTML = codeEl.textContent;
        hljs.highlightBlock(codeEl);
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
