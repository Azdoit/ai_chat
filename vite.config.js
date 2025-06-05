import { fileURLToPath, URL } from 'node:url'
import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
// 自动导入vue中hook reactive ref；vueRouter;pinia
import AutoImport from 'unplugin-auto-import/vite'
// 导入svg插件
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
// 自动导入ui-组件 比如element-plus
import Components from 'unplugin-vue-components/vite'
// elementplus插件
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// // elementplus图标
// import Icons from 'unplugin-icons/vite'
// import IconsResolver from 'unplugin-icons/resolver'
import vueDevTools from'vite-plugin-vue-devtools'
export default defineConfig({
  base: './',
  // 取消控制台scss警告
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler' },
    },
  },
  // 设置别名@
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    /** 是否开启 HTTPS */
    https: false,
    /** 设置 host: true 才可以使用 Network 的形式，以 IP 访问项目 */
    host: true, // host: "0.0.0.0"
    /** 端口号 */
    port: 3004,
    /** 是否自动打开浏览器 */
    open: false,
    /** 跨域设置允许 */
    cors: true,
    /** 端口被占用时，是否直接退出 */
    strictPort: false,
    /** 接口代理 */
    proxy: {
      '/api': {
        target: 'http://192.168.204.16', //代理地址 凡是使用/api
        changeOrigin: true, //允许跨域请求
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      // 指定symbolId格式
      symbolId: 'icon-[name]',
    }),
    AutoImport({
      imports: [
        // 需要自动导入的插件，自定义导入的API
        'vue',
        'vue-router',
        'pinia',
      ],
      resolvers: [
        ElementPlusResolver(),
        // // 自动导入图标组件
        // IconsResolver({
        //   prefix: 'Icon',
        // }),
      ],
    }),
    Components({
      resolvers: [
        // 自动导入 Element Plus 组件
        ElementPlusResolver(),
        // // 自动注册图标组件
        // IconsResolver({
        //   enabledCollections: ['ep'],
        // }),
      ],
    }),
    // Icons({
    //   autoInstall: true,
    // }),
  ],
})
