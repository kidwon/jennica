<template>
  <div class="timeline">
    <div v-if="groupedByDate.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <h3>暂无信息</h3>
      <p>尝试调整筛选条件或添加新的关键字</p>
    </div>

    <div v-else v-for="group in groupedByDate" :key="group.label" class="timeline-group">
      <div class="timeline-date">
        <span class="date-label">{{ group.label }}</span>
        <div class="date-line"></div>
      </div>

      <div class="timeline-items">
        <InfoCard
          v-for="item in group.items"
          :key="item.id"
          :info="item"
          :selected-keywords="selectedKeywords"
          @keyword-click="handleKeywordClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import InfoCard from './InfoCard.vue';

const props = defineProps({
  groupedByDate: {
    type: Array,
    required: true,
  },
  selectedKeywords: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['keyword-click']);

const handleKeywordClick = (keyword) => {
  emit('keyword-click', keyword);
};
</script>

<style scoped>
.timeline {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-md);
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.timeline-group {
  margin-bottom: var(--spacing-2xl);
  animation: fadeIn 0.4s ease-out;
}

.timeline-date {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  position: sticky;
  top: 0;
  z-index: 10;
  padding: var(--spacing-md) 0;
  background: var(--bg-primary);
}

.date-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  backdrop-filter: blur(10px);
  white-space: nowrap;
  margin-right: var(--spacing-md);
}

.date-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, var(--glass-border), transparent);
}

.timeline-items {
  position: relative;
}

@media (max-width: 768px) {
  .timeline {
    padding: 0 var(--spacing-md);
  }
  
  .date-label {
    font-size: 0.95rem;
    padding: var(--spacing-xs) var(--spacing-md);
  }
}
</style>
