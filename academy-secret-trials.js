/* Progressive secret chest mechanisms, independent of original story puzzles. */
export const PUZZLE_KEY='aca-secret-chest-trials-v1';
export const TRIALS=[
 {title:'The Rose and the Promise',steps:[
  {clue:'The first letter of every story is written in the heart. Choose its sigil.',options:['☾ Moon','♥ Heart','✦ Star'],answer:1,hint:'A heartbeat is the first clue.'},
  {clue:'The heart changes from shadow to warmth. Which color completes its journey?',options:['Black','Crimson red','Silver'],answer:1,hint:'The enchanted heart turns red.'}]},
 {title:'The Silver Looking Glass',steps:[
  {clue:'Which object can return your image?',options:['Mirror','Lantern','Book'],answer:0,hint:'Look into the silver glass.'},
  {clue:'A reflection reverses directions. If an arrow points left, its reflection points…',options:['Left','Up','Right'],answer:2,hint:'A horizontal reflection swaps left and right.'},
  {clue:'The broken mirror becomes whole. Choose the correct order.',options:['Restore → Gather → Reflect','Gather → Restore → Reflect','Reflect → Gather → Restore'],answer:1,hint:'Find the pieces before repairing the frame.'}]},
 {title:'The Owlkeeper’s Midnight Trail',steps:[
  {clue:'What lights the owl’s path after sunset?',options:['The moon','The sunrise','The rose'],answer:0,hint:'It shines in the night sky.'},
  {clue:'The moon grows from darkness toward fullness. What follows a new moon?',options:['Full moon','Waxing crescent','Waning crescent'],answer:1,hint:'The first visible sliver is growing.'},
  {clue:'A keeper marks 12, 3, 6, 9 on the clock. Which comes after 9 in this cycle?',options:['12','6','3'],answer:0,hint:'The clock completes its circle.'},
  {clue:'Follow the tale from night toward morning.',options:['Moon → Owl → Dawn','Dawn → Owl → Moon','Owl → Dawn → Moon'],answer:0,hint:'Start under moonlight and end at sunrise.'}]},
 {title:'The Five Lights of Tomorrow',steps:[
  {clue:'Before sunrise, the horizon is…',options:['Midnight black','First light','Noon'],answer:1,hint:'Look for the first glow.'},
  {clue:'Which color belongs to the Academy’s moonlit silver magic?',options:['Silver','Forest green','Orange'],answer:0,hint:'It is also the color of the castle trim.'},
  {clue:'The four original seals begin with…',options:['Moon','Heart','Dawn'],answer:1,hint:'The journey starts in the Heart Chamber.'},
  {clue:'After the Heart comes which original chamber?',options:['Midnight Labyrinth','Door to Tomorrow','Shattered Mirror'],answer:2,hint:'It holds the silver reflection.'},
  {clue:'Complete the sequence: Heart → Reflection → Moon → ?',options:['Dawn','Heart','Reflection'],answer:0,hint:'The night gives way to morning.'}]}
];
export function readTrials(){let raw={};try{raw=JSON.parse(localStorage.getItem(PUZZLE_KEY)||'{}')||{}}catch{}return Object.fromEntries(TRIALS.map((_,i)=>[i,raw[i]===true]))}
export function solved(chapter){return readTrials()[chapter]===true}
export function markSolved(chapter){if(!Number.isInteger(chapter)||chapter<0||chapter>=TRIALS.length)return false;const raw=readTrials();raw[chapter]=true;try{localStorage.setItem(PUZZLE_KEY,JSON.stringify(raw));return true}catch{return false}}
