const TRAVEL_DESTINATION_REQUIRED_MESSAGE = "Ju lutem shkruani destinacionin e udhëtimit.";

function markBound(node, key = "default") {
  if (!node?.dataset) return true;
  const attr = `travel${key}Bound`;
  if (node.dataset[attr] === "1") return false;
  node.dataset[attr] = "1";
  return true;
}

export function bindTravelViewEvents({
  documentObj,
  state,
  windowObj,
  renderFn
} = {}) {
  const doc = documentObj || null;
  if (!doc || !state) return;
  const win = windowObj || doc.defaultView || globalThis;
  const render = typeof renderFn === "function" ? renderFn : (() => {});

  const getTravelViewState = () => {
    if (!state.travelView || typeof state.travelView !== "object") {
      state.travelView = {};
    }
    return state.travelView;
  };
  const scrollTravelInputIntoView = () => {
    const input = doc.getElementById("travelDestinationInput");
    if (!input) return;
    try {
      input.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch {
      input.scrollIntoView();
    }
    if (typeof input.focus === "function") {
      try {
        input.focus({ preventScroll: true });
      } catch {
        input.focus();
      }
    }
  };
  const scrollTravelBenkoIntoView = () => {
    const benko = doc.getElementById("travelBenko");
    if (!benko) return;
    try {
      benko.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      benko.scrollIntoView();
    }
  };
  const setTravelDestinationRequired = () => {
    state.travelView = {
      ...getTravelViewState(),
      activeTab: "offers",
      notice: TRAVEL_DESTINATION_REQUIRED_MESSAGE
    };
    render();
    if (typeof win?.setTimeout === "function") {
      win.setTimeout(scrollTravelInputIntoView, 0);
    } else {
      scrollTravelInputIntoView();
    }
  };
  const commitTravelDestination = ({ value = "", immediateScroll = true } = {}) => {
    const query = String(value || "").trim();
    const previousQuery = String(getTravelViewState().query || "").trim();
    if (!query) {
      state.travelView = {
        ...getTravelViewState(),
        query: "",
        activeTab: "offers",
        notice: ""
      };
      render();
      return;
    }
    state.travelView = {
      ...getTravelViewState(),
      query,
      activeTab: "hotels",
      notice: ""
    };
    render();
    if (immediateScroll || !previousQuery) {
      if (typeof win?.setTimeout === "function") {
        win.setTimeout(scrollTravelBenkoIntoView, 0);
      } else {
        scrollTravelBenkoIntoView();
      }
    }
  };

  const travelInput = doc.getElementById("travelDestinationInput");
  if (travelInput && markBound(travelInput, "Input")) {
    let travelInputTimer = 0;
    travelInput.addEventListener("input", () => {
      const query = String(travelInput.value || "").trim();
      const previousQuery = String(getTravelViewState().query || "").trim();
      state.travelView = {
        ...getTravelViewState(),
        query,
        activeTab: query ? "hotels" : "offers",
        notice: ""
      };
      if (travelInputTimer && typeof win?.clearTimeout === "function") {
        win.clearTimeout(travelInputTimer);
      }
      const delay = query ? 520 : 120;
      travelInputTimer = typeof win?.setTimeout === "function"
        ? win.setTimeout(() => {
            travelInputTimer = 0;
            render();
            if (!previousQuery && query) scrollTravelBenkoIntoView();
          }, delay)
        : 0;
      if (!travelInputTimer) {
        render();
        if (!previousQuery && query) scrollTravelBenkoIntoView();
      }
    });
    travelInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      commitTravelDestination({ value: travelInput.value || "", immediateScroll: true });
    });
  }

  doc.querySelectorAll("[data-travel-submit]").forEach((btn) => {
    if (!markBound(btn, "Submit")) return;
    btn.addEventListener("click", () => {
      const input = doc.getElementById("travelDestinationInput");
      const value = String(input?.value || getTravelViewState().query || "");
      if (!value.trim()) {
        setTravelDestinationRequired();
        return;
      }
      commitTravelDestination({ value, immediateScroll: true });
    });
  });

  doc.querySelectorAll("[data-travel-tab]").forEach((btn) => {
    if (!markBound(btn, "Tab")) return;
    btn.addEventListener("click", () => {
      const tab = String(btn.dataset.travelTab || "").trim().toLowerCase();
      if (!tab) return;
      const query = String(getTravelViewState().query || "").trim();
      if ((tab === "hotels" || tab === "map") && !query) {
        setTravelDestinationRequired();
        return;
      }
      state.travelView = {
        ...getTravelViewState(),
        activeTab: tab === "map" ? "map" : (tab === "hotels" ? "hotels" : "offers"),
        notice: ""
      };
      render();
      if (tab === "hotels" || tab === "map") {
        if (typeof win?.setTimeout === "function") {
          win.setTimeout(scrollTravelBenkoIntoView, 0);
        } else {
          scrollTravelBenkoIntoView();
        }
      }
    });
  });
}
