const { test } = require('node:test');
const assert = require('node:assert/strict');
const { toBooleanQuery } = require('../search');

test('DS-4: boolean expressions require whole Unicode words and drop punctuation/operators', () => {
  for (const [input, expected] of [
    ['Joy Hing', '+"Joy" +"Hing"'],
    ["Dragon's Back", '+"Dragon" +"Back"'],
    ['叉烧', '+"叉烧"'],
    ['a', null],
    ['   ', null],
    ['+ - () ~ * " @', null],
    ['foo+bar -baz@hello*', '+"foo" +"bar" +"baz" +"hello"'],
    ['a 𠀀 𠀀𠀁', '+"𠀀𠀁"'],
    ['café 中文', '+"café" +"中文"'],
  ])
    assert.equal(toBooleanQuery(input), expected, input);
  assert.equal(
    toBooleanQuery('aa bb cc dd ee ff gg hh ii jj kk'),
    '+"aa" +"bb" +"cc" +"dd" +"ee" +"ff" +"gg" +"hh" +"ii" +"jj"',
  );
});
