document.body.style.display = 'none';
var list = document.querySelectorAll('style, link');
for(var i = 0; i < list.length; ++i) list[i].parentNode.removeChild(list[i]);