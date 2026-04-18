const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
let recognition: any = null

chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: (r: any) => void) => {
  if (message.type === "start-recording") {
    startRecording()
    sendResponse({ ok: true })
    return false
  }

  if (message.type === "stop-recording") {
    stopRecording()
    sendResponse({ ok: true })
    return false
  }
})

async function startRecording() {
  if (!SpeechRecognition) {
    chrome.runtime.sendMessage({
      type: "speech-error",
      error: "浏览器不支持语音识别"
    })
    return
  }

  // 先显式请求麦克风权限，触发浏览器授权弹窗
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((track) => track.stop())
  } catch (err: any) {
    let errorMsg = "麦克风权限被拒绝。请在弹出的权限提示中点击「允许」，或手动前往 chrome://settings/content/microphone 允许本扩展访问。"
    if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
      errorMsg = "未找到麦克风设备，请检查硬件连接"
    } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      errorMsg = "麦克风权限被拒绝。请在浏览器地址栏的权限图标中允许麦克风，或前往 chrome://settings/content/microphone 允许本扩展访问。"
    }
    chrome.runtime.sendMessage({
      type: "speech-error",
      error: errorMsg
    })
    return
  }

  if (recognition) {
    try {
      recognition.stop()
    } catch (e) {}
  }

  recognition = new SpeechRecognition()
  recognition.lang = "zh-CN"
  recognition.continuous = true
  recognition.interimResults = true

  let finalTranscript = ""

  recognition.onstart = () => {
    chrome.runtime.sendMessage({ type: "speech-started" })
  }

  recognition.onresult = (event: any) => {
    let interim = ""
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalTranscript += transcript
      } else {
        interim += transcript
      }
    }
    chrome.runtime.sendMessage({
      type: "speech-result",
      final: finalTranscript,
      interim: interim
    })
  }

  recognition.onerror = (event: any) => {
    let errorMsg = event.error || "语音识别出错"
    if (event.error === "not-allowed") {
      errorMsg = "麦克风权限被拒绝。请检查浏览器地址栏是否有麦克风权限提示，或前往 chrome://settings/content/microphone 允许本扩展访问。"
    } else if (event.error === "network") {
      errorMsg = "网络连接异常，语音识别服务暂不可用"
    } else if (event.error === "no-speech") {
      errorMsg = "未检测到语音输入，请靠近麦克风重试"
    } else if (event.error === "audio-capture") {
      errorMsg = "未找到麦克风设备，请检查硬件连接"
    }
    chrome.runtime.sendMessage({
      type: "speech-error",
      error: errorMsg
    })
  }

  recognition.onend = () => {
    chrome.runtime.sendMessage({
      type: "speech-ended",
      final: finalTranscript
    })
  }

  try {
    recognition.start()
  } catch (e) {
    chrome.runtime.sendMessage({
      type: "speech-error",
      error: "启动语音识别失败"
    })
  }
}

function stopRecording() {
  if (recognition) {
    try {
      recognition.stop()
    } catch (e) {}
    recognition = null
  }
}
