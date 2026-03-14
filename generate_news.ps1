# 生成3月份每天的新闻数据
$newsDir = "C:\Users\alston\ai-daily-news\news"

# AI 新闻来源和话题
$sources = @("OpenAI", "Anthropic", "Google DeepMind", "Meta", "Microsoft", "Apple", "Amazon", "NVIDIA", "xAI", "Mistral AI", "Stability AI", "Hugging Face", "百度", "阿里云", "腾讯AI Lab", "字节跳动", "商汤科技", "旷视科技", "Mistral", "Cohere")

$tags = @("大模型", "AIGC", "开发者工具", "开源", "芯片", "机器人", "自动驾驶", "生物计算", "AI安全", "学术研究", "投资并购", "产品发布", "行业动态", "技术解读", "AI硬件")

$topics = @(
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
)

# 3月份每天生成新闻
for ($day = 1; $day -le 31; $day++) {
    $dateStr = "2026-03-{0:D2}" -f $day
    $newsItems = @()
    
    # 每天生成20条新闻
    for ($i = 0; $i -lt 20; $i++) {
        $source = $sources[$i % $sources.Count]
        $tag = $tags[$i % $tags.Count]
        $topic = $topics[$i % $topics.Count]
        
        $newsItem = @{
            title = "$source $topic"
            source = $source
            url = "https://example.com/news/$dateStr/$i"
            summary = "这是一条关于 $source 最新 AI 进展的报道。$topic 的发布标志着 AI 技术又迈出了重要一步，为行业发展带来新的机遇和挑战。"
            date = $dateStr
            tag = $tag
        }
        
        $newsItems += $newsItem
    }
    
    # 添加一些⭐️标记的重要新闻（随机选择5条）
    $importantIndices = (Get-Random -Minimum 0 -Maximum 20 -Count 5) | Sort-Object
    foreach ($idx in $importantIndices) {
        $newsItems[$idx].title = "⭐️ " + $newsItems[$idx].title
    }
    
    $newsData = @{
        lastUpdate = "$($dateStr)T00:00:00Z"
        news = $newsItems
    }
    
    $filePath = Join-Path $newsDir "$dateStr.json"
    $jsonContent = $newsData | ConvertTo-Json -Depth 10
    # 写入文件，使用UTF-8编码（无BOM）
    [System.IO.File]::WriteAllText($filePath, $jsonContent, [System.Text.UTF8Encoding]::new($false))
    
    Write-Host "Created: $filePath"
}

Write-Host "All news files created successfully!"
