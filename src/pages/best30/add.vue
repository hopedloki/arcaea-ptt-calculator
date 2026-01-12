<template>
  <view class="container">
    <!-- 页面标题 -->
    <view class="header">
      <text class="title">{{ isEditing ? '编辑成绩' : '添加成绩' }}</text>
    </view>

    <!-- 歌曲选择 -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">选择歌曲</text>
      </view>
      <view class="song-info" @click="goToSongList">
        <text class="song-name" v-if="selectedSong.name">{{ selectedSong.name }}</text>
        <text class="song-placeholder" v-else>点击选择歌曲</text>
        <text class="song-difficulty" v-if="selectedSong.constant">
          {{ getDifficultyText(selectedSong.difficulty) }} ({{ selectedSong.constant }})
        </text>
      </view>
    </view>

    <!-- 成绩输入 -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">成绩信息</text>
      </view>
      
      <!-- 分数输入 -->
      <view class="form-item">
        <text class="form-label">分数</text>
        <view class="score-input-group">
          <input 
            class="score-input" 
            type="number" 
            v-model="scoreInput" 
            placeholder="0 - 10000000"
            @input="onScoreInput"
            :maxlength="8"
          />
          <button class="max-score-btn" @click="setMaxScore">最高分</button>
        </view>
      </view>
      
      <!-- 评级显示 -->
      <view class="form-item" v-if="calculatedRating">
        <text class="form-label">评级</text>
        <view class="rating-display" :class="getRatingClass(calculatedRating)">
          {{ calculatedRating }}
        </view>
      </view>
      
      <!-- PTT显示 -->
      <view class="form-item" v-if="calculatedPtt">
        <text class="form-label">PTT</text>
        <view class="ptt-display">
          {{ calculatedPtt.toFixed(2) }}
        </view>
      </view>
      
      <!-- 详细评价输入 -->
      <view class="form-section">
        <text class="form-section-title">详细评价（可选）</text>
        
        <view class="detail-inputs">
          <view class="detail-input-item">
            <text class="detail-label">Pure</text>
            <input 
              class="detail-input" 
              type="number" 
              v-model="pureCount" 
              placeholder="0"
            />
          </view>
          
          <view class="detail-input-item">
            <text class="detail-label">Far</text>
            <input 
              class="detail-input" 
              type="number" 
              v-model="farCount" 
              placeholder="0"
            />
          </view>
          
          <view class="detail-input-item">
            <text class="detail-label">Lost</text>
            <input 
              class="detail-input" 
              type="number" 
              v-model="lostCount" 
              placeholder="0"
            />
          </view>
        </view>
      </view>
      
      <!-- 备注输入 -->
      <view class="form-item">
        <text class="form-label">备注</text>
        <textarea 
          class="remark-input" 
          v-model="remark" 
          placeholder="添加一些备注..."
          maxlength="200"
        />
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="actions">
      <button class="action-btn cancel-btn" @click="goBack">取消</button>
      <button 
        class="action-btn save-btn" 
        @click="saveScore"
        :disabled="!canSave"
      >
        {{ isEditing ? '更新' : '保存' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onPageShow } from '@dcloudio/uni-app'

// 是否为编辑模式
const isEditing = ref(false)
const editIndex = ref(-1)

// 选中的歌曲
const selectedSong = ref<any>({})

// 输入值
const scoreInput = ref('')
const pureCount = ref('')
const farCount = ref('')
const lostCount = ref('')
const remark = ref('')

// 计算结果
const calculatedPtt = ref(0)
const calculatedRating = ref('')

// 是否可以保存
const canSave = computed(() => {
  return selectedSong.value.constant && 
         scoreInput.value !== '' && 
         parseInt(scoreInput.value) >= 0 && 
         parseInt(scoreInput.value) <= 10000000
})

// 页面加载时获取参数
onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options as any
  
  // 获取编辑参数
  if (options && options.edit !== undefined) {
    const index = parseInt(options.edit)
    if (!isNaN(index) && index >= 0) {
      isEditing.value = true
      editIndex.value = index
      loadScoreForEdit(index)
    }
  }
  
  // 获取可能的歌曲选择
  const recentSong = uni.getStorageSync('recent_song')
  if (recentSong) {
    selectedSong.value = recentSong
  }
  
  // 监听歌曲选择事件
  uni.$on('songSelected', (song: any) => {
    selectedSong.value = song
    calculatePttAndRating() // 重新计算PTT和评级
  })
})

// 页面显示时检查是否有新选择的歌曲
onPageShow(() => {
  // 检查是否有新选择的歌曲
  const recentSong = uni.getStorageSync('recent_song')
  if (recentSong) {
    // 检查是否与当前选中的歌曲不同
    if (!selectedSong.value.name ||
        selectedSong.value.name !== recentSong.name ||
        selectedSong.value.difficulty !== recentSong.difficulty) {
      selectedSong.value = recentSong
      calculatePttAndRating() // 重新计算PTT和评级
      console.log('页面显示时更新了选中的歌曲:', recentSong)
    }
  }
})

// 加载要编辑的成绩
const loadScoreForEdit = (index: number) => {
  try {
    const best30Records = uni.getStorageSync('best30_records') || []
    if (best30Records[index]) {
      const record = best30Records[index]
      selectedSong.value = {
        name: record.songName,
        difficulty: record.difficulty,
        constant: record.constant
      }
      scoreInput.value = record.score.toString()
      calculatedPtt.value = record.ptt
      calculatedRating.value = record.rating
      
      // 加载详细评价（如果有）
      if (record.pureCount !== undefined) pureCount.value = record.pureCount.toString()
      if (record.farCount !== undefined) farCount.value = record.farCount.toString()
      if (record.lostCount !== undefined) lostCount.value = record.lostCount.toString()
      
      remark.value = record.remark || ''
    }
  } catch (e) {
    console.error('加载成绩失败', e)
  }
}

// 跳转到歌曲列表
const goToSongList = () => {
  uni.navigateTo({
    url: '/pages/songs/songs?from=add'
  })
}

// 设置最高分
const setMaxScore = () => {
  scoreInput.value = '10000000'
  calculatePttAndRating()
}

// 分数输入变化
const onScoreInput = () => {
  const value = parseInt(scoreInput.value)
  if (isNaN(value) || value < 0) {
    scoreInput.value = '0'
  } else if (value > 10000000) {
    scoreInput.value = '10000000'
  }
  
  calculatePttAndRating()
}

// 计算PTT和评级
const calculatePttAndRating = () => {
  if (!selectedSong.value.constant || scoreInput.value === '') {
    calculatedPtt.value = 0
    calculatedRating.value = ''
    return
  }
  
  const score = parseInt(scoreInput.value)
  const constant = selectedSong.value.constant
  
  // 计算PTT
  calculatedPtt.value = calculatePtt(score, constant)
  
  // 计算评级
  calculatedRating.value = getRating(score)
}

// 根据成绩计算PTT
const calculatePtt = (score: number, constant: number): number => {
  if (score >= 10000000) {
    return constant + 2.0
  } else if (score >= 9800000) {
    return constant + 1.0 + (score - 9800000) / 200000
  } else {
    return constant + Math.max(0, (score - 9500000) / 300000)
  }
}

// 根据成绩获取评级
const getRating = (score: number): string => {
  if (score === 10000000) return 'PM'
  else if (score >= 9900000) return 'EX+'
  else if (score >= 9800000) return 'EX'
  else if (score >= 9500000) return 'AA'
  else if (score >= 9200000) return 'A'
  else if (score >= 8900000) return 'B'
  else if (score >= 8600000) return 'C'
  else return 'D'
}

// 获取评级样式类
const getRatingClass = (rating: string): string => {
  const ratingMap: Record<string, string> = {
    'PM': 'rating-pm',
    'EX+': 'rating-ex-plus',
    'EX': 'rating-ex',
    'AA': 'rating-aa',
    'A': 'rating-a',
    'B': 'rating-b',
    'C': 'rating-c',
    'D': 'rating-d'
  }
  return ratingMap[rating] || ''
}

// 获取难度文本
const getDifficultyText = (difficulty: string): string => {
  const difficultyMap: Record<string, string> = {
    'pst': 'PAST',
    'prs': 'PRESENT',
    'ftr': 'FUTURE',
    'byd': 'BEYOND',
    'etr': 'ETERNAL'
  }
  return difficultyMap[difficulty] || difficulty.toUpperCase()
}

// 保存成绩
const saveScore = () => {
  if (!canSave.value) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }
  
  const score = parseInt(scoreInput.value)
  const record = {
    songName: selectedSong.value.name,
    difficulty: selectedSong.value.difficulty,
    constant: selectedSong.value.constant,
    score,
    ptt: calculatedPtt.value,
    rating: calculatedRating.value,
    pureCount: pureCount.value ? parseInt(pureCount.value) : undefined,
    farCount: farCount.value ? parseInt(farCount.value) : undefined,
    lostCount: lostCount.value ? parseInt(lostCount.value) : undefined,
    remark: remark.value.trim(),
    timestamp: Date.now()
  }
  
  try {
    // 获取现有B30记录
    let best30Records = uni.getStorageSync('best30_records') || []
    
    if (isEditing.value) {
      // 编辑模式：更新现有记录
      best30Records[editIndex.value] = record
    } else {
      // 添加模式：检查是否已存在相同歌曲和难度的记录
      const existingIndex = best30Records.findIndex(
        (r: any) => r.songName === record.songName && r.difficulty === record.difficulty
      )
      
      if (existingIndex !== -1) {
        uni.showModal({
          title: '提示',
          content: '已存在相同歌曲和难度的记录，是否覆盖？',
          success: (res) => {
            if (res.confirm) {
              best30Records[existingIndex] = record
              saveRecordAndUpdateStats(best30Records, record)
            }
          }
        })
        return
      } else {
        // 添加新记录
        best30Records.push(record)
      }
    }
    
    saveRecordAndUpdateStats(best30Records, record)
  } catch (e) {
    console.error('保存成绩失败', e)
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  }
}

// 保存记录并更新统计信息
const saveRecordAndUpdateStats = (best30Records: any[], record: any) => {
  // 按PTT降序排序
  best30Records.sort((a, b) => b.ptt - a.ptt)
  
  // 只保留前30条
  best30Records = best30Records.slice(0, 30)
  
  // 保存到本地存储
  uni.setStorageSync('best30_records', best30Records)
  
  // 保存最近使用的歌曲
  uni.setStorageSync('recent_song', {
    name: record.songName,
    difficulty: record.difficulty,
    constant: record.constant
  })
  
  // 更新最近成绩
  updateRecentScores(record)
  
  // 重新计算PTT概览
  recalculatePTTOverview(best30Records)
  
  uni.showToast({
    title: isEditing.value ? '更新成功' : '保存成功',
    icon: 'success'
  })
  
  // 返回上一页
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}

// 更新最近成绩
const updateRecentScores = (record: any) => {
  try {
    let recentScores = uni.getStorageSync('recent_scores') || []
    
    // 检查是否已存在相同歌曲和难度的记录
    const existingIndex = recentScores.findIndex(
      (r: any) => r.songName === record.songName && r.difficulty === record.difficulty
    )
    
    if (existingIndex !== -1) {
      // 移除旧记录
      recentScores.splice(existingIndex, 1)
    }
    
    // 添加到开头
    recentScores.unshift(record)
    
    // 只保留最近10条
    recentScores = recentScores.slice(0, 10)
    
    // 保存到本地存储
    uni.setStorageSync('recent_scores', recentScores)
  } catch (e) {
    console.error('更新最近成绩失败', e)
  }
}

// 重新计算PTT概览
const recalculatePTTOverview = (best30Records: any[]) => {
  try {
    let currentPTT = 0
    let best10Avg = 0
    let best30Avg = 0
    let recent10Avg = 0
    
    if (best30Records.length > 0) {
      // 计算B30平均
      const best30Total = best30Records.reduce((sum, record) => sum + record.ptt, 0)
      best30Avg = best30Total / best30Records.length
      
      // 计算B10平均
      const top10Records = best30Records.slice(0, 10)
      const best10Total = top10Records.reduce((sum, record) => sum + record.ptt, 0)
      best10Avg = best10Total / top10Records.length
      
      // 获取R10记录并计算平均值
      try {
        const recent10Records = uni.getStorageSync('recent_scores') || []
        if (recent10Records.length > 0) {
          const recent10Total = recent10Records.reduce((sum: number, record: any) => sum + record.ptt, 0)
          recent10Avg = recent10Total / recent10Records.length
        }
      } catch (e) {
        console.error('获取R10数据失败', e)
      }
      
      // 计算当前PTT (B10*0.75 + R10*0.25)
      currentPTT = best10Avg * 0.75 + recent10Avg * 0.25
    }
    
    // 保存PTT数据
    const pttData = {
      currentPTT,
      best10Avg,
      best30Avg,
      recent10Avg,
      lastUpdated: Date.now()
    }
    uni.setStorageSync('ptt_data', pttData)
  } catch (e) {
    console.error('计算PTT概览失败', e)
  }
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}
</script>

<style scoped>
.container {
  padding: 20rpx;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header {
  padding: 40rpx 0 20rpx;
  text-align: center;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.song-info {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.song-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.song-placeholder {
  font-size: 32rpx;
  color: #999;
}

.song-difficulty {
  font-size: 26rpx;
  color: #667eea;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-section {
  margin-bottom: 30rpx;
}

.form-section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.form-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
  display: block;
}

.score-input-group {
  display: flex;
  align-items: center;
}

.score-input {
  flex: 1;
  height: 88rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 0 30rpx;
  font-size: 32rpx;
  color: #333;
  box-sizing: border-box;
}

.max-score-btn {
  margin-left: 20rpx;
  padding: 0 20rpx;
  height: 88rpx;
  background: #667eea;
  color: white;
  border-radius: 16rpx;
  font-size: 26rpx;
  border: none;
  white-space: nowrap;
}

.rating-display, .ptt-display {
  height: 88rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 0 30rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
}

.ptt-display {
  color: #667eea;
}

.rating-pm {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  color: white;
}

.rating-ex-plus {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.rating-ex {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.rating-aa {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #333;
}

.rating-a {
  background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
  color: white;
}

.rating-b {
  background: #ffc107;
  color: #333;
}

.rating-c {
  background: #ff9800;
  color: white;
}

.rating-d {
  background: #f44336;
  color: white;
}

.detail-inputs {
  display: flex;
  gap: 20rpx;
}

.detail-input-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.detail-input {
  height: 80rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 0 20rpx;
  font-size: 30rpx;
  color: #333;
  text-align: center;
  box-sizing: border-box;
}

.remark-input {
  width: 100%;
  min-height: 160rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx 30rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.actions {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
}

.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.save-btn[disabled] {
  opacity: 0.5;
}
</style>