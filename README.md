# Jennica

Jennica 是一个基于 Vue 3 + Vite 的信息聚合助手，聚焦技术内容，支持自定义关键字和信息来源，帮助你集中追踪 GitHub、Hacker News、Dev.to 以及任意 RSS/Atom 网站的最新动态。

## 功能亮点
- 关键字管理：自定义高亮和筛选关键词，精准掌握关注主题。
- 信息源管理：内置 GitHub/Hacker News/Dev.to，可添加任意 RSS 链接作为自定义来源并按需启停。
- 智能筛选：按关键字、来源、全文搜索实时过滤，按日期时间线展示，并突出匹配关键词。
- 本地持久化：关键字和信息源配置自动保存在浏览器 localStorage，无需额外后端。
- 制药资讯标签：主页提供“制药资讯” Skill 介绍页，展示快速指令、数据源、流程与资产模版，方便复用。

## 开发 & 构建
```bash
npm install      # 安装依赖
npm run dev      # 本地开发，默认 http://localhost:5173
npm run build    # 生产构建，输出 dist/
npm run preview  # 预览生产版本
```

## 自定义信息源
1. 打开页面后的 “信息源管理” 卡片。
2. 填写来源名称与 RSS/Atom 链接（例如 https://techcrunch.com/feed/）。
3. 新来源立即与现有关键字联动，刷新后即可看到聚合内容；可随时禁用或删除。

若需部署到 GitHub Pages，本仓库已内置自动化工作流，推送到 `main` 分支将自动构建并发布。

## Pharma Daily Skill

`skills/pharma-daily/` 基于 ai-daily-skill 工作流进行抽象，聚合 FiercePharma、Endpoints、PharmaTimes、FDA 与 ClinicalTrials.gov RSS，生成制药情报 JSON，供智能体撰写日报或渲染资产。

```bash
python skills/pharma-daily/scripts/fetch_pharma_news.py            # 抓取当天 (UTC+8)
python skills/pharma-daily/scripts/fetch_pharma_news.py --date 2026-02-10
python skills/pharma-daily/scripts/fetch_pharma_news.py --date-range
python skills/pharma-daily/scripts/generate_pharma_report.py --date 2026-02-10 --public
```

抓取结果保存在 `storage/pharma-news/{date}.json`，随后运行 `generate_pharma_report.py` 会生成 `storage/pharma-news/{date}.report.json` 并同步到 `public/pharma-news/{date}.report.json`。

主页的“制药资讯”标签会自动读取该报告，展示速览、分类解读、关键词雷达与附件，若文件缺失则回退到样例数据。
