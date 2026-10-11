import test from 'node:test';
import assert from 'node:assert/strict';
import { rutinaEvent, rutinaEvents } from '../shared/lifeskin-rutina.js';
import { baueRutina, renderRutina } from '../apps/mnyra-heart/heart-lifeskin-rutina.js';
import { faelligeMeldungen, meldungsKennung } from '../scripts/meldungs-waechter/meldungs-regeln.mjs';
import { heuteSchluessel } from '../apps/mnyra-heart/heart-lifeskin-berechnung.js';
import { Sitzung } from '../apps/lifeskin/lifeskin-session.js';
const now = new Date().toISOString();
const e = (kind,ids,id,at=now) => rutinaEvent(kind,ids,at,id);
const duo=['lf-acne','lf-moistur'];
const session = events => ({ step:'opened', updatedAt:now, timings:{ rutina:Object.fromEntries(events.map(e => [e.id,e])) } });

test('statistics count event snapshots, rank completed selections, and total prices rather than sales', () => {
 const s=session([e('start',[],'rstart11'),e('finish',duo,'rfinish1'),e('finish',['lf-clean'],'rfinish2'),e('details',duo,'rdetail1'),e('order',duo,'rorder11')]);
 const stats=baueRutina([s, {...s,test:true}]);
 assert.deepEqual([stats.starts,stats.finishes,stats.details,stats.orders,stats.total],[1,2,1,1,40]);
 assert.deepEqual(stats.prices,[[15,1],[25,1]]);
 assert.equal(stats.ranking.at(-1).id,'lf-pore');
 assert.match(renderRutina(stats),/Gesamtpreis fertiger Routinen/);
});
test('time range uses action date, not old session start or last activity', () => {
 const old='2020-01-01T12:00:00Z';
 const s=session([e('start',[],'rstart11',old),e('finish',duo,'rfinish1')]);s.tag='2020-01-01';
 const stats=baueRutina([s],'heute'); assert.equal(stats.starts,0); assert.equal(stats.finishes,1);
 assert.ok(heuteSchluessel());
});
test('invalid product, forged price and invalid timestamp do not count', () => {
 assert.equal(rutinaEvent('finish',['unknown'],now,'rfinish1'),null);
 const event=e('finish',duo,'rfinish1');event.price=500;
 assert.deepEqual(rutinaEvents(session([event])),[]);
 assert.equal(rutinaEvent('finish',duo,'oops','rfinish1'),null);
});
test('fresh completions notify independently and old/test events do not', () => {
 const s=session([e('finish',duo,'rfinish1'),e('finish',['lf-clean'],'rfinish2'),e('finish',duo,'rfinish3','2020-01-01T12:00:00Z')]);
 const n=faelligeMeldungen(s);assert.equal(n.length,2);
 assert.match(n[0].text('Albert'),/25 €/);
 assert.notEqual(meldungsKennung(n[0].type,'session',n[0].eventId),meldungsKennung(n[1].type,'session',n[1].eventId));
 assert.deepEqual(faelligeMeldungen({...s,test:true}),[]);
});
test('session writes a routine event with leaf mask preserving other timings', async () => {
 const writes=[];
 const s=new Sitzung({speicher:null,fetchFn:async(url,opt={}) => {writes.push({url:String(url),opt});return {ok:true,status:200,json:async()=>({})};}});
 s.id='abcdef123456';
 await s.rutinaSchreiben(e('start',[],'rstart11'));
 const write=writes.find(x=>x.opt.method==='PATCH');assert.ok(write);
 assert.match(write.url,/timings.rutina.rstart11/);assert.doesNotMatch(write.url,/fieldPaths=timings(?:&|$)/);
});
