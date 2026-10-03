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
Starting the camera now overlays the original guide inside its unchanged square, without scrolling, hiding the sticky bar or inserting extra controls. Guidance remains in its reserved two-line slot and the existing start button becomes cancel. Completion uses the same diameter for a processing ring and the genuinely approved suitability range; explanatory text and order controls follow underneath.

## Schalter Auto / Manuell (2026-10-03, Wunsch Inhaber)
Derselbe Schalter wie am Feld Përputhja (`lifeskin/lifeskin/config/perputhja`) steht jetzt auch ueber der SkinReact-Liste in Heart (Acne duo → Fälle → SkinReact). Bei **Auto** ist in jeder noch nicht freigegebenen Zeile **95–100 %** vorausgewaehlt; eine Entwurfswahl oder eine Freigabe geht vor. **Gesendet wird weiterhin nur mit „Dërgo“** – keine Freigabe ohne dass jemand das Foto gesehen hat, kein Senden beim Laden oder im Live-Takt. Manuell: wie bisher „Stufe wählen“.
