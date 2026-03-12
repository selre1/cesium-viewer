function MapLayer({cesiumViewer, options, toolBar} = {}) {
    const viewer = cesiumViewer;
    const container = (typeof viewer.container === 'string') ? document.querySelector(viewer.container) : viewer.container;
    if (!container) { throw new Error('Tool Bar 생성: 유효한 container가 필요합니다.'); }
    const toolBarApi = toolBar;


    const layerDataSources = {};

    if(options){
        const optionsKeys = Object.keys(options);
        optionsKeys.forEach( key => {
            const layerOption = options[key];
            loadGeoJsonLayer( key, layerOption.path, layerOption.color);
        });
    }

    async function loadGeoJsonLayer(layerId, geojsonPath, color) {
        try {
            // 색상이 제공되지 않으면 기본 색상 사용
            const layerColor = color || '#2b7fff';

            // GeoJSON 파일 로드 (지상에 표시)
            const dataSource = await Cesium.GeoJsonDataSource.load(geojsonPath, {
                stroke: Cesium.Color.fromCssColorString(layerColor),
                fill: Cesium.Color.fromCssColorString(layerColor).withAlpha(0.3),
                strokeWidth: 2,
                clampToGround: true  // 지상에 고정
            });

            // 로드된 엔티티들을 지상에 고정
            dataSource.entities.values.forEach(function(entity) {
                if (entity.polygon) {
                    entity.polygon.clampToGround = true;
                    entity.polygon.height = 0;
                }
                if (entity.polyline) {
                    entity.polyline.clampToGround = true;
                    entity.polyline.height = 0;
                }
            });

   
          
            if (viewer && viewer.dataSources) {
                viewer.dataSources.add(dataSource);
                dataSource.show = false; // 초기 상태: 숨김
                layerDataSources[layerId] = dataSource;
            }
        } catch (error) {
            console.error(`레이어  로드 실패:`, error);
        }
    }

        // 레이어 표시 함수
    function showLayer(layerId) {
        if (layerDataSources[layerId]) {
            layerDataSources[layerId].show = true;
            console.log(`레이어  표시`);
         }
    }

        // 레이어 숨김 함수
    function hideLayer(layerId) {
        if (layerDataSources[layerId]) {
            layerDataSources[layerId].show = false;
            console.log(`레이어  숨김`);
        }
    }

    const modal = $(`<div id="layerControlModal" class="layer-control-modal">
        <div class="layer-control-content">
            <div class="layer-control-header">
                <div class="layer-control-title-wrap">
                    <div class="layer-control-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                            <polyline points="2 17 12 22 22 17"></polyline>
                            <polyline points="2 12 12 17 22 12"></polyline>
                        </svg>
                    </div>
                    <div class="layer-control-title-group">
                        <h2 class="layer-control-title">지도 레이어</h2>
                        <p class="layer-control-subtitle" id="layerActiveCount">0개 활성화</p>
                    </div>
                </div>
                
                <button type="button" class="layer-control-close" id="layerControlClose">
                    ✕
                </button>
            </div>

            <div class="layer-control-body">
                <div class="layer-control-item" data-layer="SA001">
                    <div class="layer-control-item-left">
                        <div class="layer-control-item-icon" style="color: blue">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                            </svg>
                        </div>
                        <span class="layer-control-item-text">상수관로</span>
                    </div>
                    <div class="layer-control-item-toggle">
                        <div class="layer-control-item-toggle-circle"></div>
                    </div>
                </div>
                <div class="layer-control-item" data-layer="SB001">
                    <div class="layer-control-item-left">
                        <div class="layer-control-item-icon" style="color: red">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                            </svg>
                        </div>
                        <span class="layer-control-item-text">하수관거</span>
                    </div>
                    <div class="layer-control-item-toggle">
                        <div class="layer-control-item-toggle-circle"></div>
                    </div>
                </div>
            </div>

            <div class="layer-control-footer">
                <button type="button" class="layer-control-footer-btn on" id="layerControlAllOn">모두 켜기</button>
                <button type="button" class="layer-control-footer-btn off" id="layerControlAllOff">모두 끄기</button>
            </div>
        </div>
    </div>`).appendTo(viewer.container);

    const modalstyle = `.layer-control-modal {
            display: none;
            position: fixed;
            top: 92px;
            right: 56px;
            width: 380px;
            max-width: calc(100% - 72px);
            max-height: calc(100vh - 140px);
            background: #0a0a0a;
            border-radius: 20px;
            box-shadow: 0 45px 80px rgba(3, 7, 18, 0.85);
            overflow: hidden;
            pointer-events: auto;
            z-index: 100;
            backdrop-filter: blur(20px);
        }

        .layer-control-modal.show {
            display: flex !important;
            flex-direction: column;
        }

        .layer-control-overlay {
            display: none;
        }

        .layer-control-content {
            position: relative;
            width: 100%;
            height: 100%;
            background: transparent;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .layer-control-header {
            padding: 16px 20px;
            background: linear-gradient(180deg, rgba(43, 127, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0) 100%);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .layer-control-title-wrap {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .layer-control-icon {
            width: 40px;
            height: 40px;
            background: rgba(43, 127, 255, 0.2);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .layer-control-title-group {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .layer-control-title {
            font-family: 'Noto Sans KR', sans-serif;
            font-size: 18px;
            font-weight: 400;
            color: #ffffff;
            margin: 0;
            line-height: 28px;
        }

        .layer-control-subtitle {
            font-family: 'Noto Sans KR', sans-serif;
            font-size: 12px;
            font-weight: 400;
            color: #99a1af;
            margin: 0;
            line-height: 16px;
        }

        .layer-control-close {
            width: 32px;
            height: 32px;
            background: rgba(255, 255, 255, 0.05);
            border: none;
            border-radius: 10px;
            color: #99a1af;
            font-size: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .layer-control-close:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
        }

        .layer-control-body {
            flex: 1;
            padding: 16px 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .layer-control-item {
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(43, 127, 255, 0.2);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            transition: all 0.2s;
        }

        .layer-control-item.active {
            background: rgba(43, 127, 255, 0.1);
            border-color: rgba(43, 127, 255, 0.2);
        }

        .layer-control-item-left {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .layer-control-item-icon {
            width: 36px;
            height: 36px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .layer-control-item.active .layer-control-item-icon {
            background: rgba(43, 127, 255, 0.2);
        }

        .layer-control-item-text {
            font-family: 'Noto Sans KR', sans-serif;
            font-size: 14px;
            font-weight: 400;
            color: #99a1af;
            line-height: 20px;
        }

        .layer-control-item.active .layer-control-item-text {
            color: #ffffff;
        }

        .layer-control-item-toggle {
            width: 44px;
            height: 24px;
            background: #4a5565;
            border-radius: 9999px;
            position: relative;
            transition: background 0.2s;
        }

        .layer-control-item.active .layer-control-item-toggle {
            background: #2b7fff;
        }

        .layer-control-item-toggle-circle {
            width: 16px;
            height: 16px;
            background: #ffffff;
            border-radius: 50%;
            position: absolute;
            top: 4px;
            left: 4px;
            transition: transform 0.2s;
        }

        .layer-control-item.active .layer-control-item-toggle-circle {
            transform: translateX(20px);
        }

        .layer-control-footer {
            padding: 16px 20px;
            background: #1a1a1a;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            gap: 12px;
        }

        .layer-control-footer-btn {
            flex: 1;
            padding: 10px 20px;
            border: none;
            border-radius: 10px;
            font-family: 'Noto Sans KR', sans-serif;
            font-size: 14px;
            font-weight: 400;
            cursor: pointer;
            transition: all 0.2s;
        }

        .layer-control-footer-btn.on {
            background: rgba(21, 93, 252, 0.2);
            color: #51a2ff;
        }

        .layer-control-footer-btn.off {
            background: rgba(74, 85, 101, 0.2);
            color: #99a1af;
        }

        .layer-control-footer-btn:hover {
            opacity: 0.8;
        }
`
    $('<style>', {id:'maplayer-style', text: modalstyle }).appendTo('head');
    
    const modalEl = modal[0];

    const layerControlModal = modalEl;
    const layerControlClose = modalEl.querySelector('#layerControlClose');
    const layerControlAllOn = modalEl.querySelector('#layerControlAllOn');
    const layerControlAllOff = modalEl.querySelector('#layerControlAllOff');
    const layerItems = modalEl.querySelectorAll('.layer-control-item');

    toolBarApi.addToolGroup({
            id: 'maplayer',
            html: `
            <button class="tool-group" id="group-layer">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"  viewBox="0 0 24 24"  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
            </button>`,
            panel: '#layerControlModal',
            openClass: 'show',
            onClose: () => {
                layerControlModal.classList.remove('show');
            }
    });
    
    layerItems.forEach(item => {
        item.addEventListener("click", () => {
            item.classList.toggle("active");
            const layerId = item.dataset.layer; // 레이어 ID (예: "SA001", "SB001")
            const isActive = item.classList.contains("active");
                if (isActive) {
                    showLayer(layerId);
                } else {
                    hideLayer(layerId);
                }
            updateLayerActiveCount();
        });
    });

    if (layerControlClose) {
        layerControlClose.addEventListener("click", () => {
            layerControlModal.classList.remove("show");
            toolBarApi?.closeGroup?.("maplayer");
        });
    }

    if (layerControlAllOn) {
        layerControlAllOn.addEventListener("click", () => {
            layerItems.forEach(item => {
                item.classList.add("active");
                const layerId = item.dataset.layer;
                showLayer(layerId);
            });
            updateLayerActiveCount();
        });
    }

    if (layerControlAllOff) {
        layerControlAllOff.addEventListener("click", () => {
            layerItems.forEach(item => {
                item.classList.remove("active");
                const layerId = item.dataset.layer;
                hideLayer(layerId);
            });
            updateLayerActiveCount();
        });
    }

    function updateLayerActiveCount() {
        const activeCount = document.querySelectorAll(".layer-control-item.active").length;
        const countElement = document.getElementById("layerActiveCount");
        if (countElement) {
            countElement.textContent = activeCount + "개 활성화";
        }
    }

    layerControlClose.addEventListener("click", (e) => {
            layerControlModal.classList.remove("show");
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (layerControlModal.classList.contains("show")) {
                layerControlModal.classList.remove("show");
                toolBarApi?.closeGroup?.("maplayer");
            }
        }
    });
}
