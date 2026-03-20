import fs from "node:fs/promises";
import path from "node:path";

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function asBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  const safe = String(value).trim().toLowerCase();
  return safe === "1" || safe === "true" || safe === "yes" || safe === "on";
}

function splitCsv(value = "") {
  return asText(value)
    .split(",")
    .map((item) => asText(item))
    .filter(Boolean);
}

function createRunStamp() {
  return new Date().toISOString().replace(/[.:TZ-]/g, "").slice(0, 14);
}

function mergeRecords(base = {}, override = {}) {
  const next = { ...(base || {}) };
  Object.entries(override || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      next[key] = value.slice();
      return;
    }
    if (value && typeof value === "object") {
      next[key] = mergeRecords(next[key] || {}, value);
      return;
    }
    if (value !== undefined) {
      next[key] = value;
    }
  });
  return next;
}

async function readOptionalJsonFile(filePath = "", rootDir = process.cwd()) {
  const safePath = asText(filePath);
  if (!safePath) return {};
  const resolved = path.isAbsolute(safePath) ? safePath : path.resolve(rootDir, safePath);
  try {
    const text = await fs.readFile(resolved, "utf8");
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function parseJsonEnv(value = "") {
  const safe = asText(value);
  if (!safe) return {};
  try {
    return JSON.parse(safe);
  } catch {
    return {};
  }
}

function buildLegacyPackConfig(envMap = {}) {
  return {
    personas: {
      ceo: {
        app: "social",
        baseUrl: asText(envMap.MNYRA_SOCIAL_BASE_URL, "https://menyra-test.vercel.app/social/"),
        email: asText(envMap.MNYRA_CEO_EMAIL),
        password: asText(envMap.MNYRA_CEO_PASSWORD)
      },
      business: {
        app: "social",
        baseUrl: asText(envMap.MNYRA_BUSINESS_BASE_URL || envMap.MNYRA_SOCIAL_BASE_URL, "https://menyra-test.vercel.app/social/"),
        email: asText(envMap.MNYRA_BUSINESS_EMAIL),
        password: asText(envMap.MNYRA_BUSINESS_PASSWORD)
      },
      staff: {
        app: "waiter",
        baseUrl: asText(envMap.MNYRA_STAFF_BASE_URL, "https://menyra-test.vercel.app/waiter/"),
        email: asText(envMap.MNYRA_STAFF_EMAIL),
        password: asText(envMap.MNYRA_STAFF_PASSWORD)
      },
      user: {
        app: "social",
        baseUrl: asText(envMap.MNYRA_USER_BASE_URL || envMap.MNYRA_SOCIAL_BASE_URL, "https://menyra-test.vercel.app/social/"),
        email: asText(envMap.MNYRA_USER_EMAIL),
        password: asText(envMap.MNYRA_USER_PASSWORD)
      },
      guest: {
        app: "social",
        baseUrl: asText(envMap.MNYRA_GUEST_BASE_URL || envMap.MNYRA_SOCIAL_BASE_URL, "https://menyra-test.vercel.app/social/"),
        guestRouteUrl: asText(envMap.MNYRA_GUEST_QR_URL || envMap.MNYRA_GUEST_MENU_URL)
      }
    },
    actions: {
      social: {
        businessProfile: {
          url: asText(envMap.MNYRA_SMOKE_BUSINESS_PROFILE_URL)
        },
        userTargetProfile: {
          url: asText(envMap.MNYRA_USER_TARGET_PROFILE_URL)
        },
        follow: {
          url: asText(envMap.MNYRA_USER_TARGET_PROFILE_URL),
          triggerSelector: asText(envMap.MNYRA_USER_FOLLOW_TRIGGER_SELECTOR),
          verifySelector: asText(envMap.MNYRA_USER_FOLLOW_VERIFY_SELECTOR),
          verifyText: asText(envMap.MNYRA_USER_FOLLOW_VERIFY_TEXT)
        },
        like: {
          url: asText(envMap.MNYRA_USER_LIKE_URL),
          triggerSelector: asText(envMap.MNYRA_USER_LIKE_TRIGGER_SELECTOR),
          countSelector: asText(envMap.MNYRA_USER_LIKE_COUNT_SELECTOR)
        },
        commentCreate: {
          url: asText(envMap.MNYRA_USER_COMMENT_URL),
          openComposerSelector: asText(envMap.MNYRA_USER_COMMENT_OPEN_SELECTOR),
          inputSelector: asText(envMap.MNYRA_USER_COMMENT_INPUT_SELECTOR),
          submitSelector: asText(envMap.MNYRA_USER_COMMENT_SUBMIT_SELECTOR),
          verifyText: asText(envMap.MNYRA_USER_COMMENT_VERIFY_TEXT)
        },
        postCreate: {
          url: asText(envMap.MNYRA_USER_POST_URL),
          openSelector: asText(envMap.MNYRA_USER_POST_OPEN_SELECTOR),
          inputSelector: asText(envMap.MNYRA_USER_POST_INPUT_SELECTOR),
          submitSelector: asText(envMap.MNYRA_USER_POST_SUBMIT_SELECTOR),
          verifyText: asText(envMap.MNYRA_USER_POST_VERIFY_TEXT)
        }
      },
      business: {
        menu: {
          url: asText(envMap.MNYRA_BUSINESS_MENU_URL)
        },
        focus: {
          url: asText(envMap.MNYRA_BUSINESS_FOCUS_URL)
        },
        productCreate: {
          url: asText(envMap.MNYRA_BUSINESS_MENU_URL),
          openSelector: asText(envMap.MNYRA_BUSINESS_PRODUCT_CREATE_OPEN_SELECTOR),
          nameSelector: asText(envMap.MNYRA_BUSINESS_PRODUCT_NAME_SELECTOR),
          saveSelector: asText(envMap.MNYRA_BUSINESS_PRODUCT_SAVE_SELECTOR),
          verifySelector: asText(envMap.MNYRA_BUSINESS_PRODUCT_VERIFY_SELECTOR),
          verifyText: asText(envMap.MNYRA_BUSINESS_PRODUCT_VERIFY_TEXT),
          nameTemplate: asText(envMap.MNYRA_BUSINESS_PRODUCT_NAME_TEMPLATE, "TEST_RUN_<runId>_PRODUCT_1")
        },
        productEdit: {
          url: asText(envMap.MNYRA_BUSINESS_MENU_URL),
          openSelector: asText(envMap.MNYRA_BUSINESS_PRODUCT_EDIT_OPEN_SELECTOR),
          inputSelector: asText(envMap.MNYRA_BUSINESS_PRODUCT_EDIT_INPUT_SELECTOR),
          saveSelector: asText(envMap.MNYRA_BUSINESS_PRODUCT_EDIT_SAVE_SELECTOR),
          verifyText: asText(envMap.MNYRA_BUSINESS_PRODUCT_EDIT_VERIFY_TEXT)
        },
        productDelete: {
          url: asText(envMap.MNYRA_BUSINESS_MENU_URL),
          openSelector: asText(envMap.MNYRA_BUSINESS_PRODUCT_DELETE_OPEN_SELECTOR),
          confirmSelector: asText(envMap.MNYRA_BUSINESS_PRODUCT_DELETE_CONFIRM_SELECTOR),
          removedSelector: asText(envMap.MNYRA_BUSINESS_PRODUCT_DELETE_REMOVED_SELECTOR),
          removedText: asText(envMap.MNYRA_BUSINESS_PRODUCT_DELETE_REMOVED_TEXT)
        }
      },
      commerce: {
        cart: {
          url: asText(envMap.MNYRA_SMOKE_CART_URL),
          triggerSelector: asText(envMap.MNYRA_SMOKE_CART_TRIGGER_SELECTOR),
          removalSelector: asText(envMap.MNYRA_SMOKE_CART_REMOVAL_SELECTOR),
          verifySelector: asText(envMap.MNYRA_SMOKE_CART_VERIFY_SELECTOR),
          verifyText: asText(envMap.MNYRA_SMOKE_CART_VERIFY_TEXT)
        },
        order: {
          url: asText(envMap.MNYRA_SMOKE_CART_URL),
          triggerSelector: asText(envMap.MNYRA_SMOKE_ORDER_TRIGGER_SELECTOR),
          successText: asText(envMap.MNYRA_SMOKE_ORDER_SUCCESS_TEXT),
          verifySelector: asText(envMap.MNYRA_SMOKE_ORDER_VERIFY_SELECTOR)
        }
      },
      chat: {
        send: {
          url: asText(envMap.MNYRA_SMOKE_CHAT_TARGET_URL),
          composerSelector: asText(envMap.MNYRA_SMOKE_CHAT_COMPOSER_SELECTOR),
          sendSelector: asText(envMap.MNYRA_SMOKE_CHAT_SEND_SELECTOR),
          verifyText: asText(envMap.MNYRA_SMOKE_CHAT_VERIFY_TEXT || envMap.MNYRA_SMOKE_CHAT_MESSAGE),
          messageTemplate: asText(envMap.MNYRA_SMOKE_CHAT_MESSAGE, "mnyra-heart smoke ping")
        }
      },
      crm: {
        leadCreate: {
          url: asText(envMap.MNYRA_CRM_LEAD_URL || envMap.MNYRA_SMOKE_LEAD_CREATE_URL),
          openSelector: asText(envMap.MNYRA_CRM_LEAD_OPEN_SELECTOR),
          nameSelector: asText(envMap.MNYRA_CRM_LEAD_NAME_SELECTOR),
          emailSelector: asText(envMap.MNYRA_CRM_LEAD_EMAIL_SELECTOR),
          saveSelector: asText(envMap.MNYRA_CRM_LEAD_SAVE_SELECTOR || envMap.MNYRA_SMOKE_LEAD_SAVE_SELECTOR),
          verifyText: asText(envMap.MNYRA_CRM_LEAD_VERIFY_TEXT),
          deleteSelector: asText(envMap.MNYRA_CRM_LEAD_DELETE_SELECTOR),
          confirmDeleteSelector: asText(envMap.MNYRA_CRM_LEAD_DELETE_CONFIRM_SELECTOR)
        },
        leadEdit: {
          url: asText(envMap.MNYRA_CRM_LEAD_URL),
          openSelector: asText(envMap.MNYRA_CRM_LEAD_EDIT_OPEN_SELECTOR),
          inputSelector: asText(envMap.MNYRA_CRM_LEAD_EDIT_INPUT_SELECTOR),
          saveSelector: asText(envMap.MNYRA_CRM_LEAD_EDIT_SAVE_SELECTOR),
          verifyText: asText(envMap.MNYRA_CRM_LEAD_EDIT_VERIFY_TEXT)
        }
      },
      guest: {
        qrMenu: {
          url: asText(envMap.MNYRA_GUEST_QR_URL || envMap.MNYRA_GUEST_MENU_URL),
          menuVisibleSelector: asText(envMap.MNYRA_GUEST_MENU_VISIBLE_SELECTOR),
          cartVisibleSelector: asText(envMap.MNYRA_GUEST_CART_VISIBLE_SELECTOR),
          orderTriggerSelector: asText(envMap.MNYRA_GUEST_ORDER_TRIGGER_SELECTOR || envMap.MNYRA_SMOKE_ORDER_TRIGGER_SELECTOR),
          orderVerifySelector: asText(envMap.MNYRA_GUEST_ORDER_VERIFY_SELECTOR || envMap.MNYRA_SMOKE_ORDER_VERIFY_SELECTOR),
          orderSuccessText: asText(envMap.MNYRA_GUEST_ORDER_SUCCESS_TEXT || envMap.MNYRA_SMOKE_ORDER_SUCCESS_TEXT),
          privilegedSelectors: splitCsv(envMap.MNYRA_GUEST_PRIVILEGED_SELECTORS)
        }
      },
      staff: {
        waiter: {
          url: asText(envMap.MNYRA_STAFF_BASE_URL, "https://menyra-test.vercel.app/waiter/"),
          orderVisibleSelector: asText(envMap.MNYRA_STAFF_ORDER_VISIBLE_SELECTOR),
          statusActionSelector: asText(envMap.MNYRA_STAFF_STATUS_ACTION_SELECTOR),
          verifySelector: asText(envMap.MNYRA_STAFF_STATUS_VERIFY_SELECTOR),
          verifyText: asText(envMap.MNYRA_STAFF_STATUS_VERIFY_TEXT)
        }
      },
      journey: {
        modalOpenSelector: asText(envMap.MNYRA_JOURNEY_MODAL_OPEN_SELECTOR),
        modalCloseSelector: asText(envMap.MNYRA_JOURNEY_MODAL_CLOSE_SELECTOR)
      }
    }
  };
}

export async function getRunnerEnv(mode = "smoke") {
  const rootDir = process.cwd();
  const artifactDir = path.resolve(rootDir, process.env.MNYRA_HEART_ARTIFACT_DIR || `artifacts/${mode}-${createRunStamp()}`);
  await fs.mkdir(artifactDir, { recursive: true });
  const outputFile = path.resolve(artifactDir, process.env.MNYRA_HEART_REPORT_FILE || `${mode}-report.json`);

  const fileConfig = await readOptionalJsonFile(process.env.MNYRA_HEART_PACK_CONFIG_FILE, rootDir);
  const envConfig = parseJsonEnv(process.env.MNYRA_HEART_PACK_CONFIG_JSON);
  const legacyConfig = buildLegacyPackConfig(process.env);
  const runnerConfig = mergeRecords(legacyConfig, mergeRecords(fileConfig, envConfig));

  return {
    mode,
    rootDir,
    artifactDir,
    outputFile,
    runId: asText(process.env.HEART_RUN_ID, `heart_${mode}_${createRunStamp()}`),
    socialBaseUrl: asText(process.env.MNYRA_SOCIAL_BASE_URL, "https://menyra-test.vercel.app/social/"),
    waiterBaseUrl: asText(process.env.MNYRA_WAITER_BASE_URL || process.env.MNYRA_STAFF_BASE_URL, "https://menyra-test.vercel.app/waiter/"),
    ceoEmail: asText(process.env.MNYRA_CEO_EMAIL),
    ceoPassword: asText(process.env.MNYRA_CEO_PASSWORD),
    headless: asBoolean(process.env.MNYRA_HEART_HEADLESS, true),
    allowLiveMutations: asBoolean(process.env.MNYRA_ALLOW_LIVE_MUTATIONS, false),
    syntheticIsolationKey: asText(process.env.MNYRA_SYNTHETIC_ISOLATION_KEY),
    syntheticPrefix: asText(process.env.MNYRA_SYNTHETIC_PREFIX, `mnyra-heart-synth-${createRunStamp()}`),
    heartStatusUrl: asText(process.env.HEART_STATUS_URL),
    heartReportUrl: asText(process.env.HEART_REPORT_URL),
    heartIncidentUrl: asText(process.env.HEART_INCIDENT_URL),
    heartWebhookSecret: asText(process.env.HEART_WEBHOOK_SECRET),
    githubRunId: asText(process.env.GITHUB_RUN_ID),
    githubRunNumber: asText(process.env.GITHUB_RUN_NUMBER),
    githubServerUrl: asText(process.env.GITHUB_SERVER_URL),
    githubRepository: asText(process.env.GITHUB_REPOSITORY),
    githubSha: asText(process.env.GITHUB_SHA),
    githubRefName: asText(process.env.GITHUB_REF_NAME),
    packConfig: runnerConfig
  };
}

export function requireCredentials(env, requiredPersonaKeys = ["ceo"]) {
  const missing = requiredPersonaKeys.filter((personaKey) => {
    if (personaKey === "guest") return false;
    const persona = env?.packConfig?.personas?.[personaKey];
    return !asText(persona?.email) || !asText(persona?.password);
  });
  if (missing.length) {
    throw new Error(`Missing credentials for persona(s): ${missing.join(", ")}.`);
  }
}
