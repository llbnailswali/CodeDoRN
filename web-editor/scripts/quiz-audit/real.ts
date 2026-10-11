/** Runs a world's executable questions through real kotlinc: predictions, find-error lines (code line + 4), fill-in chips, code comparisons.
 *  npx tsx scripts/quiz-audit/real.ts <world>. Comparisons whose snippets show only calls report false alarms; check those by hand. */
import { runRealKotlin } from '../minikotlin/real-kotlin';
const n=process.argv[2]; const m:any=await import(`../../src/data/quizBank/world${n}Quiz`);
const qs:any[]=[]; const seen=new Set(); for(const k of Object.keys(m)) if(Array.isArray(m[k])&&!/BOSS/.test(k)) for(const q of m[k]) if(q?.id&&!seen.has(q.id)){seen.add(q.id);qs.push(q);}
const cases:{id:string;code:string}[]=[];
for(const q of qs){ if(q.type==='predict_output')cases.push({id:q.id,code:q.code.join('\n')});
 if(q.type==='fill_blank')for(const c of q.chips)cases.push({id:q.id+'::'+c,code:q.code.join('\n').replace('___',c)});
 if(q.type==='find_error')cases.push({id:q.id,code:q.code.join('\n')});
 if(q.type==='code_comparison'){cases.push({id:q.id+'::A',code:q.a.join('\n')});cases.push({id:q.id+'::B',code:q.b.join('\n')});}
 if(q.type==='single_choice'&&q.code)q.options.forEach((o:string,i:number)=>0);}
const r=await runRealKotlin(cases);
let bad=0;
for(const q of qs){
 if(q.type==='predict_output'){const a:any=r.get(q.id);const exp=q.options[q.answer];if(a.stage!=='ok'||a.output.trim()!==exp){bad++;console.log('PREDICT MISMATCH',q.id,a.stage,JSON.stringify(a.output?.trim()??a.errors?.[0]),'key',JSON.stringify(exp));}}
 if(q.type==='find_error'){const a:any=r.get(q.id);const want=q.errorLine+4;const lines=(a.errors||[]).map((e:string)=>Number((e.match(/^line (\d+)/)||[])[1]));
  if(a.stage!=='compile'||!lines.includes(want)){bad++;console.log('FIND_ERROR',q.id,a.stage,'keyed line',want,'compiler:',JSON.stringify(a.errors?.slice(0,3)),'| keyed:',q.code[q.errorLine]);}}
 if(q.type==='fill_blank'){const res=q.chips.map((c:string)=>{const a:any=r.get(q.id+'::'+c);return [c,a.stage,a.output?.trim()];});const good=res.find((x:any)=>x[0]===q.answer) as any;
  const others=res.filter((x:any)=>x[0]!==q.answer&&x[1]==='ok'&&x[2]===good[2]);if(good[1]!=='ok'||others.length){bad++;console.log('FILL',q.id,JSON.stringify(res));}}
 if(q.type==='code_comparison'){const A:any=r.get(q.id+'::A'),B:any=r.get(q.id+'::B');const right=q.answer===0?A:B,wrong=q.answer===0?B:A;
  if(right.stage!=='ok'||(wrong.stage==='ok'&&wrong.output?.trim()===right.output?.trim())){bad++;console.log('COMPARE',q.id,'right',right.stage,right.output?.trim(),'| wrong',wrong.stage,wrong.output?.trim()??wrong.errors?.[0]);}
  else console.log('compare ok',q.id,'right:',JSON.stringify(right.output?.trim()),'wrong:',wrong.stage,JSON.stringify(wrong.output?.trim()??wrong.errors?.[0]).slice(0,70));}
}
console.log('executable cases',cases.length,'problems',bad);
