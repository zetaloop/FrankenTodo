// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    env,
    process::{Child, Command, Stdio},
    sync::Mutex,
    io::{BufRead, BufReader},
    os::windows::process::CommandExt,
};

use tauri::{
    Manager,
    State,
    Builder,
    WindowEvent,
    Emitter,
};

// Windows 上隐藏命令行窗口的标志
const CREATE_NO_WINDOW: u32 = 0x08000000;

struct ProcessManager(Mutex<Option<Child>>);

#[derive(serde::Serialize)]
enum ProcessStatus {
    NotRunning,
    Running,
    Failed,
}

#[tauri::command]
fn check_process_status(pm: State<ProcessManager>) -> ProcessStatus {
    let mut lock = pm.0.lock().unwrap();
    match &mut *lock {
        None => ProcessStatus::NotRunning,
        Some(child) => {
            match child.try_wait() {
                Ok(None) => ProcessStatus::Running,
                Ok(Some(_)) => ProcessStatus::Failed,
                Err(_) => ProcessStatus::Failed,
            }
        }
    }
}

#[tauri::command]
fn start_backend_service(window: tauri::Window, pm: State<ProcessManager>) -> Result<(), String> {
    let mut lock = pm.0.lock().map_err(|_| "进程锁获取失败")?;
    
    // 检查现有进程状态
    if let Some(child) = lock.as_mut() {
        match child.try_wait() {
            Ok(None) => return Ok(()), // 进程正在运行，直接返回
            Ok(Some(status)) => {
                // 进程已退出
                if !status.success() {
                    return Err("后端进程异常退出".to_string());
                }
            }
            Err(_) => return Err("检查进程状态失败".to_string()),
        }
    }

    let current_exe = env::current_exe().map_err(|e| e.to_string())?;
    let app_dir = current_exe.parent().ok_or("无法获取应用目录")?;
    let backend_jar = app_dir.join("backend").join("todo-0.0.1-SNAPSHOT.jar");

    if !backend_jar.exists() {
        return Err(format!("后端 JAR 不存在: {:?}", backend_jar));
    }

    let mut child = Command::new("java")
        .arg("-jar")
        .arg(&backend_jar)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .creation_flags(CREATE_NO_WINDOW)
        .spawn()
        .map_err(|e| format!("启动 Java 进程失败: {}", e))?;

    // 获取标准输出和错误输出
    let stdout = child.stdout.take().ok_or("无法获取标准输出")?;
    let stderr = child.stderr.take().ok_or("无法获取标准错误")?;

    // 创建新线程处理标准输出
    let window_clone = window.clone();
    std::thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            if let Ok(line) = line {
                let _ = window_clone.emit("backend-output", format!("{}\n", line));
            }
        }
    });

    // 创建新线程处理标准错误
    std::thread::spawn(move || {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            if let Ok(line) = line {
                let _ = window.emit("backend-output", format!("[ERROR] {}\n", line));
            }
        }
    });

    *lock = Some(child);
    Ok(())
}

#[tauri::command]
fn stop_backend_service(pm: State<ProcessManager>) -> Result<(), String> {
    let mut lock = pm.0.lock().map_err(|_| "进程锁获取失败")?;
    if let Some(child) = lock.as_mut() {
        child.kill().map_err(|e| format!("停止 Java 进程失败: {}", e))?;
        child.wait().map_err(|e| format!("等待 Java 进程结束失败: {}", e))?;
    }
    *lock = None;
    Ok(())
}

fn main() {
    Builder::default()
        .manage(ProcessManager(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            start_backend_service,
            stop_backend_service,
            check_process_status
        ])
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                // 1. 阻止窗口立即关闭
                api.prevent_close();

                // 2. 获取状态和窗口句柄
                let app_handle = window.app_handle().clone();
                let window = window.clone();

                // 3. 新线程中进行后端关闭并退出应用
                std::thread::spawn(move || {
                    // 使用 Manager 获取窗口并执行 JavaScript 进行页面跳转
                    if let Some(webview) = app_handle.get_webview_window("main") {
                        let _ = webview.eval("window.location.href = 'http://tauri.localhost/'");
                        // 给页面切换一点时间
                        std::thread::sleep(std::time::Duration::from_millis(500));
                        // 发送切换到关闭模式的事件
                        let _ = webview.emit("switch-to-closing", ());
                    }
                    // 检查 Java 进程状态
                    let pm = app_handle.state::<ProcessManager>();
                    let mut lock = pm.0.lock().unwrap();
                    
                    match &mut *lock {
                        None => {
                            // Java 进程已经不存在，直接退出
                            let _ = window.emit("backend-output", "没有检测到运行中的后端进程，直接退出...\n");
                            std::thread::sleep(std::time::Duration::from_secs(1));
                            app_handle.exit(0);
                            return;
                        }
                        Some(child) => {
                            match child.try_wait() {
                                Ok(Some(_)) => {
                                    // 进程已经结束，直接退出
                                    let _ = window.emit("backend-output", "后端进程已经结束，直接退出...\n");
                                    std::thread::sleep(std::time::Duration::from_secs(1));
                                    app_handle.exit(0);
                                    return;
                                }
                                Ok(None) => {
                                    // 进程还在运行，尝试优雅关闭
                                    let _ = window.emit("backend-output", "检测到运行中的后端进程，尝试优雅关闭...\n");
                                    
                                    // 创建 HTTP 客户端
                                    let client = reqwest::blocking::Client::new();
                                    
                                    // 尝试发送关闭命令
                                    match client.post("http://localhost:8080/api/v1/system/shutdown")
                                        .timeout(std::time::Duration::from_secs(5))
                                        .send() {
                                        Ok(_) => {
                                            let _ = window.emit("backend-output", "关闭命令已发送，等待进程结束...\n");
                                            // 等待最多5秒
                                            let mut attempts = 0;
                                            while attempts < 10 {
                                                match child.try_wait() {
                                                    Ok(Some(_)) => {
                                                        let _ = window.emit("backend-output", "进程已正常结束\n");
                                                        break;
                                                    }
                                                    Ok(None) => {
                                                        std::thread::sleep(std::time::Duration::from_millis(500));
                                                        attempts += 1;
                                                    }
                                                    Err(_) => break,
                                                }
                                            }
                                            
                                            // 如果进程还在运行，强制结束
                                            if attempts >= 10 {
                                                let _ = window.emit("backend-output", "进程未能在预期时间内结束，强制关闭...\n");
                                                let _ = child.kill();
                                            }
                                        }
                                        Err(_) => {
                                            // 关闭命令发送失败，直接强制结束进程
                                            let _ = window.emit("backend-output", "无法发送关闭命令，强制结束进程...\n");
                                            let _ = child.kill();
                                        }
                                    }
                                }
                                Err(_) => {
                                    // 检查进程状态失败，保险起见尝试强制结束
                                    let _ = window.emit("backend-output", "检查进程状态失败，尝试强制结束...\n");
                                    let _ = child.kill();
                                }
                            }
                        }
                    }
                    
                    // 清理进程管理器状态
                    *lock = None;
                    
                    // 最后等待一秒让用户看到消息，然后退出
                    std::thread::sleep(std::time::Duration::from_secs(1));
                    app_handle.exit(0);
                });
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
