# 歌曲库重构说明

## 重构概述

本次重构将歌曲数据从旧的静态数组结构迁移到新的模块化数据结构，使用 `arcaea-toolbelt-data` 项目的完整数据源。

## 重构内容

### 1. 新增数据目录结构

```
src/
├── data/
│   ├── types.ts          # 数据类型定义
│   ├── songs-loader.ts   # 歌曲数据加载器
│   ├── packs-loader.ts   # 曲包数据加载器
│   ├── chart-data.json   # 完整的歌曲数据
│   ├── ChartNotes.json   # 物量数据
│   ├── packlist.json     # 曲包列表
│   └── index.ts          # 模块入口
```

### 2. 数据结构变化

#### 旧数据结构
```javascript
const songsData = [
  {
    name: 'Testify',
    artist: 'Neko Hacker',
    pst: 7.8,
    prs: 9.4,
    ftr: 10.9,
    byd: 12.0,
    etr: null
  }
]
```

#### 新数据结构
```typescript
interface SongData {
  bpm: string
  side: 0 | 1
  id: string
  name: string
  covers: string[]
  pack: string
  dl: boolean
  alias: string[]
  charts: ChartData[]
  version: SongVersion
}

interface ChartData {
  constant: number
  difficulty: 'pst' | 'prs' | 'ftr' | 'byd' | 'etr'
  designer: string
  id: string
  level: number
  note: number
  songId: string
}
```

### 3. 工具函数更新

#### song-constants.js
- 原为同步函数，现已改为异步函数
- 内部使用 `@/data` 模块加载数据
- 保持原有接口兼容性

```javascript
// 旧方式（同步）
const songs = getSongsData()

// 新方式（异步）
const songs = await getSongsData()
```

#### song-notes-data.ts
- 重构为异步函数
- 使用新的数据结构获取物量信息
- 提供更多便捷方法

#### songs-database.ts
- 重构为异步函数
- 使用新的数据加载器
- 保持原有接口兼容性

### 4. 主要变更点

#### 新增功能
- 完整的歌曲元数据（BPM、曲包、别名等）
- 完整的谱面信息（谱师、显示等级、物量）
- 阵营信息（光/暗侧）
- 曲包管理和筛选
- 别名搜索支持

#### 数据完整性
- 歌曲数量从 ~400 首增加到 1000+ 首
- 包含更多谱面细节
- 物量信息更准确

#### 接口兼容性
所有原有的函数接口保持兼容，只是内部实现改变：
- `getSongsData()` - 现在是异步的
- `getSongByName()` - 现在是异步的
- `getSongConstant()` - 现在是异步的
- `getNotesCount()` - 现在是异步的

### 5. 迁移指南

#### 如果你的代码使用了旧的同步导入：

```vue
<script setup>
import { getSongsData } from '@/utils/song-constants.js'

// 旧代码
const songs = getSongsData()
</script>
```

需要改为：

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { getSongsData } from '@/utils/song-constants.js'

const songs = ref([])

onMounted(async () => {
  songs.value = await getSongsData()
})
</script>
```

#### 如果使用 songs-database：

```typescript
// 旧代码
import { loadSongsData } from '@/utils/songs-database'
const songs = loadSongsData()

// 新代码
import { fetchSongsFromAPI } from '@/utils/songs-database'
const songs = await fetchSongsFromAPI()
```

### 6. 需要更新的页面

以下页面需要更新以支持异步数据加载：

1. `src/pages/songs/songs.vue` - 歌曲列表页面
2. `src/pages/best30/add.vue` - 添加成绩页面
3. 其他使用歌曲数据的页面

### 7. 注意事项

1. **异步处理**：所有数据加载都是异步的，需要使用 `await` 或 `.then()`
2. **错误处理**：建议添加 try-catch 处理数据加载错误
3. **缓存机制**：数据加载器内置缓存机制，不会重复加载
4. **类型安全**：TypeScript 文件提供完整的类型支持

### 8. 数据来源

数据来源：https://github.com/DarrenDanielDay/arcaea-toolbelt-data/tree/main/src/data

数据文件：
- `chart-data.json` - 主要歌曲数据
- `ChartNotes.json` - 物量数据
- `packlist.json` - 曲包列表

### 9. 下一步工作

1. 更新所有使用歌曲数据的页面组件
2. 测试所有功能确保正常工作
3. 添加更多基于新数据的筛选和搜索功能
4. 优化数据加载性能
