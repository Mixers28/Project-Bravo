// background.js (MV3 service worker)

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
  whitelist: [],                // list of hostnames
  customTrackers: [],           // list of tracker domain substrings, e.g. ["hotjar.com"]
  stats: {
    blockedCookies: 0,
    lastClean: null
  }
};

async function getSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, items => resolve(items));
  });
}

async function saveSettings(settings) {
  return new Promise(resolve => {
    chrome.storage.sync.set(settings, () => resolve());
  });
}

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

  if (customTrackers.some(t => host.includes(t.toLowerCase()))) {
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
async function deleteCookie(cookie, settings) {
  const removalDetails = {
    name: cookie.name,
    storeId: cookie.storeId,
    url: cookie.secure ? `https://${cookie.domain.replace(/^\./, "")}${cookie.path}` :
                         `http://${cookie.domain.replace(/^\./, "")}${cookie.path}`
  };

  await chrome.cookies.remove(removalDetails);

  const newSettings = await getSettings();
  newSettings.stats.blockedCookies = (newSettings.stats.blockedCookies || 0) + 1;
  await saveSettings(newSettings);
}

// Listen for new/changed cookies
chrome.cookies.onChanged.addListener(async (changeInfo) => {
  const settings = await getSettings();
  if (!settings.enabled) return;

  const { cookie, removed } = changeInfo;
  if (removed) return; // we don't care about deletions

  if (isMarketingCookie(cookie, settings)) {
    await deleteCookie(cookie, settings);
  }
});

// Periodic clean-up (e.g. once per hour)
async function cleanAllMarketingCookies() {
  const settings = await getSettings();
  if (!settings.enabled) return;

  chrome.cookies.getAll({}, async (cookies) => {
    for (const cookie of cookies) {
      if (isMarketingCookie(cookie, settings)) {
        await deleteCookie(cookie, settings);
      }
    }
    const s = await getSettings();
    s.stats.lastClean = new Date().toISOString();
    await saveSettings(s);
  });
}

// Expose simple message API for popup/options
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message.type === "getSettings") {
      sendResponse(await getSettings());
    } else if (message.type === "setSettings") {
      const current = await getSettings();
      const updated = { ...current, ...message.payload };
      await saveSettings(updated);
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
