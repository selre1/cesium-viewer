import {MAPLAYER_STYLE_ID, MAPLAYER_CSS, MAPLAYER_HTML} from "./UiTemplates.js";

export function MapLayer({container} ) {
    container = (typeof container === 'string') ? document.querySelector(container) : container;
    if (!container) { throw new Error('Tool Bar 생성: 유효한 container가 필요합니다.'); }

    if (!document.getElementById(MAPLAYER_STYLE_ID)) {
        $('<style>', { MAPLAYER_STYLE_ID, text: MAPLAYER_CSS }).appendTo('head');
    }
    const $root = $(MAPLAYER_HTML);
    container.appendChild($root[0]);
}