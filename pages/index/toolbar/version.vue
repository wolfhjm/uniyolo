<template>
  <view class="container">
    <!-- 基础设备信息 -->
    <view class="info-item">
      <text>设备品牌：</text>
      <text>{{deviceInfo.brand}}</text>
    </view>
    <view class="info-item">
      <text>设备型号：</text>
      <text>{{deviceInfo.model}}</text>
    </view>
    <view class="info-item">
      <text>操作系统：</text>
      <text>{{deviceInfo.system}} {{deviceInfo.version}}</text>
    </view>
    <view class="info-item">
      <text>像素比例：</text>
      <text>{{deviceInfo.pixelRatio}}</text>
    </view>

    <!-- 硬件信息 -->
    <view class="info-item">
      <text>CPU：</text>
      <text>{{deviceInfo.cpu || '加载中...'}}</text>
    </view>
    <view class="info-item">
      <text>GPU：</text>
      <text>{{deviceInfo.gpu || '加载中...'}}</text>
    </view>
    <view class="info-item" v-if="deviceInfo.npu">
      <text>NPU：</text>
      <text>{{deviceInfo.npu}}</text>
    </view>

    <!-- 仅App平台显示 -->
    <!-- #ifdef APP-PLUS -->
    <view class="info-item">
      <text>应用大小：</text>
      <text>{{appSize}}</text>
    </view>
    <!-- #endif -->
    
    <view class="info-item">
      <text>缓存大小：</text>
      <text>{{cacheSize}}</text>
    </view>
    
    <button @click="clearCache">清除缓存</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      deviceInfo: {
        brand: '',
        model: '',
        system: '',
        version: '',
        pixelRatio: '',
        cpu: '',
        gpu: '',
        npu: ''
      },
      appSize: '计算中...',
      cacheSize: '计算中...'
    }
  },
  mounted() {
    this.getSystemInfo();
    this.getCacheSize();
    
    // 平台特定逻辑
    // #ifdef APP-PLUS
    this.getAppSize();
    this.getCPUInfo();
    this.getGPUInfo();
    this.detectNPU();
    // #endif
    
    // #ifdef H5
    this.getH5HardwareInfo();
    // #endif
    
    // #ifdef MP-WEIXIN
    this.getWechatDeviceInfo();
    // #endif
  },
  methods: {
    // 获取基础系统信息
    getSystemInfo() {
      const systemInfo = uni.getSystemInfoSync();
      this.deviceInfo = {
        ...this.deviceInfo,
        brand: systemInfo.deviceBrand || systemInfo.brand,
        model: systemInfo.deviceModel || systemInfo.model,
        system: systemInfo.osName || systemInfo.system,
        version: systemInfo.osVersion,
        pixelRatio: systemInfo.devicePixelRatio
      };
    },
    
    // 获取缓存大小
    getCacheSize() {
      // 小程序和H5平台
      // #ifdef H5 || MP-WEIXIN
      const storageInfo = uni.getStorageInfoSync();
      this.cacheSize = (storageInfo.currentSize / 1024).toFixed(2) + 'MB';
      // #endif
      
      // App平台
      // #ifdef APP-PLUS
      plus.cache.calculate(size => {
        this.cacheSize = this.formatSize(size);
      });
      // #endif
    },
    
    // 清除缓存
    clearCache() {
      uni.showModal({
        title: '提示',
        content: '确定要清除所有缓存吗？',
        success: res => {
          if (res.confirm) {
            uni.clearStorageSync();
            // #ifdef APP-PLUS
            plus.cache.clear();
            // #endif
            this.cacheSize = '0B';
            uni.showToast({
              title: '缓存已清除'
            });
          }
        }
      });
    },
    
    // 格式化文件大小
    formatSize(size) {
      if (size < 1024) {
        return size + 'B';
      } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(2) + 'KB';
      } else {
        return (size / (1024 * 1024)).toFixed(2) + 'MB';
      }
    },
    
    /****************** App 端专用方法 ******************/
    // #ifdef APP-PLUS
    // 获取应用大小
    getAppSize() {
      plus.io.requestFileSystem(plus.io.PRIVATE_DOC, fs => {
        fs.root.getDirectory('_doc', {}, entry => {
          entry.getMetadata(metadata => {
            this.appSize = this.formatSize(metadata.size);
          });
        });
      });
    },
    
    // 获取CPU信息
    getCPUInfo() {
      if (plus.os.name === 'Android') {
        try {
          const Runtime = plus.android.importClass('java.lang.Runtime');
          const process = Runtime.getRuntime().exec('cat /proc/cpuinfo');
          const BufferedReader = plus.android.importClass('java.io.BufferedReader');
          const InputStreamReader = plus.android.importClass('java.io.InputStreamReader');
          
          const reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
          let line, cpuInfo = '';
          while ((line = reader.readLine()) != null) {
            cpuInfo += line + '\n';
          }
          
          // 提取CPU型号
          const match = cpuInfo.match(/model name\s*: (.*)|Hardware\s*: (.*)/);
          this.deviceInfo.cpu = match ? (match[1] || match[2]) : '未知CPU';
        } catch (e) {
          this.deviceInfo.cpu = '获取失败（需权限）';
        }
      } else {
        // iOS获取CPU类型
        const device = plus.ios.invoke('UIDevice', 'currentDevice');
        const model = plus.ios.invoke(device, 'model');
        plus.ios.deleteObject(device);
        this.deviceInfo.cpu = model;
      }
    },
    
    // 获取GPU信息
    getGPUInfo() {
      if (plus.os.name === 'Android') {
        try {
          // 尝试读取GPU渲染器信息
          const Build = plus.android.importClass('android.os.Build');
          this.deviceInfo.gpu = Build.HARDWARE.match(/.*GPU.*/) ? Build.HARDWARE : '集成显卡';
        } catch (e) {
          this.deviceInfo.gpu = '未知GPU';
        }
      } else {
        // iOS通过Metal获取GPU信息
        const mtlDevice = plus.ios.invoke('MTLCreateSystemDefaultDevice', null);
        if (mtlDevice) {
          this.deviceInfo.gpu = plus.ios.invoke(mtlDevice, 'name') || 'Apple GPU';
          plus.ios.deleteObject(mtlDevice);
        }
      }
    },
    
    // 检测NPU（示例：华为HiAI）
    detectNPU() {
      if (plus.os.name === 'Android') {
        try {
          const context = plus.android.importClass('android.content.Context');
          const pm = plus.android.runtimeMainActivity().getPackageManager();
          const hasHiAI = pm.hasSystemFeature('com.huawei.hiai');
          this.deviceInfo.npu = hasHiAI ? '华为NPU（HiAI）' : '未检测到';
        } catch (e) {
          this.deviceInfo.npu = 'NPU检测失败';
        }
      } else {
        // iOS设备（A11及以上芯片含NPU）
        const device = plus.ios.invoke('UIDevice', 'currentDevice');
        const model = plus.ios.invoke(device, 'model');
        plus.ios.deleteObject(device);
        this.deviceInfo.npu = model.includes('iPhone') ? 'Apple Neural Engine' : '未检测到';
      }
    },
    // #endif
    
    /****************** H5端专用方法 ******************/
    // #ifdef H5
    getH5HardwareInfo() {
      // 获取CPU逻辑核心数
      this.deviceInfo.cpu = `逻辑核心数: ${navigator.hardwareConcurrency || '未知'}`;
      
      // 尝试获取WebGL渲染器信息作为GPU参考
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          this.deviceInfo.gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '未知GPU';
        }
      }
    },
    // #endif
    
    /****************** 微信小程序专用方法 ******************/
    // #ifdef MP-WEIXIN
    getWechatDeviceInfo() {
      wx.getDeviceInfo({
        success: (res) => {
          this.deviceInfo.cpu = res.cpuBrand || '未知CPU';
          this.deviceInfo.gpu = res.gpuBrand || '未知GPU';
        },
        fail: () => {
          this.deviceInfo.cpu = '获取失败';
          this.deviceInfo.gpu = '获取失败';
        }
      });
    }
    // #endif
  }
}
</script>

<style>
.container {
  padding: 20px;
}
.info-item {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}
button {
  margin-top: 20px;
  background-color: #007aff;
  color: white;
}
</style>