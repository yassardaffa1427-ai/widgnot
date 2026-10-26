try {
    # 1. Try Windows GSMTC (Spotify desktop, Chrome, Edge, media players)
    [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType=WindowsRuntime] | Out-Null
    Add-Type -AssemblyName System.Runtime.WindowsRuntime -ErrorAction SilentlyContinue

    $asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { 
        $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' 
    })[0]

    function Invoke-WinRTAsync($winRtTask, $resultType) {
        $asTask = $asTaskGeneric.MakeGenericMethod($resultType)
        $netTask = $asTask.Invoke($null, @($winRtTask))
        $netTask.Wait(800) | Out-Null
        return $netTask.Result
    }

    $mgrAsync = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync()
    $mgr = Invoke-WinRTAsync $mgrAsync ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager])

    if ($mgr) {
        $sessions = @($mgr.GetSessions())
        foreach ($s in $sessions) {
            $app = $s.SourceAppUserModelId
            if ($app -match 'RiotGames|League|Valorant|Discord|Steam') { continue }

            $p = Invoke-WinRTAsync ($s.TryGetMediaPropertiesAsync()) ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties])
            if ($p -and ($p.Title -ne '' -or $p.Artist -ne '')) {
                $status = $s.GetPlaybackInfo().PlaybackStatus.ToString()
                $timeline = $s.GetTimelineProperties()
                $pos = if ($timeline) { [int]$timeline.Position.TotalSeconds } else { 0 }
                $dur = if ($timeline -and $timeline.EndTime.TotalSeconds -gt 0) { [int]$timeline.EndTime.TotalSeconds } else { 180 }
                $isSpot = ($app -match 'spotify')

                [PSCustomObject]@{
                    hasMedia = $true
                    title = $p.Title
                    artist = if ($p.Artist) { $p.Artist } else { if ($isSpot) { "Spotify" } else { "YouTube" } }
                    album = $p.AlbumTitle
                    appId = $app
                    status = $status
                    playing = ($status -eq "Playing")
                    position = $pos
                    duration = $dur
                    source = if ($isSpot) { 'spotify' } else { 'youtube' }
                } | ConvertTo-Json -Compress
                exit 0
            }
        }
    }
} catch {
    # continue to desktop checks
}

# 2. Check Spotify Desktop Process Title
try {
    $spotProc = Get-Process -Name 'Spotify' -ErrorAction SilentlyContinue | Where-Object { 
        $_.MainWindowTitle -ne '' -and $_.MainWindowTitle -notmatch '^(?:Spotify Free|Spotify Premium|Spotify)$' 
    } | Select-Object -First 1

    if ($spotProc) {
        $sTitle = $spotProc.MainWindowTitle
        if ($sTitle -match '^(.*?)\s*[-–—]\s*(.*?)$') {
            $art = $matches[1].Trim()
            $trk = $matches[2].Trim()
            [PSCustomObject]@{
                hasMedia = $true
                title = $trk
                artist = "$art · Spotify"
                album = "Spotify"
                appId = "Spotify"
                status = "Playing"
                playing = $true
                position = 0
                duration = 180
                source = "spotify"
            } | ConvertTo-Json -Compress
            exit 0
        }
    }
} catch {
}

# 3. Check Window Titles for YouTube or Spotify in Opera, Chrome, Edge, Brave, Firefox
try {
    $code = @"
using System;
using System.Text;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class WinMediaDetector {
    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr OpenWindowStation(string lpszWinSta, bool fInherit, uint dwDesiredAccess);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SetProcessWindowStation(IntPtr hWinSta);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr OpenDesktop(string lpszDesktop, uint dwFlags, bool fInherit, uint dwDesiredAccess);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SetThreadDesktop(IntPtr hDesktop);

    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    [DllImport("user32.dll")]
    public static extern bool EnumDesktopWindows(IntPtr hDesktop, EnumWindowsProc lpfn, IntPtr lParam);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder strText, int maxCount);

    public static List<string> FindWindowTitles() {
        var list = new List<string>();
        try {
            IntPtr hWinsta = OpenWindowStation("winsta0", false, 0x10000000);
            if (hWinsta != IntPtr.Zero) SetProcessWindowStation(hWinsta);
            IntPtr hDesk = OpenDesktop("default", 0, false, 0x10000000);
            if (hDesk != IntPtr.Zero) SetThreadDesktop(hDesk);

            EnumDesktopWindows(hDesk, (hWnd, lParam) => {
                StringBuilder sb = new StringBuilder(1024);
                if (GetWindowText(hWnd, sb, 1024) > 0) {
                    string t = sb.ToString().Trim();
                    if (!string.IsNullOrEmpty(t)) {
                        list.Add(t);
                    }
                }
                return true;
            }, IntPtr.Zero);
        } catch {}
        return list;
    }
}
"@
    Add-Type -TypeDefinition $code -Language CSharp -ErrorAction SilentlyContinue
    $wTitles = [WinMediaDetector]::FindWindowTitles()

    foreach ($w in $wTitles) {
        # Check YouTube tab: "Song Name - YouTube - Opera" or "Song Name - YouTube"
        if ($w -match '^(.*?)\s*-\s*YouTube(?:\s*-\s*.*)?$') {
            $raw = $matches[1].Trim()
            $raw = $raw -replace '^\(\d+\)\s*', ''
            $raw = $raw -replace '^[▶►]\s*', ''

            if ($raw.Length -gt 1 -and $raw -notmatch '^(?:YouTube|Home|Subscriptions|Trending|Library|History|Watch later)$') {
                # Clean video suffixes
                $clean = $raw -replace '\s*(?:\|\||//).*$', ''
                $clean = $clean -replace '\s*[\(\[](?:Official|Music Video|Audio|Video|Lyrics|Lyric Video|Full Lyrics|MV|Visualizer|HD|4K|Audio).*?[\)\]]', ''
                $clean = $clean.Trim()

                $trackTitle = $clean
                $trackArtist = "YouTube"

                if ($clean -match '^(.*?)\s*[-–—]\s*(.*?)$') {
                    $trackTitle = $matches[1].Trim()
                    $trackArtist = $matches[2].Trim() + " · YouTube"
                }

                [PSCustomObject]@{
                    hasMedia = $true
                    title = $trackTitle
                    artist = $trackArtist
                    album = "YouTube"
                    appId = "YouTube"
                    status = "Playing"
                    playing = $true
                    position = 0
                    duration = 180
                    source = "youtube"
                } | ConvertTo-Json -Compress
                exit 0
            }
        }
    }
} catch {
}

'{"hasMedia":false}'
