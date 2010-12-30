var list = document.querySelectorAll('style');
var len = list.length;

if(len > 0)
    for(var i = 0; i < len; ++i) {
        list[i].parentNode.removeChild(list[i]);
    }

list = document.querySelectorAll('link');
len = list.length;

if(len > 0)
    for(var i = 0; i < len; ++i) {
        list[i].parentNode.removeChild(list[i]);
    }
