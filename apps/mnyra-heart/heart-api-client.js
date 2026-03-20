function safeJsonParse(text = "") {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function createHeartApiClient({
  authController,
  apiBase = "/api/heart/",
  fallbackApiBase = ""
} = {}) {
  function buildFunctionUrl(functionName = "", base = apiBase) {
    const safeBase = String(base || "/api/heart/").trim() || "/api/heart/";
    const normalizedBase = safeBase.endsWith("/") ? safeBase : `${safeBase}/`;
    return `${normalizedBase}${String(functionName || "").trim()}`;
  }

  async function performRequest(functionName, token, {
    method = "GET",
    body = null,
    base = apiBase
  } = {}) {
    const headers = {
      "X-Heart-Authorization": `Bearer ${token}`
    };
    if (body) {
      headers["Content-Type"] = "application/json";
    }
    const response = await fetch(buildFunctionUrl(functionName, base), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    const text = await response.text();
    const parsed = safeJsonParse(text) || {};
    return {
      response,
      parsed
    };
  }

  async function request(functionName, {
    method = "GET",
    body = null
  } = {}) {
    async function requestAgainstBase(base, forceRefreshToken = false) {
      const token = await authController.getIdToken(forceRefreshToken);
      if (!token) throw new Error("Missing authenticated CEO token.");
      return performRequest(functionName, token, { method, body, base });
    }

    let response;
    let parsed;
    try {
      ({ response, parsed } = await requestAgainstBase(apiBase, false));

      if (response.status === 401) {
        ({ response, parsed } = await requestAgainstBase(apiBase, true));
      }

      const shouldRetryWithFallback = response.status === 404 && fallbackApiBase;
      if (shouldRetryWithFallback) {
        ({ response, parsed } = await requestAgainstBase(fallbackApiBase, false));
        if (response.status === 401) {
          ({ response, parsed } = await requestAgainstBase(fallbackApiBase, true));
        }
      }
    } catch (error) {
      if (!fallbackApiBase) throw error;
      ({ response, parsed } = await requestAgainstBase(fallbackApiBase, true));
    }
    if (!response.ok || parsed.ok === false) {
      throw new Error(String(parsed.error || `${functionName} failed with ${response.status}`));
    }
    return parsed;
  }

  return {
    request
  };
}
