import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const PROJECT_ID = "menyra-c0e68";
const REGION = "us-central1";
const HEART_FUNCTIONS = Object.freeze([
  "heartGetDashboard",
  "heartGetRuns",
  "heartGetRunDetail",
  "heartGetIncidents",
  "heartGetConnections",
  "heartStartSmokeRun",
  "heartStartSyntheticRun",
  "heartCancelRun",
  "heartIngestRunStatus",
  "heartIngestRunReport",
  "heartIngestIncident"
]);

function readFirebaseCliAccessToken() {
  const configPath = path.join(process.env.USERPROFILE || "", ".config", "configstore", "firebase-tools.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const accessToken = String(config?.tokens?.access_token || "").trim();
  if (!accessToken) {
    throw new Error("Missing Firebase CLI access token. Run `firebase login` first.");
  }
  return accessToken;
}

function requestJson(url, accessToken, { method = "GET", body = null } = {}) {
  return new Promise((resolve, reject) => {
    const request = https.request(url, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }, (response) => {
      let text = "";
      response.on("data", (chunk) => {
        text += chunk;
      });
      response.on("end", () => {
        const parsed = text ? JSON.parse(text) : {};
        if ((response.statusCode || 500) >= 400) {
          reject(new Error(`${method} ${url} failed with ${response.statusCode}: ${text}`));
          return;
        }
        resolve(parsed);
      });
    });
    request.on("error", reject);
    if (body) {
      request.write(JSON.stringify(body));
    }
    request.end();
  });
}

function buildFunctionResource(functionName) {
  return `projects/${PROJECT_ID}/locations/${REGION}/functions/${functionName}`;
}

async function ensurePublicInvoker(functionName, accessToken) {
  const resource = buildFunctionResource(functionName);
  const getPolicyUrl = `https://cloudfunctions.googleapis.com/v1/${resource}:getIamPolicy`;
  const setPolicyUrl = `https://cloudfunctions.googleapis.com/v1/${resource}:setIamPolicy`;
  const policy = await requestJson(getPolicyUrl, accessToken);
  const bindings = Array.isArray(policy.bindings) ? policy.bindings.slice() : [];
  const existingBinding = bindings.find((binding) => binding?.role === "roles/cloudfunctions.invoker");

  if (existingBinding) {
    const members = Array.isArray(existingBinding.members) ? existingBinding.members.slice() : [];
    if (!members.includes("allUsers")) {
      members.push("allUsers");
      existingBinding.members = members;
    }
  } else {
    bindings.push({
      role: "roles/cloudfunctions.invoker",
      members: ["allUsers"]
    });
  }

  const payload = {
    policy: {
      version: Number(policy.version || 1),
      etag: policy.etag,
      bindings
    }
  };
  const updatedPolicy = await requestJson(setPolicyUrl, accessToken, {
    method: "POST",
    body: payload
  });
  return updatedPolicy;
}

async function main() {
  const accessToken = readFirebaseCliAccessToken();
  for (const functionName of HEART_FUNCTIONS) {
    const policy = await ensurePublicInvoker(functionName, accessToken);
    const invokerBinding = (policy.bindings || []).find((binding) => binding?.role === "roles/cloudfunctions.invoker");
    const members = Array.isArray(invokerBinding?.members) ? invokerBinding.members.join(", ") : "";
    console.log(`${functionName}: ${members}`);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
