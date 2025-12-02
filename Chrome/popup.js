// popup.js

function formatDate(iso) {
  if (!iso) return "never";
  try {
    return new Date(iso).toLocaleString();
  } catch (e) {
    return iso;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const enabledToggle = document.getElementById("enabledToggle");
  const blockedCountEl = document.getElementById("blockedCount");
  const lastCleanEl = document.getElementById("lastClean");
  const cleanNowBtn = document.getElementById("cleanNow");
  const optionsLink = document.getElementById("optionsLink");
  const siteHostEl = document.getElementById("siteHost");
  const siteStatusEl = document.getElementById("siteStatus");
  const siteToggleBtn = document.getElementById("siteToggle");

  let currentSettings = null;
  let currentHost = null;

  function updateStats(settings) {
    enabledToggle.checked = settings.enabled;
    blockedCountEl.textContent = settings.stats.blockedCookies || 0;
    lastCleanEl.textContent = formatDate(settings.stats.lastClean);
  }

  function normalizeHost(host) {
    return (host || "").toLowerCase();
  }

  function isWhitelisted(host, whitelist = []) {
    const hostLower = normalizeHost(host);
    return whitelist.some(entry => {
      const entryLower = normalizeHost(entry);
      return hostLower === entryLower || hostLower.endsWith(`.${entryLower}`);
    });
  }

  function refreshSiteSection() {
    if (!currentHost) {
      siteHostEl.textContent = "Site unavailable";
      siteStatusEl.textContent = "Grant tab access or reload tab.";
      siteToggleBtn.disabled = true;
      siteToggleBtn.textContent = "Unavailable";
      return;
    }

    siteHostEl.textContent = currentHost;

    if (!currentSettings) {
      siteStatusEl.textContent = "Loading settings...";
      siteToggleBtn.disabled = true;
      siteToggleBtn.textContent = "Loading...";
      return;
    }

    if (!currentSettings.enabled) {
      siteStatusEl.textContent = "Global protection OFF";
      siteToggleBtn.disabled = true;
      siteToggleBtn.textContent = "Enable protection first";
      return;
    }

    const whitelist = currentSettings.whitelist || [];
    const whitelisted = isWhitelisted(currentHost, whitelist);
    siteStatusEl.textContent = whitelisted ? "Allowed (whitelisted)" : "Protected";
    siteToggleBtn.disabled = false;
    siteToggleBtn.textContent = whitelisted ? "Remove from whitelist" : "Allow this site";
  }

  function loadActiveHost() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs && tabs[0];
      if (!tab || !tab.url || tab.url.startsWith("chrome")) {
        currentHost = null;
      } else {
        try {
          currentHost = new URL(tab.url).hostname;
        } catch (err) {
          currentHost = null;
        }
      }
      refreshSiteSection();
    });
  }

  chrome.runtime.sendMessage({ type: "getSettings" }, (settings) => {
    currentSettings = settings;
    updateStats(settings);
    refreshSiteSection();
  });

  enabledToggle.addEventListener("change", () => {
    chrome.runtime.sendMessage({
      type: "setSettings",
      payload: { enabled: enabledToggle.checked }
    }, (updated) => {
      currentSettings = updated;
      updateStats(updated);
      refreshSiteSection();
    });
  });

  cleanNowBtn.addEventListener("click", () => {
    cleanNowBtn.disabled = true;
    cleanNowBtn.textContent = "Cleaning…";
    chrome.runtime.sendMessage({ type: "cleanNow" }, () => {
      chrome.runtime.sendMessage({ type: "getSettings" }, (settings) => {
        currentSettings = settings;
        updateStats(settings);
        cleanNowBtn.disabled = false;
        cleanNowBtn.textContent = "Clean marketing cookies now";
      });
    });
  });

  optionsLink.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  siteToggleBtn.addEventListener("click", () => {
    if (!currentHost || !currentSettings || !currentSettings.enabled) return;
    const whitelist = Array.isArray(currentSettings.whitelist)
      ? [...currentSettings.whitelist]
      : [];
    const hostLower = normalizeHost(currentHost);
    const index = whitelist.findIndex(
      (entry) => normalizeHost(entry) === hostLower
    );
    if (index >= 0) {
      whitelist.splice(index, 1);
    } else {
      whitelist.push(currentHost);
    }
    siteToggleBtn.disabled = true;
    chrome.runtime.sendMessage(
      {
        type: "setSettings",
        payload: { whitelist }
      },
      (updated) => {
        currentSettings = updated;
        refreshSiteSection();
      }
    );
  });

  loadActiveHost();
});
