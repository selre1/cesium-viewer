


export function CameraBaseHandler(viewer, handler) {
   
    let enabled = false;
   
    let isShiftLeftDown = false;

    function setDefaultControls(enabled) {
        const c = viewer.scene.screenSpaceCameraController;
        c.enableRotate   = enabled;
        c.enableTranslate= enabled;
        c.enableZoom     = enabled;
        c.enableTilt     = enabled;
        c.enableLook     = enabled;
    }

    handler.setInputAction(function () {
        viewer.trackedEntity = undefined;
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    handler.setInputAction(() => { 
        isShiftLeftDown = true;
        const cam = viewer.camera;
        cam.setView({
            orientation: new Cesium.HeadingPitchRoll(cam.heading, cam.pitch, 0.0)
        });
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN, Cesium.KeyboardEventModifier.SHIFT);
    
    handler.setInputAction(() => { 
        isShiftLeftDown = false; 
    }, Cesium.ScreenSpaceEventType.LEFT_UP, Cesium.KeyboardEventModifier.SHIFT);
    
    handler.setInputAction(() => { 
        isShiftLeftDown = false; 
    },Cesium.ScreenSpaceEventType.LEFT_UP);

    return {
        enable: function() {
            if (enabled) return;
            enabled = true;
            setDefaultControls(false);
            viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        }
        ,
        disable: function() {
            if (!enabled) return;
            enabled = false;
            setDefaultControls(true);
        }
    };
}