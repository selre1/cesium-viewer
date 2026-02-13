const VIEW_PRESETS = {
  // 수직 보기 (완전 top-down)
  top: {
    heading: Cesium.Math.toRadians(0),     // heading은 수직일 때는 의미 거의 없음
    pitch:   Cesium.Math.toRadians(-90),
  },

  // 오른쪽 보기 (동쪽에서 45° 경사로 내려다봄)
  right: {
    // Cesium 기준: heading 0 = 북, +90 = 동, +180 = 남, -90 = 서
    heading: Cesium.Math.toRadians(90),    // 동쪽 방향
    pitch:   Cesium.Math.toRadians(-45),   // 45도 내려보기
  },

  // 왼쪽 보기 (서쪽에서 45° 경사로 내려다봄)
  left: {
    heading: Cesium.Math.toRadians(-90),   // 서쪽 방향
    pitch:   Cesium.Math.toRadians(-45),
  },
};


export function flyToTilesetsWithPreset(
  viewer,
  union,                 
  presetKey = "top",     // "top" | "left" | "right"
  duration = 0.8,
  range = 10000
) {

  if (!union) return;
  
  const preset = VIEW_PRESETS[presetKey] || VIEW_PRESETS.top;

  viewer.scene.camera.flyToBoundingSphere(union, {
    duration,
    offset: new Cesium.HeadingPitchRange(
      preset.heading,
      preset.pitch,
      range
    ),
    easingFunction: Cesium.EasingFunction.SINUSOIDAL_IN_OUT,
  });
}

export function flyWalkModeLookAt(viewer, movement) {
    function computeHeadingFromTo(startCarto, endCarto) {
        const dLon = endCarto.longitude - startCarto.longitude;

        const y = Math.sin(dLon) * Math.cos(endCarto.latitude);
        const x =
            Math.cos(startCarto.latitude) * Math.sin(endCarto.latitude) -
            Math.sin(startCarto.latitude) * Math.cos(endCarto.latitude) * Math.cos(dLon);

        let heading = Math.atan2(y, x); // -π~π
        return Cesium.Math.zeroToTwoPi(heading); // 0~2π 로 변환
    }

    function computeHeadingPitchToTarget(fromPos, toPos) {
        const enuToWorld = Cesium.Transforms.eastNorthUpToFixedFrame(fromPos);
        const worldToEnu = Cesium.Matrix4.inverse(enuToWorld, new Cesium.Matrix4());
        const toVec = Cesium.Cartesian3.subtract(toPos, fromPos, new Cesium.Cartesian3());
        const local = Cesium.Matrix4.multiplyByPointAsVector(
            worldToEnu,
            toVec,
            new Cesium.Cartesian3()
        );

        const heading = Math.atan2(local.x, local.y);
        const horizontal = Math.sqrt(local.x * local.x + local.y * local.y);
        const pitch = Math.atan2(local.z, horizontal);

        return {
            heading: Cesium.Math.zeroToTwoPi(heading),
            pitch,
        };
    }

  const scene  = viewer.scene;
  const camera = viewer.camera;

  if (!scene.pickPositionSupported) return;

  const ray = camera.getPickRay(movement.position);
  const hit = scene.pickFromRay(ray);
  if (!hit || !hit.position) return;

  const downRay = new Cesium.Ray(
    hit.position,
    Cesium.Cartesian3.negate(camera.upWC, new Cesium.Cartesian3())
  );
  const floorHit = scene.pickFromRay(downRay);
  if (!floorHit || !floorHit.position) return;

  const eyeHeight = 1.3;
  const headClearance = 0.2;
  const backDistance = 1;
  const flyDuration = 1.0;

  const targetCarto = Cesium.Cartographic.fromCartesian(floorHit.position);
  targetCarto.height += eyeHeight;

  const targetPosition = Cesium.Cartesian3.fromRadians(
    targetCarto.longitude,
    targetCarto.latitude,
    targetCarto.height
  );

  const viewDir = Cesium.Cartesian3.subtract(
    targetPosition,
    camera.positionWC,
    new Cesium.Cartesian3()
  );
  Cesium.Cartesian3.normalize(viewDir, viewDir);

  const destination = Cesium.Cartesian3.add(
    targetPosition,
    Cesium.Cartesian3.multiplyByScalar(viewDir, -backDistance, new Cesium.Cartesian3()),
    new Cesium.Cartesian3()
  );

  const look = computeHeadingPitchToTarget(destination, targetPosition);
  const roll = 0.0;

  camera.flyTo({
    destination,
    orientation: { heading: look.heading, pitch: look.pitch, roll },
    duration: flyDuration,
    easingFunction: Cesium.EasingFunction.QUADRATIC_OUT,
    complete: function () {
      //clampHeightBetweenFloorAndCeiling(viewer, eyeHeight, headClearance);
    }
  });
}

function clampHeightBetweenFloorAndCeiling(viewer, eyeHeight, headClearance) {
  const scene = viewer.scene;
  const cam = viewer.camera;

  const downDir = Cesium.Cartesian3.negate(cam.upWC, new Cesium.Cartesian3());
  const downRay = new Cesium.Ray(cam.positionWC, downDir);
  const upRay = new Cesium.Ray(cam.positionWC, cam.upWC);

  const floorHit = scene.pickFromRay(downRay);
  const ceilHit = scene.pickFromRay(upRay);

  if (!floorHit || !floorHit.position) return;

  const floorCarto = Cesium.Cartographic.fromCartesian(floorHit.position);
  let minH = floorCarto.height + eyeHeight;

  let maxH = Infinity;
  if (ceilHit && ceilHit.position) {
    const ceilCarto = Cesium.Cartographic.fromCartesian(ceilHit.position);
    maxH = ceilCarto.height - headClearance;
  }

  const camCarto = Cesium.Cartographic.fromCartesian(cam.positionWC);
  const clampedH = Cesium.Math.clamp(camCarto.height, minH, maxH);

  if (Math.abs(clampedH - camCarto.height) > 1e-3) {
    camCarto.height = clampedH;
    cam.position = Cesium.Cartesian3.fromRadians(camCarto.longitude, camCarto.latitude, camCarto.height);
  }
}
