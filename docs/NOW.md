# NOW - Working Memory (WM)

> This file captures the **current focus / sprint**.  
> It should always describe what we're doing *right now*.

<!-- SUMMARY_START -->
**Current Focus (auto-maintained by Agent):**
- Finish the cross-browser testing matrix + evidence (cookies + ads + CMP rejection)
- Validate auto-reject consent flow and per-site whitelist controls in the popup
- Harden ad-blocking rules and document the results
- Design professional icons to replace placeholders
- Prepare Chrome Web Store listing materials
<!-- SUMMARY_END -->

---

## Current Objective

**Phase 1: COMPLETE ✓**
All core extension components delivered:
- manifest.json ✓
- background.js (service worker) ✓
- ruleset_1.json (static DNR rules for well-known trackers) ✓
- popup.html / popup.js (quick controls & stats) ✓
- options.html / options.js (whitelist, custom trackers) ✓
- icons/ (placeholder 16/32/48/128 icons) ✓

**Phase 2: Testing & Refinement (NEXT)**
- [x] Load extension in Chrome and validate functionality (smoke pass on tracker-heavy sites looks good)
- [x] Load extension in Firefox build and verify cookie blocking parity
- Test on real-world tracking scenarios (finish top 10 target site matrix)
- Gather initial feedback and fix bugs

**Phase 3: Ad Blocking Iteration (PLANNED)**
- Expand detection to cover high-volume ad networks (DoubleClick, Taboola, Outbrain, etc.)
- Introduce optional “Ad Shield” toggle in the popup so users can enable/disable ad blocking
- Validate that ad blocking does not break core site functionality or essential cookies
- Update documentation and Web Store copy to reflect the broader protection scope

---

## Active Branch

- `main`

---

## What We Are Working On Right Now

**Immediate Next Steps:**
1. Finish the testing matrix for both browsers (cookies + ads + CMP auto-reject) and log evidence in docs/TESTING_REPORT.md
2. Capture popup screenshots, logs, and blocked-cookie stats for the matrix sites
3. Verify stats tracking, Clean now, and the updated per-site whitelist toggle across Chrome/Firefox
4. Exercise whitelist/custom tracker flows plus the new auto-reject script to confirm no regressions
5. Prep draft assets (icons, store copy outline) so marketing deliverables can start immediately after testing

**Backlog:**
- Expand ruleset_1.json to 15-20 major trackers (hotjar, mixpanel, segment, etc.)
- Design professional icons (cookie + shield motif)
- Create Chrome Web Store screenshots
- Write store description and privacy policy
- Draft implementation + QA plan for the ad-blocking iteration
- Build installation + testing guide for end users

---

## Next Small Deliverables

- Testing report (docs/TESTING_REPORT.md) capturing cookie blocking effectiveness on top 10 websites
- Expanded tracker list (ruleset_1.json) with 15-20 domains
- Professional icon set (128x128 source + all sizes)
- Chrome Web Store listing assets (screenshots, description, privacy policy)
- Installation and testing guide for end users
- Outline + estimation for the ad blocking iteration (scope, rules, QA plan)
- Stats + screenshot pack documenting the successful cookie blocking pass and remaining gaps

---

## Notes / Scratchpad

- Extension is feature-complete for v1.0 local testing
- Placeholder icons functional but need professional design
- Consider adding browser notification on bulk cleanup in future version
- Potential future features: import/export settings, statistics dashboard
