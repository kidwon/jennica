<template>
  <div class="keyword-manager glass">
    <div class="manager-header">
      <h2 class="gradient-text">关键字管理</h2>
      <button class="btn-toggle" @click="isExpanded = !isExpanded">
        {{ isExpanded ? '收起' : '展开' }}
      </button>
    </div>

    <transition name="expand">
      <div v-if="isExpanded" class="manager-content">
        <div class="add-keyword-form">
          <input
            v-model="newKeywordName"
            type="text"
            placeholder="输入关键字..."
            class="keyword-input"
            @keyup.enter="handleAddKeyword"
          />
          <input
            v-model="newKeywordColor"
            type="color"
            class="color-picker"
            title="选择颜色"
          />
          <button class="btn btn-primary" @click="handleAddKeyword">
            添加
          </button>
        </div>

        <div v-if="keywords.length > 0" class="keywords-list">
          <div
            v-for="keyword in keywords"
            :key="keyword.id"
            class="keyword-item"
            :class="{ disabled: !keyword.enabled }"
          >
            <div class="keyword-info">
              <div
                class="keyword-color"
                :style="{ background: keyword.color }"
              ></div>
              <span class="keyword-name">{{ keyword.name }}</span>
            </div>

            <div class="keyword-actions">
              <button
                class="action-btn"
                :class="{ active: keyword.enabled }"
                @click="toggleKeyword(keyword.id)"
                :title="keyword.enabled ? '禁用' : '启用'"
              >
                {{ keyword.enabled ? '✓' : '○' }}
              </button>
              <button
                class="action-btn delete"
                @click="removeKeyword(keyword.id)"
                title="删除"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-keywords">
          <p>还没有添加关键字，快来添加第一个吧！</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useKeywords } from '../composables/useKeywords';

const {
  keywords,
  addKeyword,
  removeKeyword,
  toggleKeyword,
  keywordExists,
} = useKeywords();

const isExpanded = ref(true);
const newKeywordName = ref('');
const newKeywordColor = ref('#667eea');

const handleAddKeyword = () => {
  const name = newKeywordName.value.trim();
  
  if (!name) {
    alert('请输入关键字名称');
    return;
  }
  
  if (keywordExists(name)) {
    alert('该关键字已存在');
    return;
  }
  
  addKeyword(name, newKeywordColor.value);
  newKeywordName.value = '';
  newKeywordColor.value = '#667eea';
};
</script>

<style scoped>
.keyword-manager {
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

.manager-header h2 {
  font-size: 1.5rem;
  margin: 0;
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

.add-keyword-form {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.keyword-input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.9rem;
  outline: none;
  transition: all var(--transition-base);
}

.keyword-input:focus {
  border-color: var(--accent-purple);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.keyword-input::placeholder {
  color: var(--text-muted);
}

.color-picker {
  width: 50px;
  height: 38px;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  background: var(--bg-secondary);
}

.keywords-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.keyword-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
}

.keyword-item:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.keyword-item.disabled {
  opacity: 0.5;
}

.keyword-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.keyword-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--glass-border);
}

.keyword-name {
  font-weight: 500;
  color: var(--text-primary);
}

.keyword-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.action-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  background: var(--glass-bg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.action-btn:hover {
  border-color: var(--accent-purple);
  background: rgba(102, 126, 234, 0.1);
}

.action-btn.active {
  background: var(--primary-gradient);
  border-color: transparent;
  color: white;
}

.action-btn.delete:hover {
  border-color: var(--accent-pink);
  background: rgba(240, 147, 251, 0.1);
  color: var(--accent-pink);
}

.empty-keywords {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-muted);
}

/* 展开/收起动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 1000px;
}

@media (max-width: 768px) {
  .add-keyword-form {
    flex-wrap: wrap;
  }
  
  .keyword-input {
    flex: 1 1 100%;
  }
  
  .color-picker {
    flex: 1;
  }
  
  .btn {
    flex: 1;
  }
}
</style>
