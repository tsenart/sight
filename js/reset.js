document.body.style.display = 'none';
var els = document.querySelectorAll('#original, #line-numbers, style, link');
var pre = document.querySelector('pre');
if (!!pre) {
    pre.innerHTML = document.querySelector('#original').innerHTML;
    pre.removeAttribute('class');
}
document.body.removeAttribute('style'); document.body.removeAttribute('class');
for(var i = 0; i < els.length; ++i)
    els[i].parentNode.removeChild(els[i]);
document.onkeyup = null;
document.body.style.display = 'block';
