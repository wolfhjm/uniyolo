<template>
	<view class="content">
		<view v-if="activeTab === 0">
			照片检测内容
			<cameriaVue></cameriaVue>
		</view>
		<view v-else-if="activeTab === 1">
			视频检测内容
			<vedioVue></vedioVue>
		</view>
		<view v-else-if="activeTab === 2">
			检测记录内容
			<historyVue></historyVue>
		</view>
		<view v-else>版本信息内容
			<versionVue></versionVue>
		</view> 
		<up-tabbar
			:value="activeTab"
			@change="handleTabChange"
			:fixed="true"
			:placeholder="true"
			:safeAreaInsetBottom="true"
		>
			<up-tabbar-item text="照片检测" icon="home" @click="handleTabClick"  ></up-tabbar-item>
			<up-tabbar-item text="视频检测" icon="photo" @click="handleTabClick" ></up-tabbar-item>
			<up-tabbar-item text="检测记录" icon="play-right" @click="handleTabClick" ></up-tabbar-item>
			<up-tabbar-item text="版本信息" icon="account" @click="handleTabClick" ></up-tabbar-item>
		</up-tabbar>
		
	</view>
</template>
<script setup>
import { ref } from 'vue'

import historyVue from './toolbar/history.vue'
import versionVue from './toolbar/version.vue'
import vedioVue from './toolbar/vedio.vue'
import cameriaVue from './toolbar/cameria.vue'
// 响应式数据
const imageSrc = ref('')
const activeTab = ref(0)
const tabItems = ref([
  { text: '照片检测', icon: 'home' },
  { text: '视频检测', icon: 'photo' },
  { text: '检测记录', icon: 'play-right' },
  { text: '版本信息', icon: 'account' }
])

// 方法
const handleTabChange = (index) => {
  activeTab.value = index
  console.log('Tab changed to:', index)
}

const handleTabClick = (index) => {
  activeTab.value = index
  console.log('Tab clicked:', index)
}

const openCamera = async () => {
  try {
    const res = await uni.chooseImage({ 
      count: 1, 
      sourceType: ['camera'] 
    })
    imageSrc.value = res.tempFilePaths[0]
    await uploadImage(res.tempFilePaths[0])
  } catch (err) {
    uni.showToast({ 
      title: '拍照失败', 
      icon: 'none' 
    })
  }
}

const uploadImage = (filePath) => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: 'https://example.com/upload',
      filePath,
      name: 'file',
      success: (res) => resolve(res.data),
      fail: reject
    })
  })
}
</script>