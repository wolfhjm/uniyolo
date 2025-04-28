<template>
  <view class="container">
    <!-- 操作按钮 -->
    <up-button type="primary" text="从相册选择" @click="chooseImage('album')"></up-button>
    <up-button type="primary" :plain="true" text="拍照选择" @click="chooseImage('camera')" style="margin-top: 20px;"></up-button>
    
    <!-- 图片展示区域 -->
    <up-image 
      v-if="imageSrc" 
      :src="imageSrc" 
      mode="widthFix" 
      width="100%"
      style="margin-top: 30px;"
    ></up-image>
    
    <!-- 加载状态提示 -->
    <up-loading-icon v-if="loading" text="图片上传中..." mode="circle"></up-loading-icon>
  </view>
</template>

<script>
import loggerMixin from '../../../mixins/loggerMixin';

export default {
  data() {
    return {
      imageSrc: '',      // 图片路径
      loading: false     // 上传状态
    }
  },
  methods: {
    // 选择图片方法
    chooseImage(sourceType) {
      uni.chooseImage({
        count: 1, // 默认9
        sizeType: ['compressed'], // 压缩图
        sourceType: [sourceType], // album-相册 camera-相机
        success: (res) => {
          this.imageSrc = res.tempFilePaths[0];
		 this.logOperation('蔬菜检测');
		
          // this.uploadImage(res.tempFilePaths[0]);
        },
        fail: (err) => {
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
          console.error(err);
        }
      });
    },
    
    // 上传图片到服务器
    uploadImage(filePath) {
      this.loading = true;
      
      uni.uploadFile({
        url: 'https://your-api-domain.com/upload', // 替换为实际接口
        filePath: filePath,
        name: 'file',
        formData: {
          'user': 'test'
        },
        success: (uploadRes) => {
          uni.showToast({
            title: '上传成功',
            icon: 'success'
          });
          console.log('上传结果：', uploadRes.data);
        },
        fail: (err) => {
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          });
          console.error(err);
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }
}
</script>

<style>
.container {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>