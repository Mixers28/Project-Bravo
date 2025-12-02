// background.js (Firefox MV2 background script)

const FALLBACK_TRACKER_DOMAINS = [
  "doubleclick.net",
  "googletagmanager.com",
  "google-analytics.com",
  "ads.twitter.com",
  "facebook.com",
  "facebook.net",
  "scorecardresearch.com",
  "quantserve.com"
];

const FALLBACK_TRACKING_NAMES = [
  "_ga", "_gid", "_fbp",
  "fr", "ajs_anonymous_id", "ajs_user_id",
  "_hj", "hubspotutk", "mkto_", "optimizely"
];

let trackerData = {
  domains: FALLBACK_TRACKER_DOMAINS.map(d => d.toLowerCase()),
  cookieNames: FALLBACK_TRACKING_NAMES.map(n => n.toLowerCase())
};

const AD_HOST_KEYWORDS = [
  "doubleclick.net",
  "googlesyndication.com",
  "g.doubleclick.net",
  "adservice.google.com",
  "ads.yahoo.com",
  "ads.twitter.com"
];

function shouldBlockAdRequest(urlString) {
  try {
    const url = new URL(urlString);
    const host = (url.hostname || "").toLowerCase();
    if (AD_HOST_KEYWORDS.some(keyword => host === keyword || host.endsWith(`.${keyword}`))) {
      return true;
    }
    const path = (url.pathname || "").toLowerCase();
    return path.includes("/ads");
  } catch (err) {
    return false;
  }
}

(async () => {
  try {
    const resp = await fetch(chrome.runtime.getURL("tracker-data.json"));
    const json = await resp.json();
    if (json?.domains?.length) {
      trackerData.domains = json.domains.map(d => d.toLowerCase());
    }
    if (json?.cookieNames?.length) {
      trackerData.cookieNames = json.cookieNames.map(n => n.toLowerCase());
    }
  } catch (err) {
    console.warn("Failed to load tracker-data.json, using fallback lists.", err);
  }
})();

const DEFAULT_SETTINGS = {
  enabled: true,
  whitelist: [],
  customTrackers: [],
  stats: {
    blockedCookies: 0,
    lastClean: null
  }
};

let settingsCache = null;
let settingsLoadPromise = null;

function normalizeSettings(raw = {}) {
  const merged = {
    ...DEFAULT_SETTINGS,
    ...raw,
    whitelist: Array.isArray(raw.whitelist) ? raw.whitelist : DEFAULT_SETTINGS.whitelist,
    customTrackers: Array.isArray(raw.customTrackers) ? raw.customTrackers : DEFAULT_SETTINGS.customTrackers,
    stats: {
      ...DEFAULT_SETTINGS.stats,
      ...(raw.stats || {})
    }
  };

  return {
    ...merged,
    whitelist: [...merged.whitelist],
    customTrackers: [...merged.customTrackers],
    stats: { ...merged.stats }
  };
}

function cloneSettings(settings) {
  return {
    ...settings,
    whitelist: [...settings.whitelist],
    customTrackers: [...settings.customTrackers],
    stats: { ...settings.stats }
  };
}

function storageGet(defaults) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(defaults, (items) => resolve(items));
  });
}

function storageSet(value) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(value, () => resolve());
  });
}

async function fetchSettingsFromStorage() {
  const raw = await storageGet(DEFAULT_SETTINGS);
  return normalizeSettings(raw);
}

async function getSettings(forceReload = false) {
  if (forceReload) {
    settingsCache = null;
  }
  if (settingsCache) {
    return settingsCache;
  }
  if (!settingsLoadPromise) {
    settingsLoadPromise = fetchSettingsFromStorage();
  }
  settingsCache = await settingsLoadPromise;
  settingsLoadPromise = null;
  return settingsCache;
}

async function updateSettings(updater) {
  const current = await getSettings();
  const draft = cloneSettings(current);
  const candidate =
    typeof updater === "function" ? updater(draft) || draft : { ...current, ...updater };
  const next = normalizeSettings(candidate);
  await storageSet(next);
  settingsCache = next;
  return next;
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync" || !settingsCache) return;
  const next = { ...settingsCache };
  Object.entries(changes).forEach(([key, change]) => {
    if (typeof change.newValue === "undefined") {
      delete next[key];
    } else {
      next[key] = change.newValue;
    }
  });
  settingsCache = normalizeSettings(next);
});

// Check if a cookie is "marketing/tracking"-ish
function isMarketingCookie(cookie, settings) {
  const { whitelist, customTrackers } = settings;

  const domain = cookie.domain.replace(/^\./, ""); // strip leading dot
  const host = domain.toLowerCase();

  // Whitelisted sites are always allowed
  if (whitelist.some(w => host === w || host.endsWith(`.${w}`))) {
    return false;
  }

  // Heuristic: third-party cookie (domain != top-level domain of tab)
  // We can't always know the tab's domain from here, but:
  // - Third-party cookies often have a domain not matching the page.
  // - For simplicity we treat known tracker domains + customTrackers as "marketing".
  if (trackerData.domains.some(t => host === t || host.endsWith(`.${t}`))) {
    return true;
  }

  if (customTrackers.some(t => t && host.includes(t.toLowerCase()))) {
    return true;
  }

  // Name-based heuristic (common marketing cookie names)
  const name = cookie.name.toLowerCase();
  if (trackerData.cookieNames.some(n => name.startsWith(n))) {
    return true;
  }

  // You could add more heuristics here if needed
  return false;
}

// Remove a cookie and bump stats
async function deleteCookie(cookie) {
  const removalDetails = {
    name: cookie.name,
    storeId: cookie.storeId,
    url: cookie.secure ? `https://${cookie.domain.replace(/^\./, "")}${cookie.path}` :
                         `http://${cookie.domain.replace(/^\./, "")}${cookie.path}`
  };

  await new Promise((resolve) => chrome.cookies.remove(removalDetails, resolve));
  await updateSettings((current) => {
    current.stats.blockedCookies = (current.stats.blockedCookies || 0) + 1;
    return current;
  });
}

// Listen for new/changed cookies
chrome.cookies.onChanged.addListener(async (changeInfo) => {
  const settings = await getSettings();
  if (!settings.enabled) return;

  const { cookie, removed } = changeInfo;
  if (removed) return; // we don't care about deletions

  if (isMarketingCookie(cookie, settings)) {
    await deleteCookie(cookie);
  }
});

// Periodic clean-up (e.g. once per hour)
async function cleanAllMarketingCookies() {
  const settings = await getSettings();
  if (!settings.enabled) return;

  const cookies = await new Promise((resolve) => chrome.cookies.getAll({}, resolve));
  for (const cookie of cookies) {
    if (isMarketingCookie(cookie, settings)) {
      await deleteCookie(cookie);
    }
  }

  await updateSettings((current) => {
    current.stats.lastClean = new Date().toISOString();
    return current;
  });
}

// Expose simple message API for popup/options
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message.type === "getSettings") {
      sendResponse(await getSettings());
    } else if (message.type === "setSettings") {
      const updated = await updateSettings(message.payload || {});
      sendResponse(updated);
    } else if (message.type === "cleanNow") {
      await cleanAllMarketingCookies();
      sendResponse({ ok: true });
    }
  })();

  // indicate async response
  return true;
});

// Optional: run periodic cleanup using alarms
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("periodicClean", { periodInMinutes: 60 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "periodicClean") {
    cleanAllMarketingCookies();
  }
});

if (chrome.webRequest && chrome.webRequest.onBeforeRequest) {
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (shouldBlockAdRequest(details.url)) {
        return { cancel: true };
      }
      return {};
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
  );
}
