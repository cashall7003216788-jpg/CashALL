Add-Type -AssemblyName System.Drawing
$srcPath = "c:\Users\DELL\OneDrive\Desktop\CashALL\public\photos\CashALL_favicon.png"
$src = [System.Drawing.Image]::FromFile($srcPath)

$sizes = @(48, 96, 180, 192, 512)
foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($src, 0, 0, $size, $size)
    
    $filename = if ($size -eq 180) { "apple-touch-icon.png" } else { "favicon-${size}x${size}.png" }
    $outPath = "c:\Users\DELL\OneDrive\Desktop\CashALL\public\${filename}"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $bmp.Dispose()
    $g.Dispose()
    Write-Host "Generated: $filename"
}

$src.Dispose()
