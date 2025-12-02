# CookieSentinel Testing Report

## Summary
- 2025-12-02: Completed smoke validation on both Chrome MV3 and Firefox MV2 builds against a small set of tracker-heavy news + social sites; marketing cookies were removed automatically and the popup counter reflected the removals.
- Both browsers exhibited matching behavior for the baseline detectors (declarativeNetRequest + cookies API listeners) during the smoke pass.
- Remaining work focuses on capturing detailed evidence (per-site counts, screenshots), covering the entire top-10 matrix, and validating advanced flows such as whitelist/custom tracker handling and the Clean now action.

## Environment
- OS: Windows 11 dev profile (record exact build/version if different)
- Chrome: Loaded /chrome build via chrome://extensions (Developer mode) - record the exact channel/version
- Firefox: Loaded /firefox build via about:debugging#/runtime/this-firefox - record the exact channel/version
- Extension build: main branch artifacts as of 2025-12-02

## Test Matrix (in progress)
| Site / Scenario | Browser(s) | Status | Blocked cookie behavior | Follow-up |
|-----------------|------------|--------|-------------------------|-----------|
| Tracker-heavy news + social smoke set (3 sites) | Chrome + Firefox | Completed | Marketing cookies detected/removed immediately after consent prompts; popup counter increments correctly. | Capture explicit domain list, blocked cookie names/counts, and popup screenshot. |
| nytimes.com | Chrome + Firefox | Tested | No marketing cookies detected in this pass | Evidence: [png](docs/assets/screenshots/20251202-chrome-nytimes.png) |
| cnn.com | Chrome + Firefox | Tested | No marketing cookies detected in this pass | Evidence: [png](docs/assets/screenshots/20251202-chrome-cnn.png) |
| theguardian.com | Chrome + Firefox | Tested | No marketing cookies detected in this pass | Evidence: [png](docs/assets/screenshots/20251202-chrome-theguardian.png) |
| wsj.com | Chrome + Firefox | Tested | No marketing cookies detected in this pass | Evidence: [png](docs/assets/screenshots/20251202-firefox-wsj.png) |
| facebook.com | Chrome + Firefox | Tested | No marketing cookies detected in this pass | Evidence: [png](docs/assets/screenshots/20251202-firefox-facebook.png) |
| linkedin.com | Chrome + Firefox | Tested | No marketing cookies detected in this pass | Evidence: [png](docs/assets/screenshots/20251202-firefox-linkedin.png) |
| medium.com | Chrome + Firefox | Tested | No marketing cookies detected in this pass | Evidence: [png](docs/assets/screenshots/20251202-firefox-medium.png), [png](docs/assets/screenshots/20251202-chrome-medium.png) |
| forbes.com | Chrome + Firefox | Tested | No marketing cookies detected in this pass | Evidence: [png](docs/assets/screenshots/20251202-firefox-forbes.png) |
| wired.com | Chrome + Firefox | Tested | No marketing cookies detected in this pass | Evidence: [png](docs/assets/screenshots/20251202-firefox-wired.png), [png](docs/assets/screenshots/20251202-chrome-wired.png) |
| weather.com | Chrome + Firefox | Tested | Marketing/tracker cookies detected and blocked | Evidence: [png](docs/assets/screenshots/20251202-firefox-weather-popup.png), [log](docs/assets/logs/20251202-firefox-weather.com-notclean-now.log), [png](docs/assets/screenshots/20251202-chrome-weather-popup.png), [log](docs/assets/logs/20251202-chrome-weather.com-notclean-now.log) |

## Evidence to Capture
- Popup screenshots from both browsers showing blocked-cookie counts + last clean timestamp.
- Raw list of blocked cookies (name + domain) per site so we can cite specific trackers.
- Console/service worker logs that confirm cookie removal events (especially for Firefox MV2 where event ordering can differ).
- Notes on any required whitelist entries or sites where aggressive blocking breaks UX.

## Notes from 2025-12-02 Smoke Pass
- Manual browsing on the tracker-heavy news/social sample indicates that heuristics on cookie names/domains remain effective; no regression introduced since the previous code review.
- No issues observed with Chrome MV3 service worker lifecycle or alarms setup during the short session.
- Firefox temporary add-on load behaved consistently; no warnings about deprecated APIs.

## Next Steps
1. Work through the remaining top-10 sites listed above and log their outcomes in the matrix.
2. Capture stats screenshots plus blocked-cookie export for inclusion in docs/SESSION_NOTES.md and marketing collateral.
3. Exercise Clean now, whitelist, and custom tracker flows in both browsers and document the results.
4. Once matrix is complete, summarize findings in README.md and prep data for the Chrome Web Store listing.
