/*
Language: YAML
Author: John Tantalo <john.tantalo@gmail.com>
*/
hljs.registerLanguage("yaml", function(hljs) {
  var IDENTIFIER = '[a-zA-Z_][a-zA-Z0-9_-]*';

  return {
    defaultMode: {
      contains: [
        'comment',
        'keyword'
      ],
    },
    modes: [
      {
        className: 'comment',
        begin: ' *-+',
        end: hljs.IMMEDIATE_RE
      },
      {
        className: 'keyword',
        begin: IDENTIFIER + ':',
        end: '\\n',
        contains: [
          {
            className: 'tag',
            begin: '[&*]id',
            endsWithParent: 1,
            contains: [
              {
                className: 'number',
                begin: '\\d',
                endsWithParent: 1
              }
            ]
          },
          {
            className: 'number',
            begin: hljs.NUMBER_RE,
            endsWithParent: 1
          },
          {
            className: 'string',
            begin: '\\S',
            endsWithParent: 1
          }
        ]
      }
    ]
  };
})
