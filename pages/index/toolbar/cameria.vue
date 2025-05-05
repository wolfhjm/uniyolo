<template>
  <view class="container">
    <!-- 操作按钮 -->
    <up-button type="primary" text="从相册选择" @click="chooseImage('album')"></up-button>
    <up-button type="primary" :plain="true" text="拍照选择" @click="chooseImage('camera')" style="margin-top: 20px;"></up-button>
    
    <!-- 图片展示区域 -->
    <view class="image-wrapper">
      <image 
        v-if="imageSrc" 
        :src="imageSrc" 
		mode="aspectFit"
        class="original-image"
        @load="handleImageLoad"
      ></image>
      <image :src="resimageUrl" mode="aspectFit"></image>
	  <!-- mode="aspectFit" -->
      <!-- 检测框绘制层 -->
      <canvas 
        v-if="showCanvas" 
        canvas-id="detectionCanvas" 
        class="detection-canvas"
        :style="{
          width: canvasWidth + 'px',
          height: canvasHeight + 'px',
          left: canvasOffset.left + 'px',
          top: canvasOffset.top + 'px'
        }"
      ></canvas>
    </view>
    
    <!-- 加载状态 -->
    <up-loading-icon v-if="loading" text="检测中..." mode="circle"></up-loading-icon>
  </view>
</template>

<script>
export default {
  data() {
    return {
      imageSrc: '',
	  resimageUrl: '',
      loading: false,
      showCanvas: false,
      detections: [],
      // 图片原始尺寸
      imgNaturalSize: { width: 0, height: 0 },
      // 图片显示尺寸
      imgDisplaySize: { width: 0, height: 0 },
      // Canvas尺寸（与图片显示一致）
      canvasWidth: 0,
      canvasHeight: 0,
      // Canvas偏移量（用于绝对定位对齐）
      canvasOffset: { left: 0, top: 0 }
    }
  },
  methods: {
    // 选择图片
    chooseImage(sourceType) {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: [sourceType],
        success: (res) => {
          this.imageSrc = res.tempFilePaths[0];
          this.showCanvas = false; // 重置Canvas状态
        }
      });
    },
    
    // 图片加载完成回调
    handleImageLoad(e) {
      // 获取图片原始尺寸
      this.imgNaturalSize = {
        width: e.detail.width,
        height: e.detail.height
      };
      // 获取图片显示尺寸
      uni.createSelectorQuery()
        .select('.original-image')
        .boundingClientRect(res => {
          this.imgDisplaySize = {
            width: res.width,
            height: res.height
          };
          
          // 设置Canvas尺寸与图片显示一致
          this.canvasWidth = res.width;
          this.canvasHeight = res.height;
          
          // 计算Canvas定位偏移量
          this.canvasOffset = {
            left: res.left,
            top: res.top
          };
          
          // 上传图片进行检测
          this.uploadImage(this.imageSrc);
        })
        .exec();
    },
    
    // 上传图片并获取检测结果
    uploadImage(filePath) {
      this.loading = true;
      uni.uploadFile({
        url: 'http://192.168.244.242:5000/detect',
        filePath,
        name: 'image',
        success: (res) => {
          try {
            const result = JSON.parse(res.data);
            if (result.status === 'success') {
              this.detections = result.detections;
			  // 直接加载返回的图片
			  
			   this.resimageUrl = result.processed_image_url;
			   const resLabel = [];
			       if (Array.isArray(result.detections)) {
			         result.detections.forEach(detection => {
			           resLabel.push(detection.class_name);
			           resLabel.push(detection.confidence);
			           
			           // 记录每条检测结果的日志
			           // this.logOperation(`蔬菜检测: ${detection.class_name} (置信度: ${(detection.confidence * 100).toFixed(1)}%)`);
			         });
			       }
				   this.logOperation(`蔬菜检测: `+ resLabel.toString());
              this.showCanvas = true;
              this.$nextTick(() => {
                // this.drawDetectionBoxes();
              });
            }
          } catch (e) {
            console.error('解析结果失败:', e);
          }
        },
        complete: () => {
          this.loading = false;
        }
      });
    },
    
    // 绘制检测框（适配缩放比例）
    drawDetectionBoxes() {
      const ctx = uni.createCanvasContext('detectionCanvas', this);
      
      // 计算缩放比例
      const scaleX = this.imgDisplaySize.width / this.imgNaturalSize.width;
      const scaleY = this.imgDisplaySize.height / this.imgNaturalSize.height;
      
      // 清空画布
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      
      this.detections.forEach(det => {
        const { x1, y1, x2, y2 } = det.box;
        const label = `${det.class_name} ${(det.confidence * 100).toFixed(1)}%`;
        
        // 按显示比例缩放坐标
        const scaledX1 = x1 * scaleX;
        const scaledY1 = y1 * scaleY;
        const scaledWidth = (x2 - x1) * scaleX;
        const scaledHeight = (y2 - y1) * scaleY;
        
        // 绘制矩形框
        ctx.setStrokeStyle('#00FF00');
        ctx.setLineWidth(2);
        ctx.strokeRect(scaledX1, scaledY1, scaledWidth, scaledHeight);
        
        // 绘制文字背景
        ctx.setFillStyle('#00FF00');
        ctx.setFontSize(12);
        const textWidth = ctx.measureText(label).width;
        ctx.fillRect(scaledX1, scaledY1 - 16, textWidth + 4, 16);
        
        // 绘制文字
        ctx.setFillStyle('#000000');
        ctx.fillText(label, scaledX1 + 2, scaledY1 - 14);
      });
      
      ctx.draw();
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

.image-wrapper {
  position: relative;
  width: 100%;
  margin-top: 30px;
}

.original-image {
  width: 100%;
}

.detection-canvas {
  position: absolute;
  pointer-events: none;
  z-index: 10;
}
</style>