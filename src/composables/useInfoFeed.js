import { ref, computed } from 'vue';
import {
    fetchGitHubTrending,
    fetchHackerNews,
    fetchDevTo,
    fetchRSSFeed,
    RSS_SOURCES
} from '../api/dataSourceClient';

/**
 * 信息流管理 Composable - 使用真实数据
 */
export function useInfoFeed() {
    const infoList = ref([]);
    const searchQuery = ref('');
    const selectedKeywords = ref([]);
    const selectedSource = ref('all');
    const isLoading = ref(false);
    const error = ref(null);

    // 筛选后的信息流
    const filteredInfo = computed(() => {
        let result = infoList.value;

        // 按关键字筛选
        if (selectedKeywords.value.length > 0) {
            result = result.filter(info => {
                return info.keywords.some(keyword =>
                    selectedKeywords.value.includes(keyword)
                );
            });
        }

        // 按来源筛选
        if (selectedSource.value !== 'all') {
            result = result.filter(info => info.source === selectedSource.value);
        }

        // 按搜索查询筛选
        if (searchQuery.value.trim()) {
            const query = searchQuery.value.toLowerCase();
            result = result.filter(info =>
                info.title.toLowerCase().includes(query) ||
                info.description.toLowerCase().includes(query)
            );
        }

        return result;
    });

    // 按日期分组的信息
    const groupedByDate = computed(() => {
        const groups = {};

        filteredInfo.value.forEach(info => {
            const date = new Date(info.timestamp);
            const dateKey = getDateLabel(date);

            if (!groups[dateKey]) {
                groups[dateKey] = {
                    label: dateKey,
                    date: date,
                    items: [],
                };
            }

            groups[dateKey].items.push(info);
        });

        // 转换为数组并排序
        return Object.values(groups).sort((a, b) => b.date - a.date);
    });

    // 获取所有可用的来源
    const availableSources = computed(() => {
        const sources = new Set(infoList.value.map(info => info.source));
        return ['all', ...Array.from(sources)];
    });

    // 获取日期标签（今天、昨天、具体日期）
    function getDateLabel(date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        if (targetDate.getTime() === today.getTime()) {
            return '今天';
        } else if (targetDate.getTime() === yesterday.getTime()) {
            return '昨天';
        } else {
            // 返回格式化的日期
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${month}月${day}日`;
        }
    }

    // 格式化时间
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // 切换关键字筛选
    const toggleKeywordFilter = (keyword) => {
        const index = selectedKeywords.value.indexOf(keyword);
        if (index > -1) {
            selectedKeywords.value.splice(index, 1);
        } else {
            selectedKeywords.value.push(keyword);
        }
    };

    // 清除所有筛选
    const clearFilters = () => {
        searchQuery.value = '';
        selectedKeywords.value = [];
        selectedSource.value = 'all';
    };

    // 获取真实数据
    const fetchData = async (userKeywords = []) => {
        isLoading.value = true;
        error.value = null;
        const allData = [];

        try {
            // 并发获取所有数据源
            const [githubData, hackerNewsData, devToData] = await Promise.allSettled([
                fetchGitHubTrending('', userKeywords),
                fetchHackerNews(userKeywords),
                fetchDevTo(userKeywords),
            ]);

            // 处理成功的请求
            if (githubData.status === 'fulfilled') {
                allData.push(...githubData.value);
            }
            if (hackerNewsData.status === 'fulfilled') {
                allData.push(...hackerNewsData.value);
            }
            if (devToData.status === 'fulfilled') {
                allData.push(...devToData.value);
            }

            // 按时间排序
            allData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            infoList.value = allData;
        } catch (err) {
            error.value = '数据获取失败，请稍后重试';
            console.error('数据获取错误:', err);
        } finally {
            isLoading.value = false;
        }
    };

    // 手动刷新
    const refreshData = async (userKeywords = []) => {
        await fetchData(userKeywords);
    };

    return {
        infoList,
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
        formatTime,
        fetchData,
        refreshData,
    };
}
