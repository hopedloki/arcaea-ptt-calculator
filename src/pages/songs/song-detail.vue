<template>
  <view class="container">
    <view class="card song-detail-card">
      <!-- 歌曲基本信息 -->
      <view class="song-header">
        <text class="song-name">{{ songData.name }}</text>
        <text class="song-artist">{{ songData.artist || 'Unknown Artist' }}</text>
        <view class="song-meta" v-if="songData.pack">
          <text class="song-pack">曲包: {{ songData.pack }}</text>
          <text class="song-bpm" v-if="songData.bpm">BPM: {{ songData.bpm }}</text>
          <text class="song-dl" v-if="songData.dl">下载曲</text>
        </view>
      </view>

      <!-- 难度列表 -->
      <view class="difficulties-section">
        <text class="section-title">谱面信息</text>
        <view class="difficulties-list">
          <view 
            class="difficulty-detail-card"
            v-for="(chart, key) in getAvailableCharts()"
            :key="key"
            :class="getDifficultyClass(key)"
            @click="goToTolerance(songData, key)"
          >
            <view class="difficulty-header">
              <text class="difficulty-name">{{ getDifficultyName(key) }}</text>
              <text class="difficulty-constant">定数: {{ chart.constant }}</text>
            </view>
            
            <view class="difficulty-info">
              <view class="info-row" v-if="chart.note">
                <text class="info-label">物量</text>
                <text class="info-value">{{ chart.note }}</text>
              </view>
              
              <view class="info-row" v-if="chart.designer">
                <text class="info-label">谱师</text>
                <text class="info-value">{{ chart.designer }}</text>
              </view>
              
              <view class="info-row" v-if="chart.level">
                <text class="info-label">等级</text>
                <text class="info-value">{{ chart.level }}</text>
              </view>
            </view>

            <!-- 简略容错 -->
            <view class="tolerance-summary" v-if="chart.note && chart.note > 0">
              <text class="tolerance-title">简略容错 (最大Far数)</text>
              <view class="tolerance-values">
                <view class="tolerance-item">
                  <text class="tolerance-grade ex-plus">EX+</text>
                  <text class="tolerance-count">{{ calculateMaxFar(parseInt(chart.note), 'ex+') }}</text>
                </view>
                <view class="tolerance-item">
                  <text class="tolerance-grade ex">EX</text>
                  <text class="tolerance-count">{{ calculateMaxFar(parseInt(chart.note), 'ex') }}</text>
                </view>
                <view class="tolerance-item">
                  <text class="tolerance-grade aa">AA</text>
                  <text class="tolerance-count">{{ calculateMaxFar(parseInt(chart.note), 'aa') }}</text>
                </view>
              </view>
            </view>

            <view class="click-hint">
              <text class="hint-text">点击查看详细容错 →</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="Object.keys(getAvailableCharts()).length === 0">
        <text class="empty-icon">🎵</text>
        <text class="empty-text">该歌曲暂无谱面信息</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { calculateRatingToleranceFromTheoretical, RATING_OPTIONS } from '@/utils/tolerance-calculator'

// 歌曲数据
const songData = ref<any>({})

// 页面加载
onLoad((options: any) => {
  if (options && options.songId) {
    loadSongDetail(options.songId)
  }
})

// 加载歌曲详情
const loadSongDetail = async (songId: string) => {
  try {
    // 从本地存储加载歌曲数据
    const songsData = uni.getStorageSync('songs_data')
    if (songsData && songsData.length > 0) {
      const song = songsData.find((s: any) => s.id === songId)
      if (song) {
        songData.value = song
        console.log('加载歌曲详情:', song)
      } else {
        uni.showToast({
          title: '歌曲不存在',
          icon: 'none'
        })
      }
    }
  } catch (error) {
    console.error('加载歌曲详情失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }
}

// 获取可用谱面
const getAvailableCharts = () => {
  const result: any = {}
  const difficulties = ['pst', 'prs', 'ftr', 'byd', 'etr']
  
  // 从本地存储加载的歌曲数据是SimpleSongData格式（有pst/prs/ftr等字段）
  // 需要检查两种格式
  
  if (songData.value.charts && Array.isArray(songData.value.charts)) {
    // 如果是完整的SongData格式，有charts数组
    songData.value.charts.forEach((chart: any) => {
      if (difficulties.includes(chart.difficulty)) {
        result[chart.difficulty] = chart
      }
    })
  } else {
    // 如果是SimpleSongData格式，手动构建charts信息
    difficulties.forEach(diff => {
      const constant = songData.value[diff]
      const notesKey = `${diff}Notes`
      const notes = songData.value[notesKey]
      
      if (constant !== null && constant !== undefined) {
        result[diff] = {
          difficulty: diff,
          constant: constant,
          note: notes || 0
        }
      }
    })
  }
  
  return result
}

// 获取难度名称
const getDifficultyName = (difficulty: string): string => {
  const names: Record<string, string> = {
    'pst': 'PAST',
    'prs': 'PRESENT',
    'ftr': 'FUTURE',
    'byd': 'BEYOND',
    'etr': 'ETERNAL'
  }
  return names[difficulty] || difficulty.toUpperCase()
}

// 获取难度样式类
const getDifficultyClass = (difficulty: string): string => {
  const difficultyMap: Record<string, string> = {
    'pst': 'difficulty-pst',
    'prs': 'difficulty-prs',
    'ftr': 'difficulty-ftr',
    'byd': 'difficulty-byd',
    'etr': 'difficulty-etr'
  }
  return difficultyMap[difficulty] || ''
}

// 计算简略容错（使用容错计算函数）
const calculateMaxFar = (totalNotes: number, grade: string): number => {
  // 将简写转换为完整的评级名称
  const gradeMap: Record<string, string> = {
    'ex+': 'EX+',
    'ex': 'EX',
    'aa': 'AA'
  }

  const ratingName = gradeMap[grade.toLowerCase()] || grade
  const rating = RATING_OPTIONS.find(r => r.name === ratingName)

  if (!rating) return 0

  // 使用容错计算函数计算
  const result = calculateRatingToleranceFromTheoretical(totalNotes, rating)

  // 只返回最大Far数（简略显示）
  return result.maxFarCount
}

// 跳转到容错计算页面
const goToTolerance = (song: any, difficulty: string) => {
  const chart = getAvailableCharts()[difficulty]
  
  // 使用原始歌曲数据，保持完整性
  const simpleSong = {
    id: song.id,
    name: song.name,
    artist: song.artist,
    pack: song.pack,
    dl: song.dl,
    alias: song.alias || [],
    [difficulty]: chart.constant,
    [`${difficulty}Notes`]: chart.note
  }
  
  // 保存到本地存储
  uni.setStorageSync('selected_song_for_tolerance', {
    song: simpleSong,
    difficulty: difficulty
  })
  
  // 跳转到容错计算页面
  uni.navigateTo({
    url: '/pages/calculator/tolerance?from=songDetail'
  })
}
</script>

<style scoped>
.container {
  padding: 20rpx;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.song-header {
  margin-bottom: 30rpx;
  text-align: center;
}

.song-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.song-artist {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
  display: block;
}

.song-meta {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  flex-wrap: wrap;
}

.song-pack,
.song-bpm {
  font-size: 24rpx;
  color: #999;
  background: #f0f0f0;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.song-dl {
  font-size: 20rpx;
  color: white;
  background: #ff9800;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.difficulties-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.difficulty-detail-card {
  border-radius: 16rpx;
  padding: 24rpx;
  position: relative;
  transition: all 0.3s ease;
}

.difficulty-detail-card:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.difficulty-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.difficulty-name {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
}

.difficulty-constant {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(0, 0, 0, 0.2);
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
}

.difficulty-info {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.info-row {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4rpx;
}

.info-value {
  font-size: 26rpx;
  color: white;
  font-weight: bold;
}

.tolerance-summary {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 12rpx;
}

.tolerance-title {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12rpx;
  display: block;
}

.tolerance-values {
  display: flex;
  justify-content: space-around;
}

.tolerance-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.tolerance-grade {
  font-size: 24rpx;
  font-weight: bold;
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  color: white;
}

.tolerance-grade.ex-plus {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #333;
}

.tolerance-grade.ex {
  background: linear-gradient(135deg, #4caf50 0%, #81c784 100%);
}

.tolerance-grade.aa {
  background: linear-gradient(135deg, #2196f3 0%, #64b5f6 100%);
}

.tolerance-count {
  font-size: 28rpx;
  font-weight: bold;
  color: white;
}

.click-hint {
  text-align: center;
  margin-top: 8rpx;
}

.hint-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
}

.difficulty-pst {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
}

.difficulty-prs {
  background: linear-gradient(135deg, #2196f3 0%, #42a5f5 100%);
}

.difficulty-ftr {
  background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
}

.difficulty-byd {
  background: linear-gradient(135deg, #f44336 0%, #ef5350 100%);
}

.difficulty-etr {
  background: linear-gradient(135deg, #9c27b0 0%, #ab47bc 100%);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 20rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  text-align: center;
}
</style>
