# Generate placeholder icons for CookieSentinel extension
# This script creates simple colored placeholder PNG icons using .NET

Add-Type -AssemblyName System.Drawing

$sizes = @(16, 32, 48, 128)
$iconDir = Split-Path -Parent $MyInvocation.MyCommand.Path

foreach ($size in $sizes) {
    $filename = Join-Path $iconDir "icon$size.png"

    # Create bitmap
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

    # Fill background with a gradient blue (cookie blocker theme)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.Point]::new(0, 0),
        [System.Drawing.Point]::new($size, $size),
        [System.Drawing.Color]::FromArgb(66, 133, 244),  # Google Blue
        [System.Drawing.Color]::FromArgb(52, 168, 83)    # Green
    )
    $graphics.FillRectangle($brush, 0, 0, $size, $size)

    # Draw a simple "C" or shield shape (simplified circle for placeholder)
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [Math]::Max(1, $size / 16))
    $margin = [Math]::Max(2, $size / 8)
    $graphics.DrawEllipse($pen, $margin, $margin, $size - (2 * $margin), $size - (2 * $margin))

    # Draw a diagonal line (block/slash symbol)
    $pen2 = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [Math]::Max(2, $size / 12))
    $graphics.DrawLine($pen2, $margin, $size - $margin, $size - $margin, $margin)

    # Save
    $bitmap.Save($filename, [System.Drawing.Imaging.ImageFormat]::Png)

    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    $brush.Dispose()
    $pen.Dispose()
    $pen2.Dispose()

    Write-Host "Created $filename ($size x $size)" -ForegroundColor Green
}

Write-Host ""
Write-Host "All placeholder icons generated successfully!" -ForegroundColor Cyan
Write-Host "Replace these with professionally designed icons before publishing." -ForegroundColor Yellow
