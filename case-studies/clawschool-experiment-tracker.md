# ClawSchool 实验跟踪

> 实验目标：验证 AI 在无人干预下，从 PRD 到可推向市场的产品能做到什么程度。
> 产品仓库：`teamo-lab/clawschool-gstack`
> 技能仓库：`teamo-lab/teamo-runner-agency-test`（private）
> 启动日期：2026-03-25

---

## 部署环境信息

### 服务器

| 项目 | 值 |
|------|------|
| 平台 | 腾讯云 CVM（香港） |
| 实例 ID | ins-5ee3ymo2 |
| 实例名称 | ama-dev |
| 服务器 IP | 43.159.0.211 |
| 访问地址 | https://dev.askmanyai.cn |
| 部署方式 | **TAT（腾讯自动化助手），不用 SSH** |
| 现有项目路径 | /home/work/ |
| 启动脚本 | /home/work/run.sh |
| Docker 配置 | /home/work/docker-compose.yml |

### TAT 使用方式

```bash
# tccli 路径
/Users/shufanli/Library/Python/3.9/bin/tccli

# 在服务器上执行命令
tccli tat RunCommand --region ap-hongkong \
  --InstanceIds '["ins-5ee3ymo2"]' \
  --Content "$(echo -n '要执行的命令' | base64)" \
  --CommandType SHELL --Timeout 600

# 查看执行结果
tccli tat DescribeInvocations --region ap-hongkong \
  --InvocationIds '["inv-xxx"]'

# 查看命令输出
tccli tat DescribeInvocationTasks --region ap-hongkong \
  --InvocationTaskIds '["invt-xxx"]'
# Output 字段需要 base64 解码
```

### 支付配置（dev 环境）

| 支付方式 | 密钥位置 |
|---------|---------|
| Stripe | .env.dev 中（STRIPE_API_KEY / STRIPE_WEBHOOK_SECRET） |
| 支付宝 | 服务器 docker-compose.yml 中（APPID + 证书路径在 /home/work/data/ali/） |

### 域名

| 环境 | 域名 | 状态 |
|------|------|------|
| 生产 | clawschool.teamolab.com | ⬜ 未配置（Agent 自行在腾讯云 DNS 配置） |
| 开发 | dev.clawschool.teamolab.com | ⬜ 未配置 |

### 本地工具

| 工具 | 路径 | 状态 |
|------|------|------|
| tccli | /Users/shufanli/Library/Python/3.9/bin/tccli | ✅ 已配置 API 密钥 |
| OpenClaw CLI | /opt/homebrew/bin/openclaw | ✅ 已接入飞书 |
| Playwright | ~/Library/Caches/ms-playwright/chromium-1208 | ✅ |
| clawhub CLI | npx clawhub@latest | ✅ |

---

## 实验设计

### 控制变量
- PRD 固定不变（龙虾学校_MVP_PRD.md）
- 对比组：第一次实验（单 Agent，2026-03-25）

### 实验组（第二次）
- 三 Agent 架构（Planner + Generator + Evaluator）
- run-forever.sh 永续循环
- Evaluator 含 OpenClaw 真实端到端测试
- TAT 部署（不用 SSH）

---

## 实验记录

### 第一次实验（2026-03-25，单 Agent）

**结果：失败**

- 前端 6 页面 + 后端 11 API 完成
- 但：未部署到服务器、无域名、核心闭环未真实测试
- 40% 时间浪费在产品审视上（用户已说跳过）
- SSH 失败后放弃正确路径，转向 cloudflared 临时方案
- "10/10 API 测试通过"但核心用户流程没跑通
- 详细复盘见 `clawschool-gstack/POSTMORTEM.md`

### 第二次实验（2026-03-26，三 Agent）

**仓库：** `teamo-lab/clawschool-three-agents-test`

**结果：功能开发成功，部署未完成**

#### 时间线
- 第 1 轮：Planner 拆出 7 个 Sprint（只有功能，没有部署和埋点）
- 第 1-7 轮：Generator 完成 7 个 Sprint，Evaluator 逐轮打回修复
- 第 8 轮：连续达标，但进入空转——**Planner 没规划部署 Sprint**
- 人工介入：手动追加 Sprint 8（部署）+ Sprint 9（埋点）
- 第 11 轮：Generator 完成 Sprint 8/9（写了 Dockerfile + docker-compose.yml + 埋点系统）
- 第 12-14 轮：继续空转——**Generator 写了部署文件但从未执行 TAT 部署命令**

#### 发现的问题

| # | 问题 | 根因 | 影响 |
|---|------|------|------|
| 1 | **Planner 没规划部署 Sprint** | Planner prompt 只说"拆成 Sprint"，没强调必须包含部署和埋点 | 功能全做完但产品没上线，空转 3 轮浪费 token |
| 2 | **Generator 写了 Dockerfile 但不执行部署** | Generator 把"写 docker-compose.yml"当成"部署完成"，没有用 TAT 在服务器上执行 | Sprint 8 验收标准写了"docker-compose up 成功"但 Evaluator 没验证远程服务器 |
| 3 | **Evaluator 没验证远程部署** | Evaluator 只测了 localhost，没检查服务器 43.159.0.211 上是否真的跑起来了 | "部署 Sprint 达标"是虚假达标 |
| 4 | **连续达标后空转不结束** | run-forever.sh 的结束条件是 NEXT_STEP.md 包含"全部完成"，但 NEXT_STEP.md 写的是"下一步：部署到服务器" | 不触发结束也不触发新动作，持续烧 token |
| 5 | **Generator 不主动读技能仓库** | 和第一次实验一样的问题——急于写代码，不先读 skills/05-deployment.md 里的 TAT 命令 | 有现成方案但不用 |

#### 做到了什么（对比第一次）

| 维度 | 第一次（单 Agent） | 第二次（三 Agent） |
|------|-------------------|----------------------|
| Sprint 规划 | ❌ 没有 | ✅ 7 个 Sprint + 验收标准 |
| 功能完成度 | 前端 6 页 + 后端 11 API | ✅ 9 Sprint 全部完成，全部验收通过 |
| 自评偏高 | "10/10 通过"但核心闭环没跑 | ✅ Evaluator 7 轮打回逐轮修复 |
| XSS 发现 | ❌ | ✅ 3 处 XSS 被发现并修复 |
| 视觉质量 | 未验证 | ✅ 9/10 逐项对照 DESIGN.md |
| OG 图片中文 | ❌ | ✅ 发现→bundled Noto Sans CJK 修复 |
| 埋点 | 自建基础版 | ✅ 完整漏斗埋点 + 看板 API |
| Docker 化 | 有但没跑 | 有但没跑（同样的问题） |
| **真实部署** | ❌ cloudflared 临时方案 | ❌ 没执行 TAT |
| **核心闭环** | ❌ 从没测过 | ⚠️ API 模拟通过，OpenClaw 未实测 |

#### 需要改进的

1. **Planner prompt 必须强制包含部署和埋点 Sprint** — 不能只规划功能
2. **部署 Sprint 的验收标准必须是"远程服务器可访问"** — 不是"Dockerfile 存在"
3. **Evaluator 对部署类 Sprint 必须验证远程** — 用 TAT 执行 curl 确认，或 /browse 打开服务器 IP
4. **连续达标 3 轮后如果还有未完成的下一步，应该强制 Generator 执行** — 不是继续空转
5. **Generator prompt 要强制先读技能文档再动手** — "做部署前必须先读 skills/05-deployment.md"

---

## 关键决策记录

| 日期 | 决策 | 理由 |
|------|------|------|
| 2026-03-25 | 支付用 Stripe 而非支付宝 | 支付宝自动化测试难跑通 |
| 2026-03-25 | 技能优先级：找 > 造 > 求助 | 避免从零裸写 |
| 2026-03-26 | 部署用 TAT 不用 SSH | 第一次实验 SSH 超时导致部署失败 |
| 2026-03-26 | Evaluator 加入 OpenClaw 真实测试 | 第一次实验核心闭环从没跑通 |
| 2026-03-26 | 三 Agent 架构替代单 Agent | 第一次实验证明自评偏高、容易停下来 |

---

*来源：AI主导产品开发方案规划会议（2026-03-25 16:30）*
