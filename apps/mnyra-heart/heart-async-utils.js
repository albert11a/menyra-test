// Mehrere Abrufe nebeneinander, aber nicht alle auf einmal.
//
// Die Namen der Lokale wurden in Zehnerpaketen nacheinander geholt: bei hundert
// Lokalen zehn Abfragen, eine nach der anderen, jede mit der vollen Wartezeit
// einer Mobilverbindung. Das war der Grund, warum der Landing-Bereich beim
// ersten Laden so lange auf "wird geladen" stand.
//
// Alle gleichzeitig loszuschicken waere bei sehr vielen Lokalen unhoeflich -
// darum eine Grenze, wie viele unterwegs sein duerfen.

export async function mapWithLimit(items, grenze, aufgabe) {
  const liste = Array.isArray(items) ? items : [];
  const maximum = Math.max(1, Math.floor(Number(grenze) || 1));
  const ergebnisse = new Array(liste.length);
  let naechster = 0;

  // Feste Zahl von Arbeitern, die sich der Reihe nach bedienen. Das haelt die
  // Zahl der gleichzeitigen Abrufe konstant bei der Grenze, statt sie nach
  // jedem Block auf den langsamsten warten zu lassen.
  async function arbeiten() {
    while (naechster < liste.length) {
      const index = naechster;
      naechster += 1;
      ergebnisse[index] = await aufgabe(liste[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(maximum, liste.length) }, () => arbeiten())
  );
  return ergebnisse;
}

// Eine Liste in Pakete fester Groesse zerlegen. Firestore nimmt bei einer
// "in"-Abfrage hoechstens zehn Werte auf einmal.
export function chunkList(items, groesse) {
  const liste = Array.isArray(items) ? items : [];
  const breite = Math.max(1, Math.floor(Number(groesse) || 1));
  const pakete = [];
  for (let index = 0; index < liste.length; index += breite) {
    pakete.push(liste.slice(index, index + breite));
  }
  return pakete;
}
