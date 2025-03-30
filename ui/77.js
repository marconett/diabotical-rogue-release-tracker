const settings_element_map = {};
const settings_variable_map = {};
let settings_map_initialized = false;
const binding_el_lookup_cache = {};

function set_binding_list(game_id, controls_root_element, mode, command, code) {
    if (!(game_id in binding_el_lookup_cache)) {
        _for_each_with_class_in_parent(controls_root_element, "controls_value", (function(el) {
            if (el != null && el.dataset["dbBinding"] && el.dataset["dbBindingMode"]) {
                let el_mode = el.dataset["dbBindingMode"];
                let el_command = el.dataset["dbBinding"];
                if (!(game_id in binding_el_lookup_cache)) {
                    binding_el_lookup_cache[game_id] = {}
                }
                if (!(el_mode in binding_el_lookup_cache[game_id])) {
                    binding_el_lookup_cache[game_id][el_mode] = {}
                }
                if (!(el_command in binding_el_lookup_cache[game_id][el_mode])) {
                    binding_el_lookup_cache[game_id][el_mode][el_command] = []
                }
                binding_el_lookup_cache[game_id][el_mode][el_command].push(el)
            }
        }))
    }
    if (game_id in binding_el_lookup_cache && mode in binding_el_lookup_cache[game_id] && command in binding_el_lookup_cache[game_id][mode]) {
        for (let el of binding_el_lookup_cache[game_id][mode][command]) {
            while (el.hasChildNodes()) {
                el.removeChild(el.firstChild)
            }
            if (code.trim().length) {
                if (game_id === GAME.ids.DIABOTICAL) {
                    let span_del_button = _createElement("span", "delete_bind_button");
                    span_del_button.addEventListener("click", (e => {
                        e.stopPropagation();
                        delete_bindings(command, mode)
                    }));
                    let span_binds = _createElement("span", "binds", code);
                    _empty(el);
                    el.appendChild(span_del_button);
                    el.appendChild(span_binds)
                } else {
                    let bind = _createElement("div", "bind", code);
                    el.appendChild(bind)
                }
            }
            if (el.classList.contains("active")) el.classList.remove("active")
        }
        return
    }
}
let global_keybinding_active = false;

function capture_bind(element, command, mode) {
    if (!command || !mode) return;
    engine.call("capture_bind", command, mode);
    global_keybinding_active = true;
    if (element) element.classList.add("active")
}
const on_capture_bind_finished = [];

function capture_bind_finished() {
    global_keybinding_active = false;
    for (let cb of on_capture_bind_finished) {
        if (typeof cb === "function") cb()
    }
}

function delete_bindings(command, mode) {
    engine.call("delete_bindings", command, mode)
}

function play_weapon_sfx_preview(btn) {
    let weapon_idx = Number(btn.dataset.weapon);
    let weapon_sound_select = _id("setting_weapon_sounds");
    engine.call("play_weapon_sound_variant", weapon_idx, Number(weapon_sound_select.dataset.value))
}
const video_resolution_setting_elements = [];
const on_video_mode_change = [];

function settings_set_video_mode(display_mode) {
    for (let cb of on_video_mode_change) {
        if (typeof cb === "function") {
            if (display_mode === 1 || display_mode === 3) {
                cb(display_mode, true)
            } else {
                cb(display_mode, false)
            }
        }
    }
}

function auto_detect_video_mode_option() {
    let option = _createElement("div", "", localize("auto_detect"));
    option.dataset.value = "";
    return option
}

function settings_reset(section) {
    if (section == "controls") {
        genericModal(localize("settings_reset_controls"), "", localize("menu_button_cancel"), undefined, localize("menu_button_confirm"), (function() {
            engine.call("reset_controls")
        }))
    }
    if (section == "weapons") {
        genericModal(localize("settings_reset_weapons"), "", localize("menu_button_cancel"), undefined, localize("menu_button_confirm"), (function() {
            console.log("resetting weapons");
            queue_dialog_msg({
                msg: "Not implemented"
            })
        }))
    }
}

function updateSettingsExplanation(el, explanation_cont, label_class_override) {
    if (!el) return;
    if (!explanation_cont) return false;
    _empty(explanation_cont);
    if (explanation_cont.hasAttribute("data-reposition") && explanation_cont.dataset.reposition === "1") {
        let scroll_parent = el.closest(".scroll-inner");
        if (scroll_parent) {
            let offset = el.offsetTop - scroll_parent.scrollTop;
            if (offset > 50 * onevh) {
                explanation_cont.style.top = "auto";
                explanation_cont.style.bottom = scroll_parent.offsetHeight - offset - el.offsetHeight + "px";
                explanation_cont.classList.add("bottom");
                explanation_cont.classList.remove("top")
            } else {
                explanation_cont.style.top = offset + "px";
                explanation_cont.style.removeProperty("bottom");
                explanation_cont.classList.remove("bottom");
                explanation_cont.classList.add("top")
            }
        } else {
            explanation_cont.style.removeProperty("top");
            explanation_cont.style.removeProperty("bottom");
            explanation_cont.classList.remove("bottom");
            explanation_cont.classList.remove("top")
        }
    }
    let label_class = "label";
    if (label_class_override) label_class = label_class_override;
    let label = _get_first_with_class_in_parent(el, label_class);
    let select_field = _get_first_with_class_in_parent(el, "select-field");
    let toggle = _get_first_with_class_in_parent(el, "toggle");
    let show_desc = false;
    if (label && label.hasAttribute("data-i18n-desc") && label.dataset.i18nDesc in global_translations) show_desc = true;
    if (select_field && !select_field.classList.contains("disabled")) show_desc = true;
    if (!show_desc) return false;
    let title = _createElement("div", "title", label.textContent);
    explanation_cont.appendChild(title);
    if (label.hasAttribute("data-i18n-desc") && label.dataset.i18nDesc in global_translations) {
        explanation_cont.appendChild(_createElement("div", "explanation", localize(label.dataset.i18nDesc)))
    }
    if (label && label.hasAttribute("data-requires-restart") && label.dataset.requiresRestart === "1") {
        explanation_cont.appendChild(_createElement("div", "restart_msg", localize("setting_restart_required")))
    }
    if (select_field && !select_field.classList.contains("disabled")) {
        let fragment = new DocumentFragment;
        let options_header = _createElement("div", "options_header", localize("options"));
        fragment.appendChild(options_header);
        let options_container = _createElement("div", "option_name_cont");
        fragment.appendChild(options_container);
        let options_count = 0;
        _for_each_with_class_in_parent(select_field, "select-option", (function(el) {
            let option = _createElement("div", "option_name", el.textContent);
            if (el.classList.contains("selected")) option.classList.add("selected");
            options_container.appendChild(option);
            if (el.hasAttribute("data-i18n-desc")) {
                options_container.appendChild(_createElement("div", "option_desc", localize(el.dataset.i18nDesc)))
            }
            options_count++
        }));
        if (options_count <= 15) {
            explanation_cont.appendChild(fragment)
        } else {
            if (!label.hasAttribute("data-i18n-desc")) {
                _empty(explanation_cont);
                return false
            }
        }
    } else if (toggle) {
        let fragment = new DocumentFragment;
        let options_header = _createElement("div", "options_header", localize("options"));
        fragment.appendChild(options_header);
        let options_container = _createElement("div", "option_name_cont");
        fragment.appendChild(options_container);
        let option_disabled = _createElement("div", "option_name", localize("disabled"));
        let option_enabled = _createElement("div", "option_name", localize("enabled"));
        options_container.appendChild(option_disabled);
        options_container.appendChild(option_enabled);
        if (toggle.dataset.value && toggle.dataset.value === "1") {
            option_enabled.classList.add("selected")
        } else {
            option_disabled.classList.add("selected")
        }
        explanation_cont.appendChild(fragment)
    }
    return true
}