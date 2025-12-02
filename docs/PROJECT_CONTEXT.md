# Project Context – Long-Term Memory (LTM)

> High-level design, tech decisions, constraints for this project.  
> This is the **source of truth** for agents and humans.

<!-- SUMMARY_START -->
**Summary (auto-maintained by Agent):**

**CookieSentinel** - A Chrome MV3 / firefox MV2 extension that blocks marketing/tracking cookies, auto-rejects CMP prompts, and now ships baseline ad blocking.

**Architecture:**
- declarativeNetRequest rules + ads_rules block tracker/ad domains (DoubleClick, Taboola, Outbrain, /ads paths)
- Background service worker monitors cookies.onChanged, removes marketing cookies in real-time, and updates stats
- Multi-layered detection: CookieDatabase-driven tracker list, custom user domains, name-based heuristics (_ga, _fbp, etc.)
- CMP auto-reject content script clicks "Reject all" prompts (OneTrust, Quantcast, TrustArc, etc.)
- Periodic cleanup via alarms API (hourly scan) with Chrome sync storage for settings + stats

**UI Components:**
- Popup: global toggle, per-site whitelist toggle/status, manual "Clean now" button, blocked cookie stats
- Options page: whitelist management, custom tracker domains

**Current Status:** v1.0 complete - cross-browser cookie blocking, CMP auto-reject, and baseline ad blocking implemented; test matrix + evidence capture underway
<!-- SUMMARY_END -->

---

## 1. Project Overview

- **Name:** Project Bravo
- **Owner:** Mix
- **Purpose:** Create a web extention that blocks marketing and web tracking cookies (add blocker).
- **Primary Stack:** Git + Markdown docs, VS Code editor, PowerShell helper scripts (no backend).
- **Target Platforms:** Local developer environments (VS Code on desktop).

---

## 2. Core Design Pillars

- Keep project memory transparent and versioned via Markdown in Git.
- Maintain an editor-native workflow (VS Code + PowerShell) without external services.
- Provide a reusable template that agents and humans can adopt quickly.

---

## 3. Technical Decisions & Constraints

**Extension:**
- Language: JavaScript (ES modules)
- Platform: Chrome Manifest V3
- APIs: declarativeNetRequest, cookies, storage.sync, alarms
- Storage: Chrome sync storage (no external backend)
- Permissions: cookies, declarativeNetRequest, storage, <all_urls>

**Project Workflow:**
- Documentation: Markdown in Git
- Scripts: PowerShell for session management and icon generation
- Editor: VS Code with integrated tasks
- Hosting / deployment: Chrome Web Store (future), runs locally in browser
- Non-negotiable constraints:
  - Extension must remain privacy-first (no external network calls)
  - Project workflow stays editor-native and backend-free
  - Documentation stays in plain Markdown for easy review

---

## 4. Architecture Snapshot

- Docs folder holds long-term (PROJECT_CONTEXT), working-memory (NOW), and session logs (SESSION_NOTES).
- Scripts (e.g., session-helper.ps1) guide agents through start/end rituals.
- VS Code tasks integrate with these scripts so humans/agents share the same workflow.

---

## 5. Links & Related Docs

- Roadmap: TBD
- Design docs: docs/MCP_LOCAL_DESIGN.md, docs/AGENT_SESSION_PROTOCOL.md
- Specs: docs/Repo_Structure.md
- Product / UX docs: docs/PROJECT_CONTEXT.md, docs/NOW.md

---

## 6. Change Log (High-Level Decisions)

Use this section for **big decisions** only:

- `2025-12-01` - Completed v1.0 implementation: manifest, background service worker, DNR rules, popup/options UI, and icon assets
- `2025-12-01` - Created automated icon generation script using PowerShell + .NET System.Drawing
- `2025-12-01` - Confirmed Chrome MV3 architecture with dual-strategy blocking (DNR + cookies API)
- `2025-12-02` - Integrated CookieDatabase-sourced tracker data workflow (scripted ingestion + expanded ruleset)
- `2025-12-02` - Added CMP auto-reject content scripts, Chrome ads_rules + Firefox webRequest ad blocking, and per-site whitelist controls in the popup
