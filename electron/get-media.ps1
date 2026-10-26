try {
    [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType=WindowsRuntime] | Out-Null
    Add-Type -AssemblyName System.Runtime.WindowsRuntime

    $asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { 
        $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' 
    })[0]

    function Invoke-WinRTAsync($winRtTask, $resultType) {
        $asTask = $asTaskGeneric.MakeGenericMethod($resultType)
        $netTask = $asTask.Invoke($null, @($winRtTask))
        $netTask.Wait(1500) | Out-Null
        return $netTask.Result
    }

    $mgrAsync = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync()
    $mgr = Invoke-WinRTAsync $mgrAsync ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager])

    if ($mgr) {
        $session = $mgr.GetCurrentSession()
        if ($session) {
            $playback = $session.GetPlaybackInfo()
            $status = $playback.PlaybackStatus.ToString() # Closed, Opened, Changing, Stopped, Playing, Paused
            $appId = $session.SourceAppUserModelId

            $propsAsync = $session.TryGetMediaPropertiesAsync()
            $props = Invoke-WinRTAsync $propsAsync ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties])

            $timeline = $session.GetTimelineProperties()
            $pos = if ($timeline) { [int]$timeline.Position.TotalSeconds } else { 0 }
            $dur = if ($timeline -and $timeline.EndTime.TotalSeconds -gt 0) { [int]$timeline.EndTime.TotalSeconds } else { 180 }

            $title = if ($props) { $props.Title } else { "" }
            $artist = if ($props) { $props.Artist } else { "" }
            $album = if ($props) { $props.AlbumTitle } else { "" }

            [PSCustomObject]@{
                hasMedia = ($title -ne "" -or $artist -ne "")
                title = $title
                artist = $artist
                album = $album
                appId = $appId
                status = $status
                playing = ($status -eq "Playing")
                position = $pos
                duration = $dur
            } | ConvertTo-Json -Compress
            exit 0
        }
    }
    '{"hasMedia":false}'
} catch {
    '{"hasMedia":false}'
}
