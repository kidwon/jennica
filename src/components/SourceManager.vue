<template>
  <div class="source-manager glass">
    <div class="manager-header">
      <h2 class="gradient-text">信息源管理</h2>
      <button class="btn-toggle" @click="isExpanded = !isExpanded">
        {{ isExpanded ? '收起' : '展开' }}
      </button>
    </div>

    <transition name="expand">
      <div v-if="isExpanded" class="manager-content">
        <div class="add-source-form">
          <input
            v-model="newSourceName"
            type="text"
            placeholder="信息源名称，如 TechCrunch"
            class="source-input"
            @keyup.enter="focusUrlInput"
          />
          <input
            v-model="newSourceUrl"
            ref="urlInput"
            type="url"
            placeholder="https://example.com/rss"
            class="source-input"
            @keyup.enter="handleAddSource"
          />
          <button class="btn btn-primary" @click="handleAddSource">
            添加
          </button>
        </div>
        <p class="input-hint">目前支持添加任何公开的 RSS/Atom 链接作为自定义来源。</p>

        <div class="sources-section">
          <h3>默认来源</h3>
          <div class="sources-list">
            <div
              v-for="source in builtInSources"
              :key="source.id"
              class="source-item"
              :class="{ disabled: !source.enabled }"
            >
              <div>
                <p class="source-name">{{ source.name }}</p>
                <p class="source-meta">系统内置 · {{ getTypeLabel(source.type) }}</p>
              </div>
              <button
                class="action-btn"
                :class="{ active: source.enabled }"
                @click="$emit('toggle-source', source.id)"
                :title="source.enabled ? '禁用' : '启用'"
              >
                {{ source.enabled ? '✓' : '○' }}
              </button>
            </div>
          </div>
        </div>

        <div class="sources-section">
          <div class="section-header">
            <h3>自定义来源</h3>
            <span class="source-count">{{ customSources.length }} 个</span>
          </div>
          <div v-if="customSources.length === 0" class="empty-sources">
            还没有添加自定义来源
          </div>
          <div v-else class="sources-list">
            <div
              v-for="source in customSources"
              :key="source.id"
              class="source-item"
              :class="{ disabled: !source.enabled }"
            >
              <div>
                <p class="source-name">{{ source.name }}</p>
                <p class="source-meta">{{ source.url }}</p>
              </div>
              <div class="source-actions">
                <button
                  class="action-btn"
                  :class="{ active: source.enabled }"
                  @click="$emit('toggle-source', source.id)"
                  :title="source.enabled ? '禁用' : '启用'"
                >
                  {{ source.enabled ? '✓' : '○' }}
                </button>
                <button
                  class="action-btn delete"
                  @click="$emit('remove-source', source.id)"
                  title="删除"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  sources: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['add-source', 'toggle-source', 'remove-source']);

const isExpanded = ref(true);
const newSourceName = ref('');
const newSourceUrl = ref('');
const urlInput = ref(null);

const builtInSources = computed(() =>
  props.sources.filter((source) => source.removable === false)
);

const customSources = computed(() =>
  props.sources.filter((source) => source.removable !== false)
);

const getTypeLabel = (type) => {
  const map = {
    github: 'GitHub Trending',
    hackerNews: 'Hacker News API',
    devto: 'Dev.to API',
    rss: 'RSS/Atom',
  };
  return map[type] || 'API';
};

const focusUrlInput = () => {
  urlInput.value?.focus();
};

const handleAddSource = () => {
  const name = newSourceName.value.trim();
  const url = newSourceUrl.value.trim();

  if (!name || !url) {
    alert('请输入信息源名称和 RSS 链接');
    return;
  }

  if (!/^https?:\/\//i.test(url)) {
    alert('请输入合法的链接，以 http 或 https 开头');
    return;
  }

  emit('add-source', { name, url });
  newSourceName.value = '';
  newSourceUrl.value = '';
};
</script>

<style scoped>
.source-manager {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.btn-toggle {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
  font-size: 0.85rem;
}

.btn-toggle:hover {
  border-color: var(--accent-purple);
  color: var(--accent-purple);
}

.manager-content {
  animation: fadeIn 0.3s ease-out;
}

.add-source-form {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.source-input {
  flex: 1;
  min-width: 200px;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.9rem;
  outline: none;
  transition: all var(--transition-base);
}

.source-input:focus {
  border-color: var(--accent-purple);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-hint {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: var(--spacing-lg);
}

.sources-section {
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.source-count {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.source-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
}

.source-item.disabled {
  opacity: 0.7;
}

.source-name {
  font-weight: 600;
  margin: 0;
}

.source-meta {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.source-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.action-btn.active {
  background: var(--primary-gradient);
  color: white;
  border-color: transparent;
}

.action-btn.delete {
  color: #ff6b6b;
}

.action-btn.delete:hover {
  background: rgba(255, 107, 107, 0.1);
}

.empty-sources {
  padding: var(--spacing-lg);
  text-align: center;
  color: var(--text-muted);
  background: var(--bg-secondary);
  border: 1px dashed var(--glass-border);
  border-radius: var(--radius-sm);
}

@media (max-width: 768px) {
  .add-source-form {
    flex-direction: column;
  }
}
</style>
