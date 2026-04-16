# Arcaea PTT Calculator

专为 Arcaea 玩家设计的 PTT 计算和管理工具，支持多平台运行。

## 功能介绍

### 1. PTT 计算器

支持成绩与 PTT 的双向转换计算：

- **分数转 PTT**：输入成绩分数，自动计算对应的 Potential (PTT) 值
- **PTT 转分数**：输入目标 PTT 值，计算所需的最低分数
- **支持所有难度**：Past (PST)、Present (PRS)、Future (FTR)、Beyond (BYD)、Eternal (ETR)
- **实时计算**：输入数据变化时自动更新结果

### 2. B30 管理

管理您的最佳 30 个成绩记录：

- **成绩录入**：记录歌曲名称、难度、定数、分数、评级等信息
- **B30 计算**：自动计算 Best 30 的平均 PTT 值
- **成绩筛选**：支持按难度、评级筛选显示
- **排序功能**：按 PTT、分数、日期等维度排序
- **数据持久化**：本地存储成绩记录，关闭应用后数据保留

### 3. 容错计算

计算达成目标所需的容错空间：

- **评级容错**：计算达到目标评级 (PM/EX+/EX/AA/A/B/C/D) 还能容错多少 Far 或 Lost
- **分数容错**：计算达到目标分数还能容错多少判定
- **PTT 容错**：计算达到目标 PTT 还能容错多少判定
- **双模式计算**：
  - 基于当前判定：按现有 Pure/Far/Lost 数量计算剩余容错空间
  - 基于理论值：从理论满分计算到目标的误差范围
- **物量自动填充**：选择歌曲后自动填充对应难度的 Note 数量

### 4. 歌曲库

内置完整的 Arcaea 歌曲数据库：

- **歌曲搜索**：按歌曲名称或艺术家搜索
- **难度筛选**：按 PST/PRS/FTR/BYD/ETR 筛选歌曲
- **信息完整**：包含定数、歌曲包、曲师等详细信息
- **快速选择**：可直接从歌曲库选择歌曲用于计算或记录成绩

### 5. 数据管理

支持成绩数据的导入导出：

- **数据导出**：将 B30 成绩记录导出为 JSON 文件备份
- **数据导入**：从备份文件恢复成绩数据
- **跨平台兼容**：H5 和 App 端均支持导入导出功能

## 部署指南

### 用户部署

如果您只是想使用这个应用，请直接下载 Release 页面的 APK 安装包：

1. 访问项目的 [Release 页面](https://github.com/hopedloki/-arcaea-ptt-calculator/releases)
2. 下载最新版本的 APK 文件
3. 在 Android 设备上安装 APK

### 开发者部署

如果您想在此基础上进行开发或自定义部署，请按以下步骤操作：

#### 环境要求

- Node.js 16.x 或更高版本
- HBuilderX 或 VS Code + UniApp 插件

#### 安装与运行

```bash
# 克隆项目
git clone https://github.com/hopedloki/-arcaea-ptt-calculator.git
cd arcaea-ptt-calculator

# 安装依赖
npm install

# H5 开发模式
npm run dev:h5

# 微信小程序开发模式
npm run dev:mp-weixin

# App 开发模式
# 使用 HBuilderX 打开项目，选择【运行】->【运行到手机或模拟器】
```

#### 构建发布

```bash
# 构建 H5 版本
npm run build:h5

# 构建微信小程序
npm run build:mp-weixin

# 构建 App（使用 HBuilderX）
# 选择【发行】->【原生App-云打包】
```

## 技术实现

### 计算算法

应用采用与 Arcaea 官方一致的 PTT 计算标准：

- **分数系统**：单 Note 基础分 = 10,000,000 / Note总数
- **判定分数**：Pure = 100%，Far = 50%，Lost = 0%
- **附加分**：每个大 Pure 额外 +1 分，理论满分为 10,000,000 + Note总数
- **PTT 分段**：
  - 10,000,000 分：PTT = 定数 + 2.0
  - 9,900,000-10,000,000：PTT = 定数 + 1.5 + (分数-9,900,000) / 100,000
  - 9,800,000-9,900,000：PTT = 定数 + 1.0 + (分数-9,800,000) / 200,000
  - 9,500,000-9,800,000：PTT = 定数 + (分数-9,500,000) / 300,000

### 技术栈

- **UniApp** - 跨平台应用开发框架
- **Vue 3** - 前端框架
- **TypeScript** - 类型支持
- **Vite** - 构建工具

### 目录结构

```
├── src/
│   ├── components/          # 公共组件
│   ├── pages/               # 页面文件
│   │   ├── index/           # 首页
│   │   ├── calculator/      # PTT计算器页面
│   │   ├── best30/          # B30管理页面
│   │   ├── songs/           # 歌曲库页面
│   │   ├── data/            # 数据管理页面
│   │   └── about/           # 关于页面
│   ├── data/                # 歌曲数据库
│   ├── utils/               # 工具函数
│   ├── static/              # 静态资源
│   └── App.vue              # 应用入口
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 相关链接

- [UniApp 官方文档](https://uniapp.dcloud.io/)
- [Arcaea 官方网站](https://arcaea.lowiro.com/)

## 许可证

MIT License
