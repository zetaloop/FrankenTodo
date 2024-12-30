const { invoke } = window.__TAURI__.core;
const { listen } = window.__TAURI__.event;

const BACKEND_URL = 'http://localhost:8080'
const MAX_RETRIES = 30
const RETRY_INTERVAL = 1000

// 检查当前是否是关闭流程
const isClosing = new URLSearchParams(window.location.search).has('closing');

/**
 * 更新状态显示
 * @param {string} message 
 * @param {string} [type] - 消息类型：'info', 'error', 'success'
 */
function updateStatus(message, type = 'info') {
  const statusElement = document.getElementById('status')
  if (statusElement) {
    statusElement.textContent = message
    // 根据消息类型设置颜色
    switch(type) {
      case 'error':
        statusElement.style.color = '#ff4444';
        break;
      case 'success':
        statusElement.style.color = '#4CAF50';
        break;
      default:
        statusElement.style.color = '#666';
    }
  }
  // 同时在控制台输出信息
  console.log(`[${type.toUpperCase()}] ${message}`);
}

/**
 * 检查后端服务是否可用
 * @returns {Promise<boolean>}
 */
async function checkBackendService() {
  try {
    updateStatus(`正在检查后端服务 (${BACKEND_URL})...`)
    const response = await fetch(`${BACKEND_URL}/`, {
      method: 'GET',
      mode: 'no-cors', // 添加 no-cors 模式
    })
    updateStatus(`后端响应状态: ${response.status}`, 'success')
    return true
  } catch (error) {
    updateStatus(`检查失败: ${error.message}`, 'error')
    return false
  }
}

/**
 * 检查进程状态
 * @returns {Promise<string>} 返回进程状态
 */
async function checkProcessStatus() {
  try {
    return await invoke('check_process_status');
  } catch (error) {
    console.error('检查进程状态失败:', error);
    return 'Failed';
  }
}

/**
 * 等待后端服务启动
 * @returns {Promise<boolean>}
 */
async function waitForBackend() {
  for (let i = 0; i < MAX_RETRIES; i++) {
    // 首先检查进程状态
    const processStatus = await checkProcessStatus();
    if (processStatus === 'Failed') {
      updateStatus('后端进程已异常退出，启动失败', 'error');
      return false;
    }
    
    updateStatus(`尝试连接后端服务 (${i + 1}/${MAX_RETRIES})...`);
    const isReady = await checkBackendService();
    if (isReady) {
      return true;
    }
    updateStatus(`请稍候...`);
    await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
  }
  return false;
}

/**
 * 添加日志内容
 * @param {string} text 
 */
function appendLog(text) {
  const logElement = document.getElementById('log')
  const container = document.querySelector('.log-container')
  if (logElement && container) {
    logElement.textContent += text
    // 自动滚动到底部
    container.scrollTop = container.scrollHeight
  }
}

/**
 * 启动后端服务
 */
async function startBackendService() {
  try {
    updateStatus('正在启动后端服务...')
    
    // 监听后端输出
    await listen('backend-output', (event) => {
      appendLog(event.payload)
    })
    
    await invoke('start_backend_service')
    updateStatus('后端服务启动命令已发送，等待服务就绪...')
    
    // 给后端一些启动时间
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const isReady = await waitForBackend()
    if (isReady) {
      updateStatus('后端服务已就绪，即将跳转...', 'success')
      setTimeout(() => {
        window.location.href = BACKEND_URL
      }, 1000)
    } else {
      updateStatus('后端服务连接超时。如果你能直接访问 localhost:8080，请报告这个问题。', 'error')
    }
  } catch (error) {
    console.error('启动后端服务失败:', error)
    updateStatus(`启动失败: ${error.message}`, 'error')
  }
}

/**
 * 切换到关闭模式
 */
async function switchToClosingMode() {
  const statusElement = document.getElementById('status');
  if (statusElement) {
    statusElement.textContent = '正在关闭服务...';
  }

  // 检查进程状态
  const processStatus = await checkProcessStatus();
  if (processStatus === 'Failed') {
    // 如果进程已经失败，直接强制结束
    try {
      await invoke('stop_backend_service');
      updateStatus('服务已强制关闭', 'success');
    } catch (error) {
      updateStatus(`关闭服务失败: ${error}`, 'error');
    }
    // 延迟一秒后退出
    setTimeout(() => {
      window.__TAURI__.process.exit(0);
    }, 1000);
    return;
  }
}

// 页面加载完成后启动服务
window.addEventListener('DOMContentLoaded', async () => {
  // 监听后端输出
  listen('backend-output', (event) => {
    appendLog(event.payload);
  });

  // 监听关闭模式切换事件
  listen('switch-to-closing', () => {
    switchToClosingMode();
  });

  if (!isClosing) {
    // 先检查进程状态
    const processStatus = await checkProcessStatus();
    if (processStatus === 'Failed') {
      updateStatus('检测到后端进程已异常退出，请重启应用', 'error');
      return;
    }
    startBackendService();
  }
});
