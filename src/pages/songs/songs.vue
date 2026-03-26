<template>
  <view class="container">
    <!-- 搜索和筛选 -->
    <view class="card search-card">
      <view class="search-bar">
        <input 
          class="search-input" 
          v-model="searchText" 
          placeholder="搜索歌曲名称..."
          @input="onSearchInput"
        />
        <button class="search-btn" @click="search">搜索</button>
      </view>
      
      <view class="filter-row">
        <view class="filter-item full-width">
          <text class="filter-label">曲包</text>
          <picker 
            :range="packOptions" 
            :value="packIndex"
            @change="onPackChange"
            class="picker"
          >
            <view class="picker-text">
              {{ packOptions[packIndex] }}
            </view>
          </picker>
        </view>
      </view>

      <view class="filter-row">
        <view class="filter-item full-width">
          <text class="filter-label">定数范围</text>
          <picker 
            :range="constantRangeOptions" 
            range-key="name"
            :value="constantRangeIndex"
            @change="onConstantRangeChange"
            class="picker"
          >
            <view class="picker-text">
              {{ constantRangeOptions[constantRangeIndex].name }}
            </view>
          </picker>
        </view>
      </view>
    </view>

    <!-- 歌曲列表 -->
    <view class="card songs-card">
      <view class="card-header">
        <text class="card-title">歌曲列表 ({{ filteredSongs.length }})</text>
      </view>
      
      <view class="songs-list" v-if="filteredSongs.length > 0">
        <view 
          class="song-item" 
          v-for="(song, index) in filteredSongs" 
          :key="index"
          @click="selectSong(song)"
        >
          <view class="song-info">
            <text class="song-name">{{ song.name }}</text>
            <text class="song-artist">{{ song.artist || '' }}</text>
          </view>
          
          <view class="song-difficulties">
            <view 
              class="difficulty-item" 
              v-for="(difficulty, key) in getAvailableDifficulties(song)"
              :key="key"
              :class="getDifficultyClass(key)"
              @click.stop="selectSongWithDifficulty(song, key)"
            >
              <text class="difficulty-name">{{ difficulty.name }}</text>
              <text class="difficulty-constant">{{ difficulty.constant }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <view class="empty-state" v-else>
        <text class="empty-icon">🎵</text>
        <text class="empty-text">没有找到符合条件的歌曲</text>
        <button class="reset-btn" @click="resetFilters">重置筛选条件</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { loadSongsDataFromStorage, fetchSongsFromAPI } from '@/utils/songs-database'

// 页面来源
const fromPage = ref('')

// 搜索文本
const searchText = ref('')

// 加载状态
const loading = ref(false)

// 歌曲数据
const songsData = ref<any[]>([])

// 曲包选项
const packOptions = ref<string[]>(['全部曲包'])
const packIndex = ref(0)

// 筛选选项 - 定数值（精度0.1）
const constantRangeOptions = ref<{ name: string; value: number | null }[]>([])
const constantRangeIndex = ref(0)

// 根据当前曲包生成定数范围选项
const generateConstantRangeOptions = () => {
  let songs = [...songsData.value]

  // 如果选择了特定曲包，先筛选该曲包的歌曲
  if (packIndex.value > 0) {
    const selectedPack = packOptions.value[packIndex.value]
    songs = songs.filter(song =>
      song.pack === selectedPack ||
      song.pack.toLowerCase() === selectedPack.toLowerCase()
    )
  }

  // 提取所有存在的定数值
  const constantSet = new Set<number>()
  songs.forEach(song => {
    const difficulties = ['pst', 'prs', 'ftr', 'byd', 'etr']
    difficulties.forEach(diff => {
      const constant = song[diff]
      if (constant !== null && constant !== undefined) {
        constantSet.add(constant)
      }
    })
  })

  // 生成选项
  const options = [{ name: '全部定数', value: null }]
  const constants = Array.from(constantSet).sort((a, b) => a - b)
  constants.forEach(constant => {
    options.push({ name: constant.toFixed(1), value: constant })
  })

  constantRangeOptions.value = options

  // 如果当前选中的定数不在新的选项中，重置为"全部定数"
  if (constantRangeIndex.value > 0 && constantRangeIndex.value >= options.length) {
    constantRangeIndex.value = 0
  }

  console.log('生成定数范围选项，共', constants.length, '个定数值')
}

// 筛选后的歌曲
const filteredSongs = computed(() => {
  let filtered = [...songsData.value]

  // 曲包筛选
  if (packIndex.value > 0) {
    const selectedPack = packOptions.value[packIndex.value]
    filtered = filtered.filter(song =>
      song.pack === selectedPack ||
      song.pack.toLowerCase() === selectedPack.toLowerCase()
    )
  }

  // 文本搜索
  if (searchText.value.trim()) {
    const searchLower = searchText.value.toLowerCase()
    filtered = filtered.filter(song =>
      song.name.toLowerCase().includes(searchLower) ||
      (song.artist && song.artist.toLowerCase().includes(searchLower))
    )
  }

  // 定数值筛选（精确匹配0.1精度）
  const selectedConstant = constantRangeOptions.value[constantRangeIndex.value]?.value
  if (selectedConstant !== null) {
    filtered = filtered.filter(song => {
      const difficulties = ['pst', 'prs', 'ftr', 'byd', 'etr']
      return difficulties.some(diff => {
        const constant = song[diff]
        return constant !== null &&
               constant !== undefined &&
               Math.abs(constant - selectedConstant) < 0.001
      })
    })
  }

  return filtered
})

// 页面加载时获取数据
onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options as any
  
  if (options && options.from) {
    fromPage.value = options.from
  }
  
  loadSongs()
})

// 加载歌曲数据
const loadSongs = async () => {
  if (loading.value) return
  loading.value = true

  try {
    // 从本地存储加载歌曲数据
    const localSongs = loadSongsDataFromStorage()

    if (localSongs && localSongs.length > 0) {
      // 检查本地存储的歌曲数量是否完整（新数据应该有1000+首）
      if (localSongs.length < 800) {
        console.log('本地存储的歌曲数据不完整，只有', localSongs.length, '首，重新加载完整数据')
        await loadCompleteSongsData()
      } else {
        songsData.value = localSongs
        // 提取曲包列表
        extractPackList(localSongs)
        // 生成定数范围选项
        generateConstantRangeOptions()
        console.log('从本地存储加载歌曲数据，共', localSongs.length, '首歌曲')
      }
    } else {
      // 本地没有数据，直接加载完整歌曲数据
      console.log('本地没有数据，直接加载完整歌曲数据')
      await loadCompleteSongsData()
    }
  } catch (e) {
    console.error('加载歌曲数据失败', e)
    await loadCompleteSongsData()
  } finally {
    loading.value = false
  }
}

// 加载完整的歌曲数据
const loadCompleteSongsData = async () => {
  try {
    const songsArray = await fetchSongsFromAPI()
    songsData.value = songsArray
    // 提取所有曲包列表（去重）
    extractPackList(songsArray)
    // 生成定数范围选项
    generateConstantRangeOptions()
    // 保存到本地存储
    try {
      uni.setStorageSync('songs_data', songsArray)
      console.log('加载完整歌曲数据成功，共', songsArray.length, '首歌曲')
    } catch (storageErr) {
      console.error('存储数据失败:', storageErr)
    }
  } catch (e) {
    console.error('加载歌曲常量失败:', e)
  }
}

// 提取所有曲包列表（去重）
const extractPackList = (songs: any[]) => {
  const packSet = new Set<string>()
  songs.forEach(song => {
    if (song.pack) {
      packSet.add(song.pack)
    }
  })
  const packArray = Array.from(packSet).sort()
  packOptions.value = ['全部曲包', ...packArray]
  console.log('提取曲包列表成功，共', packArray.length, '个曲包')
}



// 搜索输入变化
const onSearchInput = () => {
  // 实时搜索，这里不需要额外操作
}

// 搜索
const search = () => {
  // 搜索逻辑已经在computed中实现
  console.log('搜索歌曲:', searchText.value)
}

// 定数范围选择变化
const onConstantRangeChange = (e: any) => {
  constantRangeIndex.value = e.detail.value
}

// 曲包选择变化
const onPackChange = (e: any) => {
  packIndex.value = e.detail.value
  // 重新生成定数范围选项
  generateConstantRangeOptions()
  // 重置定数选择为"全部定数"
  constantRangeIndex.value = 0
}

// 重置筛选条件
const resetFilters = () => {
  searchText.value = ''
  packIndex.value = 0
  constantRangeIndex.value = 0
}

// 获取可用难度
const getAvailableDifficulties = (song: any) => {
  const difficulties = {
    pst: { name: 'PST', constant: song.pst },
    prs: { name: 'PRS', constant: song.prs },
    ftr: { name: 'FTR', constant: song.ftr },
    byd: { name: 'BYD', constant: song.byd },
    etr: { name: 'ETR', constant: song.etr }
  }
  
  // 过滤掉不存在的难度
  const available: any = {}
  for (const key in difficulties) {
    if (difficulties[key].constant !== null && difficulties[key].constant !== undefined) {
      available[key] = difficulties[key]
    }
  }
  
  return available
}

// 选择歌曲（显示详情）
const selectSong = (song: any) => {
  // 跳转到歌曲详情页面
  uni.navigateTo({
    url: `/pages/songs/song-detail?songId=${song.id}`
  })
}

// 选择特定难度的歌曲（直接跳转到容错计算）
const selectSongWithDifficulty = (song: any, difficulty: string) => {
  // 转换为SimpleSongData格式
  const simpleSong = {
    id: song.id,
    name: song.name,
    artist: song.artist,
    pack: song.pack,
    dl: song.dl,
    alias: song.alias || [],
    [difficulty]: song[difficulty],
    [`${difficulty}Notes`]: song[`${difficulty}Notes`]
  }
  
  // 保存到本地存储
  uni.setStorageSync('selected_song_for_tolerance', {
    song: simpleSong,
    difficulty: difficulty
  })
  
  // 跳转到容错计算页面
  uni.navigateTo({
    url: '/pages/calculator/tolerance?from=songs'
  })
}

// 返回来源页面
const navigateBackToSource = (selectedSong: any) => {
  // 保存到本地存储，确保页面返回时可以获取到最新数据
  uni.setStorageSync('recent_song', selectedSong)
  
  if (fromPage.value === 'calculator') {
    // 返回到计算器页面，并传递选中的歌曲信息
    uni.navigateBack()
    
    // 使用延时确保页面已经显示后再触发事件
    setTimeout(() => {
      uni.$emit('songSelected', selectedSong)
    }, 100)
  } else if (fromPage.value === 'tolerance') {
    // 返回到容错计算页面
    uni.navigateBack()
    
    // 使用延时确保页面已经显示后再触发事件
    setTimeout(() => {
      uni.$emit('songSelected', selectedSong)
    }, 100)
  } else if (fromPage.value === 'add') {
    // 返回到添加成绩页面
    uni.navigateBack()
    
    // 使用延时确保页面已经显示后再触发事件
    setTimeout(() => {
      uni.$emit('songSelected', selectedSong)
    }, 100)
  } else {
    // 默认返回上一页
    uni.navigateBack()
  }
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

.search-bar {
  display: flex;
  margin-bottom: 20rpx;
}

.search-input {
  flex: 1;
  height: 80rpx;
  background: #f8f9fa;
  border-radius: 16rpx 0 0 16rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.search-btn {
  width: 120rpx;
  height: 80rpx;
  background: #667eea;
  color: white;
  border-radius: 0 16rpx 16rpx 0;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.filter-row {
  display: flex;
  gap: 20rpx;
}

.filter-item {
  flex: 1;
}

.filter-item.full-width {
  width: 100%;
}

.filter-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.picker {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 15rpx 20rpx;
  display: flex;
  align-items: center;
}

.picker-text {
  font-size: 26rpx;
  color: #333;
}

.card-header {
  margin-bottom: 20rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.songs-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.song-item {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
}

.song-info {
  margin-bottom: 16rpx;
}

.song-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 4rpx;
  display: block;
}

.song-artist {
  font-size: 24rpx;
  color: #666;
}

.song-difficulties {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.difficulty-item {
  padding: 12rpx 16rpx;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80rpx;
}

.difficulty-name {
  font-size: 24rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 4rpx;
}

.difficulty-constant {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.difficulty-pst {
  background: #4caf50;
}

.difficulty-prs {
  background: #2196f3;
}

.difficulty-ftr {
  background: #ff9800;
}

.difficulty-byd {
  background: #f44336;
}

.difficulty-etr {
  background: #9c27b0;
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
  text-align: center;
}

.reset-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 40rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  border: none;
}
</style>