import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

const umdConfig = {
  input: "src/index.js",
  output: {
      //file: "dist/git-viewer.umd.js",
      file: "dist/GIT.js",
      format: "umd",
      name: "GIT", // 노출될 이름
      sourcemap: false,
  },
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
    file: "dist/GIT.esm.js",
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