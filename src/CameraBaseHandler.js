export function CameraBaseHandler(viewer, handler) {
  const c = viewer.scene.screenSpaceCameraController;

  c.enableRotate = true;
  c.enableTranslate = true;
  c.enableZoom = true;
  c.enableTilt = true;
  c.enableLook = true;

  c.rotateEventTypes = [Cesium.CameraEventType.LEFT_DRAG];
  c.translateEventTypes = [Cesium.CameraEventType.RIGHT_DRAG];
  c.lookEventTypes = [Cesium.CameraEventType.RIGHT_DRAG];
  c.tiltEventTypes = [
    Cesium.CameraEventType.MIDDLE_DRAG,
    { eventType: Cesium.CameraEventType.LEFT_DRAG, modifier: Cesium.KeyboardEventModifier.CTRL },
  ];

  handler.setInputAction(() => {
    viewer.trackedEntity = undefined;
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

  handler.setInputAction(() => {
    c.enableZoom = false;
    c.enableTilt = false;

    const cam = viewer.camera;
    cam.setView({
      orientation: new Cesium.HeadingPitchRoll(cam.heading, cam.pitch, 0.0),
    });
  }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);

  handler.setInputAction(() => {
    c.enableZoom = true;
    c.enableTilt = true;
  }, Cesium.ScreenSpaceEventType.RIGHT_UP);
}