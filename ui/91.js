var currentCrosshairCreatorWeaponIndex = -1;
var currentCrosshairCreatorZoomWeaponIndex = -1;
var canvasCrosshairSize = Math.ceil(.1 * window.innerHeight) * 2;
document.documentElement.style.setProperty("--crosshair-canvas-size", "" + canvasCrosshairSize);
document.documentElement.style.setProperty("--crosshair-copy-buttons", "" + (canvasCrosshairSize - 4));
const crosshairLayers = ["layer1", "layer2", "layer3"];
const crosshairLayerTypes = ["none", "cross", "dot", "circle", "pointer"];
const savedCrosshairStrings = [];

function initialize_saved_crosshair_engine_variables() {
    let max_saved_crosshairs = 10;
    for (let i = 0; i < max_saved_crosshairs; i++) {
        engine.call("initialize_custom_component_value", "hud_saved_crosshair_definition:" + i)
    }
}

function set_saved_crosshairs_from_engine(idx, value) {
    savedCrosshairStrings[idx] = value
}

function cleanSavedCrosshairArray() {
    let spliceEmpty = false;
    for (i = savedCrosshairStrings.length - 1; i >= 0; i--) {
        if (savedCrosshairStrings[i] != "{}") {
            spliceEmpty = true
        }
        if (spliceEmpty && savedCrosshairStrings[i] == "{}") {
            savedCrosshairStrings.splice(i, 1);
            savedCrosshairStrings.push("{}")
        }
    }
    for (i = 0; i < savedCrosshairStrings.length; i++) {
        let skip_callback = i === savedCrosshairStrings.length - 1 ? false : true;
        update_variable("string", "hud_saved_crosshair_definition:" + i, savedCrosshairStrings[i], skip_callback)
    }
}

function get_crosshair_draw_list(crosshair_string, hit_mode, draw_id) {
    let crosshair_definition = cleanCrosshairDefinition(generateFullCrosshairDefinition(crosshair_string));
    if (hit_mode) {
        var crosshair_draw_list = drawCrosshair(crosshair_definition, "logicalHit")
    } else {
        var crosshair_draw_list = drawCrosshair(crosshair_definition, "logicalDefault")
    }
    engine.call("get_crosshair_draw_list_return", crosshair_draw_list, draw_id)
}
const global_crosshair_creators = {};
class CrosshairCreator {
    canvasCrosshairPreviewMap = {};
    ctxCrosshairPreviewMap = {};
    zoom = false;
    crosshair_definition = {};
    engine_variable = "";
    eventListenersInitialized = false;
    constructor(game_id, container, extra_preview_container) {
        this.game_id = game_id, this.container = container;
        this.extra_preview_container = extra_preview_container;
        this.createCanvasCrosshairPreviewMaps();
        this.initializeCanvasCrosshairPresets();
        initialize_saved_crosshair_engine_variables();
        this.initialize_saved_crosshairs();
        let layers = this.container.querySelectorAll(".canvas_crosshair_layer");
        for (let i = 0; i < layers.length; i++) {
            layers[i].addEventListener("click", (() => {
                if (layers[i].nextSibling.style.display === "none") {
                    layers[i].nextSibling.style.display = "block";
                    layers[i].style.backgroundImage = "url(/html/images/icons/fa/caret-down.svg)"
                } else {
                    layers[i].nextSibling.style.display = "none";
                    layers[i].style.backgroundImage = "url(/html/images/icons/fa/caret-right.svg)"
                }
                refreshScrollbar(this.container.querySelector(".crosshair_scroll"))
            }))
        }
    }
    initialize(zoom, crosshair_definition, engine_variable, layer_display) {
        this.zoom = zoom;
        this.crosshair_definition = crosshair_definition;
        this.engine_variable = engine_variable;
        cleanCrosshairDefinition(this.crosshair_definition);
        this.initializeCrosshairPasteInput();
        var editorContainer = this.container.querySelector(".settings_screen_crosshair_subsection_container");
        editorContainer.style.display = "block";
        for (let layer of crosshairLayers) {
            let el = this.container.querySelector(".canvas_cross_" + layer + "_setting");
            _empty(el);
            if (!crosshairLayerTypes.includes(this.crosshair_definition[layer].type)) {
                this.crosshair_definition[layer].type = "none"
            }
            for (let type of crosshairLayerTypes) {
                let opt = _createElement("div");
                opt.dataset.value = type;
                opt.textContent = localize("settings_crosshair_layer_type_" + type);
                if (opt.dataset.value == this.crosshair_definition[layer].type) {
                    opt.dataset.selected = 1
                }
                el.appendChild(opt)
            }
            this.setLayerType(layer, this.crosshair_definition[layer].type, layer_display);
            ui_setup_select(el, ((opt, field) => {
                this.crosshair_definition[layer].type = field.dataset.value;
                this.setLayerType(layer, this.crosshair_definition[layer].type, "block");
                this.removeCrosshairScaleWarning();
                this.updateCrosshairPreview(this.crosshair_definition);
                updateEngineCrosshairDefinition(this.engine_variable, this.crosshair_definition)
            }))
        }
        this.updateCrosshairPreview(this.crosshair_definition);
        if (!this.eventListenersInitialized) {
            let copy_button = this.container.querySelector(".crosshair_canvas_copy_button");
            copy_button.addEventListener("click", (() => {
                this.copyCrosshairDefinition()
            }));
            let paste_button = this.container.querySelector(".crosshair_canvas_paste_button");
            paste_button.addEventListener("click", (() => {
                this.openCrosshairPasteInput()
            }));
            let close_button = this.container.querySelector(".close_button");
            if (close_button) {
                close_button.addEventListener("click", (() => {
                    this.closeCrosshairEditorScreen()
                }))
            }
            let scale_yes_button = this.container.querySelector(".scale_yes");
            scale_yes_button.addEventListener("click", (() => {
                this.scaleCrosshairToRes()
            }));
            let scale_no_button = this.container.querySelector(".scale_no");
            scale_no_button.addEventListener("click", (() => {
                this.removeCrosshairScaleWarning()
            }));
            this.eventListenersInitialized = true
        }
        let scaleWarning = this.container.querySelector(".crosshair_canvas_preview_scale_warning");
        if (this.crosshair_definition.designVh == window.innerHeight) {
            scaleWarning.style.display = "none"
        } else {
            scaleWarning.style.display = "block"
        }
    }
    setLayerType(layer, type, display) {
        var el = this.container.querySelector(".canvas_cross_" + layer + "_options");
        var header = this.container.querySelector(".canvas_cross_" + layer + "_header");
        var template_id = "canvas_crosshair_" + type + "_template";
        var viewScale = window.innerHeight / 1080;

        function scaleToRes(val) {
            return Math.ceil(parseInt(val) * viewScale)
        }
        var data = {
            layer: layer,
            zoom: ""
        };
        var helpers = {
            scale: scaleToRes,
            localize: localize
        };
        if (type == "none") {
            display = "none"
        }
        el.style.display = display;
        header.style.backgroundImage = display == "none" ? "url(/html/images/icons/fa/caret-right.svg)" : "url(/html/images/icons/fa/caret-down.svg)";
        var template = window.jsrender.templates(_id(template_id).textContent);
        _html(el, template.render(data, helpers));
        if (layer === "layer3") {
            el.appendChild(_createElement("div", "canvas-crosshair-layer-close"))
        }
        this.reinitializeCrosshairOptions(el, layer, type);
        refreshScrollbar(this.container.querySelector(".crosshair_scroll"))
    }
    createCanvasCrosshairPreviewMaps() {
        const canvasCrosshairPreviewSize = Math.ceil(.1 * window.innerHeight) * 3;
        this.canvasCrosshairPreviewMap = {};
        this.ctxCrosshairPreviewMap = {};
        for (let type of["default", "hit", "menu"]) {
            this.canvasCrosshairPreviewMap[type] = document.createElement("canvas");
            this.canvasCrosshairPreviewMap[type].width = canvasCrosshairPreviewSize;
            this.canvasCrosshairPreviewMap[type].height = canvasCrosshairPreviewSize;
            this.ctxCrosshairPreviewMap[type] = this.canvasCrosshairPreviewMap[type].getContext("2d");
            if (type == "menu") {
                if (this.extra_preview_container) {
                    var new_div = _createElement("div", "crosshair");
                    new_div.appendChild(this.canvasCrosshairPreviewMap[type]);
                    let crosshairMenuPreviewContainer = this.extra_preview_container.querySelector(".preview_crosshairs_content");
                    _empty(crosshairMenuPreviewContainer);
                    crosshairMenuPreviewContainer.appendChild(new_div)
                }
            } else {
                this.ctxCrosshairPreviewMap[type].translate(canvasCrosshairPreviewSize / 2, canvasCrosshairPreviewSize / 2);
                const hit_suffix = type == "hit" ? "_hit" : "";
                let canvasCrosshairPreviewContainer = this.container.querySelector(".crosshair_canvas" + hit_suffix + "_preview");
                canvasCrosshairPreviewContainer.appendChild(this.canvasCrosshairPreviewMap[type])
            }
        }
    }
    initializeCanvasCrosshairPresets() {
        let preset_canvas_crosshair_definitions = [{
            layer1: {
                type: "cross",
                crTop: 1,
                crRig: 1,
                crBot: 1,
                crLef: 1,
                crHCE: 0,
                crCol: "FFFFFF",
                crOCo: "000000",
                crHCo: "FF0000",
                crLen: 8,
                crThi: 2,
                crGap: 4,
                crRot: 0,
                crOTh: 1,
                crOSt: "persistent"
            },
            layer2: {
                type: "none"
            },
            layer3: {
                type: "none"
            },
            designVh: "1080"
        }, {
            layer1: {
                type: "cross",
                crTop: 1,
                crRig: 1,
                crBot: 1,
                crLef: 1,
                crHCE: 0,
                crCol: "000000",
                crOCo: "000000",
                crHCo: "FF0000",
                crLen: 40,
                crThi: 2,
                crGap: 0,
                crRot: 0,
                crOTh: 0,
                crOSt: "persistent"
            },
            layer2: {
                type: "none"
            },
            layer3: {
                type: "none"
            },
            designVh: "1440"
        }, {
            layer1: {
                type: "cross",
                crTop: 1,
                crRig: 1,
                crBot: 1,
                crLef: 1,
                crHCE: 0,
                crCol: "FFFFFF",
                crOCo: "000000",
                crHCo: "FF0000",
                crLen: "10",
                crThi: 2,
                crGap: "0",
                crRot: "0",
                crOTh: 2,
                crOSt: "persistent"
            },
            layer2: {
                type: "none"
            },
            layer3: {
                type: "none"
            },
            designVh: "1080"
        }, {
            layer1: {
                type: "cross",
                crTop: 1,
                crRig: 1,
                crBot: 1,
                crLef: 1,
                crHCE: 0,
                crCol: "FFFFFF",
                crOCo: "000000",
                crHCo: "FF0000",
                crLen: "3",
                crThi: "10",
                crGap: "8",
                crRot: "0",
                crOTh: 1,
                crOSt: "persistent"
            },
            layer2: {
                type: "none"
            },
            layer3: {
                type: "none"
            },
            designVh: "1080"
        }, {
            layer1: {
                type: "dot",
                dHCE: 0,
                dCol: "FFFFFF",
                dOCo: "000000",
                dHCo: "FF0000",
                dThi: 3,
                dOTh: 2,
                dTyp: "round",
                dOSt: "persistent"
            },
            layer2: {
                type: "none"
            },
            layer3: {
                type: "none"
            },
            designVh: "1080"
        }, {
            layer1: {
                type: "cross",
                crTop: 1,
                crRig: 1,
                crBot: 1,
                crLef: 1,
                crHCE: 0,
                crCol: "FFFFFF",
                crOCo: "000000",
                crHCo: "FF0000",
                crLen: 10,
                crThi: 2,
                crGap: 4,
                crRot: 0,
                crOTh: 1,
                crOSt: "adaptive"
            },
            layer2: {
                type: "circle",
                ciHCE: 0,
                ciCol: "FFFFFF",
                ciOCo: "000000",
                ciHCo: "FF0000",
                ciSeg: "1",
                ciRad: "7",
                ciThi: 2,
                ciGap: 0,
                ciRot: 0,
                ciOTh: "1",
                ciOSt: "persistent"
            },
            layer3: {
                type: "none"
            },
            designVh: "1080"
        }, {
            layer1: {
                type: "cross",
                crTop: 1,
                crRig: 1,
                crBot: 1,
                crLef: 1,
                crHCE: 0,
                crCol: "FFFFFF",
                crOCo: "000000",
                crHCo: "FF0000",
                crLen: 8,
                crThi: 2,
                crGap: 6,
                crRot: 0,
                crOTh: 1,
                crOSt: "adaptive"
            },
            layer2: {
                type: "dot",
                dHCE: 0,
                dCol: "FFFFFF",
                dOCo: "000000",
                dHCo: "FF0000",
                dThi: 2,
                dOTh: 1,
                dTyp: "square",
                dOSt: "persistent"
            },
            layer3: {
                type: "none"
            },
            designVh: "1080"
        }, {
            layer1: {
                type: "cross",
                crTop: "1",
                crRig: "0",
                crBot: "1",
                crLef: "0",
                crHCE: "0",
                crCol: "FFFFFF",
                crOCo: "000000",
                crHCo: "FF0000",
                crLen: "8",
                crThi: "2",
                crGap: "0",
                crRot: "0",
                crOTh: "1",
                crOSt: "adaptive"
            },
            layer2: {
                type: "cross",
                crTop: "0",
                crRig: "1",
                crBot: "0",
                crLef: "1",
                crHCE: "0",
                crCol: "FFFFFF",
                crOCo: "000000",
                crHCo: "FF0000",
                crLen: "12",
                crThi: "2",
                crGap: "0",
                crRot: "0",
                crOTh: "1",
                crOSt: "persistent"
            },
            layer3: {
                type: "none"
            },
            designVh: "1080"
        }, {
            layer1: {
                type: "cross",
                crTop: "1",
                crRig: "1",
                crBot: "1",
                crLef: "1",
                crHCE: "0",
                crCol: "FFFFFF",
                crOCo: "000000",
                crHCo: "FF0000",
                crLen: "8",
                crThi: "4",
                crGap: "6",
                crRot: "45",
                crOTh: "1",
                crOSt: "persistent"
            },
            layer2: {
                type: "none"
            },
            layer3: {
                type: "none"
            },
            designVh: "1080"
        }, {
            layer1: {
                type: "circle",
                ciHCE: "0",
                ciCol: "FFFFFF",
                ciOCo: "000000",
                ciHCo: "FF0000",
                ciSeg: "4",
                ciRad: "10",
                ciThi: "2",
                ciGap: "30",
                ciRot: "0",
                ciOTh: "1",
                ciOSt: "persistent"
            },
            layer2: {
                type: "none"
            },
            layer3: {
                type: "none"
            },
            designVh: "1080"
        }, {
            layer1: {
                type: "cross",
                crTop: "0",
                crRig: "1",
                crBot: "0",
                crLef: "1",
                crHCE: "0",
                crCol: "FFFFFF",
                crOCo: "000000",
                crHCo: "FF0000",
                crLen: 14,
                crThi: 2,
                crGap: 8,
                crRot: 0,
                crOTh: 1,
                crOSt: "adaptive"
            },
            layer2: {
                type: "circle",
                ciHCE: "0",
                ciCol: "FFFFFF",
                ciOCo: "000000",
                ciHCo: "FF0000",
                ciSeg: "2",
                ciRad: 8,
                ciThi: 2,
                ciGap: "30",
                ciRot: 0,
                ciOTh: "1",
                ciOSt: "persistent"
            },
            layer3: {
                type: "dot",
                dHCE: "0",
                dCol: "FFFFFF",
                dOCo: "000000",
                dHCo: "FF0000",
                dThi: 2,
                dOTh: 1,
                dTyp: "square",
                dOSt: "persistent"
            },
            designVh: "1080"
        }, {
            layer1: {
                type: "cross",
                crTop: 1,
                crRig: 1,
                crBot: 1,
                crLef: 1,
                crHCE: 0,
                crCol: "FFFFFF",
                crOCo: "000000",
                crHCo: "FF0000",
                crLen: 5,
                crThi: 2,
                crGap: 0,
                crRot: 0,
                crOTh: 1,
                crOSt: "persistent"
            },
            layer2: {
                type: "circle",
                ciHCE: "0",
                ciCol: "FFFFFF",
                ciOCo: "000000",
                ciHCo: "FF0000",
                ciSeg: "1",
                ciRad: "18",
                ciThi: "2",
                ciGap: "0",
                ciRot: "0",
                ciOTh: "1",
                ciOSt: "persistent"
            },
            layer3: {
                type: "none"
            },
            designVh: "1080"
        }, {
            layer1: {
                type: "circle",
                ciHCE: "0",
                ciCol: "FFFFFF",
                ciOCo: "000000",
                ciHCo: "FF0000",
                ciSeg: "3",
                ciRad: 18,
                ciThi: 2,
                ciGap: "25",
                ciRot: 0,
                ciOTh: "1",
                ciOSt: "persistent"
            },
            layer2: {
                type: "dot",
                dHCE: "0",
                dCol: "FFFFFF",
                dOCo: "000000",
                dHCo: "FF0000",
                dThi: 2,
                dOTh: "1",
                dTyp: "round",
                dOSt: "persistent"
            },
            layer3: {
                type: "none"
            },
            designVh: "1080"
        }, {
            layer1: {
                type: "pointer",
                poTL: "0",
                poTR: "0",
                poBR: "1",
                poBL: "0",
                poHCE: "0",
                poCol: "FFFFFF",
                poOCo: "000000",
                poHCo: "FF0000",
                poLen: "12",
                poThi: "2",
                poGap: "0",
                poRot: "45",
                poOTh: "1",
                poOSt: "persistent"
            },
            layer2: {
                type: "none"
            },
            layer3: {
                type: "none"
            },
            designVh: "1080"
        }, {
            layer1: {
                type: "pointer",
                poTL: "1",
                poTR: "1",
                poBR: "1",
                poBL: "1",
                poHCE: "0",
                poCol: "FFFFFF",
                poOCo: "000000",
                poHCo: "FF0000",
                poLen: "8",
                poThi: "2",
                poGap: "1",
                poRot: "0",
                poOTh: "1",
                poOSt: "persistent"
            },
            layer2: {
                type: "none"
            },
            layer3: {
                type: "none"
            },
            designVh: "1080"
        }, {
            layer1: {
                type: "cross",
                crTop: 1,
                crRig: 1,
                crBot: 1,
                crLef: 1,
                crHCE: 0,
                crCol: "FFFFFF",
                crOCo: "000000",
                crHCo: "FF0000",
                crLen: "2",
                crThi: "12",
                crGap: "11",
                crRot: "45",
                crOTh: "1",
                crOSt: "persistent"
            },
            layer2: {
                type: "pointer",
                poTL: "1",
                poTR: "1",
                poBR: "1",
                poBL: "1",
                poHCE: "0",
                poCol: "FFFFFF",
                poOCo: "000000",
                poHCo: "FF0000",
                poLen: "3",
                poThi: "3",
                poGap: "1",
                poRot: "0",
                poOTh: "1",
                poOSt: "persistent"
            },
            layer3: {
                type: "none"
            },
            designVh: "1080"
        }, {
            layer1: {
                type: "pointer",
                poTL: "0",
                poTR: "0",
                poBR: "1",
                poBL: "0",
                poHCE: "0",
                poCol: "FFFFFF",
                poOCo: "000000",
                poHCo: "FF0000",
                poLen: "12",
                poThi: "2",
                poGap: "0",
                poRot: "0",
                poOTh: "1",
                poOSt: "adaptive"
            },
            layer2: {
                type: "cross",
                crTop: "0",
                crRig: "1",
                crBot: "0",
                crLef: "0",
                crHCE: "0",
                crCol: "FFFFFF",
                crOCo: "000000",
                crHCo: "FF0000",
                crLen: "16",
                crThi: "2",
                crGap: "3",
                crRot: "45",
                crOTh: "1",
                crOSt: "persistent"
            },
            layer3: {
                type: "none"
            },
            designVh: "1080"
        }, {
            layer1: {
                type: "cross",
                crTop: "0",
                crRig: "1",
                crBot: "0",
                crLef: "1",
                crHCE: "0",
                crCol: "FFFFFF",
                crOCo: "000000",
                crHCo: "FF0000",
                crLen: "16",
                crThi: "2",
                crGap: "2",
                crRot: "0",
                crOTh: "1",
                crOSt: "persistent"
            },
            layer2: {
                type: "cross",
                crTop: "0",
                crRig: "0",
                crBot: "1",
                crLef: "0",
                crHCE: "0",
                crCol: "FFFFFF",
                crOCo: "000000",
                crHCo: "FF0000",
                crLen: "2",
                crThi: "18",
                crGap: "12",
                crRot: "0",
                crOTh: "1",
                crOSt: "persistent"
            },
            layer3: {
                type: "cross",
                crTop: "0",
                crRig: "0",
                crBot: "1",
                crLef: "0",
                crHCE: "0",
                crCol: "FFFFFF",
                crOCo: "000000",
                crHCo: "FF0000",
                crLen: "2",
                crThi: "6",
                crGap: "24",
                crRot: "0",
                crOTh: "1",
                crOSt: "persistent"
            },
            designVh: "1080"
        }, {
            layer1: {
                type: "cross",
                crTop: 1,
                crRig: 1,
                crBot: 1,
                crLef: 1,
                crHCE: 0,
                crCol: "FFFFFF",
                crOCo: "000000",
                crHCo: "FF0000",
                crLen: "4",
                crThi: "24",
                crGap: "8",
                crRot: 0,
                crOTh: "2",
                crOSt: "persistent"
            },
            layer2: {
                type: "none"
            },
            layer3: {
                type: "none"
            },
            designVh: "1080"
        }, {
            layer1: {
                type: "circle",
                ciHCE: "0",
                ciCol: "FFFFFF",
                ciOCo: "000000",
                ciHCo: "FF0000",
                ciSeg: "1",
                ciRad: "13",
                ciThi: "8",
                ciGap: "0",
                ciRot: "0",
                ciOTh: "0",
                ciOSt: "persistent"
            },
            layer2: {
                type: "circle",
                ciHCE: "0",
                ciCol: "01B7ED",
                ciOCo: "000000",
                ciHCo: "FF0000",
                ciSeg: "1",
                ciRad: "5",
                ciThi: "5",
                ciGap: "50",
                ciRot: "0",
                ciOTh: "0",
                ciOSt: "persistent"
            },
            layer3: {
                type: "none"
            },
            designVh: "1080"
        }, {
            layer1: {
                type: "cross",
                crTop: 1,
                crRig: 0,
                crBot: 0,
                crLef: 1,
                crHCE: "1",
                crCol: "FFC600",
                crOCo: "000000",
                crHCo: "FF0000",
                crLen: 14,
                crThi: 4,
                crGap: 8,
                crRot: 45,
                crOTh: 3,
                crOSt: "persistent"
            },
            layer2: {
                type: "circle",
                ciHCE: "0",
                ciCol: "000000",
                ciOCo: "000000",
                ciHCo: "FF0000",
                ciSeg: "1",
                ciRad: "10",
                ciThi: "3",
                ciGap: "75",
                ciRot: "0",
                ciOTh: "0",
                ciOSt: "persistent"
            },
            layer3: {
                type: "dot",
                dHCE: "0",
                dCol: "00A5FF88",
                dOCo: "000000",
                dHCo: "FF0000",
                dThi: 18,
                dOTh: 3,
                dTyp: "round",
                dOSt: "persistent"
            },
            designVh: "1080"
        }];
        const preset_container = this.container.querySelector(".crosshair_default_preset_container");
        _empty(preset_container);
        for (let definition of preset_canvas_crosshair_definitions) {
            scaleCrosshairDefinition(definition);
            let new_div = _createElement("div", "crosshair-preset");
            let optionCanvas = document.createElement("canvas");
            let optionCanvasSize = Math.ceil(.05 * window.innerHeight);
            optionCanvas.width = optionCanvasSize;
            optionCanvas.height = optionCanvasSize;
            let ctx = optionCanvas.getContext("2d");
            ctx.translate(optionCanvasSize / 2, optionCanvasSize / 2);
            drawCrosshair(definition, ctx);
            new_div.appendChild(optionCanvas);
            preset_container.appendChild(new_div);
            new_div.addEventListener("click", (() => {
                this.load_preset_canvas_crosshair(definition)
            }))
        }
    }
    load_preset_canvas_crosshair(preset_crosshair_definition) {
        var crosshair_definition = JSON.parse(JSON.stringify(preset_crosshair_definition));
        this.initialize(this.zoom, crosshair_definition, this.engine_variable, "block");
        updateEngineCrosshairDefinition(this.engine_variable, crosshair_definition)
    }
    initializeCrosshairPasteInput() {
        let editorContainer = this.container.querySelector(".settings_screen_crosshair_subsection_container");
        let inputContainer = this.container.querySelector(".canvas_crosshair_paste_input_container");
        _empty(inputContainer);
        let inputPasteTemplate = window.jsrender.templates(_id("canvas_crosshair_paste_input_template").textContent);
        _html(inputContainer, inputPasteTemplate.render({}, {
            localize: localize
        }));
        inputContainer.style.display = "none";
        let confirmButton = inputContainer.querySelector(".crosshair_paste_input_confirm");
        let cancelButton = inputContainer.querySelector(".crosshair_paste_input_cancel");
        let input = inputContainer.querySelector(".crosshair_paste_input");
        input.dataset.valid = "false";
        let inputValue;
        let new_crosshair_definition;
        let inputPasteWarning = inputContainer.querySelector(".crosshair_paste_input_warning");
        inputPasteWarning.style.display = "none";
        input.addEventListener("input", (e => {
            e.target.value = e.target.value.trimStart();
            inputValue = e.target.value;
            if (_isValidJSON(inputValue)) {
                let fullInputDefinition = generateFullCrosshairDefinition(inputValue);
                if (isValidCrosshairDefinition(fullInputDefinition)) {
                    new_crosshair_definition = fullInputDefinition;
                    this.updateCrosshairPreview(new_crosshair_definition);
                    input.dataset.valid = "true";
                    inputPasteWarning.style.display = "none"
                } else {
                    this.updateCrosshairPreview(this.crosshair_definition);
                    input.dataset.valid = "false";
                    inputPasteWarning.style.display = "block"
                }
            } else {
                this.updateCrosshairPreview(this.crosshair_definition);
                input.dataset.valid = "false";
                inputPasteWarning.style.display = "block"
            }
        }));
        input.addEventListener("dblclick", (function() {
            this.setSelectionRange(0, this.value.length)
        }));
        confirmButton.addEventListener("click", (() => {
            if (input.dataset.valid == "true") {
                this.initialize(this.zoom, new_crosshair_definition, this.engine_variable, "none");
                updateEngineCrosshairDefinition(this.engine_variable, new_crosshair_definition)
            }
        }));
        cancelButton.addEventListener("click", (() => {
            inputContainer.style.display = "none";
            editorContainer.style.display = "block";
            this.updateCrosshairPreview(this.crosshair_definition);
            input.dataset.valid = "false";
            input.value = "";
            inputPasteWarning.style.display = "none"
        }))
    }
    updateCrosshairPreview(crosshair_definition) {
        drawCrosshair(crosshair_definition, "", this.ctxCrosshairPreviewMap.default, this.ctxCrosshairPreviewMap.hit);
        if (this.engine_variable.endsWith(":0")) {
            this.ctxCrosshairPreviewMap.menu.clearRect(0, 0, this.ctxCrosshairPreviewMap.menu.canvas.width, this.ctxCrosshairPreviewMap.menu.canvas.height);
            this.ctxCrosshairPreviewMap.menu.beginPath();
            this.ctxCrosshairPreviewMap.menu.drawImage(this.canvasCrosshairPreviewMap.default, 0, 0)
        }
    }
    initialize_saved_crosshairs() {
        const saved_container = this.container.querySelector(".crosshair_saved_preset_container");
        _empty(saved_container);
        for (let i = 0; i < savedCrosshairStrings.length; i++) {
            if (savedCrosshairStrings[i] === "{}") {
                continue
            }
            let current_crosshair_definition = generateFullCrosshairDefinition(savedCrosshairStrings[i]);
            if (current_crosshair_definition && Object.keys(current_crosshair_definition).length === 0 && current_crosshair_definition.constructor === Object) {
                continue
            }
            if (current_crosshair_definition) {
                cleanCrosshairDefinition(current_crosshair_definition);
                scaleCrosshairDefinition(current_crosshair_definition);
                let new_div = _createElement("div", "crosshair-preset");
                let optionCanvas = document.createElement("canvas");
                let optionCanvasSize = Math.ceil(.05 * window.innerHeight);
                optionCanvas.width = optionCanvasSize;
                optionCanvas.height = optionCanvasSize;
                let ctx = optionCanvas.getContext("2d");
                ctx.translate(optionCanvasSize / 2, optionCanvasSize / 2);
                drawCrosshair(current_crosshair_definition, ctx);
                new_div.appendChild(optionCanvas);
                let delete_button = _createElement("div", "delete-button", "X");
                new_div.appendChild(delete_button);
                saved_container.appendChild(new_div);
                new_div.addEventListener("click", (() => {
                    this.load_preset_canvas_crosshair(current_crosshair_definition)
                }));
                delete_button.addEventListener("click", (event => {
                    this.deleteSavedCrosshair(i);
                    event.stopPropagation()
                }));
                delete_button.addEventListener("mouseover", (function(event) {
                    event.stopPropagation()
                }));
                delete_button.addEventListener("mouseout", (function() {}))
            }
        }
        if (saved_container.childElementCount < savedCrosshairStrings.length) {
            let save_button = _createElement("div", ["crosshair-preset", "save-button", "i18n"], localize("menu_button_save"));
            save_button.dataset.i18n = "menu_button_save";
            save_button.addEventListener("click", (() => {
                this.saveCurrentCrosshair()
            }));
            saved_container.appendChild(save_button)
        }
    }
    reinitializeCrosshairOptions(parent, layer, type) {
        var layer_definition = {};
        layer_definition.type = type;
        _for_each_with_class_in_parent(parent, "checkbox", (el => {
            var val = el.dataset.default;
            if (this.crosshair_definition.hasOwnProperty(layer)) {
                if (this.crosshair_definition[layer].hasOwnProperty(el.dataset.key)) {
                    val = this.crosshair_definition[layer][el.dataset.key];
                    let validCheckbox = val == 0 || val == 1;
                    if (!validCheckbox) {
                        val = el.dataset.default
                    }
                }
            }
            el.dataset.enabled = val;
            this.updateCrosshairCheckbox(el);
            layer_definition[el.dataset.key] = val;
            let parent = el.closest(".crosshair_setting");
            if (parent) {
                parent.addEventListener("click", (e => {
                    e.stopPropagation();
                    _toggle_checkbox_from_parent(el, true);
                    this.updateCrosshairDefinitionValue(layer, el.dataset.key, el.dataset.enabled, this.crosshair_definition);
                    this.updateCrosshairPreview(this.crosshair_definition);
                    updateEngineCrosshairDefinition(this.engine_variable, this.crosshair_definition)
                }))
            }
            el.addEventListener("click", (e => {
                e.stopPropagation();
                if (el.classList.contains("disabled")) return;
                if (el.dataset.enabled == 1) {
                    el.dataset.enabled = 0;
                    el.classList.remove("checkbox_enabled");
                    el.firstElementChild.classList.remove("inner_checkbox_enabled");
                    engine.call("ui_sound", "ui_uncheck_box")
                } else {
                    el.dataset.enabled = 1;
                    el.classList.add("checkbox_enabled");
                    el.firstElementChild.classList.add("inner_checkbox_enabled");
                    engine.call("ui_sound", "ui_check_box")
                }
                this.updateCrosshairDefinitionValue(layer, el.dataset.key, el.dataset.enabled, this.crosshair_definition);
                this.updateCrosshairPreview(this.crosshair_definition);
                updateEngineCrosshairDefinition(this.engine_variable, this.crosshair_definition)
            }))
        }));
        _for_each_with_class_in_parent(parent, "jscolor", (el => {
            var val = el.dataset.default;
            if (this.crosshair_definition.hasOwnProperty(layer)) {
                if (this.crosshair_definition[layer].hasOwnProperty(el.dataset.key)) {
                    val = this.crosshair_definition[layer][el.dataset.key];
                    if (typeof val != "string") {
                        val = el.dataset.default
                    }
                }
            }
            var opts = {
                value: val
            };
            var picker = new jscolor(el, opts, null, true);
            picker.onFineChange = () => {
                this.updateCrosshairDefinitionValue(layer, el.dataset.key, el.value, this.crosshair_definition);
                this.updateCrosshairPreview(this.crosshair_definition)
            };
            el.onchange = () => {
                this.updateCrosshairDefinitionValue(layer, el.dataset.key, el.value, this.crosshair_definition);
                updateEngineCrosshairDefinition(this.engine_variable, this.crosshair_definition)
            };
            el.addEventListener("keydown", (function(e) {
                e.stopPropagation()
            }));
            layer_definition[el.dataset.key] = el.value
        }));
        _for_each_with_class_in_parent(parent, "range-slider", (el => {
            var val = el.dataset.default;
            if (this.crosshair_definition.hasOwnProperty(layer)) {
                if (this.crosshair_definition[layer].hasOwnProperty(el.dataset.key)) {
                    val = parseInt(this.crosshair_definition[layer][el.dataset.key]);
                    if (isNaN(val)) {
                        val = el.dataset.default
                    }
                    if (val > parseInt(el.dataset.max) * Math.ceil(this.crosshair_definition.designVh / window.innerHeight)) {
                        val = parseInt(el.dataset.max) * Math.ceil(this.crosshair_definition.designVh / window.innerHeight)
                    }
                    if (val < parseInt(el.dataset.min)) {
                        val = parseInt(el.dataset.min)
                    }
                }
            }
            layer_definition[el.dataset.key] = val;
            var slider = new rangeSlider(el, false, (() => {
                var inputValue = parseInt(el.dataset.value);
                if (inputValue > parseInt(el.dataset.max)) {
                    slider.setValue(el.dataset.max)
                }
                if (inputValue < parseInt(el.dataset.min)) {
                    slider.setValue(el.dataset.min)
                }
                this.updateCrosshairDefinitionValue(layer, el.dataset.key, el.dataset.value, this.crosshair_definition);
                this.updateCrosshairPreview(this.crosshair_definition);
                updateEngineCrosshairDefinition(this.engine_variable, this.crosshair_definition);
                this.crosshairCreatorWarning(el.dataset.key, layer, this.crosshair_definition)
            }), (() => {
                this.updateCrosshairDefinitionValue(layer, el.dataset.key, el.dataset.value, this.crosshair_definition);
                this.updateCrosshairPreview(this.crosshair_definition);
                this.crosshairCreatorWarning(el.dataset.key, layer, this.crosshair_definition)
            }));
            slider.setValue(val)
        }));
        _for_each_with_class_in_parent(parent, "select-field", (el => {
            _empty(el);
            var val = el.dataset.default;
            if (this.crosshair_definition.hasOwnProperty(layer)) {
                if (this.crosshair_definition[layer].hasOwnProperty(el.dataset.key)) {
                    val = this.crosshair_definition[layer][el.dataset.key];
                    let validSelect = el.dataset.opts.split(",").map((function(o) {
                        return o.toLowerCase()
                    })).includes(val);
                    if (!validSelect) {
                        val = el.dataset.default
                    }
                }
            }
            layer_definition[el.dataset.key] = val;
            el.dataset.opts.split(",").forEach((function(type) {
                let opt = _createElement("div");
                opt.dataset.value = type.toLowerCase();
                opt.textContent = localize("settings_crosshair_option_" + type.toLowerCase());
                if (opt.dataset.value == val) {
                    opt.dataset.selected = 1
                }
                el.appendChild(opt)
            }));
            ui_setup_select(el, ((opt, field) => {
                this.updateCrosshairDefinitionValue(layer, el.dataset.key, field.dataset.value, this.crosshair_definition);
                this.updateCrosshairPreview(this.crosshair_definition);
                updateEngineCrosshairDefinition(this.engine_variable, this.crosshair_definition);
                this.crosshairCreatorWarning(el.dataset.key, layer, this.crosshair_definition)
            }))
        }));
        _for_each_with_class_in_parent(parent, "tooltip2", (function(el) {
            add_tooltip2_listeners(el)
        }));
        this.crosshair_definition[layer] = layer_definition;
        _for_each_with_class_in_parent(parent, "range-slider", (el => {
            this.crosshairCreatorWarning(el.dataset.key, layer, this.crosshair_definition)
        }))
    }
    updateCrosshairCheckbox(el) {
        if (el.dataset.enabled == 0) {
            el.classList.remove("checkbox_enabled");
            el.firstElementChild.classList.remove("inner_checkbox_enabled")
        } else {
            el.classList.add("checkbox_enabled");
            el.firstElementChild.classList.add("inner_checkbox_enabled")
        }
    }
    updateCrosshairDefinitionValue(layer, key, value, crosshair_definition) {
        crosshair_definition[layer][key] = value;
        this.removeCrosshairScaleWarning()
    }
    crosshairCreatorWarning(key, layer, crosshair_definition) {
        if (key == "crThi" || key == "crRot") {
            let warningEl = this.container.querySelector(".canvas_crosshair_" + layer + "_cross_thickness_warning");
            if (crosshair_definition[layer].crThi % 2 == 1 && crosshair_definition[layer].crRot == 0) {
                warningEl.style.display = "block"
            } else {
                warningEl.style.display = "none"
            }
        } else if (key == "dTyp" || key == "dThi" || key == "dRot") {
            let warningEl = this.container.querySelector(".canvas_crosshair_" + layer + "_dot_thickness_warning");
            if (crosshair_definition[layer].dThi % 2 == 1 && crosshair_definition[layer].dTyp == "square" && crosshair_definition[layer].dRot == 0) {
                warningEl.style.display = "block"
            } else {
                warningEl.style.display = "none"
            }
        } else if (key == "ciSeg" || key == "ciGap") {
            let warningEl = this.container.querySelector(".canvas_crosshair_" + layer + "_circle_segments_warning");
            if (crosshair_definition[layer].ciSeg != 1 && crosshair_definition[layer].ciGap == 0) {
                warningEl.style.display = "block"
            } else {
                warningEl.style.display = "none"
            }
        } else if (key == "poThi" || key == "poLen") {
            let warningEl = this.container.querySelector(".canvas_crosshair_" + layer + "_pointer_thickness_warning");
            if (parseInt(crosshair_definition[layer].poThi) > parseInt(crosshair_definition[layer].poLen)) {
                warningEl.style.display = "block"
            } else {
                warningEl.style.display = "none"
            }
        }
    }
    scaleCrosshairToRes() {
        scaleCrosshairDefinition(this.crosshair_definition);
        this.initialize(this.zoom, this.crosshair_definition, this.engine_variable, "block");
        updateEngineCrosshairDefinition(this.engine_variable, this.crosshair_definition)
    }
    removeCrosshairScaleWarning() {
        this.crosshair_definition.designVh = window.innerHeight;
        let scaleWarning = this.container.querySelector(".crosshair_canvas_preview_scale_warning");
        scaleWarning.style.display = "none"
    }
    saveCurrentCrosshair() {
        if (savedCrosshairStrings.indexOf("{}") != -1) {
            const free_index = savedCrosshairStrings.indexOf("{}");
            const engine_variable_saved = "hud_saved_crosshair_definition:" + free_index;
            let crosshair_string = generateShortCrosshairString(this.crosshair_definition);
            update_variable("string", engine_variable_saved, crosshair_string, false);
            console.log("saved to engine_variable: " + engine_variable_saved)
        } else {
            console.log("No available save slots")
        }
    }
    deleteSavedCrosshair(index) {
        savedCrosshairStrings[index] = "{}";
        console.log("DELETE: saved crosshairs array index " + index + " = " + savedCrosshairStrings[index]);
        cleanSavedCrosshairArray();
        console.log("POST CLEAN: saved crosshairs array index " + index + " = " + savedCrosshairStrings[index]);
        this.initialize_saved_crosshairs()
    }
    copyCrosshairDefinition() {
        let copy_string = generateShortCrosshairString(this.crosshair_definition);
        engine.call("copy_text", copy_string)
    }
    openCrosshairPasteInput() {
        let inputContainer = this.container.querySelector(".canvas_crosshair_paste_input_container");
        inputContainer.style.display = "block";
        let editorContainer = this.container.querySelector(".settings_screen_crosshair_subsection_container");
        editorContainer.style.display = "none";
        let input = inputContainer.querySelector(".crosshair_paste_input");
        input.focus()
    }
    closeCrosshairEditorScreen() {
        let inputContainer = this.container.querySelector(".canvas_crosshair_paste_input_container");
        let editorContainer = this.container.querySelector(".settings_screen_crosshair_subsection_container");
        let input = inputContainer.querySelector(".crosshair_paste_input");
        let inputPasteWarning = inputContainer.querySelector(".crosshair_paste_input_warning");
        inputContainer.style.display = "none";
        editorContainer.style.display = "block";
        input.dataset.valid = "false";
        input.value = "";
        inputPasteWarning.style.display = "none";
        close_modal_screen_by_selector(this.container.id);
        this.updateCrosshairPreview(this.crosshair_definition)
    }
}

function isValidCrosshairDefinition(obj) {
    for (let layer of crosshairLayers) {
        if (!obj.hasOwnProperty(layer)) {
            return false
        }
    }
    if (!obj.hasOwnProperty("designVh")) {
        obj.designVh == window.innerHeight
    } else if (isNaN(parseInt(obj.designVh))) {
        obj.designVh = window.innerHeight
    } else if (obj.designVh <= 0) {
        obj.designVh = window.innerHeight
    }
    return true
}

function cleanCrosshairDefinition(obj) {
    for (let layer of crosshairLayers) {
        if (!obj.hasOwnProperty(layer)) {
            if (layer == "layer1") {
                obj[layer] = {
                    type: "cross",
                    crTop: "1",
                    crRig: "1",
                    crBot: "1",
                    crLef: "1",
                    crHCE: "0",
                    crCol: "FFFFFF",
                    crOCo: "000000",
                    crHCo: "FF0000",
                    crLen: "8",
                    crThi: "2",
                    crGap: "4",
                    crRot: "0",
                    crOTh: "1"
                }
            } else {
                obj[layer] = {
                    type: "none"
                }
            }
        }
    }
    if (!obj.hasOwnProperty("designVh")) {
        obj.designVh = window.innerHeight
    } else if (isNaN(parseInt(obj.designVh))) {
        obj.designVh = window.innerHeight
    } else if (obj.designVh <= 0) {
        obj.designVh = window.innerHeight
    }
    return obj
}

function clearCross(ctxCross) {
    ctxCross.clearRect(-1 * (ctxCross.canvas.width / 2), -1 * (ctxCross.canvas.height / 2), ctxCross.canvas.width, ctxCross.canvas.height);
    ctxCross.beginPath()
}

function scaleCrosshairDefinition(crosshair_definition) {
    if (parseInt(crosshair_definition.designVh) != window.innerHeight) {
        const scaleFactor = window.innerHeight / parseInt(crosshair_definition.designVh);
        for (let layer of crosshairLayers) {
            if (crosshair_definition[layer].type == "cross") {
                let scaleableKeys = ["crLen", "crThi", "crGap", "crOTh"];
                for (let key of scaleableKeys) {
                    scaleCrosshairValue(crosshair_definition, layer, key, scaleFactor)
                }
            } else if (crosshair_definition[layer].type == "circle") {
                let scaleableKeys = ["ciRad", "ciThi", "ciOTh"];
                for (let key of scaleableKeys) {
                    scaleCrosshairValue(crosshair_definition, layer, key, scaleFactor)
                }
            } else if (crosshair_definition[layer].type == "dot") {
                let scaleableKeys = ["dThi", "dOTh"];
                for (let key of scaleableKeys) {
                    scaleCrosshairValue(crosshair_definition, layer, key, scaleFactor)
                }
            } else if (crosshair_definition[layer].type == "pointer") {
                let scaleableKeys = ["poLen", "poThi", "poGap", "poOth"];
                for (let key of scaleableKeys) {
                    scaleCrosshairValue(crosshair_definition, layer, key, scaleFactor)
                }
            }
        }
        crosshair_definition.designVh = window.innerHeight
    }
}

function scaleCrosshairValue(crosshair_definition, layer, key, scaleFactor) {
    if (crosshair_definition[layer].crThi % 2 == 0 && crosshair_definition[layer].crRot == 0 || crosshair_definition[layer].dThi % 2 == 0 && crosshair_definition[layer].dTyp == "square" && crosshair_definition[layer].dRot == 0) {
        crosshair_definition[layer][key] = 2 * Math.ceil(parseInt(crosshair_definition[layer][key]) * scaleFactor / 2)
    } else {
        crosshair_definition[layer][key] = Math.ceil(parseInt(crosshair_definition[layer][key]) * scaleFactor)
    }
}

function generateShortCrosshairString(cross_def) {
    if (typeof cross_def == "string") {
        var crosshair_definition = JSON.parse(cross_def)
    } else {
        var crosshair_definition = cross_def
    }
    let short_definition = {};
    let layer_name_map = {
        layer1: "1",
        layer2: "2",
        layer3: "3"
    };
    let cross_type_index_map = ["type", "crTop", "crRig", "crBot", "crLef", "crHCE", "crCol", "crOCo", "crHCo", "crLen", "crThi", "crGap", "crRot", "crOTh", "crOSt"];
    let circle_type_index_map = ["type", "ciHCE", "ciCol", "ciOCo", "ciHCo", "ciSeg", "ciRad", "ciThi", "ciGap", "ciRot", "ciOTh", "ciOSt"];
    let dot_type_index_map = ["type", "dHCE", "dCol", "dOCo", "dHCo", "dThi", "dOTh", "dTyp", "dOSt", "dRot"];
    let pointer_type_index_map = ["type", "poTL", "poTR", "poBR", "poBL", "poHCE", "poCol", "poOCo", "poHCo", "poLen", "poThi", "poGap", "poRot", "poOTh", "poOSt"];
    for (let layer of crosshairLayers) {
        if (crosshair_definition.hasOwnProperty(layer)) {
            let layerArr = [];
            let type_index_map = ["type"];
            if (crosshair_definition[layer].type == "cross") {
                type_index_map = cross_type_index_map
            } else if (crosshair_definition[layer].type == "circle") {
                type_index_map = circle_type_index_map
            } else if (crosshair_definition[layer].type == "dot") {
                type_index_map = dot_type_index_map
            } else if (crosshair_definition[layer].type == "pointer") {
                type_index_map = pointer_type_index_map
            }
            for (let i = 0; i <= type_index_map.length; i++) {
                if (crosshair_definition[layer].hasOwnProperty(type_index_map[i])) {
                    layerArr[i] = crosshair_definition[layer][type_index_map[i]]
                }
            }
            short_definition[layer_name_map[layer]] = layerArr
        }
        if (crosshair_definition.hasOwnProperty("designVh")) {
            short_definition["d"] = crosshair_definition.designVh
        }
    }
    let short_string = JSON.stringify(short_definition);
    return short_string
}

function generateFullCrosshairDefinition(short_string) {
    try {
        var short_definition = JSON.parse(short_string)
    } catch (e) {
        var short_definition = {}
    }
    let full_definition = {};
    let layer_name_map = {
        layer1: "1",
        layer2: "2",
        layer3: "3"
    };
    let cross_type_index_map = ["type", "crTop", "crRig", "crBot", "crLef", "crHCE", "crCol", "crOCo", "crHCo", "crLen", "crThi", "crGap", "crRot", "crOTh", "crOSt"];
    let circle_type_index_map = ["type", "ciHCE", "ciCol", "ciOCo", "ciHCo", "ciSeg", "ciRad", "ciThi", "ciGap", "ciRot", "ciOTh", "ciOSt"];
    let dot_type_index_map = ["type", "dHCE", "dCol", "dOCo", "dHCo", "dThi", "dOTh", "dTyp", "dOSt", "dRot"];
    let pointer_type_index_map = ["type", "poTL", "poTR", "poBR", "poBL", "poHCE", "poCol", "poOCo", "poHCo", "poLen", "poThi", "poGap", "poRot", "poOTh", "poOSt"];
    for (let layer of crosshairLayers) {
        if (short_definition.hasOwnProperty(layer_name_map[layer])) {
            let layerObj = {};
            let type_index_map = ["type"];
            if (short_definition[layer_name_map[layer]][0] == "cross") type_index_map = cross_type_index_map;
            else if (short_definition[layer_name_map[layer]][0] == "circle") type_index_map = circle_type_index_map;
            else if (short_definition[layer_name_map[layer]][0] == "dot") type_index_map = dot_type_index_map;
            else if (short_definition[layer_name_map[layer]][0] == "pointer") type_index_map = pointer_type_index_map;
            if (!Array.isArray(short_definition[layer_name_map[layer]])) {
                layerObj = {
                    type: "none"
                }
            } else {
                for (let i = 0; i <= short_definition[layer_name_map[layer]].length; i++) {
                    layerObj[type_index_map[i]] = short_definition[layer_name_map[layer]][i]
                }
            }
            full_definition[layer] = layerObj
        }
    }
    if (short_definition.hasOwnProperty("d")) {
        full_definition["designVh"] = short_definition.d
    }
    return full_definition
}

function updateEngineCrosshairDefinition(engine_variable, crosshair_definition) {
    var crosshair_string = generateShortCrosshairString(crosshair_definition);
    if (engine_variable.startsWith("hud_zoom_crosshair_definition")) {
        let parts = engine_variable.split(":");
        if (parts.length > 1) {
            let weapon_id = parseInt(parts[1]);
            let sniper_zoom_indexes = GAME.get_data("sniper_zoom_indexes");
            if (sniper_zoom_indexes && sniper_zoom_indexes.includes(weapon_id)) {
                for (let id of sniper_zoom_indexes) {
                    if (id === weapon_id) continue;
                    engine.call("set_string_variable", "hud_zoom_crosshair_definition" + id, crosshair_string)
                }
            }
        }
    }
    engine.call("set_string_variable", engine_variable, crosshair_string)
}

function drawCrosshair(crosshair_definition, target, ctxCross, ctxHitCross) {
    var drawHitCross = true;
    if (target instanceof CanvasRenderingContext2D) {
        var ctxCross = target;
        drawHitCross = false
    } else if (target == "logicalDefault" || target == "logicalHit") {
        var ctxCross = "returnString";
        var ctxHitCross = "returnString"
    } else if (ctxCross && ctxHitCross) {} else {
        console.log("drawCrosshair - undefined behaviour")
    }
    if (ctxCross != "returnString") clearCross(ctxCross);
    if (drawHitCross && ctxHitCross != "returnString") clearCross(ctxHitCross);
    var crosshairInstructionString = "<svg width='" + canvasCrosshairSize + "px' height='" + canvasCrosshairSize + "px' viewBox='" + canvasCrosshairSize / -2 + " " + canvasCrosshairSize / -2 + " " + canvasCrosshairSize + " " + canvasCrosshairSize + "'>\n";
    var hitCrosshairInstructionString = "<svg width='" + canvasCrosshairSize + "px' height='" + canvasCrosshairSize + "px' viewBox='" + canvasCrosshairSize / -2 + " " + canvasCrosshairSize / -2 + " " + canvasCrosshairSize + " " + canvasCrosshairSize + "'>\n";
    var usesHitColor = false;
    var linesArray = [];
    var adaptiveOutlinesArray = [];
    var hitLinesArray = [];
    var adaptiveHitOutlinesArray = [];
    for (let layer of crosshairLayers) {
        if (crosshair_definition[layer].type == "cross") {
            var gap = validatedParseInt(crosshair_definition[layer].crGap, 4);
            var length = validatedParseInt(crosshair_definition[layer].crLen, 8);
            var thickness = validatedParseInt(crosshair_definition[layer].crThi, 2);
            var color = "#" + crosshair_definition[layer].crCol;
            var outlineColor = "#" + crosshair_definition[layer].crOCo;
            var outlineThickness = validatedParseInt(crosshair_definition[layer].crOTh, 1);
            var rotation = validatedParseInt(crosshair_definition[layer].crRot, 0);
            var outlineStyle = crosshair_definition[layer].crOSt;
            var enabledSides = {
                top: crosshair_definition[layer].crTop,
                right: crosshair_definition[layer].crRig,
                bottom: crosshair_definition[layer].crBot,
                left: crosshair_definition[layer].crLef
            };
            var hitColorEnabled = crosshair_definition[layer].crHCE;
            var hitColor = "#" + (hitColorEnabled == 1 ? crosshair_definition[layer].crHCo : crosshair_definition[layer].crCol);
            if (hitColorEnabled == 1) {
                usesHitColor = true
            }
            var outlinesArray = outlineStyle == "persistent" ? linesArray : adaptiveOutlinesArray;
            var hitOutlinesArray = outlineStyle == "persistent" ? hitLinesArray : adaptiveHitOutlinesArray;
            linesArray.push(drawRectangles.bind(null, ctxCross, enabledSides, gap, length, thickness, color, outlineThickness, rotation, 0));
            outlinesArray.push(drawRectangles.bind(null, ctxCross, enabledSides, gap, length, thickness, outlineColor, outlineThickness, rotation, 1));
            if (drawHitCross) {
                hitLinesArray.push(drawRectangles.bind(null, ctxHitCross, enabledSides, gap, length, thickness, hitColor, outlineThickness, rotation, 0));
                hitOutlinesArray.push(drawRectangles.bind(null, ctxHitCross, enabledSides, gap, length, thickness, outlineColor, outlineThickness, rotation, 1))
            }
        } else if (crosshair_definition[layer].type == "circle") {
            var circleRadius = validatedParseInt(crosshair_definition[layer].ciRad, 18);
            var circleThickness = validatedParseInt(crosshair_definition[layer].ciThi, 2);
            var circleGapAngle = validatedParseInt(crosshair_definition[layer].ciGap, 20);
            var circleOutlineThickness = validatedParseInt(crosshair_definition[layer].ciOTh, 1);
            var circleColor = "#" + crosshair_definition[layer].ciCol;
            var circleOutlineColor = "#" + crosshair_definition[layer].ciOCo;
            var circleRotation = validatedParseInt(crosshair_definition[layer].ciRot, 0);
            var outlineStyle = crosshair_definition[layer].ciOSt;
            var segments = validatedParseInt(crosshair_definition[layer].ciSeg, 4);
            if (segments > 8) {
                segments = 8
            }
            var hitColorEnabled = crosshair_definition[layer].ciHCE;
            var hitColor = "#" + (hitColorEnabled == 1 ? crosshair_definition[layer].ciHCo : crosshair_definition[layer].ciCol);
            if (hitColorEnabled == 1) {
                usesHitColor = true
            }
            var outlinesArray = outlineStyle == "persistent" ? linesArray : adaptiveOutlinesArray;
            var hitOutlinesArray = outlineStyle == "persistent" ? hitLinesArray : adaptiveHitOutlinesArray;
            linesArray.push(drawArcs.bind(null, ctxCross, segments, circleRadius, circleThickness, circleOutlineThickness, circleColor, circleGapAngle, circleRotation, 0));
            outlinesArray.push(drawArcs.bind(null, ctxCross, segments, circleRadius, circleThickness, circleOutlineThickness, circleOutlineColor, circleGapAngle, circleRotation, 1));
            if (drawHitCross) {
                hitLinesArray.push(drawArcs.bind(null, ctxHitCross, segments, circleRadius, circleThickness, circleOutlineThickness, hitColor, circleGapAngle, circleRotation, 0));
                hitOutlinesArray.push(drawArcs.bind(null, ctxHitCross, segments, circleRadius, circleThickness, circleOutlineThickness, circleOutlineColor, circleGapAngle, circleRotation, 1))
            }
        } else if (crosshair_definition[layer].type == "dot") {
            var dotType = crosshair_definition[layer].dTyp;
            var dotThickness = validatedParseInt(crosshair_definition[layer].dThi, 2);
            var outlineStyle = crosshair_definition[layer].dOSt;
            var dotOutlineThickness = validatedParseInt(crosshair_definition[layer].dOTh, 1);
            var dotRotation = validatedParseInt(crosshair_definition[layer].dRot, 0);
            var dotColor = "#" + crosshair_definition[layer].dCol;
            var dotOutlineColor = "#" + crosshair_definition[layer].dOCo;
            var hitColorEnabled = crosshair_definition[layer].dHCE;
            var hitColor = "#" + (hitColorEnabled == 1 ? crosshair_definition[layer].dHCo : crosshair_definition[layer].dCol);
            if (hitColorEnabled == 1) {
                usesHitColor = true
            }
            var outlinesArray = outlineStyle == "persistent" ? linesArray : adaptiveOutlinesArray;
            var hitOutlinesArray = outlineStyle == "persistent" ? hitLinesArray : adaptiveHitOutlinesArray;
            linesArray.push(drawDot.bind(null, ctxCross, dotType, dotThickness, dotOutlineThickness, dotRotation, dotColor, 0));
            outlinesArray.push(drawDot.bind(null, ctxCross, dotType, dotThickness, dotOutlineThickness, dotRotation, dotOutlineColor, 1));
            if (drawHitCross) {
                hitLinesArray.push(drawDot.bind(null, ctxHitCross, dotType, dotThickness, dotOutlineThickness, dotRotation, hitColor, 0));
                hitOutlinesArray.push(drawDot.bind(null, ctxHitCross, dotType, dotThickness, dotOutlineThickness, dotRotation, dotOutlineColor, 1))
            }
        } else if (crosshair_definition[layer].type == "pointer") {
            var gap = validatedParseInt(crosshair_definition[layer].poGap, 0);
            var length = validatedParseInt(crosshair_definition[layer].poLen, 12);
            var thickness = validatedParseInt(crosshair_definition[layer].poThi, 2);
            var color = "#" + crosshair_definition[layer].poCol;
            var outlineColor = "#" + crosshair_definition[layer].poOCo;
            var outlineThickness = validatedParseInt(crosshair_definition[layer].poOTh, 1);
            var rotation = validatedParseInt(crosshair_definition[layer].poRot, 0);
            var outlineStyle = crosshair_definition[layer].poOSt;
            var enabledSides = {
                topleft: crosshair_definition[layer].poTL,
                topright: crosshair_definition[layer].poTR,
                bottomright: crosshair_definition[layer].poBR,
                bottomleft: crosshair_definition[layer].poBL
            };
            var hitColorEnabled = crosshair_definition[layer].poHCE;
            var hitColor = "#" + (hitColorEnabled == 1 ? crosshair_definition[layer].poHCo : crosshair_definition[layer].poCol);
            if (hitColorEnabled == 1) {
                usesHitColor = true
            }
            var outlinesArray = outlineStyle == "persistent" ? linesArray : adaptiveOutlinesArray;
            var hitOutlinesArray = outlineStyle == "persistent" ? hitLinesArray : adaptiveHitOutlinesArray;
            linesArray.push(drawPointers.bind(null, ctxCross, enabledSides, length, thickness, outlineThickness, color, gap, rotation, 0));
            outlinesArray.push(drawPointers.bind(null, ctxCross, enabledSides, length, thickness, outlineThickness, outlineColor, gap, rotation, 1));
            if (drawHitCross) {
                hitLinesArray.push(drawPointers.bind(null, ctxHitCross, enabledSides, length, thickness, outlineThickness, hitColor, gap, rotation, 0));
                hitOutlinesArray.push(drawPointers.bind(null, ctxHitCross, enabledSides, length, thickness, outlineThickness, outlineColor, gap, rotation, 1))
            }
        }
    }
    if (adaptiveOutlinesArray.length > 0) {
        for (let i = adaptiveOutlinesArray.length - 1; i >= 0; i--) {
            crosshairInstructionString += adaptiveOutlinesArray[i].call();
            if (drawHitCross) {
                hitCrosshairInstructionString += adaptiveHitOutlinesArray[i].call()
            }
        }
    }
    for (let i = linesArray.length - 1; i >= 0; i--) {
        crosshairInstructionString += linesArray[i].call();
        if (drawHitCross) {
            hitCrosshairInstructionString += hitLinesArray[i].call()
        }
    }

    function validatedParseInt(input, defVal) {
        if (isNaN(parseInt(input))) {
            return defVal
        } else {
            return parseInt(input)
        }
    }
    if (target == "logicalDefault") {
        crosshairInstructionString += "</svg>";
        return crosshairInstructionString
    } else if (target == "logicalHit") {
        hitCrosshairInstructionString += "</svg>";
        if (!usesHitColor) {
            hitCrosshairInstructionString = ""
        }
        return hitCrosshairInstructionString
    }
}

function drawRectangles(ctxCross, enabledSides, gap, length, thickness, color, outlineThickness, rotation, outline) {
    let instructionString = "";
    if (ctxCross !== "returnString") {
        ctxCross.fillStyle = color;
        ctxCross.save();
        ctxCross.rotate(Math.PI / 180 * rotation)
    } else {
        instructionString += "<g fill='" + color.substring(0, 7);
        if (color.length > 7) {
            var opacity = parseInt(color.substring(7, 9), 16) / 255;
            instructionString += "' fill-opacity='" + opacity
        }
        instructionString += "' transform='rotate(" + rotation + ")'>\n"
    }
    for (var i = 0; i <= 3; i++) {
        if (i == 0) {
            if (enabledSides.left == 0) {
                continue
            }
            var width = length;
            var height = thickness;
            var x = -gap - width;
            var y = -height / 2
        } else if (i == 1) {
            if (enabledSides.top == 0) {
                continue
            }
            var width = thickness;
            var height = length;
            var x = -width / 2;
            var y = -gap - height
        } else if (i == 2) {
            if (enabledSides.right == 0) {
                continue
            }
            var width = length;
            var height = thickness;
            var x = gap;
            var y = -height / 2
        } else {
            if (enabledSides.bottom == 0) {
                continue
            }
            var width = thickness;
            var height = length;
            var x = -width / 2;
            var y = gap
        }
        if (outline == 0) {
            if (ctxCross !== "returnString") {
                ctxCross.beginPath();
                ctxCross.fillRect(x, y, width, height)
            } else {
                instructionString += "<rect x='" + x + "' y='" + y + "' width='" + width + "' height='" + height + "' />\n"
            }
        } else {
            if (ctxCross !== "returnString") {
                ctxCross.beginPath();
                ctxCross.fillRect(x - outlineThickness, y - outlineThickness, width + outlineThickness * 2, outlineThickness);
                ctxCross.fillRect(x - outlineThickness, y + height, width + outlineThickness * 2, outlineThickness);
                ctxCross.fillRect(x - outlineThickness, y, outlineThickness, height);
                ctxCross.fillRect(x + width, y, outlineThickness, height)
            } else {
                instructionString += "<rect x='" + (x - outlineThickness) + "' y='" + (y - outlineThickness) + "' width='" + (width + outlineThickness * 2) + "' height='" + outlineThickness + "' />\n";
                instructionString += "<rect x='" + (x - outlineThickness) + "' y='" + (y + height) + "' width='" + (width + outlineThickness * 2) + "' height='" + outlineThickness + "' />\n";
                instructionString += "<rect x='" + (x - outlineThickness) + "' y='" + y + "' width='" + outlineThickness + "' height='" + height + "' />\n";
                instructionString += "<rect x='" + (x + width) + "' y='" + y + "' width='" + outlineThickness + "' height='" + height + "' />\n"
            }
        }
    }
    if (ctxCross !== "returnString") {
        ctxCross.restore()
    } else {
        instructionString += "</g>\n"
    }
    return instructionString
}

function drawDot(ctxCross, dotType, thickness, outlineThickness, rotation, color, outline) {
    let instructionString = "";
    if (thickness == 0) {
        return
    }
    var fillRule = "nonzero";
    if (ctxCross !== "returnString") {
        ctxCross.fillStyle = color;
        ctxCross.save();
        ctxCross.rotate(Math.PI / 180 * rotation)
    }
    if (ctxCross !== "returnString") {
        ctxCross.beginPath()
    } else {
        instructionString += "<g fill='" + color.substring(0, 7);
        if (color.length > 7) {
            var opacity = parseInt(color.substring(7, 9), 16) / 255;
            instructionString += "' fill-opacity='" + opacity
        }
        instructionString += "' transform='rotate(" + rotation + ")'>\n"
    }
    if (dotType == "round") {
        var x = 0;
        var y = 0;
        if (outline == 0) {
            if (ctxCross !== "returnString") {
                ctxCross.arc(x, y, thickness, 0, 2 * Math.PI)
            } else {
                instructionString += "<path d='" + "M " + x + " " + y + " m " + -1 * thickness + " 0 a " + thickness + " " + thickness + " 0 1 1 " + thickness * 2;
                instructionString += " 0 a " + thickness + " " + thickness + " 0 1 1 " + thickness * -2 + " 0' />\n"
            }
        } else {
            fillRule = "evenodd";
            if (ctxCross !== "returnString") {
                ctxCross.arc(x, y, thickness, 0, 2 * Math.PI);
                ctxCross.moveTo(x + thickness + outlineThickness, y);
                ctxCross.arc(x, y, thickness + outlineThickness, 0, 2 * Math.PI)
            } else {
                instructionString += "<path fill-rule='evenodd' d='" + "M " + x + " " + y + " m " + -1 * thickness + " 0 a " + thickness + " " + thickness + " 0 1 1 " + thickness * 2;
                instructionString += " 0 a " + thickness + " " + thickness + " 0 1 1 " + thickness * -2 + " 0z ";
                instructionString += "M " + x + " " + y + " m " + -1 * (thickness + outlineThickness) + " 0 a " + (thickness + outlineThickness) + " " + (thickness + outlineThickness) + " 0 1 1 " + (thickness + outlineThickness) * 2;
                instructionString += " 0 a " + (thickness + outlineThickness) + " " + (thickness + outlineThickness) + " 0 1 1 " + (thickness + outlineThickness) * -2 + " 0z' />\n"
            }
        }
    } else {
        if (rotation == 0) {
            var x = 0 - Math.ceil(thickness / 2);
            var y = 0 - Math.ceil(thickness / 2)
        } else {
            var x = -thickness / 2;
            var y = -thickness / 2
        }
        if (outline == 0) {
            if (ctxCross !== "returnString") {
                ctxCross.rect(x, y, thickness, thickness)
            } else {
                instructionString += "<rect x='" + x + "' y='" + y + "' width='" + thickness + "' height='" + thickness + "' />\n"
            }
        } else {
            if (ctxCross !== "returnString") {
                ctxCross.rect(x - outlineThickness, y - outlineThickness, thickness + outlineThickness * 2, outlineThickness);
                ctxCross.rect(x - outlineThickness, y + thickness, thickness + outlineThickness * 2, outlineThickness);
                ctxCross.rect(x - outlineThickness, y, outlineThickness, thickness);
                ctxCross.rect(x + thickness, y, outlineThickness, thickness)
            } else {
                instructionString += "<rect x='" + (x - outlineThickness) + "' y='" + (y - outlineThickness) + "' width='" + (thickness + outlineThickness * 2) + "' height='" + outlineThickness + "' />\n";
                instructionString += "<rect x='" + (x - outlineThickness) + "' y='" + (y + thickness) + "' width='" + (thickness + outlineThickness * 2) + "' height='" + outlineThickness + "' />\n";
                instructionString += "<rect x='" + (x - outlineThickness) + "' y='" + y + "' width='" + outlineThickness + "' height='" + thickness + "' />\n";
                instructionString += "<rect x='" + (x + thickness) + "' y='" + y + "' width='" + outlineThickness + "' height='" + thickness + "' />\n"
            }
        }
    }
    if (ctxCross !== "returnString") {
        ctxCross.fill(fillRule);
        ctxCross.restore()
    } else {
        instructionString += "</g>\n"
    }
    return instructionString
}

function drawArcs(ctxCross, segments, radius, thickness, outlineThickness, color, gapPct, rotation, outline) {
    let instructionString = "";
    if (ctxCross !== "returnString") {
        ctxCross.fillStyle = color;
        ctxCross.save();
        ctxCross.rotate(Math.PI / 180 * rotation - Math.PI / 2)
    } else {
        instructionString += "<g fill='" + color.substring(0, 7);
        if (color.length > 7) {
            var opacity = parseInt(color.substring(7, 9), 16) / 255;
            instructionString += "' fill-opacity='" + opacity
        }
        instructionString += "' transform='rotate(" + (rotation - 90) + ")'>\n"
    }
    if (outlineThickness != 0) {
        outlineThickness += .2
    }
    var x = 0;
    var y = 0;
    radius = Math.max(radius, 0);
    var gapRad = 2 * Math.PI / segments * (gapPct / 100);
    var outlineGapRad = Math.max(gapRad - 2 * outlineThickness / radius, 0);
    if (segments == 1) {
        if (outline == 0) {
            if (ctxCross !== "returnString") {
                ctxCross.beginPath();
                ctxCross.arc(x, y, radius, 0 + gapRad / 2, Math.PI, false);
                ctxCross.arc(x, y, radius + thickness, Math.PI, 0 + gapRad / 2, true);
                ctxCross.closePath();
                ctxCross.fill();
                ctxCross.beginPath();
                ctxCross.arc(x, y, radius, Math.PI, 0 - gapRad / 2, false);
                ctxCross.arc(x, y, radius + thickness, 0 - gapRad / 2, Math.PI, true);
                ctxCross.closePath();
                ctxCross.fill()
            } else {
                let innerP1 = polarToCartesian(x, y, radius, 0 + gapRad / 2);
                let innerP2 = polarToCartesian(x, y, radius, Math.PI);
                let innerP3 = polarToCartesian(x, y, radius + thickness, Math.PI);
                let innerP4 = polarToCartesian(x, y, radius + thickness, 0 + gapRad / 2);
                var largeArcFlag = Math.PI - (0 + gapRad / 2) <= Math.PI ? "0" : "1";
                instructionString += "<path d='" + "M " + innerP1.x + " " + innerP1.y;
                instructionString += " A " + radius + " " + radius + " 0 " + largeArcFlag + " 1 " + innerP2.x + " " + innerP2.y;
                instructionString += " L " + innerP3.x + " " + innerP3.y;
                instructionString += " A " + (radius + thickness) + " " + (radius + thickness) + " 0 " + largeArcFlag + " 0 " + innerP4.x + " " + innerP4.y + "z' />\n";
                let innerP5 = polarToCartesian(x, y, radius, Math.PI);
                let innerP6 = polarToCartesian(x, y, radius, 2 * Math.PI - gapRad / 2);
                let innerP7 = polarToCartesian(x, y, radius + thickness, 2 * Math.PI - gapRad / 2);
                let innerP8 = polarToCartesian(x, y, radius + thickness, Math.PI);
                largeArcFlag = 2 * Math.PI - gapRad / 2 - Math.PI <= Math.PI ? "0" : "1";
                instructionString += "<path d='" + "M " + innerP5.x + " " + innerP5.y;
                instructionString += " A " + radius + " " + radius + " 0 " + largeArcFlag + " 1 " + innerP6.x + " " + innerP6.y;
                instructionString += " L " + innerP7.x + " " + innerP7.y;
                instructionString += " A " + (radius + thickness) + " " + (radius + thickness) + " 0 " + largeArcFlag + " 0 " + innerP8.x + " " + innerP8.y + "z' />\n"
            }
        } else {
            if (ctxCross !== "returnString") {
                ctxCross.beginPath();
                ctxCross.arc(x, y, radius, 0 + gapRad / 2, Math.PI, false);
                ctxCross.arc(x, y, radius + thickness, Math.PI, 0 + gapRad / 2, true);
                ctxCross.closePath();
                ctxCross.moveTo(radius * Math.cos(0 + outlineGapRad / 2), radius * Math.sin(0 + outlineGapRad / 2));
                ctxCross.arc(x, y, Math.max(radius - outlineThickness, 0), 0 + outlineGapRad / 2, Math.PI, false);
                ctxCross.arc(x, y, radius + thickness + outlineThickness, Math.PI, 0 + outlineGapRad / 2, true);
                ctxCross.closePath();
                ctxCross.fill("evenodd");
                ctxCross.beginPath();
                ctxCross.arc(x, y, radius, Math.PI, 0 - gapRad / 2, false);
                ctxCross.arc(x, y, radius + thickness, 0 - gapRad / 2, Math.PI, true);
                ctxCross.closePath();
                ctxCross.moveTo(radius * Math.cos(Math.PI), radius * Math.sin(Math.PI));
                ctxCross.arc(x, y, Math.max(radius - outlineThickness, 0), Math.PI, 0 - outlineGapRad / 2, false);
                ctxCross.arc(x, y, radius + thickness + outlineThickness, 0 - outlineGapRad / 2, Math.PI, true);
                ctxCross.closePath();
                ctxCross.fill("evenodd")
            } else {
                let smallRadius = Math.max(radius - outlineThickness, 0);
                let innerP1 = polarToCartesian(x, y, radius, 0 + gapRad / 2);
                let innerP2 = polarToCartesian(x, y, radius, Math.PI);
                let innerP3 = polarToCartesian(x, y, radius + thickness, Math.PI);
                let innerP4 = polarToCartesian(x, y, radius + thickness, 0 + gapRad / 2);
                let outerP1 = polarToCartesian(x, y, smallRadius, 0 + outlineGapRad / 2);
                let outerP2 = polarToCartesian(x, y, smallRadius, Math.PI);
                let outerP3 = polarToCartesian(x, y, radius + thickness + outlineThickness, Math.PI);
                let outerP4 = polarToCartesian(x, y, radius + thickness + outlineThickness, 0 + outlineGapRad / 2);
                var largeArcFlag = Math.PI - (0 + gapRad / 2) <= Math.PI ? "0" : "1";
                instructionString += "<path fill-rule='evenodd' d='" + "M " + innerP1.x + " " + innerP1.y;
                instructionString += " A " + radius + " " + radius + " 0 " + largeArcFlag + " 1 " + innerP2.x + " " + innerP2.y;
                instructionString += " L " + innerP3.x + " " + innerP3.y;
                instructionString += " A " + (radius + thickness) + " " + (radius + thickness) + " 0 " + largeArcFlag + " 0 " + innerP4.x + " " + innerP4.y + "z";
                instructionString += " M " + outerP1.x + " " + outerP1.y;
                instructionString += " A " + smallRadius + " " + smallRadius + " 0 " + largeArcFlag + " 1 " + outerP2.x + " " + outerP2.y;
                instructionString += " L " + outerP3.x + " " + outerP3.y;
                instructionString += " A " + (radius + thickness + outlineThickness) + " " + (radius + thickness + outlineThickness) + " 0 " + largeArcFlag + " 0 " + outerP4.x + " " + outerP4.y + "z' />\n";
                let innerP5 = polarToCartesian(x, y, radius, Math.PI);
                let innerP6 = polarToCartesian(x, y, radius, 2 * Math.PI - gapRad / 2);
                let innerP7 = polarToCartesian(x, y, radius + thickness, 2 * Math.PI - gapRad / 2);
                let innerP8 = polarToCartesian(x, y, radius + thickness, Math.PI);
                let outerP5 = polarToCartesian(x, y, smallRadius, Math.PI);
                let outerP6 = polarToCartesian(x, y, smallRadius, 2 * Math.PI - outlineGapRad / 2);
                let outerP7 = polarToCartesian(x, y, radius + thickness + outlineThickness, 2 * Math.PI - outlineGapRad / 2);
                let outerP8 = polarToCartesian(x, y, radius + thickness + outlineThickness, Math.PI);
                largeArcFlag = 2 * Math.PI - gapRad / 2 - Math.PI <= Math.PI ? "0" : "1";
                instructionString += "<path fill-rule='evenodd' d='" + "M " + innerP5.x + " " + innerP5.y;
                instructionString += " A " + radius + " " + radius + " 0 " + largeArcFlag + " 1 " + innerP6.x + " " + innerP6.y;
                instructionString += " L " + innerP7.x + " " + innerP7.y;
                instructionString += " A " + (radius + thickness) + " " + (radius + thickness) + " 0 " + largeArcFlag + " 0 " + innerP8.x + " " + innerP8.y + "z";
                instructionString += " M " + outerP5.x + " " + outerP5.y;
                instructionString += " A " + smallRadius + " " + smallRadius + " 0 " + largeArcFlag + " 1 " + outerP6.x + " " + outerP6.y;
                instructionString += " L " + outerP7.x + " " + outerP7.y;
                instructionString += " A " + (radius + thickness + outlineThickness) + " " + (radius + thickness + outlineThickness) + " 0 " + largeArcFlag + " 0 " + outerP8.x + " " + outerP8.y + "z' />\n"
            }
        }
    } else {
        for (var i = 0; i < segments; i++) {
            if (outline == 0) {
                if (ctxCross !== "returnString") {
                    ctxCross.beginPath();
                    ctxCross.arc(x, y, radius, i / segments * 2 * Math.PI + gapRad / 2, (i + 1) / segments * 2 * Math.PI - gapRad / 2, false);
                    ctxCross.arc(x, y, radius + thickness, (i + 1) / segments * 2 * Math.PI - gapRad / 2, i / segments * 2 * Math.PI + gapRad / 2, true);
                    ctxCross.closePath();
                    ctxCross.fill()
                } else {
                    let innerP1 = polarToCartesian(x, y, radius, i / segments * 2 * Math.PI + gapRad / 2);
                    let innerP2 = polarToCartesian(x, y, radius, (i + 1) / segments * 2 * Math.PI - gapRad / 2);
                    let innerP3 = polarToCartesian(x, y, radius + thickness, (i + 1) / segments * 2 * Math.PI - gapRad / 2);
                    let innerP4 = polarToCartesian(x, y, radius + thickness, i / segments * 2 * Math.PI + gapRad / 2);
                    var largeArcFlag = (i + 1) / segments * 2 * Math.PI - gapRad / 2 - (i / segments * 2 * Math.PI + gapRad / 2) <= Math.PI ? "0" : "1";
                    instructionString += "<path d='" + "M " + innerP1.x + " " + innerP1.y;
                    instructionString += " A " + radius + " " + radius + " 0 " + largeArcFlag + " 1 " + innerP2.x + " " + innerP2.y;
                    instructionString += " L " + innerP3.x + " " + innerP3.y;
                    instructionString += " A " + (radius + thickness) + " " + (radius + thickness) + " 0 " + largeArcFlag + " 0 " + innerP4.x + " " + innerP4.y + "z' />\n"
                }
            } else {
                if (ctxCross !== "returnString") {
                    ctxCross.beginPath();
                    ctxCross.arc(x, y, radius, i / segments * 2 * Math.PI + gapRad / 2, (i + 1) / segments * 2 * Math.PI - gapRad / 2, false);
                    ctxCross.arc(x, y, radius + thickness, (i + 1) / segments * 2 * Math.PI - gapRad / 2, i / segments * 2 * Math.PI + gapRad / 2, true);
                    ctxCross.closePath();
                    ctxCross.moveTo(radius * Math.cos(i / segments * 2 * Math.PI + outlineGapRad / 2), radius * Math.sin(i / segments * 2 * Math.PI + outlineGapRad / 2));
                    ctxCross.arc(x, y, Math.max(radius - outlineThickness, 0), i / segments * 2 * Math.PI + outlineGapRad / 2, (i + 1) / segments * 2 * Math.PI - outlineGapRad / 2, false);
                    ctxCross.arc(x, y, radius + thickness + outlineThickness, (i + 1) / segments * 2 * Math.PI - outlineGapRad / 2, i / segments * 2 * Math.PI + outlineGapRad / 2, true);
                    ctxCross.closePath();
                    ctxCross.fill("evenodd")
                } else {
                    let smallRadius = Math.max(radius - outlineThickness, 0);
                    let innerP1 = polarToCartesian(x, y, radius, i / segments * 2 * Math.PI + gapRad / 2);
                    let innerP2 = polarToCartesian(x, y, radius, (i + 1) / segments * 2 * Math.PI - gapRad / 2);
                    let innerP3 = polarToCartesian(x, y, radius + thickness, (i + 1) / segments * 2 * Math.PI - gapRad / 2);
                    let innerP4 = polarToCartesian(x, y, radius + thickness, i / segments * 2 * Math.PI + gapRad / 2);
                    let outerP1 = polarToCartesian(x, y, smallRadius, i / segments * 2 * Math.PI + outlineGapRad / 2);
                    let outerP2 = polarToCartesian(x, y, smallRadius, (i + 1) / segments * 2 * Math.PI - outlineGapRad / 2);
                    let outerP3 = polarToCartesian(x, y, radius + thickness + outlineThickness, (i + 1) / segments * 2 * Math.PI - outlineGapRad / 2);
                    let outerP4 = polarToCartesian(x, y, radius + thickness + outlineThickness, i / segments * 2 * Math.PI + outlineGapRad / 2);
                    var largeArcFlag = (i + 1) / segments * 2 * Math.PI - gapRad / 2 - (i / segments * 2 * Math.PI + gapRad / 2) <= Math.PI ? "0" : "1";
                    instructionString += "<path fill-rule='evenodd' d='" + "M " + innerP1.x + " " + innerP1.y;
                    instructionString += " A " + radius + " " + radius + " 0 " + largeArcFlag + " 1 " + innerP2.x + " " + innerP2.y;
                    instructionString += " L " + innerP3.x + " " + innerP3.y;
                    instructionString += " A " + (radius + thickness) + " " + (radius + thickness) + " 0 " + largeArcFlag + " 0 " + innerP4.x + " " + innerP4.y + "z";
                    instructionString += " M " + outerP1.x + " " + outerP1.y;
                    instructionString += " A " + smallRadius + " " + smallRadius + " 0 " + largeArcFlag + " 1 " + outerP2.x + " " + outerP2.y;
                    instructionString += " L " + outerP3.x + " " + outerP3.y;
                    instructionString += " A " + (radius + thickness + outlineThickness) + " " + (radius + thickness + outlineThickness) + " 0 " + largeArcFlag + " 0 " + outerP4.x + " " + outerP4.y + "z' />\n"
                }
            }
        }
    }
    if (ctxCross !== "returnString") {
        ctxCross.restore()
    } else {
        instructionString += "</g>\n"
    }
    return instructionString
}

function drawPointers(ctxCross, enabledSides, length, thickness, outlineThickness, color, gap, rotation, outline) {
    let instructionString = "";
    if (ctxCross !== "returnString") {
        ctxCross.fillStyle = color;
        ctxCross.save();
        ctxCross.rotate(Math.PI / 180 * rotation)
    } else {
        instructionString += "<g fill='" + color.substring(0, 7);
        if (color.length > 7) {
            var opacity = parseInt(color.substring(7, 9), 16) / 255;
            instructionString += "' fill-opacity='" + opacity
        }
        instructionString += "' transform='rotate(" + rotation + ")'>\n"
    }
    if (thickness > length) {
        thickness = length
    }
    let x = gap;
    let y = gap;
    for (let i = 0; i <= 3; i++) {
        if (i == 0) {
            if (enabledSides.bottomright == 0) {
                continue
            }
            if (outline == 0) {
                if (ctxCross !== "returnString") {
                    ctxCross.beginPath();
                    ctxCross.rect(x + outlineThickness, y + outlineThickness, length, thickness);
                    ctxCross.rect(x + outlineThickness, y + outlineThickness + thickness, thickness, length - thickness)
                } else {
                    instructionString += "<rect x='" + (x + outlineThickness) + "' y='" + (y + outlineThickness) + "' width='" + length + "' height='" + thickness + "' />\n";
                    instructionString += "<rect x='" + (x + outlineThickness) + "' y='" + (y + outlineThickness + thickness) + "' width='" + thickness + "' height='" + (length - thickness) + "' />\n"
                }
            } else {
                if (ctxCross !== "returnString") {
                    ctxCross.beginPath();
                    ctxCross.rect(x, y, length + 2 * outlineThickness, outlineThickness);
                    ctxCross.rect(x, y + outlineThickness, outlineThickness, length + outlineThickness);
                    ctxCross.rect(x + outlineThickness, y + outlineThickness + length, thickness, outlineThickness);
                    ctxCross.rect(x + outlineThickness + thickness, y + outlineThickness + thickness, length - thickness, outlineThickness);
                    ctxCross.rect(x + outlineThickness + thickness, y + 2 * outlineThickness + thickness, outlineThickness, length - thickness);
                    ctxCross.rect(x + outlineThickness + length, y + outlineThickness, outlineThickness, thickness + outlineThickness)
                } else {
                    instructionString += "<rect x='" + x + "' y='" + y + "' width='" + (length + 2 * outlineThickness) + "' height='" + outlineThickness + "' />\n";
                    instructionString += "<rect x='" + x + "' y='" + (y + outlineThickness) + "' width='" + outlineThickness + "' height='" + (length + outlineThickness) + "' />\n";
                    instructionString += "<rect x='" + (x + outlineThickness) + "' y='" + (y + outlineThickness + length) + "' width='" + thickness + "' height='" + outlineThickness + "' />\n";
                    instructionString += "<rect x='" + (x + outlineThickness + thickness) + "' y='" + (y + outlineThickness + thickness) + "' width='" + (length - thickness) + "' height='" + outlineThickness + "' />\n";
                    instructionString += "<rect x='" + (x + outlineThickness + thickness) + "' y='" + (y + 2 * outlineThickness + thickness) + "' width='" + outlineThickness + "' height='" + (length - thickness) + "' />\n";
                    instructionString += "<rect x='" + (x + outlineThickness + length) + "' y='" + (y + outlineThickness) + "' width='" + outlineThickness + "' height='" + (thickness + outlineThickness) + "' />\n"
                }
            }
        }
        if (i == 1) {
            if (enabledSides.topright == 0) {
                continue
            }
            if (outline == 0) {
                if (ctxCross !== "returnString") {
                    ctxCross.beginPath();
                    ctxCross.rect(x + outlineThickness, -(y + outlineThickness), length, -thickness);
                    ctxCross.rect(x + outlineThickness, -(y + outlineThickness + thickness), thickness, -(length - thickness))
                } else {
                    instructionString += "<rect x='" + (x + outlineThickness) + "' y='" + -(y + outlineThickness + thickness) + "' width='" + length + "' height='" + thickness + "' />\n";
                    instructionString += "<rect x='" + (x + outlineThickness) + "' y='" + (-(y + outlineThickness + thickness) - (length - thickness)) + "' width='" + thickness + "' height='" + (length - thickness) + "' />\n"
                }
            } else {
                if (ctxCross !== "returnString") {
                    ctxCross.beginPath();
                    ctxCross.rect(x, -y, length + 2 * outlineThickness, -outlineThickness);
                    ctxCross.rect(x, -(y + outlineThickness), outlineThickness, -(length + outlineThickness));
                    ctxCross.rect(x + outlineThickness, -(y + outlineThickness + length), thickness, -outlineThickness);
                    ctxCross.rect(x + outlineThickness + thickness, -(y + outlineThickness + thickness), length - thickness, -outlineThickness);
                    ctxCross.rect(x + outlineThickness + thickness, -(y + 2 * outlineThickness + thickness), outlineThickness, -(length - thickness));
                    ctxCross.rect(x + outlineThickness + length, -(y + outlineThickness), outlineThickness, -(thickness + outlineThickness))
                } else {
                    instructionString += "<rect x='" + x + "' y='" + (-y - outlineThickness) + "' width='" + (length + 2 * outlineThickness) + "' height='" + outlineThickness + "' />\n";
                    instructionString += "<rect x='" + x + "' y='" + (-y - length - 2 * outlineThickness) + "' width='" + outlineThickness + "' height='" + (length + outlineThickness) + "' />\n";
                    instructionString += "<rect x='" + (x + outlineThickness) + "' y='" + -(y + 2 * outlineThickness + length) + "' width='" + thickness + "' height='" + outlineThickness + "' />\n";
                    instructionString += "<rect x='" + (x + outlineThickness + thickness) + "' y='" + -(y + 2 * outlineThickness + thickness) + "' width='" + (length - thickness) + "' height='" + outlineThickness + "' />\n";
                    instructionString += "<rect x='" + (x + outlineThickness + thickness) + "' y='" + -(y + 2 * outlineThickness + length) + "' width='" + outlineThickness + "' height='" + (length - thickness) + "' />\n";
                    instructionString += "<rect x='" + (x + outlineThickness + length) + "' y='" + -(y + 2 * outlineThickness + thickness) + "' width='" + outlineThickness + "' height='" + (thickness + outlineThickness) + "' />\n"
                }
            }
        }
        if (i == 2) {
            if (enabledSides.bottomleft == 0) {
                continue
            }
            if (outline == 0) {
                if (ctxCross !== "returnString") {
                    ctxCross.beginPath();
                    ctxCross.rect(-(x + outlineThickness), y + outlineThickness, -length, thickness);
                    ctxCross.rect(-(x + outlineThickness), y + outlineThickness + thickness, -thickness, length - thickness)
                } else {
                    instructionString += "<rect x='" + -(x + outlineThickness + length) + "' y='" + (y + outlineThickness) + "' width='" + length + "' height='" + thickness + "' />\n";
                    instructionString += "<rect x='" + -(x + outlineThickness + thickness) + "' y='" + (y + outlineThickness + thickness) + "' width='" + thickness + "' height='" + (length - thickness) + "' />\n"
                }
            } else {
                if (ctxCross !== "returnString") {
                    ctxCross.beginPath();
                    ctxCross.rect(-x, y, -(length + 2 * outlineThickness), outlineThickness);
                    ctxCross.rect(-x, y + outlineThickness, -outlineThickness, length + outlineThickness);
                    ctxCross.rect(-(x + outlineThickness), y + outlineThickness + length, -thickness, outlineThickness);
                    ctxCross.rect(-(x + outlineThickness + thickness), y + outlineThickness + thickness, -(length - thickness), outlineThickness);
                    ctxCross.rect(-(x + outlineThickness + thickness), y + 2 * outlineThickness + thickness, -outlineThickness, length - thickness);
                    ctxCross.rect(-(x + outlineThickness + length), y + outlineThickness, -outlineThickness, thickness + outlineThickness)
                } else {
                    instructionString += "<rect x='" + -(x + length + 2 * outlineThickness) + "' y='" + y + "' width='" + (length + 2 * outlineThickness) + "' height='" + outlineThickness + "' />\n";
                    instructionString += "<rect x='" + -(x + outlineThickness) + "' y='" + (y + outlineThickness) + "' width='" + outlineThickness + "' height='" + (length + outlineThickness) + "' />\n";
                    instructionString += "<rect x='" + -(x + outlineThickness + thickness) + "' y='" + (y + outlineThickness + length) + "' width='" + thickness + "' height='" + outlineThickness + "' />\n";
                    instructionString += "<rect x='" + -(x + outlineThickness + length) + "' y='" + (y + outlineThickness + thickness) + "' width='" + (length - thickness) + "' height='" + outlineThickness + "' />\n";
                    instructionString += "<rect x='" + -(x + 2 * outlineThickness + thickness) + "' y='" + (y + 2 * outlineThickness + thickness) + "' width='" + outlineThickness + "' height='" + (length - thickness) + "' />\n";
                    instructionString += "<rect x='" + -(x + 2 * outlineThickness + length) + "' y='" + (y + outlineThickness) + "' width='" + outlineThickness + "' height='" + (thickness + outlineThickness) + "' />\n"
                }
            }
        }
        if (i == 3) {
            if (enabledSides.topleft == 0) {
                continue
            }
            if (outline == 0) {
                if (ctxCross !== "returnString") {
                    ctxCross.beginPath();
                    ctxCross.rect(-(x + outlineThickness), -(y + outlineThickness), -length, -thickness);
                    ctxCross.rect(-(x + outlineThickness), -(y + outlineThickness + thickness), -thickness, -(length - thickness))
                } else {
                    instructionString += "<rect x='" + -(x + outlineThickness + length) + "' y='" + -(y + outlineThickness + thickness) + "' width='" + length + "' height='" + thickness + "' />\n";
                    instructionString += "<rect x='" + -(x + outlineThickness + thickness) + "' y='" + -(y + outlineThickness + length) + "' width='" + thickness + "' height='" + (length - thickness) + "' />\n"
                }
            } else {
                if (ctxCross !== "returnString") {
                    ctxCross.beginPath();
                    ctxCross.rect(-x, -y, -(length + 2 * outlineThickness), -outlineThickness);
                    ctxCross.rect(-x, -(y + outlineThickness), -outlineThickness, -(length + outlineThickness));
                    ctxCross.rect(-(x + outlineThickness), -(y + outlineThickness + length), -thickness, -outlineThickness);
                    ctxCross.rect(-(x + outlineThickness + thickness), -(y + outlineThickness + thickness), -(length - thickness), -outlineThickness);
                    ctxCross.rect(-(x + outlineThickness + thickness), -(y + 2 * outlineThickness + thickness), -outlineThickness, -(length - thickness));
                    ctxCross.rect(-(x + outlineThickness + length), -(y + outlineThickness), -outlineThickness, -(thickness + outlineThickness))
                } else {
                    instructionString += "<rect x='" + -(x + length + 2 * outlineThickness) + "' y='" + -(y + outlineThickness) + "' width='" + (length + 2 * outlineThickness) + "' height='" + outlineThickness + "' />\n";
                    instructionString += "<rect x='" + -(x + outlineThickness) + "' y='" + -(y + 2 * outlineThickness + length) + "' width='" + outlineThickness + "' height='" + (length + outlineThickness) + "' />\n";
                    instructionString += "<rect x='" + -(x + outlineThickness + thickness) + "' y='" + -(y + 2 * outlineThickness + length) + "' width='" + thickness + "' height='" + outlineThickness + "' />\n";
                    instructionString += "<rect x='" + -(x + outlineThickness + length) + "' y='" + -(y + 2 * outlineThickness + thickness) + "' width='" + (length - thickness) + "' height='" + outlineThickness + "' />\n";
                    instructionString += "<rect x='" + -(x + 2 * outlineThickness + thickness) + "' y='" + -(y + 2 * outlineThickness + length) + "' width='" + outlineThickness + "' height='" + (length - thickness) + "' />\n";
                    instructionString += "<rect x='" + -(x + 2 * outlineThickness + length) + "' y='" + -(y + 2 * outlineThickness + thickness) + "' width='" + outlineThickness + "' height='" + (thickness + outlineThickness) + "' />\n"
                }
            }
        }
        if (ctxCross !== "returnString") {
            ctxCross.fill()
        }
    }
    if (ctxCross !== "returnString") {
        ctxCross.restore()
    } else {
        instructionString += "</g>\n"
    }
    return instructionString
}