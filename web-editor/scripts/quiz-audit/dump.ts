/** Prints a world's lesson/set questions compactly (question, code, options, answer, explanation) for reading.
 *  npx tsx scripts/quiz-audit/dump.ts <world> <from> <to>   (Boss questions are excluded) */
const n=process.argv[2],from=Number(process.argv[3]),to=Number(process.argv[4]); const m:any=await import(`../../src/data/quizBank/world${n}Quiz`);
const qs:any[]=[]; const seen=new Set(); for(const k of Object.keys(m)) if(Array.isArray(m[k])&&!/BOSS/.test(k)) for(const q of m[k]) if(q?.id&&!seen.has(q.id)){seen.add(q.id);qs.push(q);}
qs.slice(from,to).forEach((q,i)=>{const code=(q.code??[]).join(' ⏎ ');let ans='';
 if(q.type==='true_false')ans=String(q.answer);else if(q.type==='multi_select')ans=q.answers.map((a:number)=>q.options[a]).join(' || ');
 else if(q.type==='fill_blank')ans=q.answer+' (chips '+q.chips.join(',')+')';
 else if(q.type==='find_error')ans='line '+q.errorLine+': '+(q.code[q.errorLine]??'').trim()+' | '+q.errorNote;
 else if(q.type==='code_comparison')ans=(q.answer?'B':'A')+' | A='+q.a.join(' ⏎ ')+' | B='+q.b.join(' ⏎ ');else ans=q.options[q.answer];
 console.log(`${from+i} ${q.id} ${q.difficulty[0]} ${q.type.slice(0,5)}${q.setId?' [set]':''} | ${q.question}${code?' || '+code:''}\n   opts: ${(q.options??[]).join(' | ').replace(/\n/g,'⏎')}\n   ANS: ${ans.replace(/\n/g,'⏎')}\n   EXP: ${q.explanation}`);});
