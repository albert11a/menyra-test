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
    return false;
  });
}

export function createFakeFirestore(seed = {}) {
  const store = new Map();
  Object.keys(seed).forEach((path) => store.set(path, clone(seed[path])));

  const writeCounts = { set: 0, transactions: 0 };

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
        return snapshotFor(path);
      },
      async set(data, options) {
        applyWrite(path, data, options);
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
    async runTransaction(handler) {
      writeCounts.transactions += 1;
      // Eine Transaktion nach der anderen - wie Firestore es nach einem
      // Wiederholungslauf ohnehin tut.
      const run = transactionLock.then(async () => {
        const pending = [];
        const transaction = {
          async get(target) {
            return target?.__isDoc ? snapshotFor(target.path) : target.get();
          },
          set(ref, data, options) {
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
