# Creator video processing and playback

Scope: repair processing of selected videos when Safari rejects audible playback
outside a user gesture; keep the existing menu/R2 uploader and private original
download contract. Show a direct start action for the same media element when
Safari requires a tap, before recording starts. Add an explicit lower-left
play/pause control to the opened viewer and preserve the user's pause choice.
Keep card boomerangs silent, automatic and without controls.

Baseline: a7553eb. No Firebase/Worker deployment or data migration is in scope.

## Findings and implementation

- The last commit already uses the existing menu `uploadRawMediaFile` / story
  upload ticket and R2 route. The reported error is thrown before that upload,
  when the local, audible input video is played after asynchronous Firestore
  writes. WebKit requires a direct gesture for this playback:
  https://webkit.org/blog/6784/new-video-policies-for-ios/
- `startCreatorVideo` first tries normal playback. On `NotAllowedError`, it
  offers a direct tap on the same element, resumes the audio context and waits
  for both before MediaRecorder starts. No input muting, recorder timeout or
  blank recording while waiting for a tap. Cancel, background and timeout
  release the pending operation; the encoder's existing finally cleans tracks.
- The opened viewer renders one custom lower-left play/pause button, without
  native controls flashing on startup. Manual pause/end survives playback
  synchronization. Existing fallback viewers retain native controls. Cards keep
  their existing silent, control-free encoded forward/reverse clip.
- Private original chunks now write in groups of at most six instead of serial
  round trips. Original metadata and public media publish only after successful
  writes. Download authorization, original bytes/MIME and the menu uploader are
  unchanged. No preview regeneration is required for this startup/control fix.

## Validation

- 193 Creator/menu-video/pixel checks: 192 passed, one existing analytics failure
  (`creator-heart-overview`: expected visitors=1, actual=2). Reproduced unchanged
  at baseline a7553eb in an isolated worktree; analytics was left untouched.
- After final viewer markup refinement: all 58 video/upload/viewer/shop UI tests
  passed, including the seven new gesture/encoder/control tests and two new
  bounded private-original upload/failure tests.
- Actual encoder executed against simulated media/canvas/recorder objects:
  recorder construction waits for playback permission, full stream has audio,
  boomerang stream has none, tracks are stopped on completion. These are
  regression tests, not a Safari codec or real-device playback verification.
- `npm run build` passed. No tracked generated bundle changed. New helper and
  updated viewer/styles are included in static production output.
- No production upload, real iPhone, visual mobile/browser, Playwright/smoke or
  production deployment was run. Real iPhone upload (including MOV/HEVC), sound,
  boomerang, cancel/background and native Save/Share remain manual checks.
