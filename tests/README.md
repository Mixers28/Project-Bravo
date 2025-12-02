# CookieSentinel – Test Suite

This folder defines the **manual + simulated test suite** for CookieSentinel.

The tests are intended to be used by:

- Human testers (manual browser checks)
- The Reviewer/Tester Agent (static + simulated evaluation)

---

## Files

- `test-plan.md`  
  High-level checklist for extension behavior in Chrome and Firefox.

- `scenarios_cookies.json`  
  Structured scenarios for cookie evaluation (should a cookie be deleted or not?).

- `scenarios_ads.json`  
  Structured scenarios for ad request evaluation (should a request be blocked or allowed?).

---

## How the Reviewer/Tester Agent uses this

1. Read `test-plan.md` to understand expected behavior.
2. Load `scenarios_cookies.json` and apply the current cookie logic from background.js.
3. Load `scenarios_ads.json` and apply current ad-blocking logic (DNR or webRequest).
4. Produce a report that lists:
   - Scenario ID
   - Expected outcome
   - Actual outcome according to current code
   - PASS/FAIL status
5. If a scenario fails, the agent should point to the code that needs adjustment.
