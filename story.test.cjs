const test=require('node:test');
const assert=require('node:assert/strict');
const S=require('./story.js');

test('every chapter has a mission, classroom bridge, and feedback for each offered response',()=>{
  assert.deepEqual(Object.keys(S.chapters),['near','far','walled','repair']);
  Object.values(S.chapters).forEach((chapter,index)=>{
    assert.equal(chapter.number,index+1);
    for(const field of ['title','scene','mentor','mission','question','bridge','concept','reflection'])
      assert.ok(chapter[field]?.length>10,field+' must contain usable copy');
    assert.equal(chapter.choices.length,3);
    const ids=chapter.choices.map(([id])=>id);
    assert.equal(new Set(ids).size,ids.length);
    assert.ok(ids.includes('unsure'));
    for(const [id,label] of chapter.choices){assert.ok(label);assert.ok(chapter.replies[id]);}
  });
});

test('classroom options have feedback and distinguish modeling from replacing thought',()=>{
  const fs=require('node:fs'),path=require('node:path');
  const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
  const options=html.match(/<select id="transfer-choice"[^>]*>([\s\S]*?)<\/select>/)[1];
  for(const match of options.matchAll(/<option value="([^"]+)"/g))assert.ok(S.transfer[match[1]]);
  assert.match(S.transfer.answer,/example to critique or revise/);
  assert.match(S.transfer.access,/accessible source texts/);
  assert.match(S.transfer.struggle,/learning|goal/);
});
