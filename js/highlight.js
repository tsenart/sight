/*
Syntax highlighting with language autodetection.
http://softwaremaniacs.org/soft/highlight/
*/

var hljs = new function() {
  var LANGUAGES = {}
  // selected_languages is used to support legacy mode of selecting languages
  // available for highlighting by passing them as arguments into
  // initHighlighting function. Currently the whole library is expected to
  // contain only those language definitions that are actually get used.
  var selected_languages = {};

  /* Utility functions */

  function escape(value) {
    return value.replace(/&/gm, '&amp;').replace(/</gm, '&lt;').replace(/>/gm, '&gt;');
  }

  function langRe(language, value, global) {
    var mode =  'm' + (language.case_insensitive ? 'i' : '') + (global ? 'g' : '');
    return new RegExp(value, mode);
  }

  function findCode(pre) {
    for (var i = 0; i < pre.childNodes.length; i++) {
      node = pre.childNodes[i];
      if (node.nodeName == 'CODE')
        return node;
      if (!(node.nodeType == 3 && node.nodeValue.match(/\s+/)))
        break;
    }
  }

  function blockText(block, ignoreNewLines) {
    var result = '';
    for (var i = 0; i < block.childNodes.length; i++)
      if (block.childNodes[i].nodeType == 3) {
        var chunk = block.childNodes[i].nodeValue;
        if (ignoreNewLines)
          chunk = chunk.replace(/\n/g, '');
        result += chunk;
      }
      else
        result += blockText(block.childNodes[i]);
    // Thank you, MSIE...
    if (/MSIE [678]/.test(navigator.userAgent))
      result = result.replace(/\r/g, '\n');
    return result;
  }

  function blockLanguage(block) {
    var classes = block.className.split(/\s+/)
    classes = classes.concat(block.parentNode.className.split(/\s+/));
    for (var i = 0; i < classes.length; i++) {
      var class_ = classes[i].replace(/^language-/, '');
      if (LANGUAGES[class_] || class_ == 'no-highlight') {
        return class_;
      }
    }
  }

  /* Stream merging */

  function nodeStream(node) {
    var result = [];
    (function (node, offset) {
      for (var i = 0; i < node.childNodes.length; i++) {
        if (node.childNodes[i].nodeType == 3)
          offset += node.childNodes[i].nodeValue.length;
        else if (node.childNodes[i].nodeName == 'BR')
          offset += 1
        else {
          result.push({
            event: 'start',
            offset: offset,
            node: node.childNodes[i]
          });
          offset = arguments.callee(node.childNodes[i], offset)
          result.push({
            event: 'stop',
            offset: offset,
            node: node.childNodes[i]
          });
        }
      }
      return offset;
    })(node, 0);
    return result;
  }

  function mergeStreams(stream1, stream2, value) {
    var processed = 0;
    var result = '';
    var nodeStack = [];

    function selectStream() {
      if (stream1.length && stream2.length) {
        if (stream1[0].offset != stream2[0].offset)
          return (stream1[0].offset < stream2[0].offset) ? stream1 : stream2;
        else
          return (stream1[0].event == 'start' && stream2[0].event == 'stop') ? stream2 : stream1;
      } else {
        return stream1.length ? stream1 : stream2;
      }
    }

    function open(node) {
      var result = '<' + node.nodeName.toLowerCase();
      for (var i = 0; i < node.attributes.length; i++) {
        var attribute = node.attributes[i];
        result += ' ' + attribute.nodeName.toLowerCase();
        if (attribute.nodeValue != undefined) {
          result += '="' + escape(attribute.nodeValue) + '"';
        }
      }
      return result + '>';
    }

    function close(node) {
      return '</' + node.nodeName.toLowerCase() + '>';
    }

    while (stream1.length || stream2.length) {
      var current = selectStream().splice(0, 1)[0];
      result += escape(value.substr(processed, current.offset - processed));
      processed = current.offset;
      if ( current.event == 'start') {
        result += open(current.node);
        nodeStack.push(current.node);
      } else if (current.event == 'stop') {
        var i = nodeStack.length;
        do {
          i--;
          var node = nodeStack[i];
          result += close(node);
        } while (node != current.node);
        nodeStack.splice(i, 1);
        while (i < nodeStack.length) {
          result += open(nodeStack[i]);
          i++;
        }
      }
    }
    result += value.substr(processed);
    return result;
  }

  /* Core highlighting function */

  function highlight(language_name, value) {

    function subMode(lexem, mode) {
      for (var i = 0; i < mode.sub_modes.length; i++) {
        if (mode.sub_modes[i].beginRe.test(lexem)) {
          return mode.sub_modes[i];
        }
      }
    }

    function endOfMode(mode_index, lexem) {
      if (modes[mode_index].end && modes[mode_index].endRe.test(lexem))
        return 1;
      if (modes[mode_index].endsWithParent) {
        var level = endOfMode(mode_index - 1, lexem);
        return level ? level + 1 : 0;
      }
      return 0;
    }

    function isIllegal(lexem, mode) {
      return mode.illegalRe && mode.illegalRe.test(lexem);
    }

    function compileTerminators(mode, language) {
      var terminators = [];

      for (var i = 0; i < mode.sub_modes.length; i++) {
        terminators.push(mode.sub_modes[i].begin);
      }

      var index = modes.length - 1;
      do {
        if (modes[index].end) {
          terminators.push(modes[index].end);
        }
        index--;
      } while (modes[index + 1].endsWithParent);

      if (mode.illegal) {
        terminators.push(mode.illegal);
      }

      return langRe(language, '(' + terminators.join('|') + ')', true);
    }

    function eatModeChunk(value, index) {
      var mode = modes[modes.length - 1];
      if (!mode.terminators) {
        mode.terminators = compileTerminators(mode, language);
      }
      mode.terminators.lastIndex = index;
      var match = mode.terminators.exec(value);
      if (match)
        return [value.substr(index, match.index - index), match[0], false];
      else
        return [value.substr(index), '', true];
    }

    function keywordMatch(mode, match) {
      var match_str = language.case_insensitive ? match[0].toLowerCase() : match[0]
      for (var className in mode.keywordGroups) {
        if (!mode.keywordGroups.hasOwnProperty(className))
          continue;
        var value = mode.keywordGroups[className].hasOwnProperty(match_str);
        if (value)
          return [className, value];
      }
      return false;
    }

    function processKeywords(buffer, mode) {
      if (!mode.keywords || !mode.lexems)
        return escape(buffer);
      var result = '';
      var last_index = 0;
      mode.lexemsRe.lastIndex = 0;
      var match = mode.lexemsRe.exec(buffer);
      while (match) {
        result += escape(buffer.substr(last_index, match.index - last_index));
        var keyword_match = keywordMatch(mode, match);
        if (keyword_match) {
          keyword_count += keyword_match[1];
          result += '<span class="'+ keyword_match[0] +'">' + escape(match[0]) + '</span>';
        } else {
          result += escape(match[0]);
        }
        last_index = mode.lexemsRe.lastIndex;
        match = mode.lexemsRe.exec(buffer);
      }
      result += escape(buffer.substr(last_index, buffer.length - last_index));
      return result;
    }

    function processBuffer(buffer, mode) {
      if (mode.subLanguage && selected_languages[mode.subLanguage]) {
        var result = highlight(mode.subLanguage, buffer);
        keyword_count += result.keyword_count;
        relevance += result.relevance;
        return result.value;
      } else {
        return processKeywords(buffer, mode);
      }
    }

    function startNewMode(mode, lexem) {
      var markup = mode.noMarkup?'':'<span class="' + mode.displayClassName + '">';
      if (mode.returnBegin) {
        result += markup;
        mode.buffer = '';
      } else if (mode.excludeBegin) {
        result += escape(lexem) + markup;
        mode.buffer = '';
      } else {
        result += markup;
        mode.buffer = lexem;
      }
      modes.push(mode);
    }

    function processModeInfo(buffer, lexem, end) {
      var current_mode = modes[modes.length - 1];
      if (end) {
        result += processBuffer(current_mode.buffer + buffer, current_mode);
        return false;
      }

      var new_mode = subMode(lexem, current_mode);
      if (new_mode) {
        result += processBuffer(current_mode.buffer + buffer, current_mode);
        startNewMode(new_mode, lexem);
        relevance += new_mode.relevance;
        return new_mode.returnBegin;
      }

      var end_level = endOfMode(modes.length - 1, lexem);
      if (end_level) {
        var markup = current_mode.noMarkup?'':'</span>';
        if (current_mode.returnEnd) {
          result += processBuffer(current_mode.buffer + buffer, current_mode) + markup;
        } else if (current_mode.excludeEnd) {
          result += processBuffer(current_mode.buffer + buffer, current_mode) + markup + escape(lexem);
        } else {
          result += processBuffer(current_mode.buffer + buffer + lexem, current_mode) + markup;
        }
        while (end_level > 1) {
          markup = modes[modes.length - 2].noMarkup?'':'</span>';
          result += markup;
          end_level--;
          modes.length--;
        }
        var last_ended_mode = modes[modes.length - 1];
        modes.length--;
        modes[modes.length - 1].buffer = '';
        if (last_ended_mode.starts) {
          for (var i = 0; i < language.modes.length; i++) {
            if (language.modes[i].className == last_ended_mode.starts) {
              startNewMode(language.modes[i], '');
              break;
            }
          }
        }
        return current_mode.returnEnd;
      }

      if (isIllegal(lexem, current_mode))
        throw 'Illegal';
    }

    var language = LANGUAGES[language_name];
    var modes = [language.defaultMode];
    var relevance = 0;
    var keyword_count = 0;
    var result = '';
    try {
      var index = 0;
      language.defaultMode.buffer = '';
      do {
        var mode_info = eatModeChunk(value, index);
        var return_lexem = processModeInfo(mode_info[0], mode_info[1], mode_info[2]);
        index += mode_info[0].length;
        if (!return_lexem) {
          index += mode_info[1].length;
        }
      } while (!mode_info[2]);
      if(modes.length > 1)
        throw 'Illegal';
      return {
        language: language_name,
        relevance: relevance,
        keyword_count: keyword_count,
        value: result
      }
    } catch (e) {
      if (e == 'Illegal') {
        return {
          language: null,
          relevance: 0,
          keyword_count: 0,
          value: escape(value)
        }
      } else {
        throw e;
      }
    }
  }

  /* Initialization */

  function compileModes() {

    function compileMode(mode, language) {
      if (mode.compiled)
        return;

      if (mode.begin)
        mode.beginRe = langRe(language, '^' + mode.begin);
      if (mode.end)
        mode.endRe = langRe(language, '^' + mode.end);
      if (mode.illegal)
        mode.illegalRe = langRe(language, '^(?:' + mode.illegal + ')');
      if (mode.lexems)
        mode.lexemsRe = langRe(language, mode.lexems, true);
      if (mode.relevance == undefined)
        mode.relevance = 1;
      if (!mode.displayClassName)
        mode.displayClassName = mode.className;
      if (!mode.className)
        mode.noMarkup = true;
      for (var key in mode.keywords) {
        if (!mode.keywords.hasOwnProperty(key))
          continue;
        if (mode.keywords[key] instanceof Object)
          mode.keywordGroups = mode.keywords;
        else
          mode.keywordGroups = {'keyword': mode.keywords};
        break;
      }
      mode.sub_modes = [];
      if (mode.contains) {
        for (var i = 0; i < mode.contains.length; i++) {
          if (mode.contains[i] instanceof Object) { // inline mode
            mode.sub_modes.push(mode.contains[i]);
          } else { // named mode
            for (var j = 0; j < language.modes.length; j++) {
              if (language.modes[j].className == mode.contains[i]) {
                mode.sub_modes.push(language.modes[j]);
              }
            }
          }
        }
      }
      // compiled flag is set before compiling submodes to avoid self-recursion
      // (see lisp where quoted_list contains quoted_list)
      mode.compiled = true;
      for (var i = 0; i < mode.sub_modes.length; i++) {
        compileMode(mode.sub_modes[i], language);
      }
    }

    for (var i in LANGUAGES) {
      if (!LANGUAGES.hasOwnProperty(i))
        continue;
      var modes = [LANGUAGES[i].defaultMode].concat(LANGUAGES[i].modes);
      for (var j = 0; j < modes.length; j++) {
        compileMode(modes[j], LANGUAGES[i]);
      }
    }
  }

  function initialize() {
    if (initialize.called)
        return;
    initialize.called = true;
    compileModes();
    selected_languages = LANGUAGES;
  }

  /* Public library functions */

  function highlightBlock(block, tabReplace, useBR) {
    initialize();

    var text = blockText(block, useBR);
    var language = blockLanguage(block);
    if (!language || language == 'no-highlight' || language.match('/\s*/'))
        return;
    else
        var result = highlight(language, text);
    var class_name = block.className;
    var original = nodeStream(block);
    if (original.length) {
      var pre = document.createElement('pre');
      pre.innerHTML = result.value;
      result.value = mergeStreams(original, nodeStream(pre), text);
    }
    if (tabReplace) {
      result.value = result.value.replace(/^((<[^>]+>|\t)+)/gm, function(match, p1, offset, s) {
        return p1.replace(/\t/g, tabReplace);
      })
    }
    if (useBR) {
      result.value = result.value.replace(/\n/g, '<br>');
    }
    block.innerHTML = result.value;
    block.className = class_name;
  }

  function initHighlighting() {
    if (initHighlighting.called)
      return;
    initHighlighting.called = true;
    initialize();
    if (arguments.length) {
      for (var i = 0; i < arguments.length; i++) {
        if (LANGUAGES[arguments[i]]) {
          selected_languages[arguments[i]] = LANGUAGES[arguments[i]];
        }
      }
    }
    var pres = document.getElementsByTagName('pre');
    for (var i = 0; i < pres.length; i++) {
      var code = findCode(pres[i]);
      if (code)
        highlightBlock(code, hljs.tabReplace);
    }
  }

  function initHighlightingOnLoad() {
    var original_arguments = arguments;
    var handler = function(){initHighlighting.apply(null, original_arguments)};
    if (window.addEventListener) {
      window.addEventListener('DOMContentLoaded', handler, false);
      window.addEventListener('load', handler, false);
    } else if (window.attachEvent)
      window.attachEvent('onload', handler);
    else
      window.onload = handler;
  }

  /* Interface definition */

  this.LANGUAGES = LANGUAGES;
  this.initHighlightingOnLoad = initHighlightingOnLoad;
  this.highlightBlock = highlightBlock;
  this.initHighlighting = initHighlighting;
  this.escape = escape

  // Common regexps
  this.IMMEDIATE_RE = '\\b|\\B'
  this.IDENT_RE = '[a-zA-Z][a-zA-Z0-9_]*';
  this.UNDERSCORE_IDENT_RE = '[a-zA-Z_][a-zA-Z0-9_]*';
  this.NUMBER_RE = '\\b\\d+(\\.\\d+)?';
  this.C_NUMBER_RE = '\\b(0x[A-Za-z0-9]+|\\d+(\\.\\d+)?)';
  this.RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|\\.|-|-=|/|/=|:|;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

  // Common modes
  this.BACKSLASH_ESCAPE = {
    begin: '\\\\.', end: this.IMMEDIATE_RE, relevance: 0
  };
  this.APOS_STRING_MODE = {
    className: 'string',
    begin: '\'', end: '\'',
    illegal: '\\n',
    contains: [this.BACKSLASH_ESCAPE],
    relevance: 0
  };
  this.QUOTE_STRING_MODE = {
    className: 'string',
    begin: '"', end: '"',
    illegal: '\\n',
    contains: [this.BACKSLASH_ESCAPE],
    relevance: 0
  };
  this.C_LINE_COMMENT_MODE = {
    className: 'comment',
    begin: '//', end: '$',
    relevance: 0
  };
  this.C_BLOCK_COMMENT_MODE = {
    className: 'comment',
    begin: '/\\*', end: '\\*/'
  };
  this.HASH_COMMENT_MODE = {
    className: 'comment',
    begin: '#', end: '$'
  };
  this.NUMBER_MODE = {
    className: 'number',
    begin: this.NUMBER_RE, end: this.IMMEDIATE_RE,
    relevance: 0
  };
  this.C_NUMBER_MODE = {
    className: 'number',
    begin: this.C_NUMBER_RE, end: this.IMMEDIATE_RE,
    relevance: 0
  };

  // Utility functions
  this.inherit = function(parent, obj) {
    var result = {}
    for (var key in parent)
      result[key] = parent[key];
    if (obj)
      for (var key in obj)
        result[key] = obj[key];
    return result;
  }
}();

function js_beautify(z,n){var e,f,k,d,g,q,c,D,y,K,E,L,b,P,o,s,F,A,w,t;n=n?n:{};var G=n.braces_on_own_line?n.braces_on_own_line:false;s=n.indent_size?n.indent_size:4;var Q=n.indent_char?n.indent_char:" ",M=typeof n.preserve_newlines==="undefined"?true:n.preserve_newlines,R=typeof n.max_preserve_newlines==="undefined"?false:n.max_preserve_newlines,T=n.indent_level?n.indent_level:0,U=n.space_after_anon_function==="undefined"?false:n.space_after_anon_function,u=typeof n.keep_array_indentation==="undefined"?
false:n.keep_array_indentation;w=false;var r=z.length;function B(a){for(a=typeof a==="undefined"?false:a;f.length&&(f[f.length-1]===" "||f[f.length-1]===y||a&&(f[f.length-1]==="\n"||f[f.length-1]==="\r"));)f.pop()}function S(a){return a.replace(/^\s\s*|\s\s*$/,"")}function h(a){c.eat_next_space=false;if(!(u&&C(c.mode))){a=typeof a==="undefined"?true:a;c.if_line=false;B();if(f.length){if(f[f.length-1]!=="\n"||!a){w=true;f.push("\n")}for(a=0;a<c.indentation_level;a+=1)f.push(y);if(c.var_line&&c.var_line_reindented)Q===
" "?f.push("    "):f.push(y)}}}function l(){if(c.eat_next_space)c.eat_next_space=false;else{var a=" ";if(f.length)a=f[f.length-1];a!==" "&&a!=="\n"&&a!==y&&f.push(" ")}}function m(){w=false;c.eat_next_space=false;f.push(k)}function H(){c.indentation_level+=1}function N(){f.length&&f[f.length-1]===y&&f.pop()}function x(a){c&&D.push(c);c={previous_mode:c?c.mode:"BLOCK",mode:a,var_line:false,var_line_tainted:false,var_line_reindented:false,in_html_comment:false,if_line:false,in_case:false,eat_next_space:false,
indentation_baseline:-1,indentation_level:c?c.indentation_level+(c.var_line&&c.var_line_reindented?1:0):T}}function C(a){return a==="[EXPRESSION]"||a==="[INDENTED-EXPRESSION]"}function I(a){return a==="[EXPRESSION]"||a==="[INDENTED-EXPRESSION]"||a==="(EXPRESSION)"}function J(){F=c.mode==="DO_BLOCK";if(D.length>0)c=D.pop()}function p(a,i){for(var j=0;j<i.length;j+=1)if(i[j]===a)return true;return false}function V(){for(var a=0,i=0,j=f.length-1;j>=0;j--)switch(f[j]){case ":":a===0&&i++;break;case "?":if(a===
0)if(i===0)return true;else i--;break;case "{":if(a===0)return false;a--;break;case "(":case "[":a--;break;case ")":case "]":case "}":a++;break}}function O(){t=0;if(b>=r)return["","TK_EOF"];A=false;var a=e.charAt(b);b+=1;var i=u&&C(c.mode);if(i){for(i=0;p(a,K);){if(a==="\n"){B();f.push("\n");w=true;i=0}else if(a==="\t")i+=4;else if(a!=="\r")i+=1;if(b>=r)return["","TK_EOF"];a=e.charAt(b);b+=1}if(c.indentation_baseline===-1)c.indentation_baseline=i;if(w){var j;for(j=0;j<c.indentation_level+1;j+=1)f.push(y);
if(c.indentation_baseline!==-1)for(j=0;j<i-c.indentation_baseline;j++)f.push(" ")}}else{for(;p(a,K);){if(a==="\n")t+=R?t<=R?1:0:1;if(b>=r)return["","TK_EOF"];a=e.charAt(b);b+=1}if(M)if(t>1)for(j=0;j<t;j+=1){h(j===0);w=true}A=t>0}if(p(a,E)){if(b<r)for(;p(e.charAt(b),E);){a+=e.charAt(b);b+=1;if(b===r)break}if(b!==r&&a.match(/^[0-9]+[Ee]$/)&&(e.charAt(b)==="-"||e.charAt(b)==="+")){i=e.charAt(b);b+=1;j=O(b);a+=i+j[0];return[a,"TK_WORD"]}if(a==="in")return[a,"TK_OPERATOR"];if(A&&d!=="TK_OPERATOR"&&!c.if_line&&
(M||g!=="var"))h();return[a,"TK_WORD"]}if(a==="("||a==="[")return[a,"TK_START_EXPR"];if(a===")"||a==="]")return[a,"TK_END_EXPR"];if(a==="{")return[a,"TK_START_BLOCK"];if(a==="}")return[a,"TK_END_BLOCK"];if(a===";")return[a,"TK_SEMICOLON"];if(a==="/"){i="";j=true;if(e.charAt(b)==="*"){b+=1;if(b<r)for(;!(e.charAt(b)==="*"&&e.charAt(b+1)&&e.charAt(b+1)==="/")&&b<r;){a=e.charAt(b);i+=a;if(a==="\r"||a==="\n")j=false;b+=1;if(b>=r)break}b+=2;return j?["/*"+i+"*/","TK_INLINE_COMMENT"]:["/*"+i+"*/","TK_BLOCK_COMMENT"]}if(e.charAt(b)===
"/"){for(i=a;e.charAt(b)!=="\r"&&e.charAt(b)!=="\n";){i+=e.charAt(b);b+=1;if(b>=r)break}b+=1;A&&h();return[i,"TK_COMMENT"]}}if(a==="'"||a==='"'||a==="/"&&(d==="TK_WORD"&&p(g,["return","do"])||d==="TK_COMMENT"||d==="TK_START_EXPR"||d==="TK_START_BLOCK"||d==="TK_END_BLOCK"||d==="TK_OPERATOR"||d==="TK_EQUALS"||d==="TK_EOF"||d==="TK_SEMICOLON")){i=a;j=false;var v=a;if(b<r)if(i==="/")for(a=false;j||a||e.charAt(b)!==i;){v+=e.charAt(b);if(j)j=false;else{j=e.charAt(b)==="\\";if(e.charAt(b)==="[")a=true;else if(e.charAt(b)===
"]")a=false}b+=1;if(b>=r)return[v,"TK_STRING"]}else for(;j||e.charAt(b)!==i;){v+=e.charAt(b);j=j?false:e.charAt(b)==="\\";b+=1;if(b>=r)return[v,"TK_STRING"]}b+=1;v+=i;if(i==="/")for(;b<r&&p(e.charAt(b),E);){v+=e.charAt(b);b+=1}return[v,"TK_STRING"]}if(a==="#"){if(f.length===0&&e.charAt(b)==="!"){for(v=a;b<r&&a!="\n";){a=e.charAt(b);v+=a;b+=1}f.push(S(v)+"\n");h();return O()}i="#";if(b<r&&p(e.charAt(b),P)){do{a=e.charAt(b);i+=a;b+=1}while(b<r&&a!=="#"&&a!=="=");if(a!=="#")if(e.charAt(b)==="["&&e.charAt(b+
1)==="]"){i+="[]";b+=2}else if(e.charAt(b)==="{"&&e.charAt(b+1)==="}"){i+="{}";b+=2}return[i,"TK_WORD"]}}if(a==="<"&&e.substring(b-1,b+3)==="<!--"){b+=3;c.in_html_comment=true;return["<!--","TK_COMMENT"]}if(a==="-"&&c.in_html_comment&&e.substring(b-1,b+2)==="--\>"){c.in_html_comment=false;b+=2;A&&h();return["--\>","TK_COMMENT"]}if(p(a,L)){for(;b<r&&p(a+e.charAt(b),L);){a+=e.charAt(b);b+=1;if(b>=r)break}return a==="="?[a,"TK_EQUALS"]:[a,"TK_OPERATOR"]}return[a,"TK_UNKNOWN"]}for(y="";s>0;){y+=Q;s-=
1}e=z;z="";d="TK_START_EXPR";q=g="";f=[];F=false;K="\n\r\t ".split("");E="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$".split("");P="0123456789".split("");L="+ - * / % & ++ -- = += -= *= /= %= == === != !== > < >= <= >> << >>> >>>= >>= <<= && &= | || ! !! , : ? ^ ^= |= ::".split(" ");n="continue,try,throw,return,var,if,switch,case,default,for,while,break,function".split(",");D=[];x("BLOCK");for(b=0;1;){s=O(b);k=s[0];s=s[1];if(s==="TK_EOF")break;switch(s){case "TK_START_EXPR":if(k===
"["){if(d==="TK_WORD"||g===")"){p(g,n)&&l();x("(EXPRESSION)");m();break}if(c.mode==="[EXPRESSION]"||c.mode==="[INDENTED-EXPRESSION]")if(q==="]"&&g===","){if(c.mode==="[EXPRESSION]"){c.mode="[INDENTED-EXPRESSION]";u||H()}x("[EXPRESSION]");u||h()}else if(g==="["){if(c.mode==="[EXPRESSION]"){c.mode="[INDENTED-EXPRESSION]";u||H()}x("[EXPRESSION]");u||h()}else x("[EXPRESSION]");else x("[EXPRESSION]")}else x("(EXPRESSION)");if(g===";"||d==="TK_START_BLOCK")h();else if(!(d==="TK_END_EXPR"||d==="TK_START_EXPR"||
d==="TK_END_BLOCK"||g==="."))if(d!=="TK_WORD"&&d!=="TK_OPERATOR")l();else if(z==="function")U&&l();else if(p(g,n)||g==="catch")l();m();break;case "TK_END_EXPR":if(k==="]")if(u){if(g==="}"){N();m();J();break}}else if(c.mode==="[INDENTED-EXPRESSION]")if(g==="]"){J();h();m();break}J();m();break;case "TK_START_BLOCK":z==="do"?x("DO_BLOCK"):x("BLOCK");if(G){if(d!=="TK_OPERATOR")g==="return"||g==="="?l():h(true);m();H()}else{if(d!=="TK_OPERATOR"&&d!=="TK_START_EXPR")d==="TK_START_BLOCK"?h():l();else if(C(c.previous_mode)&&
g===",")q==="}"?l():h();H();m()}break;case "TK_END_BLOCK":J();if(G)g!=="{"&&h();else if(d==="TK_START_BLOCK")w?N():B();else if(C(c.mode)&&u){u=false;h();u=true}else h();m();break;case "TK_WORD":if(F){l();m();l();F=false;break}if(k==="function")if((w||g===";")&&g!=="{"){t=w?t:0;M||(t=1);for(o=0;o<2-t;o++)h(false)}if(k==="case"||k==="default"){if(g===":")N();else{c.indentation_level--;h();c.indentation_level++}m();c.in_case=true;break}o="NONE";if(d==="TK_END_BLOCK")if(p(k.toLowerCase(),["else","catch",
"finally"]))if(G)o="NEWLINE";else{o="SPACE";l()}else o="NEWLINE";else if(d==="TK_SEMICOLON"&&(c.mode==="BLOCK"||c.mode==="DO_BLOCK"))o="NEWLINE";else if(d==="TK_SEMICOLON"&&I(c.mode))o="SPACE";else if(d==="TK_STRING")o="NEWLINE";else if(d==="TK_WORD")o="SPACE";else if(d==="TK_START_BLOCK")o="NEWLINE";else if(d==="TK_END_EXPR"){l();o="NEWLINE"}if(c.if_line&&d==="TK_END_EXPR")c.if_line=false;if(p(k.toLowerCase(),["else","catch","finally"]))if(d!=="TK_END_BLOCK"||G)h();else{B(true);l()}else if(p(k,n)||
o==="NEWLINE"){if(!((d==="TK_START_EXPR"||g==="="||g===",")&&k==="function"))if(g==="return"||g==="throw")l();else if(d!=="TK_END_EXPR"){if((d!=="TK_START_EXPR"||k!=="var")&&g!==":")k==="if"&&z==="else"&&g!=="{"?l():h()}else p(k,n)&&g!==")"&&h()}else if(C(c.mode)&&g===","&&q==="}")h();else o==="SPACE"&&l();m();z=k;if(k==="var"){c.var_line=true;c.var_line_reindented=false;c.var_line_tainted=false}if(k==="if")c.if_line=true;if(k==="else")c.if_line=false;break;case "TK_SEMICOLON":m();c.var_line=false;
c.var_line_reindented=false;break;case "TK_STRING":if(d==="TK_START_BLOCK"||d==="TK_END_BLOCK"||d==="TK_SEMICOLON")h();else d==="TK_WORD"&&l();m();break;case "TK_EQUALS":if(c.var_line)c.var_line_tainted=true;l();m();l();break;case "TK_OPERATOR":o=q=true;if(c.var_line&&k===","&&I(c.mode))c.var_line_tainted=false;if(c.var_line)if(k===",")if(c.var_line_tainted){m();c.var_line_reindented=true;c.var_line_tainted=false;h();break}else c.var_line_tainted=false;if(g==="return"||g==="throw"){l();m();break}if(k===
":"&&c.in_case){m();h();c.in_case=false;break}if(k==="::"){m();break}if(k===","){if(c.var_line)if(c.var_line_tainted){m();h();c.var_line_tainted=false}else{m();l()}else if(d==="TK_END_BLOCK"&&c.mode!=="(EXPRESSION)"){m();c.mode==="OBJECT"&&g==="}"?h():l()}else if(c.mode==="OBJECT"){m();h()}else{m();l()}break}else if(p(k,["--","++","!"])||p(k,["-","+"])&&(p(d,["TK_START_BLOCK","TK_START_EXPR","TK_EQUALS","TK_OPERATOR"])||p(g,n))){o=q=false;if(g===";"&&I(c.mode))q=true;if(d==="TK_WORD"&&p(g,n))q=true;
if(c.mode==="BLOCK"&&(g==="{"||g===";"))h()}else if(k===".")q=false;else if(k===":")if(!V()){c.mode="OBJECT";q=false}q&&l();m();o&&l();break;case "TK_BLOCK_COMMENT":q=k.split(/\x0a|\x0d\x0a/);if(/^\/\*\*/.test(k)){h();f.push(q[0]);for(o=1;o<q.length;o++){h();f.push(" ");f.push(S(q[o]))}}else{if(q.length>1){h();B()}else l();for(o=0;o<q.length;o++){f.push(q[o]);f.push("\n")}}h();break;case "TK_INLINE_COMMENT":l();m();I(c.mode)?l():h();break;case "TK_COMMENT":A?h():l();m();h();break;case "TK_UNKNOWN":if(g===
"return"||g==="throw")l();m();break}q=g;d=s;g=k}return f.join("").replace(/[\n ]+$/,"")}if(typeof exports!=="undefined")exports.js_beautify=js_beautify;
