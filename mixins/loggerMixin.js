// mixins/loggerMixin.js
export default {
	// created() {
	//   console.log('全局混入已加载', this.$options.methods?.logOperation);
	// },
  methods: {
    logOperation(action) {
      try {
        const logs = uni.getStorageSync('operation_logs') || [];
        logs.push({
          action,
          timestamp: new Date().toISOString(),
          page: this.$route?.path || 'unknown' // 可选：记录触发页面
        });
        uni.setStorageSync('operation_logs', logs.slice(-100)); // 限制日志数量
      } catch (e) {
        console.error('日志记录失败:', e);
        // 可选：上报错误到监控系统
      }
    }
  },
  // 可选：自动记录页面生命周期
  onLoad() {
    this.logOperation(`进入页面: ${this.$route?.path}`);
  }
};