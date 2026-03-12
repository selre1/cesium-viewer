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
        color: {
                    conditions: [
                       // ["${ifc_class} === 'IfcFlowSegment'", "color('#023caf')"],
                       // ["${ifc_class} === 'IfcFlowFitting'", "color('#023caf')"],
                        ["${ifc_class} === 'IfcWall'", "color('#bababa')"],
                        ["${ifc_class} === 'IfcSlab'", "color('#bababa')"],
                        ["${ifc_class} === 'IfcWallStandardCase'", "color('#bababa')"],
                        ["${ifc_class} === 'IfcOpeningElement'", "color('#bababa')"],
                    ]
                },
          show : "${ifc_class} !== '" + className + "'",
      });
    });
  }

  function applyVisibleTiles(className ='IfcSlab'){
    const tilesets = CesiumHandler.getLoaded3DTilesets();
    tilesets.forEach(ts => {
      ts.style =  new Cesium.Cesium3DTileStyle({
        color: {
                    conditions: [
                       // ["${ifc_class} === 'IfcFlowSegment'", "color('#023caf')"],
                       // ["${ifc_class} === 'IfcFlowFitting'", "color('#023caf')"],
                        ["${ifc_class} === 'IfcWall'", "color('#bababa')"],
                        ["${ifc_class} === 'IfcSlab'", "color('#bababa')"],
                        ["${ifc_class} === 'IfcWallStandardCase'", "color('#bababa')"],
                        ["${ifc_class} === 'IfcOpeningElement'", "color('#bababa')"],
                    ]
                },
          show : "${ifc_class} !== 'IfcOpeningElement'",
      });
    });
  }

  function toolbarApi(){
    return CesiumHandler.getToolbarApi();
  }

  return {
    viewer,
    setMode,
    updateBaseLayer,
    updateTerrain,
    update3Dtileset,
    addWebMapService,
    applyInvisibleTiles,
    applyVisibleTiles,
    toolbarApi
  };
}