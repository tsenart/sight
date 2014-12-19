(function() {
    var preEl = document.getElementsByTagName('pre'),
        preElLength = preEl.length;
    for (var i = 0; i < preElLength; i++) {
        preEl[i].innerHTML = '<span id="linenumbers"></span>' + preEl[i].innerHTML + '<span class="clearfix"></span>';
        var num = preEl[i].innerHTML.split(/\n/).length;
        for (var j = 0; j < num; j++) {
            var lineNum = preEl[i].getElementsByTagName('span')[0];
            lineNum.innerHTML += '<span>' + (j + 1) + '</span>';
        }
    }
})();
