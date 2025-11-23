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
* 지하에서 수평상태로 바라본 후 모델 클릭시 자연스러운 슬라이딩 이동 가능
* 카메라는 사용자가 바라보는 상태 그대로 유지, 높이 유지
*/
export function moveSlidingDirection(viewer,movement){
    const scene = viewer.scene;
    if (!scene.pickPositionSupported) return;

    const cartesian = scene.pickPosition(movement.position);
    if (!Cesium.defined(cartesian)) return;

    const globe     = scene.globe;
    const ellipsoid = globe.ellipsoid;

    const clickCarto  = ellipsoid.cartesianToCartographic(cartesian);
    const cameraCarto = ellipsoid.cartesianToCartographic(viewer.camera.position);

    // 카메라의 현재 높이 유지
    const destCarto = new Cesium.Cartographic(
        clickCarto.longitude,
        clickCarto.latitude,
        cameraCarto.height
    );
    const dest = ellipsoid.cartographicToCartesian(destCarto);

    viewer.camera.flyTo({
        destination: dest,
        orientation: {
            heading: viewer.camera.heading,
            pitch:   viewer.camera.pitch,
            roll:    viewer.camera.roll
        },
        duration: 0.7,
        easingFunction: Cesium.EasingFunction.QUADRATIC_OUT
    });
}

// 모델클릭 시 해당 모델로 카메라 이동
// 마우스의 노말벡터 방향으로 카메라 방향이 이동하기 때문에 카메라가 휙 돌아가는 현상 발생
export function moveNormalDirection(viewer, movement, model){
       const scene  = viewer.scene;
        const camera = viewer.camera;

        if (!scene.pickPositionSupported) {
            return;
        }

        // 클릭한 위치(현재 화면에서 보이는 표면 위치)
        const target = scene.pickPosition(movement.position);
        if (!Cesium.defined(target)) {
            return;
        }

        // 모델 전체 반지름
        const rawRadius = (model && model.boundingSphere)
            ? model.boundingSphere.radius
            : 10.0; // fallback

        // 현재 카메라와 클릭 지점 사이 거리
        const currentDistance = Cesium.Cartesian3.distance(camera.position, target);

        // 화면에 꽉 차게 만들 이상적인 거리 (건물 전체 기준)
        const fovy = camera.frustum.fovy || Cesium.Math.toRadians(60.0);
        let fitDistance = (rawRadius / Math.sin(fovy / 2.0)) * 1.1; // 여유 10%

        // 계단 같이 내부 요소를 눌렀을 때
        //    건물 전체를 보기 위해 뒤로 쭉 빠지지 않도록
        //     지금보다 더 멀리는 가지 않게 제한
        fitDistance = Math.min(fitDistance, currentDistance);

        // 너무 멀거나, 너무 코앞까지 붙지 않게 클램프
        //  dMin / dMax => 사용성에 따라 조절 (단위: meter 정도)
        const dMin = 3.0;    // 실내 볼 때 최소 거리
        const dMax = 100.0;  // 건물 전체 볼 때도 이 이상은 안 멀어지게
        fitDistance = Cesium.Math.clamp(fitDistance, dMin, dMax);

        // 카메라 → 타겟 방향(정면 방향)
        const dirCamToTarget = Cesium.Cartesian3.normalize(
            Cesium.Cartesian3.subtract(
                target,
                camera.position,
                new Cesium.Cartesian3()
            ),
            new Cesium.Cartesian3()
        );

        // 타겟 기준으로 정면에서 fitDistance만큼 떨어진 위치
        const newPosition = Cesium.Cartesian3.add(
            target,
            Cesium.Cartesian3.multiplyByScalar(
                dirCamToTarget,
                -fitDistance,
                new Cesium.Cartesian3()
            ),
            new Cesium.Cartesian3()
        );

        // 새 위치에서 타겟을 정확히 바라보는 direction
        const newDirection = Cesium.Cartesian3.normalize(
            Cesium.Cartesian3.subtract(
                target,
                newPosition,
                new Cesium.Cartesian3()
            ),
            new Cesium.Cartesian3()
        );

        camera.flyTo({
            destination: newPosition,
            orientation: {
                direction: newDirection,
                up: camera.up   // 기존 상단 방향 유지 (화면 기울기 유지)
            },
            duration: 0.7,
            easingFunction: Cesium.EasingFunction.QUADRATIC_OUT
        });
}

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
        let fitDistance = Math.max(distV, distH) * 1.1;   // 살짝 여유 10%

        // 너무 가깝거나 너무 멀지 않게 한번 더 클램프
        const dMin = 3.0;    // 실내용 너무 붙지 않게
        const dMax = 50.0;  // 너무 멀어지지 않게 (필요하면 조정)
        fitDistance = Cesium.Math.clamp(fitDistance, dMin, dMax);

        // 현재 카메라 → 모델 중심 방향 기준으로 앞/뒤 결정
        const forward = Cesium.Cartesian3.normalize(
            Cesium.Cartesian3.subtract(
                center,
                camera.position,
                new Cesium.Cartesian3()
            ),
            new Cesium.Cartesian3()
        );

        // 최종 카메라 위치 = 모델 중심 앞쪽에서 fitDistance 만큼 떨어진 곳
        const newPosition = Cesium.Cartesian3.add(
            center,
            Cesium.Cartesian3.multiplyByScalar(
                forward,
                -fitDistance,
                new Cesium.Cartesian3()
            ),
            new Cesium.Cartesian3()
        );

        // direction = 중심을 바라보는 방향
        const direction = Cesium.Cartesian3.normalize(
            Cesium.Cartesian3.subtract(
                center,
                newPosition,
                new Cesium.Cartesian3()
            ),
            new Cesium.Cartesian3()
        );

        // up 벡터는 지표면 법선 기반 구성
        const ellipsoid = scene.globe.ellipsoid;
        const worldUp   = ellipsoid.geodeticSurfaceNormal(
            center,
            new Cesium.Cartesian3()
        );

        const right = Cesium.Cartesian3.normalize(
            Cesium.Cartesian3.cross(direction, worldUp, new Cesium.Cartesian3()),
            new Cesium.Cartesian3()
        );
        const up = Cesium.Cartesian3.normalize(
            Cesium.Cartesian3.cross(right, direction, new Cesium.Cartesian3()),
            new Cesium.Cartesian3()
        );

        camera.flyTo({
            destination: newPosition,
            orientation: {
                direction: direction,
                up: up
            },
            duration: 0.7,
            easingFunction: Cesium.EasingFunction.QUADRATIC_OUT
        });
}

/*
* 모델의 사이즈에 맞춰서 카메라 이동
* 카메라 위치 자세 유지 x
*/
export function flyPivotFitModel(viewer, model){
    if (!viewer || !model) return;

    const camera = viewer.camera;

    // 모델의 BoundingSphere
    let bs = model._boundingSphere || model.boundingSphere;
    if (!bs) return;

    const radius = bs.radius || 10.0;

    // 화면에 꽉 차게 들어오도록 거리 계산
    const frustum = camera.frustum;
    const fovy    = frustum.fovy || Cesium.Math.toRadians(60.0);
    const aspect  = frustum.aspectRatio
        || (viewer.canvas.clientWidth / viewer.canvas.clientHeight);

    const fovx    = 2.0 * Math.atan(Math.tan(fovy / 2.0) * aspect);
    const distV   = radius / Math.sin(fovy / 2.0);
    const distH   = radius / Math.sin(fovx / 2.0);
    let fitDistance = Math.max(distV, distH) * 1.1; // 여유 10%

    // 거리 클램프
    const dMin = 3.0;
    const dMax = 50.0;
    fitDistance = Cesium.Math.clamp(fitDistance, dMin, dMax);

    // 현재 카메라 heading/pitch 가져오기
    let heading = camera.heading;
    let pitch   = camera.pitch;

    const minPitch = Cesium.Math.toRadians(-80);
    const maxPitch = Cesium.Math.toRadians(-10);
    pitch = Cesium.Math.clamp(pitch, minPitch, maxPitch);

    const offset = new Cesium.HeadingPitchRange(
        heading,
        pitch,
        fitDistance
    );

    // Cesium 내장 로직으로 fly + pivot 설정
    camera.flyToBoundingSphere(bs, {
        offset,
        duration: 0.7,
        easingFunction: Cesium.EasingFunction.QUADRATIC_OUT
    });
}

export function flyToTilesetsWithPreset(
  viewer,
  union,                 
  presetKey = "top",     // "top" | "left" | "right"
  duration = 0.8,
  range = 600
) {
  if(presetKey==="left" | presetKey === "right"){
    alert('해당 서비스 준비중입니다.');
    return;
  }
  if (!union) {
    return;
  }

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