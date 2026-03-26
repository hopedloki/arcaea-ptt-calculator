/**
 * Arcaea曲包数据加载器
 */

import type { PackData } from './types'

/**
 * 缓存的曲包数据
 */
let cachedPackData: PackData[] | null = null

/**
 * 加载曲包数据
 * @returns Promise<PackData[]>
 */
export async function loadPackData(): Promise<PackData[]> {
  if (cachedPackData) {
    return cachedPackData
  }

  try {
    // 动态导入JSON数据
    const packlistData = await import('./packlist.json')
    cachedPackData = packlistData.default || packlistData
    return cachedPackData
  } catch (error) {
    console.error('加载曲包数据失败:', error)
    throw new Error('无法加载曲包数据')
  }
}

/**
 * 根据曲包ID获取曲包信息
 * @param packId 曲包ID
 * @returns Promise<PackData | null>
 */
export async function getPackById(packId: string): Promise<PackData | null> {
  try {
    const packData = await loadPackData()
    return packData.find(pack => pack.id === packId) || null
  } catch (error) {
    console.error('获取曲包信息失败:', error)
    return null
  }
}

/**
 * 清除缓存
 */
export function clearPackCache(): void {
  cachedPackData = null
}
