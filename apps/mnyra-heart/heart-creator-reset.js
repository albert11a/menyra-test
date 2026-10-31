const CONFIRM = 'RESET_CONTENT_CREATOR';

export function createCreatorReset({ getState, patch, request, refresh = () => {} }) {
  let running = false;
  async function reset() {
    if (running) return;
    const state = getState();
    if (!state.resetAsked && !state.resetError) { patch({ resetAsked: true, resetNotice: '' }); return; }
    running = true;
    let continuation = state.resetContinuation || {};
    let deleted = state.resetDeleted || 0;
    patch({ resetAsked: false, resetRunning: true, resetError: '', resetNotice: '' });
    try {
      if (!continuation.before) {
        const start = await request({ confirm: CONFIRM, begin: true });
        if (start.ok !== true || !start.before || !start.next) throw Error('Reset konnte nicht gestartet werden.');
        continuation = { before: start.before, cursor: start.next };
        patch({ resetContinuation: continuation });
      }
      do {
        const result = await request({ confirm: CONFIRM, ...continuation });
        // An incomplete/HTML response must never turn into a success message.
        if (result.ok !== true || !result.before || !Object.hasOwn(result, 'next')) throw Error('Unvollständige Serverantwort.');
        deleted += result.deleted || 0;
        continuation = { before: result.before, cursor: result.next };
        patch({ resetContinuation: continuation, resetDeleted: deleted });
      } while (continuation.cursor);
      patch({ resetContinuation: null, resetDeleted: 0, resetNotice: `Content Creator zurückgesetzt: ${deleted} Testdatensätze gelöscht. Neue Besuche werden wieder gezählt.` });
      refresh();
    } catch (error) {
      patch({ resetError: `Reset unterbrochen: ${error.message} Bereits gelöschte Daten bleiben gelöscht. Mit „Fortsetzen“ wird der Reset abgeschlossen.` });
    } finally { running = false; patch({ resetRunning: false }); }
  }
  function cancel() { if (!running) patch({ resetAsked: false }); }
  return { reset, cancel };
}
