import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/git-viewer.umd.js",
      format: "umd",
      name: "GIT", // window.UndergroundViewer 로 노출될 이름
      sourcemap: true,
    },
    {
      file: "dist/git-viewer.esm.js",
      format: "es",
      sourcemap: true,
    },
  ],
  // 현재 소스는 Cesium, jQuery를 import 하지 않고 window 글로벌로 쓰므로
  // external 설정이 필수는 아님. (작성된 코드만 번들됨)
  // 추후 'import Cesium from "cesium"' 같이 바꾸면 여기서 external/globals 세팅해줘야 함.
  external: [],
  plugins: [
    resolve({
      browser: true,
    }),
    commonjs(),
  ],
};