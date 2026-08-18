// Eine Firestore-Attrappe fuer die GO-Servertests.
//
// Sie kann genau so viel, wie der GO-Dienst benutzt: Dokumente lesen und
// schreiben, einfache Abfragen mit Gleichheit und "in", Sammlungsgruppen und
// Transaktionen.
//
// Zur Transaktion: Sie laeuft hier nacheinander, mit einer Sperre. Das ist
// kein Kompromiss, sondern genau das beobachtbare Verhalten von Firestore -
// zwei gleichzeitige Transaktionen auf demselben Dokument werden dort
// wiederholt, bis eine nach der anderen durchlaeuft. Der zweite Gast sieht
// also in beiden Welten den Stand, den der erste hinterlassen hat.

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function segments(path) {
  return String(path || "").split("/").filter(Boolean);
}

function matchesFilters(data, filters) {
  return filters.every((filter) => {
    const value = data?.[filter.field];
    if (filter.op === "==") return value === filter.value;
    if (filter.op === "in") return Array.isArray(filter.value) && filter.value.includes(value);
    if (filter.op === "array-contains") return Array.isArray(value) && value.includes(filter.value);
    // Bereichsvergleiche. Firestore kann sie, also kann die Attrappe sie auch -
    // sonst faellt ein Test, weil das Doppel etwas nicht kann, und nicht, weil
    // der Code etwas falsch macht.
    //
    // Verglichen wird mit den Operatoren von JavaScript. Fuer Zahlen und fuer
    // ISO-Zeitstempel ist das dieselbe Ordnung wie in Firestore; etwas anderes
    // vergleicht GO an keiner Stelle.
    if (filter.op === ">=") return value !== undefined && value >= filter.value;
    if (filter.op === "<=") return value !== undefined && value <= filter.value;
    if (filter.op === ">") return value !== undefined && value > filter.value;
    if (filter.op === "<") return value !== undefined && value < filter.value;
    if (filter.op === "!=") return value !== filter.value;
    return false;
  });
}

export function createFakeFirestore(seed = {}) {
  const store = new Map();
  Object.keys(seed).forEach((path) => store.set(path, clone(seed[path])));

  const writeCounts = { set: 0, transactions: 0 };
  // Wieviele Wege zur Datenbank eine Suche wirklich geht. Ein Test, der nur
  // das Ergebnis prueft, sieht nicht, ob es 8 Dokumente gekostet hat oder 400.
  //
  // `docs` zaehlt Dokumente, `singleGets` zaehlt WEGE - ein Sammelaufruf holt
  // hundert Dokumente auf einem. Die Wartezeit des Gastes haengt an den Wegen,
  // die Rechnung an den Dokumenten; deshalb stehen beide getrennt.
  const readCounts = { docs: 0, singleGets: 0, getAll: 0, queries: 0 };

  function snapshotFor(path) {
    const data = store.get(path);
    const parts = segments(path);
    const id = parts[parts.length - 1];
    const parentCollection = parts.slice(0, -1).join("/");
    const grandParentDoc = parts.slice(0, -2).join("/");
    return {
      id,
      exists: data !== undefined,
      data: () => clone(data),
      ref: {
        path,
        id,
        parent: {
          path: parentCollection,
          parent: grandParentDoc
            ? { path: grandParentDoc, id: segments(grandParentDoc).pop() }
            : null
        }
      }
    };
  }

  function applyWrite(path, data, options = {}) {
    writeCounts.set += 1;
    const next = clone(data) || {};
    if (options.merge) {
      const current = store.get(path) || {};
      store.set(path, { ...current, ...next });
      return;
    }
    store.set(path, next);
  }

  function runQuery({ basePath, collectionId, groupScope, filters, limit }) {
    const results = [];
    store.forEach((data, path) => {
      const parts = segments(path);
      if (parts.length < 2) return;
      const parentPath = parts.slice(0, -1).join("/");
      if (groupScope) {
        if (parts[parts.length - 2] !== collectionId) return;
      } else if (parentPath !== basePath) {
        return;
      }
      if (!matchesFilters(data, filters)) return;
      results.push(snapshotFor(path));
    });
    const limited = Number.isFinite(limit) ? results.slice(0, limit) : results;
    return {
      empty: limited.length === 0,
      size: limited.length,
      docs: limited,
      forEach: (callback) => limited.forEach(callback)
    };
  }

  function createQuery(config) {
    return {
      where(field, op, value) {
        return createQuery({ ...config, filters: [...config.filters, { field, op, value }] });
      },
      limit(count) {
        return createQuery({ ...config, limit: count });
      },
      orderBy() {
        return createQuery(config);
      },
      async get() {
        readCounts.queries += 1;
        return runQuery(config);
      }
    };
  }

  function createCollection(path, collectionId, groupScope = false) {
    const base = createQuery({ basePath: path, collectionId, groupScope, filters: [], limit: undefined });
    return {
      ...base,
      path,
      doc(id) {
        return createDoc(`${path}/${id}`);
      }
    };
  }

  function createDoc(path) {
    return {
      __isDoc: true,
      path,
      id: segments(path).pop(),
      collection(name) {
        return createCollection(`${path}/${name}`, name);
      },
      async get() {
        readCounts.docs += 1;
        readCounts.singleGets += 1;
        return snapshotFor(path);
      },
      async set(data, options) {
        applyWrite(path, data, options);
        return { writeTime: Date.now() };
      },
      // Das Admin-SDK legt mit `create` nur an, was es noch nicht gibt, und
      // scheitert sonst. Der Dienst benutzt das dort, wo "war das schon da?"
      // ohne Wettlauf beantwortet werden muss (markGoViewerSeen) - die
      // Attrappe kann es deshalb auch, sonst pruefte jeder Test nur den
      // Ersatzweg.
      async create(data) {
        if (store.has(path)) {
          const error = new Error(`document already exists: ${path}`);
          error.code = 6;
          throw error;
        }
        applyWrite(path, data, {});
        return { writeTime: Date.now() };
      }
    };
  }

  let transactionLock = Promise.resolve();

  const db = {
    collection(name) {
      return createCollection(name, name);
    },
    collectionGroup(name) {
      return createCollection("", name, true);
    },
    // Der Sammel-Lesevorgang des Admin-SDK: viele Dokumente, ein Weg zur
    // Datenbank. Die Attrappe kann ihn, damit der Dienst im Test denselben
    // Zweig nimmt wie in der Cloud - sonst pruefte jeder Test nur den
    // Ersatzweg, und der schnelle Weg waere ungetestet.
    async getAll(...refs) {
      readCounts.getAll += 1;
      const list = refs.flat().filter(Boolean);
      readCounts.docs += list.length;
      return list.map((ref) => snapshotFor(ref.path));
    },
    async runTransaction(handler) {
      writeCounts.transactions += 1;
      // Eine Transaktion nach der anderen - wie Firestore es nach einem
      // Wiederholungslauf ohnehin tut.
      const run = transactionLock.then(async () => {
        const pending = [];
        // Firestore laesst in einer Transaktion KEINEN Lesevorgang nach dem
        // ersten Schreibvorgang zu. Die Attrappe muss das genauso hart
        // ablehnen, sonst laeuft im Test durch, was in der Cloud abbricht -
        // und genau das ist einmal passiert: Das Absagen einer Buchung schrieb
        // erst den Status und wollte danach die Zaehler lesen. Alle Tests
        // gruen, in Produktion jedes Mal ein Abbruch.
        let hasWritten = false;
        const transaction = {
          async get(target) {
            if (hasWritten) {
              throw new Error(
                "Firestore transactions require all reads to be executed before all writes."
              );
            }
            return target?.__isDoc ? snapshotFor(target.path) : target.get();
          },
          set(ref, data, options) {
            hasWritten = true;
            pending.push({ path: ref.path, data, options });
          }
        };
        const result = await handler(transaction);
        pending.forEach((write) => applyWrite(write.path, write.data, write.options));
        return result;
      });
      transactionLock = run.then(() => {}, () => {});
      return run;
    },
    // Nur fuer die Tests: hineinschauen und nachzaehlen.
    __store: store,
    __writeCounts: writeCounts,
    __readCounts: readCounts,
    __read(path) {
      return clone(store.get(path));
    },
    __all(prefix) {
      const found = [];
      store.forEach((data, path) => {
        if (path.startsWith(prefix)) found.push({ path, data: clone(data) });
      });
      return found;
    }
  };

  return db;
}
