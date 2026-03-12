import { TOOLBAR_STYLE_ID, TOOLBAR_CSS, TOOLBAR_HTML } from './UiTemplates.js';

function injectStyleOnce(id, cssText) {
    if (!document.getElementById(id)) {
        $('<style>', { id, text: cssText }).appendTo('head');
    }
}

function resolveElement(target, scope) {
    if (!target) return null;
    if (target instanceof HTMLElement) return target;
    if (target.jquery && target.length) return target[0];
    if (typeof target === 'function') return resolveElement(target(), scope);
    if (typeof target === 'string') {
        const root = scope || document;
        return root.querySelector(target);
    }
    return null;
}

function ensureToolRoot(container) {
    const root = (typeof container === 'string') ? document.querySelector(container) : container;
    if (!root) {
        throw new Error('Tool Bar: container is required.');
    }

    injectStyleOnce(TOOLBAR_STYLE_ID, TOOLBAR_CSS);

    let toolRoot = root.querySelector('.tool-root');
    if (!toolRoot) {
        toolRoot = $(TOOLBAR_HTML)[0];
        root.appendChild(toolRoot);
    }
    return toolRoot;
}

function createGroupManager(toolRoot) {
    const groups = new Map();
    const groupBar = toolRoot.querySelector('.tool-group-bar');
    let openId = null;

    function registerGroup({ id, button, panel, openClass = 'is-open', activeClass = 'is-active', onOpen, onClose } = {}) {
        if (!id) return null;
        const btnEl = resolveElement(button, toolRoot);
        if (!btnEl) return null;

        const group = {
            id,
            button: btnEl,
            panel,
            openClass,
            activeClass,
            onOpen,
            onClose
        };
        groups.set(id, group);
        return group;
    }

    function addGroupButton({ id, html, panel, openClass = 'is-open', activeClass = 'is-active' } = {}) {
        if (!groupBar || !html) return null;
        const $btn = $(html);
        if (!$btn.hasClass('tool-group')) $btn.addClass('tool-group');
        if (id && !$btn.attr('data-tool-group')) $btn.attr('data-tool-group', id);
        groupBar.appendChild($btn[0]);
        return registerGroup({ id, button: $btn[0], panel, openClass, activeClass });
    }

    function setActive(group, isActive) {
        const cls = group.activeClass || 'is-active';
        if (isActive) group.button.classList.add(cls);
        else group.button.classList.remove(cls);
    }

    function setPanelOpen(group, isOpen) {
        const panelEl = resolveElement(group.panel);
        if (!panelEl) return;
        const cls = group.openClass || 'is-open';
        if (isOpen) panelEl.classList.add(cls);
        else panelEl.classList.remove(cls);
    }

    function openGroup(id) {
        if (!groups.has(id)) return;
        if (openId && openId !== id) {
            closeGroup(openId);
        }
        const group = groups.get(id);
        setActive(group, true);
        setPanelOpen(group, true);
        openId = id;
        group.onOpen?.();
    }

    function closeGroup(id) {
        const group = groups.get(id);
        if (!group) return;
        setActive(group, false);
        setPanelOpen(group, false);
        if (openId === id) {
            openId = null;
            group.onClose?.();
        }
    }

    function closeAll() {
        if (openId) {
            closeGroup(openId);
        }
        groups.forEach((group) => {
            setActive(group, false);
            setPanelOpen(group, false);
        });
        openId = null;
    }

    function isOpen(id) {
        return openId === id;
    }

    function getGroup(id) {
        return groups.get(id) || null;
    }

    return {
        registerGroup,
        addGroupButton,
        openGroup,
        closeGroup,
        closeAll,
        isOpen,
        getGroup
    };
}

function createToolButtonGroup({ scope, container, buttonSelector = '.tool', activeClass = 'is-active' } = {}) {
    const scopeEl = resolveElement(scope);
    if (!scopeEl) return null;
    const containerEl = resolveElement(container, scopeEl) || scopeEl;

    function setActive(buttonEl) {
        scopeEl.querySelectorAll(buttonSelector).forEach((el) => {
            el.classList.remove(activeClass);
        });
        if (buttonEl) buttonEl.classList.add(activeClass);
    }

    function clearActive() {
        setActive(null);
    }

    function registerButton({ button, onClick, activate = true } = {}) {
        const btnEl = resolveElement(button, scopeEl);
        if (!btnEl) return null;
        btnEl.addEventListener('click', (e) => {
            if (activate) setActive(btnEl);
            onClick?.(e, btnEl);
        });
        return btnEl;
    }

    function addButton({ html, onClick, activate = true } = {}) {
        if (!html) return null;
        const $btn = $(html);
        if (!$btn.hasClass('tool')) $btn.addClass('tool');
        containerEl.appendChild($btn[0]);
        return registerButton({ button: $btn[0], onClick, activate });
    }

    return {
        setActive,
        clearActive,
        registerButton,
        addButton
    };
}

export function ToolBar({
    container,
    onPoint,
    onLine,
    onVertical,
    onAreaGround,
    onAreaSurface,
    onCrossSectionArea,
    onClose,
    onInit,
    onInspector
} = {}) {
    const toolRoot = ensureToolRoot(container);
    const $rootWrap = $(toolRoot);

    const groupManager = createGroupManager(toolRoot);

    const measurePanel = toolRoot.querySelector('.tool-panel--measure');
    const markerPanel = toolRoot.querySelector('.tool-panel--marker');

    const measureTools = createToolButtonGroup({
        scope: measurePanel,
        container: measurePanel ? measurePanel.querySelector('.tool-panel-main') : null
    });

    if (measureTools) {
        measureTools.registerButton({ button: '#btn_point', onClick: () => onPoint?.() });
        measureTools.registerButton({ button: '#btn_line', onClick: () => onLine?.() });
        measureTools.registerButton({ button: '#btn_vertical', onClick: () => onVertical?.() });
        measureTools.registerButton({ button: '#btn_ground', onClick: () => onAreaGround?.() });
        measureTools.registerButton({ button: '#btn_surface', onClick: () => onAreaSurface?.() });
        measureTools.registerButton({ button: '#btn_cross', onClick: () => onCrossSectionArea?.() });

        measureTools.registerButton({
            button: '#btn_init',
            activate: false,
            onClick: () => {
                measureTools.clearActive();
                onInit?.();
            }
        });

        measureTools.registerButton({
            button: '#btn_close',
            activate: false,
            onClick: () => {
                measureTools.clearActive();
                onClose?.();
                groupManager.closeAll();
            }
        });
    }

    const markerTools = createToolButtonGroup({
        scope: markerPanel,
        container: markerPanel ? markerPanel.querySelector('.tool-panel-main') : null
    });

    if (markerTools) {
        markerTools.registerButton({
            button: '#btn_marker_init',
            activate: false,
            onClick: () => {}
        });
        markerTools.registerButton({
            button: '#btn_marker_close',
            activate: false,
            onClick: () => {
                groupManager.closeAll();
            }
        });
    }

    function closeAllPanels() {
        groupManager.closeAll();
        if (measureTools) measureTools.clearActive();
    }

    function bindGroupToggle(id, { onOpen, onClose: onToggleClose } = {}) {
        const group = groupManager.getGroup(id);
        if (!group || group._bound) return;
        if (onOpen) group.onOpen = onOpen;
        if (onToggleClose) group.onClose = onToggleClose;
        group._bound = true;
        group.button.addEventListener('click', () => {
            if (groupManager.isOpen(id)) {
                groupManager.closeGroup(id);
            } else {
                groupManager.openGroup(id);
            }
        });
    }

    groupManager.registerGroup({ id: 'measure', button: '#group-measure', panel: '.tool-panel--measure' });

    bindGroupToggle('measure', {
        onClose: () => {
            if (measureTools) measureTools.clearActive();
            onClose?.();
        }
    });
    // Other groups (inspector/layer/marker) should be registered by their modules via addToolGroup.

    function hiddenMountToolBar() {
        $rootWrap.css('display', 'none');
        closeAllPanels();
    }

    function showMountToolBar() {
        $rootWrap.css('display', 'flex');
    }

    function addToolGroup({
        id,
        html,
        button,
        panel,
        openClass = 'is-open',
        activeClass = 'is-active',
        onOpen,
        onClose: onToggleClose
    } = {}) {
        const panelEl = panel ? resolveElement(panel, toolRoot) : null;
        if (panelEl) {
            const groupBarEl = toolRoot.querySelector('.tool-group-bar');
            if (groupBarEl) {
                toolRoot.insertBefore(panelEl, groupBarEl);
            }
        }

        const panelRef = panelEl || panel;
        let group = null;
        if (html) {
            group = groupManager.addGroupButton({ id, html, panel: panelRef, openClass, activeClass });
        } else if (button) {
            group = groupManager.registerGroup({ id, button, panel: panelRef, openClass, activeClass });
        }
        if (group) {
            bindGroupToggle(id, { onOpen, onClose: onToggleClose });
        }
        return group;
    }

    return {
        showMountToolBar,
        hiddenMountToolBar,
        closeAllPanels,
        addToolGroup,
        addMeasureTool: measureTools ? measureTools.addButton : undefined,
        addMarkerTool: markerTools ? markerTools.addButton : undefined,
        openGroup: (id) => groupManager.openGroup(id),
        closeGroup: (id) => groupManager.closeGroup(id),
        isGroupOpen: (id) => groupManager.isOpen(id)
    };
}
