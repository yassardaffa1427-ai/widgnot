param(
    [string]$Action = "status"
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

try {
    [Windows.Devices.Radios.Radio, Windows.System.Devices, ContentType=WindowsRuntime] | Out-Null
    [Windows.Devices.Radios.RadioState, Windows.System.Devices, ContentType=WindowsRuntime] | Out-Null
    [Windows.Devices.Radios.RadioAccessStatus, Windows.System.Devices, ContentType=WindowsRuntime] | Out-Null
    Add-Type -AssemblyName System.Runtime.WindowsRuntime -ErrorAction SilentlyContinue

    $asTask = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
        $_.Name -eq "AsTask" -and $_.GetParameters().Count -eq 1 -and $_.IsGenericMethod
    } | Select-Object -First 1

    function Get-BtRadio {
        $op = [Windows.Devices.Radios.Radio]::GetRadiosAsync()
        $method = $asTask.MakeGenericMethod([System.Collections.Generic.IReadOnlyList[Windows.Devices.Radios.Radio]])
        $task = $method.Invoke($null, @($op))
        $task.Wait(2500)
        foreach ($r in $task.Result) {
            if ($r.Kind -eq [Windows.Devices.Radios.RadioKind]::Bluetooth) {
                return $r
            }
        }
        return $null
    }

    $radio = Get-BtRadio
    if (!$radio) {
        Write-Output '{"enabled":false,"connected":false,"deviceName":""}'
        exit
    }

    if ($Action -eq "toggle") {
        $target = if ($radio.State -eq [Windows.Devices.Radios.RadioState]::On) { [Windows.Devices.Radios.RadioState]::Off } else { [Windows.Devices.Radios.RadioState]::On }
        $op = $radio.SetStateAsync($target)
        $method = $asTask.MakeGenericMethod([Windows.Devices.Radios.RadioAccessStatus])
        $task = $method.Invoke($null, @($op))
        $task.Wait(2500)
    } elseif ($Action -eq "off") {
        $op = $radio.SetStateAsync([Windows.Devices.Radios.RadioState]::Off)
        $method = $asTask.MakeGenericMethod([Windows.Devices.Radios.RadioAccessStatus])
        $task = $method.Invoke($null, @($op))
        $task.Wait(2500)
    } elseif ($Action -eq "on") {
        $op = $radio.SetStateAsync([Windows.Devices.Radios.RadioState]::On)
        $method = $asTask.MakeGenericMethod([Windows.Devices.Radios.RadioAccessStatus])
        $task = $method.Invoke($null, @($op))
        $task.Wait(2500)
    }

    # Re-check current radio state
    $isEnabled = ($radio.State -eq [Windows.Devices.Radios.RadioState]::On)

    # Check connected audio device (earbuds / headphones)
    $deviceName = ""
    $isConnected = $false
    if ($isEnabled) {
        try {
            $audioDev = Get-PnpDevice -Class AudioEndpoint -ErrorAction SilentlyContinue | Where-Object {
                $_.Present -eq $true -and $_.Status -eq "OK" -and ($_.FriendlyName -match "Headphones|Headset|Buds|AirPods|Earbuds|Earphones|Wireless|Bluetooth") -and ($_.FriendlyName -notmatch "Realtek|High Definition|DeskIn|WO Mic|DroidCam")
            } | Select-Object -First 1
            if ($audioDev) {
                $isConnected = $true
                $name = $audioDev.FriendlyName
                if ($name -match '\((.*?)\)') { $name = $Matches[1] }
                $deviceName = $name
            }
        } catch {}
    }

    $res = @{
        enabled = $isEnabled
        connected = $isConnected
        deviceName = if ($deviceName) { $deviceName } else { if ($isEnabled) { "Bluetooth" } else { "Bluetooth Off" } }
    }
    Write-Output ($res | ConvertTo-Json -Compress)
} catch {
    Write-Output '{"enabled":false,"connected":false,"deviceName":""}'
}
