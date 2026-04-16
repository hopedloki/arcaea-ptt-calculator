<template>
  <view class="container">
    <!-- PTT概览 -->
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
      <view class="overview-actions">
        <button class="refresh-btn" @click="refreshPTT">
          <text class="refresh-icon">🔄</text>
          <text class="refresh-text">刷新数据</text>
        </button>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="actions">
      <button class="action-btn secondary" @click="exportAllData">
        <view class="btn-content">
          <text class="btn-icon">📤</text>
          <text class="btn-text">导出全部</text>
        </view>
      </button>
      <button class="action-btn secondary" @click="importData">
        <view class="btn-content">
          <text class="btn-icon">📥</text>
          <text class="btn-text">导入数据</text>
        </view>
      </button>
      <button class="action-btn secondary" @click="syncData">
        <view class="btn-content">
          <text class="btn-icon">🔄</text>
          <text class="btn-text">同步数据</text>
        </view>
      </button>
      <button class="action-btn danger" @click="showClearDialog">
        <view class="btn-content">
          <text class="btn-icon">🗑️</text>
          <text class="btn-text">清空数据</text>
        </view>
      </button>
    </view>

    <!-- 数据统计 -->
    <view class="card stats-card">
      <view class="card-header">
        <text class="card-title">数据统计</text>
        <view class="stats-toggle" @click="toggleStatsView">
          <text class="toggle-icon">{{ statsExpanded ? '▼' : '▶' }}</text>
        </view>
      </view>
      <view class="stats-grid" :class="{ expanded: statsExpanded }">
        <view class="stat-card" :class="{ highlight: best30Records.length > 0 }">
          <view class="stat-icon">🏆</view>
          <text class="stat-number">{{ best30Records.length }}</text>
          <text class="stat-label">B30记录</text>
        </view>
        <view class="stat-card" :class="{ highlight: recentRecords.length > 0 }">
          <view class="stat-icon">📊</view>
          <text class="stat-number">{{ recentRecords.length }}</text>
          <text class="stat-label">最近记录</text>
        </view>
        <view class="stat-card" :class="{ highlight: songsCount > 0 }">
          <view class="stat-icon">🎵</view>
          <text class="stat-number">{{ songsCount }}</text>
          <text class="stat-label">歌曲总数</text>
        </view>
        <view class="stat-card">
          <view class="stat-icon">⏰</view>
          <text class="stat-number">{{ lastUpdated }}</text>
          <text class="stat-label">最后更新</text>
        </view>
      </view>
    </view>

    <!-- 选项卡 -->
    <view class="tabs-container">
      <view class="tabs">
        <view 
          class="tab-item" 
          :class="{ active: activeTab === 'best30' }"
          @click="switchTab('best30')"
        >
          <text class="tab-icon">🏆</text>
          <text class="tab-text">B30记录</text>
          <view class="tab-count">{{ best30Records.length }}</view>
          <view class="tab-indicator"></view>
        </view>
        <view 
          class="tab-item" 
          :class="{ active: activeTab === 'recent' }"
          @click="switchTab('recent')"
        >
          <text class="tab-icon">📊</text>
          <text class="tab-text">最近记录</text>
          <view class="tab-count">{{ recentRecords.length }}</view>
          <view class="tab-indicator"></view>
        </view>
      </view>
    </view>

    <!-- 记录列表 -->
    <view class="card records-card">
      <view class="card-header">
        <text class="card-title">
          {{ activeTab === 'best30' ? 'B30记录' : '最近记录' }} ({{ currentRecords.length }})
        </text>
      </view>
      
      <view class="records-list" v-if="currentRecords.length > 0">
        <view 
          class="record-item" 
          v-for="(record, index) in currentRecords" 
          :key="index"
          :class="{ 'top-record': index < 3 }"
        >
          <view class="record-rank" :class="getRankClass(index)">
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
          
          <view class="record-details">
            <text class="record-score">{{ record.score.toLocaleString() }}</text>
            <view class="record-stats">
              <text class="record-ptt">PTT {{ record.ptt.toFixed(2) }}</text>
              <view class="record-rating-container">
                <text class="record-rating" :class="getRatingClass(record.rating)">
                  {{ record.rating }}
                </text>
              </view>
            </view>
          </view>
          
          <view class="record-actions">
            <button class="action-btn-small edit-btn" @click="editRecord(index)">
              <text class="action-icon">✏️</text>
            </button>
            <button class="action-btn-small delete-btn" @click="deleteRecord(index)">
              <text class="action-icon">🗑️</text>
            </button>
          </view>
        </view>
      </view>
      
      <view class="empty-state" v-else>
        <view class="empty-illustration">
          <view class="empty-circle">
            <text class="empty-icon">{{ activeTab === 'best30' ? '🏆' : '📊' }}</text>
          </view>
        </view>
        <view class="empty-content">
          <text class="empty-title">
            {{ activeTab === 'best30' ? '还没有B30记录' : '还没有最近成绩' }}
          </text>
          <text class="empty-subtitle">
            {{ activeTab === 'best30' 
              ? '开始记录您的最佳成绩，构建您的B30列表' 
              : '记录您最近的游戏成绩，追踪PTT变化' }}
          </text>
          <view class="empty-stats">
            <view class="empty-stat-item">
              <text class="stat-number">0</text>
              <text class="stat-label">
                {{ activeTab === 'best30' ? '最佳记录' : '最近记录' }}
              </text>
            </view>
            <view class="empty-stat-divider"></view>
            <view class="empty-stat-item">
              <text class="stat-number">0.00</text>
              <text class="stat-label">平均PTT</text>
            </view>
          </view>
          <button class="empty-btn" @click="goToBest30">
            <text class="empty-btn-text">去添加成绩</text>
            <text class="empty-btn-icon">→</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// PTT数据
const currentPTT = ref(0)
const best10Avg = ref(0)
const best30Avg = ref(0)
const recent10Avg = ref(0)
const lastUpdated = ref('未知')

// 记录数据
const best30Records = ref<any[]>([])
const recentRecords = ref<any[]>([])
const songsCount = ref(0)

// 当前选中的选项卡
const activeTab = ref<'best30' | 'recent'>('best30')

// 统计区域展开状态
const statsExpanded = ref(true)

// 当前显示的记录列表
const currentRecords = computed(() => {
  return activeTab.value === 'best30' ? best30Records.value : recentRecords.value
})

// 页面加载时获取数据
onMounted(() => {
  loadDataFromStorage()
})

// 从本地存储加载数据
const loadDataFromStorage = () => {
  try {
    // 加载PTT数据
    const pttData = uni.getStorageSync('ptt_data')
    if (pttData) {
      currentPTT.value = pttData.currentPTT || 0
      best10Avg.value = pttData.best10Avg || 0
      best30Avg.value = pttData.best30Avg || 0
      recent10Avg.value = pttData.recent10Avg || 0
      
      // 格式化最后更新时间
      if (pttData.lastUpdated) {
        const date = new Date(pttData.lastUpdated)
        lastUpdated.value = formatDate(date)
      }
    }
    
    // 加载B30记录
    const records = uni.getStorageSync('best30_records') || []
    best30Records.value = records
    
    // 加载最近记录
    const recent = uni.getStorageSync('recent_scores') || []
    recentRecords.value = recent
    
    // 加载歌曲数据
    const songs = uni.getStorageSync('songs_data') || []
    songsCount.value = songs.length
  } catch (e) {
    console.error('加载数据失败', e)
  }
}

// 切换统计区域展开状态
const toggleStatsView = () => {
  statsExpanded.value = !statsExpanded.value
}

// 格式化日期
const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${month}-${day} ${hours}:${minutes}`
}

// 刷新PTT数据
const refreshPTT = () => {
  try {
    // 重新计算PTT数据
    let currentPTTValue = 0
    let best10AvgValue = 0
    let best30AvgValue = 0
    let recent10AvgValue = 0
    
    if (best30Records.value.length > 0) {
      // 计算B30平均
      const best30Total = best30Records.value.reduce((sum, record) => sum + record.ptt, 0)
      best30AvgValue = best30Total / best30Records.value.length
      
      // 计算B10平均
      const top10Records = [...best30Records.value].sort((a, b) => b.ptt - a.ptt).slice(0, 10)
      const best10Total = top10Records.reduce((sum, record) => sum + record.ptt, 0)
      best10AvgValue = best10Total / top10Records.length
    }
    
    if (recentRecords.value.length > 0) {
      // 计算R10平均
      const recent10Total = recentRecords.value.reduce((sum, record) => sum + record.ptt, 0)
      recent10AvgValue = recent10Total / recentRecords.value.length
    }
    
    // 计算当前PTT (B10*0.75 + R10*0.25)
    currentPTTValue = best10AvgValue * 0.75 + recent10AvgValue * 0.25
    
    // 更新数据
    currentPTT.value = currentPTTValue
    best10Avg.value = best10AvgValue
    best30Avg.value = best30AvgValue
    recent10Avg.value = recent10AvgValue
    lastUpdated.value = formatDate(new Date())
    
    // 保存PTT数据
    const pttData = {
      currentPTT: currentPTTValue,
      best10Avg: best10AvgValue,
      best30Avg: best30AvgValue,
      recent10Avg: recent10AvgValue,
      lastUpdated: Date.now()
    }
    uni.setStorageSync('ptt_data', pttData)
    
    uni.showToast({
      title: '刷新成功',
      icon: 'success'
    })
  } catch (e) {
    console.error('刷新PTT失败', e)
    uni.showToast({
      title: '刷新失败',
      icon: 'none'
    })
  }
}

// 切换选项卡
const switchTab = (tab: 'best30' | 'recent') => {
  activeTab.value = tab
}

// 导出全部数据
const exportAllData = () => {
  try {
    const data = {
      best30Records: best30Records.value,
      recentRecords: recentRecords.value,
      pttData: {
        currentPTT: currentPTT.value,
        best10Avg: best10Avg.value,
        best30Avg: best30Avg.value,
        recent10Avg: recent10Avg.value
      },
      exportTime: new Date().toISOString(),
      version: '1.0.0',
      type: 'full-export'
    }
    
    const jsonStr = JSON.stringify(data, null, 2)
    const fileName = `arcaea-ptt-full-backup-${Date.now()}.json`
    
    // #ifdef H5
    // H5环境：创建下载链接
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    uni.showToast({ title: '导出成功', icon: 'success' })
    // #endif
    
    // #ifndef H5
    // App环境：保存到本地文件
    const fileManager = uni.getFileSystemManager()
    // 使用更通用的路径
    const tempFilePath = `${uni.env.USER_DATA_PATH || plus.io.convertLocalFileSystemURL('')}${fileName}`
    
    fileManager.writeFile({
      filePath: tempFilePath,
      data: jsonStr,
      encoding: 'utf8',
      success: () => {
        // 尝试分享文件
        uni.share({
          provider: 'weixin',
          type: 'file',
          filePath: tempFilePath,
          success: () => {
            uni.showToast({ title: '分享成功', icon: 'success' })
          },
          fail: () => {
            // 分享失败时，显示文件路径
            uni.showModal({
              title: '导出成功',
              content: `数据已导出，文件位于应用私有目录。\n您可以使用文件管理器访问：\n${fileName}`,
              showCancel: false
            })
          }
        })
      },
      fail: (err) => {
        console.error('导出失败', err)
        // 回退：保存到剪贴板
        uni.setClipboardData({
          data: jsonStr,
          success: () => {
            uni.showToast({ title: '已复制到剪贴板，请粘贴保存', icon: 'none', duration: 3000 })
          },
          fail: () => {
            uni.showToast({ title: '导出失败', icon: 'none' })
          }
        })
      }
    })
    // #endif
  } catch (e) {
    console.error('导出数据失败', e)
    uni.showToast({ title: '导出失败', icon: 'none' })
  }
}

// 导入数据
const importData = () => {
  // #ifdef H5
  // H5环境：使用文件选择器
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e: any) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const jsonStr = event.target?.result as string
          processImportData(jsonStr)
        } catch (err) {
          uni.showToast({ title: '读取文件失败', icon: 'none' })
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
  // #endif
  
  // #ifndef H5
  // App环境：使用系统文件选择
  uni.chooseFile({
    count: 1,
    type: 'file',
    extension: ['.json'],
    success: (res: any) => {
      const tempFilePaths = res.tempFilePaths
      if (tempFilePaths && tempFilePaths.length > 0) {
        const fileManager = uni.getFileSystemManager()
        fileManager.readFile({
          filePath: tempFilePaths[0],
          encoding: 'utf8',
          success: (readRes: any) => {
            processImportData(readRes.data)
          },
          fail: (err) => {
            console.error('读取文件失败', err)
            uni.showToast({ title: '读取文件失败', icon: 'none' })
          }
        })
      }
    },
    fail: () => {
      // 尝试使用分享方式导入
      uni.showModal({
        title: '导入提示',
        content: '请将备份的JSON文件放到可访问位置后重试，或使用剪贴板导入',
        confirmText: '剪贴板导入',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 从剪贴板导入
            uni.getClipboardData({
              success: (clipRes) => {
                if (clipRes.data) {
                  processImportData(clipRes.data)
                } else {
                  uni.showToast({ title: '剪贴板为空', icon: 'none' })
                }
              }
            })
          }
        }
      })
    }
  })
  // #endif
}

// 处理导入数据
const processImportData = (jsonStr: string) => {
  try {
    const data = JSON.parse(jsonStr)
    
    if (data.type === 'full-export') {
      // 导入完整数据
      if (data.best30Records && Array.isArray(data.best30Records)) {
        best30Records.value = data.best30Records
        uni.setStorageSync('best30_records', data.best30Records)
      }
      
      if (data.recentRecords && Array.isArray(data.recentRecords)) {
        recentRecords.value = data.recentRecords
        uni.setStorageSync('recent_scores', data.recentRecords)
      }
      
      if (data.pttData) {
        currentPTT.value = data.pttData.currentPTT || 0
        best10Avg.value = data.pttData.best10Avg || 0
        best30Avg.value = data.pttData.best30Avg || 0
        recent10Avg.value = data.pttData.recent10Avg || 0
        
        if (data.pttData.lastUpdated) {
          const date = new Date(data.pttData.lastUpdated)
          lastUpdated.value = formatDate(date)
        }
        
        uni.setStorageSync('ptt_data', {
          currentPTT: currentPTT.value,
          best10Avg: best10Avg.value,
          best30Avg: best30Avg.value,
          recent10Avg: recent10Avg.value,
          lastUpdated: data.pttData.lastUpdated || Date.now()
        })
      }
      
      uni.showToast({ title: '导入成功', icon: 'success' })
    } else if (data.best30Records && Array.isArray(data.best30Records)) {
      // 兼容旧格式导入
      best30Records.value = data.best30Records
      uni.setStorageSync('best30_records', data.best30Records)
      refreshPTT()
      uni.showToast({ title: '导入成功', icon: 'success' })
    } else {
      uni.showToast({ title: '数据格式不正确', icon: 'none' })
    }
  } catch (e) {
    console.error('解析数据失败', e)
    uni.showToast({ title: '数据格式不正确', icon: 'none' })
  }
}

// 同步数据
const syncData = () => {
  uni.showModal({
    title: '提示',
    content: '是否从云端同步数据？此功能需要登录云开发环境。',
    success: (res) => {
      if (res.confirm) {
        // 这里可以实现从云端同步数据的逻辑
        uni.showToast({
          title: '同步功能开发中',
          icon: 'none'
        })
      }
    }
  })
}

// 显示清空数据确认对话框
const showClearDialog = () => {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有数据吗？此操作不可恢复！',
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
    // 清空所有数据
    uni.removeStorageSync('best30_records')
    uni.removeStorageSync('recent_scores')
    uni.removeStorageSync('ptt_data')
    
    // 重新加载默认数据
    currentPTT.value = 0
    best10Avg.value = 0
    best30Avg.value = 0
    recent10Avg.value = 0
    best30Records.value = []
    recentRecords.value = []
    lastUpdated.value = '未知'
    
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

// 跳转到B30页面
const goToBest30 = () => {
  uni.switchTab({
    url: '/pages/best30/best30'
  })
}

// 编辑记录
const editRecord = (index: number) => {
  const record = currentRecords.value[index]
  
  if (activeTab.value === 'best30') {
    // 编辑B30记录
    uni.navigateTo({
      url: `/pages/best30/add?edit=${index}`
    })
  } else {
    // 编辑最近记录
    uni.showModal({
      title: '提示',
      content: '最近记录无法直接编辑，您可以在B30页面中编辑。',
      showCancel: false
    })
  }
}

// 删除记录
const deleteRecord = (index: number) => {
  const record = currentRecords.value[index]
  
  uni.showModal({
    title: '确认删除',
    content: `确定要删除《${record.songName}》的记录吗？`,
    success: (res) => {
      if (res.confirm) {
        try {
          if (activeTab.value === 'best30') {
            // 从B30记录中删除
            best30Records.value.splice(index, 1)
            uni.setStorageSync('best30_records', best30Records.value)
            refreshPTT()
          } else {
            // 从最近记录中删除
            recentRecords.value.splice(index, 1)
            uni.setStorageSync('recent_scores', recentRecords.value)
            refreshPTT()
          }
          
          uni.showToast({
            title: '已删除',
            icon: 'success'
          })
        } catch (e) {
          console.error('删除记录失败', e)
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          })
        }
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

.card-action {
  font-size: 26rpx;
  color: #667eea;
}

.stats-toggle {
  padding: 8rpx 12rpx;
  border-radius: 12rpx;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.stats-toggle:active {
  background: #e9ecef;
}

.toggle-icon {
  font-size: 24rpx;
  color: #666;
  line-height: 1;
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
// #ifdef H5
@media (min-width: 768px) {
  .overview-card {
    max-width: 800px;
    margin: 0 auto 30rpx;
    border-radius: 24rpx;
  }
}
// #endif

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

.overview-card .card-title {
  color: white;
}

.overview-card .card-action {
  color: rgba(255, 255, 255, 0.8);
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
  // #ifdef H5
  font-size: 3.5rem;
  // #endif
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

/* 刷新按钮样式 */
.overview-actions {
  display: flex;
  justify-content: center;
  margin-top: 20rpx;
  position: relative;
  z-index: 1;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 40rpx;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 200rpx;
  height: 60rpx;
  backdrop-filter: blur(10rpx);
  transition: all 0.3s ease;
}

.refresh-btn:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.98);
}

.refresh-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
  animation: rotate 2s linear infinite paused;
}

.refresh-btn:active .refresh-icon {
  animation-play-state: running;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.refresh-text {
  font-size: 26rpx;
  font-weight: 600;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

/* Web端响应式布局 */
// #ifdef H5
@media (min-width: 768px) {
  .actions {
    max-width: 800px;
    margin: 0 auto 24rpx;
  }
}
// #endif

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
.action-btn.secondary .btn-text {
  color: #4a5568;
}

.action-btn.danger .btn-text {
  color: #e53e3e;
}

/* Web端特殊交互效果 */
// #ifdef H5
.action-btn:hover {
  transform: translateY(-4rpx);
}

.action-btn:active {
  transform: translateY(0);
}
// #endif

/* 移动端触摸反馈 */
// #ifndef H5
.action-btn:active {
  transform: scale(0.98);
}
// #endif

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.stats-grid.expanded {
  max-height: 500rpx;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 20rpx;
  padding: 24rpx;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}

.stat-card.highlight {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 2rpx solid rgba(102, 126, 234, 0.2);
}

.stat-card:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.stat-icon {
  font-size: 40rpx;
  margin-bottom: 12rpx;
  display: block;
  filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.1));
}

.stat-number {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.2;
}

.stat-card.highlight .stat-number {
  color: #667eea;
}

.tabs-container {
  background: white;
  border-radius: 24rpx;
  padding: 12rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

/* Web端响应式布局 */
// #ifdef H5
@media (min-width: 768px) {
  .tabs-container {
    max-width: 800px;
    margin: 0 auto 24rpx;
  }
}
// #endif

.tabs {
  display: flex;
  position: relative;
}

.tab-item {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  border-radius: 20rpx;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.tab-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: scale(1.02);
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.tab-item:not(.active):hover {
  background: #f8f9fa;
}

.tab-icon {
  font-size: 32rpx;
  display: block;
  margin-bottom: 8rpx;
  filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.1));
}

.tab-text {
  font-size: 26rpx;
  font-weight: 600;
  transition: color 0.3s ease;
  line-height: 1.2;
}

.tab-item.active .tab-text {
  color: white;
}

.tab-count {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  background: rgba(255, 255, 255, 0.2);
  color: #333;
  font-size: 20rpx;
  font-weight: bold;
  padding: 4rpx 8rpx;
  border-radius: 10rpx;
  min-width: 24rpx;
  text-align: center;
}

.tab-item.active .tab-count {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4rpx;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2rpx;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.tab-item.active .tab-indicator {
  transform: scaleX(1);
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

/* Web端响应式布局 */
// #ifdef H5
@media (min-width: 768px) {
  .records-list {
    max-width: 800px;
    margin: 0 auto;
  }
}
// #endif

.record-item {
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

.record-item:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.08);
}

/* 前三名特殊样式 */
.record-item.top-record {
  border-color: rgba(102, 126, 234, 0.2);
}

.record-item.top-record:nth-child(1) {
  border-color: rgba(255, 215, 0, 0.4);
  background: linear-gradient(to right, rgba(255, 215, 0, 0.05), white);
}

.record-item.top-record:nth-child(2) {
  border-color: rgba(192, 192, 192, 0.4);
  background: linear-gradient(to right, rgba(192, 192, 192, 0.05), white);
}

.record-item.top-record:nth-child(3) {
  border-color: rgba(205, 127, 50, 0.4);
  background: linear-gradient(to right, rgba(205, 127, 50, 0.05), white);
}

.record-rank {
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
  transition: all 0.3s ease;
}

/* 前三名特殊排名样式 */
.record-rank.rank-first {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
  box-shadow: 0 4rpx 15rpx rgba(255, 215, 0, 0.4);
}

.record-rank.rank-second {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  color: #333;
  box-shadow: 0 4rpx 15rpx rgba(192, 192, 192, 0.4);
}

.record-rank.rank-third {
  background: linear-gradient(135deg, #cd7f32, #e8a75d);
  color: white;
  box-shadow: 0 4rpx 15rpx rgba(205, 127, 50, 0.4);
  font-size: 26rpx;
  font-weight: bold;
  margin-right: 20rpx;
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

.record-details {
  flex: 1;
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.record-score {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.2;
}

.record-stats {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.record-ptt {
  font-size: 24rpx;
  color: #667eea;
  font-weight: 600;
}

.record-rating-container {
  display: flex;
  justify-content: flex-end;
}

.record-rating {
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

.record-actions {
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
  padding: 80rpx 20rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 30rpx;
}

.empty-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 40rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  border: none;
}

/* 改进的空状态样式 */
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

.empty-stat-divider {
  width: 2rpx;
  height: 60rpx;
  background: #e0e0e0;
  margin: 0 40rpx;
}

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
.record-item {
  animation: slideInLeft 0.5s ease-out backwards;
}

.record-item:nth-child(1) { animation-delay: 0.05s; }
.record-item:nth-child(2) { animation-delay: 0.1s; }
.record-item:nth-child(3) { animation-delay: 0.15s; }
.record-item:nth-child(4) { animation-delay: 0.2s; }
.record-item:nth-child(5) { animation-delay: 0.25s; }

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-20rpx); }
  to { opacity: 1; transform: translateX(0); }
}

/* 悬停效果增强 */
.record-item:hover .record-score {
  transform: scale(1.05);
  color: #667eea;
}

.record-item:hover .record-rank {
  transform: scale(1.1) rotate(5deg);
}

/* 排名徽章悬停效果 */
.record-rank {
  transition: all 0.3s ease;
}

/* Web端特殊动画效果 */
// #ifdef H5
.record-item {
  position: relative;
}

.record-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.05), transparent);
  transition: width 0.6s ease;
}

.record-item:hover::before {
  width: 100%;
}
// #endif

/* 移动端触摸反馈增强 */
// #ifndef H5
.record-item:active {
  transform: scale(0.98);
  background: #f8f9fa;
}

.action-btn-small:active {
  transform: scale(0.96);
}
// #endif
</style>