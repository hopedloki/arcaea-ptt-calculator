# Arcaea PTT计算器

基于 UniApp 的 Arcaea PTT计算器跨平台应用重构，专为Arcaea玩家设计的PTT计算和管理工具，支持多平台运行：H5、微信小程序、支付宝小程序、抖音小程序以及App (iOS/Android)。

> 本项目是对原Arcaea PTT计算器的UniApp重构版本，保留了核心功能的同时实现了跨平台兼容性。

## 核心功能

- **PTT计算**：成绩↔PTT双向转换，支持不同难度（PST/PRS/FTR/BYD/ETR）
- **B30管理**：记录和管理您的最佳30个成绩，自动计算B30 PTT
- **容错计算**：计算达到目标PTT所需的最小Far数或者Lost数
- **歌曲库**：内置完整Arcaea歌曲数据库，支持搜索和筛选
- **数据管理**：支持成绩记录的导入导出功能
- **多平台适配**：基于UniApp实现一套代码多端运行

## 项目架构

### 前端架构

- **框架**：UniApp (基于 Vue 3)
- **构建工具**：Vite
- **多端支持**：H5、微信小程序、支付宝小程序、抖音小程序、App (iOS/Android)
- **状态管理**：Vue 3 Reactivity API
- **类型支持**：TypeScript

### UniApp重构特点

相较于原项目，本次重构的主要优势：

- **跨平台兼容**：一套代码多端运行，无需为不同平台单独开发
- **现代化UI**：优化的界面设计和交互体验
- **性能提升**：基于Vue 3的性能优化和TypeScript的类型安全

## 目录结构

```
├── src/
│   ├── components/               # 组件目录
│   ├── pages/                    # 页面文件
│   │   ├── index/                # 首页
│   │   │   └── index.vue         # 主页面
│   │   ├── calculator/           # 计算器页面
│   │   │   ├── score-ptt.vue     # 成绩↔PTT转换
│   │   │   └── tolerance.vue     # 容错计算
│   │   ├── best30/               # B30管理
│   │   │   ├── best30.vue        # B30列表
│   │   │   └── add.vue           # 添加成绩
│   │   ├── songs/                # 歌曲库
│   │   │   └── songs.vue         # 歌曲列表
│   │   ├── data/                 # 数据管理
│   │   │   └── data.vue          # 导入导出
│   │   └── about/                # 关于页面
│   │       └── about.vue         # 应用信息
│   ├── utils/                    # 工具函数
│   │   ├── ptt-calculator.ts     # PTT计算核心逻辑
│   │   ├── songs-database.ts     # 歌曲数据库
│   │   └── data-manager.ts       # 数据管理工具
│   ├── static/                   # 静态资源
│   │   └── tabbar/               # 导航图标
│   ├── App.vue                   # 应用入口组件
│   ├── main.ts                   # 应用入口文件
│   ├── pages.json                # 页面路由配置
│   └── manifest.json             # 应用配置文件
├── cloudfunctions/               # 云函数目录
├── index.html                    # H5 模板
├── vite.config.ts                # Vite 配置
├── tsconfig.json                 # TypeScript 配置
├── package.json                  # 项目依赖
├── cloudbaserc.json              # CloudBase CLI 配置
└── README.md                     # 项目说明

## PTT计算原理

本应用使用与原项目相同的PTT计算算法：

- 单曲PTT计算：基于成绩定数和评级
- B30计算：选取最好的30个成绩计算平均值
- 容错计算：根据目标PTT反推所需最小Pure数

详细的计算公式和实现请参考 `src/utils/ptt-calculator.ts` 文件。

## 部署指南

### 部署到云开发静态网站托管（H5版本）

1. 构建 H5 版本：`npm run build:h5`
2. 登录腾讯云开发控制台
3. 进入您的环境 -> 静态网站托管
4. 上传 `dist/build/h5` 目录中的文件

### 微信小程序发布

1. 构建微信小程序版本：`npm run build:mp-weixin`
2. 使用微信开发者工具打开 `dist/build/mp-weixin` 目录
3. 上传代码包并发布

### 抖音小程序发布

1. 构建抖音小程序版本：`npm run build:mp-toutiao`
2. 使用抖音开发者工具打开 `dist/build/mp-toutiao` 目录
3. 上传代码包并发布

### 支付宝小程序发布

1. 构建支付宝小程序版本：`npm run build:mp-alipay`
2. 使用支付宝开发者工具打开 `dist/build/mp-alipay` 目录
3. 上传代码包并发布

## 数据导入导出

支持以下数据格式：

- **导出格式**：JSON文件，包含所有成绩记录
- **导入格式**：支持原Arcaea PTT计算器导出的JSON格式
- **数据备份**：定期导出数据文件进行备份

## 技术栈

- **UniApp** - 跨平台应用开发框架
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - JavaScript 的超集，提供类型支持
- **Vite** - 下一代前端构建工具
- **CloudBase JS SDK** - 腾讯云开发 JavaScript SDK

## 相关链接

- [原Arcaea PTT计算器项目](https://github.com/hopedloki/-arcaea-ptt-calculator)
- [UniApp 官方文档](https://uniapp.dcloud.io/)
- [云开发官方文档](https://cloud.tencent.com/document/product/876)
- [云开发 JS SDK](https://docs.cloudbase.net/api-reference/webv3/initialization)
- [CloudBase AI ToolKit](https://github.com/TencentCloudBase/CloudBase-AI-ToolKit)

## 许可证

MIT License

## 更新日志

### v1.2.5 (2025-12-16)

- 基于原项目完成UniApp重构
- 实现跨平台兼容性（H5、小程序、App）
- UI界面现代化全面优化
- 保留原有核心功能：PTT计算、B30管理、容错计算
- 优化用户交互体验
- 实现成绩数据管理功能

### v1.2.0

- 更新了录入B30的功能，支持计算地板、B30功能
- 支持自由保存B30数据，以便下次需要可以导入

### v1.1.0

- 修复PTT的计算逻辑错误

### v1.0.0

- 首次发布完整功能版本
- 修复了构建配置问题
- 优化了UI界面
- 完善了PTT计算算法
