// 生成3月份每天的新闻数据
const fs = require('fs');
const path = require('path');

const newsDir = path.join(__dirname, 'news');

// AI 新闻来源
const sources = [
    "OpenAI", "Anthropic", "Google DeepMind", "Meta", "Microsoft", 
    "Apple", "Amazon", "NVIDIA", "xAI", "Mistral AI", 
    "Stability AI", "Hugging Face", "Baidu", "Alibaba Cloud", 
    "Tencent AI Lab", "ByteDance", "SenseTime", "Megvii", 
    "Mistral", "Cohere"
];

const tags = [
    "大模型", "AIGC", "开发者工具", "开源", "芯片", 
    "机器人", "自动驾驶", "生物计算", "AI安全", "学术研究",
    "投资并购", "产品发布", "行业动态", "技术解读", "AI硬件"
];

const topics = [
    "发布 GPT-5，带来前所未有的推理能力",
    "推出 Claude 4，性能超越 GPT-5",
    "发布 AlphaFold 3，预测所有生物分子结构",
    "开源 LLaMA 4，性能接近闭源模型",
    "发布 Copilot Workspace，AI 编程全面升级",
    "AI 视频生成再突破：Sora 2 支持 10 分钟高清视频",
    "发布新一代 AI 芯片，性能提升 10 倍",
    "推出 AI 助手产品，用户突破 1 亿",
    "开源新的多模态模型，支持图像和视频理解",
    "发布 AI 安全指南，强调负责任 AI 开发",
    "推出企业级 AI 解决方案",
    "发布新一代搜索引擎，整合 AI 能力",
    "推出 AI 编程助手，用户满意度创新高",
    "开源扩散模型技术，提升生成效率",
    "发布 AI 评估基准，覆盖 100+ 任务",
    "推出边缘 AI 芯片，支持实时推理",
    "发布多语言大模型，支持 100+ 语言",
    "开源 RLHF 训练框架",
    "推出 AI 写作助手，支持 20+ 文体",
    "发布 AI 音乐生成模型",
    "开源模型压缩工具包",
    "发布新一代机器人控制系统",
    "推出 AI 医疗诊断产品",
    "开源自动驾驶数据集",
    "发布 AI 教育平台",
    "推出 AI 翻译新模型，准确率创新高",
    "开源强化学习库",
    "发布 AI 图像编辑工具",
    "推出对话 AI 新产品",
    "开源高效推理引擎"
];

// 3月份每天生成新闻
for (let day = 1; day <= 31; day++) {
    const dateStr = `2026-03-${day.toString().padStart(2, '0')}`;
    const newsItems = [];
    
    // 每天生成20条新闻
    for (let i = 0; i < 20; i++) {
        const source = sources[i % sources.length];
        const tag = tags[i % tags.length];
        const topic = topics[i % topics.length];
        
        const newsItem = {
            title: `${source} ${topic}`,
            source: source,
            url: `https://example.com/news/${dateStr}/${i}`,
            summary: `这是一条关于 ${source} 最新 AI 进展的报道。${topic} 的发布标志着 AI 技术又迈出了重要一步，为行业发展带来新的机遇和挑战。`,
            date: dateStr,
            tag: tag
        };
        
        newsItems.push(newsItem);
    }
    
    // 随机选择5条标记为重要
    const importantIndices = [];
    while (importantIndices.length < 5) {
        const idx = Math.floor(Math.random() * 20);
        if (!importantIndices.includes(idx)) {
            importantIndices.push(idx);
        }
    }
    
    for (const idx of importantIndices) {
        newsItems[idx].title = "⭐️ " + newsItems[idx].title;
    }
    
    const newsData = {
        lastUpdate: `${dateStr}T00:00:00Z`,
        news: newsItems
    };
    
    const filePath = path.join(newsDir, `${dateStr}.json`);
    fs.writeFileSync(filePath, JSON.stringify(newsData, null, 2), 'utf8');
    
    console.log(`Created: ${filePath}`);
}

console.log('All news files created successfully!');
