<template>
  <view class="container">
    <!-- 容错类型选择 -->
    <view class="card mode-selector-card">
      <view class="card-header">
        <text class="card-title">容错类型</text>
      </view>
      <view class="mode-selector">
        <view 
          class="mode-item" 
          :class="{ active: mode === 'rating' }"
          @click="switchMode('rating')"
        >
          <text class="mode-icon">🏆</text>
          <text class="mode-text">评级容错</text>
          <view class="mode-indicator"></view>
        </view>
        <view 
          class="mode-item" 
          :class="{ active: mode === 'score' }"
          @click="switchMode('score')"
        >
          <text class="mode-icon">🎯</text>
          <text class="mode-text">分数容错</text>
          <view class="mode-indicator"></view>
        </view>
        <view 
          class="mode-item" 
          :class="{ active: mode === 'ptt' }"
          @click="switchMode('ptt')"
        >
          <text class="mode-icon">📊</text>
          <text class="mode-text">PTT容错</text>
          <view class="mode-indicator"></view>
        </view>
      </view>
    </view>
    
    <!-- 容错计算方式选择 -->
    <view class="card tolerance-mode-selector">
      <view class="card-header">
        <text class="card-title">容错计算方式</text>
        <view class="info-icon">ℹ️</view>
      </view>
      <view class="mode-selector">
        <view 
          class="mode-item" 
          :class="{ active: toleranceMode === 'current' }"
          @click="switchToleranceMode('current')"
        >
          <text class="mode-icon">📝</text>
          <text class="mode-text">基于当前判定</text>
          <view class="mode-indicator"></view>
        </view>
        <view 
          class="mode-item" 
          :class="{ active: toleranceMode === 'theoretical' }"
          @click="switchToleranceMode('theoretical')"
        >
          <text class="mode-icon">🔢</text>
          <text class="mode-text">基于理论值</text>
          <view class="mode-indicator"></view>
        </view>
      </view>
      <view class="mode-description">
        <view class="description-card" v-if="toleranceMode === 'current'">
          <view class="description-icon">💡</view>
          <text class="description-text">
            基于当前Pure/Far/Lost数量计算还能容错多少判定
          </text>
        </view>
        <view v-else>
          <view class="description-card">
            <view class="description-icon">📐</view>
            <text class="description-text">
              基于理论满分(10,000,000 + Note总数)到目标的误差计算
            </text>
          </view>
          <view class="display-mode-selector">
            <text class="selector-label">显示方式：</text>
            <view class="mode-selector-small">
              <view 
                class="mode-item-small" 
                :class="{ active: toleranceDisplayMode === 'far' }"
                @click="switchDisplayMode('far')"
              >
                <text class="mode-text-small">显示可容错Far数</text>
              </view>
              <view 
                class="mode-item-small" 
                :class="{ active: toleranceDisplayMode === 'lost' }"
                @click="switchDisplayMode('lost')"
              >
                <text class="mode-text-small">显示可容错Lost数</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 歌曲选择区域 -->
    <view class="card song-selector">
      <view class="card-header">
        <text class="card-title">选择歌曲</text>
        <view class="song-count" v-if="selectedSong.name">1</view>
      </view>
      <view class="song-info" @click="goToSongList">
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
    </view>

    <!-- 容错计算表单 -->
    <view class="card tolerance-form">
      <view class="card-header">
        <text class="card-title">{{ getFormTitle() }}</text>
      </view>
      
      <!-- 评级容错 -->
      <view v-if="mode === 'rating'">
        <view class="form-item">
          <text class="form-label">选择评级</text>
          <picker 
            :range="ratingOptions" 
            range-key="name"
            :value="ratingIndex"
            @change="onRatingChange"
            class="picker"
          >
            <view class="picker-text">
              {{ ratingOptions[ratingIndex].name }}
            </view>
          </picker>
        </view>
        <template v-if="toleranceMode === 'current'">
          <view class="form-item">
            <text class="form-label">Pure数量</text>
            <input 
              class="form-input" 
              type="number" 
              v-model="pureCount" 
              placeholder="0-1000"
            />
          </view>
          <view class="form-item">
            <text class="form-label">Far数量</text>
            <input 
              class="form-input" 
              type="number" 
              v-model="farCount" 
              placeholder="0-1000"
            />
          </view>
          <view class="form-item">
            <text class="form-label">Lost数量</text>
            <input 
              class="form-input" 
              type="number" 
              v-model="lostCount" 
              placeholder="0-1000"
            />
          </view>
          <view class="form-item">
            <text class="form-label">大Pure数量（可选）</text>
            <input 
              class="form-input" 
              type="number" 
              v-model="bigPureCount" 
              placeholder="每个大Pure额外+1分"
            />
          </view>
        </template>
        <view v-else class="form-item">
          <text class="form-tip">
            基于理论值计算容错不需要输入判定数量，将直接从理论满分(10,000,000 + Note总数)计算
          </text>
        </view>
        <view class="form-item">
          <text class="form-label">谱面Note总量</text>
          <input 
            class="form-input" 
            type="number" 
            v-model="totalNotes" 
            placeholder="歌曲的总Note数量（例如：1200）"
          />
          <text class="form-hint">提示：可以在游戏结果界面查看谱面Note数量</text>
        </view>
      </view>
      
      <!-- 分数容错 -->
      <view v-if="mode === 'score'">
        <view class="form-item">
          <text class="form-label">目标分数 (0-10,000,000)</text>
          <input 
            class="form-input" 
            type="number" 
            v-model="targetScore" 
            placeholder="例如: 9900000"
          />
        </view>
        <template v-if="toleranceMode === 'current'">
          <view class="form-item">
            <text class="form-label">当前Pure数量</text>
            <input 
              class="form-input" 
              type="number" 
              v-model="currentPure" 
              placeholder="0-1000"
            />
          </view>
          <view class="form-item">
            <text class="form-label">Far数量</text>
            <input 
              class="form-input" 
              type="number" 
              v-model="farCount" 
              placeholder="0-1000"
            />
          </view>
          <view class="form-item">
            <text class="form-label">Lost数量</text>
            <input 
              class="form-input" 
              type="number" 
              v-model="lostCount" 
              placeholder="0-1000"
            />
          </view>
          <view class="form-item">
            <text class="form-label">大Pure数量（可选）</text>
            <input 
              class="form-input" 
              type="number" 
              v-model="bigPureCount" 
              placeholder="每个大Pure额外+1分"
            />
          </view>
        </template>
        <view v-else class="form-item">
          <text class="form-tip">
            基于理论值计算容错不需要输入判定数量，将直接从理论满分(10,000,000 + Note总数)计算
          </text>
        </view>
        <view class="form-item">
          <text class="form-label">谱面Note总量</text>
          <input 
            class="form-input" 
            type="number" 
            v-model="totalNotes" 
            placeholder="歌曲的总Note数量（例如：1200）"
          />
          <text class="form-hint">提示：可以在游戏结果界面查看谱面Note数量</text>
        </view>
      </view>
      
      <!-- PTT容错 -->
      <view v-if="mode === 'ptt'">
        <view class="form-item">
          <text class="form-label">目标PTT</text>
          <input 
            class="form-input" 
            type="digit" 
            v-model="targetPtt" 
            placeholder="例如: 12.50"
          />
        </view>
        <template v-if="toleranceMode === 'current'">
          <view class="form-item">
            <text class="form-label">当前Pure数量</text>
            <input 
              class="form-input" 
              type="number" 
              v-model="pureCount" 
              placeholder="0-1000"
            />
          </view>
          <view class="form-item">
            <text class="form-label">Far数量</text>
            <input 
              class="form-input" 
              type="number" 
              v-model="farCount" 
              placeholder="0-1000"
            />
          </view>
          <view class="form-item">
            <text class="form-label">Lost数量</text>
            <input 
              class="form-input" 
              type="number" 
              v-model="lostCount" 
              placeholder="0-1000"
            />
          </view>
          <view class="form-item">
            <text class="form-label">大Pure数量（可选）</text>
            <input 
              class="form-input" 
              type="number" 
              v-model="bigPureCount" 
              placeholder="每个大Pure额外+1分"
            />
          </view>
        </template>
        <view v-else class="form-item">
          <text class="form-tip">
            基于理论值计算容错不需要输入判定数量，将直接从理论满分(10,000,000 + Note总数)计算
          </text>
        </view>
        <view class="form-item">
          <text class="form-label">谱面Note总量</text>
          <input 
            class="form-input" 
            type="number" 
            v-model="totalNotes" 
            placeholder="歌曲的总Note数量（例如：1200）"
          />
          <text class="form-hint">提示：可以在游戏结果界面查看谱面Note数量</text>
        </view>
      </view>
      
      <!-- 计算按钮 -->
      <button 
        class="calculate-btn" 
        @click="calculate"
        :disabled="!canCalculate"
      >
        计算容错
      </button>
    </view>

    <!-- 计算结果 -->
    <view class="card result-card" v-if="result">
      <view class="card-header">
        <text class="card-title">容错结果</text>
        <view class="result-status" :class="result.canAchieve ? 'success' : 'failed'">
          <text class="status-icon">{{ result.canAchieve ? '✓' : '✗' }}</text>
        </view>
      </view>
      
      <!-- 评级容错结果 -->
      <view v-if="mode === 'rating'" class="result-content">
        <view class="result-item primary">
          <view class="result-icon">🏆</view>
          <view class="result-content">
            <text class="result-label">评级</text>
            <text class="result-value rating" :class="getRatingClass(ratingOptions[ratingIndex].name)">
              {{ ratingOptions[ratingIndex].name }}
            </text>
          </view>
        </view>
        <view class="result-item">
          <view class="result-icon">📊</view>
          <view class="result-content">
            <text class="result-label">{{ toleranceMode === 'current' ? '当前分数' : '理论满分' }}</text>
            <text class="result-value">{{ result.currentScore.toLocaleString() }}</text>
          </view>
        </view>
        <view class="result-item">
          <view class="result-icon">🎯</view>
          <view class="result-content">
            <text class="result-label">目标分数</text>
            <text class="result-value">{{ result.minScore.toLocaleString() }}</text>
          </view>
        </view>
        <view class="result-item highlight" v-if="result.canAchieve && (toleranceMode === 'current' || toleranceDisplayMode === 'far')">
          <view class="result-icon">⚡</view>
          <view class="result-content">
            <text class="result-label">{{ toleranceMode === 'current' ? '最大Far数量' : '可容错Far数' }}</text>
            <text class="result-value highlight">{{ result.maxFarCount }}</text>
          </view>
        </view>
        <view class="result-item" v-if="result.canAchieve && (toleranceMode === 'current' || toleranceDisplayMode === 'lost')">
          <view class="result-icon">💔</view>
          <view class="result-content">
            <text class="result-label">{{ toleranceMode === 'current' ? '最大Lost数量' : '可容错Lost数' }}</text>
            <text class="result-value">{{ result.maxLostCount }}</text>
          </view>
        </view>
        <view class="result-item" v-if="toleranceMode === 'current'">
          <view class="result-icon">🏁</view>
          <view class="result-content">
            <text class="result-label">是否达成</text>
            <text class="result-value" :class="result.canAchieve ? 'success' : 'failed'">
              {{ result.canAchieve ? '已达成' : '未达成' }}
            </text>
          </view>
        </view>
        <view class="result-item warning" v-if="toleranceMode === 'current' && !result.canAchieve">
          <view class="result-icon">⚠️</view>
          <view class="result-content">
            <text class="result-label">提示</text>
            <text class="result-value warning-text">
              当前判定数已无法达成目标
            </text>
          </view>
        </view>
        <view class="result-item warning" v-if="toleranceMode === 'current' && !result.canAchieve && result.theoreticalMaxScore">
          <view class="result-icon">⚠️</view>
          <view class="result-content">
            <text class="result-label">理论最高分</text>
            <text class="result-value warning-text">
              {{ Math.round(result.theoreticalMaxScore).toLocaleString() }}分
            </text>
          </view>
        </view>
        <view class="result-item" v-else>
          <view class="result-icon">🔢</view>
          <view class="result-content">
            <text class="result-label">计算方式</text>
            <text class="result-value">基于理论满分</text>
          </view>
        </view>
      </view>
      
      <!-- 分数容错结果 -->
      <view v-if="mode === 'score'" class="result-content">
        <view class="result-item primary">
          <view class="result-icon">🎯</view>
          <view class="result-content">
            <text class="result-label">目标分数</text>
            <text class="result-value">{{ result.targetScore.toLocaleString() }}</text>
          </view>
        </view>
        <view class="result-item">
          <view class="result-icon">📊</view>
          <view class="result-content">
            <text class="result-label">{{ toleranceMode === 'current' ? '当前分数' : '理论满分' }}</text>
            <text class="result-value">{{ result.currentScore.toLocaleString() }}</text>
          </view>
        </view>
        <view class="result-item highlight">
          <view class="result-icon">📈</view>
          <view class="result-content">
            <text class="result-label">{{ toleranceMode === 'current' ? '差距' : '误差范围' }}</text>
            <text class="result-value highlight">{{ Math.abs(result.scoreGap).toLocaleString() }}</text>
          </view>
        </view>
        <view class="result-item highlight" v-if="result.canAchieve && (toleranceMode === 'current' || toleranceDisplayMode === 'far')">
          <view class="result-icon">⚡</view>
          <view class="result-content">
            <text class="result-label">{{ toleranceMode === 'current' ? '可Far数量' : '可容错Far数' }}</text>
            <text class="result-value highlight">{{ result.tolerableFar }}</text>
          </view>
        </view>
        <view class="result-item" v-if="result.canAchieve && (toleranceMode === 'current' || toleranceDisplayMode === 'lost')">
          <view class="result-icon">💔</view>
          <view class="result-content">
            <text class="result-label">{{ toleranceMode === 'current' ? '可Lost数量' : '可容错Lost数' }}</text>
            <text class="result-value">{{ result.tolerableLost }}</text>
          </view>
        </view>
        <view class="result-item" v-if="toleranceMode === 'current'">
          <view class="result-icon">🏁</view>
          <view class="result-content">
            <text class="result-label">是否达成</text>
            <text class="result-value" :class="result.canAchieve ? 'success' : 'failed'">
              {{ result.canAchieve ? '已达成' : '未达成' }}
            </text>
          </view>
        </view>
        <view class="result-item warning" v-if="toleranceMode === 'current' && !result.canAchieve">
          <view class="result-icon">⚠️</view>
          <view class="result-content">
            <text class="result-label">提示</text>
            <text class="result-value warning-text">
              当前判定数已无法达成目标
            </text>
          </view>
        </view>
        <view class="result-item warning" v-if="toleranceMode === 'current' && !result.canAchieve && result.theoreticalMaxScore">
          <view class="result-icon">⚠️</view>
          <view class="result-content">
            <text class="result-label">理论最高分</text>
            <text class="result-value warning-text">
              {{ Math.round(result.theoreticalMaxScore).toLocaleString() }}分
            </text>
          </view>
        </view>
        <view class="result-item" v-else>
          <view class="result-icon">🔢</view>
          <view class="result-content">
            <text class="result-label">计算方式</text>
            <text class="result-value">基于理论满分</text>
          </view>
        </view>
      </view>
      
      <!-- PTT容错结果 -->
      <view v-if="mode === 'ptt'" class="result-content">
        <view class="result-item primary">
          <view class="result-icon">⭐</view>
          <view class="result-content">
            <text class="result-label">目标PTT</text>
            <text class="result-value">{{ result.targetPtt.toFixed(2) }}</text>
          </view>
        </view>
        <view class="result-item">
          <view class="result-icon">📊</view>
          <view class="result-content">
            <text class="result-label">{{ toleranceMode === 'current' ? '当前PTT' : '理论最大PTT' }}</text>
            <text class="result-value">{{ result.currentPtt.toFixed(2) }}</text>
          </view>
        </view>
        <view class="result-item highlight">
          <view class="result-icon">📈</view>
          <view class="result-content">
            <text class="result-label">{{ toleranceMode === 'current' ? 'PTT差距' : 'PTT误差' }}</text>
            <text class="result-value highlight">{{ Math.abs(result.pttGap).toFixed(2) }}</text>
          </view>
        </view>
        <view class="result-item highlight" v-if="result.canAchieve && (toleranceMode === 'current' || toleranceDisplayMode === 'far')">
          <view class="result-icon">⚡</view>
          <view class="result-content">
            <text class="result-label">{{ toleranceMode === 'current' ? '可Far数量' : '可容错Far数' }}</text>
            <text class="result-value highlight">{{ result.tolerableFar }}</text>
          </view>
        </view>
        <view class="result-item" v-if="result.canAchieve && (toleranceMode === 'current' || toleranceDisplayMode === 'lost')">
          <view class="result-icon">💔</view>
          <view class="result-content">
            <text class="result-label">{{ toleranceMode === 'current' ? '可Lost数量' : '可容错Lost数' }}</text>
            <text class="result-value">{{ result.tolerableLost }}</text>
          </view>
        </view>
        <view class="result-item" v-if="toleranceMode === 'current'">
          <view class="result-icon">🏁</view>
          <view class="result-content">
            <text class="result-label">是否达成</text>
            <text class="result-value" :class="result.canAchieve ? 'success' : 'failed'">
              {{ result.canAchieve ? '已达成' : '未达成' }}
            </text>
          </view>
        </view>
        <view class="result-item warning" v-if="toleranceMode === 'current' && !result.canAchieve">
          <view class="result-icon">⚠️</view>
          <view class="result-content">
            <text class="result-label">提示</text>
            <text class="result-value warning-text">
              当前判定数已无法达成目标
            </text>
          </view>
        </view>
        <view class="result-item warning" v-if="toleranceMode === 'current' && !result.canAchieve && result.theoreticalMaxScore">
          <view class="result-icon">⚠️</view>
          <view class="result-content">
            <text class="result-label">理论最高分</text>
            <text class="result-value warning-text">
              {{ Math.round(result.theoreticalMaxScore).toLocaleString() }}分
            </text>
          </view>
        </view>
        <view class="result-item" v-else>
          <view class="result-icon">🔢</view>
          <view class="result-content">
            <text class="result-label">计算方式</text>
            <text class="result-value">基于理论满分</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 容错说明 -->
    <view class="card formula-card">
      <view class="card-header">
        <text class="card-title">容错计算说明</text>
      </view>
      <view class="explanation">
        <text class="explanation-text">
          容错计算基于Arcaea的真实评分系统：
        </text>
        <view class="calculation-tips">
          <text class="tip-title">基本分计算：</text>
          <text class="tip-item">• 单个Note分数 = 10,000,000 ÷ 谱面Note总量</text>
          <text class="tip-item">• Pure获得完整分数，Far获得一半分数，Lost不得分</text>
          <text class="tip-item">• 基本分 = Pure数量×单Note分 + Far数量×(单Note分÷2)</text>
          
          <text class="tip-title">判定附加分：</text>
          <text class="tip-item">• 每个大Pure额外加1分，其他判定不加分</text>
          <text class="tip-item">• 附加分无上限，理论满分 = 10,000,000 + 谱面Note总量</text>
          <text class="tip-item">• 注意：PTT计算中，分数达到10,000,000后PTT固定为定数+2.0</text>
          
          <text class="tip-title">容错计算方式：</text>
          <text class="tip-item">• 基于当前判定：根据当前Pure/Far/Lost数量计算还能容错多少</text>
          <text class="tip-item">• 基于理论值：从理论满分(10,000,000+Note总数)到目标的误差计算</text>
          
          <text class="tip-title">容错计算：</text>
          <text class="tip-item">• 根据目标评级/分数/PTT计算所需最低分数</text>
          <text class="tip-item">• 每个Far可换算为(单Note分÷2)的容错空间</text>
          <text class="tip-item">• 每个Lost可换算为单Note分的容错空间</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onPageShow } from '@dcloudio/uni-app'
// getNotesBySongName 已删除，不再使用
// song-id-map 已删除，不再使用

// 容错模式
const mode = ref<'rating' | 'score' | 'ptt'>('rating')

// 容错计算方式
const toleranceMode = ref<'current' | 'theoretical'>('current')

// 容错显示方式（基于理论值时使用）
const toleranceDisplayMode = ref<'far' | 'lost'>('far')

// 选中的歌曲
const selectedSong = ref<any>({})

// 评级选项
const ratingOptions = [
  { name: 'PM', minScore: 10000000 },
  { name: 'EX+', minScore: 9900000 },
  { name: 'EX', minScore: 9800000 },
  { name: 'AA', minScore: 9500000 },
  { name: 'A', minScore: 9200000 },
  { name: 'B', minScore: 8900000 },
  { name: 'C', minScore: 8600000 },
  { name: 'D', minScore: 0 }
]
const ratingIndex = ref(1) // 默认选择EX+

// 输入值
const pureCount = ref('1000')
const farCount = ref('0')
const lostCount = ref('0')
const bigPureCount = ref('0')
const totalNotes = ref('1200')
const targetScore = ref('')
const currentPure = ref('')
const targetPtt = ref('')
// currentPttPure 已移除，使用 pureCount 代替

// 计算结果
const result = ref<any>(null)

// 是否可以计算
const canCalculate = computed(() => {
  if (!selectedSong.value.constant) return false
  
  // 基于理论值模式只需要基本参数
  if (toleranceMode.value === 'theoretical') {
    if (mode.value === 'rating') {
      return true  // 评级容错只需要歌曲和评级选择
    } else if (mode.value === 'score') {
      return targetScore.value !== '' && !isNaN(parseInt(targetScore.value))
    } else if (mode.value === 'ptt') {
      return targetPtt.value !== '' && !isNaN(parseFloat(targetPtt.value))
    }
    return false
  }
  
  // 基于当前判定模式需要所有判定参数
  if (mode.value === 'rating') {
    return pureCount.value !== '' && !isNaN(parseInt(pureCount.value))
  } else if (mode.value === 'score') {
    return targetScore.value !== '' && 
           currentPure.value !== '' && 
           !isNaN(parseInt(targetScore.value)) && 
           !isNaN(parseInt(currentPure.value))
  } else if (mode.value === 'ptt') {
    return targetPtt.value !== '' && 
           pureCount.value !== '' && 
           !isNaN(parseFloat(targetPtt.value)) && 
           !isNaN(parseInt(pureCount.value))
  }
  
  return false
})

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
    console.log('收到歌曲选择事件:', selectedSongData)
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

// 页面卸载时移除事件监听
onUnmounted(() => {
  uni.$off('songSelected')
})

// 切换模式
const switchMode = (newMode: 'rating' | 'score' | 'ptt') => {
  mode.value = newMode
  result.value = null
}

// 切换容错计算方式
const switchToleranceMode = (newMode: 'current' | 'theoretical') => {
  toleranceMode.value = newMode
  result.value = null
}

// 切换容错显示方式
const switchDisplayMode = (newMode: 'far' | 'lost') => {
  toleranceDisplayMode.value = newMode
  result.value = null
}

// 跳转到歌曲列表
const goToSongList = () => {
  uni.navigateTo({
    url: '/pages/songs/songs?from=tolerance'
  })
}

// 获取表单标题
const getFormTitle = () => {
  const titleMap = {
    'rating': '评级容错计算',
    'score': '分数容错计算',
    'ptt': 'PTT容错计算'
  }
  return titleMap[mode.value]
}

// 评级选择变化
const onRatingChange = (e: any) => {
  ratingIndex.value = e.detail.value
}

// 计算容错
const calculate = () => {
  const notes = parseInt(totalNotes.value) || 1200
  
  if (toleranceMode.value === 'theoretical') {
    // 基于理论值的容错计算
    calculateTheoreticalTolerance(notes)
    return
  }
  
  if (mode.value === 'rating') {
    // 评级容错计算
    const pure = parseInt(pureCount.value) || 0
    const far = parseInt(farCount.value) || 0
    const lost = parseInt(lostCount.value) || 0
    const bigPure = parseInt(bigPureCount.value) || 0
    const targetRating = ratingOptions[ratingIndex.value]
    
    // 使用正确的评分系统计算
    const baseScorePerNote = 10000000 / notes
    const baseScore = pure * baseScorePerNote + far * (baseScorePerNote / 2)
    const bonusScore = bigPure // 每个大Pure额外+1分
    const currentScore = Math.floor(baseScore + bonusScore)
    
    // 计算达成目标评级所需的最多容错
    const targetScore = targetRating.minScore
    const scoreGap = currentScore - targetScore
    
    if (scoreGap >= 0) {
      // 已经达成目标，计算可以额外容错的判定数
      const maxAdditionalFar = Math.floor(scoreGap / (baseScorePerNote / 2))
      const maxAdditionalLost = Math.floor((scoreGap - maxAdditionalFar * (baseScorePerNote / 2)) / baseScorePerNote)
      
      // 检查容错数是否超过剩余Note数
      const remainingNotes = notes - pure - far - lost
      const finalMaxLost = Math.min(maxAdditionalLost, remainingNotes)
      // 计算剩余的分数空间能容纳多少Far（在已经计入Lost后）
      const remainingScore = scoreGap - finalMaxLost * baseScorePerNote
      const additionalFar = Math.floor(remainingScore / (baseScorePerNote / 2))
      const finalMaxFar = far + additionalFar
      
      result.value = {
        minScore: targetScore,
        maxScore: currentScore,
        maxFarCount: finalMaxFar,
        maxLostCount: finalMaxLost,
        currentScore,
        canAchieve: true
      }
    } else {
      // 未达成目标，正确计算剩余Note数是否能达成目标
      const neededScore = -scoreGap
      const remainingNotes = notes - pure - far - lost
      
      // 计算剩余Note全P能获得的最大分数
      const maxPossibleScore = currentScore + remainingNotes * baseScorePerNote
      
      if (maxPossibleScore < targetScore) {
        // 即使剩余Note全P也无法达成目标
        // 计算理论最高分数（剩余判定全为大Pure）
        const theoreticalMaxScore = currentScore + remainingNotes * baseScorePerNote + remainingNotes

        result.value = {
          minScore: targetScore,
          maxScore: theoreticalMaxScore,
          currentScore,
          maxFarCount: far,
          maxLostCount: lost,
          canAchieve: false,
          remainingNotes,
          theoreticalMaxScore
        }
      } else {
        // 剩余Note全P可以达成目标，计算具体容错数
        // 计算需要多少个未判定Note转为Pure才能达成目标
        const neededPureCount = Math.ceil(neededScore / baseScorePerNote)
        
        // 剩余Note中还可以容忍多少Far（这些Far代替Pure）
        const remainingAfterNeededPure = remainingNotes - neededPureCount
        const tolerableFar = far + remainingAfterNeededPure
        
        // 剩余Note中还可以容忍多少Lost（这些Lost代替Pure）
        const tolerableLost = lost + Math.floor(remainingAfterNeededPure / 2)
        
        result.value = {
          minScore: targetScore,
          maxScore: currentScore,
          maxFarCount: tolerableFar,
          maxLostCount: tolerableLost,
          currentScore,
          canAchieve: false
        }
      }
    }
    
  } else if (mode.value === 'score') {
    // 分数容错计算
    const target = parseInt(targetScore.value) || 0
    const pure = parseInt(currentPure.value) || 0
    const far = parseInt(farCount.value) || 0
    const lost = parseInt(lostCount.value) || 0
    const bigPure = parseInt(bigPureCount.value) || 0
    
    // 使用正确的评分系统计算
    const baseScorePerNote = 10000000 / notes
    const baseScore = pure * baseScorePerNote + far * (baseScorePerNote / 2)
    const bonusScore = bigPure // 每个大Pure额外+1分
    const currentScore = Math.floor(baseScore + bonusScore)
    
    const scoreGap = currentScore - target
    
    if (scoreGap >= 0) {
      // 已经达成目标，计算可以额外容错的判定数
      const maxAdditionalFar = Math.floor(scoreGap / (baseScorePerNote / 2))
      const maxAdditionalLost = Math.floor((scoreGap - maxAdditionalFar * (baseScorePerNote / 2)) / baseScorePerNote)
      
      // 检查容错数是否超过剩余Note数
      const remainingNotes = notes - pure - far - lost
      const finalMaxLost = Math.min(maxAdditionalLost, remainingNotes)
      // 计算剩余的分数空间能容纳多少Far（在已经计入Lost后）
      const remainingScore = scoreGap - finalMaxLost * baseScorePerNote
      const additionalFar = Math.floor(remainingScore / (baseScorePerNote / 2))
      const finalMaxFar = far + additionalFar
      
      result.value = {
        targetScore: target,
        currentScore,
        scoreGap,
        tolerableFar: finalMaxFar,
        tolerableLost: finalMaxLost,
        canAchieve: true
      }
    } else {
      // 未达成目标，正确计算剩余Note数是否能达成目标
      const neededScore = -scoreGap
      const remainingNotes = notes - pure - far - lost
      
      // 计算剩余Note全P能获得的最大分数
      const maxPossibleScore = currentScore + remainingNotes * baseScorePerNote
      
      if (maxPossibleScore < target) {
        // 即使剩余Note全P也无法达成目标
        // 计算理论最高分数（剩余判定全为大Pure）
        const theoreticalMaxScore = currentScore + remainingNotes * baseScorePerNote + remainingNotes

        result.value = {
          targetScore: target,
          currentScore,
          scoreGap,
          theoreticalMaxScore,
          tolerableFar: far,
          tolerableLost: lost,
          canAchieve: false,
          remainingNotes
        }
      } else {
        // 剩余Note全P可以达成目标，计算具体容错数
        // 计算需要多少个未判定Note转为Pure才能达成目标
        const neededPureCount = Math.ceil(neededScore / baseScorePerNote)
        
        // 剩余Note中还可以容忍多少Far（这些Far代替Pure）
        const remainingAfterNeededPure = remainingNotes - neededPureCount
        const tolerableFar = far + remainingAfterNeededPure
        
        // 剩余Note中还可以容忍多少Lost（这些Lost代替Pure）
        const tolerableLost = lost + Math.floor(remainingAfterNeededPure / 2)
        
        result.value = {
          targetScore: target,
          currentScore,
          scoreGap,
          tolerableFar,
          tolerableLost,
          canAchieve: false
        }
      }
    }
    
  } else if (mode.value === 'ptt') {
    // PTT容错计算
    const target = parseFloat(targetPtt.value) || 0
    const pure = parseInt(pureCount.value) || 0
    const far = parseInt(farCount.value) || 0
    const lost = parseInt(lostCount.value) || 0
    const bigPure = parseInt(bigPureCount.value) || 0
    const constant = selectedSong.value.constant || 0
    
    // 计算目标分数
    let targetScore: number
    const targetPttAboveConstant = target - constant
    
    if (targetPttAboveConstant >= 2.0) {
      targetScore = 10000000
    } else if (targetPttAboveConstant >= 1.5) {
      targetScore = Math.floor(9900000 + (targetPttAboveConstant - 1.5) * 100000)
    } else if (targetPttAboveConstant >= 1.0) {
      targetScore = Math.floor(9800000 + (targetPttAboveConstant - 1.0) * 400000)
    } else if (targetPttAboveConstant >= 0) {
      targetScore = Math.floor(9500000 + targetPttAboveConstant * 300000)
    } else {
      targetScore = Math.floor(9500000 + targetPttAboveConstant * 300000)
    }
    
    // 使用正确的评分系统计算当前分数
    const baseScorePerNote = 10000000 / notes
    const baseScore = pure * baseScorePerNote + far * (baseScorePerNote / 2)
    const bonusScore = bigPure // 每个大Pure额外+1分
    const currentScore = Math.floor(baseScore + bonusScore)
    
    // 计算当前PTT
    let currentPtt: number
    if (currentScore >= 10000000) {
      currentPtt = constant + 2.0
    } else if (currentScore >= 9900000) {
      currentPtt = constant + 1.5 + (currentScore - 9900000) / 100000
    } else if (currentScore >= 9800000) {
      currentPtt = constant + 1.0 + (currentScore - 9800000) / 400000
    } else {
      currentPtt = constant + Math.max(0, (currentScore - 9500000) / 300000)
    }
    
    const scoreGap = currentScore - targetScore
    
    if (scoreGap >= 0) {
      // 已经达成目标，计算可以额外容错的判定数
      const maxAdditionalFar = Math.floor(scoreGap / (baseScorePerNote / 2))
      const maxAdditionalLost = Math.floor((scoreGap - maxAdditionalFar * (baseScorePerNote / 2)) / baseScorePerNote)
      
      // 检查容错数是否超过剩余Note数
      const remainingNotes = notes - pure - far - lost
      const finalMaxLost = Math.min(maxAdditionalLost, remainingNotes)
      // 计算剩余的分数空间能容纳多少Far（在已经计入Lost后）
      const remainingScore = scoreGap - finalMaxLost * baseScorePerNote
      const additionalFar = Math.floor(remainingScore / (baseScorePerNote / 2))
      const finalMaxFar = far + additionalFar
      
      result.value = {
        targetPtt: target,
        currentPtt,
        pttGap: currentPtt - target,
        tolerableFar: finalMaxFar,
        tolerableLost: finalMaxLost,
        canAchieve: true
      }
    } else {
      // 未达成目标，正确计算剩余Note数是否能达成目标
      const neededScore = -scoreGap
      const remainingNotes = notes - pure - far - lost
      
      // 计算剩余Note全P能获得的最大分数
      const maxPossibleScore = currentScore + remainingNotes * baseScorePerNote
      
      if (maxPossibleScore < targetScore) {
        // 即使剩余Note全P也无法达成目标
        // 计算理论最高分数（剩余判定全为大Pure）
        const theoreticalMaxScore = currentScore + remainingNotes * baseScorePerNote + remainingNotes

        // 计算理论最高PTT
        let theoreticalMaxPtt: number
        if (theoreticalMaxScore >= 10000000) {
          theoreticalMaxPtt = constant + 2.0
        } else if (theoreticalMaxScore >= 9900000) {
          theoreticalMaxPtt = constant + 1.5 + (theoreticalMaxScore - 9900000) / 100000
        } else if (theoreticalMaxScore >= 9800000) {
          theoreticalMaxPtt = constant + 1.0 + (theoreticalMaxScore - 9800000) / 400000
        } else {
          theoreticalMaxPtt = constant + Math.max(0, (theoreticalMaxScore - 9500000) / 300000)
        }

        result.value = {
          targetPtt: target,
          currentPtt,
          pttGap: currentPtt - target,
          theoreticalMaxScore,
          theoreticalMaxPtt,
          tolerableFar: far,
          tolerableLost: lost,
          canAchieve: false,
          remainingNotes
        }
      } else {
        // 剩余Note全P可以达成目标，计算具体容错数
        // 计算需要多少个未判定Note转为Pure才能达成目标
        const neededPureCount = Math.ceil(neededScore / baseScorePerNote)
        
        // 剩余Note中还可以容忍多少Far（这些Far代替Pure）
        const remainingAfterNeededPure = remainingNotes - neededPureCount
        const tolerableFar = far + remainingAfterNeededPure
        
        // 剩余Note中还可以容忍多少Lost（这些Lost代替Pure）
        const tolerableLost = lost + Math.floor(remainingAfterNeededPure / 2)
        
        result.value = {
          targetPtt: target,
          currentPtt,
          pttGap: currentPtt - target,
          tolerableFar,
          tolerableLost,
          canAchieve: false
        }
      }
    }
  }
}

// 基于理论值的容错计算
const calculateTheoreticalTolerance = (notes: number) => {
  const baseScorePerNote = 10000000 / notes
  const theoreticalMaxScore = 10000000 + notes  // 理论满分：1000万分 + Note总数
  
  if (mode.value === 'rating') {
    // 评级容错计算
    const targetRating = ratingOptions[ratingIndex.value]
    const targetScore = targetRating.minScore
    const scoreGap = theoreticalMaxScore - targetScore
    
    // 计算从理论满分到目标分数的容错
    let maxFarCount = 0
    let maxLostCount = 0
    
    if (toleranceDisplayMode.value === 'far') {
      // 计算可容错Far数（全部由Far代替Pure）
      maxFarCount = Math.floor(scoreGap / (baseScorePerNote / 2))
      maxLostCount = 0
    } else {
      // 计算可容错Lost数（全部由Lost代替Pure）
      maxLostCount = Math.floor(scoreGap / baseScorePerNote)
      maxFarCount = 0
    }
    
    result.value = {
      minScore: targetScore,
      maxScore: theoreticalMaxScore,
      maxFarCount,
      maxLostCount,
      currentScore: theoreticalMaxScore,
      canAchieve: true
    }
    
  } else if (mode.value === 'score') {
    // 分数容错计算
    const target = parseInt(targetScore.value) || 0
    const scoreGap = theoreticalMaxScore - target
    
    // 根据显示模式计算容错
    let tolerableFar = 0
    let tolerableLost = 0
    
    if (toleranceDisplayMode.value === 'far') {
      // 计算可容错Far数
      tolerableFar = Math.floor(scoreGap / (baseScorePerNote / 2))
      tolerableLost = 0
    } else {
      // 计算可容错Lost数
      tolerableLost = Math.floor(scoreGap / baseScorePerNote)
      tolerableFar = 0
    }
    
    result.value = {
      targetScore: target,
      currentScore: theoreticalMaxScore,
      scoreGap,
      tolerableFar,
      tolerableLost,
      canAchieve: true
    }
    
  } else if (mode.value === 'ptt') {
    // PTT容错计算
    const target = parseFloat(targetPtt.value) || 0
    const constant = selectedSong.value.constant || 0
    
    // 计算目标PTT对应的分数
    let targetScore: number
    const targetPttAboveConstant = target - constant
    
    if (targetPttAboveConstant >= 2.0) {
      targetScore = 10000000
    } else if (targetPttAboveConstant >= 1.5) {
      targetScore = Math.floor(9900000 + (targetPttAboveConstant - 1.5) * 100000)
    } else if (targetPttAboveConstant >= 1.0) {
      targetScore = Math.floor(9800000 + (targetPttAboveConstant - 1.0) * 400000)
    } else if (targetPttAboveConstant >= 0) {
      targetScore = Math.floor(9500000 + targetPttAboveConstant * 300000)
    } else {
      targetScore = Math.floor(9500000 + targetPttAboveConstant * 300000)
    }
    
    const scoreGap = theoreticalMaxScore - targetScore
    
    // 根据显示模式计算容错
    let tolerableFar = 0
    let tolerableLost = 0
    
    if (toleranceDisplayMode.value === 'far') {
      // 计算可容错Far数
      tolerableFar = Math.floor(scoreGap / (baseScorePerNote / 2))
      tolerableLost = 0
    } else {
      // 计算可容错Lost数
      tolerableLost = Math.floor(scoreGap / baseScorePerNote)
      tolerableFar = 0
    }
    
    result.value = {
      targetPtt: target,
      currentPtt: constant + 2.0,  // 理论满分对应的PTT
      pttGap: (constant + 2.0) - target,
      tolerableFar,
      tolerableLost,
      canAchieve: true
    }
  }
}

// 格式化分数范围
const formatScoreRange = (min: number, max: number) => {
  return `${min.toLocaleString()} - ${max.toLocaleString()}`
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
.card:nth-child(5) { animation-delay: 0.5s; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
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
  background: #f8f9fa;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  z-index: 1;
  box-shadow: inset 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scale(1.05);
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
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
  color: #666;
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

.form-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 88rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 0 30rpx;
  font-size: 32rpx;
  color: #333;
  box-sizing: border-box;
}

.form-hint {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
  display: block;
}

.picker {
  width: 100%;
  height: 88rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  box-sizing: border-box;
}

.picker-text {
  font-size: 32rpx;
  color: #333;
}

.calculate-btn {
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
  border: none;
}

.calculate-btn[disabled] {
  opacity: 0.5;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 24rpx;
}

.result-label {
  font-size: 28rpx;
  color: #666;
}

.result-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.result-value.highlight {
  color: #667eea;
  font-size: 36rpx;
}

.result-value.success {
  color: #43e97b;
  font-weight: bold;
}

.result-value.failed {
  color: #f44336;
  font-weight: bold;
}

.result-item.warning {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%);
  border: 2rpx solid #ffc107;
}

.result-value.warning-text {
  color: #856404;
  font-size: 32rpx;
  font-weight: bold;
}

.rating {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
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

.explanation {
  font-size: 26rpx;
  line-height: 1.6;
  color: #666;
}

.calculation-tips {
  margin-top: 20rpx;
}

.tip-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.tip-item {
  display: block;
  margin-bottom: 8rpx;
  color: #666;
}

.tolerance-mode-selector {
  margin-bottom: 20rpx;
}

.mode-description {
  margin-top: 16rpx;
  padding: 16rpx;
  background: #f0f8ff;
  border-radius: 12rpx;
  border-left: 4rpx solid #667eea;
}

.description-text {
  font-size: 24rpx;
  color: #555;
  line-height: 1.5;
}

.form-tip {
  font-size: 26rpx;
  color: #667eea;
  padding: 20rpx;
  background: #f0f8ff;
  border-radius: 12rpx;
  line-height: 1.5;
  text-align: center;
}

.display-mode-selector {
  display: flex;
  align-items: center;
}

.selector-label {
  font-size: 26rpx;
  color: #666;
  margin-right: 16rpx;
}

.mode-selector-small {
  display: flex;
  background: white;
  border-radius: 12rpx;
  overflow: hidden;
  border: 1rpx solid #e0e0e0;
}

.mode-item-small {
  flex: 1;
  padding: 16rpx 20rpx;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
}

.mode-item-small.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.mode-item-small.active .mode-text-small {
  color: white;
}

.mode-text-small {
  font-size: 22rpx;
  font-weight: bold;
  color: #666;
  transition: color 0.3s ease;
}

/* 卡片标题区域增强 */
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

.song-count {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 20rpx;
  font-weight: bold;
  padding: 6rpx 12rpx;
  border-radius: 20rpx;
  min-width: 24rpx;
  text-align: center;
}

/* 歌曲选择区域样式增强 */
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

/* 容错计算方式选择样式增强 */
.tolerance-mode-selector {
  border: 2rpx solid rgba(102, 126, 234, 0.2);
  box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.1);
}

.tolerance-mode-selector .mode-selector {
  background: #f8f9fa;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  z-index: 1;
  box-shadow: inset 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.tolerance-mode-selector .mode-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scale(1.05);
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.tolerance-mode-selector .mode-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #666;
  transition: color 0.3s ease;
  display: block;
  line-height: 1.2;
}

.tolerance-mode-selector .mode-item.active .mode-text {
  color: white;
}

.tolerance-mode-selector .mode-icon {
  font-size: 28rpx;
  margin-bottom: 6rpx;
  display: block;
  filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.1));
}

.tolerance-mode-selector .mode-indicator {
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

.tolerance-mode-selector .mode-item.active .mode-indicator {
  transform: scaleX(1) translateX(-50%);
  background: white;
}

.mode-description {
  margin-top: 20rpx;
}

.description-card {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 20rpx;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 16rpx;
  border-left: 4rpx solid #667eea;
}

.description-icon {
  font-size: 28rpx;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 4rpx;
}

.description-text {
  font-size: 26rpx;
  color: #555;
  line-height: 1.5;
  flex: 1;
}

.display-mode-selector {
  display: flex;
  align-items: center;
  margin-top: 16rpx;
}

.selector-label {
  font-size: 26rpx;
  color: #666;
  margin-right: 16rpx;
  white-space: nowrap;
}

.mode-selector-small {
  display: flex;
  background: white;
  border-radius: 12rpx;
  overflow: hidden;
  border: 1rpx solid #e0e0e0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
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
}

.result-status.success {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.result-status.failed {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.status-icon {
  font-size: 20rpx;
  line-height: 1;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
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

.result-item.highlight {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%);
  border: 2rpx solid rgba(255, 193, 7, 0.2);
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
}

.result-value.success {
  color: #4caf50;
}

.result-value.failed {
  color: #f44336;
}

.result-value.rating {
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

/* Arcaea风格的评级配色 */
.rating-pm {
  background: linear-gradient(135deg, #ff3366 0%, #ff6b9d 100%);
  color: white;
}

.rating-ex-plus {
  background: linear-gradient(135deg, #ff9a00 0%, #ffc947 100%);
  color: white;
}

.rating-ex {
  background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
  color: white;
}

.rating-aa {
  background: linear-gradient(135deg, #66ff66 0%, #00cc66 100%);
  color: white;
}

.rating-a {
  background: linear-gradient(135deg, #66ccff 0%, #3399ff 100%);
  color: white;
}

.rating-b {
  background: linear-gradient(135deg, #cc99ff 0%, #9966cc 100%);
  color: white;
}

.rating-c {
  background: linear-gradient(135deg, #ffcc99 0%, #ff9966 100%);
  color: white;
}

.rating-d {
  background: linear-gradient(135deg, #999999 0%, #666666 100%);
  color: white;
}

/* 表单区域增强 */
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

.form-hint {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
  display: block;
  line-height: 1.4;
}

.picker {
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

.picker-text {
  line-height: 88rpx;
}

.form-tip {
  font-size: 24rpx;
  color: #666;
  background: #f0f7ff;
  padding: 16rpx;
  border-radius: 12rpx;
  border-left: 4rpx solid #667eea;
  line-height: 1.4;
}

/* 计算按钮增强 */
.calculate-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.calculate-btn:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 8rpx 25rpx rgba(102, 126, 234, 0.4);
}

.calculate-btn:active {
  transform: translateY(0);
}

.calculate-btn:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

/* 按钮波纹效果 */
.calculate-btn::before {
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

.calculate-btn:active::before {
  width: 400rpx;
  height: 400rpx;
}

/* 公式说明卡片样式增强 */
.formula-card {
  border: 2rpx solid rgba(102, 126, 234, 0.2);
  box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.1);
}

.explanation {
  padding: 10rpx 0;
}

.explanation-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 20rpx;
  display: block;
}

.calculation-tips {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.tip-title {
  font-size: 26rpx;
  color: #667eea;
  font-weight: 600;
  margin-bottom: 8rpx;
  display: block;
}

.tip-item {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
  padding-left: 20rpx;
  position: relative;
}

.tip-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12rpx;
  width: 8rpx;
  height: 8rpx;
  background: #667eea;
  border-radius: 50%;
}

/* Web端特殊交互效果 */
/* #ifdef H5 */
.result-item:hover {
  transform: translateY(-4rpx);
}

.form-input:focus {
  outline: none;
}

.calculate-btn:hover {
  box-shadow: 0 8rpx 25rpx rgba(102, 126, 234, 0.4);
}
/* #endif */

/* 移动端触摸反馈增强 */
/* #ifndef H5 */
.result-item:active {
  transform: scale(0.98);
}

.form-input:active {
  background: white;
}

.calculate-btn:active {
  transform: scale(0.98);
}
/* #endif */
</style>