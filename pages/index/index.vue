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
 // <up-button type="primary" text="add" @click="testadd"></up-button>
// function testadd()
// {
// 	const testModule = uni.requireNativePlugin('hjm-testmodule');
// 	testModule.add(
// 	{
// 		a:1,
// 		b:1
// 	},e => {
// 		uni.showToast({
// 			title:JSON.stringify(e),
// 			icon:"none"
// 		})
// 	})
// }
// 方法
const handleTabChange = (index) => {
  activeTab.value = index
  console.log('Tab changed to:', index)
}

const handleTabClick = (index) => {
  activeTab.value = index
  console.log('Tab clicked:', index)
}

// const openCamera = async () => {
//   try {
//     const res = await uni.chooseImage({ 
//       count: 1, 
//       sourceType: ['camera'] 
//     })
//     imageSrc.value = res.tempFilePaths[0]
//     await uploadImage(res.tempFilePaths[0])
//   } catch (err) {
//     uni.showToast({ 
//       title: '拍照失败', 
//       icon: 'none' 
//     })
//   }
// }

// const uploadImage = (filePath) => {
// 	console.log("up")
//   return new Promise((resolve, reject) => {
//     uni.uploadFile({
//       url: '192.168.138.1:5000/detect',
//       filePath,
//       name: 'file',
//       formData: {
//         // 可添加额外参数，如用户ID等
//         userId: '123'
//       },
//       header: {
//         'Content-Type': 'multipart/form-data'
//       },
//       success: (res) => {
//         try {
//           // 尝试解析返回的JSON数据（假设后端返回JSON）
//           const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
//           console.log('上传成功，服务器返回数据:', data); // 打印完整响应
          
//           // 根据你的后端接口结构调整
//           if (data.status === 'success') {
//             console.log('检测结果:', data.detections); // 打印检测结果
//             console.log('原始图片URL:', data.original_image_url);
//             console.log('处理后的图片URL:', data.processed_image_url);
//             resolve(data);
//           } else {
//             console.error('服务器返回错误:', data.error || '未知错误');
//             reject(new Error(data.error || 'Upload failed'));
//           }
//         } catch (e) {
//           console.error('解析响应数据失败:', e);
//           reject(new Error('Invalid server response'));
//         }
//       },
//       fail: (err) => {
//         console.error('上传失败:', err);
//         reject(err);
//       },
//       complete: (res) => {
//         console.log('上传完成，完整响应:', res); // 调试用
//       }
//     });
//   });
// };

</script>