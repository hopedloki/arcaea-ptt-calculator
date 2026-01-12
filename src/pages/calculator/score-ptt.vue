<template>
  <view class="container">
    <!-- 转换模式选择 -->
    <view class="card mode-selector-card">
      <view class="card-header">
        <text class="card-title">转换模式</text>
      </view>
      <view class="mode-selector">
        <view 
          class="mode-item" 
          :class="{ active: mode === 'scoreToPtt' }"
          @click="switchMode('scoreToPtt')"
        >
          <text class="mode-icon">🎯</text>
          <text class="mode-text">成绩 → PTT</text>
          <view class="mode-indicator"></view>
        </view>
        <view 
          class="mode-item" 
          :class="{ active: mode === 'pttToScore' }"
          @click="switchMode('pttToScore')"
        >
          <text class="mode-icon">⭐</text>
          <text class="mode-text">PTT → 成绩</text>
          <view class="mode-indicator"></view>
        </view>
      </view>
    </view>

    <!-- 歌曲选择/定数输入区域 -->
    <view class="card song-selector">
      <view class="card-header">
        <text class="card-title">歌曲/定数设置</text>
        <view class="mode-indicator-icon">{{ inputMode === 'song' ? '🎵' : '✏️' }}</view>
      </view>
      
      <!-- 输入模式选择 -->
      <view class="input-mode-selector">
        <view 
          class="mode-item" 
          :class="{ active: inputMode === 'song' }"
          @click="switchInputMode('song')"
        >
          <text class="mode-icon">🎵</text>
          <text class="mode-text">选择歌曲</text>
          <view class="mode-indicator"></view>
        </view>
        <view 
          class="mode-item" 
          :class="{ active: inputMode === 'manual' }"
          @click="switchInputMode('manual')"
        >
          <text class="mode-icon">✏️</text>
          <text class="mode-text">手动输入定数</text>
          <view class="mode-indicator"></view>
        </view>
      </view>
      
      <!-- 歌曲选择模式 -->
      <view v-if="inputMode === 'song'" class="song-info" @click="goToSongList">
        <view class="song-content">
          <view class="song-main-info">
            <text class="song-name" v-if="selectedSong.name">{{ selectedSong.name }}</text>
            <text class="song-placeholder" v-else>点击选择歌曲</text>
            <view class="song-difficulty" v-if="selectedSong.constant">
              <text class="difficulty-text" :class="getDifficultyClass(selectedSong.difficulty)">
                {{ getDifficultyText(selectedSong.difficulty) }}
              </text>
              <text class="difficulty-constant">{{ selectedSong.constant }}</text>
            </view>
          </view>
          <view class="selection-arrow">
            <text class="arrow-icon">→</text>
          </view>
        </view>
      </view>
      
      <!-- 手动输入模式 -->
      <view v-if="inputMode === 'manual'" class="manual-input">
        <view class="form-item">
          <text class="form-label">歌曲名称（可选）</text>
          <input 
            class="form-input" 
            type="text" 
            v-model="manualSongName" 
            placeholder="用于记录，不影响计算"
          />
          <text class="form-hint">此名称仅用于记录，不会影响计算结果</text>
        </view>
        <view class="form-item">
          <text class="form-label">定数</text>
          <input 
            class="form-input" 
            type="digit" 
            v-model="manualConstant" 
            placeholder="例如: 11.5"
            @input="onConstantChange"
          />
          <text class="form-hint">歌曲的定数范围通常在1.0-12.5之间</text>
        </view>
      </view>
    </view>

    <!-- 成绩 ↔ PTT 转换表单 -->
    <view class="card conversion-form">
      <view class="card-header">
        <text class="card-title">
          {{ mode === 'scoreToPtt' ? '成绩 → PTT' : 'PTT → 成绩' }}
        </text>
        <view class="conversion-icon">{{ mode === 'scoreToPtt' ? '🔄' : '🎯' }}</view>
      </view>
      
      <!-- 成绩 → PTT 输入 -->
      <view class="form-group" v-if="mode === 'scoreToPtt'">
        <view class="form-item">
          <view class="form-label-wrapper">
            <text class="form-label">输入成绩</text>
            <view class="form-icon">📊</view>
          </view>
          <input 
            class="form-input" 
            type="number" 
            v-model="scoreInput" 
            placeholder="0 - 10000000"
            @input="onScoreInputChange"
            :maxlength="8"
          />
          <view class="input-range-hint">
            <text class="range-text">范围: 0 - 10,000,000</text>
            <view class="range-indicator" :style="{ width: getScoreInputPercentage() + '%' }"></view>
          </view>
        </view>
        <view class="quick-input-buttons" v-if="mode === 'scoreToPtt'">
          <button class="quick-btn" @click="setScoreInput(9500000)">
            <text class="quick-btn-text">950万</text>
          </button>
          <button class="quick-btn" @click="setScoreInput(9800000)">
            <text class="quick-btn-text">980万</text>
          </button>
          <button class="quick-btn" @click="setScoreInput(9900000)">
            <text class="quick-btn-text">990万</text>
          </button>
          <button class="quick-btn" @click="setScoreInput(10000000)">
            <text class="quick-btn-text">1000万</text>
          </button>
        </view>
      </view>
      
      <!-- PTT → 成绩 输入 -->
      <view class="form-group" v-if="mode === 'pttToScore'">
        <view class="form-item">
          <view class="form-label-wrapper">
            <text class="form-label">输入目标PTT</text>
            <view class="form-icon">⭐</view>
          </view>
          <input 
            class="form-input" 
            type="digit" 
            v-model="pttInput" 
            placeholder="例如: 11.50"
            @input="onPttInputChange"
          />
          <view class="input-range-hint">
            <text class="range-text">通常范围: 0 - 15.0</text>
            <view class="range-indicator" :style="{ width: getPttInputPercentage() + '%' }"></view>
          </view>
        </view>
        <view class="quick-input-buttons" v-if="mode === 'pttToScore'">
          <button class="quick-btn" @click="setPttInput(10.0)">
            <text class="quick-btn-text">10.0</text>
          </button>
          <button class="quick-btn" @click="setPttInput(11.0)">
            <text class="quick-btn-text">11.0</text>
          </button>
          <button class="quick-btn" @click="setPttInput(12.0)">
            <text class="quick-btn-text">12.0</text>
          </button>
          <button class="quick-btn" @click="setPttInput(13.0)">
            <text class="quick-btn-text">13.0</text>
          </button>
        </view>
      </view>
      
      <!-- 计算按钮 -->
      <button 
        class="calculate-btn" 
        @click="calculate"
        :disabled="!canCalculate"
      >
        <text class="btn-icon">{{ mode === 'scoreToPtt' ? '🔄' : '🎯' }}</text>
        <text class="btn-text">计算转换</text>
      </button>
    </view>

    <!-- 计算结果 -->
    <view class="card result-card" v-if="result">
      <view class="card-header">
        <text class="card-title">计算结果</text>
        <view class="result-status success">
          <text class="status-icon">✓</text>
        </view>
      </view>
      <view class="result-content">
        <!-- 成绩 → PTT 结果 -->
        <view v-if="mode === 'scoreToPtt'" class="result-section">
          <view class="result-item primary">
            <view class="result-icon">⭐</view>
            <view class="result-content">
              <text class="result-label">PTT</text>
              <text class="result-value highlight">{{ result.ptt.toFixed(2) }}</text>
            </view>
          </view>
          <view class="result-item">
            <view class="result-icon">🎯</view>
            <view class="result-content">
              <text class="result-label">成绩</text>
              <text class="result-value">{{ result.score.toLocaleString() }}</text>
            </view>
          </view>
          <view class="result-item">
            <view class="result-icon">🏆</view>
            <view class="result-content">
              <text class="result-label">评级</text>
              <text class="result-value rating" :class="getRatingClass(result.rating)">
                {{ result.rating }}
              </text>
            </view>
          </view>
          <view class="result-item" v-if="selectedSong.name || manualSongName">
            <view class="result-icon">🎵</view>
            <view class="result-content">
              <text class="result-label">歌曲</text>
              <text class="result-value">{{ selectedSong.name || manualSongName || '手动输入' }}</text>
            </view>
          </view>
        </view>
        
        <!-- PTT → 成绩 结果 -->
        <view v-if="mode === 'pttToScore'" class="result-section">
          <view class="result-item primary">
            <view class="result-icon">🎯</view>
            <view class="result-content">
              <text class="result-label">所需成绩</text>
              <text class="result-value highlight">{{ result.score.toLocaleString() }}</text>
            </view>
          </view>
          <view class="result-item">
            <view class="result-icon">⭐</view>
            <view class="result-content">
              <text class="result-label">目标PTT</text>
              <text class="result-value">{{ result.ptt.toFixed(2) }}</text>
            </view>
          </view>
          <view class="result-item">
            <view class="result-icon">🏆</view>
            <view class="result-content">
              <text class="result-label">最低评级</text>
              <text class="result-value rating" :class="getRatingClass(result.rating)">
                {{ result.rating }}
              </text>
            </view>
          </view>
          <view class="result-item" v-if="selectedSong.name || manualSongName">
            <view class="result-icon">🎵</view>
            <view class="result-content">
              <text class="result-label">歌曲</text>
              <text class="result-value">{{ selectedSong.name || manualSongName || '手动输入' }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 保存按钮 -->
      <button class="save-btn" @click="saveToBest30" v-if="result && canSave">
        <text class="btn-icon">💾</text>
        <text class="btn-text">保存到B30</text>
      </button>
    </view>

    <!-- 转换说明 -->
    <view class="card formula-card">
      <view class="card-header">
        <text class="card-title">PTT计算公式</text>
        <view class="info-icon">ℹ️</view>
      </view>
      <view class="formula-list">
        <view class="formula-item">
          <view class="formula-condition">
            <view class="condition-icon">🏆</view>
            <text class="condition-text">≥10,000,000分</text>
          </view>
          <view class="formula-result">
            <text class="result-text">定数 + 2.0</text>
          </view>
        </view>
        <view class="formula-item">
          <view class="formula-condition">
            <view class="condition-icon">🥇</view>
            <text class="condition-text">9,800,000-9,999,999分</text>
          </view>
          <view class="formula-result">
            <text class="result-text">定数 + 1.0 + (得分-9,800,000)/200,000</text>
          </view>
        </view>
        <view class="formula-item">
          <view class="formula-condition">
            <view class="condition-icon">🥈</view>
            <text class="condition-text">&lt;9,800,000分</text>
          </view>
          <view class="formula-result">
            <text class="result-text">定数 + (得分-9,500,000)/300,000</text>
          </view>
        </view>
        <view class="formula-item">
          <view class="formula-condition">
            <view class="condition-icon">⚠️</view>
            <text class="condition-text">单次PTT为0的条件</text>
          </view>
          <view class="formula-result">
            <text class="result-text">分数 ≤ 9,500,000 - 定数 × 300,000</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onPageShow } from '@dcloudio/uni-app'

// 转换模式
const mode = ref<'scoreToPtt' | 'pttToScore'>('scoreToPtt')

// 输入模式：歌曲选择或手动输入
const inputMode = ref<'song' | 'manual'>('song')

// 选中的歌曲
const selectedSong = ref<any>({})

// 手动输入值
const manualSongName = ref('')
const manualConstant = ref('')

// 输入值
const scoreInput = ref('')
const pttInput = ref('')

// 计算结果
const result = ref<any>(null)

// 页面加载时获取可能的歌曲选择
onMounted(() => {
  // 从存储中获取最近使用的歌曲
  const recentSong = uni.getStorageSync('recent_song')
  if (recentSong) {
    selectedSong.value = recentSong
  }
  
  // 监听歌曲选择事件
  uni.$on('songSelected', (selectedSongData: any) => {
    selectedSong.value = selectedSongData
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
      console.log('页面显示时更新了选中的歌曲:', recentSong)
    }
  }
})

// 是否可以计算
const canCalculate = computed(() => {
  // 检查定数是否可用
  let constant = 0
  if (inputMode.value === 'song') {
    constant = selectedSong.value.constant
  } else {
    constant = parseFloat(manualConstant.value)
  }
  
  if (!constant || isNaN(constant)) return false
  
  if (mode.value === 'scoreToPtt') {
    return scoreInput.value !== '' && 
           parseInt(scoreInput.value) >= 0 && 
           parseInt(scoreInput.value) <= 10000000
  } else {
    return pttInput.value !== '' && !isNaN(parseFloat(pttInput.value))
  }
})

// 是否可以保存到B30
const canSave = computed(() => {
  if (!result.value) return false
  
  if (inputMode.value === 'song') {
    return !!selectedSong.value.name
  } else {
    return !!manualConstant.value && !isNaN(parseFloat(manualConstant.value))
  }
})

// 页面加载时获取可能的歌曲选择
onMounted(() => {
  // 从存储中获取最近使用的歌曲
  const recentSong = uni.getStorageSync('recent_song')
  if (recentSong) {
    selectedSong.value = recentSong
  }
  
  // 监听歌曲选择事件
  uni.$on('songSelected', (song: any) => {
    selectedSong.value = song
    // 清除之前的计算结果
    result.value = null
    scoreInput.value = ''
    pttInput.value = ''
  })
})

// 切换转换模式
const switchMode = (newMode: 'scoreToPtt' | 'pttToScore') => {
  mode.value = newMode
  result.value = null
  scoreInput.value = ''
  pttInput.value = ''
}

// 切换输入模式
const switchInputMode = (newMode: 'song' | 'manual') => {
  inputMode.value = newMode
  result.value = null
  scoreInput.value = ''
  pttInput.value = ''

  // 切换到手动输入模式时，清空选中的歌曲
  if (newMode === 'manual') {
    selectedSong.value = {}
  }
}

// 定数输入变化
const onConstantChange = () => {
  const value = parseFloat(manualConstant.value)
  if (isNaN(value) || value < 0) {
    manualConstant.value = '0'
  } else if (value > 15) {
    manualConstant.value = '15'
  }
}

// 跳转到歌曲列表
const goToSongList = () => {
  uni.navigateTo({
    url: '/pages/songs/songs?from=calculator'
  })
}

// 成绩输入变化
const onScoreInputChange = () => {
  const value = parseInt(scoreInput.value)
  if (isNaN(value) || value < 0) {
    scoreInput.value = '0'
  } else if (value > 10000000) {
    scoreInput.value = '10000000'
  }
}

// PTT输入变化
const onPttInputChange = () => {
  const value = parseFloat(pttInput.value)
  if (isNaN(value) || value < 0) {
    pttInput.value = '0'
  }
}

// 计算PTT或成绩
const calculate = () => {
  // 获取定数
  let constant = 0
  let songName = ''
  
  if (inputMode.value === 'song') {
    constant = selectedSong.value.constant
    songName = selectedSong.value.name || ''
    
    if (!constant) {
      uni.showToast({
        title: '请先选择歌曲',
        icon: 'none'
      })
      return
    }
  } else {
    constant = parseFloat(manualConstant.value)
    songName = manualSongName.value || '手动输入'
    
    if (!constant || isNaN(constant)) {
      uni.showToast({
        title: '请输入有效的定数',
        icon: 'none'
      })
      return
    }
  }
  
  if (mode.value === 'scoreToPtt') {
    // 成绩 → PTT
    const score = parseInt(scoreInput.value)
    const ptt = calculatePtt(score, constant)
    const rating = getRating(score)
    
    result.value = {
      score,
      ptt,
      rating,
      songName,
      constant,
      inputMode: inputMode.value
    }
  } else {
    // PTT → 成绩
    const targetPtt = parseFloat(pttInput.value)
    const score = calculateScore(targetPtt, constant)
    const rating = getRating(score)
    
    result.value = {
      ptt: targetPtt,
      score,
      rating,
      songName,
      constant,
      inputMode: inputMode.value
    }
  }
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

// 根据PTT计算成绩
const calculateScore = (ptt: number, constant: number): number => {
  const targetPttAboveConstant = ptt - constant
  
  if (targetPttAboveConstant >= 2.0) {
    return 10000000
  } else if (targetPttAboveConstant >= 1.0) {
    return Math.floor(9800000 + (targetPttAboveConstant - 1.0) * 200000)
  } else if (targetPttAboveConstant >= 0) {
    return Math.floor(9500000 + targetPttAboveConstant * 300000)
  } else {
    return Math.floor(9500000 + targetPttAboveConstant * 300000) // 可能低于950万
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

// 设置成绩输入快捷值
const setScoreInput = (value: number) => {
  scoreInput.value = value.toString()
  onScoreInputChange()
}

// 设置PTT输入快捷值
const setPttInput = (value: number) => {
  pttInput.value = value.toString()
  onPttInputChange()
}

// 获取成绩输入百分比
const getScoreInputPercentage = (): number => {
  if (!scoreInput.value) return 0
  const score = parseInt(scoreInput.value) || 0
  return Math.min((score / 10000000) * 100, 100)
}

// 获取PTT输入百分比
const getPttInputPercentage = (): number => {
  if (!pttInput.value) return 0
  const ptt = parseFloat(pttInput.value) || 0
  return Math.min((ptt / 15) * 100, 100)
}

// 保存到B30
const saveToBest30 = () => {
  if (!result.value) return
  
  // 检查是否有足够的信息保存
  if (inputMode.value === 'song' && !selectedSong.value.name) return
  if (inputMode.value === 'manual' && !manualConstant.value) return
  
  let record = {
    score: result.value.score,
    ptt: result.value.ptt,
    rating: result.value.rating,
    timestamp: Date.now()
  }
  
  // 根据输入模式设置歌曲信息
  if (inputMode.value === 'song') {
    record.songName = selectedSong.value.name
    record.difficulty = selectedSong.value.difficulty
    record.constant = selectedSong.value.constant
  } else {
    record.songName = manualSongName.value || '手动输入'
    record.difficulty = 'manual'
    record.constant = parseFloat(manualConstant.value)
  }
  
  try {
    // 获取现有B30记录
    let best30Records = uni.getStorageSync('best30_records') || []
    
    // 检查是否已存在相同歌曲和难度的记录
    const existingIndex = best30Records.findIndex(
      (r: any) => r.songName === record.songName && r.difficulty === record.difficulty
    )
    
    if (existingIndex !== -1) {
      // 更新现有记录
      best30Records[existingIndex] = record
    } else {
      // 添加新记录
      best30Records.push(record)
    }
    
    // 按PTT降序排序
    best30Records.sort((a: any, b: any) => b.ptt - a.ptt)
    
    // 只保留前30条
    best30Records = best30Records.slice(0, 30)
    
    // 保存到本地存储
    uni.setStorageSync('best30_records', best30Records)
    
    // 更新最近成绩
    updateRecentScores(record)
    
    uni.showToast({
      title: '已保存到B30',
      icon: 'success'
    })
    
    // 询问是否跳转到B30管理页面
    setTimeout(() => {
      uni.showModal({
        title: '提示',
        content: '已成功保存到B30，是否跳转到B30管理页面？',
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: '/pages/best30/best30'
            })
          }
        }
      })
    }, 1500)
    
  } catch (e) {
    console.error('保存B30失败', e)
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  }
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
</script>

<style scoped>
.container {
  padding: 20rpx;
  background-color: #f8f9fa;
  min-height: 100vh;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  animation: slideUp 0.6s ease-out backwards;
  position: relative;
  overflow: hidden;
}

.card:nth-child(1) { animation-delay: 0.1s; }
.card:nth-child(2) { animation-delay: 0.2s; }
.card:nth-child(3) { animation-delay: 0.3s; }
.card:nth-child(4) { animation-delay: 0.4s; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

/* Web端响应式布局 */
/* #ifdef H5 */
@media (min-width: 768px) {
  .card {
    max-width: 800px;
    margin: 0 auto 20rpx;
  }
}
/* #endif */

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.info-icon {
  font-size: 28rpx;
  opacity: 0.7;
  cursor: help;
}

.mode-selector-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 8rpx 30rpx rgba(102, 126, 234, 0.4);
}

.mode-selector-card .card-title {
  color: white;
}

/* 添加动态背景效果 */
.mode-selector-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 20rpx 20rpx;
  animation: backgroundMove 20s linear infinite;
  z-index: 0;
}

@keyframes backgroundMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(20rpx, 20rpx); }
}

.mode-selector {
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10rpx);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.mode-item {
  flex: 1;
  padding: 24rpx 16rpx;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}

/* 按钮波纹效果 */
.mode-item::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.mode-item:active::before {
  width: 200rpx;
  height: 200rpx;
}

.mode-item.active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.mode-icon {
  font-size: 32rpx;
  margin-bottom: 8rpx;
  display: block;
  filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.1));
}

.mode-text {
  font-size: 24rpx;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  transition: color 0.3s ease;
  display: block;
  line-height: 1.2;
}

.mode-item.active .mode-text {
  color: white;
}

.mode-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 2rpx;
  transform: scaleX(0) translateX(-50%);
  transition: transform 0.3s ease;
}

.mode-item.active .mode-indicator {
  transform: scaleX(1) translateX(-50%);
  background: white;
}

/* 歌曲选择区域样式增强 */
.song-selector {
  border: 2rpx solid rgba(102, 126, 234, 0.2);
  box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.1);
}

.mode-indicator-icon {
  font-size: 28rpx;
  opacity: 0.8;
}

.input-mode-selector {
  display: flex;
  background: #f8f9fa;
  border-radius: 16rpx;
  overflow: hidden;
  border: 1rpx solid #e0e0e0;
  box-shadow: inset 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 24rpx;
}

.input-mode-selector .mode-item {
  flex: 1;
  padding: 20rpx 16rpx;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.input-mode-selector .mode-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scale(1.02);
}

.input-mode-selector .mode-icon {
  font-size: 28rpx;
  margin-bottom: 6rpx;
  display: block;
}

.input-mode-selector .mode-text {
  font-size: 22rpx;
  font-weight: 600;
  color: #666;
  transition: color 0.3s ease;
  display: block;
  line-height: 1.2;
}

.input-mode-selector .mode-item.active .mode-text {
  color: white;
}

.input-mode-selector .mode-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background: #667eea;
  border-radius: 2rpx;
  transform: scaleX(0) translateX(-50%);
  transition: transform 0.3s ease;
}

.input-mode-selector .mode-item.active .mode-indicator {
  transform: scaleX(1) translateX(-50%);
  background: white;
}

.manual-input {
  margin-top: 16rpx;
}

.song-info {
  border: 2rpx dashed #e0e0e0;
  border-radius: 16rpx;
  padding: 24rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.song-info:active {
  background: #f8f9fa;
  transform: scale(0.98);
}

.song-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.song-main-info {
  flex: 1;
}

.song-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
  line-height: 1.3;
}

.song-placeholder {
  font-size: 28rpx;
  color: #999;
  font-style: italic;
}

.song-difficulty {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.difficulty-text {
  font-size: 24rpx;
  font-weight: 600;
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  line-height: 1.2;
}

.difficulty-pst {
  background: rgba(76, 175, 80, 0.15);
  color: #2e7d32;
}

.difficulty-prs {
  background: rgba(33, 150, 243, 0.15);
  color: #1565c0;
}

.difficulty-ftr {
  background: rgba(255, 152, 0, 0.15);
  color: #e65100;
}

.difficulty-byd {
  background: rgba(244, 67, 54, 0.15);
  color: #c62828;
}

.difficulty-etr {
  background: rgba(156, 39, 176, 0.15);
  color: #7b1fa2;
}

.difficulty-constant {
  font-size: 24rpx;
  color: #666;
  background: #f5f5f5;
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
}

.selection-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  background: #f0f2f5;
  border-radius: 50%;
}

.arrow-icon {
  font-size: 20rpx;
  color: #666;
}

/* 转换表单样式增强 */
.conversion-form {
  border: 2rpx solid rgba(102, 126, 234, 0.2);
  box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.1);
}

.conversion-icon {
  font-size: 28rpx;
  opacity: 0.8;
}

.form-group {
  margin-bottom: 20rpx;
}

.form-label-wrapper {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.form-icon {
  font-size: 28rpx;
  color: #667eea;
}

.form-hint {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
  display: block;
  line-height: 1.4;
}

.input-range-hint {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 10rpx;
}

.range-text {
  font-size: 22rpx;
  color: #999;
  flex: 1;
}

.range-indicator {
  height: 6rpx;
  background: #e0e0e0;
  border-radius: 3rpx;
  flex: 1;
  position: relative;
  overflow: hidden;
}

.range-indicator::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  width: var(--percentage, 0%);
  transition: width 0.3s ease;
}

.quick-input-buttons {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
  flex-wrap: wrap;
}

.quick-btn {
  flex: 1;
  min-width: 120rpx;
  height: 60rpx;
  background: #f8f9fa;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.quick-btn:active {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
  transform: scale(0.98);
}

.quick-btn-text {
  font-weight: 500;
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

/* 表单和按钮样式增强 */
.form-item {
  margin-bottom: 30rpx;
  position: relative;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 16rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 88rpx;
  background: #f8f9fa;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  padding: 0 30rpx;
  font-size: 32rpx;
  color: #333;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
}

.calculate-btn, .save-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 44rpx;
  color: white;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.calculate-btn:hover, .save-btn:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 8rpx 25rpx rgba(102, 126, 234, 0.4);
}

.calculate-btn:active, .save-btn:active {
  transform: translateY(0);
}

.calculate-btn[disabled] {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

.btn-icon {
  font-size: 28rpx;
  line-height: 1;
}

.btn-text {
  line-height: 1;
}

.save-btn {
  margin-top: 30rpx;
  background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
}

.save-btn:hover {
  box-shadow: 0 8rpx 25rpx rgba(86, 171, 47, 0.4);
}

/* 按钮波纹效果 */
.calculate-btn::before, .save-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.calculate-btn:active::before, .save-btn:active::before {
  width: 400rpx;
  height: 400rpx;
}

/* 结果卡片样式增强 */
.result-card {
  border: 2rpx solid rgba(102, 126, 234, 0.2);
  box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.1);
}

.result-status {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.status-icon {
  font-size: 20rpx;
  line-height: 1;
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  gap: 16rpx;
}

.result-item:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.result-item.primary {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 2rpx solid rgba(102, 126, 234, 0.2);
}

.result-icon {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  line-height: 1;
  flex-shrink: 0;
}

.result-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.result-label {
  font-size: 24rpx;
  color: #666;
  line-height: 1.2;
}

.result-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.2;
}

.result-value.highlight {
  color: #667eea;
  font-size: 36rpx;
}

.rating {
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-weight: bold;
  display: inline-block;
  line-height: 1.2;
}

/* Arcaea风格的评级配色 */
.rating-pm {
  background: linear-gradient(135deg, #ff3366 0%, #ff6b9d 100%);
  color: white;
  box-shadow: 0 2rpx 8rpx rgba(255, 51, 102, 0.3);
}

.rating-ex-plus {
  background: linear-gradient(135deg, #ff9a00 0%, #ffc947 100%);
  color: white;
  box-shadow: 0 2rpx 8rpx rgba(255, 154, 0, 0.3);
}

.rating-ex {
  background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
  color: white;
  box-shadow: 0 2rpx 8rpx rgba(0, 212, 255, 0.3);
}

.rating-aa {
  background: linear-gradient(135deg, #66ff66 0%, #00cc66 100%);
  color: white;
  box-shadow: 0 2rpx 8rpx rgba(102, 255, 102, 0.3);
}

.rating-a {
  background: linear-gradient(135deg, #66ccff 0%, #3399ff 100%);
  color: white;
  box-shadow: 0 2rpx 8rpx rgba(102, 204, 255, 0.3);
}

.rating-b {
  background: linear-gradient(135deg, #cc99ff 0%, #9966cc 100%);
  color: white;
  box-shadow: 0 2rpx 8rpx rgba(204, 153, 255, 0.3);
}

.rating-c {
  background: linear-gradient(135deg, #ffcc99 0%, #ff9966 100%);
  color: white;
  box-shadow: 0 2rpx 8rpx rgba(255, 204, 153, 0.3);
}

.rating-d {
  background: linear-gradient(135deg, #999999 0%, #666666 100%);
  color: white;
  box-shadow: 0 2rpx 8rpx rgba(153, 153, 153, 0.3);
}

/* 公式说明卡片样式增强 */
.formula-card {
  border: 2rpx solid rgba(102, 126, 234, 0.2);
  box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.1);
}

.info-icon {
  font-size: 28rpx;
  opacity: 0.7;
  cursor: help;
}

.formula-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.formula-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.formula-item:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.formula-condition {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex: 1;
}

.condition-icon {
  font-size: 24rpx;
  line-height: 1;
  flex-shrink: 0;
}

.condition-text {
  font-size: 26rpx;
  color: #555;
  line-height: 1.4;
}

.formula-result {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 2;
}

.result-text {
  font-size: 26rpx;
  color: #333;
  font-weight: 600;
  line-height: 1.4;
  text-align: right;
}

/* Web端特殊交互效果 */
/* #ifdef H5 */
.result-item:hover {
  transform: translateY(-4rpx);
}

.formula-item:hover {
  transform: translateY(-4rpx);
}

.form-input:focus {
  outline: none;
}

.calculate-btn:hover {
  box-shadow: 0 8rpx 25rpx rgba(102, 126, 234, 0.4);
}

.save-btn:hover {
  box-shadow: 0 8rpx 25rpx rgba(86, 171, 47, 0.4);
}
/* #endif */

/* 移动端触摸反馈增强 */
/* #ifndef H5 */
.result-item:active {
  transform: scale(0.98);
}

.formula-item:active {
  transform: scale(0.98);
}

.form-input:active {
  background: white;
}

.calculate-btn:active {
  transform: scale(0.98);
}

.save-btn:active {
  transform: scale(0.98);
}

.mode-item:active {
  transform: scale(0.98);
}
/* #endif */
</style>