import { INSPECTOR_STYLE_ID, INSPECTOR_CSS, INSPECTOR_HTML } from './UiTemplates.js';

function injectStyleOnce(id, cssText) {
    if (!document.getElementById(id)) {
        $('<style>', { id, text: cssText }).appendTo('head');
    }
}

export function InspectorBox({ cesiumViewer, handler, getLoadedTilesets, toolBar } = {}) {
    const viewer = cesiumViewer;
    const resolveTilesets = (typeof getLoadedTilesets === 'function')
        ? getLoadedTilesets
        : () => [];
    const toolBarApi = toolBar;

    let inspectorBoxEl = null;
    let inspectorLists = null;
    let $btnInspectorModelShow = null;
    let $btnInspectorClose = null;
    let $btnResetHiddenModels = null;

    const inspectorHiddenModel = new Set();
    let inspectorSelectedModel = null;
    let isPickingEnabled = false;
    let isOpen = false;

    let lastSelectedFeature = null;
    let lastSelectedColor = null;

    const LABEL_HIDE = '\uC228\uAE40';
    const LABEL_SHOW = '\uBCF4\uAE30';
    const LABEL_CLOSE = '\uB2EB\uAE30';
    const LABEL_OPEN = '\uC5F4\uAE30';
    const LABEL_RESET = '\uC228\uAE40 \uBAA8\uB378 \uCD08\uAE30\uD654';
    const LABEL_EMPTY = '\uC18D\uC131\uC815\uBCF4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.';

    function mount() {
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
        $btnInspectorClose = $inspectorBox.find('#btnInspectorClose');
        $btnInspectorModelShow = $inspectorBox.find('#btnInspectorModelShow');

        setOpen(false);
        enablePicking();
        registerToolBar();

        $btnInspectorModelShow.on('click', function () {
            const model = inspectorSelectedModel;
            if (!model) return;

            const isVisible = (model.show !== false);
            model.show = !isVisible;
            isVisible
                ? inspectorHiddenModel.add(model.getProperty('guid'))
                : inspectorHiddenModel.delete(model.getProperty('guid'));
            $btnInspectorModelShow.text(isVisible ? LABEL_SHOW : LABEL_HIDE);
            updateHiddenModelsResetButton();
        });

        $btnInspectorClose.on('click', function () {
            if (isOpen) {
                setOpen(false);
                toolBarApi?.closeGroup?.('inspector');
            } else {
                setOpen(true);
                toolBarApi?.openGroup?.('inspector');
            }
        });
    }

    function setOpen(open) {
        if (!inspectorBoxEl) return;

        const $inspector = $(inspectorBoxEl);
        const $shell = $inspector.closest('.shell');

        if (open) {
            $inspector.removeAttr('hidden');
            $shell.removeClass('no-inspector');
            if ($btnInspectorClose) $btnInspectorClose.text(LABEL_CLOSE);
            isOpen = true;
        } else {
            $inspector.attr('hidden', '');
            $shell.addClass('no-inspector');
            if ($btnInspectorClose) $btnInspectorClose.text(LABEL_OPEN);
            isOpen = false;
        }
    }

    function registerToolBar() {
        if (!toolBarApi?.addToolGroup) return;
        toolBarApi.addToolGroup({
            id: 'inspector',
            button: '#group-inspector',
            onOpen: () => setOpen(true),
            onClose: () => setOpen(false)
        });
    }

    function enablePicking() {
        if (isPickingEnabled) return;
        if (handler) handler.setInputAction(onMouseLeftClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        isPickingEnabled = true;
    }

    function disablePicking() {
        if (!isPickingEnabled) return;
        if (handler) handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        isPickingEnabled = false;
        setOpen(false);
    }

    function updateInspectorToggleButton(model) {
        inspectorSelectedModel = model;

        if (!$btnInspectorModelShow) return;

        if (model) {
            $btnInspectorModelShow.removeAttr('disabled');
            const isVisible = (model.show !== false);
            $btnInspectorModelShow.text(isVisible ? LABEL_HIDE : LABEL_SHOW);
        } else {
            $btnInspectorModelShow.attr('disabled');
            $btnInspectorModelShow.text(LABEL_HIDE);
        }
    }

    function updateHiddenModelsResetButton() {
        const hasHidden = inspectorHiddenModel.size > 0;

        if (!hasHidden) {
            if ($btnResetHiddenModels) {
                $btnResetHiddenModels.hide();
            }
            return;
        }

        if (!$btnResetHiddenModels) {
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
                    ${LABEL_RESET}
                </button>
            `);

            $btnResetHiddenModels.on('click', () => {
                (resolveTilesets() || []).forEach((ts) => {
                    const selected = ts._selectedTiles || [];
                    for (const t of selected) {
                        const content = t.content;
                        const len = content.featuresLength || 0;
                        for (let i = 0; i < len; i++) {
                            const f = content.getFeature(i);
                            const id = f.getProperty('guid');
                            if (inspectorHiddenModel.has(id)) {
                                f.show = true;
                            }
                        }
                    }
                });

                inspectorHiddenModel.clear();

                if (inspectorSelectedModel && !inspectorSelectedModel.isDestroyed?.()) {
                    inspectorSelectedModel.show = true;
                    if ($btnInspectorModelShow) {
                        $btnInspectorModelShow.text(LABEL_HIDE);
                    }
                }

                $btnResetHiddenModels.hide();
            });

            $root.append($btnResetHiddenModels);
        }

        $btnResetHiddenModels.show();
    }

    function pickModelFeatureIgnoringMeasure(windowPosition) {
        const scene = viewer.scene;
        const ray = viewer.camera.getPickRay(windowPosition);
        const hits = scene.drillPickFromRay(ray);

        if (!hits || hits.length === 0) return null;

        for (const h of hits) {
            const obj = h.object || h;
            if (!obj) continue;

            if (obj.id && obj.id.isMeasureEntity) {
                continue;
            }

            if (obj instanceof Cesium.Cesium3DTileFeature) {
                return { feature: obj };
            }
        }
        return null;
    }

    function isTilesFeature(feature) {
        return feature instanceof Cesium.Cesium3DTileFeature;
    }

    function getFeatureColor(feature) {
        try {
            return feature?.color?.clone?.() || Cesium.Color.WHITE;
        } catch {
            return Cesium.Color.WHITE;
        }
    }

    function setFeatureColor(feature, color) {
        try {
            if (feature && color) {
                feature.color = color;
            }
        } catch {
            console.warn('feature color set failed');
        }
    }

    function clearHighlight() {
        if (lastSelectedFeature && lastSelectedColor) {
            setFeatureColor(lastSelectedFeature, lastSelectedColor);
        }
        lastSelectedFeature = null;
        lastSelectedColor = null;
    }

    function highlightFeature(feature) {
        if (!isTilesFeature(feature)) return;
        if (lastSelectedFeature && lastSelectedFeature !== feature) {
            clearHighlight();
        }
        if (lastSelectedFeature === feature) return;

        lastSelectedFeature = feature;
        lastSelectedColor = getFeatureColor(feature);
        setFeatureColor(feature, Cesium.Color.CYAN.withAlpha(1));
    }

    function onMouseLeftClick(movement) {
        let pickedEntity;
        if (!pickedEntity) pickedEntity = viewer.scene.pick(movement.position);
        if (Cesium.defined(pickedEntity) && pickedEntity.id && pickedEntity.id.id === 'entity_icon') {
            if (pickedEntity.id.properties?.destination && pickedEntity.id.properties?.orientation) {
                const dest = pickedEntity.id.properties.destination;
                const orient = pickedEntity.id.properties.orientation;
                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(dest.getValue().longitude, dest.getValue().latitude, dest.getValue().height),
                    orientation: {
                        heading: orient.getValue().heading,
                        pitch: orient.getValue().pitch,
                        roll: orient.getValue().roll,
                    }
                });
            }
            return;
        }

        const pickResult = pickModelFeatureIgnoringMeasure(movement.position);
        const pickedFeature = pickResult?.feature;

        if (!pickResult) {
            clearHighlight();
            updateInspectorToggleButton(null);
            return;
        }

        highlightFeature(pickedFeature);
        updateInspectorToggleButton(pickedFeature);
        renderInspector(pickedFeature);
    }

    function renderInspector(feature) {
        if (!inspectorLists || !feature) return;

        inspectorLists.innerHTML = '';

        const propIds = feature.getPropertyIds?.() || [];

        if (!propIds.includes('props')) {
            inspectorLists.innerHTML = `
                <div class="inspect_list">
                    <div class="k">info</div>
                    <div style="color:#cccccc;">${LABEL_EMPTY}</div>
                </div>
            `;
            return;
        }

        let propsRaw = feature.getProperty('props');
        let propsObj = null;

        try {
            propsObj = typeof propsRaw === 'string'
                ? JSON.parse(propsRaw)
                : propsRaw;
        } catch (e) {
            console.warn('props JSON parse failed', propsRaw);
        }

        if (!propsObj || Object.keys(propsObj).length === 0) {
            inspectorLists.innerHTML = `
                <div class="inspect_list">
                    <div class="k">info</div>
                    <div style="color:#cccccc;">${LABEL_EMPTY}</div>
                </div>
            `;
            return;
        }

        const isPlainObject = (val) => {
            return Object.prototype.toString.call(val) === '[object Object]';
        };

        const formatValue = (val) => {
            if (val === null || val === undefined) return '';
            if (typeof val === 'string') return val;
            if (typeof val === 'number' || typeof val === 'boolean') return String(val);
            try {
                return JSON.stringify(val);
            } catch {
                return String(val);
            }
        };

        const rows = [];
        const addRow = (label, value) => {
            rows.push(`
                <div class="inspect_list">
                    <div class="k">${label}</div>
                    <div style="color:#cccccc;">${formatValue(value)}</div>
                </div>
            `);
        };

        const addSection = (title, obj) => {
            const sectionRows = Object.entries(obj || {}).map(([k, v]) => {
                return `
                    <div class="inspect_list">
                        <div class="k">${k}</div>
                        <div style="color:#cccccc;">${formatValue(v)}</div>
                    </div>
                `;
            }).join('');

            rows.push(`
                <div class="inspect_section">
                    <button type="button" class="inspect_section_header" aria-expanded="true">
                        <span class="inspect_section_toggle">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="inspect_toggle_icon"><path fill-rule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clip-rule="evenodd"></path></svg>
                        </span>
                        <span class="inspect_section_title">${title}</span>
                    </button>
                    <div class="inspect_section_body">
                        ${sectionRows}
                    </div>
                </div>
            `);
        };

        Object.entries(propsObj).forEach(([key, value]) => {
            if (isPlainObject(value)) {
                addSection(key, value);
                return;
            }
            addRow(key, value);
        });

        inspectorLists.innerHTML = rows.join('');

        const sectionHeaders = inspectorLists.querySelectorAll('.inspect_section_header');
        sectionHeaders.forEach((btn) => {
            btn.addEventListener('click', () => {
                const section = btn.closest('.inspect_section');
                if (!section) return;
                const open = section.classList.toggle('is-open');
                btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        });
    }

    return {
        mount,
        setOpen,
        enablePicking,
        disablePicking,
        isHiddenModel: (id) => inspectorHiddenModel.has(id)
    };
}
