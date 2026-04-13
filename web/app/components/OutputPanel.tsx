"use client";

import { useState } from "react";
import type { ReviewResult } from "@/app/types";

interface OutputPanelProps {
  result: ReviewResult | null;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-100"
    >
      {copied ? "已复制" : "复制"}
    </button>
  );
}

export default function OutputPanel({ result }: OutputPanelProps) {
  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm p-6 border-t lg:border-t-0 lg:border-l bg-white">
        <p>在左侧勾选碎片后，点击「生成复盘」</p>
        <p className="mt-1">即可在此处查看汇报模式与简历模式</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white border-t lg:border-t-0 lg:border-l p-4 space-y-4">
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">视角 A：汇报模式</h3>
          <CopyButton text={result.report_mode} />
        </div>
        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {result.report_mode}
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">视角 B：简历模式</h3>
          <CopyButton text={result.resume_mode} />
        </div>
        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {result.resume_mode}
        </div>
      </div>
    </div>
  );
}
