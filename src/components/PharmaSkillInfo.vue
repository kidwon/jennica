<template>
  <section class="pharma-skill">
    <header class="skill-hero glass">
      <div>
        <p class="eyebrow">Pharma Daily Intelligence</p>
        <h2>制药资讯 Skill</h2>
        <p class="lead">
          借鉴 <code>ai-daily</code> 流程的制药情报模块，聚合 FiercePharma、Endpoints、FDA 等来源，输出研究级 Markdown/HTML/卡片。
        </p>
      </div>
      <div class="hero-actions">
        <span class="chip">RSS 聚合</span>
        <span class="chip">Claude 总结</span>
        <span class="chip">HTML/图卡</span>
      </div>
    </header>

    <div class="skill-grid">
      <article class="panel">
        <h3>Quick Start</h3>
        <ul class="command-list">
          <li v-for="command in quickCommands" :key="command">
            <code>{{ command }}</code>
          </li>
        </ul>
      </article>

      <article class="panel">
        <h3>Source Coverage</h3>
        <ul class="source-list">
          <li v-for="source in sources" :key="source.id">
            <strong>{{ source.name }}</strong>
            <span>{{ source.focus }}</span>
          </li>
        </ul>
      </article>

      <article class="panel full">
        <h3>Workflow</h3>
        <ol class="workflow">
          <li v-for="(step, index) in workflowSteps" :key="step">
            <span class="step-index">{{ index + 1 }}</span>
            <div>
              <h4>{{ step.title }}</h4>
              <p>{{ step.description }}</p>
            </div>
          </li>
        </ol>
      </article>

      <article class="panel">
        <h3>Output Format</h3>
        <ul class="output-list">
          <li v-for="section in outputSections" :key="section">
            {{ section }}
          </li>
        </ul>
        <p class="meta">详见 <code>skills/pharma-daily/references/output-format.md</code></p>
      </article>

      <article class="panel">
        <h3>Assets</h3>
        <ul class="asset-list">
          <li v-for="asset in assets" :key="asset.name">
            <strong>{{ asset.name }}</strong>
            <span>{{ asset.note }}</span>
          </li>
        </ul>
      </article>

      <article class="panel">
        <h3>QA Checklist</h3>
        <ul class="qa-list">
          <li v-for="item in qaChecklist" :key="item">{{ item }}</li>
        </ul>
      </article>
    </div>
  </section>
</template>

<script setup>
const quickCommands = [
  '昨天制药资讯',
  '2026-02-10的药企新闻',
  '昨天的监管审批动态',
  '昨天制药资讯，生成网页',
  '今天的制药资讯，生成图卡',
];

const sources = [
  { id: 'fiercepharma', name: 'FiercePharma', focus: '上市药企 / 商业化策略' },
  { id: 'endpoints', name: 'Endpoints News', focus: '临床试验 / 融资' },
  { id: 'pharmatimes', name: 'PharmaTimes', focus: '政策 / 市场准入' },
  { id: 'fda-cder', name: 'FDA CDER', focus: '监管决策 / 批准' },
  { id: 'clinicaltrials', name: 'ClinicalTrials.gov', focus: '结果公示 / 研究完成' },
];

const workflowSteps = [
  { title: '解析日期与筛选', description: '支持 昨天/前天/今天 或 YYYY-MM-DD，并识别分类、来源过滤。' },
  { title: '抓取 RSS 并缓存', description: '运行 fetch_pharma_news.py 抓取上游 RSS，按 UTC+8 日期写入 storage/pharma-news。' },
  { title: '校验数据窗口', description: '若目标日无结果，返回可用日期及建议指令。' },
  { title: 'Claude 富化', description: '生成要点、分类、关键词，结构化 JSON。' },
  { title: '输出 Markdown', description: '按照 output-format.md 填充 今日速览/分类解读/关键词雷达/数据附录。' },
  { title: '可选资产', description: '可渲染 Apple 风格 HTML 或分享卡片 JSON。' },
];

const outputSections = [
  '# {date} 制药情报日报',
  '## 今日速览 · 3-5 个要点',
  '## 分类解读 · Launches/Trials/Regulatory 等',
  '## 关键词雷达 · 关键词/公司/热度',
  '## 数据附录 · 来源与生成时间',
];

const assets = [
  { name: 'pharma-briefing.html', note: 'Apple-style HTML，含类别色条与关键词 Chip' },
  { name: 'pharma-card.json', note: '1080x1350 分享图，展示指标与关键词' },
];

const qaChecklist = [
  '日期格式固定 YYYY-MM-DD (UTC+8)',
  '≥3 个来源引用或说明缺失原因',
  '空分类不在 Markdown 中渲染',
  '抓取频率 ≤ 30 分钟/次，避免 RSS 过载',
];
</script>

<style scoped>
.pharma-skill {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.skill-hero {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-xs);
}

.skill-hero h2 {
  margin: 0;
  font-size: 2rem;
}

.skill-hero .lead {
  max-width: 520px;
  color: var(--text-secondary);
}

.hero-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.chip {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  background: var(--primary-gradient);
  color: #fff;
  font-size: 0.75rem;
}

.skill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--spacing-lg);
}

.panel {
  padding: var(--spacing-lg);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(10px);
}

.panel.full {
  grid-column: 1 / -1;
}

.panel h3 {
  margin-top: 0;
  margin-bottom: var(--spacing-sm);
}

.command-list,
.source-list,
.workflow,
.output-list,
.asset-list,
.qa-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.command-list code {
  background: var(--bg-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
}

.source-list li {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.source-list strong {
  color: var(--text-primary);
}

.workflow li {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
}

.step-index {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--primary-gradient);
  color: #fff;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.workflow h4 {
  margin: 0 0 var(--spacing-xxs);
  font-size: 1rem;
}

.meta {
  margin-top: var(--spacing-md);
  font-size: 0.8rem;
  color: var(--text-muted);
}

.asset-list strong {
  display: block;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .skill-hero {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
}
</style>
