Add-Type -AssemblyName System.Drawing

function Convert-PngToIco($pngPath, $icoPath) {
    $sizes = @(16, 32, 48, 64, 128, 256)
    $images = @()
    $src = [System.Drawing.Bitmap]::FromFile($pngPath)

    $ms = New-Object System.IO.MemoryStream
    $bw = New-Object System.IO.BinaryWriter($ms)

    # ICONDIR header: Reserved (2 bytes), Type (1 for icon, 2 bytes), ImageCount (2 bytes)
    $bw.Write([uint16]0)
    $bw.Write([uint16]1)
    $bw.Write([uint16]$sizes.Count)

    # Offset of image data starts after header (6) + entries (16 * count)
    $offset = 6 + (16 * $sizes.Count)

    $encodedImages = @()
    foreach ($sz in $sizes) {
        $resized = New-Object System.Drawing.Bitmap($sz, $sz)
        $g = [System.Drawing.Graphics]::FromImage($resized)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.DrawImage($src, 0, 0, $sz, $sz)
        $g.Dispose()

        $imgMs = New-Object System.IO.MemoryStream
        $resized.Save($imgMs, [System.Drawing.Imaging.ImageFormat]::Png)
        $bytes = $imgMs.ToArray()
        $resized.Dispose()
        $imgMs.Dispose()

        $encodedImages += ,@($sz, $bytes)
    }

    # Write ICONDIRENTRY for each image
    foreach ($item in $encodedImages) {
        $sz = $item[0]
        $bytes = $item[1]

        $bWidth = if ($sz -ge 256) { [byte]0 } else { [byte]$sz }
        $bHeight = if ($sz -ge 256) { [byte]0 } else { [byte]$sz }

        $bw.Write($bWidth)           # Width
        $bw.Write($bHeight)          # Height
        $bw.Write([byte]0)           # Color count
        $bw.Write([byte]0)           # Reserved
        $bw.Write([uint16]1)         # Color planes
        $bw.Write([uint16]32)        # Bits per pixel
        $bw.Write([uint32]$bytes.Length) # Image data size
        $bw.Write([uint32]$offset)       # Image data offset

        $offset += $bytes.Length
    }

    # Write raw PNG bytes for each image entry
    foreach ($item in $encodedImages) {
        $bytes = $item[1]
        $bw.Write($bytes)
    }

    $bw.Flush()
    [System.IO.File]::WriteAllBytes($icoPath, $ms.ToArray())

    $bw.Close()
    $ms.Close()
    $src.Dispose()
    Write-Host "Multi-resolution ICO created at $icoPath ($($sizes.Count) sizes embedded)!"
}

Convert-PngToIco "build/icon.png" "build/icon.ico"
Convert-PngToIco "build/icon.png" "public/favicon.ico"
