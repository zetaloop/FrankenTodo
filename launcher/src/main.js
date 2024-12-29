const { invoke } = window.__TAURI__.core;

const BACKEND_URL = 'http://localhost:8080'
const MAX_RETRIES = 30
const RETRY_INTERVAL = 1000

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
 * 等待后端服务启动
 * @returns {Promise<boolean>}
 */
async function waitForBackend() {
  for (let i = 0; i < MAX_RETRIES; i++) {
    updateStatus(`尝试连接后端服务 (${i + 1}/${MAX_RETRIES})...`)
    const isReady = await checkBackendService()
    if (isReady) {
      return true
    }
    updateStatus(`等待 ${RETRY_INTERVAL}ms 后重试...`)
    await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL))
  }
  return false
}

/**
 * 启动后端服务
 */
async function startBackendService() {
  try {
    updateStatus('正在启动后端服务...')
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

// 页面加载完成后启动服务
window.addEventListener('DOMContentLoaded', startBackendService)
