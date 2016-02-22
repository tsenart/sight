/**
 * Created by aoyang on 16/2/22.
 */
var sight = (function() {
    const LANG_EXT_MAP = {
        applescript: ['applescript'],
        avrasm:      ['asm', 's'],
        bash:        ['sh', 'bash', 'zsh', 'shell'],
        brainfuck:   ['bf'],
        clojure:     ['clj'],
        coffeescript:['coffee'],
        cpp:         ['c', 'h', 'cc', 'cpp', 'c++', 'hpp', 'h++'],
        cs:          ['cs'],
        css:         ['css'],
        d:           ['d', 'dd', 'di'],
        dart:        ['dart'],
        delphi:      ['pas'],
        desktop:     ['desktop'],
        diff:        ['diff', 'patch'],
        erlang:      ['erl', 'erlang'],
        fsharp:      ['fs'],
        gherkin:     ['feature'],
        go:          ['go'],
        haml:        ['haml'],
        haskell:     ['hs'],
        http:        ['http'],
        java:        ['java', 'class', 'fx', 'groovy', 'gsh', 'gvy', 'gy'],
        javascript:  ['js'],
        json:        ['json'],
        lisp:        ['lsp', 'lisp', 'cl', 'el', 'scm'],
        lua:         ['lua'],
        makefile:    ['Makefile'],
        markdown:    ['md', 'markdown'],
        objectivec:  ['m', 'mm'],
        ocaml:       ['ml'],
        perl:        ['pl', 'pm', 'perl'],
        php:         ['php', 'phtml', 'phps'],
        python:      ['py', 'pyc'],
        r:           ['r'],
        ruby:        ['rakefile', 'gemfile', 'rb'],
        scala:       ['scala', 'scl', 'sca', 'scb'],
        smalltalk:   ['st', 'sm', 'sll'],
        sql:         ['sql'],
        tex:         ['tex'],
        vhdl:        ['vhd', 'vhdl'],
        xml:         ['atom', 'rss', 'vsproj', 'csproj', 'build', 'wsdl', 'config', 'xsd', 'plist', 'xib'],
        yaml:        ['yaml']
    };

    const RENDER_CONFIG = {};

    for (var category in LANG_EXT_MAP) {
        if (LANG_EXT_MAP.hasOwnProperty(category)) {
            RENDER_CONFIG[category] = {};
            var exts = LANG_EXT_MAP[category];
            for (var idx = 0; idx < exts.length; ++idx) {
                RENDER_CONFIG[category][exts[idx]] = true;
            }
        }
    }

    const EXT_LANG_MAP = {};
    for (var lang in LANG_EXT_MAP) {
        LANG_EXT_MAP[lang].forEach(function(ext) {
            EXT_LANG_MAP[ext] = lang;
        });
    }

    return {
        LANG_EXT_MAP: LANG_EXT_MAP,
        EXT_LANG_MAP: EXT_LANG_MAP,
        RENDER_CONFIG: RENDER_CONFIG
    }
})();