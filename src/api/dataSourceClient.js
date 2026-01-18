import axios from 'axios';

/**
 * GitHub API 客户端
 * 获取 GitHub Trending 仓库
 */
export async function fetchGitHubTrending(language = '', keywords = []) {
    try {
        // GitHub Search API - 搜索最近一周的热门仓库
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // 构建搜索查询
        let query = `created:>${since}`;
        if (language) {
            query += ` language:${language}`;
        }
        if (keywords.length > 0) {
            query += ` ${keywords.join(' OR ')}`;
        }

        const response = await axios.get('https://api.github.com/search/repositories', {
            params: {
                q: query,
                sort: 'stars',
                order: 'desc',
                per_page: 20,
            },
            headers: {
                'Accept': 'application/vnd.github.v3+json',
            },
        });

        return response.data.items.map(item => ({
            id: `github-${item.id}`,
            title: item.full_name,
            description: item.description || '暂无描述',
            source: 'GitHub',
            url: item.html_url,
            timestamp: item.created_at,
            keywords: extractKeywords(item),
            imageUrl: null,
        }));
    } catch (error) {
        console.error('GitHub API 错误:', error);
        return [];
    }
}

/**
 * RSS2JSON 服务
 * 将RSS源转换为JSON
 */
export async function fetchRSSFeed(rssUrl, sourceName) {
    try {
        const response = await axios.get('https://api.rss2json.com/v1/api.json', {
            params: {
                rss_url: rssUrl,
                api_key: 'YOUR_API_KEY', // 可选，免费版本有限制
                count: 10,
            },
        });

        if (response.data.status !== 'ok') {
            throw new Error('RSS解析失败');
        }

        return response.data.items.map((item, index) => ({
            id: `rss-${sourceName}-${index}`,
            title: item.title,
            description: stripHtml(item.description || item.content || ''),
            source: sourceName,
            url: item.link,
            timestamp: item.pubDate,
            keywords: extractKeywordsFromText(item.title + ' ' + item.description),
            imageUrl: item.thumbnail || null,
        }));
    } catch (error) {
        console.error(`RSS (${sourceName}) 错误:`, error);
        return [];
    }
}

/**
 * Hacker News API (官方支持CORS)
 */
export async function fetchHackerNews(keywords = []) {
    try {
        // 获取首页热门故事
        const topStoriesResponse = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
        const storyIds = topStoriesResponse.data.slice(0, 20); // 前20条

        // 并发获取故事详情
        const storyPromises = storyIds.map(id =>
            axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
        );

        const stories = await Promise.all(storyPromises);

        return stories
            .map(response => response.data)
            .filter(story => story && story.title) // 过滤无效数据
            .map(story => ({
                id: `hn-${story.id}`,
                title: story.title,
                description: story.text ? stripHtml(story.text) : `${story.score || 0} points`,
                source: 'Hacker News',
                url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
                timestamp: new Date(story.time * 1000).toISOString(),
                keywords: extractKeywordsFromText(story.title),
                imageUrl: null,
            }));
    } catch (error) {
        console.error('Hacker News API 错误:', error);
        return [];
    }
}

/**
 * Dev.to API (官方支持CORS)
 */
export async function fetchDevTo(tags = []) {
    try {
        const response = await axios.get('https://dev.to/api/articles', {
            params: {
                per_page: 20,
                tag: tags.join(','),
            },
        });

        return response.data.map(article => ({
            id: `devto-${article.id}`,
            title: article.title,
            description: article.description || '',
            source: 'Dev.to',
            url: article.url,
            timestamp: article.published_at,
            keywords: article.tag_list || [],
            imageUrl: article.cover_image || null,
        }));
    } catch (error) {
        console.error('Dev.to API 错误:', error);
        return [];
    }
}

// 辅助函数
function extractKeywords(repo) {
    const keywords = [];
    if (repo.language) keywords.push(repo.language);
    if (repo.topics) keywords.push(...repo.topics.slice(0, 3));
    return keywords;
}

function extractKeywordsFromText(text) {
    // 简单的关键字提取（可以改进）
    const commonKeywords = [
        'JavaScript', 'TypeScript', 'Python', 'Vue.js', 'React', 'Node.js',
        'AI', 'Machine Learning', 'Web Development', 'DevOps', 'Docker',
        'Kubernetes', 'AWS', 'Cloud', 'API', 'Database', 'Frontend', 'Backend'
    ];

    return commonKeywords.filter(keyword =>
        text.toLowerCase().includes(keyword.toLowerCase())
    );
}

function stripHtml(html) {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// 预定义的RSS源
export const RSS_SOURCES = {
    techcrunch: 'https://techcrunch.com/feed/',
    hackernoon: 'https://hackernoon.com/feed',
    smashing: 'https://www.smashingmagazine.com/feed/',
    css_tricks: 'https://css-tricks.com/feed/',
};
