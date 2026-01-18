import { ref, watch } from 'vue';

/**
 * 本地存储 Composable
 * 提供响应式的 localStorage 操作
 */
export function useLocalStorage(key, defaultValue) {
    // 从 localStorage 读取初始值
    const storedValue = localStorage.getItem(key);
    const data = ref(storedValue ? JSON.parse(storedValue) : defaultValue);

    // 监听数据变化，自动保存到 localStorage
    watch(
        data,
        (newValue) => {
            localStorage.setItem(key, JSON.stringify(newValue));
        },
        { deep: true }
    );

    return data;
}
