import { computed } from 'vue';
import { useLocalStorage } from './useLocalStorage';

const DEFAULT_SOURCES = [
    { id: 'github', name: 'GitHub', type: 'github', enabled: true, removable: false },
    { id: 'hacker-news', name: 'Hacker News', type: 'hackerNews', enabled: true, removable: false },
    { id: 'devto', name: 'Dev.to', type: 'devto', enabled: true, removable: false },
];

function normalizeSources(items = []) {
    const normalized = items.map((source) => ({
        id: source.id,
        name: source.name,
        type: source.type || 'rss',
        url: source.url || '',
        enabled: source.enabled !== false,
        removable: source.removable === false ? false : true,
    })).filter((source) => Boolean(source.id && source.name));

    DEFAULT_SOURCES.forEach((defaultSource) => {
        const exists = normalized.some((source) => source.id === defaultSource.id);
        if (!exists) {
            normalized.push({ ...defaultSource });
        }
    });

    return normalized;
}

export function useSources() {
    const sources = useLocalStorage('assistant-sources', normalizeSources(DEFAULT_SOURCES));
    sources.value = normalizeSources(sources.value);

    const enabledSources = computed(() =>
        sources.value.filter((source) => source.enabled)
    );

    const addSource = (name, url) => {
        const trimmedName = name.trim();
        const trimmedUrl = url.trim();

        if (!trimmedName || !trimmedUrl) {
            return;
        }

        const newSource = {
            id: `rss-${Date.now()}`,
            name: trimmedName,
            type: 'rss',
            url: trimmedUrl,
            enabled: true,
            removable: true,
        };

        sources.value.push(newSource);
    };

    const removeSource = (id) => {
        const index = sources.value.findIndex((source) => source.id === id);
        if (index > -1 && sources.value[index].removable !== false) {
            sources.value.splice(index, 1);
        }
    };

    const toggleSource = (id) => {
        const source = sources.value.find((item) => item.id === id);
        if (source) {
            source.enabled = !source.enabled;
        }
    };

    const sourceNameExists = (name) =>
        sources.value.some((source) => source.name.toLowerCase() === name.toLowerCase());

    const sourceUrlExists = (url) =>
        sources.value.some((source) => source.url && source.url.toLowerCase() === url.toLowerCase());

    return {
        sources,
        enabledSources,
        addSource,
        removeSource,
        toggleSource,
        sourceNameExists,
        sourceUrlExists,
    };
}
