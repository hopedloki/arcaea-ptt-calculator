# 数据验证和测试指南

## 重构完成检查清单

### ✅ 已完成的工作

1. **数据目录结构创建**
   - ✅ 创建 `src/data/` 目录
   - ✅ 复制 `chart-data.json` (完整歌曲数据)
   - ✅ 复制 `ChartNotes.json` (物量数据)
   - ✅ 复制 `packlist.json` (曲包列表)

2. **数据模块创建**
   - ✅ `src/data/types.ts` - 数据类型定义
   - ✅ `src/data/songs-loader.ts` - 歌曲数据加载器
   - ✅ `src/data/packs-loader.ts` - 曲包数据加载器
   - ✅ `src/data/index.ts` - 模块入口

3. **工具函数重构**
   - ✅ `src/utils/song-constants.js` - 异步化重构
   - ✅ `src/utils/song-notes-data.ts` - 使用新数据结构
   - ✅ `src/utils/songs-database.ts` - 适配新数据结构

4. **页面组件更新**
   - ✅ `src/pages/songs/songs.vue` - 支持异步数据加载

5. **文档创建**
   - ✅ `REFACTOR_NOTES.md` - 重构说明文档

## 数据验证步骤

### 1. 验证数据文件完整性

```bash
# 检查chart-data.json文件大小和格式
ls -lh src/data/chart-data.json

# 验证JSON格式是否正确
cat src/data/chart-data.json | python -m json.tool > /dev/null
```

### 2. 测试数据加载器

在浏览器控制台或开发工具中运行以下测试：

```javascript
// 测试1: 加载歌曲数据
import { loadSimpleSongsData } from '@/data'

const songs = await loadSimpleSongsData()
console.log('歌曲总数:', songs.length)
console.log('第一首歌曲:', songs[0])

// 预期输出:
// 歌曲总数: > 1000
// 第一首歌曲: 包含完整的歌曲信息（id, name, charts等）
```

```javascript
// 测试2: 搜索功能
import { searchSongs } from '@/data'

const results = await searchSongs('Testify')
console.log('搜索结果:', results)

// 预期输出:
// 应该找到包含"Testify"的歌曲
```

```javascript
// 测试3: 筛选功能
import { filterSongsByDifficulty } from '@/data'

const ftrSongs = await filterSongsByDifficulty('ftr', 10.0, 11.0)
console.log('FTR 10.0-11.0的歌曲数量:', ftrSongs.length)

// 预期输出:
// 应该返回多个FTR难度在10.0-11.0之间的歌曲
```

```javascript
// 测试4: 物量查询
import { getNotesCount } from '@/utils/song-notes-data'

const notes = await getNotesCount('testify', 'ftr')
console.log('Testify FTR物量:', notes)

// 预期输出:
// 应该返回正确的物量数字
```

### 3. 验证页面功能

#### 歌曲列表页面 (songs.vue)

1. 打开应用，进入歌曲列表页面
2. 验证：
   - [ ] 页面正常显示，没有加载错误
   - [ ] 显示的歌曲数量应该 > 1000
   - [ ] 可以正常滚动浏览歌曲列表
   - [ ] 搜索功能正常工作
   - [ ] 定数筛选功能正常工作
   - [ ] 点击歌曲可以正常选择

#### 添加成绩页面 (best30/add.vue)

1. 从添加成绩页面选择歌曲
2. 验证：
   - [ ] 歌曲选择页面正常打开
   - [ ] 可以搜索和筛选歌曲
   - [ ] 选择歌曲后正确返回并填充歌曲信息

### 4. 数据完整性检查

```javascript
// 检查每首歌曲是否都有必要的字段
import { loadSimpleSongsData } from '@/data'

const songs = await loadSimpleSongsData()
const errors = []

songs.forEach((song, index) => {
  // 检查必需字段
  if (!song.id) errors.push(`歌曲${index}: 缺少id`)
  if (!song.name) errors.push(`歌曲${index}: 缺少name`)
  if (!song.pack) errors.push(`歌曲${index}: 缺少pack`)
  
  // 检查至少有一个难度
  const hasDifficulty = song.pst || song.prs || song.ftr || song.byd || song.etr
  if (!hasDifficulty) errors.push(`歌曲${index}: 没有任何难度`)
  
  // 检查物量字段
  if (song.ftr && !song.ftrNotes) {
    errors.push(`歌曲${song.name}: FTR有定数但缺少物量`)
  }
})

if (errors.length > 0) {
  console.error('发现数据错误:', errors)
} else {
  console.log('✅ 数据完整性检查通过')
}
```

### 5. 性能测试

```javascript
import { loadSimpleSongsData } from '@/data'

// 测试首次加载时间
console.time('首次加载')
await loadSimpleSongsData()
console.timeEnd('首次加载')

// 测试缓存加载时间
console.time('缓存加载')
await loadSimpleSongsData()
console.timeEnd('缓存加载')

// 预期输出:
// 首次加载: < 100ms (取决于设备)
// 缓存加载: < 10ms
```

## 已知问题和注意事项

### 数据结构差异

新数据结构与旧数据结构的对比：

| 特性 | 旧数据 | 新数据 |
|------|--------|--------|
| 歌曲数量 | ~400 | 1000+ |
| 歌曲ID | 无 | 有 |
| 歌曲别名 | 无 | 有 |
| 谱面信息 | 仅定数 | 完整谱面信息 |
| 物量 | 单独文件 | 集成在charts中 |
| BPM | 无 | 有 |
| 曲包 | 无 | 有 |
| 阵营 | 无 | 有 |

### 兼容性说明

- 所有原有函数接口保持兼容
- 只是内部实现从同步改为异步
- 需要在调用时使用 `await`

### 性能优化建议

1. 数据加载已内置缓存机制
2. 建议在应用启动时预加载歌曲数据
3. 可以考虑对歌曲列表进行虚拟滚动优化

## 测试完成标准

- [ ] 所有数据文件正确复制到项目目录
- [ ] 数据加载器所有功能正常工作
- [ ] 页面组件可以正常显示和使用
- [ ] 搜索和筛选功能正常
- [ ] 物量查询功能正常
- [ ] 没有控制台错误
- [ ] 应用性能良好

## 回滚方案

如果遇到严重问题需要回滚：

1. 恢复旧的工具函数文件
2. 删除 `src/data/` 目录
3. 恢复 `src/pages/songs/songs.vue` 的导入语句
4. 重新编译和测试

## 下一步工作

1. ✅ 完成基础重构
2. ⏳ 测试所有页面功能
3. ⏳ 优化数据加载性能
4. ⏳ 添加更多基于新数据的功能（曲包筛选、别名搜索等）
5. ⏳ 更新用户文档
