/*
Language: pig
Author: Krishna Koneru <krishna.koneru@gmail.com>
Category: common
*/

hljs.registerLanguage('pig', function(hljs) {
  var APOS_STRING = {
    className: 'string',
    begin: /'/, end: /'/
  };
  var PIG_KEYWORDS = {
    keyword: 'SPLIT BY LOAD STORE DUMP UNION PARALLEL FILTER FOREACH FLATTEN ' +
    'GENERATE ILLUSTRATE DESCRIBE GROUP COGROUP JOIN LIMIT SAMPLE STREAM DEFINE DISTINCT ' +
    'AND OR NOT COUNT BY AS SUM ALL BY USING INNER LEFT RIGHT FULL OUTER ASC DESC INTO IF ' +
    'THROUGH ORDER INPUT OUTPUT CACHE AVG CONCAT COUNT_STAR DIFF TOKENIZE REPLACE TRIM OTHERWISE ' +
    'MAX MIN SIZE is IS not matches group TOBAG using as %declare %default DIFF describe define double dump',
    constant: 'null NULL',
    typename: 'int float double chararray bytearray tuple bag map',
    built_in: 'BinStorage PigStorage PigDump TextLoader IsEmpty ls cd cat pwd help ' +
    'copyFromLocal copyToLocal cp mkdir mv rm rmf exec run kill quit Register declare ' +
    'default REGISTER SET set ToDate AddDuration du'
  };
  return {
    aliases: ['pig'],
    keywords: PIG_KEYWORDS,
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.COMMENT('--', '$'),
      hljs.NUMBER_MODE,
      {
        className: 'decorator',
        begin: /%/
      },
      APOS_STRING
    ]
  };
})