<template>
  <!-- 视频显示区域 -->
  <image v-if="platform !== 'h5'" :src="currentFrame" mode="aspectFit" />
  <img v-else :src="currentFrame" class="video-frame" />
  
  <!-- 检测结果叠加层 -->
  <canvas canvas-id="resultCanvas" class="canvas-layer"></canvas>
</template>

<script>
export default {
  data() {
    return {
      currentFrame: '',
      socket: null,
      platform: uni.getSystemInfoSync().platform
    }
  },
  methods: {
    initWebSocket() {
      // 统一WebSocket连接
      const wsUrl = `ws://192.168.244.242:5000/live_feed`;
      
      // #ifdef H5
      this.socket = new WebSocket(wsUrl);
      // #endif
      
      // #ifdef MP-WEIXIN
      this.socket = uni.connectSocket({
        url: wsUrl,
        complete: () => {
			console.log("连接成功")
		}
      });
      // #endif

      this.setupSocketEvents();
    },
    
    setupSocketEvents() {
      // 统一消息处理
      const onMessage = (res) => {
        const frameData = 'data:image/jpeg;base64,' + res.data;
        this.currentFrame = frameData;
        this.processDetections(res.detections); // 处理检测结果
      };
      
      // #ifdef H5
      this.socket.onmessage = (event) => onMessage(JSON.parse(event.data));
      // #endif
      
      // #ifdef MP-WEIXIN
      this.socket.onMessage((res) => onMessage(JSON.parse(res.data)));
      // #endif
    },
    
    processDetections(detections) {
      // 在canvas上绘制检测框
      const ctx = uni.createCanvasContext('resultCanvas', this);
      detections.forEach(item => {
        ctx.setStrokeStyle('#00FF00');
        ctx.setLineWidth(2);
        ctx.strokeRect(
          item.box.x1, item.box.y1, 
          item.box.x2 - item.box.x1, 
          item.box.y2 - item.box.y1
        );
      });
      ctx.draw();
    }
  },
  mounted() {
    // this.initWebSocket();
  }
}
</script>

<style>
.canvas-layer {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
  pointer-events: none;
}
</style>