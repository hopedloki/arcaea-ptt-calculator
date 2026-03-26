/**
 * Arcaea歌曲数据类型定义
 * 基于 arcaea-toolbelt-data 的数据结构
 */

/**
 * 谱面信息
 */
export interface ChartData {
  constant: number // 定数
  difficulty: 'pst' | 'prs' | 'ftr' | 'byd' | 'etr' // 难度标识
  designer: string // 谱师名称
  id: string // 谱面唯一ID (songId@difficulty)
  level: number // 显示等级
  note: number // 物量
  songId: string // 对应的歌曲ID
  plus?: boolean // 是否为Plus谱面
  override?: {
    cover?: string
    name?: string
    bpm?: string
  }
}

/**
 * 歌曲版本信息
 */
export interface SongVersion {
  added: string // 加入版本
  removed?: string // 移除版本
  updated?: string // 更新版本
}

/**
 * 歌曲数据
 */
export interface SongData {
  bpm: string // BPM
  side: 0 | 1 // 阵营 (0=光/光侧, 1=对立/暗侧)
  id: string // 歌曲唯一标识
  name: string // 歌曲名称
  covers: string[] // 封面图片文件名数组
  pack: string // 所属曲包
  dl: boolean // 是否为下载曲
  alias: string[] // 别名/俗称数组
  charts: ChartData[] // 谱面信息数组
  version: SongVersion // 版本信息
}

/**
 * 曲包信息
 */
export interface PackData {
  id: string // 曲包ID
  name: string // 曲包名称
  set?: string // 套装名称
}

/**
 * 简化的歌曲数据（用于选择器）
 */
export interface SimpleSongData {
  id: string
  name: string
  artist?: string
  pack: string
  dl: boolean
  alias: string[]
  pst?: number
  prs?: number
  ftr?: number
  byd?: number
  etr?: number
  pstNotes?: number
  prsNotes?: number
  ftrNotes?: number
  bydNotes?: number
  etrNotes?: number
}

/**
 * 转换SongData到SimpleSongData
 */
export function toSimpleSongData(song: SongData): SimpleSongData {
  const result: SimpleSongData = {
    id: song.id,
    name: song.name,
    pack: song.pack,
    dl: song.dl,
    alias: song.alias,
  }

  // 从charts中提取定数和物量
  song.charts.forEach(chart => {
    result[chart.difficulty] = chart.constant
    result[`${chart.difficulty}Notes` as keyof SimpleSongData] = chart.note
  })

  return result
}

// 确保类型被正确导出
export type { SongData, SimpleSongData, PackData, ChartData }
