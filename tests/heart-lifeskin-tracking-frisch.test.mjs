import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { lies, funktion } from "./lifeskin-quelle.mjs";
import { normalisiere, aktualisiereLifeskinSitzungen, entdopple } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { pfadLesen } from "../shared/lifeskin-klickpfad.js";

const zeit = "2026-10-01T19:19:47.000Z";
const warteseite = { t: zeit, s: "Warteseite", e: "geoeffnet", d: "/analiza/fall" };
const therapie = { t: "2026-10-01T19:33:01.000Z", s: "Therapieseite", e: "geoeffnet", d: "/terapia/fall" };
const sitzung = (pfad, extra = {}) => normalisiere("fall", {
  createdAt: zeit, updatedAt: zeit, step: "result", timings: { pfad }, ...extra
});

test("neue Tracking-Ereignisse bleiben trotz unveraendertem updatedAt erhalten", () => {
  const alt = sitzung({ warten: warteseite });
  const frisch = sitzung({ warten: warteseite, therapie });
  let stand = aktualisiereLifeskinSitzungen({ sitzungen: [alt], tests: [], berichte: {} }, [frisch]);
  stand = aktualisiereLifeskinSitzungen({ ...stand, berichte: {} }, [alt]);
  assert.deepEqual(pfadLesen(stand.sitzungen[0]).map((e) => e.s), ["Warteseite", "Therapieseite"]);
});

test("ein neuerer Live-Stand behaelt seine Felder und den bereits geladenen Pfad", () => {
  const frisch = sitzung({ warten: warteseite, therapie });
  const live = sitzung({ warten: warteseite }, { updatedAt: "2026-10-01T19:34:00.000Z", step: "ordered" });
  const [mit] = entdopple([frisch, live]);
  assert.equal(mit.step, "ordered");
  assert.equal(pfadLesen(mit).length, 2);
  assert.equal(entdopple([mit, mit])[0], mit, "unveraenderte Daten behalten ihre Objektidentitaet");
});

test("die Einzelakte wird direkt vom Server gelesen, ohne updatedAt-Filter", async () => {
  const aufrufe = [];
  const kontext = vm.createContext({
    db: {}, TENANT: "lifeskin", normalisiere,
    doc: (...args) => args.slice(1),
    getDocFromServer: async (ref) => {
      aufrufe.push(ref);
      return { id: "fall", exists: () => true, data: () => ({ createdAt: zeit, updatedAt: zeit, timings: { pfad: { therapie } } }) };
    }
  });
  vm.runInContext(funktion(lies("apps/mnyra-heart/heart-lifeskin-adapter.js"), "ladeLifeskinSitzung").replace("export ", ""), kontext);
  const mit = await kontext.ladeLifeskinSitzung("fall");
  assert.equal(JSON.stringify(aufrufe), JSON.stringify([["lifeskin", "lifeskin", "sessions", "fall"]]));
  assert.equal(pfadLesen(mit)[0].s, "Therapieseite");
  await kontext.ladeLifeskinSitzung("");
  assert.equal(aufrufe.length, 1);
});

test("auch bei gespeicherten Fotos wird die Akte beim Oeffnen neu gelesen", async () => {
  let stand = { sitzungen: [sitzung({ warten: warteseite })], tests: [], berichte: {}, fotos: { fall: {} } };
  let gelesen = 0;
  const kontext = vm.createContext({
    store: { getState: () => ({ lifeskin: stand }) },
    actions: { patchLifeskin: (patch) => { stand = { ...stand, ...patch }; } },
    ladeLifeskinSitzung: async () => { gelesen++; return sitzung({ warten: warteseite, therapie }); },
    aktualisiereLifeskinSitzungen,
    lifeskinRasteBilderLaden: async () => {}, lifeskinNachOben() {},
    setToast() { assert.fail("kein Lesefehler erwartet"); },
    lifeskinListenStelle: 0
  });
  const quelle = lies("apps/mnyra-heart/heart.js");
  vm.runInContext(funktion(quelle, "lifeskinSitzungAuffrischen") + "\n" + funktion(quelle, "oeffneLifeskinSitzung"), kontext);
  await kontext.oeffneLifeskinSitzung("fall");
  assert.equal(gelesen, 1);
  assert.equal(stand.offen, "fall");
  assert.equal(pfadLesen(stand.sitzungen[0]).length, 2);
});

test("Aktualisieren liest die offene Akte vor dem inkrementellen Abgleich", async () => {
  const aufrufe = [];
  const kontext = vm.createContext({
    store: { getState: () => ({ lifeskin: { status: "ready", loadedFrom: "network", offen: "fall" } }) },
    liveStarten() {}, ndjekjaOps: { starten() {} }, dergesatOps: { starten() {}, abgleich() {} }, lifeskinAbgleichAb: zeit,
    lifeskinSitzungAuffrischen: async (id) => aufrufe.push(id),
    lifeskinNachholen: async () => { aufrufe.push("abgleich"); return true; }
  });
  vm.runInContext(funktion(lies("apps/mnyra-heart/heart.js"), "ladeLifeskinBereich"), kontext);
  await kontext.ladeLifeskinBereich({ force: true });
  assert.deepEqual(aufrufe, ["fall", "abgleich"]);
});
