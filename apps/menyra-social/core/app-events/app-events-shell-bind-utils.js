const LANDING_GREETINGS_COUNT = 13;
const LANDING_TOUR_STEPS_COUNT = 5;
const LANDING_MAX_STEP = 3;
const LANDING_SWIPE_VERTICAL_THRESHOLD_PX = 14;
const LANDING_SWIPE_FAST_THRESHOLD_PX = 8;
const LANDING_SWIPE_FAST_MAX_DURATION_MS = 220;
const LANDING_SWIPE_HORIZONTAL_THRESHOLD_PX = 24;
const LANDING_ANIMATION_LOCK_MS = 240;
let landingGreetingIntervalId = null;
let landingInteractionLockedUntilTs = 0;

export function bindAppShellEventsCore({
  documentObj,
  state,
  setStateFn,
  signOutFn,
  auth,
  clearAuthBootstrapSnapshotFn,
  safeStorageObj,
  profileKeyFn,
  avatarKeyFn,
  notificationsKeyFn,
  pushSeenKeyFn,
  pushTokenMetaKeyFn,
  followingKeyFn,
  chatIndexKeyFn,
  storageKeys = {},
  resetUserScopedStateFn,
  cleanupLeafletFn,
  openGuestAuthPromptFn,
  normalizeAuthModeFn,
  renderFn,
  ensurePostsDataForProfileFn,
  ensureMenuDataForProfileFn,
  ensureFocusDataForProfileFn,
  openProfileViewFromBusinessFn
} = {}) {
  const doc = documentObj || null;
  if (!doc || !state) return;
  const setState = typeof setStateFn === "function" ? setStateFn : (() => {});
  const signOut = typeof signOutFn === "function" ? signOutFn : (async () => {});
  const clearAuthBootstrapSnapshot = typeof clearAuthBootstrapSnapshotFn === "function"
    ? clearAuthBootstrapSnapshotFn
    : (() => {});
  const safeStorage = safeStorageObj || null;
  const notificationsKey = typeof notificationsKeyFn === "function" ? notificationsKeyFn : (() => "");
  const pushSeenKey = typeof pushSeenKeyFn === "function" ? pushSeenKeyFn : (() => "");
  const pushTokenMetaKey = typeof pushTokenMetaKeyFn === "function" ? pushTokenMetaKeyFn : (() => "");
  const followingKey = typeof followingKeyFn === "function" ? followingKeyFn : (() => "");
  const chatIndexKey = typeof chatIndexKeyFn === "function" ? chatIndexKeyFn : (() => "");
  const resetUserScopedState = typeof resetUserScopedStateFn === "function"
    ? resetUserScopedStateFn
    : (() => {});
  const cleanupLeaflet = typeof cleanupLeafletFn === "function"
    ? cleanupLeafletFn
    : (() => {});
  const openGuestAuthPrompt = typeof openGuestAuthPromptFn === "function"
    ? openGuestAuthPromptFn
    : (() => {});
  const normalizeAuthMode = typeof normalizeAuthModeFn === "function"
    ? normalizeAuthModeFn
    : ((mode) => String(mode || "").trim());
  const render = typeof renderFn === "function" ? renderFn : (() => {});
  const ensurePostsDataForProfile = typeof ensurePostsDataForProfileFn === "function"
    ? ensurePostsDataForProfileFn
    : (() => {});
  const ensureMenuDataForProfile = typeof ensureMenuDataForProfileFn === "function"
    ? ensureMenuDataForProfileFn
    : (() => {});
  const ensureFocusDataForProfile = typeof ensureFocusDataForProfileFn === "function"
    ? ensureFocusDataForProfileFn
    : (() => {});
  const openProfileViewFromBusiness = typeof openProfileViewFromBusinessFn === "function"
    ? openProfileViewFromBusinessFn
    : null;
  const getActiveProfile = () => state.profileView?.profile || state.userProfile || {};
  const isBusinessProfile = (profile = getActiveProfile()) => {
    const restaurantId = String(
      profile?.canonicalRestaurantId
      || profile?.restaurantId
      || state?.profileView?.routePayload?.canonicalRestaurantId
      || state?.profileView?.routePayload?.restaurantId
      || state?.profileView?.routePayload?.businessSnapshot?.restaurantId
      || ""
    ).trim();
    if (restaurantId) return true;
    return String(profile?.role || "").trim().toLowerCase() === "business";
  };
  const isBusinessProfileView = () => state.activeTab === "profile" && isBusinessProfile();
  const isLandingTopTabActive = () => state.activeTab === "profile"
    && String(state.profileTopTab || "").trim().toLowerCase() === "landing";
  const normalizeLandingStep = (value = 0) => {
    const parsed = Math.round(Number(value || 0));
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.min(LANDING_MAX_STEP, parsed));
  };
  const normalizeLandingGreetingIndex = (value = 0, length = LANDING_GREETINGS_COUNT) => {
    const size = Math.max(1, Number(length || 0) || 1);
    const parsed = Math.round(Number(value || 0));
    if (!Number.isFinite(parsed)) return 0;
    const normalized = parsed % size;
    return normalized < 0 ? normalized + size : normalized;
  };
  const normalizeLandingTourIndex = (value = 0, length = LANDING_TOUR_STEPS_COUNT) => {
    const size = Math.max(1, Number(length || 0) || 1);
    const parsed = Math.round(Number(value || 0));
    if (!Number.isFinite(parsed)) return 0;
    const normalized = parsed % size;
    return normalized < 0 ? normalized + size : normalized;
  };
  const resolveLandingDotStep = (value = 0) => {
    return normalizeLandingStep(value);
  };
  const clearLandingGreetingCycle = () => {
    const win = doc?.defaultView;
    if (!win || !landingGreetingIntervalId) return;
    win.clearInterval(landingGreetingIntervalId);
    landingGreetingIntervalId = null;
  };
  const bindFastTap = (element, handler) => {
    if (!(element instanceof HTMLElement)) return;
    if (typeof handler !== "function") return;
    if (element.dataset.fastTapBound === "1") return;
    element.dataset.fastTapBound = "1";
    let lastTouchTs = 0;
    element.addEventListener("touchstart", () => {
      lastTouchTs = Date.now();
      handler();
    }, { passive: true });
    element.addEventListener("click", (event) => {
      const elapsed = Date.now() - lastTouchTs;
      if (elapsed >= 0 && elapsed < 450) {
        if (event.cancelable) event.preventDefault();
        return;
      }
      handler();
    });
  };
  const scrollWindowToTop = (smooth = false) => {
    if (!doc?.defaultView?.scrollTo) return;
    if (!smooth) {
      doc.defaultView.scrollTo(0, 0);
      return;
    }
    try {
      doc.defaultView.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      doc.defaultView.scrollTo(0, 0);
    }
  };
  const resolveBusinessMenuCategoryBaseClass = () => {
    const viewportWidth = Math.max(
      0,
      Number(doc?.defaultView?.innerWidth || doc?.documentElement?.clientWidth || 0)
    );
    const isCompact = viewportWidth > 0 && viewportWidth <= 390;
    return isCompact
      ? "shrink-0 min-w-0 max-w-[7.5rem] h-7 box-border px-2.5 inline-flex items-center justify-center overflow-hidden rounded-full border text-[9px] font-black leading-none transition-all duration-300"
      : "shrink-0 min-w-0 max-w-[8.5rem] h-8 box-border px-3 inline-flex items-center justify-center overflow-hidden rounded-full border text-[10px] font-black leading-none transition-all duration-300";
  };
  const businessMenuCategoryActiveClass = "bg-slate-900 text-white border-slate-900 shadow-[0_10px_24px_-16px_rgba(15,23,42,0.55)]";
  const businessMenuCategoryInactiveClass = "bg-white/80 text-slate-500 border-slate-200";

  const syncBusinessMenuCategoryUi = (nextCategory = "") => {
    const buttons = Array.from(doc.querySelectorAll("[data-business-menu-category]"));
    if (!buttons.length) return;
    const businessMenuCategoryBaseClass = resolveBusinessMenuCategoryBaseClass();
    const fallbackCategory = buttons[0]?.dataset?.businessMenuCategory || "";
    const activeCategory = String(nextCategory || fallbackCategory).trim().toLowerCase();
    buttons.forEach((button) => {
      const category = String(button.dataset.businessMenuCategory || "").trim().toLowerCase();
      const isActive = !!activeCategory && category === activeCategory;
      button.className = `${businessMenuCategoryBaseClass} ${isActive ? businessMenuCategoryActiveClass : businessMenuCategoryInactiveClass}${button.disabled ? " opacity-50 cursor-default" : " active:scale-[0.97]"}`;
    });
  };

  const scrollBusinessMenuToCategory = (category = "") => {
    const targetCategory = String(category || "").trim().toLowerCase();
    if (!targetCategory) return;
    const target = doc.querySelector(`[data-menu-category-anchor="${targetCategory}"]`)
      || doc.querySelector(`[data-menu-type-block="${targetCategory}"]`)
      || doc.querySelector(`[data-menu-type="${targetCategory}"]`);
    if (!(target instanceof HTMLElement) || !doc.defaultView?.scrollTo) return;
    const headerTop = doc.getElementById("smart-header-top");
    const headerHeight = Math.max(0, Math.round(headerTop?.getBoundingClientRect?.().height || 0));
    const targetTop = target.getBoundingClientRect().top + Math.max(0, Number(doc.defaultView.scrollY || 0));
    const nextTop = Math.max(0, Math.round(targetTop - headerHeight - 18));
    try {
      doc.defaultView.scrollTo({ top: nextTop, behavior: "smooth" });
    } catch {
      doc.defaultView.scrollTo(0, nextTop);
    }
  };
  const bindLandingSwipeExperience = () => {
    const safariChromeTintTop = doc.getElementById("safariChromeTintTop");
    const safariChromeTintBottom = doc.getElementById("safariChromeTintBottom");
    [safariChromeTintTop, safariChromeTintBottom].forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      if (node.dataset.landingTintHidden === "1") {
        delete node.dataset.landingTintHidden;
        node.style.removeProperty("display");
      }
    });

    clearLandingGreetingCycle();
    const landingRoot = doc.querySelector("[data-landing-swipe-root=\"true\"]");
    if (!(landingRoot instanceof HTMLElement)) return;
    [safariChromeTintTop, safariChromeTintBottom].forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      node.dataset.landingTintHidden = "1";
      node.style.display = "none";
    });
    landingInteractionLockedUntilTs = 0;
    const existingSwipeAbortController = landingRoot.__mnyraLandingSwipeAbortController;
    if (existingSwipeAbortController && typeof existingSwipeAbortController.abort === "function") {
      try {
        existingSwipeAbortController.abort();
      } catch {}
    }
    const swipeAbortController = doc?.defaultView?.AbortController
      ? new doc.defaultView.AbortController()
      : null;
    if (swipeAbortController) {
      landingRoot.__mnyraLandingSwipeAbortController = swipeAbortController;
    } else {
      landingRoot.__mnyraLandingSwipeAbortController = null;
    }

    let touchStartY = 0;
    let touchStartX = 0;
    let touchStartAt = 0;
    let touchStartScrollTop = 0;

    const getLandingPanelScrollEl = () => {
      const currentStep = normalizeLandingStep(state.profileLandingStep);
      const scopedNode = landingRoot.querySelector(`[data-landing-panel-scroll="${currentStep}"]`);
      if (scopedNode instanceof HTMLElement) return scopedNode;
      return null;
    };

    const getLandingPanelScrollMetrics = () => {
      const panelScrollEl = getLandingPanelScrollEl();
      if (!(panelScrollEl instanceof HTMLElement)) {
        return {
          panelScrollEl: null,
          canScroll: false,
          atTop: true,
          atBottom: true,
          maxScrollTop: 0,
          scrollTop: 0
        };
      }
      const maxScrollTop = Math.max(0, panelScrollEl.scrollHeight - panelScrollEl.clientHeight);
      const scrollTop = Math.max(0, Number(panelScrollEl.scrollTop || 0));
      const canScroll = maxScrollTop > 2;
      const edgeTolerancePx = 2;
      return {
        panelScrollEl,
        canScroll,
        atTop: !canScroll || scrollTop <= edgeTolerancePx,
        atBottom: !canScroll || scrollTop >= (maxScrollTop - edgeTolerancePx),
        maxScrollTop,
        scrollTop
      };
    };

    const clearLandingTutorialFocus = () => {
      const focusTargets = Array.from(landingRoot.querySelectorAll("[data-landing-tutorial-target]"));
      focusTargets.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        node.dataset.landingTutorialActive = "0";
        node.style.position = "";
        node.style.zIndex = "";
        node.style.isolation = "";
        node.style.boxShadow = "";
        node.style.borderRadius = "";
        node.style.outline = "";
        node.style.outlineOffset = "";
      });
    };

    const syncLandingStepDom = (nextStepRaw = 0) => {
      const nextStep = normalizeLandingStep(nextStepRaw);
      landingRoot.dataset.landingStep = String(nextStep);
      const activeDotStep = resolveLandingDotStep(nextStep);
      const dots = Array.from(landingRoot.querySelectorAll("[data-landing-step-dot]"));
      dots.forEach((dot) => {
        if (!(dot instanceof HTMLElement)) return;
        const dotStep = Math.round(Number(dot.dataset.landingStepDot || 0));
        const isActive = dotStep === activeDotStep;
        dot.style.transform = isActive ? "scale(1.25)" : "scale(1)";
        dot.style.opacity = isActive ? "1" : "0.88";
        dot.style.background = isActive ? "#4f46e5" : "rgba(100,116,139,0.58)";
        dot.style.border = isActive
          ? "1px solid rgba(79,70,229,0.96)"
          : "1px solid rgba(255,255,255,0.95)";
        dot.style.boxShadow = isActive
          ? "0 6px 14px -8px rgba(79,70,229,0.95)"
          : "0 2px 6px -5px rgba(15,23,42,0.55)";
      });
      const panels = Array.from(landingRoot.querySelectorAll("[data-landing-panel]"))
        .filter((panel) => panel instanceof HTMLElement)
        .sort((a, b) => {
          const ai = Math.round(Number(a.dataset.landingPanel || 0));
          const bi = Math.round(Number(b.dataset.landingPanel || 0));
          return ai - bi;
        });
      panels.forEach((panel) => {
        const panelIndex = Math.round(Number(panel.dataset.landingPanel || 0));
        if (!Number.isFinite(panelIndex)) return;
        if (panelIndex < nextStep) {
          panel.style.transform = "translateY(-100%)";
          panel.style.opacity = "0";
          panel.style.pointerEvents = "none";
          return;
        }
        if (panelIndex > nextStep) {
          panel.style.transform = "translateY(100%)";
          panel.style.opacity = "0";
          panel.style.pointerEvents = "none";
          return;
        }
        panel.style.transform = "translateY(0%)";
        panel.style.opacity = "1";
        panel.style.pointerEvents = "auto";
      });
      landingRoot.style.touchAction = nextStep > 0 ? "pan-y" : "none";
      if (nextStep <= 0) {
        clearLandingTutorialFocus();
      }
    };

    const syncLandingGreetingDom = (nextGreetingIndexRaw = 0) => {
      const greetingItems = Array.from(landingRoot.querySelectorAll("[data-landing-greeting-item]"));
      if (!greetingItems.length) return;
      const safeIndex = normalizeLandingGreetingIndex(nextGreetingIndexRaw, greetingItems.length);
      const prevIndex = (safeIndex - 1 + greetingItems.length) % greetingItems.length;
      greetingItems.forEach((node, idx) => {
        if (!(node instanceof HTMLElement)) return;
        if (idx === safeIndex) {
          node.style.opacity = "1";
          node.style.transform = "translateY(0) scale(1)";
          node.style.pointerEvents = "auto";
          return;
        }
        node.style.opacity = "0";
        if (idx === prevIndex) {
          node.style.transform = "translateY(-1.5rem) scale(0.95)";
        } else {
          node.style.transform = "translateY(1.5rem) scale(0.95)";
        }
        node.style.pointerEvents = "none";
      });
    };

    const resolveLandingTourSlideCount = () => {
      const slideCount = landingRoot.querySelectorAll("[data-landing-tour-slide]").length;
      return Math.max(0, Number(slideCount || 0) || 0);
    };

    const syncLandingTourDom = (nextTourIndexRaw = 0) => {
      const slides = Array.from(landingRoot.querySelectorAll("[data-landing-tour-slide]"));
      if (!slides.length) return 0;
      const safeIndex = normalizeLandingTourIndex(nextTourIndexRaw, slides.length);
      slides.forEach((slide, idx) => {
        if (!(slide instanceof HTMLElement)) return;
        const isActive = idx === safeIndex;
        const isPast = idx < safeIndex;
        slide.style.opacity = isActive ? "1" : "0";
        slide.style.transform = isActive
          ? "translateY(0) scale(1)"
          : (isPast
            ? "translateY(-0.9rem) scale(0.98)"
            : "translateY(0.9rem) scale(0.98)");
        slide.style.pointerEvents = isActive ? "auto" : "none";
      });

      const dots = Array.from(landingRoot.querySelectorAll("[data-landing-tour-dot]"));
      dots.forEach((dot, idx) => {
        if (!(dot instanceof HTMLElement)) return;
        const isActive = idx === safeIndex;
        dot.classList.toggle("bg-indigo-600", isActive);
        dot.classList.toggle("bg-slate-300", !isActive);
        dot.style.width = isActive ? "18px" : "6px";
      });

      if (normalizeLandingStep(state.profileLandingStep) !== 2) {
        clearLandingTutorialFocus();
        const hiddenTooltip = landingRoot.querySelector("[data-landing-tour-tooltip]");
        if (hiddenTooltip instanceof HTMLElement) {
          hiddenTooltip.style.left = "0.75rem";
          hiddenTooltip.style.top = "calc(100% - 10rem)";
        }
        return safeIndex;
      }

      clearLandingTutorialFocus();
      const activeFocusKey = String(slides[safeIndex]?.dataset?.landingTourFocusKey || "").trim();
      let activeTarget = activeFocusKey
        ? landingRoot.querySelector(`[data-landing-tutorial-target="${activeFocusKey}"]`)
        : null;
      if (!(activeTarget instanceof HTMLElement)) {
        const fallbackTarget = landingRoot.querySelector("[data-landing-tutorial-target]");
        activeTarget = fallbackTarget instanceof HTMLElement ? fallbackTarget : null;
      }
      if (activeTarget instanceof HTMLElement) {
        activeTarget.dataset.landingTutorialActive = "1";
        activeTarget.style.position = "relative";
        activeTarget.style.zIndex = "60";
        activeTarget.style.isolation = "isolate";
        activeTarget.style.borderRadius = "1rem";
        activeTarget.style.outline = "2px solid rgba(99, 102, 241, 0.95)";
        activeTarget.style.outlineOffset = "2px";
        activeTarget.style.boxShadow = "0 0 0 9999px rgba(15, 23, 42, 0.38), 0 18px 40px -28px rgba(15, 23, 42, 0.65)";
      }

      const tooltip = landingRoot.querySelector("[data-landing-tour-tooltip]");
      if (tooltip instanceof HTMLElement) {
        const stageRect = landingRoot.getBoundingClientRect();
        const activeSlide = slides[safeIndex] instanceof HTMLElement ? slides[safeIndex] : null;
        const minPadding = 12;
        const preferredWidth = Math.min(352, Math.max(220, Math.floor(stageRect.width - (minPadding * 2))));
        tooltip.style.width = `${Math.max(0, preferredWidth)}px`;
        tooltip.style.maxWidth = `${Math.max(0, stageRect.width - (minPadding * 2))}px`;

        if (activeTarget instanceof HTMLElement && activeSlide instanceof HTMLElement) {
          const targetRect = activeTarget.getBoundingClientRect();
          const slideRect = activeSlide.getBoundingClientRect();
          const tooltipHeight = Math.max(96, Math.round(slideRect.height || 0));
          const tooltipWidth = Math.max(120, Math.round(preferredWidth));
          let nextLeft = (targetRect.left - stageRect.left) + (targetRect.width * 0.5) - (tooltipWidth * 0.5);
          nextLeft = Math.max(minPadding, Math.min(nextLeft, stageRect.width - tooltipWidth - minPadding));
          let nextTop = (targetRect.bottom - stageRect.top) + 12;
          if ((nextTop + tooltipHeight) > (stageRect.height - minPadding)) {
            nextTop = (targetRect.top - stageRect.top) - tooltipHeight - 12;
          }
          if (nextTop < minPadding) {
            nextTop = stageRect.height - tooltipHeight - 64;
          }
          nextTop = Math.max(minPadding, Math.min(nextTop, stageRect.height - tooltipHeight - minPadding));
          tooltip.style.left = `${Math.round(nextLeft)}px`;
          tooltip.style.top = `${Math.round(nextTop)}px`;
        } else {
          tooltip.style.left = `${minPadding}px`;
          tooltip.style.top = `${Math.max(minPadding, Math.round(stageRect.height - 152))}px`;
        }
      }
      return safeIndex;
    };

    const setLandingTourIndex = (nextTourIndexRaw = 0) => {
      const tourStepCount = resolveLandingTourSlideCount();
      if (tourStepCount <= 1) {
        state.profileLandingTourIndex = 0;
        return false;
      }
      const safeIndex = normalizeLandingTourIndex(nextTourIndexRaw, tourStepCount);
      const currentIndex = normalizeLandingTourIndex(state.profileLandingTourIndex, tourStepCount);
      if (safeIndex === currentIndex) return false;
      landingInteractionLockedUntilTs = Date.now() + LANDING_ANIMATION_LOCK_MS;
      state.profileLandingTourIndex = safeIndex;
      syncLandingTourDom(safeIndex);
      return true;
    };

    const goToStep = (nextStep = 0) => {
      if (Date.now() < landingInteractionLockedUntilTs) return;
      const currentStep = normalizeLandingStep(state.profileLandingStep);
      const safeNextStep = normalizeLandingStep(nextStep);
      if (currentStep === safeNextStep) return;
      landingInteractionLockedUntilTs = Date.now() + LANDING_ANIMATION_LOCK_MS;
      state.profileLandingStep = safeNextStep;
      if (safeNextStep === 2) {
        state.profileContentTab = "posts";
        ensureMenuDataForProfile();
        ensureFocusDataForProfile();
      } else if (safeNextStep === 3) {
        state.profileContentTab = "menu";
        ensureMenuDataForProfile();
        ensureFocusDataForProfile();
      }
      syncLandingStepDom(safeNextStep);
      if (safeNextStep === 2) {
        const tourStepCount = resolveLandingTourSlideCount();
        if (tourStepCount > 0) {
          const safeTourIndex = normalizeLandingTourIndex(state.profileLandingTourIndex, tourStepCount);
          state.profileLandingTourIndex = safeTourIndex;
          syncLandingTourDom(safeTourIndex);
        } else {
          state.profileLandingTourIndex = 0;
        }
      }
      // Step transitions are mostly DOM-driven for smooth swipes.
      // From posts step onward we force a render pass so deferred surfaces are never blank.
      if (safeNextStep >= 2) {
        const win = doc?.defaultView;
        if (win && typeof win.requestAnimationFrame === "function") {
          win.requestAnimationFrame(() => render());
        } else {
          render();
        }
      }
    };

    const goToNextStep = () => {
      const currentStep = normalizeLandingStep(state.profileLandingStep);
      goToStep(Math.min(LANDING_MAX_STEP, currentStep + 1));
    };

    const goToPrevStep = () => {
      const currentStep = normalizeLandingStep(state.profileLandingStep);
      goToStep(Math.max(0, currentStep - 1));
    };

    const resolveVerticalSwipeThreshold = (durationMs = 0) => {
      if (durationMs > 0 && durationMs <= LANDING_SWIPE_FAST_MAX_DURATION_MS) {
        return LANDING_SWIPE_FAST_THRESHOLD_PX;
      }
      return LANDING_SWIPE_VERTICAL_THRESHOLD_PX;
    };

    const touchStartOptions = swipeAbortController
      ? { passive: true, signal: swipeAbortController.signal }
      : { passive: true };
    landingRoot.addEventListener("touchstart", (event) => {
      const touch = event.touches?.[0];
      if (!touch) return;
      touchStartY = Number(touch.clientY || 0);
      touchStartX = Number(touch.clientX || 0);
      touchStartAt = Date.now();
      const { scrollTop } = getLandingPanelScrollMetrics();
      touchStartScrollTop = scrollTop;
    }, touchStartOptions);

    const touchMoveOptions = swipeAbortController
      ? { passive: false, signal: swipeAbortController.signal }
      : { passive: false };
    landingRoot.addEventListener("touchmove", (event) => {
      const currentStep = normalizeLandingStep(state.profileLandingStep);
      if (currentStep <= 0) {
        if (event.cancelable) event.preventDefault();
        return;
      }
      const touch = event.touches?.[0];
      if (!touch) return;
      const dragDeltaY = Number(touch.clientY || 0) - touchStartY;
      if (Math.abs(dragDeltaY) < 1) return;
      const {
        canScroll,
        atTop,
        atBottom
      } = getLandingPanelScrollMetrics();
      if (!canScroll) {
        if (event.cancelable) event.preventDefault();
        return;
      }
      const draggingDown = dragDeltaY > 0;
      const draggingUp = dragDeltaY < 0;
      if ((draggingDown && atTop) || (draggingUp && atBottom)) {
        if (event.cancelable) event.preventDefault();
      }
    }, touchMoveOptions);

    const touchEndOptions = swipeAbortController
      ? { passive: true, signal: swipeAbortController.signal }
      : { passive: true };
    landingRoot.addEventListener("touchend", (event) => {
      if (Date.now() < landingInteractionLockedUntilTs) return;
      const touch = event.changedTouches?.[0];
      if (!touch) return;
      const touchEndY = Number(touch.clientY || 0);
      const touchEndX = Number(touch.clientX || 0);
      const deltaY = touchStartY - touchEndY;
      const deltaX = touchStartX - touchEndX;
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > LANDING_SWIPE_HORIZONTAL_THRESHOLD_PX) {
        return;
      }
      const gestureDurationMs = touchStartAt > 0 ? Math.max(0, Date.now() - touchStartAt) : 0;
      const verticalThreshold = resolveVerticalSwipeThreshold(gestureDurationMs);
      const currentStep = normalizeLandingStep(state.profileLandingStep);
      if (currentStep >= 1) {
        const {
          canScroll,
          atTop,
          atBottom,
          scrollTop
        } = getLandingPanelScrollMetrics();
        const scrollMovedPx = Math.abs(scrollTop - touchStartScrollTop);
        if (canScroll && scrollMovedPx > 4) {
          if (deltaY > verticalThreshold && !atBottom) return;
          if (deltaY < -verticalThreshold && !atTop) return;
        } else if (canScroll) {
          if (deltaY > verticalThreshold && !atBottom) return;
          if (deltaY < -verticalThreshold && !atTop) return;
        }
      }
      if (deltaY > verticalThreshold) goToNextStep();
      else if (deltaY < -verticalThreshold) goToPrevStep();
    }, touchEndOptions);

    const touchCancelOptions = swipeAbortController
      ? { passive: true, signal: swipeAbortController.signal }
      : { passive: true };
    landingRoot.addEventListener("touchcancel", () => {
      touchStartY = 0;
      touchStartX = 0;
      touchStartAt = 0;
      touchStartScrollTop = 0;
    }, touchCancelOptions);

    const wheelOptions = swipeAbortController
      ? { passive: false, signal: swipeAbortController.signal }
      : { passive: false };
    landingRoot.addEventListener("wheel", (event) => {
      if (Date.now() < landingInteractionLockedUntilTs) return;
      const deltaY = Number(event.deltaY || 0);
      const currentStep = normalizeLandingStep(state.profileLandingStep);
      if (currentStep >= 1) {
        const { canScroll, atTop, atBottom } = getLandingPanelScrollMetrics();
        if (canScroll) {
          if (deltaY > 0 && !atBottom) return;
          if (deltaY < 0 && !atTop) return;
        }
      }
      if (event.cancelable) event.preventDefault();
      if (deltaY > LANDING_SWIPE_VERTICAL_THRESHOLD_PX) goToNextStep();
      else if (deltaY < -LANDING_SWIPE_VERTICAL_THRESHOLD_PX) goToPrevStep();
    }, wheelOptions);

    syncLandingStepDom(state.profileLandingStep);
    syncLandingGreetingDom(state.profileLandingGreetingIndex);
    syncLandingTourDom(state.profileLandingTourIndex);

    if (!isLandingTopTabActive()) return;
    if (normalizeLandingStep(state.profileLandingStep) !== 0) return;
    if (!doc?.defaultView?.setInterval) return;
    landingGreetingIntervalId = doc.defaultView.setInterval(() => {
      if (!isLandingTopTabActive()) return;
      if (normalizeLandingStep(state.profileLandingStep) !== 0) return;
      const currentGreetingIndex = Math.max(0, Number(state.profileLandingGreetingIndex || 0) || 0);
      const nextGreetingIndex = (currentGreetingIndex + 1) % LANDING_GREETINGS_COUNT;
      state.profileLandingGreetingIndex = nextGreetingIndex;
      syncLandingGreetingDom(nextGreetingIndex);
    }, 4000);
  };

  const drawerToggle = doc.getElementById("drawerToggle");
  const drawerOverlay = doc.getElementById("drawerOverlay");
  const drawerClose = doc.getElementById("drawerClose");
  const logoutBtn = doc.getElementById("logoutBtn");
  const settingsLogout = doc.getElementById("settingsLogout");

  bindFastTap(drawerToggle, () => setState({ drawerOpen: true }));
  bindFastTap(drawerOverlay, () => setState({ drawerOpen: false }));
  bindFastTap(drawerClose, () => setState({ drawerOpen: false }));

  [logoutBtn, settingsLogout].forEach((btn) => {
    if (btn) {
      btn.addEventListener("click", async () => {
        await signOut(auth);
        clearAuthBootstrapSnapshot();
        if (state.user?.uid) {
          // Keep lightweight profile/avatar caches per UID so role tabs and shell identity
          // can hydrate immediately on next login without waiting for network bootstrap.
          safeStorage?.removeItem?.(notificationsKey(state.user.uid));
          safeStorage?.removeItem?.(pushSeenKey(state.user.uid));
          safeStorage?.removeItem?.(pushTokenMetaKey(state.user.uid));
          safeStorage?.removeItem?.(followingKey(state.user.uid));
          safeStorage?.removeItem?.(chatIndexKey(state.user.uid));
        }
        safeStorage?.removeItem?.(storageKeys.postMeta);
        resetUserScopedState();
        cleanupLeaflet();
        setState({ activeTab: "feed", drawerOpen: false });
      });
    }
  });

  doc.querySelectorAll("[data-nav]").forEach((btn) => {
    if (btn.closest("#feedView")) return;
    btn.addEventListener("click", () => {
      const tab = btn.dataset.nav;
      if (!tab) return;
      const requestedTab = tab === "location" ? "feed" : tab;
      if (tab === "favorites" && !String(state.user?.uid || "").trim()) {
        openGuestAuthPrompt("Bitte registrieren oder einloggen, um Favoriten zu nutzen.");
        return;
      }
      const uploadIntent = requestedTab === "upload"
        ? String(btn.dataset.uploadIntent || "feed").trim().toLowerCase()
        : "";
      const nextUploadMode = uploadIntent === "chooser"
        ? "chooser"
        : (uploadIntent === "story" ? "story" : "feed");
      const uploadPatch = requestedTab === "upload"
        ? {
            upload: nextUploadMode === "chooser"
              ? { preview: "", caption: "", file: null, status: "", mode: "chooser" }
              : {
                  ...(state.upload && typeof state.upload === "object" ? state.upload : {}),
                  status: "",
                  mode: nextUploadMode
                }
          }
        : {};
      const activeTab = requestedTab === "favorites" ? "profile" : requestedTab;
      const nextProfileTopTab = requestedTab === "favorites"
        ? "favorites"
        : (requestedTab === "profile" ? "profile" : state.profileTopTab);
      setState({
        activeTab,
        profileTopTab: nextProfileTopTab,
        drawerOpen: false,
        chatSettingsOpen: false,
        chatListScope: "inbox",
        chatThreadMenuId: "",
        settingsView: "main",
        selectedBusiness: null,
        profileView: null,
        profileModal: { open: false, profile: null },
        postModal: { open: false, post: null, commentText: "", replyTo: null, loading: false, animate: false, sending: false },
        likesModal: { open: false, postId: "", animate: false },
        leadModal: { open: false, mode: "create", lead: null, status: "", loading: false, deleting: false, actionsOpen: false, logoFile: null, logoPreview: "", bestSpotLogoFile: null, bestSpotLogoPreview: "", coords: null, locations: [] },
        customerModal: { open: false, mode: "edit", customer: null, status: "", loading: false, logoFile: null, logoPreview: "" },
        ...uploadPatch
      });
    });
  });

  doc.querySelectorAll("[data-auth-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.drawerOpen = false;
      state.auth.mode = normalizeAuthMode(state.auth.mode) || "login";
      state.auth.error = "";
      state.auth.open = true;
      render();
    });
  });

  doc.querySelectorAll("[data-profile-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = String(btn.dataset.profileTab || "").trim().toLowerCase();
      if (!tab) return;
      const landingPreviewActive = isLandingTopTabActive();
      if (landingPreviewActive) return;
      state.profileContentTab = tab;
      if (isBusinessProfileView()) {
        state.__nextRouteHistoryMode = "push";
        state.profileTopTab = tab === "menu" ? "menu" : "profile";
        if (tab === "menu") {
          ensureMenuDataForProfile();
          ensureFocusDataForProfile();
        } else if (tab === "posts") {
          ensurePostsDataForProfile();
        }
        scrollWindowToTop(true);
      }
      render();
      if (tab === "menu") {
        syncBusinessMenuCategoryUi();
      }
    });
  });

  doc.querySelectorAll("[data-business-profile-home]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!isBusinessProfileView()) return;
      state.__nextRouteHistoryMode = "push";
      state.activeTab = "profile";
      state.profileTopTab = "profile";
      state.profileContentTab = "posts";
      state.drawerOpen = false;
      render();
      scrollWindowToTop(true);
    });
  });

  const handleProfileTopTabChange = (tab = "", { smoothTop = false, forceProfile = false } = {}) => {
    const nextTab = String(tab || "").trim();
    if (!nextTab) return;
    if (nextTab === "favorites" && !String(state.user?.uid || "").trim()) {
      openGuestAuthPrompt("Bitte registrieren oder einloggen, um Favoriten zu nutzen.");
      return;
    }
    if (forceProfile) state.activeTab = "profile";
    const isBusinessProfileRoute = isBusinessProfileView();
    const shouldRouteMenuThroughContentTab = nextTab === "menu" && isBusinessProfileRoute;
    if (isBusinessProfileRoute) {
      state.__nextRouteHistoryMode = "push";
    }
    state.profileTopTab = nextTab;
    if (nextTab === "landing") {
      state.profileLandingStep = 0;
      state.profileLandingGreetingIndex = 0;
      state.profileLandingTourIndex = 0;
      landingInteractionLockedUntilTs = 0;
    }
    if (shouldRouteMenuThroughContentTab) {
      state.profileContentTab = "menu";
    } else if (isBusinessProfileRoute && nextTab === "profile") {
      state.profileContentTab = "posts";
    }
    state.drawerOpen = false;
    if (nextTab === "menu" || nextTab === "favorites" || nextTab === "cart") {
      ensureMenuDataForProfile();
    }
    if (nextTab === "menu") {
      ensureFocusDataForProfile();
    }
    if (smoothTop && doc?.defaultView?.scrollTo) {
      try {
        doc.defaultView.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        doc.defaultView.scrollTo(0, 0);
      }
    }
    render();
    if (shouldRouteMenuThroughContentTab) {
      syncBusinessMenuCategoryUi();
    }
  };

  const openSmartHeaderCart = () => {
    const cartRestaurantId = String(state.shopCart?.restaurantId || "").trim();
    const cartItems = Array.isArray(state.shopCart?.items) ? state.shopCart.items : [];
    const currentProfile = state.profileView?.profile || state.userProfile || {};
    const currentRestaurantId = String(currentProfile?.restaurantId || "").trim();

    if (cartRestaurantId && cartItems.length) {
      if (currentRestaurantId === cartRestaurantId) {
        handleProfileTopTabChange("cart", { smoothTop: true, forceProfile: true });
        return;
      }
      if (openProfileViewFromBusiness) {
        void openProfileViewFromBusiness({ id: cartRestaurantId }, { showBack: true, topTab: "cart" });
        return;
      }
    }

    if (currentRestaurantId) {
      handleProfileTopTabChange("cart", { smoothTop: true, forceProfile: true });
      return;
    }

    console.log("Warenkorb geklickt");
  };

  doc.querySelectorAll("[data-profile-top-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      handleProfileTopTabChange(btn.dataset.profileTopTab || "");
    });
  });

  doc.querySelectorAll("[data-business-top-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      handleProfileTopTabChange(btn.dataset.businessTopTab || "", { smoothTop: true, forceProfile: true });
    });
  });

  doc.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = String(btn.dataset.action || "").trim().toLowerCase();
      if (!action) return;
      if (action === "cart") {
        openSmartHeaderCart();
        return;
      }
      if (action === "kellner") {
        console.log("Kellner gerufen");
      }
    });
  });

  doc.querySelectorAll("[data-business-menu-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = String(btn.dataset.businessMenuCategory || "").trim().toLowerCase();
      if (!category) return;
      syncBusinessMenuCategoryUi(category);
      scrollBusinessMenuToCategory(category);
    });
  });

  doc.querySelectorAll("[data-profile-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.profileView;
      if (!mode) return;
      state.profileViewMode = mode;
      render();
    });
  });

  bindLandingSwipeExperience();
  syncBusinessMenuCategoryUi();
}
