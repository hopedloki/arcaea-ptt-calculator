# 歌曲数据库说明

## 歌曲列表包含的信息字段

### 基本信息
- **id**: 歌曲唯一标识符
- **name**: 歌曲名称
- **artist**: 歌手/艺术家
- **pack**: 所属曲包名称

### 难度信息
- **pst**: Past 难度定数 (绿谱)
- **prs**: Present 难度定数 (蓝谱)
- **ftr**: Future 难度定数 (橙谱)
- **byd**: Beyond 难度定数 (红谱)
- **etr**: Eternal 难度定数 (紫谱，部分歌曲特有)

### 物量信息
- **pstNotes**: Past 难度物量 (Note数量)
- **prsNotes**: Present 难度物量
- **ftrNotes**: Future 难度物量
- **bydNotes**: Beyond 难度物量
- **etrNotes**: Eternal 难度物量

### 其他信息
- **dl**: 是否为下载曲 (true/false)
- **alias**: 歌曲别名数组（用于搜索）

## 数据示例

```json
{
  "id": "black_fate",
  "name": "Black Fate",
  "artist": "Team Grimoire vs Laur",
  "pack": "Black Fate",
  "pst": 6.0,
  "prs": 7.5,
  "ftr": 9.5,
  "byd": 10.0,
  "etr": null,
  "pstNotes": 850,
  "prsNotes": 1200,
  "ftrNotes": 1650,
  "bydNotes": 1850,
  "etrNotes": null,
  "dl": false,
  "alias": ["bf", "blackfate"]
}
```

## 使用说明

1. **难度筛选**：通过定数字段筛选不同难度的歌曲
2. **曲包筛选**：通过 pack 字段筛选特定曲包的歌曲
3. **文本搜索**：支持搜索歌曲名称、歌手和别名
4. **容错计算**：使用定数和物量计算不同评级的容错值

## 数据来源

- 数据基于 Arcaea 官方数据库
- 定数和物量信息来自 @cloudbase/data
- 定期更新以包含最新歌曲
