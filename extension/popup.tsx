import { useState } from "react"

function IndexPopup() {
  const [data, setData] = useState("")

  return (
    <div
      style={{
        padding: 16,
        width: 320,
        fontFamily: "system-ui, sans-serif"
      }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600 }}>
        AI 工作复盘助手
      </h2>
      <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
        插件悬浮框占位
      </p>
    </div>
  )
}

export default IndexPopup
