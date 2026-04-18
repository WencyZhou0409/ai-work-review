from __future__ import annotations

import json
from typing import Any

import httpx

from app.core.config import settings


async def _chat_completion_anthropic(
    messages: list[dict[str, str]],
    temperature: float = 0.3,
) -> str:
    from anthropic import AsyncAnthropic

    client = AsyncAnthropic(
        api_key=settings.ANTHROPIC_API_KEY,
        base_url=settings.ANTHROPIC_BASE_URL or None,
    )
    response = await client.messages.create(
        model=settings.ANTHROPIC_MODEL,
        messages=messages,
        temperature=temperature,
        max_tokens=4096,
    )
    return response.content[0].text


async def _chat_completion_openai(
    messages: list[dict[str, str]],
    temperature: float = 0.3,
    response_format: dict[str, str] | None = None,
) -> str:
    headers = {
        "Authorization": f"Bearer {settings.KIMI_API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "KimiCLI/1.0",
    }
    payload: dict[str, Any] = {
        "model": settings.KIMI_MODEL,
        "messages": messages,
        "temperature": temperature,
    }
    if response_format:
        payload["response_format"] = response_format

    url = settings.KIMI_BASE_URL.rstrip("/") + "/v1/chat/completions"

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


async def chat_completion(
    messages: list[dict[str, str]],
    temperature: float = 0.3,
    response_format: dict[str, str] | None = None,
) -> str:
    """调用 LLM 服务。优先使用 Anthropic SDK（兼容 Kimi 代理），否则 fallback 到 OpenAI 兼容接口。"""
    if settings.ANTHROPIC_API_KEY:
        return await _chat_completion_anthropic(messages, temperature)
    return await _chat_completion_openai(messages, temperature, response_format)


def build_extract_prompt(project_name: str, project_goal: str | None, raw_text: str) -> str:
    goal_line = project_goal if project_goal else "暂无明确目标"
    return f"""Role
你是一位服务于顶尖互联网大厂策略产品经理的"冷酷且精准"的业务分析助理。
你的任务是从用户极度碎片化、口语化的工作记录（如开会语音转文字、跑SQL时的吐槽）中，榨取高密度的业务事实。

Context
当前碎片所属的项目标签：{project_name}
该项目的核心业务目标：{goal_line}

Rules
1. 绝对忠实原则：禁止捏造、虚构、推断任何用户未提及的数据、逻辑或因果关系。
2. 零情绪原则：禁止使用任何主观评价词（如"顺利地"、"完美地"）、奉承词或情绪性语气。只输出客观事实。
3. 结构化归类：你需要判断用户的输入属于以下哪种【业务要素】，并进行分类提取：
  - [背景/问题]：发现了什么业务卡点或数据异常？
  - [策略/动作]：提出了什么备选方案、做了什么决策或执行动作？
  - [数据/结果]：产出了什么量化指标或验收结果？
  - [其他洞察]：无法归入上述三类的有价值的思考。

Task
阅读用户的原始输入，剔除所有口语废话（"然后"、"就是说"），将其提炼为结构化的事实短句（每句不超过 20 字）。总数不超过 10 条。

Output Format (JSON)
{{
  "extracted_facts": [
    {{
      "category": "[填写业务要素类别]",
      "fact": "[提炼后的事实短句]"
    }}
  ]
}}

User Input
{raw_text}
"""


def build_review_prompt(
    project_name: str, project_goal: str | None, fragments_json: str
) -> str:
    goal_line = project_goal if project_goal else "暂无明确目标"
    return f"""Role
你是一位互联网领域的产品经理，擅长数据分析和逻辑链条梳理。
你的任务是将用户提供的一系列离散的"工作碎片事实"，重组为两套具备极强业务穿透力的标准化文档：一套用于工作汇报，一套用于简历条目。

Context
项目名称：{project_name}
项目核心业务目标：{goal_line}
以下是用户确认参与本次复盘的【工作碎片事实列表】（已按时间排序并打上要素标签）：
{fragments_json}

Rules
1. 事实围墙：仅能使用上方【碎片列表】中出现的信息。严禁脑补、虚构任何未提供的指标、动作和成果。严禁进行跨碎片的虚假因果连结（除非碎片逻辑上明显构成因果）。
2. 反讨好机制：禁止使用任何主观形容词（如"卓越的"、"显著的"）、奉承或价值回声。所有输出必须像技术文档一样冷静、精确。
3. 逻辑骨架：如果碎片中缺乏结果数据，只陈述动作；如果缺乏动作，只陈述结果。不要试图去掩盖信息的缺失。

Task 1: 生成【视角 A：工作汇报模式】
要求：撰写一段结构化文本（不超过 300 字）。
- 逻辑框架：借鉴增强版 STAR 模型，按照"业务卡点/数据异常 -> 备选方案/执行策略 -> 过程推进 -> 可量化/可归因结果"的顺序书写。
- 风格：精炼、客观，注重"Why（为什么这么做）"和"How（怎么做）"。

Task 2: 生成【视角 B：简历条目模式】
要求：生成 1-3 条 Bullet Points。
- 每一条必须以 3-6 字的【专业技能小标题】开头（如：商业路径设计 / A-B实验策略 / 漏斗转化优化）。
- 每一条必须遵循 STAR 法则，以动词开头（如：负责、牵头、搭建、优化）。
- 每一条内容必须包含明确的业务逻辑，如有数据必须突出（Markdown 加粗）。
- 禁止使用第一人称。字数控制在单条 80-120 字。

Output Format
严格按照以下格式输出：
[视角 A：汇报模式]
(汇报正文)
[视角 B：简历模式]
- 【小标题】(具体内容)
- 【小标题】(具体内容)
"""
