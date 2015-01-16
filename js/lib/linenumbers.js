(function() {
  var preEl = document.getElementsByTagName('pre');
  preEl.innerHTML = '<span id="linenumbers"></span>' + preEl.innerHTML + '<span class="clearfix"></span>';
  var num = preEl.innerHTML.split(/\n/).length;
  for (var j = 0; j < num; j++) {
    var lineNum = preEl.getElementsByTagName('span')[0];
    lineNum.innerHTML += '<span>' + (j + 1) + '</span>';
  }
})();
