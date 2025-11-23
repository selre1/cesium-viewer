import {
  HUD_STYLE_ID, HUD_CSS, HUD_HTML,
  INSPECTOR_STYLE_ID, INSPECTOR_CSS, INSPECTOR_HTML,
  COMPASS_SVG
} from "./UiTemplates.js";
import {flyDirectionStayFitModel, flyToTilesetsWithPreset} from "./CameraMovement.js";
import { CameraFreeMode }   from "./CameraFreeMode.js";
import { CameraOrbitMode } from "./CameraOrbitMode.js";
import { Measurement }  from "./Measurement.js";

var CesiumHandler = (function(){
    //Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzYjI4ZjRhOS1lNDdiLTQwYjQtOWUxNC04ZDgxMzA5ZDZkOWYiLCJpZCI6MjQwMDY3LCJpYXQiOjE3NjI5MzU5MTZ9.3Ld8v74q8vXrCIoM0TQGdgqlCUO3pX4UQKmUTSO1Fck";
        
    let viewer, handler;
    let infoBoxEls = {}, infoBoxEnabled = false;
    let inspectorBoxEl, inspectorLists, properties = {}, 
        inspectorBoxEnabled = false, $btnInspectorModelShow, inspectorSelectedModel = null, $btnResetHiddenModels=null;
    const inspectorHiddenModel = new Set();

    let entityOverlayEl = null;              // HTML 오버레이 엘리먼트
    const entityScratch = new Cesium.Cartesian2(); //preRender에서 재사용할 좌표 버퍼

    let unionTilesetCenter; // 타일셋 중심 좌표
    let hoverCheckLastTime = 0;

    let currentModelConfig = { // 기본 모델 정보
        tilesetUrl: null,
        propertyUrls: [],
        info: {
            text: undefined,
            iconSrc: undefined,
            length: 100.0,
        },
    };
    let loaded_3Dtilesets = []; // 현재 scene에 추가된 tilesets

    // 마우스 hover 시 모델 하이라이트
    const hoverState = {
        model: undefined,
        color: undefined,
        blendMode: undefined,
        blendAmount: undefined,
    };
    
    // 마우스 click 시 모델 하이라이트
    const selectedState = {
        model: undefined,
        color: undefined,
        blendMode: undefined,
        blendAmount: undefined,
    };

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
        sceneMode: Cesium.SceneMode.SCENE3D,
        //useDefaultRenderLoop: false // 자동 렌더링 여부
        // requestRenderMode: true, // scene을 업데이트하지 않으면 새 프레임을 렌더링하지 않도록 설정
        //terrain: Cesium.Terrain.fromWorldTerrain(), //세슘 ion 지원
       // terrain: new Cesium.Terrain(Cesium.CesiumTerrainProvider.fromUrl('./terrain/tr')),
        baseLayer: new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
            url: 'https://xdworld.vworld.kr/2d/Satellite/service/{z}/{x}/{y}.jpeg',
            //rl: 'https://xdworld.vworld.kr/2d/Base/service/{z}/{x}/{y}.png',
            subdomains: 'base',
            minimumLevel: 0,
            maximumLevel: 19,
            rectangle: new Cesium.Rectangle(
                Cesium.Math.toRadians(-180.0),
                Cesium.Math.toRadians(-90.0),
                Cesium.Math.toRadians(180.0),
                Cesium.Math.toRadians(90.0))
        }))
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

    // 현재 기능 정의
    const Mode = {
        NORMAL: 'normal',
        CAMERA_FREE: 'cameraFree',
        ORBIT: 'orbit',
        MEASURE_POINT: 'measure_point',
        MEASURE_DISTANCE: 'measure_distance',
        MEASURE_VERTICAL: 'measure_vertical',
        MEASURE_AREA_GROUND: 'measure_area_ground',
        MEASURE_AREA_SURFACE: 'measure_area_surface',
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
        inspectBoxDisable();
        restoreModelState(selectedState);
        if (toolBarApi) toolBarApi.showMountToolBar();

        switch (nextMode) {
        case Mode.NORMAL:
            infoBoxEnable();
            inspectBoxEnable();
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
        }

        currentMode = nextMode;
    }

    async function init(elementId, { tilesetUrl, propertyUrls, info} = {}) {
        viewer = initCesiumViewer(elementId);
        translucencyUpdate(); // 지하 특화 환경
        createCompas(); // 나침반 생성

        cameraFree  = CameraFreeMode({ cesiumViewer: viewer });
        cameraOrbitMode = CameraOrbitMode({cesiumViewer: viewer});
        measurement = Measurement({ cesiumViewer: viewer });

        createInfoBox({container: viewer.container});
        infoBoxEnable();

        toolBarApi = measurement.mountToolBar({
            container: viewer.container,
            onPoint: () => setMode(Mode.MEASURE_POINT),
            onLine: () => setMode(Mode.MEASURE_DISTANCE),
            onVertical: () => setMode(Mode.MEASURE_VERTICAL),
            onAreaGround: () => setMode(Mode.MEASURE_AREA_GROUND),
            onAreaSurface: () => setMode(Mode.MEASURE_AREA_SURFACE),
            onClose: () => setMode(Mode.NORMAL),
            onInit: () => measurement.removeAll(),
            onMarkerAdd() { console.log('마커 추가 클릭'); },
            onMarkerClear() { console.log('마커 초기화 클릭'); }
        });

        createInspectBox();
        inspectBoxEnable();

        currentModelConfig = {
            tilesetUrl: tilesetUrl,
            propertyUrls: propertyUrls,
            info: info,
        };

        await applyModelConfig(currentModelConfig);

        setMode(Mode.NORMAL);
        
        return viewer;
    }

    function initCesiumViewer(elementId){
        if (!window.Cesium) { console.error('CesiumJS not loaded.'); return; }
        var ph = document.querySelector('.viewer-placeholder');
        if (ph) ph.remove();
    
        const cesiumViewer = new Cesium.Viewer(elementId, DefaultOption);
        //cesiumViewer.scene.fxaa = false;
        cesiumViewer.scene.sun.show  = false;   // 태양
        cesiumViewer.scene.moon.show = false;   // 달
        
        cesiumViewer.scene.globe.depthTestAgainstTerrain = true; //지형(terrain)을 기준으로 깊이 테스트(지형 우선)
        cesiumViewer.scene.screenSpaceCameraController.enableCollisionDetection = false; // 카메라 충돌 감지 비활성화(지하를 탐색하기 위함)
        cesiumViewer.scene.globe.translucency.frontFaceAlphaByDistance = new Cesium.NearFarScalar( 400.0, 0.0, 2000.0, 1.0);
       //cesiumViewer.resolutionScale = 0.75; // 해상도 낮추기
        cesiumViewer.scene.globe.baseColor = new Cesium.Color(0, 0, 0, 1);
        $( '.cesium-viewer-bottom' ).remove();
    
        if (!handler) handler = new Cesium.ScreenSpaceEventHandler(cesiumViewer.canvas);

        handler.setInputAction(function () {
            cesiumViewer.trackedEntity = undefined;
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    
        const controller = cesiumViewer.scene.screenSpaceCameraController;
        // 줌/회전 민감도 낮추기 (기본 zoomFactor≈5, rotateFactor≈1 근처)
        controller.zoomFactor   = 1.5;  // 휠 줌 너무 세면 1.2~2.0 정도로
        controller.rotateFactor = 0.4;  // 회전 속도 줄이기
        // 너무 가까이/멀리 못 가게 범위 제한
        controller.minimumZoomDistance = 2.0;    // 지하 모델 근접 최소 거리
        controller.maximumZoomDistance = 300.0;  // 이 이상은 멀어지지 않게

        // 카메라 관성(밀려나가는 느낌) 줄이기
        const cam = cesiumViewer.camera;
        cam.inertiaSpin      = 0.2;  // 회전 관성 (기본 0.9 근처)
        cam.inertiaTranslate = 0.4;  // 이동 관성
        cam.inertiaZoom      = 0.4;  // 줌 관성

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

    async function applyModelConfig(config={}) {
        const tasks = [];

        // 3D Tileset 로딩
        if(config.tilesetUrl) {
            const tilesets = await renderingAllTileset({ url: config.tilesetUrl });

            // 해당 위치로 카메라 이동
            unionTilesetCenter = unionAllTilesetsBoundingSphereCompute(tilesets);
            flyToTilesetsWithPreset(viewer, unionTilesetCenter, "top", 0.8, 600);

            tasks.push(tilesets);
        }

        // 모델 정보 라벨 업데이트
        if(config.info){
            removeModelInfoLabel();
            setModelInfoLabel(config.info);
        }

        // propertyUrls 업데이트
        if (config.propertyUrls && config.propertyUrls.length) tasks.push(loadTilesetInfo({ url: config.propertyUrls }));
        
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
            ...currentModelConfig .info,
            ...(config.info || {}),
            },
        };
        return applyModelConfig(currentModelConfig );
    }

    async function renderingAllTileset({url}) {

        if(loaded_3Dtilesets.length > 0){
            loaded_3Dtilesets.forEach(ts=>{
                viewer.scene.primitives.remove(ts);
            })
        }
        loaded_3Dtilesets = [];

        if (!url) {
            console.warn("url이 존재하지 않습니다.");
            return [];
        }

        const tilesets = await loadAllTilesets(url);
        loaded_3Dtilesets = tilesets;

        return tilesets;
    }

    async function loadTilesetInfo({url}) {
        let totalLoaded = 0;
        for (const jsonUrl of url) {
            try {
                const response = await fetch(jsonUrl);

                if (!response.ok) {
                    console.warn(`JSON 파일 로드 실패 (${response.status}): ${jsonUrl}`);
                    continue;
                }
                const propertiesData = await response.json();
                properties = { ...properties, ...propertiesData };
                totalLoaded += Object.keys(propertiesData).length;

            } catch (error) {
                console.error(`JSON 로드 실패: ${jsonUrl}`, error);
            }
        }
        console.log(`${totalLoaded}개 객체 로드 완료`);
        return properties;
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

    //  BoundingSphere 기준 수직라인 + 라벨 생성
    function setModelInfoLabel(options = {}) {
        if (!unionTilesetCenter || !viewer) return;

        const text        = options.text   || 'Untitled';
        const iconSrc     = options.iconSrc || undefined;
        const lineLength  = options.length || 100.0;
        const ellipsoid   = viewer.scene.globe.ellipsoid;

        // BoundingSphere 중심 -> 경위도/고도
        const centerCartesian  = unionTilesetCenter.center;
        const centerCarto      = ellipsoid.cartesianToCartographic(centerCartesian);

        const baseHeight       = centerCarto.height;            // 필요시 0으로 고정해도 됨
        const cylinderMidH     = baseHeight + lineLength / 2.0; // 원통 중심 높이
        const labelHeight      = baseHeight + lineLength;       // 라벨 높이

        // 원통(수직 라인) 중심 위치
        const cylinderPos = Cesium.Cartesian3.fromRadians(
            centerCarto.longitude,
            centerCarto.latitude,
            cylinderMidH
        );

        // 이미지 위치 (라인 최상단)
        const labelPos = Cesium.Cartesian3.fromRadians(
            centerCarto.longitude,
            centerCarto.latitude,
            labelHeight
        );

        // 수직 원통 라인
        viewer.entities.add({
            id: 'entity_line',
            position: cylinderPos,
            orientation: Cesium.Transforms.headingPitchRollQuaternion(
                cylinderPos,
                new Cesium.HeadingPitchRoll(0, 0, 0) // ENU 기준 위쪽
            ),
            cylinder: {
                length: lineLength,
                topRadius: 0.2,      // 반경 0.5m
                bottomRadius: 0.2,
                material: Cesium.Color.WHITE.withAlpha(0.9),
                outline: false,
            
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 8000.0)
            }
        });

        // 지하시설 이미지 썸네일 
        createRoundBadgeCanvas({
            text : text,
            iconSrc: iconSrc,
            size: 50,
            padding: 5,
            pixelScale: 1.5 
        }).then((badgeCanvas) => {
            viewer.entities.add({
                id : 'entity_icon',
                position: labelPos,
                properties: {
                    title: `${text}`,
                    desc:  '이 영역은 지하시설물 3D 모델의 중심 지점을 나타냅니다.'
                },
                billboard: {
                    image: badgeCanvas,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, 6),
                    scale: 1.0,
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 8000.0)
                }
            });
        });
    }

    // 모델 정보 라벨 제거
    function removeModelInfoLabel() {
        const lineEntity  = viewer.entities.getById("entity_line");
        const iconEntity = viewer.entities.getById("entity_icon");
        if (lineEntity)  viewer.entities.remove(lineEntity);
        if (iconEntity) viewer.entities.remove(iconEntity);
    }

    function updateInspectorToggleButton(model) {
        inspectorSelectedModel = model;

        if (!$btnInspectorModelShow) return;
        
        if (model) {
            $btnInspectorModelShow.removeAttr('disabled');
            const isVisible = (model.show !== false);
            $btnInspectorModelShow.text(`${isVisible ? '숨김' : '보기'}`);
        } else {
            $btnInspectorModelShow.attr('disabled');
            $btnInspectorModelShow.textContent = '숨김';
        }
    }

    function injectStyleOnce(id, cssText) {
        if (!document.getElementById(id)) {
            $('<style>', { id, text: cssText }).appendTo('head');
        }
    }

    function createInspectBox(){
        const $viewerContainer = $(viewer.container);
        const $parent = $viewerContainer.parent();

        if (!$viewerContainer.length) return;
        if (!$parent.length || $parent.hasClass('shell')) return;

        injectStyleOnce(INSPECTOR_STYLE_ID, INSPECTOR_CSS);

        const $shell = $(`
            <div class="shell" id="shell">
            <main></main>
            </div>
        `);
         $viewerContainer.before($shell);

        const $main = $shell.find('main');
        $main.append($viewerContainer);

        const $inspectorBox = $(INSPECTOR_HTML);
        $shell.append($inspectorBox);

        inspectorBoxEl = $inspectorBox[0];
        inspectorLists = document.getElementById('inspector_list_container');
        const $btnInspectorClose = $inspectorBox.find('#btnInspectorClose');
        $btnInspectorModelShow = $inspectorBox.find('#btnInspectorModelShow');

        $btnInspectorModelShow.on('click', function(){
            const model = inspectorSelectedModel;
            if (!model) return;

            const isVisible  = (model.show !== false); // 현재 모델이 보이는 상태인지
            model.show = !isVisible ;
            isVisible ? inspectorHiddenModel.add(model) : inspectorHiddenModel.delete(model);
            $btnInspectorModelShow.text(`${isVisible  ? '보기' : '숨김'}`);
            updateHiddenModelsResetButton();
        });

        $btnInspectorClose.on('click', function () {
            const isHidden = $inspectorBox.attr('hidden') !== undefined;

            if (isHidden) {
                $inspectorBox.removeAttr('hidden');
                $shell.removeClass('no-inspector');
                $(this).text('닫기');
            } else {
                $inspectorBox.attr('hidden', '');
                $shell.addClass('no-inspector');
                $(this).text('열기');
            }
        });

        function updateHiddenModelsResetButton() {
            const hasHidden = inspectorHiddenModel.size > 0;

            if (!hasHidden) {
                // 숨긴 모델이 하나도 없으면 버튼 숨김
                if ($btnResetHiddenModels) {
                    $btnResetHiddenModels.hide();
                }
                return;
            }

            // 숨긴 모델이 하나 이상
            if (!$btnResetHiddenModels) {
                // 처음 한 번만 생성
                const $root = $(viewer.container); 

                $btnResetHiddenModels = $(`
                    <button
                        id="btn-reset-hidden-models"
                        type="button"
                        class="cesium-button"
                        style="
                            position:absolute;
                            top:8px;
                            left:50%;
                            transform:translateX(-50%);
                            z-index:2000;
                            padding:4px 12px;
                            font-size:11px;
                            background: #2f80ff;
                            text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">
                        숨김 모델 초기화
                    </button>
                `);

                // 리셋 버튼 클릭 시 숨긴 모델 전부 다시 보이기
                $btnResetHiddenModels.on('click', () => {
                    inspectorHiddenModel.forEach(model => {
                        if (model && !model.isDestroyed?.()) {
                            model.show = true;
                        }
                    });
                    inspectorHiddenModel.clear();

                    // 선택 모델 버튼 텍스트도 복구
                    if (inspectorSelectedModel && !inspectorSelectedModel.isDestroyed?.()) {
                        inspectorSelectedModel.show = true;
                        if ($btnInspectorModelShow) {
                            $btnInspectorModelShow.text('숨김');
                        }
                    }

                    // 자기 자신 숨기기
                    $btnResetHiddenModels.hide();
                });

                $root.append($btnResetHiddenModels);
            }

            // Set에 뭔가 들어와 있으면 항상 보이도록
            $btnResetHiddenModels.show();
        }
    }

    function inspectBoxEnable(){
            if (inspectorBoxEnabled) return;
            inspectorBoxEnabled = true;
            if (handler) handler.setInputAction(onMouseLeftClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            
    }

    function inspectBoxDisable(){
            inspectorBoxEnabled = false;
            if (handler) handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            setInspectorBox(false);
    }
    
    function setInspectorBox(isOpen) {
        if (!inspectorBoxEl) return;

        const $inspector    = $(inspectorBoxEl);
        const $shell        = $inspector.closest('.shell');
        const $btnInspectorClose = $inspector.find('#btnInspectorClose');

        if (isOpen) {
            $inspector.removeAttr('hidden');
            $shell.removeClass('no-inspector');
            $btnInspectorClose.text('닫기');
            inspectorBoxEnabled = true;
        } else {
            $inspector.attr('hidden', '');
            $shell.addClass('no-inspector');
            $btnInspectorClose.text('열기');
            inspectorBoxEnabled = false;
        }
    }

    function createCompas(){
        const $wrap = createElement();
    const $svg = $wrap.find('svg');

    // 회전 중심을 정중앙으로
    $svg.css({
        width: '100%',
        height: '100%',
        'transform-origin': '50% 50%',
        'will-change': 'transform'
    });

    // 카메라 heading에 맞춰 회전
    viewer.scene.postRender.addEventListener(() => {
        const heading = viewer.camera.heading; // 라디안
        // 일반적으로 나침반은 카메라 반대방향으로 돌려서 "북"이 항상 위로 보이게 함
        $svg.css('transform', `rotateZ(${-heading}rad)`);
    });

    // 클릭 이벤트 (지금은 비활성)
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
                shadows: Cesium.ShadowMode.ENABLED,
                // skipLevelOfDetail: true,
                // baseScreenSpaceError: 2048,
                // skipScreenSpaceErrorFactor: 32,
                // skipLevels: 1,
                // immediatelyLoadDesiredLevelOfDetail: false,
                // loadSiblings: false,
                // dynamicScreenSpaceError: true,
                // dynamicScreenSpaceErrorDensity: 2.0e-4,
                // dynamicScreenSpaceErrorFactor: 24.0,
                // dynamicScreenSpaceErrorHeightFalloff: 0.25

                maximumScreenSpaceError: 20,      // default 16보다 올려서 성능상향
                skipLevelOfDetail: true,
                baseScreenSpaceError: 1024,
                skipScreenSpaceErrorFactor: 16,
                skipLevels: 1,
                immediatelyLoadDesiredLevelOfDetail: false,
                loadSiblings: false,

                dynamicScreenSpaceError: true,
                dynamicScreenSpaceErrorDensity: 2.0e-4,
                dynamicScreenSpaceErrorFactor: 24.0,
                dynamicScreenSpaceErrorHeightFalloff: 0.25,
                cullWithChildrenBounds: true,
                cullRequestsWhileMoving: true
            
            });
            viewer.scene.primitives.add(tileset);

            /*
            // 타일 로드되는 프로그래스바
            tileset.loadProgress.addEventListener(function(numberOfPendingRequests, numberOfTilesProcessing) {
                if ((numberOfPendingRequests === 0) && (numberOfTilesProcessing === 0)) {
                    console.log('Stopped loading');
                    return;
                }

                console.log(`Loading: requests: ${numberOfPendingRequests}, processing: ${numberOfTilesProcessing}`);
            });
            */
            return tileset;
        } catch (error) {
            console.error(`Tileset 생성 중 오류 발생: ${error}`);
            return undefined;
        }
    }

    async function loadAllTilesets(rootTilesetUrl) {
        try {
            const url = await Promise.resolve(rootTilesetUrl);
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`Root tileset 로드 실패: ${response.status}`);
                return [];
            }
            const rootData = await response.json();
            const children = rootData.root?.children || [];
            console.log(`타입별 Tileset: ${children.length}개`);

            const loadedTilesets = [];
            const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);

            for (const child of children) {
                if (child.content && child.content.uri) {
                    const childUrl = baseUrl + child.content.uri;
                    const tilesetName = child.content.uri.replace('_tileset.json', '').replace('/tileset.json', '');
                    const tileset = await createTileset(childUrl, tilesetName);
                    if (tileset) {
                        loadedTilesets.push(tileset);
                    }
                }
            }
            console.log(`총 ${loadedTilesets.length}개 Tileset 로드 완료`);
            return loadedTilesets;

        } catch (error) {
            console.error(`루트 tileset 처리 실패:`, error);
            return [];
        }
    }

    function unionAllTilesetsBoundingSphereCompute(loadedTilesets){
        const paddingScale = 1.2;
            const ready = loadedTilesets.filter(t => t && t.boundingSphere);
            if (ready.length === 0) return;
            // union 구체 계산
            let union = ready[0].boundingSphere;
            for (let i = 1; i < ready.length; i++) {
                union = Cesium.BoundingSphere.union(union, ready[i].boundingSphere);
            }
            union = new Cesium.BoundingSphere(union.center, union.radius * paddingScale);
        return union;
    }

    function createInfoBox({container}) {

        injectStyleOnce(HUD_STYLE_ID, HUD_CSS);

        const $root = $(HUD_HTML);
        const infoBoxRootEl = $root[0];
        container.appendChild($root[0]);

        infoBoxEls.lon   = infoBoxRootEl.querySelector('#hud-lon');
        infoBoxEls.lat   = infoBoxRootEl.querySelector('#hud-lat');
        infoBoxEls.hgt   = infoBoxRootEl.querySelector('#hud-height');
        infoBoxEls.zoom  = infoBoxRootEl.querySelector('#hud-zoom');
        
        const $cameraFree  = $('#btn_cameraFreeMode');
        const $modeWrap    = $(infoBoxRootEl).find('.hud-mode-wrap');
        const $hcg         = $modeWrap.find('#hud-camera-group');
        const $hcm         = $modeWrap.find('.hud-cg-menu');

        const $transHeader = $root.find('.hud-trans-header');
        const $transBody   = $root.find('.hud-trans-body');
        const $toggleIcon  = $root.find('.hud-trans-toggle');
        const $onlyModel = $(infoBoxRootEl).find('#hud-only-model');
        const $performance = $(infoBoxRootEl).find('#hud-performance');

        const $hudToggle = $root.find('#hud-info-toggle');
        const $orbitBtn   = $root.find('#btn_orbitMode');

        // 초기 상태: 펼쳐져 있고 아이콘은 "−"
        $transBody.show();
        $toggleIcon.text('−');
        

        $hudToggle.on('click', (e) => {
            e.stopPropagation();
            $root.toggleClass('is-open');
        });

        $transHeader.on('click', function (e) {
            // 체크박스 자체를 클릭한 경우에는 접기/펼치기 동작을 막음
            if ($(e.target).is('#hud-translucency'))  return;
            const isOpen = $transBody.is(':visible');
            if (isOpen) {
                $transBody.slideUp(120);
                $toggleIcon.text('+');
            } else {
                $transBody.slideDown(120);
                $toggleIcon.text('−');
            }
        });

        //모델만 보기
        $onlyModel.on('change', function () {
            const on = $(this).is(':checked');
            const scene = viewer.scene;

            // 지구(타원체 + 지형) 숨기기
            scene.globe.show = !on;

            // 대기/하늘 제거
            if (scene.skyAtmosphere) scene.skyAtmosphere.show = !on;
            scene.skyBox = on ? null : scene.skyBox;

            // 배경색(모델만 보이게)
            scene.backgroundColor = on ? Cesium.Color.BLACK : Cesium.Color.fromCssColorString('#0b0f14');
        });
        
        // fps 변경사항 감지
        $performance.on('change', function(){
            const on = $(this).is(':checked');
            // 60이상 화면 양호 / 30~60 보통 / 30이하 끊김
            on ? viewer.scene.debugShowFramesPerSecond = true : viewer.scene.debugShowFramesPerSecond = false;
        });

        // 모델 환경 투명도 조절
        bindTranslucencyControls();

        // 카메라 그룹 버튼 클릭 시 열고/닫기
        $hcg.on('click', function (e) {
            e.stopPropagation();
            $modeWrap.toggleClass('is-open');
        });

        // 카메라 그룹 안에서 항목 클릭 처리 (수직, 좌측45도, 우측45도)
        $hcm.on('click', 'button', function (e) {
            flyToTilesetsWithPreset(viewer, unionTilesetCenter, this.dataset.view, 0.8, 600);
        });

        // 탐색모드 버튼
        $cameraFree.on('click', () => {
            //alert('해당 서비스 준비중입니다.');
           // return;

           // 이미 탐색모드면 NORMAL로, 아니면 CAMERA_FREE로
            const next = (currentMode === Mode.CAMERA_FREE)
                ? Mode.NORMAL
                : Mode.CAMERA_FREE;
            setMode(next);
             syncModeButtons();
        });

        // 회전모드 버튼
        $orbitBtn.on('click', () => {
            // ORBIT 켜려는데 center 없으면 경고
            if (currentMode !== Mode.ORBIT && !unionTilesetCenter) {
                alert('타일셋이 아직 로드되지 않았습니다.');
                return;
            }
            const next = (currentMode === Mode.ORBIT)
                ? Mode.NORMAL
                : Mode.ORBIT;
            setMode(next);
            syncModeButtons();
        });

        // 모드 변경 시 버튼 상태 동기화
        const syncModeButtons = () => {
            const isFree  = currentMode === Mode.CAMERA_FREE;
            const isOrbit = currentMode === Mode.ORBIT;

            $cameraFree.toggleClass('is-active', isFree);
            $orbitBtn.toggleClass('is-active', isOrbit);
        };

        function bindTranslucencyControls() {
            const $chkTrans    = $root.find('#hud-translucency');
            const $chkFade     = $root.find('#hud-fadeByDistance');
            const $alphaRange  = $root.find('#hud-alpha-range');
            const $alphaValue  = $root.find('#hud-alpha-value');

            const setFadeAlphaEnabled = (enabled) => {
                $chkFade.prop('disabled', !enabled);
                $alphaRange.prop('disabled', !enabled);

                const opacity = enabled ? 1 : 0.4;
                $chkFade.closest('label').css('opacity', opacity);
                $alphaRange.closest('div').css('opacity', opacity); // Alpha 행 전체 흐리게
            };

            // 초기값 동기화
            $chkTrans.prop('checked', !!underFacilitySpecialEvn.translucencyEnabled);
            $chkFade.prop('checked', !!underFacilitySpecialEvn.fadeByDistance);
            $alphaRange.val(underFacilitySpecialEvn.alpha);
            $alphaValue.text(underFacilitySpecialEvn.alpha.toFixed(1));

            setFadeAlphaEnabled(!!underFacilitySpecialEvn.translucencyEnabled);

            // alpha 값 적용 공통 함수
            const applyAlpha = (val) => {
                let alpha = parseFloat(val);
                if (isNaN(alpha)) alpha = 1.0;
                alpha = Cesium.Math.clamp(alpha, 0.0, 1.0);

                underFacilitySpecialEvn.alpha = alpha;
                $alphaRange.val(alpha);
                $alphaValue.text(alpha.toFixed(1)); 

                translucencyUpdate();
            };

            // Translucency on/off
            $chkTrans.on('change', () => {
                const enabled = $chkTrans.is(':checked');
                underFacilitySpecialEvn.translucencyEnabled = enabled;
                setFadeAlphaEnabled(enabled);
                translucencyUpdate();
            });

            // Fade by distance on/off
            $chkFade.on('change', () => {
                underFacilitySpecialEvn.fadeByDistance = $chkFade.is(':checked');
                translucencyUpdate();
            });

            // Alpha 슬라이더
            $alphaRange.on('input change', function () {
                applyAlpha(this.value);
            });

        }
    }

    function infoBoxEnable() {
        if (infoBoxEnabled) return;
        infoBoxEnabled = true;
        if (handler) handler.setInputAction(onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    function infoBoxDisable() {
        infoBoxEnabled = false;
        if (handler) handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    function applyModelHighlight(state, model, color, blendAmount) {
        if (!model) return;

        state.model       = model;
        state.color       = model.color ? model.color.clone() : Cesium.Color.WHITE.clone();
        state.blendMode   = model.colorBlendMode;
        state.blendAmount = model.colorBlendAmount;

        model.color = color;
        model.colorBlendMode   = Cesium.ColorBlendMode.MIX;
        model.colorBlendAmount = blendAmount;
    }

    function restoreModelState(state) {
        if (!state.model) return;

        if (state.color) {
            state.model.color = state.color;
        }
        if (Cesium.defined(state.blendMode)) {
            state.model.colorBlendMode = state.blendMode;
        }
        if (typeof state.blendAmount === 'number') {
            state.model.colorBlendAmount = state.blendAmount;
        }

        state.model       = undefined;
        state.color       = undefined;
        state.blendMode   = undefined;
        state.blendAmount = undefined;
    }

    function updateHoverHighlight(pickedModel){
        if(!pickedModel) restoreModelState(hoverState);
        //이전과 동일한 모델이거나, 선택된 모델이면 → 아무 것도 하지 않음
        if (pickedModel === hoverState.model || pickedModel === selectedState.model) {
            return;
        }

        // 이전 hover 복구 (선택된 모델은 복구 대상에서 제외)
        if (hoverState.model && hoverState.model !== selectedState.model) {
            restoreModelState(hoverState);
        }

        // 새 모델에 hover 적용
        if (pickedModel && pickedModel !== selectedState.model) {
            applyModelHighlight(
                hoverState,
                pickedModel,
                Cesium.Color.YELLOW.withAlpha(0.2), // hover 시 연한 노란색 반투명
                0.25
            );
        }
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
        if (now - hoverCheckLastTime < 50) {
            // 너무 자주 호출되면 무시 (경위도 약간 느려져도 크게 상관 없음)
            return;
        }
        hoverCheckLastTime = now;
        
       const picked = scene.pick(movement.endPosition);


        /*
        * 현재 마우스 아래 entity 찾기
        */ 
        if (Cesium.defined(picked) && picked.id && picked.id.id === 'entity_icon') {
            showEntityOverlay(picked.id);
        } else {
            // entity 위에 있지 않을 때는 숨김
            hideEntityOverlay();
        }



        /*
        * 현재 마우스 아래 모델 찾기
        */ 
       let pickedModel;
        if (Cesium.defined(picked) && picked.content && picked.content._model) {
            pickedModel = picked.content._model;
        }

        /*
        *  hover 하이라이트 업데이트
        *    - 이전 hover 복구 + 새 hover 적용까지 처리
        */
        updateHoverHighlight(pickedModel);
        
        /*
        * 경위도 업데이트
        */ 
        if (!infoBoxEnabled) return;
        // 마우스 위치의 지표/타일 표면 위치 추정
        // cartesian = 데카르트좌표계
        let cartesian = Cesium.defined(scene.pickPosition) ? scene.pickPosition(movement.endPosition) : undefined;
        if (!Cesium.defined(cartesian)) {
            cartesian = scene.camera.pickEllipsoid(movement.endPosition, scene.globe.ellipsoid);
        }
        if (!Cesium.defined(cartesian)) return;

        const c = Cesium.Cartographic.fromCartesian(cartesian);
        const lon = Cesium.Math.toDegrees(c.longitude).toFixed(6);
        const lat = Cesium.Math.toDegrees(c.latitude).toFixed(6);
        const hgt = (c.height || 0).toFixed(2) + ' m';

        infoBoxEls.lon.textContent = lon;
        infoBoxEls.lat.textContent = lat;
        infoBoxEls.hgt.textContent = hgt;

        // ZoomLevel은 카메라 높이 기반으로 표시만
        const camH = viewer.scene.globe.ellipsoid.cartesianToCartographic(viewer.camera.position).height;
        infoBoxEls.zoom.textContent = `${Math.max(0, camH|0)} m`;
    }

    function onMouseLeftClick(movement){
        const scene = viewer.scene;

        /*
        * primitive => 실제 scene에 렌더링된 오브젝트
        * content => 클릭된 오브젝트 타일
        * detail => 내부 세부정보
        */
        let pickedFeature = scene.pick(movement.position);

        //이전 모델 선택 하이라이트 해제
        restoreModelState(selectedState);

        if(!Cesium.defined(pickedFeature) || pickedFeature.id instanceof Cesium.Entity) {
            setInspectorBox(false);
            return;
        }

        //glTF 모델 색상 하이라이트
        const model = pickedFeature.content && pickedFeature.content._model;
        if (model) {
            // hover 상태와 겹치면 hover는 해제
            if (hoverState.model === model) {
                restoreModelState(hoverState);
            }
            // 선택된 모델 하이라이트
            applyModelHighlight(
                selectedState,
                model,
                Cesium.Color.CYAN.withAlpha(0.3),
                0.5
            );
            flyDirectionStayFitModel(viewer,model);
            updateInspectorToggleButton(model);
        }else{
            updateInspectorToggleButton(null);
        }

        let guid = pickedFeature.detail.node._name;
        renderInspector(guid);
        setInspectorBox(true);

        function renderInspector(guid) {
            if (!inspectorLists) return;
            inspectorLists.innerHTML = '';

            const props = properties[guid];
            if (!props) {
                inspectorLists.innerHTML = `
                    <div class="inspect_list">
                        <div class="k">info</div>
                        <div style="color:#cccccc;">속성이 없습니다.</div>
                    </div>
                `;
                return;
            }
            let html = '';
            // props 객체의 key / value를 돌면서 행 생성
            Object.entries(props).forEach(([key, value]) => {
                if (key === 'GUID') return;  
                html += `
                    <div class="inspect_list">
                        <div class="k">${key}</div>
                        <div style="color:#cccccc;">${value}</div>
                    </div>
                `;
            });
            inspectorLists.innerHTML = html;
        }
    }

    return {
        init,
        updateModelConfig
    };
})();

export default CesiumHandler;
