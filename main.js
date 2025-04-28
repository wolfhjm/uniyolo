// main.js
import App from './App'
import uviewPlus from '@/uni_modules/uview-plus'
import { createSSRApp } from 'vue'
import loggerMixin from './mixins/loggerMixin'

export function createApp() {
  const app = createSSRApp(App)
  app.use(uviewPlus)
  app.mixin(loggerMixin) // Vue 3 混入方式
  return {
    app
  }
}