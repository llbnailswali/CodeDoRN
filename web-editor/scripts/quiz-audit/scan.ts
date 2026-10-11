/** Mechanical scan of one world's quiz bank: filler options, generic prompts, repeated explanations/hints/code, answer balance, per-lesson mix.
 *  npx tsx scripts/quiz-audit/scan.ts <world number>   (see QUIZ_QUALITY_STANDARD.md, audit procedure) */
const n=process.argv[2]; const m:any=await import(`../../src/data/quizBank/world${n}Quiz`);
const qs:any[]=[]; const seen=new Set(); for(const k of Object.keys(m)) if(Array.isArray(m[k])) for(const q of m[k]) if(q?.id&&!seen.has(q.id)){seen.add(q.id);qs.push(q);}
const by=(f:(q:any)=>string)=>{const mm=new Map<string,string[]>();qs.forEach(q=>{const k=f(q);mm.set(k,[...(mm.get(k)||[]),q.id]);});return [...mm.entries()].filter(([,v])=>v.length>1);};
console.log('total',qs.length);
console.log('filler:',qs.filter(q=>(q.options||[]).some((o:string)=>/^Not |\(\d\)$/.test(o))).map(q=>q.id));
console.log('generic TF:',qs.filter(q=>/^True or false:/.test(q.question)).map(q=>q.id));
console.log('dup explanations:',by(q=>q.explanation).map(([k,v])=>v.join(',')));
console.log('dup code+options:',by(q=>JSON.stringify([q.code??q.a??null,q.options??null,q.question])).map(([,v])=>v));
console.log('dup code only:',by(q=>JSON.stringify(q.code??q.a??null)).filter(([k])=>k!=='null').map(([,v])=>v));
console.log('dup question text:',by(q=>q.question).map(([k,v])=>v.length+'x '+k.slice(0,50)));
const per:any={};qs.forEach(q=>{per[q.lessonId]=per[q.lessonId]||{n:0,t:{} as any,d:{easy:0,medium:0,hard:0} as any};const p=per[q.lessonId];p.n++;p.t[q.type]=(p.t[q.type]||0)+1;p.d[q.difficulty]++;});
for(const [l,p] of Object.entries<any>(per))console.log(l.replace(/^world-\d+-/,'').padEnd(34),p.n,JSON.stringify(p.d),Object.entries(p.t).map(([k,v])=>k.slice(0,4)+v).join(' '));
const pos:any={};qs.filter(q=>typeof q.answer==='number'&&q.options).forEach(q=>pos[q.answer]=(pos[q.answer]||0)+1);console.log('answer positions',pos);
console.log('multi answer counts',qs.filter(q=>q.type==='multi_select').map(q=>q.answers.length).join(''));
console.log('tf',qs.filter(q=>q.type==='true_false').reduce((a:any,q)=>{a[q.answer]=(a[q.answer]||0)+1;return a},{}));
