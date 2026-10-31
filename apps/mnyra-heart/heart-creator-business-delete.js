export function createCreatorBusinessDeletion({ getState, patch, request, deleted }) {
  let running = false;
  async function remove(pageId) {
    if (running) return;
    const state = getState(), page = (state.pages || []).find(row => row.id === pageId);
    if (!page) return;
    if (state.deleteBusinessConfirm !== pageId && !page.deleting) {
      patch({ deleteBusinessConfirm: pageId, deleteBusinessError: '' }); return;
    }
    running = true;
    patch({ deletingBusinessId: pageId, deleteBusinessError: '', deleteBusinessConfirm: '' });
    try {
      let result;
      do {
        result = await request({ pageId, confirm: 'DELETE_CREATOR_BUSINESS' });
        if (result.ok !== true || typeof result.done !== 'boolean') throw Error('Unvollständige Serverantwort.');
      } while (!result.done);
      deleted(pageId);
    } catch (error) {
      patch({ deleteBusinessConfirm: pageId, deleteBusinessError: `Löschen unterbrochen: ${error.message} Du kannst es hier fortsetzen.` });
    } finally { running = false; patch({ deletingBusinessId: '' }); }
  }
  function cancel() { if (!running) patch({ deleteBusinessConfirm: '', deleteBusinessError: '' }); }
  return { remove, cancel };
}
