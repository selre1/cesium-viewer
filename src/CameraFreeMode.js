export function CameraFreeMode({cesiumViewer}){
    let enabled = false;

    let viewer = cesiumViewer, handler;
    let looking = false;
    let startMousePosition, mousePosition;

    const SENS = 0.5; // ??? ??
    const EYE_HEIGHT = 0.8;
    const MAX_STEP_UP = 0.6;
    const MAX_STEP_DOWN = 3.0;
    const WALL_PADDING = 0.3;
    const WALL_RAY_HEIGHT = 0.4;
    const HEAD_CLEARANCE = 0.2;
    const JUMP_HEIGHT = 0.5;
    const JUMP_DURATION = 0.5;
    const DROP_RISK_THRESHOLD = 0.8;
    const SAFETY_LIFT = 0.2;
    const GROUND_SAMPLE_RADIUS = 0.25;
     // ??? ?? ??? ?? ??
    const PITCH_MIN = Cesium.Math.toRadians(-89.0);
    const PITCH_MAX = Cesium.Math.toRadians( 89.0);

    // 드래그 시작 시 기준 각도 저장
    let headingTemp = 0.0;
    let pitchTemp   = 0.0;

    let jumpRequested = false;
    let jumpActive = false;
    let jumpStartTime = null;
    let jumpBaseHeight = null;
    let lastValidGroundHeight = null;
    let ignoreCollisionUntilGrounded = false;
    
    const flags = {
        moveForward:false, 
        moveBackward:false, 
        moveUp:false, 
        moveDown:false, 
        moveLeft:false, 
        moveRight:false
    };

    const keyDown = (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
            return;
        }
        if (e.code === 'Space') { jumpRequested = true; e.preventDefault(); }
        const m = {
            KeyW: 'moveForward', 
            KeyS: 'moveBackward', 
            KeyQ: 'moveUp', 
            KeyE: 'moveDown', 
            KeyA: 'moveLeft', 
            KeyD: 'moveRight'
        }[e.code];
        if (m) flags[m] = true;
    };
    const keyUp = (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
            return;
        }
        const m = {
        KeyW: 'moveForward', KeyS: 'moveBackward', KeyQ: 'moveUp', KeyE: 'moveDown', KeyA: 'moveLeft', KeyD: 'moveRight'
        }[e.code];
        if (m) flags[m] = false;
    };

    function setDefaultControls(enabled) {
        const c = viewer.scene.screenSpaceCameraController;
        c.enableRotate   = enabled;
        c.enableTranslate= enabled;
        c.enableZoom     = enabled;
        c.enableTilt     = enabled;
        c.enableLook     = enabled;
    }

    function getGroundHeightAt(position, upDir) {
        const downDir = Cesium.Cartesian3.negate(upDir, new Cesium.Cartesian3());
        const downRay = new Cesium.Ray(position, downDir);
        const hit = viewer.scene.pickFromRay(downRay);
        if (!hit || !hit.position) return null;
        const carto = Cesium.Cartographic.fromCartesian(hit.position);
        return carto.height;
    }

    function getCeilingDistance(position, upDir) {
        const upRay = new Cesium.Ray(position, upDir);
        const hit = viewer.scene.pickFromRay(upRay);
        if (!hit || !hit.position) return null;
        return Cesium.Cartesian3.distance(position, hit.position);
    }

    function horizontalizeDirection(vec, upDir) {
        const proj = Cesium.Cartesian3.multiplyByScalar(
            upDir,
            Cesium.Cartesian3.dot(vec, upDir),
            new Cesium.Cartesian3()
        );
        const horizontal = Cesium.Cartesian3.subtract(vec, proj, new Cesium.Cartesian3());
        const mag = Cesium.Cartesian3.magnitude(horizontal);
        if (mag < 1e-6) return null;
        return Cesium.Cartesian3.multiplyByScalar(horizontal, 1.0 / mag, horizontal);
    }

    function headingToDirection(heading, origin) {
        const enuToWorld = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
        const localDir = new Cesium.Cartesian3(Math.sin(heading), Math.cos(heading), 0.0);
        const worldDir = Cesium.Matrix4.multiplyByPointAsVector(
            enuToWorld,
            localDir,
            new Cesium.Cartesian3()
        );
        return Cesium.Cartesian3.normalize(worldDir, worldDir);
    }

    function moveWithCollision(dir, distance, allowSnap, ignoreCollision) {
        if (distance <= 0) return;

        const camera = viewer.camera;
        const upDir = viewer.scene.globe.ellipsoid.geodeticSurfaceNormal(
            camera.positionWC,
            new Cesium.Cartesian3()
        );
        const horizDir = horizontalizeDirection(dir, upDir);
        if (!horizDir) return;

        const currentGround = getGroundHeightAt(camera.positionWC, upDir);
        if (!ignoreCollision && currentGround !== null) {
            const wallOriginLow = Cesium.Cartesian3.add(
                camera.positionWC,
                Cesium.Cartesian3.multiplyByScalar(upDir, -WALL_RAY_HEIGHT, new Cesium.Cartesian3()),
                new Cesium.Cartesian3()
            );
            const wallOriginHigh = camera.positionWC;
            const wallHitLow = viewer.scene.pickFromRay(new Cesium.Ray(wallOriginLow, horizDir));
            const wallHitHigh = viewer.scene.pickFromRay(new Cesium.Ray(wallOriginHigh, horizDir));

            const wallDistLow = wallHitLow && wallHitLow.position
                ? Cesium.Cartesian3.distance(wallOriginLow, wallHitLow.position)
                : null;
            const wallDistHigh = wallHitHigh && wallHitHigh.position
                ? Cesium.Cartesian3.distance(wallOriginHigh, wallHitHigh.position)
                : null;

            if (wallDistLow !== null && wallDistHigh !== null) {
                const wallDist = Math.min(wallDistLow, wallDistHigh);
                distance = Math.min(distance, Math.max(0.0, wallDist - WALL_PADDING));
            }
        }
        if (distance <= 0) return;

        const delta = Cesium.Cartesian3.multiplyByScalar(horizDir, distance, new Cesium.Cartesian3());
        let nextPos = Cesium.Cartesian3.add(camera.positionWC, delta, new Cesium.Cartesian3());

        if (allowSnap) {
            const nextGround = getGroundHeightAt(nextPos, upDir);
            if (currentGround !== null && nextGround !== null) {
                const stepDelta = nextGround - currentGround;
                if (stepDelta > MAX_STEP_UP || stepDelta < -MAX_STEP_DOWN) {
                    return;
                        }
                        const nextCarto = Cesium.Cartographic.fromCartesian(nextPos);
                        nextCarto.height = nextGround + EYE_HEIGHT;
                        nextPos = Cesium.Cartesian3.fromRadians(
                            nextCarto.longitude,
                            nextCarto.latitude,
                            nextCarto.height
                        );
                    }
                }

                camera.position = nextPos;
            }

    function moveVertical(amount) {
        if (amount === 0) return;
        const camera = viewer.camera;
        const upDir = viewer.scene.globe.ellipsoid.geodeticSurfaceNormal(
            camera.positionWC,
            new Cesium.Cartesian3()
        );
        const dir = amount > 0 ? upDir : Cesium.Cartesian3.negate(upDir, new Cesium.Cartesian3());
        const currentGround = getGroundHeightAt(camera.positionWC, upDir);

        if (amount > 0) {
            if (currentGround !== null) {
                const ceilDist = getCeilingDistance(camera.positionWC, upDir);
                if (ceilDist !== null) {
                    amount = Math.min(amount, Math.max(0.0, ceilDist - HEAD_CLEARANCE));
                }
            }
        } else {
            if (currentGround === null) return;
            const currentHeight = Cesium.Cartographic.fromCartesian(camera.positionWC).height;
            const minHeight = currentGround + EYE_HEIGHT;
            if (currentHeight <= minHeight + 1e-3) return;
                    const targetHeight = currentHeight + amount;
                    if (targetHeight < minHeight) {
                        amount = minHeight - currentHeight;
                    }
                }

        if (amount === 0) return;
        const delta = Cesium.Cartesian3.multiplyByScalar(dir, Math.abs(amount), new Cesium.Cartesian3());
        camera.position = Cesium.Cartesian3.add(camera.positionWC, delta, new Cesium.Cartesian3());
        ignoreCollisionUntilGrounded = true;
    }

    function onTick() {
                const camera = viewer.camera;
                const canvas = viewer.canvas;
                const ellipsoid = viewer.scene.globe.ellipsoid;
                // ??? ?? ??? ?? (roll=0 ??)
                if (looking) {
                    const w = canvas.clientWidth;
                    const h = canvas.clientHeight;

                    const dx = (mousePosition.x - startMousePosition.x) / w;
                    const dy = (mousePosition.y - startMousePosition.y) / h;

                    const dHeading = Cesium.Math.toRadians(dx * 180 * SENS);
                    const dPitch   = Cesium.Math.toRadians(-dy * 180 * SENS);

                    let newHeading = headingTemp + dHeading;
                    let newPitch   = Cesium.Math.clamp(pitchTemp + dPitch, PITCH_MIN, PITCH_MAX);

                    newHeading = Cesium.Math.negativePiToPi(newHeading);

                    camera.setView({
                        orientation: new Cesium.HeadingPitchRoll(newHeading, newPitch, 0.0)
                    });
                }

                const cameraHeight = ellipsoid.cartesianToCartographic(camera.position).height;
                const heightAbs = Math.abs(cameraHeight);
                const moveRate = Math.max(0.1, heightAbs / 100.0);
                const verticalActive = flags.moveUp || flags.moveDown;
                const allowSnap = !verticalActive;
                const ignoreCollision = verticalActive || ignoreCollisionUntilGrounded;

                const forwardDir = headingToDirection(camera.heading, camera.positionWC);
                const rightDir = headingToDirection(
                    Cesium.Math.negativePiToPi(camera.heading + Cesium.Math.toRadians(90.0)),
                    camera.positionWC
                );

                if (flags.moveForward)  moveWithCollision(forwardDir, moveRate * 3, allowSnap, ignoreCollision);
                if (flags.moveBackward) moveWithCollision(Cesium.Cartesian3.negate(forwardDir, new Cesium.Cartesian3()), moveRate, allowSnap, ignoreCollision);
                if (flags.moveLeft)     moveWithCollision(Cesium.Cartesian3.negate(rightDir, new Cesium.Cartesian3()), moveRate, allowSnap, ignoreCollision);
                if (flags.moveRight)    moveWithCollision(rightDir, moveRate, allowSnap, ignoreCollision);
                if (flags.moveUp)       moveVertical(moveRate);
                if (flags.moveDown)     moveVertical(-moveRate);

                // applyJump
                const upDir = viewer.scene.globe.ellipsoid.geodeticSurfaceNormal(
                    camera.positionWC,
                    new Cesium.Cartesian3()
                );
                const currentCarto = Cesium.Cartographic.fromCartesian(camera.positionWC);
                const currentHeight = currentCarto.height;
                const groundHeightRaw = getGroundHeightAt(camera.positionWC, upDir);
                if (groundHeightRaw !== null && groundHeightRaw >= 0) {
                    lastValidGroundHeight = groundHeightRaw;
                }
                const groundHeight = groundHeightRaw !== null
                    ? groundHeightRaw
                    : lastValidGroundHeight;
                const minHeight = groundHeight !== null
                    ? Math.max(groundHeight + EYE_HEIGHT, 0)
                    : null;

                if (currentHeight < 0 && groundHeight === null) {
                    currentCarto.height = Math.abs(currentHeight);
                    camera.position = Cesium.Cartesian3.fromRadians(
                        currentCarto.longitude,
                        currentCarto.latitude,
                        currentCarto.height
                    );
                }

                if (minHeight !== null && currentHeight <= minHeight + 1e-3) {
                    ignoreCollisionUntilGrounded = false;
                }

                if (jumpRequested) {
                    if (!jumpActive) {
                        jumpActive = true;
                        jumpStartTime = (typeof performance !== 'undefined' && performance.now)
                            ? performance.now()
                            : Date.now();
                        jumpBaseHeight = minHeight !== null ? minHeight : currentHeight;
                    }
                    jumpRequested = false;
                }

                if (jumpActive) {
                    const now = (typeof performance !== 'undefined' && performance.now)
                        ? performance.now()
                        : Date.now();
                    if (jumpStartTime === null) {
                        jumpStartTime = now;
                    }
                    if (minHeight !== null && jumpBaseHeight !== null && minHeight > jumpBaseHeight) {
                        jumpBaseHeight = minHeight;
                    }

                    const elapsed = (now - jumpStartTime) / 1000.0;
                    let t = elapsed / JUMP_DURATION;
                    if (t >= 1.0) {
                        t = 1.0;
                        jumpActive = false;
                    }

                    const jumpHeight = Math.max(JUMP_HEIGHT, moveRate * 2.0);
                    const offset = Math.sin(Math.PI * t) * jumpHeight;
                    const base = jumpBaseHeight !== null ? jumpBaseHeight : currentHeight;
                    let targetHeight = base + offset;
                    if (minHeight !== null && targetHeight < minHeight) {
                        targetHeight = minHeight;
                    }

                    currentCarto.height = targetHeight;
                    camera.position = Cesium.Cartesian3.fromRadians(
                        currentCarto.longitude,
                        currentCarto.latitude,
                        currentCarto.height
                    );

                    if (!jumpActive) {
                        jumpStartTime = null;
                        jumpBaseHeight = null;
                    }
                }
    }











    function freeHelpHtml() {
        return `
            <div id="freeHelp" class="free-help" role="dialog" aria-live="polite">
            <div class="row"><kbd>W / S</kbd><div>앞/뒤 이동</div></div>
            <div class="row"><kbd>A / D</kbd><div>좌/우 이동</div></div>
            <div class="row"><kbd>Q / E</kbd><div>상/하 이동</div></div>
            <div class="row"><kbd>마우스 드래그</kbd><div>회전(좌·우 / 상·하)</div></div>
            </div>
        `;
    }

    function placeFreeHelp() {
        const $tb = $(viewer.container);
        const $fh = $('#freeHelp');
        if (!$tb.length || !$fh.length) return;
        const r = $tb[0].getBoundingClientRect();
        // 툴바의 상단으로부터 약간 위(8px) 위치
        //const bottom = window.innerHeight - r.top + 8;
        $fh.css({ left: `${r.left + r.width / 2}px`, bottom: `8px`, transform: 'translateX(-50%)' });
    }

    function showHelp() {
            if ($('#freeHelp').length) return;
            $('body').append(freeHelpHtml());
            placeFreeHelp();
            $(window).on('resize.freehelp scroll.freehelp', placeFreeHelp);
    }

    function hideHelp() {
        $(window).off('.freehelp');
        $('#freeHelp').remove();
    }

    function enable() {
        if (!viewer) return;
        if (enabled) return;

        //기본 카메라 조작 끄기
        setDefaultControls(false);
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        jumpRequested = false;
        jumpActive = false;
        jumpStartTime = null;
        jumpBaseHeight = null;
        lastValidGroundHeight = null;

        viewer.canvas.setAttribute('tabindex', '0');
        viewer.canvas.focus();
           
        // 마우스 핸들러 설정
        if(!handler) handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        
        handler.setInputAction((movement)=>{
            looking = true;
            mousePosition = startMousePosition = Cesium.Cartesian3.clone(movement.position);
            headingTemp = viewer.camera.heading;
            pitchTemp  = Cesium.Math.clamp(viewer.camera.pitch, PITCH_MIN, PITCH_MAX);
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        handler.setInputAction((movement)=>{ 
            mousePosition = movement.endPosition; 
        },Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        handler.setInputAction(()=>{ 
            looking = false;
        },Cesium.ScreenSpaceEventType.LEFT_UP);

        // 키보드 등록
        window.addEventListener('keydown', keyDown, true);
        window.addEventListener('keyup', keyUp, true);

        //업데이트
        viewer.clock.onTick.addEventListener(onTick);

        // 도움말 보이기
        showHelp();

        enabled = true;
    }

    function disable() {
        if (!viewer) return;
        if (!enabled) return;
        // 업데이트 제거
        viewer.clock.onTick.removeEventListener(onTick);
        // 키보드 제거
        window.removeEventListener('keydown', keyDown, true);
        window.removeEventListener('keyup', keyUp, true);
        // 마우스 핸들러 제거
        if (handler) { handler.destroy(); handler = undefined; }
        looking = false;
        Object.keys(flags).forEach(k=> flags[k]=false);
        // 기본 카메라 조작 다시 켜기
        jumpRequested = false;
        jumpActive = false;
        jumpStartTime = null;
        jumpBaseHeight = null;
        lastValidGroundHeight = null;
        setDefaultControls(true);

        // 도움말 숨기기
        hideHelp();

        enabled = false;
    }

    return {enable, disable};
}
