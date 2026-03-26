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

### 第二次实验（待执行，三 Agent）

**启动命令：**
```bash
cd /path/to/clawschool-gstack
/Users/shufanli/Evan/teamo-runner-agency-test/scripts/run-forever.sh .
```

**监控：**
```bash
tail -f agent-run.log        # 实时日志
cat NEXT_STEP.md              # 当前进度
cat EVAL_FEEDBACK.md          # 最新评估报告
cat SPRINT_PLAN.md            # Sprint 计划
```

**停止：**
```bash
touch STOP
```

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
