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

    const ICON_LANG_MAP = {
        applescript: "devicon-apple-plain",
        avrasm:      "devicon-chrome-plain",
        bash:        "devicon-linux-plain",
        brainfuck:   "devicon-chrome-plain",
        clojure:     "devicon-chrome-plain",
        coffeescript:"devicon-coffeescript-plain",
        cpp:         "devicon-cplusplus-plain",
        cs:          "devicon-csharp-plain",
        css:         "devicon-css3-plain",
        d:           "devicon-chrome-plain",
        dart:        "devicon-chrome-plain",
        delphi:      "devicon-chrome-plain",
        desktop:     "devicon-windows8-plain",
        diff:        "devicon-chrome-plain",
        erlang:      "devicon-erlang-plain",
        fsharp:      "devicon-dot-net-plain",
        gherkin:     "devicon-chrome-plain",
        go:          "devicon-go-plain",
        haml:        "devicon-chrome-plain",
        haskell:     "devicon-chrome-plain",
        http:        "devicon-html5-plain",
        java:        "devicon-java-plain",
        javascript:  "devicon-javascript-plain",
        json:        "devicon-chrome-plain",
        lisp:        "devicon-chrome-plain",
        lua:         "devicon-chrome-plain",
        makefile:    "devicon-redhat-plain",
        markdown:    "devicon-chrome-plain",
        objectivec:  "devicon-apple-plain",
        ocaml:       "devicon-chrome-plain",
        perl:        "devicon-atom-plain",
        php:         "devicon-php-plain",
        python:      "devicon-python-plain",
        r:           "devicon-chrome-plain",
        ruby:        "devicon-ruby-plain",
        scala:       "devicon-chrome-plain",
        smalltalk:   "devicon-chrome-plain",
        sql:         "devicon-mysql-plain",
        tex:         "devicon-chrome-plain",
        vhdl:        "devicon-chrome-plain",
        xml:         "devicon-chrome-plain",
        yaml:        "devicon-chrome-plain"
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
        LANG_EXT_MAP:  LANG_EXT_MAP,
        EXT_LANG_MAP:  EXT_LANG_MAP,
        ICON_LANG_MAP: ICON_LANG_MAP,
        RENDER_CONFIG: RENDER_CONFIG
    }
})();