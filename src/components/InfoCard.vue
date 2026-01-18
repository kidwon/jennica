<template>
  <div class="info-card card" @click="openUrl">
    <div class="card-header">
      <div class="source-badge" :style="{ background: getSourceColor(info.source) }">
        {{ info.source }}
      </div>
      <div class="timestamp">{{ formatTime(info.timestamp) }}</div>
    </div>

    <h3 class="card-title">{{ info.title }}</h3>
    <p class="card-description">{{ info.description }}</p>

    <div class="card-footer">
      <div class="keywords">
        <span
          v-for="keyword in info.keywords"
          :key="keyword"
          class="keyword-tag"
          :class="{ active: isKeywordSelected(keyword) }"
          @click.stop="$emit('keyword-click', keyword)"
        >
          {{ keyword }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  info: {
    type: Object,
    required: true,
  },
  selectedKeywords: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['click', 'keyword-click']);

// 根据来源获取颜色
const getSourceColor = (source) => {
  const colors = {
    'Twitter': 'linear-gradient(135deg, #1da1f2 0%, #0d8bd9 100%)',
    'Reddit': 'linear-gradient(135deg, #ff4500 0%, #d63900 100%)',
    'Hacker News': 'linear-gradient(135deg, #ff6600 0%, #e65c00 100%)',
    'TechCrunch': 'linear-gradient(135deg, #0a9e00 0%, #087d00 100%)',
    'Medium': 'linear-gradient(135deg, #00ab6c 0%, #008a57 100%)',
    'GitHub': 'linear-gradient(135deg, #333 0%, #1a1a1a 100%)',
    'Product Hunt': 'linear-gradient(135deg, #da552f 0%, #c2401f 100%)',
    'Dev.to': 'linear-gradient(135deg, #0a0a0a 0%, #000 100%)',
  };
  return colors[source] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
};

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// 检查关键字是否被选中
const isKeywordSelected = (keyword) => {
  return props.selectedKeywords.includes(keyword);
};

// 打开信息源链接
const openUrl = () => {
  if (props.info.url) {
    window.open(props.info.url, '_blank');
  }
};
</script>

<style scoped>
.info-card {
  cursor: pointer;
  margin-bottom: var(--spacing-lg);
  animation: fadeInUp 0.3s ease-out;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.source-badge {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.timestamp {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
  line-height: 1.4;
}

.card-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.keyword-tag {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.keyword-tag:hover {
  border-color: var(--accent-purple);
  background: rgba(102, 126, 234, 0.1);
  color: var(--accent-purple);
  transform: translateY(-1px);
}

.keyword-tag.active {
  background: var(--primary-gradient);
  border-color: transparent;
  color: white;
}
</style>
