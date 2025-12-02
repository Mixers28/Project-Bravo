# Tracker Data Workflow

CookieSentinel now sources its domain + cookie heuristics from [CookieDatabase.org](https://cookiedatabase.org/). This doc describes how to refresh the data and wire it into both the Chrome MV3 and Firefox MV2 bundles.

## Files

- `data/tracker-data.json` — canonical JSON snapshot (domains + cookie names + metadata).
- `chrome/tracker-data.json` — copy that ships inside the Chrome extension (loaded via ES module import).
- `firefox/tracker-data.json` — copy that ships inside the Firefox extension (fetched at runtime).
- `chrome/ruleset_1.json` — declarativeNetRequest rules auto-generated from the top N tracker domains.
- `scripts/update-tracker-data.ps1` — helper to convert CookieDatabase exports into the JSON + ruleset files.

## Refresh Steps

1. Download the latest CSV export from CookieDatabase (Filters → Category: Marketing + Tracking). Save it somewhere inside the repo (e.g., `exports/cookiedatabase-YYYYMMDD.csv`).
2. Run:
   ```powershell
   pwsh ./scripts/update-tracker-data.ps1 `
     -CsvPath exports/cookiedatabase-YYYYMMDD.csv `
     -VerboseOutput
   ```
3. Verify the diff:
   - `data/tracker-data.json`, `chrome/tracker-data.json`, `firefox/tracker-data.json` updated with new counts + metadata.
   - `chrome/ruleset_1.json` regenerated with the top `MaxDomainsForRules` entries (defaults to 50).
4. Reload the extension(s) in Chrome/Firefox and re-run the smoke tests.

## How the Data Is Used

- **Chrome**: `background.js` imports `tracker-data.json` as a module. Whenever a cookie’s domain or name matches the data, it is deleted immediately and the stats counters are updated. The same domain list feeds `ruleset_1.json` so network requests to those trackers are blocked before cookies land.
- **Firefox**: the MV2 background script fetches `tracker-data.json` on startup and falls back to a baked-in list if fetching fails. Matching cookies are removed automatically, mirroring Chrome’s behavior.
- **Customization**: users can still add whitelist entries or additional custom trackers via the Options UI; the new data simply broadens the default coverage.

## Tips

- If the CookieDatabase CSV uses different column headers, pass `-CookieNameColumn`, `-DomainColumn`, or `-CategoryColumn` to the script.
- Use `-MaxDomainsForRules` to keep the static DNR rules within Chrome’s limits if the dataset grows dramatically.
- To keep Git history readable, commit the CSV export separately (or add your exports folder to `.gitignore`).
