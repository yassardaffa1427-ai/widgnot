use base64::Engine;
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc, Mutex,
};
use std::thread::JoinHandle;
use tauri::{AppHandle, Emitter};

const TARGET_SAMPLE_RATE: u32 = 16_000;
const CHUNK_INTERVAL_SECS: usize = 12;
const SILENCE_RMS_THRESHOLD: f32 = 0.002;

#[derive(Clone, serde::Serialize)]
pub struct AudioChunkPayload {
    pub wav_base64: String,
    pub duration_sec: f32,
    pub rms: f32,
    pub is_final: bool,
}

#[derive(Clone, serde::Serialize)]
pub struct AudioStartResult {
    pub system_audio: bool,
    pub mic_audio: bool,
}

#[derive(Clone, serde::Serialize)]
pub struct AudioLevelPayload {
    pub level: f32,
}

pub struct MeetingRecorder {
    stop_flag: Arc<AtomicBool>,
    mixer_handle: Option<JoinHandle<()>>,
    sys_handle: Option<JoinHandle<()>>,
    mic_handle: Option<JoinHandle<()>>,
}

impl Default for MeetingRecorder {
    fn default() -> Self {
        Self {
            stop_flag: Arc::new(AtomicBool::new(false)),
            mixer_handle: None,
            sys_handle: None,
            mic_handle: None,
        }
    }
}

impl MeetingRecorder {
    pub fn start(&mut self, app: AppHandle) -> Result<AudioStartResult, String> {
        // Stop any existing recording first
        self.stop();

        #[cfg(target_os = "windows")]
        {
            let stop_flag = Arc::new(AtomicBool::new(false));
            let sys_buf = Arc::new(Mutex::new(Vec::<f32>::new()));
            let mic_buf = Arc::new(Mutex::new(Vec::<f32>::new()));
            let sys_ok = Arc::new(AtomicBool::new(false));
            let mic_ok = Arc::new(AtomicBool::new(false));
            let sys_ready = Arc::new(AtomicBool::new(false));
            let mic_ready = Arc::new(AtomicBool::new(false));

            // 1. System Audio Loopback Thread (Google Meet / Zoom / Speakers / Headphones)
            let sf1 = stop_flag.clone();
            let sb1 = sys_buf.clone();
            let sok1 = sys_ok.clone();
            let sr1 = sys_ready.clone();
            let sys_handle = std::thread::spawn(move || {
                capture_wasapi_loop(true, sf1, sb1, sok1, sr1);
            });

            // 2. Microphone Capture Thread (User's own voice)
            let sf2 = stop_flag.clone();
            let mb2 = mic_buf.clone();
            let mok2 = mic_ok.clone();
            let mr2 = mic_ready.clone();
            let mic_handle = std::thread::spawn(move || {
                capture_wasapi_loop(false, sf2, mb2, mok2, mr2);
            });

            // Wait briefly (up to 600ms) for capture devices to initialize
            for _ in 0..30 {
                if sys_ready.load(Ordering::SeqCst) && mic_ready.load(Ordering::SeqCst) {
                    break;
                }
                std::thread::sleep(std::time::Duration::from_millis(20));
            }

            let system_audio = sys_ok.load(Ordering::SeqCst);
            let mic_audio = mic_ok.load(Ordering::SeqCst);

            if !system_audio && !mic_audio {
                stop_flag.store(true, Ordering::SeqCst);
                let _ = sys_handle.join();
                let _ = mic_handle.join();
                return Err("Tidak dapat mengakses perangkat audio sistem maupun mikrofon.".to_string());
            }

            // 3. Mixer + Chunk Emitter Thread
            let sf3 = stop_flag.clone();
            let sb3 = sys_buf.clone();
            let mb3 = mic_buf.clone();
            let mixer_handle = std::thread::spawn(move || {
                let mut accumulated = Vec::<f32>::new();
                let target_chunk_samples = TARGET_SAMPLE_RATE as usize * CHUNK_INTERVAL_SECS;
                let mut ticks: u32 = 0;

                loop {
                    std::thread::sleep(std::time::Duration::from_millis(200));
                    ticks = ticks.wrapping_add(1);

                    let sys_chunk = {
                        if let Ok(mut b) = sb3.lock() {
                            std::mem::take(&mut *b)
                        } else {
                            Vec::new()
                        }
                    };
                    let mic_chunk = {
                        if let Ok(mut b) = mb3.lock() {
                            std::mem::take(&mut *b)
                        } else {
                            Vec::new()
                        }
                    };

                    let mixed = mix_buffers(&sys_chunk, &mic_chunk);
                    if !mixed.is_empty() {
                        // Emit live audio level for visual feedback
                        let recent_rms = compute_rms(&mixed);
                        let normalized = (recent_rms * 8.0).min(1.0);
                        let _ = app.emit("meeting-audio-level", AudioLevelPayload { level: normalized });
                        accumulated.extend_from_slice(&mixed);
                    } else if ticks % 2 == 0 {
                        let _ = app.emit("meeting-audio-level", AudioLevelPayload { level: 0.0 });
                    }

                    let stopping = sf3.load(Ordering::SeqCst);

                    if accumulated.len() >= target_chunk_samples || (stopping && !accumulated.is_empty()) {
                        let chunk = std::mem::take(&mut accumulated);
                        let duration_sec = chunk.len() as f32 / TARGET_SAMPLE_RATE as f32;
                        let rms = compute_rms(&chunk);

                        if duration_sec >= 0.7 && rms >= SILENCE_RMS_THRESHOLD {
                            let wav_bytes = encode_wav_16k_mono(&chunk);
                            let wav_base64 = base64::engine::general_purpose::STANDARD.encode(&wav_bytes);
                            let _ = app.emit(
                                "meeting-audio-chunk",
                                AudioChunkPayload {
                                    wav_base64,
                                    duration_sec,
                                    rms,
                                    is_final: stopping,
                                },
                            );
                        } else if stopping {
                            // Notify frontend that final flush had only silence
                            let _ = app.emit(
                                "meeting-audio-chunk",
                                AudioChunkPayload {
                                    wav_base64: String::new(),
                                    duration_sec,
                                    rms,
                                    is_final: true,
                                },
                            );
                        }
                    } else if stopping {
                        let _ = app.emit(
                            "meeting-audio-chunk",
                            AudioChunkPayload {
                                wav_base64: String::new(),
                                duration_sec: 0.0,
                                rms: 0.0,
                                is_final: true,
                            },
                        );
                    }

                    if stopping {
                        break;
                    }
                }
            });

            self.stop_flag = stop_flag;
            self.sys_handle = Some(sys_handle);
            self.mic_handle = Some(mic_handle);
            self.mixer_handle = Some(mixer_handle);

            Ok(AudioStartResult {
                system_audio,
                mic_audio,
            })
        }

        #[cfg(not(target_os = "windows"))]
        {
            let _ = app;
            Err("Perekaman audio sistem native saat ini hanya didukung di Windows.".to_string())
        }
    }

    pub fn stop(&mut self) {
        self.stop_flag.store(true, Ordering::SeqCst);
        if let Some(h) = self.sys_handle.take() {
            let _ = h.join();
        }
        if let Some(h) = self.mic_handle.take() {
            let _ = h.join();
        }
        if let Some(h) = self.mixer_handle.take() {
            let _ = h.join();
        }
    }
}

fn mix_buffers(sys: &[f32], mic: &[f32]) -> Vec<f32> {
    let len = sys.len().max(mic.len());
    if len == 0 {
        return Vec::new();
    }
    let mut out = Vec::with_capacity(len);
    for i in 0..len {
        let s = if i < sys.len() { sys[i] } else { 0.0 };
        let m = if i < mic.len() { mic[i] } else { 0.0 };
        // Combine system audio (Google Meet) and microphone with gentle saturation
        let combined = (s + m).clamp(-1.0, 1.0);
        out.push(combined);
    }
    out
}

fn compute_rms(samples: &[f32]) -> f32 {
    if samples.is_empty() {
        return 0.0;
    }
    let sum_sq: f64 = samples.iter().map(|&x| (x as f64) * (x as f64)).sum();
    (sum_sq / samples.len() as f64).sqrt() as f32
}

fn resample_to_16k(mono: &[f32], src_rate: u32) -> Vec<f32> {
    if mono.is_empty() || src_rate == 0 {
        return Vec::new();
    }
    if src_rate == TARGET_SAMPLE_RATE {
        return mono.to_vec();
    }
    let ratio = src_rate as f64 / TARGET_SAMPLE_RATE as f64;
    let out_len = ((mono.len() as f64) / ratio).floor() as usize;
    if out_len == 0 {
        return Vec::new();
    }
    let mut out = Vec::with_capacity(out_len);
    for i in 0..out_len {
        let src_pos = i as f64 * ratio;
        let idx = src_pos.floor() as usize;
        let frac = (src_pos - idx as f64) as f32;
        let a = mono[idx.min(mono.len() - 1)];
        let b = mono[(idx + 1).min(mono.len() - 1)];
        out.push(a + (b - a) * frac);
    }
    out
}

fn encode_wav_16k_mono(samples: &[f32]) -> Vec<u8> {
    let num_samples = samples.len() as u32;
    let data_bytes = num_samples * 2; // 16-bit mono = 2 bytes per sample
    let riff_size = 36 + data_bytes;

    let mut wav = Vec::with_capacity((44 + data_bytes) as usize);
    wav.extend_from_slice(b"RIFF");
    wav.extend_from_slice(&riff_size.to_le_bytes());
    wav.extend_from_slice(b"WAVE");

    // fmt chunk
    wav.extend_from_slice(b"fmt ");
    wav.extend_from_slice(&16u32.to_le_bytes()); // PCM chunk size
    wav.extend_from_slice(&1u16.to_le_bytes()); // AudioFormat = 1 (PCM)
    wav.extend_from_slice(&1u16.to_le_bytes()); // NumChannels = 1 (Mono)
    wav.extend_from_slice(&TARGET_SAMPLE_RATE.to_le_bytes());
    let byte_rate = TARGET_SAMPLE_RATE * 2;
    wav.extend_from_slice(&byte_rate.to_le_bytes());
    wav.extend_from_slice(&2u16.to_le_bytes()); // BlockAlign
    wav.extend_from_slice(&16u16.to_le_bytes()); // BitsPerSample

    // data chunk
    wav.extend_from_slice(b"data");
    wav.extend_from_slice(&data_bytes.to_le_bytes());

    for &s in samples {
        let clamped = s.clamp(-1.0, 1.0);
        let pcm = (clamped * 32767.0) as i16;
        wav.extend_from_slice(&pcm.to_le_bytes());
    }

    wav
}

#[cfg(target_os = "windows")]
fn capture_wasapi_loop(
    is_loopback: bool,
    stop_flag: Arc<AtomicBool>,
    out_buf: Arc<Mutex<Vec<f32>>>,
    init_ok: Arc<AtomicBool>,
    init_ready: Arc<AtomicBool>,
) {
    use windows::Win32::Media::Audio::{
        eCapture, eConsole, eRender, IAudioCaptureClient, IAudioClient, IMMDeviceEnumerator,
        MMDeviceEnumerator, AUDCLNT_BUFFERFLAGS_SILENT, AUDCLNT_SHAREMODE_SHARED,
        AUDCLNT_STREAMFLAGS_LOOPBACK, WAVEFORMATEX, WAVEFORMATEXTENSIBLE,
    };
    use windows::Win32::System::Com::{
        CoCreateInstance, CoInitializeEx, CoTaskMemFree, CoUninitialize, CLSCTX_ALL,
        COINIT_MULTITHREADED,
    };

    unsafe {
        let hr = CoInitializeEx(None, COINIT_MULTITHREADED);
        let com_inited = hr.is_ok();

        let result: Result<(), ()> = (|| {
            let enumerator: IMMDeviceEnumerator =
                CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL).map_err(|_| ())?;
            let data_flow = if is_loopback { eRender } else { eCapture };
            let device = enumerator
                .GetDefaultAudioEndpoint(data_flow, eConsole)
                .map_err(|_| ())?;
            let audio_client: IAudioClient = device.Activate(CLSCTX_ALL, None).map_err(|_| ())?;

            let pwfx = audio_client.GetMixFormat().map_err(|_| ())?;
            let wfx: WAVEFORMATEX = *pwfx;
            let channels = wfx.nChannels as usize;
            let sample_rate = wfx.nSamplesPerSec;
            let bits_per_sample = wfx.wBitsPerSample;

            // Detect IEEE float vs PCM
            let is_float = if wfx.wFormatTag == 3 {
                true
            } else if wfx.wFormatTag == 0xFFFE {
                let ext = &*(pwfx as *const WAVEFORMATEXTENSIBLE);
                ext.SubFormat.data1 == 3
            } else {
                false
            };

            let stream_flags = if is_loopback {
                AUDCLNT_STREAMFLAGS_LOOPBACK
            } else {
                0
            };

            // 100ms buffer duration (in 100-nanosecond units: 1_000_000 = 100ms)
            let init_res = audio_client.Initialize(
                AUDCLNT_SHAREMODE_SHARED,
                stream_flags,
                1_000_000,
                0,
                pwfx,
                None,
            );
            CoTaskMemFree(Some(pwfx as *const _));
            init_res.map_err(|_| ())?;

            let capture_client: IAudioCaptureClient =
                audio_client.GetService().map_err(|_| ())?;
            audio_client.Start().map_err(|_| ())?;

            init_ok.store(true, Ordering::SeqCst);
            init_ready.store(true, Ordering::SeqCst);

            let mut mono_scratch = Vec::<f32>::new();

            while !stop_flag.load(Ordering::SeqCst) {
                let mut packet_len = capture_client.GetNextPacketSize().unwrap_or(0);
                if packet_len == 0 {
                    std::thread::sleep(std::time::Duration::from_millis(15));
                    continue;
                }

                while packet_len > 0 {
                    let mut data_ptr: *mut u8 = std::ptr::null_mut();
                    let mut num_frames: u32 = 0;
                    let mut flags: u32 = 0;

                    if capture_client
                        .GetBuffer(&mut data_ptr, &mut num_frames, &mut flags, None, None)
                        .is_err()
                    {
                        break;
                    }

                    let frames = num_frames as usize;
                    if frames > 0 && channels > 0 {
                        mono_scratch.clear();
                        mono_scratch.reserve(frames);

                        let is_silent = (flags & (AUDCLNT_BUFFERFLAGS_SILENT.0 as u32)) != 0
                            || data_ptr.is_null();

                        if is_silent {
                            mono_scratch.resize(frames, 0.0);
                        } else if is_float && bits_per_sample == 32 {
                            let f_slice = std::slice::from_raw_parts(
                                data_ptr as *const f32,
                                frames * channels,
                            );
                            for f in 0..frames {
                                let mut sum = 0.0f32;
                                for c in 0..channels {
                                    sum += f_slice[f * channels + c];
                                }
                                mono_scratch.push(sum / channels as f32);
                            }
                        } else if bits_per_sample == 16 {
                            let i_slice = std::slice::from_raw_parts(
                                data_ptr as *const i16,
                                frames * channels,
                            );
                            for f in 0..frames {
                                let mut sum = 0.0f32;
                                for c in 0..channels {
                                    sum += i_slice[f * channels + c] as f32 / 32768.0;
                                }
                                mono_scratch.push(sum / channels as f32);
                            }
                        } else if bits_per_sample == 32 {
                            let i_slice = std::slice::from_raw_parts(
                                data_ptr as *const i32,
                                frames * channels,
                            );
                            for f in 0..frames {
                                let mut sum = 0.0f32;
                                for c in 0..channels {
                                    sum += i_slice[f * channels + c] as f32 / 2147483648.0;
                                }
                                mono_scratch.push(sum / channels as f32);
                            }
                        }

                        if !mono_scratch.is_empty() {
                            let resampled = resample_to_16k(&mono_scratch, sample_rate);
                            if let Ok(mut buf) = out_buf.lock() {
                                buf.extend_from_slice(&resampled);
                            }
                        }
                    }

                    let _ = capture_client.ReleaseBuffer(num_frames);
                    packet_len = capture_client.GetNextPacketSize().unwrap_or(0);
                }
            }

            let _ = audio_client.Stop();
            Ok(())
        })();

        if result.is_err() {
            init_ready.store(true, Ordering::SeqCst);
        }

        if com_inited {
            CoUninitialize();
        }
    }
}
