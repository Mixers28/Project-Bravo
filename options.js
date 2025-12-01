// options.js

function parseLines(text) {
  return text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);
}

function joinLines(arr) {
  return (arr || []).join("\n");
}

document.addEventListener("DOMContentLoaded", () => {
  const whitelistEl = document.getElementById("whitelist");
  const customTrackersEl = document.getElementById("customTrackers");
  const saveBtn = document.getElementById("saveBtn");
  const statusEl = document.getElementById("status");

  chrome.runtime.sendMessage({ type: "getSettings" }, (settings) => {
    whitelistEl.value = joinLines(settings.whitelist);
    customTrackersEl.value = joinLines(settings.customTrackers);
  });

  saveBtn.addEventListener("click", () => {
    const whitelist = parseLines(whitelistEl.value);
    const customTrackers = parseLines(customTrackersEl.value);

    chrome.runtime.sendMessage({
      type: "setSettings",
      payload: { whitelist, customTrackers }
    }, () => {
      statusEl.textContent = "Saved!";
      setTimeout(() => statusEl.textContent = "", 2000);
    });
  });
});
