"use strict";

const path = require("node:path");
const { pathToFileURL } = require("node:url");

const githubExecutionStateModulePromise = import(
  pathToFileURL(path.resolve(__dirname, "../../shared/github-execution-state.js")).href
);

async function normalizeGithubExecutionState(status = "", conclusion = "", fallback = "idle") {
  const moduleRef = await githubExecutionStateModulePromise;
  return moduleRef.normalizeGithubExecutionState(status, conclusion, fallback);
}

module.exports = {
  normalizeGithubExecutionState,
  githubExecutionStateModulePromise
};
