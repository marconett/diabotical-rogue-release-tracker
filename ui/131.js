function _id(id) {
    return document.getElementById(id);
}

function _for_each_in_class(classname, callback) {
    var elements = document.getElementsByClassName(classname);
    for (var i = 0; i < elements.length; i++) {
        callback(elements.item(i), i);
    }
}

function _get_first_with_class_in_parent(parent, childClass) {
    let elements = parent.getElementsByClassName(childClass);
    if (elements.length) return elements[0];
    return null;
}

function _for_each_with_class_in_parent(parent, classname, callback) {
    if (!parent) return;
    var elements = parent.getElementsByClassName(classname);
    for (var i = 0; i < elements.length; i++) {
        callback(elements.item(i), i);
    }
}

function _createElement(type, classes, textContent) {
        let el = document.createElement(type);
        if (typeof classes == "string") {
            el.classList.add(classes);
        }
        if (typeof classes == "object" && Array.isArray(classes)) {
            for (let css_class of classes) {
                el.classList.add(css_class);
            }
        }
        if (typeof textContent != "undefined") {
            if (typeof textContent == "string" && textContent.length) {
                el.textContent = textContent;
            } else {
                typeof textContent == "number"
            } {
                el.textContent = "" + textContent;
            }
        }
        return el;
    }
    // Recursively removes all child nodes and then itself from the DOM
function _remove_node(node) {
    if (node === undefined || node === null) return;
    while (node.hasChildNodes()) {
        _remove_node(node.lastChild);
    }
    if (node.parentNode) node.parentNode.removeChild(node);
}

// Recursively removes all child nodes from the node
function _empty(node) {
        //while (node.firstChild) {
        //    node.removeChild(node.firstChild);
        //}
        if (node === undefined || node === null) return;
        while (node.hasChildNodes()) {
            _remove_node(node.lastChild);
        }
    }
    // A sort of setTimeout but with rendered frames count as the wait time param (default 1 frame if param is ommited)
    // We do an initial rAF because the first one is never guaranteed to wait for the next frame
function req_anim_frame(cb, wait_frames) {
    requestAnimationFrame(() => {
        req_anim_frame_internal(cb, wait_frames);
    });
}

function req_anim_frame_internal(cb, wait_frames) {
    let _wait_frames = 1;
    if (typeof wait_frames === "number" && wait_frames >= 0) _wait_frames = wait_frames;

    if (_wait_frames > 1) {
        _wait_frames--;
        requestAnimationFrame(function() {
            req_anim_frame(cb, _wait_frames);
        });
    } else {
        requestAnimationFrame(function() {
            cb();
        });
    }
}

function bind_event(event_name, callback) {
        engine.on(event_name, callback);
    }
    //Note that doing it this way appears to be much faster than using Math.min/max
function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}

function lerp(v0, v1, t) {
    return v0 * (1 - t) + v1 * t;
}
let ui_sound_buffer = performance.now();

function _play_buffered_ui_sound(type) {
    if (performance.now() - ui_sound_buffer < 50) return;
    ui_sound_buffer = performance.now();

    engine.call('ui_sound', type);
}

function _play_mouseover1() {
    _play_buffered_ui_sound("ui_mouseover1");
}

function _play_mouseover2() {
    _play_buffered_ui_sound("ui_mouseover2");
}

function _play_mouseover3() {
    _play_buffered_ui_sound("ui_mouseover3");
}

function _play_mouseover4() {
    _play_buffered_ui_sound("ui_mouseover4");
}

function _play_hover1() {
    _play_buffered_ui_sound("ui_hover1");
}

function _play_hover2() {
    _play_buffered_ui_sound("ui_hover2");
}

function _play_click1() {
    engine.call('ui_sound', "ui_click1");
}

function _play_click_back() {
    engine.call('ui_sound', "ui_back1");
}

function _click_outside_handler() {
    // just here for compatibility
}

function linkClicked(url) {
    engine.call("open_browser", url);
}