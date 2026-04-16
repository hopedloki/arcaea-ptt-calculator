/**
 * Arcaea歌曲数据加载器
 * 从src/data目录加载完整的歌曲数据
 */

import type { SongData, SimpleSongData } from './types'
import { toSimpleSongData } from './types'
import chartData from './chart-data.json'

/**
 * 缓存的歌曲数据
 */
let cachedSongsData: SongData[] | null = null
let cachedSimpleSongsData: SimpleSongData[] | null = null

/**
 * 加载完整的歌曲数据
 * @returns Promise<SongData[]>
 */
export async function loadSongsData(): Promise<SongData[]> {
  if (cachedSongsData) {
    return cachedSongsData
  }

  try {
    // 静态导入JSON数据
    cachedSongsData = chartData as SongData[]
    return cachedSongsData
  } catch (error) {
    console.error('加载歌曲数据失败:', error)
    throw new Error('无法加载歌曲数据')
  }
}

/**
 * 加载简化的歌曲数据（用于选择器）
 * @returns Promise<SimpleSongData[]>
 */
export async function loadSimpleSongsData(): Promise<SimpleSongData[]> {
  if (cachedSimpleSongsData) {
    return cachedSimpleSongsData
  }

  try {
    const songsData = await loadSongsData()
    cachedSimpleSongsData = songsData.map(toSimpleSongData)
    return cachedSimpleSongsData
  } catch (error) {
    console.error('加载简化歌曲数据失败:', error)
    throw new Error('无法加载简化歌曲数据')
  }
}

/**
 * 根据歌曲ID获取歌曲数据
 * @param songId 歌曲ID
 * @returns SongData | null
 */
export async function getSongById(songId: string): Promise<SongData | null> {
  try {
    const songsData = await loadSongsData()
    return songsData.find(song => song.id === songId) || null
  } catch (error) {
    console.error('获取歌曲数据失败:', error)
    return null
  }
}

/**
 * 根据歌曲名称搜索歌曲
 * @param keyword 搜索关键词
 * @returns Promise<SimpleSongData[]>
 */
export async function searchSongs(keyword: string): Promise<SimpleSongData[]> {
  try {
    const songsData = await loadSimpleSongsData()
    const lowerKeyword = keyword.toLowerCase()

    return songsData.filter(song => {
      // 搜索歌曲名称
      if (song.name.toLowerCase().includes(lowerKeyword)) {
        return true
      }
      // 搜索别名
      if (song.alias.some(alias => alias.toLowerCase().includes(lowerKeyword))) {
        return true
      }
      // 搜索曲包
      if (song.pack.toLowerCase().includes(lowerKeyword)) {
        return true
      }
      return false
    })
  } catch (error) {
    console.error('搜索歌曲失败:', error)
    return []
  }
}

/**
 * 根据难度筛选歌曲
 * @param difficulty 难度
 * @param minConstant 最小定数
 * @param maxConstant 最大定数
 * @returns Promise<SimpleSongData[]>
 */
export async function filterSongsByDifficulty(
  difficulty: 'pst' | 'prs' | 'ftr' | 'byd' | 'etr',
  minConstant?: number,
  maxConstant?: number
): Promise<SimpleSongData[]> {
  try {
    const songsData = await loadSimpleSongsData()
    
    return songsData.filter(song => {
      const constant = song[difficulty]
      if (!constant) return false

      if (minConstant !== undefined && constant < minConstant) return false
      if (maxConstant !== undefined && constant > maxConstant) return false

      return true
    })
  } catch (error) {
    console.error('筛选歌曲失败:', error)
    return []
  }
}

/**
 * 根据曲包筛选歌曲
 * @param packName 曲包名称
 * @returns Promise<SimpleSongData[]>
 */
export async function filterSongsByPack(packName: string): Promise<SimpleSongData[]> {
  try {
    const songsData = await loadSimpleSongsData()
    return songsData.filter(song => song.pack === packName)
  } catch (error) {
    console.error('按曲包筛选歌曲失败:', error)
    return []
  }
}

/**
 * 清除缓存
 */
export function clearCache(): void {
  cachedSongsData = null
  cachedSimpleSongsData = null
}
