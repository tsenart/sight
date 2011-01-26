if (!document.querySelector('#line-numbers'))
    chrome.extension.sendRequest({key: 'show-line-numbers'}, function(msg) {
        var active_line_numbers = eval(msg.value);
        if (active_line_numbers) {
            var lineNumber = function(number, max) {
                var number_s = number.toString();
                var len = number_s.length;
                for (var i = 0; i < (max.toString().length - len); i++)
                    number_s = '0' + number_s;
                return number_s;
            }

            var nlines = document.body.innerText.split(/\n/).length;
            var line_numbers = document.createElement('ul');
            line_numbers.id = 'line-numbers';
            for(i = 1; i <= nlines; ++i) {
                var li = document.createElement('li')
                li.id = 'line-' + i;
                li.innerText = lineNumber(i, nlines);
                line_numbers.appendChild(li);
            }
            document.body.appendChild(line_numbers);
            document.addEventListener("keyup", function f(e){
                if (e.keyCode == 76) {
                    var line = prompt("Line number to jump to:", "");
                    var el = document.querySelector('#line-' + line);
                    if (el) el.scrollIntoViewIfNeeded();
                }
            }, false);
        }
        else {
            document.querySelector('pre').className = 'sighted';
            pres[0].style.left = '0';
        }
    });