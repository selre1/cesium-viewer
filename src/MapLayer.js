import {MAPLAYER_STYLE_ID, MAPLAYER_CSS, MAPLAYER_HTML} from "./UiTemplates.js";

export function MapLayer({cesiumViewer, options} ) {
    const viewer = cesiumViewer;
    const container = (typeof viewer.container === 'string') ? document.querySelector(viewer.container) : viewer.container;
    if (!container) { throw new Error('Tool Bar 생성: 유효한 container가 필요합니다.'); }

    if (!document.getElementById(MAPLAYER_STYLE_ID)) {
        $('<style>', { MAPLAYER_STYLE_ID, text: MAPLAYER_CSS }).appendTo('head');
    }
    const $root = $(MAPLAYER_HTML);
    container.appendChild($root[0]);

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

    const layerItems = document.querySelectorAll(".layer-control-item");
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

    // 모두 켜기/끄기 버튼
    const layerControlAllOn = document.getElementById("layerControlAllOn");
    const layerControlAllOff = document.getElementById("layerControlAllOff");
    const layerControlClose = document.getElementById("layerControlClose");
    const layerControlModal = document.getElementById("layerControlModal");

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
            }
        }
    });

}