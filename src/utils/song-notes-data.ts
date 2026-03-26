/**
 * Arcaea歌曲物量数据加载器
 * 从src/data/chart-data.json加载物量信息
 * 这是对原有song-notes-data.ts的重构，使用新的数据结构
 */

import { loadSongsData, SongData } from '@/data'

/**
 * 缓存的歌曲数据
 */
let cachedSongsData: SongData[] | null = null

/**
 * 加载歌曲数据
 */
async function ensureSongsDataLoaded(): Promise<void> {
  if (!cachedSongsData) {
    cachedSongsData = await loadSongsData()
  }
}

/**
 * 根据歌曲ID和难度获取物量
 * @param songId 歌曲ID
 * @param difficulty 难度 (pst/prs/ftr/byd/etr)
 * @returns 物量数量，如果没有找到则返回null
 */
export async function getNotesCount(songId: string, difficulty: string): Promise<number | null> {
  try {
    await ensureSongsDataLoaded()
    
    const song = cachedSongsData!.find(s => s.id === songId)
    if (!song) return null
    
    const chart = song.charts.find(c => c.difficulty === difficulty.toLowerCase())
    return chart ? chart.note : null
  } catch (error) {
    console.error('获取物量失败:', error)
    return null
  }
}

/**
 * 根据歌曲名称获取物量
 * @param songName 歌曲名称
 * @param difficulty 难度
 * @returns 物量数量
 */
export async function getNotesBySongName(songName: string, difficulty: string): Promise<number | null> {
  try {
    await ensureSongsDataLoaded()
    
    const song = cachedSongsData!.find(s => s.name === songName || s.alias.includes(songName))
    if (!song) return null
    
    const chart = song.charts.find(c => c.difficulty === difficulty.toLowerCase())
    return chart ? chart.note : null
  } catch (error) {
    console.error('根据歌曲名称获取物量失败:', error)
    return null
  }
}

/**
 * 获取歌曲的所有难度物量
 * @param songId 歌曲ID
 * @returns 包含所有难度物量的数组，格式为[PST, PRS, FTR, BYD, ETR]
 */
export async function getAllNotesCount(songId: string): Promise<(number | null)[]> {
  try {
    await ensureSongsDataLoaded()
    
    const song = cachedSongsData!.find(s => s.id === songId)
    if (!song) return [null, null, null, null, null]
    
    const result: (number | null)[] = [null, null, null, null, null]
    const difficulties = ['pst', 'prs', 'ftr', 'byd', 'etr']
    
    song.charts.forEach(chart => {
      const index = difficulties.indexOf(chart.difficulty)
      if (index !== -1) {
        result[index] = chart.note
      }
    })
    
    return result
  } catch (error) {
    console.error('获取所有物量失败:', error)
    return [null, null, null, null, null]
  }
}
