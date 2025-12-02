# CookieSentinel – Test Plan

This test plan describes expected behavior for CookieSentinel in both Chrome and Firefox.

## 1. Global behavior

1.1. Global protection ON
- When `enabled === true` in settings:
  - Marketing/tracking cookies matching known domains or names should be deleted.
  - Ad requests to known ad domains should be blocked (where implemented).

1.2. Global protection OFF
- When `enabled === false`:
  - No cookies should be deleted by the extension.
  - Ad blocking MAY still occur if implemented at the network level (if we decide it should be tied to `enabled`, then it must also stop).

## 2. Cookie behavior

2.1. Known tracking domains
- Cookies from domains like:
  - doubleclick.net
  - googletagmanager.com
  - google-analytics.com
- Should be treated as marketing cookies and removed (unless whitelisted).

2.2. Name-based tracking cookies
- Cookie names starting with:
  - "_ga", "_gid", "_fbp"
  - "ajs_anonymous_id", "ajs_user_id"
  - "_hj", "hubspotutk", "mkto_", "optimizely"
- Should be treated as marketing cookies and removed (unless whitelisted).

2.3. Whitelist behavior
- If `whitelist` contains "example.com":
  - Any cookie from example.com or subdomains should be left intact, even if it would normally be considered marketing.
- The popup per-site toggle must:
  - Add/remove the current hostname from the `whitelist` array.
  - Immediately affect cookie deletion behavior for that site.

2.4. Stats updates
- When a cookie is deleted:
  - `stats.blockedCookies` must increase by 1.
- After a `cleanAllMarketingCookies()` run:
  - `stats.lastClean` must be set to an ISO date string.

## 3. Ad-blocking behavior

3.1. Known ad domains (basic)
- Requests to domains such as:
  - doubleclick.net
  - googlesyndication.com
  - adservice.google.com
  - ads.yahoo.com
  - ads.twitter.com
- Should be blocked at the network layer:
  - Chrome: via DNR rules (ads_rules.json).
  - Firefox: via webRequest.onBeforeRequest + blocking.

3.2. URL-based heuristics
- Any URL where the path/search matches a generic `/ads?...` pattern may be blocked as an ad request, as long as it does not obviously break core functionality.

## 4. Popup and options

4.1. Popup
- Shows:
  - Global protection toggle (enabled)
  - Current site name
  - Site status ("Protected" vs "Allowed (whitelisted)" vs "Global protection OFF")
  - Per-site toggle button:
    - Adds/removes hostname from whitelist.
  - Stats:
    - Blocked cookies count
    - Last clean timestamp
  - Button:
    - "Clean marketing cookies now"

4.2. Options
- `whitelist` is editable as 1 hostname per line.
- `customTrackers` is editable as 1 domain substring per line.
- On save:
  - Settings are persisted in storage and used by background.js during cookie evaluation.

## 5. Manual browser checks (human tester)

For Chrome and Firefox:

- Load extension (unpacked in Chrome, temporary add-on in Firefox).
- On a test site (e.g., https://example.com):
  - Manually set cookies in console (e.g. `_ga`, `_fbp`).
  - Confirm they are deleted/retained according to:
    - Global protection toggle
    - Whitelist status
- On an ad-heavy site:
  - Check DevTools → Network.
  - Confirm requests to known ad domains are blocked.
