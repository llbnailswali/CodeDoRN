/** All-worlds check of the standard: type vs difficulty ranges, XP, type-mix warnings. Boss mix is checked by reading `e/m/h` per world.
 *  npx tsx scripts/quiz-audit/std-scan.ts */
import * as W1 from '../../src/data/quizBank/world1Quiz';
import * as W2 from '../../src/data/quizBank/world2Quiz';
import * as W3 from '../../src/data/quizBank/world3Quiz';
import * as W4 from '../../src/data/quizBank/world4Quiz';
import * as W5 from '../../src/data/quizBank/world5Quiz';
import * as W6 from '../../src/data/quizBank/world6Quiz';
import * as W7 from '../../src/data/quizBank/world7Quiz';
import * as W8 from '../../src/data/quizBank/world8Quiz';
import * as W9 from '../../src/data/quizBank/world9Quiz';
import * as W10 from '../../src/data/quizBank/world10Quiz';
const worlds: any[] = [W1,W2,W3,W4,W5,W6,W7,W8,W9,W10];
const RANGE: Record<string,string[]> = {
  true_false:['easy'], single_choice:['easy','medium'], fill_blank:['easy','medium'],
  multi_select:['medium','hard'], code_comparison:['medium','hard'], predict_output:['medium','hard'], find_error:['medium','hard'],
};
const XP: Record<string,number> = {easy:10,medium:15,hard:20};
for (let i=0;i<10;i++){
  const m = worlds[i]; const all: any[] = [];
  for (const k of Object.keys(m)) if (Array.isArray(m[k]) && m[k][0]?.type) all.push(...m[k].map((q:any)=>({...q,_src:k})));
  const ids = new Set<string>(); const uniq = all.filter(q=>!ids.has(q.id)&&ids.add(q.id));
  const d:any={easy:0,medium:0,hard:0}; const t:any={}; const viol:string[]=[]; const xpv:string[]=[];
  for (const q of uniq){ d[q.difficulty]++; t[q.type]=(t[q.type]||0)+1;
    if(!RANGE[q.type]?.includes(q.difficulty)) viol.push(`${q.id}(${q.type}/${q.difficulty})`);
    if(q.xp!==XP[q.difficulty]) xpv.push(`${q.id}(xp ${q.xp}/${q.difficulty})`);}
  const n=uniq.length; const pct=(x:number)=>Math.round(100*x/n);
  console.log(`\nW${i+1}: ${n} q | exports: ${Object.keys(m).filter(k=>Array.isArray(m[k])).join(',')}`);
  console.log(`  diff e/m/h = ${pct(d.easy)}/${pct(d.medium)}/${pct(d.hard)}  types: ${Object.entries(t).map(([k,v]:any)=>k+' '+pct(v)+'%').join(', ')}`);
  console.log(`  type-range violations: ${viol.length} ${viol.slice(0,12).join(' ')}`);
  console.log(`  xp mismatches: ${xpv.length} ${xpv.slice(0,5).join(' ')}`);
  const byL:any={}; for(const q of uniq){(byL[q.lessonId]??=[]).push(q);}
  const warn:string[]=[]; for(const [l,qs] of Object.entries<any[]>(byL)){const tc:any={};qs.forEach(q=>tc[q.type]=(tc[q.type]||0)+1);
    const mx=Math.max(...Object.values<number>(tc)); const nt=Object.keys(tc).length;
    if(qs.length>=6 && (mx/qs.length>0.4||nt<3)) warn.push(`${l.replace(/^world-\d+-/,'')}[n${qs.length},max${Math.round(100*mx/qs.length)}%,types${nt}]`);}
  console.log(`  type-mix warnings: ${warn.length} ${warn.join(' ')}`);
}
