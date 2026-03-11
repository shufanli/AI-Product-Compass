process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.stack || err.message || err);
  process.exit(1);
});

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.resolve(__dirname, '../../ai-landscape/trending-skills.md');
const TOP_N = 10;

/**
 * HTTPS GET 请求封装
 */
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'ProductCompass/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpsGet(res.headers.location).then(resolve, reject);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}: ${body.substring(0, 200)}`));
        }
        resolve(body);
      });
    }).on('error', reject);
  });
}

/**
 * 从 ClawHub API 获取热门 skills
 * 综合排序：按下载量 + 星标数加权
 */
async function fetchTrendingSkills() {
  console.log('Fetching trending skills from ClawHub...');

  // 尝试 ClawHub 公开 API
  const apiUrl = 'https://clawhub.ai/api/skills?sort=trending&limit=20';
  const raw = await httpsGet(apiUrl);
  const data = JSON.parse(raw);

  // 兼容不同的 API 响应结构
  let skills = Array.isArray(data) ? data : (data.skills || data.results || data.data || []);

  if (!skills.length) {
    throw new Error('No skills returned from ClawHub API');
  }

  // 综合排序：下载量权重 0.7 + 星标数权重 0.3（归一化后加权）
  const maxDownloads = Math.max(...skills.map(s => s.downloads || s.download_count || 0), 1);
  const maxStars = Math.max(...skills.map(s => s.stars || s.star_count || 0), 1);

  skills = skills.map(s => {
    const downloads = s.downloads || s.download_count || 0;
    const stars = s.stars || s.star_count || 0;
    const score = 0.7 * (downloads / maxDownloads) + 0.3 * (stars / maxStars);
    return { ...s, _downloads: downloads, _stars: stars, _score: score };
  });

  skills.sort((a, b) => b._score - a._score);

  return skills.slice(0, TOP_N);
}

/**
 * 生成 Markdown 内容
 */
function generateMarkdown(skills, date) {
  const lines = [
    '# ClawHub 热门 Skills 周报',
    '',
    '每周自动收集 ClawHub（clawhub.ai）上最火爆的 10 个 OpenClaw Skills，帮助 AI 产品经理了解 AI Agent 生态动态。',
    '',
    `> 最后更新：${date}`,
    '',
    '---',
    '',
    '## 本周 Top 10 Skills',
    '',
    '| 排名 | Skill 名称 | 下载量 | 描述 |',
    '|:----:|-----------|------:|------|',
  ];

  skills.forEach((s, i) => {
    const name = s.name || s.skill_name || 'Unknown';
    const downloads = (s._downloads || 0).toLocaleString('en-US');
    const desc = (s.description || s.summary || '暂无描述').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    lines.push(`| ${i + 1} | **${name}** | ${downloads} | ${desc} |`);
  });

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 数据说明');
  lines.push('');
  lines.push('- **数据来源**：[ClawHub](https://clawhub.ai/) 公开 API');
  lines.push('- **排序方式**：综合排序（下载量 70% + 星标数 30%）');
  lines.push('- **更新频率**：每周一自动更新');
  lines.push('- **收集数量**：Top 10');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 更新日志');
  lines.push('');
  lines.push('| 日期 | 变更摘要 |');
  lines.push('|------|---------|');
  lines.push(`| ${date} | 本周 Top 10 热门 Skills 更新 |`);
  lines.push('');

  return lines.join('\n');
}

/**
 * 生成 Issue body
 */
function generateIssueBody(skills, date) {
  let body = `## ClawHub 热门 Skills 周报 - ${date}\n\n`;
  body += '本周 ClawHub 上最火爆的 10 个 Skills 已自动收集并更新到 `ai-landscape/trending-skills.md`。\n\n';
  body += '### Top 10 一览\n\n';
  body += '| 排名 | Skill | 下载量 | 描述 |\n';
  body += '|:----:|-------|------:|------|\n';

  skills.forEach((s, i) => {
    const name = s.name || s.skill_name || 'Unknown';
    const downloads = (s._downloads || 0).toLocaleString('en-US');
    const desc = (s.description || s.summary || '暂无描述').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    body += `| ${i + 1} | **${name}** | ${downloads} | ${desc} |\n`;
  });

  body += '\n### 建议关注\n';
  body += '- [ ] 是否有新上榜的 Skill，值得在产品中集成\n';
  body += '- [ ] 热门 Skill 的功能趋势是否影响产品方向\n';
  body += '- [ ] 是否有竞品相关的 Skill 动态\n';
  body += '\n---\n*此 Issue 由 GitHub Actions 自动创建*';

  return body;
}

async function main() {
  const today = new Date().toISOString().split('T')[0];

  const skills = await fetchTrendingSkills();
  console.log(`Fetched ${skills.length} trending skills`);

  // 写入 Markdown 文件
  const markdown = generateMarkdown(skills, today);
  fs.writeFileSync(OUTPUT_FILE, markdown, 'utf8');
  console.log(`Written to ${OUTPUT_FILE}`);

  // 输出 Issue 内容供 workflow 使用
  const issueTitle = `[Skills 周报] ${today} ClawHub 热门 Skills Top 10`;
  const issueBody = generateIssueBody(skills, today);

  // 通过环境文件传递给 GitHub Actions
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    const delimiter = 'EOF_' + Date.now();
    fs.appendFileSync(outputFile, `issue_title=${issueTitle}\n`);
    fs.appendFileSync(outputFile, `issue_body<<${delimiter}\n${issueBody}\n${delimiter}\n`);
    console.log('Issue metadata written to GITHUB_OUTPUT');
  }

  // 同时输出到 stdout 供调试
  console.log('\n--- Issue Title ---');
  console.log(issueTitle);
  console.log('\n--- Top Skills ---');
  skills.forEach((s, i) => {
    console.log(`${i + 1}. ${s.name || s.skill_name} (${s._downloads} downloads)`);
  });
}

main().catch(err => {
  console.error('Failed to fetch trending skills:', err.message);
  process.exit(1);
});
