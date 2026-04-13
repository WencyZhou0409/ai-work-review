import { useEffect, useRef, useState } from "react"
import { createFragment, extractFacts, listProjects, type ExtractedFact, type Project } from "./api"

const LAST_PROJECT_KEY = "last_project_id"

function useSpeechRecognition(onResult: (text: string) => void) {
  const [recording, setRecording] = useState(false)
  const recognitionRef = useRef<any>(null)

  const start = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("您的浏览器不支持语音输入")
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = "zh-CN"
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: any) => {
      let final = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript
        }
      }
      if (final) onResult(final)
    }

    recognition.onerror = (e: any) => {
      console.error("Speech error:", e)
      setRecording(false)
    }

    recognition.onend = () => {
      setRecording(false)
    }

    recognition.start()
    recognitionRef.current = recognition
    setRecording(true)
  }

  const stop = () => {
    recognitionRef.current?.stop()
    setRecording(false)
  }

  return { recording, start, stop }
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

  const { recording, start, stop } = useSpeechRecognition((text) => {
    setRawText((prev) => (prev ? prev + " " + text : text))
  })

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
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: 14,
        color: "#1f2937",
        background: "#fff",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600 }}>
        AI 工作复盘助手
      </h2>

      {error && (
        <div
          style={{
            marginBottom: 10,
            padding: "8px 10px",
            background: "#fef2f2",
            color: "#b91c1c",
            borderRadius: 6,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {step === "success" && (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
          <div style={{ fontWeight: 500, marginBottom: 12 }}>已确认入库</div>
          <button
            onClick={handleReset}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: "#4f46e5",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            再记一条
          </button>
        </div>
      )}

      {step !== "success" && (
        <>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
              所属项目
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectChange(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                fontSize: 14,
                background: "#fff",
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
              <div style={{ position: "relative", marginBottom: 12 }}>
                <textarea
                  ref={textareaRef}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="随手记录工作碎片…"
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "10px 36px 10px 10px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    resize: "vertical",
                    boxSizing: "border-box",
                    lineHeight: 1.5,
                  }}
                />
                <button
                  onClick={recording ? stop : start}
                  title={recording ? "停止录音" : "语音输入"}
                  style={{
                    position: "absolute",
                    right: 8,
                    bottom: 8,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: "none",
                    background: recording ? "#ef4444" : "#e5e7eb",
                    color: recording ? "#fff" : "#374151",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                  }}
                >
                  🎤
                </button>
              </div>

              <button
                onClick={handleExtract}
                disabled={!selectedProjectId || !rawText.trim() || loading}
                style={{
                  width: "100%",
                  padding: "10px 0",
                  borderRadius: 8,
                  border: "none",
                  background: !selectedProjectId || !rawText.trim() || loading ? "#c7c7c7" : "#4f46e5",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: !selectedProjectId || !rawText.trim() || loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "智能提取中…" : "智能提取"}
              </button>
            </>
          )}

          {step === "review" && (
            <>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 6 }}>
                  提取结果（可手动修改）
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {facts.map((f, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "8px 10px",
                        background: "#f3f4f6",
                        borderRadius: 6,
                        fontSize: 13,
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
                          width: "100%",
                          fontWeight: 600,
                          color: "#4f46e5",
                          background: "transparent",
                          border: "none",
                          borderBottom: "1px dashed #d1d5db",
                          marginBottom: 4,
                          padding: "2px 0",
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
                          width: "100%",
                          color: "#374151",
                          background: "transparent",
                          border: "none",
                          padding: "2px 0",
                          fontSize: 13,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setStep("input")}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    color: "#374151",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  返回修改
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 8,
                    border: "none",
                    background: "#4f46e5",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: loading ? "not-allowed" : "pointer",
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
