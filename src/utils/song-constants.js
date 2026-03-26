/**
 * Arcaea歌曲数据加载器
 * 从src/data/chart-data.json加载完整的歌曲数据
 * 这是对原有song-constants.js的重构，使用新的数据结构
 */

import { loadSimpleSongsData, searchSongs, filterSongsByDifficulty, filterSongsByPack } from '@/data'

/**
 * 缓存的歌曲数据
 */
let cachedSongsData = null

/**
 * 获取歌曲数据（兼容原有接口）
 * @returns Promise<歌曲数据数组>
 */
export async function getSongsData() {
  if (cachedSongsData) {
    return cachedSongsData
  }
  
  try {
    cachedSongsData = await loadSimpleSongsData()
    return cachedSongsData
  } catch (error) {
    console.error('获取歌曲数据失败:', error)
    return []
  }
}

/**
 * 根据歌曲名称获取歌曲数据（兼容原有接口）
 * @param name 歌曲名称
 * @returns 歌曲数据对象，如果不存在则返回null
 */
export async function getSongByName(name) {
  try {
    const songsData = await getSongsData()
    return songsData.find(song => song.name === name) || null
  } catch (error) {
    console.error('获取歌曲失败:', error)
    return null
  }
}

/**
 * 根据歌曲名称获取歌曲定数（兼容原有接口）
 * @param name 歌曲名称
 * @param difficulty 难度 (pst, prs, ftr, byd, etr)
 * @returns 定数，如果不存在则返回null
 */
export async function getSongConstant(name, difficulty) {
  try {
    const song = await getSongByName(name)
    return song ? song[difficulty] : null
  } catch (error) {
    console.error('获取歌曲定数失败:', error)
    return null
  }
}

/**
 * 获取所有歌曲名称（兼容原有接口）
 * @returns 歌曲名称数组
 */
export async function getSongNames() {
  try {
    const songsData = await getSongsData()
    return songsData.map(song => song.name)
  } catch (error) {
    console.error('获取歌曲名称列表失败:', error)
    return []
  }
}

/**
 * 获取指定难度的所有歌曲（兼容原有接口）
 * @param difficulty 难度 (pst, prs, ftr, byd, etr)
 * @returns 指定难度的歌曲数组
 */
export async function getSongsByDifficulty(difficulty) {
  try {
    return await filterSongsByDifficulty(difficulty)
  } catch (error) {
    console.error('获取指定难度歌曲失败:', error)
    return []
  }
}

/**
 * 根据定数范围获取歌曲（兼容原有接口）
 * @param difficulty 难度 (pst, prs, ftr, byd, etr)
 * @param minConstant 最小定数
 * @param maxConstant 最大定数
 * @returns 符合条件的歌曲数组
 */
export async function getSongsByConstantRange(difficulty, minConstant, maxConstant) {
  try {
    return await filterSongsByDifficulty(difficulty, minConstant, maxConstant)
  } catch (error) {
    console.error('根据定数范围获取歌曲失败:', error)
    return []
  }
}

/**
 * 搜索歌曲（新增功能）
 * @param keyword 搜索关键词
 * @returns 符合条件的歌曲数组
 */
export async function searchSongSongs(keyword) {
  try {
    return await searchSongs(keyword)
  } catch (error) {
    console.error('搜索歌曲失败:', error)
    return []
  }
}

// 默认导出（兼容原有接口）
export default {
  getSongsData,
  getSongByName,
  getSongConstant,
  getSongNames,
  getSongsByDifficulty,
  getSongsByConstantRange
}
