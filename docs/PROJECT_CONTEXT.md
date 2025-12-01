# Project Context – Long-Term Memory (LTM)

> High-level design, tech decisions, constraints for this project.  
> This is the **source of truth** for agents and humans.

<!-- SUMMARY_START -->
**Summary (auto-maintained by Agent):**

**CookieSentinel** - A Chrome MV3 extension that blocks marketing and tracking cookies.

**Architecture:**
- declarativeNetRequest rules block known tracker domains (doubleclick, GA, GTM, Facebook pixel)
- Background service worker monitors cookies.onChanged and removes marketing cookies in real-time
- Multi-layered detection: known trackers list, custom user domains, name-based heuristics (_ga, _fbp, etc.)
- Periodic cleanup via alarms API (hourly scan)
- Chrome sync storage for settings and stats

**UI Components:**
- Popup: toggle protection, manual "Clean now" button, blocked cookie stats
- Options page: whitelist management, custom tracker domains

**Current Status:** v1.0 complete - all core components implemented and ready for local testing
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

- `2025-12-01` – Completed v1.0 implementation: manifest, background service worker, DNR rules, popup/options UI, and icon assets
- `2025-12-01` – Created automated icon generation script using PowerShell + .NET System.Drawing
- `2025-12-01` – Confirmed Chrome MV3 architecture with dual-strategy blocking (DNR + cookies API)
