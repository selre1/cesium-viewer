import { COMPASS_SVG } from "./UiTemplates.js";
import {flyToTilesetsWithPreset,flyWalkModeLookAt} from "./CameraMovement.js";
import { CameraFreeMode }   from "./CameraFreeMode.js";
import { CameraOrbitMode } from "./CameraOrbitMode.js";
import { Measurement }  from "./Measurement.js";



import { ToolBar } from "./ToolBar.js";
import { InfoBox } from "./InfoBox.js";
import { InspectorBox } from "./InspectorBox.js";

import { CameraBaseHandler } from "./CameraBaseHandler.js"

var CesiumHandler = (function(){
    Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMzBlNTkwZC0yMWE3LTQzMzktYTE3YS0wMDhhYTU0OWFlMzciLCJpZCI6MzY0NjczLCJpYXQiOjE3NjQzMDE3ODR9.qL8L4zxg9x4yIQR6G-SPIXlPfegO7GkpvZ1GsupN4_4";
    let viewer, handler;
    let infoBox;
    let inspector;

    let entityOverlayEl = null;              // HTML 오버레이 엘리먼트
    const entityScratch = new Cesium.Cartesian2();  //preRender에서 재사용할 좌표 버퍼

    let unionTilesetCenter; // 타일셋 중심 좌표
    let hoverCheckLastTime = 0;

    let currentModelConfig = { // 기본 모델 정보
        tilesetUrls: null,
        info: {
            text: undefined,
            longitude: undefined,
            latitude: undefined,
            iconSrc: undefined,
            destination: undefined,
            orientation: undefined,
            length: 100.0,
        }
    };
    let loaded_3Dtilesets = []; // 현재 scene에 추가된 tilesets
    
    // cesium 기본 환경
    var DefaultOption = {
        animation: false, //좌측 하단 둥근 위젯 노출여부
        shouldAnimate: false, // 애니메이션과 같이 시간에 따른 변경되는 요소가 있어서 시뮬레이션 시간을 진행하려고 하면
        baseLayerPicker: false, // 지형선택 위젯 노출여부
        fullscreenButton: false, // 전체화면 여부
        vrButton: false, // vr 버튼 노출여부
        geocoder: false, //지오 코더 위젯 노출여부. 주소와 경계표를 찾고 카메라를 그 위치에 보내는 위젯. 지오 코딩은
        homeButton: false, // 홈 버튼 노출여부
        infoBox: false, // 정보 또는 설명을 표시하는 위젯 노출여부 (건물정보 보이고 싶을때)
        sceneModePicker: false, // 2D(평명 지도), 3D(구형 지구) 선택 위젯 노출여부
        timeline: false, //timeline 위젯 노출여부
        navigationHelpButton: false, // 도움말 버튼 노출여부
        trackedEntity: undefined, // 현재 카메라에서 추적중인 Entity 인스턴스를 가져 오거나 설정. 더블클릭시 대상이 화면 가운데로 이동되는것 막기위해 undefined로 설정
        selectionIndicator: false, // 클릭시 클릭위치 표시기 노출여부
        projectionPicker: false, // 직각투영/원근법 투영 선택 위젯 노출여부
        navigationInstructionsInitiallyVisible: false,
        shadows: false, // 기본값 false. 모델과 지형에 태양의 그림자가 드리울지 여부(빛 조정은 이 속성에서 조절 안되고 그림자만 드리워짐)
        maximumRenderTimeChange: Infinity, // requestRenderMode가 true인 경우 시물레이션이 변경됨에 따른 새 프레임 요청 간격(초)을 설정
        //sceneMode: Cesium.SceneMode.SCENE3D,
        //useDefaultRenderLoop: false // 자동 렌더링 여부
        // requestRenderMode: true, // scene을 업데이트하지 않으면 새 프레임을 렌더링하지 않도록 설정
        terrain: Cesium.Terrain.fromWorldTerrain(), //세슘 ion 지원
        // baseLayer: new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
        //     url: 'https://xdworld.vworld.kr/2d/Satellite/service/{z}/{x}/{y}.jpeg',
        //     //url: 'https://xdworld.vworld.kr/2d/Base/service/{z}/{x}/{y}.png',
        //     subdomains: 'base',
        //     minimumLevel: 0,
        //     maximumLevel: 19,
        //     rectangle: new Cesium.Rectangle(
        //         Cesium.Math.toRadians(-180.0),
        //         Cesium.Math.toRadians(-90.0),
        //         Cesium.Math.toRadians(180.0),
        //         Cesium.Math.toRadians(90.0))
        // }))
        // baseLayer: new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
        //     url: 'http://175.116.181.151:29090/tile/{z}/{x}/{y}.png',
        //     minimumLevel: 0,
        //     maximumLevel: 19,
        //     tilingScheme: new Cesium.WebMercatorTilingScheme(),
        //     credit: 'Satellite by TileServer-GL'
        // }))
    }

    // 지하시설물 특화 변수
    const underFacilitySpecialEvn = {
        translucencyEnabled: true,
        fadeByDistance: true,
        alpha: 0.5
    };

    let cameraFree; // 탐색모드
    let cameraOrbitMode; // 회전모드
    let measurement; // 측정도구 기능 제어
    let toolBarApi; // 툴 단위 제어

    // 각 기능 정의
    const Mode = {
        NORMAL: 'normal',
        CAMERA_FREE: 'cameraFree',
        ORBIT: 'orbit',
        MEASURE_POINT: 'measure_point',
        MEASURE_DISTANCE: 'measure_distance',
        MEASURE_VERTICAL: 'measure_vertical',
        MEASURE_AREA_GROUND: 'measure_area_ground',
        MEASURE_AREA_SURFACE: 'measure_area_surface',
        MEASURE_CROSS_SECTION_AREA : 'measure_cross_section_area',
        INSPINSTPOPBTN : 'inspInstPopBtn'
    };

    // 초기 기본 모드 정의
    let currentMode = Mode.NORMAL;

    // 모드 전환
    function setMode(nextMode) {
        if (currentMode === nextMode) return;

        // 공통 리셋
        measurement.stop();
        cameraFree.disable();
        cameraOrbitMode.disable();
        infoBoxDisable();
        inspector?.disablePicking();
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        if (toolBarApi) toolBarApi.showMountToolBar();

        switch (nextMode) {
            case Mode.NORMAL:
                infoBoxEnable();
                inspector?.enablePicking();
                break;

            case Mode.CAMERA_FREE:
                if (toolBarApi) toolBarApi.hiddenMountToolBar();
                cameraFree.enable();
                break;

            case Mode.ORBIT:
                if (toolBarApi) toolBarApi.hiddenMountToolBar();
                cameraOrbitMode.enable(unionTilesetCenter);
                break;

            case Mode.MEASURE_POINT:
                measurement.start("P");
                break;

            case Mode.MEASURE_DISTANCE:
                measurement.start("D");
                break;
            
            case Mode.MEASURE_VERTICAL:
               // alert('수직 측정 기능 준비중입니다.');
                //return;
                measurement.start("V");
                break;

            case Mode.MEASURE_AREA_GROUND:
                measurement.setAreaMode("ground");
                measurement.start("A");
                break;

            case Mode.MEASURE_AREA_SURFACE:
                measurement.setAreaMode("surface");
                measurement.start("A");
                break;

            case Mode.MEASURE_CROSS_SECTION_AREA:
                measurement.start("C");
                break;
            
            case Mode.INSPINSTPOPBTN:
                break;
        }

        currentMode = nextMode;
    }

    async function init(elementId, { tilesetUrls, info, terrain, baseLayer} = {}) {
        viewer = initCesiumViewer(elementId,terrain, baseLayer);
        translucencyUpdate(); // 지하 특화 환경
        createCompas(); // 나침반 생성


        cameraFree  = CameraFreeMode({ cesiumViewer: viewer });
        cameraOrbitMode = CameraOrbitMode({cesiumViewer: viewer});
        measurement = Measurement({ cesiumViewer: viewer });

        infoBox = InfoBox({ 
            cesiumViewer: viewer, 
            container: viewer.container,
            modeEnum: Mode, 
            getCurrentMode: () => currentMode, 
            setMode, 
            getUnionTilesetCenter: () => unionTilesetCenter, 
            translucencyState: underFacilitySpecialEvn, 
            onTranslucencyUpdate: () => translucencyUpdate(), 
            onOrbitNoCenter: () => alert('') 
        });
        //infoBox.mount();
        infoBoxEnable();

        toolBarApi = ToolBar({
            container: viewer.container,
            onPoint: () => setMode(Mode.MEASURE_POINT),
            onLine: () => setMode(Mode.MEASURE_DISTANCE),
            onVertical: () => setMode(Mode.MEASURE_VERTICAL),
            onAreaGround: () => setMode(Mode.MEASURE_AREA_GROUND),
            onAreaSurface: () => setMode(Mode.MEASURE_AREA_SURFACE),
            onCrossSectionArea: () => setMode(Mode.MEASURE_CROSS_SECTION_AREA),
            onClose: () => setMode(Mode.NORMAL),
            onInit: () => measurement.removeAll()
        });


        const customPanel = $(`
            <div class="tool-panel tool-panel--custom" data-panel="custom">
                <div class="" style="padding:6px 10px;">
                    <label style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 8px;border-radius:8px;background:rgba(255,255,255,0.04);cursor:pointer;user-select:none;">
                        <span style="font-size:12px;color:#e6edf3;">지형투명도</span>
                        <input type="checkbox" id="toolbar-translucency" />
                    </label>

                    <label style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 8px;border-radius:8px;background:rgba(255,255,255,0.04);cursor:pointer;user-select:none;">
                        <span style="font-size:12px;color:#e6edf3;">모델만 보기</span>
                        <input type="checkbox" id="toolbar-onlymodel" />
                    </label>

                    <button id="toolbar-topview" class="cesium-button" style="font-size:12px;color:#e6edf3;width:100%;">위에서 보기</button>
                </div>
        </div>`);

        toolBarApi.addToolGroup({
            id: 'custom',
            html: `
            <button class="tool-group" id="group-custom">
                <svg xmlns="http://www.w3.org/2000/svg"
                    width="24" height="24" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <!-- Utility icon: sliders / controls -->
                    <line x1="4" y1="6"  x2="20" y2="6"/>
                    <line x1="4" y1="12" x2="20" y2="12"/>
                    <line x1="4" y1="18" x2="20" y2="18"/>

                    <circle cx="9"  cy="6"  r="2"/>ㄴ
                    <circle cx="15" cy="12" r="2"/>
                    <circle cx="11" cy="18" r="2"/>
                </svg>
            </button>`,
            panel: customPanel[0],
            onOpen: () => { 
                const panelEl = customPanel[0];
                const chkTrans = panelEl.querySelector('#toolbar-translucency');
                const chkOnly = panelEl.querySelector('#toolbar-onlymodel');
                const topview = panelEl.querySelector('#toolbar-topview');

                // 초기값 동기화
                chkTrans.checked = !!underFacilitySpecialEvn.translucencyEnabled;
                chkOnly.checked = !!(viewer && viewer.scene && viewer.scene.globe && !viewer.scene.globe.show);

                if (panelEl.dataset.bound === 'active') return;
                panelEl.dataset.bound = 'active';

                // 지형 투명도
                chkTrans.addEventListener('change', () => {
                    underFacilitySpecialEvn.translucencyEnabled = chkTrans.checked;
                    translucencyUpdate();
                });

                // 모델만 보기
                chkOnly.addEventListener('change', () => {
                    const on = chkOnly.checked;
                    const scene = viewer.scene;

                    scene.globe.show = !on;
                    if (scene.skyAtmosphere) scene.skyAtmosphere.show = !on;
                    scene.skyBox = on ? null : scene.skyBox;
                    scene.backgroundColor = on
                        ? Cesium.Color.BLACK
                        : Cesium.Color.fromCssColorString('#0b0f14');
                });

                topview.addEventListener('click', () => {
                    flyToTilesetsWithPreset(viewer, unionTilesetCenter, "top", 0.8, 4000);
                })
            }
        });

        inspector = InspectorBox({ cesiumViewer: viewer, handler, getLoadedTilesets: () => loaded_3Dtilesets, toolBar: toolBarApi });
        inspector.mount();

        currentModelConfig = {
            tilesetUrls: tilesetUrls,
            info: info
        };

        await applyModelConfig(currentModelConfig);

        setMode(Mode.NORMAL);
        
        return viewer;
    }

    function initCesiumViewer(elementId, terrain, baseLayer){
        if (!window.Cesium) { console.error('CesiumJS not loaded.'); return; }
        var ph = document.querySelector('.viewer-placeholder');
        if (ph) ph.remove();

        if(terrain){
            DefaultOption.terrain =  createTerrain(terrain);
        }
        if(baseLayer){
            DefaultOption.baseLayer = createBaseLayer(baseLayer);
        }
    
        const cesiumViewer = new Cesium.Viewer(elementId, DefaultOption);
        cesiumViewer.scene.fxaa = false;
        cesiumViewer.scene.sun.show  = false;   // 태양
        cesiumViewer.scene.moon.show = false;   // 달
        cesiumViewer.scene.imageBasedLighting = new Cesium.ImageBasedLighting({intensity: 2.5 });
        cesiumViewer.shadows = false;
        cesiumViewer.scene.globe.enableLighting = false;
        
        cesiumViewer.scene.globe.depthTestAgainstTerrain = true; //지형(terrain)을 기준으로 깊이 테스트(지형 우선)
        cesiumViewer.scene.screenSpaceCameraController.enableCollisionDetection = false; // 카메라 충돌 감지 비활성화(지하를 탐색하기 위함)
        cesiumViewer.scene.globe.translucency.frontFaceAlphaByDistance = new Cesium.NearFarScalar( 400.0, 0.0, 2000.0, 1.0);
       //cesiumViewer.resolutionScale = 0.75; // 해상도 낮추기
        //cesiumViewer.scene.globe.baseColor = new Cesium.Color(0, 0, 0, 1);
        $( '.cesium-viewer-bottom' ).remove();
    
        if (!handler) handler = new Cesium.ScreenSpaceEventHandler(cesiumViewer.canvas);
        CameraBaseHandler(cesiumViewer, handler);

        // 모델 중앙 라벨 오버레이 위치 유지하기 위함
        cesiumViewer.scene.preRender.addEventListener(function () {
            if (!entityOverlayEl || entityOverlayEl.style.display === 'none') return;

            const entity = viewer.entities.getById('entity_icon');
            if (!entity) {
                entityOverlayEl.style.display = 'none';
                return;
            }

            const time = cesiumViewer.clock.currentTime;
            const pos  = Cesium.Property.getValueOrUndefined(entity.position, time);
            if (!pos) {
                entityOverlayEl.style.display = 'none';
                return;
            }

            const canvasPos = cesiumViewer.scene.cartesianToCanvasCoordinates(pos, entityScratch);
            if (!Cesium.defined(canvasPos)) {
                entityOverlayEl.style.display = 'none';
                return;
            }

            entityOverlayEl.style.left = `${canvasPos.x}px`;
            entityOverlayEl.style.top  = `${canvasPos.y}px`;
        });

        return cesiumViewer;
    }

    function boundingSphereToRectangle(boundingSphere, ellipsoid) {
        if (!boundingSphere) return undefined;
        if (!ellipsoid) ellipsoid = Cesium.Ellipsoid.WGS84;

        const center = boundingSphere.center;
        const radius = boundingSphere.radius;

        // 구 표면에서 6방향 샘플 (x,y,z 축 방향)
        const directions = [
            new Cesium.Cartesian3(2, 0, 0),
            new Cesium.Cartesian3(-2, 0, 0),
            new Cesium.Cartesian3(0, 2, 0),
            new Cesium.Cartesian3(0, -2, 0),
            new Cesium.Cartesian3(0, 0, 2),
            new Cesium.Cartesian3(0, 0, -2),
        ];

        let west =  Number.POSITIVE_INFINITY;
        let east =  Number.NEGATIVE_INFINITY;
        let south = Number.POSITIVE_INFINITY;
        let north = Number.NEGATIVE_INFINITY;

        for (const dir of directions) {
            const offset = Cesium.Cartesian3.multiplyByScalar(dir, radius, new Cesium.Cartesian3());
            const pos    = Cesium.Cartesian3.add(center, offset, new Cesium.Cartesian3());

            const carto  = Cesium.Cartographic.fromCartesian(pos, ellipsoid);
            if (!carto) continue;

            west  = Math.min(west,  carto.longitude);
            east  = Math.max(east,  carto.longitude);
            south = Math.min(south, carto.latitude);
            north = Math.max(north, carto.latitude);
        }

        if (!isFinite(west) || !isFinite(east) || !isFinite(south) || !isFinite(north)) {
            return undefined;
        }

        return new Cesium.Rectangle(west, south, east, north);
    }

    async function applyModelConfig(config={}) {
        const tasks = [];

        // 3D Tileset 로딩
        if(config.tilesetUrls) {
            const tilesets = await renderingAllTileset({ url: config.tilesetUrls });

            // 해당 위치로 카메라 이동
            unionTilesetCenter = unionAllTilesetsBoundingSphereCompute(tilesets);
            const rect = boundingSphereToRectangle(unionTilesetCenter,viewer.scene.globe.ellipsoid);
            viewer.scene.globe.cartographicLimitRectangle = rect;

            flyToTilesetsWithPreset(viewer, unionTilesetCenter, "top", 0, 4000);

            tasks.push(tilesets);
        }

        // 모델 정보 라벨 업데이트
        if(config.info){
            removeModelInfoLabel();
            setModelInfoLabel(config.info);
        }
        
        // tasks 작업이 모두 끝나길 대기
        // 하나라도 실패해도 전체 실패로 간주
        return Promise.all(tasks);
    }

    async function updateModelConfig(config = {}) {
        // 현재 currentConfig 업데이트
        // 사용자가 리스트에서 어떤 모델을 선택 후 다시 적용
        currentModelConfig  = {
            ...currentModelConfig ,
            ...config,
            info: {
            ...currentModelConfig.info,
            ...(config.info || {}),
            },
        };
        return applyModelConfig(currentModelConfig);
    }

    function createTerrain(url){
        const provider = Cesium.CesiumTerrainProvider.fromUrl(url)
        return new Cesium.Terrain(provider);
    }

    function updateTerrain(url) {
        const terrain = createTerrain(url);
        viewer.terrain = terrain;
    }

    function createBaseLayer(url) {
        const provider = new Cesium.UrlTemplateImageryProvider({
            url,
             minimumLevel: 0,
            maximumLevel: 19,
            tilingScheme: new Cesium.WebMercatorTilingScheme(),
            credit: 'GIT'
        });
        return new Cesium.ImageryLayer(provider);
    }

    function updateBaseLayer(url) {
        const layers = viewer.imageryLayers;
        // 기존 baseLayer 제거
        if (DefaultOption.baseLayer) {
            layers.remove(DefaultOption.baseLayer, true);
            DefaultOption.baseLayer = null;
        }
        const layer = createBaseLayer(url);
        DefaultOption.baseLayer = layers.add(layer, 0);
    }

    async function renderingAllTileset({url}) {

        if (Array.isArray(loaded_3Dtilesets) && loaded_3Dtilesets.length > 0) {
            loaded_3Dtilesets.forEach(ts => {
                if (!ts) return;
                viewer.scene.primitives.remove(ts);
                if (!ts.isDestroyed()) {
                    ts.destroy();
                }
            });
            loaded_3Dtilesets.length = 0;
        }

        if (!Array.isArray(url) || url.length === 0) {
            console.warn("tilesetUrl 이 존재하지 않습니다.");
            return [];
        }

        const tasks = url.map(u => createTileset(u));
        const results = await Promise.allSettled(tasks);

        const loaded = [];
        results.forEach(r => {
            if (r.status === 'fulfilled' && r.value) {
                loaded.push(r.value);
            } else {
                console.warn('Tileset load failed:', r.reason);
            }
        });

        loaded_3Dtilesets = loaded;
        return loaded;
    }

    function createRoundBadgeCanvas({
        text,
        iconSrc,            // 아이콘 경로 (png, svg 모두 가능)
        size = 40,         // 원의 지름(px)
        padding = 4,       // 바깥 여백
        bgColor = 'rgba(11, 15, 20, 0.96)',
        borderColor = 'rgba(255, 233, 33, 1)',
        shadow = true,
        pixelScale = 1.5
    } = {}) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const dpr = (window.devicePixelRatio || 1) * pixelScale;

        const total = size + padding * 2; // 전체 캔버스 한 변
        canvas.width  = total * dpr;
        canvas.height = total * dpr;
        ctx.scale(dpr, dpr);

        const cx = total / 2;
        const cy = total / 2;
        const r  = size / 2;

        // 배경 원 + 테두리 + 그림자
        ctx.save();
        if (shadow) {
            ctx.shadowColor   = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur    = 8;
            ctx.shadowOffsetY = 2;
        }
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle   = bgColor;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth   = 2;
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        if (!iconSrc) {
            ctx.save();
            ctx.font         = '600 8px sans-serif';
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle    = '#ffffff';

            ctx.strokeText(text, cx, cy);
            ctx.fillText(text, cx, cy);
            ctx.restore();

            return Promise.resolve(canvas);
        }

        // 아이콘 로드해서 원 안에 그리기 (PNG든 SVG든 동일)
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                // 아이콘이 원 안에 살짝 여유 있게 들어가도록
                const iconR = r * 0.9; // 원보다 조금 작게
                const iconSize = iconR * 2;
                const x = cx - iconSize / 2;
                const y = cy - iconSize / 2;

                // 아이콘도 원형으로 클리핑 (모서리 잘림 방지)
                ctx.save();
                ctx.beginPath();
                ctx.arc(cx, cy, iconR, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(img, x, y, iconSize, iconSize);
                ctx.restore();

                resolve(canvas);
            };
            img.onerror = reject;
            img.src = iconSrc;
        });
    }

    function setModelInfoLabel(options = {}) {
        if (!unionTilesetCenter || !viewer) return;

        const text        = options.text   || 'Untitled';
        const iconSrc     = options.iconSrc || undefined;
        const lineLength  = options.length || 100.0;
        const ellipsoid   = viewer.scene.globe.ellipsoid;

        // BoundingSphere 중심 -> 경위도/고도
        const centerCartesian  = unionTilesetCenter.center;
        const centerCarto      = ellipsoid.cartesianToCartographic(centerCartesian);

        const lonDeg = options.longitude ?? Cesium.Math.toDegrees(centerCarto.longitude);
        const latDeg = options.latitude ?? Cesium.Math.toDegrees(centerCarto.latitude);

        const baseHeight       = centerCarto.height;            // 필요시 0으로 고정해도 됨
        const cylinderMidH     = baseHeight + lineLength / 2.0; // 원통 중심 높이
        const labelHeight      = baseHeight + lineLength;       // 라벨 높이

        // 원통(수직 라인) 중심 위치
        const cylinderPos = Cesium.Cartesian3.fromDegrees(
            lonDeg,
            latDeg,
            cylinderMidH
        );

        // 이미지 위치 (라인 최상단)
        const labelPos = Cesium.Cartesian3.fromDegrees(
            lonDeg,
            latDeg,
            labelHeight
        );

        // 수직 원통 라인
        viewer.entities.add({
            id: 'entity_line',
            position: cylinderPos,
            orientation: Cesium.Transforms.headingPitchRollQuaternion(
                cylinderPos,
                new Cesium.HeadingPitchRoll(0, 0, 0) 
            ),
            cylinder: {
                length: lineLength,
                topRadius: 0.2,      // 반경 0.5m
                bottomRadius: 0.2,
                material: Cesium.Color.WHITE.withAlpha(0.9),
                outline: false,
            
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 10000.0)
            }
        });

        // 지하시설 이미지 썸네일 
        createRoundBadgeCanvas({
            text : text,
            iconSrc: iconSrc,
            size: 40,
            padding: 5,
            pixelScale: 1.5 
        }).then((badgeCanvas) => {
            viewer.entities.add({
                id : 'entity_icon',
                position:  labelPos,
                properties: {
                    title: `${text}`,
                    desc:  '이 영역은 지하시설물 3D 모델의 중심 지점을 나타냅니다.',
                    destination: options.destination ?? null, // 카메라 이동 시 목표 지점 정보로 활용
                    orientation: options.orientation ?? null  // 카메라 이동 시 목표 방향 정보로 활용
                },
                billboard: {
                    image: badgeCanvas,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, 6),
                    scale: 1.0,
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 10000.0)
                }
            });
        });
    }

    function removeModelInfoLabel() {
        const lineEntity  = viewer.entities.getById("entity_line");
        const iconEntity = viewer.entities.getById("entity_icon");
        if (lineEntity)  viewer.entities.remove(lineEntity);
        if (iconEntity) viewer.entities.remove(iconEntity);
    }

    function createCompas(){
        const $wrap = createElement();
        const $svg = $wrap.find('svg');

        $svg.css({
            width: '100%',
            height: '100%',
            'transform-origin': '50% 50%',
            'will-change': 'transform'
        });

        // 카메라 heading에 맞춰 회전
        viewer.scene.postRender.addEventListener(() => {
            const heading = viewer.camera.heading; // 라디안
            // 일반적으로 나침반은 카메라 반대방향으로 돌려서 북쪽 항상 위로 보이게 함
            $svg.css('transform', `rotateZ(${-heading}rad)`);
        });

        $wrap.on('click', () => {
            return;
            // if (!Cesium.defined(iconEntity)) return;
            // viewer.zoomTo(opt.iconEntity, -90, 1000);
        });

        const $renderContents = $(viewer.container);
        $renderContents.append($wrap);

        function createElement() {
            const $div = $(`
                <div class="hud-compass" 
                    style="position:absolute; top:10px; right:10px; z-index:10000; width:64px; height:64px; pointer-events:auto;">
                    ${COMPASS_SVG}
                </div>
            `);
            return $div;
        }
    }

    function translucencyUpdate() {
        viewer.scene.globe.translucency.enabled = underFacilitySpecialEvn.translucencyEnabled;

        let alpha = Number(underFacilitySpecialEvn.alpha);
        alpha = !isNaN(alpha) ? alpha : 1.0;
        alpha = Cesium.Math.clamp(alpha, 0.0, 1.0);

        viewer.scene.globe.translucency.frontFaceAlphaByDistance.nearValue = alpha;
        viewer.scene.globe.translucency.frontFaceAlphaByDistance.farValue = underFacilitySpecialEvn.fadeByDistance ? 1.0 : alpha;
    }

    async function createTileset(url) {
        if (!url) {
            console.warn("url이 유효하지 않습니다.");
            return;
        }

        try {
            const tileset = await Cesium.Cesium3DTileset.fromUrl(url, {
                 shadows : Cesium.ShadowMode.ENABLED,
                 //maximumMemoryUsage : 4096,
                 maximumScreenSpaceError: 16,      // default 16보다 올려서 성능상향
                // debugShowBoundingVolume: true,
               // debugShowGeometricError: false,
               // debugShowRenderingStatistics: false,
               // debugShowMemoryUsage: false,
             
              //  skipLevelOfDetail: false,
              //  immediatelyLoadDesiredLevelOfDetail: true,
               // loadSiblings : true
               
            });
            //tileset.loadProgress.addEventListener((pendingRequests, tilesProcessing) => {});
            tileset.style = new Cesium.Cesium3DTileStyle({
                color: {
                    conditions: [
                       // ["${ifc_class} === 'IfcFlowSegment'", "color('#023caf')"],
                       // ["${ifc_class} === 'IfcFlowFitting'", "color('#023caf')"],
                        ["${ifc_class} === 'IfcWall'", "color('#bababa')"],
                        ["${ifc_class} === 'IfcSlab'", "color('#bababa')"],
                        ["${ifc_class} === 'IfcWallStandardCase'", "color('#bababa')"],
                        ["${ifc_class} === 'IfcOpeningElement'", "color('#bababa')"],
                    ]
                },
                show : "${ifc_class} !== 'IfcOpeningElement'",
            });
            tileset.tileVisible.addEventListener(tile => {
                const content = tile.content;
                const len = content.featuresLength || 0;
                for (let i = 0; i < len; i++) {
                    const f = content.getFeature(i);
                    const id = f.getProperty('guid');
                    const clssId = f.getProperty('ifc_class');
                    if (id != null && inspector?.isHiddenModel?.(id)) {
                        f.show = false;
                        continue;
                    }
                    
                    if (clssId === 'IfcOpeningElement') {
                        f.show = false;
                        continue;
                    }
                }
            });
            viewer.scene.primitives.add(tileset);
            await tileset.readyPromise;
            
            return tileset;
        } catch (error) {
            console.error(`Tileset 생성 중 오류 발생: ${error}`);
            return undefined;
        }
    }

    function unionAllTilesetsBoundingSphereCompute(tilesets){
        if (!Array.isArray(tilesets) || tilesets.length === 0) return null;

        const spheres = [];

        for (const ts of tilesets) {
            const bv = ts?.root?.boundingVolume;
            if (!bv) continue;

            // boundingVolume → BoundingSphere 변환
            let sphere;
            if (bv.boundingSphere) {
                sphere = bv.boundingSphere;
            } else {
                sphere = Cesium.BoundingSphere.fromBoundingVolume(bv);
            }

            if (sphere && sphere.radius > 0) {
                spheres.push(sphere);
            }
        }

        if (spheres.length === 0) return null;

        let union = spheres[0];
        for (let i = 1; i < spheres.length; i++) {
            union = Cesium.BoundingSphere.union(union, spheres[i]);
        }

        return union;
    }

    function infoBoxEnable() {
        if (!infoBox) return;
        infoBox.enable();
        if (handler) handler.setInputAction(onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    function infoBoxDisable() {
        if (infoBox) infoBox.disable();
        if (handler) handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    function showEntityOverlay(entity) {
        function createEntityOverlay() {
            if (entityOverlayEl) return entityOverlayEl;

            const root = viewer.container;
            const entityOverlay = document.createElement('div');
            entityOverlay.id = 'entity-overlay';
            entityOverlay.style.cssText = `
                position:absolute;
                z-index:3000;
                transform:translate(12px, -50%); /* 아이콘 기준 오른쪽 옆에 표시 */
                pointer-events:auto;
                display:none;
            `;
            entityOverlay.innerHTML = `
                <div style="
                    min-width:180px;
                    max-width:260px;
                    padding:8px 10px;
                    border-radius:10px;
                    background:rgba(11,15,20,0.95);
                    border:1px solid rgba(255,255,255,0.12);
                    box-shadow:0 10px 24px rgba(0,0,0,0.6);
                    color:#e6edf3;
                    font-size:11px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <div style="font-weight:600; font-size:12px;" id="entity-title"></div>
                    </div>
                    <div id="entity-body" style="font-size:11px; line-height:1.5;"></div>
                </div>
            `;
            root.appendChild(entityOverlay);

            entityOverlayEl = entityOverlay;
            return entityOverlay;
        }

        const el = createEntityOverlay();
        const titleEl = el.querySelector('#entity-title');
        const bodyEl  = el.querySelector('#entity-body');

        const props = entity.properties || {};
        const now   = viewer.clock.currentTime;

        const title = props.title?.getValue?.(now) || '지하시설물';
        const desc  = props.desc?.getValue?.(now)  || '요약 정보가 준비 중입니다.';

        titleEl.textContent = title;
        bodyEl.textContent  = desc;

        el.style.display = 'block';
    }

    function hideEntityOverlay() {
        if (entityOverlayEl) {
            entityOverlayEl.style.display = 'none';
        }
    }

    function onMouseMove(movement) {
        const scene = viewer.scene;

        const now = performance.now();
        // 너무 자주 호출되면 무시
        if (now - hoverCheckLastTime < 50) return;
        
        hoverCheckLastTime = now;

        /*
        * 현재 마우스 아래 icon entity (설명서) 찾기
        */
        let pickedEntity;
        if(!pickedEntity) pickedEntity = scene.pick(movement.endPosition);
        if (Cesium.defined(pickedEntity) && pickedEntity.id && pickedEntity.id.id === 'entity_icon') {
            showEntityOverlay(pickedEntity.id);
        } else {
            hideEntityOverlay();
        }
        
        /*
        * 경위도 업데이트
        */ 

        infoBox?.handleMouseMove(movement);
    }

    function applyWebMapService(url,layers){
        let wms = new Cesium.WebMapServiceImageryProvider({
            url: url,
            parameters: {
                format: 'image/png',
                transparent:'true',
                tiled: true
            },
            layers : layers
        });
        return viewer.imageryLayers.addImageryProvider(wms);
    }

    function getLoaded3DTilesets() {
        return loaded_3Dtilesets;
    }

    function getToolbarApi(){
        return toolBarApi;
    }

    return {
        init,
        setMode,
        updateTerrain,
        updateBaseLayer,
        updateModelConfig,
        applyWebMapService,
        getLoaded3DTilesets,
        getToolbarApi
    };
})();

export default CesiumHandler;
