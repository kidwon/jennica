<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">🤖</span>
          <h1 class="gradient-text">个人助理</h1>
        </div>
        <p class="tagline">智能信息聚合，关键词追踪</p>
      </div>
    </header>

    <main class="app-main">
      <div class="container">
        <KeywordManager />
        <SourceManager
          :sources="sources"
          @add-source="handleAddSource"
          @toggle-source="handleToggleSource"
          @remove-source="handleRemoveSource"
        />
        
        <div class="action-bar">
          <button 
            class="btn btn-primary refresh-btn" 
            @click="handleRefresh"
            :disabled="isLoading"
          >
            <span v-if="!isLoading">🔄 刷新数据</span>
            <span v-else>⏳ 加载中...</span>
          </button>
          <p class="last-update" v-if="!isLoading && filteredInfo.length > 0">
            最后更新: {{ new Date().toLocaleTimeString('zh-CN') }}
          </p>
        </div>

        <SearchFilter
          v-model:search-query="searchQuery"
          v-model:selected-keywords="selectedKeywords"
          v-model:selected-source="selectedSource"
          :enabled-keywords="enabledKeywords"
          :available-sources="availableSources"
          @clear-filters="clearFilters"
          @keyword-toggle="handleKeywordClick"
        />

        <!-- 错误提示 -->
        <div v-if="error" class="error-banner">
          <span>⚠️ {{ error }}</span>
          <button class="btn btn-secondary" @click="handleRefresh">重试</button>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>正在获取最新数据...</p>
        </div>

        <!-- 结果摘要 -->
        <div v-else class="results-summary">
          <p v-if="filteredInfo.length > 0">
            找到 <strong>{{ filteredInfo.length }}</strong> 条相关信息
          </p>
          <p v-else class="no-results">
            没有找到匹配的信息
          </p>
        </div>

        <Timeline
          v-if="!isLoading"
          :grouped-by-date="groupedByDate"
          :selected-keywords="selectedKeywords"
          @keyword-click="handleKeywordClick"
        />
      </div>
    </main>

    <footer class="app-footer">
      <p>个人助理 © 2026 · 使用 Vue.js 构建 · 数据来自自选信息源</p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import KeywordManager from './components/KeywordManager.vue';
import SourceManager from './components/SourceManager.vue';
import SearchFilter from './components/SearchFilter.vue';
import Timeline from './components/Timeline.vue';
import { useKeywords } from './composables/useKeywords';
import { useInfoFeed } from './composables/useInfoFeed';
import { useSources } from './composables/useSources';

// 关键字管理
const { enabledKeywords } = useKeywords();

// 信息源管理
const {
  sources,
  enabledSources,
  addSource,
  removeSource,
  toggleSource,
  sourceNameExists,
  sourceUrlExists,
} = useSources();

// 信息流管理
const {
  filteredInfo,
  groupedByDate,
  searchQuery,
  selectedKeywords,
  selectedSource,
  availableSources,
  isLoading,
  error,
  toggleKeywordFilter,
  clearFilters,
  fetchData,
  refreshData,
} = useInfoFeed();

// 处理关键字点击
const handleKeywordClick = (keyword) => {
  toggleKeywordFilter(keyword);
};

// 刷新数据
const handleRefresh = async () => {
  const keywordNames = enabledKeywords.value.map(k => k.name);
  await refreshData(keywordNames, enabledSources.value);
};

// 初始加载数据
onMounted(async () => {
  const keywordNames = enabledKeywords.value.map(k => k.name);
  await fetchData(keywordNames, enabledSources.value);
});

// 信息源变化后自动触发刷新，保障内容同步
watch(enabledSources, async () => {
  const keywordNames = enabledKeywords.value.map(k => k.name);
  await refreshData(keywordNames, enabledSources.value);
}, { deep: true });

const handleAddSource = ({ name, url }) => {
  if (sourceNameExists(name)) {
    alert('该信息源名称已存在');
    return;
  }

  if (sourceUrlExists(url)) {
    alert('该链接已经添加过');
    return;
  }

  addSource(name, url);
};

const handleToggleSource = (id) => {
  toggleSource(id);
};

const handleRemoveSource = (id) => {
  removeSource(id);
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import './styles/globals.css';

.app-header {
  padding: var(--spacing-2xl) var(--spacing-md);
  text-align: center;
  position: relative;
  margin-bottom: var(--spacing-xl);
}

.header-content {
  max-width: 900px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.logo-icon {
  font-size: 2.5rem;
  animation: pulse 2s ease-in-out infinite;
}

.logo h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
}

.tagline {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

.app-main {
  padding: 0 var(--spacing-md) var(--spacing-2xl);
  min-height: calc(100vh - 300px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  backdrop-filter: blur(10px);
}

.refresh-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.last-update {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: 0;
}

.error-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: rgba(240, 147, 251, 0.1);
  border: 1px solid var(--accent-pink);
  border-radius: var(--radius-md);
  color: var(--accent-pink);
  margin-bottom: var(--spacing-lg);
}

.loading-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--glass-border);
  border-top-color: var(--accent-purple);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-md);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.results-summary {
  margin-bottom: var(--spacing-lg);
  text-align: center;
  color: var(--text-secondary);
}

.results-summary strong {
  color: var(--accent-purple);
  font-weight: 600;
}

.no-results {
  color: var(--text-muted);
  font-style: italic;
}

.app-footer {
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-md);
  color: var(--text-muted);
  border-top: 1px solid var(--glass-border);
  margin-top: var(--spacing-2xl);
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .logo h1 {
    font-size: 2rem;
  }

  .logo-icon {
    font-size: 2rem;
  }

  .tagline {
    font-size: 0.95rem;
  }

  .action-bar {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .refresh-btn {
    width: 100%;
  }
}
</style>
