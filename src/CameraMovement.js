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

/*
* 모델의 사이즈에 맞춰서 카메라 이동
* 카메라 위치 자세 유지 o
* pivot 불가
*/
export function flyDirectionStayFitModel(viewer, model){
    const scene  = viewer.scene;
    const camera = viewer.camera;

    if (!model) return;

    //모델의 bounding sphere 정보 가져오기
    const bs = model._boundingSphere || model.boundingSphere;
    if (!bs) return;

    const center = bs.center;             // 모델 중심
    const radius = bs.radius || 10.0;     // 모델 크기

    //카메라 FOV 기반으로 전체가 보이는 최소 거리 계산
    const frustum = camera.frustum;
    const fovy    = frustum.fovy || Cesium.Math.toRadians(60.0);
    const aspect  = frustum.aspectRatio
        || (viewer.canvas.clientWidth / viewer.canvas.clientHeight);

    const fovx = 2.0 * Math.atan(Math.tan(fovy / 2.0) * aspect);

    // 세로/가로 중 더 가까운 쪽 기준으로 거리 계산
    const distV = radius / Math.sin(fovy / 2.0);
    const distH = radius / Math.sin(fovx / 2.0);
    let range = Math.max(distV, distH) * 1.1;   // 살짝 여유 10%

    // 너무 가깝거나 너무 멀지 않게 한번 더 클램프
    const dMin = 3.0;    // 실내용 너무 붙지 않게
    const dMax = 50.0;  // 너무 멀어지지 않게 
    //range = Cesium.Math.clamp(range, dMin, dMax);

    const currentDistance = Cesium.Cartesian3.distance(camera.position, center);
    if (Cesium.defined(currentDistance) && isFinite(currentDistance)) {
        // 현재 거리보다 최대 1.3배까지만 멀어지게 허용
        const maxAllowed = Math.max(dMin, Math.min(dMax, currentDistance * 1.1));
        range = Math.min(range, maxAllowed);
    }

    const currentHeading = camera.heading;
    let currentPitch   = camera.pitch;
    const minPitch = Cesium.Math.toRadians(-80); // -90(수직)까지 안 가게
    const maxPitch = Cesium.Math.toRadians(-10); // 너무 수평으로 안 가게
    currentPitch   = Cesium.Math.clamp(currentPitch, minPitch, maxPitch);


    // --- BoundingSphere 기준으로 fly + pivot 고정 ---
    camera.flyToBoundingSphere(bs, {
        duration: 0.7,
        easingFunction: Cesium.EasingFunction.QUADRATIC_OUT,
        offset: new Cesium.HeadingPitchRange(
            currentHeading,
            currentPitch,
            range
        ),
        complete() {
            // 여기서 회전 pivot을 center로 고정
            viewer.camera.lookAt(
                center,
                new Cesium.HeadingPitchRange(
                currentHeading,
                currentPitch,
                range
                )
            );
        }
    });
}


export function flyToTilesetsWithPreset(
  viewer,
  union,                 
  presetKey = "top",     // "top" | "left" | "right"
  duration = 0.8,
  range = 1000
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

  const scene  = viewer.scene;
  const camera = viewer.camera;

  if (!scene.pickPositionSupported) return;

  const pickedPosition = scene.pickPosition(movement.position);
  if (!Cesium.defined(pickedPosition)) return;

  const eyeHeight   = 1;
  const flyDuration = 1.0;

  const destCarto = Cesium.Cartographic.fromCartesian(pickedPosition);
  destCarto.height += eyeHeight;

  const destination = Cesium.Cartesian3.fromRadians(
    destCarto.longitude,
    destCarto.latitude,
    destCarto.height
  );

  const startCarto = Cesium.Cartographic.fromCartesian(camera.positionWC);
  const heading    = computeHeadingFromTo(startCarto, destCarto);
  const pitch      = camera.pitch; // 그대로 두거나 -0.2 같은 고정값도 가능
  const roll       = 0.0;

  camera.flyTo({
    destination,
    orientation: { heading, pitch, roll },
    duration: flyDuration,
    easingFunction: Cesium.EasingFunction.QUADRATIC_OUT
  });
}