import { computed } from 'vue';
import { useLocalStorage } from './useLocalStorage';

/**
 * 关键字管理 Composable
 */
export function useKeywords() {
    // 默认关键字
    const defaultKeywords = [
        { id: '1', name: 'Vue.js', color: '#42b883', enabled: true },
        { id: '2', name: 'AI', color: '#667eea', enabled: true },
        { id: '3', name: 'Web Development', color: '#f093fb', enabled: true },
    ];

    const keywords = useLocalStorage('assistant-keywords', defaultKeywords);

    // 添加关键字
    const addKeyword = (name, color = '#667eea') => {
        const newKeyword = {
            id: Date.now().toString(),
            name: name.trim(),
            color,
            enabled: true,
        };
        keywords.value.push(newKeyword);
    };

    // 删除关键字
    const removeKeyword = (id) => {
        const index = keywords.value.findIndex(k => k.id === id);
        if (index > -1) {
            keywords.value.splice(index, 1);
        }
    };

    // 更新关键字
    const updateKeyword = (id, updates) => {
        const keyword = keywords.value.find(k => k.id === id);
        if (keyword) {
            Object.assign(keyword, updates);
        }
    };

    // 切换关键字启用状态
    const toggleKeyword = (id) => {
        const keyword = keywords.value.find(k => k.id === id);
        if (keyword) {
            keyword.enabled = !keyword.enabled;
        }
    };

    // 获取启用的关键字
    const enabledKeywords = computed(() => {
        return keywords.value.filter(k => k.enabled);
    });

    // 检查关键字是否已存在
    const keywordExists = (name) => {
        return keywords.value.some(k => k.name.toLowerCase() === name.toLowerCase());
    };

    return {
        keywords,
        enabledKeywords,
        addKeyword,
        removeKeyword,
        updateKeyword,
        toggleKeyword,
        keywordExists,
    };
}
