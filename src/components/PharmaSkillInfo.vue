<template>
  <section class="pharma-view">
    <header class="skill-hero glass">
      <div>
        <p class="eyebrow">Pharma Daily Intelligence</p>
        <h2>制药资讯 · Skill 驱动日报</h2>
        <p class="lead">
          借鉴 <code>ai-daily</code> 的流程：抓取 5 大制药 RSS → 存储 JSON → Claude 总结 → 输出 Markdown/HTML/图卡。
          运行 `fetch_pharma_news.py` + `generate_pharma_report.py` 后，即可在此查看每日摘要。
        </p>
      </div>
      <div class="hero-actions">
        <span class="chip">FiercePharma</span>
        <span class="chip">Endpoints</span>
        <span class="chip">FDA CDER</span>
        <span class="chip">ClinicalTrials.gov</span>
      </div>
    </header>

    <div class="control-card glass">
      <div class="control-group">
        <label for="pharma-date">选择日期</label>
        <input
          id="pharma-date"
          type="date"
          v-model="selectedDate"
          :max="today"
        />
      </div>
      <button class="btn btn-primary" @click="loadReport" :disabled="loading">
        {{ loading ? '加载中...' : '获取报告' }}
      </button>
      <p class="hint">
        先运行
        <code>python skills/pharma-daily/scripts/fetch_pharma_news.py --date {{ selectedDate }}</code>
        和
        <code>python skills/pharma-daily/scripts/generate_pharma_report.py --date {{ selectedDate }} --public</code>
        生成 <code>public/pharma-news/{{ selectedDate }}.report.json</code>。
      </p>
    </div>

    <div v-if="error" class="banner error">
      {{ error }}
    </div>
    <div v-else-if="fallbackNotice" class="banner info">
      {{ fallbackNotice }}
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在载入制药日报...</p>
    </div>

    <section v-else-if="report" class="report">
      <div class="report-meta">
        <div>
          <span>数据日期</span>
          <strong>{{ report.date }}</strong>
        </div>
        <div>
          <span>生成时间</span>
          <strong>{{ formatDate(report.generated_at) }}</strong>
        </div>
        <div>
          <span>来源数</span>
          <strong>{{ report.source_count || report.sources?.length || 0 }}</strong>
        </div>
        <div>
          <span>资讯条数</span>
          <strong>{{ report.item_count || totalItems }}</strong>
        </div>
      </div>

      <article class="panel">
        <h3>今日速览</h3>
        <ul class="takeaways">
          <li v-for="item in report.takeaways" :key="item">{{ item }}</li>
        </ul>
      </article>

      <article class="panel">
        <h3>关键词雷达</h3>
        <div class="keyword-grid">
          <span
            v-for="keyword in report.keywords"
            :key="keyword.name"
            class="keyword-chip"
          >
            {{ keyword.name }} · 热度 {{ keyword.heat }}
          </span>
          <p v-if="!report.keywords?.length" class="muted">尚无关键词，运行 AI 总结后将自动填充。</p>
        </div>
      </article>

      <section class="category-grid">
        <article
          v-for="category in report.categories"
          :key="category.id"
          class="panel category"
        >
          <div class="category-header">
            <h3>{{ category.name }}</h3>
            <span class="badge">{{ category.items.length }} 条</span>
          </div>
          <ul>
            <li v-for="item in category.items" :key="item.title" class="category-item">
              <div class="category-meta">
                <span class="source-tag">{{ item.source }}</span>
                <span class="time-tag">{{ formatTime(item.published_local) }}</span>
              </div>
              <a :href="item.url" target="_blank" rel="noopener" class="category-title">
                {{ item.title }}
              </a>
              <p class="category-insight">{{ item.insight }}</p>
            </li>
          </ul>
        </article>
      </section>

      <article class="panel">
        <h3>数据附录</h3>
        <ul class="appendix">
          <li>来源：{{ report.sources?.join(' · ') || '未记录' }}</li>
          <li>生成脚本：fetch_pharma_news.py → generate_pharma_report.py</li>
          <li v-if="fallbackNotice">
            当前展示样例报告，运行脚本即可替换为实时数据。
          </li>
        </ul>
      </article>
    </section>

    <div v-else class="empty-state glass">
      <p>尚未生成报告。请运行脚本并点击“获取报告”。</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const today = new Date().toISOString().slice(0, 10);
const defaultDate = '2026-02-10';
const selectedDate = ref(defaultDate);
const report = ref(null);
const loading = ref(false);
const error = ref('');
const fallbackNotice = ref('');

const totalItems = computed(() => {
  return report.value?.categories?.reduce((sum, category) => sum + category.items.length, 0) || 0;
});

const fetchReport = async (date) => {
  const cacheBust = Date.now();
  const tryUrl = async (path) => {
    const response = await fetch(`${path}?v=${cacheBust}`);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return await response.json();
  };

  error.value = '';
  fallbackNotice.value = '';
  loading.value = true;
  try {
    report.value = await tryUrl(`/pharma-news/${date}.report.json`);
  } catch (err) {
    console.error(err);
    try {
      report.value = await tryUrl('/pharma-news/sample.report.json');
      fallbackNotice.value = `未找到 ${date} 的报告，已展示样例数据。`;
    } catch (sampleErr) {
      console.error(sampleErr);
      report.value = null;
      error.value = '没有可用的制药日报，请先运行脚本生成 JSON。';
    }
  } finally {
    loading.value = false;
  }
};

const loadReport = () => {
  fetchReport(selectedDate.value || defaultDate);
};

onMounted(() => {
  fetchReport(defaultDate);
});

const formatDate = (value) => {
  if (!value) return '未知';
  try {
    return new Date(value).toLocaleString('zh-CN', { hour12: false });
  } catch (err) {
    return value;
  }
};

const formatTime = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    return value;
  }
};
</script>

<style scoped>
.pharma-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.skill-hero {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--spacing-lg);
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
  max-width: 560px;
  color: var(--text-secondary);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
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

.control-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.control-group input {
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm);
  color: var(--text-primary);
}

.hint {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.banner {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
}

.banner.error {
  background: rgba(255, 107, 107, 0.15);
  border: 1px solid rgba(255, 107, 107, 0.4);
}

.banner.info {
  background: rgba(102, 126, 234, 0.15);
  border: 1px solid rgba(102, 126, 234, 0.4);
}

.report-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--spacing-md);
}

.report-meta div {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
}

.report-meta span {
  display: block;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.report-meta strong {
  font-size: 1.2rem;
}

.panel {
  padding: var(--spacing-lg);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(10px);
}

.takeaways {
  list-style: disc;
  padding-left: 1.5rem;
  color: var(--text-secondary);
}

.keyword-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.keyword-chip {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.4);
  font-size: 0.85rem;
}

.muted {
  color: var(--text-muted);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.1);
}

.category-item {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: var(--spacing-sm) 0;
}

.category-meta {
  display: flex;
  gap: var(--spacing-sm);
  font-size: 0.8rem;
  color: var(--text-muted);
}

.category-title {
  color: var(--text-primary);
  font-weight: 600;
  text-decoration: none;
}

.category-title:hover {
  text-decoration: underline;
}

.category-insight {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.appendix {
  list-style: disc;
  padding-left: 1.2rem;
  color: var(--text-secondary);
}

.empty-state {
  padding: var(--spacing-xl);
  text-align: center;
  border-radius: var(--radius-lg);
}

@media (max-width: 768px) {
  .control-card {
    align-items: flex-start;
  }
}
</style>
