// src/index.js
import CesiumHandler from "./CesiumHandler.js";

/**
 * 
 *  target: "#element" 또는 DOM Element
 *  options: { tilesetUrl, propertyUrls, ... }
 */
export async function CesiumViewer(target, options = {}) {
  // target이 문자열이면 '#viewerRoot' 형태일 수도 있으니 '#' 제거해서 id로 사용
  const elementId = typeof target === "string" ? target.replace(/^#/, "") : (target && target.id);
  const { viewer, updateModelConfig} = await CesiumHandler.init(elementId, options);

  return {
    viewer,
    updateModelConfig
  };
}

// 필요하면 전체 핸들러도 export
//export { default as CesiumHandler } from "./CesiumHandler.js";