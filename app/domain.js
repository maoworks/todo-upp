export const colors=['赤','オレンジ','黄色','緑'];
export const empty=()=>({version:1,folders:[],files:[],tasks:[],records:[],timer:null,settings:{sort:'priority',showDone:true}});
export function name(value,max){const v=String(value??'').trim();if(!v||[...v].length>max)throw Error(`名前は1〜${max}文字で入力してください。`);return v;}
export function validateTask(t){name(t.name,100);if(!Number.isInteger(t.priority)||t.priority<0||t.priority>3)throw Error('優先度を選んでください。');if([...t.memo].length>500)throw Error('メモは500文字以内です。');if(t.planned!==null&&(!Number.isInteger(t.planned)||t.planned<1||t.planned>59999))throw Error('予定時間は1〜59999分、または未設定にしてください。');if(t.due&&!/^\d{4}-\d{2}-\d{2}$/.test(t.due))throw Error('期限を確認してください。');}
export function inScope(s,scope){return s.tasks.filter(t=>scope.type==='all'||scope.type==='folder'&&t.folderId===scope.id||scope.type==='file'&&t.fileId===scope.id||scope.type==='task'&&t.id===scope.id);}
export function elapsed(timer,now=Date.now()){return timer?timer.elapsed+(timer.startedAt===null?0:Math.max(0,now-timer.startedAt)):0;}
export function start(s,taskId,now=Date.now(),id=crypto.randomUUID()){if(s.timer)throw Error('保存前の計測があります。「計測中に戻る」から続けてください。');const t=s.tasks.find(t=>t.id===taskId);if(!t||t.done)throw Error('未完了のToDoを選んでください。');s.timer={id,taskId,elapsed:0,startedAt:now,firstStartedAt:now};}
export function pause(s,now=Date.now()){if(!s.timer||s.timer.startedAt===null)throw Error('計測中ではありません。');s.timer.elapsed=elapsed(s.timer,now);s.timer.startedAt=null;}
export function resume(s,now=Date.now()){if(!s.timer||s.timer.startedAt!==null)throw Error('停止中ではありません。');s.timer.startedAt=now;}
export function record(s,now=Date.now()){const t=s.timer;if(!t||t.startedAt!==null)throw Error('停止してから記録してください。');if(t.elapsed<1000)throw Error('1秒以上の時間を記録してください。');if(!s.records.some(r=>r.id===t.id))s.records.push({id:t.id,taskId:t.taskId,durationMs:t.elapsed,startedAt:t.firstStartedAt,endedAt:now,memo:''});s.timer=null;}
export function stats(s,scope){const tasks=inScope(s,scope),ids=new Set(tasks.map(t=>t.id)),records=s.records.filter(r=>ids.has(r.taskId)),planned=tasks.filter(t=>t.planned!==null),pids=new Set(planned.map(t=>t.id));return{tasks,records,total:tasks.length,done:tasks.filter(t=>t.done).length,actual:records.reduce((a,r)=>a+r.durationMs,0),planned:planned.reduce((a,t)=>a+t.planned,0)*60000,comparableActual:records.filter(r=>pids.has(r.taskId)).reduce((a,r)=>a+r.durationMs,0),unset:tasks.length-planned.length};}
export function save(storage,state){storage.setItem('todo-v1',JSON.stringify(state));}
export function load(storage){
 const raw=storage.getItem('todo-v1');if(!raw)return empty();const s=JSON.parse(raw);
 const invalid=()=>{throw Error('保存データの形式を確認できません。元データは上書きしていません。');};
 if(s.version!==1||!['folders','files','tasks','records'].every(k=>Array.isArray(s[k]))||!s.settings)invalid();
 for(const key of ['folders','files','tasks','records']){if(s[key].some(x=>!x||typeof x.id!=='string')||new Set(s[key].map(x=>x.id)).size!==s[key].length)invalid();}
 const fids=new Set(s.folders.map(x=>x.id)),tids=new Set(s.tasks.map(x=>x.id));
 for(const f of s.folders)name(f.name,50);
 for(const f of s.files){name(f.name,50);if(!fids.has(f.folderId))invalid();}
 for(const t of s.tasks){validateTask(t);if(typeof t.name!=='string'||typeof t.memo!=='string'||typeof t.done!=='boolean'||!Number.isFinite(t.createdAt)||!fids.has(t.folderId)||t.fileId&&!s.files.some(f=>f.id===t.fileId&&f.folderId===t.folderId))invalid();}
 for(const r of s.records)if(!tids.has(r.taskId)||!Number.isFinite(r.durationMs)||r.durationMs<1000||!Number.isFinite(r.startedAt)||!Number.isFinite(r.endedAt))invalid();
 if(s.timer&&(!tids.has(s.timer.taskId)||typeof s.timer.id!=='string'||!Number.isFinite(s.timer.elapsed)||s.timer.elapsed<0||!Number.isFinite(s.timer.firstStartedAt)||s.timer.startedAt!==null&&!Number.isFinite(s.timer.startedAt)))invalid();
 if(!['priority','due','created'].includes(s.settings.sort)||typeof s.settings.showDone!=='boolean')invalid();
 return s;
}
