# GitHub Push 飞书自动通知

当有人 push 代码到 GitHub 仓库时，自动向飞书群发送包含变更详情的卡片通知。

## 效果

每次 push 后，飞书群内收到一张卡片，包含：

- 仓库名、分支、推送者
- 每个 commit 的 hash、消息、作者、文件增删数
- 所有变更文件列表（新增/修改/删除分类）
- GitHub 对比链接

## 实现方式

GitHub Actions workflow + 飞书自定义机器人 Webhook。

## 配置步骤

### 1. 创建飞书自定义机器人

1. 打开飞书群 → 群设置 → 群机器人 → 添加机器人 → 自定义机器人
2. 记录 Webhook URL（格式：`https://open.feishu.cn/open-apis/bot/v2/hook/xxx`）
3. 安全设置推荐选择**签名校验**，记录签名密钥（Secret）

> 三种安全校验方式对比：
>
> | 方式 | 适用场景 | 备注 |
> |------|---------|------|
> | 自定义关键词 | 简单场景 | 消息中必须包含关键词，灵活性差 |
> | IP 白名单 | 固定服务器 | GitHub Actions IP 不固定，**不推荐** |
> | 签名校验 | **推荐** | 最灵活安全，不限消息内容和来源 IP |

### 2. 配置 GitHub Secrets

在仓库 Settings → Secrets and variables → Actions 中添加：

| Secret 名称 | 值 |
|-------------|-----|
| `FEISHU_WEBHOOK_URL` | 飞书机器人的 Webhook URL |
| `FEISHU_WEBHOOK_SECRET` | 飞书机器人的签名密钥 |

### 3. 添加 Workflow 文件

在仓库中创建 `.github/workflows/feishu-push-notify.yml`：

```yaml
name: Notify Feishu on Push

on:
  push:
    branches: ['**']

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send to Feishu
        env:
          FEISHU_WEBHOOK_URL: ${{ secrets.FEISHU_WEBHOOK_URL }}
          FEISHU_WEBHOOK_SECRET: ${{ secrets.FEISHU_WEBHOOK_SECRET }}
        run: |
          node << 'SCRIPT'
          (async () => {
          const crypto = require('crypto');
          const fs = require('fs');

          const webhookUrl = process.env.FEISHU_WEBHOOK_URL;
          const secret = process.env.FEISHU_WEBHOOK_SECRET;
          const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));

          // 飞书签名
          const timestamp = Math.floor(Date.now() / 1000).toString();
          const stringToSign = timestamp + '\n' + secret;
          const sign = crypto.createHmac('sha256', stringToSign).update('').digest('base64');

          // 解析 push 事件
          const commits = event.commits || [];
          const repo = event.repository.full_name;
          const branch = event.ref.replace('refs/heads/', '');
          const pusher = event.pusher.name;
          const compareUrl = event.compare;

          let commitLines = commits.map(c => {
            const short = c.id.substring(0, 7);
            const msg = c.message.split('\n')[0];
            const author = c.author.name;
            const added = c.added.length;
            const modified = c.modified.length;
            const removed = c.removed.length;
            return '• ' + short + ' ' + msg + '\n  by ' + author + ' | +' + added + ' ~' + modified + ' -' + removed;
          }).join('\n');

          if (!commitLines) commitLines = '（无提交信息）';

          const totalAdded = commits.reduce((s, c) => s + c.added.length, 0);
          const totalModified = commits.reduce((s, c) => s + c.modified.length, 0);
          const totalRemoved = commits.reduce((s, c) => s + c.removed.length, 0);

          // 收集变更文件
          const allAdded = commits.flatMap(c => c.added).filter(Boolean);
          const allModified = commits.flatMap(c => c.modified).filter(Boolean);
          const allRemoved = commits.flatMap(c => c.removed).filter(Boolean);

          let fileLines = [];
          if (allAdded.length) fileLines.push('🟢 新增: ' + allAdded.join(', '));
          if (allModified.length) fileLines.push('🟡 修改: ' + allModified.join(', '));
          if (allRemoved.length) fileLines.push('🔴 删除: ' + allRemoved.join(', '));
          const fileSection = fileLines.length ? fileLines.join('\n') : '（无文件变更）';

          const title = '📦 ' + repo + ' 有新的推送';
          const content = [
            '**分支:** ' + branch,
            '**推送者:** ' + pusher,
            '**提交数:** ' + commits.length + '  |  文件: +' + totalAdded + ' ~' + totalModified + ' -' + totalRemoved,
            '', '---',
            '**提交记录:**', commitLines,
            '', '---',
            '**变更文件:**', fileSection,
            '',
            '[查看完整对比 →](' + compareUrl + ')'
          ].join('\n');

          const payload = {
            timestamp, sign,
            msg_type: 'interactive',
            card: {
              header: {
                title: { tag: 'plain_text', content: title },
                template: 'blue'
              },
              elements: [{ tag: 'markdown', content: content }]
            }
          };

          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const result = await response.json();
          console.log('Feishu response:', JSON.stringify(result));
          if (result.code !== 0) {
            console.error('Failed:', result.msg);
            process.exit(1);
          }
          })().catch(e => { console.error(e); process.exit(1); });
          SCRIPT
```

### 4. Push 触发测试

提交并推送 workflow 文件后，这次 push 本身就会触发第一条通知。

## 踩坑记录

| 问题 | 原因 | 解决 |
|------|------|------|
| 飞书返回 `Key Words Not Found` | 关键词校验模式下消息不含关键词 | 改用签名校验 |
| 飞书返回 `Ip Not Allowed` | IP 白名单模式，GitHub Actions IP 不固定 | 改用签名校验 |
| Actions 显示成功但飞书没收到 | `fetch` 没有 `await`，node 进程提前退出 | 用 async IIFE 包裹并 `await fetch` |
| 环境变量传递 JSON 失败 | `toJSON(github.event)` 含引号/换行，shell 转义出错 | 改用 `GITHUB_EVENT_PATH` 文件读取 |
| Heredoc 内联脚本在 Actions 中静默失败 | `node << 'SCRIPT'` 在 GitHub Actions 的 shell 中行为不一致，脚本可能未正确执行但 step 仍报成功 | **将脚本提取为独立 `.js` 文件**（`.github/scripts/feishu-notify.js`），workflow 中用 `node .github/scripts/feishu-notify.js` 调用，彻底避免 shell 转义问题。需先 `actions/checkout@v4` 检出代码 |

## 扩展方向

- **按分支过滤**：修改 `on.push.branches` 只监听特定分支
- **PR 通知**：增加 `on.pull_request` 触发器
- **Issue 通知**：增加 `on.issues` 触发器
- **部署通知**：增加 `on.deployment_status` 触发器
- **多群分发**：根据分支名发送到不同飞书群
