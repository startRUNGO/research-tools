# 科研工具集 Research Tools Hub

一个集成多种科研工具的在线平台，帮助科研工作者提升工作效率。

## 功能特色

### 1. LaTeX 格式化工具 + **实时预览**
- **代码格式化**：自动缩进和美化 LaTeX 代码
- **语法高亮**：命令、环境、括号、数学符号、注释分色显示
- **实时数学公式预览**：使用 MathJax 渲染数学公式
- **自动预览模式**：开启后输入时自动更新预览
- **本地自动保存**：防止代码丢失
- **一键复制 / 分享链接**：快速复制或生成分享链接
- **常用命令参考**：内置 LaTeX 命令速查

#### 使用方法：
1. 在左侧输入框输入 LaTeX 代码
2. 点击"格式化代码"查看格式化结果
3. 点击"渲染预览"查看数学公式渲染效果
4. 点击"开启自动预览"启用实时预览模式

### 2. SVG 图片编辑器 + **图层管理**
- **丰富的绘图工具**：矩形、圆形、直线、文本、箭头
- **图层可视化面板**：实时查看所有图层
- **图层选择与高亮**：点击图层列表即可选中元素
- **图层分组**：多选模式 + 编组/解组，支持嵌套图层
- **图层操作**：删除、上移、下移图层
- **元素拖拽**：可拖动大部分元素调整位置
- **颜色定制**：自定义填充色、边框色和宽度
- **多格式导出**：SVG / PNG (2x Retina) / JPG
- **分享链接**：一键生成 SVG 分享链接

#### 使用方法：
1. 使用工具栏添加图形元素
2. 在画布上拖动元素调整位置
3. 在右侧图层面板查看和管理所有元素
4. 点击图层项选中元素（画布中会高亮显示）
5. 使用图层操作按钮调整顺序或删除

### 3. 神经网络模型库
包含 9 个经典神经网络架构的可视化示例：
- **CNN (卷积神经网络)**：展示卷积层、池化层、全连接层
- **RNN (循环神经网络)**：展示时间步和循环连接
- **Transformer**：展示编码器、解码器和注意力机制
- **GAN (生成对抗网络)**：展示生成器和判别器
- **ResNet (残差网络)**：跳跃连接解决梯度消失
- **LSTM (长短期记忆网络)**：门控机制处理长序列依赖
- **Autoencoder (自编码器)**：编码器-瓶颈-解码器结构
- **U-Net**：编码-解码配合跳跃连接，用于图像分割
- **Diffusion (扩散模型)**：逐步去噪的高质量图像生成

每个模型图都可以下载为 SVG 或 PNG 格式。

### 4. 科研资源导航
整合 9 大类科研资源：
- **论文搜索与下载**：Google Scholar, arXiv, Semantic Scholar 等
- **数据集与代码**：Kaggle, GitHub, Papers with Code 等
- **学术会议**：NeurIPS, ICML, CVPR, ICLR 等
- **期刊与出版物**：Nature, Science, Cell, JMLR 等
- **科研工具**：Overleaf, Zotero, Mendeley 等
- **写作与排版工具**：Turnitin, iThenticate, Tables Generator 等
- **统计与可视化**：Python, R, Plotly, draw.io, Gephi 等
- **中文学术资源**：知网, 万方, ChinaXiv, CSCD 等
- **科研管理**：ORCID, Research Square, Notion, Obsidian 等

### 5. AI 写作助手
- 精选学术写作 Prompt 模板（论文润色、降AI率、审稿回复、摘要生成、学术翻译、基金写作、文献综述、数据分析）
- 收藏功能，按分类筛选
- 一键复制到 ChatGPT / Claude 使用

### 6. AI 工具导航
- 7 大分类：对话助手、论文工具、写作翻译、绘图演示、效率工具、办公文档、编程数据
- 实时搜索过滤
- 中英双语支持

### 7. 文本工具
- 字数统计（总字符、中文、英文、句子、段落）
- 阅读时长估算
- 文本清理（去多余空白和空行）

### 8. Markdown 编辑器
- 实时预览，支持数学公式渲染（MathJax）
- 工具栏快捷插入（粗体、斜体、标题、链接、代码、表格等）
- 导出 HTML 文件
- Ctrl+B / Ctrl+I 快捷键

### 9. 参考文献管理
- BibTeX 条目解析与格式化
- DOI 自动抓取（CrossRef API）
- 引用格式转换：APA (7th) / IEEE / GB/T 7714
- 多条目批量转换

### 10. 在线协作
- 导出/导入工作区（JSON 格式，包含所有 localStorage 数据）
- 分享链接（LaTeX / SVG 内容通过 Base64 编码到 URL）

## 快速开始

1. 直接在浏览器中打开 `index.html` 文件
2. 无需安装任何依赖或启动服务器
3. 所有功能都在浏览器中运行

## 技术栈

- **前端**：HTML5, CSS3, JavaScript (原生，无框架)
- **数学渲染**：MathJax 3.x
- **图形**：SVG + Canvas API (PNG/JPG 导出)
- **国际化**：中英双语 i18n 系统 (`data-i18n` 属性)
- **存储**：localStorage 持久化
- **样式**：响应式设计 + 暗色模式

## 项目结构

```
├── index.html           # 主页面（SPA 单页应用）
├── manifest.json        # PWA 配置
├── sw.js                # Service Worker 离线缓存
├── css/
│   ├── base.css         # 变量、重置、布局、可访问性
│   ├── components.css   # 卡片、按钮、Toast、通用组件
│   ├── latex.css        # LaTeX + Markdown 工具样式
│   ├── svg-editor.css   # SVG 编辑器 + 图层 + 属性面板
│   ├── sections.css     # 模型库、资源、页脚等
│   └── responsive.css   # 响应式媒体查询
├── js/
│   ├── i18n.js          # 国际化翻译系统
│   ├── ui-core.js       # 暗色模式、菜单、Toast、回顶
│   ├── navigation.js    # SPA 导航
│   ├── latex.js         # LaTeX 格式化 + 模板库 + BibTeX
│   ├── svg-editor.js    # SVG 编辑器 + 撤销重做 + 属性面板
│   ├── models.js        # 模型图下载
│   ├── text-tools.js    # 文本分析工具
│   ├── markdown.js      # Markdown 编辑器 + 实时预览
│   ├── references.js    # 参考文献管理 + DOI 抓取
│   ├── ai-features.js   # AI 写作 + AI 工具搜索
│   └── share.js         # 分享链接 + 工作区导入导出
├── icons/               # PWA 图标
├── tests/
│   └── run.js           # 自动化测试套件 (458+ tests)
├── .github/workflows/
│   └── ci.yml           # CI/CD: 测试 + GitHub Pages 部署
└── README.md
```

## 快捷键

- `Ctrl/Cmd + K`：LaTeX 页面快速格式化代码
- `Ctrl/Cmd + Z/Y`：SVG 编辑器撤销/重做
- `Ctrl/Cmd + B/I`：Markdown 编辑器粗体/斜体

## 浏览器兼容性

支持所有现代浏览器：
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 特色亮点

### LaTeX 实时预览
- 使用业界标准的 MathJax 引擎
- 支持所有 LaTeX 数学符号和环境
- 自动包裹数学定界符
- 可切换手动/自动预览模式

### SVG 图层管理
- 直观的图层列表视图
- 图层类型图标标识（矩形◻、圆形◯、直线─、文本T）
- 选中图层在画布中高亮显示
- 支持图层重命名（自动根据内容命名）
- 图层顺序调整（z-index）

### 响应式设计
- 完美支持桌面、平板、手机
- 自适应布局
- 触摸友好的交互

## 本地存储

- LaTeX 输入内容自动保存到浏览器本地存储
- 刷新页面后内容不会丢失

## 已完成计划

- [x] LaTeX 代码语法高亮
- [x] 更多神经网络模型（新增 ResNet / LSTM / Autoencoder / U-Net / Diffusion）
- [x] SVG 图层分组（多选 + 编组/解组）
- [x] 导出 PNG/JPG 格式（2x Retina 高清）
- [x] 在线协作功能（分享链接 + 工作区导入导出）
- [x] 更多科研工具集成（新增 4 个资源分类）
- [x] 代码模块化拆分（CSS 6 个 + JS 11 个模块）
- [x] SVG 撤销/重做 + 属性面板 + 新图形（椭圆、多边形）
- [x] LaTeX 模板库（14个模板）+ BibTeX 格式化
- [x] Markdown 编辑器（实时预览 + 数学公式）
- [x] 参考文献管理（BibTeX + DOI + APA/IEEE/GB）
- [x] PWA 离线支持（Service Worker + 缓存）
- [x] SEO + 可访问性（ARIA、键盘导航、skip-link）
- [x] 自动化测试（458+ 项）
- [x] CI/CD（GitHub Actions + Pages 自动部署）

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

---

**享受你的科研工作！** 🚀
