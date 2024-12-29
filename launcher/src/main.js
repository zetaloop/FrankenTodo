const { invoke } = window.__TAURI__.core;

const BACKEND_URL = 'http://localhost:8080'
const MAX_RETRIES = 30
const RETRY_INTERVAL = 1000

/**
 * 更新状态显示
 * @param {string} message 
 */
function updateStatus(message) {
  const statusElement = document.getElementById('status')
  if (statusElement) {
    statusElement.textContent = message
  }
}

/**
 * 检查后端服务是否可用
 * @returns {Promise<boolean>}
 */
async function checkBackendService() {
  try {
    console.log('正在检查后端服务...')
    const response = await fetch(`${BACKEND_URL}/`)
    console.log('后端响应状态:', response.status)
    
    // 任何响应都认为是成功的，因为后端可能返回302等状态码
    return response.status < 500
  } catch (error) {
    console.log('检查失败:', error.message)
    return false
  }
}

/**
 * 等待后端服务启动
 * @returns {Promise<boolean>}
 */
async function waitForBackend() {
  for (let i = 0; i < MAX_RETRIES; i++) {
    updateStatus(`正在等待后端服务启动 (${i + 1}/${MAX_RETRIES})...`)
    const isReady = await checkBackendService()
    if (isReady) {
      return true
    }
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
    const isReady = await waitForBackend()
    if (isReady) {
      updateStatus('后端服务已就绪，正在加载应用...')
      window.location.href = BACKEND_URL
    } else {
      updateStatus('后端服务启动失败，请检查日志')
    }
  } catch (error) {
    console.error('启动后端服务失败:', error)
    updateStatus(`启动失败: ${error.message}`)
  }
}

// 页面加载完成后启动服务
window.addEventListener('DOMContentLoaded', startBackendService)
