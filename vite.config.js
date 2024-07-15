import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

function resolve(url) {
  return path.resolve(__dirname, url);
}
// https://vitejs.dev/config/
export default ({ mode }) => {
  // 获取环境变量
  const env = loadEnv(mode, process.cwd());
  return defineConfig({
    base: env.VITE_APP_BASE_URL, // 动态改变base值
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

    plugins: [vue()],
  });
};
