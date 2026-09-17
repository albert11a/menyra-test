# LifeSkin-Prompt - was sich von Fassung zu Fassung geaendert hat

Diese Datei ist der Verlauf von `docs/lifeskin-prompt-v5.json`. Er stand bis
v5.3 im Prompt selbst, in `_lexo_kete_para`, und war dort rund 3,4 KB, die das
Modell bei jedem Fall mitliest, ohne dass eine einzige Zeile davon den Befund
aendert. Ein Prompt ist die Anweisung fuer diesen einen Fall - die Geschichte
der Anweisung gehoert nicht hinein.

Hier bleibt sie trotzdem stehen: Wer eine Regel im Prompt nicht versteht,
findet hier, gegen welchen Fehler sie geschrieben wurde.

## v5 gegenueber v4

: v4 hat den lautesten Einzelbefund zur Ueberschrift gemacht. Ein Gesicht mit deutlich sichtbaren Poren und einem einzigen Pickel wurde zu 'kleiner isolierter Pickel am Kinn' - weil sichtbar erweiterte Poren in v4 ueberhaupt keine Note bekommen konnten. v5 macht einen vollstaendigen dermatologischen Durchgang ueber acht Merkmalsachsen, gibt erweiterten Poren eine Note, waehlt die Ueberschrift nach Ausdehnung statt nach Auffaelligkeit und laesst keinen der zehn Parameter unbeschrieben.

## v5.1 gegenueber v5

nichts am Befundverfahren, alles an der Wahrheit ueber die Seite. (a) pamja_e_faqes stimmte an drei Stellen nicht mehr mit apps/lifeskin-astra ueberein: der Satz unter 'Hapi i radhes' ist neu, die Autorenzeile faellt ohne aerztliche Freigabe ganz aus statt einen KI-Hinweis zu zeigen, und Abschnitt 04 verspricht jetzt eine woechentliche Online-Beratung mit neuem Scan. (b) DIE ANGEBOTSSPERRE GIBT ES NICHT MEHR: pjesa_1 behauptete, i_pavleresueshem und kontroll_mjekesor liessen 'die ganze Angebotsstrecke entfallen'. Das war seit dem Wegfall von reportAllowsOffer falsch und setzte den Status unter Verkaufsdruck - genau das, was 7_sinjalet verbietet. (c) skema_e_pergjigjes zeigte vier Loecher, die die eigenen Regeln verbieten (leeres synimi_28, leeres pas_6_muajsh, ein einziger termat-Eintrag, leere produkt_id bei belegtem Bedarf); sie sind gefuellt, weil ein Modell die naechstliegende vollstaendige Vorlage nachbaut. (d) Zwei fehlende Grenzen ergaenzt: gjetja_dyta und zonat_e_kontrolluara.

## v5.2 gegenueber v5.1

zwei Dinge, und beide betreffen die fertige Seite, nicht das Befundverfahren. (a) KEIN NAME, NIRGENDS. In hyrja.pacienti stand ein ausgeschriebener Vorname als Platzhalter, und das Beispiel redete den Patienten damit an. Ein Platzhaltername wird abgeschrieben: Er landet im Befund eines anderen Menschen. Der Name steht jetzt nirgends im Prompt, und keine Ausgabe darf einen enthalten - auch nicht den echten, den Heart mitschickt. Er ist da, damit Dr. Gashi den Fall zuordnet, nicht damit der Befund jemanden begruesst. (b) KEIN FELD, DAS DIE SEITE ZEIGT, BLEIBT LEER. Fuehrend: diagnoza.latinisht. Die Seite blendet diese Zeile aus, wenn sie leer ist (#an-diagnozalat), und v5.1 erlaubte sie leer - im durchgerechneten Beispiel war sie es sogar. Dafuer gibt es jetzt diagnoza_latinisht: eine feste Tabelle je Einordnung, abzuschreiben, nie zu erfinden. Dazu Mindestzahlen fuer Zonenzeilen, Begriffe und Bedarf, und beide Beispielbloecke sind vollstaendig ausgefuellt - ein Modell baut die naechstliegende vollstaendige Vorlage nach, und eine Luecke im Beispiel wird zur Luecke auf der Seite.

## v5.3 gegenueber v5.2

drei Dinge. (a) DIE ANAMNESE KOMMT MIT. Der Trichter fragt nach der Aufnahme vier kurze Sachen: was den Patienten am meisten stoert (bis zu zwei aus sieben), Altersgruppe, wie sich die Haut anfuehlt, und ob Schwangerschaft, Isotretinoin oder eine laufende Behandlung vorliegen. Diese Antworten stehen jetzt in hyrja.anamneza und sind VERBINDLICH zu beruecksichtigen - siehe anamneza_rregullat. (b) DIE STIMME. Der Befund ist der Text, den Dr. Gashi unterschreibt; er ist in ihrer Stimme geschrieben, in der ersten Person, ohne ein Wort ueber das Werkzeug, das ihn entworfen hat. (c) Der Name kommt jetzt wirklich an: Heart hat bisher session.age gelesen, das Feld heisst ageBand - die Altersgruppe war in jedem Prompt leer.
