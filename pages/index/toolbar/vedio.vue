<template>
  <!-- App端原生预览 -->
  <!-- #ifdef APP-PLUS -->
  <live-pusher ref="pusher"></live-pusher>
  <!-- #endif -->

  <!-- 小程序/H5通用 -->
  <!-- #ifndef APP-PLUS -->
  <camera v-if="showCamera"></camera>
  <!-- #endif -->
</template>

<script>
export default {
  methods: {
    initCamera() {
      // #ifdef APP-PLUS
      const pusher = this.$refs.pusher;
      pusher.startPreview();
      // #endif

      // #ifdef MP-WEIXIN
      this.ctx = uni.createCameraContext(this);
      // #endif
    }
  }
}
</script>