# AI 模型全景对比

帮助 AI 产品经理快速了解主流大模型的核心参数，做出合理的模型选型决策。

> 最后更新：2026-03-21

---

## 总览对比表

| 厂商 | 旗舰模型 | 发布日期 | 上下文窗口 | 输入价格（/百万 token） | 输出价格（/百万 token） | 多模态 | 擅长领域 |
|------|---------|---------|-----------|----------------------|----------------------|--------|---------|
| **Anthropic** | Claude Opus 4.6 | 2026-02-05 | 200K（1M GA） | $5.00 | $25.00 | 文本+图像 | 推理、编程、长文本分析 |
| **OpenAI** | GPT-5.4 Thinking | 2026-03-05 | 272K（1.05M） | $2.50 | $15.00 | 文本+图像 | 编程、推理、Agentic 工作流 |
| **Google** | Gemini 3.1 Pro | 2026-02-19 | 1M | $2.00 | $12.00 | 文本+图像+音频+视频 | 多模态推理、编程、长文档 |
| **MiniMax** | MiniMax M2.7 | 2026-03-18 | ~200K | $0.30 | $1.20 | 仅文本 | 自我进化、编程、Agent |
| **Moonshot** | Kimi K2.5 | 2026-01-27 | 256K | $0.60 | $2.50 | 文本+图像+视频 | Agent、编程、中文 |
| **阿里巴巴** | Qwen3.5-Plus | 2026-02-16 | 262K（可扩展至 1M） | ¥0.8（~$0.11） | ¥4.8（~$0.67） | 文本+图像+视频 | 中文、推理、多模态、性价比 |
| **字节跳动** | Doubao-Seed-2.0-Pro | 2026-02-14 | 256K | ¥3.2（~$0.47） | ¥16（~$2.37） | 文本+图像+视频+音频 | 多模态理解、中文、性价比 |
| **DeepSeek** | DeepSeek-V4 | 2026-03（软发布） | 1M | ~$0.14 | ~$0.28 | 文本+图像+视频+音频 | 编程、推理、多模态、极致性价比 |

> 注：人民币价格按 ¥7.2 ≈ $1 折算，实际汇率请参考当日牌价。

---

## 产品选型指南

### 按场景推荐

| 场景 | 首选 | 备选 | 说明 |
|------|------|------|------|
| **编程 / 代码生成** | Claude Opus 4.6 / GPT-5.4 Thinking | DeepSeek-V4、MiniMax M2.7 | Claude 与 GPT 编程能力最强；M2.7 SWE-Pro 56.22% |
| **复杂推理** | Claude Opus 4.6 | GPT-5.4 Thinking、Gemini 3.1 Pro | Opus 4.6 推理深度突出，GPT-5.4 Thinking 新增前置思维规划 |
| **多模态（图像+视频）** | Gemini 3.1 Pro | Doubao-Seed-2.0-Pro、DeepSeek-V4 | Gemini 原生多模态能力最全面；豆包视觉理解 SOTA；DeepSeek V4 新增原生多模态 |
| **成本敏感** | DeepSeek-V4 | GPT-5.4 Nano、Qwen3.5-Plus、Doubao-Seed-2.0-Lite | DeepSeek V4 定价断崖式领先；GPT-5.4 Nano $0.20/$1.25 适合子代理 |
| **中文场景** | Qwen3.5-Plus / Doubao-Seed-2.0-Pro | Kimi K2.5、DeepSeek-V4 | 国产模型中文能力原生优势 |
| **长文档处理** | Gemini 3.1 Pro（1M） | Claude Opus 4.6（1M GA）、DeepSeek-V4（1M） | 三者均原生支持 1M；Claude 1M 已 GA 无溢价 |
| **Agent / 工具调用** | MiniMax M2.7 | Kimi K2.5、GPT-5.4 Thinking | M2.7 自我进化能力 + Agent 基准 SOTA |
| **音频 / 语音** | Gemini 3.1 Pro | Doubao-Seed-2.0-Pro、DeepSeek-V4 | Gemini 原生支持音频输入；豆包和 DeepSeek V4 跨模态融合 |

### 性价比矩阵

```
能力 ↑
  │  ★ Claude Opus 4.6
  │  ★ GPT-5.4 Thinking   ★ Gemini 3.1 Pro
  │
  │        ★ Kimi K2.5    ★ Doubao-Seed-2.0-Pro
  │  ★ MiniMax M2.7       ★ Qwen3.5-Plus
  │
  │                          ★ DeepSeek-V4
  │
  └──────────────────────────────────→ 性价比 ↑
```

> DeepSeek V4 凭借万亿参数 + ~$0.14 输入定价，性价比断层领先。

---

## 各模型详细卡片

### Claude（Anthropic）

**公司**：Anthropic（美国）

| 模型 | 上下文 | 最大输出 | 输入价格 | 输出价格 | 特点 |
|------|--------|---------|---------|---------|------|
| **Opus 4.6** | 200K（1M GA） | 128K | $5.00 | $25.00 | 最强推理，extended thinking |
| **Sonnet 4.6** | 200K（1M GA） | 64K | $3.00 | $15.00 | 能力与 Opus 接近，成本降 40% |
| **Haiku 4.5** | 200K | 8K | $1.00 | $5.00 | 快速响应，低成本 |

**核心能力**：
- SWE-bench Verified 80.8%、Terminal-Bench 65.4%，编程能力领先
- Adaptive thinking 模式动态调整推理深度（low/medium/high/max 四档）
- 支持 prompt caching（缓存读取仅 0.1x 价格）、Batch API（50% 折扣）
- **1M 上下文窗口已正式 GA**（2026-03-13），标准定价无溢价，每请求最多 600 张图片/PDF 页
- 支持 Computer Use（桌面操作）、Web Search、Web Fetch 工具
- 支持自定义图表和内联可视化（Custom Charts）

**近期动态**（2026-03）：
- **1M 上下文 GA**（3/13）：标准定价全窗口可用，取消长上下文溢价，媒体上限从 100 提升至 600
- **Cowork** 桌面预览版上线 macOS，将 Claude Code 的 Agentic 能力扩展至知识工作场景；Pro/Max 用户可使用持久 Agent 线程
- Enterprise 计划支持自助购买，单一席位涵盖 Claude、Claude Code 和 Cowork
- 新增 HIPAA 合规版本，支持处理受保护健康信息（PHI）
- 新增 Custom Charts（自定义图表和内联可视化）
- Extended Thinking 新增 display 字段，支持省略思维内容以加速流式传输
- Opus 4.6 在 Claude Code 中默认 medium effort，支持 "ultrathink" 关键字切换 high effort
- Opus 4 和 4.1 已从 Claude Code 第一方 API 中移除

**产品集成优势**：Claude Code（CLI 编程工具）、MCP 协议生态完善；支持 AWS Bedrock、Google Vertex AI、Microsoft Foundry
**注意事项**：快速模式（fast mode）价格 6x；1M 上下文已 GA 但高并发场景仍需关注速率限制

**实践笔记 · Claude Code + Codex 协作工作流**（2026-03-14）：
- **Claude Code（Opus）负责规划层**：做任务拆解、编排终端操作、管理 Git 工作流。Opus 在跨上下文窗口的工作中效率更高，适合同时启动多个子代理并行探索代码库。
- **Codex 负责执行层**：承接具体编码任务。在长时间自主编码任务上更稳定，适合持续运行的代码生成与修改。
- **分工原则**：Claude Code = 大脑（规划 + 调度），Codex = 手（执行 + 编码）。

---

### GPT（OpenAI）

**公司**：OpenAI（美国）

| 模型 | 上下文 | 输入价格 | 输出价格 | 特点 |
|------|--------|---------|---------|------|
| **GPT-5.4 Thinking** | 272K（1.05M） | $2.50 | $15.00 | 最新旗舰，融合推理+编程+Agentic 工作流 |
| **GPT-5.4 Pro** | 272K（1.05M） | $30.00 | $180.00 | 最高能力版，专业级任务 |
| **GPT-5.4 Mini** | 400K | $0.75 | $4.50 | 接近 5.4 性能，速度 2x+，免费用户可用 |
| **GPT-5.4 Nano** | — | $0.20 | $1.25 | 最低成本，分类/提取/子代理场景 |
| **GPT-5.3 Instant** | 128K–400K | ~$1.75 | ~$14.00 | 快速日常对话 |

**核心能力**：
- GPT-5.4 Thinking 新增前置思维规划，支持中途调整，深度 Web Research 增强
- 内部投行基准从 GPT-5 的 43.7% 飙升至 GPT-5.4 Thinking 的 87.3%
- 支持 reasoning effort 四档调节、缓存输入仅 $0.25/M
- 1.05M 上下文窗口正式可用（超过 272K 输入时定价：输入 2x、输出 1.5x）
- Batch 和 Flex 定价均为标准价格的 50%

**近期动态**（2026-03）：
- **GPT-5.4 Mini 和 Nano 发布**（3/17）：Mini 在 SWE-Bench Pro 和 OSWorld-Verified 上接近 GPT-5.4，速度 2x+；Nano 为最小最便宜版本，适合子代理场景
- GPT-5.4 已在 Codex 中上线，取代 GPT-5.3 Codex 成为默认模型
- **ChatGPT for Excel** beta 上线，集成 GPT-5.4 Thinking 的金融分析能力
- GPT-5.1 系列（Instant/Thinking/Pro）于 3/11 从 ChatGPT 退休
- GPT-4o、GPT-4.1、GPT-4.1 mini、o4-mini 以及 GPT-5（Instant & Thinking）已退休

**产品集成优势**：ChatGPT 生态最大、API 兼容性最好、企业版成熟
**注意事项**：旧模型大批退休（GPT-5.1 及更早），需注意 API 迁移；Mini/Nano 为 subagent 时代而生

---

### Gemini（Google）

**公司**：Google DeepMind（美国）

| 模型 | 上下文 | 输入价格 | 输出价格 | 特点 |
|------|--------|---------|---------|------|
| **Gemini 3.1 Pro** | 1M | $2.00 | $12.00 | 最新旗舰，ARC-AGI-2 评测 #1 |
| **Gemini 3 Flash** | 200K | $0.50 | $3.00 | 高速推理，性价比好 |
| **Gemini 3.1 Flash Lite** | 1M | $0.25 | $1.50 | 超低成本，315 tokens/s，6 项基准 #1 |
| **Gemini 2.5 Flash**（仍可用） | 1M | $0.30 | $2.50 | 236 tokens/s，极快 |

**核心能力**：
- 原生支持文本、图像、音频、视频输入，多模态能力最全面
- 1M token 上下文窗口稳定可用（非 beta），适合长文档分析
- ARC-AGI-2 评分 77.1%（超出 Gemini 3 Pro 的两倍），推理能力显著提升
- 支持 Deep Think 模式（多路并行思维链）
- `media_resolution` 参数提供精细的多模态视觉处理控制

**近期动态**（2026-03）：
- Gemini 3.1 Flash-Lite Preview 正式发布（2026-03-03），TTFA 提速 2.5x，输出速度提升 45%
- **Gemini 3 Pro Preview 已于 2026-03-09 关停**，需迁移至 3.1 Pro
- Gemini CLI 持续更新中

**产品集成优势**：与 Google Cloud / Vertex AI 深度集成、Android 生态原生支持
**注意事项**：使用 Gemini 3 Pro 的项目需立即迁移至 3.1 Pro

---

### MiniMax（MiniMax）

**公司**：MiniMax（中国·上海）

| 模型 | 上下文 | 输入价格 | 输出价格 | 特点 |
|------|--------|---------|---------|------|
| **MiniMax M2.7** | ~200K | $0.30 | $1.20 | 首个自我进化模型，SWE-Pro 56.22% |
| **MiniMax M2.5** | 205K | $0.30 | $1.20 | 开源 MoE，Agent 能力 SOTA |
| **MiniMax M2.1** | 200K | $0.30 | $1.20 | 中间版，编程和移动端开发增强 |

**核心能力**：
- MoE 架构：总参数 2300 亿，每 token 仅激活 100 亿，推理效率高
- M2.7 为首个**自我进化**模型：自主参与 30–50% 的 RL 训练工作流（日志分析、调试、指标优化）
- M2.7 SWE-Pro 56.22%（接近 Opus 最佳水平）、SWE Multilingual 76.5、VIBE-Pro 55.6%
- M2.7 幻觉大幅降低（AA-Omniscience Index: +1 vs M2.5 的 −40）
- 复杂技能（>2000 Token）场景下 97% 技能遵从率
- 最大输出 131K tokens，开源权重（MIT 协议），可自部署
- 价格仅为 Claude Opus 4.6 的约 1/63

**近期动态**（2026-03）：
- **M2.7 发布**（3/18）：首个自我进化模型，可自主构建 Agent 团队、动态工具搜索，完成高复杂度生产力任务
- M2.5 发布（2/12）：编程能力媲美 Claude Opus 4.6，任务速度比 M2.1 快 37%
- M2.1 发布：显著增强原生 Android/iOS 开发能力，兼容 Claude Code、Droid、Cline 等框架

**产品集成优势**：海螺 AI 对话产品；Hailuo 视频生成（独立产品线）
**注意事项**：仅支持文本输入，多模态需使用 MiniMax 其他产品线

---

### Kimi（月之暗面 Moonshot AI）

**公司**：Moonshot AI（中国·北京）

| 模型 | 上下文 | 输入价格 | 输出价格 | 特点 |
|------|--------|---------|---------|------|
| **Kimi K2.5** | 256K | $0.60 | $2.50 | 多模态，Agent Swarm 系统 |
| **Kimi K2 Thinking** | 256K | ~$0.80 | ~$3.50 | 深度推理，HLE 44.9% |
| **Kimi K2 Turbo** | 256K | $1.15 | $8.00 | 高速推理 |

**核心能力**：
- 1 万亿参数 MoE 架构，每次请求激活 320 亿参数
- K2.5 新增 MoonViT 视觉编码器（4 亿参数），原生支持图像和视频
- Agent Swarm 系统可并行调度最多 100 个子 Agent
- K2.5 基准：HLE 50.2%（含工具）、SWE-Bench Verified 76.8%、AIME 2025 96.1%
- 支持四种运行模式：Instant、Thinking、Agent、Agent Swarm

**近期动态**（2026-03）：
- K2.5 上线 **Cloudflare Workers AI**（3/19），成为该平台首个前沿级开源模型
- 开源权重持续扩大生态，支持 256K 上下文、多轮工具调用、视觉输入、结构化输出

**产品集成优势**：API 兼容 OpenAI SDK 和 Anthropic SDK（drop-in 替换）；Kimi 用户产品中文体验好；Cloudflare Workers AI 可用
**注意事项**：支持 web search（每次 $0.005 + token 费用）

---

### 通义千问 Qwen（阿里巴巴）

**公司**：阿里巴巴（中国·杭州）

| 模型 | 上下文 | 输入价格 | 输出价格 | 特点 |
|------|--------|---------|---------|------|
| **Qwen3.5-Plus** | 262K（可扩展至 1M） | ¥0.8（~$0.11） | ¥4.8（~$0.67） | 新旗舰，397B-A17B MoE，原生多模态 |
| **Qwen3.5-Flash** | 262K（可扩展至 1M） | ¥0.2（~$0.03） | ¥2（~$0.28） | 超低成本 |
| **Qwen3-Max** | 256K | ¥2.5（~$0.35） | ¥10（~$1.40） | 纯文本旗舰，融合搜索+代码解释器 |

**核心能力**：
- Qwen3.5-Plus 总参数 397B、激活仅 17B，性能超越万亿参数 Qwen3-Max
- MMLU-Pro 87.8（超 GPT-5.2）、GPQA 88.4（超 Claude 4.5），以不到 40% 参数量比肩国际一流
- Qwen3.5 系列原生多模态（文本+图像+视频），线性注意力 + MoE 混合架构
- 阿里云百炼平台提供每个模型 100 万免费 token 额度
- 支持阶梯计费（按输入 token 数分档），Batch 调用半价

**近期动态**（2026-03）：
- Qwen3.5 旗舰版 2026-02-16 发布，中型系列 2026-02-24，小型系列 2026-03-02
- Qwen3.5-Plus 定价仅为 Gemini 3 Pro 的 1/18，性价比极高
- Qwen3.5-Max 旗舰版预计近期发布

**产品集成优势**：阿里云百炼平台生态完善，与阿里云产品深度集成
**注意事项**：Qwen3-Max 仅支持文本，多模态需使用 Qwen3.5 系列

---

### 豆包 Doubao（字节跳动）

**公司**：字节跳动（中国·北京）

| 模型 | 上下文 | 输入价格 | 输出价格 | 特点 |
|------|--------|---------|---------|------|
| **Doubao-Seed-2.0-Pro** | 256K | ¥3.2（~$0.47） | ¥16（~$2.37） | 旗舰全能，多模态 SOTA |
| **Doubao-Seed-2.0-Lite** | 256K | ¥0.6（~$0.08） | ~¥3（~$0.42） | 轻量高效 |
| **Doubao-Seed-2.0-Mini** | 256K | — | — | 超轻量 |
| **Doubao-Seed-2.0-Code** | 256K | — | — | 专精编程 |

**核心能力**：
- 原生多模态（文本+图像+视频+音频），跨模态融合能力强
- 多模态基准 SOTA：VideoMME 89.5、MathVision 88.8、12/19 项基准第一
- IMO/CMO 数学奥赛金牌、ICPC 编程竞赛金牌，Putnam 基准超越 Gemini 3 Pro
- 豆包 2.0 为首次跨代升级，涵盖 Pro/Lite/Mini/Code 四款模型的完整矩阵

**近期动态**（2026-03）：
- 豆包 2.0 已在豆包 App、电脑客户端和网页版上线，选择「专家」模式即可体验 Pro 版
- Pro 按输入长度区间定价，32K 以内为 ¥3.2/M

**产品集成优势**：火山引擎平台、服务数亿豆包用户、与字节生态集成
**注意事项**：Pro 版定价在国产模型中偏高，Lite 版本性价比更突出

---

### DeepSeek（深度求索）

**公司**：DeepSeek（中国·杭州）

| 模型 | 上下文 | 输入价格 | 输出价格 | 特点 |
|------|--------|---------|---------|------|
| **DeepSeek-V4** | 1M | ~$0.14 | ~$0.28 | 万亿参数旗舰，原生多模态，开源 |
| **DeepSeek-V3.2** | 128K | ¥2（~$0.28） | ¥3（~$0.42） | 上代旗舰，仍可用 |
| **DeepSeek-R1** | 128K | ¥3.5（~$0.50） | ¥16（~$2.18） | 深度推理 |

**核心能力**：
- **V4（新）**：万亿参数 MoE 架构，~320 亿激活参数，原生多模态（文本+图像+视频+音频）
- V4 上下文窗口从 128K 跃升至 1M，为 Huawei Ascend 芯片深度优化
- V4 架构创新：Manifold-Constrained Hyper-Connections（训练稳定性）、Engram Conditional Memory（高效长上下文检索）、增强版 Sparse Attention + Lightning Indexer
- V4 定价约为 GPT-5.4 的 1/20，延续"价格屠夫"定位
- V3.2 仍可用，编程和推理均衡；R1 在数学和编程竞赛中表现出色
- 全系列开源（权重公开），支持自部署

**近期动态**（2026-03）：
- **DeepSeek V4 于 3 月初软发布**，从纯文本升级为原生多模态，上下文窗口从 128K 扩展至 1M
- 发布过程曲折：多次预期发布窗口延迟，3/9 出现疑似 "V4 Lite" 更新，正式确认信息有限
- 社区对自报基准持怀疑态度，1M 上下文和定价受到欢迎
- R2（下一代推理模型）预计与 V4 同步或紧随发布，尚未正式确认

**产品集成优势**：API 兼容 OpenAI 格式、开源社区活跃、自部署成本极低
**注意事项**：V4 处于软发布阶段，API 稳定性、基准可靠性和生态工具支持均需观察

---

## 更新日志

| 日期 | 变更摘要 |
|------|---------|
| 2026-03-21 | **重要更新**：MiniMax M2.7 发布（3/18，首个自我进化模型，SWE-Pro 56.22%）；GPT-5.4 Mini（$0.75/$4.50）和 Nano（$0.20/$1.25）发布（3/17）；Claude 1M 上下文正式 GA 无溢价（3/13），新增 Custom Charts 和持久 Agent 线程；Kimi K2.5 上线 Cloudflare Workers AI（3/19）；DeepSeek V4 状态修正为软发布；GPT-5.1 系列退休。更新选型指南。 |
| 2026-03-14 | 新增 Claude Code + Codex 协作工作流实践笔记（Claude Code/Opus 负责规划编排，Codex 负责长时间自主编码）。 |
| 2026-03-10 | **重大更新**：DeepSeek V4 正式发布（万亿参数、原生多模态、1M 上下文、定价 ~$0.14/$0.28）；GPT-5.4 新增 Thinking 模式和 Pro 版（$30/$180），旧模型大批退休；Gemini 3 Pro Preview 已于 3/9 关停，3.1 Flash-Lite 正式发布；Qwen3.5-Plus 升级为阿里旗舰（397B-A17B MoE，超越 Qwen3-Max）；MiniMax 发布 M2.1 中间版；Claude 新增 Cowork 桌面预览和企业自助购买。更新选型指南和性价比矩阵。 |
| 2026-03-07 | 初版创建。覆盖 8 家模型截至 2026 年 3 月的最新信息，包括 Claude Opus/Sonnet 4.6、GPT-5.4/5.3 Codex、Gemini 3.1 Pro、MiniMax M2.5、Kimi K2.5、Qwen3-Max/3.5、Doubao-Seed-2.0-Pro、DeepSeek-V3.2。 |
