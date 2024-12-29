// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Command, Child};
use std::path::PathBuf;
use std::env;
use std::sync::Mutex;
use tauri::State;

// 全局进程管理器
struct ProcessManager(Mutex<Option<Child>>);

#[tauri::command]
fn start_backend_service(process_manager: State<ProcessManager>) -> Result<(), String> {
    let mut process = process_manager.0.lock().map_err(|_| "进程锁获取失败")?;
    
    // 如果进程已经在运行，直接返回
    if process.is_some() {
        if let Some(p) = process.as_mut() {
            match p.try_wait() {
                Ok(None) => return Ok(()), // 进程正在运行
                _ => {} // 进程已结束，继续启动新进程
            }
        }
    }
    
    let current_exe = env::current_exe().map_err(|e| e.to_string())?;
    let app_dir = current_exe.parent().ok_or("无法获取应用目录")?;
    
    // 后端JAR包路径
    let backend_jar = app_dir.join("backend").join("todo-0.0.1-SNAPSHOT.jar");
    
    // 检查JAR文件是否存在
    if !backend_jar.exists() {
        return Err(format!("后端JAR包不存在: {:?}", backend_jar));
    }
    
    // 启动Java进程
    let child = Command::new("java")
        .arg("-jar")
        .arg(&backend_jar)
        .spawn()
        .map_err(|e| format!("启动Java进程失败: {}", e))?;
    
    *process = Some(child);
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .manage(ProcessManager(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![start_backend_service])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
