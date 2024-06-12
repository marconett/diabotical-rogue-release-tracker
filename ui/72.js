let global_customization_data = [];
let global_customization_data_map = {};
let global_set_customizations = {};
let global_customization_confirm_types = {
    weapon: true,
    weapon_attachment: true,
    shell: true,
    shoes: true,
    shield: true
};
let global_customization_disable_types = {
    avatar: true,
    weapon: true,
    shell: true,
    shoes: true,
    shield: true,
    eye: true,
    head: true,
    suit: true,
    back: true
};
let global_customization_audio_types = {
    music: true
};
const global_customization_seen_handlers = [];

function trigger_customization_seen_handlers() {
    for (let cb of global_customization_seen_handlers) {
        if (typeof cb === "function") cb()
    }
}

function init_customizations() {
    bind_event("set_client_info", (function(type_id, sub_type, json_data) {
        let data = {};
        try {
            data = JSON.parse(json_data)
        } catch (e) {
            console.log("ERROR parsing client info json", e.message)
        }
        set_customize_data(data)
    }));
    bind_event("unlocked_tree_node", (function(json_data) {
        try {
            let data = JSON.parse(json_data);
            if (!data) return;
            if (!data.success) return;
            if (data.items && data.items.length) {
                add_user_customizations(data.items)
            }
        } catch (e) {
            console.log("ERROR unlocked_tree_node info json", e.message)
        }
    }));
    GAME.add_activate_callback((game_id => {
        add_on_get_api_token_handler(false, (() => {
            load_user_customizations(load_customization_presets)
        }))
    }));
    document.addEventListener("mousemove", customization_preview_mousemove);
    document.addEventListener("mouseup", (function() {
        if (global_preview_rotation_dragging) {
            global_preview_rotation_dragging = false;
            engine.call("rotating_preview_model", false)
        }
    }));
    global_preview_rotate_setup = true
}

function customization_get_new_count(ctype) {
    let new_count = 0;
    const multi_sub_types = GAME.get_data("customization_multi_sub_types");
    for (let c of global_customization_data) {
        if (c.customization_type != global_customization_type_id_map[ctype.type]) continue;
        if (c.customization_sub_type != ctype.sub_type && !(c.customization_sub_type.length === 0 && multi_sub_types && multi_sub_types.includes(ctype.type_id))) continue;
        if (c.seen === false) new_count++
    }
    return new_count
}

function customization_get_new_count_category(category) {
    let new_count = 0;
    for (let c of global_customization_data) {
        if (!global_customization_type_map.hasOwnProperty(c.customization_type)) continue;
        if (category && global_customization_type_map[c.customization_type].group != category) continue;
        if (c.seen === false) new_count++
    }
    return new_count
}
const global_ctype_update_handlers = [];

function add_user_customizations(customizations) {
    let type_options = {};
    for (let c of customizations) {
        if (c.customization_type in global_customization_type_map) {
            if (global_customization_type_map[c.customization_type].name == "currency") continue;
            if (global_customization_type_map[c.customization_type].name == "gameplay_item") continue
        }
        if (c.customization_id in global_customization_data_map) continue;
        if (!c.hasOwnProperty("seen")) c.seen = false;
        if (!c.hasOwnProperty("customization_set_id")) c.customization_set_id = null;
        let customization = {
            customization_id: c.customization_id,
            customization_type: c.customization_type,
            customization_sub_type: c.customization_sub_type,
            customization_set_id: c.customization_set_id,
            rarity: c.rarity,
            amount: c.amount,
            seen: c.seen
        };
        global_customization_data.push(customization);
        global_customization_data_map[customization.customization_id] = customization;
        if (!(customization.customization_type in type_options)) type_options[customization.customization_type] = {};
        type_options[customization.customization_type][customization.customization_sub_type] = true;
        const sub_types = GAME.get_data("customization_sub_types");
        const multi_sub_types = GAME.get_data("customization_multi_sub_types");
        if (!c.customization_sub_type && sub_types && c.customization_type in sub_types && sub_types[c.customization_type].length && multi_sub_types && multi_sub_types.includes(c.customization_type)) {
            for (let sub_type of sub_types[c.customization_type]) {
                type_options[c.customization_type][sub_type] = true
            }
        }
    }
    for (let type_id in type_options) {
        if (!(type_id in global_customization_type_map)) continue;
        let type_name = global_customization_type_map[type_id].name;
        for (let sub_type in type_options[type_id]) {
            for (let cb of global_ctype_update_handlers) {
                if (typeof cb === "function") cb(type_name + "_" + sub_type)
            }
            trigger_customization_seen_handlers()
        }
    }
}
let global_customization_update_handlers = [];
let global_initialized_customize_data = false;

function set_customize_data(data) {
    let changed = [];
    if (data.customizations) {
        for (let type in data.customizations) {
            if (Array.isArray(data.customizations[type])) {
                let has_changed = false;
                if (!(type in global_set_customizations)) {
                    has_changed = true
                } else {
                    let match = false;
                    for (let id of data.customizations[type]) {
                        if (!global_set_customizations[type].includes(id)) {
                            match = false;
                            break
                        }
                    }
                    if (!match) has_changed = true
                }
                if (has_changed) {
                    changed.push({
                        ctype: new CustomizationType(type, ""),
                        id: data.customizations[type]
                    })
                }
                global_set_customizations[type] = data.customizations[type]
            } else if (typeof data.customizations[type] === "object") {
                if (!(type in global_set_customizations) || typeof global_set_customizations[type] !== "object") global_set_customizations[type] = {};
                for (let sub_type in data.customizations[type]) {
                    let has_changed = false;
                    if (!(sub_type in global_set_customizations[type])) {
                        has_changed = true
                    } else if (Array.isArray(data.customizations[type][sub_type])) {
                        if (data.customizations[type][sub_type].length === global_set_customizations[type][sub_type].length) {
                            if (data.customizations[type][sub_type].length != 0) {
                                let match = true;
                                for (let id of data.customizations[type][sub_type]) {
                                    if (!global_set_customizations[type][sub_type].includes(id)) {
                                        match = false;
                                        break
                                    }
                                }
                                if (!match) has_changed = true
                            }
                        } else {
                            has_changed = true
                        }
                    } else {
                        if (!(sub_type in global_set_customizations[type]) || global_set_customizations[type][sub_type] !== data.customizations[type][sub_type]) {
                            has_changed = true
                        }
                    }
                    if (has_changed) {
                        changed.push({
                            ctype: new CustomizationType(type, sub_type),
                            id: data.customizations[type][sub_type]
                        })
                    }
                    global_set_customizations[type][sub_type] = data.customizations[type][sub_type]
                }
            } else {
                if (!(type in global_set_customizations) || global_set_customizations[type] !== data.customizations[type]) {
                    changed.push({
                        ctype: new CustomizationType(type, ""),
                        id: data.customizations[type]
                    })
                }
                global_set_customizations[type] = data.customizations[type]
            }
        }
        for (let type in global_set_customizations) {
            if (!Array.isArray(global_set_customizations[type]) && typeof global_set_customizations[type] === "object") {
                for (let sub_type in global_set_customizations[type]) {
                    if (!(type in data.customizations) || !(sub_type in data.customizations[type])) {
                        changed.push({
                            ctype: new CustomizationType(type, sub_type),
                            id: null
                        });
                        delete global_set_customizations[type][sub_type]
                    }
                }
            } else if (!(type in data.customizations)) {
                changed.push({
                    ctype: new CustomizationType(type, ""),
                    id: null
                });
                delete global_set_customizations[type]
            }
        }
    }
    if (global_initialized_customize_data) {
        for (let cb of global_customization_update_handlers) {
            if (typeof cb === "function") cb(changed)
        }
    } else {
        global_initialized_customize_data = true
    }
    trigger_customization_seen_handlers()
}

function get_customization_category_content_data(ctype) {
    function customization_sort_func(a, b) {
        if (a.rarity > b.rarity) return -1;
        else if (a.rarity < b.rarity) return 1;
        else return a.customization_id.localeCompare(b.customization_id)
    }
    const multi_sub_types = GAME.get_data("customization_multi_sub_types");
    let data = global_customization_data.filter((function(c) {
        if (c.customization_type == global_customization_type_id_map[ctype.type]) {
            if (ctype.sub_type.length) {
                if (ctype.type == "weapon_attachment" && ctype.sub_type == "melee" && c.customization_sub_type.length == 0) return false;
                if (ctype.sub_type == c.customization_sub_type || c.customization_sub_type.length === 0 && multi_sub_types && multi_sub_types.includes(ctype.type_id)) return true
            } else {
                return true
            }
        }
        return false
    }));
    let duplicate_tracker = {};
    let filtered_data = [];
    for (let c of data) {
        if (duplicate_tracker.hasOwnProperty(c.customization_id)) {
            if (c.seen == false) duplicate_tracker[c.customization_id] = c;
            continue
        }
        duplicate_tracker[c.customization_id] = c
    }
    let game_customizations = GAME.get_data("customizations", ctype.type_id);
    if (game_customizations && ctype.sub_type in game_customizations) {
        for (let c of game_customizations[ctype.sub_type]) {
            if (c.customization_id in duplicate_tracker) continue;
            c.locked = true;
            duplicate_tracker[c.customization_id] = c
        }
    }
    for (let c_id in duplicate_tracker) filtered_data.push(duplicate_tracker[c_id]);
    filtered_data.sort(customization_sort_func);
    return filtered_data
}

function get_owned_customization(customization_id) {
    for (let c of global_customization_data) {
        if (c.customization_id === customization_id) {
            return c
        }
    }
    return false
}

function get_current_customization(ctype) {
    let ret = "";
    if (global_self.data && ctype.type in global_set_customizations) {
        if (ctype.sub_type && typeof global_set_customizations[ctype.type] === "object") {
            let sub_key = ctype.sub_type;
            if (ctype.sub_type_extra.length) sub_key += "!" + ctype.sub_type_extra;
            if (sub_key in global_set_customizations[ctype.type]) ret = global_set_customizations[ctype.type][sub_key];
            else if (ctype.sub_type in global_set_customizations[ctype.type]) ret = global_set_customizations[ctype.type][ctype.sub_type]
        } else {
            if (ctype.type in global_set_customizations) ret = global_set_customizations[ctype.type]
        }
    }
    if (is_customization_empty(ret)) {
        return get_default_customization(ctype)
    }
    return ret
}

function get_default_customization(ctype) {
    let default_customization = GAME.get_data("default_customizations", ctype.type_id);
    if (default_customization) {
        if (typeof default_customization === "object") {
            if (ctype.sub_type in default_customization) {
                return default_customization[ctype.sub_type]
            }
        } else {
            return default_customization
        }
    }
    const array_types = GAME.get_data("customization_array_types");
    if (array_types && ctype.type in array_types) {
        return []
    }
    return ""
}

function is_customization_empty(customziation) {
    if (customziation) {
        if (Array.isArray(customziation) && customziation.length > 0) return false;
        else if (typeof customziation === "object" && Object.keys(customziation).length > 0) return false;
        else if (typeof customziation === "string" && customziation.trim().length > 0) return false
    }
    return true
}

function get_current_customization_attachments(weapon) {
    let string = "";
    if (_check_nested(global_self, "data", "customizations", "weapon_attachment", weapon)) string = global_set_customizations.weapon_attachment[weapon];
    return get_customization_attachments(string)
}

function get_active_weapon_attachment_list(customization_id) {
    if (!customization_id) return [];
    if (customization_id.trim().length == 0) return [];
    let active_on_weapon_sub_types = [];
    if (_check_nested(global_self, "data", "customizations", "weapon_attachment")) {
        for (let weapon in global_set_customizations.weapon_attachment) {
            let wa = global_set_customizations.weapon_attachment[weapon];
            if (wa.includes(customization_id)) active_on_weapon_sub_types.push(weapon)
        }
    }
    return active_on_weapon_sub_types
}

function get_customization_attachments(attachment_string) {
    let ret = {
        stattracker: "disabled",
        attachment: ""
    };
    let parts = attachment_string.split("!");
    for (let p of parts) {
        if (p.startsWith("stat:")) ret.stattracker = p.split(":")[1];
        else ret.attachment = p
    }
    return ret
}

function create_attachment_customization_string(data) {
    let parts = [];
    if ("stattracker" in data && data.stattracker != "disabled") parts.push("stat:" + data.stattracker);
    if ("attachment" in data && data.attachment != "") parts.push(data.attachment);
    return parts.join("!")
}

function set_all_customizations_seen() {
    api_request("POST", "/user/customization/seen_all");
    for (let c of global_customization_data) {
        if (!c.seen) c.seen = true
    }
    trigger_customization_seen_handlers()
}

function set_ctype_customizations_seen(ctype) {
    api_request("POST", "/user/customization/seen_ctype", {
        type: ctype.type_id,
        sub_type: ctype.sub_type
    });
    for (let c of global_customization_data) {
        if (c.customization_type === ctype.type_id && c.customization_sub_type === ctype.sub_type) {
            if (!c.seen) c.seen = true
        }
    }
    trigger_customization_seen_handlers()
}

function set_customization_seen(customization_id) {
    api_request("POST", "/user/customization/" + customization_id + "/seen");
    if (customization_id in global_customization_data_map) {
        global_customization_data_map[customization_id].seen = true
    }
    trigger_customization_seen_handlers()
}
const global_user_customizations_loaded = [];
const global_customization_presets_loaded = [];

function load_user_customizations(cb) {
    api_request("GET", "/user/customization", {}, (function(data) {
        if (data) global_customization_data = unflattenData(data["customization"]);
        global_customization_data_map = {};
        let type_options = {};
        for (let c of global_customization_data) {
            global_customization_data_map[c.customization_id] = c;
            if (!(c.customization_type in type_options)) type_options[c.customization_type] = {};
            type_options[c.customization_type][c.customization_sub_type] = true
        }
        for (let cb of global_user_customizations_loaded) {
            if (typeof cb === "function") cb(type_options)
        }
        if (typeof cb === "function") cb();
        trigger_customization_seen_handlers()
    }))
}

function load_customization_presets() {
    if (!global_customization_presets_loaded.length) return;
    api_request("GET", "/user/presets", {}, (function(data) {
        let presets = [];
        if (data.hasOwnProperty("presets")) presets = data.presets;
        for (let cb of global_customization_presets_loaded) {
            if (typeof cb === "function") cb(presets)
        }
    }))
}
let global_preview_rotate_setup = false;
let global_preview_rotation_position = {
    x: 0,
    y: 0
};
let global_preview_rotation_dragging = false;

function setup_customization_preview_rotation_listeners(el, bind_left_click) {
    if ("rotation_listener" in el.dataset) return;
    el.dataset.rotation_listener = "1";
    el.addEventListener("mousedown", (function(e) {
        if (e.button == 2 || e.button == 0 && bind_left_click) {
            global_preview_rotation_dragging = true;
            engine.call("rotating_preview_model", true)
        }
    }))
}

function customization_preview_mousemove(e) {
    if (global_preview_rotation_dragging) {
        if (typeof global_preview_rotation_position.x !== "undefined") {
            var dx = e.clientX - global_preview_rotation_position.x;
            var dy = global_preview_rotation_position.y - e.clientY;
            engine.call("add_decals_model_rotation", dx, dy)
        }
    }
    global_preview_rotation_position.x = e.clientX;
    global_preview_rotation_position.y = e.clientY
}
const ITEM_PREVIEW_CAMERAS = {
    eggbot_locker: 0,
    weapon_locker: 1,
    empty: 2,
    weapon_battlepass: 3,
    eggbot_battlepass: 4,
    eggbot_profile: 5,
    weapon_shop: 6,
    eggbot_shop: 7,
    weapon_notification: 8,
    eggbot_notification: 9,
    eggbot_shield_locker: 10,
    eggbot_shield_battlepass: 11,
    eggbot_shield_shop: 12,
    eggbot_shield_notification: 13
};
let global_customization_blur_active = false;

function show_customization_preview_scene(screen, ctype, id, customization, container, callback) {
    if (!ctype.type.length) return;
    let show_2d_preview = false;
    let preview_size_multiplier = 1;
    let locker_preview_scale = GAME.get_data("locker_preview_scale");
    if (locker_preview_scale && ctype.type in locker_preview_scale && ctype.sub_type in locker_preview_scale[ctype.type]) {
        preview_size_multiplier = locker_preview_scale[ctype.type][ctype.sub_type]
    }
    if (ctype.type == "weapon") {
        engine.call("on_show_customization_screen", true);
        engine.call("weapon_customization_select_weapon", ctype.sub_type);
        engine.call("set_preview_weapon_skin", ctype.sub_type, id);
        setup_customization_preview_rotation_listeners(container, true);
        if (screen != "locker") engine.call("reset_locker_agent_rotation")
    } else if (ctype.type == "suit") {
        engine.call("on_show_customization_screen", true);
        engine.call("set_preview_class_skin", ctype.sub_type, id);
        setup_customization_preview_rotation_listeners(container, true)
    } else {
        engine.call("on_show_customization_screen", true);
        setup_customization_preview_rotation_listeners(container, true);
        if (screen != "locker") engine.call("reset_locker_agent_rotation")
    }
    global_customization_blur_active = false;
    _empty(container);
    if (!customization.hasOwnProperty("customization_id")) {
        customization = {
            customization_id: "default",
            customization_type: ctype.type_id,
            customization_sub_type: "",
            customization_set_id: null,
            rarity: 0,
            amount: 1
        }
    }
    let width = .95 * window.outerHeight * preview_size_multiplier;
    let height = width;
    let coordinates = [window.outerWidth / 2, window.outerHeight / 2, width, height];
    if (screen === "locker") {
        let left_offset = .63 * window.outerHeight;
        let container_width = window.outerWidth - left_offset;
        let center_x = left_offset + container_width / 2;
        let center_y = window.outerHeight / 2;
        coordinates = [center_x, center_y, width, height]
    } else if (screen === "notification") {} else if (screen === "shop_item") {} else if (screen === "battlepass") {}
    engine.call("set_locker_container_coords", ...coordinates);
    let preview_container = _createElement("div", "preview_container");
    preview_container.style.left = coordinates[0] - coordinates[2] / 2 + "px";
    preview_container.style.top = coordinates[1] - coordinates[3] / 2 + "px";
    preview_container.style.width = coordinates[2] + "px";
    preview_container.style.height = coordinates[3] + "px";
    if (show_2d_preview) preview_container.appendChild(createCustomizationPreview(customization));
    container.appendChild(preview_container);
    if (typeof callback === "function") {
        callback(preview_container, customization)
    }
}

function customize_screen_previous_weapon(element) {
    engine.call("customize_screen_change_weapon", -1)
}

function customize_screen_next_weapon(element) {
    engine.call("customize_screen_change_weapon", 1)
}