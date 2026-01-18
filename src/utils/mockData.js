// 模拟数据生成器 - 生成各类信息流数据

const sources = ['Twitter', 'Reddit', 'Hacker News', 'TechCrunch', 'Medium', 'GitHub', 'Product Hunt', 'Dev.to'];

const keywords = ['Vue.js', 'React', 'AI', 'Machine Learning', 'Web Development', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'DevOps'];

const titles = [
  '深入理解 {keyword} 的最佳实践',
  '{keyword} 2026年最新趋势和发展方向',
  '如何使用 {keyword} 构建现代化应用',
  '{keyword} 性能优化完全指南',
  '{keyword} 入门到精通完整教程',
  '为什么 {keyword} 是未来的趋势',
  '{keyword} vs 其他技术：深度对比',
  '使用 {keyword} 解决实际问题的10个案例',
  '{keyword} 最佳工具和资源推荐',
  '{keyword} 社区最新动态和更新',
];

const descriptions = [
  '本文详细介绍了一些实用的技巧和最佳实践，帮助开发者更好地理解和应用这项技术。',
  '探讨了当前的热门话题和未来发展方向，分享了行业专家的见解和预测。',
  '通过实际案例演示如何从零开始构建一个完整的应用程序，包含详细的步骤说明。',
  '深入分析了性能瓶颈和优化策略，提供了可立即应用的实用建议。',
  '面向初学者的完整教程，覆盖从基础概念到高级特性的所有内容。',
  '分析了技术发展趋势，解释了为什么这项技术值得关注和学习。',
  '客观对比了不同技术方案的优缺点，帮助开发者做出更明智的技术选型。',
  '展示了真实项目中的应用案例，提供了可复用的解决方案模板。',
  '整理了最有用的工具、库和学习资源，节省开发者的搜索时间。',
  '汇总了最新的版本更新、重要特性和社区活动信息。',
];

// 生成随机时间（最近7天内）
function getRandomDate(daysAgo = 7) {
  const now = new Date();
  const randomDays = Math.random() * daysAgo;
  const randomHours = Math.random() * 24;
  const randomMinutes = Math.random() * 60;
  
  const date = new Date(now.getTime() - (randomDays * 24 * 60 * 60 * 1000) - (randomHours * 60 * 60 * 1000) - (randomMinutes * 60 * 1000));
  return date.toISOString();
}

// 生成单条信息
export function generateInfo(keywordOverride = null) {
  const keyword = keywordOverride || keywords[Math.floor(Math.random() * keywords.length)];
  const source = sources[Math.floor(Math.random() * sources.length)];
  const titleTemplate = titles[Math.floor(Math.random() * titles.length)];
  const description = descriptions[Math.floor(Math.random() * descriptions.length)];
  
  // 随机生成多个相关关键字
  const relatedKeywords = [keyword];
  const numRelated = Math.floor(Math.random() * 3) + 1; // 1-3个额外关键字
  for (let i = 0; i < numRelated; i++) {
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    if (!relatedKeywords.includes(randomKeyword)) {
      relatedKeywords.push(randomKeyword);
    }
  }
  
  return {
    id: `info-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: titleTemplate.replace('{keyword}', keyword),
    description,
    source,
    url: `https://example.com/${keyword.toLowerCase().replace(/\s+/g, '-')}`,
    timestamp: getRandomDate(),
    keywords: relatedKeywords,
    imageUrl: null, // 可选：添加图片
  };
}

// 生成多条信息
export function generateInfoList(count = 20, specificKeywords = null) {
  const infoList = [];
  
  for (let i = 0; i < count; i++) {
    let keyword = null;
    
    // 如果提供了特定关键字，随机选择一个
    if (specificKeywords && specificKeywords.length > 0) {
      keyword = specificKeywords[Math.floor(Math.random() * specificKeywords.length)];
    }
    
    infoList.push(generateInfo(keyword));
  }
  
  // 按时间倒序排列
  return infoList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// 默认导出一些预生成的数据
export const mockInfoData = generateInfoList(30);
