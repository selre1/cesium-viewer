import CesiumHandler from "./CesiumHandler.js";
import CameraFree    from "./CameraFree.js";
import Measurement  from "./Measurement.js";

$(async function () {
    const viewer = CesiumHandler.init("viewerRoot");
    CameraFree.init(viewer);
    Measurement.init({ cesiumViewer: viewer });
    CesiumHandler.mountInfoBox({container:viewer.container, 
        onCamreraFree:(enable)=>{
            Measurement.stop();
            if (enable) {
                toolBarApi.hiddenMountToolBar();
                CesiumHandler.infoBoxDisable();
                CesiumHandler.inspectBoxDisable();
                CameraFree.enable();
            }
            else {
                toolBarApi.showMountToolBar();
                CesiumHandler.infoBoxEnable();
                CesiumHandler.inspectBoxEnable();
                CameraFree.disable();
            }
        },
        onOrbitMode:(enable)=>{
            Measurement.stop();
            if (enable) {
                toolBarApi.hiddenMountToolBar();
                CesiumHandler.infoBoxDisable();
                CesiumHandler.inspectBoxDisable();
                CameraFree.disable();
            }else{
                toolBarApi.showMountToolBar();
                CesiumHandler.infoBoxEnable();
                CesiumHandler.inspectBoxEnable();
                CameraFree.disable();
            }
        }
    });
    CesiumHandler.mountInspectBox();

    const toolBarApi = Measurement.mountToolBar({
        container: viewer.container,
        onPoint: () => {
            CameraFree.disable();
            CesiumHandler.infoBoxDisable();
            CesiumHandler.inspectBoxDisable();
            Measurement.start("P");
        },
        onLine: () => {
            CameraFree.disable();
            CesiumHandler.infoBoxDisable();
            CesiumHandler.inspectBoxDisable();
            Measurement.start("D");
        },
        onVertical: () => {
            alert('해당 서비스 준비중입니다.');
            return;
            CameraFree.disable();
            CesiumHandler.infoBoxDisable();
            CesiumHandler.inspectBoxDisable();
            Measurement.start("V");
        },
        onAreaGround: () => {
            CameraFree.disable();
            CesiumHandler.infoBoxDisable();
            CesiumHandler.inspectBoxDisable();
            Measurement.setAreaMode("ground");
            Measurement.start("A");
        },
        onAreaSurface: () => {
            CameraFree.disable();
            CesiumHandler.infoBoxDisable();
            CesiumHandler.inspectBoxDisable();
            Measurement.setAreaMode("surface");
            Measurement.start("A");
        },
        onClose: () => { //측정 종료
            Measurement.stop();
            CameraFree.disable();
            CesiumHandler.infoBoxEnable();
            CesiumHandler.inspectBoxEnable();
        },
        onInit: () => { //측정 초기화
            // 측정 엔티티 전부 제거
            Measurement.removeAll();
        },
        onMarkerAdd() {
            console.log('마커 추가 클릭');
        },
        onMarkerClear() {
            console.log('마커 초기화 클릭');
        }
    });

    let rootTilesetUrl = "http://175.116.181.151:29090/3d-tileset/02_draco_glb/tileset.json";
    const tilesets = await CesiumHandler.loadAllTilesets({url:rootTilesetUrl});


    const propertiesUrl = ["http://175.116.181.151:29090/3d-tileset/properties/combined_properties.json"];
    const tilesetInfo = await CesiumHandler.loadTilesetInfo(propertiesUrl);
    
})