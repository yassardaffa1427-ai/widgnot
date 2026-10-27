use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
};

const GET_MEDIA_SCRIPT: &str = include_str!("../scripts/get-media.ps1");
const BLUETOOTH_SCRIPT: &str = include_str!("../scripts/bluetooth.ps1");

fn get_scripts_dir() -> std::path::PathBuf {
    let mut path = std::env::temp_dir();
    path.push("widgnot_scripts");
    let _ = std::fs::create_dir_all(&path);
    path
}

fn ensure_scripts() -> (std::path::PathBuf, std::path::PathBuf) {
    let dir = get_scripts_dir();
    let media_path = dir.join("get-media.ps1");
    let bt_path = dir.join("bluetooth.ps1");
    let _ = std::fs::write(&media_path, GET_MEDIA_SCRIPT);
    let _ = std::fs::write(&bt_path, BLUETOOTH_SCRIPT);
    (media_path, bt_path)
}

fn run_ps_script(script_path: &std::path::Path, args: &[&str]) -> Option<String> {
    let mut cmd = std::process::Command::new("powershell.exe");
    cmd.arg("-NoProfile")
        .arg("-ExecutionPolicy")
        .arg("Bypass")
        .arg("-File")
        .arg(script_path);

    for arg in args {
        cmd.arg(arg);
    }

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }

    let output = cmd.output().ok()?;
    if output.status.success() {
        String::from_utf8(output.stdout).ok()
    } else {
        None
    }
}

fn extract_json(raw: &str) -> Option<serde_json::Value> {
    let start = raw.find('{')?;
    let end = raw.rfind('}')?;
    if end > start {
        serde_json::from_str(&raw[start..=end]).ok()
    } else {
        None
    }
}

#[cfg(target_os = "windows")]
fn send_key(vk: u8) {
    unsafe extern "system" {
        fn keybd_event(b_vk: u8, b_scan: u8, dw_flags: u32, dw_extra_info: usize);
    }
    const KEYEVENTF_KEYUP: u32 = 0x0002;
    unsafe {
        keybd_event(vk, 0, 0, 0);
        keybd_event(vk, 0, KEYEVENTF_KEYUP, 0);
    }
}

#[cfg(target_os = "windows")]
fn set_window_click_through(hwnd: isize, ignore: bool) {
    unsafe extern "system" {
        fn GetWindowLongPtrW(hwnd: isize, n_index: i32) -> isize;
        fn SetWindowLongPtrW(hwnd: isize, n_index: i32, new_long: isize) -> isize;
    }
    const GWL_EXSTYLE: i32 = -20;
    const WS_EX_TRANSPARENT: isize = 0x00000020;
    unsafe {
        let ex_style = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
        let new_style = if ignore {
            ex_style | WS_EX_TRANSPARENT
        } else {
            ex_style & !WS_EX_TRANSPARENT
        };
        if new_style != ex_style {
            SetWindowLongPtrW(hwnd, GWL_EXSTYLE, new_style);
        }
    }
}

#[tauri::command]
fn set_interactive(app: tauri::AppHandle, interactive: bool) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        #[cfg(target_os = "windows")]
        if let Ok(hwnd) = window.hwnd() {
            set_window_click_through(hwnd.0 as isize, !interactive);
        }
        let _ = window.set_ignore_cursor_events(!interactive);
    }
    Ok(())
}

#[tauri::command]
fn close_app(app: tauri::AppHandle) {
    app.exit(0);
}

#[tauri::command]
fn toggle_os_media() {
    #[cfg(target_os = "windows")]
    send_key(0xB3); // VK_MEDIA_PLAY_PAUSE
}

#[tauri::command]
fn next_os_media() {
    #[cfg(target_os = "windows")]
    send_key(0xB0); // VK_MEDIA_NEXT_TRACK
}

#[tauri::command]
fn prev_os_media() {
    #[cfg(target_os = "windows")]
    send_key(0xB1); // VK_MEDIA_PREV_TRACK
}

#[tauri::command]
fn get_bluetooth_status() -> serde_json::Value {
    let (_, bt_script) = ensure_scripts();
    if let Some(out) = run_ps_script(&bt_script, &["-Action", "status"]) {
        if let Some(val) = extract_json(&out) {
            return val;
        }
    }
    serde_json::json!({ "enabled": false, "connected": false, "deviceName": "" })
}

#[tauri::command]
fn toggle_bluetooth(app: tauri::AppHandle) -> serde_json::Value {
    let (_, bt_script) = ensure_scripts();
    let res = if let Some(out) = run_ps_script(&bt_script, &["-Action", "toggle"]) {
        extract_json(&out).unwrap_or_else(|| {
            serde_json::json!({ "enabled": false, "connected": false, "deviceName": "" })
        })
    } else {
        serde_json::json!({ "enabled": false, "connected": false, "deviceName": "" })
    };
    let _ = app.emit("bluetooth-update", &res);
    res
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcuts(["Alt+W"])
                .expect("Failed to register Alt+W shortcut")
                .with_handler(|app, _shortcut, event| {
                    if event.state() == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                        let _ = app.emit("toggle-island", ());
                    }
                })
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            set_interactive,
            close_app,
            toggle_os_media,
            next_os_media,
            prev_os_media,
            get_bluetooth_status,
            toggle_bluetooth
        ])
        .setup(|app| {
            // Setup System Tray
            let toggle_item = MenuItem::with_id(
                app,
                "toggle",
                "Buka / Tutup Widgnot (Alt+W)",
                true,
                None::<&str>,
            )?;
            let quit_item = MenuItem::with_id(app, "quit", "Keluar (Quit)", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&toggle_item, &quit_item])?;

            let tray_icon = app
                .default_window_icon()
                .cloned()
                .ok_or_else(|| "Failed to load default window icon".to_string())?;

            let _tray = TrayIconBuilder::new()
                .icon(tray_icon)
                .tooltip("Widgnot — Hidden Island Widget (Alt+W)")
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "toggle" => {
                        let _ = app.emit("toggle-island", ());
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        let _ = app.emit("toggle-island", ());
                    }
                })
                .build(app)?;

            // Resize & position window to primary monitor
            if let Some(main_window) = app.get_webview_window("main") {
                if let Ok(Some(monitor)) = main_window.primary_monitor() {
                    let size = monitor.size();
                    let pos = monitor.position();
                    let _ = main_window.set_size(tauri::Size::Physical(*size));
                    let _ = main_window.set_position(tauri::Position::Physical(*pos));
                }

                #[cfg(target_os = "windows")]
                if let Ok(hwnd) = main_window.hwnd() {
                    set_window_click_through(hwnd.0 as isize, true);
                }
                let _ = main_window.set_ignore_cursor_events(true);
            }

            // Start background media & bluetooth polling thread
            let app_handle = app.handle().clone();
            std::thread::spawn(move || {
                let (media_script, bt_script) = ensure_scripts();
                let mut tick_count: u32 = 0;

                // Initial bluetooth query
                std::thread::sleep(std::time::Duration::from_millis(1000));
                if let Some(out) = run_ps_script(&bt_script, &["-Action", "status"]) {
                    if let Some(val) = extract_json(&out) {
                        let _ = app_handle.emit("bluetooth-update", &val);
                    }
                }

                loop {
                    // Poll media every 2 seconds
                    if let Some(out) = run_ps_script(&media_script, &[]) {
                        if let Some(val) = extract_json(&out) {
                            let _ = app_handle.emit("os-media-update", &val);
                        }
                    }

                    tick_count = tick_count.wrapping_add(1);
                    if tick_count % 2 == 0 {
                        // Poll bluetooth every 4 seconds
                        if let Some(out) = run_ps_script(&bt_script, &["-Action", "status"]) {
                            if let Some(val) = extract_json(&out) {
                                let _ = app_handle.emit("bluetooth-update", &val);
                            }
                        }
                    }

                    std::thread::sleep(std::time::Duration::from_millis(2000));
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
