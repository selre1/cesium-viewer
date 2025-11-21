var Measurement = (function () {
    var viewer, handler = null;
    var mode; // 'D' | 'A' | 'V' (거리 or 면적)
    var areaOptions = 'ground';
    var floatingPoint, activeShape;
    var activeShapePoints = [];
    var keydownHandler = null;
    var mouseLabel,prevCursor; //측정도구 라벨/커서

    // 확정된 것들(완료 후 남기는 엔티티)
    var measureEndEntity = { graphics: [], points: [], labels: [] };

    // 진행 중(세션) 엔티티: 취소 시 전부 제거
    var session = { points: [], labels: [], graphics: [] };

    function ensureHandler() {
        if (!handler) handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    }

    function logMissing(v, name) {
        if (!v) { console.log(name + '가 정의되지 않음'); return true; }
        return false;
    }

    function offHandler() {
        if (!handler) return;
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }

    function destroyHandler() {
        if (handler) {
            handler.destroy();
            handler = null;
        }
    }

    function resetSession() {
        // 진행 중 엔티티 제거
        session.graphics.forEach(function (g) { viewer.entities.remove(g); });
        session.points.forEach(function (p) { viewer.entities.remove(p); });
        session.labels.forEach(function (l) { viewer.entities.remove(l); });
        session.graphics = [];
        session.points = [];
        session.labels = [];

        // 진행 드로우 동적 제거
        if (activeShape) viewer.entities.remove(activeShape);
        if (floatingPoint) viewer.entities.remove(floatingPoint);
        activeShape = undefined;
        floatingPoint = undefined;
        activeShapePoints = [];
    }

    // 키보드 바인딩/해제 유틸
    function bindKeyboard() {
        var canvas = viewer.canvas;
        // 키보드 포커스 받을 수 있도록
        if (canvas.tabIndex !== 0) canvas.tabIndex = 0;
        // 클릭하면 포커스 이동
        canvas.addEventListener('click', function () { canvas.focus(); });

        keydownHandler = function (e) {
            if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
                // 진행 중 측정만 취소
                resetSession();
            }
        };
        canvas.addEventListener('keydown', keydownHandler);
    }

    function unbindKeyboard() {
        var canvas = viewer && viewer.canvas;
        if (canvas && keydownHandler) {
            canvas.removeEventListener('keydown', keydownHandler);
        }
        keydownHandler = null;
    }

    function createLabel(pos, text, options={}) {
        const LABEL_STYLE = {
            font: 'bold 10px Inter, Pretendard, system-ui, sans-serif',
            rowH: 22,          // 한 줄 높이
            padX: 8,          // 좌우 패딩
            radius: 11,        
            gap: 5,            // 줄 간격
            fg: '#FFFFFF',
            // 근/원 거리 스케일
            scale: 0.7,
            near: 250, nearScale: 1.0,
            far: 1800, farScale: 0.55
        };
        const parts = String(text).split(/\n/).map(s => s.trim()).filter(Boolean);
        const axes = ['경도', '위도', '높이'];
        const colors = ['#E53935', '#22C55E', '#1E88E5'];
        const lines = (parts.length > 1)
            ? parts.map((v, i) => {
                const unit = (i === 2) ? ' m' : '';   // 높이에만 단위
                return `${axes[i] || ''}${axes[i] ? ' : ' : ''}${v}${unit}`;
                })
            : [text];

        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        ctx.font = LABEL_STYLE.font;


        let maxTextW = 0;
        for (const s of lines) maxTextW = Math.max(maxTextW, Math.ceil(ctx.measureText(s).width));
        const w = maxTextW + LABEL_STYLE.padX * 2;
        const h = lines.length > 1
            ? (lines.length * LABEL_STYLE.rowH) + ((lines.length - 1) * LABEL_STYLE.gap)
            : LABEL_STYLE.rowH;
   
        var dpr = Math.min(1.5, window.devicePixelRatio || 1); // 너무 커지지 않게 상한
        canvas.width  = Math.max(2, Math.round(w * dpr));
        canvas.height = Math.max(2, Math.round(h * dpr));
        ctx.scale(dpr, dpr);

        ctx.font = LABEL_STYLE.font;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        // 라운드 사각형
        function roundRect(x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y,     x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x,     y + h, r);
            ctx.arcTo(x,     y + h, x,     y,     r);
            ctx.arcTo(x,     y,     x + w, y,     r);
            ctx.closePath();
        }

      
        let y = 0;
        for (let i = 0; i < lines.length; i++) {
            const bg = (lines.length > 1) ? (colors[i % colors.length]) : '#2F80FF';

            // 배경 pill
            ctx.fillStyle = bg;
            roundRect(0, y, w, LABEL_STYLE.rowH, LABEL_STYLE.radius);
            ctx.fill();

            // 텍스트
            ctx.fillStyle = LABEL_STYLE.fg;
            ctx.fillText(lines[i], w / 2, y + LABEL_STYLE.rowH / 2);

            y += LABEL_STYLE.rowH + (i < lines.length - 1 ? LABEL_STYLE.gap : 0);
        }

        const placeRight = options.point === true;
        const horizontalOrigin = placeRight ? Cesium.HorizontalOrigin.LEFT   : Cesium.HorizontalOrigin.CENTER;
        const verticalOrigin   = placeRight ? Cesium.VerticalOrigin.CENTER   : Cesium.VerticalOrigin.CENTER;
        const pixelOffset      = placeRight ? new Cesium.Cartesian2(12, 0)   : new Cesium.Cartesian2(0, -20);

        return viewer.entities.add({
            position: pos,
            billboard: {
                image: canvas,
                horizontalOrigin: horizontalOrigin,
                verticalOrigin: verticalOrigin,
           
                scale: LABEL_STYLE.scale,
                pixelOffset: pixelOffset,
             
                scaleByDistance: new Cesium.NearFarScalar(
                    LABEL_STYLE.near, LABEL_STYLE.nearScale,
                    LABEL_STYLE.far,  LABEL_STYLE.farScale
                ),
                eyeOffset: new Cesium.Cartesian3(0, 0, -1),
                heightReference: Cesium.HeightReference.NONE,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        });
    }

    function createPoint(pos) {
        return viewer.entities.add({
            position: pos,
            point: {
                pixelSize: 6,
                outlineWidth: 2,
                color: Cesium.Color.fromCssColorString('#FFFFFF'),
                outlineColor: Cesium.Color.fromCssColorString('#2F80FF'),
                // 건물 측정은 지면 클램핑 금지
                heightReference: Cesium.HeightReference.NONE,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        });
    }

    function drawShape(positionData, clickEvtType) {
        function getLineMaterial(isFinal) {
            return isFinal
            ? Cesium.Color.fromCssColorString('#2F80FF') // 확정: 실선
            : new Cesium.PolylineDashMaterialProperty({   // 진행중: 점선
                color: Cesium.Color.fromCssColorString('#2F80FF')
                // PolylineDash에는 glowPower 없음
            });
        }
        function addPolyline(positions, material) {
            return viewer.entities.add({
                polyline: {
                positions,
                clampToGround: false,
                arcType: Cesium.ArcType.NONE,
                width: 2.5,
                material,
                depthFailMaterial: material
                }
            });
        }
        function addPolygon(hierarchy) {
            return viewer.entities.add({
                polygon: {
                hierarchy,
                material: Cesium.Color.fromCssColorString('rgba(47,128,255,0.25)'),
                outline: true,
                outlineColor: Cesium.Color.fromCssColorString('#2F80FF'),
                outlineWidth: 1.5
                }
            });
        }

        const isFinal = (clickEvtType === Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        if (mode === 'D') {
            // 거리: 폴리라인
            return addPolyline(positionData, getLineMaterial(isFinal));
        }
        if(mode === 'A'){
            if (areaOptions === 'ground') {
                // 지면: 폴리곤
                return addPolygon(positionData);
            } else {
                // 표면: 폴리라인(진행중 점선 / 확정 실선)
                return addPolyline(positionData, getLineMaterial(isFinal));
            }
        }
    }

    function finalizeActive(clickEvtType) {
        if (!activeShape) return;

        function closeSurfaceRing(arr){
            // 점 두개 이상이면 닫힌 링을 생성
            return (arr.length > 2 && arr[0] !== arr[arr.length-1]) ? arr.concat([arr[0]]) : arr;
        }

        // MOUSE_MOVE에서 들어간 활성화 점 제거
        activeShapePoints.pop();

        var position;
        if(mode === 'A') {
            areaOptions === 'ground' ? 
            position = new Cesium.PolygonHierarchy(activeShapePoints) : position = closeSurfaceRing(activeShapePoints);
        }else{
            position = activeShapePoints
        }
        viewer.entities.remove(activeShape);
        activeShape = undefined;

        // 확정(라인/폴리곤)
        var finalShape = drawShape(position, clickEvtType);
        measureEndEntity.graphics.push(finalShape);

        // 커서 이동점만 제거
        if (floatingPoint) viewer.entities.remove(floatingPoint);
        floatingPoint = undefined;

        // 세션 엔티티는 viewer에서 제거하지 말고 확정 버킷으로 넘긴 뒤 배열만 비웁니다.
        Array.prototype.push.apply(measureEndEntity.points, session.points);
        Array.prototype.push.apply(measureEndEntity.labels, session.labels);
        session.points = [];
        session.labels = [];
        session.graphics = [];

        // 좌표 버퍼 리셋
        activeShapePoints = [];

        // 마우스 라벨 숨김
        hideMouseLabel();
    }

    function bindDrawing() {
        ensureHandler(); 
        function areaValue(points) {
            if (!points || points.length < 3) return 0;

            const p0 = points[0];
            let area = 0.0;
            for (let i = 1; i < points.length - 1; i++) {
                const v1 = Cesium.Cartesian3.subtract(points[i],     p0, new Cesium.Cartesian3());
                const v2 = Cesium.Cartesian3.subtract(points[i + 1], p0, new Cesium.Cartesian3());
                const cross = Cesium.Cartesian3.cross(v1, v2, new Cesium.Cartesian3());
                area += Cesium.Cartesian3.magnitude(cross) * 0.5; // 면적
            }
            return area; // m^2 (Cartesian3가 미터 스케일일 때)
        }

        // 더블클릭 시 카메라 트래킹 해제
        handler.setInputAction(function () {
            viewer.trackedEntity = undefined;
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        // LEFT_CLICK: 점 추가(거리/면적 공통)
        handler.setInputAction(async function (movement) {
            var cart = viewer.scene.pickPosition(movement.position);
            if (!Cesium.defined(cart)) return;
            if(mode === 'P'){
                const feature = viewer.scene.pick(movement.position);
                if (!Cesium.defined(feature)) {
                    return;
                }
                const cartographic = Cesium.Cartographic.fromCartesian(cart);
                const lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
                const lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
                const height = cartographic.height.toFixed(2);
                
                measureEndEntity.points.push(createPoint(cart))
                measureEndEntity.labels.push(createLabel(cart, `${lon}\n${lat}\n${height}`,{ point: true }))
                return;
            }

            if (mode === 'V') {
                const feature = viewer.scene.pick(movement.position);
                if (!Cesium.defined(feature)) return;
                await measureVerticalGapAt(movement.position);
                return; 
            }

            if (activeShapePoints.length === 0) { // 거리, 면적의 첫 포인트
                resetSession();
                floatingPoint = createPoint(cart);
                activeShapePoints.push(cart);
                var dynamicPositions;
                if (mode === 'D') {
                    dynamicPositions = new Cesium.CallbackProperty(function () {
                        return activeShapePoints;
                    }, false);
                } else { // 'ground'
                    if(areaOptions === 'ground'){
                        dynamicPositions = new Cesium.CallbackProperty(function () {
                        return new Cesium.PolygonHierarchy(activeShapePoints);
                        }, false);
                    }else{ // 'surface'
                        dynamicPositions = new Cesium.CallbackProperty(function () {
                            const pts = activeShapePoints;
                            if (pts.length === 0) return [];
                            return (pts.length > 1) ? pts.concat([pts[0]]) : pts; // 링 닫기
                        }, false);
                    }
                }
                activeShape = drawShape(dynamicPositions);
                session.graphics.push(activeShape);
            }
            if (activeShapePoints.length > 1 && mode === 'D') {
                var prev = activeShapePoints[activeShapePoints.length - 2];
                var dist = Cesium.Cartesian3.distance(cart, prev);
                var mid = Cesium.Cartesian3.midpoint(prev, cart, new Cesium.Cartesian3());
                var txt = dist > 1000 ? (dist / 1000).toFixed(3) + 'km' : dist.toFixed(2) + 'm';
                var segLabel = createLabel(mid, txt);
                session.labels.push(segLabel);
            }

            activeShapePoints.push(cart);
            var p = createPoint(cart);
            session.points.push(p);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // MOUSE_MOVE: 점선 갱신
        handler.setInputAction(function (movement) {
            showMouseLabelAt(movement.endPosition,setMouseLabelText(mode, areaOptions));
            if (!Cesium.defined(floatingPoint)) return;
            var np = viewer.scene.pickPosition(movement.endPosition);
            if (!Cesium.defined(np)) return;
            floatingPoint.position.setValue(np);
            activeShapePoints.pop();
            activeShapePoints.push(np);
            
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // RIGHT_CLICK: 종료(거리 또는 면적 확정)
        handler.setInputAction(function () {
            if (mode === 'A') {
                if (session.points.length < 3) {
                    alert('면적 측정 : 기본 3개 이상의 점이 필요합니다');
                    return;
                }
                if(areaOptions === 'ground'){
                    var hierarchy = activeShape.polygon.hierarchy.getValue();
                    var indices = Cesium.PolygonPipeline.triangulate(hierarchy.positions);
                    var area = 0;
                    for (var i = 0; i < indices.length; i += 3) {
                        var v1 = hierarchy.positions[indices[i]];
                        var v2 = hierarchy.positions[indices[i + 1]];
                        var v3 = hierarchy.positions[indices[i + 2]];
                        var vc = Cesium.Cartesian3.subtract(v2, v1, new Cesium.Cartesian3());
                        var vd = Cesium.Cartesian3.subtract(v3, v1, new Cesium.Cartesian3());
                        var cross = Cesium.Cartesian3.cross(vc, vd, new Cesium.Cartesian3());
                        area += Cesium.Cartesian3.magnitude(cross) / 2.0;
                    }
                    var txt = '면적 : ' + area.toFixed(2) + 'm²';
                    var center = Cesium.BoundingSphere.fromPoints(hierarchy.positions).center;
                    var areaLabel = createLabel(center, txt);
                    session.labels.push(areaLabel);
                }else{
                    const ring = activeShapePoints.slice(); // finalizeActive 전이라면 pop 안 했을 수도 있음
                    const area = areaValue(ring);
                    const center = Cesium.BoundingSphere.fromPoints(ring).center;
                    const label = createLabel(center, '면적 : ' + area.toFixed(2) + ' m²');
                    session.labels.push(label);
                }
            }
            finalizeActive(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    function ensureMouseLabel() {
        if (mouseLabel) return;
        mouseLabel = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(0,0,0),
            label: {
                font: '600 12px Inter, Pretendard, system-ui, sans-serif',

                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.fromCssColorString('rgba(0,0,0,0.85)'),
                outlineWidth: 3,

                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString('#444444ff').withAlpha(1),
                backgroundPadding: new Cesium.Cartesian2(8, 6),
        
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                verticalOrigin: Cesium.VerticalOrigin.TOP,
                pixelOffset: new Cesium.Cartesian2(12, 12),
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            show: false
        });
    }

    function setMouseLabelText(mode) {
        let text = `우클릭: 종료\nESC: 취소`;
        if (mode === 'V') {
            text = '좌클릭: 측정\nESC: 취소';
        }
        if (mode === 'P') {
            text = '좌클릭: 측정\nESC: 취소';
        }
        
        return text;
    }

    function showMouseLabelAt(screenPosition, text) {
        ensureMouseLabel();
        const scene = viewer.scene;

        // 화면 좌표 → 3D 좌표
        let cart = scene.pickPositionSupported ? scene.pickPosition(screenPosition) : undefined;
        if (!Cesium.defined(cart)) {
            cart = scene.camera.pickEllipsoid(screenPosition, scene.globe.ellipsoid);
        }

        if (!Cesium.defined(cart)) {
            mouseLabel.show = false;
            return;
        }

        // 위치 갱신
        mouseLabel.position = cart;
        mouseLabel.show = true;
        mouseLabel.label.show = true;
    }

    function hideMouseLabel() {
        if (mouseLabel) mouseLabel.label.show = false;
    }

    // 커서 스타일 토글
    function setDrawingCursor(on) {
        const canvas = viewer.canvas;
        if (!canvas) return;

        if (on) {
            if (!prevCursor) prevCursor = getComputedStyle(canvas).cursor; // 계산값 저장
            canvas.style.cursor = 'crosshair';
        } else {
            canvas.style.cursor = prevCursor || 'auto'; // '' 대신 'auto'로
            prevCursor = null;
        }
    }

    async function getTerrainHeightAt(cp) {
        const globe = viewer.scene.globe;
        const tp = globe.terrainProvider;                   
        try {
            if(tp.availability){
                if(tp.hasMetadata){
                    const [res] = await Cesium.sampleTerrainMostDetailed(tp, [cp]);
                    return res.height;
                }else{
                    return globe.getHeight(cp) ?? 0.0;
                }
            }
        } catch (e) {
            return globe.getHeight(cp) ?? 0.0;
        }
    }

    async function measureVerticalGapAt(screenPos) {
        const scene = viewer.scene;

        if (!scene.pickPositionSupported) return;
        const cartModel = scene.pickPosition(screenPos);
        if (!Cesium.defined(cartModel)) return;

        //위경도 변환
        const cg = Cesium.Cartographic.fromCartesian(cartModel);
        const modelHeight = cg.height; // m

        //같은 위치에서 지형 높이 샘플
        const cp = new Cesium.Cartographic(cg.longitude, cg.latitude, 0);

        let terrainHeight = await getTerrainHeightAt(cp);
        // 수직 거리 계산(+면 지면 위, -면 지면 아래)
        const dz = modelHeight - terrainHeight;
        const absDz = Math.abs(dz);

        //지면 점 3D 좌표
        const cartTerrain = Cesium.Cartesian3.fromRadians(
            cp.longitude, cp.latitude, terrainHeight
        );

        const verticalLine = viewer.entities.add({
            polyline: {
                positions: [cartModel, cartTerrain],
                width: 2.5,
                arcType: Cesium.ArcType.NONE,
                clampToGround: false,
                material: Cesium.Color.fromCssColorString('#fff200ff').withAlpha(1),
                depthFailMaterial: Cesium.Color.fromCssColorString('#fff200ff')
            }
        });
        measureEndEntity.graphics.push(verticalLine);

        // 라벨 위치: 중간점
        const label = createLabel(Cesium.Cartesian3.midpoint(cartModel, cartTerrain, new Cesium.Cartesian3()), `수직 거리: ${absDz.toFixed(2)} m`);
        measureEndEntity.labels.push(label);

        // 모델/지면 점에 작은 포인트
        const pModel = viewer.entities.add({
            position: cartModel,
            point: { 
                pixelSize: 6, 
                color: Cesium.Color.WHITE, 
                disableDepthTestDistance: Number.POSITIVE_INFINITY 
            }
        });
        measureEndEntity.points.push(pModel);

        // 지면포인트
        const pTerr = viewer.entities.add({
            position: cartTerrain,
            point: { 
                pixelSize: 6, 
                color: Cesium.Color.WHITE, 
                outlineColor: Cesium.Color.BLACK, 
                outlineWidth: 1.5, 
                disableDepthTestDistance: Number.POSITIVE_INFINITY 
            }
        });
        measureEndEntity.points.push(pTerr);

        return { verticalLine, label, pModel, pTerr };
    }

    return {
        init: function (objMap) {
            viewer = objMap && objMap.cesiumViewer;
   

            if (logMissing(viewer, 'viewer')) return false;
            return true;
        },
        start: function (m) {
            mode = m;
            resetSession();
            offHandler();
            destroyHandler(); 

            bindDrawing();
            bindKeyboard();
            ensureMouseLabel();
            mouseLabel.label.text = setMouseLabelText(mode, areaOptions); 
            setDrawingCursor(true);
        },
        stop: function(){
            offHandler();
            destroyHandler();
            
            resetSession(); 
            unbindKeyboard()
            hideMouseLabel(); 
            setDrawingCursor(false); 
            mode=undefined;
             $(".tool-root").find('.tool').removeClass('is-active');
        },
        // 확정된 엔티티 전체 제거
        removeAll: function () {
            measureEndEntity.graphics.forEach(function (g) { viewer.entities.remove(g); });
            measureEndEntity.points.forEach(function (p) { viewer.entities.remove(p); });
            measureEndEntity.labels.forEach(function (l) { viewer.entities.remove(l); });
            measureEndEntity.graphics = [];
            measureEndEntity.points = [];
            measureEndEntity.labels = [];
        },
        setAreaMode: function (mode) {
            // 'ground' | 'surface' 만 허용
            areaOptions = (mode === 'surface') ? 'surface' : 'ground';
        },
        mountToolBar({container, onPoint, onLine, onVertical, onAreaGround, onAreaSurface, 
            onClose, onInit ,onMarkerAdd, onMarkerClose}){
            const root = (typeof container === 'string') ? document.querySelector(container) : container;
            if (!root) { throw new Error('Tool Bar 생성: 유효한 container가 필요합니다.'); }

            if (!document.getElementById('dynamic-toolbar-style')) {
                const css = `
                .tool-root{
                    position:absolute;
                    left:50%;
                    bottom:16px;
                    transform:translateX(-50%);
                    display:flex;
                    flex-direction:column;
                    gap:8px;
                    z-index:4000;
                    font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans KR",sans-serif;
                }
                .tool-group-bar{
                    display:inline-flex;
                    align-items:center;
                    gap:6px;
                    padding:4px;
                    border-radius:999px;
                    background:rgba(11,14,18,.96);
                    border:1px solid #222a33;
                }
                .tool-group{
                    appearance:none;
                    border:0;
                    outline:0;
                    border-radius:999px;
                    padding:0 16px;
                    height:32px;
                    display:inline-flex;
                    align-items:center;
                    justify-content:center;
                    font-size:11px;
                    color:#d0d7e2;
                    background:transparent;
                    cursor:pointer;
                    white-space:nowrap;
                }
                .tool-group.is-active{
                    background:#2f80ff;
                    color:#fff;
                }

                .tool-panel{
                    display: none;
                    flex-direction: column;
                    /* gap: 8px; */
                    min-width: 275px;
                    max-width: calc(100vw - 19px);
                    padding: 3px 3px;
                    border-radius: 16px;
                    background: rgb(11 14 18 / 83%);
                    border: 1px solid #222a33;
                }
                .tool-panel.is-open{
                    display:flex;
                }

                .tool-panel-main{
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:12px;
                }
                .tool-chip-row{
                    display:flex;
                    /*flex-wrap:wrap;*/
                    gap:6px;
                }
                .tool{
                    border: none;
                    color: #ffffff;
                    padding: 6px 10px;
                    font-size: 11px;
                    cursor: pointer;
                    user-select: none;
                    background: transparent
                }
                .tool:hover {
                    color: #fff;
                    fill: none;
                    background: transparent;
                    box-shadow: 0 0 3px #fff;
                }
                .tool.is-active{
                    background: #6565652e;
                    color: #fff;
                }

                .tool-panel-footer{
                    display:flex;
                    align-items:center;
                    justify-content:end;
                    margin-top:4px;
                    padding-top:6px;
                    border-top:1px solid rgba(255,255,255,.06);
                    font-size:12px;
                    color:#9ca6b5;
                }
                

                @media (max-width: 480px){
                    .tool-panel{
                        min-width:auto;
                    }
                }
                `;
                const style = document.createElement('style');
                style.id = 'dynamic-toolbar-style';
                style.textContent = css;
                document.head.appendChild(style);
            }

            // 툴바 DOM 생성(중복 방지)
            let toolRoot = root.querySelector('.tool-root');
            if (!toolRoot) {
                toolRoot = document.createElement('div');
                toolRoot.className = 'tool-root';
                toolRoot.innerHTML = `
                    <!-- 측정 패널 -->
                    <div class="tool-panel tool-panel--measure" data-panel="measure">
                        <div class="tool-panel-main">
                            <div class="tool-chip-row">
                                <button class="tool cesium-button" id="btn_point">
                                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" class="size-5 flex-shrink-0"><path d="M2.46481 16.6006C2.82352 16.3935 3.28213 16.5163 3.48923 16.875C3.69629 17.2337 3.5734 17.6923 3.21481 17.8994L2.3486 18.3994C1.98989 18.6065 1.5313 18.4837 1.32419 18.125C1.11709 17.7663 1.23994 17.3077 1.5986 17.1006L2.46481 16.6006ZM18.5107 16.875C18.7178 16.5163 19.1764 16.3936 19.5351 16.6006L20.4013 17.1006C20.76 17.3077 20.8829 17.7663 20.6757 18.125C20.4686 18.4837 20.01 18.6065 19.6513 18.3994L18.7851 17.8994C18.4266 17.6923 18.3037 17.2336 18.5107 16.875ZM6.14548 14.4756C6.50418 14.2685 6.9628 14.3913 7.16989 14.75C7.37695 15.1087 7.25407 15.5673 6.89548 15.7744L6.02926 16.2744C5.67056 16.4815 5.21197 16.3587 5.00485 16C4.79776 15.6413 4.9206 15.1827 5.27926 14.9756L6.14548 14.4756ZM14.83 14.75C15.0371 14.3913 15.4958 14.2686 15.8545 14.4756L16.7207 14.9756C17.0794 15.1827 17.2022 15.6413 16.9951 16C16.788 16.3587 16.3294 16.4815 15.9707 16.2744L15.1045 15.7744C14.7459 15.5673 14.623 15.1086 14.83 14.75ZM11 9.5C12.6568 9.5 14 10.8431 14 12.5C14 14.1569 12.6568 15.5 11 15.5C9.34313 15.5 7.99997 14.1568 7.99997 12.5C7.99997 10.8432 9.34313 9.50002 11 9.5ZM11 11C10.1716 11 9.49997 11.6716 9.49997 12.5C9.49997 13.3284 10.1716 14 11 14C11.8284 14 12.5 13.3284 12.5 12.5C12.5 11.6716 11.8284 11 11 11ZM11 5.5C11.4142 5.5 11.75 5.83579 11.75 6.25V7.25C11.75 7.66421 11.4142 8 11 8C10.5858 7.99998 10.25 7.6642 10.25 7.25V6.25C10.25 5.8358 10.5858 5.50002 11 5.5ZM11 1.25C11.4142 1.25 11.75 1.58579 11.75 2V3C11.75 3.41421 11.4142 3.75 11 3.75C10.5858 3.74998 10.25 3.4142 10.25 3V2C10.25 1.5858 10.5858 1.25002 11 1.25Z" fill="currentColor"></path></svg>
                                </button>
                                <button class="tool cesium-button" id="btn_line">
                                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" class="size-5 flex-shrink-0"><path d="M3 16C4.65685 16 6 17.3431 6 19C6 20.6569 4.65685 22 3 22C1.34315 22 0 20.6569 0 19C0 17.3431 1.34315 16 3 16ZM3 17.5C2.17157 17.5 1.5 18.1716 1.5 19C1.5 19.8284 2.17157 20.5 3 20.5C3.82843 20.5 4.5 19.8284 4.5 19C4.5 18.1716 3.82843 17.5 3 17.5ZM7.07324 13.8662C7.36614 13.5733 7.8409 13.5733 8.13379 13.8662C8.42668 14.1591 8.42668 14.6339 8.13379 14.9268L7.42676 15.6338C7.13386 15.9267 6.6591 15.9267 6.36621 15.6338C6.07332 15.3409 6.07332 14.8661 6.36621 14.5732L7.07324 13.8662ZM10.8232 10.1162C11.1161 9.82332 11.5909 9.82332 11.8838 10.1162C12.1767 10.4091 12.1767 10.8839 11.8838 11.1768L11.1768 11.8838C10.8839 12.1767 10.4091 12.1767 10.1162 11.8838C9.82332 11.5909 9.82332 11.1161 10.1162 10.8232L10.8232 10.1162ZM14.5732 6.36621C14.8661 6.07332 15.3409 6.07332 15.6338 6.36621C15.9267 6.6591 15.9267 7.13386 15.6338 7.42676L14.9268 8.13379C14.6339 8.42668 14.1591 8.42668 13.8662 8.13379C13.5733 7.8409 13.5733 7.36614 13.8662 7.07324L14.5732 6.36621ZM19 0C20.6569 0 22 1.34315 22 3C22 4.65685 20.6569 6 19 6C17.3431 6 16 4.65685 16 3C16 1.34315 17.3431 0 19 0ZM19 1.5C18.1716 1.5 17.5 2.17157 17.5 3C17.5 3.82843 18.1716 4.5 19 4.5C19.8284 4.5 20.5 3.82843 20.5 3C20.5 2.17157 19.8284 1.5 19 1.5Z" fill="currentColor"></path></svg>
                                </button>
                                
                                <button class="tool cesium-button" id="btn_vertical">
                                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" class="size-5 flex-shrink-0"><path d="M11 16C12.3976 16 13.569 16.9565 13.9023 18.25H19C19.4142 18.25 19.75 18.5858 19.75 19C19.75 19.4142 19.4142 19.75 19 19.75H13.9023C13.569 21.0435 12.3976 22 11 22C9.59958 22 8.42628 21.0397 8.0957 19.7422C8.06429 19.7462 8.0325 19.75 8 19.75H3C2.58579 19.75 2.25 19.4142 2.25 19C2.25 18.5858 2.58579 18.25 3 18.25H8C8.03246 18.25 8.06433 18.2528 8.0957 18.2568C8.4266 16.9598 9.59991 16 11 16ZM11 17.5C10.1716 17.5 9.5 18.1716 9.5 19C9.5 19.8284 10.1716 20.5 11 20.5C11.8284 20.5 12.5 19.8284 12.5 19C12.5 18.1716 11.8284 17.5 11 17.5ZM11 11.75C11.4142 11.75 11.75 12.0858 11.75 12.5V13.5C11.75 13.9142 11.4142 14.25 11 14.25C10.5858 14.25 10.25 13.9142 10.25 13.5V12.5C10.25 12.0858 10.5858 11.75 11 11.75ZM11 7.75C11.4142 7.75 11.75 8.08579 11.75 8.5V9.5C11.75 9.91421 11.4142 10.25 11 10.25C10.5858 10.25 10.25 9.91421 10.25 9.5V8.5C10.25 8.08579 10.5858 7.75 11 7.75ZM11 0C12.3976 0 13.569 0.956465 13.9023 2.25H19C19.4142 2.25 19.75 2.58579 19.75 3C19.75 3.41421 19.4142 3.75 19 3.75H13.9023C13.569 5.04354 12.3976 6 11 6C9.59958 6 8.42628 5.03968 8.0957 3.74219C8.06429 3.7462 8.0325 3.75 8 3.75H3C2.58579 3.75 2.25 3.41421 2.25 3C2.25 2.58579 2.58579 2.25 3 2.25H8C8.03246 2.25 8.06433 2.25284 8.0957 2.25684C8.4266 0.959806 9.59991 0 11 0ZM11 1.5C10.1716 1.5 9.5 2.17157 9.5 3C9.5 3.82843 10.1716 4.5 11 4.5C11.8284 4.5 12.5 3.82843 12.5 3C12.5 2.17157 11.8284 1.5 11 1.5Z" fill="currentColor"></path></svg>
                                </button>
                                <button class="tool cesium-button" id="btn_ground">
                                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g transform="rotate(315 13 7.5) scale(0.8)">
                                        <path d="M3 16C4.65685 16 6 17.3431 6 19C6 20.6569 4.65685 22 3 22C1.34315 22 0 20.6569 0 19C0 17.3431 1.34315 16 3 16ZM19 16C20.6569 16 22 17.3431 22 19C22 20.6569 20.6569 22 19 22C17.3431 22 16 20.6569 16 19C16 17.3431 17.3431 16 19 16ZM3 17.5C2.17157 17.5 1.5 18.1716 1.5 19C1.5 19.8284 2.17157 20.5 3 20.5C3.82843 20.5 4.5 19.8284 4.5 19C4.5 18.1716 3.82843 17.5 3 17.5ZM19 17.5C18.1716 17.5 17.5 18.1716 17.5 19C17.5 19.8284 18.1716 20.5 19 20.5C19.8284 20.5 20.5 19.8284 20.5 19C20.5 18.1716 19.8284 17.5 19 17.5ZM9.5 18.25C9.91421 18.25 10.25 18.5858 10.25 19C10.25 19.4142 9.91421 19.75 9.5 19.75H8.5C8.08579 19.75 7.75 19.4142 7.75 19C7.75 18.5858 8.08579 18.25 8.5 18.25H9.5ZM13.5 18.25C13.9142 18.25 14.25 18.5858 14.25 19C14.25 19.4142 13.9142 19.75 13.5 19.75H12.5C12.0858 19.75 11.75 19.4142 11.75 19C11.75 18.5858 12.0858 18.25 12.5 18.25H13.5ZM3 11.75C3.41421 11.75 3.75 12.0858 3.75 12.5V13.5C3.75 13.9142 3.41421 14.25 3 14.25C2.58579 14.25 2.25 13.9142 2.25 13.5V12.5C2.25 12.0858 2.58579 11.75 3 11.75ZM19 11.75C19.4142 11.75 19.75 12.0858 19.75 12.5V13.5C19.75 13.9142 19.4142 14.25 19 14.25C18.5858 14.25 18.25 13.9142 18.25 13.5V12.5C18.25 12.0858 18.5858 11.75 19 11.75ZM3 7.75C3.41421 7.75 3.75 8.08579 3.75 8.5V9.5C3.75 9.91421 3.41421 10.25 3 10.25C2.58579 10.25 2.25 9.91421 2.25 9.5V8.5C2.25 8.08579 2.58579 7.75 3 7.75ZM19 7.75C19.4142 7.75 19.75 8.08579 19.75 8.5V9.5C19.75 9.91421 19.4142 10.25 19 10.25C18.5858 10.25 18.25 9.91421 18.25 9.5V8.5C18.25 8.08579 18.5858 7.75 19 7.75ZM3 0C4.65685 0 6 1.34315 6 3C6 4.65685 4.65685 6 3 6C1.34315 6 0 4.65685 0 3C0 1.34315 1.34315 0 3 0ZM19 0C20.6569 0 22 1.34315 22 3C22 4.65685 20.6569 6 19 6C17.3431 6 16 4.65685 16 3C16 1.34315 17.3431 0 19 0ZM3 1.5C2.17157 1.5 1.5 2.17157 1.5 3C1.5 3.82843 2.17157 4.5 3 4.5C3.82843 4.5 4.5 3.82843 4.5 3C4.5 2.17157 3.82843 1.5 3 1.5ZM19 1.5C18.1716 1.5 17.5 2.17157 17.5 3C17.5 3.82843 18.1716 4.5 19 4.5C19.8284 4.5 20.5 3.82843 20.5 3C20.5 2.17157 19.8284 1.5 19 1.5ZM9.5 2.25C9.91421 2.25 10.25 2.58579 10.25 3C10.25 3.41421 9.91421 3.75 9.5 3.75H8.5C8.08579 3.75 7.75 3.41421 7.75 3C7.75 2.58579 8.08579 2.25 8.5 2.25H9.5ZM13.5 2.25C13.9142 2.25 14.25 2.58579 14.25 3C14.25 3.41421 13.9142 3.75 13.5 3.75H12.5C12.0858 3.75 11.75 3.41421 11.75 3C11.75 2.58579 12.0858 2.25 12.5 2.25H13.5Z" fill="currentColor"></path>
                                    </g>
                                    <rect x="2" y="20.2" width="18" height="1.1" rx="0.55" fill="currentColor"></rect>
                                    </svg>
                                </button>
                                <button class="tool cesium-button" id="btn_surface">
                                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" class="size-5 flex-shrink-0"><path d="M3 16C4.65685 16 6 17.3431 6 19C6 20.6569 4.65685 22 3 22C1.34315 22 0 20.6569 0 19C0 17.3431 1.34315 16 3 16ZM19 16C20.6569 16 22 17.3431 22 19C22 20.6569 20.6569 22 19 22C17.3431 22 16 20.6569 16 19C16 17.3431 17.3431 16 19 16ZM3 17.5C2.17157 17.5 1.5 18.1716 1.5 19C1.5 19.8284 2.17157 20.5 3 20.5C3.82843 20.5 4.5 19.8284 4.5 19C4.5 18.1716 3.82843 17.5 3 17.5ZM19 17.5C18.1716 17.5 17.5 18.1716 17.5 19C17.5 19.8284 18.1716 20.5 19 20.5C19.8284 20.5 20.5 19.8284 20.5 19C20.5 18.1716 19.8284 17.5 19 17.5ZM9.5 18.25C9.91421 18.25 10.25 18.5858 10.25 19C10.25 19.4142 9.91421 19.75 9.5 19.75H8.5C8.08579 19.75 7.75 19.4142 7.75 19C7.75 18.5858 8.08579 18.25 8.5 18.25H9.5ZM13.5 18.25C13.9142 18.25 14.25 18.5858 14.25 19C14.25 19.4142 13.9142 19.75 13.5 19.75H12.5C12.0858 19.75 11.75 19.4142 11.75 19C11.75 18.5858 12.0858 18.25 12.5 18.25H13.5ZM3 11.75C3.41421 11.75 3.75 12.0858 3.75 12.5V13.5C3.75 13.9142 3.41421 14.25 3 14.25C2.58579 14.25 2.25 13.9142 2.25 13.5V12.5C2.25 12.0858 2.58579 11.75 3 11.75ZM19 11.75C19.4142 11.75 19.75 12.0858 19.75 12.5V13.5C19.75 13.9142 19.4142 14.25 19 14.25C18.5858 14.25 18.25 13.9142 18.25 13.5V12.5C18.25 12.0858 18.5858 11.75 19 11.75ZM3 7.75C3.41421 7.75 3.75 8.08579 3.75 8.5V9.5C3.75 9.91421 3.41421 10.25 3 10.25C2.58579 10.25 2.25 9.91421 2.25 9.5V8.5C2.25 8.08579 2.58579 7.75 3 7.75ZM19 7.75C19.4142 7.75 19.75 8.08579 19.75 8.5V9.5C19.75 9.91421 19.4142 10.25 19 10.25C18.5858 10.25 18.25 9.91421 18.25 9.5V8.5C18.25 8.08579 18.5858 7.75 19 7.75ZM3 0C4.65685 0 6 1.34315 6 3C6 4.65685 4.65685 6 3 6C1.34315 6 0 4.65685 0 3C0 1.34315 1.34315 0 3 0ZM19 0C20.6569 0 22 1.34315 22 3C22 4.65685 20.6569 6 19 6C17.3431 6 16 4.65685 16 3C16 1.34315 17.3431 0 19 0ZM3 1.5C2.17157 1.5 1.5 2.17157 1.5 3C1.5 3.82843 2.17157 4.5 3 4.5C3.82843 4.5 4.5 3.82843 4.5 3C4.5 2.17157 3.82843 1.5 3 1.5ZM19 1.5C18.1716 1.5 17.5 2.17157 17.5 3C17.5 3.82843 18.1716 4.5 19 4.5C19.8284 4.5 20.5 3.82843 20.5 3C20.5 2.17157 19.8284 1.5 19 1.5ZM9.5 2.25C9.91421 2.25 10.25 2.58579 10.25 3C10.25 3.41421 9.91421 3.75 9.5 3.75H8.5C8.08579 3.75 7.75 3.41421 7.75 3C7.75 2.58579 8.08579 2.25 8.5 2.25H9.5ZM13.5 2.25C13.9142 2.25 14.25 2.58579 14.25 3C14.25 3.41421 13.9142 3.75 13.5 3.75H12.5C12.0858 3.75 11.75 3.41421 11.75 3C11.75 2.58579 12.0858 2.25 12.5 2.25H13.5Z" fill="currentColor"></path>
                                    </svg>
                                    </button>
                            </div>
                        </div>
                        <div class="tool-panel-footer">
                            <button class="tool cesium-button" id="btn_init">초기화</button>
                            <button class="tool cesium-button" id="btn_close">종료</button>
                        </div>
                    </div>

                    <!-- 마커 패널 -->
                    <div class="tool-panel tool-panel--marker" data-panel="marker">
                        <div class="tool-panel-main">
                            <div class="tool-chip-row">
                                <button class="tool cesium-button" id="btn_marker_point">포인트 마커</button>
                                <button class="tool cesium-button" id="btn_marker_line">라인 마커</button>
                            </div>
                        </div>
                        <div class="tool-panel-footer">
                            <button class="tool cesium-button" id="btn_marker_init">초기화</button>
                            <button class="tool cesium-button" id="btn_marker_close">종료</button>
                        </div>
                    </div>
                    <!-- 도구 그룹-->
                    <div class="tool-group-bar">
                        <button class="tool-group" id="group-measure">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide size-5 lucide-ruler-icon lucide-ruler size-5"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"></path><path d="m14.5 12.5 2-2"></path><path d="m11.5 9.5 2-2"></path><path d="m8.5 6.5 2-2"></path><path d="m17.5 15.5 2-2"></path></svg>
                        </button>
                        <button class="tool-group" id="group-marker">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-5"><path d="M6.5 18.4999H16.5C17.6046 18.4999 18.5 17.6044 18.5 16.4999C18.5 15.3953 17.6046 14.4999 16.5 14.4999H3.5C2.39543 14.4999 1.5 13.6044 1.5 12.4999C1.5 11.3953 2.39543 10.4999 3.5 10.4999H7.5M17.815 4.52155C18.147 4.18958 18.3335 3.73935 18.3335 3.26988C18.3335 2.80041 18.147 2.35018 17.815 2.01821C17.483 1.68625 17.0328 1.49976 16.5633 1.49976C16.0939 1.49976 15.6436 1.68625 15.3117 2.01821L10.97 6.36155C10.7719 6.55956 10.6269 6.80432 10.5483 7.07321L9.85083 9.46488C9.82992 9.53659 9.82867 9.6126 9.8472 9.68496C9.86574 9.75731 9.90339 9.82336 9.95621 9.87617C10.009 9.92899 10.0751 9.96664 10.1474 9.98518C10.2198 10.0037 10.2958 10.0025 10.3675 9.98155L12.7592 9.28405C13.0281 9.20553 13.2728 9.06051 13.4708 8.86238L17.815 4.52155Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        </button>
                    </div>
                `;
                root.appendChild(toolRoot);
            }

            const $rootWrap      = $(toolRoot);
            const $groupMeasure  = $rootWrap.find('#group-measure');
            const $groupMarker   = $rootWrap.find('#group-marker');
            const $measurePanel  = $rootWrap.find('.tool-panel--measure');
            const $markerPanel   = $rootWrap.find('.tool-panel--marker');

            const $tools       = $measurePanel.find('.tool');
            const $btnPoint    = $measurePanel.find('#btn_point');
            const $btnLine     = $measurePanel.find('#btn_line');
            const $btnVert     = $measurePanel.find('#btn_vertical');
            const $btnAreaG    = $measurePanel.find('#btn_ground');
            const $btnAreaS    = $measurePanel.find('#btn_surface');
            const $btnInit     = $measurePanel.find('#btn_init');
            const $btnClose    = $measurePanel.find('#btn_close');

            // 마커 패널 버튼
            const $btnMarkerClose = $markerPanel.find('#btn_marker_close');
            const $btnMarkerInit = $markerPanel.find('#btn_marker_init');

            let measureOpen = false;
            let markerOpen  = false;

            function setActive($btn){ $tools.removeClass('is-active'); $btn.addClass('is-active'); }
            function clearActive(){ $tools.removeClass('is-active'); }


            function openMeasurePanel(){
                measureOpen = true;
                markerOpen  = false;
                $measurePanel.addClass('is-open');
                $markerPanel.removeClass('is-open');
                $groupMeasure.addClass('is-active');
                $groupMarker.removeClass('is-active');
            }

            function openMarkerPanel(){
                markerOpen  = true;
                measureOpen = false;
                $markerPanel.addClass('is-open');
                $measurePanel.removeClass('is-open');
                $groupMarker.addClass('is-active');
                $groupMeasure.removeClass('is-active');
            }

            function closeAllPanels(){
                measureOpen = false;
                markerOpen  = false;
                $measurePanel.removeClass('is-open');
                $markerPanel.removeClass('is-open');
                $groupMeasure.removeClass('is-active');
                $groupMarker.removeClass('is-active');
                clearActive();
            }

            function hiddenMountToolBar(){
                $rootWrap.css("display", "none");
                closeAllPanels();
            }
            function showMountToolBar(){
                $rootWrap.css("display", "flex");
                closeAllPanels();
            }

            $groupMeasure.on('click', () => {
                if (measureOpen) {
                    closeAllPanels();
                    onClose?.();   // 측정 세션 종료
                } else {
                    openMeasurePanel();
                }
            });

            $groupMarker.on('click', () => {
                alert('해당 서비스 준비중입니다.');
                if (markerOpen) {
                    closeAllPanels();
                } else { // 마커그룹 활성화 -> 측정도구 그룹 초기화
                    openMarkerPanel();
                    onClose?.();   // 측정 세션 종료
                }
            });

             // --- 측정 패널 기본 동작 -----

            $btnPoint.on('click', () => {
                setActive($btnPoint);
                onPoint?.();
            });

            $btnLine.on('click', () => {
                setActive($btnLine);
                onLine?.();
            });

            $btnVert.on('click', () => {
                setActive($btnVert);
                onVertical?.();
            });

            $btnAreaG.on('click', () => {
                setActive($btnAreaG);
                onAreaGround?.();
            });

            $btnAreaS.on('click', () => {
                setActive($btnAreaS);
                onAreaSurface?.();
            });

            $btnInit.on('click', () => {
                clearActive();
                onInit?.();
            });

            // 측정종료 + 패널 접기
            $btnClose.on('click', () => {
                clearActive();
                onClose?.();
                closeAllPanels();
            });

            // 마커 패널 기본 동작
            $btnMarkerInit.on('click', () => {
               // 마커  초기화 기능
            });

            $btnMarkerClose.on('click', () => {
                closeAllPanels();
                // 마커 기능 종료
            });

           return {
                showMountToolBar,
                hiddenMountToolBar,
                root: toolRoot
            };
        }
    };
})();

export default Measurement;
