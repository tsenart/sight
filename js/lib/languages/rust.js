/*
Language: Rust
Author: Andrey Vlasovskikh <andrey.vlasovskikh@gmail.com>
Contributors: Roman Shmatov <romanshmatov@gmail.com>
Category: system
*/

function(hljs) {
  var BLOCK_COMMENT = hljs.inherit(hljs.C_BLOCK_COMMENT_MODE);
  BLOCK_COMMENT.contains.push('self');
  return {
    aliases: ['rs'],
    keywords: {
      keyword:
        'alignof as be box break const continue crate do else enum extern ' +
        'false fn for if impl in let loop match mod mut offsetof once priv ' +
        'proc pub pure ref return self sizeof static struct super trait true ' +
        'type typeof unsafe unsized use virtual while yield ' +
        'int i8 i16 i32 i64 ' +
        'uint u8 u32 u64 ' +
        'float f32 f64 ' +
        'str char bool',
      built_in:
        'assert! assert_eq! bitflags! bytes! cfg! col! concat! concat_idents! ' +
        'debug_assert! debug_assert_eq! env! panic! file! format! format_args! ' +
        'include_bin! include_str! line! local_data_key! module_path! ' +
        'option_env! print! println! select! stringify! try! unimplemented! ' +
        'unreachable! vec! write! writeln!'
    },
    lexemes: hljs.IDENT_RE + '!?',
    illegal: '</',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      BLOCK_COMMENT,
      hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: null}),
      {
        className: 'string',
        begin: /r(#*)".*?"\1(?!#)/
      },
      {
        className: 'string',
        begin: /'\\?(x\w{2}|u\w{4}|U\w{8}|.)'/
      },
      {
        begin: /'[a-zA-Z_][a-zA-Z0-9_]*/
      },
      {
        className: 'number',
        begin: /\b(0[xb][A-Za-z0-9_]+|[0-9_]+(\.[0-9_]+)?([eE][+-]?[0-9_]+)?)([uif](8|16|32|64)?)?/,
        relevance: 0
      },
      {
        className: 'function',
        beginKeywords: 'fn', end: '(\\(|<)', excludeEnd: true,
        contains: [hljs.UNDERSCORE_TITLE_MODE]
      },
      {
        className: 'preprocessor',
        begin: '#\\!?\\[', end: '\\]'
      },
      {
        beginKeywords: 'type', end: '(=|<)',
        contains: [hljs.UNDERSCORE_TITLE_MODE],
        illegal: '\\S'
      },
      {
        beginKeywords: 'trait enum', end: '({|<)',
        contains: [hljs.UNDERSCORE_TITLE_MODE],
        illegal: '\\S'
      },
      {
        begin: hljs.IDENT_RE + '::'
      },
      {
        begin: '->'
      }
    ]
  };
}
