import { createMediaUploadRuntimeController } from "./media-upload-runtime-controller.js";

export function createMediaUploadRuntimeCluster({
  stateDeps = {},
  constants = {},
  firebaseApi = {},
  mediaApi = {},
  storyApi = {},
  renderApi = {}
} = {}) {
  return createMediaUploadRuntimeController({
    state: stateDeps.state,
    auth: stateDeps.auth,
    db: firebaseApi.db,
    documentObj: stateDeps.documentObj,
    mediaBaseUrl: constants.mediaBaseUrl,
    mediaTicketEndpoint: constants.mediaTicketEndpoint,
    fetchFn: mediaApi.fetchFn,
    compressImageFn: mediaApi.compressImageFn,
    collectionFn: firebaseApi.collectionFn,
    docFn: firebaseApi.docFn,
    setDocFn: firebaseApi.setDocFn,
    serverTimestampFn: firebaseApi.serverTimestampFn,
    storySystemController: storyApi.storySystemController,
    isLocalBusinessProfileFn: storyApi.isLocalBusinessProfileFn,
    getOptimizedImageUrlFn: renderApi.getOptimizedImageUrlFn,
    escapeHtmlFn: renderApi.escapeHtmlFn,
    iconFn: renderApi.iconFn,
    normalizeStoryItemForDisplayFn: storyApi.normalizeStoryItemForDisplayFn,
    buildStoriesSignatureFn: storyApi.buildStoriesSignatureFn,
    writeCacheFn: stateDeps.writeCacheFn,
    loadStoriesForFeedFn: storyApi.loadStoriesForFeedFn,
    loadFeedPostsFn: storyApi.loadFeedPostsFn,
    loadBusinessPostsFn: storyApi.loadBusinessPostsFn,
    loadUserPostsFn: storyApi.loadUserPostsFn,
    renderFn: renderApi.renderFn,
    updateFeedDomFn: renderApi.updateFeedDomFn,
    getLastRenderModeFn: renderApi.getLastRenderModeFn,
    setStateFn: stateDeps.setStateFn,
    setFeedStoriesSignatureFn: stateDeps.setFeedStoriesSignatureFn,
    cacheKeys: constants.cacheKeys,
    fastLimits: constants.fastLimits
  });
}
