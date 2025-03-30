let global_store_id = 0;
let global_ui_started = false;
var global_active_view = "menu";
var global_on_activate_menu = [];
var global_on_activate_hud = [];
const global_input_debouncers = {};
const global_range_slider_map = {};
var global_competitive_season = {};
var global_game_mode_map_lists = {};
let on_press_esc_handlers = [];
let on_game_modes_changed_handlers = [];
let queued_menu_screen = null;
let chat_is_open = false;
window.addEventListener("load", (function() {
    console.log("PERF #1 begin load", performance.now());
    console.log("LOAD ui.js");
    GAME.set_all_inactive();
    bind_event("game_launched", (game_id => {
        console.log("game_launched", game_id);
        document.body.style.display = "flex";
        GAME.set_active(game_id, true, true);
        close_menu(true, true)
    }));
    bind_event("game_reset", (() => {
        reset_menu();
        Servers.reset()
    }));
    bind_event("set_store_id", (store_id => {
        global_store_id = store_id
    }));
    console.log("LOAD001");
    if (!window.jsrender) {
        window.jsrender = {
            views: $.views,
            templates: $.templates
        }
    }
    window.jsrender.views.settings.delimiters("[[", "]]");
    window.jsrender.views.converters("encode_url", (function(val) {
        val = encodeURIComponent(val);
        val = val.replace("(", "%28");
        val = val.replace(")", "%29");
        return val
    }));
    window.jsrender.views.converters("number", (function(val) {
        if (typeof val == "string") {
            return Number(val)
        }
        return val
    }));

    function detectFocus() {
        engine.call("set_input_focus", true)
    }

    function detectBlur() {
        engine.call("set_input_focus", false)
    }
    window.addEventListener ? window.addEventListener("focus", detectFocus, true) : window.attachEvent("onfocusout", detectFocus);
    window.addEventListener ? window.addEventListener("blur", detectBlur, true) : window.attachEvent("onblur", detectBlur);
    console.log("LOAD002");
    document.addEventListener("mousedown", (event => {
        engine.call("reset_inactivity_timer")
    }));
    document.addEventListener("keydown", (function(e) {
        if (chat_is_open) return;
        let tag = document.activeElement.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea") {
            if (e.keyCode === 27) {
                document.activeElement.blur()
            }
            return
        }
        if (e.keyCode == 13) {
            engine.call("set_chat_enabled", true)
        } else {
            Navigation.on_screen_action_input(e.key.toLowerCase())
        }
    }));
    bind_event("chat_is_open", (bool => {
        chat_is_open = bool ? true : false
    }));
    document.addEventListener("keydown", (function(e) {
        if (e.which !== 27) return;
        console.log("on esc press");
        for (let cb of on_press_esc_handlers) {
            if (typeof cb === "function") {
                let ret = cb();
                if (ret === false) {
                    return
                }
            }
        }
        let tag = document.activeElement.tagName.toLowerCase();
        if (is_modal_open) {
            if (tag === "input" || tag === "textarea") {
                document.activeElement.blur();
                return
            }
            goUpALevel()
        } else {
            historyBack()
        }
    }));
    on_press_esc_handlers.push((() => {
        if (Object.keys(_living_select_lists_ids).length) {
            _click_outside_select_handler();
            return false
        }
    }));
    bind_event("set_api_info", (function(url, token) {
        API_URL = url;
        if (GAME.active !== null) apiHandler().updateUrl(API_URL + GAME.get_data("API_PATH"));
        if (token && token.length) apiHandler().updateToken(token)
    }));
    bind_event("set_version", (function(version) {
        let elements = document.querySelectorAll(".game_version");
        for (let i = 0; i < elements.length; i++) {
            elements[i].textContent = "v" + version
        }
    }));
    bind_event("set_extra_modes", (function(json_mode_names) {
        try {
            let mode_names = JSON.parse(json_mode_names);
            for (let mode of mode_names) {
                GAME.set_game_key_data(GAME.active, "game_mode_map", mode, {
                    mode: mode,
                    name: localize("game_mode_" + mode),
                    i18n: "game_mode_" + mode,
                    desc_i18n: "game_mode_desc_" + mode,
                    announce: "announcer_common_gamemode_" + mode,
                    enabled: true,
                    image: "brawl_loop.jpg",
                    icon: "/html/images/gamemodes/brawl.svg"
                })
            }
            for (let cb of on_game_modes_changed_handlers) {
                if (typeof cb === "function") cb()
            }
        } catch (e) {
            console.log("ERROR parsing extra modes", e.message)
        }
    }));
    bind_event("set_locations", Servers.init);
    bind_event("on_map_loaded", (function() {
        suspend_menu_videos()
    }));
    bind_event("set_weapon_definitions", (function(data) {
        try {
            var weapons = JSON.parse(data)
        } catch (e) {
            console.error("Error parsing weapon definitions", data)
        }
        if (Array.isArray(weapons)) {
            for (let w of weapons) {
                global_weapon_definitions[w.idx] = w;
                if (w.weapon_tag.length && w.selectable) {
                    global_weapon_tag_map[w.weapon_tag] = w.idx
                }
            }
        }
        console.log("Loaded weapon definitions:", Object.keys(global_weapon_definitions).length)
    }));
    bind_event("set_skill_definitions", (function(data) {
        try {
            var skills = JSON.parse(data)
        } catch (e) {
            console.error("Error parsing skill definitions", data)
        }
        if (Array.isArray(skills)) {
            for (let s of skills) {
                global_skill_definitions[s.id] = s
            }
        }
        console.log("Loaded skill definitions:", Object.keys(global_skill_definitions).length)
    }));
    console.log("LOAD010");
    console.log("LOAD013");
    bind_event("set_masterserver_connection_state", set_masterserver_connection_state);
    bind_event("process_masterserver_data", masterserver_message_handler);
    bind_event("queue_modal", ((modal, data) => {
        if (modal === "multi_map_selection_engine") {
            let map_selection = [];
            if (typeof data === "string" && data.trim().startsWith("[")) {
                try {
                    let parsed = JSON.parse(data);
                    if (Array.isArray(parsed)) map_selection = parsed
                } catch (e) {
                    console.log("Unable to parse existing map selection", data)
                }
            }
            map_selection_modal.open("multi_select", "all", map_selection, (map_list => {
                engine.call("set_map_list", JSON.stringify(map_list))
            }))
        } else if (modal === "datacenter") {
            open_modal_screen("region_select_modal_screen")
        }
    }));
    bind_event("queue_menu_screen", (screen => {
        if (global_active_view === "menu") {
            if (screen !== "basic_modal") {
                open_screen(screen)
            }
        } else {
            queued_menu_screen = screen
        }
    }));
    bind_event("menu_enabled", (function(enabled) {
        console.log("menu_enabled", enabled, global_menu_page, queued_menu_screen);
        if (enabled && global_active_view === "menu") return;
        global_active_view = enabled ? "menu" : "hud";
        _id("main_menu").style.display = enabled ? "flex" : "none";
        if (GAME.active === GAME.ids.DIABOTICAL) {
            _id("hud").style.display = enabled ? "none" : "flex"
        }
        if (enabled) {
            if (global_logged_out) {
                return
            }
            resume_menu_videos();
            _last_anim_update = performance.now();
            if (queued_menu_screen && !global_ms_connected) {
                let offline_screens = GAME.get_data("online_screens");
                if (offline_screens && offline_screens.includes(queued_menu_screen)) {
                    queued_menu_screen = null
                }
            }
            if (GAME.active === GAME.ids.INVASION) {
                if (queued_menu_screen) {
                    if (queued_menu_screen !== "basic_modal") {
                        global_history.reset(queued_menu_screen);
                        set_modal_engine_call(true, false);
                        open_screen(queued_menu_screen)
                    }
                    queued_menu_screen = null
                } else {
                    global_history.reset("main_panel");
                    open_screen("main_panel");
                    set_modal_engine_call(true, true)
                }
            } else if (GAME.active === GAME.ids.ROGUE || GAME.active === GAME.ids.GEARSTORM) {
                let params = null;
                if (queued_menu_screen === "play_rogue" || queued_menu_screen === "play_rogue_list") {
                    if (Lobby.state.id) {
                        queued_menu_screen = "custom"
                    } else if (queued_menu_screen === "play_rogue_list") {
                        queued_menu_screen = "play_rogue";
                        params = {
                            page: "custom"
                        }
                    } else if (queued_menu_screen === "play_rogue") {
                        params = {
                            page: "matchmaking"
                        }
                    }
                }
                if (queued_menu_screen) {
                    if (queued_menu_screen !== "basic_modal") {
                        global_history.reset(queued_menu_screen);
                        set_modal_engine_call(true, false);
                        open_screen(queued_menu_screen, params)
                    }
                    queued_menu_screen = null
                } else {
                    if (!IN_HUB && current_match.match_id && (current_match.team_switching || current_match.allow_map_voting)) {
                        global_history.reset("ingame_panel");
                        open_screen("ingame_panel")
                    } else {
                        if (GAME.active === GAME.ids.GEARSTORM) {
                            global_history.reset("main_panel_gearstorm");
                            open_screen("main_panel_gearstorm")
                        } else {
                            global_history.reset("main_panel_rogue");
                            open_screen("main_panel_rogue")
                        }
                    }
                    set_modal_engine_call(true, true)
                }
            }
        } else {
            suspend_menu_videos();
            if (document.activeElement) {
                document.activeElement.blur()
            }
        }
    }));
    bind_event("messagebox", (function(msg_key) {
        queue_dialog_msg({
            title: localize("title_info"),
            msg: localize(msg_key)
        })
    }));
    bind_event("cancellable_messagebox", (function(msg_key) {
        if (msg_key === "message_press_button_to_bind") {
            updateBasicModalContent(basicGenericModal("Set binding", localize(msg_key)));
            open_modal_screen("basic_modal", null, -1)
        } else {
            show_sticky_dialog(msg_key, {
                msg: localize(msg_key)
            })
        }
    }));
    bind_event("close_messagebox", (function(msg_key) {
        hide_sticky_dialog(msg_key);
        if (global_keybinding_active) {
            capture_bind_finished();
            unlock_modal("basic_modal");
            closeBasicModal()
        }
    }));
    bind_event("on_masterclient_disabled", (function(data) {
        set_logged_out_screen(true, "disabled", data)
    }));
    bind_event("on_anticheat_error", (function(code, msg) {
        set_logged_out_screen(true, "anticheat", code, msg)
    }));
    bind_event("global_event", (function(event_name, value) {
        if (event_name == "disconnected") {
            engine.call("echo_error", "SERVER_DISCONNECTED");
            if (value == 10 || value == 15 || value == 17) {} else if (value == 6 || value == 13) {
                set_logged_out_screen(true, "disabled")
            } else {
                let message = localize("disconnected_error_" + value);
                if (value === 14 && IN_HUB) {
                    message = localize("disconnected_error_14_hub")
                }
                queue_dialog_msg({
                    title: localize("title_error"),
                    msg: message
                })
            }
        }
    }));
    initEngineVarElementHandlers();
    console.log("LOAD018");
    _for_each_in_class("color-picker-new", (function(el) {
        var current_variable = el.dataset.variable;
        if (current_variable && current_variable.length) {
            engine.call("initialize_color_value", current_variable)
        }
    }));
    bind_event("set_restart_required", (function(restart_required) {
        if (restart_required) {
            _for_each_in_class("settings_message_container", (el => {
                el.style.display = "flex"
            }))
        } else {
            _for_each_in_class("settings_message_container", (el => {
                el.style.display = "none"
            }))
        }
    }));
    bind_event("reveal_ui", (function() {
        console.log("PERF #6 reveal ui", performance.now());
        console.log("reveal_ui")
    }));
    bind_event("update_user_info", load_user_info);
    bind_event("steam_transaction_finished", (function(json) {
        try {
            let data = JSON.parse(json);
            const content = update_after_purchase(data);
            if (content) {
                openBasicModal(basicGenericModal(localize("shop_purchase_success"), content, localize("modal_close")))
            }
        } catch (e) {
            console.error("Error parsing steam transaction data", e.message)
        }
    }));
    bind_event("start_redeem", (function(payload) {
        api_token_update_handlers.push({
            type: "once",
            func: function() {
                const data = JSON.parse(payload);
                const toBeRedemeed = data.entitlements.filter((ent => !ent.isRedeemed)).map((ent => ent.id));
                if (toBeRedemeed && toBeRedemeed.length) {
                    api_request("POST", "/redeem", {
                        entitlements: toBeRedemeed,
                        epic_id: data.epic_id,
                        epic_token: data.epic_token
                    }, (function(data) {
                        if (data.coins || data.items) {
                            const content = update_after_purchase(data);
                            if (content) {
                                openBasicModal(basicGenericModal(localize("shop_purchase_success"), content, localize("modal_close")))
                            }
                            global_shop_is_rendered = false;
                            global_coin_shop_is_rendered = false;
                            if (global_menu_page == "shop") {
                                load_shop()
                            } else if (global_menu_page == "coin_shop") {
                                load_coin_shop()
                            } else if (global_menu_page == "shop_item") {
                                if (global_active_shop_item_group !== null && global_active_shop_item_group_index !== null) {
                                    render_shop_item(global_active_shop_item_group, global_active_shop_item_group_index)
                                } else {
                                    open_screen("shop")
                                }
                            }
                        } else {
                            console.error("Invalid data: " + JSON.stringify(data))
                        }
                    }))
                }
            }
        })
    }));
    bind_event("get_crosshair_draw_list", (function(crosshair_string, hit_mode, draw_id) {
        get_crosshair_draw_list(crosshair_string, hit_mode, draw_id)
    }));
    console.log("LOAD200");
    bind_event("on_post_load", (function() {
        console.log("POSTLOAD000");
        console.log("PERF #4 on_post_load", performance.now());
        initialize_checkboxes();
        _for_each_with_class_in_parent(_id("main_menu"), "range-slider", (function(el) {
            let variable = el.dataset.variable ? el.dataset.variable : null;
            if (variable != null) {
                global_range_slider_map[variable] = new rangeSlider(el, true)
            }
        }));
        _for_each_with_class_in_parent(_id("main_menu"), "range-slider", (function(el) {
            var variable = el.dataset.variable;
            if (variable) {
                initialize_variable("range", variable, false)
            }
        }));
        var inc_X_by = 0,
            inc_Y_by = 0,
            total_X = 0,
            total_Y = 0,
            X_prev = 0,
            Y_prev = 0;
        _for_each_with_class_in_parent(_id("crosshair_previews_containers"), "crosshair_previews_container", (function(container) {
            container.addEventListener("mousedown", (function(e) {
                let offset_left = container.getBoundingClientRect().left;
                mouse_X = e.clientX - offset_left;
                container.dataset.scrolling = true;
                X_prev = mouse_X
            }));
            container.addEventListener("mouseup", (function(e) {
                container.dataset.scrolling = false
            }));
            container.addEventListener("mouseleave", (function(e) {
                container.dataset.scrolling = false
            }));
            container.addEventListener("mousemove", (function(e) {
                if (container.dataset.scrolling == "true") {
                    let offset_left = container.getBoundingClientRect().left;
                    mouse_X = e.clientX - offset_left;
                    inc_X_by = mouse_X - X_prev;
                    let string = container.style.backgroundPosition;
                    if (string != undefined && string != "auto auto") {
                        pos = Number(string.split("px 50")[0])
                    } else {
                        pos = 0
                    }
                    container.style.backgroundPosition = pos + inc_X_by + "px 50%";
                    X_prev = mouse_X;
                    total_X = total_X + inc_X_by
                }
            }))
        }));
        console.log("POSTLOAD002");
        RemoteResources.init_remote_resources();
        GAME.add_activate_callback((game_id => {
            if (!(game_id in global_crosshair_creators)) {
                initialize_saved_crosshair_engine_variables();
                cleanSavedCrosshairArray();
                global_crosshair_creators[game_id] = {}
            }
            currentCrosshairCreatorWeaponIndex = -1;
            currentCrosshairCreatorZoomWeaponIndex = -1;
            engine.call("initialize_custom_component_value", "hud_crosshair_definition:0");
            engine.call("initialize_custom_component_value", "hud_zoom_crosshair_definition:0");
            engine.call("get_map_choices")
        }));
        set_logged_out_screen(false);
        console.log("PERF #5 on_post_load finished", performance.now());
        engine.call("post_load_finished");
        console.log("POSLOAD100")
    }));
    window.requestAnimationFrame(anim_update);
    window.requestAnimationFrame(anim_misc);
    _for_each_in_tag("input", (function(el) {
        el.addEventListener("dblclick", (function() {
            this.setSelectionRange(0, this.value.length)
        }))
    }));
    console.log("LOAD201");
    console.log("LOAD202");
    initialize_variable("custom", "lobby_regions_known");
    console.log("LOAD205");
    initialize_dropdown_select(_id("main_menu"));
    _for_each_with_class_in_parent(_id("main_menu"), "settings_modal_dialog", (function(el) {
        initialize_dropdown_select(el)
    }));
    _for_each_with_class_in_parent(_id("main_menu"), "generic_modal_dialog", (function(el) {
        initialize_dropdown_select(el)
    }));
    console.log("LOAD205-2");
    initialize_select_fields();
    console.log("LOAD206");
    console.log("LOAD207");
    initialize_tooltip_hovers();
    initialize_tooltip_type2();
    initialize_tooltip2_cleanup_listener();
    initialize_scrollbars();
    console.log("LOAD208");
    init_customizations();
    init_notifications();
    Friends.init();
    Lobby.init();
    PartySession.init();
    Navigation.init();
    init_i18n();
    init_shared();
    for (let component_name in global_components) {
        if (typeof global_components[component_name].init === "function") {
            console.log("init component:", component_name);
            global_components[component_name].init()
        }
    }
    for (let screen_name in global_screens) {
        if (typeof global_screens[screen_name].init === "function") {
            console.log("init:", screen_name);
            global_screens[screen_name].init()
        }
    }
    init_matchmaking();
    console.log("LOAD209");
    setupMenuSoundListeners();
    setupVariousListeners();
    console.log("LOAD210");
    set_input_method("kbm");
    console.log("LOAD211");
    init_ingame();
    console.log("LOAD212");
    console.log("PERF #2 end load", performance.now());
    engine.call("menu_view_loaded");
    global_ui_started = true
}));
const api_token_update_handlers = [];
api_token_update_handlers.push({
    type: "always",
    func: function(token) {
        apiHandler().updateToken(token);
        request_user_info = true;
        load_user_info()
    }
});

function add_on_get_api_token_handler(recurring, cb) {
    if (typeof cb !== "function") return;
    let current_token = apiHandler().getToken();
    if (current_token) {
        cb(current_token);
        if (!recurring) return
    }
    api_token_update_handlers.push({
        type: recurring ? "always" : "once",
        func: cb
    })
}

function on_get_api_token(token) {
    api_token_update_handlers.reverse();
    for (let i = api_token_update_handlers.length - 1; i >= 0; i--) {
        if (!api_token_update_handlers[i].hasOwnProperty("type") || !api_token_update_handlers[i].hasOwnProperty("func")) {
            api_token_update_handlers.splice(i, 1);
            continue
        }
        if (api_token_update_handlers[i].type === "always") {
            api_token_update_handlers[i].func(token)
        } else if (api_token_update_handlers[i].type === "once") {
            api_token_update_handlers[i].func(token);
            api_token_update_handlers.splice(i, 1)
        }
    }
    api_token_update_handlers.reverse()
}

function suspend_menu_videos() {
    var allVideos = document.querySelectorAll("video");
    for (var i = 0; i < allVideos.length; i++) {
        if (!allVideos[i].paused) {
            allVideos[i].suspended = true
        }
        allVideos[i].pause()
    }
}

function resume_menu_videos() {
    var allVideos = document.querySelectorAll("video");
    for (var i = 0; i < allVideos.length; i++) {
        if (allVideos[i].hasOwnProperty("suspended") && allVideos[i].suspended) {
            if (global_active_view === "menu") allVideos[i].play();
            delete allVideos[i].suspended
        }
    }
}

function handle_match_reconnect(data) {
    return;
    const mode_data = GAME.get_data("game_mode_map", data.match_mode);
    let dialog_object = {
        duration: 12e4,
        title: localize("title_reconnect"),
        msg: localize_ext("message_reconnect", {
            type: localize(MATCH_TYPE[data.match_type].i18n),
            mode: mode_data ? localize(mode_data.i18n) : ""
        }),
        options: [{
            label: localize("menu_button_join"),
            callback: function() {
                send_string(CLIENT_COMMAND_RECONNECT)
            }
        }]
    };
    if (data.penalty == true) {
        dialog_object.msg = localize_ext("message_reconnect_abandon", {
            type: localize(MATCH_TYPE[data.match_type].i18n),
            mode: mode_data ? localize(mode_data.i18n) : ""
        });
        dialog_object.options.push({
            label: localize("menu_button_abandon"),
            callback: function() {
                send_string(CLIENT_COMMAND_ABANDON)
            },
            style: "negative"
        })
    } else {
        dialog_object.options.push({
            label: localize("menu_button_dismiss"),
            callback: function() {
                send_string(CLIENT_COMMAND_DISMISS_RECONNECT)
            }
        })
    }
    queue_dialog_msg(dialog_object)
}
let custom_timeout_handlers = [];

function customTimeout(handler, timeout) {
    let obj = {
        handler: handler,
        timeout: timeout,
        timestamp: performance.now()
    };
    custom_timeout_handlers.push(obj);
    return obj
}

function removeCustomTimeout(obj) {
    for (let i = 0; i < custom_timeout_handlers.length; i++) {
        if (custom_timeout_handlers[i] === obj) {
            custom_timeout_handlers.splice(i, 1);
            break
        }
    }
}
let anim_misc_second_handlers = [];
_last_anim_misc = Math.floor(performance.now() / 1e3);
_last_anim_misc_30s = Math.floor(performance.now() / 1e3);

function anim_misc(timestamp) {
    let ts_seconds = Math.floor(timestamp / 1e3);
    if (_last_anim_misc != ts_seconds) {
        for (let handler of anim_misc_second_handlers) {
            if (typeof handler === "function") handler(timestamp)
        }
    }
    _last_anim_misc = ts_seconds;
    if (custom_timeout_handlers.length) {
        for (let i = custom_timeout_handlers.length - 1; i >= 0; i--) {
            if (timestamp - custom_timeout_handlers[i].timestamp >= custom_timeout_handlers[i].timeout) {
                if (typeof custom_timeout_handlers[i].handler === "function") custom_timeout_handlers[i].handler();
                custom_timeout_handlers.splice(i, 1)
            }
        }
    }
    window.requestAnimationFrame(anim_misc)
}

function colorPickerValueUpdated(element, jscolor) {
    var color = String(jscolor);
    engine.call("set_string_variable", element.dataset.variable, color)
}

function setupVariousListeners() {
    let number_inputs = document.querySelectorAll("input.number");
    for (let i = 0; i < number_inputs.length; i++) {
        _numberInput(number_inputs[i])
    }(function() {
        var anchorCaretPosition = null;
        var selecting = false;
        document.addEventListener("mousedown", (event => {
            document.getSelection().empty();
            if (!event.target) return;
            let user_select = getComputedStyle(event.target).getPropertyValue("user-select");
            if (user_select !== "text") return;
            selecting = true;
            if (event.button == 0 && !event.target.select && !anchorCaretPosition) {
                anchorCaretPosition = document.caretPositionFromPoint(event.x, event.y)
            }
        }));
        document.addEventListener("mousemove", (event => {
            if (!selecting) return;
            try {
                if ((event.buttons & 1) === 1 && !event.target.select && anchorCaretPosition) {
                    var focusCaretPosition = document.caretPositionFromPoint(event.x, event.y);
                    document.getSelection().setBaseAndExtent(anchorCaretPosition.offsetNode, anchorCaretPosition.offset, focusCaretPosition.offsetNode, focusCaretPosition.offset)
                }
            } catch (err) {
                console.log("Error", err)
            }
        }));
        document.addEventListener("mouseup", (event => {
            anchorCaretPosition = null;
            selecting = false
        }))
    })()
}

function settingsTwitchAccount(isLinked) {
    let link_path = "";
    let unlink_path = "";
    if (global_store_id === CLIENT_SOURCE_NAME.EGS) {
        link_path = "/twitch/link";
        unlink_path = "/twitch/unlink"
    } else if (global_store_id === CLIENT_SOURCE_NAME.STEAM) {
        link_path = "/twitch/steam/link";
        unlink_path = "/twitch/steam/unlink"
    }
    if (isLinked) {
        engine.call("open_browser", "https://www.diabotical.com" + unlink_path)
    } else {
        engine.call("open_browser", "https://www.diabotical.com" + link_path)
    }
    request_user_info = true
}

function preload_image(url) {
    return new Promise((function(resolve, reject) {
        var img = new Image;
        img.src = url;
        img.onload = function() {
            resolve()
        };
        img.onerror = function() {
            resolve()
        }
    }))
}

function replay_css_anim(element) {
    element.getAnimations().map((function(anim) {
        anim.currentTime = 0;
        anim.play()
    }))
}

function update_styles(el, styles) {
    Object.keys(styles).forEach((style => {
        el.style[style] = styles[style]
    }))
}

function getCompSeasonModes(comp_season_id, cb) {
    return;
    const comp_data = GAME.get_data("competitive_data");
    if (!comp_data) {
        cb([]);
        return
    }
    let comp_key = null;
    for (let key in comp_data) {
        if (comp_data[key].id == comp_season_id) {
            comp_key = key;
            break
        }
    }
    if (comp_key === null) {
        cb([]);
        return
    }
    if (comp_data[comp_key].hasOwnProperty("modes")) {
        cb(comp_data[comp_key].modes);
        return
    }
    api_request("GET", "stats/seasonmodes", {
        comp_season_id: comp_season_id
    }, (function(modes) {
        for (let m of modes) {
            m.name = getModeName(m.mode_key, m.mode_name, m.instagib);
            m.vs = getVSType(m.team_count, m.team_size)
        }
        comp_data[comp_key].modes = modes;
        cb(modes)
    }))
}

function set_global_map_list_from_api(mode, maps) {
    global_game_mode_map_lists[mode] = [];
    if (!maps) return;
    for (let map of maps) {
        global_game_mode_map_lists[mode].push({
            name: _format_map_name(map[0], map[1]),
            map: map[0],
            community_map: Number(map[2])
        })
    }
}