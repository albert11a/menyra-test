"use strict";

const crypto = require("crypto");
const functions = require("firebase-functions");

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || String(fallback || "").trim();
}

function createRequestId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return crypto.randomBytes(8).toString("hex");
}

function stripEmptyFields(payload = {}) {
  const next = {};
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    next[key] = value;
  });
  return next;
}

function resolveRequestId(req) {
  const explicit = asText(
    req?.get?.("x-request-id")
    || req?.headers?.["x-request-id"]
  );
  if (explicit) return explicit;
  const traceHeader = asText(req?.get?.("x-cloud-trace-context"));
  if (traceHeader) return asText(traceHeader.split("/")[0]);
  return createRequestId();
}

function buildHttpLogContext(req, extra = {}) {
  return stripEmptyFields({
    requestId: resolveRequestId(req),
    method: asText(req?.method),
    path: asText(req?.path || req?.originalUrl || req?.url),
    origin: asText(req?.get?.("origin")),
    userAgent: asText(req?.get?.("user-agent")),
    ...extra
  });
}

function buildCallableLogContext(context = {}, extra = {}) {
  const rawRequest = context?.rawRequest;
  return stripEmptyFields({
    requestId: rawRequest ? resolveRequestId(rawRequest) : asText(context?.eventId, createRequestId()),
    userId: asText(context?.auth?.uid),
    ...extra
  });
}

function buildEventLogContext(context = {}, extra = {}) {
  return stripEmptyFields({
    requestId: asText(context?.eventId, createRequestId()),
    eventId: asText(context?.eventId),
    ...extra
  });
}

function serializeError(error) {
  if (!error) return {};
  const stack = asText(error?.stack);
  return stripEmptyFields({
    errorCode: asText(error?.code || error?.status),
    errorName: asText(error?.name),
    errorMessage: asText(error?.message || error),
    errorStack: stack
      ? stack.split("\n").slice(0, 6).join("\n")
      : ""
  });
}

function logFunctionInfo(flow, payload = {}) {
  functions.logger.info(flow, stripEmptyFields({
    flow,
    ...payload
  }));
}

function logFunctionWarn(flow, payload = {}) {
  functions.logger.warn(flow, stripEmptyFields({
    flow,
    ...payload
  }));
}

function logFunctionError(flow, error, payload = {}) {
  functions.logger.error(flow, stripEmptyFields({
    flow,
    ...payload,
    ...serializeError(error)
  }));
}

module.exports = {
  asText,
  buildHttpLogContext,
  buildCallableLogContext,
  buildEventLogContext,
  serializeError,
  logFunctionInfo,
  logFunctionWarn,
  logFunctionError
};
