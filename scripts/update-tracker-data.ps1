<#
.SYNOPSIS
  Generate tracker domain + cookie name lists from CookieDatabase exports and propagate them to both extension bundles.

.DESCRIPTION
  1. Accepts a CookieDatabase CSV export (https://cookiedatabase.org/ -> Export -> CSV).
  2. Filters rows that match the supplied Category/Type filters (defaults: Marketing/Tracking).
  3. Writes a canonical tracker-data JSON file under /data.
  4. Copies the JSON into /chrome and /firefox so the extensions can import it.
  5. Updates chrome/ruleset_1.json with the top N tracker domains as declarativeNetRequest block rules.

.PARAMETER CsvPath
  Path to the CookieDatabase CSV export. Optional if you just want to re-use the current /data/tracker-data.json.

.PARAMETER ExistingDataPath
  Fallback tracker-data JSON (defaults to data/tracker-data.json). Used if CsvPath is omitted.

.PARAMETER OutputDataPath
  Where to write the canonical tracker data JSON (defaults to data/tracker-data.json).

.PARAMETER ChromeTrackerPath
  Path to the tracker JSON that ships inside the Chrome MV3 build.

.PARAMETER FirefoxTrackerPath
  Path to the tracker JSON that ships inside the Firefox MV2 build.

.PARAMETER RulesetPath
  Chrome declarativeNetRequest ruleset to regenerate from the tracker domain list.

.PARAMETER CategoryColumn / IncludeCategories
  Which CSV column contains the category/type string and which values indicate marketing/tracking cookies.

.PARAMETER CookieNameColumn / DomainColumn
  Column names for the cookie name and provider/domain fields inside the CSV.

.PARAMETER MaxDomainsForRules
  Only the first N domains will be emitted into ruleset_1.json to keep the static ruleset manageable.

.EXAMPLE
  ./scripts/update-tracker-data.ps1 -CsvPath exports/cookiedatabase.csv
#>

[CmdletBinding()]
param(
  [string]$CsvPath,
  [string]$ExistingDataPath = "data/tracker-data.json",
  [string]$OutputDataPath = "data/tracker-data.json",
  [string]$ChromeTrackerPath = "Chrome/tracker-data.json",
  [string]$FirefoxTrackerPath = "firefox/tracker-data.json",
  [string]$RulesetPath = "Chrome/ruleset_1.json",
  [string]$CookieNameColumn = "Cookie / Name",
  [string]$DomainColumn = "Domain",
  [string]$CategoryColumn = "Category",
  [string[]]$IncludeCategories = @("Marketing", "Tracking"),
  [int]$MaxDomainsForRules = 50,
  [switch]$VerboseOutput
)

function Write-Info($message) {
  if ($VerboseOutput) {
    Write-Host "[tracker-data] $message"
  }
}

if (-not $CsvPath -and -not (Test-Path $ExistingDataPath)) {
  throw "Neither CsvPath nor ExistingDataPath exists. Provide at least one source."
}

$trackerData = $null

if ($CsvPath) {
  if (-not (Test-Path $CsvPath)) {
    throw "CsvPath '$CsvPath' not found."
  }

  Write-Info "Importing CSV: $CsvPath"
  $rows = Import-Csv -Path $CsvPath

  if ($CategoryColumn -and $IncludeCategories.Count -gt 0) {
    $rows = $rows | Where-Object {
      $value = $_.$CategoryColumn
      if (-not $value) { return $false }
      $IncludeCategories | ForEach-Object { if ($value -match $_) { return $true } }
      return $false
    }
  }

  $domains = $rows |
    ForEach-Object { $_.$DomainColumn } |
    Where-Object { $_ } |
    ForEach-Object { $_.Trim().ToLower() } |
    Where-Object { $_ -ne "" } |
    Sort-Object -Unique

  $cookieNames = $rows |
    ForEach-Object { $_.$CookieNameColumn } |
    Where-Object { $_ } |
    ForEach-Object { $_.Trim() } |
    Where-Object { $_ -ne "" } |
    Sort-Object -Unique

  $trackerData = [ordered]@{
    generatedAt = (Get-Date).ToString("o")
    source = "CookieDatabase export: $(Split-Path -Path $CsvPath -Leaf)"
    domains = $domains
    cookieNames = $cookieNames
  }
} else {
  Write-Info "Loading tracker data from $ExistingDataPath"
  $trackerData = Get-Content -Raw -Encoding utf8 -Path $ExistingDataPath | ConvertFrom-Json
  if (-not $trackerData.domains -or -not $trackerData.cookieNames) {
    throw "Existing tracker data is missing domains or cookieNames arrays."
  }
}

Write-Info "Writing canonical tracker data to $OutputDataPath"
$trackerData | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 -Path $OutputDataPath

foreach ($dest in @($ChromeTrackerPath, $FirefoxTrackerPath)) {
  Write-Info "Copying tracker data to $dest"
  $trackerData | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 -Path $dest
}

if ($RulesetPath) {
  $resourceTypes = @("xmlhttprequest", "sub_frame", "script", "image")
  $rules = @()
  $ruleId = 1

  $trackerData.domains |
    Where-Object { $_ } |
    Select-Object -First $MaxDomainsForRules |
    ForEach-Object {
      $domain = $_
      $rules += [ordered]@{
        id        = $ruleId++
        priority  = 1
        action    = @{ type = "block" }
        condition = @{
          urlFilter     = $domain
          resourceTypes = $resourceTypes
        }
      }
    }

  Write-Info "Updating $RulesetPath with $($rules.Count) rules"
  $rules | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 -Path $RulesetPath
}

Write-Host "Tracker data refresh complete. Domains: $($trackerData.domains.Count), cookie names: $($trackerData.cookieNames.Count)."
