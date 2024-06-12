var is_modal_open = false;
var open_modals = [];
var on_close_modal_screen = [];

function open_modal_screen(id, cb, lock_modal) {
    let modal_el = _id(id);
    if (!modal_el) return;
    let modal = {
        id: id,
        locked: false
    };
    if (lock_modal !== undefined) {
        if (lock_modal == -1) {
            modal.locked = true
        } else if (lock_modal > 0) {
            modal.locked = true;
            setTimeout((function() {
                modal.locked = false
            }), lock_modal)
        }
    }
    _id("modal_dialogs").classList.add("active");
    engine.call("ui_sound", "ui_window_open");
    set_modal_engine_call(true);
    is_modal_open = true;
    for (let i = 0; i < open_modals.length; i++) {
        if (open_modals[i].id === id) {
            open_modals.splice(i, 1);
            break
        }
    }
    _id(id).style.display = "flex";
    open_modals.push(modal);
    if (cb) req_anim_frame(cb)
}

function lock_modal(id) {
    for (let i = 0; i < open_modals.length; i++) {
        if (open_modals[i].id === id) {
            open_modals[i].locked = true;
            break
        }
    }
}

function unlock_modal(id) {
    for (let i = 0; i < open_modals.length; i++) {
        if (open_modals[i].id === id) {
            open_modals[i].locked = false;
            break
        }
    }
}

function close_modal_screen(e, id, instant) {
    let idx = -1;
    let el = undefined;
    if (id !== undefined) {
        el = _id(id);
        for (let i = 0; i < open_modals.length; i++) {
            if (open_modals[i].id === id) {
                idx = i;
                break
            }
        }
        if (!el) return
    } else if (e) {
        el = e.currentTarget;
        for (let i = 0; i < open_modals.length; i++) {
            if (open_modals[i].id === el.id) {
                idx = i;
                break
            }
        }
        e.stopPropagation()
    }
    if (idx === -1) return;
    if (open_modals[idx].locked) return;
    let style = window.getComputedStyle(el);
    if (style.getPropertyValue("display") == "none") return;
    if (instant && instant === true) {
        el.style.display = "none"
    } else {
        engine.call("ui_sound", "ui_window_close");
        el.style.display = "none"
    }
    if (idx >= 0) open_modals.splice(idx, 1);
    if (typeof _click_outside_select_handler === "function") {
        _click_outside_select_handler()
    }
    set_modal_engine_call(false);
    for (let cb of on_close_modal_screen) {
        if (typeof cb === "function") cb(el.id)
    }
    if (typeof el.close_cb === "function") {
        el.close_cb()
    }
    if (open_modals.length === 0) {
        _id("modal_dialogs").classList.remove("active");
        is_modal_open = false
    }
}

function close_modal_screen_by_selector(id, instant) {
    close_modal_screen(null, id, instant);
    return false
}
let global_ingame_set_modal_calls = 0;
let global_set_modal_calls = 0;

function set_modal_engine_call(bool, activate_only, ingame) {
    if (bool && activate_only) {
        if (ingame && global_ingame_set_modal_calls > 0) return;
        if (!ingame && global_set_modal_calls > 0) return
    }
    if (ingame) {
        if (bool === true) global_ingame_set_modal_calls++;
        if (bool === false) global_ingame_set_modal_calls--;
        if (global_ingame_set_modal_calls <= 0) global_ingame_set_modal_calls = 0
    } else {
        if (bool === true) global_set_modal_calls++;
        if (bool === false) global_set_modal_calls--;
        if (global_set_modal_calls <= 0) global_set_modal_calls = 0
    }
    if (global_set_modal_calls <= 0 && global_ingame_set_modal_calls <= 0) {
        global_set_modal_calls = 0;
        global_ingame_set_modal_calls = 0;
        engine.call("set_modal", false)
    } else {
        engine.call("set_modal", true)
    }
}

function goUpALevel() {
    for (let i = open_modals.length - 1; i >= 0; i--) {
        close_modal_screen_by_selector(open_modals[i].id)
    }
}

function genericModal(title, text, btn_negative, cb_negative, btn_positive, cb_positive) {
    let modal = _id("generic_modal");
    _for_first_with_class_in_parent(modal, "generic_modal_dialog_header", (function(el) {
        if (title !== undefined) {
            el.style.display = "flex";
            _html(el, title)
        } else {
            el.style.display = "none"
        }
    }));
    _for_first_with_class_in_parent(modal, "generic_modal_dialog_text", (function(el) {
        if (text.nodeType == undefined) {
            _html(el, text)
        } else if (text.nodeType == 1 || text.nodeType == 11) {
            _empty(el);
            el.appendChild(text)
        }
    }));
    _for_first_with_class_in_parent(modal, "neutral", (function(el) {
        if (btn_negative) {
            _html(el, btn_negative)
        } else {
            _empty(el)
        }
        el.onclick = function() {
            close_modal_screen_by_selector("generic_modal");
            if (typeof cb_negative == "function") {
                cb_negative()
            }
        }
    }));
    _for_first_with_class_in_parent(modal, "positive", (function(el) {
        if (btn_positive) {
            _html(el, btn_positive)
        } else {
            _empty(el)
        }
        el.onclick = function() {
            close_modal_screen_by_selector("generic_modal");
            if (typeof cb_positive == "function") {
                cb_positive()
            }
        }
    }));
    open_modal_screen("generic_modal")
}

function basicGenericModal(title, content, button, cb) {
    let fragment = new DocumentFragment;
    if (title) {
        if (typeof title === "string") {
            let header = _createElement("div", "generic_modal_dialog_header", title);
            fragment.appendChild(header)
        } else if (title.nodeType != undefined && (title.nodeType == 1 || title.nodeType == 11)) {
            let header = _createElement("div", "generic_modal_dialog_header");
            header.appendChild(title);
            fragment.appendChild(header)
        }
    }
    if (content) {
        let content_cont = _createElement("div", "generic_modal_dialog_text");
        if (content.nodeType == undefined) {
            content_cont.textContent = content
        } else if (content.nodeType == 1 || content.nodeType == 11) {
            content_cont.appendChild(content)
        }
        fragment.appendChild(content_cont)
    }
    if (button) {
        let btn_cont = _createElement("div", "generic_modal_dialog_action");
        if (typeof button === "string") {
            let btn = _createElement("div", "dialog_button", button);
            _addButtonSounds(btn, 1);
            btn.addEventListener("click", (function() {
                closeBasicModal();
                if (typeof cb === "function") cb()
            }));
            btn_cont.appendChild(btn)
        } else if (button.nodeType != undefined && (button.nodeType == 1 || button.nodeType == 11)) {
            btn_cont.appendChild(button)
        }
        fragment.appendChild(btn_cont)
    }
    return fragment
}

function updateBasicModalContent(content, close_cb) {
    let modal = _id("basic_modal");
    if (!modal) return;
    if (typeof close_cb === "function") {
        modal.close_cb = close_cb
    } else {
        delete modal.close_cb
    }
    _for_first_with_class_in_parent(modal, "generic_modal_dialog_container", (function(el) {
        _empty(el);
        if (content.nodeType == undefined) {
            el.textContent = content
        } else if (content.nodeType == 1 || content.nodeType == 11) {
            el.appendChild(content)
        }
    }))
}

function openBasicModal(content, close_cb) {
    updateBasicModalContent(content, close_cb);
    open_modal_screen("basic_modal");
    setTimeout((() => {
        refreshScrollbars(_id("basic_modal"))
    }), 100)
}

function closeBasicModal(instant) {
    close_modal_screen_by_selector("basic_modal", instant)
}