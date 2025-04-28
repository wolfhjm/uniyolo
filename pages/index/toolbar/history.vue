<template>
  <view v-for="(log, index) in logs" :key="index">
    {{ new Date(log.timestamp).toLocaleString() }} - {{ log.action }}
  </view>
   <button type="primary" @click="reFresh">刷新</button>
</template>

<script>// 在查看页面获取日志
export default {
  data() {
    return {
      logs: []
    }
  },
  mounted() {
    this.loadLogs();
  },
  methods: {
    loadLogs() {
      try {
        this.logs = uni.getStorageSync('operation_logs') || [];
      } catch (e) {
        uni.showToast({ title: '日志加载失败', icon: 'error' });
      }
    },
	reFresh()
	{
		this.loadLogs();
	}
  }
}
</script>

