import CesiumHandler from "./CesiumHandler.js";

export default async function CesiumViewer(target, options = {}) {
  // target이 문자열이면 '#viewerRoot' 형태일 수도 있으니 '#' 제거해서 id로 사용
  const elementId = typeof target === "string" ? target.replace(/^#/, "") : (target && target.id);
  const viewer = await CesiumHandler.init(elementId, options);

  function update3Dtileset(tilesetUrls) {
    return CesiumHandler.updateModelConfig(tilesetUrls);
  }

  function addWebMapService(url, layers){
    if(!url || !layers){
      console.warn(`url : ${url} , layerName : ${layers}를 확인해주세요.`);
      return;
    }
    return CesiumHandler.applyWebMapService(url,layers);
  }

  function updateTerrain(url){
    CesiumHandler.updateTerrain(url);
  }

  function updateBaseLayer(url){
    CesiumHandler.updateBaseLayer(url);
  }

  function setMode(type){
    CesiumHandler.setMode(type);
  }

  function applyInvisibleTiles(className ='IfcSlab'){
    const tilesets = CesiumHandler.getLoaded3DTilesets();
    tilesets.forEach(ts => {
      ts.style =  new Cesium.Cesium3DTileStyle({
          show : "${ifc_class} !== '" + className + "'",
      });
    });
  }

  function applyVisibleTiles(className ='IfcSlab'){
    const tilesets = CesiumHandler.getLoaded3DTilesets();
    tilesets.forEach(ts => {
      ts.style =  new Cesium.Cesium3DTileStyle({
          show : "${ifc_class} !== 'IfcOpeningElement'",
      });
    });
  }

  return {
    viewer,
    setMode,
    updateBaseLayer,
    updateTerrain,
    update3Dtileset,
    addWebMapService,
    applyInvisibleTiles,
    applyVisibleTiles
  };
}