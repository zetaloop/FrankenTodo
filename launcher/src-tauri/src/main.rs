// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    env,
    process::{Child, Command},
    sync::Mutex,
};

use tauri::{
    Manager,
    State,
    Builder,
    WindowEvent,
};

struct ProcessManager(Mutex<Option<Child>>);

#[tauri::command]
fn start_backend_service(pm: State<ProcessManager>) -> Result<(), String> {
    let mut lock = pm.0.lock().map_err(|_| "进程锁获取失败")?;
    if let Some(child) = lock.as_mut() {
        match child.try_wait() {
            Ok(None) => return Ok(()), // 进程正在运行，直接返回
            _ => {}
        }
    }

    let current_exe = env::current_exe().map_err(|e| e.to_string())?;
    let app_dir = current_exe.parent().ok_or("无法获取应用目录")?;
    let backend_jar = app_dir.join("backend").join("todo-0.0.1-SNAPSHOT.jar");

    if !backend_jar.exists() {
        return Err(format!("后端 JAR 不存在: {:?}", backend_jar));
    }

    let child = Command::new("java")
        .arg("-jar")
        .arg(&backend_jar)
        .spawn()
        .map_err(|e| format!("启动 Java 进程失败: {}", e))?;

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
            stop_backend_service
        ])
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                // 1. 阻止窗口立即关闭
                api.prevent_close();

                // 2. 获取状态和窗口句柄
                let app_handle = window.app_handle().clone();

                // 3. 新线程中进行后端关闭并退出应用
                std::thread::spawn(move || {
                    // 首先等待后端完全启动
                    let client = reqwest::blocking::Client::new();
                    let mut health_attempts = 0;
                    let max_health_attempts = 30; // 最多等待15秒（30 * 500ms）

                    while health_attempts < max_health_attempts {
                        match client.get("http://localhost:8080/api/v1/system/health").send() {
                            Ok(response) if response.status().is_success() => break,
                            _ => {
                                std::thread::sleep(std::time::Duration::from_millis(500));
                                health_attempts += 1;
                            }
                        }
                    }

                    // 然后调用后端的关闭接口，并确保得到正确响应
                    match client.post("http://localhost:8080/api/v1/system/shutdown")
                        .send() {
                        Ok(response) if response.status().is_success() => {
                            // 等待后端进程完全关闭
                            let pm = app_handle.state::<ProcessManager>();
                            let mut attempts = 0;
                            let max_attempts = 20; // 最多等待10秒（20 * 500ms）

                            while attempts < max_attempts {
                                let mut lock = pm.0.lock().unwrap();
                                if let Some(child) = lock.as_mut() {
                                    match child.try_wait() {
                                        Ok(Some(_)) => break, // 进程已结束
                                        Ok(None) => {
                                            // 进程仍在运行，等待500ms后重试
                                            drop(lock);
                                            std::thread::sleep(std::time::Duration::from_millis(500));
                                            attempts += 1;
                                        }
                                        Err(_) => break, // 出错，退出循环
                                    }
                                } else {
                                    break; // 没有进程需要等待
                                }
                            }

                            // 如果进程仍在运行，强制结束它
                            let _ = stop_backend_service(pm);
                        }
                        _ => {
                            // 如果关闭接口调用失败，直接强制结束进程
                            let pm = app_handle.state::<ProcessManager>();
                            let _ = stop_backend_service(pm);
                        }
                    }

                    // 退出应用
                    app_handle.exit(0);
                });
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
