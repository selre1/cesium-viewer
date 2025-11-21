export function CameraOrbitMode({cesiumViewer}){
    const viewer = cesiumViewer;
    const scene  = viewer.scene;
    const camera = viewer.camera;

    // 회전 모드 상태
    const orbitState = {
        enabled: false,
        callback: null
    };

    function enable(unionTilesetCenter){

        if (orbitState.enabled) return;
        if (!unionTilesetCenter) return;

        orbitState.enabled = true;

        // trackedEntity가 잡혀 있으면 해제
        viewer.trackedEntity = undefined;

        const center = unionTilesetCenter.center;
        const radius = unionTilesetCenter.radius;

        // 거리/각도 설정
        const pitch = Cesium.Math.toRadians(-45.0);   // -45도 내려다보기
        const range = radius * 2.0;                   // 모델보다 조금 떨어져서

        // 시작 시점엔 현재 heading 그대로 사용
        let heading = camera.heading;

        // 한 바퀴 도는 속도 (초당 10도 정도)
        const angularSpeed = Cesium.Math.toRadians(10.0); // rad/sec

        // 처음 lookAt으로 pivot을 center로 박아둠
        camera.lookAt(
            center,
            new Cesium.HeadingPitchRange(heading, pitch, range)
        );

        let lastTime = performance.now() / 1000;  // 초 단위

        // preRender 콜백
        const cb = function (scene, time) {
            if (!orbitState.enabled) return;

            const now = performance.now() / 1000;
            const dt  = now - lastTime;
            lastTime  = now;
            
            heading += angularSpeed * dt;

            camera.lookAt(
                center,
                new Cesium.HeadingPitchRange(heading, pitch, range)
            );
        };

        orbitState.callback = cb;
        scene.preRender.addEventListener(cb);
    }
    function disable(){

        if (!orbitState.enabled) return;
        orbitState.enabled = false;
        if (orbitState.callback) {
            viewer.scene.preRender.removeEventListener(orbitState.callback);
            orbitState.callback = null;
        }

        // pivot 해제 (그냥 현재 위치/방향 유지)
        camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }

    return {enable,disable};
}