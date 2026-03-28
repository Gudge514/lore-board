Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Create bitmap and graphics objects
$bmp = New-Object System.Drawing.Bitmap([System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Width, [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Height)
$gfx = [System.Drawing.Graphics]::FromImage($bmp)

# Capture screen
$gfx.CopyFromScreen([System.Drawing.Point]::Empty, [System.Drawing.Point]::Empty, [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Size)

# Save to file
$outputPath = "D:/openclaw-workspace/projects/lore-board/loreboard-screenshot.png"
$bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Cleanup
$bmp.Dispose()
$gfx.Dispose()

Write-Host "Screenshot saved to $outputPath"
