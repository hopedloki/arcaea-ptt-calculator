/**
 * 容错计算工具函数
 * 提供评级容错、分数容错和PTT容错的计算能力
 */

/**
 * 评级选项
 */
export interface RatingOption {
  name: string
  minScore: number
}

/**
 * 评级容错结果
 */
export interface RatingToleranceResult {
  canAchieve: boolean
  maxFarCount: number
  maxLostCount: number
}

/**
 * 基于理论值计算评级容错
 * @param totalNotes 物量
 * @param rating 评级
 * @returns 容错结果
 */
export function calculateRatingToleranceFromTheoretical(
  totalNotes: number,
  rating: RatingOption
): RatingToleranceResult {
  // Arcaea理论值: 10,000,000分(满分) + totalNotes * 1(每个Pure加1分)
  const theoreticalValue = 10000000 + totalNotes

  // 目标评级对应的分数要求
  const targetScore = rating.minScore

  // 计算分数差距
  const scoreGap = theoreticalValue - targetScore

  // 每个Note的基础分 = 10,000,000 / 物量数
  const scorePerNote = 10000000 / totalNotes

  // 每个Far扣分 = (10,000,000 / 物量数) / 2 = 5,000,000 / 物量数
  const scorePerFar = 5000000 / totalNotes

  // 计算最大Far数
  const maxFarCount = Math.floor(scoreGap / scorePerFar)

  // 计算最大Lost数 (每个Lost扣scorePerNote分)
  const remainingScoreAfterFar = scoreGap - maxFarCount * scorePerFar
  const maxLostCount = Math.floor(remainingScoreAfterFar / scorePerNote)

  console.log(`容错计算: 物量=${totalNotes}, 评级=${rating.name}, 理论值=${theoreticalValue}, 目标分=${targetScore}, 差距=${scoreGap}, Far扣分=${scorePerFar}, 最大Far=${maxFarCount}`)

  return {
    canAchieve: maxFarCount >= 0,
    maxFarCount: Math.max(0, maxFarCount),
    maxLostCount: Math.max(0, Math.floor(maxLostCount))
  }
}

/**
 * 评级选项列表
 */
export const RATING_OPTIONS: RatingOption[] = [
  { name: 'PM', minScore: 10000000 },
  { name: 'EX+', minScore: 9900000 },
  { name: 'EX', minScore: 9800000 },
  { name: 'AA', minScore: 9500000 },
  { name: 'A', minScore: 9200000 },
  { name: 'B', minScore: 8900000 },
  { name: 'C', minScore: 8600000 },
  { name: 'D', minScore: 0 }
]
