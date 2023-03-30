/*
Language: Solidity
Author: Your Name <your@email.com>
Description: language definition for Solidity programming language used for developing smart contracts on the Ethereum blockchain
Website: https://soliditylang.org/
Category: common, blockchain
*/

hljs.registerLanguage('solidity', function(hljs) {
  var NUMBER = {className: 'number', relevance: 0, variants: [
    {begin: '\\b(0[bB][01]+)'}, // binary
    {begin: '\\b(0[oO][0-7]+)'}, // octal
    {begin: '\\b(0[xX][0-9a-fA-F]+)'}, // hex
    {begin: '\\b([0-9]+(\\.[0-9]+)?([eE][+-]?[0-9]+)?)'} // decimal
  ]};
  var KEYWORDS = {
    keyword:
      'pragma return assembly break continue do else for if import ' +
      'new try catch throw while emit event mapping struct enum ' +
      'constructor modifier function selfdestruct payable view pure ' +
      'constant external public private internal indexed memory storage ' +
      'function view payable returns',
    built_in:
      'assert require revert block coinbase difficulty gaslimit ' +
      'gasprice number timestamp tx blockhash'
  };
  return {
    aliases: ['solidity', 'sol'],
    case_insensitive: true,
    keywords: KEYWORDS,
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.APOS_STRING_MODE,
      {
        className: 'string',
        begin: '"""', end: '"""',
        relevance: 10
      },
      NUMBER,
      {
        className: 'meta',
        begin: '^\\s*#', end: '$',
        contains: [
          {
            className: 'meta-string',
            variants: [
              { begin: /<.*?>/ },
              { begin: /\".*\"/ },
              { begin: /\'.*\'/ }
            ]
          }
        ]
      },
      {
        className: 'function',
        beginKeywords: 'function', end: /\{/, excludeEnd: true,
        illegal: /\[|%/,
        contains: [
          hljs.TITLE_MODE,
          {
            className: 'params',
            begin: /\(/, end: /\)/,
            excludeBegin: true,
            excludeEnd: true,
            contains: [
              hljs.SELF_CONTAINED,
              {
                className: 'param',
                begin: /(\b[a-zA-Z_$][\w$]*)\s*:/, end: /,/,
                returnBegin: true, excludeEnd: true
              }
            ]
          }
        ]
      },
      {
        className: 'class',
        beginKeywords: 'contract interface', end: /\{/, excludeEnd: true,
        contains: [
          hljs.TITLE_MODE,
          {
            className: 'inheritance',
            begin: /is/, end: /(\s|\{|$)/,
            keywords: {keyword: 'is'}
          }
        ]
      }
    ]
  };
})
