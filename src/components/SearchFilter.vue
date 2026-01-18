<template>
  <div class="search-filter glass">
    <div class="filter-section">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="localSearchQuery"
          type="text"
          placeholder="搜索信息..."
          class="search-input"
        />
        <button
          v-if="localSearchQuery"
          class="clear-btn"
          @click="localSearchQuery = ''"
        >
          ✕
        </button>
      </div>
    </div>

    <div class="filter-section">
      <label class="filter-label">按关键字筛选：</label>
      <div class="filter-chips">
        <button
          v-for="keyword in enabledKeywords"
          :key="keyword.id"
          class="filter-chip"
          :class="{ active: isKeywordSelected(keyword.name) }"
          :style="getChipStyle(keyword)"
          @click="toggleKeyword(keyword.name)"
        >
          {{ keyword.name }}
        </button>
        <div v-if="enabledKeywords.length === 0" class="no-keywords">
          暂无可用关键字
        </div>
      </div>
    </div>

    <div class="filter-section">
      <label class="filter-label">按来源筛选：</label>
      <select
        v-model="localSelectedSource"
        class="source-select"
      >
        <option value="all">全部来源</option>
        <option
          v-for="source in availableSources.filter(s => s !== 'all')"
          :key="source"
          :value="source"
        >
          {{ source }}
        </option>
      </select>
    </div>

    <div v-if="hasActiveFilters" class="filter-actions">
      <button class="btn btn-secondary" @click="handleClearFilters">
        清除筛选
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
  selectedKeywords: {
    type: Array,
    default: () => [],
  },
  selectedSource: {
    type: String,
    default: 'all',
  },
  enabledKeywords: {
    type: Array,
    default: () => [],
  },
  availableSources: {
    type: Array,
    default: () => ['all'],
  },
});

const emit = defineEmits([
  'update:searchQuery',
  'update:selectedKeywords',
  'update:selectedSource',
  'clear-filters',
  'keyword-toggle',
]);

// 本地状态（用于v-model）
const localSearchQuery = ref(props.searchQuery);
const localSelectedSource = ref(props.selectedSource);

// 监听本地状态变化，发送到父组件
watch(localSearchQuery, (newValue) => {
  emit('update:searchQuery', newValue);
});

watch(localSelectedSource, (newValue) => {
  emit('update:selectedSource', newValue);
});

// 监听 props 变化，更新本地状态
watch(() => props.searchQuery, (newValue) => {
  localSearchQuery.value = newValue;
});

watch(() => props.selectedSource, (newValue) => {
  localSelectedSource.value = newValue;
});

// 检查关键字是否被选中
const isKeywordSelected = (keywordName) => {
  return props.selectedKeywords.includes(keywordName);
};

// 切换关键字
const toggleKeyword = (keywordName) => {
  emit('keyword-toggle', keywordName);
};

// 获取芯片样式
const getChipStyle = (keyword) => {
  if (isKeywordSelected(keyword.name)) {
    return {
      background: keyword.color,
      borderColor: keyword.color,
    };
  }
  return {};
};

// 是否有激活的筛选
const hasActiveFilters = computed(() => {
  return (
    localSearchQuery.value.trim() !== '' ||
    props.selectedKeywords.length > 0 ||
    localSelectedSource.value !== 'all'
  );
});

// 清除筛选
const handleClearFilters = () => {
  localSearchQuery.value = '';
  localSelectedSource.value = 'all';
  emit('clear-filters');
};
</script>

<style scoped>
.search-filter {
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-xl);
}

.filter-section {
  margin-bottom: var(--spacing-lg);
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  transition: all var(--transition-base);
}

.search-box:focus-within {
  border-color: var(--accent-purple);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-icon {
  margin-right: var(--spacing-sm);
  font-size: 1.2rem;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.9rem;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.clear-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--spacing-xs);
  transition: color var(--transition-base);
  font-size: 1rem;
}

.clear-btn:hover {
  color: var(--text-primary);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.filter-chip {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--transition-base);
  font-weight: 500;
}

.filter-chip:hover {
  border-color: var(--accent-purple);
  transform: translateY(-1px);
}

.filter-chip.active {
  color: white;
  border-color: transparent;
  box-shadow: var(--shadow-md);
}

.no-keywords {
  color: var(--text-muted);
  font-size: 0.85rem;
  font-style: italic;
}

.source-select {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  transition: all var(--transition-base);
}

.source-select:focus {
  border-color: var(--accent-purple);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.source-select option {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.filter-actions {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .filter-chips {
    max-height: 120px;
    overflow-y: auto;
  }
}
</style>
