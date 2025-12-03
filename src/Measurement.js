import {TOOLBAR_STYLE_ID,TOOLBAR_CSS,TOOLBAR_HTML} from './UiTemplates.js';

export function Measurement({cesiumViewer}){
    let viewer = cesiumViewer;
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    let mode; // 'D' | 'A' | 'V' || 'C' (거리 or 면적 or 수직 or 단면적)
    let areaOptions = 'ground';
    let activeShape;
    let activeShapePoints = [];
    let keydownHandler = null;
    let mouseLabel,prevCursor; //측정도구 라벨/커서

    // 확정된 것들(완료 후 남기는 엔티티)
    let measureEndEntity = { graphics: [], points: [], labels: [] };

    // 진행 중(세션) 엔티티: 취소 시 전부 제거
    let session = { points: [], labels: [], graphics: [] };

    function offHandler() {
        if (!handler) return;
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
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
        activeShape = undefined;
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
            font: 'bold 11px Inter, Pretendard, system-ui, sans-serif',
            rowH: 22,          // 한 줄 높이
            padX: 8,          // 좌우 패딩
            radius: 11,        
            gap: 5,            // 줄 간격
            fg: '#FFFFFF',
            scale: 1,
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
 
        const canvasLabel = viewer.entities.add({
            position: pos,
            billboard: {
                image: canvas,
                horizontalOrigin: horizontalOrigin,
                verticalOrigin: verticalOrigin,
           
                scale: LABEL_STYLE.scale,
                pixelOffset: pixelOffset,
             
                // scaleByDistance: new Cesium.NearFarScalar(
                //     LABEL_STYLE.near, LABEL_STYLE.nearScale,
                //     LABEL_STYLE.far,  LABEL_STYLE.farScale
                // ),
                eyeOffset: new Cesium.Cartesian3(0, 0, -1),
                heightReference: Cesium.HeightReference.NONE,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        });
        return canvasLabel;
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
            // ellipsoid: {
            //     radii: new Cesium.Cartesian3(0.1, 0.1, 0.1),
            //     material: Cesium.Color.RED,
            // }
        });
    }

    function drawShape(positionData, clickEvtType) {
        function getLineMaterial(isFinal, color='#2F80FF') {
            return isFinal
            ? Cesium.Color.fromCssColorString(color) // 확정: 실선
            : new Cesium.PolylineDashMaterialProperty({   // 진행중: 점선
                color: Cesium.Color.fromCssColorString(color)
                // PolylineDash에는 glowPower 없음
            });
        }
        function addPolyline(positions, material, clampToGround=false, width=2, arc=true) {
            const arcType = arc ? Cesium.ArcType.NONE : Cesium.ArcType.GEODESIC;
            return viewer.entities.add({
                polyline: {
                    positions,
                    clampToGround: clampToGround,
                    arcType: arcType ,   
                    width: width,
                    material : material,
                    depthFailMaterial: material 
                }
            });
        }
        function addPolygon(hierarchy) {
            return viewer.entities.add({
                polygon: {
                    hierarchy,
                    classificationType: Cesium.ClassificationType.TERRAIN,
                    material: Cesium.Color.fromCssColorString('rgba(47,128,255,0.25)'),
                    outline: true,
                    outlineColor: Cesium.Color.fromCssColorString('#2F80FF')
                }
            });
        }

        const isFinal = (clickEvtType === Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        if (mode === 'D') {
            // 거리: 폴리라인
            return addPolyline(positionData, getLineMaterial(isFinal));
        }
        if (mode === 'C') {
            // 단면적: 폴리라인
            return addPolyline(positionData, getLineMaterial(isFinal, '#59ff2fff'), true, 6, false);
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

    async function sampleTerrainPolyline( cartoLine, stepMeters = 5) {
        const terrainProvider = viewer.terrainProvider;
        const geodesic = new Cesium.EllipsoidGeodesic();

        const result = []; // [{ distance, height, carto, segIndex, tOnSegment }, ...]
        let totalOffset = 0; // 전체 누적거리

        for (let i = 0; i < cartoLine.length - 1; i++) {
            const start = cartoLine[i];
            const end   = cartoLine[i + 1];

            // 구간 거리 계산
            geodesic.setEndPoints(start, end);
            const segmentLength = geodesic.surfaceDistance; // meter

            // 최소 2개는 뽑고, stepMeters 간격으로 샘플 개수 계산
            const sampleCount = Math.max(2, Math.ceil(segmentLength / stepMeters));

            // 세그먼트 안의 샘플 포인트 만들기
            const segmentPositions = [];
            for (let k = 0; k <= sampleCount; k++) {
                const t = k / sampleCount;                     // 0~1
                const interp = geodesic.interpolateUsingFraction(t);
                segmentPositions.push(interp);
            }

            // 지형 고도 샘플링
            const updated = await Cesium.sampleTerrainMostDetailed(terrainProvider,segmentPositions);

            for (let k = 0; k < updated.length; k++) {
                const t = k / (updated.length - 1);           // 0~1
                const distOnSegment = segmentLength * t;      // segment 안에서 거리
                const distGlobal    = totalOffset + distOnSegment; // 전체 누적 거리

                result.push({
                    distance:  distGlobal,
                    height:    updated[k].height,
                    carto:     updated[k],
                    segIndex:  i,                // 몇번째 segment인지
                    tOnSegment: t,
                });
            }

            // 누적 거리 업데이트
            totalOffset += segmentLength;
        }

        return result;
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
        finalShape.isMeasureEntity = true; // picking에서 구분하기 위함
        measureEndEntity.graphics.push(finalShape);

         if (mode === 'C') {
            const cartoLine = position.map(pos =>
                Cesium.Ellipsoid.WGS84.cartesianToCartographic(pos)
            );
            // 1m 간격으로 지형 샘플링
            sampleTerrainPolyline(cartoLine, 1).then(samples => {
                //{
                //   distance: 123.4,    // 누적 거리
                //   height:   37.89,          // terrain height
                //   carto:    Cartographic,   // { longitude, latitude, height }
                //   segIndex: 0, // 구간 인덱스
                //   tOnSegment: 0.5       // 구간 내 비율(0~1)
                // }
                if (!samples || samples.length === 0) return;
                const lonLatArray = [];
                const minHeights  = [];
                const maxHeights  = [];
                const terrainHeights = [];

                 // 3D Tiles 샘플링용 Cartographic 배열
                const facilityCartos = [];

                for (const sample of samples) {
                    const cartographic = sample.carto; // Cartographic

                    const lonDeg = Cesium.Math.toDegrees(cartographic.longitude);
                    const latDeg = Cesium.Math.toDegrees(cartographic.latitude);

                    // wall positions
                    lonLatArray.push(lonDeg, latDeg, 0);

                    const terrainH = cartographic.height;
                    // 지형 높이 저장
                    terrainHeights.push(terrainH);
                     // 벽 아래: 지형
                    minHeights.push(terrainH);
                  
                    // 3D Tiles 샘플용 Cartographic (height는 무시되므로 0으로 넣어도 됨)
                    facilityCartos.push(
                        new Cesium.Cartographic(cartographic.longitude, cartographic.latitude, 0.0)
                    );
                }

                viewer.scene.sampleHeightMostDetailed(facilityCartos,[viewer.scene.globe]).then((updatedPositions) => {
                     for (let i = 0; i < updatedPositions.length; i++) {
                        const facilityCarto = updatedPositions[i];
                        const facilityH = facilityCarto.height;

                        // 샘플이 안 된 경우(undefined)이면 지형 높이와 같음 처리
                        if (facilityH === undefined) {
                            maxHeights.push(terrainHeights[i]);
                        } else {
                            maxHeights.push(facilityH);  // 벽 위: 시설물 표면 높이
                        }
                    }
                    const crossSectionEntity = viewer.entities.add({
                        name: "Cross Section Area Wall",
                        wall: {
                            // positions는 xy만 중요, 실제 높이는 min/maxHeights로 제어
                            positions: Cesium.Cartesian3.fromDegreesArrayHeights(lonLatArray),
                            minimumHeights: minHeights,   // 지형
                            maximumHeights: maxHeights,   // 시설물 (또는 지형)
                            material: Cesium.Color.LIGHTGRAY.withAlpha(0.5),
                            outline: true,
                            outlineColor: Cesium.Color.LIGHTGRAY,
                            outlineWidth: 2
                        }
                    });
                    crossSectionEntity.isMeasureEntity = true;
                    measureEndEntity.graphics.push(crossSectionEntity);
                });
            });            
        }

        // 세션 엔티티는 viewer에서 제거하지 말고 확정 버킷으로 넘긴 뒤 배열만 비움
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
            let cart = viewer.scene.pickPosition(movement.position);
            if (!Cesium.defined(cart)) return;

            // ground 면적을 제외한 나머지는 feature 존재 여부 체크
            if (!(mode === 'A' && areaOptions === 'ground')) {
                const feature = viewer.scene.pick(movement.position);
                if (!Cesium.defined(feature))  return;
                if(session.graphics.includes(feature.id)) return; // 진행 실선 측정무시
            }

            if(mode === 'P'){
                const cartographic = Cesium.Cartographic.fromCartesian(cart);
                const lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
                const lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
                const height = cartographic.height.toFixed(2);
                const point = createPoint(cart);
                point.isMeasureEntity = true;
                measureEndEntity.points.push(point);
                const pointLabel = createLabel(cart, `${lon}\n${lat}\n${height}`,{ point: true });
                pointLabel.isMeasureEntity = true;
                measureEndEntity.labels.push(pointLabel);
                return;
            }

            if (mode === 'V') {
                await measureVerticalGapAt(movement.position);
                return; 
            }

            if (activeShapePoints.length === 0) { // 거리, 면적의 첫 포인트
                resetSession();
                activeShapePoints.push(cart);
                var dynamicPositions;
                if (mode === 'D' || mode === 'C') {
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
            if (activeShapePoints.length > 1 && (mode === 'D' || mode === 'C')) { // 점 사이 측정거리 표시
                var prev = activeShapePoints[activeShapePoints.length - 2];
                var dist = Cesium.Cartesian3.distance(cart, prev);
                var mid = Cesium.Cartesian3.midpoint(prev, cart, new Cesium.Cartesian3());
                var txt = dist > 1000 ? (dist / 1000).toFixed(3) + 'km' : dist.toFixed(2) + 'm';
                var segLabel = createLabel(mid, txt);
                session.labels.push(segLabel);
            }

            activeShapePoints.push(cart);
            var p = createPoint(cart);
            p.isMeasureEntity = true; // picking에서 구분하기 위함
            session.points.push(p);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // MOUSE_MOVE: 점선 갱신
        handler.setInputAction(function (movement) {
            showMouseLabelAt(movement.endPosition,setMouseLabelText(mode, areaOptions));
            var np = viewer.scene.pickPosition(movement.endPosition);
            if (!Cesium.defined(np)) return;
            if(activeShapePoints.length > 1){
                activeShapePoints.pop();
                activeShapePoints.push(np);
            }
            
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
        verticalLine.isMeasureEntity = true;
        measureEndEntity.graphics.push(verticalLine);

        // 라벨 위치: 중간점
        const label = createLabel(Cesium.Cartesian3.midpoint(cartModel, cartTerrain, new Cesium.Cartesian3()), `수직 거리: ${absDz.toFixed(2)} m`);
        label.isMeasureEntity = true;
        measureEndEntity.labels.push(label);

        // 모델 점에 작은 포인트
        const pModel = viewer.entities.add({
            position: cartModel,
            point: { 
                pixelSize: 6, 
                color: Cesium.Color.WHITE, 
                disableDepthTestDistance: Number.POSITIVE_INFINITY 
            }
        });
        pModel.isMeasureEntity = true;
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
        pTerr.isMeasureEntity = true;
        measureEndEntity.points.push(pTerr);

        return { verticalLine, label, pModel, pTerr };
    }

    function start(m) {
        mode = m;
        resetSession();
        offHandler();
        bindDrawing();
        bindKeyboard();
        ensureMouseLabel();
        mouseLabel.label.text = setMouseLabelText(mode, areaOptions); 
        setDrawingCursor(true);
    }

    function stop(){
        offHandler();
        resetSession(); 
        unbindKeyboard()
        hideMouseLabel(); 
        setDrawingCursor(false); 
        mode=undefined;
    }

    function removeAll() {
        measureEndEntity.graphics.forEach(function (g) { viewer.entities.remove(g); });
        measureEndEntity.points.forEach(function (p) { viewer.entities.remove(p); });
        measureEndEntity.labels.forEach(function (l) { viewer.entities.remove(l); });
        measureEndEntity.graphics = [];
        measureEndEntity.points = [];
        measureEndEntity.labels = [];
    }

    function setAreaMode(mode) {
        // 'ground' | 'surface' 만 허용
        areaOptions = (mode === 'surface') ? 'surface' : 'ground';
    }

    function mountToolBar({container, onPoint, onLine,
            onVertical, onAreaGround, onAreaSurface, onCrossSectionArea,
            onClose, onInit ,onInspector}){

            const root = (typeof container === 'string') ? document.querySelector(container) : container;
            if (!root) { throw new Error('Tool Bar 생성: 유효한 container가 필요합니다.'); }

            if (!document.getElementById(TOOLBAR_STYLE_ID)) {
                $('<style>', { TOOLBAR_STYLE_ID, text: TOOLBAR_CSS }).appendTo('head');
            }

            // 툴바 DOM 생성(중복 방지)
            let toolRoot = root.querySelector('.tool-root');
            if (!toolRoot) {
                toolRoot = $(TOOLBAR_HTML)[0];
                root.appendChild(toolRoot);
            }

            const $rootWrap      = $(toolRoot);
            const $groupMeasure  = $rootWrap.find('#group-measure');
            const $btnInspector  = $rootWrap.find('#group-inspector');
            const $groupMarker   = $rootWrap.find('#group-marker');
            const $measurePanel  = $rootWrap.find('.tool-panel--measure');
            const $markerPanel   = $rootWrap.find('.tool-panel--marker');

            const $tools       = $measurePanel.find('.tool');
            const $btnPoint    = $measurePanel.find('#btn_point');
            const $btnLine     = $measurePanel.find('#btn_line');
            const $btnVert     = $measurePanel.find('#btn_vertical');
            const $btnAreaG    = $measurePanel.find('#btn_ground');
            const $btnAreaS    = $measurePanel.find('#btn_surface');
            const $btnCross    = $measurePanel.find('#btn_cross');
            const $btnInit     = $measurePanel.find('#btn_init');
            const $btnClose    = $measurePanel.find('#btn_close');

            // 마커 패널 버튼
            const $btnMarkerClose = $markerPanel.find('#btn_marker_close');
            const $btnMarkerInit = $markerPanel.find('#btn_marker_init');

            let measureOpen = false;
            let markerOpen  = false;
            let inspectorOpen = false;

            function setActive($btn){ $tools.removeClass('is-active'); $btn.addClass('is-active'); }
            function clearActive(){ $tools.removeClass('is-active'); }

            function openMeasurePanel(){
                measureOpen = true;
                markerOpen  = false;
                inspectorOpen = false;
                $measurePanel.addClass('is-open');
                $markerPanel.removeClass('is-open');
                $groupMeasure.addClass('is-active');
                $groupMarker.removeClass('is-active');
                $btnInspector.removeClass('is-active');
            }

            function openInspectorPanel(){
                inspectorOpen = true;
                markerOpen  = false;
                measureOpen = false;

                $measurePanel.removeClass('is-open');
                $markerPanel.removeClass('is-open');
                $groupMeasure.removeClass('is-active');
                $groupMarker.removeClass('is-active');

                $btnInspector.addClass('is-active');
            }

            function openMarkerPanel(){
                markerOpen  = true;
                measureOpen = false;
                inspectorOpen = false;
                $markerPanel.addClass('is-open');
                $measurePanel.removeClass('is-open');
                $groupMarker.addClass('is-active');
                $groupMeasure.removeClass('is-active');
            }

            function closeAllPanels(){
                measureOpen = false;
                markerOpen  = false;
                inspectorOpen = false;
                $measurePanel.removeClass('is-open');
                $markerPanel.removeClass('is-open');
                $groupMeasure.removeClass('is-active');
                $groupMarker.removeClass('is-active');
                $btnInspector.removeClass('is-active');
                clearActive();
            }

            function hiddenMountToolBar(){
                $rootWrap.css("display", "none");
                closeAllPanels();
            }
            function showMountToolBar(){
                $rootWrap.css("display", "flex");
            }

            $groupMeasure.on('click', () => {
                if (measureOpen) {
                    closeAllPanels();
                    onClose?.();   // 측정 세션 종료
                } else {
                    openMeasurePanel();
                }
            });
            $btnInspector.on('click', ()=>{
                if (inspectorOpen){
                    closeAllPanels();
                    onInspector?.(false);
                } else{
                    openInspectorPanel();
                    onInspector?.(true);
                }
            });

            $groupMarker.on('click', () => {
                alert('해당 서비스 준비중입니다.');
                return;
                if (markerOpen) {
                    closeAllPanels();
                } else { 
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

            $btnCross.on('click', () =>{
                setActive($btnCross);
                onCrossSectionArea?.();
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
            };
    }

    return {start, stop, setAreaMode, removeAll, mountToolBar};
}