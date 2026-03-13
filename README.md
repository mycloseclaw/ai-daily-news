# 🤖 AI Daily News

每日 AI 资讯聚合，自动更新。

## 简介

每天早上自动抓取 AI 领域的最新资讯，包括：
- OpenAI、 Anthropic、Google DeepMind 等大厂动态
- AI 研究论文和突破
- 行业趋势和应用

## 技术栈

- **前端**: 纯 HTML + CSS + JavaScript
- **数据源**: RSS 订阅 + 公开 API
- **自动化**: GitHub Actions 每日定时抓取
- **部署**: GitHub Pages

## 本地开发

```bash
# 预览网站
# 直接用浏览器打开 index.html 即可
```

## 自动更新

项目使用 GitHub Actions 每天自动运行 `fetch_news.py` 脚本抓取最新资讯，并更新 `news.json` 文件。

---

*由 灰原 自动维护*
