(() => {
  const AUTO_TAG = "data-cookiesentinel-auto-rejected";
  const MAX_OBS_MS = 30000;
  const SCAN_INTERVAL_MS = 1500;

  const CMP_BUTTON_SELECTORS = [
    "button#onetrust-reject-all-handler",
    "button#onetrust-reject-all",
    "button.ot-pc-refuse-all-handler",
    "button.ot-pc-refuse-all",
    ".ot-sdk-container button[aria-label*='Reject']",
    ".cmpboxbtnsecondary",
    ".cmp-button_reject",
    "button[value='reject']",
    "button[value='REJECT']",
    "button[data-testid*='reject']",
    "button[mode='reject']",
    "button[id*='rejectAll']",
    "button[class*='reject-all']",
    "button[class*='decline-all']",
    ".qc-cmp2-summary-buttons button[mode='secondary']",
    "button#qcCmpButtons button#qcRejectAll",
    "button[data-qa='deny-button']",
    "button[data-testid='declineButton']",
    "button[data-action='reject']",
    "button[data-test='uc-accept-reject-buttons__reject-button']"
  ];

  const TEXT_MATCHES = [
    "reject all",
    "reject",
    "reject cookies",
    "decline",
    "decline all",
    "deny",
    "deny all",
    "refuse",
    "refuse all",
    "do not accept",
    "use necessary cookies",
    "continue without accepting"
  ];

  function isVisible(el) {
    if (!el || el.disabled) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    const style = window.getComputedStyle(el);
    return style.visibility !== "hidden" && style.display !== "none";
  }

  function clickButton(btn, reason) {
    if (!btn || btn.hasAttribute(AUTO_TAG)) return false;
    if (!isVisible(btn)) return false;
    btn.setAttribute(AUTO_TAG, "true");
    btn.click();
    if (typeof console !== "undefined") {
      console.info("[CookieSentinel] Auto-rejected cookies via", reason);
    }
    return true;
  }

  function scanBySelectors() {
    for (const selector of CMP_BUTTON_SELECTORS) {
      const btn = document.querySelector(selector);
      if (btn && clickButton(btn, selector)) {
        return true;
      }
    }
    return false;
  }

  function scanByText() {
    const candidates = Array.from(document.querySelectorAll("button, a, span, div[role='button'], input[type='button']"));
    for (const el of candidates) {
      const text = (el.innerText || el.value || "").trim().toLowerCase();
      if (!text) continue;
      if (TEXT_MATCHES.some(match => text === match || text.includes(match))) {
        if (clickButton(el, `text:${text}`)) {
          return true;
        }
      }
    }
    return false;
  }

  function runAutoReject() {
    return scanBySelectors() || scanByText();
  }

  function startObservers() {
    const attempt = () => runAutoReject();
    attempt();

    const intervalId = setInterval(() => {
      if (attempt()) {
        clearInterval(intervalId);
        observer.disconnect();
      }
    }, SCAN_INTERVAL_MS);

    const observer = new MutationObserver(() => {
      if (attempt()) {
        clearInterval(intervalId);
        observer.disconnect();
      }
    });

    observer.observe(document.documentElement || document.body, { childList: true, subtree: true });

    setTimeout(() => {
      clearInterval(intervalId);
      observer.disconnect();
    }, MAX_OBS_MS);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    startObservers();
  } else {
    window.addEventListener("DOMContentLoaded", startObservers, { once: true });
  }
})();
