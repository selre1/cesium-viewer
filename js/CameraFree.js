const CameraFree = (function(){
    let viewer, handler;
    let enable;
    let looking = false;
    let startMousePosition, mousePosition;

    const SENS = 0.25; // 마우스 감도
     // 마우스 회전 감도와 피치 한계
    const PITCH_MIN = Cesium.Math.toRadians(-89.0);
    const PITCH_MAX = Cesium.Math.toRadians( 89.0);

    // 드래그 시작 시 기준 각도 저장
    let headingTemp = 0.0;
    let pitchTemp   = 0.0;
    
    const flags = {
        moveForward:false, 
        moveBackward:false, 
        moveUp:false, 
        moveDown:false, 
        moveLeft:false, 
        moveRight:false
    };

    const keyDown = (e) => {
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

    function onTick() {
        const camera = viewer.camera;
        const canvas = viewer.canvas;
        const ellipsoid = viewer.scene.globe.ellipsoid;
        // 마우스 좌/우, 상/하만 반영 (roll=0 고정)
        if (looking) {
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;

            const dx = (mousePosition.x - startMousePosition.x) / w;   // 좌우 이동량
            const dy = (mousePosition.y - startMousePosition.y) / h;   // 상하 이동량

            // 화면 이동량을 각도(라디안)로 변환
            const dHeading = Cesium.Math.toRadians(dx * 180 * SENS);   // 좌우가 반대로 느껴지면 부호를 -로
            const dPitch   = Cesium.Math.toRadians(-dy * 180 * SENS);

            let newHeading = headingTemp + dHeading;
            let newPitch   = Cesium.Math.clamp(pitchTemp + dPitch, PITCH_MIN, PITCH_MAX);

            // 정규화 및 roll=0 고정
            newHeading = Cesium.Math.negativePiToPi(newHeading);

            camera.setView({
                orientation: new Cesium.HeadingPitchRoll(newHeading, newPitch, 0.0)
            });
        }
        const cameraHeight = ellipsoid.cartesianToCartographic(camera.position).height;
        const moveRate = cameraHeight / 100.0;
        if (flags.moveForward)  camera.moveForward(moveRate);
        if (flags.moveBackward) camera.moveBackward(moveRate);
        if (flags.moveUp)       camera.moveUp(moveRate);
        if (flags.moveDown)     camera.moveDown(moveRate);
        if (flags.moveLeft)     camera.moveLeft(moveRate);
        if (flags.moveRight)    camera.moveRight(moveRate);
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

    return {
        init(v) {
            viewer = v;
            return this;
        },
        enable() {
            if (!viewer) return;
            if (enable) return;
            //기본 카메라 조작 끄기
            setDefaultControls(false);
            viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
           
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
            document.addEventListener('keydown', keyDown);
            document.addEventListener('keyup',   keyUp);

            //업데이트
            viewer.clock.onTick.addEventListener(onTick);
            this.showHelp();

            enable = true;
        },
        disable() {
            if (!viewer) return;
            if (!enable) return;
            // 업데이트 제거
            viewer.clock.onTick.removeEventListener(onTick);
            // 키보드 제거
            document.removeEventListener('keydown', keyDown);
            document.removeEventListener('keyup',   keyUp);
            // 마우스 핸들러 제거
            if (handler) { handler.destroy(); handler = undefined; }
            looking = false;
            Object.keys(flags).forEach(k=> flags[k]=false);
            // 기본 카메라 조작 다시 켜기
            setDefaultControls(true);
            this.hideHelp();
            enable = false;
        },
        showHelp() {
            if ($('#freeHelp').length) return;
            $('body').append(freeHelpHtml());
            placeFreeHelp();
            $(window).on('resize.freehelp scroll.freehelp', placeFreeHelp);
        },
        hideHelp() {
            $(window).off('.freehelp');
            $('#freeHelp').remove();
        }
    }
})();
export default CameraFree;