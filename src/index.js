import CesiumHandler from "./CesiumHandler.js";

/**
 *  target: "#element" 또는 DOM Element
 *  options: { 3dtileset url, 관련 속성정보 url , info={ 타이틀, 이미지 src(svg,png), 높이(default 100)} }
 */
export default async function CesiumViewer(target, options = {}) {
  // target이 문자열이면 '#viewerRoot' 형태일 수도 있으니 '#' 제거해서 id로 사용
  const elementId = typeof target === "string" ? target.replace(/^#/, "") : (target && target.id);
  const viewer = await CesiumHandler.init(elementId, options);

  function update3Dtileset(tilesetUrl, propertyUrls = []) {
    return CesiumHandler.updateModelConfig(tilesetUrl, propertyUrls);
  }

  return {
    update3Dtileset
  };
}
