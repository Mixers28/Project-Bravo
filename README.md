# CookieSentinel – Marketing Cookie Blocker

CookieSentinel is a browser extension for Chrome/Edge and Firefox that automatically blocks **marketing and tracking cookies**.

It uses:
- Heuristics on cookie **domain** (known tracker domains)
- Heuristics on cookie **name** (`_ga`, `_gid`, `_fbp`, etc.)
- A user-configurable **whitelist** and **custom tracker list**
- Optional periodic clean-up of existing tracking cookies

---

## Features

- ✅ **Automatic blocking** of common tracking/marketing cookies  
- ✅ **Per-site control** from the popup (quick whitelist toggle)  
- ✅ **Global on/off switch**  
- ✅ **Blocked cookie stats** and last-clean timestamp  
- ✅ **Chrome / Edge (Manifest V3)** support  
- ✅ **Firefox (Manifest V2)** support

> Note: This extension is focused on **marketing/tracking cookies**, not all cookies. Functional/session cookies are generally left alone.

---

## Repository structure

```text
.
├── README.md
├── .gitignore
├── LICENSE              (optional)
├── chrome/              # Chrome/Edge MV3 extension
│   ├── manifest.json
│   ├── background.js
│   ├── ruleset_1.json
│   ├── popup.html
│   ├── popup.js
│   ├── options.html
│   ├── options.js
│   └── icons/
│       ├── icon16.png
│       ├── icon32.png
│       ├── icon48.png
│       └── icon128.png
└── firefox/             # Firefox MV2 extension
    ├── manifest.json
    ├── background.js
    ├── popup.html
    ├── popup.js
    ├── options.html
    ├── options.js
    └── icons/
        ├── icon16.png
        ├── icon32.png
        ├── icon48.png
        └── icon128.png
