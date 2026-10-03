# SkinReact im Acne-Duo-Laden

Status: implemented and locally verified, 2026-10-03.

Scope authorized: replace dermatologist entry card with a full-width scan section, retain existing camera/pose capture, skip pre-order questions/contact fields for this shop flow, show a pending state until genuine staff approval. Heart Acne Duo → Fälle receives a first SkinReact chip with all captured cases, left preview image and inline five-point range selector / Dërgo. Existing cart and checkout remain the ordering path.

The range is a manually entered, indicative product suitability assessment from photos, not a calibrated treatment success probability. No random value, autoapproval, fixed positive minimum or hidden simulation. Repeat visits to the same browser session read the same saved approval. No biometric identity matching. Low suitability directs to personal advice. Offline or absent approval never invents a result.

Storage: existing session source map identifies workflow; original photos and original reports collection. Only authenticated CEO can release assessment into report; public client reads its unguessable report ID. No new rules, functions or production deploy. Meta Pixel / CAPI calls and config unchanged.

Validation: 123 scoped Node checks (range validation, stable sessions, legacy resume, polling failure handling, Heart case/status/drafts, shop ordering, existing camera robustness and immutable Pixel/CAPI). Mobile browser checks at 320/390/430 px; shop also 768/1440 px, no overflow or page errors. Local mocked REST approval → result → original cart → checkout verified; direct start requests camera without choice/contact screen. Heart click/change forwarding and draft preservation during morph verified. Rendered example cases are synthetic fixtures. Existing live pose ring and capture engine unchanged; real physical iPhone camera and live staff release not exercised against production. Build succeeds; no tracked bundles changed. No production rules/functions deploy needed.

Polling displays approved range within the next two-second successful request, continues to reflect corrections, and stops on returning to shop. Old submitted shop analyses retain their original therapy route. Existing source campaign values preserved. New scans are marked only when started, not for every shop visit.

## Inline scan correction (2026-10-03)
Camera and preparation/result screens are now embedded at the guide position inside #zgjedhja. The landing stays visible. Original video/canvas nodes and pose capture are reused; there is no second scanner. The inline camera uses available section width instead of viewport-height sizing. Cancel stops camera and restores guide. Other landing flows retain their fullscreen behavior.

## Stable scan stage
Starting the camera now overlays the original guide inside its unchanged square, without scrolling, hiding the sticky bar or inserting extra controls. Guidance remains in its reserved four-line slot and the existing start button becomes cancel. Completion uses the same diameter for a processing ring and the genuinely approved suitability range; explanatory text and order controls follow underneath.

Mobile guidance correction: the text slot reserves four lines (84px), retains normal block line wrapping, and can grow instead of clipping. Start/camera geometry is checked at 320, 390 and 430px.

## Schalter Auto / Manuell (2026-10-03, Entscheidung Inhaber)
Derselbe Schalter wie am Feld Përputhja (`lifeskin/lifeskin/config/perputhja`) steht ueber der SkinReact-Liste in Heart (Acne duo → Fälle → SkinReact).

**Manuell:** wie oben – Stufe wählen, „Dërgo“.

**Auto (Wunsch Inhaber: „Wir schauen uns alle Fotos die ganze Zeit an – 5 Sekunden Verzögerung, sollte es nicht stimmen, stoppen wir. Aber es muss auto sein.“):**
- Ein neuer SkinReact-Scan (angelegt nach dem Einschalten von Auto) bekommt in Heart einen **5-Sekunden-Countdown** – in seiner Zeile und als Leiste unten in Heart, in jeder Ansicht, mit **Stopp** und **Ansehen**.
- Niemand stoppt: Heart schreibt **95–100 %** in den Bericht (`skinreact`, wie „Dërgo“; dazu `skinreactAuto: { art: "auto", freigabeAt }`). Die Kundin sieht das Ergebnis mit dem nächsten Abruf (~2 s).
- **Stopp** (oder eine Stufe von Hand gewählt): nichts geht raus, der Fall wird manuell. Der Stopp steht im Bericht (`skinreactAuto.gestoppt`) und gilt für alle Geräte.
- Geschrieben wird in einer Firestore-Transaktion: Ist der Fall inzwischen gestoppt oder schon freigegeben, wird nichts geschrieben – mehrere offene Heart-Geräte geben nicht doppelt frei.
- **Die Automatik läuft in Heart**: Sie gibt frei, wenn Heart auf mindestens einem angemeldeten Gerät offen ist (dort läuft der Countdown). Ist Heart nirgends offen, wartet der Fall, bis Heart wieder offen ist – dann läuft sein Countdown ab dort. Eine Version ohne offenes Heart wäre eine Cloud Function (Deploy durch den Inhaber, nicht aus Codex).
- Keine neue Regel (der CEO darf in `reports` jedes Feld schreiben), kein Deploy, kein Pixel geändert.
