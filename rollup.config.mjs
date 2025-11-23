import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

const umdConfig = {
  input: "src/index.js",
  output: {
      //file: "dist/git-viewer.umd.js",
      file: "dist/git-viewer.js",
      format: "umd",
      name: "GIT", // 노출될 이름
      sourcemap: false,
  },
  // 현재 소스는 Cesium, jQuery를 import 하지 않고 window 글로벌로 쓰므로
  // external 설정이 필수는 아님. (작성된 코드만 번들됨)
  // 추후 'import Cesium from "cesium"' 같이 바꾸면 여기서 external/globals 세팅해줘야 함.
  external: [],
  plugins: [
    resolve({
      browser: true,
    }),
    commonjs(),
    terser({
      format: {
        comments: false,     // 주석 삭제
      },
      compress: {
        drop_console: true,  // console.log 제거 (옵션)
      },
      mangle: true,          // 변수/함수명 난독
    })
  ],
  treeshake: "smallest"
};

const esmConfig = {
  input: "src/index.js",
  output: {
    file: "dist/git-viewer.esm.js",
    format: "es",
    sourcemap: true,  // 개발용 디버그 편하게
  },
  external: [],
  plugins: [
    resolve({ browser: true }),
    commonjs(),
    terser({
      format: { comments: false },
      compress: { drop_console: false },
      mangle: false,   // 이름은 그대로 두고, 공백/구조만 압축
    }),
  ],
  treeshake: "smallest",
};

export default [umdConfig, esmConfig];