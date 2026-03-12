import { HUD_STYLE_ID, HUD_CSS, HUD_HTML } from './UiTemplates.js';
import { flyToTilesetsWithPreset } from './CameraMovement.js';

function injectStyleOnce(id, cssText) {
    if (!document.getElementById(id)) {
        $('<style>', { id, text: cssText }).appendTo('head');
    }
}

export function InfoBox({
    cesiumViewer,
    container,
    modeEnum,
    getCurrentMode,
    setMode,
    getUnionTilesetCenter,
    translucencyState,
    onTranslucencyUpdate,
    onOrbitNoCenter
} = {}) {
    const viewer = cesiumViewer;
    const rootContainer = (typeof container === 'string') ? document.querySelector(container) : container;
    const state = {
        enabled: false,
        els: {}
    };
    const Mode = modeEnum || {};
    const getMode = (typeof getCurrentMode === 'function') ? getCurrentMode : () => null;
    const getCenter = (typeof getUnionTilesetCenter === 'function') ? getUnionTilesetCenter : () => null;
    const transState = translucencyState || {
        translucencyEnabled: true,
        fadeByDistance: true,
        alpha: 0.5
    };
    const applyTranslucency = (typeof onTranslucencyUpdate === 'function') ? onTranslucencyUpdate : () => {};

    function mount() {
        if (!viewer || !rootContainer) return;

        injectStyleOnce(HUD_STYLE_ID, HUD_CSS);

        const $root = $(HUD_HTML);
        const infoBoxRootEl = $root[0];
        rootContainer.appendChild(infoBoxRootEl);

        state.els.lon = infoBoxRootEl.querySelector('#hud-lon');
        state.els.lat = infoBoxRootEl.querySelector('#hud-lat');
        state.els.hgt = infoBoxRootEl.querySelector('#hud-height');
        state.els.zoom = infoBoxRootEl.querySelector('#hud-zoom');

        const $cameraFree = $root.find('#btn_cameraFreeMode');
        const $modeWrap = $root.find('.hud-mode-wrap');
        const $hcg = $modeWrap.find('#hud-camera-group');
        const $hcm = $modeWrap.find('.hud-cg-menu');

        const $transHeader = $root.find('.hud-trans-header');
        const $transBody = $root.find('.hud-trans-body');
        const $toggleIcon = $root.find('.hud-trans-toggle');
        const $onlyModel = $root.find('#hud-only-model');
        const $performance = $root.find('#hud-performance');

        const $hudToggle = $root.find('#hud-info-toggle');
        const $orbitBtn = $root.find('#btn_orbitMode');

        $transBody.show();
        $toggleIcon.text('-');

        $hudToggle.on('click', (e) => {
            e.stopPropagation();
            $root.toggleClass('is-open');
        });

        $transHeader.on('click', function (e) {
            if ($(e.target).is('#hud-translucency')) return;
            const isOpen = $transBody.is(':visible');
            if (isOpen) {
                $transBody.slideUp(120);
                $toggleIcon.text('+');
            } else {
                $transBody.slideDown(120);
                $toggleIcon.text('-');
            }
        });

        $onlyModel.on('change', function () {
            const on = $(this).is(':checked');
            const scene = viewer.scene;

            scene.globe.show = !on;
            if (scene.skyAtmosphere) scene.skyAtmosphere.show = !on;
            scene.skyBox = on ? null : scene.skyBox;
            scene.backgroundColor = on
                ? Cesium.Color.BLACK
                : Cesium.Color.fromCssColorString('#0b0f14');
        });

        $performance.on('change', function () {
            const on = $(this).is(':checked');
            viewer.scene.debugShowFramesPerSecond = !!on;
        });

        bindTranslucencyControls();

        $hcg.on('click', function (e) {
            e.stopPropagation();
            $modeWrap.toggleClass('is-open');
        });

        $hcm.on('click', 'button', function () {
            const center = getCenter();
            flyToTilesetsWithPreset(viewer, center, this.dataset.view, 0.8, 4000);
        });

        $cameraFree.on('click', () => {
            const next = (getMode() === Mode.CAMERA_FREE)
                ? Mode.NORMAL
                : Mode.CAMERA_FREE;
            setMode?.(next);
            syncModeButtons();
        });

        $orbitBtn.on('click', () => {
            if (getMode() !== Mode.ORBIT && !getCenter()) {
                onOrbitNoCenter?.();
                return;
            }
            const next = (getMode() === Mode.ORBIT)
                ? Mode.NORMAL
                : Mode.ORBIT;
            setMode?.(next);
            syncModeButtons();
        });

        function syncModeButtons() {
            const isFree = getMode() === Mode.CAMERA_FREE;
            const isOrbit = getMode() === Mode.ORBIT;
            $cameraFree.toggleClass('is-active', isFree);
            $orbitBtn.toggleClass('is-active', isOrbit);
        }

        function bindTranslucencyControls() {
            const $chkTrans = $root.find('#hud-translucency');
            const $chkFade = $root.find('#hud-fadeByDistance');
            const $alphaRange = $root.find('#hud-alpha-range');
            const $alphaValue = $root.find('#hud-alpha-value');

            const setFadeAlphaEnabled = (enabled) => {
                $chkFade.prop('disabled', !enabled);
                $alphaRange.prop('disabled', !enabled);

                const opacity = enabled ? 1 : 0.4;
                $chkFade.closest('label').css('opacity', opacity);
                $alphaRange.closest('div').css('opacity', opacity);
            };

            $chkTrans.prop('checked', !!transState.translucencyEnabled);
            $chkFade.prop('checked', !!transState.fadeByDistance);
            $alphaRange.val(transState.alpha);
            $alphaValue.text(Number(transState.alpha).toFixed(1));

            setFadeAlphaEnabled(!!transState.translucencyEnabled);

            const applyAlpha = (val) => {
                let alpha = parseFloat(val);
                if (isNaN(alpha)) alpha = 1.0;
                alpha = Cesium.Math.clamp(alpha, 0.0, 1.0);

                transState.alpha = alpha;
                $alphaRange.val(alpha);
                $alphaValue.text(alpha.toFixed(1));
                applyTranslucency();
            };

            $chkTrans.on('change', () => {
                const enabled = $chkTrans.is(':checked');
                transState.translucencyEnabled = enabled;
                setFadeAlphaEnabled(enabled);
                applyTranslucency();
            });

            $chkFade.on('change', () => {
                transState.fadeByDistance = $chkFade.is(':checked');
                applyTranslucency();
            });

            $alphaRange.on('input change', function () {
                applyAlpha(this.value);
            });
        }
    }

    function enable() {
        state.enabled = true;
    }

    function disable() {
        state.enabled = false;
    }

    function handleMouseMove(movement) {
        if (!state.enabled) return;
        if (!viewer || !movement) return;

        const scene = viewer.scene;
        let cartesian = Cesium.defined(scene.pickPosition)
            ? scene.pickPosition(movement.endPosition)
            : undefined;
        if (!Cesium.defined(cartesian)) {
            cartesian = scene.camera.pickEllipsoid(movement.endPosition, scene.globe.ellipsoid);
        }
        if (!Cesium.defined(cartesian)) return;

        const c = Cesium.Cartographic.fromCartesian(cartesian);
        const lon = Cesium.Math.toDegrees(c.longitude).toFixed(6);
        const lat = Cesium.Math.toDegrees(c.latitude).toFixed(6);
        const hgt = (c.height || 0).toFixed(2) + ' m';

        if (state.els.lon) state.els.lon.textContent = lon;
        if (state.els.lat) state.els.lat.textContent = lat;
        if (state.els.hgt) state.els.hgt.textContent = hgt;

        const camH = scene.globe.ellipsoid.cartesianToCartographic(viewer.camera.position).height;
        if (state.els.zoom) state.els.zoom.textContent = `${Math.max(0, camH | 0)} m`;
    }

    return {
        mount,
        enable,
        disable,
        handleMouseMove
    };
}
