/* ================= infobox Templates ================= */
export const HUD_STYLE_ID = 'hud-style';
export const HUD_CSS = `
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

export const HUD_HTML = `
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
        <button id="hud-camera-group" type="button" class="cesium-button" style="font-size:11px;width:100%;margin:0;background: transparent; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08);">
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

        <!-- 지하시설물 특화 블럭 서비스-->
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

export const INSPECTOR_STYLE_ID = 'dynamic-inspector';
export const INSPECTOR_CSS = `
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
export const INSPECTOR_HTML = `
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

/* ================= Compas Templates ================= */

export const COMPASS_SVG = `
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


/* ================= toolbar Templates ================= */
export const TOOLBAR_STYLE_ID ='dynamic-toolbar-style';
export const TOOLBAR_CSS = `
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
export const TOOLBAR_HTML =`
    <div class="tool-root">
        <!-- 측정 패널 -->
        <div class="tool-panel tool-panel--measure" data-panel="measure">
            <div class="tool-panel-main">
                    <button class="tool cesium-button" id="btn_point">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" class="size-5 flex-shrink-0"><path d="M2.46481 16.6006C2.82352 16.3935 3.28213 16.5163 3.48923 16.875C3.69629 17.2337 3.5734 17.6923 3.21481 17.8994L2.3486 18.3994C1.98989 18.6065 1.5313 18.4837 1.32419 18.125C1.11709 17.7663 1.23994 17.3077 1.5986 17.1006L2.46481 16.6006ZM18.5107 16.875C18.7178 16.5163 19.1764 16.3936 19.5351 16.6006L20.4013 17.1006C20.76 17.3077 20.8829 17.7663 20.6757 18.125C20.4686 18.4837 20.01 18.6065 19.6513 18.3994L18.7851 17.8994C18.4266 17.6923 18.3037 17.2336 18.5107 16.875ZM6.14548 14.4756C6.50418 14.2685 6.9628 14.3913 7.16989 14.75C7.37695 15.1087 7.25407 15.5673 6.89548 15.7744L6.02926 16.2744C5.67056 16.4815 5.21197 16.3587 5.00485 16C4.79776 15.6413 4.9206 15.1827 5.27926 14.9756L6.14548 14.4756ZM14.83 14.75C15.0371 14.3913 15.4958 14.2686 15.8545 14.4756L16.7207 14.9756C17.0794 15.1827 17.2022 15.6413 16.9951 16C16.788 16.3587 16.3294 16.4815 15.9707 16.2744L15.1045 15.7744C14.7459 15.5673 14.623 15.1086 14.83 14.75ZM11 9.5C12.6568 9.5 14 10.8431 14 12.5C14 14.1569 12.6568 15.5 11 15.5C9.34313 15.5 7.99997 14.1568 7.99997 12.5C7.99997 10.8432 9.34313 9.50002 11 9.5ZM11 11C10.1716 11 9.49997 11.6716 9.49997 12.5C9.49997 13.3284 10.1716 14 11 14C11.8284 14 12.5 13.3284 12.5 12.5C12.5 11.6716 11.8284 11 11 11ZM11 5.5C11.4142 5.5 11.75 5.83579 11.75 6.25V7.25C11.75 7.66421 11.4142 8 11 8C10.5858 7.99998 10.25 7.6642 10.25 7.25V6.25C10.25 5.8358 10.5858 5.50002 11 5.5ZM11 1.25C11.4142 1.25 11.75 1.58579 11.75 2V3C11.75 3.41421 11.4142 3.75 11 3.75C10.5858 3.74998 10.25 3.4142 10.25 3V2C10.25 1.5858 10.5858 1.25002 11 1.25Z" fill="currentColor"></path></svg>
                    </button>
                    <button class="tool cesium-button" id="btn_line">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" class="size-5 flex-shrink-0"><path d="M3 16C4.65685 16 6 17.3431 6 19C6 20.6569 4.65685 22 3 22C1.34315 22 0 20.6569 0 19C0 17.3431 1.34315 16 3 16ZM3 17.5C2.17157 17.5 1.5 18.1716 1.5 19C1.5 19.8284 2.17157 20.5 3 20.5C3.82843 20.5 4.5 19.8284 4.5 19C4.5 18.1716 3.82843 17.5 3 17.5ZM7.07324 13.8662C7.36614 13.5733 7.8409 13.5733 8.13379 13.8662C8.42668 14.1591 8.42668 14.6339 8.13379 14.9268L7.42676 15.6338C7.13386 15.9267 6.6591 15.9267 6.36621 15.6338C6.07332 15.3409 6.07332 14.8661 6.36621 14.5732L7.07324 13.8662ZM10.8232 10.1162C11.1161 9.82332 11.5909 9.82332 11.8838 10.1162C12.1767 10.4091 12.1767 10.8839 11.8838 11.1768L11.1768 11.8838C10.8839 12.1767 10.4091 12.1767 10.1162 11.8838C9.82332 11.5909 9.82332 11.1161 10.1162 10.8232L10.8232 10.1162ZM14.5732 6.36621C14.8661 6.07332 15.3409 6.07332 15.6338 6.36621C15.9267 6.6591 15.9267 7.13386 15.6338 7.42676L14.9268 8.13379C14.6339 8.42668 14.1591 8.42668 13.8662 8.13379C13.5733 7.8409 13.5733 7.36614 13.8662 7.07324L14.5732 6.36621ZM19 0C20.6569 0 22 1.34315 22 3C22 4.65685 20.6569 6 19 6C17.3431 6 16 4.65685 16 3C16 1.34315 17.3431 0 19 0ZM19 1.5C18.1716 1.5 17.5 2.17157 17.5 3C17.5 3.82843 18.1716 4.5 19 4.5C19.8284 4.5 20.5 3.82843 20.5 3C20.5 2.17157 19.8284 1.5 19 1.5Z" fill="currentColor"></path></svg>
                    </button>
                    
                    <button class="tool cesium-button" id="btn_vertical">
                        <svg viewBox="0 0 30 30" width="25" height="25" xmlns="http://www.w3.org/2000/svg">
                            <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="15.08" cy="3.01" r="2.08" />
                                <path d="M15.04 5.34 L15.06 24.95" stroke-dasharray="3 2"/>
                                <path d="M0.65 29.21 L9.45 23.20 L17.39 26.31 L29.73 22.97" stroke-dasharray="3 2"/>
                            </g>
                        </svg>
                    </button>
                    <button class="tool cesium-button" id="btn_surface">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" class="size-5 flex-shrink-0"><path d="M3 16C4.65685 16 6 17.3431 6 19C6 20.6569 4.65685 22 3 22C1.34315 22 0 20.6569 0 19C0 17.3431 1.34315 16 3 16ZM19 16C20.6569 16 22 17.3431 22 19C22 20.6569 20.6569 22 19 22C17.3431 22 16 20.6569 16 19C16 17.3431 17.3431 16 19 16ZM3 17.5C2.17157 17.5 1.5 18.1716 1.5 19C1.5 19.8284 2.17157 20.5 3 20.5C3.82843 20.5 4.5 19.8284 4.5 19C4.5 18.1716 3.82843 17.5 3 17.5ZM19 17.5C18.1716 17.5 17.5 18.1716 17.5 19C17.5 19.8284 18.1716 20.5 19 20.5C19.8284 20.5 20.5 19.8284 20.5 19C20.5 18.1716 19.8284 17.5 19 17.5ZM9.5 18.25C9.91421 18.25 10.25 18.5858 10.25 19C10.25 19.4142 9.91421 19.75 9.5 19.75H8.5C8.08579 19.75 7.75 19.4142 7.75 19C7.75 18.5858 8.08579 18.25 8.5 18.25H9.5ZM13.5 18.25C13.9142 18.25 14.25 18.5858 14.25 19C14.25 19.4142 13.9142 19.75 13.5 19.75H12.5C12.0858 19.75 11.75 19.4142 11.75 19C11.75 18.5858 12.0858 18.25 12.5 18.25H13.5ZM3 11.75C3.41421 11.75 3.75 12.0858 3.75 12.5V13.5C3.75 13.9142 3.41421 14.25 3 14.25C2.58579 14.25 2.25 13.9142 2.25 13.5V12.5C2.25 12.0858 2.58579 11.75 3 11.75ZM19 11.75C19.4142 11.75 19.75 12.0858 19.75 12.5V13.5C19.75 13.9142 19.4142 14.25 19 14.25C18.5858 14.25 18.25 13.9142 18.25 13.5V12.5C18.25 12.0858 18.5858 11.75 19 11.75ZM3 7.75C3.41421 7.75 3.75 8.08579 3.75 8.5V9.5C3.75 9.91421 3.41421 10.25 3 10.25C2.58579 10.25 2.25 9.91421 2.25 9.5V8.5C2.25 8.08579 2.58579 7.75 3 7.75ZM19 7.75C19.4142 7.75 19.75 8.08579 19.75 8.5V9.5C19.75 9.91421 19.4142 10.25 19 10.25C18.5858 10.25 18.25 9.91421 18.25 9.5V8.5C18.25 8.08579 18.5858 7.75 19 7.75ZM3 0C4.65685 0 6 1.34315 6 3C6 4.65685 4.65685 6 3 6C1.34315 6 0 4.65685 0 3C0 1.34315 1.34315 0 3 0ZM19 0C20.6569 0 22 1.34315 22 3C22 4.65685 20.6569 6 19 6C17.3431 6 16 4.65685 16 3C16 1.34315 17.3431 0 19 0ZM3 1.5C2.17157 1.5 1.5 2.17157 1.5 3C1.5 3.82843 2.17157 4.5 3 4.5C3.82843 4.5 4.5 3.82843 4.5 3C4.5 2.17157 3.82843 1.5 3 1.5ZM19 1.5C18.1716 1.5 17.5 2.17157 17.5 3C17.5 3.82843 18.1716 4.5 19 4.5C19.8284 4.5 20.5 3.82843 20.5 3C20.5 2.17157 19.8284 1.5 19 1.5ZM9.5 2.25C9.91421 2.25 10.25 2.58579 10.25 3C10.25 3.41421 9.91421 3.75 9.5 3.75H8.5C8.08579 3.75 7.75 3.41421 7.75 3C7.75 2.58579 8.08579 2.25 8.5 2.25H9.5ZM13.5 2.25C13.9142 2.25 14.25 2.58579 14.25 3C14.25 3.41421 13.9142 3.75 13.5 3.75H12.5C12.0858 3.75 11.75 3.41421 11.75 3C11.75 2.58579 12.0858 2.25 12.5 2.25H13.5Z" fill="currentColor"></path>
                        </svg>
                    </button>
                    <button class="tool cesium-button" id="btn_ground" style="display:none;">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g transform="rotate(315 13 7.5) scale(0.8)">
                            <path d="M3 16C4.65685 16 6 17.3431 6 19C6 20.6569 4.65685 22 3 22C1.34315 22 0 20.6569 0 19C0 17.3431 1.34315 16 3 16ZM19 16C20.6569 16 22 17.3431 22 19C22 20.6569 20.6569 22 19 22C17.3431 22 16 20.6569 16 19C16 17.3431 17.3431 16 19 16ZM3 17.5C2.17157 17.5 1.5 18.1716 1.5 19C1.5 19.8284 2.17157 20.5 3 20.5C3.82843 20.5 4.5 19.8284 4.5 19C4.5 18.1716 3.82843 17.5 3 17.5ZM19 17.5C18.1716 17.5 17.5 18.1716 17.5 19C17.5 19.8284 18.1716 20.5 19 20.5C19.8284 20.5 20.5 19.8284 20.5 19C20.5 18.1716 19.8284 17.5 19 17.5ZM9.5 18.25C9.91421 18.25 10.25 18.5858 10.25 19C10.25 19.4142 9.91421 19.75 9.5 19.75H8.5C8.08579 19.75 7.75 19.4142 7.75 19C7.75 18.5858 8.08579 18.25 8.5 18.25H9.5ZM13.5 18.25C13.9142 18.25 14.25 18.5858 14.25 19C14.25 19.4142 13.9142 19.75 13.5 19.75H12.5C12.0858 19.75 11.75 19.4142 11.75 19C11.75 18.5858 12.0858 18.25 12.5 18.25H13.5ZM3 11.75C3.41421 11.75 3.75 12.0858 3.75 12.5V13.5C3.75 13.9142 3.41421 14.25 3 14.25C2.58579 14.25 2.25 13.9142 2.25 13.5V12.5C2.25 12.0858 2.58579 11.75 3 11.75ZM19 11.75C19.4142 11.75 19.75 12.0858 19.75 12.5V13.5C19.75 13.9142 19.4142 14.25 19 14.25C18.5858 14.25 18.25 13.9142 18.25 13.5V12.5C18.25 12.0858 18.5858 11.75 19 11.75ZM3 7.75C3.41421 7.75 3.75 8.08579 3.75 8.5V9.5C3.75 9.91421 3.41421 10.25 3 10.25C2.58579 10.25 2.25 9.91421 2.25 9.5V8.5C2.25 8.08579 2.58579 7.75 3 7.75ZM19 7.75C19.4142 7.75 19.75 8.08579 19.75 8.5V9.5C19.75 9.91421 19.4142 10.25 19 10.25C18.5858 10.25 18.25 9.91421 18.25 9.5V8.5C18.25 8.08579 18.5858 7.75 19 7.75ZM3 0C4.65685 0 6 1.34315 6 3C6 4.65685 4.65685 6 3 6C1.34315 6 0 4.65685 0 3C0 1.34315 1.34315 0 3 0ZM19 0C20.6569 0 22 1.34315 22 3C22 4.65685 20.6569 6 19 6C17.3431 6 16 4.65685 16 3C16 1.34315 17.3431 0 19 0ZM3 1.5C2.17157 1.5 1.5 2.17157 1.5 3C1.5 3.82843 2.17157 4.5 3 4.5C3.82843 4.5 4.5 3.82843 4.5 3C4.5 2.17157 3.82843 1.5 3 1.5ZM19 1.5C18.1716 1.5 17.5 2.17157 17.5 3C17.5 3.82843 18.1716 4.5 19 4.5C19.8284 4.5 20.5 3.82843 20.5 3C20.5 2.17157 19.8284 1.5 19 1.5ZM9.5 2.25C9.91421 2.25 10.25 2.58579 10.25 3C10.25 3.41421 9.91421 3.75 9.5 3.75H8.5C8.08579 3.75 7.75 3.41421 7.75 3C7.75 2.58579 8.08579 2.25 8.5 2.25H9.5ZM13.5 2.25C13.9142 2.25 14.25 2.58579 14.25 3C14.25 3.41421 13.9142 3.75 13.5 3.75H12.5C12.0858 3.75 11.75 3.41421 11.75 3C11.75 2.58579 12.0858 2.25 12.5 2.25H13.5Z" fill="currentColor"></path>
                        </g>
                        <rect x="2" y="20.2" width="18" height="1.1" rx="0.55" fill="currentColor"></rect>
                        </svg>
                    </button>
                    <button class="tool cesium-button" id="btn_cross" style="display:none;">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" class="size-5 flex-shrink-0">
                            <path d="M3 16C4.65685 16 6 17.3431 6 19C6 20.6569 4.65685 22 3 22C1.34315 22 0 20.6569 0 19C0 17.3431 1.34315 16 3 16ZM19 16C20.6569 16 22 17.3431 22 19C22 20.6569 20.6569 22 19 22C17.3431 22 16 20.6569 16 19C16 17.3431 17.3431 16 19 16ZM3 17.5C2.17157 17.5 1.5 18.1716 1.5 19C1.5 19.8284 2.17157 20.5 3 20.5C3.82843 20.5 4.5 19.8284 4.5 19C4.5 18.1716 3.82843 17.5 3 17.5ZM19 17.5C18.1716 17.5 17.5 18.1716 17.5 19C17.5 19.8284 18.1716 20.5 19 20.5C19.8284 20.5 20.5 19.8284 20.5 19C20.5 18.1716 19.8284 17.5 19 17.5ZM9.5 18.25C9.91421 18.25 10.25 18.5858 10.25 19C10.25 19.4142 9.91421 19.75 9.5 19.75H8.5C8.08579 19.75 7.75 19.4142 7.75 19C7.75 18.5858 8.08579 18.25 8.5 18.25H9.5ZM13.5 18.25C13.9142 18.25 14.25 18.5858 14.25 19C14.25 19.4142 13.9142 19.75 13.5 19.75H12.5C12.0858 19.75 11.75 19.4142 11.75 19C11.75 18.5858 12.0858 18.25 12.5 18.25H13.5ZM3 11.75C3.41421 11.75 3.75 12.0858 3.75 12.5V13.5C3.75 13.9142 3.41421 14.25 3 14.25C2.58579 14.25 2.25 13.9142 2.25 13.5V12.5C2.25 12.0858 2.58579 11.75 3 11.75ZM19 11.75C19.4142 11.75 19.75 12.0858 19.75 12.5V13.5C19.75 13.9142 19.4142 14.25 19 14.25C18.5858 14.25 18.25 13.9142 18.25 13.5V12.5C18.25 12.0858 18.5858 11.75 19 11.75ZM3 7.75C3.41421 7.75 3.75 8.08579 3.75 8.5V9.5C3.75 9.91421 3.41421 10.25 3 10.25C2.58579 10.25 2.25 9.91421 2.25 9.5V8.5C2.25 8.08579 2.58579 7.75 3 7.75ZM19 7.75C19.4142 7.75 19.75 8.08579 19.75 8.5V9.5C19.75 9.91421 19.4142 10.25 19 10.25C18.5858 10.25 18.25 9.91421 18.25 9.5V8.5C18.25 8.08579 18.5858 7.75 19 7.75ZM3 0C4.65685 0 6 1.34315 6 3C6 4.65685 4.65685 6 3 6C1.34315 6 0 4.65685 0 3C0 1.34315 1.34315 0 3 0ZM19 0C20.6569 0 22 1.34315 22 3C22 4.65685 20.6569 6 19 6C17.3431 6 16 4.65685 16 3C16 1.34315 17.3431 0 19 0ZM3 1.5C2.17157 1.5 1.5 2.17157 1.5 3C1.5 3.82843 2.17157 4.5 3 4.5C3.82843 4.5 4.5 3.82843 4.5 3C4.5 2.17157 3.82843 1.5 3 1.5ZM19 1.5C18.1716 1.5 17.5 2.17157 17.5 3C17.5 3.82843 18.1716 4.5 19 4.5C19.8284 4.5 20.5 3.82843 20.5 3C20.5 2.17157 19.8284 1.5 19 1.5ZM9.5 2.25C9.91421 2.25 10.25 2.58579 10.25 3C10.25 3.41421 9.91421 3.75 9.5 3.75H8.5C8.08579 3.75 7.75 3.41421 7.75 3C7.75 2.58579 8.08579 2.25 8.5 2.25H9.5ZM13.5 2.25C13.9142 2.25 14.25 2.58579 14.25 3C14.25 3.41421 13.9142 3.75 13.5 3.75H12.5C12.0858 3.75 11.75 3.41421 11.75 3C11.75 2.58579 12.0858 2.25 12.5 2.25H13.5Z" fill="currentColor" />
                            <path d="M7.5 14L10 11L13 13L15.5 9.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
            </div>
            <div class="tool-panel-footer">
                <button class="tool cesium-button" id="btn_init">초기화</button>
                <button class="tool cesium-button" id="btn_close">종료</button>
            </div>
        </div>

        <!-- 마커 패널 -->
        <div class="tool-panel tool-panel--marker" data-panel="marker">
            <div class="tool-panel-main">
                    <button class="tool cesium-button" id="btn_marker_point">포인트 마커</button>
                    <button class="tool cesium-button" id="btn_marker_line">라인 마커</button>
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
            <button class="tool-group" id="group-inspector">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide size-5 lucide-info-icon size-5">
                    <path d="M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20z"></path>            
                    <path d="M12 10v6"></path>
                    <path d="M12 8h.01"></path>
                </svg>

            </button>
            <button class="tool-group" id="group-marker" style ="display:none;">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-5"><path d="M6.5 18.4999H16.5C17.6046 18.4999 18.5 17.6044 18.5 16.4999C18.5 15.3953 17.6046 14.4999 16.5 14.4999H3.5C2.39543 14.4999 1.5 13.6044 1.5 12.4999C1.5 11.3953 2.39543 10.4999 3.5 10.4999H7.5M17.815 4.52155C18.147 4.18958 18.3335 3.73935 18.3335 3.26988C18.3335 2.80041 18.147 2.35018 17.815 2.01821C17.483 1.68625 17.0328 1.49976 16.5633 1.49976C16.0939 1.49976 15.6436 1.68625 15.3117 2.01821L10.97 6.36155C10.7719 6.55956 10.6269 6.80432 10.5483 7.07321L9.85083 9.46488C9.82992 9.53659 9.82867 9.6126 9.8472 9.68496C9.86574 9.75731 9.90339 9.82336 9.95621 9.87617C10.009 9.92899 10.0751 9.96664 10.1474 9.98518C10.2198 10.0037 10.2958 10.0025 10.3675 9.98155L12.7592 9.28405C13.0281 9.20553 13.2728 9.06051 13.4708 8.86238L17.815 4.52155Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            </button>
        </div>
    </div>
`;



/* ================= Profile Chart Templates ================= */

export const PROFILE_STYLE_ID = 'profile-chart-style';
export const PROFILE_CSS = `
    /* 공통: 프로파일 차트 패널 래퍼 */
    #profile-chart-panel {
        position: absolute;
        left: 8px;
        bottom: 8px;
        z-index: 2;              /* HUD(1)보다 위, Inspector보다 낮게 */
        pointer-events: auto;
        max-width: 420px;
        width: min(420px, calc(100% - 16px - 360px)); /* 오른쪽 inspector 여백 고려 */
    }

    /* inspector 닫힌 경우: 조금 더 넓게 */
    .shell.no-inspector #profile-chart-panel {
        width: min(480px, calc(100% - 16px));
    }

    /* 실제 차트 컨테이너 */
    #profileChart {
        width: 100%;
        height: 170px;
        background: rgb(20 26 34 / 0.9);
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.55);
        overflow: hidden;
    }

    /* 프로파일 차트 안의 글씨도 HUD 스타일과 맞추기 */
    #profileChart,
    #profileChart * {
        color: #ffffff;
        font-family: Arial, Helvetica, sans-serif;
        text-shadow:
            1px 1px 0 #000,
            -1px -1px 0 #000,
            1px -1px 0 #000,
            -1px 1px 0 #000,
            1px 1px 0 #000;
        box-sizing: border-box;
    }

    /* 좁은 화면(태블릿/모바일)일 때: Inspector 위에 떠 있도록 위치 조정 */
    @media (max-width: 1024px) {
        /* shell이 column 레이아웃이지만, 차트는 viewer(main) 위에 떠 있는 패널처럼 보이게 */
        #profile-chart-panel {
            left: 8px;
            right: 8px;
            bottom: calc(33% + 8px);  /* 아래 1/3 정도를 inspector 영역으로 보고 그 위에 위치 */
            width: auto;
            max-width: none;
        }

        #profileChart {
            height: 150px;
        }
    }

    /* 아주 좁은 화면(예: 세로 폰)에서는 높이를 조금 더 줄이기 */
    @media (max-width: 640px) {
        #profile-chart-panel {
            bottom: calc(35% + 6px);
        }

        #profileChart {
            height: 130px;
        }
    }
`;

export const PROFILE_HTML = `
<div id="profile-chart-panel">
    <div id="profileChart"></div>
</div>
`;