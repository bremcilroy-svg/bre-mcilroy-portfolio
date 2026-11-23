/* Pure chapter-state regression tests: never reads or writes player storage. */
const fs=require('node:fs'),assert=require('node:assert/strict');
async function load(file){const source=fs.readFileSync(file,'utf8');return import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))}
(async()=>{
 const heart=await load('vault-state.js'),mirror=await load('vault-mirror-state.js'),lab=await load('vault-labyrinth-state.js'),dawn=await load('vault-dawn-state.js');
 let checks=0;function test(name,fn){fn();checks++;console.log('PASS',name)}
 test('Heart: fresh and forged saves stay locked',()=>{assert.equal(heart.normalizeState(null).completed,false);assert.equal(heart.normalizeState({completed:true,diaryOpen:true}).completed,false)});
 test('Heart: real puzzle order and code',()=>{const s=heart.normalizeState({found:heart.LETTERS,drawerOpen:true});assert(heart.canOpenDrawer(s,'3142'));assert(!heart.canOpenDrawer(s,'0000'));assert(heart.canOpenDiary(s,heart.DIARY_ORDER));assert(!heart.canOpenDiary(s,[...heart.DIARY_ORDER].reverse()))});
 test('Heart: earned completion survives reload',()=>{assert(heart.normalizeState({found:heart.LETTERS,drawerOpen:true,diaryOpen:true,completed:true}).completed)});
 test('Mirror: forged saves stay locked',()=>{assert.equal(mirror.normalizeMirrorState({completed:true,unlocked:true}).completed,false)});
 test('Mirror: restored fragments unlock valid completion',()=>{const s=mirror.normalizeMirrorState({found:mirror.FRAGMENTS,slots:mirror.MIRROR_LAYOUT,turns:Object.fromEntries(mirror.FRAGMENTS.map(x=>[x,0])),restored:true,unlocked:true,completed:true});assert(s.completed);assert(mirror.canAnswerReflection(s,'echo'));assert(!mirror.canAnswerReflection(s,'wrong'))});
 test('Labyrinth: forged saves stay locked',()=>{assert.equal(lab.normalizeLabyrinthState({completed:true,unlocked:true}).completed,false)});
 test('Labyrinth: caretaker clock and ledger complete',()=>{const s=lab.normalizeLabyrinthState({noteRead:true,gearInstalled:true,hour:3,minute:0,clockSet:true,found:lab.PAGE_IDS,slots:lab.LEDGER_ORDER,unlocked:true,completed:true});assert(s.completed);assert(lab.canSetClock(s));assert(lab.canOpenLedger(s))});
 test('Dawn: forged saves stay locked',()=>{assert.equal(dawn.normalizeDawnState({completed:true,unlocked:true}).completed,false)});
 test('Dawn: aligned panels and ordered book complete',()=>{const s=dawn.normalizeDawnState({emblemPlaced:true,panels:dawn.PANEL_IDS,turns:Object.fromEntries(dawn.PANEL_IDS.map(x=>[x,0])),lightAligned:true,found:dawn.PAGE_IDS,book:dawn.BOOK_ORDER,unlocked:true,completed:true});assert(s.completed);assert(dawn.canOpenBook(s))});
 console.log('Chapter state regression tests: '+checks+' passed');
})().catch(e=>{console.error(e);process.exitCode=1});
