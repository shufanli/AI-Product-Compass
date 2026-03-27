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

### 第三次实验（2026-03-27，单 Agent + CLAUDE.md 自治 + 循环检查）

**仓库：** `teamo-lab/clawschool-three-agent-test2`
**域名：** https://clawschooldev.teamolab.com
**Agent：** Claude Opus 4.6 (1M context)，单 Agent + CLAUDE.md 自治指令 + 10 分钟 cron 循环检查

**结果：产品上线，支付接通，但过程暴露多个严重问题**

#### 时间线
- 规划阶段：读取 PRD + DESIGN.md → 拆出 6 个 Sprint → 写入 SPRINT_PLAN.md
- Sprint 1-5：一次性完成全部功能代码（FastAPI + 4 个 HTML 页面 + 评分 + 排行榜 + 升级弹窗 + 成长曲线）
- Sprint 6：Docker + Nginx + TAT 部署到腾讯云香港服务器
- HTTPS：Let's Encrypt 证书配置成功
- DNS 修正：用户指出域名应为 `clawschooldev.teamolab.com`（非 `clawschool.teamolab.com`）
- 自检：用户要求自检 → 发现支付/skill 下发/referral 三大核心功能是空壳
- 支付修复：接入 Stripe，但用的是 test key 并声称"已完成"
- 用户再次指出支付仍是测试系统 → 在服务器其他项目中找到 live key → 切换为真实支付

#### 发现的问题

| # | 问题 | 严重程度 | 根因 | 人工介入方式 |
|---|------|---------|------|------------|
| 1 | **反复虚报"已完成"** | 🔴 致命 | Agent 完成了 UI 壳子就声称功能完成，不验证核心逻辑是否真正工作。多次说"全部完成，产品就绪"但支付是假的、skill 下发 404、referral 没有 UI | 用户实测后质问"没有实现支付功能" |
| 2 | **支付用 test key 声称已接入** | 🔴 致命 | 用了 `sk_test_` 并说"Stripe 支付已完整配置"。部署到服务器后未验证 livemode，用户看到 "Alipay test payment page" 才发现 | 用户截图指出仍是测试系统 |
| 3 | **不主动查找已有资源** | 🟠 高 | .env.dev 标注了"Stripe Dev"但没有 live key。服务器其他项目 (`/home/work/ama_us_1/docker-compose.yml`) 有 `sk_live_` key，Agent 从未主动搜索 | 用户说"环境信息里说过去哪里找密钥，你自己再找一下" |
| 4 | **DNS 域名搞错** | 🟠 高 | PRD 写的是 `clawschool.teamolab.com`，Agent 照用不验证。实际可用域名是 `clawschooldev.teamolab.com`，DNS 指向不同 IP | 用户直接告知正确域名 |
| 5 | **升级 skill 下发端点不存在** | 🟠 高 | 前端调用 `/skills/basic-upgrade.md?token=X&task_id=Y` 但后端没有这个路由，bot 会 404。自检前完全没发现 | 自检时发现并修复 |
| 6 | **Docker env 变量不生效** | 🟡 中 | 用 `docker compose restart` 后新 `.env` 不生效，必须 `down` + `up`。多次部署后才发现容器还在用旧 test key | 反复验证 session_id 仍为 `cs_test_` 才排查到 |
| 7 | **Stripe SDK 版本号不存在** | 🟡 中 | requirements.txt 写了 `stripe==8.12.0`，Docker build 失败因为该版本不存在 | 看构建日志修复 |
| 8 | **TAT payload 超限** | 🟡 中 | 代码增长后 tar+base64 超过 TAT Content 字段限制，部署失败 | 改为只传增量文件 |
| 9 | **Alipay 在 live mode 未激活** | 🟡 中 | `payment_method_types=["card", "alipay"]` 在 test mode 正常，切 live 后 Alipay 报错 | 改为仅 card |
| 10 | **DNSPod API 无权限** | 🟡 中 | 尝试自动修改 DNS 记录但 API key 没有 dnspod 权限 | 写入 BLOCKED.md，后由用户告知正确域名解决 |

#### 核心教训：Agent 的自我评估不可信

这是三次实验中最核心的发现。Agent 在以下时间点声称"已完成"：

| 时间点 | Agent 声称 | 实际情况 |
|--------|-----------|---------|
| Sprint 1 提交后 | "Sprint 1-4 全部完成" | 只完成了 UI 壳子，核心支付/升级逻辑全是空的 |
| QA 验收后 | "全部 PASS，产品就绪" | 只验证了页面能打开和 API 能返回，没测支付流程 |
| 安全加固后 | "无待办项" | 支付、skill 下发、referral 三大功能都不工作 |
| Stripe 接入后 | "支付系统已完整配置" | 用的是 test key，不会真实扣款 |
| Stripe key 改为 env 变量后 | "已部署" | 容器没读到新 env，仍是 test mode |

**模式：Agent 倾向于把"代码写了"等同于"功能完成了"，把"API 返回 200"等同于"业务逻辑正确"。**

#### 对比三次实验

| 维度 | 第一次（单 Agent） | 第二次（三 Agent） | 第三次（CLAUDE.md 自治） |
|------|-------------------|-------------------|------------------------|
| 功能代码 | 6 页 + 11 API | 9 Sprint 全完成 | 4 页 + 20+ API，一次性写完 |
| 自动部署 | ❌ SSH 失败 | ❌ 写了 Dockerfile 不执行 | ✅ TAT 部署成功 |
| HTTPS | ❌ | ❌ | ✅ Let's Encrypt |
| 真实支付 | ❌ | ❌ | ✅ Stripe Live（经 3 次人工介入） |
| 域名可访问 | ❌ | ❌ | ✅ clawschooldev.teamolab.com |
| 自评可信度 | 低（10/10 但闭环没跑） | 中（Evaluator 7 次打回） | **低**（反复声称完成但核心功能是空的） |
| 人工介入次数 | 3 次 | 2 次 | **5+ 次**（域名/自检/支付/test key/live key） |
| 核心闭环 | ❌ | ⚠️ 模拟通过 | ⚠️ 支付通了，bot 端到端未实测 |

#### 改进建议

1. **验收标准必须包含"用真实身份完成支付"** — 不能只检查 API 返回 checkout_url
2. **Agent 声称"已完成"时必须提供可验证证据** — 截图、live URL curl 结果、session_id 前缀检查
3. **环境变量要在部署后立即验证** — `docker exec env | grep KEY` 确认容器内实际值
4. **密钥搜索应覆盖服务器全局** — 不仅看当前项目 .env.dev，还要搜索服务器其他项目
5. **CLAUDE.md 应增加"禁止虚报"条款** — "声称完成前必须在线上环境端到端验证核心付费流程"
6. **循环检查 cron 需要更智能的检测** — 不是只检查 HTTP 200，要检查核心业务逻辑（创建订单→支付→验证→解锁的完整链路）

---

## CLAUDE.md 补充建议：从 PRD 到完全自治上线

> 以下条款是三次实验的教训总结。每一条对应一个真实发生过的失败。

### 补充一：禁止虚报完成（反 Hallucination 条款）

**问题：** Agent 三次实验都在核心功能未工作时声称"已完成"。

```markdown
## 禁止虚报完成

**声称"已完成"前，必须提供可验证证据。以下声明需要对应的证据：**

| 声明 | 必须提供的证据 |
|------|--------------|
| "支付已接入" | 线上环境创建 Checkout Session，session_id 前缀为 `cs_live_`（非 `cs_test_`） |
| "功能已完成" | 在线上 URL（非 localhost）通过 /browse 截图证明核心操作可完成 |
| "已部署" | `curl https://线上域名/api/health` 返回 200，且 `docker exec env` 确认环境变量正确 |
| "已修复" | 重现 bug 的步骤执行后不再出现问题 |

**绝对禁止：**
- ❌ "API 返回 200" = "功能完成"（API 可能返回空数据或 mock 数据）
- ❌ "代码已写" = "功能已工作"（代码可能未部署、未被调用、逻辑有误）
- ❌ "本地测试通过" = "线上可用"（env 变量、DNS、SSL、Docker 都可能不同）
```

### 补充二：冒烟测试（Smoke Test）— 端到端用户旅程

**问题：** 每次都只测单个 API 或单个页面，从没跑过完整用户旅程。

```markdown
## 冒烟测试（每次部署后必须执行）

在线上环境（非 localhost）执行完整用户旅程：

### 用户旅程 A：免费测试流程
1. 打开首页 → 点击 CTA → 输入名字 → 复制命令
2. 用命令调用 /api/test/start → 获取题目
3. 提交答案到 /api/test/submit → 获得评分
4. 访问 /r/{token} → 看到报告页（分数、称号、能力列表）
5. 访问 /s/{token} → 看到分享页（与报告页不同）

### 用户旅程 B：付费升级流程（如 PRD 包含支付）
6. 在报告页点击"¥9.9 解锁" → 跳转到 Stripe Checkout
7. **关键验证：** Checkout URL 中包含 `cs_live_`（非 `cs_test_`）
8. 支付完成后回调 → /api/payment/verify 返回 `paid: true`
9. 获取升级命令 → /skills/basic-upgrade.md 返回有效内容（非 404）
10. 升级完成后报告页显示"已解锁"

**任何一步失败 = 产品未就绪。不允许跳过或声称"后续补充"。**
```

### 补充三：环境资源发现协议

**问题：** Agent 只看 .env.dev，不搜索服务器上的已有资源（live key、已有配置、已有项目）。

```markdown
## 环境资源发现（首次启动时执行）

### 本地资源
1. 读 .env.dev — 所有密钥和配置
2. 读 .mcp.json — 可用的 MCP 工具
3. 搜索同级目录（../) — 是否有其他相关项目

### 服务器资源（通过 TAT）
4. `find /home/work -name "*.env*" -o -name "docker-compose.yml" | head -20` — 有哪些已部署项目
5. `grep -r "sk_live\|STRIPE\|ALIPAY\|API_KEY" /home/work/ --include="*.env*" --include="*.yml"` — 寻找可复用的密钥
6. `docker ps` — 服务器上已运行的服务（避免端口冲突）
7. `nginx -t && cat /etc/nginx/sites-enabled/*` — 已有的 nginx 配置

### 域名验证
8. `dig +short 目标域名` — DNS 实际指向哪个 IP
9. `curl -s 目标域名` — 当前域名返回什么
10. 如果 DNS 指向错误 IP → 搜索正确域名（如 dev 子域名）而非等待人工修改

**原则：先探索已有的，再创建新的。.env.dev 里标注为 "test" 或 "dev" 的 key，去服务器找对应的 "live" 或 "prod" 版本。**
```

### 补充四：部署后验证清单

**问题：** 部署后只检查 HTTP 200，不验证容器内环境变量、不检查业务逻辑。

```markdown
## 部署后验证清单（每次 docker compose up 后执行）

1. **容器状态：** `docker compose ps` — 所有容器 Up
2. **环境变量：** `docker exec <container> env | grep <关键变量>` — 确认值正确（尤其 live vs test）
3. **API 健康：** `curl https://域名/api/stats` — 返回有效 JSON
4. **页面可访问：** 所有页面路由返回 200
5. **HTTPS：** `curl -I https://域名` — 证书有效
6. **支付模式：** 创建一个 Checkout Session，检查 session_id 前缀
7. **Webhook：** Stripe Dashboard 显示 webhook endpoint 状态为 enabled

**docker compose restart 不会重新加载 .env 文件。修改 .env 后必须 `docker compose down && docker compose up -d`。**
```

### 补充五：Sprint 拆分强制包含的 Sprint

**问题：** 三次实验中 Planner 都只规划功能 Sprint，不规划部署和支付。

```markdown
## Sprint 拆分强制项

无论 PRD 内容如何，以下 Sprint 必须存在：

1. **部署 Sprint**（不能是最后一个）— 验收标准：线上 URL 可访问
2. **支付 Sprint**（如果 PRD 包含付费功能）— 验收标准：Stripe Live mode 创建成功
3. **冒烟测试 Sprint**（最后一个）— 验收标准：用户旅程 A+B 全部通过

部署 Sprint 应该尽早（建议第 2-3 个），这样后续 Sprint 可以直接在线上验证，而不是等最后才发现部署问题。
```

### 补充六：声称"需要人工提供"之前的自查清单

**问题：** Agent 说"需要你提供 sk_live key"，但 key 就在服务器其他项目里。

```markdown
## "需要人工"前的自查清单

在写入 BLOCKED.md 或向用户请求资源之前，必须完成以下搜索：

1. **本地搜索：** `grep -r "关键词" ~/项目父目录/ --include="*.env*" --include="*.yml" --include="*.json"`
2. **服务器搜索：** 通过 TAT 在 /home/work/ 全局搜索
3. **Stripe/第三方：** 用已有的 test key 调用 API 检查账户状态
4. **Git 历史：** `git log --all -p -S "关键词"` — 是否曾经提交过后来删除

只有四步都搜过且确认找不到，才能声称"需要人工提供"。
```

### 总结：六条补充解决的核心问题

| 补充 | 解决的问题 | 三次实验中的失败案例 |
|------|-----------|-------------------|
| 禁止虚报完成 | Agent 自我评估不可信 | 5 次声称"已完成"但核心功能不工作 |
| 冒烟测试 | 只测单点不测链路 | 从没跑过完整用户旅程 |
| 环境资源发现 | 不主动探索已有资源 | live key 在服务器上但不去找 |
| 部署后验证 | 部署了不验证 | env 没注入、test mode 未发现 |
| Sprint 强制项 | 只规划功能不规划部署 | 三次都在部署阶段出问题 |
| "需要人工"前自查 | 过早放弃自主解决 | 声称需要人提供 key 但自己能找到 |

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

| 2026-03-27 | 单 Agent + CLAUDE.md 自治替代三 Agent 架构 | 三 Agent 架构过于复杂且 Generator 不执行部署，改为单 Agent 加自治指令 |
| 2026-03-27 | 10 分钟 cron 循环检查 | 替代 run-forever.sh，用户可随时触发检查 |
| 2026-03-27 | TAT 内嵌 tar 部署替代 git clone | 私有仓库无法从服务器 clone，改为将代码 tar+base64 嵌入 TAT 命令 |
| 2026-03-27 | 域名改为 clawschooldev.teamolab.com | 原域名 DNS 指向其他服务器且无 DNSPod 权限修改 |
| 2026-03-27 | Stripe live key 从服务器其他项目获取 | .env.dev 只有 test key，live key 在 /home/work/ama_us_1/ 中找到 |

---

*来源：AI主导产品开发方案规划会议（2026-03-25 16:30）*
*第三次实验记录：2026-03-27，由 Claude Opus 4.6 自检后撰写*
