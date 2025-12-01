# CookieSentinel Icons

This folder contains the extension icons in multiple sizes.

## Required Icons

- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon32.png` - 32x32 pixels (Windows taskbar)
- `icon48.png` - 48x48 pixels (extensions page)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Generating Icons

### Option 1: Use the PowerShell script
Run the icon generation script:
```powershell
.\icons\generate-icons.ps1
```

### Option 2: Create manually
1. Design your icon (suggested: shield or cookie with a slash)
2. Export at 128x128 pixels as PNG
3. Resize to create the smaller versions

### Option 3: Use online tools
- Use a favicon generator like https://favicon.io/
- Upload a 128x128 PNG and it will generate all sizes

## Design Guidelines

- Use a simple, recognizable symbol (e.g., cookie with shield or slash)
- Ensure good contrast for both light and dark themes
- Keep it simple - details get lost at 16x16
- Use the brand colors if defined
