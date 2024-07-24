class VariableHandler {
    constructor() {
        this.updates = {}
    }
    addPermanentResponseHandler(type, variable, callback) {
        let key = type + "-" + variable;
        if (!(key in this.updates)) {
            this.updates[key] = []
        }
        this.updates[key].push({
            ts: Date.now(),
            cb: callback,
            sticky: true
        })
    }
    addResponseHandler(type, variable, callback) {
        let key = type + "-" + variable;
        if (!(key in this.updates)) {
            this.updates[key] = []
        }
        this.updates[key].push({
            ts: Date.now(),
            cb: callback,
            sticky: false
        })
    }
    handleResponse(type, variable, value) {
        let now = Date.now();
        let key = type + "-" + variable;
        if (key in this.updates) {
            for (let i = this.updates[key].length - 1; i >= 0; i--) {
                if (this.updates[key][i].sticky) {
                    if (typeof this.updates[key][i].cb === "function") this.updates[key][i].cb(value)
                } else {
                    if (now - this.updates[key][i].ts <= 1e3) {
                        if (typeof this.updates[key][i].cb === "function") this.updates[key][i].cb(value)
                    }
                    this.updates[key].splice(i, 1)
                }
            }
        }
    }
}
const global_variable = new VariableHandler;
var global_ignore_variable_update = false;
const global_variable_value_store = {};

function initEngineVarElementHandlers() {
    bind_event("set_checkbox", (function(variable, value) {
        global_variable_value_store[variable] = value;
        if (global_ignore_variable_update) return;
        if (variable == "lobby_tutorial_launched") {
            home_screen_show_hide_tutorial_button(value);
            return
        }
        if (variable in Lobby.client_var_map && (Lobby.state.host || Lobby.state.id === "")) {
            Lobby.client_var_update(variable, value)
        } else if (variable in settings_variable_map && settings_variable_map[variable]) {
            settings_variable_map[variable].dataset.enabled = value ? "true" : "false";
            update_checkbox(settings_variable_map[variable])
        } else {
            _for_each_in_class("checkbox_component", (function(element) {
                if (element.dataset.variable == variable) {
                    element.dataset.enabled = value ? "true" : "false";
                    update_checkbox(element)
                }
            }))
        }
        global_variable.handleResponse("checkbox", variable, value)
    }));
    bind_event("set_select", (function(variable, value) {
        global_variable_value_store[variable] = value;
        if (global_ignore_variable_update) return;
        if (variable.startsWith("game_decals")) {
            customize_on_update_decals(value);
            return
        }
        if (variable == "video_mode") {
            settings_set_video_mode(parseInt(value))
        }
        if (variable in Lobby.client_var_map && (Lobby.state.host || Lobby.state.id === "")) {
            Lobby.client_var_update(variable, value)
        } else if (variable in settings_variable_map && settings_variable_map[variable]) {
            settings_variable_map[variable].dataset.value = value;
            update_select(settings_variable_map[variable])
        } else {
            _for_each_in_class("select-field", (function(el) {
                if (el.dataset.variable == variable) {
                    el.dataset.value = value;
                    update_select(el)
                }
            }))
        }
        global_variable.handleResponse("select", variable, value)
    }));
    bind_event("set_color", (function(variable, value) {
        global_variable_value_store[variable] = value;
        if (global_ignore_variable_update) return;
        if (variable == "game_skin_color") {
            if (GAME.active === GAME.ids.DIABOTICAL) {
                customization_set_shell_color(value)
            }
            return
        }
        if (variable in settings_variable_map && settings_variable_map[variable]) {
            settings_variable_map[variable].jscolor.fromString(value);
            if ("finechange" in settings_variable_map[variable].dataset && settings_variable_map[variable].dataset.finechange == 1) {
                settings_variable_map[variable].jscolor.onFineChange = function(value) {
                    colorPickerValueUpdated(settings_variable_map[variable], el.jscolor)
                }
            }
        } else {
            _for_each_with_class_in_parent(_id("main_menu"), "color-picker-new", (function(el) {
                if (el.dataset.variable == variable) {
                    el.jscolor.fromString(value);
                    if ("finechange" in el.dataset && el.dataset.finechange == 1) {
                        el.jscolor.onFineChange = function(value) {
                            colorPickerValueUpdated(el, el.jscolor)
                        }
                    }
                }
            }))
        }
        if (variable === "game_team1_color_override") {
            set_team_color(0, value)
        }
        if (variable === "game_team2_color_override") {
            set_team_color(1, value)
        }
        global_variable.handleResponse("color", variable, value)
    }));
    bind_event("set_range", (function(variable, value) {
        global_variable_value_store[variable] = value;
        if (global_ignore_variable_update) return;
        if (global_range_slider_map.hasOwnProperty(variable)) {
            global_range_slider_map[variable].setValue(value)
        }
        global_variable.handleResponse("range", variable, value)
    }));
    bind_event("set_custom_component", (function(variable, value) {
        global_variable_value_store[variable] = value;
        if (global_ignore_variable_update) return;
        if (variable in Lobby.client_var_map && (Lobby.state.host || Lobby.state.id === "")) {
            Lobby.client_var_update(variable, value)
        }
        if (variable.startsWith("hud_crosshair_definition:") && variable.substr(25) != currentCrosshairCreatorWeaponIndex) {
            if (GAME.active in global_crosshair_creators && "normal" in global_crosshair_creators[GAME.active]) {
                global_crosshair_creators[GAME.active]["normal"].initialize(false, generateFullCrosshairDefinition(value), variable, "none")
            }
            currentCrosshairCreatorWeaponIndex = variable.substr(25)
        }
        if (variable.startsWith("hud_zoom_crosshair_definition:") && variable.substr(30) != currentCrosshairCreatorZoomWeaponIndex) {
            if (GAME.active in global_crosshair_creators && "zoom" in global_crosshair_creators[GAME.active]) {
                global_crosshair_creators[GAME.active]["zoom"].initialize(true, generateFullCrosshairDefinition(value), variable, "none")
            }
            currentCrosshairCreatorZoomWeaponIndex = variable.substr(30)
        }
        if (variable.startsWith("hud_saved_crosshair_definition:")) {
            let idx = variable.replace("hud_saved_crosshair_definition:", "");
            set_saved_crosshairs_from_engine(idx, value);
            for (let game_id in global_crosshair_creators) {
                for (let type in global_crosshair_creators[game_id]) {
                    global_crosshair_creators[game_id][type].initialize_saved_crosshairs()
                }
            }
        }
        if (variable == "lobby_last_patch_notes_read") {
            latest_patch_notes_read = value
        }
        if (variable == "shop_update_version") {
            global_shop_update_version = value
        }
        if (variable == "lobby_regions_known") {
            if (value.length) Servers.known_server_locations = value.split(":");
            else Servers.known_server_locations = [];
            return
        }
        global_variable.handleResponse("custom_component", variable, value)
    }))
}

function update_variable(type, variable, value, skip_callback) {
    if (arguments.length > 4) console.log("======= update_variable call needs to be updated, params changed", type, variable, value);
    if (skip_callback) global_ignore_variable_update = true;
    if (type == "string") engine.call("set_string_variable", variable, "" + value);
    if (type == "bool") engine.call("set_bool_variable", variable, value);
    if (type == "real") engine.call("set_real_variable", variable, value);
    if (skip_callback) global_ignore_variable_update = false
}

function initialize_variable(type, variable, skip_callback) {
    if (skip_callback) global_ignore_variable_update = true;
    if (type === "select") engine.call("initialize_select_value", variable);
    if (type === "checkbox") engine.call("initialize_checkbox_value", variable);
    if (type === "range") engine.call("initialize_range_value", variable);
    if (type === "color") engine.call("initialize_color_value", variable);
    if (type === "custom") engine.call("initialize_custom_component_value", variable);
    if (skip_callback) global_ignore_variable_update = false
}
const global_checkboxes = {
    variables: {},
    custom: {}
};
const global_post_checkbox_init = [];

function initialize_checkboxes() {
    _for_each_in_class("checkbox_component", (function(element) {
        var variable = element.dataset.variable;
        let custom = element.dataset.custom;
        if (variable || custom) {
            element.addEventListener("click", (function(e) {
                e.stopPropagation();
                toggle_checkbox(element)
            }));
            if (variable) {
                if (!(variable in global_checkboxes.variables)) global_checkboxes.variables[variable] = [];
                global_checkboxes.variables[variable].push(element);
                engine.call("initialize_checkbox_value", variable)
            }
            if (custom) {
                if (!(custom in global_checkboxes.custom)) global_checkboxes.custom[custom] = [];
                global_checkboxes.custom[custom].push(element)
            }
        }
    }));
    for (let cb of global_post_checkbox_init) {
        if (typeof cb === "function") cb()
    }
}

function for_each_checkbox_with_type_and_name(type, name, cb) {
    if (!(type in global_checkboxes)) return;
    if (!(name in global_checkboxes[type])) return;
    if (typeof cb !== "function") return;
    for (let element of global_checkboxes[type][name]) {
        cb(element)
    }
}
const global_custom_checkbox_handlers = {};

function toggle_checkbox(element, force_value) {
    var variable = element.dataset.variable;
    let custom = element.dataset.custom;
    if (variable) {
        let value = false;
        if (typeof force_value === "boolean") {
            value = force_value
        } else {
            var data_value = element.dataset.enabled;
            if (data_value && (data_value === "true" || data_value === true)) {
                value = true
            }
            value = !value
        }
        engine.call("set_bool_variable", variable, value);
        if (value) {
            engine.call("ui_sound", "ui_check_box")
        } else {
            engine.call("ui_sound", "ui_uncheck_box")
        }
    } else if (custom && custom in global_custom_checkbox_handlers && typeof global_custom_checkbox_handlers[custom] === "function") {
        let value = false;
        if (typeof force_value === "boolean") {
            value = force_value
        } else {
            var data_value = element.dataset.enabled;
            if (data_value && (data_value === "true" || data_value === true)) {
                value = true
            }
            value = !value
        }
        if (value) {
            _checkCheckbox(element);
            engine.call("ui_sound", "ui_check_box")
        } else {
            _uncheckCheckbox(element);
            engine.call("ui_sound", "ui_uncheck_box")
        }
        global_custom_checkbox_handlers[custom](value)
    }
}

function update_checkbox(checkbox) {
    var value = false;
    var data_value = checkbox.dataset.enabled;
    if (data_value && (data_value === "true" || data_value === true)) {
        value = true
    }
    if (value) {
        _checkCheckbox(checkbox)
    } else {
        _uncheckCheckbox(checkbox)
    }
}