import { useEffect, useRef, useState } from "react"
import { createFragment, extractFacts, listProjects, type ExtractedFact, type Project } from "./api"

const LAST_PROJECT_KEY = "last_project_id"

function useSpeechRecognition(
  onResult: (text: string) => void,
  onError: (error: string) => void
) {
  const [recording, setRecording] = useState(false)
  const [interimText, setInterimText] = useState("")
  const recognitionRef = useRef<any>(null)

  const start = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      onError("浏览器不支持语音识别")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
    } catch (err: any) {
      let errorMsg = "麦克风权限被拒绝。请在弹出的权限提示中点击「允许」。"
      if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errorMsg = "未找到麦克风设备，请检查硬件连接"
      } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMsg = "麦克风权限被拒绝。请在浏览器地址栏的权限图标中允许麦克风，或前往 chrome://settings/content/microphone 允许本扩展访问。"
      }
      onError(errorMsg)
      return
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "zh-CN"
    recognition.continuous = true
    recognition.interimResults = true
    recognitionRef.current = recognition

    let finalTranscript = ""
    let lastInterim = ""

    recognition.onstart = () => {
      setRecording(true)
      setInterimText("")
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
      lastInterim = interim
      setInterimText(finalTranscript + lastInterim)
    }

    recognition.onerror = (event: any) => {
      let errorMsg = event.error || "语音识别出错"
      if (event.error === "not-allowed") {
        errorMsg = "麦克风权限被拒绝。请在浏览器地址栏的权限图标中允许麦克风，或前往 chrome://settings/content/microphone 允许本扩展访问。"
      } else if (event.error === "network") {
        errorMsg = "网络连接异常，语音识别服务暂不可用"
      } else if (event.error === "no-speech") {
        errorMsg = "未检测到语音输入，请靠近麦克风重试"
      } else if (event.error === "audio-capture") {
        errorMsg = "未找到麦克风设备，请检查硬件连接"
      }
      onError(errorMsg)
      setRecording(false)
      setInterimText("")
      recognitionRef.current = null
    }

    recognition.onend = () => {
      const text = finalTranscript + lastInterim
      if (text.trim()) {
        onResult(text.trim())
      }
      setRecording(false)
      setInterimText("")
      recognitionRef.current = null
    }

    try {
      recognition.start()
    } catch (e) {
      onError("启动语音识别失败")
      setRecording(false)
    }
  }

  const stop = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
      recognitionRef.current = null
    }
    setRecording(false)
    setInterimText("")
  }

  return { recording, start, stop, interimText }
}

function IndexPopup() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("")
  const [rawText, setRawText] = useState("")
  const [loading, setLoading] = useState(false)
  const [facts, setFacts] = useState<ExtractedFact[]>([])
  const [step, setStep] = useState<"input" | "review" | "success">("input")
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { recording, start, stop, interimText } = useSpeechRecognition(
    (text) => {
      setRawText((prev) => (prev ? prev + "\n" + text : text))
    },
    (err) => {
      setError(err)
    }
  )

  useEffect(() => {
    textareaRef.current?.focus()
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      const data = await listProjects()
      setProjects(data)
      if (data.length > 0) {
        chrome?.storage?.local?.get([LAST_PROJECT_KEY], (res) => {
          const lastId = res[LAST_PROJECT_KEY]
          const exists = data.find((p) => p.id === lastId)
          setSelectedProjectId(exists ? lastId : data[0].id)
        })
      }
    } catch (e: any) {
      setError(e.message || "加载项目失败")
    }
  }

  const handleProjectChange = (id: number) => {
    setSelectedProjectId(id)
    chrome?.storage?.local?.set({ [LAST_PROJECT_KEY]: id })
  }

  const handleExtract = async () => {
    if (!selectedProjectId || !rawText.trim()) return
    setLoading(true)
    setError(null)
    try {
      const data = await extractFacts(rawText.trim(), Number(selectedProjectId))
      setFacts(data)
      setStep("review")
    } catch (e: any) {
      setError(e.message || "提取失败")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedProjectId || !rawText.trim()) return
    setLoading(true)
    setError(null)
    try {
      await createFragment({
        project_id: Number(selectedProjectId),
        raw_content: rawText.trim(),
        source_type: "text",
        status: "active",
        facts: facts.length > 0 ? facts.map((f) => ({ category: f.category, fact: f.fact })) : undefined,
      })
      setStep("success")
      setRawText("")
      setFacts([])
    } catch (e: any) {
      setError(e.message || "入库失败")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep("input")
    setFacts([])
    setError(null)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  return (
    <div
      style={{
        width: 360,
        minHeight: 280,
        padding: 16,
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
        fontSize: 14,
        color: '#0f172a',
        background: '#f8fafc',
        boxSizing: 'border-box',
      }}
    >
      <h2 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
        AI 工作复盘助手
      </h2>

      {error && (
        <div
          style={{
            marginBottom: 10,
            padding: '8px 10px',
            background: 'rgba(239,68,68,0.08)',
            color: '#b91c1c',
            borderRadius: 8,
            fontSize: 13,
            border: '1px solid rgba(239,68,68,0.15)',
          }}
        >
          {error}
        </div>
      )}

      {step === "success" && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
          <div style={{ fontWeight: 500, marginBottom: 12, color: '#0f172a' }}>已确认入库</div>
          <button
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#4f46e5',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            再记一条
          </button>
        </div>
      )}

      {step !== "success" && (
        <>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#475569', marginBottom: 4 }}>
              所属项目
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectChange(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: 14,
                background: '#fff',
                color: '#0f172a',
              }}
            >
              <option value="" disabled>
                请选择项目
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {step === "input" && (
            <>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <textarea
                  ref={textareaRef}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="随手记录工作碎片…"
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '10px 36px 10px 10px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 14,
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    lineHeight: 1.5,
                    background: '#fff',
                    color: '#0f172a',
                  }}
                />
                <button
                  onClick={recording ? stop : start}
                  title={recording ? "停止录音" : "语音输入"}
                  style={{
                    position: 'absolute',
                    right: 8,
                    bottom: 8,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: 'none',
                    background: recording ? '#ef4444' : '#e2e8f0',
                    color: recording ? '#fff' : '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                  }}
                >
                  🎤
                </button>
              </div>

              {recording && (
                <div style={{ marginBottom: 8, fontSize: 12, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
                  正在聆听…{interimText ? ` "${interimText}"` : ""}
                </div>
              )}

              <style>{`
                @keyframes pulse {
                  0% { opacity: 1; }
                  50% { opacity: 0.4; }
                  100% { opacity: 1; }
                }
              `}</style>

              <button
                onClick={handleExtract}
                disabled={!selectedProjectId || !rawText.trim() || loading}
                style={{
                  width: '100%',
                  padding: '10px 0',
                  borderRadius: 8,
                  border: 'none',
                  background: !selectedProjectId || !rawText.trim() || loading ? '#cbd5e1' : '#4f46e5',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: !selectedProjectId || !rawText.trim() || loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? "智能提取中…" : "智能提取"}
              </button>
            </>
          )}

          {step === "review" && (
            <>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 6 }}>
                  提取结果（可手动修改）
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {facts.map((f, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 10px',
                        background: 'rgba(238,242,255,0.7)',
                        borderRadius: 8,
                        fontSize: 13,
                        border: '1px solid rgba(199,210,254,0.4)',
                      }}
                    >
                      <input
                        value={f.category}
                        onChange={(e) => {
                          const next = [...facts]
                          next[idx].category = e.target.value
                          setFacts(next)
                        }}
                        style={{
                          width: '100%',
                          fontWeight: 600,
                          color: '#4338ca',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: '1px dashed #cbd5e1',
                          marginBottom: 4,
                          padding: '2px 0',
                          fontSize: 13,
                        }}
                      />
                      <input
                        value={f.fact}
                        onChange={(e) => {
                          const next = [...facts]
                          next[idx].fact = e.target.value
                          setFacts(next)
                        }}
                        style={{
                          width: '100%',
                          color: '#334155',
                          background: 'transparent',
                          border: 'none',
                          padding: '2px 0',
                          fontSize: 13,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setStep("input")}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    color: '#334155',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  返回修改
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    borderRadius: 8,
                    border: 'none',
                    background: '#4f46e5',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? "入库中…" : "确认入库"}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default IndexPopup
