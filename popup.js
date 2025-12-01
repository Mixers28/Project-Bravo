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

  chrome.runtime.sendMessage({ type: "getSettings" }, (settings) => {
    enabledToggle.checked = settings.enabled;
    blockedCountEl.textContent = settings.stats.blockedCookies || 0;
    lastCleanEl.textContent = formatDate(settings.stats.lastClean);
  });

  enabledToggle.addEventListener("change", () => {
    chrome.runtime.sendMessage({
      type: "setSettings",
      payload: { enabled: enabledToggle.checked }
    });
  });

  cleanNowBtn.addEventListener("click", () => {
    cleanNowBtn.disabled = true;
    cleanNowBtn.textContent = "Cleaning…";
    chrome.runtime.sendMessage({ type: "cleanNow" }, () => {
      chrome.runtime.sendMessage({ type: "getSettings" }, (settings) => {
        blockedCountEl.textContent = settings.stats.blockedCookies || 0;
        lastCleanEl.textContent = formatDate(settings.stats.lastClean);
        cleanNowBtn.disabled = false;
        cleanNowBtn.textContent = "Clean marketing cookies now";
      });
    });
  });

  optionsLink.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
});
