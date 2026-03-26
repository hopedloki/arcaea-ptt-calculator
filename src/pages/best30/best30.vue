<template>
  <view class="container">
    <!-- PTT概览卡片 -->
    <view class="card overview-card">
      <view class="ptt-overview">
        <view class="ptt-value-container">
          <view class="ptt-value">
            <text class="value">{{ currentPTT.toFixed(2) }}</text>
            <text class="label">当前PTT</text>
          </view>
          <view class="ptt-indicator">
            <text class="indicator-text">{{ getPTTLevel(currentPTT) }}</text>
          </view>
        </view>
        <view class="ptt-stats">
          <view class="stat-item">
            <text class="stat-value">{{ best10Avg.toFixed(2) }}</text>
            <text class="stat-label">B10平均</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ best30Avg.toFixed(2) }}</text>
            <text class="stat-label">B30平均</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ recent10Avg.toFixed(2) }}</text>
            <text class="stat-label">R10平均</text>
          </view>
        </view>
      </view>
      <view class="ptt-progress">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: getPTTProgress(currentPTT) + '%' }"></view>
        </view>
        <text class="progress-text">{{ getPTTProgressText(currentPTT) }}</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="actions">
      <button class="action-btn primary" @click="goToAddScore">
        <view class="btn-content">
          <text class="btn-icon">➕</text>
          <text class="btn-text">添加成绩</text>
        </view>
      </button>
      <button class="action-btn secondary" @click="importData">
        <view class="btn-content">
          <text class="btn-icon">📥</text>
          <text class="btn-text">导入数据</text>
        </view>
      </button>
      <button class="action-btn secondary" @click="exportData">
        <view class="btn-content">
          <text class="btn-icon">📤</text>
          <text class="btn-text">导出数据</text>
        </view>
      </button>
      <button class="action-btn danger" @click="showClearDialog">
        <view class="btn-content">
          <text class="btn-icon">🗑️</text>
          <text class="btn-text">清空数据</text>
        </view>
      </button>
    </view>

    <!-- 筛选和排序 -->
    <view class="filter-section">
      <view class="filter-header">
        <text class="filter-title">筛选与排序</text>
        <text class="filter-count">共 {{ filteredRecords.length }} 条记录</text>
      </view>
      <view class="filter-content">
        <view class="filter-item">
          <view class="filter-item-header">
            <text class="filter-label">难度</text>
            <text class="filter-value">{{ difficultyOptions[difficultyIndex].name }}</text>
          </view>
          <picker 
            :range="difficultyOptions" 
            range-key="name"
            :value="difficultyIndex"
            @change="onDifficultyChange"
            class="picker"
          >
            <view class="picker-indicator">
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>
        <view class="filter-item">
          <view class="filter-item-header">
            <text class="filter-label">排序</text>
            <text class="filter-value">{{ sortOptions[sortIndex].name }}</text>
          </view>
          <picker 
            :range="sortOptions" 
            range-key="name"
            :value="sortIndex"
            @change="onSortChange"
            class="picker"
          >
            <view class="picker-indicator">
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>
      </view>
    </view>

    <!-- B30列表 -->
    <view class="card scores-card">
      <view class="card-header">
        <text class="card-title">B30列表 ({{ filteredRecords.length }})</text>
        <text class="card-action" @click="goToData">查看R10</text>
      </view>
      
      <view class="scores-list" v-if="filteredRecords.length > 0">
        <view 
          class="score-item" 
          v-for="(record, index) in filteredRecords" 
          :key="index"
          :class="{ 'top-score': index < 3 }"
        >
          <view class="score-rank" :class="getRankClass(index)">
            {{ index + 1 }}
          </view>
          
          <view class="song-info">
            <text class="song-name">{{ record.songName }}</text>
            <view class="song-meta">
              <text class="song-difficulty" :class="getDifficultyClass(record.difficulty)">
                {{ getDifficultyText(record.difficulty) }}
              </text>
              <text class="song-constant">{{ record.constant }}</text>
            </view>
          </view>
          
          <view class="score-details">
            <text class="score-text">{{ record.score.toLocaleString() }}</text>
            <view class="score-stats">
              <text class="score-ptt">PTT {{ record.ptt.toFixed(2) }}</text>
              <view class="score-rating-container">
                <text class="score-rating" :class="getRatingClass(record.rating)">
                  {{ record.rating }}
                </text>
              </view>
            </view>
          </view>
          
          <view class="score-actions">
            <button class="action-btn-small edit-btn" @click="editScore(index)">
              <text class="action-icon">✏️</text>
            </button>
            <button class="action-btn-small delete-btn" @click="deleteScore(index)">
              <text class="action-icon">🗑️</text>
            </button>
          </view>
        </view>
      </view>
      
      <view class="empty-state" v-else>
        <view class="empty-illustration">
          <view class="empty-circle">
            <text class="empty-icon">🎵</text>
          </view>
        </view>
        <view class="empty-content">
          <text class="empty-title">开始记录您的Arcaea之旅</text>
          <text class="empty-subtitle">添加您的第一个B30成绩，开启音乐游戏数据分析</text>
          <view class="empty-stats">
            <view class="empty-stat-item">
              <text class="stat-number">0</text>
              <text class="stat-label">最佳记录</text>
            </view>
            <view class="empty-stat-divider"></view>
            <view class="empty-stat-item">
              <text class="stat-number">0.00</text>
              <text class="stat-label">PTT潜力值</text>
            </view>
          </view>
          <button class="empty-btn" @click="goToAddScore">
            <text class="empty-btn-text">添加第一首歌的成绩</text>
            <text class="empty-btn-icon">→</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'

// PTT数据
const currentPTT = ref(11.23)
const best10Avg = ref(12.45)
const best30Avg = ref(11.78)
const recent10Avg = ref(10.56)

// B30记录
const best30Records = ref<any[]>([])

// 筛选和排序选项
const difficultyOptions = [
  { name: '全部难度', value: 'all' },
  { name: 'PAST', value: 'pst' },
  { name: 'PRESENT', value: 'prs' },
  { name: 'FUTURE', value: 'ftr' },
  { name: 'BEYOND', value: 'byd' },
  { name: 'ETERNAL', value: 'etr' }
]
const difficultyIndex = ref(0)

const sortOptions = [
  { name: 'PTT降序', value: 'ptt-desc' },
  { name: 'PTT升序', value: 'ptt-asc' },
  { name: '分数降序', value: 'score-desc' },
  { name: '分数升序', value: 'score-asc' },
  { name: '歌曲名称', value: 'name' }
]
const sortIndex = ref(0)

// 筛选后的记录
const filteredRecords = computed(() => {
  let records = [...best30Records.value]
  
  // 难度筛选
  if (difficultyOptions[difficultyIndex.value].value !== 'all') {
    records = records.filter(record => 
      record.difficulty === difficultyOptions[difficultyIndex.value].value
    )
  }
  
  // 排序
  const sortType = sortOptions[sortIndex.value].value
  switch (sortType) {
    case 'ptt-desc':
      records.sort((a, b) => b.ptt - a.ptt)
      break
    case 'ptt-asc':
      records.sort((a, b) => a.ptt - b.ptt)
      break
    case 'score-desc':
      records.sort((a, b) => b.score - a.score)
      break
    case 'score-asc':
      records.sort((a, b) => a.score - b.score)
      break
    case 'name':
      records.sort((a, b) => a.songName.localeCompare(b.songName))
      break
  }
  
  return records
})

// 页面加载时获取数据
onMounted(() => {
  loadDataFromStorage()
})

// 页面显示时刷新数据（从add页面返回时）
onShow(() => {
  loadDataFromStorage()
})

// 从本地存储加载数据
const loadDataFromStorage = () => {
  try {
    // 加载B30记录
    const records = uni.getStorageSync('best30_records') || []
    best30Records.value = records
    
    // 加载PTT数据
    const pttData = uni.getStorageSync('ptt_data')
    if (pttData) {
      currentPTT.value = pttData.currentPTT || 0
      best10Avg.value = pttData.best10Avg || 0
      best30Avg.value = pttData.best30Avg || 0
      recent10Avg.value = pttData.recent10Avg || 0
    }
    
    // 重新计算PTT概览
    recalculatePTTOverview()
  } catch (e) {
    console.error('加载数据失败', e)
  }
}

// 重新计算PTT概览
const recalculatePTTOverview = () => {
  if (best30Records.value.length === 0) {
    currentPTT.value = 0
    best10Avg.value = 0
    best30Avg.value = 0
    return
  }
  
  // 计算B30平均
  const best30Total = best30Records.value.reduce((sum, record) => sum + record.ptt, 0)
  best30Avg.value = best30Total / best30Records.value.length
  
  // 计算B10平均
  const top10Records = [...best30Records.value].sort((a, b) => b.ptt - a.ptt).slice(0, 10)
  const best10Total = top10Records.reduce((sum, record) => sum + record.ptt, 0)
  best10Avg.value = best10Total / top10Records.length
  
  // 获取R10记录并计算平均值
  try {
    const recent10Records = uni.getStorageSync('recent_scores') || []
    if (recent10Records.length > 0) {
      const recent10Total = recent10Records.reduce((sum: number, record: any) => sum + record.ptt, 0)
      recent10Avg.value = recent10Total / recent10Records.length
    }
  } catch (e) {
    console.error('获取R10数据失败', e)
  }
  
  // 计算当前PTT (B10*0.75 + R10*0.25)
  currentPTT.value = best10Avg.value * 0.75 + recent10Avg.value * 0.25
  
  // 保存PTT数据
  savePTTData()
}

// 保存PTT数据
const savePTTData = () => {
  try {
    const pttData = {
      currentPTT: currentPTT.value,
      best10Avg: best10Avg.value,
      best30Avg: best30Avg.value,
      recent10Avg: recent10Avg.value,
      lastUpdated: Date.now()
    }
    uni.setStorageSync('ptt_data', pttData)
  } catch (e) {
    console.error('保存PTT数据失败', e)
  }
}

// 难度选择变化
const onDifficultyChange = (e: any) => {
  difficultyIndex.value = e.detail.value
}

// 排序选择变化
const onSortChange = (e: any) => {
  sortIndex.value = e.detail.value
}

// 跳转到添加成绩页面
const goToAddScore = () => {
  uni.navigateTo({
    url: '/pages/best30/add'
  })
}

// 跳转到数据管理页面
const goToData = () => {
  uni.navigateTo({
    url: '/pages/data/data'
  })
}

// 导入数据
const importData = () => {
  uni.chooseFile({
    count: 1,
    type: 'file',
    success: (res) => {
      // #ifdef H5
      // H5环境使用原生FileReader API
      if (res.tempFiles && res.tempFiles.length > 0) {
        const file = res.tempFiles[0]
        const reader = new FileReader()
        
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result as string)
            if (data.best30Records && Array.isArray(data.best30Records)) {
              best30Records.value = data.best30Records
              saveBest30Records()
              recalculatePTTOverview()
              uni.showToast({
                title: '导入成功',
                icon: 'success'
              })
            } else {
              uni.showToast({
                title: '数据格式不正确',
                icon: 'none'
              })
            }
          } catch (err) {
            console.error('解析数据失败', err)
            uni.showToast({
              title: '解析数据失败',
              icon: 'none'
            })
          }
        }
        
        reader.onerror = () => {
          console.error('文件读取失败')
          uni.showToast({
            title: '文件读取失败',
            icon: 'none'
          })
        }
        
        reader.readAsText(file, 'utf8')
      }
      // #endif
      
      // #ifndef H5
      // 非H5环境使用UniApp文件系统API
      const tempFilePaths = res.tempFilePaths
      if (tempFilePaths && tempFilePaths.length > 0) {
        const fileManager = uni.getFileSystemManager()
        fileManager.readFile({
          filePath: tempFilePaths[0],
          encoding: 'utf8',
          success: (readRes) => {
            try {
              const data = JSON.parse(readRes.data as string)
              if (data.best30Records && Array.isArray(data.best30Records)) {
                best30Records.value = data.best30Records
                saveBest30Records()
                recalculatePTTOverview()
                uni.showToast({
                  title: '导入成功',
                  icon: 'success'
                })
              } else {
                uni.showToast({
                  title: '数据格式不正确',
                  icon: 'none'
                })
              }
            } catch (e) {
              console.error('解析数据失败', e)
              uni.showToast({
                title: '解析数据失败',
                icon: 'none'
              })
            }
          },
          fail: (err) => {
            console.error('读取文件失败', err)
            uni.showToast({
              title: '读取文件失败',
              icon: 'none'
            })
          }
        })
      }
      // #endif
    },
    fail: (err) => {
      console.error('选择文件失败', err)
      uni.showToast({
        title: '选择文件失败',
        icon: 'none'
      })
    }
  })
}

// 导出数据
const exportData = () => {
  try {
    // 按PTT从高到低排序，确定B几排名
    const sortedRecords = [...best30Records.value]
      .sort((a, b) => b.ptt - a.ptt)
      .map((record, index) => {
        // 在原始数组中找到记录的真实索引
        const originalIndex = best30Records.value.findIndex(
          r => r.songName === record.songName && r.difficulty === record.difficulty
        )
        
        return {
          rank: index + 1,  // B几排名（基于排序后的位置）
          songName: record.songName,
          difficulty: record.difficulty,
          constant: record.constant,
          score: record.score,
          rating: record.rating,
          ptt: record.ptt,
          // 判定详情（如果存在）
          pureCount: record.pureCount !== undefined ? record.pureCount : null,
          farCount: record.farCount !== undefined ? record.farCount : null,
          lostCount: record.lostCount !== undefined ? record.lostCount : null,
          remark: record.remark || null,
          createdAt: record.createdAt || null,
          updatedAt: record.updatedAt || null
        }
      })
    
    const data = {
      version: '2.0.0',
      exportTime: new Date().toISOString(),
      exportTimestamp: Date.now(),
      playerPTT: {
        currentPTT: currentPTT.value,
        best10Avg: best10Avg.value,
        best30Avg: best30Avg.value,
        recent10Avg: recent10Avg.value,
        totalRecords: best30Records.value.length
      },
      best30Records: sortedRecords,
      metadata: {
        appName: 'Arcaea PTT计算器',
        appVersion: '1.2.5',
        exportType: 'B30全量导出',
        description: '包含所有B30记录的完整数据导出'
      }
    }
    
    const jsonStr = JSON.stringify(data, null, 2)
    const fileName = `arcaea-b30-export-${new Date().toISOString().slice(0, 10)}.json`
    
    // #ifdef H5
    // 在H5环境下直接创建下载链接
    try {
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      
      // 延迟清理，确保下载开始
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)
      
      uni.showToast({
        title: '导出成功',
        icon: 'success'
      })
    } catch (err) {
      console.error('H5导出失败', err)
      // 备用方案：复制到剪贴板
      navigator.clipboard.writeText(jsonStr).then(() => {
        uni.showModal({
          title: '导出成功',
          content: '数据已复制到剪贴板，请手动保存为.json文件',
          showCancel: false
        })
      }).catch(() => {
        uni.showToast({
          title: '导出失败',
          icon: 'none'
        })
      })
    }
    // #endif
    
    // #ifndef H5
    // 在非H5环境下使用文件系统API
    const fileManager = uni.getFileSystemManager()
    const filePath = `${uni.env.USER_DATA_PATH}/${fileName}`
    
    fileManager.writeFile({
      filePath: filePath,
      data: jsonStr,
      encoding: 'utf8',
      success: () => {
        uni.showModal({
          title: '导出成功',
          content: `数据已导出到: ${filePath}`,
          showCancel: false
        })
        
        uni.showToast({
          title: '导出成功',
          icon: 'success'
        })
      },
      fail: (err) => {
        console.error('导出失败', err)
        uni.showToast({
          title: '导出失败',
          icon: 'none'
        })
      }
    })
    // #endif
    
  } catch (e) {
    console.error('导出数据失败', e)
    uni.showToast({
      title: '导出失败',
      icon: 'none'
    })
  }
}

// 显示清空数据确认对话框
const showClearDialog = () => {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有B30记录吗？此操作不可恢复！',
    success: (res) => {
      if (res.confirm) {
        clearAllData()
      }
    }
  })
}

// 清空所有数据
const clearAllData = () => {
  try {
    best30Records.value = []
    uni.removeStorageSync('best30_records')
    recalculatePTTOverview()
    uni.showToast({
      title: '已清空所有数据',
      icon: 'success'
    })
  } catch (e) {
    console.error('清空数据失败', e)
    uni.showToast({
      title: '清空失败',
      icon: 'none'
    })
  }
}

// 保存B30记录
const saveBest30Records = () => {
  try {
    uni.setStorageSync('best30_records', best30Records.value)
  } catch (e) {
    console.error('保存B30记录失败', e)
  }
}

// 编辑成绩
const editScore = (index: number) => {
  const record = filteredRecords.value[index]
  const originalIndex = best30Records.value.findIndex(
    r => r.songName === record.songName && r.difficulty === record.difficulty
  )
  
  uni.navigateTo({
    url: `/pages/best30/add?edit=${originalIndex}`
  })
}

// 删除成绩
const deleteScore = (index: number) => {
  const record = filteredRecords.value[index]
  const originalIndex = best30Records.value.findIndex(
    r => r.songName === record.songName && r.difficulty === record.difficulty
  )
  
  uni.showModal({
    title: '确认删除',
    content: `确定要删除《${record.songName}》的成绩记录吗？`,
    success: (res) => {
      if (res.confirm) {
        best30Records.value.splice(originalIndex, 1)
        saveBest30Records()
        recalculatePTTOverview()
        uni.showToast({
          title: '已删除',
          icon: 'success'
        })
      }
    }
  })
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

// 获取PTT等级
const getPTTLevel = (ptt: number): string => {
  if (ptt >= 12.5) return '定数上限'
  if (ptt >= 12.0) return '顶级玩家'
  if (ptt >= 11.0) return '高手玩家'
  if (ptt >= 10.0) return '进阶玩家'
  if (ptt >= 9.0) return '普通玩家'
  if (ptt >= 8.0) return '入门玩家'
  return '新手玩家'
}

// 获取PTT进度百分比
const getPTTProgress = (ptt: number): number => {
  // 假设最高PTT为13.0作为进度条满值
  const maxPTT = 13.0
  return Math.min((ptt / maxPTT) * 100, 100)
}

// 获取PTT进度文本
const getPTTProgressText = (ptt: number): string => {
  const maxPTT = 13.0
  return `${ptt.toFixed(2)} / ${maxPTT.toFixed(1)}`
}

// 获取排名样式类
const getRankClass = (index: number): string => {
  if (index === 0) return 'rank-first'
  if (index === 1) return 'rank-second'
  if (index === 2) return 'rank-third'
  return ''
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
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.overview-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8rpx 30rpx rgba(102, 126, 234, 0.4);
  margin-bottom: 30rpx;
}

/* Web端特殊样式 */
/* #ifdef H5 */
@media (min-width: 768px) {
  .overview-card {
    max-width: 800px;
    margin: 0 auto 30rpx;
    border-radius: 24rpx;
  }
}
/* #endif */

/* 添加动态背景效果 */
.overview-card::before {
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

.ptt-overview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  padding-bottom: 20rpx;
}

.ptt-value-container {
  text-align: center;
  flex: 1;
  position: relative;
}

.ptt-value {
  position: relative;
}

.value {
  font-size: 80rpx;
  font-weight: bold;
  display: block;
  line-height: 1.1;
  text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
  /* 添加响应式字体大小 */
  /* #ifdef H5 */
  font-size: 3.5rem;
  /* #endif */
}

.label {
  font-size: 26rpx;
  opacity: 0.9;
  margin-top: 5rpx;
  display: block;
}

.ptt-indicator {
  margin-top: 10rpx;
}

.indicator-text {
  font-size: 22rpx;
  background: rgba(255, 255, 255, 0.2);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  display: inline-block;
  backdrop-filter: blur(10rpx);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.ptt-stats {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  flex: 2;
  background: rgba(255, 255, 255, 0.1);
  padding: 24rpx;
  border-radius: 20rpx;
  backdrop-filter: blur(10rpx);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8rpx 0;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
}

.stat-label {
  font-size: 26rpx;
  opacity: 0.9;
}

/* 进度条样式 */
.ptt-progress {
  margin-top: 24rpx;
  position: relative;
  z-index: 1;
}

.progress-bar {
  height: 12rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 10rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.9) 100%);
  border-radius: 6rpx;
  transition: width 1s ease-in-out;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
  animation: progressShine 2s infinite;
}

@keyframes progressShine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  font-size: 24rpx;
  opacity: 0.8;
  text-align: right;
  display: block;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

/* Web端响应式布局 */
/* #ifdef H5 */
@media (min-width: 768px) {
  .actions {
    max-width: 800px;
    margin: 0 auto 24rpx;
  }
}
/* #endif */

.action-btn {
  flex: 1;
  border-radius: 20rpx;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.08);
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 140rpx;
}

/* 按钮波纹效果 */
.action-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.action-btn:active::before {
  width: 300rpx;
  height: 300rpx;
}

.btn-content {
  padding: 24rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

/* 主要按钮样式 */
.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 10rpx 30rpx rgba(102, 126, 234, 0.4);
}

/* 次要按钮样式 */
.action-btn.secondary {
  background: white;
  color: #333;
  border: 2rpx solid #f0f2f5;
}

.action-btn.secondary:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

/* 危险按钮样式 */
.action-btn.danger {
  background: white;
  color: #f56565;
  border: 2rpx solid #feb2b2;
}

.action-btn.danger:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 10rpx 30rpx rgba(245, 101, 101, 0.2);
  background: #fff5f5;
}

.btn-icon {
  font-size: 44rpx;
  margin-bottom: 12rpx;
  display: block;
  line-height: 1;
}

.btn-text {
  font-size: 26rpx;
  font-weight: 500;
  display: block;
  line-height: 1.2;
}

/* 按钮图标和文本颜色适配 */
.action-btn.primary .btn-text {
  color: white;
}

.action-btn.secondary .btn-text {
  color: #4a5568;
}

.action-btn.danger .btn-text {
  color: #e53e3e;
}

/* Web端特殊交互效果 */
/* #ifdef H5 */
.action-btn:hover {
  transform: translateY(-4rpx);
}

.action-btn:active {
  transform: translateY(0);
}
/* #endif */

/* 移动端触摸反馈 */
/* #ifndef H5 */
.action-btn:active {
  transform: scale(0.98);
}
/* #endif */

.filter-section {
  background: white;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

/* Web端响应式布局 */
/* #ifdef H5 */
@media (min-width: 768px) {
  .filter-section {
    max-width: 800px;
    margin: 0 auto 24rpx;
  }
}
/* #endif */

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f2f5;
}

.filter-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.filter-count {
  font-size: 26rpx;
  color: #666;
  background: #f8f9fa;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.filter-content {
  display: flex;
  gap: 20rpx;
}

.filter-item {
  flex: 1;
  background: #f8f9fa;
  border-radius: 20rpx;
  padding: 20rpx;
  position: relative;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.filter-item:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.filter-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.filter-label {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.filter-value {
  font-size: 26rpx;
  color: #667eea;
  font-weight: 600;
}

.picker {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  z-index: 2;
}

.picker-indicator {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  width: 40rpx;
  height: 40rpx;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
}

.picker-arrow {
  color: white;
  font-size: 20rpx;
  line-height: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.card-action {
  font-size: 26rpx;
  color: #667eea;
}

.scores-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

/* Web端响应式布局 */
/* #ifdef H5 */
@media (min-width: 768px) {
  .scores-list {
    max-width: 800px;
    margin: 0 auto;
  }
}
/* #endif */

.score-item {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 20rpx;
  padding: 24rpx;
  position: relative;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
}

.score-item:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.08);
}

/* 前三名特殊样式 */
.score-item.top-score {
  border-color: rgba(102, 126, 234, 0.2);
}

.score-item.top-score:nth-child(1) {
  border-color: rgba(255, 215, 0, 0.4);
  background: linear-gradient(to right, rgba(255, 215, 0, 0.05), white);
}

.score-item.top-score:nth-child(2) {
  border-color: rgba(192, 192, 192, 0.4);
  background: linear-gradient(to right, rgba(192, 192, 192, 0.05), white);
}

.score-item.top-score:nth-child(3) {
  border-color: rgba(205, 127, 50, 0.4);
  background: linear-gradient(to right, rgba(205, 127, 50, 0.05), white);
}

.score-rank {
  width: 60rpx;
  height: 60rpx;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  margin-right: 24rpx;
  box-shadow: 0 4rpx 10rpx rgba(102, 126, 234, 0.3);
}

/* 前三名特殊排名样式 */
.score-rank.rank-first {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
  box-shadow: 0 4rpx 15rpx rgba(255, 215, 0, 0.4);
}

.score-rank.rank-second {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  color: #333;
  box-shadow: 0 4rpx 15rpx rgba(192, 192, 192, 0.4);
}

.score-rank.rank-third {
  background: linear-gradient(135deg, #cd7f32, #e8a75d);
  color: white;
  box-shadow: 0 4rpx 15rpx rgba(205, 127, 50, 0.4);
}

.song-info {
  flex: 2;
  margin-right: 20rpx;
}

.song-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
  line-height: 1.3;
}

.song-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.song-difficulty {
  font-size: 24rpx;
  font-weight: 600;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  line-height: 1.2;
}

.song-constant {
  font-size: 24rpx;
  color: #666;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
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

.score-details {
  flex: 1;
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.score-text {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.2;
}

.score-stats {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.score-ptt {
  font-size: 24rpx;
  color: #667eea;
  font-weight: 600;
}

.score-rating-container {
  display: flex;
  justify-content: flex-end;
}

.score-rating {
  font-size: 24rpx;
  font-weight: bold;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
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

.score-actions {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-left: 16rpx;
}

.action-btn-small {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.action-btn-small:hover {
  transform: scale(1.1);
}

.action-btn-small:active {
  transform: scale(0.95);
}

.action-icon {
  font-size: 28rpx;
  line-height: 1;
}

.edit-btn {
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
}

.edit-btn:hover {
  background: rgba(33, 150, 243, 0.2);
}

.delete-btn {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.delete-btn:hover {
  background: rgba(244, 67, 54, 0.2);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx 60rpx;
  text-align: center;
}

.empty-illustration {
  margin-bottom: 40rpx;
  position: relative;
}

.empty-circle {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

.empty-circle::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.1;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(1.1); opacity: 0.05; }
}

.empty-icon {
  font-size: 70rpx;
  line-height: 1;
  z-index: 1;
}

.empty-content {
  max-width: 500rpx;
}

.empty-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
  line-height: 1.3;
}

.empty-subtitle {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 40rpx;
  display: block;
  line-height: 1.4;
}

.empty-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
  background: #f8f9fa;
  border-radius: 20rpx;
  padding: 24rpx 40rpx;
}

.empty-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 40rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

.empty-stat-divider {
  width: 2rpx;
  height: 60rpx;
  background: #e0e0e0;
  margin: 0 40rpx;
}

.empty-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50rpx;
  padding: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 280rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.empty-btn:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 12rpx 30rpx rgba(102, 126, 234, 0.4);
}

.empty-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.empty-btn:hover::before {
  left: 100%;
}

.empty-btn-text {
  flex: 1;
  font-size: 28rpx;
  font-weight: 600;
  padding: 24rpx 20rpx 24rpx 40rpx;
  text-align: center;
}

.empty-btn-icon {
  font-size: 28rpx;
  margin-right: 30rpx;
  transition: transform 0.3s ease;
}

.empty-btn:hover .empty-btn-icon {
  transform: translateX(8rpx);
}

/* Web端响应式布局 */
/* #ifdef H5 */
@media (min-width: 768px) {
  .empty-state {
    max-width: 600px;
    margin: 0 auto;
  }
}
/* #endif */

/* 全局过渡动画效果 */
.container {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

/* 卡片入场动画 */
.card {
  animation: slideUp 0.6s ease-out backwards;
}

.card:nth-child(1) { animation-delay: 0.1s; }
.card:nth-child(2) { animation-delay: 0.2s; }
.card:nth-child(3) { animation-delay: 0.3s; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

/* 列表项入场动画 */
.score-item {
  animation: slideInLeft 0.5s ease-out backwards;
}

.score-item:nth-child(1) { animation-delay: 0.05s; }
.score-item:nth-child(2) { animation-delay: 0.1s; }
.score-item:nth-child(3) { animation-delay: 0.15s; }
.score-item:nth-child(4) { animation-delay: 0.2s; }
.score-item:nth-child(5) { animation-delay: 0.25s; }

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-20rpx); }
  to { opacity: 1; transform: translateX(0); }
}

/* 按钮点击涟漪效果 */
.action-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
  z-index: 0;
}

.action-btn:active::after {
  width: 300rpx;
  height: 300rpx;
}

/* 分数数字变化动画 */
.score-text {
  transition: all 0.3s ease;
}

.score-item:hover .score-text {
  transform: scale(1.05);
  color: #667eea;
}

/* PTT值变化动画 */
.value {
  transition: all 0.5s ease;
}

/* 排名徽章悬停效果 */
.score-rank {
  transition: all 0.3s ease;
}

.score-item:hover .score-rank {
  transform: scale(1.1) rotate(5deg);
}

/* Web端特殊动画效果 */
/* #ifdef H5 */
.score-item {
  position: relative;
}

.score-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.05), transparent);
  transition: width 0.6s ease;
}

.score-item:hover::before {
  width: 100%;
}

/* 滚动条样式优化 */
::-webkit-scrollbar {
  width: 8rpx;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4rpx;
}

::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 4rpx;
}

::-webkit-scrollbar-thumb:hover {
  background: #764ba2;
}
/* #endif */

/* 移动端触摸反馈增强 */
/* #ifndef H5 */
.score-item:active {
  transform: scale(0.98);
  background: #f8f9fa;
}

.action-btn:active {
  transform: scale(0.96);
}
/* #endif */
</style>