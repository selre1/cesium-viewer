/* ================= infobox Templates ================= */
const HUD_STYLE_ID = 'hud-style';
const HUD_CSS = `
                /* 기본: 패널 위치 */
                #hud-info-panel {
                    position: absolute;
                    top: 8px;
                    left: 8px;
                    z-index: 1;
                    font-size: 11px;
                    color: #e6edf3;
                }

                #hud-info-panel .hud-info-body {
                    display: block;
                }

                /* camerafree 도움말 */
                .free-help { position:absolute; left:50%; transform:translateX(-50%); bottom:64px; padding:10px 12px; border-radius:10px; background:rgba(17,22,28,.95); color:#e6edf3; border:1px solid rgba(255,255,255,.08); box-shadow:0 10px 24px rgba(0,0,0,.45); z-index:5000; max-width:calc(100vw - 32px); font:11px system-ui,-apple-system,Segoe UI,Roboto,"Noto Sans KR",sans-serif; }
                .free-help h4 { margin:0 0 6px 0; font-size:14px; font-weight:700; color:#9ecbff; }
                .free-help .row{ display:flex; gap:10px; margin:4px 0; }
                .free-help kbd{ min-width:40px; padding:2px 6px; border-radius:6px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.06); color:#fff; font:600 11px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; text-align:center; }
                
       
                #btn_cameraFreeMode,
                #btn_orbitMode {
                position: relative;
                overflow: hidden;
                }

                #btn_cameraFreeMode.is-active,
                #btn_orbitMode.is-active {
                background: #151922;          /* HUD 배경색과 어울리게 */
                border-color: #d1d5db;        /* 은색 계열 */
                color: #f9fafb;
                }

                /* 라인 기본 위치 설정 (기본은 보이지 않게) */
                #btn_cameraFreeMode .line-top,
                #btn_cameraFreeMode .line-right,
                #btn_cameraFreeMode .line-bottom,
                #btn_cameraFreeMode .line-left,
                #btn_orbitMode .line-top,
                #btn_orbitMode .line-right,
                #btn_orbitMode .line-bottom,
                #btn_orbitMode .line-left {
                position: absolute;
                display: block;
                opacity: 0;
                pointer-events: none;
                }

                /* === 활성화 상태에서만 라인 + 애니메이션 적용 === */

                /* 상단 라인 */
                #btn_cameraFreeMode.is-active .line-top,
                #btn_orbitMode.is-active .line-top {
                top: 0;
                left: 0;
                width: 100%;
                height: 3px;
                opacity: 1;
                background: linear-gradient(
                    to right,
                    rgba(15, 17, 22, 0),
                    #ffe66b,
                    #ffb347,
                    rgba(15, 17, 22, 0)
                ); /* 노랑 → 주황 계열 빛 */
                animation: hudLineTop 2s linear infinite;
                }

                /* 우측 라인 */
                #btn_cameraFreeMode.is-active .line-right,
                #btn_orbitMode.is-active .line-right {
                top: 0;
                right: 0;
                width: 3px;
                height: 100%;
                opacity: 1;
                background: linear-gradient(
                    to bottom,
                    rgba(15, 17, 22, 0),
                    #ffe66b,
                    #ff9f1c,
                    rgba(15, 17, 22, 0)
                );
                animation: hudLineRight 2s linear infinite;
                animation-delay: 0.5s;
                }

                /* 하단 라인 */
                #btn_cameraFreeMode.is-active .line-bottom,
                #btn_orbitMode.is-active .line-bottom {
                bottom: 0;
                left: 0;
                width: 100%;
                height: 3px;
                opacity: 1;
                background: linear-gradient(
                    to left,
                    rgba(15, 17, 22, 0),
                    #ffe66b,
                    #ffb347,
                    rgba(15, 17, 22, 0)
                );
                animation: hudLineBottom 2s linear infinite;
                }

                /* 좌측 라인 */
                #btn_cameraFreeMode.is-active .line-left,
                #btn_orbitMode.is-active .line-left {
                top: 0;
                left: 0;
                width: 3px;
                height: 100%;
                opacity: 1;
                background: linear-gradient(
                    to top,
                    rgba(15, 17, 22, 0),
                    #ffe66b,
                    #ff9f1c,
                    rgba(15, 17, 22, 0)
                );
                animation: hudLineLeft 2s linear infinite;
                animation-delay: 0.5s;
                }

                /* ==== keyframes (같이 사용) ==== */

                @keyframes hudLineTop {
                0%   { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
                }

                @keyframes hudLineRight {
                0%   { transform: translateY(-100%); }
                100% { transform: translateY(100%); }
                }

                @keyframes hudLineBottom {
                0%   { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
                }

                @keyframes hudLineLeft {
                0%   { transform: translateY(100%); }
                100% { transform: translateY(-100%); }
                }

                /* Alpha 행 레이아웃 */
                .hud-alpha-row {
                    display:flex;
                    align-items:center;
                    gap:4px;
                    flex-wrap:wrap;
                }
                .hud-alpha-row span {
                    flex:0 0 auto;
                }
                .hud-alpha-value {
                    min-width:28px;
                    text-align:right;
                }
                .hud-alpha-range {
                    flex:1 1 auto;
                    min-width:80px;
                }

                /* 모델 옵션 드롭다운 */
                .hud-mode-wrap{
                    position:relative;
                }
                .hud-cg-menu{
                    position:absolute;
                    top:0;
                    left:100%;
                    margin-left:4px;
                    background:rgba(42,42,42,.7);
                    border-radius:8px;
                    padding:6px 8px;
                    border:1px solid rgba(255,255,255,.1);
                    box-shadow:0 8px 18px rgba(0,0,0,.45);
                    display:none;
                    flex-direction:column;
                    gap:4px;
                    min-width:120px;
                    z-index:6000;
                }

                .hud-mode-wrap.is-open .hud-cg-menu{
                    display:flex;
                }
                
                .hud-cg-item{
                    width:100%;
                    margin:0;
                    font-size:11px;
                    text-align:left;
                    white-space:nowrap;
                    border: 0px;
                    text-align: center;
                    background: transparent;
                }

                .cesium-performanceDisplay-defaultContainer {
                    top: 85px !important;
                }

                /* 좁은 화면용 HUD */
                @media (max-width: 1024px) {
                    /* 카메라 영역 전체를 가로로 꽉 채우기 */
                    #hud-info-panel .hud-mode-wrap {
                        width: 100%;
                    }

                    #hud-info-panel {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        max-width: calc(100% - 16px);
                    }

                    /* 토글 버튼 노출 */
                    #hud-info-toggle {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        padding: 3px 8px;
                        margin-bottom: 4px;
                        border-radius: 999px;
                        border: 1px solid rgba(255,255,255,0.4);
                        background: rgba(0,0,0,0.7);
                        color: #e6edf3;
                        font-size: 10px;
                        cursor: pointer;
                    }

                    /* 드롭다운 패널 기본: 접혀 있음 */
                    #hud-info-panel .hud-info-body {
                        position: relative;
                        margin-top: 4px;
                        border-radius: 8px;
                        padding: 6px 10px;
                        max-height: 0;
                        overflow: hidden;
                        opacity: 0;
                        transform-origin: top left;
                        transform: translateY(-4px);
                        transition:
                        max-height 0.18s ease,
                        opacity 0.18s ease,
                        transform 0.18s ease;
                    }

                    /* is-open 클래스일 때만 펼쳐지도록 */
                    #hud-info-panel.is-open .hud-info-body {
                        max-height: 100%;           /* 내용 높이보다 조금 크게 잡기 */
                        opacity: 1;
                        transform: translateY(0);
                    }

                    #hud-info-panel .hud-cg-menu {
                        position: static;      /* absolute + left:100% 제거 효과 */
                        margin-left: 0;
                        margin-top: 4px;

                        width: 100%;
                        box-shadow: 0 6px 14px rgba(0,0,0,0.5);
                    }
                }

                /* 큰 화면용 HUD */
                @media (min-width: 1025px) {
                    /* 토글 버튼은 안 보이게 */
                    #hud-info-toggle {
                        display: none;
                    }

                    /* 큰 화면에서는 항상 body 보이도록 강제 */
                    #hud-info-panel .hud-info-body {
                        display: block !important;
                        position: static;
                        max-height: none;
                        opacity: 1;
                        transform: none;
                    }
                }

                /* 카메라 모드 그룹 컨테이너 */
                .hud-mode-group {
                    border-radius: 8px;
                }

                /* 버튼 래퍼: 살짝 어두운 바탕 + 라운드 */
                .hud-mode-buttons {
                    display: flex;
                    gap: 2px;
                    padding: 2px;
                    border-radius: 8px;
                    background: rgb(20 26 34 / 66%);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }

                /* 개별 버튼: 기본 상태 */
                .hud-mode-btn {
                    flex: 1;
                    margin: 0 !important;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    color: #ffffffff;
                    font-size: 11px;
                    padding: 4px 0;
                    transition: background 0.18s ease, color 0.18s ease,
                                box-shadow 0.18s ease, transform 0.08s ease;
                }

                /* 활성 상태: 라디오에서 선택된 것처럼 */
                .hud-mode-btn.is-active {
                    background: #ff7c1c;
                    color: #ffffff;
                    box-shadow:
                        0 0 0 1px rgba(255, 180, 80, 0.55),
                        0 0 10px rgba(255, 140, 40, 0.75);
                    transform: translateY(0);
                }

                /*  hover 공통 스타일 */
                #hud-info-panel .cesium-button:hover {
                    background: rgba(47, 128, 255, 0.18);
                    color: #f5f7fb;
                }   

                /* HUD 안의 모든 글씨 공통 스타일 */
                #hud-info-panel,
                #hud-info-panel * {
                    color: #ffffff;
                    text-shadow:
                    1px 1px 0 #000,
                    -1px -1px 0 #000,
                    1px -1px 0 #000,
                    -1px 1px 0 #000,
                    1px 1px 0 #000;
                    font-family: Arial, Helvetica, sans-serif;
                }
`;

const HUD_HTML = `
<div id="hud-info-panel" style="position:absolute; top:8px; left:8px; z-index:1; font-size:11px; width: 170px; max-width: 170px; color:#e6edf3; pointer-events:auto;">
    <button id="hud-info-toggle" type="button" class="cesium-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 6h18"></path>
        <path d="M7 12h10"></path>
        <path d="M10 18h4"></path>
        </svg>
    </button>
    <div class="hud-info-body">
        <div style="background:rgb(20 26 34 / 66%); padding:6px 10px; border-radius:8px; margin-bottom:6px;">
        경도 : <span id="hud-lon"></span>
        </div>
        <div style="background:rgb(20 26 34 / 66%); padding:6px 10px; border-radius:8px; margin-bottom:6px;">
        위도 : <span id="hud-lat"></span>
        </div>
        <div style="background:rgb(20 26 34 / 66%); padding:6px 10px; border-radius:8px; margin-bottom:6px;">
        높이 : <span id="hud-height"></span>
        </div>
        <div style="background:rgb(20 26 34 / 66%); padding:6px 10px; border-radius:8px; margin-bottom:6px;">
        Zoom Level : <span id="hud-zoom">0m</span>
        </div>

        <!-- 카메라 그룹 -->
        <div class="hud-mode-wrap" style="margin-bottom:6px; background: rgb(20 26 34 / 66%); border-radius: 8px;">
        <button id="hud-camera-group" type="button" class="cesium-button" style="width:100%;margin:0;background: transparent; border-radius: 8px;">
            카메라 ▸
        </button>

        <div class="hud-cg-menu">
            <button type="button" class="cesium-button hud-cg-item" data-view="top"   id="hud-topdown">top</button>
            <button type="button" class="cesium-button hud-cg-item" data-view="left"  id="hud-leftHalfDown">left</button>
            <button type="button" class="cesium-button hud-cg-item" data-view="right" id="hud-rightHalfDown">right</button>
        </div>
        </div>
        <!-- 카메라 모드 토글 버튼 그룹 -->
        <div class="hud-mode-group" style="margin-bottom:6px;">
            <div class="hud-mode-buttons" role="radiogroup">
                <button id="btn_cameraFreeMode" type="button" class="cesium-button hud-mode-btn" role="radio" aria-checked="true" >
                탐색
                </button>
                <button id="btn_orbitMode" type="button" class="cesium-button hud-mode-btn" role="radio" aria-checked="false">
                회전
                </button>
            </div>
        </div>

        <!-- 지하시설물 특화 블럭 -->
        <div style="background: rgb(20 26 34 / 66%); padding:6px 10px; border-radius:8px; margin-bottom:6px; display:block;">
        <!-- 상단 타이틀 -->
            <div style="font-weight:600; margin-bottom:0.5rem;">
                지하시설물 특화
            </div>
            <!-- 하위 옵션 전체 래퍼 -->
            <div style="margin-left:4px; font-size:11px;">

                <!-- 상위 옵션: Translucency (접었다 펼치는 헤더) -->
                <div class="hud-trans-header"
                    style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; cursor:pointer;">
                    <div style="display:flex; align-items:center; gap:4px;">
                        <!-- + / - 토글 아이콘 -->
                        <span class="hud-trans-toggle"
                            style="display:inline-block; width:14px; text-align:center;">−</span>
                        <span>Translucency</span>
                    </div>
                    <input
                        type="checkbox"
                        id="hud-translucency"
                        style="accent-color:#ffcd00; margin-left:8px;"
                        checked
                    />
                </div>

                <!-- Translucency 하위 옵션 그룹 -->
                <div class="hud-trans-body" style="margin-left:16px; margin-top:2px; font-size:0.9em;">
                    <!-- Fade by distance -->
                    <label style="display:block; margin-bottom:6px;">
                        Fade by distance
                        <input type="checkbox" id="hud-fadeByDistance" style="accent-color:#ffcd00" checked/>
                    </label>

                    <!-- Alpha -->
                    <div class="hud-alpha-row" style="display:flex; align-items:center; gap:4px; flex-wrap:wrap;">
                        <span style="min-width:40px;">Alpha</span>
                        <span id="hud-alpha-value" class="hud-alpha-value" style="font-size:0.85em; opacity:0.8;">0.5</span>
                        <input id="hud-alpha-range"
                            type="range" min="0.0" max="1.0" step="0.1" data-bind="value: alpha, valueUpdate: 'input'" class="hud-alpha-range"
                            style="appearance:none; background-color:#ffffff57; accent-color:#ffcd00; border-radius:10px; cursor:pointer; height:8px;"/>
                    </div>
                </div>

                <!-- 같은 레벨의 항목: 모델만 보기 -->
                <div style="margin-top:8px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:space-between;">
                    <div style="display:flex; align-items:center; gap:4px;">
                        <span style="display:inline-block; width:14px;"></span>
                        <span>View 3D Model Only</span>
                    </div>
                    <input type="checkbox" id="hud-only-model" style="accent-color:#ffcd00"/>
                </div>
                <div style="margin-top:8px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:space-between;">
                    <div style="display:flex; align-items:center; gap:4px;">
                        <span style="display:inline-block; width:14px;"></span>
                        <span>Performance</span>
                    </div>
                    <input type="checkbox" id="hud-performance" style="accent-color:#ffcd00"/>
                </div>
            </div>
        </div>
    </div>
</div>
`;


/* ================= Inspector Templates ================= */

const INSPECTOR_STYLE_ID = 'dynamic-inspector';
const INSPECTOR_CSS = `
    .shell {
        display: grid;
        grid-template-columns: 1fr 360px; /* 왼쪽 viewer, 오른쪽 inspector */
        width: 100%;
        height: 100%;
    }
    .shell > * {
        min-width: 0;
        min-height: 0;
    }
    .shell.no-inspector {
        grid-template-columns: 1fr; /* inspector 닫으면 viewer가 전체 사용 */
    }

    main {
        position: relative;
        height: 100%;
        width: 100%;
    }

    /* Inspector 박스 (오른쪽) */
    .inspector {
        background: #11161c;
        border-left: 1px solid #222a33;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        padding: 1rem;
    }

    .inspector[hidden] {
        display: none !important;
    }

    /* 상단 close 버튼 & 타이틀 */
    .inspectorBaseBtn {
        font-size: 11px;
        padding: 3px 8px;
        margin: 0;
        cursor: pointer;
        border-radius: 12px;
        border: 1px solid #27313c;
        color: #e6edf3;
    }


    /* 화면 작아졌을때 스크롤 스타일 */
    #inspector_list_container::-webkit-scrollbar {
        width: 8px;
    }

    #inspector_list_container::-webkit-scrollbar-track {
        background: rgba(8, 12, 18, 0.95);
        border-radius: 999px;
    }

    #inspector_list_container::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #3b82f6, #0ea5e9);
        border-radius: 999px;
        border: 1px solid rgba(0, 0, 0, 0.5);
    }

    #inspector_list_container::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #60a5fa, #22d3ee);
    }
    
    /* key-value 영역 */
    .inspect_list {
        padding: 10px 0;
        border-bottom: 1px solid #222a33;
        font-size: 11px;
    }

    .inspect_list:last-child {
        border-bottom: 0;
    }

    .inspect_list .k {
        color: #ffffffff;
        margin-bottom: 5px;
    }

    .inspector button:hover {
      background: rgba(47, 128, 255, 0.18);
      color: #f5f7fb;
    }

    .inspector,
    .inspector * {
        color: #ffffff;
        text-shadow:
          1px 1px 0 #000,
          -1px -1px 0 #000,
          1px -1px 0 #000,
          -1px 1px 0 #000,
          1px 1px 0 #000;
        font-family: Arial, Helvetica, sans-serif;
    }

    @media (max-width: 1024px) {
        /* 전체 레이아웃: 세로 방향 flex 컨테이너로 변경 */
        .shell {
            display: flex;
            flex-direction: column; /* 위: main, 아래: inspector */
            width: 100%;
            height: 100%;
        }

        /* 윗부분(viewer 영역) 높이 비율 2 */
        .shell main {
            flex: 2 1 0;   /* 2 : 1 비율에서 '2' */
            min-height: 0; /* overflow 스크롤 깨짐 방지 */
        }

        /* 아랫부분(inspector 영역) 높이 비율 1 */
        .shell .inspector {
            display: flex;         /* 기존 스타일 유지 + flex column */
            flex-direction: column;
            flex: 1 1 0;           /* 2 : 1 비율 '1' */
            min-height: 0;
            border-left: none;     /* 좌측 경계선 제거 */
            border-top: 1px solid #222a33; /* 위쪽에 경계선 */
        }

        /* 닫기 눌렀을 때 아래 pane만 감추는 처리 (기존 no-inspector 클래스와 연동) */
        .shell.no-inspector .inspector {
            display: none !important;
        }
    }
`;
const INSPECTOR_HTML = `
    <aside class="inspector">
        <div style="border-color:#222a33; display:flex; align-items:center;justify-content:space-between;border-bottom:1px solid rgba(0,0,0,0.2);">
            <h3 style="font-size:.875rem; margin:0; font-weight:600; color:white;">모델정보</h3>
            <button id="btnInspectorModelShow" class="inspectorBaseBtn cesium-button" disabled>숨김</button>
            <button class="inspectorBaseBtn cesium-button" id="btnInspectorClose">닫기</button>
        </div>
        <div id="inspector_list_container" style="flex:1; overflow:auto;">
            <div class="inspect_list" style = "text-align: center;">
                <div style="color:#e6edf3;">모델을 클릭해 주세요.</div>
            </div>
        </div>
    </aside>
`;

const COMPASS_SVG = `
<svg
   xmlns:dc="http://purl.org/dc/elements/1.1/"
   xmlns:cc="http://creativecommons.org/ns#"
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
   xmlns:svg="http://www.w3.org/2000/svg"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
   width="256"
   height="256"
   viewBox="0 0 67.733332 67.733336"
   version="1.1"
   id="svg8"
   inkscape:version="0.92.4 (5da689c313, 2019-01-14)"
   sodipodi:docname="compas.svg">
  <defs
     id="defs2" />
  <sodipodi:namedview
     id="base"
     pagecolor="#ff00ff"
     bordercolor="#666666"
     borderopacity="1.0"
     inkscape:pageopacity="0"
     inkscape:pageshadow="2"
     inkscape:zoom="0.9899495"
     inkscape:cx="-23.735523"
     inkscape:cy="75.513805"
     inkscape:document-units="mm"
     inkscape:current-layer="layer1"
     showgrid="false"
     units="px"
     inkscape:window-width="1920"
     inkscape:window-height="1001"
     inkscape:window-x="-9"
     inkscape:window-y="-9"
     inkscape:window-maximized="1" />
  <metadata
     id="metadata5">
    <rdf:RDF>
      <cc:Work
         rdf:about="">
        <dc:format>image/svg+xml</dc:format>
        <dc:type
           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
        <dc:title />
      </cc:Work>
    </rdf:RDF>
  </metadata>
  <g
     inkscape:label="Layer 1"
     inkscape:groupmode="layer"
     id="layer1"
     transform="translate(0,-229.26665)">
    <rect
       transform="matrix(0.28684886,-0.95797585,0.28684886,0.95797585,0,0)"
       y="186.256"
       x="-88.509865"
       height="20.228861"
       width="20.407875"
       id="rect841"
       style="fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:3.19949436;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill" />
    <path
       style="fill:#ff0000;fill-opacity:1;stroke:none;stroke-width:0.31378534px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
       d="m 33.892345,243.66881 -5.853981,19.55025 11.656606,-0.1715 z"
       id="path839"
       inkscape:connector-curvature="0" />
    <rect
       style="fill:none;fill-opacity:1;stroke:#000000;stroke-width:1.34890436;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect837"
       width="20.407875"
       height="20.228861"
       x="-88.509865"
       y="186.256"
       transform="matrix(0.28684886,-0.95797585,0.28684886,0.95797585,0,0)" />
    <circle
       r="26.400972"
       cy="263.13333"
       cx="33.866665"
       id="circle875"
       style="fill:none;fill-opacity:1;stroke:#ffffff;stroke-width:3;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
    <path
       style="color:#000000;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:medium;line-height:normal;font-family:sans-serif;font-variant-ligatures:normal;font-variant-position:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-alternates:normal;font-feature-settings:normal;text-indent:0;text-align:start;text-decoration:none;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000000;letter-spacing:normal;word-spacing:normal;text-transform:none;writing-mode:lr-tb;direction:ltr;text-orientation:mixed;dominant-baseline:auto;baseline-shift:baseline;text-anchor:start;white-space:normal;shape-padding:0;clip-rule:nonzero;display:inline;overflow:visible;visibility:visible;opacity:1;isolation:auto;mix-blend-mode:normal;color-interpolation:sRGB;color-interpolation-filters:linearRGB;solid-color:#000000;solid-opacity:1;vector-effect:none;fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:3.77952766;stroke-linecap:butt;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;color-rendering:auto;image-rendering:auto;shape-rendering:auto;text-rendering:auto;enable-background:accumulate"
       d="M 128.00195 21.101562 C 68.983697 21.101562 21.097652 68.979815 21.097656 127.99805 C 21.097652 187.01631 68.983697 234.90234 128.00195 234.90234 C 187.02021 234.90234 234.89844 187.01631 234.89844 127.99805 C 234.89844 68.979815 187.02021 21.101562 128.00195 21.101562 z M 128.00195 24.880859 C 184.9776 24.880859 231.11914 71.022423 231.11914 127.99805 C 231.11914 184.97371 184.9776 231.12305 128.00195 231.12305 C 71.026305 231.12305 24.876949 184.97371 24.876953 127.99805 C 24.876949 71.022423 71.026305 24.880859 128.00195 24.880859 z M 128.00195 32.646484 C 75.383495 32.646484 32.642571 75.379576 32.642578 127.99805 C 32.642571 180.61652 75.383495 223.35742 128.00195 223.35742 C 180.62041 223.35742 223.35352 180.61652 223.35352 127.99805 C 223.35352 75.379576 180.62041 32.646484 128.00195 32.646484 z M 128 36.423828 A 91.575673 91.575673 0 0 1 219.57617 128 A 91.575673 91.575673 0 0 1 128 219.57617 A 91.575673 91.575673 0 0 1 36.423828 128 A 91.575673 91.575673 0 0 1 128 36.423828 z "
       transform="matrix(0.26458333,0,0,0.26458333,0,229.26665)"
       id="path831" />
    <text
       xml:space="preserve"
       style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-size:14.86962605px;line-height:1.25;font-family:Calibri;-inkscape-font-specification:'Calibri Bold';letter-spacing:0px;word-spacing:0px;fill:#ffffff;fill-opacity:1;stroke:#000000;stroke-width:2.10750604;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:stroke fill markers"
       x="28.969419"
       y="241.2182"
       id="text817"><tspan
         sodipodi:role="line"
         id="tspan815"
         x="28.969419"
         y="241.2182"
         style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-family:Calibri;-inkscape-font-specification:'Calibri Bold';fill:#00ff0a;fill-opacity:1;stroke:#000000;stroke-width:2.10750604;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:stroke fill markers">N</tspan></text>
    <text
       id="text821"
       y="294.46481"
       x="30.341665"
       style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-size:14.86962605px;line-height:1.25;font-family:Calibri;-inkscape-font-specification:'Calibri Bold';letter-spacing:0px;word-spacing:0px;fill:#ffffff;fill-opacity:1;stroke:#000000;stroke-width:2.10750604;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       xml:space="preserve"><tspan
         style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-family:Calibri;-inkscape-font-specification:'Calibri Bold';fill:#ffffff;fill-opacity:1;stroke:#000000;stroke-width:2.10750604;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
         y="294.46481"
         x="30.341665"
         id="tspan819"
         sodipodi:role="line">S</tspan></text>
    <text
       xml:space="preserve"
       style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-size:12.01801109px;line-height:1.25;font-family:Calibri;-inkscape-font-specification:'Calibri Bold';letter-spacing:0px;word-spacing:0px;fill:#ffffff;fill-opacity:1;stroke:#000000;stroke-width:1.70334029;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       x="2.7455826"
       y="244.59872"
       id="text825"
       transform="scale(0.91513312,1.0927372)"><tspan
         sodipodi:role="line"
         id="tspan823"
         x="2.7455826"
         y="244.59872"
         style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-family:Calibri;-inkscape-font-specification:'Calibri Bold';letter-spacing:0px;word-spacing:0px;fill:#ffffff;fill-opacity:1;stroke:#000000;stroke-width:1.70334029;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill">W</tspan></text>
    <text
       id="text829"
       y="267.8309"
       x="56.043221"
       style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-size:14.86962605px;line-height:1.25;font-family:Calibri;-inkscape-font-specification:'Calibri Bold';letter-spacing:0px;word-spacing:0px;fill:#ffffff;fill-opacity:1;stroke:#000000;stroke-width:2.10750604;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       xml:space="preserve"><tspan
         style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-family:Calibri;-inkscape-font-specification:'Calibri Bold';fill:#ffffff;fill-opacity:1;stroke:#000000;stroke-width:2.10750604;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
         y="267.8309"
         x="56.043221"
         id="tspan827"
         sodipodi:role="line">E</tspan></text>
  </g>
</svg>

`;

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
* 모델의 사이즈에 맞춰서 카메라 이동
* 카메라 위치 자세 유지 o
* pivot 불가
*/
function flyDirectionStayFitModel(viewer, model){
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

function flyToTilesetsWithPreset(
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

function CameraFreeMode({cesiumViewer}){
    let enabled = false;

    let viewer = cesiumViewer, handler;
    let looking = false;
    let startMousePosition, mousePosition;

    const SENS = 0.25; // 마우스 감도
     // 마우스 회전 감도와 피치 한계
    const PITCH_MIN = Cesium.Math.toRadians(-89);
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
        document.removeEventListener('keydown', keyDown);
        document.removeEventListener('keyup',   keyUp);
        // 마우스 핸들러 제거
        if (handler) { handler.destroy(); handler = undefined; }
        looking = false;
        Object.keys(flags).forEach(k=> flags[k]=false);
        // 기본 카메라 조작 다시 켜기
        setDefaultControls(true);

        // 도움말 숨기기
        hideHelp();

        enabled = false;
    }

    return {enable, disable};
}

function CameraOrbitMode({cesiumViewer}){
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
        const pitch = Cesium.Math.toRadians(-45);   // -45도 내려다보기
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

function Measurement({cesiumViewer}){
    let viewer = cesiumViewer;
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    let mode; // 'D' | 'A' | 'V' (거리 or 면적 or 수직)
    let areaOptions = 'ground';
    let floatingPoint, activeShape;
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
            font: 'bold 11px Inter, Pretendard, system-ui, sans-serif',
            rowH: 22,          // 한 줄 높이
            padX: 8,          // 좌우 패딩
            radius: 11,        
            gap: 5,            // 줄 간격
            fg: '#FFFFFF',
            scale: 1};
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
             
                // scaleByDistance: new Cesium.NearFarScalar(
                //     LABEL_STYLE.near, LABEL_STYLE.nearScale,
                //     LABEL_STYLE.far,  LABEL_STYLE.farScale
                // ),
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
        }else {
            position = activeShapePoints;
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
                
                measureEndEntity.points.push(createPoint(cart));
                measureEndEntity.labels.push(createLabel(cart, `${lon}\n${lat}\n${height}`,{ point: true }));
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
                    }else { // 'surface'
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
            showMouseLabelAt(movement.endPosition,setMouseLabelText(mode));
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
                }else {
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
                }else {
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

    function start(m) {
            mode = m;
            resetSession();
            offHandler();
            bindDrawing();
            bindKeyboard();
            ensureMouseLabel();
            mouseLabel.label.text = setMouseLabelText(mode); 
            setDrawingCursor(true);
    }

    function stop(){
            offHandler();
            resetSession(); 
            unbindKeyboard();
            hideMouseLabel(); 
            setDrawingCursor(false); 
            mode=undefined;
             //$(".tool-root").find('.tool').removeClass('is-active');
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
            onVertical, onAreaGround, onAreaSurface, 
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
                    color: #fff;
                    fill: none;
                    background: transparent;
                    box-shadow: 0 0 3px #fff;
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
            };
    }

    return {start, stop, setAreaMode, removeAll, mountToolBar};
}

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
                Cesium.Math.toRadians(-180),
                Cesium.Math.toRadians(-90),
                Cesium.Math.toRadians(180.0),
                Cesium.Math.toRadians(90.0))
        }))
    };

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
            });
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
        }else {
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

/**
 *  target: "#element" 또는 DOM Element
 *  options: { 3dtileset url, 관련 속성정보 url , info={ 타이틀, 이미지 src(svg,png), 높이(default 100)} }
 */
async function CesiumViewer(target, options = {}) {
  // target이 문자열이면 '#viewerRoot' 형태일 수도 있으니 '#' 제거해서 id로 사용
  const elementId = typeof target === "string" ? target.replace(/^#/, "") : (target && target.id);
  await CesiumHandler.init(elementId, options);

  function update3Dtileset(tilesetUrl, propertyUrls = []) {
    return CesiumHandler.updateModelConfig(tilesetUrl, propertyUrls);
  }

  return {
    update3Dtileset
  };
}

export { CesiumViewer };
//# sourceMappingURL=git-viewer.esm.js.map
