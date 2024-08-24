/*
 * @Descripttion:
 * @version: 1.0.0
 * @Author: htang
 * @Date: 2024-07-15 16:33:33
 * @LastEditors: htang
 * @LastEditTime: 2024-08-24 14:38:23
 */
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { OUTPUT_DIR } from './build/constant';
import path from "path";

const TimeStamp = new Date().getTime();

function resolve(url) {
  return path.resolve(__dirname, url);
}
// https://vitejs.dev/config/
export default ({ mode }) => {
  // 获取环境变量
  const env = loadEnv(mode, process.cwd());
  return defineConfig({
    base: './', //env.VITE_APP_BASE_URL, // 动态改变base值
    assetsInclude: [
      "**/*.glb",
      "**/*.gltf",
      "**/*.fbx",
      "**/*.hdr",
      "**/*.json",
      "**/*.mp4",
      "**/*.mov",
    ],
    resolve: {
      alias: {
        "@": resolve("./src"),
        "~@": resolve("./src"),
      },
      // 省略文件后缀
      extensions: [".mjs", ".js", ".jsx", ".json"],
    },
    build: {
      minify: 'esbuild',
      target: 'es2015',
      cssTarget: 'chrome80',
      outDir: OUTPUT_DIR,
      terserOptions: {
        compress: {
          // keep_infinity: true,
          // // Used to delete console in production environment
          // drop_console: VITE_DROP_CONSOLE,
          // drop_debugger: true,
        },
      },
      // Turning off brotliSize display can slightly reduce packaging time
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        // 参考：https://blog.cinob.cn/archives/393
        output: {
          // 入口文件名
          entryFileNames: `assets/[name]-${TimeStamp}.js`,
          // 块文件名
          chunkFileNames: `assets/[name]-[hash]-${TimeStamp}.js`,
          // 资源文件名 css 图片等等
          assetFileNames: `assets/[name]-[hash]-balabala-${TimeStamp}.[ext]`,
        }
      }
    },
    envDir: 'env',
    plugins: [vue()],
  });
};