function firstNonEmpty(...values) {
  for (const value of values) {
    const text = String(value || "").trim();
    if (text) return text;
  }
  return "";
}

function normalizeTimestamp(raw = "") {
  const text = String(raw || "").trim();
  if (!text) return "";
  const parsed = new Date(text);
  if (!Number.isFinite(parsed.getTime())) return "";
  return parsed.toISOString();
}

module.exports = function buildInfoHandler(req, res) {
  const commitSha = firstNonEmpty(
    process.env.VERCEL_GIT_COMMIT_SHA,
    process.env.GIT_COMMIT_SHA,
    process.env.COMMIT_SHA
  );
  const commitShort = commitSha ? commitSha.slice(0, 12) : "";
  const branch = firstNonEmpty(
    process.env.VERCEL_GIT_COMMIT_REF,
    process.env.GIT_BRANCH,
    process.env.BRANCH_NAME
  );
  const environment = firstNonEmpty(
    process.env.VERCEL_ENV,
    process.env.NODE_ENV
  );
  const buildTimestamp = normalizeTimestamp(firstNonEmpty(
    process.env.VERCEL_GIT_COMMIT_TIMESTAMP,
    process.env.VERCEL_DEPLOYMENT_CREATED_AT,
    process.env.BUILD_TIMESTAMP_UTC
  ));

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(200).json({
    commitShort: commitShort || null,
    commitSha: commitSha || null,
    buildTimestamp: buildTimestamp || null,
    branch: branch || null,
    environment: environment || null
  });
};
