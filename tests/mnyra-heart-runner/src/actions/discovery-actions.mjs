import {
  clickFirstVisible,
  fillIfPresent,
  openPageAndWait,
  waitForAnySelector
} from "../helpers/social-app.mjs";
import { hasRequiredConfig, markNotConfigured } from "./common-actions.mjs";
import { runUiLayoutCheck } from "./ui-actions.mjs";

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function resolveBusinessSearchQuery(env = {}) {
  const discovery = env.packConfig?.actions?.discovery || {};
  return asText(
    discovery.map?.query,
    discovery.search?.query,
    env.packConfig?.personas?.business?.displayName,
    env.packConfig?.personas?.business?.handle
  );
}

function uniqueSelectors(...values) {
  const seen = new Set();
  return values.flatMap((value) => {
    if (Array.isArray(value)) return value;
    return [value];
  }).map((item) => asText(item)).filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function openBusinessTargetFromDiscovery(page, heart, persona, {
  viewLabel = "Suche",
  pageUrl = "",
  inputSelector = "",
  resultSelector = "",
  profileReadySelector = "",
  queryText = ""
} = {}) {
  await openPageAndWait(page, pageUrl, "body", heart, {
    title: `${persona.label} / Open ${viewLabel}`,
    moduleKey: "map",
    area: "map",
    persona: persona.key
  });

  const safeQueryText = asText(queryText);
  if (safeQueryText) {
    await fillIfPresent(page, inputSelector, safeQueryText, 12000);
    await page.waitForTimeout(600);
  }

  await waitForAnySelector(page, [resultSelector], 20000);
  await clickFirstVisible(page, [resultSelector], 10000);
  await waitForAnySelector(page, [
    profileReadySelector,
    "[data-public-profile-follow]",
    "[data-business-top-tab]",
    "[data-profile-top-tab]"
  ], 20000);
  heart.passModule("map", `${viewLabel} hat ein Business erfolgreich geoeffnet.`, {
    action: `${viewLabel.toLowerCase()} business open`,
    persona: persona.key,
    area: "map"
  });
  await runUiLayoutCheck(page, heart, {
    persona,
    viewLabel: `${viewLabel}-Businessprofil`,
    moduleKey: "ui",
    action: `${viewLabel.toLowerCase()} profile ui`,
    area: "ui"
  });
}

async function openBusinessTargetFromMap(page, heart, persona, {
  pageUrl = "",
  inputSelector = "",
  markerSelector = ".leaflet-marker-icon, .custom-div-icon",
  profileOpenSelector = "#mapVisitProfileBtn, #mapVisitProfileImgBtn",
  profileReadySelector = "",
  queryText = ""
} = {}) {
  await openPageAndWait(page, pageUrl, "body", heart, {
    title: `${persona.label} / Open Karte`,
    moduleKey: "map",
    area: "map",
    persona: persona.key
  });

  const safeQueryText = asText(queryText);
  if (safeQueryText && asText(inputSelector)) {
    await fillIfPresent(page, inputSelector, safeQueryText, 12000);
    await page.waitForTimeout(1400);
  }

  await waitForAnySelector(page, uniqueSelectors(markerSelector), 20000);
  const clickedMarker = await clickFirstVisible(page, uniqueSelectors(markerSelector), 10000);
  if (!clickedMarker) {
    throw new Error("Heart konnte auf der Karte keinen anklickbaren Marker finden.");
  }

  await waitForAnySelector(page, uniqueSelectors(profileOpenSelector), 15000);
  const openedProfile = await clickFirstVisible(page, uniqueSelectors(profileOpenSelector), 10000);
  if (!openedProfile) {
    throw new Error("Heart konnte im Karten-Sheet keinen Profil-Button finden.");
  }

  await waitForAnySelector(page, uniqueSelectors(
    profileReadySelector,
    "[data-public-profile-follow]",
    "[data-business-top-tab]",
    "[data-profile-top-tab]"
  ), 20000);

  heart.passModule("map", "Karte hat ein Business erfolgreich geoeffnet.", {
    action: "map business open",
    persona: persona.key,
    area: "map"
  });
  await runUiLayoutCheck(page, heart, {
    persona,
    viewLabel: "Karte-Businessprofil",
    moduleKey: "ui",
    action: "map profile ui",
    area: "ui"
  });
}

export async function runDiscoveryChecks({ page, env, heart, persona } = {}) {
  const discovery = env.packConfig?.actions?.discovery || {};
  const queryText = resolveBusinessSearchQuery(env);

  if (hasRequiredConfig(discovery.search, ["url", "inputSelector", "businessResultSelector"])) {
    try {
      await openBusinessTargetFromDiscovery(page, heart, persona, {
        viewLabel: "Suche",
        pageUrl: discovery.search.url,
        inputSelector: discovery.search.inputSelector,
        resultSelector: discovery.search.businessResultSelector,
        profileReadySelector: discovery.search.profileReadySelector,
        queryText
      });
    } catch (error) {
      heart.failModule("map", error, {
        action: "search business open",
        title: "Business konnte ueber die Suche nicht geoeffnet werden",
        persona: persona.key,
        area: "map"
      });
    }
  } else {
    markNotConfigured(heart, "map", "Suche ist fuer diesen Lauf noch nicht komplett eingerichtet.", {
      action: "search business open",
      persona: persona.key,
      area: "map"
    });
  }

  if (hasRequiredConfig(discovery.map, ["url", "inputSelector"])) {
    try {
      await openBusinessTargetFromMap(page, heart, persona, {
        pageUrl: discovery.map.url,
        inputSelector: discovery.map.inputSelector,
        markerSelector: discovery.map.markerSelector,
        profileOpenSelector: discovery.map.profileOpenSelector,
        profileReadySelector: discovery.map.profileReadySelector,
        queryText
      });
    } catch (error) {
      heart.failModule("map", error, {
        action: "map business open",
        title: "Business konnte ueber die Karte nicht geoeffnet werden",
        persona: persona.key,
        area: "map"
      });
    }
  } else {
    markNotConfigured(heart, "map", "Karte ist fuer diesen Lauf noch nicht komplett eingerichtet.", {
      action: "map business open",
      persona: persona.key,
      area: "map"
    });
  }
}
