process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.stack || err.message || err);
  process.exit(1);
});

const crypto = require('crypto');
const fs = require('fs');
const https = require('https');

console.log('Script started');

const webhookUrl = process.env.FEISHU_WEBHOOK_URL;
const secret = process.env.FEISHU_WEBHOOK_SECRET;
const eventPath = process.env.GITHUB_EVENT_PATH;

console.log('FEISHU_WEBHOOK_URL set:', !!webhookUrl);
console.log('FEISHU_WEBHOOK_SECRET set:', !!secret);
console.log('GITHUB_EVENT_PATH:', eventPath);

if (!webhookUrl || !secret) {
  console.error('Missing FEISHU_WEBHOOK_URL or FEISHU_WEBHOOK_SECRET');
  process.exit(1);
}

if (!eventPath || !fs.existsSync(eventPath)) {
  console.error('Event file not found:', eventPath);
  process.exit(1);
}

console.log('Reading event file...');
const eventRaw = fs.readFileSync(eventPath, 'utf8');
console.log('Event file length:', eventRaw.length);

let event;
try {
  event = JSON.parse(eventRaw);
} catch (e) {
  console.error('Failed to parse event JSON:', e.message);
  process.exit(1);
}
console.log('Event loaded, repo:', event.repository.full_name);

// Feishu signature
const timestamp = Math.floor(Date.now() / 1000).toString();
const stringToSign = timestamp + '\n' + secret;
const sign = crypto.createHmac('sha256', stringToSign).update('').digest('base64');

// Parse push event
const commits = event.commits || [];
const repo = event.repository.full_name;
const branch = event.ref.replace('refs/heads/', '');
const pusher = event.pusher.name;
const compareUrl = event.compare;

let commitLines = commits.map(c => {
  const short = c.id.substring(0, 7);
  const msg = c.message.split('\n')[0];
  const author = (c.author && c.author.name) || 'unknown';
  const added = (c.added || []).length;
  const modified = (c.modified || []).length;
  const removed = (c.removed || []).length;
  return '• ' + short + ' ' + msg + '\n  by ' + author + ' | +' + added + ' ~' + modified + ' -' + removed;
}).join('\n');

if (!commitLines) commitLines = '（无提交信息）';

const totalAdded = commits.reduce((s, c) => s + (c.added || []).length, 0);
const totalModified = commits.reduce((s, c) => s + (c.modified || []).length, 0);
const totalRemoved = commits.reduce((s, c) => s + (c.removed || []).length, 0);

const allAdded = commits.flatMap(c => c.added || []).filter(Boolean);
const allModified = commits.flatMap(c => c.modified || []).filter(Boolean);
const allRemoved = commits.flatMap(c => c.removed || []).filter(Boolean);

const fileLines = [];
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

const payload = JSON.stringify({
  timestamp,
  sign,
  msg_type: 'interactive',
  card: {
    header: {
      title: { tag: 'plain_text', content: title },
      template: 'blue'
    },
    elements: [{ tag: 'markdown', content: content }]
  }
});

console.log('Sending to Feishu...');

const url = new URL(webhookUrl);
const req = https.request({
  hostname: url.hostname,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Feishu response:', body);
    try {
      const result = JSON.parse(body);
      if (result.code !== 0) {
        console.error('Feishu notification failed:', result.msg);
        process.exit(1);
      }
    } catch (e) {
      console.error('Failed to parse response:', body);
      process.exit(1);
    }
    console.log('Done');
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
  process.exit(1);
});

req.write(payload);
req.end();
